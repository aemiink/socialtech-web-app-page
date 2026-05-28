import {
  AccountType,
  AmazonAdsConnectionStatus,
  AmazonAdsInsightLevel,
  AmazonAdsProductType,
  AmazonAdsRegion,
  AmazonAdsSyncStatus,
  DeliveryReleaseApprovalStatus,
  MetaAdsApprovalStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TaskStatus,
  TaskType,
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
  AmazonAdsApiInsightRow,
  AmazonAdsProfile,
  NormalizedAmazonAdsApiError,
} from "./amazon-ads-api.service";
import { AmazonAdsTokenService } from "./amazon-ads-token.service";
import { AmazonAdsCampaignsQueryDto } from "./dto/amazon-ads-campaigns-query.dto";
import { AmazonAdsDateRangeQueryDto } from "./dto/amazon-ads-date-range-query.dto";
import { AmazonAdsInsightsQueryDto } from "./dto/amazon-ads-insights-query.dto";
import { AmazonAdsOAuthStartQueryDto } from "./dto/amazon-ads-oauth-start-query.dto";
import { AmazonAdsProductsQueryDto } from "./dto/amazon-ads-products-query.dto";
import { AmazonAdsSyncLogsQueryDto } from "./dto/amazon-ads-sync-logs-query.dto";
import { ConnectManualAmazonAdsDto } from "./dto/connect-manual-amazon-ads.dto";
import { ExchangeAmazonAdsOAuthCodeDto } from "./dto/exchange-amazon-ads-oauth-code.dto";
import { TestAmazonAdsConnectionDto } from "./dto/test-amazon-ads-connection.dto";
import { UpdateAmazonAdsConfigDto } from "./dto/update-amazon-ads-config.dto";

const AMAZON_ADS_CONFIG_READ_ANY_PERMISSION = "amazonAds.config.read.any";
const AMAZON_ADS_CONFIG_MANAGE_ANY_PERMISSION = "amazonAds.config.manage.any";
const AMAZON_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "amazonAds.config.read.assigned";
const AMAZON_ADS_CONFIG_READ_OWN_PERMISSION = "amazonAds.config.read.own";
const AMAZON_ADS_REPORTING_READ_ANY_PERMISSION = "amazonAds.reporting.read.any";
const AMAZON_ADS_REPORTING_READ_ASSIGNED_PERMISSION = "amazonAds.reporting.read.assigned";
const AMAZON_ADS_REPORTING_READ_OWN_PERMISSION = "amazonAds.reporting.read.own";
const AMAZON_ADS_SYNC_RUN_ANY_PERMISSION = "amazonAds.sync.run.any";
const AMAZON_ADS_SYNC_READ_ASSIGNED_PERMISSION = "amazonAds.sync.read.assigned";
const CLIENT_SAFE_SYNC_ERROR_MESSAGE = "Bağlantı problemi var, ekibimiz ilgileniyor.";
const DEFAULT_REPORTING_RANGE_DAYS = 7;
const MAX_REPORTING_RANGE_DAYS = 31;
const DEFAULT_CAMPAIGNS_LIMIT = 25;
const DEFAULT_PRODUCTS_LIMIT = 25;
const DEFAULT_INSIGHTS_LIMIT = 100;
const DEFAULT_AMAZON_ADS_SYNC_TTL_MINUTES = 30;
const DEFAULT_AMAZON_ADS_FAILED_SYNC_RETRY_COOLDOWN_MINUTES = 10;

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

const amazonAdsDailyInsightSelect = {
  id: true,
  clientProfileId: true,
  profileId: true,
  marketplaceId: true,
  date: true,
  level: true,
  entityId: true,
  entityName: true,
  adProduct: true,
  spend: true,
  impressions: true,
  clicks: true,
  sales: true,
  orders: true,
  unitsSold: true,
  ctr: true,
  cpc: true,
  acos: true,
  roas: true,
  conversionRate: true,
  raw: true,
  updatedAt: true,
} satisfies Prisma.AmazonAdsDailyInsightSelect;

const amazonAdsSyncLogSelect = {
  id: true,
  clientProfileId: true,
  profileId: true,
  status: true,
  trigger: true,
  startedAt: true,
  finishedAt: true,
  errorCode: true,
  errorMessage: true,
  recordsFetched: true,
  apiCallCount: true,
  reportStatuses: true,
  createdAt: true,
} satisfies Prisma.AmazonAdsSyncLogSelect;

type AdminAmazonAdsConfigModel = Prisma.ClientAmazonAdsConfigGetPayload<{
  select: typeof adminAmazonAdsConfigSelect;
}>;

type AmazonAdsCredentialSummaryModel = Prisma.ClientAmazonAdsCredentialGetPayload<{
  select: typeof amazonAdsCredentialSummarySelect;
}>;

