import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountType, Prisma, TaskTodoVisibility, UserRole, UserStatus } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskTodoDto } from "./dto/create-task-todo.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { ToggleTaskTodoDto } from "./dto/toggle-task-todo.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskTodoDto } from "./dto/update-task-todo.dto";

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
  title: true,
  description: true,
  status: true,
  priority: true,
  assigneeUserId: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: projectSummarySelect,
  },
  assignee: {
    select: assigneeSummarySelect,
  },
  todos: {
    select: taskTodoReadSelect,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.TaskSelect;

type TaskReadModel = Prisma.TaskGetPayload<{ select: typeof taskReadSelect }>;
type TaskTodoReadModel = Prisma.TaskTodoGetPayload<{ select: typeof taskTodoReadSelect }>;

type TaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  remainingTodos: number;
  completionPercentage: number;
  isComplete: boolean;
};

type TaskResponse = Omit<TaskReadModel, "todos"> & {
  todos: TaskTodoReadModel[];
  completion: TaskCompletion;
};

type ProjectAssignmentContext = {
  id: string;
  clientProfileId: string;
};

type TaskUpdateState = {
  id: string;
  projectId: string;
  assigneeUserId: string | null;
  project: ProjectAssignmentContext;
};

const TASK_READ_ANY_PERMISSION = "tasks.read.any";
const TASK_READ_ANY_FALLBACK_PERMISSION = "tasks.read";
const TASK_READ_ASSIGNED_PERMISSION = "tasks.read.assigned";
const TASK_OWN_READ_PERMISSIONS = ["tasks.read.own", "portal.read.own", "clients.read.own"] as const;
const TASK_MANAGE_ANY_PERMISSION = "tasks.manage.any";
const TASK_MANAGE_FALLBACK_PERMISSION = "tasks.manage";
const TASK_UPDATE_ASSIGNED_PERMISSION = "tasks.update.assigned";
const TASK_UPDATE_OWN_FALLBACK_PERMISSION = "tasks.update.own";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

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
    this.assertCanManageTasks(currentUser);

    const project = await this.getProjectAssignmentContextOrBadRequest(dto.projectId);
    await this.assertAssigneeIsValidForProject(dto.assigneeUserId, project.clientProfileId);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status,
        priority: dto.priority,
        dueDate: this.parseNullableDate(dto.dueDate) ?? null,
        project: {
          connect: { id: dto.projectId },
        },
        ...(dto.assigneeUserId
          ? { assignee: { connect: { id: dto.assigneeUserId } } }
          : {}),
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

    if (this.isEmployee(currentUser)) {
      return this.updateOwnTaskStatus(currentUser, taskId, dto);
    }

    throw new ForbiddenException("Client accounts cannot update tasks.");
  }

  async createTaskTodo(
    currentUser: AuthenticatedUser,
    taskId: string,
    dto: CreateTaskTodoDto,
  ): Promise<TaskResponse> {
    this.assertBodyObject(dto);
    this.assertCanManageTasks(currentUser);
    await this.assertTaskExistsForTodoMutation(taskId);

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
    this.assertCanManageTasks(currentUser);
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
    this.assertCanManageTasks(currentUser);

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

    const dueDateUpdate = this.parseNullableDate(dto.dueDate);
    const data: Prisma.TaskUpdateInput = {
      ...(dto.projectId ? { project: { connect: { id: dto.projectId } } } : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dueDateUpdate !== undefined ? { dueDate: dueDateUpdate } : {}),
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
      ...(query.assigneeUserId ? { assigneeUserId: query.assigneeUserId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
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
        project: {
          select: {
            id: true,
            clientProfileId: true,
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

  private assertHasUpdatePayload(dto: UpdateTaskDto): void {
    if (
      dto.projectId === undefined &&
      dto.title === undefined &&
      dto.description === undefined &&
      dto.status === undefined &&
      dto.priority === undefined &&
      dto.assigneeUserId === undefined &&
      dto.dueDate === undefined
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
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.priority !== undefined ||
      dto.assigneeUserId !== undefined ||
      dto.dueDate !== undefined
    ) {
      throw new ForbiddenException("Employees can only update task status.");
    }

    if (dto.status === undefined) {
      throw new BadRequestException("Employees can only update task status.");
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

  private toTaskResponse(task: TaskReadModel, currentUser: AuthenticatedUser): TaskResponse {
    const { todos, ...taskWithoutTodos } = task;
    const visibleTodos = this.isClient(currentUser)
      ? todos.filter((todo) => todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE)
      : todos;

    return {
      ...taskWithoutTodos,
      todos: visibleTodos,
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

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return currentUser.clientProfileId;
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
