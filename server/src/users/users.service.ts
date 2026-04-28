import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AuthUserProfile } from "../auth/types/auth-response.type";
import { PrismaService } from "../database/prisma.service";

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