type AmazonAdsDailyInsightModel = Prisma.AmazonAdsDailyInsightGetPayload<{
  select: typeof amazonAdsDailyInsightSelect;
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

type AmazonAdsReportDateRange = {
  since: Date;
  until: Date;
  sinceIsoDate: string;
  untilIsoDate: string;
};

type AmazonAdsSummaryResponse = {
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  unitsSold: number;
  ctr: number;
  cpc: number;
  acos: number;
  roas: number;
  conversionRate: number;
  dateRange: { since: string; until: string };
  lastSyncAt: Date | null;
};

type AmazonAdsCampaignSummary = {
  id: string;
  name: string;
  adProduct: AmazonAdsProductType | null;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

type AmazonAdsCampaignsResponse = {
  data: AmazonAdsCampaignSummary[];
  dateRange: { since: string; until: string };
  lastSyncAt: Date | null;
};

type AmazonAdsProductSummary = {
  asin: string | null;
  sku: string | null;
  title: string | null;
  spend: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

type AmazonAdsProductsResponse = {
  data: AmazonAdsProductSummary[];
  dateRange: { since: string; until: string };
  lastSyncAt: Date | null;
};

type AmazonAdsInsightItem = {
  id: string;
  date: string;
  level: AmazonAdsInsightLevel;
  entityId: string;
  entityName: string | null;
  adProduct: AmazonAdsProductType | null;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  unitsSold: number;
  ctr: number;
  cpc: number;
  acos: number;
  roas: number;
  conversionRate: number;
  campaignId: string | null;
  campaignName: string | null;
  adGroupId: string | null;
  adGroupName: string | null;
  keywordId: string | null;
  keywordText: string | null;
  keywordType: string | null;
  matchType: string | null;
  targeting: string | null;
  searchTerm: string | null;
  reportTypeId: string | null;
  updatedAt: string;
};

type AmazonAdsInsightsResponse = {
  data: AmazonAdsInsightItem[];
  level: AmazonAdsInsightLevel;
  dateRange: { since: string; until: string };
  lastSyncAt: Date | null;
};

type AmazonAdsSyncResponse = {
  success: true;
  syncedAt: Date;
  dateRange: { since: string; until: string };
  inserted: {
    account: number;
    campaigns: number;
    products: number;
    searchTerms: number;
    total: number;
  };
  connectionStatus: AmazonAdsConnectionStatus;
  lastSyncAt: Date | null;
  syncStatus: AmazonAdsSyncStatus;
  skippedReason: string | null;
};

type AmazonAdsSyncTrigger =
  | "MANUAL_SYNC"
  | "SCHEDULED_SYNC"
  | "ON_DEMAND_CLIENT_REFRESH"
  | "ON_DEMAND_ASSIGNED_REFRESH"
  | "ERROR_RETRY";

type AmazonAdsConnectionErrorCode =
  | "TOKEN_EXPIRED_OR_REVOKED"
  | "PERMISSION_DENIED"
  | "PROFILE_NOT_FOUND"
  | "MARKETPLACE_MISMATCH"
  | "INVALID_PROFILE_ID"
  | "REPORT_GENERATION_FAILED"
  | "REPORT_NOT_READY"
  | "RATE_LIMIT"
  | "UNKNOWN_API_ERROR";

type AmazonAdsConnectionErrorInfo = {
  code: AmazonAdsConnectionErrorCode;
  category: NormalizedAmazonAdsApiError["category"];
  adminMessage: string;
  clientMessage: string;
};

type AdminAmazonAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: string;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: AmazonAdsConnectionStatus;
  hasRefreshToken: boolean;
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
  spendSummary: {
    spend: number;
    sales: number;
    impressions: number;
    clicks: number;
    orders: number;
    acos: number;
    roas: number;
  };
  pendingApprovals: number;
  assignedEmployees: Array<{
    userId: string;
    email: string;
    displayName: string | null;
    role: UserRole;
    scope: string;
  }>;
  actionContext: {
    amazonAdsProjectId: string | null;
  };
};

type AdminAmazonAdsClientListResponse = {
  data: AdminAmazonAdsClientListItem[];
  dateRange: {
    since: string;
    until: string;
  };
  meta: {
    total: number;
    connected: number;
    error: number;
    pendingApprovals: number;
  };
};

type AdminAmazonAdsSyncLogItem = {
  id: string;
  clientProfileId: string;
  clientCompanyName: string;
  profileId: string | null;
  status: AmazonAdsSyncStatus;
  trigger: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  recordsFetched: number | null;
  apiCallCount: number | null;
  reportStatus: string | null;
  createdAt: Date;
};

type AdminAmazonAdsSyncLogsResponse = {
  data: AdminAmazonAdsSyncLogItem[];
  meta: {
    total: number;
    failed: number;
    running: number;
    skipped: number;
  };
};

type AmazonAdsReportingConnection = {
  refreshToken: string;
  profileId: string;
  marketplaceId: string | null;
  region: AmazonAdsRegion;
  lastSyncAt: Date | null;
  connectionStatus: AmazonAdsConnectionStatus;
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

  async getAdminAmazonAdsClients(
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsClientListResponse> {
    this.assertCanReadAnyConfig(actor);
    const dateRange = this.resolveReportDateRange(query);

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        companyName: true,
        status: true,
        purchasedServices: {
          where: {
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
          select: {
            status: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
        amazonAdsConfig: {
          select: adminAmazonAdsConfigSelect,
        },
        amazonAdsCredential: {
          select: amazonAdsCredentialSummarySelect,
        },
        employeeAssignments: {
          where: {
            isActive: true,
          },
          select: {
            scope: true,
            employeeUser: {
              select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                status: true,
              },
            },
          },
        },
        projects: {
          where: {
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
          select: {
            id: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        companyName: "asc",
      },
    });

    const clientProfileIds = clients.map((client) => client.id);
    if (clientProfileIds.length === 0) {
      return {
        data: [],
        dateRange: {
          since: dateRange.sinceIsoDate,
          until: dateRange.untilIsoDate,
        },
        meta: {
          total: 0,
          connected: 0,
          error: 0,
          pendingApprovals: 0,
        },
      };
    }

    const [insightsByClient, pendingTasks, pendingReleaseApprovals] = await Promise.all([
      this.prisma.amazonAdsDailyInsight.groupBy({
        by: ["clientProfileId"],
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
          level: AmazonAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        _sum: {
          spend: true,
          sales: true,
          impressions: true,
          clicks: true,
          orders: true,
        },
      }),
      this.prisma.task.findMany({
        where: {
          OR: [
            {
              approvalRequired: true,
              approvalStatus: MetaAdsApprovalStatus.PENDING,
            },
            {
              status: TaskStatus.REVIEW,
              type: TaskType.REVISION,
            },
          ],
          project: {
            clientProfileId: {
              in: clientProfileIds,
            },
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
        },
        select: {
          project: {
            select: {
              clientProfileId: true,
            },
          },
        },
      }),
      this.prisma.deliveryRelease.findMany({
        where: {
          approvalStatus: DeliveryReleaseApprovalStatus.PENDING,
          project: {
            clientProfileId: {
              in: clientProfileIds,
            },
            serviceKey: PurchasedServiceKey.AMAZON_ADS,
          },
        },
        select: {
          project: {
            select: {
              clientProfileId: true,
            },
          },
        },
      }),
    ]);

    const insightTotalsByClientId = new Map<
      string,
      {
        spend: number;
        sales: number;
        impressions: number;
        clicks: number;
        orders: number;
      }
    >();
    for (const row of insightsByClient) {
      insightTotalsByClientId.set(row.clientProfileId, {
        spend: this.readDecimalAsNumber(row._sum.spend),
        sales: this.readDecimalAsNumber(row._sum.sales),
        impressions: row._sum.impressions ?? 0,
        clicks: row._sum.clicks ?? 0,
        orders: row._sum.orders ?? 0,
      });
    }

    const pendingApprovalsByClientId = new Map<string, number>();
    for (const pendingTask of pendingTasks) {
      const clientProfileId = pendingTask.project.clientProfileId;
      pendingApprovalsByClientId.set(
        clientProfileId,
        (pendingApprovalsByClientId.get(clientProfileId) ?? 0) + 1,
      );
    }
    for (const pendingRelease of pendingReleaseApprovals) {
      const clientProfileId = pendingRelease.project.clientProfileId;
      pendingApprovalsByClientId.set(
        clientProfileId,
        (pendingApprovalsByClientId.get(clientProfileId) ?? 0) + 1,
      );
    }

    const data: AdminAmazonAdsClientListItem[] = clients.map((client) => {
      const config = client.amazonAdsConfig;
      const insightTotals = insightTotalsByClientId.get(client.id);
      const spend = insightTotals?.spend ?? 0;
      const sales = insightTotals?.sales ?? 0;

      return {
        client: {
          id: client.id,
          slug: client.slug,
          companyName: client.companyName,
          status: client.status,
        },
        serviceStatus: client.purchasedServices[0]?.status ?? PurchasedServiceStatus.INACTIVE,
        connectionStatus: config?.connectionStatus ?? AmazonAdsConnectionStatus.NOT_CONNECTED,
        hasRefreshToken: Boolean(client.amazonAdsCredential?.refreshTokenEnc),
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
        spendSummary: {
          spend: this.round(spend),
          sales: this.round(sales),
          impressions: insightTotals?.impressions ?? 0,
          clicks: insightTotals?.clicks ?? 0,
          orders: insightTotals?.orders ?? 0,
          acos: this.roundPercentageByValue(spend, sales),
          roas: this.roundDivision(sales, spend),
        },
        pendingApprovals: pendingApprovalsByClientId.get(client.id) ?? 0,
        assignedEmployees: client.employeeAssignments
          .filter((assignment) => assignment.employeeUser.status === "ACTIVE")
          .map((assignment) => ({
            userId: assignment.employeeUser.id,
            email: assignment.employeeUser.email,
            displayName: assignment.employeeUser.displayName,
            role: assignment.employeeUser.role,
            scope: assignment.scope,
          })),
        actionContext: {
          amazonAdsProjectId: client.projects[0]?.id ?? null,
        },
      };
    });

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      meta: {
        total: data.length,
        connected: data.filter(
          (item) => item.connectionStatus === AmazonAdsConnectionStatus.CONNECTED,
        ).length,
        error: data.filter((item) => item.connectionStatus === AmazonAdsConnectionStatus.ERROR)
          .length,
        pendingApprovals: data.reduce((total, item) => total + item.pendingApprovals, 0),
      },
    };
  }

  async getAdminSyncLogs(
    query: AmazonAdsSyncLogsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AdminAmazonAdsSyncLogsResponse> {
    this.assertCanReadAnyConfig(actor);

    const requestedStatus = this.normalizeSyncStatusQuery(query.status);
    const failedOnly = this.normalizeBooleanQuery(query.failedOnly);
    const statusFilter =
      requestedStatus !== undefined
        ? requestedStatus
        : failedOnly
          ? {
              in: [AmazonAdsSyncStatus.FAILED, AmazonAdsSyncStatus.PARTIAL],
            }
          : undefined;

    const where: Prisma.AmazonAdsSyncLogWhereInput = {
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    };
    const take = this.normalizeLimitQuery(query.limit, 40);

    const [rows, total, failed, running, skipped] = await Promise.all([
      this.prisma.amazonAdsSyncLog.findMany({
        where,
        select: {
          ...amazonAdsSyncLogSelect,
          clientProfile: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take,
      }),
      this.prisma.amazonAdsSyncLog.count({ where }),
      this.prisma.amazonAdsSyncLog.count({
        where: {
          ...where,
          status: {
            in: [AmazonAdsSyncStatus.FAILED, AmazonAdsSyncStatus.PARTIAL],
          },
        },
      }),
      this.prisma.amazonAdsSyncLog.count({
        where: {
          ...where,
          status: AmazonAdsSyncStatus.RUNNING,
        },
      }),
      this.prisma.amazonAdsSyncLog.count({
        where: {
          ...where,
          status: AmazonAdsSyncStatus.SKIPPED,
        },
      }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        clientProfileId: row.clientProfileId,
        clientCompanyName: row.clientProfile.companyName,
        profileId: row.profileId,
        status: row.status,
        trigger: row.trigger,
        startedAt: row.startedAt,
        finishedAt: row.finishedAt,
        durationMs:
          row.finishedAt !== null ? row.finishedAt.getTime() - row.startedAt.getTime() : null,
        errorCode: row.errorCode,
        errorMessage: row.errorMessage,
        recordsFetched: row.recordsFetched,
        apiCallCount: row.apiCallCount,
        reportStatus: this.resolveReportStatusLabel(row.reportStatuses),
        createdAt: row.createdAt,
      })),
      meta: {
        total,
        failed,
        running,
        skipped,
      },
    };
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
      const connectionErrorInfo = this.normalizeConnectionError(error);
      await this.markConnectionAsError(clientId, connectionErrorInfo);
      throw this.toConnectionTestException(connectionErrorInfo);
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

  async getAdminClientSummary(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSummaryResponse> {
    this.assertCanReadAnyConfig(actor);
    this.assertCanReadAnyReporting(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getSummaryByClientProfileId(clientId, query);
  }

  async getAdminClientCampaigns(
    clientId: string,
    query: AmazonAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsCampaignsResponse> {
    this.assertCanReadAnyConfig(actor);
    this.assertCanReadAnyReporting(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getCampaignsByClientProfileId(clientId, query);
  }

  async getAdminClientProducts(
    clientId: string,
    query: AmazonAdsProductsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsProductsResponse> {
    this.assertCanReadAnyConfig(actor);
    this.assertCanReadAnyReporting(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getProductsByClientProfileId(clientId, query);
  }

  async getAdminClientInsights(
    clientId: string,
    query: AmazonAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsInsightsResponse> {
    this.assertCanReadAnyConfig(actor);
    this.assertCanReadAnyReporting(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getInsightsByClientProfileId(clientId, query);
  }

  async syncAdminClientInsights(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSyncResponse> {
    this.assertCanManageAnyConfig(actor);
    this.assertCanRunAnySync(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.syncInsightsByClientProfileId(clientId, query, {
      trigger: "MANUAL_SYNC",
      applySyncTtl: false,
      applyFailedSyncCooldown: false,
      revealDetailedError: true,
    });
  }

  async retryAdminClientInsights(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSyncResponse> {
    this.assertCanManageAnyConfig(actor);
    this.assertCanRunAnySync(actor);
    await this.assertClientExists(clientId);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.syncInsightsByClientProfileId(clientId, query, {
      trigger: "ERROR_RETRY",
      applySyncTtl: false,
      applyFailedSyncCooldown: false,
      revealDetailedError: true,
    });
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

  async getAssignedClientSummary(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSummaryResponse> {
    this.assertCanReadAssignedConfig(actor);
    this.assertCanReadAssignedReporting(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getSummaryByClientProfileId(clientId, query);
  }

  async getAssignedClientCampaigns(
    clientId: string,
    query: AmazonAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsCampaignsResponse> {
    this.assertCanReadAssignedConfig(actor);
    this.assertCanReadAssignedReporting(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getCampaignsByClientProfileId(clientId, query);
  }

  async getAssignedClientProducts(
    clientId: string,
    query: AmazonAdsProductsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsProductsResponse> {
    this.assertCanReadAssignedConfig(actor);
    this.assertCanReadAssignedReporting(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getProductsByClientProfileId(clientId, query);
  }

  async getAssignedClientInsights(
    clientId: string,
    query: AmazonAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsInsightsResponse> {
    this.assertCanReadAssignedConfig(actor);
    this.assertCanReadAssignedReporting(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.getInsightsByClientProfileId(clientId, query);
  }

  async syncAssignedClientInsights(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSyncResponse> {
    this.assertCanReadAssignedConfig(actor);
    this.assertCanReadAssignedSync(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    await this.assertClientHasActiveAmazonAdsService(clientId);

    return this.syncInsightsByClientProfileId(clientId, query, {
      trigger: "ON_DEMAND_ASSIGNED_REFRESH",
      applySyncTtl: true,
      applyFailedSyncCooldown: true,
      revealDetailedError: true,
    });
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

  async getOwnClientSummary(
    query: AmazonAdsDateRangeQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsSummaryResponse> {
    this.assertCanReadOwnConfig(actor);
    this.assertCanReadOwnReporting(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveAmazonAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getOwnClientCampaigns(
    query: AmazonAdsCampaignsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsCampaignsResponse> {
    this.assertCanReadOwnConfig(actor);
    this.assertCanReadOwnReporting(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveAmazonAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientProducts(
    query: AmazonAdsProductsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsProductsResponse> {
    this.assertCanReadOwnConfig(actor);
    this.assertCanReadOwnReporting(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveAmazonAdsService(clientProfileId);

    return this.getProductsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientInsights(
    query: AmazonAdsInsightsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<AmazonAdsInsightsResponse> {
    this.assertCanReadOwnConfig(actor);
    this.assertCanReadOwnReporting(actor);
    const clientProfileId = this.getClientProfileIdOrFail(actor);
    await this.assertClientExists(clientProfileId);
    await this.assertClientHasActiveAmazonAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
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

  private async getSummaryByClientProfileId(
    clientId: string,
    query: AmazonAdsDateRangeQueryDto,
  ): Promise<AmazonAdsSummaryResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.amazonAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level: AmazonAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: amazonAdsDailyInsightSelect,
        orderBy: { date: "asc" },
      }),
      this.prisma.clientAmazonAdsConfig.findUnique({
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
    query: AmazonAdsCampaignsQueryDto,
  ): Promise<AmazonAdsCampaignsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_CAMPAIGNS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.amazonAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level: AmazonAdsInsightLevel.CAMPAIGN,
          ...(query.adProduct ? { adProduct: query.adProduct } : {}),
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: amazonAdsDailyInsightSelect,
      }),
      this.prisma.clientAmazonAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: { lastSyncAt: true },
      }),
    ]);

    const campaignMap = new Map<string, AmazonAdsCampaignSummary>();
    for (const insight of insights) {
      const key = `${insight.adProduct ?? "UNKNOWN"}:${insight.entityId}`;
      const existing = campaignMap.get(key);
      const spend = this.readDecimalAsNumber(insight.spend);
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const sales = this.readDecimalAsNumber(insight.sales);
      const orders = insight.orders ?? 0;
      const rawMeta = this.extractCampaignMetaFromRaw(insight.raw);

      if (!existing) {
        campaignMap.set(key, {
          id: insight.entityId,
          name: insight.entityName ?? insight.entityId,
          adProduct: insight.adProduct,
          status: rawMeta.status ?? "UNKNOWN",
          spend,
          impressions,
          clicks,
          sales,
          orders,
          acos: this.roundPercentageByValue(spend, sales),
          roas: this.roundDivision(sales, spend),
        });
        continue;
      }

      existing.spend += spend;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.sales += sales;
      existing.orders += orders;
      existing.acos = this.roundPercentageByValue(existing.spend, existing.sales);
      existing.roas = this.roundDivision(existing.sales, existing.spend);
      existing.name = insight.entityName ?? existing.name;
      existing.status = rawMeta.status ?? existing.status;
    }

    return {
      data: Array.from(campaignMap.values())
        .sort((left, right) => right.spend - left.spend)
        .slice(0, limit)
        .map((campaign) => ({
          ...campaign,
          spend: this.round(campaign.spend),
          sales: this.round(campaign.sales),
          acos: this.round(campaign.acos),
          roas: this.round(campaign.roas),
        })),
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getProductsByClientProfileId(
    clientId: string,
    query: AmazonAdsProductsQueryDto,
  ): Promise<AmazonAdsProductsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_PRODUCTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.amazonAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level: AmazonAdsInsightLevel.PRODUCT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: amazonAdsDailyInsightSelect,
      }),
      this.prisma.clientAmazonAdsConfig.findUnique({
        where: { clientProfileId: clientId },
        select: { lastSyncAt: true },
      }),
    ]);

    const productMap = new Map<string, AmazonAdsProductSummary>();
    for (const insight of insights) {
      const rawMeta = this.extractProductMetaFromRaw(insight.raw);
      const key = rawMeta.asin ?? rawMeta.sku ?? insight.entityId;
      const existing = productMap.get(key);
      const spend = this.readDecimalAsNumber(insight.spend);
      const clicks = insight.clicks ?? 0;
      const sales = this.readDecimalAsNumber(insight.sales);
      const orders = insight.orders ?? 0;

      if (!existing) {
        productMap.set(key, {
          asin: rawMeta.asin,
          sku: rawMeta.sku,
          title: rawMeta.title ?? insight.entityName,
          spend,
          clicks,
          sales,
          orders,
          acos: this.roundPercentageByValue(spend, sales),
          roas: this.roundDivision(sales, spend),
        });
        continue;
      }

      existing.spend += spend;
      existing.clicks += clicks;
      existing.sales += sales;
      existing.orders += orders;
      existing.acos = this.roundPercentageByValue(existing.spend, existing.sales);
      existing.roas = this.roundDivision(existing.sales, existing.spend);
      existing.title = existing.title ?? rawMeta.title ?? insight.entityName;
      existing.asin = existing.asin ?? rawMeta.asin;
      existing.sku = existing.sku ?? rawMeta.sku;
    }

    return {
      data: Array.from(productMap.values())
        .sort((left, right) => right.sales - left.sales)
        .slice(0, limit)
        .map((product) => ({
          ...product,
          spend: this.round(product.spend),
          sales: this.round(product.sales),
          acos: this.round(product.acos),
          roas: this.round(product.roas),
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
    query: AmazonAdsInsightsQueryDto,
  ): Promise<AmazonAdsInsightsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const level = query.level ?? AmazonAdsInsightLevel.ACCOUNT;
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.amazonAdsDailyInsight.findMany({
        where: {
          clientProfileId: clientId,
          level,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: amazonAdsDailyInsightSelect,
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
        take: limit,
      }),
      this.prisma.clientAmazonAdsConfig.findUnique({
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
    query: AmazonAdsDateRangeQueryDto,
    options: {
      trigger: AmazonAdsSyncTrigger;
      applySyncTtl: boolean;
      applyFailedSyncCooldown: boolean;
      revealDetailedError: boolean;
    },
  ): Promise<AmazonAdsSyncResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const startedAt = new Date();
    const syncLog = await this.prisma.amazonAdsSyncLog.create({
      data: {
        clientProfileId: clientId,
        status: AmazonAdsSyncStatus.RUNNING,
        trigger: options.trigger,
        startedAt,
      },
      select: { id: true },
    });

    try {
      const connection = await this.resolveReportingConnection(clientId);
      await this.prisma.amazonAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          profileId: connection.profileId,
        },
      });

      if (options.applySyncTtl) {
        const skipReason = this.resolveSyncSkipReason(connection.lastSyncAt, startedAt);
        if (skipReason) {
          await this.prisma.amazonAdsSyncLog.update({
            where: { id: syncLog.id },
            data: {
              status: AmazonAdsSyncStatus.SKIPPED,
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
              products: 0,
              searchTerms: 0,
              total: 0,
            },
            connectionStatus: connection.connectionStatus,
            lastSyncAt: connection.lastSyncAt,
            syncStatus: AmazonAdsSyncStatus.SKIPPED,
            skippedReason: skipReason,
          };
        }
      }

      if (options.applyFailedSyncCooldown) {
        const failedSyncCooldownReason = await this.resolveFailedSyncCooldownReason(
          clientId,
          startedAt,
        );
        if (failedSyncCooldownReason) {
          await this.prisma.amazonAdsSyncLog.update({
            where: { id: syncLog.id },
            data: {
              status: AmazonAdsSyncStatus.SKIPPED,
              finishedAt: startedAt,
              errorCode: "FAILED_SYNC_COOLDOWN_ACTIVE",
              errorMessage: `[${options.trigger}] ${failedSyncCooldownReason}`,
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
              products: 0,
              searchTerms: 0,
              total: 0,
            },
            connectionStatus: connection.connectionStatus,
            lastSyncAt: connection.lastSyncAt,
            syncStatus: AmazonAdsSyncStatus.SKIPPED,
            skippedReason: failedSyncCooldownReason,
          };
        }
      }

      const snapshot = await this.amazonAdsApiService.fetchReportingSnapshot({
        refreshToken: connection.refreshToken,
        profileId: connection.profileId,
        region: connection.region,
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      });
      const mergedSnapshotRows = this.mergeApiInsightRows(snapshot.rows);
      const detailRows = mergedSnapshotRows
        .map((row) => this.toInsightCreateManyInput(clientId, connection, row))
        .filter((row): row is Prisma.AmazonAdsDailyInsightCreateManyInput => row !== null);
      const accountRows = this.buildAccountInsightRows(clientId, connection, mergedSnapshotRows);
      const allRows = [...accountRows, ...detailRows];
      const syncedAt = new Date();
      const hasReportFailures = snapshot.reportStatuses.some(
        (status) => status.status === "FAILED",
      );
      const syncStatus = hasReportFailures
        ? AmazonAdsSyncStatus.PARTIAL
        : AmazonAdsSyncStatus.SUCCESS;

      await this.prisma.$transaction(async (tx) => {
        await tx.amazonAdsDailyInsight.deleteMany({
          where: {
            clientProfileId: clientId,
            date: {
              gte: dateRange.since,
              lte: dateRange.until,
            },
            level: {
              in: [
                AmazonAdsInsightLevel.ACCOUNT,
                AmazonAdsInsightLevel.CAMPAIGN,
                AmazonAdsInsightLevel.PRODUCT,
                AmazonAdsInsightLevel.SEARCH_TERM,
              ],
            },
          },
        });

        if (allRows.length > 0) {
          await tx.amazonAdsDailyInsight.createMany({ data: allRows });
        }

        await tx.clientAmazonAdsConfig.upsert({
          where: { clientProfileId: clientId },
          update: {
            connectionStatus: AmazonAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
          create: {
            clientProfileId: clientId,
            profileId: connection.profileId,
            marketplaceId: connection.marketplaceId,
            region: connection.region,
            connectionStatus: AmazonAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
        });

        await tx.amazonAdsSyncLog.update({
          where: { id: syncLog.id },
          data: {
            status: syncStatus,
            finishedAt: syncedAt,
            recordsFetched: allRows.length,
            apiCallCount: snapshot.apiCallCount,
            reportRequests: snapshot.reportRequests as Prisma.InputJsonValue,
            reportStatuses: snapshot.reportStatuses as Prisma.InputJsonValue,
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
          campaigns: detailRows.filter((row) => row.level === AmazonAdsInsightLevel.CAMPAIGN)
            .length,
          products: detailRows.filter((row) => row.level === AmazonAdsInsightLevel.PRODUCT)
            .length,
          searchTerms: detailRows.filter(
            (row) => row.level === AmazonAdsInsightLevel.SEARCH_TERM,
          ).length,
          total: allRows.length,
        },
        connectionStatus: AmazonAdsConnectionStatus.CONNECTED,
        lastSyncAt: syncedAt,
        syncStatus,
        skippedReason: null,
      };
    } catch (error) {
      const connectionErrorInfo = this.normalizeConnectionError(error);
      const finishedAt = new Date();
      await this.markConnectionAsError(clientId, connectionErrorInfo, finishedAt);
      await this.prisma.amazonAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: AmazonAdsSyncStatus.FAILED,
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
      const connectionErrorInfo = this.normalizeConnectionError(error);
      await this.markConnectionAsError(clientId, connectionErrorInfo);
      throw this.toConnectionTestException(connectionErrorInfo);
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

  private async resolveReportingConnection(
    clientId: string,
  ): Promise<AmazonAdsReportingConnection> {
    const snapshot = await this.getConnectionSnapshot(clientId);
    const encryptedRefreshToken = snapshot.credential?.refreshTokenEnc ?? null;
    const profileId = snapshot.config?.profileId?.trim() ?? "";
    const region = snapshot.config?.region ?? null;

    if (!encryptedRefreshToken) {
      throw new BadRequestException(
        "Amazon Ads refresh token bulunamadı. Sync öncesi müşteriyi bağlayın.",
      );
    }

    if (!profileId) {
      throw new BadRequestException("Amazon Ads sync için profileId gereklidir.");
    }

    if (!region) {
      throw new BadRequestException("Amazon Ads sync için region gereklidir.");
    }

    return {
      refreshToken: this.amazonAdsTokenService.decrypt(encryptedRefreshToken),
      profileId,
      marketplaceId: snapshot.config?.marketplaceId ?? null,
      region,
      lastSyncAt: snapshot.config?.lastSyncAt ?? null,
      connectionStatus:
        snapshot.config?.connectionStatus ?? AmazonAdsConnectionStatus.NOT_CONNECTED,
    };
  }

  private mergeApiInsightRows(rows: AmazonAdsApiInsightRow[]): AmazonAdsApiInsightRow[] {
    const rowMap = new Map<string, AmazonAdsApiInsightRow>();

    for (const row of rows) {
      const key = JSON.stringify([
        row.date,
        row.level,
        row.entityId,
        row.adProduct,
      ]);
      const existing = rowMap.get(key);

      if (!existing) {
        rowMap.set(key, { ...row });
        continue;
      }

      existing.entityName = existing.entityName ?? row.entityName;
      existing.spend = (existing.spend ?? 0) + (row.spend ?? 0);
      existing.impressions = (existing.impressions ?? 0) + (row.impressions ?? 0);
      existing.clicks = (existing.clicks ?? 0) + (row.clicks ?? 0);
      existing.sales = (existing.sales ?? 0) + (row.sales ?? 0);
      existing.orders = (existing.orders ?? 0) + (row.orders ?? 0);
      existing.unitsSold = (existing.unitsSold ?? 0) + (row.unitsSold ?? 0);
      existing.ctr = this.roundPercentageByCounts(
        existing.clicks ?? 0,
        existing.impressions ?? 0,
        6,
      );
      existing.cpc = this.roundDivision(existing.spend ?? 0, existing.clicks ?? 0, 6);
      existing.acos = this.roundPercentageByValue(existing.spend ?? 0, existing.sales ?? 0, 6);
      existing.roas = this.roundDivision(existing.sales ?? 0, existing.spend ?? 0, 6);
      existing.conversionRate = this.roundPercentageByCounts(
        existing.orders ?? 0,
        existing.clicks ?? 0,
        6,
      );
      existing.raw = {
        source: "mergedReportingRows",
        first: existing.raw,
        latest: row.raw,
      };
    }

    return Array.from(rowMap.values());
  }

  private toInsightCreateManyInput(
    clientId: string,
    connection: AmazonAdsReportingConnection,
    row: AmazonAdsApiInsightRow,
  ): Prisma.AmazonAdsDailyInsightCreateManyInput | null {
    const date = this.parseDateToUtcDay(row.date);
    if (!date) {
      return null;
    }

    return {
      clientProfileId: clientId,
      profileId: connection.profileId,
      marketplaceId: connection.marketplaceId,
      date,
      level: row.level,
      entityId: row.entityId,
      entityName: row.entityName,
      adProduct: row.adProduct,
      spend: this.toPrismaDecimal(row.spend),
      impressions: row.impressions,
      clicks: row.clicks,
      sales: this.toPrismaDecimal(row.sales),
      orders: row.orders,
      unitsSold: row.unitsSold,
      ctr: this.toPrismaDecimal(
        row.ctr ?? this.roundPercentageByCounts(row.clicks ?? 0, row.impressions ?? 0, 6),
      ),
      cpc: this.toPrismaDecimal(
        row.cpc ?? this.roundDivision(row.spend ?? 0, row.clicks ?? 0, 6),
      ),
      acos: this.toPrismaDecimal(
        row.acos ?? this.roundPercentageByValue(row.spend ?? 0, row.sales ?? 0, 6),
      ),
      roas: this.toPrismaDecimal(
        row.roas ?? this.roundDivision(row.sales ?? 0, row.spend ?? 0, 6),
      ),
      conversionRate: this.toPrismaDecimal(
        row.conversionRate ??
          this.roundPercentageByCounts(row.orders ?? 0, row.clicks ?? 0, 6),
      ),
      raw: row.raw as Prisma.InputJsonValue,
    };
  }

  private buildAccountInsightRows(
    clientId: string,
    connection: AmazonAdsReportingConnection,
    rows: AmazonAdsApiInsightRow[],
  ): Prisma.AmazonAdsDailyInsightCreateManyInput[] {
    const campaignRows = rows.filter((row) => row.level === AmazonAdsInsightLevel.CAMPAIGN);
    const byDate = new Map<
      string,
      {
        spend: number;
        impressions: number;
        clicks: number;
        sales: number;
        orders: number;
        unitsSold: number;
      }
    >();

    for (const row of campaignRows) {
      const existing = byDate.get(row.date) ?? {
        spend: 0,
        impressions: 0,
        clicks: 0,
        sales: 0,
        orders: 0,
        unitsSold: 0,
      };

      existing.spend += row.spend ?? 0;
      existing.impressions += row.impressions ?? 0;
      existing.clicks += row.clicks ?? 0;
      existing.sales += row.sales ?? 0;
      existing.orders += row.orders ?? 0;
      existing.unitsSold += row.unitsSold ?? 0;
      byDate.set(row.date, existing);
    }

    const accountRows: Prisma.AmazonAdsDailyInsightCreateManyInput[] = [];
    for (const [dateValue, metrics] of byDate.entries()) {
      const date = this.parseDateToUtcDay(dateValue);
      if (!date) {
        continue;
      }

      accountRows.push({
        clientProfileId: clientId,
        profileId: connection.profileId,
        marketplaceId: connection.marketplaceId,
        date,
        level: AmazonAdsInsightLevel.ACCOUNT,
        entityId: connection.profileId,
        entityName: connection.profileId,
        adProduct: null,
        spend: this.toPrismaDecimal(metrics.spend),
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        sales: this.toPrismaDecimal(metrics.sales),
        orders: metrics.orders,
        unitsSold: metrics.unitsSold,
        ctr: this.toPrismaDecimal(
          this.roundPercentageByCounts(metrics.clicks, metrics.impressions, 6),
        ),
        cpc: this.toPrismaDecimal(this.roundDivision(metrics.spend, metrics.clicks, 6)),
        acos: this.toPrismaDecimal(
          this.roundPercentageByValue(metrics.spend, metrics.sales, 6),
        ),
        roas: this.toPrismaDecimal(this.roundDivision(metrics.sales, metrics.spend, 6)),
        conversionRate: this.toPrismaDecimal(
          this.roundPercentageByCounts(metrics.orders, metrics.clicks, 6),
        ),
        raw: {
          source: "campaignAggregate",
        } as Prisma.InputJsonValue,
      });
    }

    return accountRows;
  }

  private aggregateInsightRows(rows: AmazonAdsDailyInsightModel[]): Omit<
    AmazonAdsSummaryResponse,
    "dateRange" | "lastSyncAt"
  > {
    let spend = 0;
    let impressions = 0;
    let clicks = 0;
    let sales = 0;
    let orders = 0;
    let unitsSold = 0;

    for (const row of rows) {
      spend += this.readDecimalAsNumber(row.spend);
      impressions += row.impressions ?? 0;
      clicks += row.clicks ?? 0;
      sales += this.readDecimalAsNumber(row.sales);
      orders += row.orders ?? 0;
      unitsSold += row.unitsSold ?? 0;
    }

    return {
      spend: this.round(spend),
      impressions,
      clicks,
      sales: this.round(sales),
      orders,
      unitsSold,
      ctr: this.roundPercentageByCounts(clicks, impressions),
      cpc: this.roundDivision(spend, clicks),
      acos: this.roundPercentageByValue(spend, sales),
      roas: this.roundDivision(sales, spend),
      conversionRate: this.roundPercentageByCounts(orders, clicks),
    };
  }

  private toInsightItem(insight: AmazonAdsDailyInsightModel): AmazonAdsInsightItem {
    const rawMeta = this.extractInsightMetaFromRaw(insight.raw);

    return {
      id: insight.id,
      date: insight.date.toISOString(),
      level: insight.level,
      entityId: insight.entityId,
      entityName: insight.entityName,
      adProduct: insight.adProduct,
      spend: this.round(this.readDecimalAsNumber(insight.spend)),
      impressions: insight.impressions ?? 0,
      clicks: insight.clicks ?? 0,
      sales: this.round(this.readDecimalAsNumber(insight.sales)),
      orders: insight.orders ?? 0,
      unitsSold: insight.unitsSold ?? 0,
      ctr: this.round(this.readDecimalAsNumber(insight.ctr)),
      cpc: this.round(this.readDecimalAsNumber(insight.cpc)),
      acos: this.round(this.readDecimalAsNumber(insight.acos)),
      roas: this.round(this.readDecimalAsNumber(insight.roas)),
      conversionRate: this.round(this.readDecimalAsNumber(insight.conversionRate)),
      campaignId: rawMeta.campaignId,
      campaignName: rawMeta.campaignName,
      adGroupId: rawMeta.adGroupId,
      adGroupName: rawMeta.adGroupName,
      keywordId: rawMeta.keywordId,
      keywordText: rawMeta.keywordText,
      keywordType: rawMeta.keywordType,
      matchType: rawMeta.matchType,
      targeting: rawMeta.targeting,
      searchTerm: rawMeta.searchTerm,
      reportTypeId: rawMeta.reportTypeId,
      updatedAt: insight.updatedAt.toISOString(),
    };
  }

  private async markConnectionAsError(
    clientId: string,
    connectionErrorInfo: AmazonAdsConnectionErrorInfo,
    occurredAt = new Date(),
  ): Promise<void> {
    await this.prisma.clientAmazonAdsConfig.upsert({
      where: { clientProfileId: clientId },
      update: {
        connectionStatus: AmazonAdsConnectionStatus.ERROR,
        syncError: connectionErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
      create: {
        clientProfileId: clientId,
        connectionStatus: AmazonAdsConnectionStatus.ERROR,
        syncError: connectionErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
    });
  }

  private normalizeConnectionError(error: unknown): AmazonAdsConnectionErrorInfo {
    const normalizedError = this.amazonAdsApiService.normalizeError(error);
    const message = this.normalizeApiErrorMessage(normalizedError.message);
    const lowerMessage = message.toLowerCase();

    if (
      normalizedError.category === "AUTH" ||
      lowerMessage.includes("token") &&
        (lowerMessage.includes("expired") ||
          lowerMessage.includes("revoked") ||
          lowerMessage.includes("invalid"))
    ) {
      return {
        code: "TOKEN_EXPIRED_OR_REVOKED",
        category: normalizedError.category,
        adminMessage: "Amazon Ads OAuth token süresi dolmuş veya iptal edilmiş görünüyor.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      normalizedError.category === "PERMISSION" ||
      lowerMessage.includes("permission") ||
      lowerMessage.includes("not authorized") ||
      lowerMessage.includes("access denied")
    ) {
      return {
        code: "PERMISSION_DENIED",
        category: normalizedError.category,
        adminMessage: "Amazon Ads API erişim izni reddedildi.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("profile") &&
      (lowerMessage.includes("not found") || lowerMessage.includes("unavailable"))
    ) {
      return {
        code: "PROFILE_NOT_FOUND",
        category: normalizedError.category,
        adminMessage: "Amazon Ads profile bulunamadı veya erişilemiyor.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("marketplace") &&
      (lowerMessage.includes("mismatch") ||
        lowerMessage.includes("does not match") ||
        lowerMessage.includes("invalid"))
    ) {
      return {
        code: "MARKETPLACE_MISMATCH",
        category: normalizedError.category,
        adminMessage: "Amazon Ads marketplace uyuşmazlığı tespit edildi.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("profileid") ||
      (lowerMessage.includes("profile id") &&
        (lowerMessage.includes("invalid") || lowerMessage.includes("required")))
    ) {
      return {
        code: "INVALID_PROFILE_ID",
        category: normalizedError.category,
        adminMessage: "Amazon Ads profile ID geçersiz veya eksik.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("report") &&
      (lowerMessage.includes("failed") ||
        lowerMessage.includes("failure") ||
        lowerMessage.includes("cancelled"))
    ) {
      return {
        code: "REPORT_GENERATION_FAILED",
        category: normalizedError.category,
        adminMessage: "Amazon Ads rapor üretimi başarısız oldu.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("report") &&
      (lowerMessage.includes("pending") ||
        lowerMessage.includes("not ready") ||
        lowerMessage.includes("poll window"))
    ) {
      return {
        code: "REPORT_NOT_READY",
        category: normalizedError.category,
        adminMessage: "Amazon Ads raporu henüz hazır değil.",
        clientMessage: "Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek.",
      };
    }

    if (
      normalizedError.category === "RATE_LIMIT" ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many") ||
      lowerMessage.includes("throttle")
    ) {
      return {
        code: "RATE_LIMIT",
        category: normalizedError.category,
        adminMessage: "Amazon Ads API rate limit sınırına ulaşıldı.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    return {
      code: "UNKNOWN_API_ERROR",
      category: normalizedError.category,
      adminMessage:
        message.length > 0
          ? `Amazon Ads API hatası: ${message}`
          : "Amazon Ads API beklenmeyen bir hata döndürdü.",
      clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
    };
  }

  private toConnectionTestException(
    connectionErrorInfo: AmazonAdsConnectionErrorInfo,
    options: {
      revealDetailedError: boolean;
    } = {
      revealDetailedError: true,
    },
  ): Error {
    const errorMessage = options.revealDetailedError
      ? connectionErrorInfo.adminMessage
      : connectionErrorInfo.clientMessage;

    if (connectionErrorInfo.code === "PERMISSION_DENIED") {
      return new ForbiddenException(errorMessage);
    }

    if (
      connectionErrorInfo.code === "TOKEN_EXPIRED_OR_REVOKED" ||
      connectionErrorInfo.code === "PROFILE_NOT_FOUND" ||
      connectionErrorInfo.code === "INVALID_PROFILE_ID" ||
      connectionErrorInfo.code === "MARKETPLACE_MISMATCH"
    ) {
      return new BadRequestException(errorMessage);
    }

    return new BadGatewayException(errorMessage);
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

  private resolveReportStatusLabel(value: Prisma.JsonValue | null): string | null {
    if (!Array.isArray(value) || value.length === 0) {
      return null;
    }

    const statuses = value
      .map((item) => {
        if (!this.isRecord(item)) {
          return null;
        }

        return this.readRawString(item.status)?.toUpperCase() ?? null;
      })
      .filter((status): status is string => typeof status === "string");

    if (statuses.length === 0) {
      return null;
    }

    if (statuses.some((status) => status === "FAILED" || status === "FAILURE" || status === "CANCELLED")) {
      return "FAILED";
    }

    if (statuses.some((status) => status === "PENDING" || status === "IN_PROGRESS")) {
      return "PENDING";
    }

    if (statuses.some((status) => status === "COMPLETED" || status === "SUCCESS")) {
      return "COMPLETED";
    }

    return statuses[0] ?? null;
  }

  private resolveReportDateRange(query: AmazonAdsDateRangeQueryDto): AmazonAdsReportDateRange {
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
        `Amazon Ads reporting aralığı ${MAX_REPORTING_RANGE_DAYS} günü aşamaz.`,
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

  private async resolveFailedSyncCooldownReason(
    clientProfileId: string,
    now: Date,
  ): Promise<string | null> {
    const cooldownMinutes = this.getFailedSyncRetryCooldownMinutes();
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const cooldownStart = new Date(now.getTime() - cooldownMs);

    const lastFailedSync = await this.prisma.amazonAdsSyncLog.findFirst({
      where: {
        clientProfileId,
        status: {
          in: [AmazonAdsSyncStatus.FAILED, AmazonAdsSyncStatus.PARTIAL],
        },
        startedAt: {
          gte: cooldownStart,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        startedAt: true,
      },
    });

    if (!lastFailedSync) {
      return null;
    }

    const elapsedMs = now.getTime() - lastFailedSync.startedAt.getTime();
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs >= cooldownMs) {
      return null;
    }

    const remainingMinutes = Math.max(Math.ceil((cooldownMs - elapsedMs) / (60 * 1000)), 1);
    return `Son hatalı senkron çok yeni. Yaklaşık ${remainingMinutes} dakika sonra tekrar deneyin.`;
  }

  private normalizeSyncStatusQuery(value: unknown): AmazonAdsSyncStatus | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const normalized = value.trim().toUpperCase();
    if (
      normalized === AmazonAdsSyncStatus.RUNNING ||
      normalized === AmazonAdsSyncStatus.SUCCESS ||
      normalized === AmazonAdsSyncStatus.FAILED ||
      normalized === AmazonAdsSyncStatus.PARTIAL ||
      normalized === AmazonAdsSyncStatus.SKIPPED
    ) {
      return normalized as AmazonAdsSyncStatus;
    }

    return undefined;
  }

  private normalizeBooleanQuery(value: unknown): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "1";
    }

    return false;
  }

  private normalizeLimitQuery(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.min(Math.max(Math.trunc(value), 1), 100);
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value.trim(), 10);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return Math.min(Math.max(parsed, 1), 100);
      }
    }

    return fallback;
  }

  private getSyncTtlMinutes(): number {
    const configuredValue = this.configService.get<string | number | undefined>(
      "AMAZON_ADS_SYNC_TTL_MINUTES",
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

    return DEFAULT_AMAZON_ADS_SYNC_TTL_MINUTES;
  }

  private getFailedSyncRetryCooldownMinutes(): number {
    const configuredValue = this.configService.get<string | number | undefined>(
      "AMAZON_ADS_FAILED_SYNC_RETRY_COOLDOWN_MINUTES",
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

    return DEFAULT_AMAZON_ADS_FAILED_SYNC_RETRY_COOLDOWN_MINUTES;
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
    return this.roundPercentageByValue(numerator, denominator, digits);
  }

  private roundPercentageByValue(numerator: number, denominator: number, digits = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round((numerator / denominator) * 100, digits);
  }

  private extractCampaignMetaFromRaw(raw: Prisma.JsonValue | null): { status: string | null } {
    if (!this.isRecord(raw)) {
      return { status: null };
    }

    return {
      status: this.readRawString(raw.campaignStatus) ?? this.readRawString(raw.status),
    };
  }

  private extractProductMetaFromRaw(raw: Prisma.JsonValue | null): {
    asin: string | null;
    sku: string | null;
    title: string | null;
  } {
    if (!this.isRecord(raw)) {
      return { asin: null, sku: null, title: null };
    }

    return {
      asin: this.readRawString(raw.advertisedAsin) ?? this.readRawString(raw.purchasedAsin),
      sku: this.readRawString(raw.advertisedSku),
      title: this.readRawString(raw.productName) ?? this.readRawString(raw.productTitle),
    };
  }

  private extractInsightMetaFromRaw(raw: Prisma.JsonValue | null): {
    campaignId: string | null;
    campaignName: string | null;
    adGroupId: string | null;
    adGroupName: string | null;
    keywordId: string | null;
    keywordText: string | null;
    keywordType: string | null;
    matchType: string | null;
    targeting: string | null;
    searchTerm: string | null;
    reportTypeId: string | null;
  } {
    if (!this.isRecord(raw)) {
      return {
        campaignId: null,
        campaignName: null,
        adGroupId: null,
        adGroupName: null,
        keywordId: null,
        keywordText: null,
        keywordType: null,
        matchType: null,
        targeting: null,
        searchTerm: null,
        reportTypeId: null,
      };
    }

    return {
      campaignId: this.readRawString(raw.campaignId),
      campaignName: this.readRawString(raw.campaignName),
      adGroupId: this.readRawString(raw.adGroupId),
      adGroupName: this.readRawString(raw.adGroupName),
      keywordId: this.readRawString(raw.keywordId),
      keywordText: this.readRawString(raw.keyword),
      keywordType: this.readRawString(raw.keywordType),
      matchType: this.readRawString(raw.matchType),
      targeting: this.readRawString(raw.targeting),
      searchTerm: this.readRawString(raw.searchTerm),
      reportTypeId: this.readRawString(raw.reportTypeId),
    };
  }

  private readRawString(value: unknown): string | null {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
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

  private assertCanReadAnyReporting(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_REPORTING_READ_ANY_PERMISSION);
  }

  private assertCanRunAnySync(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.ADMIN || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_SYNC_RUN_ANY_PERMISSION);
  }

  private assertCanReadAssignedConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadAssignedReporting(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_REPORTING_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadAssignedSync(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_SYNC_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadOwnConfig(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Bu endpoint yalnızca müşteri hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_CONFIG_READ_OWN_PERMISSION);
  }

  private assertCanReadOwnReporting(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Bu endpoint yalnızca müşteri hesapları içindir.");
    }

    this.assertHasPermission(actor, AMAZON_ADS_REPORTING_READ_OWN_PERMISSION);
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
