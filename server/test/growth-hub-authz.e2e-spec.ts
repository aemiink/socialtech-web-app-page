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
    expect(
      res.body.channels.some(
        (channel: { serviceKey: string; sourceStatus: string }) =>
          channel.serviceKey === "META_ADS" && channel.sourceStatus === "ACTIVE_MODULE",
      ),
    ).toBe(true);
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
