import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  ClientStatus,
  EmployeeClientAssignmentScope,
  Priority,
  PrismaClient,
  ProjectStatus,
  TaskStatus,
  UserRole,
} from "@prisma/client";
import { randomUUID } from "crypto";
import cookieParser from "cookie-parser";
import * as bcrypt from "bcryptjs";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const ASSIGNMENT_BASE_PATH = "/api/v1/admin/assignments";
const ADMIN_SUMMARY_READ_PERMISSION = "admin.summary.read";

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
  companyName: string;
  contactEmail?: string | null;
  status: ClientStatus;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type AdminSummaryResponse = {
  users: {
    total: number;
    active: number;
    inactive: number;
    employees: number;
    clients: number;
    admins: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  auditLogs: {
    total: number;
    lastActionAt: string | null;
  };
  meta: {
    generatedAt: string;
  };
};

type RecentProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate: string | null;
  updatedAt: string;
};

type RecentTaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  updatedAt: string;
  projectId: string;
};

type ClientSummaryResponse = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientStatus;
    createdAt: string;
    updatedAt: string;
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
    recent: RecentProjectSummary[];
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
    recent: RecentTaskSummary[];
  };
  meta: {
    generatedAt: string;
  };
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
    await ensureAdminSummaryPermission();

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    employeeToken = await loginWithDemoUser("performance@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    const clientProfiles = await prisma.clientProfile.findMany({
      select: { id: true, slug: true },
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

  it("admin summary endpointini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/admin/summary")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const summary = response.body as AdminSummaryResponse;
    expect(summary).toEqual(
      expect.objectContaining({
        users: expect.objectContaining({
          total: expect.any(Number),
          active: expect.any(Number),
          inactive: expect.any(Number),
          employees: expect.any(Number),
          clients: expect.any(Number),
          admins: expect.any(Number),
        }),
        clients: expect.objectContaining({
          total: expect.any(Number),
          active: expect.any(Number),
          inactive: expect.any(Number),
        }),
        projects: expect.objectContaining({
          total: expect.any(Number),
          planned: expect.any(Number),
          inProgress: expect.any(Number),
          review: expect.any(Number),
          completed: expect.any(Number),
          onHold: expect.any(Number),
        }),
        tasks: expect.objectContaining({
          total: expect.any(Number),
          todo: expect.any(Number),
          inProgress: expect.any(Number),
          review: expect.any(Number),
          done: expect.any(Number),
          blocked: expect.any(Number),
        }),
        auditLogs: expect.objectContaining({
          total: expect.any(Number),
        }),
        meta: expect.objectContaining({
          generatedAt: expect.any(String),
        }),
      }),
    );
    expect(
      summary.auditLogs.lastActionAt === null ||
        typeof summary.auditLogs.lastActionAt === "string",
    ).toBe(true);
    expect(summary.clients).not.toHaveProperty("suspended");
    expect(summary.tasks).not.toHaveProperty("unassigned");
    expect(summary.auditLogs).not.toHaveProperty("last24Hours");
    expect(summary.meta).not.toHaveProperty("resourceCount");
    expect(JSON.stringify(summary)).not.toMatch(/password|token|secret|hash/i);
  });

  it("admin.summary.read izni admin role'de bulunur, non-admin rollerde bulunmaz", async () => {
    const permission = await prisma.permission.findUnique({
      where: { slug: ADMIN_SUMMARY_READ_PERMISSION },
      select: { id: true },
    });
    expect(permission).not.toBeNull();
    if (!permission) {
      return;
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { permissionId: permission.id },
      select: { role: true },
    });
    const roles = rolePermissions.map((item) => item.role);

    expect(roles).toContain(UserRole.ADMIN);

    const nonAdminRoles = new Set<UserRole>(
      Object.values(UserRole).filter((role) => role !== UserRole.ADMIN),
    );
    expect(roles.some((role) => nonAdminRoles.has(role))).toBe(false);
  });

  it("admin summary permission kaldırılırsa route-level guard 403 döner", async () => {
    await removeRolePermission(UserRole.ADMIN, ADMIN_SUMMARY_READ_PERMISSION);

    try {
      const response = await request(app.getHttpServer())
        .get("/api/v1/admin/summary")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(403);

      expectApiError(response.body, /permission/i);
    } finally {
      await ensureRolePermission(UserRole.ADMIN, ADMIN_SUMMARY_READ_PERMISSION);
    }
  });

  it("employee summary endpointini göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/admin/summary")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);
  });

  it("employee geçici izne sahip olsa bile service-level admin check ile summary göremez", async () => {
    await ensureRolePermission(UserRole.PERFORMANCE_SPECIALIST, ADMIN_SUMMARY_READ_PERMISSION);

    try {
      const response = await request(app.getHttpServer())
        .get("/api/v1/admin/summary")
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(403);

      expectApiError(response.body, /Only admin users|admin summary/i);
    } finally {
      await removeRolePermission(UserRole.PERFORMANCE_SPECIALIST, ADMIN_SUMMARY_READ_PERMISSION);
    }
  });

  it("client summary endpointini göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/admin/summary")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("unauthenticated summary endpointi 401 döner", async () => {
    await request(app.getHttpServer()).get("/api/v1/admin/summary").expect(401);
  });

  it("admin tüm clients listesini meta/data envelope ile görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, {
      page: 1,
      limit: 20,
      total: allClientIds.length,
    });
    const returnedIds = clientsResponse.data.map((client) => client.id).sort();
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

  it("client clients list sadece kendi profilini envelope içinde görür", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, { page: 1, limit: 20, total: 1 });
    expect(clientsResponse.data.map((client) => client.id)).toEqual([clientOwnProfileId]);
  });

  it("admin client summary endpointini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}/summary`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const summary = response.body as ClientSummaryResponse;
    expectClientSummaryShape(summary, employeeAssignedClientId);
    await expectClientSummaryMatchesClientScope(summary, employeeAssignedClientId);
  });

  it("admin client summary için tasks.read.any permission yoksa 403 alır", async () => {
    await removeRolePermission(UserRole.ADMIN, "tasks.read.any");

    try {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clients/${employeeAssignedClientId}/summary`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(403);

      expectApiError(response.body, /tasks\.read\.any|permission/i);
    } finally {
      await ensureRolePermission(UserRole.ADMIN, "tasks.read.any");
    }
  });

  it("client kendi client summary endpointini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${clientOwnProfileId}/summary`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const summary = response.body as ClientSummaryResponse;
    expectClientSummaryShape(summary, clientOwnProfileId);
    await expectClientSummaryMatchesClientScope(summary, clientOwnProfileId);
  });

  it("client başka client id'ye erişemez", async () => {
    const otherClientId = allClientIds.find((clientId) => clientId !== clientOwnProfileId);
    expect(otherClientId).toBeDefined();

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${otherClientId as string}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("client başka client summary id'ye erişemez", async () => {
    const otherClientId = allClientIds.find((clientId) => clientId !== clientOwnProfileId);
    expect(otherClientId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${otherClientId as string}/summary`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);

    expect(response.body).not.toHaveProperty("client");
    expect(response.body).not.toHaveProperty("projects");
    expect(response.body).not.toHaveProperty("tasks");
  });

  it("employee sadece assigned clients list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, {
      page: 1,
      limit: 20,
      total: employeeAssignedClientIds.length,
    });
    const returnedIds = clientsResponse.data.map((client) => client.id).sort();
    const expectedIds = [...employeeAssignedClientIds].sort();
    expect(returnedIds).toEqual(expectedIds);
    expect(returnedIds).not.toContain(employeeUnassignedClientId);
  });

  it("employee assigned client summary görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}/summary`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const summary = response.body as ClientSummaryResponse;
    expectClientSummaryShape(summary, employeeAssignedClientId);
    await expectClientSummaryMatchesClientScope(summary, employeeAssignedClientId);
  });

  it("employee unassigned client summary için güvenli 404/403 alır", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeUnassignedClientId}/summary`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect([403, 404]).toContain(response.status);
    expect(response.body).not.toHaveProperty("client");
    expect(response.body).not.toHaveProperty("projects");
    expect(response.body).not.toHaveProperty("tasks");
  });

  it("admin clients pagination çalışır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?page=1&limit=2")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, {
      page: 1,
      limit: 2,
      total: allClientIds.length,
    });
    expect(clientsResponse.data.length).toBeLessThanOrEqual(2);
  });

  it("employee clients pagination meta assigned scope dışına çıkmaz", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?page=1&limit=1")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, {
      page: 1,
      limit: 1,
      total: employeeAssignedClientIds.length,
    });
    expect(clientsResponse.data).toHaveLength(1);
    expect(employeeAssignedClientIds).toContain(clientsResponse.data[0].id);
  });

  it("admin clients sort çalışır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?sortBy=slug&sortOrder=asc&limit=100")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    expectClientListEnvelope(clientsResponse, {
      page: 1,
      limit: 100,
      total: allClientIds.length,
    });
    const slugs = clientsResponse.data.map((client) => client.slug);
    expect(slugs).toEqual([...slugs].sort((first, second) => first.localeCompare(second)));
  });

  it("admin clients invalid page için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?page=0")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /page/i);
  });

  it("admin clients decimal page için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?page=1.5")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /page/i);
  });

  it("admin clients max page üstü için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?page=10001")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /page/i);
  });

  it("admin clients zero limit için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?limit=0")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /limit/i);
  });

  it("admin clients invalid limit için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?limit=101")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /limit/i);
  });

  it("admin clients invalid sortBy için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?sortBy=invalid")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /sortBy/i);
  });

  it("admin clients invalid sortOrder için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?sortOrder=sideways")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /sortOrder/i);
  });

  it("admin clients invalid status için 400 alır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?status=ARCHIVED")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /status/i);
  });

  it("admin clients status filter çalışır", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients?status=${ClientStatus.INACTIVE}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    const expectedTotal = await prisma.clientProfile.count({
      where: { status: ClientStatus.INACTIVE },
    });
    expectClientListEnvelope(clientsResponse, { page: 1, limit: 20, total: expectedTotal });
    expect(clientsResponse.data.length).toBeGreaterThan(0);
    expect(clientsResponse.data.every((client) => client.status === ClientStatus.INACTIVE)).toBe(
      true,
    );
  });

  it("admin clients search filter çalışır", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients?search=nova")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clientsResponse = response.body as PaginatedResponse<ClientListItem>;
    const expectedTotal = await prisma.clientProfile.count({
      where: {
        OR: [
          { companyName: { contains: "nova", mode: "insensitive" } },
          { slug: { contains: "nova", mode: "insensitive" } },
          { contactEmail: { contains: "nova", mode: "insensitive" } },
        ],
      },
    });
    expectClientListEnvelope(clientsResponse, { page: 1, limit: 20, total: expectedTotal });
    expect(clientsResponse.data.length).toBeGreaterThan(0);
    expect(
      clientsResponse.data.every(
        (client) =>
          client.companyName.toLowerCase().includes("nova") ||
          client.slug.toLowerCase().includes("nova") ||
          (client.contactEmail?.toLowerCase().includes("nova") ?? false),
      ),
    ).toBe(true);
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

  it("client summary recent alanlarında cross-tenant veri sızdırmaz", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}/summary`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const summary = response.body as ClientSummaryResponse;
    const projectIds = await prisma.project.findMany({
      where: { clientProfileId: employeeAssignedClientId },
      select: { id: true },
    });
    const allowedProjectIds = new Set(projectIds.map((project) => project.id));

    expect(
      summary.projects.recent.every((project) => allowedProjectIds.has(project.id)),
    ).toBe(true);
    expect(summary.tasks.recent.every((task) => allowedProjectIds.has(task.projectId))).toBe(
      true,
    );
  });

  it("unauthenticated request 401 alır", async () => {
    await request(app.getHttpServer()).get("/api/v1/clients").expect(401);
  });

  it("unauthenticated client summary request 401 alır", async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}/summary`)
      .expect(401);
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

  async function ensureAdminSummaryPermission(): Promise<void> {
    await ensureRolePermission(UserRole.ADMIN, ADMIN_SUMMARY_READ_PERMISSION);
  }

  async function ensureRolePermission(role: UserRole, permissionSlug: string): Promise<void> {
    const permissionId = await ensurePermission(permissionSlug);
    await prisma.rolePermission.createMany({
      data: [{ role, permissionId }],
      skipDuplicates: true,
    });
  }

  async function removeRolePermission(role: UserRole, permissionSlug: string): Promise<void> {
    const permission = await prisma.permission.findUnique({
      where: { slug: permissionSlug },
      select: { id: true },
    });

    if (!permission) {
      return;
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role,
        permissionId: permission.id,
      },
    });
  }

  async function ensurePermission(permissionSlug: string): Promise<string> {
    const permission = await prisma.permission.upsert({
      where: { slug: permissionSlug },
      update: {},
      create: {
        slug: permissionSlug,
        description: "Read admin summary counts.",
      },
      select: { id: true },
    });

    return permission.id;
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

  function expectClientListEnvelope(
    response: PaginatedResponse<ClientListItem>,
    expected: { page: number; limit: number; total: number },
  ): void {
    const totalPages = expected.total === 0 ? 0 : Math.ceil(expected.total / expected.limit);

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeLessThanOrEqual(expected.limit);
    expect(response.meta).toEqual({
      page: expected.page,
      limit: expected.limit,
      total: expected.total,
      totalPages,
      hasNextPage: totalPages > 0 && expected.page < totalPages,
      hasPreviousPage: expected.page > 1 && totalPages > 0,
    });
    expect(JSON.stringify(response)).not.toMatch(/password|token|secret|hash/i);
  }

  function expectClientSummaryShape(
    summary: ClientSummaryResponse,
    expectedClientId: string,
  ): void {
    expect(summary.client).toEqual(
      expect.objectContaining({
        id: expectedClientId,
        name: expect.any(String),
        slug: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(Object.values(ClientStatus)).toContain(summary.client.status);
    expectValidIsoDate(summary.client.createdAt);
    expectValidIsoDate(summary.client.updatedAt);

    expect(summary.projects.recent.length).toBeLessThanOrEqual(5);
    expectNonNegativeCount(summary.projects.total);
    expectNonNegativeCount(summary.projects.planned);
    expectNonNegativeCount(summary.projects.inProgress);
    expectNonNegativeCount(summary.projects.review);
    expectNonNegativeCount(summary.projects.completed);
    expectNonNegativeCount(summary.projects.onHold);

    expect(summary.tasks.recent.length).toBeLessThanOrEqual(5);
    expectNonNegativeCount(summary.tasks.total);
    expectNonNegativeCount(summary.tasks.todo);
    expectNonNegativeCount(summary.tasks.inProgress);
    expectNonNegativeCount(summary.tasks.review);
    expectNonNegativeCount(summary.tasks.done);
    expectNonNegativeCount(summary.tasks.blocked);

    expect(summary.meta).toEqual(
      expect.objectContaining({
        generatedAt: expect.any(String),
      }),
    );
    expectValidIsoDate(summary.meta.generatedAt);
    expect(JSON.stringify(summary)).not.toMatch(
      /password|token|secret|hash|contactEmail|description|assignee/i,
    );
  }

  async function expectClientSummaryMatchesClientScope(
    summary: ClientSummaryResponse,
    clientProfileId: string,
  ): Promise<void> {
    const [
      clientProfile,
      projectTotal,
      projectPlanned,
      projectInProgress,
      projectReview,
      projectCompleted,
      projectOnHold,
      taskTotal,
      taskTodo,
      taskInProgress,
      taskReview,
      taskDone,
      taskBlocked,
      recentProjects,
      recentTasks,
    ] =
      await prisma.$transaction([
        prisma.clientProfile.findUnique({
          where: { id: clientProfileId },
          select: {
            id: true,
            slug: true,
            companyName: true,
            status: true,
          },
        }),
        prisma.project.count({
          where: { clientProfileId },
        }),
        prisma.project.count({
          where: { clientProfileId, status: ProjectStatus.PLANNED },
        }),
        prisma.project.count({
          where: { clientProfileId, status: ProjectStatus.IN_PROGRESS },
        }),
        prisma.project.count({
          where: { clientProfileId, status: ProjectStatus.REVIEW },
        }),
        prisma.project.count({
          where: { clientProfileId, status: ProjectStatus.COMPLETED },
        }),
        prisma.project.count({
          where: { clientProfileId, status: ProjectStatus.ON_HOLD },
        }),
        prisma.task.count({
          where: {
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.task.count({
          where: {
            status: TaskStatus.TODO,
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.task.count({
          where: {
            status: TaskStatus.IN_PROGRESS,
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.task.count({
          where: {
            status: TaskStatus.REVIEW,
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.task.count({
          where: {
            status: TaskStatus.DONE,
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.task.count({
          where: {
            status: TaskStatus.BLOCKED,
            project: {
              clientProfileId,
            },
          },
        }),
        prisma.project.findMany({
          where: { clientProfileId },
          select: { id: true },
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          take: 5,
        }),
        prisma.task.findMany({
          where: {
            project: {
              clientProfileId,
            },
          },
          select: { id: true, projectId: true },
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          take: 5,
        }),
      ]);

    if (!clientProfile) {
      throw new Error("Expected client profile to exist while validating summary scope.");
    }

    expect(summary.client.id).toBe(clientProfile.id);
    expect(summary.client.name).toBe(clientProfile.companyName);
    expect(summary.client.slug).toBe(clientProfile.slug);
    expect(summary.client.status).toBe(clientProfile.status);

    expect(summary.projects.total).toBe(projectTotal);
    expect(summary.projects.planned).toBe(projectPlanned);
    expect(summary.projects.inProgress).toBe(projectInProgress);
    expect(summary.projects.review).toBe(projectReview);
    expect(summary.projects.completed).toBe(projectCompleted);
    expect(summary.projects.onHold).toBe(projectOnHold);
    expect(summary.projects.recent.map((project) => project.id)).toEqual(
      recentProjects.map((project) => project.id),
    );

    expect(summary.tasks.total).toBe(taskTotal);
    expect(summary.tasks.todo).toBe(taskTodo);
    expect(summary.tasks.inProgress).toBe(taskInProgress);
    expect(summary.tasks.review).toBe(taskReview);
    expect(summary.tasks.done).toBe(taskDone);
    expect(summary.tasks.blocked).toBe(taskBlocked);
    expect(summary.tasks.recent.map((task) => task.id)).toEqual(
      recentTasks.map((task) => task.id),
    );

    const recentTaskProjectIds = Array.from(
      new Set(summary.tasks.recent.map((task) => task.projectId)),
    );
    const scopedRecentTaskProjectCount =
      recentTaskProjectIds.length === 0
        ? 0
        : await prisma.project.count({
            where: {
              id: { in: recentTaskProjectIds },
              clientProfileId,
            },
          });
    expect(scopedRecentTaskProjectCount).toBe(recentTaskProjectIds.length);
  }

  function expectNonNegativeCount(value: number): void {
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  }

  function expectValidIsoDate(value: string): void {
    expect(Number.isNaN(Date.parse(value))).toBe(false);
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
