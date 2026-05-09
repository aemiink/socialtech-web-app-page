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

const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const CLIENT_OWN_META_ADS_CONFIG_PATH = "/api/v1/clients/me/meta-ads/config";
const ASSIGNED_META_ADS_CONFIG_PATH = "/api/v1/meta-ads/clients";
const TEST_EMAIL_PREFIX = "authz-meta-ads-";
const TEST_SLUG_PREFIX = "authz-meta-ads-";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const SENSITIVE_RESPONSE_TOKENS = [
  "accessTokenEnc",
  "tokenHash",
  "grantedScopes",
  "tokenExpiresAt",
  "metaAdsCredential",
  "credential",
  "refreshToken",
] as const;

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
  let activeMetaAdsClientId = "";
  let inactiveMetaAdsClientId = "";
  let missingMetaAdsClientId = "";
  let performanceUserId = "";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
        activeMetaAdsClientId: activeClient.id,
        inactiveMetaAdsClientId: inactiveClient.id,
        missingMetaAdsClientId: missingClient.id,
      };
    });

    activeMetaAdsClientId = fixture.activeMetaAdsClientId;
    inactiveMetaAdsClientId = fixture.inactiveMetaAdsClientId;
    missingMetaAdsClientId = fixture.missingMetaAdsClientId;

    adminToken = (await loginWithDemoUser("admin@socialtech.com")).accessToken;
    performanceToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    ownClientToken = (await loginWithDemoUser(ownClientEmail)).accessToken;
  });

  afterAll(async () => {
    await cleanupRuntimeFixtures();
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

  it("assigned employee can read assigned client Meta Ads config", async () => {
    const response = await request(app.getHttpServer())
      .get(assignedMetaAdsConfigPath(activeMetaAdsClientId))
      .set("Authorization", `Bearer ${performanceToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        clientProfileId: activeMetaAdsClientId,
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
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

  it("cross-client access to admin Meta Ads route is denied for client accounts", async () => {
    const response = await request(app.getHttpServer())
      .get(adminMetaAdsConfigPath(activeMetaAdsClientId))
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

  function assignedMetaAdsConfigPath(clientId: string): string {
    return `${ASSIGNED_META_ADS_CONFIG_PATH}/${clientId}/config`;
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
