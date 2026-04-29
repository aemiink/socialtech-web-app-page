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

const ADMIN_AUDIT_LOGS_PATH = "/api/v1/admin/audit-logs";
const ADMIN_USERS_PATH = "/api/v1/admin/users";
const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const TEST_EMAIL_PREFIX = "authz-admin-audit-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const AUDIT_EMPLOYEE_INITIAL_PASSWORD = "AuditStart12345";
const AUDIT_EMPLOYEE_RESET_PASSWORD = "AuditReset12345";
const ADMIN_USER_AUDIT_ENTITY_TYPE = "User";
const ADMIN_USER_AUDIT_ACTIONS = {
  CREATED: "ADMIN_USER_CREATED",
  UPDATED: "ADMIN_USER_UPDATED",
  DEACTIVATED: "ADMIN_USER_DEACTIVATED",
  ACTIVATED: "ADMIN_USER_ACTIVATED",
  PASSWORD_RESET: "ADMIN_USER_PASSWORD_RESET",
} as const;
const SENSITIVE_METADATA_TOKENS = [
  "password",
  "passwordHash",
  "newPassword",
  "token",
  "secret",
  "authorization",
  "authHeader",
  "bearer",
  DEMO_PASSWORD,
  AUDIT_EMPLOYEE_INITIAL_PASSWORD,
  AUDIT_EMPLOYEE_RESET_PASSWORD,
] as const;

type AdminUserAuditAction =
  (typeof ADMIN_USER_AUDIT_ACTIONS)[keyof typeof ADMIN_USER_AUDIT_ACTIONS];

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
};

type AuditLogBody = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

type AuditLogsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AuditLogsListBody = {
  data: AuditLogBody[];
  meta: AuditLogsListMeta;
};

