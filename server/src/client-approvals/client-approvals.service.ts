import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  ClientApprovalEntityType,
  ClientApprovalStatus,
  ClientApprovalType,
  Prisma,
  PurchasedServiceStatus,
  PurchasedServiceKey,
  UserRole,
  UserStatus,
  WebAppWorkspaceTabKey,
} from "@prisma/client";
import {
  AuditLogRequestContext,
  AuditLogService,
  CLIENT_APPROVAL_AUDIT_ACTIONS,
} from "../audit-log/audit-log.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { WebAppWorkspaceGateway } from "../web-app-workspace/web-app-workspace.gateway";
import { AcknowledgeClientApprovalDto } from "./dto/acknowledge-client-approval.dto";
import { CancelClientApprovalDto } from "./dto/cancel-client-approval.dto";
import {
  ClientApprovalQueryDto,
  type ClientApprovalSortBy,
  type ClientApprovalSortOrder,
} from "./dto/client-approval-query.dto";
import { CreateClientApprovalDto } from "./dto/create-client-approval.dto";
import { RespondClientApprovalDto } from "./dto/respond-client-approval.dto";
import { UpdateClientApprovalDto } from "./dto/update-client-approval.dto";

const CLIENT_APPROVAL_ENTITY = "client_approval_request";
const APPROVAL_READ_PERMISSION = "approvals.read";
const APPROVAL_MANAGE_PERMISSION = "approvals.manage";
const APPROVAL_RESPOND_OWN_PERMISSION = "approvals.respond.own";

const approvalUserSummarySelect = {
  id: true,
  displayName: true,
  role: true,
  accountType: true,
} satisfies Prisma.UserSelect;

const approvalProjectSummarySelect = {
  id: true,
  clientProfileId: true,
  serviceKey: true,
  name: true,
  slug: true,
  status: true,
  priority: true,
} satisfies Prisma.ProjectSelect;

const approvalClientSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
} satisfies Prisma.ClientProfileSelect;

const clientApprovalTransitionSelect = {
  id: true,
  fromStatus: true,
  toStatus: true,
  note: true,
  createdAt: true,
  actor: {
    select: approvalUserSummarySelect,
  },
} satisfies Prisma.ClientApprovalTransitionSelect;

const clientApprovalReadSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  serviceKey: true,
  requestedByUserId: true,
  assignedToUserId: true,
  respondedByUserId: true,
  type: true,
  status: true,
  title: true,
  message: true,
  entityType: true,
  entityId: true,
  actionPayload: true,
  requiresExplicitApproval: true,
  clientResponseNote: true,
  respondedAt: true,
  dueAt: true,
  createdAt: true,
  updatedAt: true,
  clientProfile: {
    select: approvalClientSummarySelect,
  },
  project: {
    select: approvalProjectSummarySelect,
  },
  requestedBy: {
    select: approvalUserSummarySelect,
  },
  assignedTo: {
    select: approvalUserSummarySelect,
  },
  respondedBy: {
    select: approvalUserSummarySelect,
  },
  transitions: {
    select: clientApprovalTransitionSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  },
} satisfies Prisma.ClientApprovalRequestSelect;

type ClientApprovalReadModel = Prisma.ClientApprovalRequestGetPayload<{
  select: typeof clientApprovalReadSelect;
}>;

