import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  Prisma,
  PrismaClient,
  Priority,
  ProjectStatus,
  PurchasedServiceKey,
  TaskStatus,
  TaskTodoVisibility,
  TaskType,
  UserRole,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const PROJECTS_PATH = "/api/v1/projects";
const TASKS_PATH = "/api/v1/tasks";
const E2E_PROJECT_NAME_PREFIX = "Authz E2E Project";
const E2E_TODO_TITLE_PREFIX = "Authz E2E Todo";
const E2E_META_APPROVAL_TASK_PREFIX = "Authz E2E Meta Approval";
const E2E_TIKTOK_APPROVAL_TASK_PREFIX = "Authz E2E TikTok Approval";
const E2E_AMAZON_APPROVAL_TASK_PREFIX = "Authz E2E Amazon Approval";
const E2E_GROWTH_HUB_APPROVAL_TASK_PREFIX = "Authz E2E Growth Hub Approval";

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
  todos: TaskTodoItem[];
  completion: TaskCompletion;
};

type TaskTodoItem = {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  visibility: TaskTodoVisibility;
  isCompleted: boolean;
  completedAt: string | null;
  completedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  remainingTodos: number;
  completionPercentage: number;
  isComplete: boolean;
};

type TaskStatusRestore = {
  taskId: string;
  status: TaskStatus;
};

type TaskTodoRestore = {
  todoId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  completedByUserId: string | null;
};

type TaskTodoState = {
  id: string;
  isCompleted: boolean;
  completedAt: Date | null;
  completedByUserId: string | null;
};

