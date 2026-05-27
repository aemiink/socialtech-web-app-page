import {
  AccountType,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TikTokAdsConnectionStatus,
  TikTokAdsInsightLevel,
  TikTokAdsSyncStatus,
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
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { ConnectManualTikTokAdsDto } from "./dto/connect-manual-tiktok-ads.dto";
import { TestTikTokAdsConnectionDto } from "./dto/test-tiktok-ads-connection.dto";
import { TikTokAdsCampaignsQueryDto } from "./dto/tiktok-ads-campaigns-query.dto";
import { TikTokAdsDateRangeQueryDto } from "./dto/tiktok-ads-date-range-query.dto";
import { TikTokAdsInsightsQueryDto } from "./dto/tiktok-ads-insights-query.dto";
import { UpdateTikTokAdsConfigDto } from "./dto/update-tiktok-ads-config.dto";
import {
  NormalizedTikTokAdsApiError,
  TikTokAdsApiInsightRow,
  TikTokAdsApiService,
  TikTokAdsCampaignCatalogItem,
  TikTokAdsConnectionTestResult,
  TikTokAdsReportingSnapshotResult,
} from "./tiktok-ads-api.service";
import { TikTokAdsTokenService } from "./tiktok-ads-token.service";

const TIKTOK_ADS_CONFIG_READ_ANY_PERMISSION = "tiktokAds.config.read.any";
const TIKTOK_ADS_CONFIG_MANAGE_ANY_PERMISSION = "tiktokAds.config.manage.any";
const TIKTOK_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "tiktokAds.config.read.assigned";
const TIKTOK_ADS_CONFIG_READ_OWN_PERMISSION = "tiktokAds.config.read.own";
const DEFAULT_TIKTOK_TOKEN_LIFETIME_DAYS = 365;
const DEFAULT_REPORTING_RANGE_DAYS = 7;
const MAX_REPORTING_RANGE_DAYS = 90;
const DEFAULT_CAMPAIGNS_LIMIT = 12;
const DEFAULT_INSIGHTS_LIMIT = 100;
const DEFAULT_TIKTOK_ADS_SYNC_TTL_MINUTES = 30;
const CLIENT_SAFE_SYNC_ERROR_MESSAGE = "Bağlantı problemi var, ekibimiz ilgileniyor.";

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

const tikTokAdsDailyInsightSelect = {
  id: true,
  clientProfileId: true,
  advertiserId: true,
  date: true,
  level: true,
  entityId: true,
  entityName: true,
  spend: true,
  impressions: true,
  reach: true,
  clicks: true,
  ctr: true,
  cpc: true,
  cpm: true,
  videoViews: true,
  videoViews2s: true,
  videoViews6s: true,
  videoCompletionRate: true,
  vtr: true,
  conversions: true,
  costPerConversion: true,
  conversionRate: true,
  purchaseValue: true,
  raw: true,
  updatedAt: true,
} satisfies Prisma.TikTokAdsDailyInsightSelect;

type AdminTikTokAdsConfigModel = Prisma.ClientTikTokAdsConfigGetPayload<{
  select: typeof adminTikTokAdsConfigSelect;
}>;

type TikTokAdsCredentialSummaryModel = Prisma.ClientTikTokAdsCredentialGetPayload<{
  select: typeof tikTokAdsCredentialSummarySelect;
}>;

type TikTokAdsDailyInsightModel = Prisma.TikTokAdsDailyInsightGetPayload<{
  select: typeof tikTokAdsDailyInsightSelect;
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

type TikTokAdsReportDateRange = {
  since: Date;
  until: Date;
  sinceIsoDate: string;
  untilIsoDate: string;
};

type TikTokAdsSummaryResponse = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  videoViews: number;
  videoViews2s: number;
  videoViews6s: number;
  videoCompletionRate: number;
  vtr: number;
  conversions: number;
  costPerConversion: number;
  conversionRate: number;
  purchaseValue: number;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type TikTokAdsCampaignSummary = {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  videoViews: number;
  conversions: number;
  costPerConversion: number;
  purchaseValue: number;
};

type TikTokAdsCampaignsResponse = {
  data: TikTokAdsCampaignSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type TikTokAdsInsightItem = {
  id: string;
  date: string;
  level: TikTokAdsInsightLevel;
  entityId: string;
  entityName: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  videoViews: number;
  videoViews2s: number;
  videoViews6s: number;
  videoCompletionRate: number;
  vtr: number;
  conversions: number;
  costPerConversion: number;
  conversionRate: number;
  purchaseValue: number;
  updatedAt: string;
};

type TikTokAdsInsightsResponse = {
  data: TikTokAdsInsightItem[];
  level: TikTokAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type TikTokAdsSyncResponse = {
  success: true;
  syncedAt: Date;
  dateRange: {
    since: string;
    until: string;
  };
  inserted: {
    account: number;
    campaigns: number;
    adGroups: number;
    ads: number;
    total: number;
  };
  connectionStatus: TikTokAdsConnectionStatus;
  lastSyncAt: Date | null;
  syncStatus: TikTokAdsSyncStatus;
  skippedReason: string | null;
};

type TikTokAdsSyncTrigger =
  | "MANUAL_SYNC"
  | "ON_DEMAND_CLIENT_REFRESH"
  | "ON_DEMAND_ASSIGNED_REFRESH";

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
    private readonly configService: ConfigService,
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

  async getAdminClientSummary(
    clientId: string,
    query: TikTokAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsSummaryResponse> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getSummaryByClientProfileId(clientId, query);
  }

  async getAdminClientCampaigns(
    clientId: string,
    query: TikTokAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsCampaignsResponse> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getCampaignsByClientProfileId(clientId, query);
  }

  async getAdminClientInsights(
    clientId: string,
    query: TikTokAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsInsightsResponse> {
    this.assertCanReadAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getInsightsByClientProfileId(clientId, query);
  }

  async syncAdminClientInsights(
    clientId: string,
    query: TikTokAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsSyncResponse> {
    this.assertCanManageAnyConfig(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.syncInsightsByClientProfileId(clientId, query, {
      trigger: "MANUAL_SYNC",
      applySyncTtl: false,
      revealDetailedError: true,
    });
  }

  // ─── Assigned employee: read config ─────────────────────────────────────────

  async getAssignedClientConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    return this.getOrCreateConfig(clientId);
  }

  async getAssignedClientSummary(
    clientId: string,
    query: TikTokAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsSummaryResponse> {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getSummaryByClientProfileId(clientId, query);
  }

  async getAssignedClientCampaigns(
    clientId: string,
    query: TikTokAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsCampaignsResponse> {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getCampaignsByClientProfileId(clientId, query);
  }

  async getAssignedClientInsights(
    clientId: string,
    query: TikTokAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsInsightsResponse> {
    this.assertCanReadAssignedConfig(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveTikTokAdsService(clientId);

    return this.getInsightsByClientProfileId(clientId, query);
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

  async getOwnClientSummary(
    query: TikTokAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsSummaryResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveTikTokAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getOwnClientCampaigns(
    query: TikTokAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsCampaignsResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveTikTokAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientInsights(
    query: TikTokAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsInsightsResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveTikTokAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async syncOwnClientInsights(
    query: TikTokAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<TikTokAdsSyncResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveTikTokAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ON_DEMAND_CLIENT_REFRESH",
      applySyncTtl: true,
      revealDetailedError: false,
    });
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

  private async getSummaryByClientProfileId(
    clientId: string,
    query: TikTokAdsDateRangeQueryDto,
  ): Promise<TikTokAdsSummaryResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.tikTokAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level: TikTokAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: tikTokAdsDailyInsightSelect,
        orderBy: { date: "asc" },
      }),
      this.prisma.clientTikTokAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: { lastSyncAt: true },
      }),
    ]);

    return {
      ...this.aggregateInsightRows(insights),
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getCampaignsByClientProfileId(
    clientId: string,
    query: TikTokAdsCampaignsQueryDto,
  ): Promise<TikTokAdsCampaignsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_CAMPAIGNS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.tikTokAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level: TikTokAdsInsightLevel.CAMPAIGN,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: tikTokAdsDailyInsightSelect,
      }),
      this.prisma.clientTikTokAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: { lastSyncAt: true },
      }),
    ]);

    const campaignMap = new Map<string, TikTokAdsCampaignSummary>();
    for (const insight of insights) {
      const existing = campaignMap.get(insight.entityId);
      const spend = this.readDecimalAsNumber(insight.spend);
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const videoViews = insight.videoViews ?? 0;
      const conversions = insight.conversions ?? 0;
      const purchaseValue = this.readDecimalAsNumber(insight.purchaseValue);
      const rawMeta = this.extractCampaignMetaFromRaw(insight.raw);

      if (!existing) {
        campaignMap.set(insight.entityId, {
          id: insight.entityId,
          name: insight.entityName ?? insight.entityId,
          objective: rawMeta.objective ?? "UNSPECIFIED",
          status: rawMeta.status ?? "UNKNOWN",
          spend,
          impressions,
          clicks,
          ctr: this.roundPercentageByCounts(clicks, impressions),
          cpc: this.roundDivision(spend, clicks),
          videoViews,
          conversions,
          costPerConversion: this.roundDivision(spend, conversions),
          purchaseValue,
        });
        continue;
      }

      existing.spend += spend;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.videoViews += videoViews;
      existing.conversions += conversions;
      existing.purchaseValue += purchaseValue;
      existing.ctr = this.roundPercentageByCounts(existing.clicks, existing.impressions);
      existing.cpc = this.roundDivision(existing.spend, existing.clicks);
      existing.costPerConversion = this.roundDivision(existing.spend, existing.conversions);
      existing.name = insight.entityName ?? existing.name;
      existing.objective = rawMeta.objective ?? existing.objective;
      existing.status = rawMeta.status ?? existing.status;
    }

    return {
      data: Array.from(campaignMap.values())
        .sort((left, right) => right.spend - left.spend)
        .slice(0, limit)
        .map((campaign) => ({
          ...campaign,
          spend: this.round(campaign.spend),
          cpc: this.round(campaign.cpc),
          ctr: this.round(campaign.ctr),
          costPerConversion: this.round(campaign.costPerConversion),
          purchaseValue: this.round(campaign.purchaseValue),
        })),
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getInsightsByClientProfileId(
    clientId: string,
    query: TikTokAdsInsightsQueryDto,
  ): Promise<TikTokAdsInsightsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const level = query.level ?? TikTokAdsInsightLevel.ACCOUNT;
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.tikTokAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: tikTokAdsDailyInsightSelect,
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
        take: limit,
      }),
      this.prisma.clientTikTokAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: { lastSyncAt: true },
      }),
    ]);

    return {
      data: insights.map((insight) => this.toInsightItem(insight)),
      level,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async syncInsightsByClientProfileId(
    clientId: string,
    query: TikTokAdsDateRangeQueryDto,
    options: {
      trigger: TikTokAdsSyncTrigger;
      applySyncTtl: boolean;
      revealDetailedError: boolean;
    },
  ): Promise<TikTokAdsSyncResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const startedAt = new Date();
    const syncLog = await this.prisma.tikTokAdsSyncLog.create({
      data: {
        clientProfileId: clientId,
        status: TikTokAdsSyncStatus.RUNNING,
        trigger: options.trigger,
        startedAt,
      },
      select: { id: true },
    });

    try {
      const connection = await this.resolveReportingConnection(clientId);
      await this.prisma.tikTokAdsSyncLog.update({
        where: { id: syncLog.id },
        data: { advertiserId: connection.advertiserId },
      });

      if (options.applySyncTtl) {
        const skipReason = this.resolveSyncSkipReason(connection.lastSyncAt, startedAt);
        if (skipReason) {
          await this.prisma.tikTokAdsSyncLog.update({
            where: { id: syncLog.id },
            data: {
              status: TikTokAdsSyncStatus.SKIPPED,
              finishedAt: startedAt,
              errorCode: "SYNC_TTL_ACTIVE",
              errorMessage: `[${options.trigger}] ${skipReason}`,
              recordsFetched: 0,
              apiCallCount: 0,
            },
          });

          return {
            success: true,
            syncedAt: connection.lastSyncAt ?? startedAt,
            dateRange: {
              since: dateRange.sinceIsoDate,
              until: dateRange.untilIsoDate,
            },
            inserted: {
              account: 0,
              campaigns: 0,
              adGroups: 0,
              ads: 0,
              total: 0,
            },
            connectionStatus: connection.connectionStatus,
            lastSyncAt: connection.lastSyncAt,
            syncStatus: TikTokAdsSyncStatus.SKIPPED,
            skippedReason: skipReason,
          };
        }
      }

      const snapshot: TikTokAdsReportingSnapshotResult =
        await this.tikTokAdsApiService.fetchReportingSnapshot({
          accessToken: connection.accessToken,
          advertiserId: connection.advertiserId,
          since: dateRange.sinceIsoDate,
          until: dateRange.untilIsoDate,
        });

      const campaignCatalogById = new Map(
        snapshot.campaigns.map((campaign) => [campaign.id, campaign]),
      );
      const accountRows = snapshot.accountInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientId,
            connection.advertiserId,
            TikTokAdsInsightLevel.ACCOUNT,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.TikTokAdsDailyInsightCreateManyInput => row !== null);
      const campaignRows = snapshot.campaignInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientId,
            connection.advertiserId,
            TikTokAdsInsightLevel.CAMPAIGN,
            row,
            row.campaignId ? campaignCatalogById.get(row.campaignId) ?? null : null,
          ),
        )
        .filter((row): row is Prisma.TikTokAdsDailyInsightCreateManyInput => row !== null);
      const adGroupRows = snapshot.adGroupInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientId,
            connection.advertiserId,
            TikTokAdsInsightLevel.ADGROUP,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.TikTokAdsDailyInsightCreateManyInput => row !== null);
      const adRows = snapshot.adInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientId,
            connection.advertiserId,
            TikTokAdsInsightLevel.AD,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.TikTokAdsDailyInsightCreateManyInput => row !== null);

      const allRows = [...accountRows, ...campaignRows, ...adGroupRows, ...adRows];
      const syncedAt = new Date();
      const syncStatus =
        allRows.length > 0 ? TikTokAdsSyncStatus.SUCCESS : TikTokAdsSyncStatus.PARTIAL;

      await this.prisma.$transaction(async (tx) => {
        await tx.tikTokAdsDailyInsight.deleteMany({
          where: {
            clientProfileId: clientId,
            level: {
              in: [
                TikTokAdsInsightLevel.ACCOUNT,
                TikTokAdsInsightLevel.CAMPAIGN,
                TikTokAdsInsightLevel.ADGROUP,
                TikTokAdsInsightLevel.AD,
              ],
            },
            date: {
              gte: dateRange.since,
              lte: dateRange.until,
            },
          },
        });

        if (allRows.length > 0) {
          await tx.tikTokAdsDailyInsight.createMany({
            data: allRows,
          });
        }

        await tx.clientTikTokAdsConfig.upsert({
          where: { clientProfileId: clientId },
          update: {
            advertiserId: connection.advertiserId,
            connectionStatus: TikTokAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
          create: {
            clientProfileId: clientId,
            advertiserId: connection.advertiserId,
            connectionStatus: TikTokAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
        });

        await tx.tikTokAdsSyncLog.update({
          where: { id: syncLog.id },
          data: {
            status: syncStatus,
            finishedAt: syncedAt,
            recordsFetched: allRows.length,
            apiCallCount: 5,
          },
        });
      });

      return {
        success: true,
        syncedAt,
        dateRange: {
          since: dateRange.sinceIsoDate,
          until: dateRange.untilIsoDate,
        },
        inserted: {
          account: accountRows.length,
          campaigns: campaignRows.length,
          adGroups: adGroupRows.length,
          ads: adRows.length,
          total: allRows.length,
        },
        connectionStatus: TikTokAdsConnectionStatus.CONNECTED,
        lastSyncAt: syncedAt,
        syncStatus,
        skippedReason: null,
      };
    } catch (error) {
      const connectionErrorInfo = this.normalizeConnectionError(error);
      const finishedAt = new Date();
      await this.markConnectionAsError(clientId, connectionErrorInfo, finishedAt);
      await this.prisma.tikTokAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: TikTokAdsSyncStatus.FAILED,
          finishedAt,
          errorCode: connectionErrorInfo.code,
          errorMessage: `[${options.trigger}] ${connectionErrorInfo.adminMessage}`,
        },
      });
      throw this.toConnectionTestException(connectionErrorInfo, {
        revealDetailedError: options.revealDetailedError,
      });
    }
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

  private toConnectionTestException(
    connectionErrorInfo: TikTokAdsConnectionErrorInfo,
    options: { revealDetailedError: boolean } = { revealDetailedError: true },
  ): Error {
    const errorMessage = options.revealDetailedError
      ? connectionErrorInfo.adminMessage
      : CLIENT_SAFE_SYNC_ERROR_MESSAGE;

    if (connectionErrorInfo.code === "PERMISSION_MISSING") {
      return new ForbiddenException(errorMessage);
    }

    if (connectionErrorInfo.code === "TOKEN_INVALID") {
      return new BadRequestException(errorMessage);
    }

    return new BadGatewayException(errorMessage);
  }

  private async resolveReportingConnection(clientId: string): Promise<{
    accessToken: string;
    advertiserId: string;
    lastSyncAt: Date | null;
    connectionStatus: TikTokAdsConnectionStatus;
  }> {
    const snapshot = await this.getConnectionSnapshot(clientId);
    const encryptedAccessToken = snapshot.credential?.accessTokenEnc ?? null;
    const advertiserId = snapshot.config?.advertiserId?.trim() ?? "";

    if (!encryptedAccessToken) {
      throw new BadRequestException(
        "TikTok Ads access token bulunamadı. Sync öncesi müşteriyi bağlayın.",
      );
    }

    if (!advertiserId) {
      throw new BadRequestException(
        "TikTok Ads sync için advertiserId gereklidir.",
      );
    }

    return {
      accessToken: this.tikTokAdsTokenService.decrypt(encryptedAccessToken),
      advertiserId,
      lastSyncAt: snapshot.config?.lastSyncAt ?? null,
      connectionStatus:
        snapshot.config?.connectionStatus ?? TikTokAdsConnectionStatus.NOT_CONNECTED,
    };
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

  private toInsightCreateManyInput(
    clientId: string,
    advertiserId: string,
    level: TikTokAdsInsightLevel,
    row: TikTokAdsApiInsightRow,
    campaignCatalog: TikTokAdsCampaignCatalogItem | null,
  ): Prisma.TikTokAdsDailyInsightCreateManyInput | null {
    const date = this.parseDateToUtcDay(row.dateStart);
    if (!date) {
      return null;
    }

    const entityId = this.resolveEntityIdByLevel(level, row, advertiserId);
    if (!entityId) {
      return null;
    }

    const spend = this.parseMetricNumber(row.spend);
    const impressions = row.impressions ?? null;
    const reach = row.reach ?? null;
    const clicks = row.clicks ?? null;
    const conversions = row.conversions ?? null;
    const videoViews = row.videoViews ?? null;
    const videoViews2s = row.videoViews2s ?? null;
    const videoViews6s = row.videoViews6s ?? null;
    const purchaseValue = this.parseMetricNumber(row.purchaseValue);
    const ctr = this.parseMetricNumber(row.ctr);
    const cpc = this.parseMetricNumber(row.cpc);
    const cpm = this.parseMetricNumber(row.cpm);
    const videoCompletionRate = this.parseMetricNumber(row.videoCompletionRate);
    const vtr = this.parseMetricNumber(row.vtr);
    const costPerConversion = this.parseMetricNumber(row.costPerConversion);
    const conversionRate = this.parseMetricNumber(row.conversionRate);
    const rawPayload: Record<string, unknown> = {
      ...row.raw,
      ...(campaignCatalog
        ? {
            campaignMeta: {
              objective: campaignCatalog.objective,
              status: campaignCatalog.status,
            },
          }
        : {}),
    };

    return {
      clientProfileId: clientId,
      advertiserId,
      date,
      level,
      entityId,
      entityName: this.resolveEntityNameByLevel(level, row, advertiserId),
      spend: this.toPrismaDecimal(spend),
      impressions,
      reach,
      clicks,
      ctr: this.toPrismaDecimal(
        ctr ?? this.roundPercentageByCounts(clicks ?? 0, impressions ?? 0, 6),
      ),
      cpc: this.toPrismaDecimal(cpc ?? this.roundDivision(spend ?? 0, clicks ?? 0, 6)),
      cpm: this.toPrismaDecimal(cpm ?? this.roundMille(spend ?? 0, impressions ?? 0, 6)),
      videoViews,
      videoViews2s,
      videoViews6s,
      videoCompletionRate: this.toPrismaDecimal(videoCompletionRate),
      vtr: this.toPrismaDecimal(vtr),
      conversions,
      costPerConversion: this.toPrismaDecimal(
        costPerConversion ?? this.roundDivision(spend ?? 0, conversions ?? 0, 6),
      ),
      conversionRate: this.toPrismaDecimal(
        conversionRate ?? this.roundPercentageByCounts(conversions ?? 0, clicks ?? 0, 6),
      ),
      purchaseValue: this.toPrismaDecimal(purchaseValue),
      raw: rawPayload as Prisma.InputJsonValue,
    };
  }

  private resolveEntityIdByLevel(
    level: TikTokAdsInsightLevel,
    row: TikTokAdsApiInsightRow,
    advertiserId: string,
  ): string {
    if (level === TikTokAdsInsightLevel.CAMPAIGN) {
      return row.campaignId ?? "";
    }

    if (level === TikTokAdsInsightLevel.ADGROUP) {
      return row.adGroupId ?? "";
    }

    if (level === TikTokAdsInsightLevel.AD) {
      return row.adId ?? "";
    }

    return advertiserId;
  }

  private resolveEntityNameByLevel(
    level: TikTokAdsInsightLevel,
    row: TikTokAdsApiInsightRow,
    advertiserId: string,
  ): string | null {
    if (level === TikTokAdsInsightLevel.CAMPAIGN) {
      return row.campaignName;
    }

    if (level === TikTokAdsInsightLevel.ADGROUP) {
      return row.adGroupName;
    }

    if (level === TikTokAdsInsightLevel.AD) {
      return row.adName;
    }

    return advertiserId;
  }

  private aggregateInsightRows(rows: TikTokAdsDailyInsightModel[]): Omit<
    TikTokAdsSummaryResponse,
    "dateRange" | "lastSyncAt"
  > {
    let spend = 0;
    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    let videoViews = 0;
    let videoViews2s = 0;
    let videoViews6s = 0;
    let conversions = 0;
    let purchaseValue = 0;

    for (const row of rows) {
      spend += this.readDecimalAsNumber(row.spend);
      impressions += row.impressions ?? 0;
      reach += row.reach ?? 0;
      clicks += row.clicks ?? 0;
      videoViews += row.videoViews ?? 0;
      videoViews2s += row.videoViews2s ?? 0;
      videoViews6s += row.videoViews6s ?? 0;
      conversions += row.conversions ?? 0;
      purchaseValue += this.readDecimalAsNumber(row.purchaseValue);
    }

    return {
      spend: this.round(spend),
      impressions,
      reach,
      clicks,
      ctr: this.roundPercentageByCounts(clicks, impressions),
      cpc: this.roundDivision(spend, clicks),
      cpm: this.roundMille(spend, impressions),
      videoViews,
      videoViews2s,
      videoViews6s,
      videoCompletionRate: this.roundPercentageByCounts(videoViews6s, videoViews),
      vtr: this.roundPercentageByCounts(videoViews, impressions),
      conversions,
      costPerConversion: this.roundDivision(spend, conversions),
      conversionRate: this.roundPercentageByCounts(conversions, clicks),
      purchaseValue: this.round(purchaseValue),
    };
  }

  private toInsightItem(insight: TikTokAdsDailyInsightModel): TikTokAdsInsightItem {
    return {
      id: insight.id,
      date: insight.date.toISOString(),
      level: insight.level,
      entityId: insight.entityId,
      entityName: insight.entityName,
      spend: this.round(this.readDecimalAsNumber(insight.spend)),
      impressions: insight.impressions ?? 0,
      reach: insight.reach ?? 0,
      clicks: insight.clicks ?? 0,
      ctr: this.round(this.readDecimalAsNumber(insight.ctr)),
      cpc: this.round(this.readDecimalAsNumber(insight.cpc)),
      cpm: this.round(this.readDecimalAsNumber(insight.cpm)),
      videoViews: insight.videoViews ?? 0,
      videoViews2s: insight.videoViews2s ?? 0,
      videoViews6s: insight.videoViews6s ?? 0,
      videoCompletionRate: this.round(this.readDecimalAsNumber(insight.videoCompletionRate)),
      vtr: this.round(this.readDecimalAsNumber(insight.vtr)),
      conversions: insight.conversions ?? 0,
      costPerConversion: this.round(this.readDecimalAsNumber(insight.costPerConversion)),
      conversionRate: this.round(this.readDecimalAsNumber(insight.conversionRate)),
      purchaseValue: this.round(this.readDecimalAsNumber(insight.purchaseValue)),
      updatedAt: insight.updatedAt.toISOString(),
    };
  }

  private extractCampaignMetaFromRaw(raw: Prisma.JsonValue | null): {
    objective: string | null;
    status: string | null;
  } {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { objective: null, status: null };
    }

    const record = raw as Record<string, unknown>;
    const meta = record.campaignMeta;
    const metaRecord = meta && typeof meta === "object" && !Array.isArray(meta)
      ? (meta as Record<string, unknown>)
      : null;

    return {
      objective: this.readUnknownString(metaRecord?.objective ?? record.objective),
      status: this.readUnknownString(metaRecord?.status ?? record.status),
    };
  }

  private resolveTokenExpiresAt(value: string | undefined, now = new Date()): Date {
    if (value) {
      return new Date(value);
    }

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_TIKTOK_TOKEN_LIFETIME_DAYS);
    return expiresAt;
  }

  private resolveReportDateRange(query: TikTokAdsDateRangeQueryDto): TikTokAdsReportDateRange {
    const resolvedUntil = query.until
      ? this.parseDateToUtcDay(query.until)
      : this.startOfUtcToday();
    if (!resolvedUntil) {
      throw new BadRequestException("Geçersiz since/until tarih aralığı.");
    }

    const resolvedSince = query.since
      ? this.parseDateToUtcDay(query.since)
      : this.addDaysUtc(resolvedUntil, -(DEFAULT_REPORTING_RANGE_DAYS - 1));
    if (!resolvedSince) {
      throw new BadRequestException("Geçersiz since/until tarih aralığı.");
    }

    if (resolvedSince.getTime() > resolvedUntil.getTime()) {
      throw new BadRequestException("since değeri until değerinden sonra olamaz.");
    }

    const daySpan = this.diffDaysInclusive(resolvedSince, resolvedUntil);
    if (daySpan > MAX_REPORTING_RANGE_DAYS) {
      throw new BadRequestException(
        `TikTok Ads reporting aralığı ${MAX_REPORTING_RANGE_DAYS} günü aşamaz.`,
      );
    }

    return {
      since: resolvedSince,
      until: resolvedUntil,
      sinceIsoDate: this.formatDateAsIsoDay(resolvedSince),
      untilIsoDate: this.formatDateAsIsoDay(resolvedUntil),
    };
  }

  private parseDateToUtcDay(value: string): Date | null {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
    );
  }

  private formatDateAsIsoDay(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private startOfUtcToday(): Date {
    return this.parseDateToUtcDay(new Date().toISOString()) ?? new Date();
  }

  private addDaysUtc(base: Date, days: number): Date {
    const next = new Date(base);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private diffDaysInclusive(since: Date, until: Date): number {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    return Math.floor((until.getTime() - since.getTime()) / millisecondsInDay) + 1;
  }

  private resolveSyncSkipReason(lastSyncAt: Date | null, now: Date): string | null {
    if (!lastSyncAt) {
      return null;
    }

    const elapsedMs = now.getTime() - lastSyncAt.getTime();
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      return null;
    }

    const syncTtlMinutes = this.getSyncTtlMinutes();
    const ttlMs = syncTtlMinutes * 60 * 1000;
    if (elapsedMs >= ttlMs) {
      return null;
    }

    const remainingMinutes = Math.max(Math.ceil((ttlMs - elapsedMs) / (60 * 1000)), 1);
    return `Son senkron çok yeni. Yaklaşık ${remainingMinutes} dakika sonra tekrar deneyin.`;
  }

  private getSyncTtlMinutes(): number {
    const configuredValue = this.configService.get<string | number | undefined>(
      "TIKTOK_ADS_SYNC_TTL_MINUTES",
    );

    if (typeof configuredValue === "number" && Number.isFinite(configuredValue)) {
      return Math.max(1, Math.trunc(configuredValue));
    }

    if (typeof configuredValue === "string") {
      const parsed = Number.parseInt(configuredValue.trim(), 10);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return Math.max(1, parsed);
      }
    }

    return DEFAULT_TIKTOK_ADS_SYNC_TTL_MINUTES;
  }

  private parseMetricNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const normalized = value.trim().replace(",", ".");
    if (normalized.length === 0) {
      return null;
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toPrismaDecimal(value: number | null): Prisma.Decimal | null {
    if (value === null || !Number.isFinite(value)) {
      return null;
    }

    return new Prisma.Decimal(value.toFixed(6));
  }

  private readDecimalAsNumber(value: Prisma.Decimal | null): number {
    return value ? value.toNumber() : 0;
  }

  private round(value: number, digits = 2): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const scale = 10 ** digits;
    return Math.round(value * scale) / scale;
  }

  private roundDivision(numerator: number, denominator: number, digits = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round(numerator / denominator, digits);
  }

  private roundPercentageByCounts(numerator: number, denominator: number, digits = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round((numerator / denominator) * 100, digits);
  }

  private roundMille(spend: number, impressions: number, digits = 2): number {
    if (!Number.isFinite(spend) || !Number.isFinite(impressions) || impressions <= 0) {
      return 0;
    }

    return this.round((spend * 1000) / impressions, digits);
  }

  private readUnknownString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
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