describe("Admin Audit Logs Read Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";
  let adminUserId = "";
  let managedEmployeeId = "";
  let auditWindowStartedAt = "";
  let auditWindowEndedAt = "";

  const managedEmployeeEmail = `${TEST_EMAIL_PREFIX}${randomUUID()}@example.com`;
  const managedEmployeeDisplayName = "Audit Logs Managed Employee";
  const updatedEmployeeDisplayName = "Audit Logs Managed Employee Updated";
  const auditLogIdsByAction = new Map<AdminUserAuditAction, string>();

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

    await createAuditTrail();
  });

  afterAll(async () => {
    await cleanupRuntimeUsers();
    await prisma.$disconnect();
    await app.close();
  });

  it("admin list returns 200 with data and meta", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data.length).toBeGreaterThan(0);
    expectSanePaginationMeta(list.meta);
    for (const auditLog of list.data) {
      expectAuditLogShape(auditLog);
      expectMetadataHasNoSensitiveTokens(auditLog.metadata);
    }
  });

  it("employee list returns 403", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("client list returns 403", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("unauthenticated list returns 401", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .expect(401);

    expectApiError(response.body);
  });

  it("admin detail returns 200", async () => {
    const auditLogId = expectAuditLogIdForAction(ADMIN_USER_AUDIT_ACTIONS.CREATED);

    const response = await request(app.getHttpServer())
      .get(`${ADMIN_AUDIT_LOGS_PATH}/${auditLogId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const auditLog = expectAuditLogResponse(response.body);
    expect(auditLog).toEqual(
      expect.objectContaining({
        id: auditLogId,
        actorUserId: adminUserId,
        action: ADMIN_USER_AUDIT_ACTIONS.CREATED,
        entityType: ADMIN_USER_AUDIT_ENTITY_TYPE,
        entityId: managedEmployeeId,
      }),
    );
    expectMetadataHasNoSensitiveTokens(auditLog.metadata);
  });

  it("non-admin detail returns 403", async () => {
    const auditLogId = expectAuditLogIdForAction(ADMIN_USER_AUDIT_ACTIONS.UPDATED);

    const employeeResponse = await request(app.getHttpServer())
      .get(`${ADMIN_AUDIT_LOGS_PATH}/${auditLogId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);
    expectApiError(employeeResponse.body);

    const clientResponse = await request(app.getHttpServer())
      .get(`${ADMIN_AUDIT_LOGS_PATH}/${auditLogId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
    expectApiError(clientResponse.body);
  });

  it("missing detail returns 404", async () => {
    const missingAuditLogId = await generateMissingAuditLogId();

    const response = await request(app.getHttpServer())
      .get(`${ADMIN_AUDIT_LOGS_PATH}/${missingAuditLogId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expectApiError(response.body);
  });

  it("pagination meta is correct", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ search: managedEmployeeId, page: 1, limit: 2 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data).toHaveLength(2);
    expect(list.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 2,
        total: auditLogIdsByAction.size,
        totalPages: Math.ceil(auditLogIdsByAction.size / 2),
        hasNextPage: true,
        hasPreviousPage: false,
      }),
    );
    expectSanePaginationMeta(list.meta);
  });

  it("limit=0 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ limit: 0 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("limit=101 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ limit: 101 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("page=0 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ page: 0 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("page=10001 returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ page: 10001 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("invalid sortBy returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ sortBy: "passwordHash" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("invalid sortOrder returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ sortOrder: "sideways" })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("action filter works", async () => {
    const action = ADMIN_USER_AUDIT_ACTIONS.UPDATED;

    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ action, search: managedEmployeeId, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0]).toEqual(
      expect.objectContaining({
        id: expectAuditLogIdForAction(action),
        action,
        entityId: managedEmployeeId,
      }),
    );
  });

  it("actorUserId filter works", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ actorUserId: adminUserId, search: managedEmployeeId, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data).toHaveLength(auditLogIdsByAction.size);
    for (const auditLog of list.data) {
      expect(auditLog.actorUserId).toBe(adminUserId);
      expect(auditLog.entityId).toBe(managedEmployeeId);
    }
  });

  it("entityType filter works", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ entityType: ADMIN_USER_AUDIT_ENTITY_TYPE, search: managedEmployeeId, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data).toHaveLength(auditLogIdsByAction.size);
    for (const auditLog of list.data) {
      expect(auditLog.entityType).toBe(ADMIN_USER_AUDIT_ENTITY_TYPE);
      expect(auditLog.entityId).toBe(managedEmployeeId);
    }
  });

  it("dateFrom/dateTo filter works", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({
        dateFrom: auditWindowStartedAt,
        dateTo: auditWindowEndedAt,
        search: managedEmployeeId,
        limit: 100,
      })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const list = expectAuditLogsListResponse(response.body);
    expect(list.data).toHaveLength(auditLogIdsByAction.size);
    for (const auditLog of list.data) {
      expect(auditLog.entityId).toBe(managedEmployeeId);
      expect(parseTimestamp(auditLog.createdAt)).toBeGreaterThanOrEqual(
        parseTimestamp(auditWindowStartedAt),
      );
      expect(parseTimestamp(auditLog.createdAt)).toBeLessThanOrEqual(
        parseTimestamp(auditWindowEndedAt),
      );
    }
  });

  it("dateFrom greater than dateTo returns 400", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({
        dateFrom: auditWindowEndedAt,
        dateTo: auditWindowStartedAt,
      })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body);
  });

  it("search filter works for action, entityType, and entityId", async () => {
    const actionResponse = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ search: ADMIN_USER_AUDIT_ACTIONS.PASSWORD_RESET, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const actionList = expectAuditLogsListResponse(actionResponse.body);
    expect(actionList.data.length).toBeGreaterThan(0);
    expect(actionList.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expectAuditLogIdForAction(ADMIN_USER_AUDIT_ACTIONS.PASSWORD_RESET),
          action: ADMIN_USER_AUDIT_ACTIONS.PASSWORD_RESET,
        }),
      ]),
    );

    const entityTypeResponse = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ search: ADMIN_USER_AUDIT_ENTITY_TYPE, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const entityTypeList = expectAuditLogsListResponse(entityTypeResponse.body);
    expect(entityTypeList.data.length).toBeGreaterThan(0);
    expect(entityTypeList.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expectAuditLogIdForAction(ADMIN_USER_AUDIT_ACTIONS.CREATED),
          entityType: ADMIN_USER_AUDIT_ENTITY_TYPE,
        }),
      ]),
    );

    const entityIdResponse = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ search: managedEmployeeId, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const entityIdList = expectAuditLogsListResponse(entityIdResponse.body);
    expect(entityIdList.data).toHaveLength(auditLogIdsByAction.size);
    expect(new Set(entityIdList.data.map((auditLog) => auditLog.id))).toEqual(
      new Set(auditLogIdsByAction.values()),
    );
  });

  it("metadata sensitive keys are not exposed", async () => {
    const passwordResetAuditLogId = expectAuditLogIdForAction(
      ADMIN_USER_AUDIT_ACTIONS.PASSWORD_RESET,
    );

    const detailResponse = await request(app.getHttpServer())
      .get(`${ADMIN_AUDIT_LOGS_PATH}/${passwordResetAuditLogId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const detail = expectAuditLogResponse(detailResponse.body);
    expectMetadataHasNoSensitiveTokens(detail.metadata);

    const listResponse = await request(app.getHttpServer())
      .get(ADMIN_AUDIT_LOGS_PATH)
      .query({ search: managedEmployeeId, limit: 100 })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const list = expectAuditLogsListResponse(listResponse.body);
    for (const auditLog of list.data) {
      expectMetadataHasNoSensitiveTokens(auditLog.metadata);
    }
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
      throw new Error(`Missing access token in login response for ${email}.`);
    }

    return body;
  }

  async function createAuditTrail(): Promise<void> {
    auditWindowStartedAt = new Date(Date.now() - 1_000).toISOString();

    const createResponse = await request(app.getHttpServer())
      .post(ADMIN_USERS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: managedEmployeeEmail,
        displayName: managedEmployeeDisplayName,
        password: AUDIT_EMPLOYEE_INITIAL_PASSWORD,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.SEO_SPECIALIST,
      })
      .expect(201);

    const createdUser = createResponse.body as AdminUserBody;
    managedEmployeeId = createdUser.id;
    expect(createdUser).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: managedEmployeeEmail,
        displayName: managedEmployeeDisplayName,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.SEO_SPECIALIST,
        status: UserStatus.ACTIVE,
      }),
    );

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        displayName: updatedEmployeeDisplayName,
        role: UserRole.SUPPORT_SPECIALIST,
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${ADMIN_USERS_PATH}/${managedEmployeeId}/reset-password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ newPassword: AUDIT_EMPLOYEE_RESET_PASSWORD })
      .expect(200);

    auditWindowEndedAt = new Date(Date.now() + 1_000).toISOString();
    await loadCreatedAuditLogIds();
  }

  async function loadCreatedAuditLogIds(): Promise<void> {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityId: managedEmployeeId,
        action: {
          in: Object.values(ADMIN_USER_AUDIT_ACTIONS),
        },
      },
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
      },
      orderBy: { createdAt: "asc" },
    });

    for (const auditLog of auditLogs) {
      expect(auditLog).toEqual(
        expect.objectContaining({
          actorUserId: adminUserId,
          entityType: ADMIN_USER_AUDIT_ENTITY_TYPE,
          entityId: managedEmployeeId,
        }),
      );
      expectMetadataHasNoSensitiveTokens(auditLog.metadata);

      if (isAdminUserAuditAction(auditLog.action)) {
        auditLogIdsByAction.set(auditLog.action, auditLog.id);
      }
    }

    for (const action of Object.values(ADMIN_USER_AUDIT_ACTIONS)) {
      if (!auditLogIdsByAction.has(action)) {
        throw new Error(`Expected generated audit log for action ${action}.`);
      }
    }
  }

  async function cleanupRuntimeUsers(): Promise<void> {
    const runtimeUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
      select: { id: true },
    });
    const runtimeUserIds = runtimeUsers.map((user) => user.id);

    if (runtimeUserIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: {
          entityId: {
            in: runtimeUserIds,
          },
        },
      });
      await prisma.refreshToken.deleteMany({
        where: {
          userId: {
            in: runtimeUserIds,
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: {
            in: runtimeUserIds,
          },
        },
      });
    }

    managedEmployeeId = "";
    auditLogIdsByAction.clear();
  }

  async function generateMissingAuditLogId(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = randomUUID();
      const existing = await prisma.auditLog.findUnique({
        where: { id: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new Error("Unable to generate a missing audit log id.");
  }

  function expectAuditLogsListResponse(body: unknown): AuditLogsListBody {
    if (!isRecord(body)) {
      throw new Error("Expected audit logs list response to be an object.");
    }

    if (!Array.isArray(body.data)) {
      throw new Error("Expected audit logs list response data to be an array.");
    }

    if (!isRecord(body.meta)) {
      throw new Error("Expected audit logs list response meta to be an object.");
    }

    const list = body as AuditLogsListBody;
    expect(list.meta).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNextPage: expect.any(Boolean),
        hasPreviousPage: expect.any(Boolean),
      }),
    );

    for (const auditLog of list.data) {
      expectAuditLogShape(auditLog);
    }

    return list;
  }

  function expectAuditLogResponse(body: unknown): AuditLogBody {
    if (!isRecord(body)) {
      throw new Error("Expected audit log response to be an object.");
    }

    const auditLog = body as AuditLogBody;
    expectAuditLogShape(auditLog);
    return auditLog;
  }

  function expectAuditLogShape(auditLog: AuditLogBody): void {
    expect(auditLog).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        action: expect.any(String),
        entityType: expect.any(String),
        createdAt: expect.any(String),
      }),
    );
    expect(auditLog.actorUserId === null || typeof auditLog.actorUserId === "string").toBe(true);
    expect(auditLog.entityId === null || typeof auditLog.entityId === "string").toBe(true);
    expect(auditLog).not.toHaveProperty("passwordHash");
    expect(auditLog).not.toHaveProperty("tokenHash");
    expect(auditLog).not.toHaveProperty("refreshToken");
    expect(auditLog).not.toHaveProperty("refreshTokens");
    expect(auditLog).not.toHaveProperty("accessToken");
    parseTimestamp(auditLog.createdAt);
  }

  function expectSanePaginationMeta(meta: AuditLogsListMeta): void {
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

  function expectAuditLogIdForAction(action: AdminUserAuditAction): string {
    const auditLogId = auditLogIdsByAction.get(action);
    if (!auditLogId) {
      throw new Error(`Missing generated audit log id for ${action}.`);
    }

    return auditLogId;
  }

  function expectMetadataHasNoSensitiveTokens(metadata: unknown): void {
    if (metadata === null || metadata === undefined) {
      return;
    }

    const serializedMetadata = JSON.stringify(metadata).toLocaleLowerCase("en-US");
    for (const token of SENSITIVE_METADATA_TOKENS) {
      expect(serializedMetadata).not.toContain(token.toLocaleLowerCase("en-US"));
    }
  }

  function parseTimestamp(value: string): number {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) {
      throw new Error(`Expected a valid timestamp, received ${value}.`);
    }

    return timestamp;
  }

  function isAdminUserAuditAction(value: string): value is AdminUserAuditAction {
    return Object.values(ADMIN_USER_AUDIT_ACTIONS).includes(value as AdminUserAuditAction);
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
