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
