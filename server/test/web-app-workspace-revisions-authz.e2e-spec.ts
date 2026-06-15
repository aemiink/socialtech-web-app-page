import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  PrismaClient,
  Priority,
  ProjectStatus,
  PurchasedServiceKey,
  WebAppWorkspaceMeetingRequestStatus,
  WebAppWorkspaceRevisionStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const DEMO_PASSWORD = "demo123";
const WORKSPACE_PROJECT_NAME_PREFIX = "Workspace Revision Authz E2E";

type WorkspaceRevisionResponse = {
  id: string;
  requestedByUserId: string;
  assignedToUserId: string | null;
  status: WebAppWorkspaceRevisionStatus;
  transitions: Array<{
    toStatus: WebAppWorkspaceRevisionStatus;
    note: string | null;
  }>;
};

describe("Web App Workspace Revision Lifecycle (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let projectManagerToken = "";
  let clientToken = "";

  let adminUserId = "";
  let developerUserId = "";
  let acmeWorkspaceProjectId = "";
  let outOfScopeWorkspaceProjectId = "";

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
    await resolveRuntimeFixtures();

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    projectManagerToken = await loginWithDemoUser("project@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");
  });

  afterAll(async () => {
    const projectIds = [acmeWorkspaceProjectId, outOfScopeWorkspaceProjectId].filter(Boolean);
    if (projectIds.length > 0) {
      await prisma.project.deleteMany({
        where: {
          id: { in: projectIds },
        },
      });
    }

    await prisma.$disconnect();
    await app.close();
  });

  it("client can approve and reject own READY_FOR_REVIEW revisions", async () => {
    const approvableRevision = await createClientRevision("Client approval flow");
    await moveRevisionToReadyForReview(approvableRevision.id);

    const approveResponse = await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, approvableRevision.id))
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.APPROVED,
        note: "Client approved this revision.",
      })
      .expect(200);

    expect(approveResponse.body).toEqual(
      expect.objectContaining({
        id: approvableRevision.id,
        status: WebAppWorkspaceRevisionStatus.APPROVED,
        requestedByUserId: approvableRevision.requestedByUserId,
        assignedToUserId: developerUserId,
      }),
    );
    expect(approveResponse.body.transitions[0]).toEqual(
      expect.objectContaining({
        toStatus: WebAppWorkspaceRevisionStatus.APPROVED,
        note: "Client approved this revision.",
      }),
    );

    const rejectableRevision = await createClientRevision("Client rejection flow");
    await moveRevisionToReadyForReview(rejectableRevision.id);

    const rejectResponse = await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, rejectableRevision.id))
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.REJECTED,
        note: "Client requested another pass.",
      })
      .expect(200);

    expect(rejectResponse.body).toEqual(
      expect.objectContaining({
        id: rejectableRevision.id,
        status: WebAppWorkspaceRevisionStatus.REJECTED,
        requestedByUserId: rejectableRevision.requestedByUserId,
        assignedToUserId: developerUserId,
      }),
    );
    expect(rejectResponse.body.transitions[0]).toEqual(
      expect.objectContaining({
        toStatus: WebAppWorkspaceRevisionStatus.REJECTED,
        note: "Client requested another pass.",
      }),
    );
  });

  it("project manager cannot perform client-only READY_FOR_REVIEW transitions but admin override still works", async () => {
    const revision = await createClientRevision("PM forbidden approval");
    await moveRevisionToReadyForReview(revision.id);

    const invalidApprovalResponse = await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, revision.id))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.APPROVED,
        note: "PM attempted client approval.",
      })
      .expect(400);

    expect(invalidApprovalResponse.body.error.message).toBe(
      "Invalid revision status transition from READY_FOR_REVIEW to APPROVED.",
    );

    const adminOverrideResponse = await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, revision.id))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.APPROVED,
        note: "Admin override approval.",
      })
      .expect(200);

    expect(adminOverrideResponse.body).toEqual(
      expect.objectContaining({
        id: revision.id,
        status: WebAppWorkspaceRevisionStatus.APPROVED,
      }),
    );
    expect(adminOverrideResponse.body.transitions[0]).toEqual(
      expect.objectContaining({
        toStatus: WebAppWorkspaceRevisionStatus.APPROVED,
        note: "Admin override approval.",
      }),
    );
  });

  it("out-of-scope client revision updates return safe 404", async () => {
    const revision = await seedRevision(outOfScopeWorkspaceProjectId, adminUserId);

    await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(outOfScopeWorkspaceProjectId, revision.id))
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.CANCELLED,
        note: "Client cannot mutate another client's revision.",
      })
      .expect(404);
  });

  it("validates TSİ meeting requests and allows only the assigned project manager to respond", async () => {
    const validStartAt = futureIstanbulIso(3, 10, 0);
    const validEndAt = futureIstanbulIso(3, 10, 45);
    const createResponse = await request(app.getHttpServer())
      .post(`${workspaceBasePath(acmeWorkspaceProjectId)}/meeting-requests`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Client meeting request",
        agenda: "Review project progress.",
        preferredStartAt: validStartAt,
        preferredEndAt: validEndAt,
        timezone: "Europe/Istanbul",
      })
      .expect(201);

    const meetingRequestId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(meetingRequestPath(acmeWorkspaceProjectId, meetingRequestId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: WebAppWorkspaceMeetingRequestStatus.CONFIRMED,
      })
      .expect(403);

    const changedStartAt = futureIstanbulIso(4, 11, 0);
    const changedEndAt = futureIstanbulIso(4, 11, 45);
    const missingNoteResponse = await request(app.getHttpServer())
      .patch(meetingRequestPath(acmeWorkspaceProjectId, meetingRequestId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceMeetingRequestStatus.REQUESTED,
        scheduledStartAt: changedStartAt,
        scheduledEndAt: changedEndAt,
      })
      .expect(400);

    expect(missingNoteResponse.body.error.message).toBe(
      "A response note is required when proposing a different meeting time.",
    );

    const proposedResponse = await request(app.getHttpServer())
      .patch(meetingRequestPath(acmeWorkspaceProjectId, meetingRequestId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceMeetingRequestStatus.REQUESTED,
        scheduledStartAt: changedStartAt,
        scheduledEndAt: changedEndAt,
        responseNote: "Müşteri görüşmesi için bu saat daha uygun.",
      })
      .expect(200);

    expect(proposedResponse.body).toEqual(
      expect.objectContaining({
        id: meetingRequestId,
        status: WebAppWorkspaceMeetingRequestStatus.REQUESTED,
        responseNote: "Müşteri görüşmesi için bu saat daha uygun.",
        scheduledStartAt: changedStartAt,
        scheduledEndAt: changedEndAt,
      }),
    );

    const confirmedResponse = await request(app.getHttpServer())
      .patch(meetingRequestPath(acmeWorkspaceProjectId, meetingRequestId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceMeetingRequestStatus.CONFIRMED,
        scheduledStartAt: changedStartAt,
        scheduledEndAt: changedEndAt,
        responseNote: "Yeni tarih teyit edildi.",
      })
      .expect(200);

    expect(confirmedResponse.body.status).toBe(WebAppWorkspaceMeetingRequestStatus.CONFIRMED);

    await request(app.getHttpServer())
      .post(`${workspaceBasePath(acmeWorkspaceProjectId)}/meeting-requests`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Past meeting request",
        preferredStartAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        preferredEndAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        timezone: "Europe/Istanbul",
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`${workspaceBasePath(acmeWorkspaceProjectId)}/meeting-requests`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title: "Outside business hours",
        preferredStartAt: futureIstanbulIso(3, 8, 0),
        preferredEndAt: futureIstanbulIso(3, 8, 45),
        timezone: "Europe/Istanbul",
      })
      .expect(400);
  });

  async function setDeterministicDemoPasswords(): Promise<void> {
    const deterministicPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            "admin@socialtech.com",
            "project@socialtech.com",
            "developer@socialtech.com",
            "client@socialtech.com",
          ],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });
  }

  async function resolveRuntimeFixtures(): Promise<void> {
    const [adminUser, developerUser, acmeClientProfile, novaClientProfile] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { email: "admin@socialtech.com" },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { email: "developer@socialtech.com" },
        select: { id: true },
      }),
      prisma.clientProfile.findUnique({
        where: { slug: "acme-e-ticaret" },
        select: { id: true },
      }),
      prisma.clientProfile.findUnique({
        where: { slug: "nova-performance" },
        select: { id: true },
      }),
    ]);

    if (!adminUser) {
      throw new Error("Expected seeded admin user.");
    }
    if (!developerUser) {
      throw new Error("Expected seeded developer user.");
    }
    if (!acmeClientProfile) {
      throw new Error("Expected seeded client profile acme-e-ticaret.");
    }
    if (!novaClientProfile) {
      throw new Error("Expected seeded client profile nova-performance.");
    }

    adminUserId = adminUser.id;
    developerUserId = developerUser.id;
    acmeWorkspaceProjectId = await createWorkspaceProject(acmeClientProfile.id, "acme");
    outOfScopeWorkspaceProjectId = await createWorkspaceProject(novaClientProfile.id, "nova");
  }

  async function createWorkspaceProject(clientProfileId: string, label: string): Promise<string> {
    const timestamp = Date.now();
    const project = await prisma.project.create({
      data: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.WEB_APP,
        name: `${WORKSPACE_PROJECT_NAME_PREFIX} ${label} ${timestamp}`,
        slug: `workspace-revision-authz-${label}-${timestamp}`,
        description: "E2E fixture for workspace revision lifecycle coverage.",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    return project.id;
  }

  async function createClientRevision(title: string): Promise<WorkspaceRevisionResponse> {
    const response = await request(app.getHttpServer())
      .post(`${workspaceBasePath(acmeWorkspaceProjectId)}/revisions`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        title,
        description: `${title} description`,
      })
      .expect(201);

    return response.body as WorkspaceRevisionResponse;
  }

  async function moveRevisionToReadyForReview(revisionId: string): Promise<void> {
    await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, revisionId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.ACKNOWLEDGED,
        assignedToUserId: developerUserId,
        note: "PM acknowledged and routed to development scope.",
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, revisionId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.IN_PROGRESS,
        note: "Work started.",
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(workspaceRevisionStatusPath(acmeWorkspaceProjectId, revisionId))
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        status: WebAppWorkspaceRevisionStatus.READY_FOR_REVIEW,
        note: "Ready for client review.",
      })
      .expect(200);
  }

  async function seedRevision(projectId: string, requestedByUserId: string) {
    return prisma.$transaction(async (tx) => {
      const revision = await tx.webAppWorkspaceRevision.create({
        data: {
          projectId,
          title: `Seeded out-of-scope revision ${Date.now()}`,
          description: "Used to verify safe 404 behavior.",
          requestedByUserId,
          status: WebAppWorkspaceRevisionStatus.REQUESTED,
        },
        select: { id: true },
      });

      await tx.webAppWorkspaceRevisionTransition.create({
        data: {
          revisionId: revision.id,
          fromStatus: null,
          toStatus: WebAppWorkspaceRevisionStatus.REQUESTED,
          actorUserId: requestedByUserId,
          note: "Seeded for out-of-scope authorization coverage.",
        },
      });

      return revision;
    });
  }

  async function loginWithDemoUser(email: string): Promise<string> {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({
      email,
      password: DEMO_PASSWORD,
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );

    return response.body.accessToken as string;
  }

  function workspaceBasePath(projectId: string) {
    return `/api/v1/projects/${projectId}/web-app-workspace`;
  }

  function workspaceRevisionStatusPath(projectId: string, revisionId: string) {
    return `${workspaceBasePath(projectId)}/revisions/${revisionId}/status`;
  }

  function meetingRequestPath(projectId: string, meetingRequestId: string) {
    return `${workspaceBasePath(projectId)}/meeting-requests/${meetingRequestId}`;
  }

  function futureIstanbulIso(dayOffset: number, hour: number, minute: number): string {
    const future = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(future);
    const year = parts.find((part) => part.type === "year")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = parts.find((part) => part.type === "day")?.value ?? "";
    return new Date(
      `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+03:00`,
    ).toISOString();
  }
});
