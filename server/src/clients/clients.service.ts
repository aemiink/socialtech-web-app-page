import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";

const clientReadSelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientProfileSelect;

type ClientReadModel = Prisma.ClientProfileGetPayload<{ select: typeof clientReadSelect }>;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClients(currentUser: AuthenticatedUser): Promise<ClientReadModel[]> {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read");
      return this.prisma.clientProfile.findMany({
        select: clientReadSelect,
        orderBy: { companyName: "asc" },
      });
    }

    if (this.isClient(currentUser)) {
      this.assertHasPermission(currentUser, "clients.read.own");
      const ownProfile = await this.getOwnProfileByUserContext(currentUser);
      return [ownProfile];
    }

    if (this.hasPermission(currentUser, "clients.read.assigned")) {
      // Assignment model does not exist yet; deny by returning an empty scoped result.
      return [];
    }

    throw new ForbiddenException("You are not allowed to access client profiles.");
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

    if (this.hasPermission(currentUser, "clients.read.assigned")) {
      throw new ForbiddenException("Client assignment scope is not available yet.");
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

  private async getOwnProfileByUserContext(currentUser: AuthenticatedUser): Promise<ClientReadModel> {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return this.getClientProfileOrFail(currentUser.clientProfileId);
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
}
