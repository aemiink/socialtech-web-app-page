import {
  AccountType,
  MetaAdsConnectionStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
} from "@prisma/client";
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { ConnectManualMetaAdsDto } from "./dto/connect-manual-meta-ads.dto";
import { TestMetaAdsConnectionDto } from "./dto/test-meta-ads-connection.dto";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";
import {
  MetaAdsApiService,
  MetaAdsConnectionTestResult,
  NormalizedMetaAdsApiError,
} from "./meta-ads-api.service";
import { MetaAdsTokenService } from "./meta-ads-token.service";

const META_ADS_CONFIG_READ_ANY_PERMISSION = "metaAds.config.read.any";
const META_ADS_CONFIG_MANAGE_ANY_PERMISSION = "metaAds.config.manage.any";
const META_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "metaAds.config.read.assigned";
const META_ADS_CONFIG_READ_OWN_PERMISSION = "metaAds.config.read.own";
const DEFAULT_META_ADS_REQUIRED_SCOPES = ["ads_read"] as const;

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

const metaAdsCredentialSummarySelect = {
  accessTokenEnc: true,
  tokenHash: true,
  tokenExpiresAt: true,
  grantedScopes: true,
  updatedAt: true,
} satisfies Prisma.ClientMetaAdsCredentialSelect;

type AdminMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof adminMetaAdsConfigSelect;
}>;

type ClientMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof clientMetaAdsConfigSelect;
}>;

type MetaAdsCredentialSummaryModel = Prisma.ClientMetaAdsCredentialGetPayload<{
  select: typeof metaAdsCredentialSummarySelect;
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

type AdminMetaAdsConnectionResponse = AdminMetaAdsConfigSummaryResponse & {
  hasActiveService: boolean;
  credential: {
    hasToken: boolean;
    tokenLastUpdatedAt: Date | null;
    tokenExpiresAt: Date | null;
    grantedScopes: string[];
  };
};

type OwnClientMetaAdsConfigSummaryResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: Date | null;
};

type AdminMetaAdsConnectionTestResponse = {
  success: true;
  checkedAt: Date;
  connection: AdminMetaAdsConnectionResponse;
  account: {
    adAccountId: string;
    currency: string | null;
    timezone: string | null;
  };
  grantedScopes: string[];
};

