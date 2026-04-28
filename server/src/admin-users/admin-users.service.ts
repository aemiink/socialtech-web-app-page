import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateAdminEmployeeUserDto } from "../users/dto/create-admin-employee-user.dto";

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

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createEmployeeUser(
    currentUser: AuthenticatedUser,
    dto: CreateAdminEmployeeUserDto,
  ): Promise<AdminUserReadModel> {
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
      return await this.prisma.user.create({
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
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Email is already in use.");
      }

      throw error;
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
}
