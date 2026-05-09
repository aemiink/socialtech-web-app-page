import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AccountType,
  ClientStatus,
  EmployeeClientAssignmentScope,
  MetaAdsConnectionStatus,
  PrismaClient,
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
  MetaAdsApiService,
  type MetaAdsConnectionTestResult,
  type MetaAdsReportingSnapshotResult,
} from "../src/meta-ads/meta-ads-api.service";

const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const CLIENT_OWN_META_ADS_CONFIG_PATH = "/api/v1/clients/me/meta-ads/config";
const CLIENT_OWN_META_ADS_SUMMARY_PATH = "/api/v1/clients/me/meta-ads/summary";
const CLIENT_OWN_META_ADS_ADSETS_PATH = "/api/v1/clients/me/meta-ads/adsets";
const CLIENT_OWN_META_ADS_PIXEL_STATUS_PATH = "/api/v1/clients/me/meta-ads/pixel-status";
const ASSIGNED_META_ADS_CONFIG_PATH = "/api/v1/meta-ads/clients";
const ASSIGNED_META_ADS_REPORTING_PATH = "/api/v1/meta-ads/clients";
const ADMIN_META_ADS_CONNECTION_PATH_PREFIX = "/api/v1/admin/clients";
const ADMIN_META_ADS_CLIENTS_LIST_PATH = "/api/v1/admin/meta-ads/clients";
const ADMIN_META_ADS_SYNC_LOGS_PATH = "/api/v1/admin/meta-ads/sync-logs";
const CLIENT_OWN_META_ADS_SYNC_PATH = "/api/v1/clients/me/meta-ads/sync";
const TEST_EMAIL_PREFIX = "authz-meta-ads-";
const TEST_SLUG_PREFIX = "authz-meta-ads-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const TEST_META_TOKEN_ENCRYPTION_KEY = "meta-token-encryption-key-for-e2e-tests-0123456789";
const SENSITIVE_RESPONSE_TOKENS = [
  "accessTokenEnc",
  "tokenHash",
  "metaAdsCredential",
  "refreshToken",
] as const;

let mockMetaAdsApiResult: MetaAdsConnectionTestResult | null = null;
let mockMetaAdsApiError: Error | null = null;
let mockMetaAdsReportingResult: MetaAdsReportingSnapshotResult | null = null;
let mockMetaAdsReportingError: Error | null = null;

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

