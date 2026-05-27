import {
  AccountType,
  AmazonAdsConnectionStatus,
  AmazonAdsRegion,
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
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import {
  AmazonAdsAccessTokenResult,
  AmazonAdsApiService,
  AmazonAdsProfile,
  NormalizedAmazonAdsApiError,
} from "./amazon-ads-api.service";
import { AmazonAdsTokenService } from "./amazon-ads-token.service";
import { AmazonAdsOAuthStartQueryDto } from "./dto/amazon-ads-oauth-start-query.dto";
import { ConnectManualAmazonAdsDto } from "./dto/connect-manual-amazon-ads.dto";
import { ExchangeAmazonAdsOAuthCodeDto } from "./dto/exchange-amazon-ads-oauth-code.dto";
import { TestAmazonAdsConnectionDto } from "./dto/test-amazon-ads-connection.dto";
import { UpdateAmazonAdsConfigDto } from "./dto/update-amazon-ads-config.dto";

const AMAZON_ADS_CONFIG_READ_ANY_PERMISSION = "amazonAds.config.read.any";
const AMAZON_ADS_CONFIG_MANAGE_ANY_PERMISSION = "amazonAds.config.manage.any";
const AMAZON_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "amazonAds.config.read.assigned";
const AMAZON_ADS_CONFIG_READ_OWN_PERMISSION = "amazonAds.config.read.own";

const adminAmazonAdsConfigSelect = {
  id: true,
  clientProfileId: true,
  profileId: true,
  advertiserAccountId: true,
  marketplaceId: true,
  region: true,
  countryCode: true,
  currencyCode: true,
  timezone: true,
  accountType: true,
  accountName: true,
  validPaymentMethod: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientAmazonAdsConfigSelect;

const amazonAdsCredentialSummarySelect = {
  accessTokenEnc: true,
  refreshTokenEnc: true,
  tokenHash: true,
  accessTokenExpiresAt: true,
  refreshTokenExpiresAt: true,
  grantedScopes: true,
  updatedAt: true,
} satisfies Prisma.ClientAmazonAdsCredentialSelect;

type AdminAmazonAdsConfigModel = Prisma.ClientAmazonAdsConfigGetPayload<{
  select: typeof adminAmazonAdsConfigSelect;
}>;

type AmazonAdsCredentialSummaryModel = Prisma.ClientAmazonAdsCredentialGetPayload<{
  select: typeof amazonAdsCredentialSummarySelect;
}>;

type AmazonAdsConfigPatchData = {
  profileId?: string | null;
  advertiserAccountId?: string | null;
  marketplaceId?: string | null;
  region?: AmazonAdsRegion | null;
  countryCode?: string | null;
  currencyCode?: string | null;
  timezone?: string | null;
  accountType?: string | null;
  accountName?: string | null;
  validPaymentMethod?: boolean | null;
  connectionStatus?: AmazonAdsConnectionStatus;
  lastSyncAt?: Date | null;
  syncError?: string | null;
};

type AdminAmazonAdsConfigSummaryResponse = {
  clientProfileId: string;
  connectionStatus: AmazonAdsConnectionStatus;
  ids: {
    profileId: string | null;
    advertiserAccountId: string | null;
    marketplaceId: string | null;
  };
  account: {
    accountType: string | null;
    accountName: string | null;
    validPaymentMethod: boolean | null;
  };
  settings: {
    region: AmazonAdsRegion | null;
    countryCode: string | null;
    currencyCode: string | null;
    timezone: string | null;
  };
  lastSyncAt: Date | null;
  syncError: string | null;
};

type AdminAmazonAdsConnectionResponse = AdminAmazonAdsConfigSummaryResponse & {
  hasActiveService: boolean;
  credential: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenLastUpdatedAt: Date | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    grantedScopes: string[];
  };
};

type OwnClientAmazonAdsConfigSummaryResponse = {
  connectionStatus: AmazonAdsConnectionStatus;
  hasConfig: boolean;
  profileId: string | null;
  advertiserAccountId: string | null;
  marketplaceId: string | null;
  region: AmazonAdsRegion | null;
  countryCode: string | null;
  currencyCode: string | null;
  accountName: string | null;
  lastSyncAt: Date | null;
};

type AdminAmazonAdsOAuthStartUrlResponse = {
  authorizationUrl: string;
  state: string;
  redirectUri: string;
  scopes: string[];
};

type AdminAmazonAdsConnectionTestResponse = {
  success: true;
  checkedAt: Date;
  connection: AdminAmazonAdsConnectionResponse;
  profile: AmazonAdsProfile;
  profiles: AmazonAdsProfile[];
  grantedScopes: string[];
};

type AmazonAdsConnectionSnapshot = {
  config: AdminAmazonAdsConfigModel | null;
  credential: AmazonAdsCredentialSummaryModel | null;
  hasActiveService: boolean;
};

type AmazonAdsPersistConnectionInput = {
  refreshToken: string;
  profileId?: string | null;
  region?: AmazonAdsRegion | null;
};

type AmazonAdsRefreshTokenResult = AmazonAdsAccessTokenResult & {
  refreshToken: string;
};

@Injectable()
export class AmazonAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly amazonAdsTokenService: AmazonAdsTokenService,
    private readonly amazonAdsApiService: AmazonAdsApiService,
  ) {}

  async getAdminClientConfig(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConfigModel> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    return this.getOrCreateConfig(clientId);
  }

  async getAdminClientConnection(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionResponse> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async updateAdminClientConfig(
    clientId: string,
    dto: UpdateAmazonAdsConfigDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionResponse> {
    this.assertCanManageAnyConfig(actor);
    this.assertHasConfigUpdatePayload(dto);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const patchData = this.buildConfigPatchData(dto);
    await this.prisma.clientAmazonAdsConfig.upsert({
      where: { clientProfileId: clientId },
      update: patchData,
      create: { clientProfileId: clientId, ...patchData },
    });

    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async createAdminClientOAuthStartUrl(
    clientId: string,
    query: AmazonAdsOAuthStartQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsOAuthStartUrlResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const clientIdValue = this.getAmazonAdsClientId();
    const state = this.createOAuthState(clientId, query.region ?? null);
    const authorization = this.amazonAdsApiService.createAuthorizationUrl({
      clientId: clientIdValue,
      state,
      region: query.region ?? null,
    });

    return {
      authorizationUrl: authorization.authorizationUrl,
      state,
      redirectUri: authorization.redirectUri,
      scopes: authorization.scopes,
    };
  }

  async exchangeAdminClientOAuthCode(
    clientId: string,
    dto: ExchangeAmazonAdsOAuthCodeDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionTestResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const token = await this.exchangeAuthorizationCodeOrFail(clientId, dto.code);

    return this.testAndPersistConnection(clientId, {
      refreshToken: token.refreshToken,
      profileId: dto.profileId ?? null,
      region: dto.region ?? null,
    });
  }

  private async exchangeAuthorizationCodeOrFail(
    clientId: string,
    code: string,
  ): Promise<AmazonAdsRefreshTokenResult> {
    try {
      const token = await this.amazonAdsApiService.exchangeAuthorizationCode(code);
      if (!token.refreshToken) {
        throw new BadGatewayException("Amazon LwA did not return a refresh token.");
      }

      return { ...token, refreshToken: token.refreshToken };
    } catch (error) {
      const normalizedError = this.amazonAdsApiService.normalizeError(error);
      await this.markConnectionAsError(clientId, normalizedError);
      throw this.toConnectionTestException(normalizedError);
    }
  }

  async connectAdminClientManual(
    clientId: string,
    dto: ConnectManualAmazonAdsDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const encryptedRefreshToken = this.amazonAdsTokenService.encrypt(dto.refreshToken);
    const encryptedAccessToken = dto.accessToken
      ? this.amazonAdsTokenService.encrypt(dto.accessToken)
      : null;
    const tokenHash = this.amazonAdsTokenService.hash(dto.refreshToken);
    const normalizedScopes = this.normalizeScopes(dto.grantedScopes);
    const accessTokenExpiresAt = dto.accessTokenExpiresAt
      ? new Date(dto.accessTokenExpiresAt)
      : null;
    const refreshTokenExpiresAt = dto.refreshTokenExpiresAt
      ? new Date(dto.refreshTokenExpiresAt)
      : null;
    const configPatch = this.buildManualConnectConfigPatch(dto);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientAmazonAdsCredential.upsert({
        where: { clientProfileId: clientId },
        update: {
          accessTokenEnc: encryptedAccessToken,
          refreshTokenEnc: encryptedRefreshToken,
          tokenHash,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
        create: {
          clientProfileId: clientId,
          accessTokenEnc: encryptedAccessToken,
          refreshTokenEnc: encryptedRefreshToken,
          tokenHash,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          grantedScopes: normalizedScopes,
        },
      });

      await tx.clientAmazonAdsConfig.upsert({
        where: { clientProfileId: clientId },
        update: configPatch,
        create: {
          clientProfileId: clientId,
          ...configPatch,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async testAdminClientConnection(
    clientId: string,
    dto: TestAmazonAdsConnectionDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionTestResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const snapshot = await this.getConnectionSnapshot(clientId);
    const refreshToken = this.resolveRefreshTokenForConnectionTest(
      dto.refreshToken,
      snapshot.credential,
    );
    const profileId = dto.profileId ?? snapshot.config?.profileId ?? null;
    const region = dto.region ?? snapshot.config?.region ?? null;

    return this.testAndPersistConnection(clientId, {
      refreshToken,
      profileId,
      region,
    });
  }

  async disconnectAdminClient(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConnectionResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientAmazonAdsCredential.upsert({
        where: { clientProfileId: clientId },
        update: {
          accessTokenEnc: null,
          refreshTokenEnc: null,
          tokenHash: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          grantedScopes: [],
        },
        create: {
          clientProfileId: clientId,
          accessTokenEnc: null,
          refreshTokenEnc: null,
          tokenHash: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          grantedScopes: [],
        },
      });

      await tx.clientAmazonAdsConfig.upsert({
        where: { clientProfileId: clientId },
        update: {
          connectionStatus: AmazonAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
        create: {
          clientProfileId: clientId,
          connectionStatus: AmazonAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientId);
  }

  async getAssignedClientConfig(
    clientId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsConfigSummaryResponse> {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    const config = await this.prisma.clientAmazonAdsConfig.findUnique({
      where: { clientProfileId: clientId },
      select: adminAmazonAdsConfigSelect,
    });

    return this.toAdminConfigSummary(clientId, config);
  }

  async getOwnClientConfig(
    actor: AuthenticatedUser,
  ): Promise<OwnClientAmazonAdsConfigSummaryResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveAmazonAdsService(clientProfileId);

    const config = await this.prisma.clientAmazonAdsConfig.findUnique({
      where: { clientProfileId },
      select: {
        profileId: true,
        advertiserAccountId: true,
        marketplaceId: true,
        region: true,
        countryCode: true,
        currencyCode: true,
        accountName: true,
        connectionStatus: true,
        lastSyncAt: true,
      },
    });

    if (!config) {
      return {
        connectionStatus: AmazonAdsConnectionStatus.NOT_CONNECTED,
        hasConfig: false,
        profileId: null,
        advertiserAccountId: null,
        marketplaceId: null,
        region: null,
        countryCode: null,
        currencyCode: null,
        accountName: null,
        lastSyncAt: null,
      };
    }

    return {
      connectionStatus: config.connectionStatus,
      hasConfig: true,
      profileId: config.profileId ?? null,
      advertiserAccountId: config.advertiserAccountId ?? null,
      marketplaceId: config.marketplaceId ?? null,
      region: config.region ?? null,
      countryCode: config.countryCode ?? null,
      currencyCode: config.currencyCode ?? null,
      accountName: config.accountName ?? null,
      lastSyncAt: config.lastSyncAt ?? null,
    };
  }

  private async getOrCreateConfig(clientId: string): Promise<AdminAmazonAdsConfigModel> {
    const existing = await this.prisma.clientAmazonAdsConfig.findUnique({
      where: { clientProfileId: clientId },
      select: adminAmazonAdsConfigSelect,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.clientAmazonAdsConfig.create({
      data: { clientProfileId: clientId },
      select: adminAmazonAdsConfigSelect,
    });
  }

  private async getConnectionSummaryByClientProfileId(
    clientId: string,
  ): Promise<AdminAmazonAdsConnectionResponse> {
    const snapshot = await this.getConnectionSnapshot(clientId);

    return this.toAdminConnectionSummary(
      clientId,
      snapshot.config,
      snapshot.credential,
      snapshot.hasActiveService,
    );
  }

  private async getConnectionSnapshot(clientId: string): Promise<AmazonAdsConnectionSnapshot> {
    const [config, credential, serviceCount] = await this.prisma.$transaction([
      this.prisma.clientAmazonAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: adminAmazonAdsConfigSelect,
      }),
      this.prisma.clientAmazonAdsCredential.findUnique({
        where: { clientProfileId: clientId },
        select: amazonAdsCredentialSummarySelect,
      }),
      this.prisma.clientPurchasedService.count({
        where: {
          clientProfileId: clientId,
          serviceKey: PurchasedServiceKey.AMAZON_ADS,
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

  private async testAndPersistConnection(
    clientId: string,
    input: AmazonAdsPersistConnectionInput,
  ): Promise<AdminAmazonAdsConnectionTestResponse> {
    try {
      const result = await this.amazonAdsApiService.testConnection({
        refreshToken: input.refreshToken,
        profileId: input.profileId ?? null,
        region: input.region ?? null,
      });
      const checkedAt = new Date();
      const refreshToken =
        result.refreshToken.trim().length > 0 ? result.refreshToken : input.refreshToken;
      const normalizedScopes = this.normalizeScopes(result.grantedScopes);
      const profilePatch = this.buildConnectedProfilePatch(result.selectedProfile, checkedAt);
      const encryptedAccessToken = this.amazonAdsTokenService.encrypt(result.accessToken);
      const encryptedRefreshToken = this.amazonAdsTokenService.encrypt(refreshToken);
      const tokenHash = this.amazonAdsTokenService.hash(refreshToken);

      await this.prisma.$transaction(async (tx) => {
        await tx.clientAmazonAdsCredential.upsert({
          where: { clientProfileId: clientId },
          update: {
            accessTokenEnc: encryptedAccessToken,
            refreshTokenEnc: encryptedRefreshToken,
            tokenHash,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: null,
            grantedScopes: normalizedScopes,
          },
          create: {
            clientProfileId: clientId,
            accessTokenEnc: encryptedAccessToken,
            refreshTokenEnc: encryptedRefreshToken,
            tokenHash,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            refreshTokenExpiresAt: null,
            grantedScopes: normalizedScopes,
          },
        });

        await tx.clientAmazonAdsConfig.upsert({
          where: { clientProfileId: clientId },
          update: profilePatch,
          create: {
            clientProfileId: clientId,
            ...profilePatch,
          },
        });
      });

      return {
        success: true,
        checkedAt,
        connection: await this.getConnectionSummaryByClientProfileId(clientId),
        profile: result.selectedProfile,
        profiles: result.profiles,
        grantedScopes: normalizedScopes,
      };
    } catch (error) {
      const normalizedError = this.amazonAdsApiService.normalizeError(error);
      await this.markConnectionAsError(clientId, normalizedError);
      throw this.toConnectionTestException(normalizedError);
    }
  }

  private buildManualConnectConfigPatch(
    dto: ConnectManualAmazonAdsDto,
  ): AmazonAdsConfigPatchData {
    const patchData: AmazonAdsConfigPatchData = {
      connectionStatus: AmazonAdsConnectionStatus.PENDING,
      syncError: null,
    };

    if (dto.profileId !== undefined) {
      patchData.profileId = this.normalizeOptionalText(dto.profileId);
    }
    if (dto.advertiserAccountId !== undefined) {
      patchData.advertiserAccountId = this.normalizeOptionalText(dto.advertiserAccountId);
    }
    if (dto.marketplaceId !== undefined) {
      patchData.marketplaceId = this.normalizeOptionalText(dto.marketplaceId);
    }
    if (dto.region !== undefined) {
      patchData.region = dto.region;
    }
    if (dto.countryCode !== undefined) {
      patchData.countryCode = this.normalizeOptionalText(dto.countryCode)?.toUpperCase() ?? null;
    }
    if (dto.currencyCode !== undefined) {
      patchData.currencyCode = this.normalizeOptionalText(dto.currencyCode)?.toUpperCase() ?? null;
    }
    if (dto.timezone !== undefined) {
      patchData.timezone = this.normalizeOptionalText(dto.timezone);
    }
    if (dto.accountType !== undefined) {
      patchData.accountType = this.normalizeOptionalText(dto.accountType);
    }
    if (dto.accountName !== undefined) {
      patchData.accountName = this.normalizeOptionalText(dto.accountName);
    }
    if (dto.validPaymentMethod !== undefined) {
      patchData.validPaymentMethod = dto.validPaymentMethod;
    }

    return patchData;
  }

  private buildConnectedProfilePatch(
    profile: AmazonAdsProfile,
    checkedAt: Date,
  ): AmazonAdsConfigPatchData {
    return {
      profileId: profile.profileId,
      advertiserAccountId: profile.advertiserAccountId,
      marketplaceId: profile.marketplaceId,
      region: profile.region,
      countryCode: profile.countryCode,
      currencyCode: profile.currencyCode,
      timezone: profile.timezone,
      accountType: profile.accountType,
      accountName: profile.accountName,
      validPaymentMethod: profile.validPaymentMethod,
      connectionStatus: AmazonAdsConnectionStatus.CONNECTED,
      lastSyncAt: checkedAt,
      syncError: null,
    };
  }

  private resolveRefreshTokenForConnectionTest(
    rawRefreshToken: string | undefined,
    credential: AmazonAdsCredentialSummaryModel | null,
  ): string {
    const providedRefreshToken = this.normalizeOptionalText(rawRefreshToken);
    if (providedRefreshToken) {
      return providedRefreshToken;
    }

    if (!credential?.refreshTokenEnc) {
      throw new BadRequestException(
        "Amazon Ads refresh token bulunamadı. Önce müşteriyi bağlayın veya test için refresh token gönderin.",
      );
    }

    return this.amazonAdsTokenService.decrypt(credential.refreshTokenEnc);
  }

  private async markConnectionAsError(
    clientId: string,
    normalizedError: NormalizedAmazonAdsApiError,
    occurredAt = new Date(),
  ): Promise<void> {
    await this.prisma.clientAmazonAdsConfig.upsert({
      where: { clientProfileId: clientId },
      update: {
        connectionStatus: AmazonAdsConnectionStatus.ERROR,
        syncError: this.normalizeApiErrorMessage(normalizedError.message),
        lastSyncAt: occurredAt,
      },
      create: {
        clientProfileId: clientId,
        connectionStatus: AmazonAdsConnectionStatus.ERROR,
        syncError: this.normalizeApiErrorMessage(normalizedError.message),
        lastSyncAt: occurredAt,
      },
    });
  }

  private toConnectionTestException(normalizedError: NormalizedAmazonAdsApiError): Error {
    const message = this.normalizeApiErrorMessage(normalizedError.message);

    if (normalizedError.category === "AUTH") {
      return new BadRequestException(
        message.length > 0
          ? `Amazon Ads refresh token geçersiz veya süresi dolmuş: ${message}`
          : "Amazon Ads refresh token geçersiz veya süresi dolmuş.",
      );
    }

    if (normalizedError.category === "PERMISSION") {
      return new ForbiddenException(
        message.length > 0
          ? `Amazon Ads API izinleri eksik veya yetersiz: ${message}`
          : "Amazon Ads API izinleri eksik veya yetersiz.",
      );
    }

    if (normalizedError.category === "RATE_LIMIT") {
      return new BadGatewayException("Amazon Ads API rate limit sınırına ulaştı.");
    }

    return new BadGatewayException(
      message.length > 0
        ? `Amazon Ads bağlantısı doğrulanamadı: ${message}`
        : "Amazon Ads bağlantısı doğrulanamadı.",
    );
  }

  private getAmazonAdsClientId(): string {
    const clientId =
      this.configService.get<string>("AMAZON_ADS_LWA_CLIENT_ID")?.trim() ||
      this.configService.get<string>("AMAZON_ADS_CLIENT_ID")?.trim();

    if (!clientId) {
      throw new BadGatewayException(
        "AMAZON_ADS_LWA_CLIENT_ID veya AMAZON_ADS_CLIENT_ID yapılandırılmalıdır.",
      );
    }

    return clientId;
  }

  private createOAuthState(clientId: string, region: AmazonAdsRegion | null): string {
    const statePayload = {
      clientProfileId: clientId,
      region,
      nonce: randomBytes(12).toString("hex"),
      createdAt: new Date().toISOString(),
    };

    return Buffer.from(JSON.stringify(statePayload), "utf8").toString("base64url");
  }

  private normalizeApiErrorMessage(message: string): string {
    return message.trim().replace(/\s+/g, " ");
  }

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }
  }

  private async assertClientHasActiveAmazonAdsService(clientId: string): Promise<void> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId: clientId,
        serviceKey: PurchasedServiceKey.AMAZON_ADS,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!activeService) {
      throw new BadRequestException(
        "Müşteride ACTIVE AMAZON_ADS hizmeti olmadan Amazon Ads yapılandırması yönetilemez.",
      );
    }
  }

  private async assertActiveAssignment(clientId: string, userId: string): Promise<void> {
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        clientProfileId: clientId,
        employeeUserId: userId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundException("Bu müşteriye erişim yetkiniz yok.");
    }
  }

  private buildConfigPatchData(dto: UpdateAmazonAdsConfigDto): AmazonAdsConfigPatchData {
    const patchData: AmazonAdsConfigPatchData = {};

    if (dto.profileId !== undefined) {
      patchData.profileId = this.normalizeOptionalText(dto.profileId);
    }
    if (dto.advertiserAccountId !== undefined) {
      patchData.advertiserAccountId = this.normalizeOptionalText(dto.advertiserAccountId);
    }
    if (dto.marketplaceId !== undefined) {
      patchData.marketplaceId = this.normalizeOptionalText(dto.marketplaceId);
    }
    if (dto.region !== undefined) {
      patchData.region = dto.region;
    }
    if (dto.countryCode !== undefined) {
      patchData.countryCode = this.normalizeOptionalText(dto.countryCode)?.toUpperCase() ?? null;
    }
    if (dto.currencyCode !== undefined) {
      patchData.currencyCode = this.normalizeOptionalText(dto.currencyCode)?.toUpperCase() ?? null;
    }
    if (dto.timezone !== undefined) {
      patchData.timezone = this.normalizeOptionalText(dto.timezone);
    }
    if (dto.accountType !== undefined) {
      patchData.accountType = this.normalizeOptionalText(dto.accountType);
    }
    if (dto.accountName !== undefined) {
      patchData.accountName = this.normalizeOptionalText(dto.accountName);
    }
    if (dto.validPaymentMethod !== undefined) {
      patchData.validPaymentMethod = dto.validPaymentMethod;
    }
    if (dto.connectionStatus !== undefined) {
      patchData.connectionStatus = dto.connectionStatus;
    }

    return patchData;
  }

  private assertHasConfigUpdatePayload(dto: UpdateAmazonAdsConfigDto): void {
    if (
      dto.profileId === undefined &&
      dto.advertiserAccountId === undefined &&
      dto.marketplaceId === undefined &&
      dto.region === undefined &&
      dto.countryCode === undefined &&
      dto.currencyCode === undefined &&
      dto.timezone === undefined &&
      dto.accountType === undefined &&
      dto.accountName === undefined &&
      dto.validPaymentMethod === undefined &&
      dto.connectionStatus === undefined
    ) {
      throw new BadRequestException(
        "Amazon Ads yapılandırması için en az bir alan gönderilmelidir.",
      );
    }
  }

  private toAdminConfigSummary(
    clientId: string,
    config: AdminAmazonAdsConfigModel | null,
  ): AdminAmazonAdsConfigSummaryResponse {
    return {
      clientProfileId: clientId,
      connectionStatus: config?.connectionStatus ?? AmazonAdsConnectionStatus.NOT_CONNECTED,
      ids: {
        profileId: config?.profileId ?? null,
        advertiserAccountId: config?.advertiserAccountId ?? null,
        marketplaceId: config?.marketplaceId ?? null,
      },
      account: {
        accountType: config?.accountType ?? null,
        accountName: config?.accountName ?? null,
        validPaymentMethod: config?.validPaymentMethod ?? null,
      },
      settings: {
        region: config?.region ?? null,
        countryCode: config?.countryCode ?? null,
        currencyCode: config?.currencyCode ?? null,
        timezone: config?.timezone ?? null,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
      syncError: config?.syncError ?? null,
    };
  }

  private toAdminConnectionSummary(
    clientId: string,
    config: AdminAmazonAdsConfigModel | null,
    credential: AmazonAdsCredentialSummaryModel | null,
    hasActiveService: boolean,
  ): AdminAmazonAdsConnectionResponse {
    return {
      ...this.toAdminConfigSummary(clientId, config),
      hasActiveService,
      credential: {
        hasAccessToken: Boolean(credential?.tokenHash || credential?.accessTokenEnc),
        hasRefreshToken: Boolean(credential?.refreshTokenEnc),
        tokenLastUpdatedAt: credential?.updatedAt ?? null,
        accessTokenExpiresAt: credential?.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: credential?.refreshTokenExpiresAt ?? null,
        grantedScopes: this.normalizeScopes(credential?.grantedScopes ?? []),
      },
    };
  }

  private assertCanReadAnyConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_READ_ANY_PERMISSION);
  }

  private assertCanManageAnyConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_MANAGE_ANY_PERMISSION);
  }

  private assertCanReadAssignedConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadOwnConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Bu endpoint yalnızca müşteri hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_READ_OWN_PERMISSION);
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

  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
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
