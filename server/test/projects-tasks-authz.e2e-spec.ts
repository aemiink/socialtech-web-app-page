import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Prisma, PrismaClient, Priority, ProjectStatus, TaskStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as cookieParser from "cookie-parser";
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const PROJECTS_PATH = "/api/v1/projects";
const TASKS_PATH = "/api/v1/tasks";
const E2E_PROJECT_NAME_PREFIX = "Authz E2E Project";

type LoginBody = {
  accessToken: string;
};

type ProjectListItem = {
  id: string;
  clientProfileId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  priority: Priority;
  clientProfile?: {
    id: string;
    slug: string;
  };
};

type TaskListItem = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assigneeUserId: string | null;
  project?: {
    id: string;
    clientProfileId: string;
  };
};

type TaskStatusRestore = {
  taskId: string;
  status: TaskStatus;
};

describe("Projects and Tasks Authorization Matrix (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let clientToken = "";

  let clientOwnProfileId = "";
  let employeeUserId = "";
  let employeeAssignedClientIds: string[] = [];
  let employeeUnassignedProjectId = "";
  let clientOtherTaskId = "";
  let employeeOwnTaskId = "";
  let employeeOwnTaskOriginalStatus: TaskStatus = TaskStatus.TODO;
  let employeeOtherTaskId = "";
  let employeeOtherTaskProjectId = "";
  let createdProjectId = "";
  const taskStatusRestores: TaskStatusRestore[] = [];

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

    await cleanupProjectTaskAuthzArtifacts();
    await setDeterministicDemoPasswords();

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    employeeToken = await loginWithDemoUser("performance@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    await resolveRuntimeFixtures();
  });

  afterAll(async () => {
    await restoreMutatedTaskStatuses();
    await cleanupProjectTaskAuthzArtifacts();

    await prisma.$disconnect();
    await app.close();
  });

  it("admin projects list returns 200 with project fields", async () => {
    const response = await request(app.getHttpServer())
      .get(PROJECTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const projects = response.body as ProjectListItem[];
    const expectedProjectIds = await getProjectIds({});

    expect(Array.isArray(projects)).toBe(true);
    expect(toSortedIds(projects)).toEqual(expectedProjectIds);
    expect(projects[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        clientProfileId: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
        status: expect.any(String),
        priority: expect.any(String),
      }),
    );
  });

  it("client projects list only returns own projects", async () => {
    const response = await request(app.getHttpServer())
      .get(PROJECTS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const projects = response.body as ProjectListItem[];
    const expectedProjectIds = await getProjectIds({ clientProfileId: clientOwnProfileId });

    expect(toSortedIds(projects)).toEqual(expectedProjectIds);
    expect(projects.every((project) => project.clientProfileId === clientOwnProfileId)).toBe(true);
  });

  it("employee projects list only returns assigned client projects", async () => {
    const response = await request(app.getHttpServer())
      .get(PROJECTS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const projects = response.body as ProjectListItem[];
    const expectedProjectIds = await getProjectIds({
      clientProfileId: { in: employeeAssignedClientIds },
    });

    expect(toSortedIds(projects)).toEqual(expectedProjectIds);
    expect(
      projects.every((project) => employeeAssignedClientIds.includes(project.clientProfileId)),
    ).toBe(true);
  });

  it("employee unassigned project detail returns safe 404", async () => {
    await request(app.getHttpServer())
      .get(`${PROJECTS_PATH}/${employeeUnassignedProjectId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(404);
  });

  it("admin can create project", async () => {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { slug: "acme-e-ticaret" },
      select: { id: true },
    });
    if (!clientProfile) {
      throw new Error("Expected seeded client profile acme-e-ticaret.");
    }

    const projectName = `${E2E_PROJECT_NAME_PREFIX} ${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post(PROJECTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        clientProfileId: clientProfile.id,
        name: projectName,
        description: "Created by Projects + Tasks authz e2e coverage.",
        status: ProjectStatus.PLANNED,
        priority: Priority.MEDIUM,
        startDate: "2026-05-01",
        dueDate: "2026-06-01",
      })
      .expect(201);

    const project = response.body as ProjectListItem;
    expect(project).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        clientProfileId: clientProfile.id,
        name: projectName,
        status: ProjectStatus.PLANNED,
        priority: Priority.MEDIUM,
      }),
    );
    expect(project.slug).toEqual(expect.stringMatching(/^authz-e2e-project/));
    createdProjectId = project.id;
  });

  it("non-admin cannot create project", async () => {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { slug: "acme-e-ticaret" },
      select: { id: true },
    });
    if (!clientProfile) {
      throw new Error("Expected seeded client profile acme-e-ticaret.");
    }

    await request(app.getHttpServer())
      .post(PROJECTS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        clientProfileId: clientProfile.id,
        name: `${E2E_PROJECT_NAME_PREFIX} Forbidden`,
        status: ProjectStatus.PLANNED,
        priority: Priority.MEDIUM,
      })
      .expect(403);
  });

  it("admin tasks list returns 200 with task fields", async () => {
    const response = await request(app.getHttpServer())
      .get(TASKS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const tasks = response.body as TaskListItem[];
    const expectedTaskIds = await getTaskIds({});

    expect(Array.isArray(tasks)).toBe(true);
    expect(toSortedIds(tasks)).toEqual(expectedTaskIds);
    expect(tasks[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        projectId: expect.any(String),
        title: expect.any(String),
        status: expect.any(String),
        priority: expect.any(String),
      }),
    );
  });

  it("employee sees assigned tasks", async () => {
    const response = await request(app.getHttpServer())
      .get(TASKS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .expect(200);

    const tasks = response.body as TaskListItem[];
    const expectedTaskIds = await getTaskIds({
      project: { clientProfileId: { in: employeeAssignedClientIds } },
    });

    expect(toSortedIds(tasks)).toEqual(expectedTaskIds);
    expect(tasks.every((task) => task.project && employeeAssignedClientIds.includes(task.project.clientProfileId))).toBe(
      true,
    );
  });

  it("client sees own project tasks", async () => {
    const response = await request(app.getHttpServer())
      .get(TASKS_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const tasks = response.body as TaskListItem[];
    const expectedTaskIds = await getTaskIds({
      project: { clientProfileId: clientOwnProfileId },
    });

    expect(toSortedIds(tasks)).toEqual(expectedTaskIds);
    expect(tasks.every((task) => task.project?.clientProfileId === clientOwnProfileId)).toBe(true);
  });

  it("client cannot see another client task detail", async () => {
    await request(app.getHttpServer())
      .get(`${TASKS_PATH}/${clientOtherTaskId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(404);
  });

  it("employee can update own task status", async () => {
    const nextStatus =
      employeeOwnTaskOriginalStatus === TaskStatus.IN_PROGRESS
        ? TaskStatus.REVIEW
        : TaskStatus.IN_PROGRESS;

    const response = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOwnTaskId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ status: nextStatus })
      .expect(200);

    const task = response.body as TaskListItem;
    expect(task).toEqual(
      expect.objectContaining({
        id: employeeOwnTaskId,
        assigneeUserId: employeeUserId,
        status: nextStatus,
      }),
    );
    taskStatusRestores.push({ taskId: employeeOwnTaskId, status: employeeOwnTaskOriginalStatus });
  });

  it("employee cannot update another task title, assignee, or project", async () => {
    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOtherTaskId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        title: "Unauthorized title change",
        assigneeUserId: employeeUserId,
        projectId: employeeOtherTaskProjectId,
      })
      .expect(403);
  });

  it("client cannot update task", async () => {
    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOwnTaskId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ status: TaskStatus.DONE })
      .expect(403);
  });

  it("employee cannot read tasks of a deactivated assignment client", async () => {
    const assignment = await prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId,
        isActive: true,
      },
      select: {
        id: true,
        clientProfileId: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!assignment) {
      throw new Error("Expected at least one active assignment for the performance employee.");
    }

    const scopedTask = await prisma.task.findFirst({
      where: {
        project: {
          clientProfileId: assignment.clientProfileId,
        },
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!scopedTask) {
      throw new Error("Expected at least one task in an assigned client profile.");
    }

    await prisma.employeeClientAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false },
    });

    try {
      await request(app.getHttpServer())
        .get(`${TASKS_PATH}/${scopedTask.id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(404);
    } finally {
      await prisma.employeeClientAssignment.update({
        where: { id: assignment.id },
        data: { isActive: true },
      });
    }
  });

  it("unauthenticated protected request returns 401", async () => {
    await request(app.getHttpServer()).get(PROJECTS_PATH).expect(401);
  });

  async function setDeterministicDemoPasswords(): Promise<void> {
    const deterministicPasswordHash = await bcrypt.hash("demo123", 10);
    await prisma.user.updateMany({
      where: {
        email: {
          in: ["admin@socialtech.com", "performance@socialtech.com", "client@socialtech.com"],
        },
      },
      data: { passwordHash: deterministicPasswordHash },
    });
  }

  async function resolveRuntimeFixtures(): Promise<void> {
    const clientUser = await prisma.user.findUnique({
      where: { email: "client@socialtech.com" },
      select: { id: true, clientProfileId: true },
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
    employeeUserId = employeeUser.id;

    const assignmentRows = await prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId,
        isActive: true,
      },
      select: { clientProfileId: true },
      orderBy: { clientProfileId: "asc" },
    });
    employeeAssignedClientIds = assignmentRows.map((assignment) => assignment.clientProfileId);
    if (employeeAssignedClientIds.length === 0) {
      throw new Error("Expected performance employee to have active client assignments.");
    }

    const employeeUnassignedProject = await prisma.project.findFirst({
      where: {
        clientProfileId: { notIn: employeeAssignedClientIds },
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!employeeUnassignedProject) {
      throw new Error("Expected at least one project outside performance employee assignments.");
    }
    employeeUnassignedProjectId = employeeUnassignedProject.id;

    const taskOutsideClientScope = await prisma.task.findFirst({
      where: {
        project: {
          clientProfileId: { not: clientOwnProfileId },
        },
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!taskOutsideClientScope) {
      throw new Error("Expected at least one task outside the demo client's project scope.");
    }
    clientOtherTaskId = taskOutsideClientScope.id;

    const employeeOwnTask = await prisma.task.findFirst({
      where: { assigneeUserId: employeeUserId },
      select: { id: true, status: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!employeeOwnTask) {
      throw new Error("Expected at least one task assigned to the performance employee.");
    }
    employeeOwnTaskId = employeeOwnTask.id;
    employeeOwnTaskOriginalStatus = employeeOwnTask.status;

    const employeeOtherTask = await prisma.task.findFirst({
      where: {
        assigneeUserId: { not: employeeUserId },
      },
      select: { id: true, projectId: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!employeeOtherTask) {
      throw new Error("Expected at least one task not assigned to the performance employee.");
    }
    employeeOtherTaskId = employeeOtherTask.id;
    employeeOtherTaskProjectId = employeeOtherTask.projectId;
  }

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

  async function getProjectIds(where: Prisma.ProjectWhereInput): Promise<string[]> {
    const rows = await prisma.project.findMany({
      where,
      select: { id: true },
    });

    return rows.map((row) => row.id).sort();
  }

  async function getTaskIds(where: Prisma.TaskWhereInput): Promise<string[]> {
    const rows = await prisma.task.findMany({
      where,
      select: { id: true },
    });

    return rows.map((row) => row.id).sort();
  }

  async function restoreMutatedTaskStatuses(): Promise<void> {
    for (const restore of taskStatusRestores) {
      await prisma.task.update({
        where: { id: restore.taskId },
        data: { status: restore.status },
      });
    }
  }

  async function cleanupProjectTaskAuthzArtifacts(): Promise<void> {
    if (createdProjectId) {
      await prisma.task.deleteMany({
        where: { projectId: createdProjectId },
      });
      await prisma.project.deleteMany({
        where: { id: createdProjectId },
      });
      createdProjectId = "";
    }

    await prisma.task.deleteMany({
      where: {
        project: {
          name: { startsWith: E2E_PROJECT_NAME_PREFIX },
        },
      },
    });
    await prisma.project.deleteMany({
      where: {
        name: { startsWith: E2E_PROJECT_NAME_PREFIX },
      },
    });
  }

  function toSortedIds(items: Array<{ id: string }>): string[] {
    return items.map((item) => item.id).sort();
  }
});