describe("Meta Ads Config Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let performanceToken = "";
  let ownClientToken = "";

  let ownClientEmail = "";
  let ownMetaAdsClientId = "";
  let activeMetaAdsClientId = "";
  let inactiveMetaAdsClientId = "";
  let missingMetaAdsClientId = "";
  let performanceUserId = "";
  let previousMetaTokenEncryptionKey: string | undefined;

  beforeAll(async () => {
    previousMetaTokenEncryptionKey = process.env.META_TOKEN_ENCRYPTION_KEY;
    process.env.META_TOKEN_ENCRYPTION_KEY = TEST_META_TOKEN_ENCRYPTION_KEY;
    mockMetaAdsApiResult = {
      adAccountId: "act-test-12345",
      currency: "TRY",
      timezone: "Europe/Istanbul",
      grantedScopes: ["ads_read", "business_management"],
    };
    mockMetaAdsApiError = null;
    mockMetaAdsReportingResult = buildMockMetaAdsReportingSnapshot();
    mockMetaAdsReportingError = null;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MetaAdsApiService)
      .useValue({
        testConnection: async () => {
          if (mockMetaAdsApiError) {
            throw mockMetaAdsApiError;
          }

          if (!mockMetaAdsApiResult) {
            throw new Error("Mock Meta Ads API result is not configured.");
          }

          return mockMetaAdsApiResult;
        },
        fetchReportingSnapshot: async () => {
          if (mockMetaAdsReportingError) {
            throw mockMetaAdsReportingError;
          }

          if (!mockMetaAdsReportingResult) {
            throw new Error("Mock Meta Ads reporting snapshot is not configured.");
          }

          return mockMetaAdsReportingResult;
        },
        normalizeError: (error: unknown) => {
          if (error instanceof Error) {
            if (/permission/i.test(error.message)) {
              return { category: "PERMISSION" as const, message: error.message };
            }

            if (/token/i.test(error.message)) {
              return { category: "AUTH" as const, message: error.message };
            }

            return { category: "NETWORK" as const, message: error.message };
          }

          return { category: "UNKNOWN" as const, message: "Unknown Meta API error." };
        },
      })
      .compile();

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

    const fixture = await prisma.$transaction(async (tx) => {
      const ownClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}own-${fixtureSuffix}`,
          companyName: "Meta Ads Own Client",
          contactEmail: `${TEST_EMAIL_PREFIX}own-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const activeClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}active-${fixtureSuffix}`,
          companyName: "Meta Ads Active Client",
          contactEmail: `${TEST_EMAIL_PREFIX}active-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const inactiveClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}inactive-${fixtureSuffix}`,
          companyName: "Meta Ads Inactive Client",
          contactEmail: `${TEST_EMAIL_PREFIX}inactive-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      const missingClient = await tx.clientProfile.create({
        data: {
          slug: `${TEST_SLUG_PREFIX}missing-${fixtureSuffix}`,
          companyName: "Meta Ads Missing Service Client",
          contactEmail: `${TEST_EMAIL_PREFIX}missing-contact-${fixtureSuffix}@example.com`,
          status: ClientStatus.ACTIVE,
        },
        select: { id: true },
      });

      await tx.clientPurchasedService.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            serviceKey: PurchasedServiceKey.META_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
          {
            clientProfileId: activeClient.id,
            serviceKey: PurchasedServiceKey.META_ADS,
            status: PurchasedServiceStatus.ACTIVE,
          },
          {
            clientProfileId: inactiveClient.id,
            serviceKey: PurchasedServiceKey.META_ADS,
            status: PurchasedServiceStatus.INACTIVE,
          },
        ],
      });

      await tx.clientMetaAdsConfig.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            connectionStatus: MetaAdsConnectionStatus.CONNECTED,
            lastSyncAt: new Date("2026-05-09T09:00:00.000Z"),
            businessId: "biz-own-001",
            adAccountId: "act-own-001",
            pixelId: "px-own-001",
            instagramAccountId: "ig-own-001",
            facebookPageId: "pg-own-001",
          },
          {
            clientProfileId: activeClient.id,
            connectionStatus: MetaAdsConnectionStatus.PENDING,
            lastSyncAt: new Date("2026-05-08T11:00:00.000Z"),
            businessId: "biz-active-001",
            adAccountId: "act-active-001",
            pixelId: "px-active-001",
            instagramAccountId: "ig-active-001",
            facebookPageId: "pg-active-001",
            syncError: "Pending token validation.",
          },
        ],
      });

      await tx.clientMetaAdsCredential.createMany({
        data: [
          {
            clientProfileId: ownClient.id,
            accessTokenEnc: "enc-own-token",
            tokenHash: `meta-ads-own-${randomUUID()}`,
            grantedScopes: ["ads_read"],
            tokenExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
          },
          {
            clientProfileId: activeClient.id,
            accessTokenEnc: "enc-active-token",
            tokenHash: `meta-ads-active-${randomUUID()}`,
            grantedScopes: ["ads_read", "business_management"],
            tokenExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
          },
        ],
      });

      await tx.metaAdsDailyInsight.create({
        data: {
          clientProfileId: ownClient.id,
          adAccountId: "act-own-001",
          date: new Date("2026-05-09T00:00:00.000Z"),
          level: "ACCOUNT",
          spend: "120.50",
          impressions: 8200,
          reach: 4100,
          clicks: 164,
          ctr: "2.000000",
          cpc: "0.734146",
          cpm: "14.695121",
          frequency: "2.000000",
          results: 11,
          costPerResult: "10.954545",
          purchaseValue: "302.10",
          roas: "2.507054",
          raw: {
            source: "fixture",
          },
        },
      });

      await tx.user.create({
        data: {
          email: ownClientEmail,
          displayName: "Meta Ads Own Client Owner",
          passwordHash: DEMO_PASSWORD_HASH,
          accountType: AccountType.CLIENT,
          role: UserRole.CLIENT_OWNER,
          status: UserStatus.ACTIVE,
          clientProfileId: ownClient.id,
        },
        select: { id: true },
      });

      await tx.employeeClientAssignment.create({
        data: {
          employeeUserId: performanceUserId,
          clientProfileId: activeClient.id,
          scope: EmployeeClientAssignmentScope.PERFORMANCE,
          isActive: true,
        },
      });

      return {
        ownMetaAdsClientId: ownClient.id,
        activeMetaAdsClientId: activeClient.id,
        inactiveMetaAdsClientId: inactiveClient.id,
        missingMetaAdsClientId: missingClient.id,
      };
    });

    ownMetaAdsClientId = fixture.ownMetaAdsClientId;
    activeMetaAdsClientId = fixture.activeMetaAdsClientId;
    inactiveMetaAdsClientId = fixture.inactiveMetaAdsClientId;
    missingMetaAdsClientId = fixture.missingMetaAdsClientId;

    adminToken = (await loginWithDemoUser("admin@socialtech.com")).accessToken;
    performanceToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    ownClientToken = (await loginWithDemoUser(ownClientEmail)).accessToken;
  });

  afterAll(async () => {
    await cleanupRuntimeFixtures();
    if (previousMetaTokenEncryptionKey === undefined) {
      delete process.env.META_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.META_TOKEN_ENCRYPTION_KEY = previousMetaTokenEncryptionKey;
    }
    await prisma.$disconnect();
    await app.close();
  });

  it("admin can read client Meta Ads config summary without sensitive fields", async () => {
    const response = await request(app.getHttpServer())
      .get(adminMetaAdsConfigPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        connectionStatus: MetaAdsConnectionStatus.PENDING,
        ids: {
          businessId: "biz-active-001",
          adAccountId: "act-active-001",
          pixelId: "px-active-001",
          instagramAccountId: "ig-active-001",
          facebookPageId: "pg-active-001",
        },
        settings: {
          currency: null,
          timezone: null,
        },
        syncError: "Pending token validation.",
      }),
    );
    expect(response.body.lastSyncAt).toEqual(expect.any(String));
    expectNoSensitiveTokens(response.body);
  });

  it("admin global Meta Ads clients endpoint returns managed rows without sensitive token fields", async () => {
    const response = await request(app.getHttpServer())
      .get(`${ADMIN_META_ADS_CLIENTS_LIST_PATH}?since=2026-05-07&until=2026-05-09`)
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

    expect(rowIds).toContain(activeMetaAdsClientId);
    expect(rowIds).toContain(inactiveMetaAdsClientId);
    expectNoSensitiveTokens(response.body);
  });

  it("admin can read sync logs with filters", async () => {
    await prisma.metaAdsSyncLog.create({
      data: {
        clientProfileId: activeMetaAdsClientId,
        adAccountId: "act-log-001",
        status: "SUCCESS",
        startedAt: new Date("2026-05-09T09:00:00.000Z"),
        finishedAt: new Date("2026-05-09T09:00:08.000Z"),
        recordsFetched: 14,
        apiCallCount: 5,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`${ADMIN_META_ADS_SYNC_LOGS_PATH}?clientProfileId=${activeMetaAdsClientId}&status=SUCCESS`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
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
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        status: "SUCCESS",
      }),
    );
  });

  it("admin can update client Meta Ads config when META_ADS service is ACTIVE", async () => {
    const response = await request(app.getHttpServer())
      .patch(adminMetaAdsConfigPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
        businessId: "biz-active-002",
        adAccountId: "act-active-002",
        pixelId: "px-active-002",
        instagramAccountId: "ig-active-002",
        facebookPageId: "pg-active-002",
        currency: "TRY",
        timezone: "Europe/Istanbul",
        lastSyncAt: "2026-05-09T10:30:00.000Z",
        syncError: null,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
        ids: {
          businessId: "biz-active-002",
          adAccountId: "act-active-002",
          pixelId: "px-active-002",
          instagramAccountId: "ig-active-002",
          facebookPageId: "pg-active-002",
        },
        settings: {
          currency: "TRY",
          timezone: "Europe/Istanbul",
        },
        syncError: null,
      }),
    );
    expect(response.body.lastSyncAt).toBe("2026-05-09T10:30:00.000Z");
    expectNoSensitiveTokens(response.body);
  });

  it("admin can read client Meta Ads connection summary without sensitive fields", async () => {
    const response = await request(app.getHttpServer())
      .get(adminMetaAdsConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        hasActiveService: true,
        credential: expect.objectContaining({
          hasToken: true,
          grantedScopes: expect.arrayContaining(["ads_read"]),
        }),
      }),
    );
    expectNoSensitiveTokens(response.body);
  });

  it("admin manual connect stores encrypted token and returns summary only", async () => {
    const rawToken = "EAAGm0PX4ZCpsBAJmanualConnectTokenForMetaAdsTests";
    const response = await request(app.getHttpServer())
      .post(adminMetaAdsManualConnectPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        accessToken: rawToken,
        adAccountId: "act-manual-123",
        businessId: "biz-manual-123",
        currency: "TRY",
        timezone: "Europe/Istanbul",
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        connectionStatus: MetaAdsConnectionStatus.PENDING,
        credential: expect.objectContaining({
          hasToken: true,
        }),
      }),
    );
    expectNoSensitiveTokens(response.body);

    const credential = await prisma.clientMetaAdsCredential.findUnique({
      where: { clientProfileId: activeMetaAdsClientId },
      select: {
        accessTokenEnc: true,
        tokenHash: true,
      },
    });

    expect(credential?.accessTokenEnc).toEqual(expect.any(String));
    expect(credential?.tokenHash).toEqual(expect.any(String));
    expect(credential?.accessTokenEnc).not.toBe(rawToken);
    expect(credential?.tokenHash).not.toContain(rawToken);
  });

  it("admin can run connection test successfully with mocked Meta API", async () => {
    mockMetaAdsApiError = null;
    mockMetaAdsApiResult = {
      adAccountId: "act-verified-456",
      currency: "USD",
      timezone: "America/New_York",
      grantedScopes: ["ads_read", "business_management"],
    };

    const response = await request(app.getHttpServer())
      .post(adminMetaAdsTestConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["ads_read"],
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        account: {
          adAccountId: "act-verified-456",
          currency: "USD",
          timezone: "America/New_York",
        },
        grantedScopes: ["ads_read", "business_management"],
      }),
    );
    expect(response.body.connection).toEqual(
      expect.objectContaining({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
      }),
    );
    expectNoSensitiveTokens(response.body);
  });

  it("test connection permission error is normalized and marks connection as ERROR", async () => {
    mockMetaAdsApiError = new Error("Missing permission: ads_read");

    const errorResponse = await request(app.getHttpServer())
      .post(adminMetaAdsTestConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["ads_read"],
      })
      .expect(403);

    expectApiError(errorResponse.body, /izinleri eksik/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminMetaAdsConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(MetaAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/izinleri eksik/i);
    mockMetaAdsApiError = null;
  });

  it("test connection token error is normalized and marks connection as ERROR", async () => {
    mockMetaAdsApiError = new Error("Token expired for this user.");

    const errorResponse = await request(app.getHttpServer())
      .post(adminMetaAdsTestConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requiredScopes: ["ads_read"],
      })
      .expect(400);

    expectApiError(errorResponse.body, /token süresi dolmuş/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminMetaAdsConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(MetaAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/token süresi dolmuş/i);
    mockMetaAdsApiError = null;
  });

  it("disconnect marks config as DISCONNECTED and clears stored token", async () => {
    const response = await request(app.getHttpServer())
      .post(adminMetaAdsDisconnectPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        connectionStatus: MetaAdsConnectionStatus.DISCONNECTED,
        credential: expect.objectContaining({
          hasToken: false,
          grantedScopes: [],
        }),
      }),
    );
    expectNoSensitiveTokens(response.body);

    const credential = await prisma.clientMetaAdsCredential.findUnique({
      where: { clientProfileId: activeMetaAdsClientId },
      select: {
        accessTokenEnc: true,
        tokenHash: true,
      },
    });

    expect(credential?.accessTokenEnc).toBeNull();
    expect(credential?.tokenHash).toBeNull();
  });

  it("assigned employee can read assigned client Meta Ads config", async () => {
    const response = await request(app.getHttpServer())
      .get(assignedMetaAdsConfigPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        connectionStatus: MetaAdsConnectionStatus.DISCONNECTED,
      }),
    );
    expectNoSensitiveTokens(response.body);
  });

  it("assigned employee cannot read unassigned client Meta Ads config", async () => {
    const response = await request(app.getHttpServer())
      .get(assignedMetaAdsConfigPath(missingMetaAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);

    expectApiError(response.body, /Client profile not found/i);
  });

  it("client own endpoint reads only current user profile and returns client-safe fields", async () => {
    const response = await request(app.getHttpServer())
      .get(CLIENT_OWN_META_ADS_CONFIG_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
        lastSyncAt: "2026-05-09T09:00:00.000Z",
      }),
    );

    expect(response.body).not.toHaveProperty("clientProfileId");
    expect(response.body).not.toHaveProperty("ids");
    expect(response.body).not.toHaveProperty("businessId");
    expect(response.body).not.toHaveProperty("adAccountId");
    expect(response.body).not.toHaveProperty("pixelId");
    expect(response.body).not.toHaveProperty("instagramAccountId");
    expect(response.body).not.toHaveProperty("facebookPageId");
    expect(response.body).not.toHaveProperty("syncError");
    expectNoSensitiveTokens(response.body);
  });

  it("client own summary endpoint returns aggregated snapshot metrics", async () => {
    const response = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_META_ADS_SUMMARY_PATH}?since=2026-05-09&until=2026-05-09`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        spend: 120.5,
        impressions: 8200,
        reach: 4100,
        clicks: 164,
        results: 11,
      }),
    );
    expect(response.body.dateRange).toEqual({
      since: "2026-05-09",
      until: "2026-05-09",
    });
  });

  it("client own adsets endpoint returns ADSET-level snapshot payload", async () => {
    const response = await request(app.getHttpServer())
      .get(`${CLIENT_OWN_META_ADS_ADSETS_PATH}?since=2026-05-09&until=2026-05-09`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        level: "ADSET",
        data: expect.any(Array),
      }),
    );
  });

  it("client own pixel-status endpoint returns client-safe integration status", async () => {
    const response = await request(app.getHttpServer())
      .get(CLIENT_OWN_META_ADS_PIXEL_STATUS_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
        adAccountId: "act-own-001",
        pixelId: "px-own-001",
        eventStatus: expect.any(String),
      }),
    );
  });

  it("client own pixel-status does not expose technical sync error details", async () => {
    await prisma.clientMetaAdsConfig.update({
      where: {
        clientProfileId: ownMetaAdsClientId,
      },
      data: {
        connectionStatus: MetaAdsConnectionStatus.ERROR,
        syncError: "Graph API stacktrace: OAuthException(190) ...",
      },
    });

    const response = await request(app.getHttpServer())
      .get(CLIENT_OWN_META_ADS_PIXEL_STATUS_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(200);

    expect(response.body.syncError).toBe("Bağlantı problemi var, ekibimiz ilgileniyor.");

    const adminResponse = await request(app.getHttpServer())
      .get(adminMetaAdsConnectionPath(ownMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(adminResponse.body.syncError).toMatch(/OAuthException/);
  });

  it("client can trigger own on-demand sync endpoint", async () => {
    mockMetaAdsReportingError = null;
    mockMetaAdsReportingResult = buildMockMetaAdsReportingSnapshot();

    await request(app.getHttpServer())
      .post(adminMetaAdsManualConnectPath(ownMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        accessToken: "EAAGm0PX4ZCpsBAJownOnDemandSyncToken",
        adAccountId: "act-reporting-001",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`${CLIENT_OWN_META_ADS_SYNC_PATH}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        syncStatus: expect.any(String),
      }),
    );
  });

  it("admin sync writes reporting snapshot and reporting endpoints read from snapshots", async () => {
    mockMetaAdsReportingError = null;
    mockMetaAdsReportingResult = buildMockMetaAdsReportingSnapshot();

    await request(app.getHttpServer())
      .post(adminMetaAdsManualConnectPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        accessToken: "EAAGm0PX4ZCpsBAJsyncAccessTokenForPhase03",
        adAccountId: "act-reporting-001",
      })
      .expect(201);

    const syncResponse = await request(app.getHttpServer())
      .post(`${adminMetaAdsSyncPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    expect(syncResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        inserted: {
          account: 2,
          campaigns: 3,
          total: 5,
        },
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
      }),
    );

    const insightCount = await prisma.metaAdsDailyInsight.count({
      where: {
        clientProfileId: activeMetaAdsClientId,
        level: {
          in: ["ACCOUNT", "CAMPAIGN"],
        },
      },
    });
    expect(insightCount).toBeGreaterThanOrEqual(5);

    const summaryResponse = await request(app.getHttpServer())
      .get(`${adminMetaAdsSummaryPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(summaryResponse.body).toEqual(
      expect.objectContaining({
        spend: 150,
        impressions: 15000,
        clicks: 300,
        ctr: 2,
        cpc: 0.5,
        cpm: 10,
        results: 30,
        costPerResult: 5,
        roas: 2.8,
      }),
    );

    const campaignsResponse = await request(app.getHttpServer())
      .get(`${adminMetaAdsCampaignsPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(campaignsResponse.body.data)).toBe(true);
    expect(campaignsResponse.body.data[0]).toEqual(
      expect.objectContaining({
        id: "12010000001",
        objective: "OUTCOME_SALES",
        status: "ACTIVE",
      }),
    );

    const insightsResponse = await request(app.getHttpServer())
      .get(
        `${adminMetaAdsInsightsPath(activeMetaAdsClientId)}?level=CAMPAIGN&since=2026-05-07&until=2026-05-08`,
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(insightsResponse.body.level).toBe("CAMPAIGN");
    expect(Array.isArray(insightsResponse.body.data)).toBe(true);
    expect(insightsResponse.body.data.length).toBeGreaterThan(0);
  });

  it("assigned employee can read assigned client Meta Ads summary", async () => {
    const response = await request(app.getHttpServer())
      .get(`${assignedMetaAdsSummaryPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        spend: 150,
        impressions: 15000,
        clicks: 300,
      }),
    );
  });

  it("assigned sync respects TTL and returns SKIPPED on rapid consecutive calls", async () => {
    mockMetaAdsReportingError = null;
    mockMetaAdsReportingResult = buildMockMetaAdsReportingSnapshot();

    await request(app.getHttpServer())
      .post(adminMetaAdsManualConnectPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        accessToken: "EAAGm0PX4ZCpsBAJassignedSyncRateLimitToken",
        adAccountId: "act-reporting-001",
      })
      .expect(201);

    const firstSyncResponse = await request(app.getHttpServer())
      .post(`${assignedMetaAdsSyncPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(201);

    expect(firstSyncResponse.body).toEqual(
      expect.objectContaining({
        success: true,
      }),
    );

    const secondSyncResponse = await request(app.getHttpServer())
      .post(`${assignedMetaAdsSyncPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(201);

    expect(secondSyncResponse.body.syncStatus).toBe("SKIPPED");
    expect(secondSyncResponse.body.skippedReason).toEqual(expect.any(String));
  });

  it("assigned employee cannot read unassigned client Meta Ads summary", async () => {
    const response = await request(app.getHttpServer())
      .get(`${assignedMetaAdsSummaryPath(missingMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(404);

    expectApiError(response.body, /Client profile not found/i);
  });

  it("client account cannot access assigned reporting endpoints", async () => {
    const response = await request(app.getHttpServer())
      .get(`${assignedMetaAdsSummaryPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("sync error is normalized and marks connection as ERROR", async () => {
    mockMetaAdsReportingError = new Error("Meta API temporary outage");

    await request(app.getHttpServer())
      .post(adminMetaAdsManualConnectPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        accessToken: "EAAGm0PX4ZCpsBAJsyncErrorTokenForPhase03",
        adAccountId: "act-reporting-001",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`${adminMetaAdsSyncPath(activeMetaAdsClientId)}?since=2026-05-07&until=2026-05-08`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(502);

    expectApiError(response.body, /Meta API temporary outage/i);

    const connectionResponse = await request(app.getHttpServer())
      .get(adminMetaAdsConnectionPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(connectionResponse.body.connectionStatus).toBe(MetaAdsConnectionStatus.ERROR);
    expect(connectionResponse.body.syncError).toMatch(/Meta API hatası/i);

    const syncLogsResponse = await request(app.getHttpServer())
      .get(`${ADMIN_META_ADS_SYNC_LOGS_PATH}?clientProfileId=${activeMetaAdsClientId}&failedOnly=true`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(syncLogsResponse.body.data[0]).toEqual(
      expect.objectContaining({
        status: "FAILED",
        errorCode: expect.any(String),
        errorMessage: expect.stringMatching(/Meta API hatası/i),
      }),
    );
    mockMetaAdsReportingError = null;
  });

  it("cross-client access to admin Meta Ads route is denied for client accounts", async () => {
    const response = await request(app.getHttpServer())
      .get(adminMetaAdsConfigPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("non-admin users cannot access the global admin Meta Ads clients endpoint", async () => {
    const response = await request(app.getHttpServer())
      .get(ADMIN_META_ADS_CLIENTS_LIST_PATH)
      .set("Authorization", `Bearer ${ownClientToken}`)
      .expect(403);

    expectApiError(response.body);
  });

  it("PATCH is blocked when META_ADS service is INACTIVE", async () => {
    const response = await request(app.getHttpServer())
      .patch(adminMetaAdsConfigPath(inactiveMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
      })
      .expect(400);

    expectApiError(response.body, /ACTIVE META_ADS purchased service/i);
  });

  it("PATCH is blocked when META_ADS service is missing", async () => {
    const response = await request(app.getHttpServer())
      .patch(adminMetaAdsConfigPath(missingMetaAdsClientId))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
      })
      .expect(400);

    expectApiError(response.body, /ACTIVE META_ADS purchased service/i);
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

      await prisma.clientMetaAdsCredential.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.metaAdsDailyInsight.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.metaAdsSyncLog.deleteMany({
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
        },
      });

      await prisma.clientMetaAdsConfig.deleteMany({
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

  function adminMetaAdsConfigPath(clientId: string): string {
    return `/api/v1/admin/clients/${clientId}/meta-ads/config`;
  }

  function adminMetaAdsConnectionPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/connection`;
  }

  function adminMetaAdsManualConnectPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/connect/manual`;
  }

  function adminMetaAdsDisconnectPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/disconnect`;
  }

  function adminMetaAdsTestConnectionPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/test-connection`;
  }

  function adminMetaAdsSyncPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/sync`;
  }

  function adminMetaAdsSummaryPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/summary`;
  }

  function adminMetaAdsCampaignsPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/campaigns`;
  }

  function adminMetaAdsInsightsPath(clientId: string): string {
    return `${ADMIN_META_ADS_CONNECTION_PATH_PREFIX}/${clientId}/meta-ads/insights`;
  }

  function assignedMetaAdsConfigPath(clientId: string): string {
    return `${ASSIGNED_META_ADS_CONFIG_PATH}/${clientId}/config`;
  }

  function assignedMetaAdsSummaryPath(clientId: string): string {
    return `${ASSIGNED_META_ADS_REPORTING_PATH}/${clientId}/summary`;
  }

  function assignedMetaAdsSyncPath(clientId: string): string {
    return `${ASSIGNED_META_ADS_REPORTING_PATH}/${clientId}/sync`;
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

  function buildMockMetaAdsReportingSnapshot(): MetaAdsReportingSnapshotResult {
    return {
      adAccountId: "act-reporting-001",
      accountInsights: [
        {
          dateStart: "2026-05-07",
          dateStop: "2026-05-07",
          campaignId: null,
          campaignName: null,
          adSetId: null,
          adSetName: null,
          adId: null,
          adName: null,
          spend: "100",
          impressions: 10000,
          reach: 5000,
          clicks: 200,
          ctr: "2.0",
          cpc: "0.5",
          cpm: "10",
          frequency: "2.0",
          actions: [{ actionType: "purchase", value: "20" }],
          costPerActionType: [{ actionType: "purchase", value: "5" }],
          actionValues: [{ actionType: "purchase", value: "300" }],
          purchaseRoas: [{ actionType: "purchase", value: "3" }],
          raw: { level: "account", day: "2026-05-07" },
        },
        {
          dateStart: "2026-05-08",
          dateStop: "2026-05-08",
          campaignId: null,
          campaignName: null,
          adSetId: null,
          adSetName: null,
          adId: null,
          adName: null,
          spend: "50",
          impressions: 5000,
          reach: 3000,
          clicks: 100,
          ctr: "2.0",
          cpc: "0.5",
          cpm: "10",
          frequency: "1.6667",
          actions: [{ actionType: "purchase", value: "10" }],
          costPerActionType: [{ actionType: "purchase", value: "5" }],
          actionValues: [{ actionType: "purchase", value: "120" }],
          purchaseRoas: [{ actionType: "purchase", value: "2.4" }],
          raw: { level: "account", day: "2026-05-08" },
        },
      ],
      campaignInsights: [
        {
          dateStart: "2026-05-07",
          dateStop: "2026-05-07",
          campaignId: "12010000001",
          campaignName: "Prospecting CBO",
          adSetId: null,
          adSetName: null,
          adId: null,
          adName: null,
          spend: "100",
          impressions: 10000,
          reach: 5000,
          clicks: 200,
          ctr: "2.0",
          cpc: "0.5",
          cpm: "10",
          frequency: "2.0",
          actions: [{ actionType: "purchase", value: "20" }],
          costPerActionType: [{ actionType: "purchase", value: "5" }],
          actionValues: [{ actionType: "purchase", value: "300" }],
          purchaseRoas: [{ actionType: "purchase", value: "3" }],
          raw: { level: "campaign", day: "2026-05-07" },
        },
        {
          dateStart: "2026-05-08",
          dateStop: "2026-05-08",
          campaignId: "12010000001",
          campaignName: "Prospecting CBO",
          adSetId: null,
          adSetName: null,
          adId: null,
          adName: null,
          spend: "50",
          impressions: 5000,
          reach: 3000,
          clicks: 100,
          ctr: "2.0",
          cpc: "0.5",
          cpm: "10",
          frequency: "1.6667",
          actions: [{ actionType: "purchase", value: "10" }],
          costPerActionType: [{ actionType: "purchase", value: "5" }],
          actionValues: [{ actionType: "purchase", value: "120" }],
          purchaseRoas: [{ actionType: "purchase", value: "2.4" }],
          raw: { level: "campaign", day: "2026-05-08" },
        },
        {
          dateStart: "2026-05-08",
          dateStop: "2026-05-08",
          campaignId: "12010000002",
          campaignName: "Retargeting",
          adSetId: null,
          adSetName: null,
          adId: null,
          adName: null,
          spend: "40",
          impressions: 3500,
          reach: 2200,
          clicks: 70,
          ctr: "2.0",
          cpc: "0.5714",
          cpm: "11.4285",
          frequency: "1.59",
          actions: [{ actionType: "purchase", value: "7" }],
          costPerActionType: [{ actionType: "purchase", value: "5.7142" }],
          actionValues: [{ actionType: "purchase", value: "96" }],
          purchaseRoas: [{ actionType: "purchase", value: "2.4" }],
          raw: { level: "campaign", day: "2026-05-08" },
        },
      ],
      adSetInsights: [],
      adInsights: [],
      campaigns: [
        {
          id: "12010000001",
          name: "Prospecting CBO",
          objective: "OUTCOME_SALES",
          status: "ACTIVE",
          effectiveStatus: "ACTIVE",
        },
        {
          id: "12010000002",
          name: "Retargeting",
          objective: "OUTCOME_TRAFFIC",
          status: "PAUSED",
          effectiveStatus: "PAUSED",
        },
      ],
    };
  }
});
