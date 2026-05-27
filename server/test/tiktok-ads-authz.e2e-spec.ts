import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  PrismaClient,
  PurchasedServiceKey,
  PurchasedServiceStatus,
} from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { TikTokAdsApiService } from "../src/tiktok-ads/tiktok-ads-api.service";
import type { TikTokAdsReportingSnapshotInput } from "../src/tiktok-ads/tiktok-ads-api.service";

const TEST_TIKTOK_TOKEN_ENCRYPTION_KEY =
  "tiktok-token-encryption-key-for-e2e-tests-0123456789";
const DEMO_PASSWORD = "demo123";
const SENSITIVE_RESPONSE_TOKENS = [
  "accessTokenEnc",
  "tokenHash",
  "refreshTokenEnc",
] as const;

describe("TikTok Ads Config Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;
  let clientProfileId: string;
  let previousTikTokTokenEncryptionKey: string | undefined;

  beforeAll(async () => {
    previousTikTokTokenEncryptionKey = process.env.TIKTOK_ADS_TOKEN_ENCRYPTION_KEY;
    process.env.TIKTOK_ADS_TOKEN_ENCRYPTION_KEY = TEST_TIKTOK_TOKEN_ENCRYPTION_KEY;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TikTokAdsApiService)
      .useValue({
        testConnection: async ({ advertiserId }: { advertiserId: string }) => ({
          advertiserId,
          advertiserName: "TikTok Test Advertiser",
          currency: "TRY",
          timezone: "Europe/Istanbul",
          grantedScopes: [],
        }),
        fetchReportingSnapshot: async (input: TikTokAdsReportingSnapshotInput) => {
          const campaignId = "campaign-123";
          const adGroupId = "adgroup-123";
          const adId = "ad-123";

          return {
            advertiserId: input.advertiserId,
            accountInsights: [
              createTikTokInsightRow({
                dateStart: input.since,
                spend: "210",
                impressions: 42000,
                reach: 22000,
                clicks: 840,
                videoViews: 18000,
                conversions: 42,
              }),
            ],
            campaignInsights: [
              createTikTokInsightRow({
                dateStart: input.since,
                campaignId,
                campaignName: "Awareness Campaign",
                spend: "210",
                impressions: 42000,
                reach: 22000,
                clicks: 840,
                videoViews: 18000,
                conversions: 42,
              }),
            ],
            adGroupInsights: [
              createTikTokInsightRow({
                dateStart: input.since,
                adGroupId,
                adGroupName: "Broad Audience",
                spend: "120",
                impressions: 24000,
                reach: 14000,
                clicks: 480,
                videoViews: 9600,
                conversions: 24,
              }),
            ],
            adInsights: [
              createTikTokInsightRow({
                dateStart: input.since,
                adId,
                adName: "Spark Creative 01",
                spend: "90",
                impressions: 18000,
                reach: 9000,
                clicks: 360,
                videoViews: 8400,
                conversions: 18,
              }),
            ],
            campaigns: [
              {
                id: campaignId,
                name: "Awareness Campaign",
                objective: "REACH",
                status: "ENABLE",
              },
            ],
          };
        },
        normalizeError: (error: unknown) => {
          if (error instanceof Error) {
            return { category: "NETWORK" as const, message: error.message };
          }

          return { category: "UNKNOWN" as const, message: "Unknown TikTok API error." };
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
    prisma = new PrismaClient();
    await prisma.$connect();

    // Login as admin
    adminToken = await loginAndGetAccessToken(app, "admin@socialtech.com", DEMO_PASSWORD);

    // Login as performance specialist
    employeeToken = await loginAndGetAccessToken(app, "performance@socialtech.com", DEMO_PASSWORD);

    // Login as client
    clientToken = await loginAndGetAccessToken(app, "client@socialtech.com", DEMO_PASSWORD);

    // Get client profile id from admin
    const meRes = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);
    clientProfileId = meRes.body.clientProfile?.id;

    if (clientProfileId) {
      await prisma.clientPurchasedService.upsert({
        where: {
          clientProfileId_serviceKey: {
            clientProfileId,
            serviceKey: PurchasedServiceKey.TIKTOK_ADS,
          },
        },
        update: {
          status: PurchasedServiceStatus.ACTIVE,
        },
        create: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.TIKTOK_ADS,
          status: PurchasedServiceStatus.ACTIVE,
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    if (previousTikTokTokenEncryptionKey === undefined) {
      delete process.env.TIKTOK_ADS_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.TIKTOK_ADS_TOKEN_ENCRYPTION_KEY = previousTikTokTokenEncryptionKey;
    }
  });

  describe("GET /admin/clients/:clientId/tiktok-ads/config", () => {
    it("admin can read tiktok ads config", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/config`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("connectionStatus");
      expect(res.body).not.toHaveProperty("accessTokenEnc");
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("unauthenticated returns 401", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer()).get(
        `/api/v1/admin/clients/${clientProfileId}/tiktok-ads/config`,
      );
      expect(res.status).toBe(401);
    });

    it("employee returns 403 on admin endpoint", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/config`)
        .set("Authorization", `Bearer ${employeeToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /admin/clients/:clientId/tiktok-ads/config", () => {
    it("admin can update tiktok ads config", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/config`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ advertiserId: "1234567890", advertiserName: "Test Advertiser" });
      expect([200, 201]).toContain(res.status);
      expect(res.body.advertiserId).toBe("1234567890");
    });

    it("client cannot update config", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/config`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ advertiserId: "malicious" });
      expect(res.status).toBe(403);
    });
  });

  describe("TikTok Ads connection management", () => {
    it("admin can read connection summary", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/connection`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.clientProfileId).toBe(clientProfileId);
      expect(res.body).toHaveProperty("credential");
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("admin can manually connect with encrypted write-only token storage", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/connect`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          accessToken: "tiktok-test-access-token-1234567890",
          advertiserId: "1234567890",
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.connectionStatus).toBe("PENDING");
      expect(res.body.ids.advertiserId).toBe("1234567890");
      expect(res.body.credential.hasToken).toBe(true);
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("employee cannot manually connect on admin endpoint", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/connect`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          accessToken: "tiktok-test-access-token-1234567890",
          advertiserId: "1234567890",
        });

      expect(res.status).toBe(403);
    });

    it("admin can test connection using stored token and mark config connected", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/test`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.account.advertiserId).toBe("1234567890");
      expect(res.body.account.advertiserName).toBe("TikTok Test Advertiser");
      expect(res.body.connection.connectionStatus).toBe("CONNECTED");
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("admin can run reporting sync and read summary/campaign/insight snapshots", async () => {
      if (!clientProfileId) return;
      const syncRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/sync`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect([200, 201]).toContain(syncRes.status);
      expect(syncRes.body.success).toBe(true);
      expect(syncRes.body.syncStatus).toBe("SUCCESS");
      expect(syncRes.body.inserted.total).toBe(4);
      expect(syncRes.body.inserted.campaigns).toBe(1);
      expectResponseHasNoSensitiveTokenData(syncRes.body);

      const summaryRes = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/summary`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.spend).toBe(210);
      expect(summaryRes.body.impressions).toBe(42000);
      expect(summaryRes.body.clicks).toBe(840);
      expect(summaryRes.body.videoViews).toBe(18000);
      expect(summaryRes.body.conversions).toBe(42);
      expectResponseHasNoSensitiveTokenData(summaryRes.body);

      const campaignsRes = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/campaigns`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(campaignsRes.status).toBe(200);
      expect(campaignsRes.body.data).toHaveLength(1);
      expect(campaignsRes.body.data[0].id).toBe("campaign-123");
      expect(campaignsRes.body.data[0].name).toBe("Awareness Campaign");
      expect(campaignsRes.body.data[0].objective).toBe("REACH");

      const insightsRes = await request(app.getHttpServer())
        .get(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/insights`)
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20", level: "CAMPAIGN" });

      expect(insightsRes.status).toBe(200);
      expect(insightsRes.body.level).toBe("CAMPAIGN");
      expect(insightsRes.body.data).toHaveLength(1);
      expect(insightsRes.body.data[0].entityId).toBe("campaign-123");
      expect(insightsRes.body.data[0].entityName).toBe("Awareness Campaign");
      expectResponseHasNoSensitiveTokenData(insightsRes.body);
    });

    it("assigned employee can read tiktok ads reporting snapshots without token data", async () => {
      if (!clientProfileId) return;
      const configRes = await request(app.getHttpServer())
        .get(`/api/v1/tiktok-ads/clients/${clientProfileId}/config`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(configRes.status).toBe(200);
      expect(configRes.body.clientProfileId).toBe(clientProfileId);
      expect(configRes.body.advertiserId).toBe("1234567890");
      expect(configRes.body).not.toHaveProperty("accessTokenEnc");
      expectResponseHasNoSensitiveTokenData(configRes.body);

      const summaryRes = await request(app.getHttpServer())
        .get(`/api/v1/tiktok-ads/clients/${clientProfileId}/summary`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.spend).toBe(210);
      expect(summaryRes.body.videoViews).toBe(18000);
      expectResponseHasNoSensitiveTokenData(summaryRes.body);

      const campaignsRes = await request(app.getHttpServer())
        .get(`/api/v1/tiktok-ads/clients/${clientProfileId}/campaigns`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(campaignsRes.status).toBe(200);
      expect(campaignsRes.body.data[0].id).toBe("campaign-123");
      expectResponseHasNoSensitiveTokenData(campaignsRes.body);

      const insightsRes = await request(app.getHttpServer())
        .get(`/api/v1/tiktok-ads/clients/${clientProfileId}/insights`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20", level: "ADGROUP" });

      expect(insightsRes.status).toBe(200);
      expect(insightsRes.body.level).toBe("ADGROUP");
      expect(insightsRes.body.data[0].entityId).toBe("adgroup-123");
      expectResponseHasNoSensitiveTokenData(insightsRes.body);
    });

    it("client cannot read assigned employee tiktok ads endpoints", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tiktok-ads/clients/${clientProfileId}/summary`)
        .set("Authorization", `Bearer ${clientToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(res.status).toBe(403);
    });

    it("client can read own tiktok ads reporting snapshots without token data", async () => {
      const freshClientToken = await loginAndGetAccessToken(
        app,
        "client@socialtech.com",
        DEMO_PASSWORD,
      );

      const summaryRes = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/summary")
        .set("Authorization", `Bearer ${freshClientToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.spend).toBe(210);
      expect(summaryRes.body.videoViews).toBe(18000);
      expectResponseHasNoSensitiveTokenData(summaryRes.body);

      const campaignsRes = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/campaigns")
        .set("Authorization", `Bearer ${freshClientToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(campaignsRes.status).toBe(200);
      expect(campaignsRes.body.data[0].id).toBe("campaign-123");
      expectResponseHasNoSensitiveTokenData(campaignsRes.body);
    });

    it("admin can read global tiktok ads client list with reporting summary", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .get("/api/v1/admin/tiktok-ads/clients")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ since: "2026-05-20", until: "2026-05-20" });

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.connected).toBeGreaterThanOrEqual(1);
      expect(res.body.dateRange).toEqual({ since: "2026-05-20", until: "2026-05-20" });

      const clientRow = res.body.data.find(
        (item: { client?: { id?: string } }) => item.client?.id === clientProfileId,
      );
      expect(clientRow).toBeDefined();
      expect(clientRow.connectionStatus).toBe("CONNECTED");
      expect(clientRow.hasToken).toBe(true);
      expect(clientRow.ids.advertiserId).toBe("1234567890");
      expect(clientRow.account.advertiserName).toBe("TikTok Test Advertiser");
      expect(clientRow.spendSummary.spend).toBe(210);
      expect(clientRow.spendSummary.videoViews).toBe(18000);
      expect(clientRow.spendSummary.conversions).toBe(42);
      expect(clientRow.assignedEmployees).toEqual(expect.any(Array));
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("non-admin users cannot read global tiktok ads client list", async () => {
      const unauthenticatedRes = await request(app.getHttpServer()).get(
        "/api/v1/admin/tiktok-ads/clients",
      );
      expect(unauthenticatedRes.status).toBe(401);

      const employeeRes = await request(app.getHttpServer())
        .get("/api/v1/admin/tiktok-ads/clients")
        .set("Authorization", `Bearer ${employeeToken}`);
      expect(employeeRes.status).toBe(403);

      const clientRes = await request(app.getHttpServer())
        .get("/api/v1/admin/tiktok-ads/clients")
        .set("Authorization", `Bearer ${clientToken}`);
      expect(clientRes.status).toBe(403);
    });

    it("admin can disconnect and clear credential summary", async () => {
      if (!clientProfileId) return;
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/admin/clients/${clientProfileId}/tiktok-ads/disconnect`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.connectionStatus).toBe("DISCONNECTED");
      expect(res.body.credential.hasToken).toBe(false);
      expectResponseHasNoSensitiveTokenData(res.body);
    });
  });

  describe("GET /clients/me/tiktok-ads/config", () => {
    it("client can read own config summary", async () => {
      const freshClientToken = await loginAndGetAccessToken(
        app,
        "client@socialtech.com",
        DEMO_PASSWORD,
      );
      const res = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/config")
        .set("Authorization", `Bearer ${freshClientToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("connectionStatus");
      expect(res.body).not.toHaveProperty("accessTokenEnc");
      expect(res.body).not.toHaveProperty("syncError");
      expectResponseHasNoSensitiveTokenData(res.body);
    });

    it("admin cannot use client me endpoint", async () => {
      const freshAdminToken = await loginAndGetAccessToken(
        app,
        "admin@socialtech.com",
        DEMO_PASSWORD,
      );
      const res = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/config")
        .set("Authorization", `Bearer ${freshAdminToken}`);
      expect(res.status).toBe(403);
    });
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

function createTikTokInsightRow(overrides: {
  dateStart: string;
  campaignId?: string;
  campaignName?: string;
  adGroupId?: string;
  adGroupName?: string;
  adId?: string;
  adName?: string;
  spend: string;
  impressions: number;
  reach: number;
  clicks: number;
  videoViews: number;
  conversions: number;
}) {
  return {
    dateStart: overrides.dateStart,
    campaignId: overrides.campaignId ?? null,
    campaignName: overrides.campaignName ?? null,
    adGroupId: overrides.adGroupId ?? null,
    adGroupName: overrides.adGroupName ?? null,
    adId: overrides.adId ?? null,
    adName: overrides.adName ?? null,
    spend: overrides.spend,
    impressions: overrides.impressions,
    reach: overrides.reach,
    clicks: overrides.clicks,
    ctr: "2",
    cpc: "0.25",
    cpm: "5",
    videoViews: overrides.videoViews,
    videoViews2s: Math.trunc(overrides.videoViews * 0.8),
    videoViews6s: Math.trunc(overrides.videoViews * 0.5),
    videoCompletionRate: "50",
    vtr: "42.86",
    conversions: overrides.conversions,
    costPerConversion: "5",
    conversionRate: "5",
    purchaseValue: "1200",
    raw: {
      source: "e2e",
      campaign_id: overrides.campaignId ?? null,
      adgroup_id: overrides.adGroupId ?? null,
      ad_id: overrides.adId ?? null,
    },
  };
}
