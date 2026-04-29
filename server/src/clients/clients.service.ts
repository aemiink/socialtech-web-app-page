import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma, ProjectStatus, TaskStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import {
  ClientQueryDto,
  type ClientSortBy,
  type ClientSortOrder,
} from "./dto/client-query.dto";

const clientReadSelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientProfileSelect;

type ClientReadModel = Prisma.ClientProfileGetPayload<{ select: typeof clientReadSelect }>;

type ClientsListResponse = {
  data: ClientReadModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ClientSummaryResponse = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientReadModel["status"];
    createdAt: Date;
    updatedAt: Date;
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
    recent: Array<{
      id: string;
      name: string;
      status: ProjectStatus;
      priority: Prisma.ProjectGetPayload<{ select: { priority: true } }>["priority"];
      dueDate: Date | null;
      updatedAt: Date;
    }>;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
    recent: Array<{
      id: string;
      title: string;
      status: TaskStatus;
      priority: Prisma.TaskGetPayload<{ select: { priority: true } }>["priority"];
      dueDate: Date | null;
      updatedAt: Date;
      projectId: string;
    }>;
  };
  meta: {
    generatedAt: Date;
  };
};

type ClientOrderByFactory = (
  sortOrder: ClientSortOrder,
) => Prisma.ClientProfileOrderByWithRelationInput;

