import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AccountType,
  ClientStatus,
  EmployeeClientAssignmentScope,
  GoogleAdsConnectionStatus,
  GoogleAdsReportStatus,
  GoogleAdsReportType,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  PrismaClient,
  ProjectFileCategory,
  ProjectFileVisibility,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";
import {
  GoogleAdsApiService,
  type GoogleAdsConnectionTestResult,
  type GoogleAdsReportingSnapshotResult,
} from "../src/google-ads/google-ads-api.service";

const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const ADMIN_CLIENTS_PATH = "/api/v1/admin/clients";
const ADMIN_GOOGLE_ADS_CLIENTS_LIST_PATH = "/api/v1/admin/google-ads/clients";
const ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH = "/api/v1/admin/google-ads/sync-logs";
const CLIENTS_PATH = "/api/v1/clients";
const TASKS_PATH = "/api/v1/tasks";
const CLIENT_OWN_GOOGLE_ADS_CONFIG_PATH = "/api/v1/clients/me/google-ads/config";
const CLIENT_OWN_GOOGLE_ADS_SUMMARY_PATH = "/api/v1/clients/me/google-ads/summary";
const CLIENT_OWN_GOOGLE_ADS_CAMPAIGNS_PATH = "/api/v1/clients/me/google-ads/campaigns";
const CLIENT_OWN_GOOGLE_ADS_INSIGHTS_PATH = "/api/v1/clients/me/google-ads/insights";
const CLIENT_OWN_GOOGLE_ADS_KEYWORDS_PATH = "/api/v1/clients/me/google-ads/keywords";
const CLIENT_OWN_GOOGLE_ADS_CONVERSIONS_PATH = "/api/v1/clients/me/google-ads/conversions";
const CLIENT_OWN_GOOGLE_ADS_SEARCH_TERMS_PATH = "/api/v1/clients/me/google-ads/search-terms";
const CLIENT_OWN_GOOGLE_ADS_REPORTS_PATH = "/api/v1/clients/me/google-ads/reports";
const CLIENT_OWN_GOOGLE_ADS_SYNC_PATH = "/api/v1/clients/me/google-ads/sync";
const TEST_EMAIL_PREFIX = "authz-google-ads-";
const TEST_SLUG_PREFIX = "authz-google-ads-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const TEST_GOOGLE_ADS_TOKEN_ENCRYPTION_KEY =
  "google-ads-token-encryption-key-for-e2e-tests-0123456789";
const SENSITIVE_RESPONSE_TOKENS = [
  "refreshTokenEnc",
  "accessTokenEnc",
  "tokenHash",
  "googleAdsCredential",
] as const;

let mockGoogleAdsApiResult: GoogleAdsConnectionTestResult | null = null;
let mockGoogleAdsApiError: Error | null = null;
let mockGoogleAdsReportingSnapshot: GoogleAdsReportingSnapshotResult | null = null;
let mockGoogleAdsReportingError: Error | null = null;

type LoginBody = {
  accessToken: string;
};

