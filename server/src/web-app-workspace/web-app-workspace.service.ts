import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  Prisma,
  ProjectFileVisibility,
  PurchasedServiceKey,
  UserRole,
  UserStatus,
  WebAppWorkspaceContentItemType,
  WebAppWorkspaceRevisionStatus,
  WebAppWorkspaceTabKey,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateMeetingRequestDto } from "./dto/create-meeting-request.dto";
import { CreateWeeklyReportDto } from "./dto/create-weekly-report.dto";
import { CreateWorkspaceContentItemDto } from "./dto/create-workspace-content-item.dto";
import { CreateWorkspaceMessageDto } from "./dto/create-workspace-message.dto";
import { CreateWorkspaceRevisionDto } from "./dto/create-workspace-revision.dto";
import { CreateWorkspaceSectionDto } from "./dto/create-workspace-section.dto";
import { UpdateMeetingRequestDto } from "./dto/update-meeting-request.dto";
import { UpdateWorkspaceContentItemDto } from "./dto/update-workspace-content-item.dto";
import { UpdateWorkspaceRevisionStatusDto } from "./dto/update-workspace-revision-status.dto";
import { UpdateWorkspaceSectionDto } from "./dto/update-workspace-section.dto";
import { WorkspaceQueryDto } from "./dto/workspace-query.dto";
import { WebAppWorkspaceGateway } from "./web-app-workspace.gateway";

const WORKSPACE_READ_ANY_PERMISSION = "webapp.workspace.read.any";
const WORKSPACE_MANAGE_ANY_PERMISSION = "webapp.workspace.manage.any";
const WORKSPACE_READ_ASSIGNED_PERMISSION = "webapp.workspace.read.assigned";
const WORKSPACE_MANAGE_ASSIGNED_PERMISSION = "webapp.workspace.manage.assigned";
const WORKSPACE_INTERACT_ASSIGNED_PERMISSION = "webapp.workspace.interact.assigned";
const WORKSPACE_READ_OWN_PERMISSION = "webapp.workspace.read.own";
const WORKSPACE_INTERACT_OWN_PERMISSION = "webapp.workspace.interact.own";