describe("Projects and Tasks Authorization Matrix (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let employeeToken = "";
  let projectManagerToken = "";
  let clientToken = "";

  let clientOwnProfileId = "";
  let employeeUserId = "";
  let employeeAssignedClientIds: string[] = [];
  let projectManagerUserId = "";
  let projectManagerAssignedClientIds: string[] = [];
  let projectManagerAssignedProjectId = "";
  let employeeUnassignedProjectId = "";
  let clientOtherTaskId = "";
  let clientOwnMetaApprovalTaskId = "";
  let clientOtherMetaApprovalTaskId = "";
  let employeeOwnTaskId = "";
  let employeeOwnTaskOriginalStatus: TaskStatus = TaskStatus.TODO;
  let taskWithMixedTodosId = "";
  let employeeOwnTaskTodoId = "";
  let employeeScopedOtherTaskId = "";
  let employeeScopedOtherTaskProjectId = "";
  let employeeScopedOtherTaskTodoId = "";
  let employeeOutOfScopeTaskId = "";
  let employeeOutOfScopeTaskTodoId = "";
  let clientVisibleTodoId = "";
  let clientOwnMetaAdsProjectId = "";
  let clientOwnTikTokAdsProjectId = "";
  let clientOwnAmazonAdsProjectId = "";
  let clientOwnGrowthHubProjectId = "";
  let createdProjectId = "";
  const taskStatusRestores: TaskStatusRestore[] = [];
  const taskTodoRestores: TaskTodoRestore[] = [];

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
    projectManagerToken = await loginWithDemoUser("project@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    await resolveRuntimeFixtures();
  });

  afterAll(async () => {
    await restoreMutatedTaskStatuses();
    await restoreMutatedTaskTodos();
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

  it("project manager can create project in assigned client scope", async () => {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { slug: "acme-e-ticaret" },
      select: { id: true },
    });
    if (!clientProfile) {
      throw new Error("Expected seeded client profile acme-e-ticaret.");
    }

    const projectName = `${E2E_PROJECT_NAME_PREFIX} PM ${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post(PROJECTS_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        clientProfileId: clientProfile.id,
        serviceKey: "GROWTH_HUB",
        name: projectName,
        status: ProjectStatus.PLANNED,
        priority: Priority.MEDIUM,
      })
      .expect(201);

    const project = response.body as ProjectListItem;
    expect(project.clientProfileId).toBe(clientProfile.id);
    expect(project.name).toBe(projectName);
    createdProjectId = project.id;
  });

  it("project manager cannot create project for out-of-scope client when assignment inactive", async () => {
    const assignment = await prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: projectManagerUserId,
        clientProfileId: { in: projectManagerAssignedClientIds },
        isActive: true,
      },
      select: { id: true, clientProfileId: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!assignment) {
      throw new Error("Expected at least one active assignment for project manager.");
    }

    await prisma.employeeClientAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false },
    });

    try {
      await request(app.getHttpServer())
        .post(PROJECTS_PATH)
        .set("Authorization", `Bearer ${projectManagerToken}`)
        .send({
          clientProfileId: assignment.clientProfileId,
          serviceKey: "GROWTH_HUB",
          name: `${E2E_PROJECT_NAME_PREFIX} PM Blocked ${Date.now()}`,
          status: ProjectStatus.PLANNED,
          priority: Priority.MEDIUM,
        })
        .expect(404);
    } finally {
      await prisma.employeeClientAssignment.update({
        where: { id: assignment.id },
        data: { isActive: true },
      });
    }
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

  it("task responses include todos and client-visible completion", async () => {
    const adminResponse = await request(app.getHttpServer())
      .get(`${TASKS_PATH}/${taskWithMixedTodosId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const adminTask = expectTaskResponse(adminResponse.body);
    expect(adminTask.todos.some((todo) => todo.visibility === TaskTodoVisibility.INTERNAL)).toBe(true);
    expect(adminTask.todos.some((todo) => todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE)).toBe(true);
    expectCompletionMatchesTodos(adminTask);

    const clientResponse = await request(app.getHttpServer())
      .get(`${TASKS_PATH}/${taskWithMixedTodosId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const clientTask = expectTaskResponse(clientResponse.body);
    const clientVisibleTodos = adminTask.todos.filter(
      (todo) => todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE,
    );
    expect(clientTask.todos).toHaveLength(clientVisibleTodos.length);
    expect(clientTask.todos.every((todo) => todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE)).toBe(true);
    expectCompletionMatchesTodos(clientTask);
    expect(clientTask.completion.totalTodos).toBe(clientVisibleTodos.length);
    expect(clientTask.completion.completedTodos).toBe(
      clientVisibleTodos.filter((todo) => todo.isCompleted).length,
    );
  });

  it("client cannot see another client task detail", async () => {
    await request(app.getHttpServer())
      .get(`${TASKS_PATH}/${clientOtherTaskId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(404);
  });

  it("admin can create, update, and delete task todos", async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`${TASKS_PATH}/${employeeOwnTaskId}/todos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `${E2E_TODO_TITLE_PREFIX} Admin CRUD`,
        description: "Created by projects-tasks authz e2e.",
        visibility: TaskTodoVisibility.INTERNAL,
      })
      .expect(201);

    const createdTask = expectTaskResponse(createResponse.body);
    const createdTodo = expectTodoByTitle(createdTask, `${E2E_TODO_TITLE_PREFIX} Admin CRUD`);
    expect(createdTodo.visibility).toBe(TaskTodoVisibility.INTERNAL);
    expectCompletionMatchesTodos(createdTask);

    const updateResponse = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOwnTaskId}/todos/${createdTodo.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: `${E2E_TODO_TITLE_PREFIX} Admin CRUD Updated`,
        visibility: TaskTodoVisibility.CLIENT_VISIBLE,
      })
      .expect(200);

    const updatedTask = expectTaskResponse(updateResponse.body);
    const updatedTodo = expectTodoByTitle(updatedTask, `${E2E_TODO_TITLE_PREFIX} Admin CRUD Updated`);
    expect(updatedTodo.visibility).toBe(TaskTodoVisibility.CLIENT_VISIBLE);

    const deleteResponse = await request(app.getHttpServer())
      .delete(`${TASKS_PATH}/${employeeOwnTaskId}/todos/${createdTodo.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const taskAfterDelete = expectTaskResponse(deleteResponse.body);
    expect(taskAfterDelete.todos.some((todo) => todo.id === createdTodo.id)).toBe(false);
    expectCompletionMatchesTodos(taskAfterDelete);
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

  it("employee can toggle todos on tasks within assignment scope", async () => {
    const todoBefore = await getTaskTodoState(employeeOwnTaskTodoId);
    taskTodoRestores.push({
      todoId: employeeOwnTaskTodoId,
      isCompleted: todoBefore.isCompleted,
      completedAt: todoBefore.completedAt,
      completedByUserId: todoBefore.completedByUserId,
    });

    const nextIsCompleted = !todoBefore.isCompleted;
    const response = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOwnTaskId}/todos/${employeeOwnTaskTodoId}/toggle`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ isCompleted: nextIsCompleted })
      .expect(200);

    const task = expectTaskResponse(response.body);
    const todo = expectTodoById(task, employeeOwnTaskTodoId);
    expect(todo.isCompleted).toBe(nextIsCompleted);
    expect(todo.completedByUserId).toBe(nextIsCompleted ? employeeUserId : null);
    expectCompletionMatchesTodos(task);

    const scopedTodoBefore = await getTaskTodoState(employeeScopedOtherTaskTodoId);
    taskTodoRestores.push({
      todoId: employeeScopedOtherTaskTodoId,
      isCompleted: scopedTodoBefore.isCompleted,
      completedAt: scopedTodoBefore.completedAt,
      completedByUserId: scopedTodoBefore.completedByUserId,
    });

    const scopedNextIsCompleted = !scopedTodoBefore.isCompleted;
    const scopedResponse = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeScopedOtherTaskId}/todos/${employeeScopedOtherTaskTodoId}/toggle`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ isCompleted: scopedNextIsCompleted })
      .expect(200);

    const scopedTask = expectTaskResponse(scopedResponse.body);
    const scopedTodo = expectTodoById(scopedTask, employeeScopedOtherTaskTodoId);
    expect(scopedTodo.isCompleted).toBe(scopedNextIsCompleted);
    expect(scopedTodo.completedByUserId).toBe(scopedNextIsCompleted ? employeeUserId : null);
    expectCompletionMatchesTodos(scopedTask);

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeOutOfScopeTaskId}/todos/${employeeOutOfScopeTaskTodoId}/toggle`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ isCompleted: true })
      .expect(404);
  });

  it("employee cannot update another task title, assignee, or project", async () => {
    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${employeeScopedOtherTaskId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        title: "Unauthorized title change",
        assigneeUserId: employeeUserId,
        projectId: employeeScopedOtherTaskProjectId,
      })
      .expect(403);
  });

  it("project manager can create task and manage todos in assigned project scope", async () => {
    const response = await request(app.getHttpServer())
      .post(TASKS_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        projectId: projectManagerAssignedProjectId,
        title: "PM Authz Task",
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeUserId: employeeUserId,
      })
      .expect(201);

    const task = expectTaskResponse(response.body);
    expect(task.projectId).toBe(projectManagerAssignedProjectId);
    expect(task.assigneeUserId).toBe(employeeUserId);

    const todoCreate = await request(app.getHttpServer())
      .post(`${TASKS_PATH}/${task.id}/todos`)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        title: `${E2E_TODO_TITLE_PREFIX} PM`,
        visibility: TaskTodoVisibility.INTERNAL,
      })
      .expect(201);

    const taskWithTodo = expectTaskResponse(todoCreate.body);
    const createdTodo = expectTodoByTitle(taskWithTodo, `${E2E_TODO_TITLE_PREFIX} PM`);

    const toggleResponse = await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${task.id}/todos/${createdTodo.id}/toggle`)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({ isCompleted: true })
      .expect(200);

    const toggledTask = expectTaskResponse(toggleResponse.body);
    const toggledTodo = expectTodoById(toggledTask, createdTodo.id);
    expect(toggledTodo.isCompleted).toBe(true);
  });

  it("meta ads approval task creation requires metaAds.approvals.create.assigned permission", async () => {
    const scopedMetaAdsProject = await prisma.project.findFirst({
      where: {
        clientProfileId: { in: projectManagerAssignedClientIds },
        serviceKey: PurchasedServiceKey.META_ADS,
      },
      select: { id: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
    if (!scopedMetaAdsProject) {
      throw new Error("Expected at least one assigned META_ADS project for project manager.");
    }

    const permission = await prisma.permission.findUnique({
      where: { slug: "metaAds.approvals.create.assigned" },
      select: { id: true },
    });
    if (!permission) {
      throw new Error("Expected metaAds.approvals.create.assigned permission to exist.");
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role: UserRole.PROJECT_MANAGER,
        permissionId: permission.id,
      },
    });

    try {
      await request(app.getHttpServer())
        .post(TASKS_PATH)
        .set("Authorization", `Bearer ${projectManagerToken}`)
        .send({
          projectId: scopedMetaAdsProject.id,
          title: "PM Meta Ads Approval Permission Test",
          status: TaskStatus.REVIEW,
          priority: Priority.HIGH,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.META_ADS_CAMPAIGN_APPROVAL,
        })
        .expect(403);
    } finally {
      await prisma.rolePermission.createMany({
        data: [{ role: UserRole.PROJECT_MANAGER, permissionId: permission.id }],
        skipDuplicates: true,
      });
    }
  });

  it("assigned specialist can create TikTok Ads approval task with TikTok approval permission", async () => {
    const response = await request(app.getHttpServer())
      .post(TASKS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        projectId: clientOwnTikTokAdsProjectId,
        title: `${E2E_TIKTOK_APPROVAL_TASK_PREFIX} Specialist ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        type: TaskType.REVISION,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.TIKTOK_ADS_BUDGET_CHANGE_APPROVAL,
      })
      .expect(201);

    const task = expectTaskResponse(response.body) as TaskListItem & {
      approvalRequired?: boolean;
      approvalType?: MetaAdsApprovalType | null;
      approvalStatus?: MetaAdsApprovalStatus | null;
    };
    expect(task.projectId).toBe(clientOwnTikTokAdsProjectId);
    expect(task.approvalRequired).toBe(true);
    expect(task.approvalType).toBe(MetaAdsApprovalType.TIKTOK_ADS_BUDGET_CHANGE_APPROVAL);
    expect(task.approvalStatus).toBe(MetaAdsApprovalStatus.PENDING);
  });

  it("assigned specialist can create Amazon Ads approval task with Amazon approval permission", async () => {
    const response = await request(app.getHttpServer())
      .post(TASKS_PATH)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        projectId: clientOwnAmazonAdsProjectId,
        title: `${E2E_AMAZON_APPROVAL_TASK_PREFIX} Specialist ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        type: TaskType.REVISION,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.AMAZON_ADS_BUDGET_CHANGE_APPROVAL,
      })
      .expect(201);

    const task = expectTaskResponse(response.body) as TaskListItem & {
      approvalRequired?: boolean;
      approvalType?: MetaAdsApprovalType | null;
      approvalStatus?: MetaAdsApprovalStatus | null;
    };
    expect(task.projectId).toBe(clientOwnAmazonAdsProjectId);
    expect(task.approvalRequired).toBe(true);
    expect(task.approvalType).toBe(MetaAdsApprovalType.AMAZON_ADS_BUDGET_CHANGE_APPROVAL);
    expect(task.approvalStatus).toBe(MetaAdsApprovalStatus.PENDING);
  });

  it("TikTok Ads approval task creation requires tiktokAds.approvals.create.assigned permission", async () => {
    const permission = await prisma.permission.findUnique({
      where: { slug: "tiktokAds.approvals.create.assigned" },
      select: { id: true },
    });
    if (!permission) {
      throw new Error("Expected tiktokAds.approvals.create.assigned permission to exist.");
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role: UserRole.PERFORMANCE_SPECIALIST,
        permissionId: permission.id,
      },
    });

    try {
      await request(app.getHttpServer())
        .post(TASKS_PATH)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          projectId: clientOwnTikTokAdsProjectId,
          title: `${E2E_TIKTOK_APPROVAL_TASK_PREFIX} Permission ${Date.now()}`,
          status: TaskStatus.REVIEW,
          priority: Priority.HIGH,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.TIKTOK_ADS_BUDGET_CHANGE_APPROVAL,
        })
        .expect(403);
    } finally {
      await prisma.rolePermission.createMany({
        data: [{ role: UserRole.PERFORMANCE_SPECIALIST, permissionId: permission.id }],
        skipDuplicates: true,
      });
    }
  });

  it("Amazon Ads approval task creation requires amazonAds.approvals.create.assigned permission", async () => {
    const permission = await prisma.permission.findUnique({
      where: { slug: "amazonAds.approvals.create.assigned" },
      select: { id: true },
    });
    if (!permission) {
      throw new Error("Expected amazonAds.approvals.create.assigned permission to exist.");
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role: UserRole.PERFORMANCE_SPECIALIST,
        permissionId: permission.id,
      },
    });

    try {
      await request(app.getHttpServer())
        .post(TASKS_PATH)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          projectId: clientOwnAmazonAdsProjectId,
          title: `${E2E_AMAZON_APPROVAL_TASK_PREFIX} Permission ${Date.now()}`,
          status: TaskStatus.REVIEW,
          priority: Priority.HIGH,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.AMAZON_ADS_PRODUCT_PROMOTION_APPROVAL,
        })
        .expect(403);
    } finally {
      await prisma.rolePermission.createMany({
        data: [{ role: UserRole.PERFORMANCE_SPECIALIST, permissionId: permission.id }],
        skipDuplicates: true,
      });
    }
  });

  it("project manager cannot assign task to employee outside client assignment scope", async () => {
    const scopedProject = await prisma.project.findUnique({
      where: { id: projectManagerAssignedProjectId },
      select: { clientProfileId: true },
    });
    if (!scopedProject) {
      throw new Error("Expected scoped project for project manager.");
    }

    const outOfScopeEmployee = await prisma.user.findFirst({
      where: {
        accountType: "EMPLOYEE",
        employeeClientAssignments: {
          none: {
            clientProfileId: scopedProject.clientProfileId,
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (!outOfScopeEmployee) {
      throw new Error("Expected an out-of-scope employee candidate for assignment test.");
    }

    await request(app.getHttpServer())
      .post(TASKS_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        projectId: projectManagerAssignedProjectId,
        title: "PM Out Of Scope Assignee",
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeUserId: outOfScopeEmployee.id,
      })
      .expect(400);
  });

  it("client cannot mutate task todos", async () => {
    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${taskWithMixedTodosId}/todos/${clientVisibleTodoId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ title: "Unauthorized client todo update" })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${taskWithMixedTodosId}/todos/${clientVisibleTodoId}/toggle`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ isCompleted: true })
      .expect(403);
  });

  it("client can approve own meta ads approval task", async () => {
    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${clientOwnMetaApprovalTaskId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(200);

    const updated = await prisma.task.findUnique({
      where: { id: clientOwnMetaApprovalTaskId },
      select: {
        approvalStatus: true,
        approvalResponseNote: true,
        approvalRespondedAt: true,
        status: true,
      },
    });
    expect(updated).toEqual(
      expect.objectContaining({
        approvalStatus: MetaAdsApprovalStatus.APPROVED,
        approvalResponseNote: null,
        status: TaskStatus.DONE,
      }),
    );
    expect(updated?.approvalRespondedAt).toBeTruthy();
  });

  it("client can approve own TikTok Ads approval task", async () => {
    const pendingApproval = await prisma.task.create({
      data: {
        projectId: clientOwnTikTokAdsProjectId,
        title: `${E2E_TIKTOK_APPROVAL_TASK_PREFIX} Own ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        type: TaskType.REVISION,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.TIKTOK_ADS_UGC_SCRIPT_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        approvalRequestedAt: new Date(),
      },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${pendingApproval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(200);

    const updated = await prisma.task.findUnique({
      where: { id: pendingApproval.id },
      select: {
        approvalStatus: true,
        approvalResponseNote: true,
        approvalRespondedAt: true,
        status: true,
      },
    });
    expect(updated).toEqual(
      expect.objectContaining({
        approvalStatus: MetaAdsApprovalStatus.APPROVED,
        approvalResponseNote: null,
        status: TaskStatus.DONE,
      }),
    );
    expect(updated?.approvalRespondedAt).toBeTruthy();
  });

  it("client can approve own Growth Hub approval task", async () => {
    const pendingApproval = await prisma.task.create({
      data: {
        projectId: clientOwnGrowthHubProjectId,
        title: `${E2E_GROWTH_HUB_APPROVAL_TASK_PREFIX} Own ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.MEDIUM,
        type: TaskType.REVISION,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.META_ADS_STRATEGY_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        approvalRequestedAt: new Date(),
      },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${pendingApproval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(200);

    const updated = await prisma.task.findUnique({
      where: { id: pendingApproval.id },
      select: {
        approvalStatus: true,
        approvalResponseNote: true,
        approvalRespondedAt: true,
        status: true,
      },
    });
    expect(updated).toEqual(
      expect.objectContaining({
        approvalStatus: MetaAdsApprovalStatus.APPROVED,
        approvalResponseNote: null,
        status: TaskStatus.DONE,
      }),
    );
    expect(updated?.approvalRespondedAt).toBeTruthy();
  });

  it("client can acknowledge own Amazon Ads report approval task", async () => {
    const pendingApproval = await prisma.task.create({
      data: {
        projectId: clientOwnAmazonAdsProjectId,
        title: `${E2E_AMAZON_APPROVAL_TASK_PREFIX} Report ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.MEDIUM,
        type: TaskType.QA,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.AMAZON_ADS_REPORT_ACKNOWLEDGEMENT,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        approvalRequestedAt: new Date(),
      },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${pendingApproval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.ACKNOWLEDGED })
      .expect(200);

    const updated = await prisma.task.findUnique({
      where: { id: pendingApproval.id },
      select: {
        approvalStatus: true,
        approvalResponseNote: true,
        approvalRespondedAt: true,
        status: true,
      },
    });
    expect(updated).toEqual(
      expect.objectContaining({
        approvalStatus: MetaAdsApprovalStatus.ACKNOWLEDGED,
        approvalResponseNote: null,
        status: TaskStatus.DONE,
      }),
    );
    expect(updated?.approvalRespondedAt).toBeTruthy();
  });

  it("client can request changes with rejection note and cannot update out-of-scope approval", async () => {
    const pendingApproval = await prisma.task.create({
      data: {
        projectId: clientOwnMetaAdsProjectId,
        title: `${E2E_META_APPROVAL_TASK_PREFIX} Runtime ${Date.now()}`,
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        type: TaskType.REVISION,
        approvalRequired: true,
        approvalType: MetaAdsApprovalType.META_ADS_CREATIVE_APPROVAL,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        approvalRequestedAt: new Date(),
      },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${pendingApproval.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        approvalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
        approvalResponseNote: "Kreatif metin tonu marka diline göre güncellensin.",
      })
      .expect(200);

    const changed = await prisma.task.findUnique({
      where: { id: pendingApproval.id },
      select: {
        approvalStatus: true,
        approvalResponseNote: true,
        approvalRespondedAt: true,
        status: true,
      },
    });
    expect(changed).toEqual(
      expect.objectContaining({
        approvalStatus: MetaAdsApprovalStatus.CHANGES_REQUESTED,
        approvalResponseNote: "Kreatif metin tonu marka diline göre güncellensin.",
        status: TaskStatus.IN_PROGRESS,
      }),
    );
    expect(changed?.approvalRespondedAt).toBeTruthy();

    const generatedRevisionTask = await prisma.task.findFirst({
      where: {
        projectId: clientOwnMetaAdsProjectId,
        type: TaskType.REVISION,
        approvalRequired: false,
        approvalContext: {
          path: ["sourceApprovalTaskId"],
          equals: pendingApproval.id,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
      },
    });
    expect(generatedRevisionTask).toEqual(
      expect.objectContaining({
        title: expect.stringContaining("Revizyon"),
        status: TaskStatus.TODO,
      }),
    );
    expect(generatedRevisionTask?.description).toContain(
      "Kreatif metin tonu marka diline göre güncellensin.",
    );

    await request(app.getHttpServer())
      .patch(`${TASKS_PATH}/${clientOtherMetaApprovalTaskId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ approvalStatus: MetaAdsApprovalStatus.APPROVED })
      .expect(404);
  });

  it("client cannot update non-approval fields on tasks", async () => {
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
          in: [
            "admin@socialtech.com",
            "performance@socialtech.com",
            "project@socialtech.com",
            "client@socialtech.com",
          ],
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
    clientOwnMetaAdsProjectId = await resolveClientMetaAdsProjectId(clientOwnProfileId);
    clientOwnTikTokAdsProjectId = await resolveClientTikTokAdsProjectId(clientOwnProfileId);
    clientOwnAmazonAdsProjectId = await resolveClientAmazonAdsProjectId(clientOwnProfileId);
    clientOwnGrowthHubProjectId = await resolveClientGrowthHubProjectId(clientOwnProfileId);

    const otherClientMetaAdsProject = await prisma.project.findFirst({
      where: {
        clientProfileId: { not: clientOwnProfileId },
        serviceKey: PurchasedServiceKey.META_ADS,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!otherClientMetaAdsProject) {
      throw new Error("Expected at least one META_ADS project outside the demo client scope.");
    }

    const [ownApprovalTask, otherApprovalTask] = await prisma.$transaction([
      prisma.task.create({
        data: {
          projectId: clientOwnMetaAdsProjectId,
          title: `${E2E_META_APPROVAL_TASK_PREFIX} Own ${Date.now()}`,
          status: TaskStatus.REVIEW,
          priority: Priority.HIGH,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.META_ADS_CREATIVE_APPROVAL,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: new Date(),
        },
        select: { id: true },
      }),
      prisma.task.create({
        data: {
          projectId: otherClientMetaAdsProject.id,
          title: `${E2E_META_APPROVAL_TASK_PREFIX} Other ${Date.now()}`,
          status: TaskStatus.REVIEW,
          priority: Priority.HIGH,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.META_ADS_CAMPAIGN_APPROVAL,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: new Date(),
        },
        select: { id: true },
      }),
    ]);
    clientOwnMetaApprovalTaskId = ownApprovalTask.id;
    clientOtherMetaApprovalTaskId = otherApprovalTask.id;

    const employeeUser = await prisma.user.findUnique({
      where: { email: "performance@socialtech.com" },
      select: { id: true },
    });
    if (!employeeUser) {
      throw new Error("Performance demo employee not found.");
    }
    employeeUserId = employeeUser.id;

    const projectManagerUser = await prisma.user.findUnique({
      where: { email: "project@socialtech.com" },
      select: { id: true },
    });
    if (!projectManagerUser) {
      throw new Error("Project manager demo employee not found.");
    }
    projectManagerUserId = projectManagerUser.id;

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

    const projectManagerAssignmentRows = await prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId: projectManagerUserId,
        isActive: true,
      },
      select: { clientProfileId: true },
      orderBy: { clientProfileId: "asc" },
    });
    projectManagerAssignedClientIds = projectManagerAssignmentRows.map((assignment) => assignment.clientProfileId);
    if (projectManagerAssignedClientIds.length === 0) {
      throw new Error("Expected project manager to have active client assignments.");
    }

    const pmAssignedProject = await prisma.project.findFirst({
      where: {
        clientProfileId: { in: projectManagerAssignedClientIds },
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!pmAssignedProject) {
      throw new Error("Expected at least one project in project manager assignment scope.");
    }
    projectManagerAssignedProjectId = pmAssignedProject.id;

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
    const ownTodo = await findOrCreateTodoForTask(employeeOwnTaskId, "Employee Own");
    employeeOwnTaskTodoId = ownTodo.id;

    const employeeScopedOtherTask = await prisma.task.findFirst({
      where: {
        assigneeUserId: { not: employeeUserId },
        project: {
          clientProfileId: { in: employeeAssignedClientIds },
        },
      },
      select: { id: true, projectId: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!employeeScopedOtherTask) {
      throw new Error(
        "Expected at least one scoped task that is not directly assigned to the performance employee.",
      );
    }
    employeeScopedOtherTaskId = employeeScopedOtherTask.id;
    employeeScopedOtherTaskProjectId = employeeScopedOtherTask.projectId;
    const scopedOtherTodo = await findOrCreateTodoForTask(
      employeeScopedOtherTaskId,
      "Employee Scoped Other",
    );
    employeeScopedOtherTaskTodoId = scopedOtherTodo.id;

    const employeeOutOfScopeTask = await prisma.task.findFirst({
      where: {
        project: {
          clientProfileId: { notIn: employeeAssignedClientIds },
        },
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!employeeOutOfScopeTask) {
      throw new Error("Expected at least one task outside performance employee assignment scope.");
    }
    employeeOutOfScopeTaskId = employeeOutOfScopeTask.id;
    const outOfScopeTodo = await findOrCreateTodoForTask(
      employeeOutOfScopeTaskId,
      "Employee Out Of Scope",
    );
    employeeOutOfScopeTaskTodoId = outOfScopeTodo.id;

    const mixedTodoTask = await prisma.task.findFirst({
      where: {
        project: {
          clientProfileId: clientOwnProfileId,
        },
        AND: [
          { todos: { some: { visibility: TaskTodoVisibility.INTERNAL } } },
          { todos: { some: { visibility: TaskTodoVisibility.CLIENT_VISIBLE } } },
        ],
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!mixedTodoTask) {
      throw new Error("Expected a client-owned task with internal and client-visible todos.");
    }
    taskWithMixedTodosId = mixedTodoTask.id;

    const clientVisibleTodo = await prisma.taskTodo.findFirst({
      where: {
        taskId: taskWithMixedTodosId,
        visibility: TaskTodoVisibility.CLIENT_VISIBLE,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!clientVisibleTodo) {
      throw new Error("Expected a client-visible todo for the mixed todo task.");
    }
    clientVisibleTodoId = clientVisibleTodo.id;
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

  async function findOrCreateTodoForTask(
    taskId: string,
    label: string,
  ): Promise<TaskTodoState> {
    const existingTodo = await prisma.taskTodo.findFirst({
      where: { taskId },
      select: {
        id: true,
        isCompleted: true,
        completedAt: true,
        completedByUserId: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (existingTodo) {
      return existingTodo;
    }

    const createdTodo = await prisma.taskTodo.create({
      data: {
        taskId,
        title: `${E2E_TODO_TITLE_PREFIX} ${label}`,
        visibility: TaskTodoVisibility.INTERNAL,
      },
      select: {
        id: true,
        isCompleted: true,
        completedAt: true,
        completedByUserId: true,
      },
    });

    return createdTodo;
  }

  async function getTaskTodoState(todoId: string): Promise<TaskTodoState> {
    const todo = await prisma.taskTodo.findUnique({
      where: { id: todoId },
      select: {
        id: true,
        isCompleted: true,
        completedAt: true,
        completedByUserId: true,
      },
    });
    if (!todo) {
      throw new Error(`Expected task todo fixture: ${todoId}`);
    }

    return todo;
  }

  async function resolveClientMetaAdsProjectId(clientProfileId: string): Promise<string> {
    const existingMetaAdsProject = await prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.META_ADS,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (existingMetaAdsProject) {
      return existingMetaAdsProject.id;
    }

    const createdProject = await prisma.project.create({
      data: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.META_ADS,
        name: `${E2E_PROJECT_NAME_PREFIX} Meta Ads ${Date.now()}`,
        slug: `authz-meta-ads-${Date.now()}`,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    return createdProject.id;
  }

  async function resolveClientTikTokAdsProjectId(clientProfileId: string): Promise<string> {
    const existingTikTokAdsProject = await prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.TIKTOK_ADS,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (existingTikTokAdsProject) {
      return existingTikTokAdsProject.id;
    }

    const createdProject = await prisma.project.create({
      data: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.TIKTOK_ADS,
        name: `${E2E_PROJECT_NAME_PREFIX} TikTok Ads ${Date.now()}`,
        slug: `authz-tiktok-ads-${Date.now()}`,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    return createdProject.id;
  }

  async function resolveClientAmazonAdsProjectId(clientProfileId: string): Promise<string> {
    const existingAmazonAdsProject = await prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.AMAZON_ADS,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (existingAmazonAdsProject) {
      return existingAmazonAdsProject.id;
    }

    const createdProject = await prisma.project.create({
      data: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.AMAZON_ADS,
        name: `${E2E_PROJECT_NAME_PREFIX} Amazon Ads ${Date.now()}`,
        slug: `authz-amazon-ads-${Date.now()}`,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    return createdProject.id;
  }

  async function resolveClientGrowthHubProjectId(clientProfileId: string): Promise<string> {
    const existingGrowthHubProject = await prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (existingGrowthHubProject) {
      return existingGrowthHubProject.id;
    }

    const createdProject = await prisma.project.create({
      data: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
        name: `${E2E_PROJECT_NAME_PREFIX} Growth Hub ${Date.now()}`,
        slug: `authz-growth-hub-${Date.now()}`,
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    return createdProject.id;
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

  async function restoreMutatedTaskTodos(): Promise<void> {
    for (const restore of taskTodoRestores) {
      await prisma.taskTodo.updateMany({
        where: { id: restore.todoId },
        data: {
          isCompleted: restore.isCompleted,
          completedAt: restore.completedAt,
          completedByUserId: restore.completedByUserId,
        },
      });
    }
  }

  async function cleanupProjectTaskAuthzArtifacts(): Promise<void> {
    await prisma.taskTodo.deleteMany({
      where: { title: { startsWith: E2E_TODO_TITLE_PREFIX } },
    });

    await prisma.task.deleteMany({
      where: { title: { startsWith: E2E_META_APPROVAL_TASK_PREFIX } },
    });
    await prisma.task.deleteMany({
      where: { title: { startsWith: E2E_GROWTH_HUB_APPROVAL_TASK_PREFIX } },
    });

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

  function expectTaskResponse(body: unknown): TaskListItem {
    expect(isRecord(body)).toBe(true);
    if (!isRecord(body)) {
      throw new Error("Expected task response object.");
    }

    const task = body as TaskListItem;
    expect(task.id).toEqual(expect.any(String));
    expect(task.projectId).toEqual(expect.any(String));
    expect(task.title).toEqual(expect.any(String));
    expect(Object.values(TaskStatus)).toContain(task.status);
    expect(Object.values(Priority)).toContain(task.priority);
    expect(Array.isArray(task.todos)).toBe(true);
    for (const todo of task.todos) {
      expect(todo.id).toEqual(expect.any(String));
      expect(todo.taskId).toBe(task.id);
      expect(todo.title).toEqual(expect.any(String));
      expect(Object.values(TaskTodoVisibility)).toContain(todo.visibility);
      expect(typeof todo.isCompleted).toBe("boolean");
      if (todo.completedAt !== null) {
        expect(Number.isNaN(Date.parse(todo.completedAt))).toBe(false);
      }
      expect(Number.isNaN(Date.parse(todo.createdAt))).toBe(false);
      expect(Number.isNaN(Date.parse(todo.updatedAt))).toBe(false);
    }
    expectCompletionMatchesTodos(task);

    return task;
  }

  function expectCompletionMatchesTodos(task: TaskListItem): void {
    const completedTodos = task.todos.filter((todo) => todo.isCompleted).length;
    const totalTodos = task.todos.length;
    expect(task.completion).toEqual(
      expect.objectContaining({
        totalTodos,
        completedTodos,
        remainingTodos: totalTodos - completedTodos,
        completionPercentage:
          totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100),
        isComplete: totalTodos > 0 && completedTodos === totalTodos,
      }),
    );
  }

  function expectTodoByTitle(task: TaskListItem, title: string): TaskTodoItem {
    const todo = task.todos.find((item) => item.title === title);
    expect(todo).toBeDefined();
    if (!todo) {
      throw new Error(`Expected todo with title: ${title}`);
    }

    return todo;
  }

  function expectTodoById(task: TaskListItem, todoId: string): TaskTodoItem {
    const todo = task.todos.find((item) => item.id === todoId);
    expect(todo).toBeDefined();
    if (!todo) {
      throw new Error(`Expected todo with id: ${todoId}`);
    }

    return todo;
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function toSortedIds(items: Array<{ id: string }>): string[] {
    return items.map((item) => item.id).sort();
  }
});