const CLIENT_ORDER_BY_FACTORIES = {
  createdAt: (sortOrder) => ({ createdAt: sortOrder }),
  updatedAt: (sortOrder) => ({ updatedAt: sortOrder }),
  name: (sortOrder) => ({ companyName: sortOrder }),
  slug: (sortOrder) => ({ slug: sortOrder }),
  status: (sortOrder) => ({ status: sortOrder }),
} satisfies Record<ClientSortBy, ClientOrderByFactory>;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClients(
    currentUser: AuthenticatedUser,
    query: ClientQueryDto,
  ): Promise<ClientsListResponse> {
    const visibilityWhere = this.buildClientVisibilityWhere(currentUser);
    const where = this.buildClientListWhere(visibilityWhere, query);

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.clientProfile.findMany({
        where,
        select: clientReadSelect,
        orderBy: this.getClientOrderBy(query.sortBy, query.sortOrder),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.clientProfile.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      data: clients,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: totalPages > 0 && query.page < totalPages,
        hasPreviousPage: query.page > 1 && totalPages > 0,
      },
    };
  }

  async getClientById(currentUser: AuthenticatedUser, clientId: string): Promise<ClientReadModel> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read");
      return this.getClientProfileOrFail(clientId);
    }

    if (this.isClient(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read.own");
      if (currentUser.clientProfileId !== clientId) {
        throw new ForbiddenException("You can only access your own client profile.");
      }

      return this.getClientProfileOrFail(clientId);
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read.assigned");
      return this.getAssignedClientProfileById(currentUser.id, clientId);
    }

    throw new ForbiddenException("You are not allowed to access this client profile.");
  }

  async getMyClientProfile(currentUser: AuthenticatedUser): Promise<ClientReadModel> {
    if (!this.isClient(currentUser)) {
      throw new ForbiddenException("Only client accounts can access /clients/me.");
    }

    this.assertHasPermission(currentUser, "clients.read.own");
    return this.getOwnProfileByUserContext(currentUser);
  }

  async getClientSummary(
    currentUser: AuthenticatedUser,
    clientId: string,
  ): Promise<ClientSummaryResponse> {
    const clientProfile = await this.getClientById(currentUser, clientId);
    this.assertCanReadClientSummaryData(currentUser);
    const generatedAt = new Date();

    const [
      projectTotal,
      projectPlanned,
      projectInProgress,
      projectReview,
      projectCompleted,
      projectOnHold,
      recentProjects,
      taskTotal,
      taskTodo,
      taskInProgress,
      taskReview,
      taskDone,
      taskBlocked,
      recentTasks,
    ] = await this.prisma.$transaction([
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id },
      }),
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id, status: ProjectStatus.PLANNED },
      }),
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id, status: ProjectStatus.IN_PROGRESS },
      }),
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id, status: ProjectStatus.REVIEW },
      }),
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id, status: ProjectStatus.COMPLETED },
      }),
      this.prisma.project.count({
        where: { clientProfileId: clientProfile.id, status: ProjectStatus.ON_HOLD },
      }),
      this.prisma.project.findMany({
        where: { clientProfileId: clientProfile.id },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          priority: true,
          dueDate: true,
          updatedAt: true,
        },
      }),
      this.prisma.task.count({
        where: {
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.TODO,
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.IN_PROGRESS,
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.REVIEW,
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.DONE,
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.count({
        where: {
          status: TaskStatus.BLOCKED,
          project: {
            clientProfileId: clientProfile.id,
          },
        },
      }),
      this.prisma.task.findMany({
        where: {
          project: {
            clientProfileId: clientProfile.id,
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          updatedAt: true,
          projectId: true,
        },
      }),
    ]);

    return {
      client: {
        id: clientProfile.id,
        name: clientProfile.companyName,
        slug: clientProfile.slug,
        status: clientProfile.status,
        createdAt: clientProfile.createdAt,
        updatedAt: clientProfile.updatedAt,
      },
      projects: {
        total: projectTotal,
        planned: projectPlanned,
        inProgress: projectInProgress,
        review: projectReview,
        completed: projectCompleted,
        onHold: projectOnHold,
        recent: recentProjects,
      },
      tasks: {
        total: taskTotal,
        todo: taskTodo,
        inProgress: taskInProgress,
        review: taskReview,
        done: taskDone,
        blocked: taskBlocked,
        recent: recentTasks,
      },
      meta: {
        generatedAt,
      },
    };
  }

  private assertCanReadClientSummaryData(currentUser: AuthenticatedUser): void {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "projects.read.any");
      this.assertHasPermission(currentUser, "tasks.read.any");
      return;
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasPermission(currentUser, "projects.read.assigned");
      this.assertHasPermission(currentUser, "tasks.read.assigned");
      return;
    }

    if (this.isClient(currentUser)) {
      this.assertHasPermission(currentUser, "projects.read.own");
      this.assertHasPermission(currentUser, "tasks.read.own");
      return;
    }

    throw new ForbiddenException("You are not allowed to access client summary data.");
  }

  private buildClientVisibilityWhere(currentUser: AuthenticatedUser): Prisma.ClientProfileWhereInput {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read");
      return {};
    }

    if (this.isClient(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read.own");
      return { id: this.getClientProfileIdOrFail(currentUser) };
    }

    if (this.isEmployee(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read.assigned");
      return {
        employeeAssignments: {
          some: {
            employeeUserId: currentUser.id,
            isActive: true,
          },
        },
      };
    }

    throw new ForbiddenException("You are not allowed to access client profiles.");
  }

  private buildClientListWhere(
    visibilityWhere: Prisma.ClientProfileWhereInput,
    query: ClientQueryDto,
  ): Prisma.ClientProfileWhereInput {
    const statusFilter: Prisma.ClientProfileWhereInput | null = query.status
      ? { status: query.status }
      : null;
    const searchFilter: Prisma.ClientProfileWhereInput | null = query.search
      ? {
          OR: [
            { companyName: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } },
            { contactEmail: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : null;
    const filters: Prisma.ClientProfileWhereInput[] = [
      visibilityWhere,
      ...(statusFilter ? [statusFilter] : []),
      ...(searchFilter ? [searchFilter] : []),
    ];

    return { AND: filters };
  }

  private getClientOrderBy(
    sortBy: ClientSortBy,
    sortOrder: ClientSortOrder,
  ): Prisma.ClientProfileOrderByWithRelationInput[] {
    return [CLIENT_ORDER_BY_FACTORIES[sortBy](sortOrder), { id: "asc" }];
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return currentUser.clientProfileId;
  }

  private async getOwnProfileByUserContext(currentUser: AuthenticatedUser): Promise<ClientReadModel> {
    return this.getClientProfileOrFail(this.getClientProfileIdOrFail(currentUser));
  }

  private async getClientProfileOrFail(clientId: string): Promise<ClientReadModel> {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: clientReadSelect,
    });

    if (!clientProfile) {
      throw new NotFoundException("Client profile not found.");
    }

    return clientProfile;
  }

  private async getAssignedClientProfileById(
    employeeUserId: string,
    clientId: string,
  ): Promise<ClientReadModel> {
    const clientProfile = await this.prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        employeeAssignments: {
          some: {
            employeeUserId,
            isActive: true,
          },
        },
      },
      select: clientReadSelect,
    });

    if (!clientProfile) {
      throw new NotFoundException("Client profile not found.");
    }

    return clientProfile;
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (!this.hasPermission(currentUser, permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private hasPermission(currentUser: AuthenticatedUser, permission: string): boolean {
    return currentUser.permissions.includes(permission);
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
