import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AccountType,
  ClientStatus,
  Prisma,
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

const ADMIN_CLIENTS_PATH = "/api/v1/admin/clients";
const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const CLIENTS_PATH = "/api/v1/clients";
const CLIENTS_MANAGE_PERMISSION = "clients.manage";
const TEST_EMAIL_PREFIX = "authz-admin-clients-";
const TEST_SLUG_PREFIX = "authz-admin-clients-";
const TEST_USER_AGENT = "admin-clients-authz-e2e";
const DEMO_PASSWORD = "demo123";
const DEMO_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVevimS9tkKBjSCpXCL3hWfI0mzQDGqcwi";
const OWNER_PASSWORD = "Owner12345";
const FIXTURE_PASSWORD_HASH = "$2b$10$3yBQjNKNtpc7eG3y8onlVebjnuVnmSbsvVKjl9P8pSMSPifb04FZ6";
const ADMIN_CLIENT_AUDIT_ENTITY_TYPE = "ClientProfile";
const ADMIN_CLIENT_AUDIT_ACTIONS = {
  CREATED: "ADMIN_CLIENT_CREATED",
  UPDATED: "ADMIN_CLIENT_UPDATED",
  DEACTIVATED: "ADMIN_CLIENT_DEACTIVATED",
  ACTIVATED: "ADMIN_CLIENT_ACTIVATED",
  OWNER_CREATED: "ADMIN_CLIENT_OWNER_CREATED",
  OWNER_LINKED: "ADMIN_CLIENT_OWNER_LINKED",
} as const;
const SENSITIVE_TOKENS = [
  "password",
  "passwordHash",
  "token",
  "secret",
  "authorization",
  "bearer",
  OWNER_PASSWORD,
  DEMO_PASSWORD,
] as const;

const auditLogSelect = {
  id: true,
  actorUserId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
} satisfies Prisma.AuditLogSelect;

type AdminClientAuditAction =
  (typeof ADMIN_CLIENT_AUDIT_ACTIONS)[keyof typeof ADMIN_CLIENT_AUDIT_ACTIONS];

type AuditLogRecord = Prisma.AuditLogGetPayload<{ select: typeof auditLogSelect }>;

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

type AdminClientOwnerBody = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  clientProfileId: string | null;
  createdAt: string;
  updatedAt: string;
  passwordHash?: unknown;
  refreshTokens?: unknown;
  tokenHash?: unknown;
  accessToken?: unknown;
};

type AdminClientPurchasedServiceBody = {
  id: string;
  serviceKey: PurchasedServiceKey;
  status: PurchasedServiceStatus;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminClientBody = {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: AdminClientOwnerBody | null;
  purchasedServices: AdminClientPurchasedServiceBody[];
  users?: unknown;
  passwordHash?: unknown;
  refreshTokens?: unknown;
  tokenHash?: unknown;
  accessToken?: unknown;
};

type ClientReadBody = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  purchasedServices: AdminClientPurchasedServiceBody[];
  users?: unknown;
  passwordHash?: unknown;
  refreshTokens?: unknown;
  tokenHash?: unknown;
  accessToken?: unknown;
};

type CreateClientPayload = {
  name: string;
  slug: string;
  contactEmail?: string;
  status?: ClientStatus;
  owner?: {
    mode: "CREATE" | "LINK_EXISTING" | "NONE";
    email?: string;
    displayName?: string;
    password?: string;
    userId?: string;
  };
  purchasedServices?: Array<{
    serviceKey: PurchasedServiceKey;
    status?: PurchasedServiceStatus;
    startedAt?: string | null;
  }>;
};

