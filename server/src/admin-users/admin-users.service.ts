import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountType, Prisma, UserRole, UserStatus } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateAdminEmployeeUserDto } from "../users/dto/create-admin-employee-user.dto";
import { AdminUserQueryDto } from "./dto/admin-user-query.dto";
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
];

const USERS_MANAGE_PERMISSION = "users.manage";

type AdminUserReadModel = Prisma.UserGetPayload<{ select: typeof adminUserReadSelect }>;

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

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getAdminUsers(
    currentUser: AuthenticatedUser,
    query: AdminUserQueryDto,
  ): Promise<AdminUserResponse[]> {
    this.assertCanManageUsers(currentUser);

    const where: Prisma.UserWhereInput = {
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

    const users = await this.prisma.user.findMany({
      where,
      select: adminUserReadSelect,
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => this.toAdminUserResponse(user));
  }

  async createEmployeeUser(
    currentUser: AuthenticatedUser,
    dto: CreateAdminEmployeeUserDto,
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
      const createdUser = await this.prisma.user.create({
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
    const updatedUser = shouldInvalidateSessions
      ? await this.updateUserAndInvalidateSessions(userId, data)
      : await this.prisma.user.update({
          where: { id: userId },
          data,
          select: adminUserReadSelect,
        });

    return this.toAdminUserResponse(updatedUser);
  }

  async deactivateAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    this.assertNotSelfDeactivation(currentUser, userId);

    await this.getManageableEmployeeOrFail(userId);
    const deactivatedUser = await this.updateUserAndInvalidateSessions(userId, {
      status: UserStatus.INACTIVE,
    });

    return this.toAdminUserResponse(deactivatedUser);
  }

  async activateAdminUser(
    currentUser: AuthenticatedUser,
    userId: string,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);

    const user = await this.getManageableEmployeeOrFail(userId);
    if (user.status === UserStatus.ACTIVE) {
      return this.toAdminUserResponse(user);
    }

    const activatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
      select: adminUserReadSelect,
    });

    return this.toAdminUserResponse(activatedUser);
  }

  async resetAdminUserPassword(
    currentUser: AuthenticatedUser,
    userId: string,
    dto: ResetAdminUserPasswordDto,
  ): Promise<AdminUserResponse> {
    this.assertCanManageUsers(currentUser);
    await this.getManageableEmployeeOrFail(userId);

    const passwordHash = await this.authService.hashUserPassword(dto.newPassword);
    const updatedUser = await this.updateUserAndInvalidateSessions(userId, { passwordHash });

    return this.toAdminUserResponse(updatedUser);
  }

  private async getUserOrFail(userId: string): Promise<AdminUserReadModel> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

      return updatedUser;
    });
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
