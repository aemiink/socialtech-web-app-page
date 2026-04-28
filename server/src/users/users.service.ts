import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { AccountType, Prisma, UserRole, UserStatus } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AuthUserProfile } from "../auth/types/auth-response.type";
import { PrismaService } from "../database/prisma.service";
import { ChangeOwnPasswordDto } from "./dto/change-own-password.dto";

const clientProfileSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
} satisfies Prisma.ClientProfileSelect;

const userReadSelect = {
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

type UserReadModel = Prisma.UserGetPayload<{ select: typeof userReadSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getMe(currentUser: AuthenticatedUser): Promise<AuthUserProfile> {
    return this.authService.me(currentUser);
  }

  async changeOwnPassword(
    currentUser: AuthenticatedUser,
    dto: ChangeOwnPasswordDto,
  ): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User session is no longer valid.");
    }

    const currentPasswordIsValid = await this.authService.verifyUserPassword(
      user.email,
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentPasswordIsValid) {
      throw new UnauthorizedException("Current password is invalid.");
    }

    const newPasswordMatchesOldPassword = await this.authService.verifyUserPassword(
      user.email,
      dto.newPassword,
      user.passwordHash,
    );
    if (newPasswordMatchesOldPassword) {
      throw new BadRequestException("New password must be different from the current password.");
    }

    const passwordHash = await this.authService.hashUserPassword(dto.newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      await tx.refreshToken.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    });

    return { success: true };
  }

  async getUsers(currentUser: AuthenticatedUser): Promise<UserReadModel[]> {
    this.assertCanReadUsers(currentUser);

    return this.prisma.user.findMany({
      select: userReadSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserById(currentUser: AuthenticatedUser, userId: string): Promise<UserReadModel> {
    const isAdmin = this.isAdmin(currentUser);
    if (!isAdmin && currentUser.id !== userId) {
      throw new ForbiddenException("You can only access your own user record.");
    }

    if (isAdmin) {
      this.assertCanReadUsers(currentUser);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userReadSelect,
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  private assertCanReadUsers(currentUser: AuthenticatedUser): void {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException("Only admin users can list users.");
    }

    if (!this.hasPermission(currentUser, "users.read")) {
      throw new ForbiddenException("Missing required permission: users.read.");
    }
  }

  private hasPermission(currentUser: AuthenticatedUser, permission: string): boolean {
    return currentUser.permissions.includes(permission);
  }

  private isAdmin(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN;
  }
}
