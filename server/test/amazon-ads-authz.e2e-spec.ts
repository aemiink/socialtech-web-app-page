import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  AmazonAdsConnectionStatus,
  EmployeeClientAssignmentScope,
  PrismaClient,
  PurchasedServiceKey,
  PurchasedServiceStatus,
} from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";

const DEMO_PASSWORD = "demo123";
const SENSITIVE_RESPONSE_TOKENS = [
  "accessTokenEnc",
  "refreshTokenEnc",
  "tokenHash",
] as const;

describe("Amazon Ads Config Authz (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
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
