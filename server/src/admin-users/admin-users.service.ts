import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountType, Prisma, UserRole, UserStatus } from "@prisma/client";
import {
  ADMIN_USER_AUDIT_ACTIONS,
  AuditLogService,
  type AdminUserAuditAction,
  type AuditLogRequestContext,
} from "../audit-log/audit-log.service";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateAdminEmployeeUserDto } from "../users/dto/create-admin-employee-user.dto";
import {
  AdminUserQueryDto,
  type AdminUserSortBy,
  type AdminUserSortOrder,
} from "./dto/admin-user-query.dto";
import { ResetAdminUserPasswordDto } from "./dto/reset-admin-user-password.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";

const clientProfileSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
} satisfies Prisma.ClientProfileSelect;

const adminUserReadSelect = {
  id: true,
  email: true,
  displayName: true,
  accountType: true,
  role: true,
  status: true,
  clientProfileId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  clientProfile: {
    select: clientProfileSummarySelect,
  },
} satisfies Prisma.UserSelect;

const EMPLOYEE_ROLES: readonly UserRole[] = [
  UserRole.PROJECT_MANAGER,
  UserRole.PERFORMANCE_SPECIALIST,
  UserRole.SOCIAL_MEDIA_SPECIALIST,
  UserRole.DESIGNER,
  UserRole.DEVELOPER,
  UserRole.SUPPORT_SPECIALIST,
  UserRole.SEO_SPECIALIST,
  UserRole.CRM_SPECIALIST,
];

const USERS_MANAGE_PERMISSION = "users.manage";
const ADMIN_USER_AUDIT_ENTITY_TYPE = "User";

type AdminUserReadModel = Prisma.UserGetPayload<{ select: typeof adminUserReadSelect }>;

type AdminUserOrderByFactory = (
  sortOrder: AdminUserSortOrder,
) => Prisma.UserOrderByWithRelationInput;

const ADMIN_USER_ORDER_BY_FACTORIES = {
  createdAt: (sortOrder) => ({ createdAt: sortOrder }),
  updatedAt: (sortOrder) => ({ updatedAt: sortOrder }),
  displayName: (sortOrder) => ({ displayName: sortOrder }),
  email: (sortOrder) => ({ email: sortOrder }),
  lastLoginAt: (sortOrder) => ({ lastLoginAt: sortOrder }),
  role: (sortOrder) => ({ role: sortOrder }),
  status: (sortOrder) => ({ status: sortOrder }),
} satisfies Record<AdminUserSortBy, AdminUserOrderByFactory>;

type AdminUserResponse = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  clientProfileId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clientProfile: {
    id: string;
    slug: string;
    companyName: string;
    contactEmail: string | null;
  } | null;
};

