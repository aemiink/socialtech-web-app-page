import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  MetaAdsConnectionStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";

const META_ADS_CONFIG_READ_ANY_PERMISSION = "metaAds.config.read.any";
const META_ADS_CONFIG_MANAGE_ANY_PERMISSION = "metaAds.config.manage.any";
const META_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "metaAds.config.read.assigned";
const META_ADS_CONFIG_READ_OWN_PERMISSION = "metaAds.config.read.own";

const adminMetaAdsConfigSelect = {
  businessId: true,
  adAccountId: true,
  pixelId: true,
  instagramAccountId: true,
  facebookPageId: true,
  currency: true,
  timezone: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
} satisfies Prisma.ClientMetaAdsConfigSelect;

const clientMetaAdsConfigSelect = {
  connectionStatus: true,
  lastSyncAt: true,
} satisfies Prisma.ClientMetaAdsConfigSelect;

type AdminMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof adminMetaAdsConfigSelect;
}>;

type ClientMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof clientMetaAdsConfigSelect;
}>;

type MetaAdsConfigPatchData = {
  businessId?: string | null;
  adAccountId?: string | null;
  pixelId?: string | null;
  instagramAccountId?: string | null;
  facebookPageId?: string | null;
  currency?: string | null;
  timezone?: string | null;
  connectionStatus?: MetaAdsConnectionStatus;
  lastSyncAt?: Date | null;
  syncError?: string | null;
};

type AdminMetaAdsConfigSummaryResponse = {
  clientProfileId: string;
  connectionStatus: MetaAdsConnectionStatus;
  ids: {
    businessId: string | null;
    adAccountId: string | null;
    pixelId: string | null;
    instagramAccountId: string | null;
    facebookPageId: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: Date | null;
  syncError: string | null;
};

type OwnClientMetaAdsConfigSummaryResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: Date | null;
};

@Injectable()
export class MetaAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminMetaAdsConfigSummaryResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    const config = await this.prisma.clientMetaAdsConfig.findUnique({
      where: { clientProfileId },
      select: adminMetaAdsConfigSelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async updateAdminClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: UpdateMetaAdsConfigDto,
  ): Promise<AdminMetaAdsConfigSummaryResponse> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertHasUpdatePayload(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    const patchData = this.buildConfigPatchData(dto);
    const config = await this.prisma.clientMetaAdsConfig.upsert({
      where: { clientProfileId },
      update: patchData,
      create: {
        clientProfileId,
        ...patchData,
      },
      select: adminMetaAdsConfigSelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async getAssignedClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminMetaAdsConfigSummaryResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);

    const config = await this.prisma.clientMetaAdsConfig.findUnique({
      where: { clientProfileId },
      select: adminMetaAdsConfigSelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async getOwnClientConfig(
    currentUser: AuthenticatedUser,
  ): Promise<OwnClientMetaAdsConfigSummaryResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    const config = await this.prisma.clientMetaAdsConfig.findUnique({
      where: { clientProfileId },
      select: clientMetaAdsConfigSelect,
    });

    return this.toOwnClientConfigSummary(config);
  }

  private buildConfigPatchData(dto: UpdateMetaAdsConfigDto): MetaAdsConfigPatchData {
    const patchData: MetaAdsConfigPatchData = {};

    if (dto.businessId !== undefined) {
      patchData.businessId = dto.businessId;
    }
    if (dto.adAccountId !== undefined) {
      patchData.adAccountId = dto.adAccountId;
    }
    if (dto.pixelId !== undefined) {
      patchData.pixelId = dto.pixelId;
    }
    if (dto.instagramAccountId !== undefined) {
      patchData.instagramAccountId = dto.instagramAccountId;
    }
    if (dto.facebookPageId !== undefined) {
      patchData.facebookPageId = dto.facebookPageId;
    }
    if (dto.currency !== undefined) {
      patchData.currency = dto.currency;
    }
    if (dto.timezone !== undefined) {
      patchData.timezone = dto.timezone;
    }
    if (dto.connectionStatus !== undefined) {
      patchData.connectionStatus = dto.connectionStatus;
    }
    if (dto.lastSyncAt !== undefined) {
      patchData.lastSyncAt = this.parseNullableDate(dto.lastSyncAt);
    }
    if (dto.syncError !== undefined) {
      patchData.syncError = dto.syncError;
    }

    return patchData;
  }

  private assertHasUpdatePayload(dto: UpdateMetaAdsConfigDto): void {
    if (
      dto.businessId === undefined &&
      dto.adAccountId === undefined &&
      dto.pixelId === undefined &&
      dto.instagramAccountId === undefined &&
      dto.facebookPageId === undefined &&
      dto.currency === undefined &&
      dto.timezone === undefined &&
      dto.connectionStatus === undefined &&
      dto.lastSyncAt === undefined &&
      dto.syncError === undefined
    ) {
      throw new BadRequestException(
        "Provide at least one config field to update Meta Ads configuration.",
      );
    }
  }

  private async assertClientProfileExists(clientProfileId: string): Promise<void> {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { id: true },
    });

    if (!clientProfile) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private async assertClientHasActiveMetaAdsService(clientProfileId: string): Promise<void> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.META_ADS,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!activeService) {
      throw new BadRequestException(
        "Client must have an ACTIVE META_ADS purchased service to update Meta Ads config.",
      );
    }
  }

  private toAdminConfigSummary(
    clientProfileId: string,
    config: AdminMetaAdsConfigModel | null,
  ): AdminMetaAdsConfigSummaryResponse {
    return {
      clientProfileId,
      connectionStatus: config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED,
      ids: {
        businessId: config?.businessId ?? null,
        adAccountId: config?.adAccountId ?? null,
        pixelId: config?.pixelId ?? null,
        instagramAccountId: config?.instagramAccountId ?? null,
        facebookPageId: config?.facebookPageId ?? null,
      },
      settings: {
        currency: config?.currency ?? null,
        timezone: config?.timezone ?? null,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
      syncError: config?.syncError ?? null,
    };
  }

  private toOwnClientConfigSummary(
    config: ClientMetaAdsConfigModel | null,
  ): OwnClientMetaAdsConfigSummaryResponse {
    return {
      connectionStatus: config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED,
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private assertCanReadAnyConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can read Meta Ads config for any client.");
    }

    this.assertHasPermission(currentUser, META_ADS_CONFIG_READ_ANY_PERMISSION);
  }

  private assertCanReadAssignedConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException(
        "Only employee accounts can read assigned client Meta Ads configurations.",
      );
    }

    this.assertHasPermission(currentUser, META_ADS_CONFIG_READ_ASSIGNED_PERMISSION);
  }

  private assertCanManageAnyConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can update Meta Ads config.");
    }

    this.assertHasPermission(currentUser, META_ADS_CONFIG_MANAGE_ANY_PERMISSION);
  }

  private assertCanReadOwnConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Only client accounts can access /clients/me/meta-ads/config.");
    }

    this.assertHasPermission(currentUser, META_ADS_CONFIG_READ_OWN_PERMISSION);
  }

  private getClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client account is not linked to a client profile.");
    }

    return currentUser.clientProfileId;
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (!currentUser.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private async assertAssignedClientProfileOrFail(
    employeeUserId: string,
    clientProfileId: string,
  ): Promise<void> {
    const assignedClient = await this.prisma.clientProfile.findFirst({
      where: {
        id: clientProfileId,
        employeeAssignments: {
          some: {
            employeeUserId,
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (!assignedClient) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private parseNullableDate(value: string | null): Date | null {
    if (value === null) {
      return null;
    }

    return new Date(value);
  }
}
