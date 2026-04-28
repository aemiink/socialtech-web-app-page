import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AccountType, PrismaClient, UserRole, UserStatus } from "@prisma/client";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const AUTH_ME_PATH = "/api/v1/auth/me";
const USERS_ME_PASSWORD_PATH = "/api/v1/users/me/password";
const ADMIN_USERS_PATH = "/api/v1/admin/users";

const TEST_EMAIL_PREFIX = "authz-session-invalidation-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";

const EMPLOYEE_INITIAL_PASSWORD = "Start12345";
const EMPLOYEE_INITIAL_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVebjnuVnmSbsvVKjl9P8pSMSPifb04FZ6";
const EMPLOYEE_CHANGED_PASSWORD = "Changed12345";
const EMPLOYEE_RESET_PASSWORD = "Reset12345";

type LoginBody = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    accountType: AccountType;
    role: UserRole;
    status: UserStatus;
  };
};

describe("Access Token Invalidation Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeId = "";
  let employeeAccessToken = "";
  let employeePassword = EMPLOYEE_INITIAL_PASSWORD;

  const employeeEmail = `${TEST_EMAIL_PREFIX}${randomUUID()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);

    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter(configService));
    app.enableCors(createCorsOptions(configService));
    app.use(cookieParser());
    await app.init();

    prisma = new PrismaClient();
    await prisma.$connect();

    await cleanupRuntimeUsers();
    await setDeterministicDemoPasswords();

    const adminLogin = await login("admin@socialtech.com", DEMO_PASSWORD);
    adminToken = adminLogin.accessToken;

    const employee = await prisma.user.create({
      data: {
        email: employeeEmail,
        displayName: "Session Invalidation Employee",
        passwordHash: EMPLOYEE_INITIAL_PASSWORD_HASH,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        clientProfileId: null,
      },
      select: { id: true },
    });
    employeeId = employee.id;

    const employeeLogin = await login(employeeEmail, employeePassword);
    employeeAccessToken = employeeLogin.accessToken;
  });

  afterAll(async () => {
    await cleanupRuntimeUsers();
    await prisma.$disconnect();
    await app.close();
  });

  it("unauthenticated protected request returns 401", async () => {
    await request(app.getHttpServer()).get(AUTH_ME_PATH).expect(401);
  });

  it("initial access token works before invalidation", async () => {
    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);
  });

  it("password change invalidates old access token and new login works", async () => {
    await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .send({
        currentPassword: EMPLOYEE_INITIAL_PASSWORD,
        newPassword: EMPLOYEE_CHANGED_PASSWORD,
      })
      .expect(200);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: employeeEmail,
        password: EMPLOYEE_INITIAL_PASSWORD,
      })
      .expect(401);

    employeePassword = EMPLOYEE_CHANGED_PASSWORD;
    const loginBody = await login(employeeEmail, employeePassword);
    employeeAccessToken = loginBody.accessToken;

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);
  });

  it("admin reset-password invalidates old access token and requires new password", async () => {
    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${employeeId}/reset-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ newPassword: EMPLOYEE_RESET_PASSWORD })
      .expect(200);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: employeeEmail,
        password: EMPLOYEE_CHANGED_PASSWORD,
      })
      .expect(401);

    employeePassword = EMPLOYEE_RESET_PASSWORD;
    const loginBody = await login(employeeEmail, employeePassword);
    employeeAccessToken = loginBody.accessToken;

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);
  });

  it("admin deactivate invalidates old token, blocks login, activate requires fresh login", async () => {
    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${employeeId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: employeeEmail,
        password: employeePassword,
      })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${employeeId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(401);

    const loginBody = await login(employeeEmail, employeePassword);
    employeeAccessToken = loginBody.accessToken;

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);
  });

  it("role update invalidates old access token", async () => {
    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${employeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        role: UserRole.SUPPORT_SPECIALIST,
      })
      .expect(200);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(401);

    const loginBody = await login(employeeEmail, employeePassword);
    employeeAccessToken = loginBody.accessToken;
    expect(loginBody.user.role).toBe(UserRole.SUPPORT_SPECIALIST);

    await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);
  });

  it("displayName-only update does not invalidate active access token", async () => {
    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${employeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        displayName: "DisplayName Changed Without Session Invalidate",
      })
      .expect(200);

    const meResponse = await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${employeeAccessToken}`)
      .expect(200);

    const meBody = meResponse.body as LoginBody["user"] & { displayName?: string };
    expect(meBody.email).toBe(employeeEmail);
    expect(meBody.role).toBe(UserRole.SUPPORT_SPECIALIST);
  });

  async function login(email: string, password: string): Promise<LoginBody> {
    const response = await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({ email, password });

    expect([200, 201]).toContain(response.status);

    return response.body as LoginBody;
  }

  async function setDeterministicDemoPasswords(): Promise<void> {
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: {
        passwordHash: DEMO_PASSWORD_HASH,
        status: UserStatus.ACTIVE,
        sessionInvalidatedAt: null,
      },
    });
  }

  async function cleanupRuntimeUsers(): Promise<void> {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    });
    employeeId = "";
    employeeAccessToken = "";
    employeePassword = EMPLOYEE_INITIAL_PASSWORD;
  }
});
