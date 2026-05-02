import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AccountType,
  ClientStatus,
  CrmLeadActivityType,
  CrmLeadSource,
  CrmLeadStatus,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const ADMIN_CRM_PATH = "/api/v1/admin/crm/leads";
const EMPLOYEE_CRM_PATH = "/api/v1/crm/leads";
const PUBLIC_CRM_PATH = "/api/v1/public/crm/leads";
const AUTH_LOGIN_PATH = "/api/v1/auth/login";
const TEST_PREFIX = "E2E CRM";
const TEST_SLUG_PREFIX = "e2e-crm";
const DEMO_PASSWORD = "demo123";

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

type CrmLeadBody = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string | null;
  phone: string | null;
  source: CrmLeadSource;
  status: CrmLeadStatus;
  ownerUserId: string;
  convertedClientProfileId: string | null;
  owner: {
    id: string;
    email: string;
    displayName: string | null;
    role: UserRole;
    status: UserStatus;
    passwordHash?: unknown;
    refreshTokens?: unknown;
  };
  latestActivity?: unknown;
  activities?: Array<{
    id: string;
    type: CrmLeadActivityType;
    note: string;
  }>;
  passwordHash?: unknown;
  refreshTokens?: unknown;
};

type PaginatedCrmLeads = {
  data: CrmLeadBody[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

describe("CRM Lead Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken = "";
  let crmToken = "";
  let nonCrmEmployeeToken = "";
  let crmUserId = "";
  let otherOwnerLeadId = "";

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

    adminToken = (await loginWithDemoUser("admin@socialtech.com")).accessToken;
    const crmLogin = await loginWithDemoUser("crm@socialtech.com");
    crmToken = crmLogin.accessToken;
    crmUserId = crmLogin.user.id;
    nonCrmEmployeeToken = (await loginWithDemoUser("performance@socialtech.com")).accessToken;
    otherOwnerLeadId = await ensureOtherOwnerLead();
  });

  afterAll(async () => {
    await cleanupRuntimeFixtures();
    await prisma.$disconnect();
    await app.close();
  });

  it("rejects unauthenticated CRM requests", async () => {
    await request(app.getHttpServer()).get(EMPLOYEE_CRM_PATH).expect(401);
  });

  it("accepts public website contact form submissions as WEBSITE_FORM leads", async () => {
    const companyName = `${TEST_PREFIX} Website Form ${randomUUID()}`;

    const response = await request(app.getHttpServer())
      .post(PUBLIC_CRM_PATH)
      .send({
        fullName: "Website Visitor",
        companyName,
        contactEmail: "visitor@example.com",
        phone: "+90 555 100 10 10",
        serviceInterest: "Growth & Hub",
        budgetRange: "30.000 ₺ - 75.000 ₺",
        goal: "Public form should create a CRM lead.",
        consentAccepted: true,
        sourcePath: "/iletisim#contact-form",
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      status: "received",
    });

    const lead = await prisma.crmLead.findUniqueOrThrow({
      where: { id: response.body.id as string },
      include: { activities: true, ownerUser: true },
    });
    expect(lead.companyName).toBe(companyName);
    expect(lead.contactName).toBe("Website Visitor");
    expect(lead.source).toBe(CrmLeadSource.WEBSITE_FORM);
    expect(lead.status).toBe(CrmLeadStatus.NEW);
    expect(lead.ownerUser.role).toBe(UserRole.CRM_SPECIALIST);
    expect(lead.activities[0]?.note).toContain("Website iletişim formu");
  });

  it("validates public website contact form payloads", async () => {
    await request(app.getHttpServer())
      .post(PUBLIC_CRM_PATH)
      .send({
        fullName: "Website Visitor",
        companyName: `${TEST_PREFIX} Missing Consent`,
        contactEmail: "visitor@example.com",
        consentAccepted: false,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(PUBLIC_CRM_PATH)
      .send({
        fullName: "Website Visitor",
        companyName: `${TEST_PREFIX} Invalid Email`,
        contactEmail: "not-an-email",
        consentAccepted: true,
      })
      .expect(400);
  });

  it("allows admin to create, list, detail, update, add activity, and convert a lead", async () => {
    const created = await createLeadViaAdmin("convert-flow");
    expect(created.ownerUserId).toBe(crmUserId);
    expect(created.owner.passwordHash).toBeUndefined();

    const listResponse = await request(app.getHttpServer())
      .get(ADMIN_CRM_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ search: created.companyName })
      .expect(200);
    const listBody = listResponse.body as PaginatedCrmLeads;
    expect(listBody.data.some((lead) => lead.id === created.id)).toBe(true);

    const detailResponse = await request(app.getHttpServer())
      .get(`${ADMIN_CRM_PATH}/${created.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    const detail = detailResponse.body as CrmLeadBody;
    expect(detail.id).toBe(created.id);
    expect(detail.passwordHash).toBeUndefined();
    expect(detail.activities).toEqual(expect.any(Array));

    const updatedResponse = await request(app.getHttpServer())
      .patch(`${ADMIN_CRM_PATH}/${created.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: CrmLeadStatus.CONTACTED, nextFollowUpAt: "2026-05-03T09:00:00.000Z" })
      .expect(200);
    expect((updatedResponse.body as CrmLeadBody).status).toBe(CrmLeadStatus.CONTACTED);

    const activityResponse = await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${created.id}/activities`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        type: CrmLeadActivityType.CALL,
        note: "Admin e2e call note",
        nextFollowUpAt: "2026-05-04T09:00:00.000Z",
      })
      .expect(201);
    expect(activityResponse.body).toMatchObject({
      leadId: created.id,
      type: CrmLeadActivityType.CALL,
      note: "Admin e2e call note",
    });

    const convertResponse = await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${created.id}/convert`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slug: `${TEST_SLUG_PREFIX}-${randomUUID()}` })
      .expect(201);
    expect(convertResponse.body.lead.status).toBe(CrmLeadStatus.WON);
    expect(convertResponse.body.lead.convertedClientProfileId).toEqual(expect.any(String));
    expect(convertResponse.body.convertedClientProfile.status).toBe(ClientStatus.ACTIVE);

    await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${created.id}/convert`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({})
      .expect(409);
  });

  it("rejects assigning leads to non-CRM employees", async () => {
    const nonCrmEmployee = await prisma.user.findUniqueOrThrow({
      where: { email: "performance@socialtech.com" },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .post(ADMIN_CRM_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        companyName: `${TEST_PREFIX} Invalid Owner`,
        contactName: "Invalid Owner",
        ownerUserId: nonCrmEmployee.id,
      })
      .expect(400);
  });

  it("validates admin CRM create and list query payloads", async () => {
    await request(app.getHttpServer())
      .post(ADMIN_CRM_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        companyName: `${TEST_PREFIX} Invalid Email`,
        contactName: "Invalid Email",
        contactEmail: "not-an-email",
        ownerUserId: crmUserId,
      })
      .expect(400);

    await request(app.getHttpServer())
      .get(ADMIN_CRM_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ page: 0, status: "INVALID" })
      .expect(400);
  });

  it("rejects converting another lead to an already used client slug", async () => {
    const firstLead = await createLeadViaAdmin("duplicate-slug-a");
    const secondLead = await createLeadViaAdmin("duplicate-slug-b");
    const duplicateSlug = `${TEST_SLUG_PREFIX}-${randomUUID()}`;

    await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${firstLead.id}/convert`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slug: duplicateSlug })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${secondLead.id}/convert`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slug: duplicateSlug })
      .expect(409);
  });

  it("allows CRM employee to see only assigned leads and safely hides other owners", async () => {
    const ownLead = await createLeadViaAdmin("employee-flow");

    const listResponse = await request(app.getHttpServer())
      .get(EMPLOYEE_CRM_PATH)
      .set("Authorization", `Bearer ${crmToken}`)
      .expect(200);
    const listBody = listResponse.body as PaginatedCrmLeads;
    expect(listBody.data.length).toBeGreaterThan(0);
    expect(listBody.data.every((lead) => lead.ownerUserId === crmUserId)).toBe(true);

    await request(app.getHttpServer())
      .get(`${EMPLOYEE_CRM_PATH}/${ownLead.id}`)
      .set("Authorization", `Bearer ${crmToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`${EMPLOYEE_CRM_PATH}/${otherOwnerLeadId}`)
      .set("Authorization", `Bearer ${crmToken}`)
      .expect(404);
  });

  it("allows CRM employee activity and limited status updates but blocks WON and convert", async () => {
    const ownLead = await createLeadViaAdmin("employee-update-flow");

    const activityResponse = await request(app.getHttpServer())
      .post(`${EMPLOYEE_CRM_PATH}/${ownLead.id}/activities`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({
        type: CrmLeadActivityType.WHATSAPP,
        note: "WhatsApp follow-up from CRM e2e",
        nextFollowUpAt: "2026-05-05T09:00:00.000Z",
      })
      .expect(201);
    expect(activityResponse.body).toMatchObject({
      leadId: ownLead.id,
      type: CrmLeadActivityType.WHATSAPP,
    });

    const updateResponse = await request(app.getHttpServer())
      .patch(`${EMPLOYEE_CRM_PATH}/${ownLead.id}`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({ status: CrmLeadStatus.FOLLOW_UP })
      .expect(200);
    expect((updateResponse.body as CrmLeadBody).status).toBe(CrmLeadStatus.FOLLOW_UP);

    await request(app.getHttpServer())
      .patch(`${EMPLOYEE_CRM_PATH}/${ownLead.id}`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({ status: CrmLeadStatus.WON })
      .expect(400);

    await request(app.getHttpServer())
      .post(`${EMPLOYEE_CRM_PATH}/${ownLead.id}/activities`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({
        type: CrmLeadActivityType.STATUS_CHANGE,
        note: "Direct status change should be blocked",
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${ownLead.id}/convert`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({})
      .expect(403);
  });

  it("blocks employee updates and activities after admin conversion", async () => {
    const ownLead = await createLeadViaAdmin("converted-employee-lock");
    await request(app.getHttpServer())
      .post(`${ADMIN_CRM_PATH}/${ownLead.id}/convert`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slug: `${TEST_SLUG_PREFIX}-${randomUUID()}` })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`${EMPLOYEE_CRM_PATH}/${ownLead.id}`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({ status: CrmLeadStatus.FOLLOW_UP })
      .expect(409);

    await request(app.getHttpServer())
      .post(`${EMPLOYEE_CRM_PATH}/${ownLead.id}/activities`)
      .set("Authorization", `Bearer ${crmToken}`)
      .send({ type: CrmLeadActivityType.NOTE, note: "Should be locked" })
      .expect(409);
  });

  it("rejects non-CRM employees on employee CRM endpoints", async () => {
    await request(app.getHttpServer())
      .get(EMPLOYEE_CRM_PATH)
      .set("Authorization", `Bearer ${nonCrmEmployeeToken}`)
      .expect(403);
  });

  async function loginWithDemoUser(email: string): Promise<LoginBody> {
    const response = await request(app.getHttpServer()).post(AUTH_LOGIN_PATH).send({
      email,
      password: DEMO_PASSWORD,
    });

    expect([200, 201]).toContain(response.status);
    return response.body as LoginBody;
  }

  async function createLeadViaAdmin(label: string): Promise<CrmLeadBody> {
    const response = await request(app.getHttpServer())
      .post(ADMIN_CRM_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        companyName: `${TEST_PREFIX} ${label} ${randomUUID()}`,
        contactName: "CRM E2E Contact",
        contactEmail: `${label}-${randomUUID()}@example.com`,
        phone: "+90 555 000 00 00",
        ownerUserId: crmUserId,
        source: CrmLeadSource.MANUAL,
        initialNote: "Initial CRM e2e note",
      })
      .expect(201);

    return response.body as CrmLeadBody;
  }

  async function ensureOtherOwnerLead(): Promise<string> {
    const existing = await prisma.crmLead.findFirst({
      where: {
        ownerUserId: { not: crmUserId },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (existing) {
      return existing.id;
    }

    const otherEmployee = await prisma.user.findFirstOrThrow({
      where: {
        accountType: AccountType.EMPLOYEE,
        id: { not: crmUserId },
      },
      select: { id: true },
    });
    const lead = await prisma.crmLead.create({
      data: {
        companyName: `${TEST_PREFIX} Other Owner`,
        contactName: "Other Owner",
        ownerUserId: otherEmployee.id,
        source: CrmLeadSource.MANUAL,
        status: CrmLeadStatus.NEW,
      },
      select: { id: true },
    });
    return lead.id;
  }

  async function cleanupRuntimeFixtures() {
    const leads = await prisma.crmLead.findMany({
      where: { companyName: { startsWith: TEST_PREFIX } },
      select: { id: true, convertedClientProfileId: true },
    });
    const leadIds = leads.map((lead) => lead.id);
    const convertedClientProfileIds = leads
      .map((lead) => lead.convertedClientProfileId)
      .filter((id): id is string => Boolean(id));

    if (leadIds.length > 0) {
      await prisma.crmLeadActivity.deleteMany({ where: { leadId: { in: leadIds } } });
      await prisma.crmLead.deleteMany({ where: { id: { in: leadIds } } });
    }
    await prisma.clientProfile.deleteMany({
      where: {
        OR: [
          { id: { in: convertedClientProfileIds } },
          { slug: { startsWith: TEST_SLUG_PREFIX } },
        ],
      },
    });
  }
});
