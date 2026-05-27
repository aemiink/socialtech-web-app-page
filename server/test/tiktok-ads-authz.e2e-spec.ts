import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("TikTok Ads Config Authz (e2e)", () => {
  let app: INestApplication;
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;
  let clientProfileId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();

    // Login as admin
    const adminRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "admin@socialtech.com", password: "Admin123!" });
    adminToken = adminRes.body.accessToken;

    // Login as performance specialist
    const perfRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "performance@socialtech.com", password: "Employee123!" });
    employeeToken = perfRes.body.accessToken;

    // Login as client
    const clientRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "client@socialtech.com", password: "Client123!" });
    clientToken = clientRes.body.accessToken;

    // Get client profile id from admin
    const meRes = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);
    clientProfileId = meRes.body.clientProfile?.id;
  });

  afterAll(async () => {
    await app.close();
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

  describe("GET /clients/me/tiktok-ads/config", () => {
    it("client can read own config summary", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/config")
        .set("Authorization", `Bearer ${clientToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("connectionStatus");
      expect(res.body).not.toHaveProperty("accessTokenEnc");
      expect(res.body).not.toHaveProperty("syncError");
    });

    it("admin cannot use client me endpoint", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/clients/me/tiktok-ads/config")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });
  });
});
