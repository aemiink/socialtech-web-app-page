import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  DeliveryReleaseApprovalStatus,
  DeliveryReleaseStatus,
  DeliverySprintStatus,
  EmployeeClientAssignmentScope,
  Prisma,
  PurchasedServiceKey,
  TaskSeverity,
  TaskStatus,
  TaskType,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { GithubService } from "../integrations/github/github.service";
import {
  calculateSprintProgressMetrics,
  resolveAutoSprintStatus,
} from "./delivery-sprint-progress.util";
import { CreateDeliveryReleaseDto } from "./dto/create-delivery-release.dto";
import { CreateDeliverySprintDto } from "./dto/create-delivery-sprint.dto";
import { DeliveryReleaseQueryDto } from "./dto/delivery-release-query.dto";
import { DeliverySprintQueryDto } from "./dto/delivery-sprint-query.dto";
import { UpdateDeliveryReleaseDto } from "./dto/update-delivery-release.dto";
import { UpdateDeliverySprintDto } from "./dto/update-delivery-sprint.dto";

const projectSummarySelect = {
  id: true,
  clientProfileId: true,
  name: true,
  slug: true,
  status: true,
  priority: true,
  clientProfile: {
    select: {
      id: true,
      slug: true,
      companyName: true,
    },
  },
} satisfies Prisma.ProjectSelect;

const sprintReadSelect = {
  id: true,
  projectId: true,
  name: true,
  goal: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: projectSummarySelect,
  },
  tasks: {
    select: {
      status: true,
      todos: {
        select: {
          isCompleted: true,
          visibility: true,
        },
      },
    },
  },
} satisfies Prisma.DeliverySprintSelect;

const releaseReadSelect = {
  id: true,
  projectId: true,
  title: true,
  environment: true,
  status: true,
  approvalStatus: true,
  version: true,
  releaseNotes: true,
  approvalNotes: true,
  scheduledAt: true,
  deployedAt: true,
  approvalRequestedAt: true,
  approvalRespondedAt: true,
  approvalActorUserId: true,
  createdAt: true,
  updatedAt: true,
  approvalActor: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
  project: {
    select: projectSummarySelect,
  },
} satisfies Prisma.DeliveryReleaseSelect;

type DeliveryPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AccessibleProject = {
  id: string;
  clientProfileId: string;
};

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async getSprints(currentUser: AuthenticatedUser, query: DeliverySprintQueryDto) {
    const { page, limit } = this.resolvePagination(query.page, query.limit);
    const where = await this.buildSprintWhere(currentUser, query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.deliverySprint.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        select: sprintReadSelect,
      }),
      this.prisma.deliverySprint.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toSprintResponse(item)),
      meta: this.toPaginationMeta(page, limit, total),
    };
  }

  async getSprintById(currentUser: AuthenticatedUser, sprintId: string) {
    const where = await this.buildScopedSprintDetailWhere(currentUser, sprintId);
    const sprint = await this.prisma.deliverySprint.findFirst({
      where,
      select: sprintReadSelect,
    });
    if (!sprint) {
      throw new NotFoundException("Sprint not found.");
    }

    return this.toSprintResponse(sprint);
  }

  async createSprint(currentUser: AuthenticatedUser, dto: CreateDeliverySprintDto) {
    const project = await this.assertProjectExists(dto.projectId);
    await this.assertCanManageSprints(currentUser, project.id);
    this.assertDateOrder(dto.startDate, dto.endDate, "Sprint endDate cannot be earlier than startDate.");

    const createdSprint = await this.prisma.deliverySprint.create({
      data: {
        projectId: project.id,
        name: dto.name,
        goal: dto.goal ?? null,
        status: dto.status ?? DeliverySprintStatus.PLANNED,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
      select: { id: true },
    });

    const sprint = await this.syncSprintState(createdSprint.id);
    return this.toSprintResponse(sprint);
  }

  async updateSprint(
    currentUser: AuthenticatedUser,
    sprintId: string,
    dto: UpdateDeliverySprintDto,
  ) {
    const existing = await this.prisma.deliverySprint.findUnique({
      where: { id: sprintId },
      select: {
        id: true,
        projectId: true,
        startDate: true,
        endDate: true,
      },
    });
    if (!existing) {
      throw new NotFoundException("Sprint not found.");
    }

    const nextProjectId = dto.projectId ?? existing.projectId;
    await this.assertCanManageSprints(currentUser, nextProjectId);
    if (dto.projectId) {
      await this.assertProjectExists(dto.projectId);
    }
    const nextStartDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const nextEndDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    this.assertDateObjects(nextStartDate, nextEndDate, "Sprint endDate cannot be earlier than startDate.");

    const updatedSprint = await this.prisma.deliverySprint.update({
      where: { id: sprintId },
      data: {
        ...(dto.projectId ? { projectId: nextProjectId } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.goal !== undefined ? { goal: dto.goal } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
      },
      select: { id: true },
    });

    const sprint = await this.syncSprintState(updatedSprint.id);
    return this.toSprintResponse(sprint);
  }

  async getReleases(currentUser: AuthenticatedUser, query: DeliveryReleaseQueryDto) {
    const { page, limit } = this.resolvePagination(query.page, query.limit);
    const where = await this.buildReleaseWhere(currentUser, query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.deliveryRelease.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        select: releaseReadSelect,
      }),
      this.prisma.deliveryRelease.count({ where }),
    ]);

    return {
      data: items,
      meta: this.toPaginationMeta(page, limit, total),
    };
  }

  async getReleaseById(currentUser: AuthenticatedUser, releaseId: string) {
    const where = await this.buildScopedReleaseDetailWhere(currentUser, releaseId);
    const release = await this.prisma.deliveryRelease.findFirst({
      where,
      select: releaseReadSelect,
    });
    if (!release) {
      throw new NotFoundException("Release not found.");
    }

    return release;
  }

  async createRelease(currentUser: AuthenticatedUser, dto: CreateDeliveryReleaseDto) {
    const project = await this.assertProjectExists(dto.projectId);
    await this.assertCanManageReleases(currentUser, project.id);
    await this.assertRepositoryRequiredForApplicationProject(currentUser, project);

    const status = dto.status ?? DeliveryReleaseStatus.PLANNED;
    const approvalStatus = dto.approvalStatus ?? DeliveryReleaseApprovalStatus.NOT_REQUESTED;
    const deployedAt = status === DeliveryReleaseStatus.DEPLOYED ? new Date() : null;
    const approvalState = this.buildReleaseApprovalState(
      approvalStatus,
      dto.approvalNotes ?? null,
      currentUser.id,
    );

    return this.prisma.deliveryRelease.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        environment: dto.environment,
        status,
        approvalStatus,
        version: dto.version ?? null,
        releaseNotes: dto.releaseNotes ?? null,
        approvalNotes: approvalState.approvalNotes,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        deployedAt,
        approvalRequestedAt: approvalState.approvalRequestedAt,
        approvalRespondedAt: approvalState.approvalRespondedAt,
        approvalActorUserId: approvalState.approvalActorUserId,
      },
      select: releaseReadSelect,
    });
  }

  async updateRelease(
    currentUser: AuthenticatedUser,
    releaseId: string,
    dto: UpdateDeliveryReleaseDto,
  ) {
    const existing = await this.prisma.deliveryRelease.findUnique({
      where: { id: releaseId },
      select: {
        id: true,
        projectId: true,
        approvalStatus: true,
        approvalNotes: true,
        approvalRequestedAt: true,
      },
    });
    if (!existing) {
      throw new NotFoundException("Release not found.");
    }

    const nextProject = dto.projectId
      ? await this.assertProjectExists(dto.projectId)
      : await this.assertProjectExists(existing.projectId);
    await this.assertCanManageReleases(currentUser, nextProject.id);
    await this.assertRepositoryRequiredForApplicationProject(currentUser, nextProject);

    const nextApprovalStatus = dto.approvalStatus ?? existing.approvalStatus;
    const approvalState = this.buildReleaseApprovalState(
      nextApprovalStatus,
      dto.approvalNotes !== undefined ? dto.approvalNotes : existing.approvalNotes,
      currentUser.id,
      existing.approvalRequestedAt,
    );

    const release = await this.prisma.deliveryRelease.update({
      where: { id: releaseId },
      data: {
        ...(dto.projectId !== undefined ? { projectId: dto.projectId } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.environment !== undefined ? { environment: dto.environment } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.approvalStatus !== undefined ? { approvalStatus: dto.approvalStatus } : {}),
        ...(dto.version !== undefined ? { version: dto.version } : {}),
        ...(dto.releaseNotes !== undefined ? { releaseNotes: dto.releaseNotes } : {}),
        ...(dto.approvalNotes !== undefined ? { approvalNotes: dto.approvalNotes } : {}),
        ...(dto.scheduledAt !== undefined
          ? { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }
          : {}),
        ...(dto.status !== undefined
          ? {
              deployedAt:
                dto.status === DeliveryReleaseStatus.DEPLOYED ? new Date() : null,
            }
          : {}),
        approvalRequestedAt: approvalState.approvalRequestedAt,
        approvalRespondedAt: approvalState.approvalRespondedAt,
        approvalActorUserId: approvalState.approvalActorUserId,
      },
      select: releaseReadSelect,
    });

    return release;
  }

  async getSummary(currentUser: AuthenticatedUser) {
    this.assertCanReadSummary(currentUser);
    const projectIds = await this.getAccessibleProjectIds(currentUser);
    if (projectIds.length === 0) {
      return {
        assignedOpenTasks: 0,
        criticalBugs: 0,
        activeSprints: 0,
        testingQueue: 0,
        completedThisSprint: 0,
        activeSprintCards: [],
        criticalBugCards: [],
        todaysTasks: [],
        releaseQueue: [],
        recentCommits: [],
        openPullRequests: [],
      };
    }

    const [tasks, sprints, releases, repositories] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          type: true,
          severity: true,
          dueDate: true,
          createdAt: true,
          project: { select: projectSummarySelect },
          sprint: {
            select: { id: true, name: true, status: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      }),
      this.prisma.deliverySprint.findMany({
        where: {
          projectId: { in: projectIds },
          status: DeliverySprintStatus.ACTIVE,
        },
        select: sprintReadSelect,
        orderBy: [{ endDate: "asc" }],
      }),
      this.prisma.deliveryRelease.findMany({
        where: {
          projectId: { in: projectIds },
          status: { in: [DeliveryReleaseStatus.TESTING, DeliveryReleaseStatus.READY] },
        },
        select: releaseReadSelect,
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      this.prisma.projectRepository.findMany({
        where: {
          projectId: { in: projectIds },
          isActive: true,
        },
        select: {
          id: true,
          projectId: true,
          owner: true,
          repo: true,
          defaultBranch: true,
        },
        take: 3,
      }),
    ]);

    const openTasks = tasks.filter((task) => task.status !== TaskStatus.DONE);
    const criticalBugs = tasks.filter(
      (task) => task.type === TaskType.BUG && task.severity === TaskSeverity.CRITICAL,
    );
    const todayTaskCutoff = new Date();
    todayTaskCutoff.setHours(23, 59, 59, 999);
    const todaysTasks = openTasks
      .filter((task) => task.dueDate && new Date(task.dueDate) <= todayTaskCutoff)
      .slice(0, 8);
    const completedThisSprint = await this.prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: TaskStatus.DONE,
        sprint: {
          status: DeliverySprintStatus.ACTIVE,
        },
      },
    });

    const recentCommits: Array<Record<string, unknown>> = [];
    const openPullRequests: Array<Record<string, unknown>> = [];
    for (const repository of repositories) {
      try {
        const commits = await this.githubService.getCommitsForSummary(currentUser, repository.projectId);
        recentCommits.push(...commits.slice(0, 2));
        const pulls = await this.githubService.getPullsForSummary(currentUser, repository.projectId);
        openPullRequests.push(...pulls.filter((pull) => pull.state === "open").slice(0, 2));
      } catch {
        // Summary stays resilient even when GitHub fetch fails.
      }
    }

    return {
      assignedOpenTasks: openTasks.length,
      criticalBugs: criticalBugs.length,
      activeSprints: sprints.length,
      testingQueue: releases.length,
      completedThisSprint,
      activeSprintCards: sprints.slice(0, 4).map((sprint) => this.toSprintResponse(sprint)),
      criticalBugCards: criticalBugs.slice(0, 6),
      todaysTasks,
      releaseQueue: releases,
      recentCommits: recentCommits.slice(0, 6),
      openPullRequests: openPullRequests.slice(0, 6),
    };
  }

  private async buildSprintWhere(
    currentUser: AuthenticatedUser,
    query: DeliverySprintQueryDto,
  ): Promise<Prisma.DeliverySprintWhereInput> {
    const projectIds = await this.getAccessibleProjectIds(currentUser, query.projectId);

    return {
      projectId: { in: projectIds },
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { goal: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async buildReleaseWhere(
    currentUser: AuthenticatedUser,
    query: DeliveryReleaseQueryDto,
  ): Promise<Prisma.DeliveryReleaseWhereInput> {
    const projectIds = await this.getAccessibleProjectIds(currentUser, query.projectId);

    return {
      projectId: { in: projectIds },
      ...(query.status ? { status: query.status } : {}),
      ...(query.environment ? { environment: query.environment } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { releaseNotes: { contains: query.search, mode: "insensitive" } },
              { version: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async buildScopedSprintDetailWhere(currentUser: AuthenticatedUser, sprintId: string) {
    const projectIds = await this.getAccessibleProjectIds(currentUser);
    return { id: sprintId, projectId: { in: projectIds } } satisfies Prisma.DeliverySprintWhereInput;
  }

  private async buildScopedReleaseDetailWhere(currentUser: AuthenticatedUser, releaseId: string) {
    const projectIds = await this.getAccessibleProjectIds(currentUser);
    return {
      id: releaseId,
      projectId: { in: projectIds },
    } satisfies Prisma.DeliveryReleaseWhereInput;
  }

  private toSprintResponse(
    sprint: Prisma.DeliverySprintGetPayload<{ select: typeof sprintReadSelect }>,
  ) {
    const metrics = calculateSprintProgressMetrics(sprint.tasks);

    return {
      id: sprint.id,
      projectId: sprint.projectId,
      name: sprint.name,
      goal: sprint.goal,
      status: resolveAutoSprintStatus(sprint.status, metrics),
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      project: sprint.project,
      taskCounts: metrics.taskCounts,
      progressPercent: metrics.progressPercent,
    };
  }

  private async syncSprintState(sprintId: string) {
    const sprint = await this.prisma.deliverySprint.findUnique({
      where: { id: sprintId },
      select: sprintReadSelect,
    });
    if (!sprint) {
      throw new NotFoundException("Sprint not found.");
    }

    const metrics = calculateSprintProgressMetrics(sprint.tasks);
    const nextStatus = resolveAutoSprintStatus(sprint.status, metrics);
    if (nextStatus === sprint.status) {
      return sprint;
    }

    return this.prisma.deliverySprint.update({
      where: { id: sprint.id },
      data: { status: nextStatus },
      select: sprintReadSelect,
    });
  }

  private toPaginationMeta(page: number, limit: number, total: number): DeliveryPaginationMeta {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private resolvePagination(page?: number, limit?: number) {
    return {
      page: page ?? 1,
      limit: limit ?? 20,
    };
  }

  private async assertProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientProfileId: true, serviceKey: true },
    });
    if (!project) {
      throw new BadRequestException("Project not found.");
    }

    return project;
  }

  private assertDateOrder(startDate: string, endDate: string, message: string) {
    this.assertDateObjects(new Date(startDate), new Date(endDate), message);
  }

  private assertDateObjects(startDate: Date, endDate: Date, message: string) {
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException(message);
    }
  }

  async getAccessibleProjectIds(currentUser: AuthenticatedUser, requestedProjectId?: string) {
    const projects = await this.getAccessibleProjects(currentUser, requestedProjectId);
    return projects.map((project) => project.id);
  }

  private async getAccessibleProjects(
    currentUser: AuthenticatedUser,
    requestedProjectId?: string,
  ): Promise<AccessibleProject[]> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        "delivery.sprints.read.assigned",
        "projects.read.any",
      );
      const projects = await this.prisma.project.findMany({
        where: requestedProjectId ? { id: requestedProjectId } : undefined,
        select: { id: true, clientProfileId: true },
      });
      if (requestedProjectId && projects.length === 0) {
        throw new NotFoundException("Project not found.");
      }

      return projects;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Delivery data is only available to admin and employee accounts.");
    }

    const projects = await this.prisma.project.findMany({
      where: {
        ...(requestedProjectId ? { id: requestedProjectId } : {}),
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
              scope: {
                in: [
                  EmployeeClientAssignmentScope.PROJECT,
                  EmployeeClientAssignmentScope.DEVELOPMENT,
                ],
              },
            },
          },
        },
      },
      select: { id: true, clientProfileId: true },
    });

    if (requestedProjectId && projects.length === 0) {
      throw new NotFoundException("Project not found.");
    }

    return projects;
  }

  private async assertCanManageSprints(currentUser: AuthenticatedUser, projectId: string) {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "delivery.sprints.manage.any");
      return;
    }

    await this.assertCanManageAssignedDelivery(currentUser, projectId, "delivery.sprints.manage.assigned");
  }

  private async assertCanManageReleases(currentUser: AuthenticatedUser, projectId: string) {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "delivery.releases.manage.any");
      return;
    }

    await this.assertCanManageAssignedDelivery(currentUser, projectId, "delivery.releases.manage.assigned");
  }

  private assertCanReadSummary(currentUser: AuthenticatedUser) {
    if (this.isAdmin(currentUser)) {
      return;
    }
    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Clients cannot access delivery summary.");
    }
    this.assertHasPermission(currentUser, "delivery.summary.read.assigned");
  }

  private assertHasPermission(
    currentUser: AuthenticatedUser,
    permission: string,
    fallbackPermission?: string,
  ) {
    if (currentUser.permissions.includes(permission)) {
      return;
    }
    if (fallbackPermission && currentUser.permissions.includes(fallbackPermission)) {
      return;
    }

    throw new ForbiddenException(`Missing required permission: ${permission}.`);
  }

  private isAdmin(currentUser: AuthenticatedUser) {
    return currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN;
  }

  private isEmployee(currentUser: AuthenticatedUser) {
    return currentUser.accountType === AccountType.EMPLOYEE;
  }

  private async assertCanManageAssignedDelivery(
    currentUser: AuthenticatedUser,
    projectId: string,
    permission: string,
  ) {
    if (!this.isEmployee(currentUser) || currentUser.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException("Only assigned project managers can manage delivery records.");
    }
    this.assertHasPermission(currentUser, permission);

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
              scope: EmployeeClientAssignmentScope.PROJECT,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException("Project not found.");
    }
  }

  private async assertRepositoryRequiredForApplicationProject(
    currentUser: AuthenticatedUser,
    project: { id: string; clientProfileId: string; serviceKey?: PurchasedServiceKey | null },
  ) {
    if (
      project.serviceKey !== PurchasedServiceKey.WEB_APP &&
      project.serviceKey !== PurchasedServiceKey.MOBILE_APP
    ) {
      return;
    }

    try {
      await this.githubService.assertActiveRepositoryConfigured(currentUser, project.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          "WEB_APP and MOBILE_APP projects require an active repository before release workflow actions.",
        );
      }
      throw error;
    }
  }

  private buildReleaseApprovalState(
    approvalStatus: DeliveryReleaseApprovalStatus,
    approvalNotes: string | null,
    actorUserId: string,
    existingRequestedAt?: Date | null,
  ) {
    if (approvalStatus === DeliveryReleaseApprovalStatus.NOT_REQUESTED) {
      return {
        approvalNotes,
        approvalRequestedAt: null,
        approvalRespondedAt: null,
        approvalActorUserId: null,
      };
    }

    if (approvalStatus === DeliveryReleaseApprovalStatus.PENDING) {
      return {
        approvalNotes,
        approvalRequestedAt: existingRequestedAt ?? new Date(),
        approvalRespondedAt: null,
        approvalActorUserId: null,
      };
    }

    return {
      approvalNotes,
      approvalRequestedAt: existingRequestedAt ?? new Date(),
      approvalRespondedAt: new Date(),
      approvalActorUserId: actorUserId,
    };
  }
}