describe("Google Ads Config Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let configService: ConfigService;

  let adminToken = "";
  let performanceToken = "";
  let ownClientToken = "";
  let assignedClientToken = "";

  let ownClientEmail = "";
  let assignedClientEmail = "";
  let ownGoogleAdsClientId = "";
  let assignedGoogleAdsClientId = "";
  let unassignedGoogleAdsClientId = "";
  let inactiveGoogleAdsClientId = "";
  let missingGoogleAdsClientId = "";
  let performanceUserId = "";
  let previousGoogleAdsTokenEncryptionKey: string | undefined;

  beforeAll(async () => {
    previousGoogleAdsTokenEncryptionKey = process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY;
    process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY = TEST_GOOGLE_ADS_TOKEN_ENCRYPTION_KEY;

    mockGoogleAdsApiError = null;
    mockGoogleAdsApiResult = {
      customerId: "1234567890",
      managerCustomerId: "9988776655",
      descriptiveName: "Verified Google Ads Account",
      currencyCode: "USD",
      timeZone: "America/New_York",
      grantedScopes: ["https://www.googleapis.com/auth/adwords"],
    };
    mockGoogleAdsReportingError = null;
    mockGoogleAdsReportingSnapshot = {
      customerId: "1234567890",
      managerCustomerId: "9988776655",
      descriptiveName: "Verified Google Ads Account",
      currencyCode: "USD",
      timeZone: "America/New_York",
      campaigns: [
        {
          id: "cmp-search-brand",
          name: "Search - Brand",
          channelType: "SEARCH",
          status: "ENABLED",
          servingStatus: "SERVING",
        },
      ],
      accountInsights: [
        {
          date: "2026-05-07",
          campaignId: null,
          campaignName: null,
          adGroupId: null,
          adGroupName: null,
          adId: null,
          adName: null,
          costMicros: 1_000_000,
          impressions: 1000,
          clicks: 120,
          interactions: 120,
          conversions: 12,
          conversionValue: 560,
          ctr: 12,
          averageCpc: 0.0833,
          costPerConversion: 0.0833,
          raw: {
            level: "ACCOUNT",
          },
        },
      ],
      campaignInsights: [
        {
          date: "2026-05-07",
          campaignId: "cmp-search-brand",
          campaignName: "Search - Brand",
          adGroupId: null,
          adGroupName: null,
          adId: null,
          adName: null,
          costMicros: 1_000_000,
          impressions: 1000,
          clicks: 120,
          interactions: 120,
          conversions: 12,
          conversionValue: 560,
          ctr: 12,
          averageCpc: 0.0833,
          costPerConversion: 0.0833,
          raw: {
            level: "CAMPAIGN",
            channelType: "SEARCH",
            status: "ENABLED",
            servingStatus: "SERVING",
          },
        },
      ],
      adGroupInsights: [
        {
          date: "2026-05-07",
          campaignId: "cmp-search-brand",
          campaignName: "Search - Brand",
          adGroupId: "ag-1",
          adGroupName: "Brand AdGroup",
          adId: null,
          adName: null,
          costMicros: 800_000,
          impressions: 800,
          clicks: 100,
          interactions: 100,
          conversions: 10,
          conversionValue: 500,
          ctr: 12.5,
          averageCpc: 0.08,
          costPerConversion: 0.08,
          raw: {
            level: "AD_GROUP",
          },
        },
      ],
      adInsights: [
        {
          date: "2026-05-07",
          campaignId: "cmp-search-brand",
          campaignName: "Search - Brand",
          adGroupId: "ag-1",
          adGroupName: "Brand AdGroup",
          adId: "ad-1",
          adName: "Brand Responsive Ad",
          costMicros: 700_000,
          impressions: 700,
          clicks: 90,
          interactions: 90,
          conversions: 9,
          conversionValue: 450,
          ctr: 12.86,
          averageCpc: 0.0777,
          costPerConversion: 0.0777,
          raw: {
            level: "AD",
          },
        },
      ],
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleAdsApiService)
      .useValue({
        testConnection: async () => {
          if (mockGoogleAdsApiError) {
            throw mockGoogleAdsApiError;
          }

          if (!mockGoogleAdsApiResult) {
            throw new Error("Mock Google Ads API result is not configured.");
          }

          return mockGoogleAdsApiResult;
        },
        fetchReportingSnapshot: async () => {
          if (mockGoogleAdsReportingError) {
            throw mockGoogleAdsReportingError;
          }

          if (!mockGoogleAdsReportingSnapshot) {
            throw new Error("Mock Google Ads reporting snapshot is not configured.");
          }

          return mockGoogleAdsReportingSnapshot;
        },
        normalizeError: (error: unknown) => {
          if (error instanceof Error) {
            if (/permission/i.test(error.message)) {
              return { category: "PERMISSION" as const, message: error.message };
            }

            if (/token|oauth/i.test(error.message)) {
              return { category: "AUTH" as const, message: error.message };
            }

            return { category: "NETWORK" as const, message: error.message };
          }

          return { category: "UNKNOWN" as const, message: "Unknown Google Ads API error." };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configService = app.get(ConfigService);

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

    await cleanupRuntimeFixtures();
    await setDeterministicDemoPasswords();

    const performanceUser = await prisma.user.findUnique({
      where: { email: "performance@socialtech.com" },
      select: { id: true },
    });
    if (!performanceUser) {
      throw new Error("Performance demo user was not found.");
    }
    performanceUserId = performanceUser.id;

    const fixtureSuffix = uniqueSuffix("fixtures");
    ownClientEmail = `${TEST_EMAIL_PREFIX}owner-${fixtureSuffix}@example.com`;
    assignedClientEmail = `${TEST_EMAIL_PREFIX}assigned-owner-${fixtureSuffix}@example.com`;

    const fixture = await prisma.$transaction(async (tx) => {
      const ownClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}own-${fixtureSuffix}`,
          companyName: "Google Ads Own Client",
          contactEmail: `${TEST_EMAIL_PREFIX}own-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const assignedClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}assigned-${fixtureSuffix}`,
          companyName: "Google Ads Assigned Client",
          contactEmail: `${TEST_EMAIL_PREFIX}assigned-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const unassignedClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}unassigned-${fixtureSuffix}`,
          companyName: "Google Ads Unassigned Client",
          contactEmail: `${TEST_EMAIL_PREFIX}unassigned-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const inactiveClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}inactive-${fixtureSuffix}`,
          companyName: "Google Ads Inactive Service Client",
          contactEmail: `${TEST_EMAIL_PREFIX}inactive-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const missingClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}missing-${fixtureSuffix}`,
          companyName: "Google Ads Missing Service Client",
          contactEmail: `${TEST_EMAIL_PREFIX}missing-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      await tx.clientPurchasedService.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
          {
            clientProfileId: assignedClient.id,
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
          {
            clientProfileId: unassignedClient.id,
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
          {
            clientProfileId: inactiveClient.id,
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            status: PurchasedServiceStatus.INACTIVE,
          },
        ],
      });

      await tx.clientGoogleAdsConfig.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            customerId: "111-222-3333",
            managerCustomerId: "999-888-7777",
            descriptiveName: "Own Client Ads",
            currencyCode: "TRY",
            timeZone: "Europe/Istanbul",
            connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
            lastSyncAt: new Date("2026-05-15T09:00:00.000Z"),
          },
          {
            clientProfileId: assignedClient.id,
            customerId: "444-555-6666",
            managerCustomerId: "999-000-1111",
            descriptiveName: "Assigned Client Ads",
            currencyCode: "USD",
            timeZone: "America/New_York",
            connectionStatus: GoogleAdsConnectionStatus.PENDING,
            syncError: "Awaiting OAuth consent.",
            lastSyncAt: new Date("2026-05-14T10:00:00.000Z"),
          },
        ],
      });

      await tx.clientGoogleAdsCredential.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            refreshTokenEnc: "enc-own-refresh",
            accessTokenEnc: "enc-own-access",
            tokenHash: `google-own-${randomUUID()}`,
            grantedScopes: ["https://www.googleapis.com/auth/adwords"],
            tokenExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
          },
          {
            clientProfileId: assignedClient.id,
            refreshTokenEnc: "enc-assigned-refresh",
            accessTokenEnc: "enc-assigned-access",
            tokenHash: `google-assigned-${randomUUID()}`,
            grantedScopes: ["https://www.googleapis.com/auth/adwords"],
            tokenExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
          },
        ],
      });

      await tx.user.create({
        data: {
          email: ownClientEmail,
          displayName: "Google Ads Own Client Owner",
          passwordHash: DEMO_PASSWORD_HASH,
          accountType: AccountType.CLIENT,
          role: UserRole.CLIENT_OWNER,
          status: UserStatus.ACTIVE,
          clientProfileId: ownClient.id,
        },
        select: { id: true },
      });

      await tx.user.create({
        data: {
          email: assignedClientEmail,
          displayName: "Google Ads Assigned Client Owner",
          passwordHash: DEMO_PASSWORD_HASH,
          accountType: AccountType.CLIENT,
          role: UserRole.CLIENT_OWNER,
          status: UserStatus.ACTIVE,
          clientProfileId: assignedClient.id,
        },
        select: { id: true },
      });

      await tx.employeeClientAssignment.create({
        data: {
          employeeUserId: performanceUserId,
          clientProfileId: assignedClient.id,
          scope: EmployeeClientAssignmentScope.PERFORMANCE,
          isActive: true,
        },
      });

      return {
        ownGoogleAdsClientId: ownClient.id,
        assignedGoogleAdsClientId: assignedClient.id,
        unassignedGoogleAdsClientId: unassignedClient.id,
        inactiveGoogleAdsClientId: inactiveClient.id,
        missingGoogleAdsClientId: missingClient.id,
      };
    });

    ownGoogleAdsClientId = fixture.ownGoogleAdsClientId;
    assignedGoogleAdsClientId = fixture.assignedGoogleAdsClientId;
    unassignedGoogleAdsClientId = fixture.unassignedGoogleAdsClientId;
    inactiveGoogleAdsClientId = fixture.inactiveGoogleAdsClientId;
    missingGoogleAdsClientId = fixture.missingGoogleAdsClientId;

    adminToken = (await loginWithDemoUser("admin@socialtech.com")).accessToken;
    performanceToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    ownClientToken = (await loginWithDemoUser(ownClientEmail)).accessToken;
    assignedClientToken = (await loginWithDemoUser(assignedClientEmail)).accessToken;
  });

  afterAll(async () => {
    await cleanupRuntimeFixtures();
    if (previousGoogleAdsTokenEncryptionKey === undefined) {
      delete process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY = previousGoogleAdsTokenEncryptionKey;
    }

    await prisma.$disconnect();
    await app.close();
  });

  it("admin can read Google Ads config summary without sensitive credential fields", async () => {
    const response = await request(app.getHttpServer())
      .get(adminGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        connectionStatus: GoogleAdsConnectionStatus.PENDING,
        account: {
          customerId: "444-555-6666",
          managerCustomerId: "999-000-1111",
          descriptiveName: "Assigned Client Ads",
          currencyCode: "USD",
          timeZone: "America/New_York",
        },
        syncError: "Awaiting OAuth consent.",
      }),
    );
    expect(response.body.lastSyncAt).toEqual(expect.any(String));
    expectNoSensitiveTokens(response.body);
  });

  it("admin global Google Ads clients endpoint returns managed rows without sensitive fields", async () => {
    await prisma.task.create({
      data: {
        project: {
          create: {
            clientProfileId: assignedGoogleAdsClientId,
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            name: "Google Ads Approval Project",
            slug: `${TEST_SLUG_PREFIX}approval-project-${uniqueSuffix("approval")}`,
            status: "IN_PROGRESS",
            priority: "MEDIUM",
          },
        },
        title: "Google Ads approval pending",
        status: "REVIEW",
        priority: "MEDIUM",
        type: "REVISION",
        approvalRequired: true,
        approvalStatus: "PENDING",
      },
    });

    const response = await request(app.getHttpServer())
      .get(`${ADMIN_GOOGLE_ADS_CLIENTS_LIST_PATH}?since=2026-05-07&until=2026-05-09`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        dateRange: {
          since: "2026-05-07",
          until: "2026-05-09",
        },
        meta: expect.objectContaining({
          total: expect.any(Number),
          connected: expect.any(Number),
          error: expect.any(Number),
          pendingApprovals: expect.any(Number),
        }),
      }),
    );

    const rows = response.body.data as Array<Record<string, unknown>>;
    const rowIds = rows
      .map((row) => (isRecord(row.client) && typeof row.client.id === "string" ? row.client.id : ""))
      .filter((item) => item.length > 0);

    expect(rowIds).toContain(assignedGoogleAdsClientId);
    expect(rowIds).toContain(inactiveGoogleAdsClientId);
    expectNoSensitiveTokens(response.body);
  });

  it("admin can create Google Ads campaign, budget and report approval tasks", async () => {
    const suffix = uniqueSuffix("approval-create");
    const project = await prisma.project.create({
      data: {
        clientProfileId: assignedGoogleAdsClientId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        name: "Google Ads Approval Create Project",
        slug: `${TEST_SLUG_PREFIX}approval-create-${suffix}`,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      },
      select: { id: true },
    });

    const approvalTypes: MetaAdsApprovalType[] = [
      MetaAdsApprovalType.GOOGLE_ADS_CAMPAIGN_APPROVAL,
      MetaAdsApprovalType.GOOGLE_ADS_BUDGET_CHANGE_APPROVAL,
      MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
    ];

    for (const approvalType of approvalTypes) {
      const response = await request(app.getHttpServer())
        .post(TASKS_PATH)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          projectId: project.id,
          title: `Google Ads approval ${approvalType}`,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          workstream: "FULLSTACK",
          approvalRequired: true,
          approvalType,
          approvalStatus: "PENDING",
        })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          projectId: project.id,
          approvalRequired: true,
          approvalType,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
        }),
      );
    }
  });

  it("client can approve/revise/acknowledge Google Ads approvals and admin/employee can read results", async () => {
    const suffix = uniqueSuffix("approval-response");
    const project = await prisma.project.create({
      data: {
        clientProfileId: assignedGoogleAdsClientId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        name: "Google Ads Approval Response Project",
        slug: `${TEST_SLUG_PREFIX}approval-response-${suffix}`,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      },
      select: { id: true },
    });

    const campaignTask = await prisma.task.create({
      data: {
        projectId: project.id,
        title: "Campaign launch approval",
        status: "REVIEW",
        priority: "HIGH",
        type: "REVISION",
        workstream: "FULLSTACK",
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.GOOGLE_ADS_CAMPAIGN_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
      },
      select: { id: true },
    });

    const budgetTask = await prisma.task.create({
      data: {
        projectId: project.id,
        title: "Budget increase approval",
        status: "REVIEW",
        priority: "HIGH",
        type: "REVISION",
        workstream: "FULLSTACK",
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.GOOGLE_ADS_BUDGET_CHANGE_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
      },
      select: { id: true },
    });

    const reportTask = await prisma.task.create({
      data: {
        projectId: project.id,
        title: "Weekly report acknowledgement",
        status: "REVIEW",
        priority: "MEDIUM",
        type: "QA",
        workstream: "FULLSTACK",
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
      },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${campaignTask.id}`)
      .set("Authorization", `Bearer ${assignedClientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(200);

    const budgetResponse = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${budgetTask.id}`)
      .set("Authorization", `Bearer ${assignedClientToken}`)
      .send({
        approvalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
        approvalResponseNote: "Bütçe artış yüzdesini düşürelim.",
      })
      .expect(200);

    expect(budgetResponse.body).toEqual(
      expect.objectContaining({
        id: budgetTask.id,
        approvalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
        approvalResponseNote: "Bütçe artış yüzdesini düşürelim.",
      }),
    );

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${reportTask.id}`)
      .set("Authorization", `Bearer ${assignedClientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.ACKNOWLEDGED })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${campaignTask.id}`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(404);

    const autoRevisionTask = await prisma.task.findFirst({
      where: {
        projectId: project.id,
        type: "REVISION",
        approvalRequired: false,
        approvalContext: {
          path: ["sourceApprovalTaskId"],
          equals: budgetTask.id,
        },
      },
      select: {
        id: true,
        approvalContext: true,
      },
    });

    expect(autoRevisionTask?.id).toEqual(expect.any(String));
    expect(autoRevisionTask?.approvalContext).toEqual(
      expect.objectContaining({
        sourceApprovalTaskId: budgetTask.id,
        sourceApprovalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
      }),
    );

    const adminReadResponse = await request(app.getHttpServer())
      .get(`${TASKS_PATH}?projectId=${project.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const performanceReadResponse = await request(app.getHttpServer())
      .get(`${TASKS_PATH}?projectId=${project.id}`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(Array.isArray(adminReadResponse.body)).toBe(true);
    expect(Array.isArray(performanceReadResponse.body)).toBe(true);

    const adminStatuses = new Map<string, string>(
      (adminReadResponse.body as Array<Record<string, unknown>>)
        .filter((row) => typeof row.id === "string")
        .map((row) => [String(row.id), String(row.approvalStatus ?? "")]),
    );
    const performanceStatuses = new Map<string, string>(
      (performanceReadResponse.body as Array<Record<string, unknown>>)
        .filter((row) => typeof row.id === "string")
        .map((row) => [String(row.id), String(row.approvalStatus ?? "")]),
    );

    expect(adminStatuses.get(campaignTask.id)).toBe(MetaAdsApprovalStatus.APPROVED);
    expect(adminStatuses.get(budgetTask.id)).toBe(MetaAdsApprovalStatus.CHANGES_REQUESTED);
    expect(adminStatuses.get(reportTask.id)).toBe(MetaAdsApprovalStatus.ACKNOWLEDGED);

    expect(performanceStatuses.get(campaignTask.id)).toBe(MetaAdsApprovalStatus.APPROVED);
    expect(performanceStatuses.get(budgetTask.id)).toBe(MetaAdsApprovalStatus.CHANGES_REQUESTED);
    expect(performanceStatuses.get(reportTask.id)).toBe(MetaAdsApprovalStatus.ACKNOWLEDGED);
  });

  it("client project files endpoint hides internal creative assets", async () => {
    const suffix = uniqueSuffix("creative-visibility");
    const project = await prisma.project.create({
      data: {
        clientProfileId: assignedGoogleAdsClientId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        name: "Google Ads Creative Visibility Project",
        slug: `${TEST_SLUG_PREFIX}creative-visibility-${suffix}`,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      },
      select: { id: true },
    });

    await prisma.projectFile.createMany({
      data: [
        {
          projectId: project.id,
          clientProfileId: assignedGoogleAdsClientId,
          title: "Internal Creative",
          originalFileName: "internal-creative.png",
          publicId: `internal-${suffix}`,
          secureUrl: "https://example.com/internal-creative.png",
          resourceType: "image",
          format: "png",
          bytes: 1024,
          mimeType: "image/png",
          category: ProjectFileCategory.ADS_CREATIVE,
          visibility: ProjectFileVisibility.INTERNAL,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.GOOGLE_ADS_CREATIVE_APPROVAL,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          uploadedByUserId: performanceUserId,
        },
        {
          projectId: project.id,
          clientProfileId: assignedGoogleAdsClientId,
          title: "Client Creative",
          originalFileName: "client-creative.png",
          publicId: `client-${suffix}`,
          secureUrl: "https://example.com/client-creative.png",
          resourceType: "image",
          format: "png",
          bytes: 1024,
          mimeType: "image/png",
          category: ProjectFileCategory.ADS_CREATIVE,
          visibility: ProjectFileVisibility.CLIENT_VISIBLE,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.GOOGLE_ADS_CREATIVE_APPROVAL,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          uploadedByUserId: performanceUserId,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${project.id}/files?category=ADS_CREATIVE&approvalRequired=true`)
      .set("Authorization", `Bearer ${assignedClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
      }),
    );

    const rows = response.body.data as Array<Record<string, unknown>>;
    expect(rows.some((row) => row.title === "Internal Creative")).toBe(false);
    expect(rows.some((row) => row.title === "Client Creative")).toBe(true);
  });

  it("admin manual connect stores encrypted token/hash and returns token-safe response", async () => {
    const rawRefreshToken = "manual-refresh-token-for-google-ads-tests-123456";
    const rawAccessToken = "manual-access-token-for-google-ads-tests-123456";

    const response = await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: rawRefreshToken,
        accessToken: rawAccessToken,
        customerId: "555-444-3333",
        managerCustomerId: "111-222-3333",
        descriptiveName: "Manual Connected Account",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        grantedScopes: ["https://www.googleapis.com/auth/adwords"],
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        hasActiveService: true,
        connectionStatus: GoogleAdsConnectionStatus.PENDING,
        credential: expect.objectContaining({
          hasRefreshToken: true,
          grantedScopes: ["https://www.googleapis.com/auth/adwords"],
        }),
      }),
    );
    expectNoSensitiveTokens(response.body);

    const credential = await prisma.clientGoogleAdsCredential.findUnique({
      where: { clientProfileId: assignedGoogleAdsClientId },
      select: {
        refreshTokenEnc: true,
        accessTokenEnc: true,
        tokenHash: true,
      },
    });

    expect(credential?.refreshTokenEnc).toEqual(expect.any(String));
    expect(credential?.accessTokenEnc).toEqual(expect.any(String));
    expect(credential?.tokenHash).toEqual(expect.any(String));
    expect(credential?.refreshTokenEnc).not.toBe(rawRefreshToken);
    expect(credential?.accessTokenEnc).not.toBe(rawAccessToken);
    expect(credential?.tokenHash).not.toContain(rawRefreshToken);
  });

  it("manual connect fails when GOOGLE_ADS_TOKEN_ENCRYPTION_KEY is missing", async () => {
    const originalGet = configService.get.bind(configService);
    const configGetSpy = jest
      .spyOn(configService, "get")
      .mockImplementation((key: string) => {
        if (key === "GOOGLE_ADS_TOKEN_ENCRYPTION_KEY") {
          return undefined;
        }

        return originalGet(key);
      });

    try {
      const response = await request(app.getHttpServer())
        .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          refreshToken: "refresh-token-should-fail-with-missing-key-123456",
        })
        .expect(500);

      expectApiError(response.body, /GOOGLE_ADS_TOKEN_ENCRYPTION_KEY/i);
    } finally {
      configGetSpy.mockRestore();
    }
  });

  it("admin can run connection test successfully with mocked Google Ads API", async () => {
    mockGoogleAdsApiError = null;
    mockGoogleAdsApiResult = {
      customerId: "1231231231",
      managerCustomerId: "7777777777",
      descriptiveName: "Verified Connection Account",
      currencyCode: "EUR",
      timeZone: "Europe/Berlin",
      grantedScopes: ["https://www.googleapis.com/auth/adwords"],
    };

    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "stored-refresh-token-for-test-connection-123456",
        customerId: "1231231231",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(adminGoogleAdsTestConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["https://www.googleapis.com/auth/adwords"],
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        account: {
          customerId: "1231231231",
          managerCustomerId: "7777777777",
          descriptiveName: "Verified Connection Account",
          currencyCode: "EUR",
          timeZone: "Europe/Berlin",
        },
        grantedScopes: ["https://www.googleapis.com/auth/adwords"],
      }),
    );
    expect(response.body.connection).toEqual(
      expect.objectContaining({
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
      }),
    );
    expectNoSensitiveTokens(response.body);
  });

  it("test connection permission error is normalized and marks connection as ERROR", async () => {
    mockGoogleAdsApiError = new Error("Missing permission: googleads.accounts.read");

    const errorResponse = await request(app.getHttpServer())
      .post(adminGoogleAdsTestConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["https://www.googleapis.com/auth/adwords"],
      })
      .expect(403);

    expectApiError(errorResponse.body, /izinleri eksik|yetersiz/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminGoogleAdsConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(GoogleAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/izinleri eksik|yetersiz/i);
    mockGoogleAdsApiError = null;
  });

  it("test connection token error is normalized and marks connection as ERROR", async () => {
    mockGoogleAdsApiError = new Error("OAuth token expired.");

    const errorResponse = await request(app.getHttpServer())
      .post(adminGoogleAdsTestConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["https://www.googleapis.com/auth/adwords"],
      })
      .expect(400);

    expectApiError(errorResponse.body, /token/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminGoogleAdsConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(GoogleAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/token/i);
    mockGoogleAdsApiError = null;
  });

  it("disconnect clears tokens and marks config as DISCONNECTED", async () => {
    const response = await request(app.getHttpServer())
      .post(adminGoogleAdsDisconnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        connectionStatus: GoogleAdsConnectionStatus.DISCONNECTED,
        credential: expect.objectContaining({
          hasRefreshToken: false,
          grantedScopes: [],
        }),
      }),
    );
    expectNoSensitiveTokens(response.body);

    const credential = await prisma.clientGoogleAdsCredential.findUnique({
      where: { clientProfileId: assignedGoogleAdsClientId },
      select: {
        refreshTokenEnc: true,
        accessTokenEnc: true,
        tokenHash: true,
      },
    });

    expect(credential?.refreshTokenEnc).toBeNull();
    expect(credential?.accessTokenEnc).toBeNull();
    expect(credential?.tokenHash).toBeNull();
  });

  it("client own endpoint includes hasActiveService and omits sensitive token fields", async () => {
    const response = await request(app.getHttpServer())
      .get(CLIENT_OWN_GOOGLE_ADS_CONFIG_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        hasActiveService: true,
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
        account: {
          customerId: "111-222-3333",
          managerCustomerId: "999-888-7777",
          descriptiveName: "Own Client Ads",
          currencyCode: "TRY",
          timeZone: "Europe/Istanbul",
        },
      }),
    );
    expect(response.body.lastSyncAt).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty("credential");
    expectNoSensitiveTokens(response.body);
  });

  it("admin sync writes reporting snapshot and reporting endpoints read from snapshots", async () => {
    mockGoogleAdsReportingError = null;
    mockGoogleAdsReportingSnapshot = {
      customerId: "1234567890",
      managerCustomerId: "9988776655",
      descriptiveName: "Synced Google Ads Account",
      currencyCode: "USD",
      timeZone: "America/New_York",
      campaigns: [
        {
          id: "cmp-search-brand",
          name: "Search - Brand",
          channelType: "SEARCH",
          status: "ENABLED",
          servingStatus: "SERVING",
        },
      ],
      accountInsights: [
        {
          date: "2026-05-07",
          campaignId: null,
          campaignName: null,
          adGroupId: null,
          adGroupName: null,
          adId: null,
          adName: null,
          costMicros: 2_000_000,
          impressions: 2000,
          clicks: 200,
          interactions: 200,
          conversions: 20,
          conversionValue: 800,
          ctr: 10,
          averageCpc: 0.1,
          costPerConversion: 0.1,
          raw: { level: "ACCOUNT" },
        },
      ],
      campaignInsights: [
        {
          date: "2026-05-07",
          campaignId: "cmp-search-brand",
          campaignName: "Search - Brand",
          adGroupId: null,
          adGroupName: null,
          adId: null,
          adName: null,
          costMicros: 2_000_000,
          impressions: 2000,
          clicks: 200,
          interactions: 200,
          conversions: 20,
          conversionValue: 800,
          ctr: 10,
          averageCpc: 0.1,
          costPerConversion: 0.1,
          raw: {
            level: "CAMPAIGN",
            channelType: "SEARCH",
            status: "ENABLED",
            servingStatus: "SERVING",
          },
        },
      ],
      adGroupInsights: [],
      adInsights: [],
    };

    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "sync-refresh-token-for-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    const syncResponse = await request(app.getHttpServer())
      .post(`${adminGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(syncResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        inserted: expect.objectContaining({
          account: 1,
          campaigns: 1,
        }),
        syncStatus: expect.any(String),
      }),
    );

    const summaryResponse = await request(app.getHttpServer())
      .get(`${adminGoogleAdsSummaryPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(summaryResponse.body).toEqual(
      expect.objectContaining({
        cost: 2,
        impressions: 2000,
        clicks: 200,
        conversions: 20,
        ctr: 10,
      }),
    );

    const campaignsResponse = await request(app.getHttpServer())
      .get(`${adminGoogleAdsCampaignsPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(campaignsResponse.body.data)).toBe(true);
    expect(campaignsResponse.body.data[0]).toEqual(
      expect.objectContaining({
        id: "cmp-search-brand",
        channelType: "SEARCH",
        status: "ENABLED",
      }),
    );

    const insightsResponse = await request(app.getHttpServer())
      .get(
        `${adminGoogleAdsInsightsPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07&level=CAMPAIGN`,
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(insightsResponse.body.level).toBe("CAMPAIGN");
    expect(Array.isArray(insightsResponse.body.data)).toBe(true);
    expect(insightsResponse.body.data.length).toBeGreaterThan(0);
  });

  it("admin can read sync logs and run retry sync endpoint", async () => {
    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "retry-sync-refresh-token-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${adminGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    const retryResponse = await request(app.getHttpServer())
      .post(`${adminGoogleAdsRetrySyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(retryResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        syncStatus: expect.any(String),
      }),
    );

    const logsResponse = await request(app.getHttpServer())
      .get(`${ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH}?clientProfileId=${assignedGoogleAdsClientId}&limit=20`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(logsResponse.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        meta: expect.objectContaining({
          total: expect.any(Number),
          failed: expect.any(Number),
          running: expect.any(Number),
          skipped: expect.any(Number),
        }),
      }),
    );

    const rows = Array.isArray(logsResponse.body.data)
      ? (logsResponse.body.data as Array<Record<string, unknown>>)
      : [];
    expect(
      rows.some(
        (row) =>
          row.clientProfileId === assignedGoogleAdsClientId &&
          (row.status === "SUCCESS" || row.status === "PARTIAL"),
      ),
    ).toBe(true);
  });

  it("sync logs endpoint validates pagination limit boundaries", async () => {
    const response = await request(app.getHttpServer())
      .get(`${ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH}?limit=101`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expectApiError(response.body, /limit must not be greater than 100/i);
  });

  it("own sync uses TTL and returns SKIPPED during cooldown window", async () => {
    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(ownGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "own-sync-refresh-token-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    await prisma.clientGoogleAdsConfig.update({
      where: { clientProfileId: ownGoogleAdsClientId },
      data: {
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
        customerId: "1234567890",
        managerCustomerId: "9988776655",
        lastSyncAt: new Date(),
      },
    });

    const ownSyncResponse = await request(app.getHttpServer())
      .post(CLIENT_OWN_GOOGLE_ADS_SYNC_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(201);

    expect(ownSyncResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        syncStatus: "SKIPPED",
        skippedReason: expect.any(String),
      }),
    );

    const logsResponse = await request(app.getHttpServer())
      .get(
        `${ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH}?clientProfileId=${ownGoogleAdsClientId}&status=SKIPPED&limit=10`,
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const rows = Array.isArray(logsResponse.body.data)
      ? (logsResponse.body.data as Array<Record<string, unknown>>)
      : [];
    expect(
      rows.some(
        (row) =>
          row.clientProfileId === ownGoogleAdsClientId && row.errorCode === "SYNC_TTL_ACTIVE",
      ),
    ).toBe(true);
  });

  it("normalizes sync errors into expected admin error codes", async () => {
    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "sync-error-normalization-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    const scenarios: Array<{
      message: string;
      expectedStatus: number;
      expectedCode: string;
    }> = [
      {
        message: "OAuth token expired for this customer.",
        expectedStatus: 400,
        expectedCode: "TOKEN_EXPIRED",
      },
      {
        message: "Permission denied for this customer.",
        expectedStatus: 403,
        expectedCode: "PERMISSION_DENIED",
      },
      {
        message: "Invalid customer id format.",
        expectedStatus: 400,
        expectedCode: "INVALID_CUSTOMER_ID",
      },
      {
        message: "GAQL query error: field campaign.fake not found.",
        expectedStatus: 400,
        expectedCode: "GAQL_QUERY_ERROR",
      },
    ];

    for (const scenario of scenarios) {
      mockGoogleAdsReportingError = new Error(scenario.message);

      const response = await request(app.getHttpServer())
        .post(`${adminGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(scenario.expectedStatus);

      expectApiError(response.body, /Google Ads|izin|token|customer|GAQL/i);

      const logsResponse = await request(app.getHttpServer())
        .get(`${ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH}?clientProfileId=${assignedGoogleAdsClientId}&failedOnly=true&limit=20`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const rows = Array.isArray(logsResponse.body.data)
        ? (logsResponse.body.data as Array<Record<string, unknown>>)
        : [];
      expect(
        rows.some(
          (row) =>
            row.clientProfileId === assignedGoogleAdsClientId &&
            row.status === "FAILED" &&
            row.errorCode === scenario.expectedCode,
        ),
      ).toBe(true);
    }

    mockGoogleAdsReportingError = null;
  });

  it("redacts token-like fragments from admin sync errors and sync logs", async () => {
    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "sync-error-redaction-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    const leakedTokenFragment = "ya29.leakedsensitivefragment";
    mockGoogleAdsReportingError = new Error(
      `Unhandled upstream error while fetching snapshot ${leakedTokenFragment}`,
    );

    const syncResponse = await request(app.getHttpServer())
      .post(`${adminGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(502);

    expectApiError(syncResponse.body, /Google Ads API hatası/i);
    const syncErrorText = JSON.stringify(syncResponse.body);
    expect(syncErrorText).toContain("[REDACTED]");
    expect(syncErrorText).not.toContain(leakedTokenFragment);

    const logsResponse = await request(app.getHttpServer())
      .get(`${ADMIN_GOOGLE_ADS_SYNC_LOGS_PATH}?clientProfileId=${assignedGoogleAdsClientId}&failedOnly=true&limit=20`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const rows = Array.isArray(logsResponse.body.data)
      ? (logsResponse.body.data as Array<Record<string, unknown>>)
      : [];
    const failedRow = rows.find(
      (row) =>
        row.clientProfileId === assignedGoogleAdsClientId &&
        row.status === "FAILED" &&
        typeof row.errorMessage === "string",
    );

    expect(failedRow).toBeDefined();
    const logErrorMessage = String(failedRow?.errorMessage ?? "");
    expect(logErrorMessage).toContain("[REDACTED]");
    expect(logErrorMessage).not.toContain(leakedTokenFragment);

    mockGoogleAdsReportingError = null;
  });

  it("admin can create draft/published Google Ads reports and request acknowledgement", async () => {
    const suffix = uniqueSuffix("google-ads-report-admin");
    const project = await prisma.project.create({
      data: {
        clientProfileId: assignedGoogleAdsClientId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        name: "Google Ads Report Admin Project",
        slug: `${TEST_SLUG_PREFIX}report-admin-${suffix}`,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      },
      select: { id: true },
    });

    const draftResponse = await request(app.getHttpServer())
      .post(adminGoogleAdsReportsPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: project.id,
        periodStart: "2026-05-01T00:00:00.000Z",
        periodEnd: "2026-05-07T23:59:59.999Z",
        type: GoogleAdsReportType.SEARCH_TERMS,
        summary: "Search terms kalite kontrol raporu.",
      })
      .expect(201);

    expect(draftResponse.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        projectId: project.id,
        type: GoogleAdsReportType.SEARCH_TERMS,
        status: GoogleAdsReportStatus.DRAFT,
        clientVisible: false,
        acknowledgementStatus: "NOT_REQUESTED",
      }),
    );

    const publishedResponse = await request(app.getHttpServer())
      .post(adminGoogleAdsReportsPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: project.id,
        periodStart: "2026-05-08T00:00:00.000Z",
        periodEnd: "2026-05-15T23:59:59.999Z",
        type: GoogleAdsReportType.KEYWORD_PERFORMANCE,
        summary: "Keyword performance raporu.",
        clientVisible: true,
        requestAcknowledgement: true,
      })
      .expect(201);

    expect(publishedResponse.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        type: GoogleAdsReportType.KEYWORD_PERFORMANCE,
        status: GoogleAdsReportStatus.PUBLISHED,
        clientVisible: true,
        acknowledgementStatus: "PENDING",
        acknowledgementTaskId: expect.any(String),
      }),
    );

    const acknowledgementTaskId = publishedResponse.body.acknowledgementTaskId as string;
    const task = await prisma.task.findUnique({
      where: { id: acknowledgementTaskId },
      select: {
        approvalType: true,
        approvalStatus: true,
      },
    });

    expect(task).toEqual(
      expect.objectContaining({
        approvalType: MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
      }),
    );

    const archiveResponse = await request(app.getHttpServer())
      .patch(adminGoogleAdsReportByIdPath(draftResponse.body.id as string))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: GoogleAdsReportStatus.ARCHIVED,
      })
      .expect(200);

    expect(archiveResponse.body).toEqual(
      expect.objectContaining({
        status: GoogleAdsReportStatus.ARCHIVED,
        clientVisible: false,
      }),
    );
  });

  it("assigned employee can create reports in assigned scope and unassigned scope is denied", async () => {
    const suffix = uniqueSuffix("google-ads-report-assigned");
    const project = await prisma.project.create({
      data: {
        clientProfileId: assignedGoogleAdsClientId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        name: "Google Ads Report Assigned Project",
        slug: `${TEST_SLUG_PREFIX}report-assigned-${suffix}`,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
      },
      select: { id: true },
    });

    const assignedCreateResponse = await request(app.getHttpServer())
      .post(assignedGoogleAdsReportsPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        projectId: project.id,
        periodStart: "2026-05-01T00:00:00.000Z",
        periodEnd: "2026-05-07T23:59:59.999Z",
        type: GoogleAdsReportType.WEEKLY,
        summary: "Assigned weekly Google Ads raporu.",
      })
      .expect(201);

    expect(assignedCreateResponse.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        status: GoogleAdsReportStatus.DRAFT,
      }),
    );

    await request(app.getHttpServer())
      .post(assignedGoogleAdsReportsPath(unassignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .send({
        periodStart: "2026-05-01T00:00:00.000Z",
        periodEnd: "2026-05-07T23:59:59.999Z",
        type: GoogleAdsReportType.WEEKLY,
      })
      .expect(404);
  });

  it("own client reports endpoint returns only own client-visible reports", async () => {
    await prisma.googleAdsReport.createMany({
      data: [
        {
          clientProfileId: ownGoogleAdsClientId,
          periodStart: new Date("2026-05-01T00:00:00.000Z"),
          periodEnd: new Date("2026-05-07T23:59:59.999Z"),
          type: GoogleAdsReportType.WEEKLY,
          status: GoogleAdsReportStatus.DRAFT,
          summary: "Own draft report",
          clientVisible: false,
        },
        {
          clientProfileId: ownGoogleAdsClientId,
          periodStart: new Date("2026-05-08T00:00:00.000Z"),
          periodEnd: new Date("2026-05-14T23:59:59.999Z"),
          type: GoogleAdsReportType.SEARCH_TERMS,
          status: GoogleAdsReportStatus.PUBLISHED,
          summary: "Own visible report",
          clientVisible: true,
        },
        {
          clientProfileId: assignedGoogleAdsClientId,
          periodStart: new Date("2026-05-08T00:00:00.000Z"),
          periodEnd: new Date("2026-05-14T23:59:59.999Z"),
          type: GoogleAdsReportType.KEYWORD_PERFORMANCE,
          status: GoogleAdsReportStatus.PUBLISHED,
          summary: "Other client visible report",
          clientVisible: true,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get(CLIENT_OWN_GOOGLE_ADS_REPORTS_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        meta: expect.objectContaining({
          total: expect.any(Number),
          clientVisible: expect.any(Number),
        }),
      }),
    );

    const rows = response.body.data as Array<Record<string, unknown>>;
    expect(rows.length).toBeGreaterThan(0);
    expect(
      rows.some((row) => row.clientProfileId === ownGoogleAdsClientId && row.clientVisible === true),
    ).toBe(true);
    expect(rows.some((row) => row.clientProfileId === ownGoogleAdsClientId && row.clientVisible === false)).toBe(false);
    expect(rows.some((row) => row.clientProfileId === assignedGoogleAdsClientId)).toBe(false);
  });

  it("client own reporting endpoints return summary, campaigns and insights", async () => {
    const summaryResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_SUMMARY_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(summaryResponse.body).toEqual(
      expect.objectContaining({
        cost: expect.any(Number),
        impressions: expect.any(Number),
        clicks: expect.any(Number),
      }),
    );

    const campaignsResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_CAMPAIGNS_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(Array.isArray(campaignsResponse.body.data)).toBe(true);

    const insightsResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_INSIGHTS_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(insightsResponse.body).toEqual(
      expect.objectContaining({
        level: "ACCOUNT",
        data: expect.any(Array),
      }),
    );

    const keywordsResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_KEYWORDS_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(Array.isArray(keywordsResponse.body.data)).toBe(true);

    const conversionsResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_CONVERSIONS_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(Array.isArray(conversionsResponse.body.data)).toBe(true);

    const searchTermsResponse = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_SEARCH_TERMS_PATH}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(Array.isArray(searchTermsResponse.body.data)).toBe(true);
  });

  it("reporting endpoints enforce max 90-day date range validation", async () => {
    const response = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_GOOGLE_ADS_SUMMARY_PATH}?since=2026-01-01&until=2026-05-07`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(400);

    expectApiError(response.body, /cannot exceed 90 days/i);
  });

  it("client own sync returns only safe error messages when API fails", async () => {
    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(ownGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "own-safe-error-refresh-token-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    await prisma.clientGoogleAdsConfig.update({
      where: { clientProfileId: ownGoogleAdsClientId },
      data: {
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
        lastSyncAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });

    mockGoogleAdsReportingError = new Error("OAuth token expired for this customer.");

    const ownSyncErrorResponse = await request(app.getHttpServer())
      .post(CLIENT_OWN_GOOGLE_ADS_SYNC_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(400);

    expectApiError(ownSyncErrorResponse.body, /Bağlantı problemi var, ekibimiz ilgileniyor/i);
    const serializedBody = JSON.stringify(ownSyncErrorResponse.body);
    expect(serializedBody).not.toMatch(/oauth|token expired/i);

    const ownConfigResponse = await request(app.getHttpServer())
      .get(CLIENT_OWN_GOOGLE_ADS_CONFIG_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(ownConfigResponse.body.syncError).toBe("Bağlantı problemi var, ekibimiz ilgileniyor.");
    mockGoogleAdsReportingError = null;
  });

  it("assigned employee can read assigned summary and unassigned scope is denied", async () => {
    const assignedResponse = await request(app.getHttpServer())
      .get(`${assignedGoogleAdsSummaryPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(assignedResponse.body).toEqual(
      expect.objectContaining({
        cost: expect.any(Number),
        impressions: expect.any(Number),
      }),
    );

    await request(app.getHttpServer())
      .get(`${assignedGoogleAdsSummaryPath(unassignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);
  });

  it("assigned employee can read assigned keywords/conversions/search terms endpoints", async () => {
    const keywordsResponse = await request(app.getHttpServer())
      .get(`${assignedGoogleAdsKeywordsPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(Array.isArray(keywordsResponse.body.data)).toBe(true);

    const conversionsResponse = await request(app.getHttpServer())
      .get(
        `${assignedGoogleAdsConversionsPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`,
      )
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(Array.isArray(conversionsResponse.body.data)).toBe(true);

    const searchTermsResponse = await request(app.getHttpServer())
      .get(
        `${assignedGoogleAdsSearchTermsPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`,
      )
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(Array.isArray(searchTermsResponse.body.data)).toBe(true);

    await request(app.getHttpServer())
      .get(`${assignedGoogleAdsKeywordsPath(unassignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);
  });

  it("assigned employee can trigger sync in assigned scope", async () => {
    await request(app.getHttpServer())
      .post(`${assignedGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(
        `${assignedGoogleAdsSyncPath(unassignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`,
      )
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);
  });

  it("sync error is normalized and marks connection as ERROR", async () => {
    mockGoogleAdsReportingError = new Error("Google Ads quota exceeded.");

    await request(app.getHttpServer())
      .post(adminGoogleAdsManualConnectPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: "sync-refresh-token-error-google-ads-tests-123456",
        customerId: "1234567890",
        managerCustomerId: "9988776655",
      })
      .expect(201);

    const syncErrorResponse = await request(app.getHttpServer())
      .post(`${adminGoogleAdsSyncPath(assignedGoogleAdsClientId)}?since=2026-05-07&until=2026-05-07`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(502);

    expectApiError(syncErrorResponse.body, /rate limit|Google Ads API hatası/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminGoogleAdsConnectionPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(GoogleAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/rate limit|Google Ads API hatası/i);
    mockGoogleAdsReportingError = null;
  });

  it("assigned employee can read assigned Google Ads config and unassigned scope is denied", async () => {
    const assignedResponse = await request(app.getHttpServer())
      .get(assignedGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(assignedResponse.body).toEqual(
      expect.objectContaining({
        clientProfileId: assignedGoogleAdsClientId,
        connectionStatus: expect.any(String),
      }),
    );
    expectNoSensitiveTokens(assignedResponse.body);

    await request(app.getHttpServer())
      .get(assignedGoogleAdsConfigPath(unassignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);
  });

  it("admin patch requires active service and at least one field", async () => {
    const emptyPayloadResponse = await request(app.getHttpServer())
      .patch(adminGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expectApiError(emptyPayloadResponse.body, /at least one config field/i);

    const inactiveResponse = await request(app.getHttpServer())
      .patch(adminGoogleAdsConfigPath(inactiveGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ connectionStatus: GoogleAdsConnectionStatus.CONNECTED })
      .expect(400);

    expectApiError(inactiveResponse.body, /ACTIVE GOOGLE_ADS purchased service/i);

    const missingResponse = await request(app.getHttpServer())
      .patch(adminGoogleAdsConfigPath(missingGoogleAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ connectionStatus: GoogleAdsConnectionStatus.CONNECTED })
      .expect(400);

    expectApiError(missingResponse.body, /ACTIVE GOOGLE_ADS purchased service/i);
  });

  it("forbidden and unauthorized role cases are enforced", async () => {
    await request(app.getHttpServer())
      .get(adminGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .expect(401);

    await request(app.getHttpServer())
      .get(adminGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(assignedGoogleAdsConfigPath(assignedGoogleAdsClientId))
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(403);
  });

  it("non-admin users cannot access global Google Ads clients endpoint", async () => {
    await request(app.getHttpServer())
      .get(ADMIN_GOOGLE_ADS_CLIENTS_LIST_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(403);
  });

  it("admin client create/update contract supports googleAdsConfig and clients read includes safe summary", async () => {
    const suffix = uniqueSuffix("create-update");
    const createdResponse = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Google Ads Admin Contract ${suffix}`,
        slug: `${TEST_SLUG_PREFIX}contract-${suffix}`,
        status: ClientStatus.ACTIVE,
        purchasedServices: [
          {
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
        ],
        googleAdsConfig: {
          customerId: "321-321-3210",
          descriptiveName: "Contract Client",
          currencyCode: "TRY",
          timeZone: "Europe/Istanbul",
          connectionStatus: GoogleAdsConnectionStatus.PENDING,
        },
      })
      .expect(201);

    expect(createdResponse.body.googleAdsConfig).toEqual(
      expect.objectContaining({
        customerId: "321-321-3210",
        descriptiveName: "Contract Client",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        connectionStatus: GoogleAdsConnectionStatus.PENDING,
      }),
    );
    expectNoSensitiveTokens(createdResponse.body);

    const createdClientId = createdResponse.body.id as string;

    const updatedResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${createdClientId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        googleAdsConfig: {
          managerCustomerId: "111-111-1111",
          connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
        },
      })
      .expect(200);

    expect(updatedResponse.body.googleAdsConfig).toEqual(
      expect.objectContaining({
        customerId: "321-321-3210",
        managerCustomerId: "111-111-1111",
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
      }),
    );

    const clientReadResponse = await request(app.getHttpServer())
      .get(`${CLIENTS_PATH}/${createdClientId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(clientReadResponse.body.googleAdsConfig).toEqual(
      expect.objectContaining({
        customerId: "321-321-3210",
        managerCustomerId: "111-111-1111",
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
      }),
    );
    expectNoSensitiveTokens(clientReadResponse.body);
  });

  async function loginWithDemoUser(email: string): Promise<LoginBody> {
    const response = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email,
      password: DEMO_PASSWORD,
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );

    return response.body as LoginBody;
  }

  async function setDeterministicDemoPasswords(): Promise<void> {
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com"],
        },
      },
      data: {
        passwordHash: DEMO_PASSWORD_HASH,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async function cleanupRuntimeFixtures(): Promise<void> {
    const clientProfiles = await prisma.clientProfile.findMany({
      where: {
        slug: {
          startsWith: TEST_SLUG_PREFIX,
        },
      },
      select: {
        id: true,
      },
    });

    const clientProfileIds = clientProfiles.map((clientProfile) => clientProfile.id);

    if (clientProfileIds.length > 0) {
      await prisma.employeeClientAssignment.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.clientGoogleAdsCredential.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.clientGoogleAdsConfig.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.clientPurchasedService.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });
    }

    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    });

    await prisma.clientProfile.deleteMany({
      where: {
        slug: {
          startsWith: TEST_SLUG_PREFIX,
        },
      },
    });
  }

  function adminGoogleAdsConfigPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/config`;
  }

  function adminGoogleAdsConnectionPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/connection`;
  }

  function adminGoogleAdsManualConnectPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/connect/manual`;
  }

  function adminGoogleAdsDisconnectPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/disconnect`;
  }

  function adminGoogleAdsTestConnectionPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/test-connection`;
  }

  function adminGoogleAdsSyncPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/sync`;
  }

  function adminGoogleAdsRetrySyncPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/sync/retry`;
  }

  function adminGoogleAdsSummaryPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/summary`;
  }

  function adminGoogleAdsCampaignsPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/campaigns`;
  }

  function adminGoogleAdsInsightsPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/insights`;
  }

  function adminGoogleAdsReportsPath(clientId: string): string {
    return `${ADMIN_CLIENTS_PATH}/${clientId}/google-ads/reports`;
  }

  function adminGoogleAdsReportByIdPath(reportId: string): string {
    return `/api/v1/admin/google-ads/reports/${reportId}`;
  }

  function assignedGoogleAdsConfigPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/config`;
  }

  function assignedGoogleAdsSummaryPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/summary`;
  }

  function assignedGoogleAdsKeywordsPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/keywords`;
  }

  function assignedGoogleAdsConversionsPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/conversions`;
  }

  function assignedGoogleAdsSearchTermsPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/search-terms`;
  }

  function assignedGoogleAdsReportsPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/reports`;
  }

  function assignedGoogleAdsSyncPath(clientId: string): string {
    return `/api/v1/google-ads/clients/${clientId}/sync`;
  }

  function expectNoSensitiveTokens(value: unknown): void {
    const serialized = JSON.stringify(value);
    for (const token of SENSITIVE_RESPONSE_TOKENS) {
      expect(serialized).not.toMatch(new RegExp(token, "i"));
    }
  }

  function expectApiError(body: unknown, expectedMessage: RegExp = /.+/): void {
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

  function extractApiErrorMessage(body: Record<string, unknown>): string {
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

  function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function uniqueSuffix(label: string): string {
    return `${label}-${randomUUID().slice(0, 8)}`;
  }
});
