import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

const clientSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
} satisfies Prisma.ClientProfileSelect;

const projectReadSelect = {
  id: true,
  clientProfileId: true,
  serviceKey: true,
  repositoryUrl: true,
  name: true,
  slug: true,
  description: true,
  figmaProjectUrl: true,
  status: true,
  priority: true,
  startDate: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  clientProfile: {
    select: clientSummarySelect,
  },
} satisfies Prisma.ProjectSelect;

type ProjectReadModel = Prisma.ProjectGetPayload<{ select: typeof projectReadSelect }>;

type ProjectUpdateState = {
  id: string;
  clientProfileId: string;
  serviceKey: PurchasedServiceKey | null;
  repositoryUrl: string | null;
  name: string;
  startDate: Date | null;
  dueDate: Date | null;
};

const PROJECT_READ_ANY_PERMISSION = "projects.read.any";
const PROJECT_READ_ANY_FALLBACK_PERMISSION = "projects.read";
const PROJECT_READ_ASSIGNED_PERMISSION = "projects.read.assigned";
const PROJECT_OWN_READ_PERMISSIONS = ["projects.read.own", "portal.read.own", "clients.read.own"] as const;
const PROJECT_MANAGE_ANY_PERMISSION = "projects.manage.any";
const PROJECT_MANAGE_FALLBACK_PERMISSION = "projects.manage";
const PROJECT_MANAGE_ASSIGNED_PERMISSION = "projects.manage.assigned";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(
    currentUser: AuthenticatedUser,
    query: ProjectQueryDto,
  ): Promise<ProjectReadModel[]> {
    this.assertValidDateRange(query.dueFrom, query.dueTo);

    if (this.isClient(currentUser) && this.isClientProfileFilterOutsideOwnScope(currentUser, query)) {
      this.assertCanReadOwnProjects(currentUser);
      return [];
    }

    const where: Prisma.ProjectWhereInput = {
      ...this.buildProjectVisibilityWhere(currentUser),
      ...this.buildProjectQueryWhere(query),
    };

    return this.prisma.project.findMany({
      where,
      select: projectReadSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  async getProjectById(
    currentUser: AuthenticatedUser,
    projectId: string,
  ): Promise<ProjectReadModel> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ...this.buildProjectVisibilityWhere(currentUser),
      },
      select: projectReadSelect,
    });

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return project;
  }

  async createProject(
    currentUser: AuthenticatedUser,
    dto: CreateProjectDto,
  ): Promise<ProjectReadModel> {
    this.assertBodyObject(dto);
    await this.assertClientProfileExists(dto.clientProfileId);
    await this.assertCanManageProjectScope(currentUser, dto.clientProfileId);
    await this.assertClientAllowsServiceKey(dto.clientProfileId, dto.serviceKey ?? null);
    this.assertRepositoryUrlRequirement(dto.serviceKey ?? null, dto.repositoryUrl ?? null);

    const startDate = this.parseNullableDate(dto.startDate) ?? null;
    const dueDate = this.parseNullableDate(dto.dueDate) ?? null;
    this.assertProjectDateOrder(startDate, dueDate);

    const slug = await this.generateUniqueSlug(dto.name, dto.clientProfileId);

    try {
      return await this.prisma.project.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description ?? null,
          figmaProjectUrl: dto.figmaProjectUrl ?? null,
          repositoryUrl: dto.repositoryUrl ?? null,
          serviceKey: dto.serviceKey ?? null,
          status: dto.status,
          priority: dto.priority,
          startDate,
          dueDate,
          clientProfile: {
            connect: { id: dto.clientProfileId },
          },
        },
        select: projectReadSelect,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Project slug already exists for this client profile.");
      }

      throw error;
    }
  }

  async updateProject(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectReadModel> {
    this.assertBodyObject(dto);
    this.assertHasUpdatePayload(dto);

    const existingProject = await this.getProjectUpdateStateOrFail(projectId);
    await this.assertCanManageProjectScope(currentUser, existingProject.clientProfileId);
    const nextClientProfileId = dto.clientProfileId ?? existingProject.clientProfileId;
    const nextServiceKey =
      dto.serviceKey === undefined ? existingProject.serviceKey : (dto.serviceKey ?? null);
    const nextRepositoryUrl =
      dto.repositoryUrl === undefined ? existingProject.repositoryUrl : (dto.repositoryUrl ?? null);
    if (dto.clientProfileId) {
      await this.assertClientProfileExists(dto.clientProfileId);
      await this.assertCanManageProjectScope(currentUser, dto.clientProfileId);
      if (dto.clientProfileId !== existingProject.clientProfileId) {
        await this.assertExistingTaskAssigneesMatchClient(projectId, dto.clientProfileId);
      }
    }
    await this.assertClientAllowsServiceKey(nextClientProfileId, nextServiceKey);
    this.assertRepositoryUrlRequirement(nextServiceKey, nextRepositoryUrl);

    const startDateUpdate = this.parseNullableDate(dto.startDate);
    const dueDateUpdate = this.parseNullableDate(dto.dueDate);
    const nextStartDate = startDateUpdate === undefined ? existingProject.startDate : startDateUpdate;
    const nextDueDate = dueDateUpdate === undefined ? existingProject.dueDate : dueDateUpdate;
    this.assertProjectDateOrder(nextStartDate, nextDueDate);

    const shouldRegenerateSlug = dto.name !== undefined || dto.clientProfileId !== undefined;
    const slug = shouldRegenerateSlug
      ? await this.generateUniqueSlug(dto.name ?? existingProject.name, nextClientProfileId, projectId)
      : undefined;

    const data: Prisma.ProjectUpdateInput = {
      ...(dto.clientProfileId ? { clientProfile: { connect: { id: dto.clientProfileId } } } : {}),
      ...(dto.serviceKey !== undefined ? { serviceKey: dto.serviceKey ?? null } : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.figmaProjectUrl !== undefined ? { figmaProjectUrl: dto.figmaProjectUrl } : {}),
      ...(dto.repositoryUrl !== undefined ? { repositoryUrl: dto.repositoryUrl } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(startDateUpdate !== undefined ? { startDate: startDateUpdate } : {}),
      ...(dueDateUpdate !== undefined ? { dueDate: dueDateUpdate } : {}),
    };

    try {
      return await this.prisma.project.update({
        where: { id: projectId },
        data,
        select: projectReadSelect,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Project slug already exists for this client profile.");
      }

      throw error;
    }
  }

  async getProjectAssigneeCandidates(
    currentUser: AuthenticatedUser,
    projectId: string,
  ): Promise<Array<{ id: string; displayName: string | null; role: UserRole }>> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ...this.buildProjectVisibilityWhere(currentUser),
      },
      select: {
        id: true,
        clientProfileId: true,
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasAnyPermission(currentUser, [
        PROJECT_MANAGE_ASSIGNED_PERMISSION,
        "tasks.assign.assigned",
        "tasks.manage.assigned",
      ]);
    } else if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        PROJECT_MANAGE_ANY_PERMISSION,
        PROJECT_MANAGE_FALLBACK_PERMISSION,
      );
    } else {
      throw new ForbiddenException("You are not allowed to view assignee candidates.");
    }

    const assignedEmployeeIds = await this.prisma.employeeClientAssignment.findMany({
      where: {
        clientProfileId: project.clientProfileId,
        isActive: true,
      },
      select: {
        employeeUserId: true,
      },
    });

    const userIds = Array.from(new Set(assignedEmployeeIds.map((row) => row.employeeUserId)));
    if (userIds.length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        accountType: AccountType.EMPLOYEE,
      },
      select: {
        id: true,
        displayName: true,
        role: true,
      },
      orderBy: [{ displayName: "asc" }, { email: "asc" }],
    });
  }

  private buildProjectVisibilityWhere(currentUser: AuthenticatedUser): Prisma.ProjectWhereInput {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        PROJECT_READ_ANY_PERMISSION,
        PROJECT_READ_ANY_FALLBACK_PERMISSION,
      );
      return {};
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasPermission(currentUser, PROJECT_READ_ASSIGNED_PERMISSION);
      return {
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
            },
          },
        },
      };
    }

    if (this.isClient(currentUser)) {
      this.assertCanReadOwnProjects(currentUser);
      return { clientProfileId: this.getClientProfileIdOrFail(currentUser) };
    }

    throw new ForbiddenException("You are not allowed to access projects.");
  }

  private buildProjectQueryWhere(query: ProjectQueryDto): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    const dueDate = this.buildDateRangeFilter(query.dueFrom, query.dueTo);
    if (dueDate) {
      where.dueDate = dueDate;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private isClientProfileFilterOutsideOwnScope(
    currentUser: AuthenticatedUser,
    query: ProjectQueryDto,
  ): boolean {
    return Boolean(
      query.clientProfileId &&
        currentUser.clientProfileId &&
        query.clientProfileId !== currentUser.clientProfileId,
    );
  }

  private async getProjectUpdateStateOrFail(projectId: string): Promise<ProjectUpdateState> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        clientProfileId: true,
        serviceKey: true,
        repositoryUrl: true,
        name: true,
        startDate: true,
        dueDate: true,
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return project;
  }

  private async assertClientProfileExists(clientProfileId: string): Promise<void> {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { id: true },
    });

    if (!clientProfile) {
      throw new BadRequestException("Client profile not found.");
    }
  }

  private async assertClientAllowsServiceKey(
    clientProfileId: string,
    serviceKey: PurchasedServiceKey | null,
  ): Promise<void> {
    if (!serviceKey) {
      return;
    }

    const purchasedService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId,
        serviceKey,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!purchasedService) {
      throw new BadRequestException("Selected service is not active for this client.");
    }
  }

  private assertRepositoryUrlRequirement(
    serviceKey: PurchasedServiceKey | null,
    repositoryUrl: string | null,
  ): void {
    if (
      serviceKey !== PurchasedServiceKey.WEB_APP &&
      serviceKey !== PurchasedServiceKey.MOBILE_APP
    ) {
      return;
    }

    if (!repositoryUrl || repositoryUrl.trim().length === 0) {
      throw new BadRequestException(
        "WEB_APP and MOBILE_APP projects require a GitHub repository link.",
      );
    }
  }

  private async assertExistingTaskAssigneesMatchClient(
    projectId: string,
    clientProfileId: string,
  ): Promise<void> {
    const assignedTasks = await this.prisma.task.findMany({
      where: {
        projectId,
        assigneeUserId: { not: null },
      },
      select: { assigneeUserId: true },
    });
    const assigneeUserIds = Array.from(
      new Set(
        assignedTasks
          .map((task) => task.assigneeUserId)
          .filter((assigneeUserId): assigneeUserId is string => assigneeUserId !== null),
      ),
    );

    if (assigneeUserIds.length === 0) {
      return;
    }

    const compatibleAssignments = await this.prisma.employeeClientAssignment.findMany({
      where: {
        employeeUserId: { in: assigneeUserIds },
        clientProfileId,
        isActive: true,
      },
      select: { employeeUserId: true },
    });
    const compatibleAssigneeIds = new Set(
      compatibleAssignments.map((assignment) => assignment.employeeUserId),
    );

    if (assigneeUserIds.some((assigneeUserId) => !compatibleAssigneeIds.has(assigneeUserId))) {
      throw new BadRequestException(
        "Existing task assignees must be assigned to the new client profile before moving the project.",
      );
    }
  }

  private assertHasUpdatePayload(dto: UpdateProjectDto): void {
    if (
      dto.clientProfileId === undefined &&
      dto.name === undefined &&
      dto.description === undefined &&
      dto.figmaProjectUrl === undefined &&
      dto.status === undefined &&
      dto.priority === undefined &&
      dto.startDate === undefined &&
      dto.dueDate === undefined
    ) {
      throw new BadRequestException("Provide at least one project field to update.");
    }
  }

  private assertBodyObject(value: unknown): void {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new BadRequestException("Request body must be a JSON object.");
    }
  }

  private assertProjectDateOrder(startDate: Date | null, dueDate: Date | null): void {
    if (startDate && dueDate && dueDate.getTime() < startDate.getTime()) {
      throw new BadRequestException("Project dueDate cannot be earlier than startDate.");
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

  private async generateUniqueSlug(
    name: string,
    clientProfileId: string,
    excludeProjectId?: string,
  ): Promise<string> {
    const baseSlug = this.toSlug(name);
    const existingProjects = await this.prisma.project.findMany({
      where: {
        clientProfileId,
        slug: { startsWith: baseSlug },
        ...(excludeProjectId ? { NOT: { id: excludeProjectId } } : {}),
      },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingProjects.map((project) => project.slug));

    if (!existingSlugs.has(baseSlug)) {
      return baseSlug;
    }

    for (let suffix = 2; ; suffix += 1) {
      const candidate = `${baseSlug}-${suffix}`;
      if (!existingSlugs.has(candidate)) {
        return candidate;
      }
    }
  }

  private toSlug(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/ı/g, "i")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug.length > 0 ? slug : "project";
  }

  private assertCanReadOwnProjects(currentUser: AuthenticatedUser): void {
    this.assertHasAnyPermission(currentUser, PROJECT_OWN_READ_PERMISSIONS);
    this.getClientProfileIdOrFail(currentUser);
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return currentUser.clientProfileId;
  }

  private async assertCanManageProjectScope(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(
        currentUser,
        PROJECT_MANAGE_ANY_PERMISSION,
        PROJECT_MANAGE_FALLBACK_PERMISSION,
      );
      return;
    }

    if (!this.isEmployee(currentUser) || currentUser.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException("Only admins or assigned project managers can manage projects.");
    }

    this.assertHasPermission(currentUser, PROJECT_MANAGE_ASSIGNED_PERMISSION);
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundException("Client profile not found.");
    }
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
      throw new ForbiddenException("Missing required project permissions.");
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
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
