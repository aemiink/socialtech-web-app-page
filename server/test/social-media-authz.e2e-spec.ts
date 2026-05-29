import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  EmployeeClientAssignmentScope,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  Priority,
  PrismaClient,
  ProjectFileCategory,
  ProjectFileVisibility,
  ProjectStatus,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  SocialMediaGoal,
  SocialMediaPostStatus,
  TaskStatus,
  TaskType,
  TaskWorkstream,
} from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

const DEMO_PASSWORD = "demo123";

jest.setTimeout(30_000);

describe("Social Media Config and Summary Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let socialEmployeeToken: string;
  let designerToken: string;
  let performanceToken: string;
  let clientToken: string;
  let socialClientId: string;
  let clientProfileId: string;
  let socialProjectId: string;
  let adminUserId: string;
  let designerUserId: string;

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
    socialEmployeeToken = await loginAndGetAccessToken(
      app,
      "social@socialtech.com",
      DEMO_PASSWORD,
    );
    designerToken = await loginAndGetAccessToken(app, "designer@socialtech.com", DEMO_PASSWORD);
    performanceToken = await loginAndGetAccessToken(
      app,
      "performance@socialtech.com",
      DEMO_PASSWORD,
    );
    clientToken = await loginAndGetAccessToken(app, "client@socialtech.com", DEMO_PASSWORD);

    const socialClient = await prisma.clientProfile.findUniqueOrThrow({
      where: { slug: "mavi-sosyal" },
      select: { id: true },
    });
    socialClientId = socialClient.id;

    const socialProject = await prisma.project.findFirstOrThrow({
      where: {
        slug: "social-calendar-refresh",
        clientProfileId: socialClientId,
      },
      select: { id: true },
    });
    socialProjectId = socialProject.id;

    const [adminUser, designerUser] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { email: "admin@socialtech.com" },
        select: { id: true },
      }),
      prisma.user.findUniqueOrThrow({
        where: { email: "designer@socialtech.com" },
        select: { id: true },
      }),
    ]);
    adminUserId = adminUser.id;
    designerUserId = designerUser.id;

    await prisma.employeeClientAssignment.upsert({
      where: {
        employeeUserId_clientProfileId_scope: {
          employeeUserId: designerUserId,
          clientProfileId: socialClientId,
          scope: EmployeeClientAssignmentScope.SOCIAL_MEDIA,
        },
      },
      update: { isActive: true },
      create: {
        employeeUserId: designerUserId,
        clientProfileId: socialClientId,
        scope: EmployeeClientAssignmentScope.SOCIAL_MEDIA,
        isActive: true,
      },
    });

    const meRes = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);
    clientProfileId = meRes.body.clientProfile?.id;

    await prisma.clientPurchasedService.upsert({
      where: {
        clientProfileId_serviceKey: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        },
      },
      update: { status: PurchasedServiceStatus.ACTIVE },
      create: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        status: PurchasedServiceStatus.ACTIVE,
      },
    });

    await prisma.clientSocialMediaConfig.upsert({
      where: { clientProfileId },
      update: {
        instagramUsername: "@acme",
        primaryGoal: SocialMediaGoal.ENGAGEMENT,
        hashtags: ["#acme"],
      },
      create: {
        clientProfileId,
        instagramUsername: "@acme",
        primaryGoal: SocialMediaGoal.ENGAGEMENT,
        hashtags: ["#acme"],
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("admin can update Social Media config for an active Social Media client", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/social-media/clients/${socialClientId}/config`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        instagramUsername: " @mavisosyal ",
        contentFrequency: "Haftada 3 post",
        primaryGoal: "COMMUNITY_GROWTH",
        hashtags: ["#mavi", "#sosyal"],
        notes: "Faz 1 test config.",
      });

    expect(res.status).toBe(200);
    expect(res.body.clientProfileId).toBe(socialClientId);
    expect(res.body.instagramUsername).toBe("@mavisosyal");
    expect(res.body.primaryGoal).toBe("COMMUNITY_GROWTH");
    expect(res.body.hashtags).toEqual(["#mavi", "#sosyal"]);
    expect(res.body).not.toHaveProperty("accessTokenEnc");
  });

  it("admin can list Social Media clients with summary counts and assignment visibility", async () => {
    await prisma.socialMediaPost.create({
      data: {
        clientProfileId: socialClientId,
        projectId: socialProjectId,
        platform: "INSTAGRAM",
        type: "FEED",
        status: SocialMediaPostStatus.SCHEDULED,
        title: "Overdue scheduled Social Media post",
        scheduledAt: new Date("2026-05-01T09:00:00.000Z"),
        clientVisible: false,
      },
    });

    const res = await request(app.getHttpServer())
      .get("/api/v1/social-media/clients")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);

    const item = res.body.data.find(
      (row: { client: { id: string } }) => row.client.id === socialClientId,
    );
    expect(item).toBeDefined();
    expect(item.client.companyName).toBeDefined();
    expect(item.metrics.plannedPosts).toBeGreaterThanOrEqual(1);
    expect(item.metrics.overdueScheduledPosts).toBeGreaterThanOrEqual(1);
    expect(item.assignedSocialMediaSpecialists.length).toBeGreaterThanOrEqual(1);
    expect(item.assignedDesigners.length).toBeGreaterThanOrEqual(1);
    expect(["READY", "ATTENTION", "BLOCKED"]).toContain(item.risk.status);

    const serializedBody = JSON.stringify(res.body);
    expect(serializedBody).not.toContain("accessTokenEnc");
    expect(serializedBody).not.toContain("tokenHash");
  });

  it("non-admin users cannot access the global Social Media clients endpoint", async () => {
    const employeeRes = await request(app.getHttpServer())
      .get("/api/v1/social-media/clients")
      .set("Authorization", `Bearer ${socialEmployeeToken}`);
    const clientRes = await request(app.getHttpServer())
      .get("/api/v1/social-media/clients")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(employeeRes.status).toBe(403);
    expect(clientRes.status).toBe(403);
    expect(JSON.stringify(clientRes.body)).not.toContain("mavi-sosyal");
  });

  it("assigned Social Media employee can read config and summary for assigned Social Media client", async () => {
    const configRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/config`)
      .set("Authorization", `Bearer ${socialEmployeeToken}`);

    expect(configRes.status).toBe(200);
    expect(configRes.body.instagramUsername).toBe("@mavisosyal");

    const summaryRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/summary`)
      .set("Authorization", `Bearer ${socialEmployeeToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.state).toBe("READY");
    expect(summaryRes.body.metrics.projects).toBeGreaterThanOrEqual(1);
    expect(summaryRes.body.meta.sources).toContain("ClientPurchasedService");
  });

  it("client own summary uses own profile and real V1 data sources", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/summary")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.client.id).toBe(clientProfileId);
    expect(res.body.service.hasActiveService).toBe(true);
    expect(["READY", "WAITING_CONTENT_PLAN", "WAITING_CONFIG"]).toContain(res.body.state);
    expect(res.body.meta.sources).toEqual(
      expect.arrayContaining(["Project", "Task", "TaskTodo", "ProjectFile"]),
    );
  });

  it("client cannot access admin/employee Social Media client routes", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/config`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  it("unauthenticated Social Media config request returns 401", async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/v1/social-media/clients/${socialClientId}/config`,
    );

    expect(res.status).toBe(401);
  });

  it("admin can create, list, read, and update Social Media content calendar posts", async () => {
    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${socialClientId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: socialProjectId,
        platform: "INSTAGRAM",
        type: "REEL",
        title: " Haziran lansman reels ",
        caption: "Yeni sezon duyurusu.",
        scheduledAt: "2026-06-12T09:00:00.000Z",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.clientProfileId).toBe(socialClientId);
    expect(createRes.body.title).toBe("Haziran lansman reels");
    expect(createRes.body.status).toBe(SocialMediaPostStatus.IDEA);

    const postId = createRes.body.id;

    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/posts?platform=instagram`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.some((post: { id: string }) => post.id === postId)).toBe(true);

    const detailRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/posts/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.id).toBe(postId);

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/social-media/posts/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "DRAFT", clientVisible: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe(SocialMediaPostStatus.DRAFT);
    expect(updateRes.body.clientVisible).toBe(true);
  });

  it("assigned Social Media specialist can manage assigned client posts", async () => {
    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${socialClientId}/posts`)
      .set("Authorization", `Bearer ${socialEmployeeToken}`)
      .send({
        projectId: socialProjectId,
        platform: "TIKTOK",
        type: "SHORT_VIDEO",
        status: "DRAFT",
        title: "Kamera arkası kısa video",
        scheduledAt: "2026-06-15T12:00:00.000Z",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.platform).toBe("TIKTOK");

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/social-media/posts/${createRes.body.id}`)
      .set("Authorization", `Bearer ${socialEmployeeToken}`)
      .send({ status: "WAITING_APPROVAL" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe(SocialMediaPostStatus.WAITING_APPROVAL);
  });

  it("assigned Social Media specialist can create Social Media approval tasks", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${socialEmployeeToken}`)
      .send({
        projectId: socialProjectId,
        title: "Social Media içerik onayı",
        description: "İçerik takvimi için müşteri onayı bekleniyor.",
        status: "REVIEW",
        priority: "HIGH",
        type: TaskType.REVISION,
        workstream: TaskWorkstream.FULLSTACK,
        approvalRequired: true,
        approvalType: "SOCIAL_MEDIA_CALENDAR_APPROVAL",
        approvalStatus: "PENDING",
      });

    expect(res.status).toBe(201);
    expect(res.body.projectId).toBe(socialProjectId);
    expect(res.body.approvalRequired).toBe(true);
    expect(res.body.approvalStatus).toBe("PENDING");
    expect(res.body.approvalType).toBe("SOCIAL_MEDIA_CALENDAR_APPROVAL");
  });

  it("client approval response updates linked Social Media post status and creates revision follow-up", async () => {
    const clientSocialProject = await prisma.project.upsert({
      where: {
        clientProfileId_slug: {
          clientProfileId,
          slug: "acme-social-media-calendar",
        },
      },
      update: {
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      create: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        name: "Acme Social Media Calendar",
        slug: "acme-social-media-calendar",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    const approvedPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        projectId: clientSocialProject.id,
        platform: "INSTAGRAM",
        type: "FEED",
        status: SocialMediaPostStatus.WAITING_APPROVAL,
        title: "Acme approval post",
        caption: "Client approval caption.",
        clientVisible: true,
      },
      select: { id: true },
    });

    const approvalTaskRes = await request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: clientSocialProject.id,
        title: "Acme Social Media post approval",
        description: "Client approval is required for the Social Media post.",
        status: "REVIEW",
        priority: "HIGH",
        type: "REVISION",
        workstream: "FULLSTACK",
        approvalRequired: true,
        approvalType: "SOCIAL_MEDIA_POST_APPROVAL",
        approvalStatus: "PENDING",
      });

    expect(approvalTaskRes.status).toBe(201);

    await prisma.socialMediaPost.update({
      where: { id: approvedPost.id },
      data: { approvalTaskId: approvalTaskRes.body.id },
    });

    const approveRes = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${approvalTaskRes.body.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.approvalStatus).toBe(MetaAdsApprovalStatus.APPROVED);
    expect(approveRes.body.status).toBe(TaskStatus.DONE);

    const approvedPostAfterResponse = await prisma.socialMediaPost.findUniqueOrThrow({
      where: { id: approvedPost.id },
      select: { status: true },
    });
    expect(approvedPostAfterResponse.status).toBe(SocialMediaPostStatus.APPROVED);

    const revisionPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        projectId: clientSocialProject.id,
        platform: "INSTAGRAM",
        type: "CAROUSEL",
        status: SocialMediaPostStatus.WAITING_APPROVAL,
        title: "Acme revision post",
        caption: "Revision caption.",
        clientVisible: true,
      },
      select: { id: true },
    });

    const revisionApprovalTask = await prisma.task.create({
      data: {
        projectId: clientSocialProject.id,
        title: "Acme Social Media revision approval",
        description: "Client can request changes.",
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        type: "REVISION",
        workstream: "FULLSTACK",
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.SOCIAL_MEDIA_POST_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
      },
      select: { id: true },
    });

    await prisma.socialMediaPost.update({
      where: { id: revisionPost.id },
      data: { approvalTaskId: revisionApprovalTask.id },
    });

    const revisionRes = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${revisionApprovalTask.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        approvalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
        approvalResponseNote: "Görselde logo daha büyük olsun.",
      });

    expect(revisionRes.status).toBe(200);
    expect(revisionRes.body.approvalStatus).toBe(MetaAdsApprovalStatus.CHANGES_REQUESTED);
    expect(revisionRes.body.approvalResponseNote).toBe("Görselde logo daha büyük olsun.");

    const revisionPostAfterResponse = await prisma.socialMediaPost.findUniqueOrThrow({
      where: { id: revisionPost.id },
      select: { status: true },
    });
    expect(revisionPostAfterResponse.status).toBe(SocialMediaPostStatus.REVISION_REQUIRED);

    const followUpTask = await prisma.task.findFirst({
      where: {
        projectId: clientSocialProject.id,
        title: "Revizyon: Acme Social Media revision approval",
      },
      select: { id: true, type: true },
    });
    expect(followUpTask?.type).toBe(TaskType.REVISION);
  });

  it("rejects invalid Social Media post status transitions", async () => {
    const createRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${socialClientId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: socialProjectId,
        platform: "LINKEDIN",
        type: "TEXT",
        status: "DRAFT",
        title: "LinkedIn düşünce liderliği postu",
      });

    expect(createRes.status).toBe(201);

    const invalidRes = await request(app.getHttpServer())
      .patch(`/api/v1/social-media/posts/${createRes.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PUBLISHED" });

    expect(invalidRes.status).toBe(400);
  });

  it("manual publishing actions enforce schedule, publish, cancel, and visibility rules", async () => {
    const approvedPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        platform: "INSTAGRAM",
        type: "REEL",
        status: SocialMediaPostStatus.APPROVED,
        title: `Acme manual publish ${Date.now()}`,
        clientVisible: false,
      },
      select: { id: true },
    });

    const scheduleRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${approvedPost.id}/schedule`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        scheduledAt: "2026-06-25T10:00:00.000Z",
        clientVisible: true,
      });

    expect(scheduleRes.status).toBe(201);
    expect(scheduleRes.body.status).toBe(SocialMediaPostStatus.SCHEDULED);
    expect(scheduleRes.body.clientVisible).toBe(true);
    expect(scheduleRes.body.scheduledAt).toBe("2026-06-25T10:00:00.000Z");

    const publishRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${approvedPost.id}/mark-published`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        publishedAt: "2026-06-25T12:00:00.000Z",
        externalPostUrl: "https://instagram.com/p/acme-phase-7",
        externalPostId: "ig-acme-phase-7",
      });

    expect(publishRes.status).toBe(201);
    expect(publishRes.body.status).toBe(SocialMediaPostStatus.PUBLISHED);
    expect(publishRes.body.clientVisible).toBe(true);
    expect(publishRes.body.externalPostUrl).toBe("https://instagram.com/p/acme-phase-7");
    expect(publishRes.body.externalPostId).toBe("ig-acme-phase-7");

    const ownListRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/posts?status=PUBLISHED")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(ownListRes.status).toBe(200);
    const ownPublishedPost = ownListRes.body.find(
      (post: { id: string }) => post.id === approvedPost.id,
    );
    expect(ownPublishedPost).toBeDefined();
    expect(ownPublishedPost.externalPostUrl).toBe("https://instagram.com/p/acme-phase-7");
    expect(ownPublishedPost).not.toHaveProperty("externalPostId");

    const draftPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        platform: "FACEBOOK",
        type: "FEED",
        status: SocialMediaPostStatus.DRAFT,
        title: `Acme draft publish block ${Date.now()}`,
        clientVisible: true,
      },
      select: { id: true },
    });

    const invalidPublishRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${draftPost.id}/mark-published`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        publishedAt: "2026-06-26T12:00:00.000Z",
      });

    expect(invalidPublishRes.status).toBe(400);

    const clientBlockedPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        platform: "LINKEDIN",
        type: "TEXT",
        status: SocialMediaPostStatus.APPROVED,
        title: `Acme client publish block ${Date.now()}`,
        clientVisible: true,
      },
      select: { id: true },
    });

    const clientPublishRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${clientBlockedPost.id}/mark-published`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        publishedAt: "2026-06-27T12:00:00.000Z",
      });

    expect(clientPublishRes.status).toBe(403);

    const outOfScopePost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId: socialClientId,
        projectId: socialProjectId,
        platform: "INSTAGRAM",
        type: "STATIC_IMAGE",
        status: SocialMediaPostStatus.APPROVED,
        title: `Mavi out of scope publish block ${Date.now()}`,
      },
      select: { id: true },
    });

    const outOfScopeScheduleRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${outOfScopePost.id}/schedule`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        scheduledAt: "2026-06-28T10:00:00.000Z",
      });

    expect([403, 404]).toContain(outOfScopeScheduleRes.status);

    const scheduledForCancel = await prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        platform: "PINTEREST",
        type: "STATIC_IMAGE",
        status: SocialMediaPostStatus.SCHEDULED,
        title: `Acme cancel scheduled ${Date.now()}`,
        scheduledAt: new Date("2026-06-29T10:00:00.000Z"),
        clientVisible: true,
      },
      select: { id: true },
    });

    const cancelRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${scheduledForCancel.id}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(cancelRes.status).toBe(201);
    expect(cancelRes.body.status).toBe(SocialMediaPostStatus.CANCELLED);
  });

  it("supports Social Media insight snapshots and client-visible reports", async () => {
    const clientSocialProject = await prisma.project.upsert({
      where: {
        clientProfileId_slug: {
          clientProfileId,
          slug: "acme-social-media-reporting",
        },
      },
      update: {
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      create: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        name: "Acme Social Media Reporting",
        slug: "acme-social-media-reporting",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    const publishedPostRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${clientProfileId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: clientSocialProject.id,
        platform: "INSTAGRAM",
        type: "REEL",
        status: "PUBLISHED",
        title: `Acme performance reel ${Date.now()}`,
        publishedAt: "2026-07-01T10:00:00.000Z",
        externalPostUrl: "https://instagram.com/p/acme-performance",
        clientVisible: true,
      });

    expect(publishedPostRes.status).toBe(201);

    const adminInsightRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${publishedPostRes.body.id}/insights`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        date: "2026-07-02T00:00:00.000Z",
        impressions: 2400,
        reach: 1800,
        likes: 210,
        comments: 24,
        shares: 18,
        saves: 33,
        clicks: 45,
        engagementRate: 18.33,
      });

    expect(adminInsightRes.status).toBe(201);
    expect(adminInsightRes.body.postId).toBe(publishedPostRes.body.id);
    expect(adminInsightRes.body.engagementRate).toBe(18.33);

    const assignedEmployeePost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId: socialClientId,
        projectId: socialProjectId,
        platform: "TIKTOK",
        type: "SHORT_VIDEO",
        status: SocialMediaPostStatus.PUBLISHED,
        title: `Mavi assigned insight ${Date.now()}`,
        publishedAt: new Date("2026-07-02T10:00:00.000Z"),
        clientVisible: true,
      },
      select: { id: true },
    });

    const assignedInsightRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${assignedEmployeePost.id}/insights`)
      .set("Authorization", `Bearer ${socialEmployeeToken}`)
      .send({
        date: "2026-07-03T00:00:00.000Z",
        impressions: 1000,
        reach: 700,
        likes: 80,
        comments: 8,
      });

    expect(assignedInsightRes.status).toBe(201);
    expect(assignedInsightRes.body.postId).toBe(assignedEmployeePost.id);

    const ownInsightsRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/insights")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(ownInsightsRes.status).toBe(200);
    const ownInsightIds = ownInsightsRes.body.data.map((insight: { id: string }) => insight.id);
    expect(ownInsightIds).toContain(adminInsightRes.body.id);
    expect(ownInsightIds).not.toContain(assignedInsightRes.body.id);
    expect(ownInsightsRes.body.meta.totals.impressions).toBeGreaterThanOrEqual(2400);
    expect(ownInsightsRes.body.meta.topPosts[0].title).toBeDefined();

    const draftReportRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${clientProfileId}/reports`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: clientSocialProject.id,
        periodStart: "2026-07-01T00:00:00.000Z",
        periodEnd: "2026-07-07T23:59:59.999Z",
        type: "WEEKLY",
        summary: "Taslak Social Media performans notu.",
        clientVisible: false,
      });

    expect(draftReportRes.status).toBe(201);
    expect(draftReportRes.body.status).toBe("DRAFT");

    const ownDraftHiddenRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/reports")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(ownDraftHiddenRes.status).toBe(200);
    expect(
      ownDraftHiddenRes.body.data.some((report: { id: string }) => report.id === draftReportRes.body.id),
    ).toBe(false);

    const publishedReportRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/reports/${draftReportRes.body.id}/publish`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(publishedReportRes.status).toBe(201);
    expect(publishedReportRes.body.status).toBe("PUBLISHED");
    expect(publishedReportRes.body.clientVisible).toBe(true);

    const acknowledgementReportRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${clientProfileId}/reports`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: clientSocialProject.id,
        periodStart: "2026-07-08T00:00:00.000Z",
        periodEnd: "2026-07-14T23:59:59.999Z",
        type: "ENGAGEMENT_REPORT",
        summary: "Client onayı istenen Social Media raporu.",
        clientVisible: true,
        requestAcknowledgement: true,
        metricsSnapshot: {
          totals: ownInsightsRes.body.meta.totals,
        },
      });

    expect(acknowledgementReportRes.status).toBe(201);
    expect(acknowledgementReportRes.body.status).toBe("PUBLISHED");
    expect(acknowledgementReportRes.body.acknowledgementStatus).toBe("PENDING");
    expect(acknowledgementReportRes.body.acknowledgementTaskId).toBeDefined();

    const ownReportsRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/reports")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(ownReportsRes.status).toBe(200);
    const ownReportIds = ownReportsRes.body.data.map((report: { id: string }) => report.id);
    expect(ownReportIds).toContain(publishedReportRes.body.id);
    expect(ownReportIds).toContain(acknowledgementReportRes.body.id);
    expect(ownReportsRes.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: acknowledgementReportRes.body.id,
          acknowledgementStatus: "PENDING",
        }),
      ]),
    );
  });

  it("keeps Social Media reports and insights assignment-scoped for employees with generic report permissions", async () => {
    const scopedPost = await prisma.socialMediaPost.create({
      data: {
        clientProfileId: socialClientId,
        projectId: socialProjectId,
        platform: "INSTAGRAM",
        type: "REEL",
        status: SocialMediaPostStatus.PUBLISHED,
        title: `Mavi report scope hardening ${Date.now()}`,
        publishedAt: new Date("2026-07-15T10:00:00.000Z"),
        clientVisible: true,
      },
      select: { id: true },
    });

    const insightListRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/insights`)
      .set("Authorization", `Bearer ${performanceToken}`);
    const reportListRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/reports`)
      .set("Authorization", `Bearer ${performanceToken}`);
    const createInsightRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${scopedPost.id}/insights`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        date: "2026-07-16T00:00:00.000Z",
        impressions: 100,
      });
    const createReportRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${socialClientId}/reports`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        periodStart: "2026-07-15T00:00:00.000Z",
        periodEnd: "2026-07-16T23:59:59.999Z",
        type: "WEEKLY",
        summary: "Should not be created by out-of-scope employee.",
      });

    expect(insightListRes.status).toBe(404);
    expect(reportListRes.status).toBe(404);
    expect(createInsightRes.status).toBe(404);
    expect(createReportRes.status).toBe(404);
  });

  it("validates Social Media report and insight date ranges", async () => {
    const invalidInsightsRangeRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${clientProfileId}/insights?from=2026-08-01&to=2026-07-01`)
      .set("Authorization", `Bearer ${adminToken}`);
    const invalidReportsRangeRes = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${clientProfileId}/reports?from=2026-08-01&to=2026-07-01`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(invalidInsightsRangeRes.status).toBe(400);
    expect(invalidReportsRangeRes.status).toBe(400);
  });

  it("out-of-scope employee cannot read another Social Media client's posts", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/social-media/clients/${socialClientId}/posts`)
      .set("Authorization", `Bearer ${performanceToken}`);

    expect(res.status).toBe(404);
  });

  it("client post endpoints only expose own client-visible posts", async () => {
    const visibleRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${clientProfileId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        platform: "INSTAGRAM",
        type: "CAROUSEL",
        status: "DRAFT",
        title: "Acme haftalık vitrin",
        clientVisible: true,
        scheduledAt: "2026-06-20T10:00:00.000Z",
      });
    const hiddenRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${clientProfileId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        platform: "FACEBOOK",
        type: "FEED",
        status: "DRAFT",
        title: "Acme iç taslak",
        clientVisible: false,
        scheduledAt: "2026-06-21T10:00:00.000Z",
      });

    expect(visibleRes.status).toBe(201);
    expect(hiddenRes.status).toBe(201);

    const listRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/posts")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(listRes.status).toBe(200);
    const returnedIds = listRes.body.map((post: { id: string }) => post.id);
    expect(returnedIds).toContain(visibleRes.body.id);
    expect(returnedIds).not.toContain(hiddenRes.body.id);
    expect(listRes.body[0]).not.toHaveProperty("createdByUserId");

    const calendarRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/calendar")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(calendarRes.status).toBe(200);
    expect(calendarRes.body.posts.some((post: { id: string }) => post.id === visibleRes.body.id))
      .toBe(true);

    const hiddenDetailRes = await request(app.getHttpServer())
      .get(`/api/v1/clients/me/social-media/posts/${hiddenRes.body.id}`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(hiddenDetailRes.status).toBe(404);

    const summaryRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/summary")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(summaryRes.status).toBe(200);
    const summaryPostIds = [
      ...summaryRes.body.contentPlan.upcomingPosts,
      ...summaryRes.body.contentPlan.recentPosts,
    ].map((post: { id: string }) => post.id);
    expect(summaryPostIds).toContain(visibleRes.body.id);
    expect(summaryPostIds).not.toContain(hiddenRes.body.id);
  });

  it("client Social Media summary excludes internal creative files", async () => {
    const clientSocialProject = await prisma.project.upsert({
      where: {
        clientProfileId_slug: {
          clientProfileId,
          slug: "acme-social-media-visibility",
        },
      },
      update: {
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
      },
      create: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        name: "Acme Social Media Visibility",
        slug: "acme-social-media-visibility",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
      },
      select: { id: true },
    });
    const uniqueSuffix = Date.now();
    const internalCreativeUrl = `https://cdn.socialtech.test/internal-social-${uniqueSuffix}.png`;
    const clientVisibleCreativeUrl = `https://cdn.socialtech.test/client-social-${uniqueSuffix}.png`;

    await prisma.projectFile.createMany({
      data: [
        {
          projectId: clientSocialProject.id,
          clientProfileId,
          serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
          category: ProjectFileCategory.ADS_CREATIVE,
          visibility: ProjectFileVisibility.INTERNAL,
          title: "Internal Social Creative",
          publicId: `internal-social-${uniqueSuffix}`,
          secureUrl: internalCreativeUrl,
          resourceType: "image",
          format: "png",
          bytes: 2048,
          mimeType: "image/png",
          originalFileName: "internal-social.png",
          uploadedByUserId: adminUserId,
        },
        {
          projectId: clientSocialProject.id,
          clientProfileId,
          serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
          category: ProjectFileCategory.ADS_CREATIVE,
          visibility: ProjectFileVisibility.CLIENT_VISIBLE,
          title: "Client Social Creative",
          publicId: `client-social-${uniqueSuffix}`,
          secureUrl: clientVisibleCreativeUrl,
          resourceType: "image",
          format: "png",
          bytes: 2048,
          mimeType: "image/png",
          originalFileName: "client-social.png",
          uploadedByUserId: adminUserId,
        },
      ],
    });

    const summaryRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/social-media/summary")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(summaryRes.status).toBe(200);
    const serializedSummary = JSON.stringify(summaryRes.body);
    expect(serializedSummary).toContain(clientVisibleCreativeUrl);
    expect(serializedSummary).not.toContain(internalCreativeUrl);
    expect(serializedSummary).not.toContain("Internal Social Creative");
  });

  it("assigned designer can attach and remove Social Media post assets", async () => {
    const postRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/clients/${socialClientId}/posts`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: socialProjectId,
        platform: "INSTAGRAM",
        type: "STATIC_IMAGE",
        status: "DESIGN",
        title: "Tasarım asset bağlantısı",
      });

    expect(postRes.status).toBe(201);

    const file = await prisma.projectFile.create({
      data: {
        projectId: socialProjectId,
        clientProfileId: socialClientId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        category: ProjectFileCategory.ADS_CREATIVE,
        visibility: ProjectFileVisibility.CLIENT_VISIBLE,
        title: "Social e2e kreatif",
        publicId: `social-e2e-${Date.now()}`,
        secureUrl: "https://cdn.socialtech.test/social-e2e.png",
        resourceType: "image",
        format: "png",
        bytes: 2048,
        mimeType: "image/png",
        originalFileName: "social-e2e.png",
        uploadedByUserId: adminUserId,
      },
      select: { id: true },
    });

    const attachRes = await request(app.getHttpServer())
      .post(`/api/v1/social-media/posts/${postRes.body.id}/assets`)
      .set("Authorization", `Bearer ${designerToken}`)
      .send({ fileId: file.id, sortOrder: 1 });

    expect(attachRes.status).toBe(201);
    expect(attachRes.body.assets).toHaveLength(1);
    expect(attachRes.body.assets[0].file.id).toBe(file.id);

    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/social-media/posts/${postRes.body.id}/assets/${attachRes.body.assets[0].id}`)
      .set("Authorization", `Bearer ${designerToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.assets).toHaveLength(0);
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
