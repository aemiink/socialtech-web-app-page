import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClientApprovalStatus, ClientApprovalType, Prisma, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const APPROVALS_PATH = "/api/v1/client-approvals";
const CLIENT_APPROVALS_PATH = "/api/v1/client/approvals";
const DEMO_PASSWORD = "demo123";

type LoginBody = {
  accessToken: string;
};

type ClientApprovalResponse = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  type: ClientApprovalType;
  status: ClientApprovalStatus;
  title: string;
  message: string;
  actionPayload: Record<string, unknown> | null;
  clientResponseNote: string | null;
  respondedAt?: string | null;
};

describe("Client approvals authz and lifecycle (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let projectManagerToken = "";
  let clientToken = "";

  let clientOwnProfileId = "";
  let projectManagerUserId = "";
  let pmAssignedClientId = "";
  let pmUnassignedClientId = "";
  let pmAssignedProjectId = "";
  let pmAssignedTaskId = "";
  let createdUnassignedClientId = "";

  const createdApprovalIds = new Set<string>();

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

    await setDeterministicDemoPasswords();

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    projectManagerToken = await loginWithDemoUser("project@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    const [clientUser, projectManager] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { email: "client@socialtech.com" },
        select: { clientProfileId: true },
      }),
      prisma.user.findUnique({
        where: { email: "project@socialtech.com" },
        select: { id: true },
      }),
    ]);

    if (!clientUser?.clientProfileId || !projectManager) {
      throw new Error("Expected seeded demo users and client profiles for approval authz e2e.");
    }
    clientOwnProfileId = clientUser.clientProfileId;
    projectManagerUserId = projectManager.id;

    const assignedClientIds = await prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId: projectManagerUserId,
        isActive: true,
      },
      select: { clientProfileId: true },
    });
    const assignedSet = new Set(assignedClientIds.map((item) => item.clientProfileId));
    if (!assignedSet.has(clientOwnProfileId)) {
      throw new Error("Expected project manager to be assigned to client demo profile.");
    }

    pmAssignedClientId = clientOwnProfileId;
    const createdUnassigned = await prisma.clientProfile.create({
      data: {
        slug: `authz-unassigned-${Date.now()}`,
        companyName: "Authz Unassigned Client",
        contactEmail: "authz-unassigned@socialtech.com",
      },
      select: { id: true },
    });
    createdUnassignedClientId = createdUnassigned.id;
    pmUnassignedClientId = createdUnassigned.id;

    const project = await prisma.project.findFirst({
      where: { clientProfileId: clientOwnProfileId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    if (!project) {
      throw new Error("Expected a project for client own profile.");
    }
    pmAssignedProjectId = project.id;

    const existingTask = await prisma.task.findFirst({
      where: { projectId: pmAssignedProjectId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    if (existingTask) {
      pmAssignedTaskId = existingTask.id;
    } else {
      const createdTask = await prisma.task.create({
        data: {
          projectId: pmAssignedProjectId,
          title: "Approval scope validation task",
          status: "TODO",
          priority: "MEDIUM",
        },
        select: { id: true },
      });
      pmAssignedTaskId = createdTask.id;
    }
  });

  afterAll(async () => {
    if (createdApprovalIds.size > 0) {
      const ids = Array.from(createdApprovalIds);
      await prisma.clientApprovalTransition.deleteMany({ where: { approvalId: { in: ids } } });
      await prisma.clientApprovalRequest.deleteMany({ where: { id: { in: ids } } });
    }
    if (createdUnassignedClientId) {
      await prisma.clientProfile.deleteMany({ where: { id: createdUnassignedClientId } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it("rejects unauthenticated approval list request", async () => {
    await request(app.getHttpServer()).get(APPROVALS_PATH).expect(401);
  });

  it("admin can create client approval request", async () => {
    const response = await request(app.getHttpServer())
      .post(APPROVALS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        clientProfileId: clientOwnProfileId,
        projectId: pmAssignedProjectId,
        type: "TASK_APPROVAL",
        title: "Task teslim onayı",
        message: "Bu task teslimini onaylıyor musunuz?",
        entityType: "TASK",
        entityId: pmAssignedTaskId,
        requiresExplicitApproval: true,
      })
      .expect(201);

    const approval = response.body as ClientApprovalResponse;
    createdApprovalIds.add(approval.id);
    expect(approval.status).toBe("PENDING");
    expect(approval.type).toBe("TASK_APPROVAL");
    expect(approval.clientProfileId).toBe(clientOwnProfileId);
  });

  it("project manager can create approval in assigned scope", async () => {
    const response = await request(app.getHttpServer())
      .post(APPROVALS_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        clientProfileId: pmAssignedClientId,
        projectId: pmAssignedProjectId,
        type: "RELEASE_APPROVAL",
        title: "Staging release onayı",
        message: "Staging çıkışı için onayınız gerekiyor.",
        requiresExplicitApproval: true,
      })
      .expect(201);

    const approval = response.body as ClientApprovalResponse;
    createdApprovalIds.add(approval.id);
    expect(approval.clientProfileId).toBe(pmAssignedClientId);
    expect(approval.type).toBe("RELEASE_APPROVAL");
  });

  it("project manager cannot create approval for out-of-scope client", async () => {
    await request(app.getHttpServer())
      .post(APPROVALS_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        clientProfileId: pmUnassignedClientId,
        type: "GENERAL_CONFIRMATION",
        title: "Scope dışı deneme",
        message: "Bu istek reddedilmelidir.",
      })
      .expect(404);
  });

  it("client sees own approvals and cannot access others", async () => {
    const ownListResponse = await request(app.getHttpServer())
      .get(CLIENT_APPROVALS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const ownList = ownListResponse.body as { data: ClientApprovalResponse[] };
    expect(ownList.data.length).toBeGreaterThan(0);
    expect(ownList.data.every((item) => item.clientProfileId === clientOwnProfileId)).toBe(true);

    const foreignApproval = await prisma.clientApprovalRequest.create({
      data: {
        clientProfileId: pmUnassignedClientId,
        type: "GENERAL_CONFIRMATION",
        title: "Foreign approval",
        message: "Should not be visible to client user.",
        requiresExplicitApproval: true,
      },
      select: { id: true },
    });
    createdApprovalIds.add(foreignApproval.id);

    await request(app.getHttpServer())
      .get(`${CLIENT_APPROVALS_PATH}/${foreignApproval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(404);
  });

  it("client can approve explicit approval", async () => {
    const approval = await createApprovalForClient({
      type: "TASK_APPROVAL",
      requiresExplicitApproval: true,
      message: "Explicit approval request.",
      title: "Task explicit approve",
    });

    const response = await request(app.getHttpServer())
      .post(`${CLIENT_APPROVALS_PATH}/${approval.id}/respond`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "APPROVED" })
      .expect(201);

    const payload = response.body as ClientApprovalResponse;
    expect(payload.status).toBe("APPROVED");
    expect(payload.respondedAt).toBeTruthy();
  });

  it("client can reject explicit approval with note", async () => {
    const approval = await createApprovalForClient({
      type: "TASK_APPROVAL",
      requiresExplicitApproval: true,
      message: "Reject with note",
      title: "Task explicit reject",
    });

    const response = await request(app.getHttpServer())
      .post(`${CLIENT_APPROVALS_PATH}/${approval.id}/respond`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "REJECTED", note: "Eksik içerik var." })
      .expect(201);

    const payload = response.body as ClientApprovalResponse;
    expect(payload.status).toBe("REJECTED");
    expect(payload.clientResponseNote).toBe("Eksik içerik var.");
  });

  it("client can acknowledge information approval", async () => {
    const approval = await createApprovalForClient({
      type: "INFORMATION",
      requiresExplicitApproval: false,
      message: "Sadece bilgilendirme",
      title: "Bilgilendirme popup",
    });

    const response = await request(app.getHttpServer())
      .post(`${CLIENT_APPROVALS_PATH}/${approval.id}/acknowledge`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ note: "Okudum" })
      .expect(201);

    const payload = response.body as ClientApprovalResponse;
    expect(payload.status).toBe("ACKNOWLEDGED");
    expect(payload.clientResponseNote).toBe("Okudum");
  });

  it("client cannot respond finalized approval twice", async () => {
    const approval = await createApprovalForClient({
      type: "TASK_APPROVAL",
      requiresExplicitApproval: true,
      message: "Single response only",
      title: "Finalized guard",
    });

    await request(app.getHttpServer())
      .post(`${CLIENT_APPROVALS_PATH}/${approval.id}/respond`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "APPROVED" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${CLIENT_APPROVALS_PATH}/${approval.id}/respond`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: "REJECTED" })
      .expect(409);
  });

  it("management can cancel pending approval and client payload is sanitized", async () => {
    const approval = await createApprovalForClient({
      type: "DESIGN_APPROVAL",
      requiresExplicitApproval: true,
      message: "Payload sanitization test",
      title: "Design payload sanitize",
      actionPayload: {
        internalSecret: "must-not-leak",
        clientVisiblePayload: { fileName: "design-v1.png" },
      },
    });

    const clientDetail = await request(app.getHttpServer())
      .get(`${CLIENT_APPROVALS_PATH}/${approval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
    const clientApproval = clientDetail.body as ClientApprovalResponse;
    expect(clientApproval.actionPayload).toEqual({ fileName: "design-v1.png" });
    expect((clientApproval.actionPayload as Record<string, unknown>).internalSecret).toBeUndefined();

    const cancelResponse = await request(app.getHttpServer())
      .patch(`${APPROVALS_PATH}/${approval.id}/cancel`)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .expect(200);

    expect((cancelResponse.body as ClientApprovalResponse).status).toBe("CANCELLED");
  });

  async function setDeterministicDemoPasswords() {
    const deterministicPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "project@socialtech.com", "client@socialtech.com"],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });
  }

  async function loginWithDemoUser(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email,
        password: DEMO_PASSWORD,
      })
      .expect(201);

    const body = response.body as LoginBody;
    if (!body.accessToken) {
      throw new Error(`Login response for ${email} does not include an access token.`);
    }
    return body.accessToken;
  }

  async function createApprovalForClient(input: {
    type: ClientApprovalType;
    title: string;
    message: string;
    requiresExplicitApproval: boolean;
    actionPayload?: Record<string, unknown>;
  }) {
    const created = await prisma.clientApprovalRequest.create({
      data: {
        clientProfileId: clientOwnProfileId,
        projectId: pmAssignedProjectId,
        type: input.type,
        status: ClientApprovalStatus.PENDING,
        title: input.title,
        message: input.message,
        requestedByUserId: projectManagerUserId,
        requiresExplicitApproval: input.requiresExplicitApproval,
        actionPayload: (input.actionPayload as Prisma.JsonObject | undefined) ?? undefined,
      },
      select: { id: true },
    });
    createdApprovalIds.add(created.id);
    return created;
  }
});
