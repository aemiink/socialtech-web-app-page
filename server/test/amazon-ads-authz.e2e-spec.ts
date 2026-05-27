import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  AmazonAdsConnectionStatus,
  AmazonAdsInsightLevel,
  AmazonAdsProductType,
  AmazonAdsRegion,
  AmazonAdsSyncStatus,
  EmployeeClientAssignmentScope,
  PrismaClient,
  PurchasedServiceKey,
  PurchasedServiceStatus,
} from "@prisma/client";
import request from "supertest";
import {
  AmazonAdsApiService,
  NormalizedAmazonAdsApiError,
} from "../src/amazon-ads/amazon-ads-api.service";
import { AppModule } from "../src/app.module";

const DEMO_PASSWORD = "demo123";
const TEST_TOKEN_ENCRYPTION_KEY = "amazon-ads-token-encryption-key-for-e2e-tests";
const TEST_REFRESH_TOKEN = "amazon-refresh-token-for-e2e-tests-0123456789";
const TEST_ACCESS_TOKEN = "amazon-access-token-for-e2e-tests-0123456789";
const TEST_OAUTH_CODE = "amazon-oauth-code-for-e2e-tests";
const TEST_LWA_CLIENT_ID = "amzn1.application-oa2-client.e2e";
const TEST_LWA_CLIENT_SECRET = "amazon-lwa-client-secret-for-e2e-tests";
const TEST_REDIRECT_URI = "http://localhost:4000/api/v1/amazon-ads/oauth/callback";
const SENSITIVE_RESPONSE_TOKENS = [
  "accessTokenEnc",
  "refreshTokenEnc",
  "tokenHash",
  TEST_REFRESH_TOKEN,
  TEST_ACCESS_TOKEN,
] as const;