type AdminUsersListResponse = {
  data: AdminUserResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type AdminUserAuditMetadataOptions = {
  actorUserId: string;
  targetUserId: string;
  changedFields: string[];
  previousRole?: UserRole;
  nextRole?: UserRole;
  previousStatus?: UserStatus;
  nextStatus?: UserStatus;
};

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAdminUsers(
    currentUser: AuthenticatedUser,
    query: AdminUserQueryDto,
  ): Promise<AdminUsersListResponse> {
    this.assertCanManageUsers(currentUser);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.accountType ? { accountType: query.accountType } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive === undefined
        ? {}
        : { status: query.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE }),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { displayName: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: adminUserReadSelect,
        orderBy: this.getAdminUserOrderBy(query.sortBy, query.sortOrder),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: users.map((user) => this.toAdminUserResponse(user)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  async createEmployeeUser(
    currentUser: AuthenticatedUser,
    dto: CreateAdminEmployeeUserDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    this.assertEmployeeAccountType(dto.accountType);
    this.assertEmployeeRole(dto.role);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException("Email is already in use.");
    }

    const passwordHash = await this.authService.hashUserPassword(dto.password);

    try {
      const createdUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            displayName: dto.displayName ?? null,
            passwordHash,
            accountType: AccountType.EMPLOYEE,
            role: dto.role,
            clientProfileId: null,
          },
          select: adminUserReadSelect,
        });

        await this.recordAdminUserAudit(
          tx,
          currentUser,
          ADMIN_USER_AUDIT_ACTIONS.created,
          user.id,
          this.buildAuditMetadata({
            actorUserId: currentUser.id,
            targetUserId: user.id,
            changedFields: this.getCreatedUserChangedFields(user),
            nextRole: user.role,
            nextStatus: user.status,
          }),
          auditRequestContext,
        );

        return user;
      });

      return this.toAdminUserResponse(createdUser);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Email is already in use.");
      }

      throw error;
    }
  }

  async getAdminUserById(
    currentUser: AuthenticatedUser,
    userId: string,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);

    const user = await this.getUserOrFail(userId);
    return this.toAdminUserResponse(user);
  }

  async updateAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
    dto: UpdateAdminUserDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    this.assertHasUpdatePayload(dto);
    this.assertNoDangerousSelfUpdate(currentUser, userId, dto);
    const manageableUser = await this.getManageableEmployeeOrFail(userId);

    if (dto.role !== undefined) {
      this.assertEmployeeRole(dto.role);
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.isActive === undefined
        ? {}
        : { status: dto.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE }),
    };

    const roleChanged = dto.role !== undefined && dto.role !== manageableUser.role;
    const shouldInvalidateSessions = roleChanged || dto.isActive === false;
    const recordUpdateAudit = async (
      tx: Prisma.TransactionClient,
      updatedUser: AdminUserReadModel,
    ): Promise<void> => {
      await this.recordAdminUserAudit(
        tx,
        currentUser,
        ADMIN_USER_AUDIT_ACTIONS.updated,
        updatedUser.id,
        this.buildUpdateAuditMetadata(currentUser.id, manageableUser, updatedUser),
        auditRequestContext,
      );
    };

    const updatedUser = shouldInvalidateSessions
      ? await this.updateUserAndInvalidateSessions(userId, data, recordUpdateAudit)
      : await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: userId },
            data,
            select: adminUserReadSelect,
          });

          await recordUpdateAudit(tx, user);

          return user;
        });

    return this.toAdminUserResponse(updatedUser);
  }

  async deactivateAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    this.assertNotSelfDeactivation(currentUser, userId);

    const manageableUser = await this.getManageableEmployeeOrFail(userId);
    const deactivatedUser = await this.updateUserAndInvalidateSessions(userId, {
      status: UserStatus.INACTIVE,
    }, async (tx, updatedUser) => {
      await this.recordAdminUserAudit(
        tx,
        currentUser,
        ADMIN_USER_AUDIT_ACTIONS.deactivated,
        updatedUser.id,
        this.buildStatusAuditMetadata(
          currentUser.id,
          manageableUser,
          updatedUser,
        ),
        auditRequestContext,
      );
    });

    return this.toAdminUserResponse(deactivatedUser);
  }

  async deleteAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<{ success: true }> {
    this.assertCanManageUsers(currentUser);
    this.assertNotSelfDeactivation(currentUser, userId);

    const manageableUser = await this.getManageableEmployeeOrFail(userId);
    const deletedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const deletedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.INACTIVE,
          deletedAt,
          sessionInvalidatedAt: deletedAt,
        },
        select: adminUserReadSelect,
      });

      await tx.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: deletedAt },
      });

      await tx.employeeClientAssignment.updateMany({
        where: {
          employeeUserId: userId,
          isActive: true,
        },
        data: { isActive: false },
      });

      await this.recordAdminUserAudit(
        tx,
        currentUser,
        ADMIN_USER_AUDIT_ACTIONS.deleted,
        deletedUser.id,
        this.buildAuditMetadata({
          actorUserId: currentUser.id,
          targetUserId: deletedUser.id,
          changedFields: ["status", "deletedAt", "assignments"],
          previousStatus: manageableUser.status,
          nextStatus: deletedUser.status,
        }),
        auditRequestContext,
      );
    });

    return { success: true };
  }

  async activateAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);

    const user = await this.getManageableEmployeeOrFail(userId);
    if (user.status === UserStatus.ACTIVE) {
      return this.toAdminUserResponse(user);
    }

    const activatedUser = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE },
        select: adminUserReadSelect,
      });

      await this.recordAdminUserAudit(
        tx,
        currentUser,
        ADMIN_USER_AUDIT_ACTIONS.activated,
        updatedUser.id,
        this.buildStatusAuditMetadata(currentUser.id, user, updatedUser),
        auditRequestContext,
      );

      return updatedUser;
    });

    return this.toAdminUserResponse(activatedUser);
  }

  async resetAdminUserPassword(
    currentUser: AuthenticatedUser,
    userId: string,
    dto: ResetAdminUserPasswordDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    await this.getManageableEmployeeOrFail(userId);

    const passwordHash = await this.authService.hashUserPassword(dto.newPassword);
    const updatedUser = await this.updateUserAndInvalidateSessions(
      userId,
      { passwordHash },
      async (tx, user) => {
        await this.recordAdminUserAudit(
          tx,
          currentUser,
          ADMIN_USER_AUDIT_ACTIONS.passwordReset,
          user.id,
          this.buildAuditMetadata({
            actorUserId: currentUser.id,
            targetUserId: user.id,
            changedFields: ["credentials"],
          }),
          auditRequestContext,
        );
      },
    );

    return this.toAdminUserResponse(updatedUser);
  }

  private async getUserOrFail(userId: string): Promise<AdminUserReadModel> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: adminUserReadSelect,
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  private async getManageableEmployeeOrFail(userId: string): Promise<AdminUserReadModel> {
    const user = await this.getUserOrFail(userId);
    if (user.accountType !== AccountType.EMPLOYEE) {
      throw new BadRequestException("Only EMPLOYEE users can be managed from this endpoint.");
    }

    return user;
  }

  private async updateUserAndInvalidateSessions(
    userId: string,
    data: Prisma.UserUpdateInput,
    auditAfterUpdate?: (
      tx: Prisma.TransactionClient,
      updatedUser: AdminUserReadModel,
    ) => Promise<void>,
  ): Promise<AdminUserReadModel> {
    const sessionInvalidatedAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ...data,
          sessionInvalidatedAt,
        },
        select: adminUserReadSelect,
      });

      await tx.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: sessionInvalidatedAt },
      });

      if (auditAfterUpdate) {
        await auditAfterUpdate(tx, updatedUser);
      }

      return updatedUser;
    });
  }

  private async recordAdminUserAudit(
    tx: Prisma.TransactionClient,
    currentUser: AuthenticatedUser,
    action: AdminUserAuditAction,
    targetUserId: string,
    metadata: Prisma.InputJsonObject,
    requestContext?: AuditLogRequestContext,
  ): Promise<void> {
    await this.auditLogService.record(
      {
        actorUserId: currentUser.id,
        action,
        entityType: ADMIN_USER_AUDIT_ENTITY_TYPE,
        entityId: targetUserId,
        metadata,
        requestContext,
      },
      tx,
    );
  }

  private buildUpdateAuditMetadata(
    actorUserId: string,
    previousUser: AdminUserReadModel,
    updatedUser: AdminUserReadModel,
  ): Prisma.InputJsonObject {
    const roleChanged = previousUser.role !== updatedUser.role;
    const statusChanged = previousUser.status !== updatedUser.status;

    return this.buildAuditMetadata({
      actorUserId,
      targetUserId: updatedUser.id,
      changedFields: this.getUpdatedUserChangedFields(previousUser, updatedUser),
      ...(roleChanged
        ? { previousRole: previousUser.role, nextRole: updatedUser.role }
        : {}),
      ...(statusChanged
        ? { previousStatus: previousUser.status, nextStatus: updatedUser.status }
        : {}),
    });
  }

  private buildStatusAuditMetadata(
    actorUserId: string,
    previousUser: AdminUserReadModel,
    updatedUser: AdminUserReadModel,
  ): Prisma.InputJsonObject {
    return this.buildAuditMetadata({
      actorUserId,
      targetUserId: updatedUser.id,
      changedFields: previousUser.status === updatedUser.status ? [] : ["status"],
      previousStatus: previousUser.status,
      nextStatus: updatedUser.status,
    });
  }

  private buildAuditMetadata(options: AdminUserAuditMetadataOptions): Prisma.InputJsonObject {
    const metadata = {
      actorUserId: options.actorUserId,
      targetUserId: options.targetUserId,
      changedFields: options.changedFields,
      ...(options.previousRole !== undefined ? { previousRole: options.previousRole } : {}),
      ...(options.nextRole !== undefined ? { nextRole: options.nextRole } : {}),
      ...(options.previousStatus !== undefined ? { previousStatus: options.previousStatus } : {}),
      ...(options.nextStatus !== undefined ? { nextStatus: options.nextStatus } : {}),
    } satisfies Prisma.InputJsonObject;

    return metadata;
  }

  private getCreatedUserChangedFields(user: AdminUserReadModel): string[] {
    return [
      "email",
      ...(user.displayName === null ? [] : ["displayName"]),
      "accountType",
      "role",
      "status",
    ];
  }

  private getUpdatedUserChangedFields(
    previousUser: AdminUserReadModel,
    updatedUser: AdminUserReadModel,
  ): string[] {
    const changedFields: string[] = [];

    if (previousUser.displayName !== updatedUser.displayName) {
      changedFields.push("displayName");
    }

    if (previousUser.role !== updatedUser.role) {
      changedFields.push("role");
    }

    if (previousUser.status !== updatedUser.status) {
      changedFields.push("status");
    }

    return changedFields;
  }

  private assertHasUpdatePayload(dto: UpdateAdminUserDto): void {
    if (dto.displayName === undefined && dto.role === undefined && dto.isActive === undefined) {
      throw new BadRequestException("Provide displayName, role, and/or isActive to update a user.");
    }
  }

  private assertNoDangerousSelfUpdate(
    currentUser: AuthenticatedUser,
    userId: string,
    dto: UpdateAdminUserDto,
  ): void {
    if (currentUser.id !== userId) {
      return;
    }

    if (dto.role !== undefined || dto.isActive !== undefined) {
      throw new ForbiddenException("You cannot change your own role or activation status.");
    }
  }

  private assertNotSelfDeactivation(currentUser: AuthenticatedUser, userId: string): void {
    if (currentUser.id === userId) {
      throw new ForbiddenException("You cannot deactivate your own user account.");
    }
  }

  private assertCanManageUsers(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can manage employee users.");
    }

    if (!currentUser.permissions.includes(USERS_MANAGE_PERMISSION)) {
      throw new ForbiddenException(`Missing required permission: ${USERS_MANAGE_PERMISSION}.`);
    }
  }

  private assertEmployeeAccountType(accountType: AccountType): void {
    if (accountType !== AccountType.EMPLOYEE) {
      throw new BadRequestException("Only EMPLOYEE accountType can be created from this endpoint.");
    }
  }

  private assertEmployeeRole(role: UserRole): void {
    if (!EMPLOYEE_ROLES.includes(role)) {
      throw new BadRequestException("Role must be an employee role.");
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
    );
  }

  private getAdminUserOrderBy(
    sortBy: AdminUserSortBy,
    sortOrder: AdminUserSortOrder,
  ): Prisma.UserOrderByWithRelationInput[] {
    return [ADMIN_USER_ORDER_BY_FACTORIES[sortBy](sortOrder), { id: "asc" }];
  }

  private toAdminUserResponse(user: AdminUserReadModel): AdminUserResponse {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accountType: user.accountType,
      role: user.role,
      status: user.status,
      isActive: user.status === UserStatus.ACTIVE,
      clientProfileId: user.clientProfileId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      clientProfile: user.clientProfile
        ? {
            id: user.clientProfile.id,
            slug: user.clientProfile.slug,
            companyName: user.clientProfile.companyName,
            contactEmail: user.clientProfile.contactEmail,
          }
        : null,
    };
  }
}
