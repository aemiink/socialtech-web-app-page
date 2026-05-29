import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  PurchasedServiceKey,
  Prisma,
  SocialMediaPostStatus,
  TaskStatus,
  TaskType,
  TaskTodoVisibility,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { GithubService } from "../integrations/github/github.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskTodoDto } from "./dto/create-task-todo.dto";
import { CreateTaskWorkNoteDto } from "./dto/create-task-work-note.dto";
import { PrepareTaskCodeDto } from "./dto/prepare-task-code.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { ToggleTaskTodoDto } from "./dto/toggle-task-todo.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskTodoDto } from "./dto/update-task-todo.dto";
import { GithubQueryDto } from "../integrations/github/dto/github-query.dto";

const clientSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
} satisfies Prisma.ClientProfileSelect;

const projectSummarySelect = {
  id: true,
  clientProfileId: true,
  serviceKey: true,
  name: true,
  slug: true,
  status: true,
  priority: true,
  clientProfile: {
    select: clientSummarySelect,
  },
} satisfies Prisma.ProjectSelect;

const assigneeSummarySelect = {
  id: true,
  displayName: true,
  role: true,
} satisfies Prisma.UserSelect;

const taskTodoReadSelect = {
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
} satisfies Prisma.TaskTodoSelect;

const taskReadSelect = {
  id: true,
  projectId: true,
  sprintId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  type: true,
  workstream: true,
  severity: true,
  environment: true,
  affectedUrl: true,
  reproductionSteps: true,
  reportedBy: true,
  code: true,
  branchName: true,
  codePreparationNotes: true,
  codePreparedAt: true,
  codePreparedByUserId: true,
  assigneeUserId: true,
  dueDate: true,
  approvalRequired: true,
  approvalType: true,
  approvalStatus: true,
  approvalResponseNote: true,
  approvalRequestedAt: true,
  approvalRespondedAt: true,
  approvalRespondedByUserId: true,
  approvalContext: true,
  referenceProjectFileId: true,
  campaignRef: true,
  adSetRef: true,
  adRef: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: projectSummarySelect,
  },
  assignee: {
    select: assigneeSummarySelect,
  },
  codePreparedBy: {
    select: assigneeSummarySelect,
  },
  approvalRespondedBy: {
    select: assigneeSummarySelect,
  },
  referenceProjectFile: {
    select: {
      id: true,
      title: true,
      secureUrl: true,
      category: true,
      mimeType: true,
      visibility: true,
      approvalRequired: true,
      approvalStatus: true,
    },
  },
  sprint: {
    select: {
      id: true,
      projectId: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  },
  todos: {
    select: taskTodoReadSelect,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  },
  workNotes: {
    select: {
      id: true,
      taskId: true,
      authorUserId: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: assigneeSummarySelect,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  },
} satisfies Prisma.TaskSelect;

type TaskReadModel = Prisma.TaskGetPayload<{ select: typeof taskReadSelect }>;
type TaskTodoReadModel = Prisma.TaskTodoGetPayload<{ select: typeof taskTodoReadSelect }>;
type TaskWorkNoteReadModel = TaskReadModel["workNotes"][number];

type TaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  remainingTodos: number;
  completionPercentage: number;
  isComplete: boolean;
};

type TaskResponse = Omit<TaskReadModel, "todos"> & {
  todos: TaskTodoReadModel[];
  workNotes: TaskWorkNoteReadModel[];
  completion: TaskCompletion;
};

type ProjectAssignmentContext = {
  id: string;
  clientProfileId: string;
  serviceKey: PurchasedServiceKey | null;
};

type TaskUpdateState = {
  id: string;
  projectId: string;
  assigneeUserId: string | null;
  project: ProjectAssignmentContext;
  title: string;
  code: string | null;
  branchName: string | null;
  codePreparationNotes: string | null;
};

const TASK_READ_ANY_PERMISSION = "tasks.read.any";
const TASK_READ_ANY_FALLBACK_PERMISSION = "tasks.read";
const TASK_READ_ASSIGNED_PERMISSION = "tasks.read.assigned";
const TASK_OWN_READ_PERMISSIONS = ["tasks.read.own", "portal.read.own", "clients.read.own"] as const;
const TASK_MANAGE_ANY_PERMISSION = "tasks.manage.any";
const TASK_MANAGE_FALLBACK_PERMISSION = "tasks.manage";
const TASK_MANAGE_ASSIGNED_PERMISSION = "tasks.manage.assigned";
const TASK_ASSIGN_ASSIGNED_PERMISSION = "tasks.assign.assigned";
const TASK_TODOS_MANAGE_ASSIGNED_PERMISSION = "tasks.todos.manage.assigned";
const TASK_UPDATE_ASSIGNED_PERMISSION = "tasks.update.assigned";
const TASK_UPDATE_OWN_FALLBACK_PERMISSION = "tasks.update.own";
const APPROVAL_RESPOND_OWN_PERMISSION = "approvals.respond.own";
const META_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION = "metaAds.approvals.create.assigned";
const TIKTOK_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION = "tiktokAds.approvals.create.assigned";
const AMAZON_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION = "amazonAds.approvals.create.assigned";
const SOCIAL_MEDIA_APPROVALS_CREATE_ASSIGNED_PERMISSION = "socialMedia.approvals.create.assigned";

