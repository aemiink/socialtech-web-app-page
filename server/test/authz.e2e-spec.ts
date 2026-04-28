import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import * as cookieParser from "cookie-parser";
import * as bcrypt from "bcryptjs";
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

type LoginBody = {
  accessToken: string;
};

type UserListItem = {
  id: string;
  email: string;
  passwordHash?: unknown;
  tokenHash?: unknown;
  refreshTokens?: unknown;
};

type ClientListItem = {
  id: string;
  slug: string;
};

describe("Authorization Matrix (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";

  let allClientIds: string[] = [];
  let clientOwnProfileId = "";
  let employeeAssignedClientIds: string[] = [];
  let employeeAssignedClientId = "";
  let employeeUnassignedClientId = "";

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

    const deterministicPasswordHash = await bcrypt.hash("demo123", 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    employeeToken = await loginWithDemoUser("performance@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    const clientProfiles = await prisma.clientProfile.findMany({
      select: { id: true },
      orderBy: { companyName: "asc" },
    });
    allClientIds = clientProfiles.map((item) => item.id);
    if (allClientIds.length < 2) {
      throw new Error("Expected at least 2 client profiles for authz e2e tests.");
    }

    const clientUser = await prisma.user.findUnique({
      where: { email: "client@socialtech.com" },
      select: { clientProfileId: true },
    });
    if (!clientUser?.clientProfileId) {
      throw new Error("Client demo user must have a linked clientProfileId.");
    }
    clientOwnProfileId = clientUser.clientProfileId;

    const employeeUser = await prisma.user.findUnique({
      where: { email: "performance@socialtech.com" },
      select: { id: true },
    });
    if (!employeeUser) {
      throw new Error("Performance demo employee not found.");
    }

    const assignmentRows = await prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId: employeeUser.id,
        isActive: true,
      },
      select: { clientProfileId: true },
      orderBy: { clientProfileId: "asc" },
    });

    employeeAssignedClientIds = assignmentRows.map((assignment) => assignment.clientProfileId);
    if (employeeAssignedClientIds.length === 0) {
      throw new Error("Expected performance demo employee to have active assignments.");
    }

    employeeAssignedClientId = employeeAssignedClientIds[0];
    const unassigned = allClientIds.find((clientId) => !employeeAssignedClientIds.includes(clientId));
    if (!unassigned) {
      throw new Error("Expected at least one unassigned client profile for performance employee.");
    }
    employeeUnassignedClientId = unassigned;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("admin users list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const users = response.body as UserListItem[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).not.toHaveProperty("passwordHash");
    expect(users[0]).not.toHaveProperty("tokenHash");
    expect(users[0]).not.toHaveProperty("refreshTokens");
  });

  it("client users list göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("employee users list göremez", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(403);
  });

  it("admin tüm clients listesini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const clients = response.body as ClientListItem[];
    const returnedIds = clients.map((client) => client.id).sort();
    const expectedIds = [...allClientIds].sort();
    expect(returnedIds).toEqual(expectedIds);
  });

  it("client clients/me endpointini görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients/me")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const ownProfile = response.body as ClientListItem;
    expect(ownProfile.id).toBe(clientOwnProfileId);
  });

  it("client başka client id'ye erişemez", async () => {
    const otherClientId = allClientIds.find((clientId) => clientId !== clientOwnProfileId);
    expect(otherClientId).toBeDefined();

    await request(app.getHttpServer())
      .get(`/api/v1/clients/${otherClientId as string}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("employee sadece assigned clients list görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/clients")
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const clients = response.body as ClientListItem[];
    const returnedIds = clients.map((client) => client.id).sort();
    const expectedIds = [...employeeAssignedClientIds].sort();
    expect(returnedIds).toEqual(expectedIds);
  });

  it("employee assigned client detail görebilir", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeAssignedClientId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const client = response.body as ClientListItem;
    expect(client.id).toBe(employeeAssignedClientId);
  });

  it("employee unassigned client detail için 404 alır", async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/clients/${employeeUnassignedClientId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(404);
  });

  it("unauthenticated request 401 alır", async () => {
    await request(app.getHttpServer()).get("/api/v1/clients").expect(401);
  });

  async function loginWithDemoUser(email: string): Promise<string> {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({
      email,
      password: "demo123",
    });

    expect([200, 201]).toContain(response.status);
    const body = response.body as LoginBody;
    if (!body.accessToken || typeof body.accessToken !== "string") {
      throw new Error(`Missing access token in login response for ${email}`);
    }

    return body.accessToken;
  }
});