@Injectable()
export class MetaAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaAdsTokenService: MetaAdsTokenService,
    private readonly metaAdsApiService: MetaAdsApiService,
  ) {}

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

  async getAdminClientConnection(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminMetaAdsConnectionResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    return this.getConnectionSummaryByClientProfileId(clientProfileId);
  }

  async updateAdminClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: UpdateMetaAdsConfigDto,
  ): Promise<AdminMetaAdsConfigSummaryResponse> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertHasConfigUpdatePayload(dto);
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

  async connectAdminClientManual(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: ConnectManualMetaAdsDto,
  ): Promise<AdminMetaAdsConnectionResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    const encryptedToken = this.metaAdsTokenService.encrypt(dto.accessToken);
    const tokenHash = this.metaAdsTokenService.hash(dto.accessToken);
    const normalizedScopes = this.normalizeScopes(dto.grantedScopes);
    const nextTokenExpiresAt = dto.tokenExpiresAt ? new Date(dto.tokenExpiresAt) : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.clientMetaAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          accessTokenEnc: encryptedToken,
          tokenHash,
          tokenExpiresAt: nextTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
        create: {
          clientProfileId,
          accessTokenEnc: encryptedToken,
          tokenHash,
          tokenExpiresAt: nextTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
      });

      const configPatch: MetaAdsConfigPatchData = {
        ...(dto.businessId !== undefined ? { businessId: dto.businessId } : {}),
        ...(dto.adAccountId !== undefined ? { adAccountId: dto.adAccountId } : {}),
        ...(dto.pixelId !== undefined ? { pixelId: dto.pixelId } : {}),
        ...(dto.instagramAccountId !== undefined
          ? { instagramAccountId: dto.instagramAccountId }
          : {}),
        ...(dto.facebookPageId !== undefined ? { facebookPageId: dto.facebookPageId } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        connectionStatus: MetaAdsConnectionStatus.PENDING,
        syncError: null,
      };

      await tx.clientMetaAdsConfig.upsert({
        where: { clientProfileId },
        update: configPatch,
        create: {
          clientProfileId,
          ...configPatch,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientProfileId);
  }

  async disconnectAdminClient(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminMetaAdsConnectionResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientMetaAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          accessTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
        create: {
          clientProfileId,
          accessTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
      });

      await tx.clientMetaAdsConfig.upsert({
        where: { clientProfileId },
        update: {
          connectionStatus: MetaAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
        create: {
          clientProfileId,
          connectionStatus: MetaAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientProfileId);
  }

  async testAdminClientConnection(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: TestMetaAdsConnectionDto,
  ): Promise<AdminMetaAdsConnectionTestResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    const existingConnection = await this.getConnectionSnapshot(clientProfileId);
    const accessToken = this.resolveTokenForConnectionTest(dto.accessToken, existingConnection.credential);
    const adAccountId = this.resolveAdAccountForConnectionTest(dto.adAccountId, existingConnection.config);
    const requiredScopes = this.resolveRequiredScopes(dto.requiredScopes);

    let connectionTestResult: MetaAdsConnectionTestResult;
    try {
      connectionTestResult = await this.metaAdsApiService.testConnection({
        accessToken,
        adAccountId,
        requiredScopes,
      });
    } catch (error) {
      const normalizedError = this.metaAdsApiService.normalizeError(error);
      await this.markConnectionAsError(clientProfileId, normalizedError);
      throw this.toConnectionTestException(normalizedError);
    }

    const checkedAt = new Date();
    const grantedScopes = this.normalizeScopes(connectionTestResult.grantedScopes);
    const shouldRefreshCredential = dto.accessToken !== undefined;

    await this.prisma.$transaction(async (tx) => {
      const credentialUpdateData: Prisma.ClientMetaAdsCredentialUncheckedCreateInput = {
        clientProfileId,
        accessTokenEnc: shouldRefreshCredential
          ? this.metaAdsTokenService.encrypt(accessToken)
          : existingConnection.credential?.accessTokenEnc ?? null,
        tokenHash: shouldRefreshCredential
          ? this.metaAdsTokenService.hash(accessToken)
          : existingConnection.credential?.tokenHash ?? null,
        tokenExpiresAt: existingConnection.credential?.tokenExpiresAt ?? null,
        grantedScopes,
      };

      await tx.clientMetaAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          accessTokenEnc: credentialUpdateData.accessTokenEnc,
          tokenHash: credentialUpdateData.tokenHash,
          tokenExpiresAt: credentialUpdateData.tokenExpiresAt,
          grantedScopes: credentialUpdateData.grantedScopes,
        },
        create: credentialUpdateData,
      });

      await tx.clientMetaAdsConfig.upsert({
        where: { clientProfileId },
        update: {
          adAccountId: connectionTestResult.adAccountId,
          currency: connectionTestResult.currency,
          timezone: connectionTestResult.timezone,
          connectionStatus: MetaAdsConnectionStatus.CONNECTED,
          syncError: null,
          lastSyncAt: checkedAt,
        },
        create: {
          clientProfileId,
          adAccountId: connectionTestResult.adAccountId,
          currency: connectionTestResult.currency,
          timezone: connectionTestResult.timezone,
          connectionStatus: MetaAdsConnectionStatus.CONNECTED,
          syncError: null,
          lastSyncAt: checkedAt,
        },
      });
    });

    const connection = await this.getConnectionSummaryByClientProfileId(clientProfileId);

    return {
      success: true,
      checkedAt,
      connection,
      account: {
        adAccountId: connectionTestResult.adAccountId,
        currency: connectionTestResult.currency,
        timezone: connectionTestResult.timezone,
      },
      grantedScopes,
    };
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

  private assertHasConfigUpdatePayload(dto: UpdateMetaAdsConfigDto): void {
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

  private async getConnectionSummaryByClientProfileId(
    clientProfileId: string,
  ): Promise<AdminMetaAdsConnectionResponse> {
    const snapshot = await this.getConnectionSnapshot(clientProfileId);
    return this.toAdminConnectionSummary(
      clientProfileId,
      snapshot.config,
      snapshot.credential,
      snapshot.hasActiveService,
    );
  }

  private async getConnectionSnapshot(clientProfileId: string): Promise<{
    config: AdminMetaAdsConfigModel | null;
    credential: MetaAdsCredentialSummaryModel | null;
    hasActiveService: boolean;
  }> {
    const [config, credential, serviceCount] = await this.prisma.$transaction([
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
        select: adminMetaAdsConfigSelect,
      }),
      this.prisma.clientMetaAdsCredential.findUnique({
        where: { clientProfileId },
        select: metaAdsCredentialSummarySelect,
      }),
      this.prisma.clientPurchasedService.count({
        where: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.META_ADS,
          status: PurchasedServiceStatus.ACTIVE,
        },
      }),
    ]);

    return {
      config,
      credential,
      hasActiveService: serviceCount > 0,
    };
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
        "Client must have an ACTIVE META_ADS purchased service to manage Meta Ads connection.",
      );
    }
  }

  private async markConnectionAsError(
    clientProfileId: string,
    normalizedError: NormalizedMetaAdsApiError,
  ): Promise<void> {
    await this.prisma.clientMetaAdsConfig.upsert({
      where: { clientProfileId },
      update: {
        connectionStatus: MetaAdsConnectionStatus.ERROR,
        syncError: normalizedError.message,
        lastSyncAt: new Date(),
      },
      create: {
        clientProfileId,
        connectionStatus: MetaAdsConnectionStatus.ERROR,
        syncError: normalizedError.message,
        lastSyncAt: new Date(),
      },
    });
  }

  private toConnectionTestException(normalizedError: NormalizedMetaAdsApiError): Error {
    if (normalizedError.category === "PERMISSION") {
      return new ForbiddenException(normalizedError.message);
    }

    if (normalizedError.category === "AUTH") {
      return new BadRequestException(normalizedError.message);
    }

    return new BadGatewayException(normalizedError.message);
  }

  private resolveTokenForConnectionTest(
    tokenFromRequest: string | undefined,
    credential: MetaAdsCredentialSummaryModel | null,
  ): string {
    if (tokenFromRequest && tokenFromRequest.trim().length > 0) {
      return tokenFromRequest.trim();
    }

    if (!credential?.accessTokenEnc) {
      throw new BadRequestException(
        "Provide accessToken or connect the client manually before testing connection.",
      );
    }

    return this.metaAdsTokenService.decrypt(credential.accessTokenEnc);
  }

  private resolveAdAccountForConnectionTest(
    adAccountIdFromRequest: string | undefined,
    config: AdminMetaAdsConfigModel | null,
  ): string {
    const resolved = adAccountIdFromRequest ?? config?.adAccountId ?? null;
    if (!resolved || resolved.trim().length === 0) {
      throw new BadRequestException(
        "adAccountId is required to test Meta Ads connection. Set it in config or provide in request.",
      );
    }

    return resolved.trim();
  }

  private resolveRequiredScopes(requiredScopes: string[] | undefined): string[] {
    if (!requiredScopes || requiredScopes.length === 0) {
      return [...DEFAULT_META_ADS_REQUIRED_SCOPES];
    }

    return this.normalizeScopes(requiredScopes);
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

  private toAdminConnectionSummary(
    clientProfileId: string,
    config: AdminMetaAdsConfigModel | null,
    credential: MetaAdsCredentialSummaryModel | null,
    hasActiveService: boolean,
  ): AdminMetaAdsConnectionResponse {
    return {
      ...this.toAdminConfigSummary(clientProfileId, config),
      hasActiveService,
      credential: {
        hasToken: Boolean(credential?.tokenHash),
        tokenLastUpdatedAt: credential?.updatedAt ?? null,
        tokenExpiresAt: credential?.tokenExpiresAt ?? null,
        grantedScopes: this.normalizeScopes(credential?.grantedScopes ?? []),
      },
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

  private normalizeScopes(scopes: string[] | undefined): string[] {
    if (!scopes || scopes.length === 0) {
      return [];
    }

    return Array.from(
      new Set(
        scopes
          .map((scope) => scope.trim())
          .filter((scope) => scope.length > 0),
      ),
    );
  }
}
