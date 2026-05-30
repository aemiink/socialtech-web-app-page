import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  EmployeeClientAssignmentScope,
  GrowthHubGoal,
  GrowthHubStatus,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  MetaAdsInsightLevel,
  PrismaClient,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TaskStatus,
  TaskType,
  TaskWorkstream,
} from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

const DEMO_PASSWORD = "demo123";

jest.setTimeout(30_000);

describe("Growth Hub Config and Summary Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let projectToken: string;
  let performanceToken: string;
  let clientToken: string;
  let clientProfileId: string;
  let outOfScopeClientProfileId: string;
  let growthProjectId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = new PrismaClient();
    await prisma.$connect();

    adminToken = await loginAndGetAccessToken(app, "admin@socialtech.com", DEMO_PASSWORD);
    projectToken = await loginAndGetAccessToken(app, "project@socialtech.com", DEMO_PASSWORD);
    performanceToken = await loginAndGetAccessToken(
      app,
      "performance@socialtech.com",
      DEMO_PASSWORD,
    );
    clientToken = await loginAndGetAccessToken(app, "client@socialtech.com", DEMO_PASSWORD);

    const client = await prisma.clientProfile.findUniqueOrThrow({
      where: { slug: "acme-e-ticaret" },
      select: { id: true },
    });
    clientProfileId = client.id;

    const outOfScopeClient = await prisma.clientProfile.upsert({
      where: { slug: "growth-hub-out-of-scope-e2e" },
      update: { status: "ACTIVE" },
      create: {
        slug: "growth-hub-out-of-scope-e2e",
        companyName: "Growth Hub Out Of Scope E2E",
        contactEmail: "growth-hub-out-of-scope@example.com",
        status: "ACTIVE",
      },
      select: { id: true },
    });
    outOfScopeClientProfileId = outOfScopeClient.id;
    await prisma.clientPurchasedService.upsert({
      where: {
        clientProfileId_serviceKey: {
          clientProfileId: outOfScopeClientProfileId,
          serviceKey: PurchasedServiceKey.GROWTH_HUB,
        },
      },
      update: { status: PurchasedServiceStatus.ACTIVE },
      create: {
        clientProfileId: outOfScopeClientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
        status: PurchasedServiceStatus.ACTIVE,
      },
    });

    const project = await prisma.project.findFirstOrThrow({
      where: {
        clientProfileId,
        slug: "growth-hub-launch",
      },
      select: { id: true },
    });
    growthProjectId = project.id;

    await prisma.clientPurchasedService.upsert({
      where: {
        clientProfileId_serviceKey: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.GROWTH_HUB,
        },
      },
      update: { status: PurchasedServiceStatus.ACTIVE },
      create: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
        status: PurchasedServiceStatus.ACTIVE,
      },
    });

    await prisma.clientGrowthHubConfig.upsert({
      where: { clientProfileId },
      update: {
        primaryGoal: GrowthHubGoal.ECOMMERCE_SALES,
        targetLeads: 320,
        targetRoas: "4.5",
        targetCpa: "125",
        targetRevenue: "500000",
        reportingDay: "MONDAY",
        status: GrowthHubStatus.ACTIVE,
      },
      create: {
        clientProfileId,
        primaryGoal: GrowthHubGoal.ECOMMERCE_SALES,
        targetLeads: 320,
        targetRoas: "4.5",
        targetCpa: "125",
        targetRevenue: "500000",
        reportingDay: "MONDAY",
        status: GrowthHubStatus.ACTIVE,
      },
    });

    const projectManager = await prisma.user.findUniqueOrThrow({
      where: { email: "project@socialtech.com" },
      select: { id: true },
    });
    await prisma.employeeClientAssignment.upsert({
      where: {
        employeeUserId_clientProfileId_scope: {
          employeeUserId: projectManager.id,
          clientProfileId,
          scope: EmployeeClientAssignmentScope.PROJECT,
        },
      },
      update: { isActive: true },
      create: {
        employeeUserId: projectManager.id,
        clientProfileId,
        scope: EmployeeClientAssignmentScope.PROJECT,
        isActive: true,
      },
    });

    await prisma.metaAdsDailyInsight.create({
      data: {
        clientProfileId,
        adAccountId: "act_growth_hub_e2e",
        date: new Date("2026-05-25T00:00:00.000Z"),
        level: MetaAdsInsightLevel.CAMPAIGN,
        entityId: `growth-hub-e2e-${Date.now()}`,
        entityName: "Growth Hub E2E Campaign",
        spend: "100.00",
        impressions: 1000,
        clicks: 80,
        results: 16,
        purchaseValue: "520.00",
        roas: "5.20",
      },
    });

    await prisma.task.create({
      data: {
        projectId: growthProjectId,
        title: "Growth Hub E2E approval",
        status: TaskStatus.REVIEW,
        type: TaskType.MAINTENANCE,
        workstream: TaskWorkstream.FULLSTACK,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.META_ADS_STRATEGY_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        approvalRequestedAt: new Date("2026-05-25T10:00:00.000Z"),
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("admin can update Growth Hub config for an active Growth Hub client", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/admin/clients/${clientProfileId}/growth-hub/config`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        primaryGoal: "ECOMMERCE_SALES",
        targetLeads: 360,
        targetRoas: 4.8,
        targetCpa: 120,
        targetRevenue: 600000,
        reportingDay: "TUESDAY",
        notes: "Faz 1 e2e config.",
      });

    expect(res.status).toBe(200);
    expect(res.body.clientProfileId).toBe(clientProfileId);
    expect(res.body.primaryGoal).toBe("ECOMMERCE_SALES");
    expect(res.body.targetLeads).toBe(360);
    expect(res.body.targetRoas).toBe(4.8);
    expect(res.body.reportingDay).toBe("TUESDAY");
  });

  it("admin can read Growth Hub summary from real source tables", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/admin/clients/${clientProfileId}/growth-hub/summary`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.client.id).toBe(clientProfileId);
    expect(res.body.service.hasActiveService).toBe(true);
    expect(res.body.metrics.totalSpend).toBeGreaterThanOrEqual(100);
    expect(res.body.metrics.totalRevenue).toBeGreaterThanOrEqual(520);
    expect(res.body.actions.length).toBeGreaterThanOrEqual(1);
    const metaChannel = (
      res.body.channels as Array<{
        serviceKey: string;
        label: string;
        sourceStatus: string;
        healthScore: number;
        primaryMetricLabel: string;
        primaryMetricValue: number;
        riskLevel: string;
      }>
    ).find((channel) => channel.serviceKey === "META_ADS");
    expect(metaChannel?.label).toBe("Meta Ads");
    expect(metaChannel?.sourceStatus).toBe("ACTIVE_MODULE");
    expect(metaChannel?.healthScore).toBeGreaterThanOrEqual(0);
    expect(metaChannel?.primaryMetricLabel).toBeTruthy();
    expect(metaChannel?.primaryMetricValue).toBeGreaterThanOrEqual(0);
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(metaChannel?.riskLevel);
    expect(JSON.stringify(res.body)).not.toContain("accessTokenEnc");
  });

  it("admin can list Growth Hub clients with aggregate state", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/admin/growth-hub/clients")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(
      res.body.data.some((item: { client: { id: string } }) => item.client.id === clientProfileId),
    ).toBe(true);
    expect(res.body.meta.pendingApprovals).toBeGreaterThanOrEqual(1);
  });

  it("non-admin cannot access the admin Growth Hub global list", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/admin/growth-hub/clients")
      .set("Authorization", `Bearer ${performanceToken}`);

    expect(res.status).toBe(403);
  });

  it("assigned project manager can list only assigned Growth Hub clients", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/growth-hub/clients")
      .set("Authorization", `Bearer ${projectToken}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(
      res.body.data.every(
        (item: { client: { id: string } }) => item.client.id === clientProfileId,
      ),
    ).toBe(true);
  });

  it("assigned project manager can read assigned Growth Hub summary", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/growth-hub/clients/${clientProfileId}/summary`)
      .set("Authorization", `Bearer ${projectToken}`);

    expect(res.status).toBe(200);
    expect(res.body.client.id).toBe(clientProfileId);
  });

  it("employee without Growth Hub assigned permission cannot read assigned summary", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/growth-hub/clients/${clientProfileId}/summary`)
      .set("Authorization", `Bearer ${performanceToken}`);

    expect(res.status).toBe(403);
  });

  it("client can read only own Growth Hub summary on the current client endpoint", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/summary")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.client.id).toBe(clientProfileId);
    expect(res.body.service.hasActiveService).toBe(true);
  });

  it("admin can create and update persistent Growth Hub actions", async () => {
    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/growth-hub/actions`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "E2E persistent growth action",
        description: "Client-visible growth action from Faz 5.",
        projectId: growthProjectId,
        priority: "HIGH",
        dueAt: "2026-06-02",
        clientVisible: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.type).toBe("GROWTH_ACTION");
    expect(createRes.body.title).toBe("E2E persistent growth action");
    expect(createRes.body.priority).toBe("HIGH");
    expect(createRes.body.clientVisible).toBe(true);

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/growth-hub/actions/${createRes.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DONE" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("DONE");
  });

  it("assigned project manager can manage actions and clients see only visible actions", async () => {
    const internalRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/actions`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({
        title: "Internal Growth Hub action",
        projectId: growthProjectId,
        clientVisible: false,
      });

    expect(internalRes.status).toBe(201);

    const visibleRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/actions`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({
        title: "Visible Growth Hub action",
        projectId: growthProjectId,
        clientVisible: true,
      });

    expect(visibleRes.status).toBe(201);

    const clientActionsRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/actions")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientActionsRes.status).toBe(200);
    expect(
      clientActionsRes.body.data.some(
        (action: { title: string }) => action.title === "Visible Growth Hub action",
      ),
    ).toBe(true);
    expect(
      clientActionsRes.body.data.some(
        (action: { title: string }) => action.title === "Internal Growth Hub action",
      ),
    ).toBe(false);
  });

  it("assigned project manager can publish weekly notes to the client dashboard", async () => {
    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/weekly-notes`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({
        weekStart: "2026-06-01",
        weekEnd: "2026-06-07",
        summary: "E2E weekly note summary",
        nextFocus: "E2E next focus",
        risks: { items: ["inventory"] },
        clientVisible: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.summary).toBe("E2E weekly note summary");
    expect(createRes.body.clientVisible).toBe(true);

    const clientNotesRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/weekly-notes")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientNotesRes.status).toBe(200);
    expect(
      clientNotesRes.body.data.some(
        (note: { summary: string }) => note.summary === "E2E weekly note summary",
      ),
    ).toBe(true);
  });

  it("admin drafts stay internal while assigned report acknowledgement is visible to the client", async () => {
    const draftRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/growth-hub/reports`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        periodStart: "2026-06-01",
        periodEnd: "2026-06-07",
        type: "WEEKLY",
        summary: "Internal Growth Hub draft report",
        projectId: growthProjectId,
        clientVisible: false,
      });

    expect(draftRes.status).toBe(201);
    expect(draftRes.body.status).toBe("DRAFT");
    expect(draftRes.body.clientVisible).toBe(false);

    const assignedReportRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/reports`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({
        periodStart: "2026-06-01",
        periodEnd: "2026-06-07",
        type: "CHANNEL_PERFORMANCE",
        summary: "Client-visible Growth Hub performance report",
        projectId: growthProjectId,
        clientVisible: true,
        requestAcknowledgement: true,
      });

    expect(assignedReportRes.status).toBe(201);
    expect(assignedReportRes.body.status).toBe("PUBLISHED");
    expect(assignedReportRes.body.clientVisible).toBe(true);
    expect(assignedReportRes.body.acknowledgementStatus).toBe("PENDING");
    expect(assignedReportRes.body.acknowledgementTaskId).toBeTruthy();

    const clientReportsRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/reports")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientReportsRes.status).toBe(200);
    expect(
      clientReportsRes.body.data.some(
        (report: { summary: string | null }) =>
          report.summary === "Client-visible Growth Hub performance report",
      ),
    ).toBe(true);
    expect(
      clientReportsRes.body.data.some(
        (report: { summary: string | null }) => report.summary === "Internal Growth Hub draft report",
      ),
    ).toBe(false);

    const clientActionsRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/actions")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientActionsRes.status).toBe(200);
    expect(
      clientActionsRes.body.data.some(
        (action: { type: string; title: string }) =>
          action.type === "REPORT_ACKNOWLEDGEMENT" &&
          action.title === "Client-visible Growth Hub performance report",
      ),
    ).toBe(true);
  });

  it("employee without Growth Hub manage permission cannot create assigned actions", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/actions`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        title: "Forbidden action",
      });

    expect(res.status).toBe(403);
  });

  it("employee without Growth Hub report permission cannot create assigned reports", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/reports`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        periodStart: "2026-06-01",
        periodEnd: "2026-06-07",
        type: "WEEKLY",
        summary: "Forbidden report",
      });

    expect(res.status).toBe(403);
  });

  it("admin can generate Growth Hub recommendations idempotently", async () => {
    const generateRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/growth-hub/recommendations/generate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(generateRes.status).toBe(201);
    expect(generateRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(generateRes.body.meta.created).toBeGreaterThanOrEqual(1);
    expect(
      generateRes.body.data.some(
        (recommendation: { source: string; title: string }) =>
          recommendation.source === "OVERDUE_TASKS" &&
          recommendation.title === "Geciken Growth Hub işleri temizlenmeli",
      ),
    ).toBe(true);

    const secondGenerateRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/growth-hub/recommendations/generate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(secondGenerateRes.status).toBe(201);
    expect(secondGenerateRes.body.meta.created).toBe(0);
    expect(secondGenerateRes.body.meta.updated).toBeGreaterThanOrEqual(1);
  });

  it("assigned project manager can update recommendations and client sees only visible ones", async () => {
    const recommendationsRes = await request(app.getHttpServer())
      .get(`/api/v1/growth-hub/clients/${clientProfileId}/recommendations`)
      .set("Authorization", `Bearer ${projectToken}`);

    expect(recommendationsRes.status).toBe(200);
    const overdueRecommendation = (
      recommendationsRes.body.data as Array<{
        id: string;
        source: string;
        title: string;
        clientVisible: boolean;
      }>
    ).find((recommendation) => recommendation.source === "OVERDUE_TASKS");
    expect(overdueRecommendation).toBeTruthy();
    expect(overdueRecommendation?.clientVisible).toBe(false);

    const clientHiddenRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/recommendations")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientHiddenRes.status).toBe(200);
    expect(
      clientHiddenRes.body.data.some(
        (recommendation: { id: string }) => recommendation.id === overdueRecommendation?.id,
      ),
    ).toBe(false);

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/growth-hub/recommendations/${overdueRecommendation?.id}`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({ status: "ACCEPTED", clientVisible: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("ACCEPTED");
    expect(updateRes.body.clientVisible).toBe(true);

    const clientVisibleRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/growth-hub/recommendations")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(clientVisibleRes.status).toBe(200);
    expect(
      clientVisibleRes.body.data.some(
        (recommendation: { id: string; title: string }) =>
          recommendation.id === overdueRecommendation?.id &&
          recommendation.title === "Geciken Growth Hub işleri temizlenmeli",
      ),
    ).toBe(true);
  });

  it("assigned project manager can convert recommendation to task", async () => {
    const recommendationsRes = await request(app.getHttpServer())
      .get(`/api/v1/growth-hub/clients/${clientProfileId}/recommendations`)
      .set("Authorization", `Bearer ${projectToken}`);

    expect(recommendationsRes.status).toBe(200);
    const recommendation = (
      recommendationsRes.body.data as Array<{ id: string; source: string }>
    ).find((item) => item.source === "OVERDUE_TASKS");
    expect(recommendation).toBeTruthy();

    const convertRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/recommendations/${recommendation?.id}/convert-to-task`)
      .set("Authorization", `Bearer ${projectToken}`)
      .send({ title: "E2E converted Growth Hub recommendation task" });

    expect(convertRes.status).toBe(201);
    expect(convertRes.body.status).toBe("CONVERTED_TO_TASK");
    expect(convertRes.body.convertedTask.id).toBeTruthy();
    expect(convertRes.body.convertedTask.title).toBe(
      "E2E converted Growth Hub recommendation task",
    );

    const task = await prisma.task.findUnique({
      where: { id: convertRes.body.convertedTask.id },
      select: { title: true, projectId: true },
    });
    expect(task?.title).toBe("E2E converted Growth Hub recommendation task");
    expect(task?.projectId).toBe(growthProjectId);
  });

  it("recommendation endpoints enforce permission and assigned scope", async () => {
    const forbiddenRes = await request(app.getHttpServer())
      .post(`/api/v1/growth-hub/clients/${clientProfileId}/recommendations/generate`)
      .set("Authorization", `Bearer ${performanceToken}`);

    expect(forbiddenRes.status).toBe(403);

    const outOfScopeRes = await request(app.getHttpServer())
      .get(`/api/v1/growth-hub/clients/${outOfScopeClientProfileId}/recommendations`)
      .set("Authorization", `Bearer ${projectToken}`);

    expect(outOfScopeRes.status).toBe(404);
  });
});

async function loginAndGetAccessToken(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post("/api/v1/auth/login")
    .send({ email, password });
  if (!res.body.accessToken) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.accessToken;
}
