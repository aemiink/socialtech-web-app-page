import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { EmployeeClientAssignmentScope, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import * as cookieParser from "cookie-parser";
import * as bcrypt from "bcryptjs";
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const ASSIGNMENT_BASE_PATH = "/api/v1/admin/assignments";

type LoginBody = {
  accessToken: string;
};

type UserListItem = {
  id: string;
  email: string;
  passwordHash?: unknown;
  tokenHash?: unknown;
  refreshTokens?: unknown;
};

type ClientListItem = {
  id: string;
  slug: string;
};

type AssignmentListItem = {
  id: string;
  employeeUserId: string;
  clientProfileId: string;
  scope: EmployeeClientAssignmentScope;
  isActive: boolean;
};

type AssignmentPayload = {
  employeeUserId: string;
  clientProfileId: string;
  scope: EmployeeClientAssignmentScope;
};

describe("Authorization Matrix (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";

  let allClientIds: string[] = [];
  let clientOwnProfileId = "";
  let employeeAssignedClientIds: string[] = [];
  let employeeAssignedClientId = "";
  let employeeUnassignedClientId = "";
  let employeeUserId = "";
  let clientUserId = "";
  let employeeAssignedAssignmentId = "";
  let assignmentCreatePayload: AssignmentPayload;
  let createdAssignmentId = "";

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

    const deterministicPasswordHash = await bcrypt.hash("demo123", 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    employeeToken = await loginWithDemoUser("performance@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    const clientProfiles = await prisma.clientProfile.findMany({
      select: { id: true },
      orderBy: { companyName: "asc" },
    });
    allClientIds = clientProfiles.map((item) => item.id);
    if (allClientIds.length < 2) {
      throw new Error("Expected at least 2 client profiles for authz e2e tests.");
    }

    const clientUser = await prisma.user.findUnique({
      where: { email: "client@socialtech.com" },
      select: { id: true, clientProfileId: true },
    });
    if (!clientUser?.clientProfileId) {
      throw new Error("Client demo user must have a linked clientProfileId.");
    }
    clientUserId = clientUser.id;
    clientOwnProfileId = clientUser.clientProfileId;

    const employeeUser = await prisma.user.findUnique({
      where: { email: "performance@socialtech.com" },
      select: { id: true },
    });
    if (!employeeUser) {
      throw new Error("Performance demo employee not found.");
    }
    employeeUserId = employeeUser.id;

    const assignmentRows = await prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId: employeeUser.id,
        isActive: true,
      },
      select: { id: true, clientProfileId: true },
      orderBy: { clientProfileId: "asc" },
    });

    employeeAssignedClientIds = assignmentRows.map((assignment) => assignment.clientProfileId);
    if (employeeAssignedClientIds.length === 0) {
      throw new Error("Expected performance demo employee to have active assignments.");
    }

    employeeAssignedAssignmentId = assignmentRows[0].id;
    employeeAssignedClientId = employeeAssignedClientIds[0];
    const unassigned = allClientIds.find((clientId) => !employeeAssignedClientIds.includes(clientId));
    if (!unassigned) {
      throw new Error("Expected at least one unassigned client profile for performance employee.");
    }
    employeeUnassignedClientId = unassigned;

    assignmentCreatePayload = {
      employeeUserId,
      clientProfileId: employeeUnassignedClientId,
      scope: EmployeeClientAssignmentScope.PERFORMANCE,
    };
    await prisma.employeeClientAssignment.deleteMany({
      where: assignmentCreatePayload,
    });
  });

  afterAll(async () => {
    if (createdAssignmentId) {
      await prisma.employeeClientAssignment.deleteMany({
        where: { id: createdAssignmentId },
      });
    }

    await prisma.$disconnect();
    await app.close();
  });

  it("admin users list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const users = response.body as UserListItem[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).not.toHaveProperty("passwordHash");
    expect(users[0]).not.toHaveProperty("tokenHash");
    expect(users[0]).not.toHaveProperty("refreshTokens");
  });

  it("client users list göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("employee users list göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);
  });

  it("admin tüm clients listesini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clients = response.body as ClientListItem[];
    const returnedIds = clients.map((client) => client.id).sort();
    const expectedIds = [...allClientIds].sort();
    expect(returnedIds).toEqual(expectedIds);
  });

  it("client clients/me endpointini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients/me")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const ownProfile = response.body as ClientListItem;
    expect(ownProfile.id).toBe(clientOwnProfileId);
  });

  it("client başka client id'ye erişemez", async () => {
    const otherClientId = allClientIds.find((clientId) => clientId !== clientOwnProfileId);
    expect(otherClientId).toBeDefined();

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${otherClientId as string}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("employee sadece assigned clients list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const clients = response.body as ClientListItem[];
    const returnedIds = clients.map((client) => client.id).sort();
    const expectedIds = [...employeeAssignedClientIds].sort();
    expect(returnedIds).toEqual(expectedIds);
  });

  it("employee assigned client detail görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const client = response.body as ClientListItem;
    expect(client.id).toBe(employeeAssignedClientId);
  });

  it("employee unassigned client detail için 404 alır", async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeUnassignedClientId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(404);
  });

  it("unauthenticated request 401 alır", async () => {
    await request(app.getHttpServer()).get("/api/v1/clients").expect(401);
  });

  it("admin assignments list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const assignments = response.body as AssignmentListItem[];
    expect(Array.isArray(assignments)).toBe(true);
    expect(assignments.some((assignment) => assignment.id === employeeAssignedAssignmentId)).toBe(true);
  });

  it("employee assignments list göremez", async () => {
    await request(app.getHttpServer())
      .get(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);
  });

  it("client assignments list göremez", async () => {
    await request(app.getHttpServer())
      .get(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("unauthenticated assignment request 401 alır", async () => {
    await request(app.getHttpServer()).get(ASSIGNMENT_BASE_PATH).expect(401);
  });

  it("admin assignment create invalid employeeUserId UUID için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        employeeUserId: makeInvalidUuid(),
      })
      .expect(400);

    expectApiError(response.body, /employeeUserId|uuid/i);
  });

  it("admin assignment create invalid clientProfileId UUID için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        clientProfileId: makeInvalidUuid(),
      })
      .expect(400);

    expectApiError(response.body, /clientProfileId|uuid/i);
  });

  it("admin assignment create invalid scope enum için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        scope: `${assignmentCreatePayload.scope}_INVALID`,
      })
      .expect(400);

    expectApiError(response.body, /scope/i);
  });

  it("admin assignment create missing required body fields için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expectApiError(response.body, /employeeUserId|clientProfileId|scope/i);
  });

  it("admin assignment create non-existent employeeUserId için meaningful error döner", async () => {
    const missingEmployeeUserId = await generateMissingUuid((id) =>
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
    );

    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        employeeUserId: missingEmployeeUserId,
      })
      .expect(400);

    expectApiError(response.body, /employee|not found|not an employee|inactive/i);
  });

  it("admin assignment create non-existent clientProfileId için meaningful error döner", async () => {
    const missingClientProfileId = await generateMissingUuid((id) =>
      prisma.clientProfile.findUnique({ where: { id }, select: { id: true } }),
    );

    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        clientProfileId: missingClientProfileId,
      })
      .expect(400);

    expectApiError(response.body, /client profile|not found/i);
  });

  it("admin assignment create CLIENT account employeeUserId ile oluşturamaz", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...assignmentCreatePayload,
        employeeUserId: clientUserId,
      })
      .expect(400);

    expectApiError(response.body, /employee|not an employee|inactive|not found/i);
  });

  it("admin assignment oluşturabilir", async () => {
    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(assignmentCreatePayload)
      .expect(201);

    const assignment = response.body as AssignmentListItem;
    expect(assignment.employeeUserId).toBe(assignmentCreatePayload.employeeUserId);
    expect(assignment.clientProfileId).toBe(assignmentCreatePayload.clientProfileId);
    expect(assignment.scope).toBe(assignmentCreatePayload.scope);
    expect(assignment.isActive).toBe(true);
    createdAssignmentId = assignment.id;

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${assignmentCreatePayload.clientProfileId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);
  });

  it("duplicate assignment meaningful conflict döner", async () => {
    await ensureCreatedAssignmentByAdmin();

    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(assignmentCreatePayload)
      .expect(409);

    const message = extractApiErrorMessage(response.body);
    expect(message).toEqual(expect.stringMatching(/assigned|assignment|already|conflict|duplicate|exists/i));
  });

  it("admin assignment update invalid UUID için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${makeInvalidUuid()}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false })
      .expect(400);

    expectApiError(response.body, /uuid/i);
  });

  it("admin assignment update null payload için 400 alır", async () => {
    await ensureCreatedAssignmentByAdmin();
    const assignmentId = getCreatedAssignmentId();
    const nullPayload = null as unknown as Record<string, never>;

    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("Content-Type", "application/json")
      .send(nullPayload)
      .expect(400);

    expectApiError(response.body, /scope|isActive|update|json|unexpected token|null/i);
  });

  it("non-admin assignment update/deactivate yapamaz", async () => {
    await ensureCreatedAssignmentByAdmin();
    const assignmentId = getCreatedAssignmentId();

    await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ isActive: false })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ isActive: false })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}/deactivate`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}/deactivate`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("admin assignment deactivate non-existent assignment için 404 alır", async () => {
    const missingAssignmentId = await generateMissingUuid((id) =>
      prisma.employeeClientAssignment.findUnique({ where: { id }, select: { id: true } }),
    );

    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${missingAssignmentId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expectApiError(response.body, /assignment|not found/i);
  });

  it("admin assignment activate non-existent assignment için 404 alır", async () => {
    const missingAssignmentId = await generateMissingUuid((id) =>
      prisma.employeeClientAssignment.findUnique({ where: { id }, select: { id: true } }),
    );

    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${missingAssignmentId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expectApiError(response.body, /assignment|not found/i);
  });

  it("admin assignment deactivate edebilir ve employee client detail erişimini kaybeder", async () => {
    await ensureCreatedAssignmentByAdmin();
    const assignmentId = getCreatedAssignmentId();

    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 204]).toContain(response.status);
    if (response.status !== 204) {
      const assignment = response.body as AssignmentListItem;
      expect(assignment.isActive).toBe(false);
    }

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${assignmentCreatePayload.clientProfileId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(404);
  });

  it("activate endpoint varsa employee client detail erişimini geri kazanır", async () => {
    await ensureCreatedAssignmentByAdmin();
    const assignmentId = getCreatedAssignmentId();

    const deactivateResponse = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 204]).toContain(deactivateResponse.status);

    const response = await request(app.getHttpServer())
      .patch(`${ASSIGNMENT_BASE_PATH}/${assignmentId}/activate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 204]).toContain(response.status);
    if (response.status !== 204) {
      const assignment = response.body as AssignmentListItem;
      expect(assignment.isActive).toBe(true);
    }

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${assignmentCreatePayload.clientProfileId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);
  });

  async function loginWithDemoUser(email: string): Promise<string> {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({
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

  function getCreatedAssignmentId(): string {
    if (!createdAssignmentId) {
      throw new Error("Expected assignment creation test to run before mutation checks.");
    }

    return createdAssignmentId;
  }

  async function ensureCreatedAssignmentByAdmin(): Promise<string> {
    if (createdAssignmentId) {
      return createdAssignmentId;
    }

    const response = await request(app.getHttpServer())
      .post(ASSIGNMENT_BASE_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(assignmentCreatePayload);

    if (response.status === 201) {
      const assignment = response.body as AssignmentListItem;
      createdAssignmentId = assignment.id;
      return createdAssignmentId;
    }

    if (response.status === 409) {
      const existing = await prisma.employeeClientAssignment.findUnique({
        where: {
          employeeUserId_clientProfileId_scope: assignmentCreatePayload,
        },
        select: { id: true },
      });
      if (!existing) {
        throw new Error("Expected existing assignment after 409 conflict response.");
      }

      createdAssignmentId = existing.id;
      return createdAssignmentId;
    }

    throw new Error(`Unexpected status while ensuring assignment creation: ${response.status}`);
  }

  function extractApiErrorMessage(body: unknown): string {
    if (!isRecord(body)) {
      return "";
    }

    const error = body.error;
    if (!isRecord(error)) {
      return "";
    }

    const message = error.message;
    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === "string").join(" ");
    }

    return "";
  }

  function expectApiError(body: unknown, expectedMessage: RegExp): void {
    expect(isRecord(body)).toBe(true);
    if (!isRecord(body)) {
      return;
    }

    expect(body.success).toBe(false);
    expect(isRecord(body.error)).toBe(true);
    if (!isRecord(body.error)) {
      return;
    }

    expect(body.error.code).toEqual(expect.any(String));
    expect(extractApiErrorMessage(body)).toEqual(expect.stringMatching(expectedMessage));
  }

  function makeInvalidUuid(): string {
    return randomUUID().replace(/-/g, "");
  }

  async function generateMissingUuid(
    findRecord: (id: string) => Promise<{ id: string } | null>,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = randomUUID();
      const existing = await findRecord(candidate);
      if (!existing) {
        return candidate;
      }
    }

    throw new Error("Could not generate a missing UUID for authz e2e tests.");
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
});