describe("Amazon Ads Config Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;
  let clientProfileId: string;
  let mockAmazonAdsConnectionError: NormalizedAmazonAdsApiError | null = null;
  let previousEnv: Partial<Record<string, string | undefined>>;

  const mockProfile = {
    profileId: "amzn1.profile.e2e",
    advertiserAccountId: "ENTITY-CONNECTED-E2E",
    marketplaceId: "ATVPDKIKX0DER",
    region: AmazonAdsRegion.NA,
    countryCode: "US",
    currencyCode: "USD",
    timezone: "America/Los_Angeles",
    accountType: "seller",
    accountName: "Amazon Ads Connected E2E",
    validPaymentMethod: true,
  };

  beforeAll(async () => {
    previousEnv = {
      AMAZON_ADS_TOKEN_ENCRYPTION_KEY: process.env.AMAZON_ADS_TOKEN_ENCRYPTION_KEY,
      AMAZON_ADS_LWA_CLIENT_ID: process.env.AMAZON_ADS_LWA_CLIENT_ID,
      AMAZON_ADS_LWA_CLIENT_SECRET: process.env.AMAZON_ADS_LWA_CLIENT_SECRET,
      AMAZON_ADS_REDIRECT_URI: process.env.AMAZON_ADS_REDIRECT_URI,
      AMAZON_ADS_OAUTH_SCOPES: process.env.AMAZON_ADS_OAUTH_SCOPES,
      AMAZON_ADS_DEFAULT_REGION: process.env.AMAZON_ADS_DEFAULT_REGION,
    };
    process.env.AMAZON_ADS_TOKEN_ENCRYPTION_KEY = TEST_TOKEN_ENCRYPTION_KEY;
    process.env.AMAZON_ADS_LWA_CLIENT_ID = TEST_LWA_CLIENT_ID;
    process.env.AMAZON_ADS_LWA_CLIENT_SECRET = TEST_LWA_CLIENT_SECRET;
    process.env.AMAZON_ADS_REDIRECT_URI = TEST_REDIRECT_URI;
    process.env.AMAZON_ADS_OAUTH_SCOPES = "advertising::campaign_management";
    process.env.AMAZON_ADS_DEFAULT_REGION = "NA";

    const amazonAdsApiMock = {
      createAuthorizationUrl: jest.fn(
        ({ clientId, state }: { clientId: string; state: string }) => ({
          authorizationUrl: `https://www.amazon.com/ap/oa?client_id=${clientId}&state=${state}`,
          redirectUri: TEST_REDIRECT_URI,
          scopes: ["advertising::campaign_management"],
        }),
      ),
      exchangeAuthorizationCode: jest.fn(async () => ({
        accessToken: TEST_ACCESS_TOKEN,
        refreshToken: TEST_REFRESH_TOKEN,
        accessTokenExpiresAt: new Date("2030-01-01T00:00:00.000Z"),
        grantedScopes: ["advertising::campaign_management"],
      })),
      testConnection: jest.fn(async () => {
        if (mockAmazonAdsConnectionError) {
          throw new Error(mockAmazonAdsConnectionError.message);
        }

        return {
          accessToken: TEST_ACCESS_TOKEN,
          refreshToken: TEST_REFRESH_TOKEN,
          accessTokenExpiresAt: new Date("2030-01-01T00:00:00.000Z"),
          grantedScopes: ["advertising::campaign_management"],
          selectedProfile: mockProfile,
          profiles: [mockProfile],
        };
      }),
      fetchReportingSnapshot: jest.fn(async () => ({
        rows: [
          {
            date: "2026-05-01",
            level: AmazonAdsInsightLevel.CAMPAIGN,
            entityId: "campaign-1",
            entityName: "Sponsored Products Test",
            adProduct: AmazonAdsProductType.SPONSORED_PRODUCTS,
            spend: 100,
            impressions: 10000,
            clicks: 200,
            sales: 500,
            orders: 25,
            unitsSold: 30,
            ctr: 2,
            cpc: 0.5,
            acos: 20,
            roas: 5,
            conversionRate: 12.5,
            raw: {
              campaignId: "campaign-1",
              campaignName: "Sponsored Products Test",
              campaignStatus: "ENABLED",
            },
          },
          {
            date: "2026-05-01",
            level: AmazonAdsInsightLevel.SEARCH_TERM,
            entityId: "search-term-1",
            entityName: "wireless headphones",
            adProduct: AmazonAdsProductType.SPONSORED_PRODUCTS,
            spend: 10,
            impressions: 1000,
            clicks: 20,
            sales: 60,
            orders: 3,
            unitsSold: 3,
            ctr: 2,
            cpc: 0.5,
            acos: 16.67,
            roas: 6,
            conversionRate: 15,
            raw: { searchTerm: "wireless headphones" },
          },
          {
            date: "2026-05-01",
            level: AmazonAdsInsightLevel.PRODUCT,
            entityId: "B000TESTASIN",
            entityName: "Test ASIN",
            adProduct: AmazonAdsProductType.SPONSORED_PRODUCTS,
            spend: 25,
            impressions: 2500,
            clicks: 50,
            sales: 200,
            orders: 10,
            unitsSold: 12,
            ctr: 2,
            cpc: 0.5,
            acos: 12.5,
            roas: 8,
            conversionRate: 20,
            raw: {
              advertisedAsin: "B000TESTASIN",
              advertisedSku: "SKU-TEST",
              productName: "Test ASIN",
            },
          },
        ],
        reportRequests: [
          {
            key: "spCampaigns",
            reportTypeId: "spCampaigns",
            reportId: "report-1",
            status: "REQUESTED",
          },
        ],
        reportStatuses: [
          {
            key: "spCampaigns",
            reportId: "report-1",
            status: "COMPLETED",
            rows: 3,
          },
        ],
        apiCallCount: 3,
      })),
      normalizeError: jest.fn((error: unknown) => {
        if (mockAmazonAdsConnectionError) {
          return mockAmazonAdsConnectionError;
        }

        return {
          category: "UNKNOWN",
          message: error instanceof Error ? error.message : "Unexpected mock Amazon Ads error.",
        };
      }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AmazonAdsApiService)
      .useValue(amazonAdsApiMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();

    prisma = new PrismaClient();
    await prisma.$connect();

    adminToken = await loginAndGetAccessToken(app, "admin@socialtech.com", DEMO_PASSWORD);
    employeeToken = await loginAndGetAccessToken(
      app,
      "performance@socialtech.com",
      DEMO_PASSWORD,
    );
    clientToken = await loginAndGetAccessToken(app, "client@socialtech.com", DEMO_PASSWORD);

    const meRes = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);
    clientProfileId = meRes.body.clientProfile?.id;

    if (clientProfileId) {
      await prisma.clientPurchasedService.upsert({
        where: {
          clientProfileId_serviceKey: {
            clientProfileId,
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
        },
        update: {
          status: PurchasedServiceStatus.ACTIVE,
        },
        create: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.AMAZON_ADS,
          status: PurchasedServiceStatus.ACTIVE,
        },
      });

      const employee = await prisma.user.findUnique({
        where: { email: "performance@socialtech.com" },
        select: { id: true },
      });

      if (employee) {
        await prisma.employeeClientAssignment.upsert({
          where: {
            employeeUserId_clientProfileId_scope: {
              employeeUserId: employee.id,
              clientProfileId,
              scope: EmployeeClientAssignmentScope.PERFORMANCE,
            },
          },
          update: { isActive: true },
          create: {
            employeeUserId: employee.id,
            clientProfileId,
            scope: EmployeeClientAssignmentScope.PERFORMANCE,
            isActive: true,
          },
        });
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("admin can read and update amazon ads config without token leakage", async () => {
    if (!clientProfileId) return;

    const readRes = await request(app.getHttpServer())
      .get(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/connection`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.connectionStatus).toBe(AmazonAdsConnectionStatus.NOT_CONNECTED);
    expectResponseHasNoSensitiveTokenData(readRes.body);

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/config`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        profileId: "amzn1.profile.test",
        advertiserAccountId: "ENTITY123456789",
        marketplaceId: "ATVPDKIKX0DER",
        region: "NA",
        countryCode: "us",
        currencyCode: "usd",
        timezone: "America/Los_Angeles",
        accountType: "seller",
        accountName: "Amazon Ads E2E",
        validPaymentMethod: true,
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.ids.advertiserAccountId).toBe("ENTITY123456789");
    expect(updateRes.body.settings.countryCode).toBe("US");
    expect(updateRes.body.settings.currencyCode).toBe("USD");
    expect(updateRes.body.account.validPaymentMethod).toBe(true);
    expectResponseHasNoSensitiveTokenData(updateRes.body);
  });

  it("assigned employee and client can read only their safe amazon ads config", async () => {
    if (!clientProfileId) return;

    const employeeRes = await request(app.getHttpServer())
      .get(`/api/v1/amazon-ads/clients/${clientProfileId}/config`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(employeeRes.status).toBe(200);
    expect(employeeRes.body.ids.advertiserAccountId).toBe("ENTITY123456789");
    expectResponseHasNoSensitiveTokenData(employeeRes.body);

    const clientRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/amazon-ads/config")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(clientRes.status).toBe(200);
    expect(clientRes.body.advertiserAccountId).toBe("ENTITY123456789");
    expect(clientRes.body.hasConfig).toBe(true);
    expectResponseHasNoSensitiveTokenData(clientRes.body);
  });

  it("client cannot access admin amazon ads connection endpoint", async () => {
    if (!clientProfileId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/connection`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  it("client cannot access admin amazon ads global clients endpoint", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/admin/amazon-ads/clients")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  it("rejects manual amazon ads connection when token encryption key is missing", async () => {
    if (!clientProfileId) return;

    process.env.AMAZON_ADS_TOKEN_ENCRYPTION_KEY = "";
    const res = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/connect/manual`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: TEST_REFRESH_TOKEN,
        region: "NA",
      });
    process.env.AMAZON_ADS_TOKEN_ENCRYPTION_KEY = TEST_TOKEN_ENCRYPTION_KEY;

    expect(res.status).toBe(500);
  });

  it("admin can store amazon ads manual refresh token without leaking secrets", async () => {
    if (!clientProfileId) return;

    const connectRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/connect/manual`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: TEST_REFRESH_TOKEN,
        profileId: "amzn1.profile.manual",
        advertiserAccountId: "ENTITY-MANUAL-E2E",
        marketplaceId: "ATVPDKIKX0DER",
        region: "NA",
        countryCode: "us",
        currencyCode: "usd",
        accountName: "Amazon Ads Manual E2E",
        grantedScopes: ["advertising::campaign_management"],
      });

    expect(connectRes.status).toBe(201);
    expect(connectRes.body.connectionStatus).toBe(AmazonAdsConnectionStatus.PENDING);
    expect(connectRes.body.credential.hasRefreshToken).toBe(true);
    expectResponseHasNoSensitiveTokenData(connectRes.body);

    const credential = await prisma.clientAmazonAdsCredential.findUnique({
      where: { clientProfileId },
      select: { accessTokenEnc: true, refreshTokenEnc: true, tokenHash: true },
    });
    expect(credential?.refreshTokenEnc).toBeTruthy();
    expect(credential?.refreshTokenEnc).not.toBe(TEST_REFRESH_TOKEN);
    expect(credential?.refreshTokenEnc).not.toContain(TEST_REFRESH_TOKEN);
    expect(credential?.accessTokenEnc).toBeNull();
    expect(credential?.tokenHash).toBeTruthy();
  });

  it("admin can test amazon ads connection from stored refresh token", async () => {
    if (!clientProfileId) return;

    const testRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/test-connection`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        profileId: mockProfile.profileId,
        region: "NA",
      });

    expect(testRes.status).toBe(201);
    expect(testRes.body.success).toBe(true);
    expect(testRes.body.connection.connectionStatus).toBe(AmazonAdsConnectionStatus.CONNECTED);
    expect(testRes.body.connection.ids.advertiserAccountId).toBe(
      mockProfile.advertiserAccountId,
    );
    expect(testRes.body.connection.credential.hasAccessToken).toBe(true);
    expectResponseHasNoSensitiveTokenData(testRes.body);
  });

  it("normalizes amazon ads permission failures and marks connection as error", async () => {
    if (!clientProfileId) return;

    mockAmazonAdsConnectionError = {
      category: "PERMISSION",
      message: "Missing Amazon Ads profile access.",
      statusCode: 403,
    };
    const testRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/test-connection`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        refreshToken: TEST_REFRESH_TOKEN,
        profileId: mockProfile.profileId,
        region: "NA",
      });
    mockAmazonAdsConnectionError = null;

    expect(testRes.status).toBe(403);

    const config = await prisma.clientAmazonAdsConfig.findUnique({
      where: { clientProfileId },
      select: { connectionStatus: true, syncError: true },
    });
    expect(config?.connectionStatus).toBe(AmazonAdsConnectionStatus.ERROR);
    expect(config?.syncError).toBe("Missing Amazon Ads profile access.");
  });

  it("admin can start and exchange amazon ads oauth connection", async () => {
    if (!clientProfileId) return;

    const startRes = await request(app.getHttpServer())
      .get(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/oauth/start?region=NA`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(startRes.status).toBe(200);
    expect(startRes.body.authorizationUrl).toContain(TEST_LWA_CLIENT_ID);
    expect(startRes.body.redirectUri).toBe(TEST_REDIRECT_URI);
    expect(startRes.body.state).toBeTruthy();

    const exchangeRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/oauth/exchange`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: TEST_OAUTH_CODE,
        profileId: mockProfile.profileId,
        region: "NA",
      });
    expect(exchangeRes.status).toBe(201);
    expect(exchangeRes.body.connection.connectionStatus).toBe(
      AmazonAdsConnectionStatus.CONNECTED,
    );
    expect(exchangeRes.body.profile.profileId).toBe(mockProfile.profileId);
    expectResponseHasNoSensitiveTokenData(exchangeRes.body);
  });

  it("admin can sync amazon ads reporting snapshots and safe readers can query them", async () => {
    if (!clientProfileId) return;

    const syncRes = await request(app.getHttpServer())
      .post(
        `/api/v1/admin/clients/${clientProfileId}/amazon-ads/sync?since=2026-05-01&until=2026-05-01`,
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(syncRes.status).toBe(201);
    expect(syncRes.body.success).toBe(true);
    expect(syncRes.body.syncStatus).toBe(AmazonAdsSyncStatus.SUCCESS);
    expect(syncRes.body.inserted).toEqual({
      account: 1,
      campaigns: 1,
      products: 1,
      searchTerms: 1,
      total: 4,
    });
    expectResponseHasNoSensitiveTokenData(syncRes.body);

    const adminSummaryRes = await request(app.getHttpServer())
      .get(
        `/api/v1/admin/clients/${clientProfileId}/amazon-ads/summary?since=2026-05-01&until=2026-05-01`,
      )
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminSummaryRes.status).toBe(200);
    expect(adminSummaryRes.body.spend).toBe(100);
    expect(adminSummaryRes.body.sales).toBe(500);
    expect(adminSummaryRes.body.orders).toBe(25);
    expect(adminSummaryRes.body.acos).toBe(20);
    expect(adminSummaryRes.body.roas).toBe(5);
    expectResponseHasNoSensitiveTokenData(adminSummaryRes.body);

    const adminCampaignsRes = await request(app.getHttpServer())
      .get(
        `/api/v1/admin/clients/${clientProfileId}/amazon-ads/campaigns?since=2026-05-01&until=2026-05-01`,
      )
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminCampaignsRes.status).toBe(200);
    expect(adminCampaignsRes.body.data).toHaveLength(1);
    expect(adminCampaignsRes.body.data[0].name).toBe("Sponsored Products Test");

    const employeeSummaryRes = await request(app.getHttpServer())
      .get(
        `/api/v1/amazon-ads/clients/${clientProfileId}/summary?since=2026-05-01&until=2026-05-01`,
      )
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(employeeSummaryRes.status).toBe(200);
    expect(employeeSummaryRes.body.spend).toBe(100);
    expectResponseHasNoSensitiveTokenData(employeeSummaryRes.body);

    const clientSummaryRes = await request(app.getHttpServer())
      .get("/api/v1/clients/me/amazon-ads/summary?since=2026-05-01&until=2026-05-01")
      .set("Authorization", `Bearer ${clientToken}`);
    expect(clientSummaryRes.status).toBe(200);
    expect(clientSummaryRes.body.clicks).toBe(200);
    expectResponseHasNoSensitiveTokenData(clientSummaryRes.body);

    const snapshotCount = await prisma.amazonAdsDailyInsight.count({
      where: { clientProfileId },
    });
    expect(snapshotCount).toBeGreaterThanOrEqual(4);
  });

  it("admin can read amazon ads global clients list without token leakage", async () => {
    if (!clientProfileId) return;

    const res = await request(app.getHttpServer())
      .get("/api/v1/admin/amazon-ads/clients?since=2026-05-01&until=2026-05-01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);

    const targetRow = res.body.data.find(
      (row: { client: { id: string } }) => row.client.id === clientProfileId,
    );
    expect(targetRow).toBeDefined();
    expect(targetRow.connectionStatus).toBe(AmazonAdsConnectionStatus.CONNECTED);
    expect(targetRow.spendSummary.spend).toBe(100);
    expect(targetRow.spendSummary.sales).toBe(500);
    expect(targetRow.spendSummary.acos).toBe(20);
    expect(targetRow.spendSummary.roas).toBe(5);
    expectResponseHasNoSensitiveTokenData(res.body);
  });

  it("admin can disconnect amazon ads credentials", async () => {
    if (!clientProfileId) return;

    const disconnectRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/clients/${clientProfileId}/amazon-ads/disconnect`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(disconnectRes.status).toBe(201);
    expect(disconnectRes.body.connectionStatus).toBe(
      AmazonAdsConnectionStatus.DISCONNECTED,
    );
    expect(disconnectRes.body.credential.hasRefreshToken).toBe(false);
    expect(disconnectRes.body.credential.hasAccessToken).toBe(false);
    expectResponseHasNoSensitiveTokenData(disconnectRes.body);

    const credential = await prisma.clientAmazonAdsCredential.findUnique({
      where: { clientProfileId },
      select: { accessTokenEnc: true, refreshTokenEnc: true, tokenHash: true },
    });
    expect(credential?.accessTokenEnc).toBeNull();
    expect(credential?.refreshTokenEnc).toBeNull();
    expect(credential?.tokenHash).toBeNull();
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

function expectResponseHasNoSensitiveTokenData(payload: unknown): void {
  const serializedPayload = JSON.stringify(payload);
  for (const sensitiveToken of SENSITIVE_RESPONSE_TOKENS) {
    expect(serializedPayload).not.toContain(sensitiveToken);
  }
}
