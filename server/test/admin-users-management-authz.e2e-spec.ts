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

const ADMIN_USERS_PATH = "/api/v1/admin/users";
const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const AUTH_REFRESH_PATH = "/api/v1/auth/refresh";
const TEST_EMAIL_PREFIX = "authz-admin-mgmt-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const MANAGED_EMPLOYEE_INITIAL_PASSWORD = "Start12345";
const MANAGED_EMPLOYEE_INITIAL_PASSWORD_HASH =
  "$2b$10$3yBQjNKNtpc7eG3y8onlVebjnuVnmSbsvVKjl9P8pSMSPifb04FZ6";
const MANAGED_EMPLOYEE_RESET_PASSWORD = "Reset12345";

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

type AdminUserBody = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  createdAt: string;
  passwordHash?: unknown;
  tokenHash?: unknown;
  refreshToken?: unknown;
  refreshTokens?: unknown;
  accessToken?: unknown;
};

type AdminUsersListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AdminUsersListBody = {
  data: AdminUserBody[];
  meta: AdminUsersListMeta;
};

type CookieResponse = {
  headers: {
    "set-cookie"?: string | string[];
  };
};

describe("Admin Users Management Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";
  let adminUserId = "";
  let managedEmployeeId = "";
  let managedEmployeeRefreshCookie = "";

  const managedEmployeeEmail = `${TEST_EMAIL_PREFIX}${randomUUID()}@example.com`;
  const managedEmployeeDisplayName = "Authz Managed Employee";
  const updatedEmployeeDisplayName = "Authz Managed Employee Updated";

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

    const adminLogin = await loginWithDemoUser("admin@socialtech.com");
    adminToken = adminLogin.accessToken;
    adminUserId = adminLogin.user.id;
    employeeToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    clientToken = (await loginWithDemoUser("client@socialtech.com")).accessToken;

    await createManagedEmployeeFixture();
    managedEmployeeRefreshCookie = (
      await loginManagedEmployee(MANAGED_EMPLOYEE_INITIAL_PASSWORD)
    ).refreshCookie;
  });

  afterAll(async () => {
    await cleanupRuntimeUsers();
    await prisma.$disconnect();
    await app.close();
  });

  it("admin default pagination response has data/meta without sensitive fields", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data.length).toBeGreaterThan(0);
    expectSanePaginationMeta(list.meta);
    expect(list.meta.page).toBe(1);
    expect(list.meta.total).toBeGreaterThanOrEqual(list.data.length);
    for (const user of list.data) {
      expectNoSensitiveUserFields(user);
    }
  });

  it("admin users list supports page and limit", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ page: 1, limit: 2 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data).toHaveLength(2);
    expect(list.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 2,
        hasPreviousPage: false,
      }),
    );
    expect(list.meta.total).toBeGreaterThanOrEqual(2);
    expectSanePaginationMeta(list.meta);
  });

  it("admin users list pagination meta is sane on later pages", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ page: 2, limit: 2 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.meta).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 2,
        hasPreviousPage: true,
      }),
    );
    expect(list.meta.totalPages).toBe(Math.ceil(list.meta.total / list.meta.limit));
    expect(list.meta.hasNextPage).toBe(list.meta.page < list.meta.totalPages);
    expect(list.meta.hasPreviousPage).toBe(list.meta.page > 1);
  });

  it("admin users list supports email sorting asc", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ page: 1, limit: 100, sortBy: "email", sortOrder: "asc" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data.length).toBeGreaterThan(1);
    expectEmailsSortedAscending(list.data);
  });

  it("admin users list defaults to createdAt desc sorting", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data.length).toBeGreaterThan(1);
    expectCreatedAtSortedDescending(list.data);
  });

  it("invalid admin users sortBy returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ sortBy: "passwordHash" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("invalid admin users sortOrder returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ sortOrder: "sideways" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("admin users page=0 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ page: 0 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("admin users page=10001 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ page: 10001 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("admin users limit=0 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ limit: 0 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("admin users limit=101 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ limit: 101 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("admin users search filter still works", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({ search: managedEmployeeEmail, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.meta.total).toBe(1);
    expect(list.data[0]).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
      }),
    );
    expectNoSensitiveUserFields(list.data[0]);
  });

  it("admin users accountType, role, and isActive filters still work", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .query({
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
        isActive: true,
        limit: 100,
      })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAdminUsersListResponse(response.body);
    expect(list.data.length).toBeGreaterThan(0);
    expect(list.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: managedEmployeeId,
          email: managedEmployeeEmail,
          accountType: AccountType.EMPLOYEE,
          role: UserRole.DEVELOPER,
          status: UserStatus.ACTIVE,
          isActive: true,
        }),
      ]),
    );
    for (const user of list.data) {
      expect(user).toEqual(
        expect.objectContaining({
          accountType: AccountType.EMPLOYEE,
          role: UserRole.DEVELOPER,
          status: UserStatus.ACTIVE,
          isActive: true,
        }),
      );
      expectNoSensitiveUserFields(user);
    }
  });

  it("employee users list returns 403", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("client users list returns 403", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("unauthenticated users list returns 401", async () => {
    const response = await request(app.getHttpServer()).get(ADMIN_USERS_PATH).expect(401);

    expectApiError(response.body);
  });

  it("admin user detail returns 200 without sensitive fields", async () => {
    const response = await request(app.getHttpServer())
      .get(`${ADMIN_USERS_PATH}/${managedEmployeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body as AdminUserBody;
    expect(user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        displayName: managedEmployeeDisplayName,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        isActive: true,
      }),
    );
    expectNoSensitiveUserFields(user);
  });

  it("admin updates employee displayName and role", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        displayName: updatedEmployeeDisplayName,
        role: UserRole.SUPPORT_SPECIALIST,
      })
      .expect(200);

    const user = response.body as AdminUserBody;
    expect(user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        displayName: updatedEmployeeDisplayName,
        role: UserRole.SUPPORT_SPECIALIST,
        status: UserStatus.ACTIVE,
        isActive: true,
      }),
    );
    expectNoSensitiveUserFields(user);
  });

  it("employee cannot update admin-users endpoint", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ displayName: "Forbidden Update" })
      .expect(403);

    expectApiError(response.body);
  });

  it("client cannot update admin-users endpoint", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ displayName: "Forbidden Update" })
      .expect(403);

    expectApiError(response.body);
  });

  it("admin deactivates employee", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body as AdminUserBody;
    expect(user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        status: UserStatus.INACTIVE,
        isActive: false,
      }),
    );
    expectNoSensitiveUserFields(user);
  });

  it("deactivated employee login is blocked", async () => {
    const response = await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: managedEmployeeEmail,
        password: MANAGED_EMPLOYEE_INITIAL_PASSWORD,
      })
      .expect(403);

    expectApiError(response.body);
  });

  it("refresh token issued before deactivation is rejected after deactivation", async () => {
    if (!managedEmployeeRefreshCookie) {
      throw new Error("Expected managed employee refresh cookie before deactivation.");
    }

    const response = await request(app.getHttpServer())
      .post(AUTH_REFRESH_PATH)
      .set("Cookie", managedEmployeeRefreshCookie)
      .send({});

    expect([401, 403]).toContain(response.status);

    expectApiError(response.body);
  });

  it("admin activates employee", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body as AdminUserBody;
    expect(user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        status: UserStatus.ACTIVE,
        isActive: true,
      }),
    );
    expectNoSensitiveUserFields(user);
  });

  it("activated employee can login again", async () => {
    const loginResult = await loginManagedEmployee(MANAGED_EMPLOYEE_INITIAL_PASSWORD);

    expect(loginResult.body.user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        status: UserStatus.ACTIVE,
      }),
    );
  });

  it("admin cannot deactivate self", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${adminUserId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("invalid user id returns 400 from ParseUUID", async () => {
    const response = await request(app.getHttpServer())
      .get(`${ADMIN_USERS_PATH}/${makeInvalidUuid()}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("non-existent user returns 404", async () => {
    const missingUserId = await generateMissingUserId();

    const response = await request(app.getHttpServer())
      .get(`${ADMIN_USERS_PATH}/${missingUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expectApiError(response.body);
  });

  it("reset-password flow enforces admin-only access and replaces the old password", async () => {
    await ensureManagedEmployeeActive();

    const resetResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/reset-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ newPassword: MANAGED_EMPLOYEE_RESET_PASSWORD })
      .expect(200);

    const resetUser = resetResponse.body as AdminUserBody;
    expect(resetUser).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        status: UserStatus.ACTIVE,
        isActive: true,
      }),
    );
    expectNoSensitiveUserFields(resetUser);

    await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: managedEmployeeEmail,
        password: MANAGED_EMPLOYEE_INITIAL_PASSWORD,
      })
      .expect(401);

    const newPasswordLogin = await loginManagedEmployee(MANAGED_EMPLOYEE_RESET_PASSWORD);
    expect(newPasswordLogin.body.user).toEqual(
      expect.objectContaining({
        id: managedEmployeeId,
        email: managedEmployeeEmail,
        status: UserStatus.ACTIVE,
      }),
    );

    const forbiddenResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/reset-password`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ newPassword: "Forbidden12345" })
      .expect(403);

    expectApiError(forbiddenResponse.body);
  });

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
      },
    });
  }

  async function loginWithDemoUser(email: string): Promise<LoginBody> {
    const response = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email,
      password: DEMO_PASSWORD,
    });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    if (!body.accessToken || typeof body.accessToken !== "string") {
      throw new Error(`Missing access token in login response for ${email}`);
    }

    return body;
  }

  async function loginManagedEmployee(
    password: string,
  ): Promise<{ body: LoginBody; refreshCookie: string }> {
    const response = await request(app.getHttpServer())
      .post(AUTH_LOGIN_PATH)
      .send({
        email: managedEmployeeEmail,
        password,
      });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    if (!body.accessToken || typeof body.accessToken !== "string") {
      throw new Error("Missing access token in managed employee login response.");
    }

    return {
      body,
      refreshCookie: extractRefreshCookieHeader(response),
    };
  }

  async function createManagedEmployeeFixture(): Promise<void> {
    const user = await prisma.user.create({
      data: {
        email: managedEmployeeEmail,
        displayName: managedEmployeeDisplayName,
        passwordHash: MANAGED_EMPLOYEE_INITIAL_PASSWORD_HASH,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        clientProfileId: null,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        accountType: true,
        role: true,
        status: true,
      },
    });

    managedEmployeeId = user.id;
    expectNoSensitiveUserFields(user);
  }

  async function ensureManagedEmployeeActive(): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: managedEmployeeId },
      select: { status: true },
    });
    if (!user) {
      throw new Error("Expected managed employee to exist.");
    }

    if (user.status === UserStatus.ACTIVE) {
      return;
    }

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  }

  async function cleanupRuntimeUsers(): Promise<void> {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    });
    managedEmployeeId = "";
    managedEmployeeRefreshCookie = "";
  }

  async function generateMissingUserId(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = randomUUID();
      const existing = await prisma.user.findUnique({
        where: { id: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new Error("Unable to generate a missing user id.");
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

  function makeInvalidUuid(): string {
    return `invalid-${randomUUID()}`;
  }

  function expectAdminUsersListResponse(body: unknown): AdminUsersListBody {
    if (!isRecord(body)) {
      throw new Error("Expected admin users list response to be an object.");
    }

    if (!Array.isArray(body.data)) {
      throw new Error("Expected admin users list response data to be an array.");
    }

    if (!isRecord(body.meta)) {
      throw new Error("Expected admin users list response meta to be an object.");
    }

    const meta = body.meta;
    expect(meta).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNextPage: expect.any(Boolean),
        hasPreviousPage: expect.any(Boolean),
      }),
    );

    return body as AdminUsersListBody;
  }

  function expectSanePaginationMeta(meta: AdminUsersListMeta): void {
    expect(Number.isInteger(meta.page)).toBe(true);
    expect(Number.isInteger(meta.limit)).toBe(true);
    expect(Number.isInteger(meta.total)).toBe(true);
    expect(Number.isInteger(meta.totalPages)).toBe(true);
    expect(meta.page).toBeGreaterThanOrEqual(1);
    expect(meta.limit).toBeGreaterThanOrEqual(1);
    expect(meta.total).toBeGreaterThanOrEqual(0);
    expect(meta.totalPages).toBe(Math.ceil(meta.total / meta.limit));
    expect(meta.hasNextPage).toBe(meta.page < meta.totalPages);
    expect(meta.hasPreviousPage).toBe(meta.page > 1);
  }

  function expectEmailsSortedAscending(users: AdminUserBody[]): void {
    const emails = users.map((user) => user.email.toLocaleLowerCase("en-US"));
    const sortedEmails = [...emails].sort((left, right) => left.localeCompare(right));

    expect(emails).toEqual(sortedEmails);
  }

  function expectCreatedAtSortedDescending(users: AdminUserBody[]): void {
    for (let index = 1; index < users.length; index += 1) {
      const previous = parseTimestamp(users[index - 1].createdAt);
      const current = parseTimestamp(users[index].createdAt);

      expect(previous).toBeGreaterThanOrEqual(current);
    }
  }

  function parseTimestamp(value: string): number {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) {
      throw new Error(`Expected a valid timestamp, received ${value}.`);
    }

    return timestamp;
  }

  function expectNoSensitiveUserFields(user: unknown): void {
    expect(isRecord(user)).toBe(true);
    if (!isRecord(user)) {
      return;
    }

    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("tokenHash");
    expect(user).not.toHaveProperty("refreshToken");
    expect(user).not.toHaveProperty("refreshTokens");
    expect(user).not.toHaveProperty("accessToken");
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
