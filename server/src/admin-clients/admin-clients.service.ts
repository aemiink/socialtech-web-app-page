import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  ClientStatus,
  GoogleAdsConnectionStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import {
  ADMIN_CLIENT_AUDIT_ACTIONS,
  AuditLogService,
  type AdminClientAuditAction,
  type AuditLogRequestContext,
} from "../audit-log/audit-log.service";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { AdminClientGoogleAdsConfigDto } from "./dto/admin-client-google-ads-config.dto";
import { AdminClientOwnerDto, AdminClientOwnerMode } from "./dto/admin-client-owner.dto";
import { AdminClientPurchasedServiceDto } from "./dto/admin-client-purchased-service.dto";
import { CreateAdminClientDto } from "./dto/create-admin-client.dto";
import { ResetClientOwnerPasswordDto } from "./dto/reset-client-owner-password.dto";
import { UpdateAdminClientDto } from "./dto/update-admin-client.dto";

const CLIENTS_MANAGE_PERMISSION = "clients.manage";
const ADMIN_CLIENT_AUDIT_ENTITY_TYPE = "ClientProfile";

const clientOwnerSummarySelect = {
  id: true,
  email: true,
  displayName: true,
  accountType: true,
  role: true,
  status: true,
  clientProfileId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const purchasedServiceReadSelect = {
  id: true,
  serviceKey: true,
  status: true,
  startedAt: true,
  endedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientPurchasedServiceSelect;

const googleAdsConfigReadSelect = {
  customerId: true,
  managerCustomerId: true,
  descriptiveName: true,
  currencyCode: true,
  timeZone: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
} satisfies Prisma.ClientGoogleAdsConfigSelect;

const adminClientReadSelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  users: {
    where: {
      accountType: AccountType.CLIENT,
      role: UserRole.CLIENT_OWNER,
    },
    select: clientOwnerSummarySelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  purchasedServices: {
    select: purchasedServiceReadSelect,
    orderBy: [{ serviceKey: "asc" }, { id: "asc" }],
  },
  googleAdsConfig: {
    select: googleAdsConfigReadSelect,
  },
} satisfies Prisma.ClientProfileSelect;

type ClientOwnerReadModel = Prisma.UserGetPayload<{
  select: typeof clientOwnerSummarySelect;
}>;

type AdminClientReadModel = Prisma.ClientProfileGetPayload<{
  select: typeof adminClientReadSelect;
}>;

type PurchasedServiceReadModel = Prisma.ClientPurchasedServiceGetPayload<{
  select: typeof purchasedServiceReadSelect;
}>;

type GoogleAdsConfigReadModel = Prisma.ClientGoogleAdsConfigGetPayload<{
  select: typeof googleAdsConfigReadSelect;
}>;

type AdminClientOwnerResponse = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  clientProfileId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AdminClientPurchasedServiceResponse = {
  id: string;
  serviceKey: PurchasedServiceKey;
  status: PurchasedServiceStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AdminClientGoogleAdsConfigResponse = {
  customerId: string | null;
  managerCustomerId: string | null;
  descriptiveName: string | null;
  currencyCode: string | null;
  timeZone: string | null;
  connectionStatus: GoogleAdsConnectionStatus;
  lastSyncAt: Date | null;
  syncError: string | null;
};

type AdminClientResponse = {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: AdminClientOwnerResponse | null;
  purchasedServices: AdminClientPurchasedServiceResponse[];
  googleAdsConfig: AdminClientGoogleAdsConfigResponse | null;
};

type AdminClientGoogleAdsConfigPatchData = {
  customerId?: string | null;
  managerCustomerId?: string | null;
  descriptiveName?: string | null;
  currencyCode?: string | null;
  timeZone?: string | null;
  connectionStatus?: GoogleAdsConnectionStatus;
};

type ClientAuditMetadataOptions = {
  actorUserId: string;
  targetClientProfileId: string;
  changedFields: string[];
  ownerUserId?: string;
  previousState?: Prisma.InputJsonObject;
  nextState?: Prisma.InputJsonObject;
};

@Injectable()
export class AdminClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createAdminClient(
    currentUser: AuthenticatedUser,
    dto: CreateAdminClientDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);
    this.assertValidCreateOwnerPayload(dto.owner);
    this.assertValidPurchasedServicesPayload(dto.purchasedServices);
    const clientName = this.resolveCreateClientName(dto);
    const purchasedServiceInputs = this.toPurchasedServiceCreateInputs(dto.purchasedServices);

    const ownerMode = dto.owner?.mode ?? AdminClientOwnerMode.NONE;
    const passwordHash =
      ownerMode === AdminClientOwnerMode.CREATE && dto.owner?.password
        ? await this.authService.hashUserPassword(dto.owner.password)
        : null;

    try {
      const createdClient = await this.prisma.$transaction(async (tx) => {
        const clientProfile = await tx.clientProfile.create({
          data: {
            slug: dto.slug ?? this.buildSlugFromClientName(clientName),
            companyName: clientName,
            contactEmail: dto.contactEmail ?? null,
            status: dto.status ?? ClientStatus.ACTIVE,
            ...(purchasedServiceInputs.length > 0
              ? { purchasedServices: { create: purchasedServiceInputs } }
              : {}),
          },
          select: adminClientReadSelect,
        });

        if (dto.googleAdsConfig !== undefined) {
          await this.upsertGoogleAdsConfig(tx, clientProfile.id, dto.googleAdsConfig);
        }

        const clientProfileForAudit = await this.getClientProfileOrFail(clientProfile.id, tx);

        await this.recordAdminClientAudit(
          tx,
          currentUser,
          ADMIN_CLIENT_AUDIT_ACTIONS.created,
          clientProfile.id,
          this.buildAuditMetadata({
            actorUserId: currentUser.id,
            targetClientProfileId: clientProfile.id,
            changedFields: this.getCreatedClientChangedFields(clientProfileForAudit),
            nextState: this.toClientAuditState(clientProfileForAudit),
          }),
          auditRequestContext,
        );

        if (ownerMode === AdminClientOwnerMode.CREATE && dto.owner && passwordHash) {
          await this.createOwnerForClient(
            tx,
            currentUser,
            clientProfile.id,
            dto.owner,
            passwordHash,
            auditRequestContext,
          );
        }

        if (ownerMode === AdminClientOwnerMode.LINK_EXISTING && dto.owner?.userId) {
          await this.linkExistingOwnerToClient(
            tx,
            currentUser,
            clientProfile.id,
            dto.owner.userId,
            auditRequestContext,
          );
        }

        return this.getClientProfileOrFail(clientProfile.id, tx);
      });

      return this.toAdminClientResponse(createdClient);
    } catch (error) {
      this.throwKnownCreateOrUpdateError(error);
      throw error;
    }
  }

  async updateAdminClient(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: UpdateAdminClientDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);
    this.assertValidPurchasedServicesPayload(dto.purchasedServices);
    this.assertHasUpdatePayload(dto);
    const clientName = this.resolveUpdateClientName(dto);

    const existingClient = await this.getClientProfileOrFail(clientProfileId);

    try {
      const updatedClient = await this.prisma.$transaction(async (tx) => {
        if (this.hasClientProfileFieldUpdate(dto)) {
          await tx.clientProfile.update({
            where: { id: clientProfileId },
            data: {
              ...(clientName !== undefined ? { companyName: clientName } : {}),
              ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
              ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
              ...(dto.status !== undefined ? { status: dto.status } : {}),
            },
            select: { id: true },
          });
        }

        if (dto.purchasedServices !== undefined) {
          await this.replacePurchasedServices(tx, clientProfileId, dto.purchasedServices);
        }

        if (dto.googleAdsConfig !== undefined) {
          await this.upsertGoogleAdsConfig(tx, clientProfileId, dto.googleAdsConfig);
        }

        const clientProfile = await this.getClientProfileOrFail(clientProfileId, tx);

        await this.recordAdminClientAudit(
          tx,
          currentUser,
          ADMIN_CLIENT_AUDIT_ACTIONS.updated,
          clientProfile.id,
          this.buildAuditMetadata({
            actorUserId: currentUser.id,
            targetClientProfileId: clientProfile.id,
            changedFields: this.getUpdatedClientChangedFields(existingClient, clientProfile),
            previousState: this.toClientAuditState(existingClient),
            nextState: this.toClientAuditState(clientProfile),
          }),
          auditRequestContext,
        );

        return clientProfile;
      });

      return this.toAdminClientResponse(updatedClient);
    } catch (error) {
      this.throwKnownCreateOrUpdateError(error);
      throw error;
    }
  }

  async deactivateAdminClient(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);

    const existingClient = await this.getClientProfileOrFail(clientProfileId);
    if (existingClient.status === ClientStatus.INACTIVE) {
      return this.toAdminClientResponse(existingClient);
    }

    const deactivatedClient = await this.updateClientStatusWithAudit(
      currentUser,
      existingClient,
      ClientStatus.INACTIVE,
      ADMIN_CLIENT_AUDIT_ACTIONS.deactivated,
      auditRequestContext,
    );

    return this.toAdminClientResponse(deactivatedClient);
  }

  async activateAdminClient(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);

    const existingClient = await this.getClientProfileOrFail(clientProfileId);
    if (existingClient.status === ClientStatus.ACTIVE) {
      return this.toAdminClientResponse(existingClient);
    }

    const activatedClient = await this.updateClientStatusWithAudit(
      currentUser,
      existingClient,
      ClientStatus.ACTIVE,
      ADMIN_CLIENT_AUDIT_ACTIONS.activated,
      auditRequestContext,
    );

    return this.toAdminClientResponse(activatedClient);
  }

  async setAdminClientOwner(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: AdminClientOwnerDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);
    this.assertValidSetOwnerPayload(dto);

    const passwordHash =
      dto.mode === AdminClientOwnerMode.CREATE && dto.password
        ? await this.authService.hashUserPassword(dto.password)
        : null;

    try {
      const updatedClient = await this.prisma.$transaction(async (tx) => {
        await this.getClientProfileOrFail(clientProfileId, tx);
        await this.assertClientHasNoOwner(clientProfileId, tx);

        if (dto.mode === AdminClientOwnerMode.CREATE && passwordHash) {
          await this.createOwnerForClient(
            tx,
            currentUser,
            clientProfileId,
            dto,
            passwordHash,
            auditRequestContext,
          );
        }

        if (dto.mode === AdminClientOwnerMode.LINK_EXISTING && dto.userId) {
          await this.linkExistingOwnerToClient(
            tx,
            currentUser,
            clientProfileId,
            dto.userId,
            auditRequestContext,
          );
        }

        return this.getClientProfileOrFail(clientProfileId, tx);
      });

      return this.toAdminClientResponse(updatedClient);
    } catch (error) {
      this.throwKnownCreateOrUpdateError(error);
      throw error;
    }
  }

  async resetClientOwnerPassword(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: ResetClientOwnerPasswordDto,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientResponse> {
    this.assertCanManageClients(currentUser);
    const client = await this.getClientProfileOrFail(clientProfileId);
    const owner = client.users[0] ?? null;
    if (!owner) {
      throw new BadRequestException("Client owner user not found.");
    }

    const passwordHash = await this.authService.hashUserPassword(dto.newPassword);

    const sessionInvalidatedAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: owner.id },
        data: {
          passwordHash,
          sessionInvalidatedAt,
        },
        select: { id: true },
      });

      await tx.refreshToken.updateMany({
        where: { userId: owner.id, revokedAt: null },
        data: { revokedAt: sessionInvalidatedAt },
      });

      await this.recordAdminClientAudit(
        tx,
        currentUser,
        ADMIN_CLIENT_AUDIT_ACTIONS.ownerPasswordReset,
        client.id,
        this.buildAuditMetadata({
          actorUserId: currentUser.id,
          targetClientProfileId: client.id,
          ownerUserId: owner.id,
          changedFields: ["ownerCredentials"],
        }),
        auditRequestContext,
      );
    });

    const updatedClient = await this.getClientProfileOrFail(clientProfileId);
    return this.toAdminClientResponse(updatedClient);
  }

  private async createOwnerForClient(
    tx: Prisma.TransactionClient,
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: AdminClientOwnerDto,
    passwordHash: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<ClientOwnerReadModel> {
    if (!dto.email || !dto.displayName) {
      throw new BadRequestException("Owner email, displayName, and password are required.");
    }

    const owner = await tx.user.create({
      data: {
        email: dto.email,
        displayName: dto.displayName,
        passwordHash,
        accountType: AccountType.CLIENT,
        role: UserRole.CLIENT_OWNER,
        status: UserStatus.ACTIVE,
        clientProfileId,
      },
      select: clientOwnerSummarySelect,
    });

    await this.recordOwnerAudit(
      tx,
      currentUser,
      ADMIN_CLIENT_AUDIT_ACTIONS.ownerCreated,
      clientProfileId,
      owner.id,
      auditRequestContext,
    );

    return owner;
  }

  private async linkExistingOwnerToClient(
    tx: Prisma.TransactionClient,
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    ownerUserId: string,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<ClientOwnerReadModel> {
    const user = await tx.user.findUnique({
      where: { id: ownerUserId },
      select: clientOwnerSummarySelect,
    });

    if (!user) {
      throw new BadRequestException("Client owner user not found.");
    }

    if (user.accountType !== AccountType.CLIENT) {
      throw new BadRequestException("Owner user must be a CLIENT account.");
    }

    if (user.clientProfileId !== null && user.clientProfileId !== clientProfileId) {
      throw new ConflictException("Owner user is already linked to another client profile.");
    }

    const sessionInvalidatedAt = new Date();
    const updateResult = await tx.user.updateMany({
      where: {
        id: ownerUserId,
        accountType: AccountType.CLIENT,
        OR: [{ clientProfileId: null }, { clientProfileId }],
      },
      data: {
        clientProfileId,
        role: UserRole.CLIENT_OWNER,
        sessionInvalidatedAt,
      },
    });

    if (updateResult.count !== 1) {
      throw new ConflictException("Owner user is already linked to another client profile.");
    }

    await tx.refreshToken.updateMany({
      where: {
        userId: ownerUserId,
        revokedAt: null,
      },
      data: { revokedAt: sessionInvalidatedAt },
    });

    const owner = await tx.user.findUnique({
      where: { id: ownerUserId },
      select: clientOwnerSummarySelect,
    });

    if (!owner) {
      throw new BadRequestException("Client owner user not found.");
    }

    await this.recordOwnerAudit(
      tx,
      currentUser,
      ADMIN_CLIENT_AUDIT_ACTIONS.ownerLinked,
      clientProfileId,
      owner.id,
      auditRequestContext,
    );

    return owner;
  }

  private async updateClientStatusWithAudit(
    currentUser: AuthenticatedUser,
    existingClient: AdminClientReadModel,
    status: ClientStatus,
    action: AdminClientAuditAction,
    auditRequestContext?: AuditLogRequestContext,
  ): Promise<AdminClientReadModel> {
    return this.prisma.$transaction(async (tx) => {
      const clientProfile = await tx.clientProfile.update({
        where: { id: existingClient.id },
        data: { status },
        select: adminClientReadSelect,
      });

      await this.recordAdminClientAudit(
        tx,
        currentUser,
        action,
        clientProfile.id,
        this.buildAuditMetadata({
          actorUserId: currentUser.id,
          targetClientProfileId: clientProfile.id,
          changedFields: existingClient.status === clientProfile.status ? [] : ["status"],
          previousState: this.toClientAuditState(existingClient),
          nextState: this.toClientAuditState(clientProfile),
        }),
        auditRequestContext,
      );

      return clientProfile;
    });
  }

  private async getClientProfileOrFail(
    clientProfileId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AdminClientReadModel> {
    const client = await (tx ?? this.prisma).clientProfile.findUnique({
      where: { id: clientProfileId },
      select: adminClientReadSelect,
    });

    if (!client) {
      throw new NotFoundException("Client profile not found.");
    }

    return client;
  }

  private async assertClientHasNoOwner(
    clientProfileId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const existingOwner = await tx.user.findFirst({
      where: {
        clientProfileId,
        accountType: AccountType.CLIENT,
        role: UserRole.CLIENT_OWNER,
      },
      select: { id: true },
    });

    if (existingOwner) {
      throw new ConflictException("Client profile already has an owner.");
    }
  }

  private async replacePurchasedServices(
    tx: Prisma.TransactionClient,
    clientProfileId: string,
    purchasedServices: AdminClientPurchasedServiceDto[],
  ): Promise<void> {
    const serviceKeys = purchasedServices.map((service) => service.serviceKey);

    await tx.clientPurchasedService.deleteMany({
      where: {
        clientProfileId,
        serviceKey: { notIn: serviceKeys },
      },
    });

    for (const service of purchasedServices) {
      await tx.clientPurchasedService.upsert({
        where: {
          clientProfileId_serviceKey: {
            clientProfileId,
            serviceKey: service.serviceKey,
          },
        },
        update: {
          status: service.status ?? PurchasedServiceStatus.ACTIVE,
          startedAt: this.parseNullableDate(service.startedAt),
          endedAt: this.parseNullableDate(service.endedAt),
        },
        create: {
          clientProfileId,
          serviceKey: service.serviceKey,
          status: service.status ?? PurchasedServiceStatus.ACTIVE,
          startedAt: this.parseNullableDate(service.startedAt),
          endedAt: this.parseNullableDate(service.endedAt),
        },
      });
    }
  }

  private async upsertGoogleAdsConfig(
    tx: Prisma.TransactionClient,
    clientProfileId: string,
    googleAdsConfig: AdminClientGoogleAdsConfigDto,
  ): Promise<void> {
    const patchData = this.buildGoogleAdsConfigPatchData(googleAdsConfig);

    await tx.clientGoogleAdsConfig.upsert({
      where: { clientProfileId },
      update: patchData,
      create: {
        clientProfileId,
        ...patchData,
      },
    });
  }

  private buildGoogleAdsConfigPatchData(
    googleAdsConfig: AdminClientGoogleAdsConfigDto,
  ): AdminClientGoogleAdsConfigPatchData {
    const patchData: AdminClientGoogleAdsConfigPatchData = {};

    if (googleAdsConfig.customerId !== undefined) {
      patchData.customerId = googleAdsConfig.customerId;
    }
    if (googleAdsConfig.managerCustomerId !== undefined) {
      patchData.managerCustomerId = googleAdsConfig.managerCustomerId;
    }
    if (googleAdsConfig.descriptiveName !== undefined) {
      patchData.descriptiveName = googleAdsConfig.descriptiveName;
    }
    if (googleAdsConfig.currencyCode !== undefined) {
      patchData.currencyCode = googleAdsConfig.currencyCode;
    }
    if (googleAdsConfig.timeZone !== undefined) {
      patchData.timeZone = googleAdsConfig.timeZone;
    }
    if (googleAdsConfig.connectionStatus !== undefined) {
      patchData.connectionStatus = googleAdsConfig.connectionStatus;
    }

    return patchData;
  }

  private async recordOwnerAudit(
    tx: Prisma.TransactionClient,
    currentUser: AuthenticatedUser,
    action: AdminClientAuditAction,
    targetClientProfileId: string,
    ownerUserId: string,
    requestContext?: AuditLogRequestContext,
  ): Promise<void> {
    await this.recordAdminClientAudit(
      tx,
      currentUser,
      action,
      targetClientProfileId,
      this.buildAuditMetadata({
        actorUserId: currentUser.id,
        targetClientProfileId,
        ownerUserId,
        changedFields: ["ownerUserId"],
        previousState: { ownerUserId: null },
        nextState: { ownerUserId },
      }),
      requestContext,
    );
  }

  private async recordAdminClientAudit(
    tx: Prisma.TransactionClient,
    currentUser: AuthenticatedUser,
    action: AdminClientAuditAction,
    targetClientProfileId: string,
    metadata: Prisma.InputJsonObject,
    requestContext?: AuditLogRequestContext,
  ): Promise<void> {
    await this.auditLogService.record(
      {
        actorUserId: currentUser.id,
        action,
        entityType: ADMIN_CLIENT_AUDIT_ENTITY_TYPE,
        entityId: targetClientProfileId,
        metadata,
        requestContext,
      },
      tx,
    );
  }

  private buildAuditMetadata(options: ClientAuditMetadataOptions): Prisma.InputJsonObject {
    return {
      actorUserId: options.actorUserId,
      targetClientProfileId: options.targetClientProfileId,
      changedFields: options.changedFields,
      ...(options.ownerUserId !== undefined ? { ownerUserId: options.ownerUserId } : {}),
      ...(options.previousState !== undefined ? { previousState: options.previousState } : {}),
      ...(options.nextState !== undefined ? { nextState: options.nextState } : {}),
    } satisfies Prisma.InputJsonObject;
  }

  private toClientAuditState(client: AdminClientReadModel): Prisma.InputJsonObject {
    return {
      id: client.id,
      slug: client.slug,
      name: client.companyName,
      companyName: client.companyName,
      contactEmail: client.contactEmail,
      status: client.status,
      purchasedServices: this.toPurchasedServicesAuditState(client.purchasedServices),
      googleAdsConfig: this.toGoogleAdsConfigAuditState(client.googleAdsConfig),
    } satisfies Prisma.InputJsonObject;
  }

  private toPurchasedServicesAuditState(
    purchasedServices: AdminClientReadModel["purchasedServices"],
  ): Prisma.InputJsonArray {
    return purchasedServices.map((service) => ({
      serviceKey: service.serviceKey,
      status: service.status,
      startedAt: service.startedAt?.toISOString() ?? null,
      endedAt: service.endedAt?.toISOString() ?? null,
    }));
  }

  private toGoogleAdsConfigAuditState(
    googleAdsConfig: AdminClientReadModel["googleAdsConfig"],
  ): Prisma.InputJsonObject | null {
    if (!googleAdsConfig) {
      return null;
    }

    return {
      customerId: googleAdsConfig.customerId,
      managerCustomerId: googleAdsConfig.managerCustomerId,
      descriptiveName: googleAdsConfig.descriptiveName,
      currencyCode: googleAdsConfig.currencyCode,
      timeZone: googleAdsConfig.timeZone,
      connectionStatus: googleAdsConfig.connectionStatus,
      lastSyncAt: googleAdsConfig.lastSyncAt?.toISOString() ?? null,
      syncError: googleAdsConfig.syncError,
    } satisfies Prisma.InputJsonObject;
  }

  private getCreatedClientChangedFields(client: AdminClientReadModel): string[] {
    return [
      "slug",
      "name",
      "companyName",
      ...(client.contactEmail === null ? [] : ["contactEmail"]),
      "status",
      ...(client.purchasedServices.length === 0 ? [] : ["purchasedServices"]),
      ...(client.googleAdsConfig === null ? [] : ["googleAdsConfig"]),
    ];
  }

  private getUpdatedClientChangedFields(
    previousClient: AdminClientReadModel,
    updatedClient: AdminClientReadModel,
  ): string[] {
    const changedFields: string[] = [];

    if (previousClient.slug !== updatedClient.slug) {
      changedFields.push("slug");
    }

    if (previousClient.companyName !== updatedClient.companyName) {
      changedFields.push("name");
      changedFields.push("companyName");
    }

    if (previousClient.contactEmail !== updatedClient.contactEmail) {
      changedFields.push("contactEmail");
    }

    if (previousClient.status !== updatedClient.status) {
      changedFields.push("status");
    }

    if (!this.arePurchasedServicesEqual(previousClient, updatedClient)) {
      changedFields.push("purchasedServices");
    }

    if (!this.areGoogleAdsConfigEqual(previousClient, updatedClient)) {
      changedFields.push("googleAdsConfig");
    }

    return changedFields;
  }

  private arePurchasedServicesEqual(
    previousClient: AdminClientReadModel,
    updatedClient: AdminClientReadModel,
  ): boolean {
    return (
      JSON.stringify(this.toPurchasedServicesAuditState(previousClient.purchasedServices)) ===
      JSON.stringify(this.toPurchasedServicesAuditState(updatedClient.purchasedServices))
    );
  }

  private areGoogleAdsConfigEqual(
    previousClient: AdminClientReadModel,
    updatedClient: AdminClientReadModel,
  ): boolean {
    return (
      JSON.stringify(this.toGoogleAdsConfigAuditState(previousClient.googleAdsConfig)) ===
      JSON.stringify(this.toGoogleAdsConfigAuditState(updatedClient.googleAdsConfig))
    );
  }

  private assertCanManageClients(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can manage clients.");
    }

    if (!currentUser.permissions.includes(CLIENTS_MANAGE_PERMISSION)) {
      throw new ForbiddenException(`Missing required permission: ${CLIENTS_MANAGE_PERMISSION}.`);
    }
  }

  private assertHasUpdatePayload(dto: UpdateAdminClientDto): void {
    if (
      dto.name === undefined &&
      dto.companyName === undefined &&
      dto.slug === undefined &&
      dto.contactEmail === undefined &&
      dto.status === undefined &&
      dto.purchasedServices === undefined &&
      dto.googleAdsConfig === undefined
    ) {
      throw new BadRequestException(
        "Provide name, slug, contactEmail, status, purchasedServices, and/or googleAdsConfig to update a client.",
      );
    }
  }

  private hasClientProfileFieldUpdate(dto: UpdateAdminClientDto): boolean {
    return (
      dto.name !== undefined ||
      dto.companyName !== undefined ||
      dto.slug !== undefined ||
      dto.contactEmail !== undefined ||
      dto.status !== undefined
    );
  }

  private assertValidPurchasedServicesPayload(
    purchasedServices?: AdminClientPurchasedServiceDto[],
  ): void {
    if (purchasedServices === undefined) {
      return;
    }

    if (purchasedServices.length === 0) {
      throw new BadRequestException("purchasedServices must include at least one service.");
    }

    const seenServiceKeys = new Set<PurchasedServiceKey>();
    for (const service of purchasedServices) {
      if (seenServiceKeys.has(service.serviceKey)) {
        throw new BadRequestException("purchasedServices cannot include duplicate serviceKey values.");
      }

      const startedAt = this.parseNullableDate(service.startedAt);
      const endedAt = this.parseNullableDate(service.endedAt);
      if (startedAt && endedAt && startedAt.getTime() > endedAt.getTime()) {
        throw new BadRequestException("purchasedServices endedAt cannot be earlier than startedAt.");
      }

      seenServiceKeys.add(service.serviceKey);
    }
  }

  private toPurchasedServiceCreateInputs(
    purchasedServices?: AdminClientPurchasedServiceDto[],
  ): Prisma.ClientPurchasedServiceCreateWithoutClientProfileInput[] {
    if (!purchasedServices) {
      return [];
    }

    return purchasedServices.map((service) => ({
      serviceKey: service.serviceKey,
      status: service.status ?? PurchasedServiceStatus.ACTIVE,
      startedAt: this.parseNullableDate(service.startedAt),
      endedAt: this.parseNullableDate(service.endedAt),
    }));
  }

  private assertValidCreateOwnerPayload(owner?: AdminClientOwnerDto): void {
    const mode = owner?.mode ?? AdminClientOwnerMode.NONE;
    if (mode === AdminClientOwnerMode.NONE) {
      this.assertNoUnusedOwnerFields(owner);
      return;
    }

    this.assertCreateOrLinkOwnerPayload(owner);
  }

  private assertValidSetOwnerPayload(owner: AdminClientOwnerDto): void {
    if (owner.mode === AdminClientOwnerMode.NONE) {
      throw new BadRequestException("Use CREATE or LINK_EXISTING when assigning a client owner.");
    }

    this.assertCreateOrLinkOwnerPayload(owner);
  }

  private assertCreateOrLinkOwnerPayload(owner?: AdminClientOwnerDto): void {
    if (!owner) {
      throw new BadRequestException("Owner payload is required.");
    }

    if (owner.mode === AdminClientOwnerMode.CREATE) {
      if (owner.userId !== undefined) {
        throw new BadRequestException("CREATE owner mode cannot include userId.");
      }
      return;
    }

    if (
      owner.email !== undefined ||
      owner.displayName !== undefined ||
      owner.password !== undefined
    ) {
      throw new BadRequestException(
        "LINK_EXISTING owner mode cannot include email, displayName, or password.",
      );
    }
  }

  private assertNoUnusedOwnerFields(owner?: AdminClientOwnerDto): void {
    if (!owner) {
      return;
    }

    if (
      owner.email !== undefined ||
      owner.displayName !== undefined ||
      owner.password !== undefined ||
      owner.userId !== undefined
    ) {
      throw new BadRequestException("Owner details require CREATE or LINK_EXISTING mode.");
    }
  }

  private buildSlugFromClientName(name: string): string {
    const slug = name
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80)
      .replace(/-+$/g, "");

    if (slug.length === 0) {
      throw new BadRequestException("Unable to generate a valid slug from name.");
    }

    return slug;
  }

  private throwKnownCreateOrUpdateError(error: unknown): void {
    if (!this.isUniqueConstraintError(error)) {
      return;
    }

    const target = error.meta?.target;
    if (Array.isArray(target) && target.every((item): item is string => typeof item === "string")) {
      if (target.includes("slug")) {
        throw new ConflictException("Client slug is already in use.");
      }

      if (target.includes("email")) {
        throw new ConflictException("Owner email is already in use.");
      }

      if (target.includes("serviceKey")) {
        throw new ConflictException("Client purchased service is already configured.");
      }
    }

    throw new ConflictException("Client or owner unique value is already in use.");
  }

  private isUniqueConstraintError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
    );
  }

  private toAdminClientResponse(client: AdminClientReadModel): AdminClientResponse {
    const owner = client.users[0] ?? null;

    return {
      id: client.id,
      slug: client.slug,
      name: client.companyName,
      companyName: client.companyName,
      contactEmail: client.contactEmail,
      status: client.status,
      isActive: client.status === ClientStatus.ACTIVE,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      owner: owner ? this.toOwnerResponse(owner) : null,
      purchasedServices: client.purchasedServices.map((service) =>
        this.toPurchasedServiceResponse(service),
      ),
      googleAdsConfig: this.toGoogleAdsConfigResponse(client.googleAdsConfig),
    };
  }

  private resolveCreateClientName(dto: CreateAdminClientDto): string {
    const candidate = dto.name ?? dto.companyName;
    if (!candidate) {
      throw new BadRequestException("Client name is required.");
    }

    const normalized = candidate.trim();
    if (normalized.length < 2) {
      throw new BadRequestException("Client name must be at least 2 characters.");
    }

    return normalized;
  }

  private resolveUpdateClientName(dto: UpdateAdminClientDto): string | undefined {
    const candidate = dto.name ?? dto.companyName;
    if (candidate === undefined) {
      return undefined;
    }

    const normalized = candidate.trim();
    if (normalized.length < 2) {
      throw new BadRequestException("Client name must be at least 2 characters.");
    }

    return normalized;
  }

  private parseNullableDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  private toOwnerResponse(owner: ClientOwnerReadModel): AdminClientOwnerResponse {
    return {
      id: owner.id,
      email: owner.email,
      displayName: owner.displayName,
      accountType: owner.accountType,
      role: owner.role,
      status: owner.status,
      clientProfileId: owner.clientProfileId,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
    };
  }

  private toPurchasedServiceResponse(
    purchasedService: PurchasedServiceReadModel,
  ): AdminClientPurchasedServiceResponse {
    return {
      id: purchasedService.id,
      serviceKey: purchasedService.serviceKey,
      status: purchasedService.status,
      startedAt: purchasedService.startedAt,
      endedAt: purchasedService.endedAt,
      createdAt: purchasedService.createdAt,
      updatedAt: purchasedService.updatedAt,
    };
  }

  private toGoogleAdsConfigResponse(
    googleAdsConfig: GoogleAdsConfigReadModel | null,
  ): AdminClientGoogleAdsConfigResponse | null {
    if (!googleAdsConfig) {
      return null;
    }

    return {
      customerId: googleAdsConfig.customerId,
      managerCustomerId: googleAdsConfig.managerCustomerId,
      descriptiveName: googleAdsConfig.descriptiveName,
      currencyCode: googleAdsConfig.currencyCode,
      timeZone: googleAdsConfig.timeZone,
      connectionStatus: googleAdsConfig.connectionStatus,
      lastSyncAt: googleAdsConfig.lastSyncAt,
      syncError: googleAdsConfig.syncError,
    };
  }
}