const workspaceSectionSelect = {
  id: true,
  projectId: true,
  tabKey: true,
  key: true,
  title: true,
  description: true,
  sortOrder: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
  items: {
    select: {
      id: true,
      sectionId: true,
      itemType: true,
      title: true,
      body: true,
      href: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.WebAppWorkspaceSectionSelect;

const workspaceMessageSelect = {
  id: true,
  projectId: true,
  parentMessageId: true,
  tabKey: true,
  authorUserId: true,
  body: true,
  isInternal: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
} satisfies Prisma.WebAppWorkspaceMessageSelect;

const workspaceRevisionSelect = {
  id: true,
  projectId: true,
  taskId: true,
  releaseId: true,
  projectFileId: true,
  title: true,
  description: true,
  requestedByUserId: true,
  assignedToUserId: true,
  status: true,
  requestedAt: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  task: {
    select: {
      id: true,
      title: true,
      code: true,
      status: true,
    },
  },
  release: {
    select: {
      id: true,
      title: true,
      status: true,
      environment: true,
    },
  },
  projectFile: {
    select: {
      id: true,
      title: true,
      originalFileName: true,
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  requestedBy: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
  transitions: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          displayName: true,
          role: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  },
} satisfies Prisma.WebAppWorkspaceRevisionSelect;

const weeklyReportSelect = {
  id: true,
  projectId: true,
  weekStartDate: true,
  weekEndDate: true,
  summary: true,
  accomplishments: true,
  plannedNext: true,
  blockers: true,
  authorUserId: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
} satisfies Prisma.WebAppWorkspaceWeeklyReportSelect;

const meetingRequestSelect = {
  id: true,
  projectId: true,
  title: true,
  agenda: true,
  requestedByUserId: true,
  preferredStartAt: true,
  preferredEndAt: true,
  timezone: true,
  status: true,
  responseNote: true,
  responderUserId: true,
  scheduledStartAt: true,
  scheduledEndAt: true,
  createdAt: true,
  updatedAt: true,
  requestedBy: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
  responder: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
} satisfies Prisma.WebAppWorkspaceMeetingRequestSelect;

const projectSummarySelect = {
  id: true,
  clientProfileId: true,
  serviceKey: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  priority: true,
  repositoryUrl: true,
  livePreviewUrl: true,
  figmaProjectUrl: true,
  ga4MeasurementId: true,
  ga4PropertyId: true,
  ga4Status: true,
  ga4MeasurementProfile: true,
  ga4LastVerifiedAt: true,
  startDate: true,
  dueDate: true,
  clientProfile: {
    select: {
      id: true,
      slug: true,
      companyName: true,
      contactEmail: true,
    },
  },
} satisfies Prisma.ProjectSelect;

const taskSummarySelect = {
  id: true,
  title: true,
  code: true,
  sprintId: true,
  status: true,
  priority: true,
  type: true,
  workstream: true,
  severity: true,
  environment: true,
  assigneeUserId: true,
  dueDate: true,
  sprint: {
    select: {
      id: true,
      name: true,
      status: true,
      goal: true,
      startDate: true,
      endDate: true,
    },
  },
  assignee: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
  todos: {
    select: {
      id: true,
      taskId: true,
      title: true,
      description: true,
      visibility: true,
      sortOrder: true,
      isCompleted: true,
      completedAt: true,
      completedByUserId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  },
  referenceProjectFile: {
    select: {
      id: true,
      title: true,
      category: true,
      originalFileName: true,
      secureUrl: true,
      mimeType: true,
      visibility: true,
      createdAt: true,
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.TaskSelect;

const sprintSummarySelect = {
  id: true,
  name: true,
  goal: true,
  status: true,
  startDate: true,
  endDate: true,
} satisfies Prisma.DeliverySprintSelect;

const releaseSummarySelect = {
  id: true,
  title: true,
  environment: true,
  status: true,
  approvalStatus: true,
  version: true,
  scheduledAt: true,
  deployedAt: true,
} satisfies Prisma.DeliveryReleaseSelect;

const fileSummarySelect = {
  id: true,
  folderId: true,
  title: true,
  visibility: true,
  category: true,
  originalFileName: true,
  secureUrl: true,
  mimeType: true,
  bytes: true,
  createdAt: true,
  folder: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ProjectFileSelect;

type WorkspaceProject = Prisma.ProjectGetPayload<{ select: typeof projectSummarySelect }>;
type WorkspaceTaskTodo = Prisma.TaskTodoGetPayload<{
  select: (typeof taskSummarySelect)["todos"]["select"];
}>;

function buildWorkspaceTaskCompletion(todos: WorkspaceTaskTodo[]) {
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.isCompleted).length;
  const remainingTodos = totalTodos - completedTodos;
  const completionPercentage =
    totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  return {
    totalTodos,
    completedTodos,
    remainingTodos,
    completionPercentage,
    isComplete: totalTodos > 0 && completedTodos === totalTodos,
  };
}

@Injectable()
export class WebAppWorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebAppWorkspaceGateway,
  ) {}

  async getWorkspace(currentUser: AuthenticatedUser, projectId: string, query: WorkspaceQueryDto) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "read");
    const [sections, messages, revisions, weeklyReports, meetingRequests, tasks, sprints, releases, files] =
      await this.prisma.$transaction([
        this.prisma.webAppWorkspaceSection.findMany({
          where: {
            projectId: project.id,
            ...(query.tabKey ? { tabKey: query.tabKey } : {}),
          },
          orderBy: [{ tabKey: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
          select: workspaceSectionSelect,
        }),
        this.prisma.webAppWorkspaceMessage.findMany({
          where: {
            projectId: project.id,
            ...(query.tabKey ? { tabKey: query.tabKey } : {}),
            ...(this.shouldHideInternalRecords(currentUser) ? { isInternal: false } : {}),
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: 100,
          select: workspaceMessageSelect,
        }),
        this.prisma.webAppWorkspaceRevision.findMany({
          where: { projectId: project.id },
          orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
          select: workspaceRevisionSelect,
        }),
        this.prisma.webAppWorkspaceWeeklyReport.findMany({
          where: { projectId: project.id },
          orderBy: [{ weekStartDate: "desc" }, { createdAt: "desc" }],
          select: weeklyReportSelect,
        }),
        this.prisma.webAppWorkspaceMeetingRequest.findMany({
          where: { projectId: project.id },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          select: meetingRequestSelect,
        }),
        this.prisma.task.findMany({
          where: { projectId: project.id },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          select: taskSummarySelect,
        }),
        this.prisma.deliverySprint.findMany({
          where: { projectId: project.id },
          orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
          select: sprintSummarySelect,
        }),
        this.prisma.deliveryRelease.findMany({
          where: { projectId: project.id },
          orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
          select: releaseSummarySelect,
        }),
        this.prisma.projectFile.findMany({
          where: {
            projectId: project.id,
            ...(this.shouldHideInternalRecords(currentUser)
              ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE }
              : {}),
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 100,
          select: fileSummarySelect,
        }),
      ]);
    const hideInternalRecords = this.shouldHideInternalRecords(currentUser);
    const sourceTasks = tasks.map((task) => {
      const { todos, ...taskWithoutTodos } = task;
      const completion = buildWorkspaceTaskCompletion(todos);

      return {
        ...taskWithoutTodos,
        todos: hideInternalRecords ? [] : todos,
        completion,
        progressPercent: completion.completionPercentage,
        referenceProjectFile:
          hideInternalRecords && task.referenceProjectFile?.visibility !== ProjectFileVisibility.CLIENT_VISIBLE
            ? null
            : task.referenceProjectFile,
      };
    });

    return {
      project,
      tabKey: query.tabKey ?? null,
      sourceOfTruth: {
        tasks: sourceTasks,
        sprints,
        releases,
        files,
      },
      sections,
      messages,
      revisions,
      weeklyReports,
      meetingRequests,
    };
  }

  async createSection(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateWorkspaceSectionDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "manage");
    try {
      const section = await this.prisma.webAppWorkspaceSection.create({
        data: {
          projectId: project.id,
          tabKey: dto.tabKey,
          key: dto.key,
          title: dto.title,
          description: dto.description ?? null,
          sortOrder: dto.sortOrder ?? 0,
          createdByUserId: currentUser.id,
        },
        select: workspaceSectionSelect,
      });

      this.gateway.emitWorkspaceUpdate(project.id, dto.tabKey, "section.created", {
        section,
      });

      return section;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Section key already exists for this tab.");
      }
      throw error;
    }
  }

  async updateSection(
    currentUser: AuthenticatedUser,
    projectId: string,
    sectionId: string,
    dto: UpdateWorkspaceSectionDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "manage");
    const existing = await this.prisma.webAppWorkspaceSection.findFirst({
      where: { id: sectionId, projectId: project.id },
      select: { id: true, tabKey: true, key: true },
    });
    if (!existing) {
      throw new NotFoundException("Workspace section not found.");
    }

    try {
      const section = await this.prisma.webAppWorkspaceSection.update({
        where: { id: existing.id },
        data: {
          ...(dto.tabKey !== undefined ? { tabKey: dto.tabKey } : {}),
          ...(dto.key !== undefined ? { key: dto.key } : {}),
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        },
        select: workspaceSectionSelect,
      });

      this.gateway.emitWorkspaceUpdate(project.id, section.tabKey, "section.updated", {
        section,
      });

      return section;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Section key already exists for this tab.");
      }
      throw error;
    }
  }

  async createContentItem(
    currentUser: AuthenticatedUser,
    projectId: string,
    sectionId: string,
    dto: CreateWorkspaceContentItemDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "manage");
    const section = await this.prisma.webAppWorkspaceSection.findFirst({
      where: { id: sectionId, projectId: project.id },
      select: { id: true, tabKey: true },
    });
    if (!section) {
      throw new NotFoundException("Workspace section not found.");
    }

    this.assertContentItemShape(dto.itemType, dto.body ?? null, dto.href ?? null);

    const item = await this.prisma.webAppWorkspaceContentItem.create({
      data: {
        sectionId: section.id,
        itemType: dto.itemType,
        title: dto.title,
        body: dto.body ?? null,
        href: dto.href ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
      select: {
        id: true,
        sectionId: true,
        itemType: true,
        title: true,
        body: true,
        href: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.gateway.emitWorkspaceUpdate(project.id, section.tabKey, "content-item.created", {
      sectionId: section.id,
      contentItem: item,
    });

    return item;
  }

  async updateContentItem(
    currentUser: AuthenticatedUser,
    projectId: string,
    itemId: string,
    dto: UpdateWorkspaceContentItemDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "manage");
    const existing = await this.prisma.webAppWorkspaceContentItem.findFirst({
      where: {
        id: itemId,
        section: {
          projectId: project.id,
        },
      },
      select: {
        id: true,
        itemType: true,
        section: {
          select: {
            id: true,
            tabKey: true,
          },
        },
        body: true,
        href: true,
      },
    });
    if (!existing) {
      throw new NotFoundException("Workspace content item not found.");
    }

    const nextItemType = dto.itemType ?? existing.itemType;
    const nextBody = dto.body === undefined ? existing.body : (dto.body ?? null);
    const nextHref = dto.href === undefined ? existing.href : (dto.href ?? null);
    this.assertContentItemShape(nextItemType, nextBody, nextHref);

    const item = await this.prisma.webAppWorkspaceContentItem.update({
      where: { id: existing.id },
      data: {
        ...(dto.itemType !== undefined ? { itemType: dto.itemType } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.href !== undefined ? { href: dto.href } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      select: {
        id: true,
        sectionId: true,
        itemType: true,
        title: true,
        body: true,
        href: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.gateway.emitWorkspaceUpdate(project.id, existing.section.tabKey, "content-item.updated", {
      sectionId: existing.section.id,
      contentItem: item,
    });

    return item;
  }

  async getMessages(currentUser: AuthenticatedUser, projectId: string, query: WorkspaceQueryDto) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "read");
    return this.prisma.webAppWorkspaceMessage.findMany({
      where: {
        projectId: project.id,
        ...(query.tabKey ? { tabKey: query.tabKey } : {}),
        ...(this.shouldHideInternalRecords(currentUser) ? { isInternal: false } : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: workspaceMessageSelect,
    });
  }

  async createMessage(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateWorkspaceMessageDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "interact");
    if (currentUser.accountType === AccountType.CLIENT && dto.isInternal) {
      throw new ForbiddenException("Clients cannot post internal workspace messages.");
    }

    if (dto.parentMessageId) {
      const parentMessage = await this.prisma.webAppWorkspaceMessage.findFirst({
        where: {
          id: dto.parentMessageId,
          projectId: project.id,
        },
        select: {
          id: true,
          isInternal: true,
        },
      });
      if (!parentMessage) {
        throw new BadRequestException("Parent message was not found in this project.");
      }
      if (this.shouldHideInternalRecords(currentUser) && parentMessage.isInternal) {
        throw new ForbiddenException("Clients cannot reply to internal messages.");
      }
    }

    const message = await this.prisma.webAppWorkspaceMessage.create({
      data: {
        projectId: project.id,
        tabKey: dto.tabKey,
        authorUserId: currentUser.id,
        body: dto.body,
        isInternal: dto.isInternal ?? false,
        parentMessageId: dto.parentMessageId ?? null,
      },
      select: workspaceMessageSelect,
    });

    if (!message.isInternal) {
      this.gateway.emitWorkspaceUpdate(project.id, dto.tabKey, "message.created", {
        message,
      });
    }

    return message;
  }

  async getRevisions(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "read");
    return this.prisma.webAppWorkspaceRevision.findMany({
      where: { projectId: project.id },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      select: workspaceRevisionSelect,
    });
  }

  async createRevision(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateWorkspaceRevisionDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "interact");
    await this.assertRevisionTargetsBelongToProject(project.id, dto.taskId, dto.releaseId, dto.projectFileId);

    let assignedToUserId: string | null = null;
    if (dto.assignedToUserId) {
      if (currentUser.accountType === AccountType.CLIENT) {
        throw new ForbiddenException("Clients cannot assign workspace revisions.");
      }
      assignedToUserId = await this.assertAssignableEmployee(project.clientProfileId, dto.assignedToUserId);
    }

    const revision = await this.prisma.$transaction(async (tx) => {
      const created = await tx.webAppWorkspaceRevision.create({
        data: {
          projectId: project.id,
          taskId: dto.taskId ?? null,
          releaseId: dto.releaseId ?? null,
          projectFileId: dto.projectFileId ?? null,
          title: dto.title,
          description: dto.description,
          requestedByUserId: currentUser.id,
          assignedToUserId,
          status: WebAppWorkspaceRevisionStatus.REQUESTED,
        },
        select: workspaceRevisionSelect,
      });

      await tx.webAppWorkspaceRevisionTransition.create({
        data: {
          revisionId: created.id,
          fromStatus: null,
          toStatus: WebAppWorkspaceRevisionStatus.REQUESTED,
          actorUserId: currentUser.id,
          note: "Revision created.",
        },
      });

      return tx.webAppWorkspaceRevision.findUniqueOrThrow({
        where: { id: created.id },
        select: workspaceRevisionSelect,
      });
    });

    this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.REVISIONS, "revision.created", {
      revision,
    });

    return revision;
  }

  async updateRevisionStatus(
    currentUser: AuthenticatedUser,
    projectId: string,
    revisionId: string,
    dto: UpdateWorkspaceRevisionStatusDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(
      currentUser,
      projectId,
      currentUser.accountType === AccountType.CLIENT ? "interact" : "manage",
    );
    const existing = await this.prisma.webAppWorkspaceRevision.findFirst({
      where: { id: revisionId, projectId: project.id },
      select: {
        id: true,
        status: true,
        requestedByUserId: true,
        assignedToUserId: true,
      },
    });
    if (!existing) {
      throw new NotFoundException("Workspace revision not found.");
    }

    if (currentUser.accountType !== AccountType.ADMIN) {
      this.assertRevisionTransitionAllowed(existing.status, dto.status);
    }
    this.assertRevisionTransitionAllowedForActor(
      currentUser,
      existing.status,
      dto.status,
      existing.requestedByUserId,
    );

    let assignedToUserId = existing.assignedToUserId;
    if (dto.assignedToUserId !== undefined) {
      if (currentUser.accountType === AccountType.CLIENT) {
        throw new ForbiddenException("Clients cannot re-assign workspace revisions.");
      }
      assignedToUserId = dto.assignedToUserId
        ? await this.assertAssignableEmployee(project.clientProfileId, dto.assignedToUserId)
        : null;
    }

    const revision = await this.prisma.$transaction(async (tx) => {
      await tx.webAppWorkspaceRevisionTransition.create({
        data: {
          revisionId: existing.id,
          fromStatus: existing.status,
          toStatus: dto.status,
          actorUserId: currentUser.id,
          note: dto.note ?? null,
        },
      });

      await tx.webAppWorkspaceRevision.update({
        where: { id: existing.id },
        data: {
          status: dto.status,
          assignedToUserId,
          resolvedAt: this.isResolvedRevisionStatus(dto.status) ? new Date() : null,
        },
      });

      return tx.webAppWorkspaceRevision.findUniqueOrThrow({
        where: { id: existing.id },
        select: workspaceRevisionSelect,
      });
    });

    this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.REVISIONS, "revision.updated", {
      revision,
    });

    return revision;
  }

  async getWeeklyReports(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "read");
    return this.prisma.webAppWorkspaceWeeklyReport.findMany({
      where: { projectId: project.id },
      orderBy: [{ weekStartDate: "desc" }, { createdAt: "desc" }],
      select: weeklyReportSelect,
    });
  }

  async createWeeklyReport(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateWeeklyReportDto,
  ) {
    const project = await this.assertWorkspaceProjectAccess(currentUser, projectId, "manage");
    const weekStartDate = new Date(dto.weekStartDate);
    const weekEndDate = new Date(dto.weekEndDate);
    this.assertDateRange(weekStartDate, weekEndDate, "weekEndDate cannot be earlier than weekStartDate.");

    try {
      const report = await this.prisma.webAppWorkspaceWeeklyReport.create({
        data: {
          projectId: project.id,
          weekStartDate,
          weekEndDate,
          summary: dto.summary,
          accomplishments: dto.accomplishments ?? null,
          plannedNext: dto.plannedNext ?? null,
          blockers: dto.blockers ?? null,
          authorUserId: currentUser.id,
          publishedAt: new Date(),
        },
        select: weeklyReportSelect,
      });

      this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.REPORTS, "weekly-report.created", {
        weeklyReport: report,
      });

      return report;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Weekly report already exists for this week.");
      }
      throw error;
    }
  }

  async getMeetingRequests(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.assertMeetingProjectAccess(currentUser, projectId, "read");
    return this.prisma.webAppWorkspaceMeetingRequest.findMany({
      where: { projectId: project.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: meetingRequestSelect,
    });
  }

  async createMeetingRequest(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateMeetingRequestDto,
  ) {
    const project = await this.assertMeetingProjectAccess(currentUser, projectId, "interact");
    const preferredStartAt = new Date(dto.preferredStartAt);
    const preferredEndAt = new Date(dto.preferredEndAt);
    this.assertDateRange(
      preferredStartAt,
      preferredEndAt,
      "preferredEndAt cannot be earlier than preferredStartAt.",
    );
    this.assertMeetingSchedule(preferredStartAt, preferredEndAt, dto.timezone);

    const request = await this.prisma.webAppWorkspaceMeetingRequest.create({
      data: {
        projectId: project.id,
        clientProfileId: project.clientProfileId,
        title: dto.title,
        agenda: dto.agenda ?? null,
        requestedByUserId: currentUser.id,
        preferredStartAt,
        preferredEndAt,
        timezone: dto.timezone,
      },
      select: meetingRequestSelect,
    });

    this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.MEETINGS, "meeting-request.created", {
      meetingRequest: request,
    });

    // Notify the assigned project manager via their personal socket room
    const pmAssignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        clientProfileId: project.clientProfileId,
        isActive: true,
        scope: EmployeeClientAssignmentScope.PROJECT,
        employeeUser: {
          role: UserRole.PROJECT_MANAGER,
          status: UserStatus.ACTIVE,
        },
      },
      select: { employeeUserId: true },
    });

    if (pmAssignment) {
      this.gateway.emitToUser(pmAssignment.employeeUserId, "meeting-request.new", {
        projectId: project.id,
        meetingRequest: request,
      });
    }

    return request;
  }

  async getMeetingRequestsForClientProfile(currentUser: AuthenticatedUser) {
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    this.assertHasPermission(currentUser, [WORKSPACE_READ_OWN_PERMISSION]);
    return this.prisma.webAppWorkspaceMeetingRequest.findMany({
      where: { clientProfileId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: meetingRequestSelect,
    });
  }

  async createMeetingRequestForClientProfile(
    currentUser: AuthenticatedUser,
    dto: CreateMeetingRequestDto,
  ) {
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    this.assertHasPermission(currentUser, [WORKSPACE_INTERACT_OWN_PERMISSION]);
    const project = dto.projectId
      ? await this.prisma.project.findFirst({
          where: { id: dto.projectId, clientProfileId },
          select: { id: true },
        })
      : null;
    if (dto.projectId && !project) {
      throw new NotFoundException("Proje bulunamadı.");
    }

    const preferredStartAt = new Date(dto.preferredStartAt);
    const preferredEndAt = new Date(dto.preferredEndAt);
    this.assertDateRange(preferredStartAt, preferredEndAt, "preferredEndAt cannot be earlier than preferredStartAt.");
    this.assertMeetingSchedule(preferredStartAt, preferredEndAt, dto.timezone);

    const request = await this.prisma.webAppWorkspaceMeetingRequest.create({
      data: {
        projectId: project?.id ?? null,
        clientProfileId,
        title: dto.title,
        agenda: dto.agenda ?? null,
        requestedByUserId: currentUser.id,
        preferredStartAt,
        preferredEndAt,
        timezone: dto.timezone,
      },
      select: meetingRequestSelect,
    });

    if (project) {
      this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.MEETINGS, "meeting-request.created", {
        meetingRequest: request,
      });
    }

    const pmAssignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        clientProfileId,
        isActive: true,
        scope: EmployeeClientAssignmentScope.PROJECT,
        employeeUser: { role: UserRole.PROJECT_MANAGER, status: UserStatus.ACTIVE },
      },
      select: { employeeUserId: true },
    });

    if (pmAssignment) {
      this.gateway.emitToUser(pmAssignment.employeeUserId, "meeting-request.new", {
        projectId: project?.id ?? null,
        meetingRequest: request,
      });
    }

    return request;
  }

  async updateMeetingRequest(
    currentUser: AuthenticatedUser,
    projectId: string,
    meetingRequestId: string,
    dto: UpdateMeetingRequestDto,
  ) {
    const project = await this.assertMeetingResponderAccess(currentUser, projectId);
    const existing = await this.prisma.webAppWorkspaceMeetingRequest.findFirst({
      where: { id: meetingRequestId, projectId: project.id },
      select: {
        id: true,
        preferredStartAt: true,
        preferredEndAt: true,
        timezone: true,
        scheduledStartAt: true,
        scheduledEndAt: true,
      },
    });
    if (!existing) {
      throw new NotFoundException("Toplantı talebi bulunamadı.");
    }

    const nextScheduledStartAt =
      dto.scheduledStartAt === undefined
        ? (dto.status === "CONFIRMED" && !existing.scheduledStartAt
          ? existing.preferredStartAt
          : existing.scheduledStartAt)
        : (dto.scheduledStartAt ? new Date(dto.scheduledStartAt) : null);
    const nextScheduledEndAt =
      dto.scheduledEndAt === undefined
        ? (dto.status === "CONFIRMED" && !existing.scheduledEndAt
          ? existing.preferredEndAt
          : existing.scheduledEndAt)
        : (dto.scheduledEndAt ? new Date(dto.scheduledEndAt) : null);

    if ((nextScheduledStartAt && !nextScheduledEndAt) || (!nextScheduledStartAt && nextScheduledEndAt)) {
      throw new BadRequestException("scheduledStartAt ve scheduledEndAt birlikte belirtilmelidir.");
    }

    if (nextScheduledStartAt && nextScheduledEndAt) {
      this.assertDateRange(
        nextScheduledStartAt,
        nextScheduledEndAt,
        "scheduledEndAt cannot be earlier than scheduledStartAt.",
      );
      this.assertMeetingSchedule(nextScheduledStartAt, nextScheduledEndAt, existing.timezone);

      const dateChanged =
        nextScheduledStartAt.getTime() !== existing.preferredStartAt.getTime() ||
        nextScheduledEndAt.getTime() !== existing.preferredEndAt.getTime();
      if (dateChanged && !dto.responseNote?.trim()) {
        throw new BadRequestException("Farklı bir toplantı saati önerirken yanıt notu zorunludur.");
      }
    }

    const request = await this.prisma.webAppWorkspaceMeetingRequest.update({
      where: { id: existing.id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.responseNote !== undefined ? { responseNote: dto.responseNote } : {}),
        ...(dto.scheduledStartAt !== undefined ? { scheduledStartAt: nextScheduledStartAt } : {}),
        ...(dto.scheduledEndAt !== undefined ? { scheduledEndAt: nextScheduledEndAt } : {}),
        responderUserId: currentUser.id,
      },
      select: meetingRequestSelect,
    });

    this.gateway.emitWorkspaceUpdate(project.id, WebAppWorkspaceTabKey.MEETINGS, "meeting-request.updated", {
      meetingRequest: request,
    });
    this.gateway.emitToClientProfile(project.clientProfileId, "meeting-request.updated", {
      meetingRequest: request,
    });

    return request;
  }

  private async assertMeetingProjectAccess(
    currentUser: AuthenticatedUser,
    projectId: string,
    accessLevel: "read" | "interact",
  ): Promise<{ id: string; clientProfileId: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientProfileId: true },
    });
    if (!project) {
      throw new NotFoundException("Proje bulunamadı.");
    }

    if (currentUser.accountType === AccountType.ADMIN) {
      this.assertAdminWorkspaceAccess(currentUser, accessLevel);
      return project;
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      if (currentUser.clientProfileId !== project.clientProfileId) {
        throw new NotFoundException("Proje bulunamadı.");
      }
      if (accessLevel === "interact") {
        this.assertHasPermission(currentUser, [WORKSPACE_INTERACT_OWN_PERMISSION]);
      } else {
        this.assertHasPermission(currentUser, [WORKSPACE_READ_OWN_PERMISSION]);
      }
      return project;
    }

    this.assertEmployeeWorkspacePermission(currentUser, accessLevel);
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Proje bulunamadı.");
    }
    return project;
  }

  private async assertMeetingResponderAccess(
    currentUser: AuthenticatedUser,
    projectId: string,
  ): Promise<WorkspaceProject> {
    if (
      currentUser.accountType !== AccountType.EMPLOYEE ||
      currentUser.role !== UserRole.PROJECT_MANAGER
    ) {
      throw new ForbiddenException("Toplantı taleplerine yalnızca atanmış proje yöneticisi yanıt verebilir.");
    }

    this.assertEmployeeWorkspacePermission(currentUser, "manage");
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: projectSummarySelect,
    });
    if (!project) {
      throw new NotFoundException("Proje bulunamadı.");
    }

    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
        scope: EmployeeClientAssignmentScope.PROJECT,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Proje bulunamadı.");
    }

    return project;
  }

  private async assertWorkspaceProjectAccess(
    currentUser: AuthenticatedUser,
    projectId: string,
    accessLevel: "read" | "manage" | "interact",
  ): Promise<WorkspaceProject> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: projectSummarySelect,
    });
    if (!project || project.serviceKey !== PurchasedServiceKey.WEB_APP) {
      throw new NotFoundException("Project not found.");
    }

    if (currentUser.accountType === AccountType.ADMIN) {
      this.assertAdminWorkspaceAccess(currentUser, accessLevel);
      return project;
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      this.assertClientWorkspaceAccess(currentUser, project, accessLevel);
      return project;
    }

    this.assertEmployeeWorkspacePermission(currentUser, accessLevel);
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
        scope: {
          in: [
            EmployeeClientAssignmentScope.PROJECT,
            EmployeeClientAssignmentScope.DEVELOPMENT,
            EmployeeClientAssignmentScope.DESIGN,
          ],
        },
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Project not found.");
    }

    return project;
  }

  private assertAdminWorkspaceAccess(
    currentUser: AuthenticatedUser,
    accessLevel: "read" | "manage" | "interact",
  ) {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can access full workspace scope.");
    }

    if (accessLevel === "read") {
      this.assertHasPermission(currentUser, [
        WORKSPACE_READ_ANY_PERMISSION,
        WORKSPACE_MANAGE_ANY_PERMISSION,
      ]);
      return;
    }

    this.assertHasPermission(currentUser, [WORKSPACE_MANAGE_ANY_PERMISSION]);
  }

  private assertClientWorkspaceAccess(
    currentUser: AuthenticatedUser,
    project: WorkspaceProject,
    accessLevel: "read" | "manage" | "interact",
  ) {
    if (currentUser.clientProfileId !== project.clientProfileId) {
      throw new NotFoundException("Project not found.");
    }

    if (accessLevel === "read") {
      this.assertHasPermission(currentUser, [WORKSPACE_READ_OWN_PERMISSION]);
      return;
    }

    if (accessLevel === "interact") {
      this.assertHasPermission(currentUser, [WORKSPACE_INTERACT_OWN_PERMISSION]);
      return;
    }

    throw new ForbiddenException("Clients cannot manage workspace structure.");
  }

  private assertEmployeeWorkspacePermission(
    currentUser: AuthenticatedUser,
    accessLevel: "read" | "manage" | "interact",
  ) {
    if (accessLevel === "read") {
      this.assertHasPermission(currentUser, [
        WORKSPACE_READ_ASSIGNED_PERMISSION,
        WORKSPACE_MANAGE_ASSIGNED_PERMISSION,
      ]);
      return;
    }

    if (accessLevel === "manage") {
      this.assertHasPermission(currentUser, [WORKSPACE_MANAGE_ASSIGNED_PERMISSION]);
      return;
    }

    this.assertHasPermission(currentUser, [
      WORKSPACE_INTERACT_ASSIGNED_PERMISSION,
      WORKSPACE_MANAGE_ASSIGNED_PERMISSION,
    ]);
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permissions: readonly string[]) {
    if (!permissions.some((permission) => currentUser.permissions.includes(permission))) {
      throw new ForbiddenException("Missing required workspace permissions.");
    }
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Bu işlem için müşteri profili gereklidir.");
    }
    return currentUser.clientProfileId;
  }

  private shouldHideInternalRecords(currentUser: AuthenticatedUser) {
    return currentUser.accountType === AccountType.CLIENT;
  }

  private assertContentItemShape(
    itemType: WebAppWorkspaceContentItemType,
    body: string | null,
    href: string | null,
  ) {
    if ((itemType === WebAppWorkspaceContentItemType.TEXT || itemType === WebAppWorkspaceContentItemType.CHECKLIST) && !body) {
      throw new BadRequestException("body is required for TEXT and CHECKLIST items.");
    }

    if (
      (itemType === WebAppWorkspaceContentItemType.LINK ||
        itemType === WebAppWorkspaceContentItemType.EMBED ||
        itemType === WebAppWorkspaceContentItemType.METRIC) &&
      !href &&
      itemType !== WebAppWorkspaceContentItemType.METRIC
    ) {
      throw new BadRequestException("href is required for LINK and EMBED items.");
    }
  }

  private async assertRevisionTargetsBelongToProject(
    projectId: string,
    taskId?: string,
    releaseId?: string,
    projectFileId?: string,
  ) {
    if (!taskId && !releaseId && !projectFileId) {
      return;
    }

    if (taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: taskId, projectId },
        select: { id: true },
      });
      if (!task) {
        throw new BadRequestException("Referenced task does not belong to this project.");
      }
    }

    if (releaseId) {
      const release = await this.prisma.deliveryRelease.findFirst({
        where: { id: releaseId, projectId },
        select: { id: true },
      });
      if (!release) {
        throw new BadRequestException("Referenced release does not belong to this project.");
      }
    }

    if (projectFileId) {
      const projectFile = await this.prisma.projectFile.findFirst({
        where: { id: projectFileId, projectId },
        select: { id: true },
      });
      if (!projectFile) {
        throw new BadRequestException("Referenced project file does not belong to this project.");
      }
    }
  }

  private async assertAssignableEmployee(clientProfileId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        accountType: AccountType.EMPLOYEE,
        status: UserStatus.ACTIVE,
        employeeClientAssignments: {
          some: {
            clientProfileId,
            isActive: true,
            scope: {
              in: [
                EmployeeClientAssignmentScope.PROJECT,
                EmployeeClientAssignmentScope.DEVELOPMENT,
                EmployeeClientAssignmentScope.DESIGN,
              ],
            },
          },
        },
      },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException("Assigned employee is outside project scope.");
    }
    return user.id;
  }

  private assertRevisionTransitionAllowed(
    fromStatus: WebAppWorkspaceRevisionStatus,
    toStatus: WebAppWorkspaceRevisionStatus,
  ) {
    if (fromStatus === toStatus) {
      return;
    }

    const transitions: Record<WebAppWorkspaceRevisionStatus, readonly WebAppWorkspaceRevisionStatus[]> = {
      REQUESTED: [WebAppWorkspaceRevisionStatus.ACKNOWLEDGED, WebAppWorkspaceRevisionStatus.CANCELLED, WebAppWorkspaceRevisionStatus.REJECTED],
      ACKNOWLEDGED: [WebAppWorkspaceRevisionStatus.IN_PROGRESS, WebAppWorkspaceRevisionStatus.CANCELLED, WebAppWorkspaceRevisionStatus.REJECTED],
      IN_PROGRESS: [WebAppWorkspaceRevisionStatus.READY_FOR_REVIEW, WebAppWorkspaceRevisionStatus.CANCELLED],
      READY_FOR_REVIEW: [WebAppWorkspaceRevisionStatus.APPROVED, WebAppWorkspaceRevisionStatus.REJECTED, WebAppWorkspaceRevisionStatus.IN_PROGRESS],
      APPROVED: [],
      REJECTED: [WebAppWorkspaceRevisionStatus.IN_PROGRESS, WebAppWorkspaceRevisionStatus.CANCELLED],
      CANCELLED: [],
    };

    if (!transitions[fromStatus].includes(toStatus)) {
      this.throwInvalidRevisionTransition(fromStatus, toStatus);
    }
  }

  private assertRevisionTransitionAllowedForActor(
    currentUser: AuthenticatedUser,
    fromStatus: WebAppWorkspaceRevisionStatus,
    toStatus: WebAppWorkspaceRevisionStatus,
    requestedByUserId: string,
  ) {
    if (fromStatus === toStatus) {
      return;
    }

    if (currentUser.accountType === AccountType.ADMIN) {
      return;
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      if (requestedByUserId !== currentUser.id) {
        throw new ForbiddenException("Clients can only manage revisions they requested.");
      }

      const clientTransitions: Record<
        WebAppWorkspaceRevisionStatus,
        readonly WebAppWorkspaceRevisionStatus[]
      > = {
        REQUESTED: [WebAppWorkspaceRevisionStatus.CANCELLED],
        ACKNOWLEDGED: [],
        IN_PROGRESS: [],
        READY_FOR_REVIEW: [
          WebAppWorkspaceRevisionStatus.APPROVED,
          WebAppWorkspaceRevisionStatus.REJECTED,
        ],
        APPROVED: [],
        REJECTED: [],
        CANCELLED: [],
      };

      if (!clientTransitions[fromStatus].includes(toStatus)) {
        this.throwInvalidRevisionTransition(fromStatus, toStatus);
      }
      return;
    }

    const employeeTransitions: Record<
      WebAppWorkspaceRevisionStatus,
      readonly WebAppWorkspaceRevisionStatus[]
    > = {
      REQUESTED: [
        WebAppWorkspaceRevisionStatus.ACKNOWLEDGED,
        WebAppWorkspaceRevisionStatus.CANCELLED,
        WebAppWorkspaceRevisionStatus.REJECTED,
      ],
      ACKNOWLEDGED: [
        WebAppWorkspaceRevisionStatus.IN_PROGRESS,
        WebAppWorkspaceRevisionStatus.CANCELLED,
        WebAppWorkspaceRevisionStatus.REJECTED,
      ],
      IN_PROGRESS: [
        WebAppWorkspaceRevisionStatus.READY_FOR_REVIEW,
        WebAppWorkspaceRevisionStatus.CANCELLED,
      ],
      READY_FOR_REVIEW: [WebAppWorkspaceRevisionStatus.IN_PROGRESS],
      APPROVED: [],
      REJECTED: [WebAppWorkspaceRevisionStatus.IN_PROGRESS, WebAppWorkspaceRevisionStatus.CANCELLED],
      CANCELLED: [],
    };

    if (!employeeTransitions[fromStatus].includes(toStatus)) {
      this.throwInvalidRevisionTransition(fromStatus, toStatus);
    }
  }

  private throwInvalidRevisionTransition(
    fromStatus: WebAppWorkspaceRevisionStatus,
    toStatus: WebAppWorkspaceRevisionStatus,
  ) {
    throw new BadRequestException(
      `Invalid revision status transition from ${fromStatus} to ${toStatus}.`,
    );
  }

  private isResolvedRevisionStatus(status: WebAppWorkspaceRevisionStatus) {
    return (
      status === WebAppWorkspaceRevisionStatus.APPROVED ||
      status === WebAppWorkspaceRevisionStatus.REJECTED ||
      status === WebAppWorkspaceRevisionStatus.CANCELLED
    );
  }

  private assertDateRange(startDate: Date, endDate: Date, message: string) {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid date value provided.");
    }
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException(message);
    }
  }

  private assertMeetingSchedule(startDate: Date, endDate: Date, timezone: string) {
    if (timezone !== "Europe/Istanbul") {
      throw new BadRequestException("Toplantı saat dilimi Europe/Istanbul olmalıdır.");
    }
    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException("Toplantı bitiş saati başlangıç saatinden sonra olmalıdır.");
    }
    if (startDate.getTime() <= Date.now()) {
      throw new BadRequestException("Geçmiş bir tarih için toplantı talebi oluşturamazsınız.");
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(startDate);
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "-1");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "-1");
    const minutesSinceMidnight = hour * 60 + minute;
    if (minutesSinceMidnight < 9 * 60 || minutesSinceMidnight > 18 * 60) {
      throw new BadRequestException("Toplantı başlangıç saati 09:00-18:00 TSİ arasında olmalıdır.");
    }
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }
}