type ApprovalListResponse = {
  data: ClientApprovalReadModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ClientApprovalOrderByFactory = (
  sortOrder: ClientApprovalSortOrder,
) => Prisma.ClientApprovalRequestOrderByWithRelationInput;

type ApprovalScope = {
  clientProfileId: string;
  projectId: string | null;
  serviceKey: PurchasedServiceKey | null;
};

const CLIENT_APPROVAL_ORDER_BY_FACTORIES = {
  createdAt: (sortOrder) => ({ createdAt: sortOrder }),
  updatedAt: (sortOrder) => ({ updatedAt: sortOrder }),
  dueAt: (sortOrder) => ({ dueAt: sortOrder }),
  status: (sortOrder) => ({ status: sortOrder }),
} satisfies Record<ClientApprovalSortBy, ClientApprovalOrderByFactory>;

@Injectable()
export class ClientApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly workspaceGateway: WebAppWorkspaceGateway,
  ) {}

  async listInternalApprovals(
    currentUser: AuthenticatedUser,
    query: ClientApprovalQueryDto,
  ): Promise<ApprovalListResponse> {
    const where = await this.buildInternalApprovalWhere(currentUser, query);
    return this.listApprovals(where, query);
  }

  async getInternalApprovalById(
    currentUser: AuthenticatedUser,
    approvalId: string,
  ): Promise<ClientApprovalReadModel> {
    return this.getScopedInternalApprovalOrFail(currentUser, approvalId, "read");
  }

  async createInternalApproval(
    currentUser: AuthenticatedUser,
    dto: CreateClientApprovalDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ClientApprovalReadModel> {
    const scope = await this.resolveManagedApprovalScope(currentUser, dto);
    const requiresExplicitApproval = this.resolveRequiresExplicitApproval(
      dto.type,
      dto.requiresExplicitApproval,
    );

    await this.assertClientAllowsServiceKey(scope.clientProfileId, scope.serviceKey);
    this.assertEntityReferenceShape(dto.entityType ?? null, dto.entityId ?? null, scope.projectId);
    if (scope.projectId && dto.entityType && dto.entityId) {
      await this.assertEntityBelongsToProject(scope.projectId, dto.entityType, dto.entityId);
    }
    if (dto.assignedToUserId) {
      await this.assertAssignableEmployee(scope.clientProfileId, dto.assignedToUserId);
    }

    const approval = await this.prisma.$transaction(async (tx) => {
      const created = await tx.clientApprovalRequest.create({
        data: {
          clientProfileId: scope.clientProfileId,
          projectId: scope.projectId,
          serviceKey: scope.serviceKey,
          requestedByUserId: currentUser.id,
          assignedToUserId: dto.assignedToUserId ?? null,
          type: dto.type,
          status: ClientApprovalStatus.PENDING,
          title: dto.title,
          message: dto.message,
          entityType: dto.entityType ?? null,
          entityId: dto.entityId ?? null,
          actionPayload: this.toJsonObjectOrNull(dto.actionPayload),
          requiresExplicitApproval,
          dueAt: this.toDateOrNull(dto.dueAt),
        },
        select: clientApprovalReadSelect,
      });

      await tx.clientApprovalTransition.create({
        data: {
          approvalId: created.id,
          actorUserId: currentUser.id,
          fromStatus: null,
          toStatus: ClientApprovalStatus.PENDING,
          note: "Approval request created.",
        },
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CLIENT_APPROVAL_AUDIT_ACTIONS.created,
          entityType: CLIENT_APPROVAL_ENTITY,
          entityId: created.id,
          metadata: {
            clientProfileId: created.clientProfileId,
            projectId: created.projectId,
            type: created.type,
            status: created.status,
            requiresExplicitApproval: created.requiresExplicitApproval,
          },
          requestContext,
        },
        tx,
      );

      return tx.clientApprovalRequest.findUniqueOrThrow({
        where: { id: created.id },
        select: clientApprovalReadSelect,
      });
    });

    this.emitWorkspaceApprovalUpdate(approval, "approval.created");
    return approval;
  }

  async updateInternalApproval(
    currentUser: AuthenticatedUser,
    approvalId: string,
    dto: UpdateClientApprovalDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ClientApprovalReadModel> {
    this.assertHasInternalUpdatePayload(dto);
    const existing = await this.getScopedInternalApprovalOrFail(currentUser, approvalId, "manage");
    this.assertPendingForInternalMutation(existing.status, "Only pending approvals can be updated.");

    const nextType = dto.type ?? existing.type;
    const nextRequiresExplicitApproval = this.resolveRequiresExplicitApproval(
      nextType,
      dto.requiresExplicitApproval === undefined
        ? existing.requiresExplicitApproval
        : dto.requiresExplicitApproval,
    );

    if (dto.assignedToUserId !== undefined && dto.assignedToUserId !== null) {
      await this.assertAssignableEmployee(existing.clientProfileId, dto.assignedToUserId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const approval = await tx.clientApprovalRequest.update({
        where: { id: existing.id },
        data: {
          ...(dto.type !== undefined ? { type: dto.type } : {}),
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.message !== undefined ? { message: dto.message } : {}),
          ...(dto.actionPayload !== undefined
            ? { actionPayload: this.toJsonObjectOrNull(dto.actionPayload) }
            : {}),
          ...(dto.type !== undefined || dto.requiresExplicitApproval !== undefined
            ? { requiresExplicitApproval: nextRequiresExplicitApproval }
            : {}),
          ...(dto.assignedToUserId !== undefined
            ? { assignedToUserId: dto.assignedToUserId }
            : {}),
          ...(dto.dueAt !== undefined ? { dueAt: this.toDateOrNull(dto.dueAt) } : {}),
        },
        select: clientApprovalReadSelect,
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CLIENT_APPROVAL_AUDIT_ACTIONS.updated,
          entityType: CLIENT_APPROVAL_ENTITY,
          entityId: approval.id,
          metadata: {
            updatedFields: this.collectUpdatedFields(dto),
            requiresExplicitApproval: approval.requiresExplicitApproval,
            assignedToUserId: approval.assignedToUserId,
            dueAt: approval.dueAt?.toISOString() ?? null,
          },
          requestContext,
        },
        tx,
      );

      return approval;
    });

    this.emitWorkspaceApprovalUpdate(updated, "approval.updated");
    return updated;
  }

  async cancelInternalApproval(
    currentUser: AuthenticatedUser,
    approvalId: string,
    dto: CancelClientApprovalDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ClientApprovalReadModel> {
    const existing = await this.getScopedInternalApprovalOrFail(currentUser, approvalId, "manage");
    this.assertPendingForInternalMutation(existing.status, "Only pending approvals can be cancelled.");

    const cancelled = await this.prisma.$transaction(async (tx) => {
      const approval = await tx.clientApprovalRequest.update({
        where: { id: existing.id },
        data: {
          status: ClientApprovalStatus.CANCELLED,
        },
        select: clientApprovalReadSelect,
      });

      await tx.clientApprovalTransition.create({
        data: {
          approvalId: approval.id,
          actorUserId: currentUser.id,
          fromStatus: existing.status,
          toStatus: ClientApprovalStatus.CANCELLED,
          note: dto.note ?? null,
        },
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CLIENT_APPROVAL_AUDIT_ACTIONS.cancelled,
          entityType: CLIENT_APPROVAL_ENTITY,
          entityId: approval.id,
          metadata: {
            fromStatus: existing.status,
            toStatus: ClientApprovalStatus.CANCELLED,
            note: dto.note ?? null,
          },
          requestContext,
        },
        tx,
      );

      return tx.clientApprovalRequest.findUniqueOrThrow({
        where: { id: approval.id },
        select: clientApprovalReadSelect,
      });
    });

    this.emitWorkspaceApprovalUpdate(cancelled, "approval.cancelled");
    return cancelled;
  }

  async listClientApprovals(
    currentUser: AuthenticatedUser,
    query: ClientApprovalQueryDto,
  ): Promise<ApprovalListResponse> {
    this.assertCanRespondToOwnApprovals(currentUser);

    if (
      query.clientProfileId &&
      query.clientProfileId !== this.getClientProfileIdOrFail(currentUser)
    ) {
      return this.toEmptyListResponse(query.page, query.limit);
    }

    const requestedStatus = query.onlyPending ? ClientApprovalStatus.PENDING : query.status;
    const where: Prisma.ClientApprovalRequestWhereInput = {
      clientProfileId: this.getClientProfileIdOrFail(currentUser),
      ...(requestedStatus ? { status: requestedStatus } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.serviceKey ? { serviceKey: query.serviceKey } : {}),
      ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { message: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const response = await this.listApprovals(where, query);
    return {
      ...response,
      data: response.data.map((approval) => this.toClientVisibleApproval(approval)),
    };
  }

  async getClientApprovalById(
    currentUser: AuthenticatedUser,
    approvalId: string,
  ): Promise<ClientApprovalReadModel> {
    this.assertCanRespondToOwnApprovals(currentUser);
    const approval = await this.prisma.clientApprovalRequest.findFirst({
      where: {
        id: approvalId,
        clientProfileId: this.getClientProfileIdOrFail(currentUser),
      },
      select: clientApprovalReadSelect,
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found.");
    }

    return this.toClientVisibleApproval(approval);
  }

  async respondToClientApproval(
    currentUser: AuthenticatedUser,
    approvalId: string,
    dto: RespondClientApprovalDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ClientApprovalReadModel> {
    const existing = await this.getClientApprovalById(currentUser, approvalId);
    if (!existing.requiresExplicitApproval) {
      throw new BadRequestException(
        "This approval request only supports acknowledgement, not approve/reject responses.",
      );
    }
    this.assertPendingForClientResponse(existing.status);

    const nextStatus =
      dto.status === "APPROVED"
        ? ClientApprovalStatus.APPROVED
        : ClientApprovalStatus.REJECTED;
    const auditAction =
      nextStatus === ClientApprovalStatus.APPROVED
        ? CLIENT_APPROVAL_AUDIT_ACTIONS.approved
        : CLIENT_APPROVAL_AUDIT_ACTIONS.rejected;

    const responded = await this.prisma.$transaction(async (tx) => {
      const approval = await tx.clientApprovalRequest.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          clientResponseNote: dto.note ?? null,
          respondedAt: new Date(),
          respondedByUserId: currentUser.id,
        },
        select: clientApprovalReadSelect,
      });

      await tx.clientApprovalTransition.create({
        data: {
          approvalId: approval.id,
          actorUserId: currentUser.id,
          fromStatus: existing.status,
          toStatus: nextStatus,
          note: dto.note ?? null,
        },
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: auditAction,
          entityType: CLIENT_APPROVAL_ENTITY,
          entityId: approval.id,
          metadata: {
            fromStatus: existing.status,
            toStatus: nextStatus,
            note: dto.note ?? null,
          },
          requestContext,
        },
        tx,
      );

      return tx.clientApprovalRequest.findUniqueOrThrow({
        where: { id: approval.id },
        select: clientApprovalReadSelect,
      });
    });

    this.emitWorkspaceApprovalUpdate(responded, "approval.responded");
    return this.toClientVisibleApproval(responded);
  }

  async acknowledgeClientApproval(
    currentUser: AuthenticatedUser,
    approvalId: string,
    dto: AcknowledgeClientApprovalDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ClientApprovalReadModel> {
    const existing = await this.getClientApprovalById(currentUser, approvalId);
    if (existing.requiresExplicitApproval) {
      throw new BadRequestException(
        "This approval request requires an explicit approve/reject response.",
      );
    }
    this.assertPendingForClientResponse(existing.status);

    const acknowledged = await this.prisma.$transaction(async (tx) => {
      const approval = await tx.clientApprovalRequest.update({
        where: { id: existing.id },
        data: {
          status: ClientApprovalStatus.ACKNOWLEDGED,
          clientResponseNote: dto.note ?? null,
          respondedAt: new Date(),
          respondedByUserId: currentUser.id,
        },
        select: clientApprovalReadSelect,
      });

      await tx.clientApprovalTransition.create({
        data: {
          approvalId: approval.id,
          actorUserId: currentUser.id,
          fromStatus: existing.status,
          toStatus: ClientApprovalStatus.ACKNOWLEDGED,
          note: dto.note ?? null,
        },
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CLIENT_APPROVAL_AUDIT_ACTIONS.acknowledged,
          entityType: CLIENT_APPROVAL_ENTITY,
          entityId: approval.id,
          metadata: {
            fromStatus: existing.status,
            toStatus: ClientApprovalStatus.ACKNOWLEDGED,
            note: dto.note ?? null,
          },
          requestContext,
        },
        tx,
      );

      return tx.clientApprovalRequest.findUniqueOrThrow({
        where: { id: approval.id },
        select: clientApprovalReadSelect,
      });
    });

    this.emitWorkspaceApprovalUpdate(acknowledged, "approval.responded");
    return this.toClientVisibleApproval(acknowledged);
  }

  private async listApprovals(
    where: Prisma.ClientApprovalRequestWhereInput,
    query: ClientApprovalQueryDto,
  ): Promise<ApprovalListResponse> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.clientApprovalRequest.findMany({
        where,
        select: clientApprovalReadSelect,
        orderBy: this.getOrderBy(query.sortBy, query.sortOrder),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.clientApprovalRequest.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
    return {
      data: items,
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

  private async buildInternalApprovalWhere(
    currentUser: AuthenticatedUser,
    query: ClientApprovalQueryDto,
  ): Promise<Prisma.ClientApprovalRequestWhereInput> {
    if (this.isAdmin(currentUser)) {
      this.assertHasAnyPermission(currentUser, [
        APPROVAL_READ_PERMISSION,
        APPROVAL_MANAGE_PERMISSION,
      ]);

      return this.buildApprovalQueryFilters(query);
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only admin and employee accounts can access internal approvals.");
    }

    this.assertCanReadInternalApprovals(currentUser);
    const assignedClientIds = await this.getAssignedClientIds(currentUser.id);
    if (assignedClientIds.length === 0) {
      return { id: "__no_internal_approvals__" };
    }

    return {
      AND: [
        { clientProfileId: { in: assignedClientIds } },
        this.buildApprovalQueryFilters(query),
      ],
    };
  }

  private buildApprovalQueryFilters(
    query: ClientApprovalQueryDto,
  ): Prisma.ClientApprovalRequestWhereInput {
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(query.serviceKey ? { serviceKey: query.serviceKey } : {}),
      ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { message: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async getScopedInternalApprovalOrFail(
    currentUser: AuthenticatedUser,
    approvalId: string,
    access: "read" | "manage",
  ): Promise<ClientApprovalReadModel> {
    if (this.isAdmin(currentUser)) {
      if (access === "manage") {
        this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
      } else {
        this.assertHasAnyPermission(currentUser, [
          APPROVAL_READ_PERMISSION,
          APPROVAL_MANAGE_PERMISSION,
        ]);
      }

      const approval = await this.prisma.clientApprovalRequest.findUnique({
        where: { id: approvalId },
        select: clientApprovalReadSelect,
      });
      if (!approval) {
        throw new NotFoundException("Approval request not found.");
      }

      return approval;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only admin and employee accounts can access internal approvals.");
    }

    if (access === "manage") {
      this.assertCanManageInternalApprovals(currentUser);
    } else {
      this.assertCanReadInternalApprovals(currentUser);
    }

    const approval = await this.prisma.clientApprovalRequest.findFirst({
      where: {
        id: approvalId,
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
            },
          },
        },
      },
      select: clientApprovalReadSelect,
    });
    if (!approval) {
      throw new NotFoundException("Approval request not found.");
    }

    return approval;
  }

  private async resolveManagedApprovalScope(
    currentUser: AuthenticatedUser,
    dto: CreateClientApprovalDto,
  ): Promise<ApprovalScope> {
    let projectScope: ApprovalScope | null = null;
    if (dto.projectId) {
      projectScope = await this.getManageableProjectScopeOrFail(currentUser, dto.projectId);
      if (projectScope.clientProfileId !== dto.clientProfileId) {
        throw new BadRequestException(
          "Approval project must belong to the same client profile as the request.",
        );
      }
      if (dto.serviceKey && projectScope.serviceKey && dto.serviceKey !== projectScope.serviceKey) {
        throw new BadRequestException(
          "Approval serviceKey must match the associated project serviceKey.",
        );
      }
    } else {
      await this.assertManageableClientProfileOrFail(currentUser, dto.clientProfileId);
    }

    return {
      clientProfileId: dto.clientProfileId,
      projectId: projectScope?.projectId ?? null,
      serviceKey: dto.serviceKey ?? projectScope?.serviceKey ?? null,
    };
  }

  private async assertManageableClientProfileOrFail(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
      const clientProfile = await this.prisma.clientProfile.findUnique({
        where: { id: clientProfileId },
        select: { id: true },
      });
      if (!clientProfile) {
        throw new NotFoundException("Client profile not found.");
      }
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only admin and employee accounts can manage approvals.");
    }

    this.assertCanManageInternalApprovals(currentUser);
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

  private async getManageableProjectScopeOrFail(
    currentUser: AuthenticatedUser,
    projectId: string,
  ): Promise<ApprovalScope> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, clientProfileId: true, serviceKey: true },
      });
      if (!project) {
        throw new NotFoundException("Project not found.");
      }

      return {
        clientProfileId: project.clientProfileId,
        projectId: project.id,
        serviceKey: project.serviceKey,
      };
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only admin and employee accounts can manage approvals.");
    }

    this.assertCanManageInternalApprovals(currentUser);
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
            },
          },
        },
      },
      select: { id: true, clientProfileId: true, serviceKey: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return {
      clientProfileId: project.clientProfileId,
      projectId: project.id,
      serviceKey: project.serviceKey,
    };
  }

  private async assertAssignableEmployee(
    clientProfileId: string,
    userId: string,
  ): Promise<void> {
    const assignee = await this.prisma.user.findFirst({
      where: {
        id: userId,
        accountType: AccountType.EMPLOYEE,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!assignee) {
      throw new BadRequestException(
        "Assigned approval owner must be an active employee account.",
      );
    }

    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: userId,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new BadRequestException(
        "Assigned approval owner must have an active assignment for this client profile.",
      );
    }
  }

  private assertEntityReferenceShape(
    entityType: ClientApprovalEntityType | null,
    entityId: string | null,
    projectId: string | null,
  ): void {
    if ((entityType && !entityId) || (!entityType && entityId)) {
      throw new BadRequestException("entityType and entityId must be provided together.");
    }

    if (entityType && !projectId) {
      throw new BadRequestException(
        "projectId is required when entityType/entityId references are provided.",
      );
    }
  }

  private async assertEntityBelongsToProject(
    projectId: string,
    entityType: ClientApprovalEntityType,
    entityId: string,
  ): Promise<void> {
    switch (entityType) {
      case ClientApprovalEntityType.PROJECT: {
        if (entityId !== projectId) {
          throw new BadRequestException("Referenced project does not belong to this approval scope.");
        }
        return;
      }
      case ClientApprovalEntityType.TASK: {
        await this.assertRecordExists(
          this.prisma.task.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced task does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.TASK_TODO: {
        await this.assertRecordExists(
          this.prisma.taskTodo.findFirst({
            where: {
              id: entityId,
              task: { projectId },
            },
            select: { id: true },
          }),
          "Referenced task todo does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.SPRINT: {
        await this.assertRecordExists(
          this.prisma.deliverySprint.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced sprint does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.RELEASE: {
        await this.assertRecordExists(
          this.prisma.deliveryRelease.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced release does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.PROJECT_FILE:
      case ClientApprovalEntityType.DESIGN_ASSET: {
        await this.assertRecordExists(
          this.prisma.projectFile.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced file does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.WORKSPACE_MESSAGE: {
        await this.assertRecordExists(
          this.prisma.webAppWorkspaceMessage.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced workspace message does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.REVISION: {
        await this.assertRecordExists(
          this.prisma.webAppWorkspaceRevision.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced revision does not belong to this approval project.",
        );
        return;
      }
      case ClientApprovalEntityType.MEETING_REQUEST: {
        await this.assertRecordExists(
          this.prisma.webAppWorkspaceMeetingRequest.findFirst({
            where: { id: entityId, projectId },
            select: { id: true },
          }),
          "Referenced meeting request does not belong to this approval project.",
        );
        return;
      }
    }
  }

  private async assertRecordExists<T>(
    promise: Promise<T | null>,
    message: string,
  ): Promise<void> {
    const record = await promise;
    if (!record) {
      throw new BadRequestException(message);
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

  private resolveRequiresExplicitApproval(
    type: ClientApprovalType,
    requiresExplicitApproval: boolean | undefined,
  ): boolean {
    if (type === ClientApprovalType.INFORMATION) {
      if (requiresExplicitApproval === true) {
        throw new BadRequestException(
          "INFORMATION approvals cannot require explicit approve/reject responses.",
        );
      }

      return false;
    }

    return requiresExplicitApproval ?? true;
  }

  private assertHasInternalUpdatePayload(dto: UpdateClientApprovalDto): void {
    if (
      dto.type === undefined &&
      dto.title === undefined &&
      dto.message === undefined &&
      dto.actionPayload === undefined &&
      dto.requiresExplicitApproval === undefined &&
      dto.assignedToUserId === undefined &&
      dto.dueAt === undefined
    ) {
      throw new BadRequestException("Provide at least one approval field to update.");
    }
  }

  private assertPendingForInternalMutation(
    status: ClientApprovalStatus,
    message: string,
  ): void {
    if (status !== ClientApprovalStatus.PENDING) {
      throw new BadRequestException(message);
    }
  }

  private assertPendingForClientResponse(status: ClientApprovalStatus): void {
    if (status !== ClientApprovalStatus.PENDING) {
      throw new ConflictException("Only pending approvals can be responded to.");
    }
  }

  private collectUpdatedFields(dto: UpdateClientApprovalDto): string[] {
    return Object.entries(dto)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key)
      .sort();
  }

  private emitWorkspaceApprovalUpdate(
    approval: ClientApprovalReadModel,
    event: "approval.created" | "approval.updated" | "approval.cancelled" | "approval.responded",
  ): void {
    if (!approval.projectId || approval.project?.serviceKey !== PurchasedServiceKey.WEB_APP) {
      return;
    }

    this.workspaceGateway.emitWorkspaceUpdate(
      approval.projectId,
      this.resolveWorkspaceApprovalTab(approval),
      event,
      { approval },
    );
  }

  private toClientVisibleApproval(approval: ClientApprovalReadModel): ClientApprovalReadModel {
    return {
      ...approval,
      actionPayload: this.toClientVisibleActionPayload(approval.actionPayload),
    };
  }

  private toClientVisibleActionPayload(payload: Prisma.JsonValue | null): Prisma.JsonValue | null {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return payload;
    }

    const objectPayload = payload as Record<string, unknown>;
    if (!("clientVisiblePayload" in objectPayload)) {
      return payload;
    }

    const visiblePayload = objectPayload.clientVisiblePayload;
    if (visiblePayload === null || visiblePayload === undefined) {
      return null;
    }

    if (!this.isJsonValue(visiblePayload)) {
      return null;
    }

    return visiblePayload;
  }

  private isJsonValue(value: unknown): value is Prisma.JsonValue {
    if (value === null) {
      return true;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return true;
    }
    if (Array.isArray(value)) {
      return value.every((item) => this.isJsonValue(item));
    }
    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).every((item) =>
        this.isJsonValue(item),
      );
    }
    return false;
  }

  private resolveWorkspaceApprovalTab(
    approval: Pick<ClientApprovalReadModel, "entityType" | "type">,
  ): WebAppWorkspaceTabKey {
    switch (approval.entityType) {
      case ClientApprovalEntityType.TASK:
      case ClientApprovalEntityType.TASK_TODO:
        return WebAppWorkspaceTabKey.TASKS;
      case ClientApprovalEntityType.SPRINT:
      case ClientApprovalEntityType.RELEASE:
        return WebAppWorkspaceTabKey.DELIVERY;
      case ClientApprovalEntityType.PROJECT_FILE:
      case ClientApprovalEntityType.DESIGN_ASSET:
        return WebAppWorkspaceTabKey.FILES;
      case ClientApprovalEntityType.WORKSPACE_MESSAGE:
        return WebAppWorkspaceTabKey.MESSAGES;
      case ClientApprovalEntityType.REVISION:
        return WebAppWorkspaceTabKey.REVISIONS;
      case ClientApprovalEntityType.MEETING_REQUEST:
        return WebAppWorkspaceTabKey.MEETINGS;
      case ClientApprovalEntityType.PROJECT:
        return WebAppWorkspaceTabKey.OVERVIEW;
      default:
        break;
    }

    switch (approval.type) {
      case ClientApprovalType.FILE_APPROVAL:
      case ClientApprovalType.DESIGN_APPROVAL:
        return WebAppWorkspaceTabKey.FILES;
      case ClientApprovalType.TASK_APPROVAL:
        return WebAppWorkspaceTabKey.TASKS;
      case ClientApprovalType.SPRINT_APPROVAL:
      case ClientApprovalType.RELEASE_APPROVAL:
        return WebAppWorkspaceTabKey.DELIVERY;
      case ClientApprovalType.REVISION_APPROVAL:
        return WebAppWorkspaceTabKey.REVISIONS;
      case ClientApprovalType.MEETING_CONFIRMATION:
        return WebAppWorkspaceTabKey.MEETINGS;
      case ClientApprovalType.INFORMATION:
      case ClientApprovalType.GENERAL_CONFIRMATION:
        return WebAppWorkspaceTabKey.OVERVIEW;
    }
  }

  private assertCanReadInternalApprovals(currentUser: AuthenticatedUser): void {
    if (this.isAdmin(currentUser)) {
      this.assertHasAnyPermission(currentUser, [
        APPROVAL_READ_PERMISSION,
        APPROVAL_MANAGE_PERMISSION,
      ]);
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only employee accounts can access internal approvals.");
    }

    if (currentUser.role === UserRole.PROJECT_MANAGER) {
      this.assertHasAnyPermission(currentUser, [
        APPROVAL_READ_PERMISSION,
        APPROVAL_MANAGE_PERMISSION,
      ]);
      return;
    }

    this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
  }

  private assertCanManageInternalApprovals(currentUser: AuthenticatedUser): void {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Only employee accounts can manage internal approvals.");
    }

    this.assertHasPermission(currentUser, APPROVAL_MANAGE_PERMISSION);
  }

  private assertCanRespondToOwnApprovals(currentUser: AuthenticatedUser): void {
    if (!this.isClient(currentUser)) {
      throw new ForbiddenException("Only client accounts can respond to client approvals.");
    }

    this.assertHasPermission(currentUser, APPROVAL_RESPOND_OWN_PERMISSION);
    this.getClientProfileIdOrFail(currentUser);
  }

  private getAssignedClientIds(employeeUserId: string): Promise<string[]> {
    return this.prisma.employeeClientAssignment
      .findMany({
        where: {
          employeeUserId,
          isActive: true,
        },
        select: {
          clientProfileId: true,
        },
      })
      .then((rows) => Array.from(new Set(rows.map((row) => row.clientProfileId))));
  }

  private getOrderBy(
    sortBy: ClientApprovalSortBy,
    sortOrder: ClientApprovalSortOrder,
  ): Prisma.ClientApprovalRequestOrderByWithRelationInput[] {
    return [CLIENT_APPROVAL_ORDER_BY_FACTORIES[sortBy](sortOrder), { id: "desc" }];
  }

  private toEmptyListResponse(page: number, limit: number): ApprovalListResponse {
    return {
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  private toDateOrNull(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return new Date(value);
  }

  private toJsonObjectOrNull(
    value: Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonObject | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonObject;
  }

  private isAdmin(currentUser: AuthenticatedUser): boolean {
    return (
      currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN
    );
  }

  private isEmployee(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.EMPLOYEE;
  }

  private isClient(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.CLIENT;
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client profile scope is missing for this user.");
    }

    return currentUser.clientProfileId;
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (!currentUser.permissions.includes(permission)) {
      throw new ForbiddenException("Missing required permissions.");
    }
  }

  private assertHasAnyPermission(
    currentUser: AuthenticatedUser,
    permissions: readonly string[],
  ): void {
    if (!permissions.some((permission) => currentUser.permissions.includes(permission))) {
      throw new ForbiddenException("Missing required permissions.");
    }
  }
}
