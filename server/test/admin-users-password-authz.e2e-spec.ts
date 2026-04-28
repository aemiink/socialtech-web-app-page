import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AccountType, PrismaClient, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const ADMIN_USERS_PATH = "/api/v1/admin/users";
const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const AUTH_ME_PATH = "/api/v1/auth/me";
const AUTH_REFRESH_PATH = "/api/v1/auth/refresh";
const USERS_ME_PASSWORD_PATH = "/api/v1/users/me/password";
const TEST_EMAIL_PREFIX = "authz-admin-user-";
const CREATED_EMPLOYEE_INITIAL_PASSWORD = "Start12345";
const CREATED_EMPLOYEE_CHANGED_PASSWORD = "Changed12345";

type LoginBody = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    accountType: AccountType;
    role: UserRole;
  };
};

type PublicUserBody = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  passwordHash?: unknown;
  tokenHash?: unknown;
  refreshTokens?: unknown;
};

type CookieResponse = {
  headers: {
    "set-cookie"?: string | string[];
  };
};

describe("Admin User Creation and Own Password Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";
  let createdEmployeeId = "";
  let createdEmployeeToken = "";
  let createdEmployeeRefreshCookie = "";

  const createdEmployeeEmail = `${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`;
  const createdEmployeeDisplayName = "Authz Created Employee";

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

    await cleanupCreatedEmployeeArtifacts();
    await setDeterministicDemoPasswords();

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    employeeToken = await loginWithDemoUser("performance@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");
  });

  afterAll(async () => {
    await cleanupCreatedEmployeeArtifacts();
    await prisma.$disconnect();
    await app.close();
  });

  it("admin can create an employee user", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(createEmployeePayload())
      .expect(201);

    const user = response.body as PublicUserBody;
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: createdEmployeeEmail,
        displayName: createdEmployeeDisplayName,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
      }),
    );
    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("tokenHash");
    expect(user).not.toHaveProperty("refreshTokens");
    createdEmployeeId = user.id;
  });

  it("created employee can login", async () => {
    const loginResult = await loginCreatedEmployee(CREATED_EMPLOYEE_INITIAL_PASSWORD);

    expect(loginResult.body.user).toEqual(
      expect.objectContaining({
        id: createdEmployeeId,
        email: createdEmployeeEmail,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
      }),
    );
    createdEmployeeToken = loginResult.body.accessToken;
    createdEmployeeRefreshCookie = loginResult.refreshCookie;
  });

  it("created employee can read own auth profile", async () => {
    await ensureCreatedEmployeeLoggedIn();

    const response = await request(app.getHttpServer())
      .get(AUTH_ME_PATH)
      .set("Authorization", `Bearer ${createdEmployeeToken}`)
      .expect(200);

    const profile = response.body as LoginBody["user"];
    expect(profile).toEqual(
      expect.objectContaining({
        id: createdEmployeeId,
        email: createdEmployeeEmail,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
      }),
    );
  });

  it("employee and client cannot create employee users", async () => {
    const employeeResponse = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`))
      .expect(403);
    expectApiError(employeeResponse.body);

    const clientResponse = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .send(createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`))
      .expect(403);
    expectApiError(clientResponse.body);
  });

  it("unauthenticated create request returns 401", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .send(createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`))
      .expect(401);

    expectApiError(response.body);
  });

  it("duplicate email create returns 409", async () => {
    await ensureCreatedEmployeeExists();

    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(createEmployeePayload())
      .expect(409);

    expectApiError(response.body);
  });

  it("invalid employee role returns 400", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`),
        role: UserRole.CLIENT_OWNER,
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("ADMIN account create attempt is rejected", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`),
        accountType: AccountType.ADMIN,
        role: UserRole.ADMIN,
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("CLIENT account create attempt is rejected", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`),
        accountType: AccountType.CLIENT,
        role: UserRole.CLIENT_OWNER,
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("invalid email is rejected for employee create", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`),
        email: "not-an-email",
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("weak password is rejected for employee create", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...createEmployeePayload(`${TEST_EMAIL_PREFIX}${randomUUID()}@example.test`),
        password: "weakpass",
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("unauthenticated own password change request returns 401", async () => {
    const response = await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .send({
        currentPassword: CREATED_EMPLOYEE_INITIAL_PASSWORD,
        newPassword: CREATED_EMPLOYEE_CHANGED_PASSWORD,
      })
      .expect(401);

    expectApiError(response.body);
  });

  it("wrong current password is rejected for own password change", async () => {
    await ensureCreatedEmployeeLoggedIn();

    const response = await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .set("Authorization", `Bearer ${createdEmployeeToken}`)
      .send({
        currentPassword: "Wrong12345",
        newPassword: CREATED_EMPLOYEE_CHANGED_PASSWORD,
      })
      .expect(401);

    expectApiError(response.body);
  });

  it("same newPassword is rejected for own password change", async () => {
    await ensureCreatedEmployeeLoggedIn();

    const response = await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .set("Authorization", `Bearer ${createdEmployeeToken}`)
      .send({
        currentPassword: CREATED_EMPLOYEE_INITIAL_PASSWORD,
        newPassword: CREATED_EMPLOYEE_INITIAL_PASSWORD,
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("weak newPassword is rejected for own password change", async () => {
    await ensureCreatedEmployeeLoggedIn();

    const response = await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .set("Authorization", `Bearer ${createdEmployeeToken}`)
      .send({
        currentPassword: CREATED_EMPLOYEE_INITIAL_PASSWORD,
        newPassword: "weakpass",
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("created employee can change own password", async () => {
    await ensureCreatedEmployeeLoggedIn();

    const response = await request(app.getHttpServer())
      .patch(USERS_ME_PASSWORD_PATH)
      .set("Authorization", `Bearer ${createdEmployeeToken}`)
      .send({
        currentPassword: CREATED_EMPLOYEE_INITIAL_PASSWORD,
        newPassword: CREATED_EMPLOYEE_CHANGED_PASSWORD,
      })
      .expect(200);

    expect(response.body).toEqual({ success: true });
  });

  it("old password login fails after password change", async () => {
    await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: createdEmployeeEmail,
        password: CREATED_EMPLOYEE_INITIAL_PASSWORD,
      })
      .expect(401);
  });

  it("refresh token issued before password change is rejected", async () => {
    if (!createdEmployeeRefreshCookie) {
      throw new Error("Expected pre-change refresh cookie from created employee login.");
    }

    const response = await request(app.getHttpServer())
      .post(AUTH_REFRESH_PATH)
      .set("Cookie", createdEmployeeRefreshCookie)
      .send({})
      .expect(401);

    expectApiError(response.body);
  });

  it("new password login succeeds after password change", async () => {
    const loginResult = await loginCreatedEmployee(CREATED_EMPLOYEE_CHANGED_PASSWORD);

    expect(loginResult.body.user).toEqual(
      expect.objectContaining({
        id: createdEmployeeId,
        email: createdEmployeeEmail,
      }),
    );
  });

  async function setDeterministicDemoPasswords(): Promise<void> {
    const deterministicPasswordHash = await bcrypt.hash("demo123", 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });
  }

  async function loginWithDemoUser(email: string): Promise<string> {
    const response = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email,
      password: "demo123",
    });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    if (!body.accessToken || typeof body.accessToken !== "string") {
      throw new Error(`Missing access token in login response for ${email}`);
    }

    return body.accessToken;
  }

  async function loginCreatedEmployee(
    password: string,
  ): Promise<{ body: LoginBody; refreshCookie: string }> {
    await ensureCreatedEmployeeExists();

    const response = await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: createdEmployeeEmail,
        password,
      });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    if (!body.accessToken || typeof body.accessToken !== "string") {
      throw new Error("Missing access token in created employee login response.");
    }

    return {
      body,
      refreshCookie: extractRefreshCookieHeader(response),
    };
  }

  async function ensureCreatedEmployeeLoggedIn(): Promise<void> {
    if (createdEmployeeToken && createdEmployeeRefreshCookie) {
      return;
    }

    const loginResult = await loginCreatedEmployee(CREATED_EMPLOYEE_INITIAL_PASSWORD);
    createdEmployeeToken = loginResult.body.accessToken;
    createdEmployeeRefreshCookie = loginResult.refreshCookie;
  }

  async function ensureCreatedEmployeeExists(): Promise<void> {
    if (createdEmployeeId) {
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: createdEmployeeEmail },
      select: { id: true },
    });
    if (existingUser) {
      createdEmployeeId = existingUser.id;
      return;
    }

    const response = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(createEmployeePayload())
      .expect(201);

    const user = response.body as PublicUserBody;
    createdEmployeeId = user.id;
  }

  async function cleanupCreatedEmployeeArtifacts(): Promise<void> {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    });
    createdEmployeeId = "";
    createdEmployeeToken = "";
    createdEmployeeRefreshCookie = "";
  }

  function createEmployeePayload(email = createdEmployeeEmail) {
    return {
      email,
      displayName: createdEmployeeDisplayName,
      password: CREATED_EMPLOYEE_INITIAL_PASSWORD,
      accountType: AccountType.EMPLOYEE,
      role: UserRole.DEVELOPER,
    };
  }

  function extractRefreshCookieHeader(response: CookieResponse): string {
    const rawHeader = response.headers["set-cookie"];
    const setCookies = Array.isArray(rawHeader)
      ? rawHeader
      : typeof rawHeader === "string"
        ? [rawHeader]
        : [];
    const cookiePairs = setCookies
      .map((cookie) => cookie.split(";")[0])
      .filter((cookie) => cookie.length > 0);

    if (cookiePairs.length === 0) {
      throw new Error("Expected refresh token cookie in auth response.");
    }

    return cookiePairs.join("; ");
  }

  function expectApiError(body: unknown): void {
    expect(isRecord(body)).toBe(true);
    if (!isRecord(body)) {
      return;
    }

    expect(body.success).toBe(false);
    expect(isRecord(body.error)).toBe(true);
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
});