describe("Admin Client Management Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";
  let adminUserId = "";

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

    const adminLogin = await loginWithDemoUser("admin@socialtech.com");
    adminToken = adminLogin.accessToken;
    adminUserId = adminLogin.user.id;
    employeeToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    clientToken = (await loginWithDemoUser("client@socialtech.com")).accessToken;
  });

  afterAll(async () => {
    await cleanupRuntimeFixtures();
    await prisma.$disconnect();
    await app.close();
  });

  it("rejects unauthenticated admin client mutations", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .send(buildClientPayload("unauthenticated"))
      .expect(401);

    expectApiError(response.body);
  });

  it("rejects employee and client users without clients.manage", async () => {
    const auditCountBefore = await countAdminClientAudits();

    const employeeResponse = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(buildClientPayload("employee-forbidden"))
      .expect(403);
    expectApiError(employeeResponse.body);

    const clientResponse = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .send(buildClientPayload("client-forbidden"))
      .expect(403);
    expectApiError(clientResponse.body);

    const auditCountAfter = await countAdminClientAudits();
    expect(auditCountAfter).toBe(auditCountBefore);
  });

  it("keeps service-level admin checks even if an employee role receives clients.manage", async () => {
    await ensureRolePermission(UserRole.PERFORMANCE_SPECIALIST, CLIENTS_MANAGE_PERMISSION);

    try {
      const response = await request(app.getHttpServer())
        .post(ADMIN_CLIENTS_PATH)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(buildClientPayload("employee-temporary-permission"))
        .expect(403);

      expectApiError(response.body);
      expect(JSON.stringify(response.body)).toMatch(/Only admin users|manage clients/i);
    } finally {
      await removeRolePermission(UserRole.PERFORMANCE_SPECIALIST, CLIENTS_MANAGE_PERMISSION);
    }
  });

  it("admin creates a client without an owner and writes a sanitized audit log", async () => {
    const payload = buildClientPayload("create-none");
    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(payload)
      .expect(201);

    const client = expectAdminClientResponse(response.body);
    expect(client).toEqual(
      expect.objectContaining({
        slug: payload.slug,
        name: payload.name,
        companyName: payload.name,
        contactEmail: payload.contactEmail,
        status: ClientStatus.ACTIVE,
        isActive: true,
        owner: null,
      }),
    );
    expectNoSensitiveTokens(client);

    const auditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.CREATED, client.id);
    const metadata = expectAuditMetadata(auditLog, client.id);
    expectChangedFields(metadata, ["slug", "name", "companyName", "contactEmail", "status"]);
    expect(metadata.nextState).toEqual(
      expect.objectContaining({
        id: client.id,
        slug: payload.slug,
        name: payload.name,
        companyName: payload.name,
        contactEmail: payload.contactEmail,
        status: ClientStatus.ACTIVE,
      }),
    );
  });

  it("admin creates a client with purchased services and writes sanitized service audit metadata", async () => {
    const payload = buildClientPayload("create-services", {
      purchasedServices: [
        {
          serviceKey: PurchasedServiceKey.GROWTH_HUB,
          status: PurchasedServiceStatus.ACTIVE,
          startedAt: "2026-05-01T00:00:00.000Z",
        },
        {
          serviceKey: PurchasedServiceKey.META_ADS,
          status: PurchasedServiceStatus.PAUSED,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(payload)
      .expect(201);

    const client = expectAdminClientResponse(response.body);
    expect(client.purchasedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.GROWTH_HUB,
          status: PurchasedServiceStatus.ACTIVE,
          startedAt: "2026-05-01T00:00:00.000Z",
        }),
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.META_ADS,
          status: PurchasedServiceStatus.PAUSED,
          startedAt: null,
        }),
      ]),
    );

    const auditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.CREATED, client.id);
    const metadata = expectAuditMetadata(auditLog, client.id);
    expectChangedFields(metadata, ["purchasedServices"]);
    const nextState = expectRecord(metadata.nextState);
    expect(nextState.purchasedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.GROWTH_HUB,
          status: PurchasedServiceStatus.ACTIVE,
          startedAt: "2026-05-01T00:00:00.000Z",
        }),
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.META_ADS,
          status: PurchasedServiceStatus.PAUSED,
          startedAt: null,
        }),
      ]),
    );
    expect(JSON.stringify(nextState.purchasedServices)).not.toMatch(/clientProfileId|passwordHash|tokenHash/i);
  });

  it("client read endpoints include purchased services in a safe shape", async () => {
    const myClientResponse = await request(app.getHttpServer())
      .get(`${CLIENTS_PATH}/me`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
    const myClient = expectClientReadResponse(myClientResponse.body);
    expect(myClient.purchasedServices.length).toBeGreaterThan(0);

    const listResponse = await request(app.getHttpServer())
      .get(CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
    const listedClient = (listResponse.body.data as unknown[]).find((item) => {
      return isRecord(item) && item.id === myClient.id;
    });
    expectClientReadResponse(listedClient);

    const detailResponse = await request(app.getHttpServer())
      .get(`${CLIENTS_PATH}/${myClient.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expectClientReadResponse(detailResponse.body);

    const summaryResponse = await request(app.getHttpServer())
      .get(`${CLIENTS_PATH}/${myClient.id}/summary`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const summaryClient = expectRecord(summaryResponse.body.client);
    expectPurchasedServices(summaryClient.purchasedServices);
    expectNoSensitiveTokens(summaryResponse.body);
  });

  it("rejects invalid client create payload with 400", async () => {
    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "x",
        slug: "INVALID SLUG",
      })
      .expect(400);

    expectApiError(response.body);
  });

  it("rejects empty or duplicate purchased services on client create", async () => {
    const emptyResponse = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(buildClientPayload("empty-services", { purchasedServices: [] }))
      .expect(400);
    expectApiError(emptyResponse.body);

    const duplicateResponse = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(
        buildClientPayload("duplicate-services", {
          purchasedServices: [
            { serviceKey: PurchasedServiceKey.SEO_AUDIT },
            {
              serviceKey: PurchasedServiceKey.SEO_AUDIT,
              status: PurchasedServiceStatus.PAUSED,
            },
          ],
        }),
      )
      .expect(400);
    expectApiError(duplicateResponse.body, /duplicate serviceKey/i);
  });

  it("rejects duplicate slug on client create", async () => {
    const existingClient = await createClientViaApi("duplicate-create-source");
    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(buildClientPayload("duplicate-create-target", { slug: existingClient.slug }))
      .expect(409);

    expectApiError(response.body);
  });

  it("admin updates, deactivates, and activates a client with previous/next audit state", async () => {
    const client = await createClientViaApi("status-flow");
    const updatePayload = {
      name: "Authz Admin Clients Updated",
      contactEmail: "updated-admin-clients@example.com",
      status: ClientStatus.SUSPENDED,
    };

    const updateResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${client.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(updatePayload)
      .expect(200);
    const updatedClient = expectAdminClientResponse(updateResponse.body);
    expect(updatedClient).toEqual(expect.objectContaining(updatePayload));

    const updateAuditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.UPDATED, client.id);
    const updateMetadata = expectAuditMetadata(updateAuditLog, client.id);
    expectChangedFields(updateMetadata, ["name", "companyName", "contactEmail", "status"]);
    expect(updateMetadata.previousState).toEqual(expect.objectContaining({ status: ClientStatus.ACTIVE }));
    expect(updateMetadata.nextState).toEqual(expect.objectContaining({ status: ClientStatus.SUSPENDED }));

    const deactivateResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${client.id}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .expect(200);
    const deactivatedClient = expectAdminClientResponse(deactivateResponse.body);
    expect(deactivatedClient.status).toBe(ClientStatus.INACTIVE);
    expect(deactivatedClient.isActive).toBe(false);

    const deactivateAuditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.DEACTIVATED, client.id);
    const deactivateMetadata = expectAuditMetadata(deactivateAuditLog, client.id);
    expectChangedFields(deactivateMetadata, ["status"]);
    expect(deactivateMetadata.previousState).toEqual(expect.objectContaining({ status: ClientStatus.SUSPENDED }));
    expect(deactivateMetadata.nextState).toEqual(expect.objectContaining({ status: ClientStatus.INACTIVE }));

    const activateResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${client.id}/activate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .expect(200);
    const activatedClient = expectAdminClientResponse(activateResponse.body);
    expect(activatedClient.status).toBe(ClientStatus.ACTIVE);
    expect(activatedClient.isActive).toBe(true);

    const activateAuditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.ACTIVATED, client.id);
    const activateMetadata = expectAuditMetadata(activateAuditLog, client.id);
    expectChangedFields(activateMetadata, ["status"]);
    expect(activateMetadata.previousState).toEqual(expect.objectContaining({ status: ClientStatus.INACTIVE }));
    expect(activateMetadata.nextState).toEqual(expect.objectContaining({ status: ClientStatus.ACTIVE }));
  });

  it("rejects duplicate slug on client update", async () => {
    const firstClient = await createClientViaApi("duplicate-update-first");
    const secondClient = await createClientViaApi("duplicate-update-second");

    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${secondClient.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slug: firstClient.slug })
      .expect(409);

    expectApiError(response.body);
  });

  it("admin replaces purchased services on update and audits the service change", async () => {
    const client = await createClientViaApi("service-update", {
      purchasedServices: [
        {
          serviceKey: PurchasedServiceKey.WEB_APP,
          status: PurchasedServiceStatus.ACTIVE,
        },
      ],
    });

    const updatePayload = {
      purchasedServices: [
        {
          serviceKey: PurchasedServiceKey.SEO_AUDIT,
          status: PurchasedServiceStatus.ACTIVE,
          startedAt: "2026-06-01T00:00:00.000Z",
        },
        {
          serviceKey: PurchasedServiceKey.TECHNICAL_SUPPORT,
          status: PurchasedServiceStatus.PAUSED,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .patch(`${ADMIN_CLIENTS_PATH}/${client.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(updatePayload)
      .expect(200);

    const updatedClient = expectAdminClientResponse(response.body);
    expect(updatedClient.purchasedServices).toHaveLength(2);
    expect(updatedClient.purchasedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.SEO_AUDIT,
          status: PurchasedServiceStatus.ACTIVE,
          startedAt: "2026-06-01T00:00:00.000Z",
        }),
        expect.objectContaining({
          serviceKey: PurchasedServiceKey.TECHNICAL_SUPPORT,
          status: PurchasedServiceStatus.PAUSED,
          startedAt: null,
        }),
      ]),
    );
    expect(
      updatedClient.purchasedServices.some(
        (service) => service.serviceKey === PurchasedServiceKey.WEB_APP,
      ),
    ).toBe(false);

    const auditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.UPDATED, client.id);
    const metadata = expectAuditMetadata(auditLog, client.id);
    expectChangedFields(metadata, ["purchasedServices"]);
    const previousState = expectRecord(metadata.previousState);
    const nextState = expectRecord(metadata.nextState);
    expect(previousState.purchasedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ serviceKey: PurchasedServiceKey.WEB_APP }),
      ]),
    );
    expect(nextState.purchasedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ serviceKey: PurchasedServiceKey.SEO_AUDIT }),
        expect.objectContaining({ serviceKey: PurchasedServiceKey.TECHNICAL_SUPPORT }),
      ]),
    );
    expectNoSensitiveTokens(metadata);
  });

  it("admin creates a client and owner account in one request without returning sensitive fields", async () => {
    const suffix = uniqueSuffix("create-owner");
    const payload = buildClientPayload(suffix, {
      owner: {
        mode: "CREATE",
        email: `${TEST_EMAIL_PREFIX}${suffix}@example.com`,
        displayName: "Created Client Owner",
        password: OWNER_PASSWORD,
      },
    });

    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(payload)
      .expect(201);

    const client = expectAdminClientResponse(response.body);
    expect(client.owner).toEqual(
      expect.objectContaining({
        email: payload.owner?.email,
        displayName: payload.owner?.displayName,
        accountType: AccountType.CLIENT,
        role: UserRole.CLIENT_OWNER,
        status: UserStatus.ACTIVE,
        clientProfileId: client.id,
      }),
    );
    expectNoSensitiveTokens(client);

    const ownerUser = await prisma.user.findUnique({
      where: { email: payload.owner?.email },
      select: { id: true, passwordHash: true, clientProfileId: true, role: true },
    });
    expect(ownerUser).toEqual(
      expect.objectContaining({
        id: client.owner?.id,
        clientProfileId: client.id,
        role: UserRole.CLIENT_OWNER,
      }),
    );
    expect(ownerUser?.passwordHash).toEqual(expect.any(String));

    const ownerLogin = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email: payload.owner?.email,
      password: OWNER_PASSWORD,
    });
    expect([200, 201]).toContain(ownerLogin.status);
    expect(ownerLogin.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );

    await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.CREATED, client.id);
    const ownerAuditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.OWNER_CREATED, client.id);
    const ownerMetadata = expectAuditMetadata(ownerAuditLog, client.id);
    expect(ownerMetadata.ownerUserId).toBe(client.owner?.id);
    expectChangedFields(ownerMetadata, ["ownerUserId"]);
    expectNoSensitiveTokens(ownerMetadata);
  });

  it("admin creates a client and links an existing unassigned client user as owner", async () => {
    const fixtureUserId = await createClientUserFixture(uniqueSuffix("link-existing-create"));
    const payload = buildClientPayload("link-existing-create", {
      owner: {
        mode: "LINK_EXISTING",
        userId: fixtureUserId,
      },
    });

    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(payload)
      .expect(201);

    const client = expectAdminClientResponse(response.body);
    expect(client.owner).toEqual(
      expect.objectContaining({
        id: fixtureUserId,
        accountType: AccountType.CLIENT,
        role: UserRole.CLIENT_OWNER,
        clientProfileId: client.id,
      }),
    );

    const linkedUser = await prisma.user.findUnique({
      where: { id: fixtureUserId },
      select: { clientProfileId: true, role: true, sessionInvalidatedAt: true },
    });
    expect(linkedUser).toEqual(
      expect.objectContaining({
        clientProfileId: client.id,
        role: UserRole.CLIENT_OWNER,
      }),
    );
    expect(linkedUser?.sessionInvalidatedAt).toBeInstanceOf(Date);

    const ownerAuditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.OWNER_LINKED, client.id);
    const ownerMetadata = expectAuditMetadata(ownerAuditLog, client.id);
    expect(ownerMetadata.ownerUserId).toBe(fixtureUserId);
    expectChangedFields(ownerMetadata, ["ownerUserId"]);
  });

  it("admin creates an owner for an existing client through the owner endpoint", async () => {
    const client = await createClientViaApi("owner-endpoint-create");
    const suffix = uniqueSuffix("owner-endpoint-create");
    const payload = {
      mode: "CREATE",
      email: `${TEST_EMAIL_PREFIX}${suffix}@example.com`,
      displayName: "Endpoint Created Owner",
      password: OWNER_PASSWORD,
    };

    const response = await request(app.getHttpServer())
      .post(`${ADMIN_CLIENTS_PATH}/${client.id}/owner`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(payload)
      .expect(201);

    const updatedClient = expectAdminClientResponse(response.body);
    expect(updatedClient.owner).toEqual(
      expect.objectContaining({
        email: payload.email,
        role: UserRole.CLIENT_OWNER,
        clientProfileId: client.id,
      }),
    );
    expectNoSensitiveTokens(updatedClient);

    const auditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.OWNER_CREATED, client.id);
    const metadata = expectAuditMetadata(auditLog, client.id);
    expect(metadata.ownerUserId).toBe(updatedClient.owner?.id);
  });

  it("admin links an existing unassigned client user through the owner endpoint", async () => {
    const client = await createClientViaApi("owner-endpoint-link");
    const fixtureUserId = await createClientUserFixture(uniqueSuffix("owner-endpoint-link"));

    const response = await request(app.getHttpServer())
      .post(`${ADMIN_CLIENTS_PATH}/${client.id}/owner`)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send({ mode: "LINK_EXISTING", userId: fixtureUserId })
      .expect(201);

    const updatedClient = expectAdminClientResponse(response.body);
    expect(updatedClient.owner).toEqual(
      expect.objectContaining({
        id: fixtureUserId,
        role: UserRole.CLIENT_OWNER,
        clientProfileId: client.id,
      }),
    );

    const auditLog = await expectAuditLog(ADMIN_CLIENT_AUDIT_ACTIONS.OWNER_LINKED, client.id);
    const metadata = expectAuditMetadata(auditLog, client.id);
    expect(metadata.ownerUserId).toBe(fixtureUserId);
  });

  it("rejects linking a client owner user that is already linked to another client profile", async () => {
    const client = await createClientViaApi("owner-already-linked-target");
    const linkedClientId = await getSeedClientProfileId();
    const linkedUserId = await createClientUserFixture(
      uniqueSuffix("owner-already-linked-user"),
      linkedClientId,
      UserRole.CLIENT_OWNER,
    );

    const response = await request(app.getHttpServer())
      .post(`${ADMIN_CLIENTS_PATH}/${client.id}/owner`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ mode: "LINK_EXISTING", userId: linkedUserId })
      .expect(409);

    expectApiError(response.body);
  });

  async function loginWithDemoUser(email: string): Promise<LoginBody> {
    const response = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email,
      password: DEMO_PASSWORD,
    });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    expect(body.accessToken).toEqual(expect.any(String));
    return body;
  }

  async function createClientViaApi(
    suffixLabel: string,
    overrides: Partial<CreateClientPayload> = {},
  ): Promise<AdminClientBody> {
    const response = await request(app.getHttpServer())
      .post(ADMIN_CLIENTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .set("User-Agent", TEST_USER_AGENT)
      .send(buildClientPayload(suffixLabel, overrides))
      .expect(201);

    return expectAdminClientResponse(response.body);
  }

  async function createClientUserFixture(
    suffixLabel: string,
    clientProfileId: string | null = null,
    role: UserRole = UserRole.CLIENT_MEMBER,
  ): Promise<string> {
    const email = `${TEST_EMAIL_PREFIX}${suffixLabel}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        displayName: "Existing Client Fixture",
        passwordHash: FIXTURE_PASSWORD_HASH,
        accountType: AccountType.CLIENT,
        role,
        status: UserStatus.ACTIVE,
        clientProfileId,
      },
      create: {
        email,
        displayName: "Existing Client Fixture",
        passwordHash: FIXTURE_PASSWORD_HASH,
        accountType: AccountType.CLIENT,
        role,
        status: UserStatus.ACTIVE,
        clientProfileId,
      },
      select: { id: true },
    });

    return user.id;
  }

  async function expectAuditLog(
    action: AdminClientAuditAction,
    clientProfileId: string,
  ): Promise<AuditLogRecord> {
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action,
        entityType: ADMIN_CLIENT_AUDIT_ENTITY_TYPE,
        entityId: clientProfileId,
      },
      select: auditLogSelect,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });

    expect(auditLog).not.toBeNull();
    if (!auditLog) {
      throw new Error(`Missing audit log ${action} for client ${clientProfileId}`);
    }

    expect(auditLog.actorUserId).toBe(adminUserId);
    expect(auditLog.userAgent).toBe(TEST_USER_AGENT);
    expect(typeof auditLog.ipAddress === "string" || auditLog.ipAddress === null).toBe(true);
    expectNoSensitiveTokens(auditLog.metadata);

    return auditLog;
  }

  async function countAdminClientAudits(): Promise<number> {
    return prisma.auditLog.count({
      where: {
        action: {
          startsWith: "ADMIN_CLIENT_",
        },
      },
    });
  }

  async function ensureRolePermission(role: UserRole, permissionSlug: string): Promise<void> {
    const permission = await prisma.permission.upsert({
      where: { slug: permissionSlug },
      update: { description: "Create and update client data." },
      create: {
        slug: permissionSlug,
        description: "Create and update client data.",
      },
      select: { id: true },
    });

    await prisma.rolePermission.createMany({
      data: [{ role, permissionId: permission.id }],
      skipDuplicates: true,
    });
  }

  async function removeRolePermission(role: UserRole, permissionSlug: string): Promise<void> {
    const permission = await prisma.permission.findUnique({
      where: { slug: permissionSlug },
      select: { id: true },
    });

    if (!permission) {
      return;
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role,
        permissionId: permission.id,
      },
    });
  }

  async function getSeedClientProfileId(): Promise<string> {
    const clientProfile = await prisma.clientProfile.findFirst({
      where: { slug: "acme-e-ticaret" },
      select: { id: true },
    });

    if (!clientProfile) {
      throw new Error("Expected seeded client profile acme-e-ticaret.");
    }

    return clientProfile.id;
  }

  async function setDeterministicDemoPasswords(): Promise<void> {
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: {
        passwordHash: DEMO_PASSWORD_HASH,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async function cleanupRuntimeFixtures(): Promise<void> {
    const testClientProfiles = await prisma.clientProfile.findMany({
      where: { slug: { startsWith: TEST_SLUG_PREFIX } },
      select: { id: true },
    });
    const testClientProfileIds = testClientProfiles.map((clientProfile) => clientProfile.id);

    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { action: { startsWith: "ADMIN_CLIENT_" } },
          ...(testClientProfileIds.length > 0
            ? [{ entityId: { in: testClientProfileIds } }]
            : []),
        ],
      },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: TEST_EMAIL_PREFIX } },
    });
    await prisma.clientProfile.deleteMany({
      where: { slug: { startsWith: TEST_SLUG_PREFIX } },
    });
  }

  function buildClientPayload(
    suffixLabel: string,
    overrides: Partial<CreateClientPayload> = {},
  ): CreateClientPayload {
    const suffix = uniqueSuffix(suffixLabel);
    return {
      name: `Authz Admin Clients ${suffixLabel}`,
      slug: `${TEST_SLUG_PREFIX}${suffix}`,
      contactEmail: `${TEST_EMAIL_PREFIX}${suffix}@example.com`,
      ...overrides,
    };
  }

  function expectAdminClientResponse(body: unknown): AdminClientBody {
    const client = body as AdminClientBody;
    expect(client.id).toEqual(expect.any(String));
    expect(client.slug).toEqual(expect.any(String));
    expect(client.name).toEqual(expect.any(String));
    expect(client.companyName).toEqual(expect.any(String));
    expect(client.name).toBe(client.companyName);
    expect(Object.values(ClientStatus)).toContain(client.status);
    expect(typeof client.isActive).toBe("boolean");
    expectValidIsoDate(client.createdAt);
    expectValidIsoDate(client.updatedAt);
    expect(Array.isArray(client.purchasedServices)).toBe(true);
    for (const service of client.purchasedServices) {
      expect(service.id).toEqual(expect.any(String));
      expect(Object.values(PurchasedServiceKey)).toContain(service.serviceKey);
      expect(Object.values(PurchasedServiceStatus)).toContain(service.status);
      if (service.startedAt !== null) {
        expectValidIsoDate(service.startedAt);
      }
      expectValidIsoDate(service.createdAt);
      expectValidIsoDate(service.updatedAt);
    }
    expect(client).not.toHaveProperty("users");
    expect(client).not.toHaveProperty("passwordHash");
    expect(client).not.toHaveProperty("tokenHash");
    expect(client).not.toHaveProperty("refreshTokens");
    expect(client).not.toHaveProperty("accessToken");

    if (client.owner) {
      expect(client.owner.id).toEqual(expect.any(String));
      expect(client.owner.email).toEqual(expect.any(String));
      expect(client.owner.accountType).toBe(AccountType.CLIENT);
      expect(Object.values(UserRole)).toContain(client.owner.role);
      expect(Object.values(UserStatus)).toContain(client.owner.status);
      expectValidIsoDate(client.owner.createdAt);
      expectValidIsoDate(client.owner.updatedAt);
      expect(client.owner).not.toHaveProperty("passwordHash");
      expect(client.owner).not.toHaveProperty("tokenHash");
      expect(client.owner).not.toHaveProperty("refreshTokens");
      expect(client.owner).not.toHaveProperty("accessToken");
    }

    return client;
  }

  function expectClientReadResponse(body: unknown): ClientReadBody {
    expect(isRecord(body)).toBe(true);
    if (!isRecord(body)) {
      throw new Error("Expected client read response.");
    }

    const client = body as ClientReadBody;
    expect(client.id).toEqual(expect.any(String));
    expect(client.slug).toEqual(expect.any(String));
    expect(client.companyName).toEqual(expect.any(String));
    expect(Object.values(ClientStatus)).toContain(client.status);
    expectValidIsoDate(client.createdAt);
    expectValidIsoDate(client.updatedAt);
    expectPurchasedServices(client.purchasedServices);
    expect(client).not.toHaveProperty("users");
    expect(client).not.toHaveProperty("passwordHash");
    expect(client).not.toHaveProperty("tokenHash");
    expect(client).not.toHaveProperty("refreshTokens");
    expect(client).not.toHaveProperty("accessToken");

    return client;
  }

  function expectPurchasedServices(value: unknown): void {
    expect(Array.isArray(value)).toBe(true);
    if (!Array.isArray(value)) {
      throw new Error("Expected purchasedServices array.");
    }

    for (const service of value) {
      expect(isRecord(service)).toBe(true);
      if (!isRecord(service)) {
        throw new Error("Expected purchased service record.");
      }

      expect(service.id).toEqual(expect.any(String));
      expect(Object.values(PurchasedServiceKey)).toContain(service.serviceKey);
      expect(Object.values(PurchasedServiceStatus)).toContain(service.status);
      if (service.startedAt !== null) {
        expect(typeof service.startedAt).toBe("string");
        if (typeof service.startedAt !== "string") {
          throw new Error("Expected purchased service startedAt to be an ISO string or null.");
        }
        expectValidIsoDate(service.startedAt);
      }
      expect(typeof service.createdAt).toBe("string");
      if (typeof service.createdAt !== "string") {
        throw new Error("Expected purchased service createdAt to be an ISO string.");
      }
      expectValidIsoDate(service.createdAt);
      expect(typeof service.updatedAt).toBe("string");
      if (typeof service.updatedAt !== "string") {
        throw new Error("Expected purchased service updatedAt to be an ISO string.");
      }
      expectValidIsoDate(service.updatedAt);
      expect(service).not.toHaveProperty("clientProfileId");
      expect(service).not.toHaveProperty("users");
      expect(service).not.toHaveProperty("passwordHash");
    }
  }

  function expectAuditMetadata(
    auditLog: AuditLogRecord,
    targetClientProfileId: string,
  ): Record<string, unknown> {
    const metadata = expectJsonObject(auditLog.metadata);
    expect(metadata.actorUserId).toBe(adminUserId);
    expect(metadata.targetClientProfileId).toBe(targetClientProfileId);
    expect(Array.isArray(metadata.changedFields)).toBe(true);
    expectNoSensitiveTokens(metadata);
    return metadata;
  }

  function expectChangedFields(
    metadata: Record<string, unknown>,
    expectedFields: string[],
  ): void {
    const changedFields = metadata.changedFields;
    expect(Array.isArray(changedFields)).toBe(true);
    if (!Array.isArray(changedFields)) {
      throw new Error("Expected changedFields to be an array.");
    }

    for (const field of expectedFields) {
      expect(changedFields).toContain(field);
    }
  }

  function expectRecord(value: unknown): Record<string, unknown> {
    expect(isRecord(value)).toBe(true);
    if (!isRecord(value)) {
      throw new Error("Expected record value.");
    }

    return value;
  }

  function expectJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> {
    expect(isRecord(value)).toBe(true);
    if (!isRecord(value)) {
      throw new Error("Expected JSON object.");
    }

    return value;
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

  function expectValidIsoDate(value: string): void {
    expect(typeof value).toBe("string");
    expect(Number.isNaN(Date.parse(value))).toBe(false);
  }

  function expectNoSensitiveTokens(value: unknown): void {
    const serialized = JSON.stringify(value);
    for (const token of SENSITIVE_TOKENS) {
      expect(serialized).not.toMatch(new RegExp(token, "i"));
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function uniqueSuffix(label: string): string {
    return `${label}-${randomUUID().slice(0, 8)}`;
  }
});