const SOCIAL_MEDIA_POST_LINKED_APPROVAL_TYPES = new Set<MetaAdsApprovalType>([
  MetaAdsApprovalType.SOCIAL_MEDIA_POST_APPROVAL,
  MetaAdsApprovalType.SOCIAL_MEDIA_CREATIVE_APPROVAL,
  MetaAdsApprovalType.SOCIAL_MEDIA_CAPTION_APPROVAL,
]);

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

  async getTasks(
    currentUser: AuthenticatedUser,
    query: TaskQueryDto,
  ): Promise<TaskResponse[]> {
    this.assertValidDateRange(query.dueFrom, query.dueTo);

    if (this.isClient(currentUser) && this.isClientProfileFilterOutsideOwnScope(currentUser, query)) {
      this.assertCanReadOwnTasks(currentUser);
      return [];
    }

    const where: Prisma.TaskWhereInput = {
      AND: [this.buildTaskVisibilityWhere(currentUser), this.buildTaskQueryWhere(query)],
    };

    const tasks = await this.prisma.task.findMany({
      where,
      select: taskReadSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return tasks.map((task) => this.toTaskResponse(task, currentUser));
  }

  async getTaskById(
    currentUser: AuthenticatedUser,
    taskId: string,
  ): Promise<TaskResponse> {
    const task = await this.prisma.task.findFirst({
      where: {
        AND: [{ id: taskId }, this.buildTaskVisibilityWhere(currentUser)],
      },
      select: taskReadSelect,
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    return this.toTaskResponse(task, currentUser);
  }

  async createTask(
    currentUser: AuthenticatedUser,
    dto: CreateTaskDto,
  ): Promise<TaskResponse> {
    this.assertBodyObject(dto);
    const project = await this.getProjectAssignmentContextOrBadRequest(dto.projectId);
    if (this.isAdsApprovalTask(project, dto)) {
      await this.assertCanCreateAdsApprovalTask(currentUser, project);
    } else {
      await this.assertCanManageTaskProject(currentUser, project.clientProfileId);
    }
    if (dto.assigneeUserId) {
      this.assertCanAssignTaskWithinScope(currentUser);
    }
    await this.assertAssigneeIsValidForProject(dto.assigneeUserId, project.clientProfileId);
    await this.assertSprintBelongsToProject(dto.sprintId, project.id);
    await this.assertReferenceProjectFileBelongsToProject(dto.referenceProjectFileId, project.id);
    const generatedCode = dto.code?.trim() || (await this.generateTaskCode(dto.type ?? TaskType.FEATURE));
    const approvalStatus =
      dto.approvalStatus ?? (dto.approvalRequired ? MetaAdsApprovalStatus.PENDING : null);
    const approvalRequestedAt =
      this.parseNullableDate(dto.approvalRequestedAt) ??
      (approvalStatus === MetaAdsApprovalStatus.PENDING ? new Date() : null);
    const approvalRespondedAt = this.parseNullableDate(dto.approvalRespondedAt) ?? null;
    const shouldSetApprovalResponder =
      approvalStatus !== null && this.isTerminalApprovalStatus(approvalStatus);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status,
        priority: dto.priority,
        type: dto.type,
        workstream: dto.workstream,
        severity: dto.severity ?? null,
        environment: dto.environment ?? null,
        affectedUrl: dto.affectedUrl ?? null,
        reproductionSteps: dto.reproductionSteps ?? null,
        reportedBy: dto.reportedBy ?? null,
        code: generatedCode,
        dueDate: this.parseNullableDate(dto.dueDate) ?? null,
        project: {
          connect: { id: dto.projectId },
        },
        ...(dto.sprintId ? { sprint: { connect: { id: dto.sprintId } } } : {}),
        ...(dto.assigneeUserId
          ? { assignee: { connect: { id: dto.assigneeUserId } } }
          : {}),
        approvalRequired: dto.approvalRequired ?? false,
        approvalType: dto.approvalType ?? null,
        approvalStatus,
        approvalResponseNote: dto.approvalResponseNote ?? null,
        approvalRequestedAt,
        approvalRespondedAt,
        ...(shouldSetApprovalResponder ? { approvalRespondedBy: { connect: { id: currentUser.id } } } : {}),
        ...(dto.referenceProjectFileId
          ? { referenceProjectFile: { connect: { id: dto.referenceProjectFileId } } }
          : {}),
        campaignRef: dto.campaignRef ?? null,
        adSetRef: dto.adSetRef ?? null,
        adRef: dto.adRef ?? null,
      },
      select: taskReadSelect,
    });

    return this.toTaskResponse(task, currentUser);
  }

  async updateTask(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    this.assertBodyObject(dto);
    this.assertHasUpdatePayload(dto);

    if (this.isAdmin(currentUser)) {
      return this.updateTaskAsAdmin(currentUser, taskId, dto);
    }

    if (this.isEmployee(currentUser) && currentUser.role === UserRole.PROJECT_MANAGER) {
      return this.updateTaskAsAssignedManager(currentUser, taskId, dto);
    }

    if (this.isEmployee(currentUser)) {
      return this.updateOwnTaskStatus(currentUser, taskId, dto);
    }

    if (this.isClient(currentUser)) {
      return this.updateTaskAsClientApprovalResponse(currentUser, taskId, dto);
    }

    throw new ForbiddenException("You are not allowed to update tasks.");
  }

  async createTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: CreateTaskTodoDto,
  ): Promise<TaskResponse> {
    this.assertBodyObject(dto);
    await this.assertCanManageTaskTodoScope(currentUser, taskId);

    await this.prisma.taskTodo.create({
      data: {
        taskId,
        title: dto.title,
        description: dto.description ?? null,
        visibility: dto.visibility ?? TaskTodoVisibility.INTERNAL,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return this.getTaskById(currentUser, taskId);
  }

  async updateTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
    todoId: string,
    dto: UpdateTaskTodoDto,
  ): Promise<TaskResponse> {
    this.assertBodyObject(dto);
    await this.assertCanManageTaskTodoScope(currentUser, taskId);
    this.assertHasTodoUpdatePayload(dto);
    await this.assertTaskTodoExists(taskId, todoId);

    await this.prisma.taskTodo.update({
      where: { id: todoId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return this.getTaskById(currentUser, taskId);
  }

  async toggleTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
    todoId: string,
    dto: ToggleTaskTodoDto | undefined,
  ): Promise<TaskResponse> {
    const payload = dto ?? {};
    this.assertBodyObject(payload);
    await this.assertCanToggleTaskTodo(currentUser, taskId);

    const todo = await this.prisma.taskTodo.findFirst({
      where: {
        id: todoId,
        taskId,
      },
      select: {
        id: true,
        isCompleted: true,
      },
    });
    if (!todo) {
      throw new NotFoundException("Task todo not found.");
    }

    const isCompleted = payload.isCompleted ?? !todo.isCompleted;
    await this.prisma.taskTodo.update({
      where: { id: todo.id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        completedByUserId: isCompleted ? currentUser.id : null,
      },
    });

    return this.getTaskById(currentUser, taskId);
  }

  async deleteTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
    todoId: string,
  ): Promise<TaskResponse> {
    await this.assertCanManageTaskTodoScope(currentUser, taskId);

    const result = await this.prisma.taskTodo.deleteMany({
      where: {
        id: todoId,
        taskId,
      },
    });
    if (result.count !== 1) {
      throw new NotFoundException("Task todo not found.");
    }

    return this.getTaskById(currentUser, taskId);
  }

  async getTaskWorkNotes(currentUser: AuthenticatedUser, taskId: string) {
    this.assertCanReadInternalTaskData(currentUser);
    const task = await this.getTaskById(currentUser, taskId);
    return task.workNotes;
  }

  async createTaskWorkNote(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: CreateTaskWorkNoteDto,
  ) {
    this.assertBodyObject(dto);
    const task = await this.assertTaskScopeForInternalWrite(currentUser, taskId);

    await this.prisma.taskWorkNote.create({
      data: {
        taskId: task.id,
        authorUserId: currentUser.id,
        note: dto.note,
      },
    });

    return this.getTaskById(currentUser, taskId);
  }

  async prepareTaskCode(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: PrepareTaskCodeDto,
  ) {
    this.assertBodyObject(dto ?? {});
    const task = await this.assertTaskScopeForInternalWrite(currentUser, taskId);
    await this.assertRepositoryRequiredForApplicationProject(currentUser, task.project);

    const branchName = dto.branchName ?? task.branchName ?? this.buildSuggestedBranchName(task);
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        branchName,
        codePreparationNotes: dto.notes === undefined ? task.codePreparationNotes : dto.notes,
        codePreparedAt: new Date(),
        codePreparedByUserId: currentUser.id,
      },
      select: taskReadSelect,
    });

    return this.toTaskResponse(updatedTask, currentUser);
  }

  async getRelatedCommits(currentUser: AuthenticatedUser, taskId: string, query: GithubQueryDto) {
    this.assertCanReadInternalTaskData(currentUser);
    const task = await this.getTaskById(currentUser, taskId);

    const commits = await this.githubService.getCommits(currentUser, task.projectId, {
      ...query,
      branch: query.branch ?? task.branchName ?? undefined,
      perPage: query.perPage ?? 20,
    });

    return commits.filter((commit) => {
      if (task.code && commit.message.toLowerCase().includes(task.code.toLowerCase())) {
        return true;
      }

      return task.branchName ? commit.branch === task.branchName : true;
    });
  }

  private async updateTaskAsAdmin(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    this.assertCanManageTasks(currentUser);

    const existingTask = await this.getTaskUpdateStateOrFail(taskId);
    const nextProject = dto.projectId
      ? await this.getProjectAssignmentContextOrBadRequest(dto.projectId)
      : existingTask.project;
    const nextAssigneeUserId =
      dto.assigneeUserId === undefined ? existingTask.assigneeUserId : dto.assigneeUserId;

    if (dto.projectId || dto.assigneeUserId !== undefined) {
      await this.assertAssigneeIsValidForProject(nextAssigneeUserId, nextProject.clientProfileId);
    }
    if (dto.sprintId !== undefined) {
      await this.assertSprintBelongsToProject(dto.sprintId, nextProject.id);
    }
    if (dto.referenceProjectFileId !== undefined) {
      await this.assertReferenceProjectFileBelongsToProject(dto.referenceProjectFileId, nextProject.id);
    }

    const dueDateUpdate = this.parseNullableDate(dto.dueDate);
    const approvalRequestedAtUpdate = this.parseNullableDate(dto.approvalRequestedAt);
    const approvalRespondedAtUpdate = this.parseNullableDate(dto.approvalRespondedAt);
    const approvalStatusUpdate = this.buildApprovalStatusUpdateData(
      dto.approvalStatus,
      currentUser.id,
      approvalRespondedAtUpdate,
    );
    const data: Prisma.TaskUpdateInput = {
      ...(dto.projectId ? { project: { connect: { id: dto.projectId } } } : {}),
      ...(dto.sprintId !== undefined
        ? {
            sprint:
              dto.sprintId === null
                ? { disconnect: true }
                : { connect: { id: dto.sprintId } },
          }
        : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.workstream !== undefined ? { workstream: dto.workstream } : {}),
      ...(dto.severity !== undefined ? { severity: dto.severity } : {}),
      ...(dto.environment !== undefined ? { environment: dto.environment } : {}),
      ...(dto.affectedUrl !== undefined ? { affectedUrl: dto.affectedUrl } : {}),
      ...(dto.reproductionSteps !== undefined
        ? { reproductionSteps: dto.reproductionSteps }
        : {}),
      ...(dto.reportedBy !== undefined ? { reportedBy: dto.reportedBy } : {}),
      ...(dto.code !== undefined ? { code: dto.code } : {}),
      ...(dueDateUpdate !== undefined ? { dueDate: dueDateUpdate } : {}),
      ...(dto.approvalRequired !== undefined ? { approvalRequired: dto.approvalRequired } : {}),
      ...(dto.approvalType !== undefined ? { approvalType: dto.approvalType } : {}),
      ...(dto.approvalResponseNote !== undefined
        ? { approvalResponseNote: dto.approvalResponseNote }
        : {}),
      ...(approvalRequestedAtUpdate !== undefined
        ? { approvalRequestedAt: approvalRequestedAtUpdate }
        : {}),
      ...(approvalStatusUpdate ?? {}),
      ...(dto.referenceProjectFileId !== undefined
        ? {
            referenceProjectFile:
              dto.referenceProjectFileId === null
                ? { disconnect: true }
                : { connect: { id: dto.referenceProjectFileId } },
          }
        : {}),
      ...(dto.campaignRef !== undefined ? { campaignRef: dto.campaignRef } : {}),
      ...(dto.adSetRef !== undefined ? { adSetRef: dto.adSetRef } : {}),
      ...(dto.adRef !== undefined ? { adRef: dto.adRef } : {}),
      ...(dto.assigneeUserId !== undefined
        ? {
            assignee:
              dto.assigneeUserId === null
                ? { disconnect: true }
                : { connect: { id: dto.assigneeUserId } },
          }
        : {}),
    };

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data,
      select: taskReadSelect,
    });

    return this.toTaskResponse(task, currentUser);
  }

  private async updateTaskAsAssignedManager(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    const existingTask = await this.getTaskUpdateStateOrFail(taskId);
    await this.assertCanManageTaskProject(currentUser, existingTask.project.clientProfileId);

    const nextProject = dto.projectId
      ? await this.getProjectAssignmentContextOrBadRequest(dto.projectId)
      : existingTask.project;
    if (dto.projectId) {
      await this.assertCanManageTaskProject(currentUser, nextProject.clientProfileId);
    }

    const nextAssigneeUserId =
      dto.assigneeUserId === undefined ? existingTask.assigneeUserId : dto.assigneeUserId;

    if (dto.assigneeUserId !== undefined) {
      this.assertCanAssignTaskWithinScope(currentUser);
    }
    if (dto.projectId || dto.assigneeUserId !== undefined) {
      await this.assertAssigneeIsValidForProject(nextAssigneeUserId, nextProject.clientProfileId);
    }
    if (dto.sprintId !== undefined) {
      await this.assertSprintBelongsToProject(dto.sprintId, nextProject.id);
    }
    if (dto.referenceProjectFileId !== undefined) {
      await this.assertReferenceProjectFileBelongsToProject(dto.referenceProjectFileId, nextProject.id);
    }

    const dueDateUpdate = this.parseNullableDate(dto.dueDate);
    const approvalRequestedAtUpdate = this.parseNullableDate(dto.approvalRequestedAt);
    const approvalRespondedAtUpdate = this.parseNullableDate(dto.approvalRespondedAt);
    const approvalStatusUpdate = this.buildApprovalStatusUpdateData(
      dto.approvalStatus,
      currentUser.id,
      approvalRespondedAtUpdate,
    );
    const data: Prisma.TaskUpdateInput = {
      ...(dto.projectId ? { project: { connect: { id: dto.projectId } } } : {}),
      ...(dto.sprintId !== undefined
        ? {
            sprint:
              dto.sprintId === null
                ? { disconnect: true }
                : { connect: { id: dto.sprintId } },
          }
        : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.workstream !== undefined ? { workstream: dto.workstream } : {}),
      ...(dto.severity !== undefined ? { severity: dto.severity } : {}),
      ...(dto.environment !== undefined ? { environment: dto.environment } : {}),
      ...(dto.affectedUrl !== undefined ? { affectedUrl: dto.affectedUrl } : {}),
      ...(dto.reproductionSteps !== undefined
        ? { reproductionSteps: dto.reproductionSteps }
        : {}),
      ...(dto.reportedBy !== undefined ? { reportedBy: dto.reportedBy } : {}),
      ...(dto.code !== undefined ? { code: dto.code } : {}),
      ...(dueDateUpdate !== undefined ? { dueDate: dueDateUpdate } : {}),
      ...(dto.approvalRequired !== undefined ? { approvalRequired: dto.approvalRequired } : {}),
      ...(dto.approvalType !== undefined ? { approvalType: dto.approvalType } : {}),
      ...(dto.approvalResponseNote !== undefined
        ? { approvalResponseNote: dto.approvalResponseNote }
        : {}),
      ...(approvalRequestedAtUpdate !== undefined
        ? { approvalRequestedAt: approvalRequestedAtUpdate }
        : {}),
      ...(approvalStatusUpdate ?? {}),
      ...(dto.referenceProjectFileId !== undefined
        ? {
            referenceProjectFile:
              dto.referenceProjectFileId === null
                ? { disconnect: true }
                : { connect: { id: dto.referenceProjectFileId } },
          }
        : {}),
      ...(dto.campaignRef !== undefined ? { campaignRef: dto.campaignRef } : {}),
      ...(dto.adSetRef !== undefined ? { adSetRef: dto.adSetRef } : {}),
      ...(dto.adRef !== undefined ? { adRef: dto.adRef } : {}),
      ...(dto.assigneeUserId !== undefined
        ? {
            assignee:
              dto.assigneeUserId === null
                ? { disconnect: true }
                : { connect: { id: dto.assigneeUserId } },
          }
        : {}),
    };

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data,
      select: taskReadSelect,
    });

    return this.toTaskResponse(task, currentUser);
  }

  private async updateOwnTaskStatus(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    this.assertCanUpdateOwnTask(currentUser);
    this.assertEmployeeStatusOnlyUpdate(dto);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        assigneeUserId: currentUser.id,
        project: {
          clientProfile: {
            employeeAssignments: {
              some: {
                employeeUserId: currentUser.id,
                isActive: true,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
      select: taskReadSelect,
    });

    return this.toTaskResponse(updatedTask, currentUser);
  }

  private async updateTaskAsClientApprovalResponse(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    this.assertCanRespondOwnApprovals(currentUser);
    this.assertClientApprovalOnlyUpdate(dto);

    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    const approvalStatus = dto.approvalStatus as MetaAdsApprovalStatus;

    if (
      (approvalStatus === MetaAdsApprovalStatus.REJECTED ||
        approvalStatus === MetaAdsApprovalStatus.CHANGES_REQUESTED) &&
      (!dto.approvalResponseNote || dto.approvalResponseNote.trim().length < 2)
    ) {
      throw new BadRequestException("Rejection or revision requests require a response note.");
    }

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        approvalRequired: true,
        approvalStatus: MetaAdsApprovalStatus.PENDING,
        project: {
          clientProfileId,
          serviceKey: {
            in: [
              PurchasedServiceKey.META_ADS,
              PurchasedServiceKey.TIKTOK_ADS,
              PurchasedServiceKey.AMAZON_ADS,
              PurchasedServiceKey.SOCIAL_MEDIA,
            ],
          },
        },
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        priority: true,
        workstream: true,
        assigneeUserId: true,
        approvalType: true,
        campaignRef: true,
        adSetRef: true,
        adRef: true,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    const updatedTask = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id: task.id },
        data: {
          approvalStatus,
          approvalResponseNote: dto.approvalResponseNote ?? null,
          approvalRespondedAt: new Date(),
          approvalRespondedBy: { connect: { id: currentUser.id } },
          status: this.resolveTaskStatusFromClientApproval(approvalStatus),
        },
        select: taskReadSelect,
      });

      if (approvalStatus === MetaAdsApprovalStatus.CHANGES_REQUESTED || approvalStatus === MetaAdsApprovalStatus.REJECTED) {
        await tx.task.create({
          data: {
            projectId: task.projectId,
            title: this.buildAdsRevisionTaskTitle(task.title),
            description: this.buildAdsRevisionTaskDescription(dto.approvalResponseNote),
            status: TaskStatus.TODO,
            priority: task.priority,
            type: TaskType.REVISION,
            workstream: task.workstream,
            assigneeUserId: task.assigneeUserId,
            approvalRequired: false,
            approvalType: null,
            approvalStatus: null,
            approvalContext: {
              sourceApprovalTaskId: task.id,
              sourceApprovalStatus: approvalStatus,
            },
            campaignRef: task.campaignRef,
            adSetRef: task.adSetRef,
            adRef: task.adRef,
          },
        });
      }

      const nextPostStatus = this.resolveSocialMediaPostStatusFromClientApproval(
        task.approvalType,
        approvalStatus,
      );

      if (nextPostStatus) {
        await tx.socialMediaPost.updateMany({
          where: { approvalTaskId: task.id },
          data: { status: nextPostStatus },
        });
      }

      return updated;
    });

    return this.toTaskResponse(updatedTask, currentUser);
  }

  private async assertTaskExistsForTodoMutation(taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }
  }

  private async assertTaskTodoExists(taskId: string, todoId: string): Promise<void> {
    const todo = await this.prisma.taskTodo.findFirst({
      where: {
        id: todoId,
        taskId,
      },
      select: { id: true },
    });

    if (!todo) {
      throw new NotFoundException("Task todo not found.");
    }
  }

  private async assertCanToggleTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
  ): Promise<void> {
    if (this.isAdmin(currentUser)) {
      this.assertCanManageTasks(currentUser);
      await this.assertTaskExistsForTodoMutation(taskId);
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Client accounts cannot update task todos.");
    }

    if (currentUser.role === UserRole.PROJECT_MANAGER) {
      await this.assertCanManageTaskTodoScope(currentUser, taskId);
      return;
    }

    this.assertCanUpdateOwnTask(currentUser);

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          clientProfile: {
            employeeAssignments: {
              some: {
                employeeUserId: currentUser.id,
                isActive: true,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }
  }

  private buildTaskVisibilityWhere(currentUser: AuthenticatedUser): Prisma.TaskWhereInput {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, TASK_READ_ANY_PERMISSION, TASK_READ_ANY_FALLBACK_PERMISSION);
      return {};
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasPermission(currentUser, TASK_READ_ASSIGNED_PERMISSION);
      return {
        project: {
          clientProfile: {
            employeeAssignments: {
              some: {
                employeeUserId: currentUser.id,
                isActive: true,
              },
            },
          },
        },
      };
    }

    if (this.isClient(currentUser)) {
      this.assertCanReadOwnTasks(currentUser);
      return {
        project: {
          clientProfileId: this.getClientProfileIdOrFail(currentUser),
        },
      };
    }

    throw new ForbiddenException("You are not allowed to access tasks.");
  }

  private buildTaskQueryWhere(query: TaskQueryDto): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.sprintId ? { sprintId: query.sprintId } : {}),
      ...(query.assigneeUserId ? { assigneeUserId: query.assigneeUserId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.workstream ? { workstream: query.workstream } : {}),
      ...(query.severity ? { severity: query.severity } : {}),
      ...(query.environment ? { environment: query.environment } : {}),
      ...(query.approvalRequired !== undefined
        ? { approvalRequired: query.approvalRequired }
        : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...(query.approvalType ? { approvalType: query.approvalType } : {}),
      ...(query.clientProfileId ? { project: { clientProfileId: query.clientProfileId } } : {}),
    };

    const dueDate = this.buildDateRangeFilter(query.dueFrom, query.dueTo);
    if (dueDate) {
      where.dueDate = dueDate;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private isClientProfileFilterOutsideOwnScope(
    currentUser: AuthenticatedUser,
    query: TaskQueryDto,
  ): boolean {
    return Boolean(
      query.clientProfileId &&
        currentUser.clientProfileId &&
        query.clientProfileId !== currentUser.clientProfileId,
    );
  }

  private async getTaskUpdateStateOrFail(taskId: string): Promise<TaskUpdateState> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
        assigneeUserId: true,
        sprintId: true,
        title: true,
        code: true,
        branchName: true,
        codePreparationNotes: true,
        project: {
          select: {
            id: true,
            clientProfileId: true,
            serviceKey: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    return task;
  }

  private async getProjectAssignmentContextOrBadRequest(
    projectId: string,
  ): Promise<ProjectAssignmentContext> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        clientProfileId: true,
        serviceKey: true,
      },
    });

    if (!project) {
      throw new BadRequestException("Project not found.");
    }

    return project;
  }

  private async assertAssigneeIsValidForProject(
    assigneeUserId: string | null | undefined,
    clientProfileId: string,
  ): Promise<void> {
    if (!assigneeUserId) {
      return;
    }

    const assignee = await this.prisma.user.findFirst({
      where: {
        id: assigneeUserId,
        accountType: AccountType.EMPLOYEE,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!assignee) {
      throw new BadRequestException("Assignee user not found, inactive, or not an employee account.");
    }

    const compatibleAssignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: assigneeUserId,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!compatibleAssignment) {
      throw new BadRequestException("Assignee is not assigned to this project's client profile.");
    }
  }

  private async assertSprintBelongsToProject(
    sprintId: string | null | undefined,
    projectId: string,
  ): Promise<void> {
    if (!sprintId) {
      return;
    }

    const sprint = await this.prisma.deliverySprint.findUnique({
      where: { id: sprintId },
      select: { id: true, projectId: true },
    });

    if (!sprint) {
      throw new BadRequestException("Sprint not found.");
    }

    if (sprint.projectId !== projectId) {
      throw new BadRequestException("Sprint must belong to the same project as the task.");
    }
  }

  private async assertReferenceProjectFileBelongsToProject(
    fileId: string | null | undefined,
    projectId: string,
  ): Promise<void> {
    if (!fileId) {
      return;
    }

    const file = await this.prisma.projectFile.findFirst({
      where: {
        id: fileId,
        projectId,
      },
      select: { id: true },
    });

    if (!file) {
      throw new BadRequestException("Referenced project file must belong to the same project.");
    }
  }

  private assertHasUpdatePayload(dto: UpdateTaskDto): void {
    if (
      dto.projectId === undefined &&
      dto.sprintId === undefined &&
      dto.title === undefined &&
      dto.description === undefined &&
      dto.status === undefined &&
      dto.priority === undefined &&
      dto.type === undefined &&
      dto.workstream === undefined &&
      dto.severity === undefined &&
      dto.environment === undefined &&
      dto.affectedUrl === undefined &&
      dto.reproductionSteps === undefined &&
      dto.reportedBy === undefined &&
      dto.code === undefined &&
      dto.assigneeUserId === undefined &&
      dto.dueDate === undefined &&
      dto.approvalRequired === undefined &&
      dto.approvalType === undefined &&
      dto.approvalStatus === undefined &&
      dto.approvalResponseNote === undefined &&
      dto.approvalRequestedAt === undefined &&
      dto.approvalRespondedAt === undefined &&
      dto.referenceProjectFileId === undefined &&
      dto.campaignRef === undefined &&
      dto.adSetRef === undefined &&
      dto.adRef === undefined
    ) {
      throw new BadRequestException("Provide at least one task field to update.");
    }
  }

  private assertHasTodoUpdatePayload(dto: UpdateTaskTodoDto): void {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.visibility === undefined
    ) {
      throw new BadRequestException("Provide at least one task todo field to update.");
    }
  }

  private assertBodyObject(value: unknown): void {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new BadRequestException("Request body must be a JSON object.");
    }
  }

  private assertEmployeeStatusOnlyUpdate(dto: UpdateTaskDto): void {
    if (
      dto.projectId !== undefined ||
      dto.sprintId !== undefined ||
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.priority !== undefined ||
      dto.type !== undefined ||
      dto.workstream !== undefined ||
      dto.severity !== undefined ||
      dto.environment !== undefined ||
      dto.affectedUrl !== undefined ||
      dto.reproductionSteps !== undefined ||
      dto.reportedBy !== undefined ||
      dto.code !== undefined ||
      dto.assigneeUserId !== undefined ||
      dto.dueDate !== undefined ||
      dto.approvalRequired !== undefined ||
      dto.approvalType !== undefined ||
      dto.approvalStatus !== undefined ||
      dto.approvalResponseNote !== undefined ||
      dto.approvalRequestedAt !== undefined ||
      dto.approvalRespondedAt !== undefined ||
      dto.referenceProjectFileId !== undefined ||
      dto.campaignRef !== undefined ||
      dto.adSetRef !== undefined ||
      dto.adRef !== undefined
    ) {
      throw new ForbiddenException("Employees can only update task status.");
    }

    if (dto.status === undefined) {
      throw new BadRequestException("Employees can only update task status.");
    }
  }

  private assertClientApprovalOnlyUpdate(dto: UpdateTaskDto): void {
    if (
      dto.projectId !== undefined ||
      dto.sprintId !== undefined ||
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.status !== undefined ||
      dto.priority !== undefined ||
      dto.type !== undefined ||
      dto.workstream !== undefined ||
      dto.severity !== undefined ||
      dto.environment !== undefined ||
      dto.affectedUrl !== undefined ||
      dto.reproductionSteps !== undefined ||
      dto.reportedBy !== undefined ||
      dto.code !== undefined ||
      dto.assigneeUserId !== undefined ||
      dto.dueDate !== undefined ||
      dto.approvalRequired !== undefined ||
      dto.approvalType !== undefined ||
      dto.approvalRequestedAt !== undefined ||
      dto.approvalRespondedAt !== undefined ||
      dto.referenceProjectFileId !== undefined ||
      dto.campaignRef !== undefined ||
      dto.adSetRef !== undefined ||
      dto.adRef !== undefined
    ) {
      throw new ForbiddenException("Clients can only respond to approval status.");
    }

    if (!dto.approvalStatus) {
      throw new BadRequestException("Approval status is required.");
    }

    if (
      dto.approvalStatus !== MetaAdsApprovalStatus.APPROVED &&
      dto.approvalStatus !== MetaAdsApprovalStatus.REJECTED &&
      dto.approvalStatus !== MetaAdsApprovalStatus.CHANGES_REQUESTED &&
      dto.approvalStatus !== MetaAdsApprovalStatus.ACKNOWLEDGED
    ) {
      throw new BadRequestException("Unsupported approval status for client response.");
    }
  }

  private assertValidDateRange(from?: string, to?: string): void {
    if (from && to && new Date(to).getTime() < new Date(from).getTime()) {
      throw new BadRequestException("dueTo cannot be earlier than dueFrom.");
    }
  }

  private buildDateRangeFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeNullableFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  private parseNullableDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return new Date(value);
  }

  private buildApprovalStatusUpdateData(
    approvalStatus: MetaAdsApprovalStatus | null | undefined,
    actorUserId: string,
    approvalRespondedAtUpdate: Date | null | undefined,
  ): Prisma.TaskUpdateInput | undefined {
    if (approvalStatus === undefined) {
      return undefined;
    }

    if (approvalStatus === null) {
      return {
        approvalStatus: null,
        approvalRespondedAt: null,
        approvalRespondedBy: { disconnect: true },
      };
    }

    if (!this.isTerminalApprovalStatus(approvalStatus)) {
      return {
        approvalStatus,
        approvalRespondedAt: null,
        approvalRespondedBy: { disconnect: true },
      };
    }

    return {
      approvalStatus,
      approvalRespondedAt: approvalRespondedAtUpdate ?? new Date(),
      approvalRespondedBy: { connect: { id: actorUserId } },
    };
  }

  private resolveTaskStatusFromClientApproval(approvalStatus: MetaAdsApprovalStatus): TaskStatus {
    if (
      approvalStatus === MetaAdsApprovalStatus.APPROVED ||
      approvalStatus === MetaAdsApprovalStatus.ACKNOWLEDGED
    ) {
      return TaskStatus.DONE;
    }

    return TaskStatus.IN_PROGRESS;
  }

  private resolveSocialMediaPostStatusFromClientApproval(
    approvalType: MetaAdsApprovalType | null,
    approvalStatus: MetaAdsApprovalStatus,
  ): SocialMediaPostStatus | null {
    if (!approvalType || !SOCIAL_MEDIA_POST_LINKED_APPROVAL_TYPES.has(approvalType)) {
      return null;
    }

    if (approvalStatus === MetaAdsApprovalStatus.APPROVED) {
      return SocialMediaPostStatus.APPROVED;
    }

    if (
      approvalStatus === MetaAdsApprovalStatus.REJECTED ||
      approvalStatus === MetaAdsApprovalStatus.CHANGES_REQUESTED
    ) {
      return SocialMediaPostStatus.REVISION_REQUIRED;
    }

    return null;
  }

  private isTerminalApprovalStatus(approvalStatus: MetaAdsApprovalStatus): boolean {
    return approvalStatus !== MetaAdsApprovalStatus.PENDING;
  }

  private toTaskResponse(task: TaskReadModel, currentUser: AuthenticatedUser): TaskResponse {
    const { todos, workNotes, ...taskWithoutTodos } = task;
    const visibleTodos = this.isClient(currentUser)
      ? todos.filter((todo) => todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE)
      : todos;
    const visibleWorkNotes = this.isClient(currentUser) ? [] : workNotes;

    return {
      ...taskWithoutTodos,
      todos: visibleTodos,
      workNotes: visibleWorkNotes,
      completion: this.buildTaskCompletion(visibleTodos),
    };
  }

  private buildTaskCompletion(todos: TaskTodoReadModel[]): TaskCompletion {
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

  private assertCanManageTasks(currentUser: AuthenticatedUser): void {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException("Only admin users can create and fully update tasks.");
    }

    this.assertHasPermission(
      currentUser,
      TASK_MANAGE_ANY_PERMISSION,
      TASK_MANAGE_FALLBACK_PERMISSION,
    );
  }

  private async assertCanManageTaskProject(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        TASK_MANAGE_ANY_PERMISSION,
        TASK_MANAGE_FALLBACK_PERMISSION,
      );
      return;
    }

    if (!this.isEmployee(currentUser) || currentUser.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException("Only admins or assigned project managers can manage tasks.");
    }

    this.assertHasPermission(currentUser, TASK_MANAGE_ASSIGNED_PERMISSION);
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Task not found.");
    }
  }

  private assertCanAssignTaskWithinScope(currentUser: AuthenticatedUser): void {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        TASK_MANAGE_ANY_PERMISSION,
        TASK_MANAGE_FALLBACK_PERMISSION,
      );
      return;
    }

    this.assertHasPermission(currentUser, TASK_ASSIGN_ASSIGNED_PERMISSION);
  }

  private isAdsApprovalTask(
    project: ProjectAssignmentContext,
    dto: CreateTaskDto,
  ): boolean {
    return Boolean(dto.approvalRequired && this.getAdsApprovalCreatePermission(project.serviceKey));
  }

  private async assertCanCreateAdsApprovalTask(
    currentUser: AuthenticatedUser,
    project: ProjectAssignmentContext,
  ): Promise<void> {
    const permission = this.getAdsApprovalCreatePermission(project.serviceKey);
    if (!permission) {
      throw new ForbiddenException("Unsupported ads approval project scope.");
    }

    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        TASK_MANAGE_ANY_PERMISSION,
        TASK_MANAGE_FALLBACK_PERMISSION,
      );
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only admin or assigned employee users can create ads approval tasks.");
    }

    this.assertHasPermission(currentUser, permission);
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Task not found.");
    }
  }

  private getAdsApprovalCreatePermission(projectServiceKey: PurchasedServiceKey | null): string | null {
    if (projectServiceKey === PurchasedServiceKey.META_ADS) {
      return META_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION;
    }

    if (projectServiceKey === PurchasedServiceKey.TIKTOK_ADS) {
      return TIKTOK_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION;
    }

    if (projectServiceKey === PurchasedServiceKey.AMAZON_ADS) {
      return AMAZON_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION;
    }

    if (projectServiceKey === PurchasedServiceKey.SOCIAL_MEDIA) {
      return SOCIAL_MEDIA_APPROVALS_CREATE_ASSIGNED_PERMISSION;
    }

    return null;
  }

  private async assertCanManageTaskTodoScope(
    currentUser: AuthenticatedUser,
    taskId: string,
  ): Promise<void> {
    if (this.isAdmin(currentUser)) {
      this.assertCanManageTasks(currentUser);
      await this.assertTaskExistsForTodoMutation(taskId);
      return;
    }

    if (!this.isEmployee(currentUser) || currentUser.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException("Only admins or assigned project managers can manage task todos.");
    }

    this.assertHasPermission(currentUser, TASK_TODOS_MANAGE_ASSIGNED_PERMISSION);
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          clientProfile: {
            employeeAssignments: {
              some: {
                employeeUserId: currentUser.id,
                isActive: true,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }
  }

  private assertCanUpdateOwnTask(currentUser: AuthenticatedUser): void {
    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only employee users can update their assigned tasks.");
    }

    this.assertHasPermission(
      currentUser,
      TASK_UPDATE_ASSIGNED_PERMISSION,
      TASK_UPDATE_OWN_FALLBACK_PERMISSION,
    );
  }

  private assertCanReadOwnTasks(currentUser: AuthenticatedUser): void {
    this.assertHasAnyPermission(currentUser, TASK_OWN_READ_PERMISSIONS);
    this.getClientProfileIdOrFail(currentUser);
  }

  private assertCanReadInternalTaskData(currentUser: AuthenticatedUser): void {
    if (this.isClient(currentUser)) {
      throw new ForbiddenException("Clients cannot access internal task delivery notes.");
    }
  }

  private async assertTaskScopeForInternalWrite(currentUser: AuthenticatedUser, taskId: string) {
    if (this.isAdmin(currentUser)) {
      this.assertCanManageTasks(currentUser);
      return this.getTaskUpdateStateOrFail(taskId);
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only assigned employees can write internal task notes.");
    }

    this.assertCanUpdateOwnTask(currentUser);
    if (
      currentUser.role !== UserRole.DEVELOPER &&
      currentUser.role !== UserRole.PROJECT_MANAGER
    ) {
      throw new ForbiddenException("Only developers and project managers can write task work notes.");
    }

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          clientProfile: {
            employeeAssignments: {
              some: {
                employeeUserId: currentUser.id,
                isActive: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        code: true,
        branchName: true,
        codePreparationNotes: true,
        project: {
          select: {
            id: true,
            clientProfileId: true,
            serviceKey: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    return task;
  }

  private buildSuggestedBranchName(task: {
    code: string | null;
    title?: string;
  }) {
    const prefix = task.code ? `${task.code.toLowerCase()}-` : "";
    const slug = (task.title ?? "task")
      .trim()
      .toLowerCase()
      .replace(/ı/g, "i")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `feature/${prefix}${slug || "task"}`.slice(0, 160);
  }

  private async generateTaskCode(type: TaskType) {
    const prefixByType: Record<TaskType, string> = {
      FEATURE: "FEAT",
      BUG: "BUG",
      REVISION: "REV",
      QA: "QA",
      DEPLOYMENT: "REL",
      MAINTENANCE: "MAIN",
    };
    const prefix = prefixByType[type] ?? "TASK";
    const totalTasks = await this.prisma.task.count();
    return `${prefix}-${String(totalTasks + 1).padStart(3, "0")}`;
  }

  private async assertRepositoryRequiredForApplicationProject(
    currentUser: AuthenticatedUser,
    project: ProjectAssignmentContext,
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
          "WEB_APP and MOBILE_APP tasks require an active repository before code preparation.",
        );
      }
      throw error;
    }
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return currentUser.clientProfileId;
  }

  private buildAdsRevisionTaskTitle(sourceTitle: string): string {
    const normalized = sourceTitle.trim();
    if (!normalized) {
      return "Reklam Revizyon Takibi";
    }

    return `Revizyon: ${normalized}`;
  }

  private buildAdsRevisionTaskDescription(approvalResponseNote: string | null | undefined): string {
    const note = approvalResponseNote?.trim();
    if (note && note.length > 0) {
      return `Müşteri revizyon notu: ${note}`;
    }

    return "Müşteri revizyon talebi sonrası otomatik oluşturulan takip görevi.";
  }

  private assertCanRespondOwnApprovals(currentUser: AuthenticatedUser): void {
    if (!this.isClient(currentUser)) {
      throw new ForbiddenException("Only client users can respond to approvals.");
    }

    this.assertHasPermission(currentUser, APPROVAL_RESPOND_OWN_PERMISSION);
    this.getClientProfileIdOrFail(currentUser);
  }

  private assertHasPermission(
    currentUser: AuthenticatedUser,
    permission: string,
    fallbackPermission?: string,
  ): void {
    if (currentUser.permissions.includes(permission)) {
      return;
    }

    if (fallbackPermission && currentUser.permissions.includes(fallbackPermission)) {
      return;
    }

    throw new ForbiddenException(`Missing required permission: ${permission}.`);
  }

  private assertHasAnyPermission(
    currentUser: AuthenticatedUser,
    permissions: readonly string[],
  ): void {
    if (!permissions.some((permission) => currentUser.permissions.includes(permission))) {
      throw new ForbiddenException("Missing required task permissions.");
    }
  }

  private isAdmin(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN;
  }

  private isClient(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.CLIENT;
  }

  private isEmployee(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.EMPLOYEE;
  }
}
