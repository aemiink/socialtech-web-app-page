import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClient, Priority, ProjectStatus, PurchasedServiceKey, TaskStatus } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { GithubClientService } from "../src/integrations/github/github-client.service";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { createCorsOptions } from "../src/config/cors.config";

const DELIVERY_SUMMARY_PATH = "/api/v1/delivery/summary";
const DELIVERY_SPRINTS_PATH = "/api/v1/delivery/sprints";
const DELIVERY_RELEASES_PATH = "/api/v1/delivery/releases";

describe("Delivery + GitHub Authorization (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let adminToken = "";
  let developerToken = "";
  let projectManagerToken = "";
  let clientToken = "";
  let acmeProjectId = "";
  let acmeProjectTaskId = "";
  let acmeClientProfileId = "";
  let webAppProjectId = "";
  let webAppTaskId = "";
  let deliveryPolicyProjectId = "";
  let clientVisibleFileId = "";
  let internalFileId = "";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GithubClientService)
      .useValue({
        getRepository: async () => ({
          html_url: "https://github.com/socialtech/demo-repo",
          default_branch: "main",
        }),
        getBranches: async () => [{ name: "main", protected: true, commit: { sha: "abcdef1", url: "https://example.com" } }],
        getCommits: async () => [
          {
            sha: "abcdef1234567",
            html_url: "https://github.com/socialtech/demo-repo/commit/abcdef1",
            commit: {
              message: "Seeded commit",
              author: { name: "Codex", email: "codex@example.com", date: "2026-05-03T10:00:00.000Z" },
            },
            author: { login: "codex" },
          },
        ],
        getPulls: async () => [
          {
            number: 12,
            title: "Open PR",
            state: "open",
            html_url: "https://github.com/socialtech/demo-repo/pull/12",
            user: { login: "codex" },
            head: { ref: "feature/test" },
            base: { ref: "main" },
            created_at: "2026-05-03T10:00:00.000Z",
            updated_at: "2026-05-03T12:00:00.000Z",
          },
        ],
        getWorkflowRuns: async () => ({
          workflow_runs: [
            {
              id: 45,
              name: "CI",
              status: "completed",
              conclusion: "success",
              head_branch: "main",
              event: "push",
              run_number: 9,
              created_at: "2026-05-03T10:00:00.000Z",
              updated_at: "2026-05-03T12:00:00.000Z",
              html_url: "https://github.com/socialtech/demo-repo/actions/runs/45",
            },
          ],
        }),
      })
      .compile();

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

    adminToken = await loginWithDemoUser("admin@socialtech.com");
    developerToken = await loginWithDemoUser("developer@socialtech.com");
    projectManagerToken = await loginWithDemoUser("project@socialtech.com");
    clientToken = await loginWithDemoUser("client@socialtech.com");

    const project = await prisma.project.findFirst({
      where: { slug: "growth-hub-launch" },
      select: { id: true, clientProfileId: true },
    });
    if (!project) {
      throw new Error("Expected seeded project growth-hub-launch.");
    }
    acmeProjectId = project.id;
    acmeClientProfileId = project.clientProfileId;

    const task = await prisma.task.findFirst({
      where: {
        projectId: acmeProjectId,
        code: "DEV-101",
      },
      select: { id: true },
    });
    if (!task) {
      throw new Error("Expected seeded task DEV-101.");
    }
    acmeProjectTaskId = task.id;

    const developerUser = await prisma.user.findFirst({
      where: { email: "developer@socialtech.com" },
      select: { id: true },
    });
    if (!developerUser) {
      throw new Error("Expected seeded developer user.");
    }

    const createdFiles = await prisma.$transaction([
      prisma.projectFile.create({
        data: {
          projectId: acmeProjectId,
          clientProfileId: acmeClientProfileId,
          category: "DOCUMENT",
          visibility: "CLIENT_VISIBLE",
          title: "Client Delivery Deck",
          description: "Visible to client",
          publicId: `seed/${Date.now()}/client`,
          secureUrl: "https://res.cloudinary.com/demo/raw/upload/v1/client-deck.pdf",
          resourceType: "raw",
          format: "pdf",
          bytes: 120000,
          mimeType: "application/pdf",
          originalFileName: "delivery-deck.pdf",
          uploadedByUserId: developerUser.id,
        },
        select: { id: true },
      }),
      prisma.projectFile.create({
        data: {
          projectId: acmeProjectId,
          clientProfileId: acmeClientProfileId,
          category: "WEB_SOURCE",
          visibility: "INTERNAL",
          title: "Internal Source Bundle",
          description: "Internal only",
          publicId: `seed/${Date.now()}/internal`,
          secureUrl: "https://res.cloudinary.com/demo/raw/upload/v1/internal.zip",
          resourceType: "raw",
          format: "zip",
          bytes: 240000,
          mimeType: "application/zip",
          originalFileName: "source-bundle.zip",
          uploadedByUserId: developerUser.id,
        },
        select: { id: true },
      }),
    ]);
    clientVisibleFileId = createdFiles[0].id;
    internalFileId = createdFiles[1].id;
  });

  afterAll(async () => {
    if (webAppTaskId) {
      await prisma.task.deleteMany({ where: { id: webAppTaskId } });
    }
    if (webAppProjectId) {
      await prisma.projectRepository.deleteMany({ where: { projectId: webAppProjectId } });
      await prisma.project.deleteMany({ where: { id: webAppProjectId } });
    }
    if (deliveryPolicyProjectId) {
      await prisma.project.deleteMany({ where: { id: deliveryPolicyProjectId } });
    }
    if (clientVisibleFileId || internalFileId) {
      await prisma.projectFileShareLink.deleteMany({
        where: {
          projectFileId: { in: [clientVisibleFileId, internalFileId].filter(Boolean) as string[] },
        },
      });
      await prisma.projectFile.deleteMany({
        where: {
          id: { in: [clientVisibleFileId, internalFileId].filter(Boolean) as string[] },
        },
      });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it("developer summary returns assigned delivery data", async () => {
    const response = await request(app.getHttpServer())
      .get(DELIVERY_SUMMARY_PATH)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        assignedOpenTasks: expect.any(Number),
        criticalBugs: expect.any(Number),
        activeSprints: expect.any(Number),
      }),
    );
  });

  it("client cannot access delivery summary", async () => {
    await request(app.getHttpServer())
      .get(DELIVERY_SUMMARY_PATH)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
  });

  it("developer can list assigned sprints and non-admin cannot create sprint", async () => {
    const listResponse = await request(app.getHttpServer())
      .get(DELIVERY_SPRINTS_PATH)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Sprint Alpha",
        }),
      ]),
    );

    await request(app.getHttpServer())
      .post(DELIVERY_SPRINTS_PATH)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({
        projectId: acmeProjectId,
        name: "Unauthorized Sprint",
        startDate: "2026-05-20",
        endDate: "2026-05-28",
      })
      .expect(403);
  });

  it("developer can read assigned project detail and project manager can read assigned task detail", async () => {
    const projectResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(projectResponse.body).toEqual(
      expect.objectContaining({
        id: acmeProjectId,
      }),
    );

    const taskResponse = await request(app.getHttpServer())
      .get(`/api/v1/tasks/${acmeProjectTaskId}`)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .expect(200);

    expect(taskResponse.body).toEqual(
      expect.objectContaining({
        id: acmeProjectTaskId,
        code: "DEV-101",
      }),
    );
  });

  it("admin can create sprint", async () => {
    const response = await request(app.getHttpServer())
      .post(DELIVERY_SPRINTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: acmeProjectId,
        name: `Admin Sprint ${Date.now()}`,
        goal: "Authz verification sprint",
        status: "PLANNED",
        startDate: "2026-05-20",
        endDate: "2026-05-28",
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        projectId: acmeProjectId,
      }),
    );
  });

  it("todo toggle recalculates sprint progress and auto-completes the sprint when all task todos are done", async () => {
    const projectId = await ensureDeliveryPolicyProject();
    const sprintId = await createSprintFixture(projectId, {
      name: `Todo Policy Sprint ${Date.now()}`,
      status: "PLANNED",
    });
    const taskId = await createTaskFixture(projectId, {
      sprintId,
      title: "Client-visible delivery checklist",
      status: TaskStatus.TODO,
    });
    const todoId = await createTaskTodoFixture(taskId, "Final QA checklist item");

    const sprintBeforeToggle = await request(app.getHttpServer())
      .get(`${DELIVERY_SPRINTS_PATH}/${sprintId}`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(sprintBeforeToggle.body).toEqual(
      expect.objectContaining({
        id: sprintId,
        status: "PLANNED",
        progressPercent: 0,
        taskCounts: {
          total: 1,
          completed: 0,
          open: 1,
        },
      }),
    );

    await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${taskId}/todos/${todoId}/toggle`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isCompleted: true })
      .expect(200);

    const sprintAfterToggle = await request(app.getHttpServer())
      .get(`${DELIVERY_SPRINTS_PATH}/${sprintId}`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(sprintAfterToggle.body).toEqual(
      expect.objectContaining({
        id: sprintId,
        status: "COMPLETED",
        progressPercent: 100,
        taskCounts: {
          total: 1,
          completed: 1,
          open: 0,
        },
      }),
    );
  });

  it("task DONE status recalculates sprint progress and completed task counts", async () => {
    const projectId = await ensureDeliveryPolicyProject();
    const sprintId = await createSprintFixture(projectId, {
      name: `Task Status Policy Sprint ${Date.now()}`,
      status: "PLANNED",
    });
    const taskId = await createTaskFixture(projectId, {
      sprintId,
      title: "Backend payload stabilization",
      status: TaskStatus.IN_PROGRESS,
    });

    const sprintBeforeDone = await request(app.getHttpServer())
      .get(`${DELIVERY_SPRINTS_PATH}/${sprintId}`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(sprintBeforeDone.body.taskCounts).toEqual({
      total: 1,
      completed: 0,
      open: 1,
    });
    expect(sprintBeforeDone.body.status).toBe("ACTIVE");
    expect(sprintBeforeDone.body.progressPercent).toBeGreaterThan(0);
    expect(sprintBeforeDone.body.progressPercent).toBeLessThan(100);

    await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: TaskStatus.DONE })
      .expect(200);

    const sprintAfterDone = await request(app.getHttpServer())
      .get(`${DELIVERY_SPRINTS_PATH}/${sprintId}`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(sprintAfterDone.body).toEqual(
      expect.objectContaining({
        id: sprintId,
        status: "COMPLETED",
        progressPercent: 100,
        taskCounts: {
          total: 1,
          completed: 1,
          open: 0,
        },
      }),
    );
  });

  it("developer can read assigned project repository but cannot connect it", async () => {
    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/repository`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(getResponse.body).toEqual(
      expect.objectContaining({
        owner: expect.any(String),
        repo: expect.any(String),
      }),
    );
    expect(getResponse.body).not.toHaveProperty("accessTokenEnc");
    expect(getResponse.body).not.toHaveProperty("accessTokenHash");

    await request(app.getHttpServer())
      .put(`/api/v1/projects/${acmeProjectId}/repository`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({
        owner: "socialtech",
        repo: "demo-repo",
      })
      .expect(403);
  });

  it("admin can connect repository and mapped endpoints return sanitized data", async () => {
    const connectResponse = await request(app.getHttpServer())
      .put(`/api/v1/projects/${acmeProjectId}/repository`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        owner: "socialtech",
        repo: "demo-repo",
      })
      .expect(200);

    expect(connectResponse.body).toEqual(
      expect.objectContaining({
        owner: "socialtech",
        repo: "demo-repo",
      }),
    );
    expect(connectResponse.body).not.toHaveProperty("accessTokenEnc");
    expect(connectResponse.body).not.toHaveProperty("accessTokenHash");

    const commitsResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/repository/commits`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);
    expect(commitsResponse.body[0]).toEqual(
      expect.objectContaining({
        shortSha: "abcdef1",
        message: "Seeded commit",
      }),
    );

    const pullsResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/repository/pulls`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);
    expect(pullsResponse.body[0]).toEqual(
      expect.objectContaining({
        title: "Open PR",
        state: "open",
      }),
    );

    const workflowSummaryResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/repository/workflows/summary`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(workflowSummaryResponse.body).toEqual(
      expect.objectContaining({
        overallStatus: "healthy",
        totalRuns: expect.any(Number),
        latestRun: expect.objectContaining({
          name: "CI",
          conclusion: "success",
        }),
      }),
    );
  });

  it("developer can write a work note and fetch related commits for an assigned task", async () => {
    const workNoteResponse = await request(app.getHttpServer())
      .post(`/api/v1/tasks/${acmeProjectTaskId}/work-notes`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({
        note: "Checkout bug fixini izole ettim ve branch hazırlığına geçtim.",
      })
      .expect(201);

    expect(workNoteResponse.body.workNotes[0]).toEqual(
      expect.objectContaining({
        note: "Checkout bug fixini izole ettim ve branch hazırlığına geçtim.",
      }),
    );

    await request(app.getHttpServer())
      .post(`/api/v1/tasks/${acmeProjectTaskId}/code-preparation`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({
        branchName: "feature/dev-101-checkout-hotfix",
        notes: "Hotfix branch hazır.",
      })
      .expect(201);

    const commitsResponse = await request(app.getHttpServer())
      .get(`/api/v1/tasks/${acmeProjectTaskId}/related-commits`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(commitsResponse.body[0]).toEqual(
      expect.objectContaining({
        shortSha: "abcdef1",
        branch: "feature/dev-101-checkout-hotfix",
      }),
    );
  });

  it("WEB_APP code preparation and release workflow require a repository, and assigned project manager can manage releases", async () => {
    const projectResponse = await request(app.getHttpServer())
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        clientProfileId: acmeClientProfileId,
        serviceKey: "WEB_APP",
        repositoryUrl: "https://github.com/socialtech/demo-repo",
        name: `Acme Web App ${Date.now()}`,
        status: "IN_PROGRESS",
        priority: "HIGH",
      })
      .expect(201);

    webAppProjectId = projectResponse.body.id as string;

    const taskResponse = await request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId: webAppProjectId,
        title: "Prepare web app release branch",
        status: "TODO",
        priority: "HIGH",
        type: "FEATURE",
        workstream: "FULLSTACK",
        code: "WEB-500",
        assigneeUserId: (await prisma.user.findFirstOrThrow({
          where: { email: "developer@socialtech.com" },
          select: { id: true },
        })).id,
      })
      .expect(201);

    webAppTaskId = taskResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/tasks/${webAppTaskId}/code-preparation`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post(DELIVERY_RELEASES_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        projectId: webAppProjectId,
        title: "Unauthorized without repo",
        environment: "STAGING",
        status: "PLANNED",
      })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/api/v1/projects/${webAppProjectId}/repository`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        owner: "socialtech",
        repo: "demo-repo",
      })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/tasks/${webAppTaskId}/code-preparation`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({})
      .expect(201);

    const releaseResponse = await request(app.getHttpServer())
      .post(DELIVERY_RELEASES_PATH)
      .set("Authorization", `Bearer ${projectManagerToken}`)
      .send({
        projectId: webAppProjectId,
        title: "Web App Staging Candidate",
        environment: "STAGING",
        status: "TESTING",
        approvalStatus: "PENDING",
        approvalNotes: "QA ve client onayı bekleniyor.",
      })
      .expect(201);

    expect(releaseResponse.body).toEqual(
      expect.objectContaining({
        projectId: webAppProjectId,
        approvalStatus: "PENDING",
        approvalNotes: "QA ve client onayı bekleniyor.",
      }),
    );
  });

  it("developer can list assigned project files and create share link", async () => {
    const listResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/files`)
      .set("Authorization", `Bearer ${developerToken}`)
      .expect(200);

    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: clientVisibleFileId, visibility: "CLIENT_VISIBLE" }),
        expect.objectContaining({ id: internalFileId, visibility: "INTERNAL" }),
      ]),
    );

    const shareResponse = await request(app.getHttpServer())
      .post(`/api/v1/projects/${acmeProjectId}/files/${clientVisibleFileId}/share-links`)
      .set("Authorization", `Bearer ${developerToken}`)
      .send({ expiresInHours: 24 })
      .expect(201);

    expect(shareResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        token: expect.any(String),
        shareUrl: expect.stringContaining("/file-shares/"),
      }),
    );
  });

  it("client only sees client-visible files and cannot access internal file detail", async () => {
    const listResponse = await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/files`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const ids = listResponse.body.data.map((item: { id: string }) => item.id);
    expect(ids).toContain(clientVisibleFileId);
    expect(ids).not.toContain(internalFileId);

    await request(app.getHttpServer())
      .get(`/api/v1/projects/${acmeProjectId}/files/${internalFileId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(404);
  });

  async function loginWithDemoUser(email: string): Promise<string> {
    const response = await request(app.getHttpServer()).post("/api/v1/auth/login").send({
      email,
      password: "demo123",
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );

    return response.body.accessToken as string;
  }

  async function ensureDeliveryPolicyProject(): Promise<string> {
    if (deliveryPolicyProjectId) {
      return deliveryPolicyProjectId;
    }

    const project = await prisma.project.create({
      data: {
        clientProfileId: acmeClientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
        name: `Delivery Policy Fixture ${Date.now()}`,
        slug: `delivery-policy-fixture-${Date.now()}`,
        description: "Fixture for delivery sprint progress/status recalculation coverage.",
        status: ProjectStatus.IN_PROGRESS,
        priority: Priority.HIGH,
      },
      select: { id: true },
    });

    deliveryPolicyProjectId = project.id;
    return deliveryPolicyProjectId;
  }

  async function createSprintFixture(
    projectId: string,
    options: { name: string; status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED" },
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post(DELIVERY_SPRINTS_PATH)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId,
        name: options.name,
        status: options.status,
        startDate: "2026-05-20",
        endDate: "2026-05-28",
      })
      .expect(201);

    return response.body.id as string;
  }

  async function createTaskFixture(
    projectId: string,
    options: { sprintId: string; title: string; status: TaskStatus },
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        projectId,
        sprintId: options.sprintId,
        title: options.title,
        status: options.status,
        priority: Priority.HIGH,
        type: "FEATURE",
        workstream: "FULLSTACK",
      })
      .expect(201);

    return response.body.id as string;
  }

  async function createTaskTodoFixture(taskId: string, title: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/tasks/${taskId}/todos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title,
      })
      .expect(201);

    const createdTodo = response.body.todos.find((todo: { title: string }) => todo.title === title);
    expect(createdTodo).toBeDefined();
    return createdTodo.id as string;
  }
});
