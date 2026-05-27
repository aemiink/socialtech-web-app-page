import {
  AccountType,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TikTokAdsConnectionStatus,
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
import { ConnectManualTikTokAdsDto } from "./dto/connect-manual-tiktok-ads.dto";
import { TestTikTokAdsConnectionDto } from "./dto/test-tiktok-ads-connection.dto";
import { UpdateTikTokAdsConfigDto } from "./dto/update-tiktok-ads-config.dto";
import {
  NormalizedTikTokAdsApiError,
  TikTokAdsApiService,
  TikTokAdsConnectionTestResult,
} from "./tiktok-ads-api.service";
import { TikTokAdsTokenService } from "./tiktok-ads-token.service";

const TIKTOK_ADS_CONFIG_READ_ANY_PERMISSION = "tiktokAds.config.read.any";
const TIKTOK_ADS_CONFIG_MANAGE_ANY_PERMISSION = "tiktokAds.config.manage.any";
const TIKTOK_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "tiktokAds.config.read.assigned";
const TIKTOK_ADS_CONFIG_READ_OWN_PERMISSION = "tiktokAds.config.read.own";
const DEFAULT_TIKTOK_TOKEN_LIFETIME_DAYS = 365;

const adminTikTokAdsConfigSelect = {
  id: true,
  clientProfileId: true,
  advertiserId: true,
  businessCenterId: true,
  pixelId: true,
  advertiserName: true,
  currency: true,
  timezone: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientTikTokAdsConfigSelect;

const tikTokAdsCredentialSummarySelect = {
  accessTokenEnc: true,
  tokenHash: true,
  tokenExpiresAt: true,
  grantedScopes: true,
  updatedAt: true,
} satisfies Prisma.ClientTikTokAdsCredentialSelect;

type AdminTikTokAdsConfigModel = Prisma.ClientTikTokAdsConfigGetPayload<{
  select: typeof adminTikTokAdsConfigSelect;
}>;

type TikTokAdsCredentialSummaryModel = Prisma.ClientTikTokAdsCredentialGetPayload<{
  select: typeof tikTokAdsCredentialSummarySelect;
}>;

type TikTokAdsConfigPatchData = {
  advertiserId?: string | null;
  businessCenterId?: string | null;
  pixelId?: string | null;
  advertiserName?: string | null;
  currency?: string | null;
  timezone?: string | null;
  connectionStatus?: TikTokAdsConnectionStatus;
  syncError?: string | null;
  lastSyncAt?: Date | null;
};

type AdminTikTokAdsConfigSummaryResponse = {
  clientProfileId: string;
  connectionStatus: TikTokAdsConnectionStatus;
  ids: {
    advertiserId: string | null;
    businessCenterId: string | null;
    pixelId: string | null;
  };
  account: {
    advertiserName: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: Date | null;
  syncError: string | null;
};

type AdminTikTokAdsConnectionResponse = AdminTikTokAdsConfigSummaryResponse & {
  hasActiveService: boolean;
  credential: {
    hasToken: boolean;
    tokenLastUpdatedAt: Date | null;
    tokenExpiresAt: Date | null;
    grantedScopes: string[];
  };
};

type OwnClientTikTokAdsConfigSummaryResponse = {
  connectionStatus: TikTokAdsConnectionStatus;
  hasConfig: boolean;
  advertiserId: string | null;
  lastSyncAt: Date | null;
};

type AdminTikTokAdsConnectionTestResponse = {
  success: true;
  checkedAt: Date;
  connection: AdminTikTokAdsConnectionResponse;
  account: {
    advertiserId: string;
    advertiserName: string | null;
    currency: string | null;
    timezone: string | null;
  };
  grantedScopes: string[];
};

type TikTokAdsConnectionErrorCode =
  | "TOKEN_INVALID"
  | "PERMISSION_MISSING"
  | "RATE_LIMIT"
  | "UNKNOWN_API_ERROR";

type TikTokAdsConnectionErrorInfo = {
  code: TikTokAdsConnectionErrorCode;
  category: NormalizedTikTokAdsApiError["category"];
  adminMessage: string;
};

@Injectable()
export class TikTokAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tikTokAdsTokenService: TikTokAdsTokenService,
    private readonly tikTokAdsApiService: TikTokAdsApiService,
  ) {}

  // ─── Admin endpoints ───────────────────────────────────────────────────────

  async getAdminClientConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    return this.getOrCreateConfig(clientId);
  }

  async getAdminClientConnection(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminTikTokAdsConnectionResponse> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async updateAdminClientConfig(
    clientId: string,
    dto: UpdateTikTokAdsConfigDto,
    actor: AuthenticatedUser,
  ) {
    this.assertCanManageAnyConfig(actor);
    this.assertHasConfigUpdatePayload(dto);
    await this.assertClientExists(clientId);

    const patchData = this.buildConfigPatchData(dto);
    return this.prisma.clientTikTokAdsConfig.upsert({
      where: { clientProfileId: clientId },
      update: patchData,
      create: { clientProfileId: clientId, ...patchData },
    });
  }

  async connectAdminClientManual(
    clientId: string,
    dto: ConnectManualTikTokAdsDto,
    actor: AuthenticatedUser,
  ): Promise<AdminTikTokAdsConnectionResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    const encryptedToken = this.tikTokAdsTokenService.encrypt(dto.accessToken);
    const tokenHash = this.tikTokAdsTokenService.hash(dto.accessToken);
    const normalizedScopes = this.normalizeScopes(dto.grantedScopes);
    const nextTokenExpiresAt = this.resolveTokenExpiresAt(dto.tokenExpiresAt);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientTikTokAdsCredential.upsert({
        where: { clientProfileId: clientId },
        update: {
          accessTokenEnc: encryptedToken,
          tokenHash,
          tokenExpiresAt: nextTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
        create: {
          clientProfileId: clientId,
          accessTokenEnc: encryptedToken,
          tokenHash,
          tokenExpiresAt: nextTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
      });

      const configPatch: TikTokAdsConfigPatchData = {
        advertiserId: dto.advertiserId,
        ...(dto.businessCenterId !== undefined ? { businessCenterId: dto.businessCenterId } : {}),
        ...(dto.pixelId !== undefined ? { pixelId: dto.pixelId } : {}),
        ...(dto.advertiserName !== undefined ? { advertiserName: dto.advertiserName } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        connectionStatus: TikTokAdsConnectionStatus.PENDING,
        syncError: null,
      };

      await tx.clientTikTokAdsConfig.upsert({
        where: { clientProfileId: clientId },
        update: configPatch,
        create: { clientProfileId: clientId, ...configPatch },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async disconnectAdminClient(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminTikTokAdsConnectionResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientTikTokAdsCredential.upsert({
        where: { clientProfileId: clientId },
        update: {
          accessTokenEnc: null,
          refreshTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
        create: {
          clientProfileId: clientId,
          accessTokenEnc: null,
          refreshTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
      });

      await tx.clientTikTokAdsConfig.upsert({
        where: { clientProfileId: clientId },
        update: {
          connectionStatus: TikTokAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
        create: {
          clientProfileId: clientId,
          connectionStatus: TikTokAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async testAdminClientConnection(
    clientId: string,
    dto: TestTikTokAdsConnectionDto,
    actor: AuthenticatedUser,
  ): Promise<AdminTikTokAdsConnectionTestResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    const existingConnection = await this.getConnectionSnapshot(clientId);
    const accessToken = this.resolveTokenForConnectionTest(
      dto.accessToken,
      existingConnection.credential,
    );
    const advertiserId = this.resolveAdvertiserIdForConnectionTest(
      dto.advertiserId,
      existingConnection.config,
    );

    let connectionTestResult: TikTokAdsConnectionTestResult;
    try {
      connectionTestResult = await this.tikTokAdsApiService.testConnection({
        accessToken,
        advertiserId,
      });
    } catch (error) {
      const connectionErrorInfo = this.normalizeConnectionError(error);
      await this.markConnectionAsError(clientId, connectionErrorInfo);
      throw this.toConnectionTestException(connectionErrorInfo);
    }

    const checkedAt = new Date();
    const shouldRefreshCredential = dto.accessToken !== undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.clientTikTokAdsCredential.upsert({
        where: { clientProfileId: clientId },
        update: {
          accessTokenEnc: shouldRefreshCredential
            ? this.tikTokAdsTokenService.encrypt(accessToken)
            : existingConnection.credential?.accessTokenEnc ?? null,
          tokenHash: shouldRefreshCredential
            ? this.tikTokAdsTokenService.hash(accessToken)
            : existingConnection.credential?.tokenHash ?? null,
          tokenExpiresAt:
            existingConnection.credential?.tokenExpiresAt ??
            this.resolveTokenExpiresAt(undefined, checkedAt),
          grantedScopes: this.normalizeScopes(connectionTestResult.grantedScopes),
        },
        create: {
          clientProfileId: clientId,
          accessTokenEnc: this.tikTokAdsTokenService.encrypt(accessToken),
          tokenHash: this.tikTokAdsTokenService.hash(accessToken),
          tokenExpiresAt: this.resolveTokenExpiresAt(undefined, checkedAt),
          grantedScopes: this.normalizeScopes(connectionTestResult.grantedScopes),
        },
      });

      await tx.clientTikTokAdsConfig.upsert({
        where: { clientProfileId: clientId },
        update: {
          advertiserId: connectionTestResult.advertiserId,
          advertiserName: connectionTestResult.advertiserName,
          currency: connectionTestResult.currency,
          timezone: connectionTestResult.timezone,
          connectionStatus: TikTokAdsConnectionStatus.CONNECTED,
          syncError: null,
          lastSyncAt: checkedAt,
        },
        create: {
          clientProfileId: clientId,
          advertiserId: connectionTestResult.advertiserId,
          advertiserName: connectionTestResult.advertiserName,
          currency: connectionTestResult.currency,
          timezone: connectionTestResult.timezone,
          connectionStatus: TikTokAdsConnectionStatus.CONNECTED,
          syncError: null,
          lastSyncAt: checkedAt,
        },
      });
    });

    const connection = await this.getConnectionSummaryByClientProfileId(clientId);

    return {
      success: true,
      checkedAt,
      connection,
      account: {
        advertiserId: connectionTestResult.advertiserId,
        advertiserName: connectionTestResult.advertiserName,
        currency: connectionTestResult.currency,
        timezone: connectionTestResult.timezone,
      },
      grantedScopes: this.normalizeScopes(connectionTestResult.grantedScopes),
    };
  }

  // ─── Assigned employee: read config ─────────────────────────────────────────

  async getAssignedClientConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    return this.getOrCreateConfig(clientId);
  }

  // ─── Own client: read minimal config ────────────────────────────────────────

  async getOwnClientConfig(
    actor: AuthenticatedUser,
  ): Promise<OwnClientTikTokAdsConfigSummaryResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);

    const config = await this.prisma.clientTikTokAdsConfig.findUnique({
      where: { clientProfileId },
      select: {
        advertiserId: true,
        connectionStatus: true,
        lastSyncAt: true,
      },
    });

    if (!config) {
      return {
        connectionStatus: TikTokAdsConnectionStatus.NOT_CONNECTED,
        hasConfig: false,
        advertiserId: null,
        lastSyncAt: null,
      };
    }

    return {
      connectionStatus: config.connectionStatus,
      hasConfig: true,
      advertiserId: config.advertiserId ?? null,
      lastSyncAt: config.lastSyncAt ?? null,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getOrCreateConfig(clientId: string) {
    const existing = await this.prisma.clientTikTokAdsConfig.findUnique({
      where: { clientProfileId: clientId },
    });
    if (existing) return existing;
    return this.prisma.clientTikTokAdsConfig.create({
      data: { clientProfileId: clientId },
    });
  }

  private async getConnectionSummaryByClientProfileId(
    clientId: string,
  ): Promise<AdminTikTokAdsConnectionResponse> {
    const snapshot = await this.getConnectionSnapshot(clientId);
    return this.toAdminConnectionSummary(
      clientId,
      snapshot.config,
      snapshot.credential,
      snapshot.hasActiveService,
    );
  }

  private async getConnectionSnapshot(clientId: string): Promise<{
    config: AdminTikTokAdsConfigModel | null;
    credential: TikTokAdsCredentialSummaryModel | null;
    hasActiveService: boolean;
  }> {
    const [config, credential, serviceCount] = await this.prisma.$transaction([
      this.prisma.clientTikTokAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: adminTikTokAdsConfigSelect,
      }),
      this.prisma.clientTikTokAdsCredential.findUnique({
        where: { clientProfileId: clientId },
        select: tikTokAdsCredentialSummarySelect,
      }),
      this.prisma.clientPurchasedService.count({
        where: {
          clientProfileId: clientId,
          serviceKey: PurchasedServiceKey.TIKTOK_ADS,
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

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) throw new NotFoundException("Müşteri bulunamadı.");
  }

  private async assertClientHasActiveTikTokAdsService(clientId: string): Promise<void> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId: clientId,
        serviceKey: PurchasedServiceKey.TIKTOK_ADS,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!activeService) {
      throw new BadRequestException(
        "Müşteride ACTIVE TIKTOK_ADS hizmeti olmadan TikTok Ads bağlantısı yönetilemez.",
      );
    }
  }

  private async assertActiveAssignment(clientId: string, userId: string): Promise<void> {
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: { clientProfileId: clientId, employeeUserId: userId, isActive: true },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Bu müşteriye erişim yetkiniz yok.");
    }
  }

  private buildConfigPatchData(dto: UpdateTikTokAdsConfigDto): TikTokAdsConfigPatchData {
    const patchData: TikTokAdsConfigPatchData = {};

    if (dto.advertiserId !== undefined) {
      patchData.advertiserId = dto.advertiserId;
    }
    if (dto.businessCenterId !== undefined) {
      patchData.businessCenterId = dto.businessCenterId;
    }
    if (dto.pixelId !== undefined) {
      patchData.pixelId = dto.pixelId;
    }
    if (dto.advertiserName !== undefined) {
      patchData.advertiserName = dto.advertiserName;
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

    return patchData;
  }

  private assertHasConfigUpdatePayload(dto: UpdateTikTokAdsConfigDto): void {
    if (
      dto.advertiserId === undefined &&
      dto.businessCenterId === undefined &&
      dto.pixelId === undefined &&
      dto.advertiserName === undefined &&
      dto.currency === undefined &&
      dto.timezone === undefined &&
      dto.connectionStatus === undefined
    ) {
      throw new BadRequestException(
        "TikTok Ads yapılandırması için en az bir alan gönderilmelidir.",
      );
    }
  }

  private async markConnectionAsError(
    clientId: string,
    connectionErrorInfo: TikTokAdsConnectionErrorInfo,
    occurredAt = new Date(),
  ): Promise<void> {
    await this.prisma.clientTikTokAdsConfig.upsert({
      where: { clientProfileId: clientId },
      update: {
        connectionStatus: TikTokAdsConnectionStatus.ERROR,
        syncError: connectionErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
      create: {
        clientProfileId: clientId,
        connectionStatus: TikTokAdsConnectionStatus.ERROR,
        syncError: connectionErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
    });
  }

  private normalizeConnectionError(error: unknown): TikTokAdsConnectionErrorInfo {
    const normalizedError = this.tikTokAdsApiService.normalizeError(error);

    if (normalizedError.category === "AUTH") {
      return {
        code: "TOKEN_INVALID",
        category: normalizedError.category,
        adminMessage: normalizedError.message,
      };
    }

    if (normalizedError.category === "PERMISSION") {
      return {
        code: "PERMISSION_MISSING",
        category: normalizedError.category,
        adminMessage: normalizedError.message,
      };
    }

    if (normalizedError.category === "RATE_LIMIT") {
      return {
        code: "RATE_LIMIT",
        category: normalizedError.category,
        adminMessage: normalizedError.message,
      };
    }

    return {
      code: "UNKNOWN_API_ERROR",
      category: normalizedError.category,
      adminMessage: normalizedError.message,
    };
  }

  private toConnectionTestException(connectionErrorInfo: TikTokAdsConnectionErrorInfo): Error {
    if (connectionErrorInfo.code === "PERMISSION_MISSING") {
      return new ForbiddenException(connectionErrorInfo.adminMessage);
    }

    if (connectionErrorInfo.code === "TOKEN_INVALID") {
      return new BadRequestException(connectionErrorInfo.adminMessage);
    }

    return new BadGatewayException(connectionErrorInfo.adminMessage);
  }

  private resolveTokenForConnectionTest(
    tokenFromRequest: string | undefined,
    credential: TikTokAdsCredentialSummaryModel | null,
  ): string {
    if (tokenFromRequest && tokenFromRequest.trim().length > 0) {
      return tokenFromRequest.trim();
    }

    if (!credential?.accessTokenEnc) {
      throw new BadRequestException(
        "TikTok Ads bağlantısını test etmek için accessToken gönderin veya önce manual connect yapın.",
      );
    }

    return this.tikTokAdsTokenService.decrypt(credential.accessTokenEnc);
  }

  private resolveAdvertiserIdForConnectionTest(
    advertiserIdFromRequest: string | undefined,
    config: AdminTikTokAdsConfigModel | null,
  ): string {
    const resolved = advertiserIdFromRequest ?? config?.advertiserId ?? null;
    if (!resolved || resolved.trim().length === 0) {
      throw new BadRequestException(
        "TikTok Ads bağlantısını test etmek için advertiserId gereklidir.",
      );
    }

    return resolved.trim();
  }

  private resolveTokenExpiresAt(value: string | undefined, now = new Date()): Date {
    if (value) {
      return new Date(value);
    }

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_TIKTOK_TOKEN_LIFETIME_DAYS);
    return expiresAt;
  }

  private toAdminConfigSummary(
    clientId: string,
    config: AdminTikTokAdsConfigModel | null,
  ): AdminTikTokAdsConfigSummaryResponse {
    return {
      clientProfileId: clientId,
      connectionStatus: config?.connectionStatus ?? TikTokAdsConnectionStatus.NOT_CONNECTED,
      ids: {
        advertiserId: config?.advertiserId ?? null,
        businessCenterId: config?.businessCenterId ?? null,
        pixelId: config?.pixelId ?? null,
      },
      account: {
        advertiserName: config?.advertiserName ?? null,
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
    clientId: string,
    config: AdminTikTokAdsConfigModel | null,
    credential: TikTokAdsCredentialSummaryModel | null,
    hasActiveService: boolean,
  ): AdminTikTokAdsConnectionResponse {
    return {
      ...this.toAdminConfigSummary(clientId, config),
      hasActiveService,
      credential: {
        hasToken: Boolean(credential?.tokenHash),
        tokenLastUpdatedAt: credential?.updatedAt ?? null,
        tokenExpiresAt: credential?.tokenExpiresAt ?? null,
        grantedScopes: this.normalizeScopes(credential?.grantedScopes ?? []),
      },
    };
  }

  private assertCanReadAnyConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, TIKTOK_ADS_CONFIG_READ_ANY_PERMISSION);
  }

  private assertCanManageAnyConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, TIKTOK_ADS_CONFIG_MANAGE_ANY_PERMISSION);
  }

  private assertCanReadAssignedConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }

    this.assertHasPermission(actor, TIKTOK_ADS_CONFIG_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadOwnConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Bu endpoint yalnızca müşteri hesapları içindir.");
    }

    this.assertHasPermission(actor, TIKTOK_ADS_CONFIG_READ_OWN_PERMISSION);
  }

  private assertHasPermission(actor: AuthenticatedUser, permission: string): void {
    if (!actor.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private getClientProfileIdOrFail(actor: AuthenticatedUser): string {
    if (!actor.clientProfileId) {
      throw new ForbiddenException("Müşteri hesabı bir müşteri profiline bağlı değil.");
    }

    return actor.clientProfileId;
  }

  private normalizeScopes(scopes: string[] | undefined): string[] {
    if (!scopes || scopes.length === 0) {
      return [];
    }

    return Array.from(
      new Set(scopes.map((scope) => scope.trim()).filter((scope) => scope.length > 0)),
    );
  }
}
