import {
  AccountType,
  DeliveryReleaseApprovalStatus,
  MetaAdsApprovalType,
  MetaAdsApprovalStatus,
  MetaAdsInsightLevel,
  MetaAdsReportStatus,
  MetaAdsReportType,
  MetaAdsConnectionStatus,
  MetaAdsSyncStatus,
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
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { ConnectManualMetaAdsDto } from "./dto/connect-manual-meta-ads.dto";
import { CreateMetaAdsReportDto } from "./dto/create-meta-ads-report.dto";
import { MetaAdsCampaignsQueryDto } from "./dto/meta-ads-campaigns-query.dto";
import { MetaAdsDateRangeQueryDto } from "./dto/meta-ads-date-range-query.dto";
import { MetaAdsInsightsQueryDto } from "./dto/meta-ads-insights-query.dto";
import { MetaAdsReportsQueryDto } from "./dto/meta-ads-reports-query.dto";
import { MetaAdsSyncLogsQueryDto } from "./dto/meta-ads-sync-logs-query.dto";
import { TestMetaAdsConnectionDto } from "./dto/test-meta-ads-connection.dto";
import { UpdateMetaAdsReportDto } from "./dto/update-meta-ads-report.dto";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";
import {
  MetaAdsAdCreativeItem,
  MetaAdsAdSetAudienceItem,
  MetaAdsApiActionMetric,
  MetaAdsApiService,
  MetaAdsCampaignCatalogItem,
  MetaAdsConnectionTestResult,
  MetaAdsReportingSnapshotResult,
  NormalizedMetaAdsApiError,
} from "./meta-ads-api.service";
import { MetaAdsTokenService } from "./meta-ads-token.service";
import {
  MetaAdsAiService,
  MetaAdsAiCommentary,
  MetaAdsAiCommentaryInput,
} from "./meta-ads-ai.service";

const META_ADS_CONFIG_READ_ANY_PERMISSION = "metaAds.config.read.any";
const META_ADS_CONFIG_MANAGE_ANY_PERMISSION = "metaAds.config.manage.any";
const META_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "metaAds.config.read.assigned";
const META_ADS_CONFIG_READ_OWN_PERMISSION = "metaAds.config.read.own";
const META_ADS_REPORTING_READ_ASSIGNED_PERMISSION = "metaAds.reporting.read.assigned";
const META_ADS_NOTES_MANAGE_ASSIGNED_PERMISSION = "metaAds.notes.manage.assigned";
const META_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION = "metaAds.approvals.create.assigned";
const META_ADS_SYNC_READ_ASSIGNED_PERMISSION = "metaAds.sync.read.assigned";
const REPORTS_READ_PERMISSION = "reports.read";
const REPORTS_MANAGE_PERMISSION = "reports.manage";
const REPORTS_READ_OWN_PERMISSION = "reports.read.own";
const DEFAULT_META_ADS_REQUIRED_SCOPES = ["ads_read"] as const;
const DEFAULT_REPORTING_RANGE_DAYS = 7;
const MAX_REPORTING_RANGE_DAYS = 90;
const DEFAULT_CAMPAIGNS_LIMIT = 12;
const DEFAULT_INSIGHTS_LIMIT = 100;
const DEFAULT_META_ADS_SYNC_TTL_MINUTES = 30;
const RESULT_ACTION_PRIORITY = [
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
  "onsite_conversion.lead_grouped",
  "lead",
  "link_click",
] as const;
const CLIENT_SAFE_SYNC_ERROR_MESSAGE = "Bağlantı problemi var, ekibimiz ilgileniyor.";

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

const metaAdsDailyInsightSelect = {
  id: true,
  clientProfileId: true,
  adAccountId: true,
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
  frequency: true,
  results: true,
  costPerResult: true,
  purchaseValue: true,
  roas: true,
  raw: true,
  updatedAt: true,
} satisfies Prisma.MetaAdsDailyInsightSelect;

const metaAdsSyncLogSelect = {
  id: true,
  clientProfileId: true,
  adAccountId: true,
  status: true,
  startedAt: true,
  finishedAt: true,
  errorCode: true,
  errorMessage: true,
  recordsFetched: true,
  apiCallCount: true,
  createdAt: true,
} satisfies Prisma.MetaAdsSyncLogSelect;

const metaAdsReportSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  periodStart: true,
  periodEnd: true,
  type: true,
  status: true,
  summary: true,
  metricsSnapshot: true,
  clientVisible: true,
  publishedAt: true,
  acknowledgementRequestedAt: true,
  acknowledgedAt: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  acknowledgementTask: {
    select: {
      id: true,
      approvalStatus: true,
      status: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.MetaAdsReportSelect;

type AdminMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof adminMetaAdsConfigSelect;
}>;

type ClientMetaAdsConfigModel = Prisma.ClientMetaAdsConfigGetPayload<{
  select: typeof clientMetaAdsConfigSelect;
}>;

type MetaAdsCredentialSummaryModel = Prisma.ClientMetaAdsCredentialGetPayload<{
  select: typeof metaAdsCredentialSummarySelect;
}>;

type MetaAdsDailyInsightModel = Prisma.MetaAdsDailyInsightGetPayload<{
  select: typeof metaAdsDailyInsightSelect;
}>;

type MetaAdsReportModel = Prisma.MetaAdsReportGetPayload<{
  select: typeof metaAdsReportSelect;
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

type MetaAdsReportDateRange = {
  since: Date;
  until: Date;
  sinceIsoDate: string;
  untilIsoDate: string;
};

type MetaAdsSummaryResponse = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  results: number;
  costPerResult: number;
  roas: number | null;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type MetaAdsCampaignSummary = {
  id: string;
  name: string;
  objective: string;
  status: string;
  effectiveStatus: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  results: number;
  roas: number | null;
};

type MetaAdsCampaignsResponse = {
  data: MetaAdsCampaignSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type MetaAdsInsightItem = {
  id: string;
  date: string;
  level: MetaAdsInsightLevel;
  entityId: string | null;
  entityName: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  results: number;
  costPerResult: number;
  purchaseValue: number;
  roas: number | null;
  updatedAt: string;
};

type MetaAdsInsightsResponse = {
  data: MetaAdsInsightItem[];
  level: MetaAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type MetaAdsPixelStatusResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  adAccountId: string | null;
  pixelId: string | null;
  lastSyncAt: Date | null;
  lastInsightAt: string | null;
  eventStatus: "ACTIVE" | "NO_DATA" | "NOT_CONFIGURED" | "CONNECTION_ERROR";
  setupWarning: string | null;
  syncError: string | null;
};

type MetaAdsPixelStatsResponse = {
  pixelId: string | null;
  pixelName: string | null;
  createdAt: string | null;
  lastFiredAt: string | null;
  events: Array<{ name: string; count: number }>;
  healthScore: number;
  healthLevel: "good" | "warning" | "critical";
  checklist: Array<{
    key: string;
    label: string;
    status: "ok" | "warning" | "error";
    detail: string | null;
  }>;
};

type MetaAdsSyncResponse = {
  success: true;
  syncedAt: Date;
  dateRange: {
    since: string;
    until: string;
  };
  inserted: {
    account: number;
    campaigns: number;
    total: number;
  };
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: Date | null;
  syncStatus: MetaAdsSyncStatus;
  skippedReason: string | null;
};

type MetaAdsSyncTrigger =
  | "MANUAL_SYNC"
  | "SCHEDULED_SYNC"
  | "ON_DEMAND_CLIENT_REFRESH"
  | "ON_DEMAND_ASSIGNED_REFRESH"
  | "ERROR_RETRY";

type MetaAdsSyncErrorCode =
  | "TOKEN_EXPIRED"
  | "PERMISSION_MISSING"
  | "AD_ACCOUNT_UNAVAILABLE"
  | "RATE_LIMIT"
  | "BUSINESS_ACCESS_REVOKED"
  | "UNKNOWN_API_ERROR";

type MetaAdsSyncErrorInfo = {
  code: MetaAdsSyncErrorCode;
  category: NormalizedMetaAdsApiError["category"];
  adminMessage: string;
  clientMessage: string;
};

type AdminMetaAdsSyncLogItem = {
  id: string;
  clientProfileId: string;
  clientCompanyName: string;
  adAccountId: string | null;
  status: MetaAdsSyncStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  recordsFetched: number | null;
  apiCallCount: number | null;
  createdAt: Date;
};

type AdminMetaAdsSyncLogsResponse = {
  data: AdminMetaAdsSyncLogItem[];
  meta: {
    total: number;
    failed: number;
    running: number;
    skipped: number;
  };
};

type AdminMetaAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: string;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: MetaAdsConnectionStatus;
  hasToken: boolean;
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
  spendSummary: {
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
    roas: number | null;
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
    metaAdsProjectId: string | null;
  };
};

type AdminMetaAdsClientListResponse = {
  data: AdminMetaAdsClientListItem[];
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

type MetaAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

type MetaAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  status: MetaAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Prisma.JsonValue | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: MetaAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type MetaAdsReportsResponse = {
  data: MetaAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

@Injectable()
export class MetaAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly metaAdsTokenService: MetaAdsTokenService,
    private readonly metaAdsApiService: MetaAdsApiService,
    private readonly metaAdsAiService: MetaAdsAiService,
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

  async getAdminMetaAdsClients(
    currentUser: AuthenticatedUser,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<AdminMetaAdsClientListResponse> {
    this.assertCanReadAnyConfig(currentUser);
    const dateRange = this.resolveReportDateRange(query);

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.META_ADS,
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
            serviceKey: PurchasedServiceKey.META_ADS,
          },
          select: {
            status: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
        metaAdsConfig: {
          select: adminMetaAdsConfigSelect,
        },
        metaAdsCredential: {
          select: metaAdsCredentialSummarySelect,
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
            serviceKey: PurchasedServiceKey.META_ADS,
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
      this.prisma.metaAdsDailyInsight.groupBy({
        by: ["clientProfileId"],
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
          level: MetaAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        _sum: {
          spend: true,
          impressions: true,
          clicks: true,
          results: true,
          purchaseValue: true,
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
            serviceKey: PurchasedServiceKey.META_ADS,
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
            serviceKey: PurchasedServiceKey.META_ADS,
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
        impressions: number;
        clicks: number;
        results: number;
        purchaseValue: number;
      }
    >();
    for (const row of insightsByClient) {
      insightTotalsByClientId.set(row.clientProfileId, {
        spend: this.readDecimalAsNumber(row._sum.spend),
        impressions: row._sum.impressions ?? 0,
        clicks: row._sum.clicks ?? 0,
        results: row._sum.results ?? 0,
        purchaseValue: this.readDecimalAsNumber(row._sum.purchaseValue),
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

    const data: AdminMetaAdsClientListItem[] = clients.map((client) => {
      const config = client.metaAdsConfig;
      const insightTotals = insightTotalsByClientId.get(client.id);
      const spend = insightTotals?.spend ?? 0;
      const purchaseValue = insightTotals?.purchaseValue ?? 0;

      return {
        client: {
          id: client.id,
          slug: client.slug,
          companyName: client.companyName,
          status: client.status,
        },
        serviceStatus: client.purchasedServices[0]?.status ?? PurchasedServiceStatus.INACTIVE,
        connectionStatus: config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED,
        hasToken: Boolean(client.metaAdsCredential?.tokenHash),
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
        spendSummary: {
          spend: this.round(spend),
          impressions: insightTotals?.impressions ?? 0,
          clicks: insightTotals?.clicks ?? 0,
          results: insightTotals?.results ?? 0,
          roas: this.roundNullableDivision(purchaseValue, spend),
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
          metaAdsProjectId: client.projects[0]?.id ?? null,
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
          (item) => item.connectionStatus === MetaAdsConnectionStatus.CONNECTED,
        ).length,
        error: data.filter((item) => item.connectionStatus === MetaAdsConnectionStatus.ERROR)
          .length,
        pendingApprovals: data.reduce((total, item) => total + item.pendingApprovals, 0),
      },
    };
  }

  async getAdminSyncLogs(
    currentUser: AuthenticatedUser,
    query: MetaAdsSyncLogsQueryDto,
  ): Promise<AdminMetaAdsSyncLogsResponse> {
    this.assertCanReadAnyConfig(currentUser);

    const statusFilter =
      query.status !== undefined
        ? query.status
        : query.failedOnly
          ? {
              in: [MetaAdsSyncStatus.FAILED, MetaAdsSyncStatus.PARTIAL],
            }
          : undefined;

    const where: Prisma.MetaAdsSyncLogWhereInput = {
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    };
    const take = query.limit ?? 40;

    const [rows, total, failed, running, skipped] = await Promise.all([
      this.prisma.metaAdsSyncLog.findMany({
        where,
        select: {
          ...metaAdsSyncLogSelect,
          clientProfile: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take,
      }),
      this.prisma.metaAdsSyncLog.count({ where }),
      this.prisma.metaAdsSyncLog.count({
        where: {
          ...where,
          status: {
            in: [MetaAdsSyncStatus.FAILED, MetaAdsSyncStatus.PARTIAL],
          },
        },
      }),
      this.prisma.metaAdsSyncLog.count({
        where: {
          ...where,
          status: MetaAdsSyncStatus.RUNNING,
        },
      }),
      this.prisma.metaAdsSyncLog.count({
        where: {
          ...where,
          status: MetaAdsSyncStatus.SKIPPED,
        },
      }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        clientProfileId: row.clientProfileId,
        clientCompanyName: row.clientProfile.companyName,
        adAccountId: row.adAccountId,
        status: row.status,
        startedAt: row.startedAt,
        finishedAt: row.finishedAt,
        durationMs:
          row.finishedAt !== null ? row.finishedAt.getTime() - row.startedAt.getTime() : null,
        errorCode: row.errorCode,
        errorMessage: row.errorMessage,
        recordsFetched: row.recordsFetched,
        apiCallCount: row.apiCallCount,
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
      const syncErrorInfo = this.normalizeSyncError(error);
      await this.markConnectionAsError(clientProfileId, syncErrorInfo);
      throw this.toConnectionTestException(syncErrorInfo);
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

  async getAdminClientSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSummaryResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getAdminClientCampaigns(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsCampaignsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsInsightsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async getAdminClientAdSets(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.ADSET);
  }

  async getAdminClientAds(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.AD);
  }

  async getAdminClientPixelStatus(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<MetaAdsPixelStatusResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatusByClientProfileId(clientProfileId, { revealDetailedError: true });
  }

  async syncAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "MANUAL_SYNC",
      applySyncTtl: false,
      revealDetailedError: true,
    });
  }

  async retryAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ERROR_RETRY",
      applySyncTtl: false,
      revealDetailedError: true,
    });
  }

  async getAssignedClientSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSummaryResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientCampaigns(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsCampaignsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsInsightsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientAdSets(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.ADSET);
  }

  async getAssignedClientAds(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.AD);
  }

  async getAssignedClientAdCreatives(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdCreativeItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAdCreativesByClientProfileId(clientProfileId);
  }

  async getAdminClientAdCreatives(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdCreativeItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadAnyConfig(currentUser);

    return this.getAdCreativesByClientProfileId(clientProfileId);
  }

  async getAssignedClientAudiences(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdSetAudienceItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAudiencesByClientProfileId(clientProfileId);
  }

  async getAdminClientAudiences(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdSetAudienceItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadAnyConfig(currentUser);

    return this.getAudiencesByClientProfileId(clientProfileId);
  }

  async getAssignedClientPixelStatus(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<MetaAdsPixelStatusResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatusByClientProfileId(clientProfileId, { revealDetailedError: true });
  }

  async syncAssignedClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    this.assertCanRunAssignedSync(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ON_DEMAND_ASSIGNED_REFRESH",
      applySyncTtl: true,
      revealDetailedError: true,
    });
  }

  async getOwnClientSummary(
    currentUser: AuthenticatedUser,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSummaryResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getOwnClientCampaigns(
    currentUser: AuthenticatedUser,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsCampaignsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientInsights(
    currentUser: AuthenticatedUser,
    query: MetaAdsInsightsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientAdSets(
    currentUser: AuthenticatedUser,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.ADSET);
  }

  async getOwnClientAds(
    currentUser: AuthenticatedUser,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, MetaAdsInsightLevel.AD);
  }

  async getOwnClientPixelStatus(
    currentUser: AuthenticatedUser,
  ): Promise<MetaAdsPixelStatusResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatusByClientProfileId(clientProfileId, {
      revealDetailedError: false,
    });
  }

  async getOwnClientAudiences(
    currentUser: AuthenticatedUser,
  ): Promise<{ data: MetaAdsAdSetAudienceItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAudiencesByClientProfileId(clientProfileId);
  }

  async getOwnClientPixelStats(
    currentUser: AuthenticatedUser,
  ): Promise<MetaAdsPixelStatsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatsByClientProfileId(clientProfileId);
  }

  async getAssignedClientPixelStats(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<MetaAdsPixelStatsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatsByClientProfileId(clientProfileId);
  }

  async getOwnClientAdCreatives(
    currentUser: AuthenticatedUser,
  ): Promise<{ data: MetaAdsAdCreativeItem[]; lastSyncAt: Date | null }> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAdCreativesByClientProfileId(clientProfileId);
  }

  async getOwnClientAiCommentary(
    currentUser: AuthenticatedUser,
  ): Promise<MetaAdsAiCommentary> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAiCommentaryByClientProfileId(clientProfileId);
  }

  async getAssignedClientAiCommentary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<MetaAdsAiCommentary> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getAiCommentaryByClientProfileId(clientProfileId);
  }

  async syncOwnClientInsights(
    currentUser: AuthenticatedUser,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ON_DEMAND_CLIENT_REFRESH",
      applySyncTtl: true,
      revealDetailedError: false,
    });
  }

  async getAdminClientReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsReportsQueryDto,
  ): Promise<MetaAdsReportsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    this.assertCanReadReports(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: false,
    });
  }

  async createAdminClientReport(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateMetaAdsReportDto,
  ): Promise<MetaAdsReportItem> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertCanManageReports(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.createReportByClientProfileId(currentUser, clientProfileId, dto);
  }

  async updateAdminReport(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateMetaAdsReportDto,
  ): Promise<MetaAdsReportItem> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertCanManageReports(currentUser);

    return this.updateReportById(currentUser, reportId, dto, { scope: "ANY" });
  }

  async getAssignedClientReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsReportsQueryDto,
  ): Promise<MetaAdsReportsResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: false,
    });
  }

  async createAssignedClientReport(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateMetaAdsReportDto,
  ): Promise<MetaAdsReportItem> {
    this.assertCanReadAssignedConfig(currentUser);
    this.assertCanManageAssignedNotes(currentUser);
    if (dto.requestAcknowledgement === true) {
      this.assertCanCreateAssignedApprovals(currentUser);
    }
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.createReportByClientProfileId(currentUser, clientProfileId, dto);
  }

  async updateAssignedReport(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateMetaAdsReportDto,
  ): Promise<MetaAdsReportItem> {
    this.assertCanReadAssignedConfig(currentUser);
    this.assertCanManageAssignedNotes(currentUser);
    if (dto.requestAcknowledgement === true) {
      this.assertCanCreateAssignedApprovals(currentUser);
    }

    return this.updateReportById(currentUser, reportId, dto, {
      scope: "ASSIGNED",
      employeeUserId: currentUser.id,
    });
  }

  async getOwnClientReports(
    currentUser: AuthenticatedUser,
    query: MetaAdsReportsQueryDto,
  ): Promise<MetaAdsReportsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    this.assertCanReadOwnReports(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: true,
    });
  }

  private async getAiCommentaryByClientProfileId(
    clientProfileId: string,
  ): Promise<MetaAdsAiCommentary> {
    const defaultQuery: MetaAdsDateRangeQueryDto = {};
    const dateRange = this.resolveReportDateRange(defaultQuery);

    const [summaryInsights, campaignInsights, adSetInsights] = await this.prisma.$transaction([
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.ACCOUNT,
          date: { gte: dateRange.since, lte: dateRange.until },
        },
        select: metaAdsDailyInsightSelect,
      }),
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.CAMPAIGN,
          date: { gte: dateRange.since, lte: dateRange.until },
        },
        select: metaAdsDailyInsightSelect,
      }),
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.ADSET,
          date: { gte: dateRange.since, lte: dateRange.until },
        },
        select: metaAdsDailyInsightSelect,
        orderBy: [{ date: "desc" }],
        take: 8,
      }),
    ]);

    const summaryTotals = this.aggregateInsightRows(summaryInsights);
    const hasSummary = summaryInsights.length > 0;

    // Aggregate campaigns
    const campaignMap = new Map<string, { name: string; spend: number; clicks: number; impressions: number; results: number; purchaseValue: number; effectiveStatus: string }>();
    for (const insight of campaignInsights) {
      const entityId = insight.entityId ?? "";
      if (!entityId) continue;
      const spend = this.readDecimalAsNumber(insight.spend);
      const purchaseValue = this.readDecimalAsNumber(insight.purchaseValue);
      const rawMeta = this.extractCampaignMetaFromRaw(insight.raw);
      const existing = campaignMap.get(entityId);
      if (!existing) {
        campaignMap.set(entityId, {
          name: insight.entityName ?? entityId,
          spend,
          clicks: insight.clicks ?? 0,
          impressions: insight.impressions ?? 0,
          results: insight.results ?? 0,
          purchaseValue,
          effectiveStatus: rawMeta.effectiveStatus ?? "UNKNOWN",
        });
      } else {
        existing.spend += spend;
        existing.clicks += insight.clicks ?? 0;
        existing.impressions += insight.impressions ?? 0;
        existing.results += insight.results ?? 0;
        existing.purchaseValue += purchaseValue;
        if (rawMeta.effectiveStatus) existing.effectiveStatus = rawMeta.effectiveStatus;
        existing.name = insight.entityName ?? existing.name;
      }
    }

    const campaigns = Array.from(campaignMap.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        spend: this.round(c.spend),
        ctr: this.roundPercentageByCounts(c.clicks, c.impressions),
        roas: this.roundNullableDivision(c.purchaseValue, c.spend),
        results: c.results,
        effectiveStatus: c.effectiveStatus,
      }));

    // Aggregate adsets
    const adSetMap = new Map<string, { name: string | null; spend: number; clicks: number; impressions: number; costPerResult: number }>();
    for (const insight of adSetInsights) {
      const entityId = insight.entityId ?? insight.id;
      const spend = this.readDecimalAsNumber(insight.spend);
      const existing = adSetMap.get(entityId);
      if (!existing) {
        adSetMap.set(entityId, {
          name: insight.entityName,
          spend,
          clicks: insight.clicks ?? 0,
          impressions: insight.impressions ?? 0,
          costPerResult: this.readDecimalAsNumber(insight.costPerResult),
        });
      } else {
        existing.spend += spend;
        existing.clicks += insight.clicks ?? 0;
        existing.impressions += insight.impressions ?? 0;
        existing.name = insight.entityName ?? existing.name;
      }
    }

    const adSets = Array.from(adSetMap.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8)
      .map((a) => ({
        name: a.name,
        spend: this.round(a.spend),
        ctr: this.roundPercentageByCounts(a.clicks, a.impressions),
        cpm: this.roundMille(a.spend, a.impressions),
        costPerResult: this.round(a.costPerResult),
      }));

    // Creatives: use AD level insights
    const adInsights = await this.prisma.metaAdsDailyInsight.findMany({
      where: {
        clientProfileId,
        level: MetaAdsInsightLevel.AD,
        date: { gte: dateRange.since, lte: dateRange.until },
      },
      select: metaAdsDailyInsightSelect,
      orderBy: [{ date: "desc" }],
      take: 8,
    });

    const adMap = new Map<string, { adName: string | null; ctr: number; spend: number; clicks: number; impressions: number; results: number; effectiveStatus: string }>();
    for (const insight of adInsights) {
      const entityId = insight.entityId ?? insight.id;
      const spend = this.readDecimalAsNumber(insight.spend);
      const ctr = this.readDecimalAsNumber(insight.ctr);
      const existing = adMap.get(entityId);
      if (!existing) {
        adMap.set(entityId, {
          adName: insight.entityName,
          ctr,
          spend,
          clicks: insight.clicks ?? 0,
          impressions: insight.impressions ?? 0,
          results: insight.results ?? 0,
          effectiveStatus: "UNKNOWN",
        });
      } else {
        existing.spend += spend;
        existing.clicks += insight.clicks ?? 0;
        existing.impressions += insight.impressions ?? 0;
        existing.results += insight.results ?? 0;
        existing.adName = insight.entityName ?? existing.adName;
      }
    }

    const creatives = Array.from(adMap.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8)
      .map((c) => ({
        adName: c.adName ?? null,
        ctr: this.roundPercentageByCounts(c.clicks, c.impressions),
        spend: this.round(c.spend),
        results: c.results,
        effectiveStatus: c.effectiveStatus,
      })) as MetaAdsAiCommentaryInput["creatives"];

    const aiInput: MetaAdsAiCommentaryInput = {
      summary: hasSummary
        ? {
            spend: summaryTotals.spend,
            impressions: summaryTotals.impressions,
            clicks: summaryTotals.clicks,
            ctr: summaryTotals.ctr,
            results: summaryTotals.results,
            roas: summaryTotals.roas,
          }
        : null,
      campaigns,
      adSets,
      creatives,
    };

    return this.metaAdsAiService.generateCommentary(clientProfileId, aiInput);
  }

  private async getSummaryByClientProfileId(
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSummaryResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: metaAdsDailyInsightSelect,
        orderBy: { date: "asc" },
      }),
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const totals = this.aggregateInsightRows(insights);
    return {
      ...totals,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getCampaignsByClientProfileId(
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
  ): Promise<MetaAdsCampaignsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_CAMPAIGNS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.CAMPAIGN,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: metaAdsDailyInsightSelect,
      }),
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const campaignMap = new Map<string, MetaAdsCampaignSummary>();
    const campaignPurchaseValueMap = new Map<string, number>();
    for (const insight of insights) {
      const entityId = insight.entityId ?? "";
      if (!entityId) {
        continue;
      }

      const existing = campaignMap.get(entityId);
      const spend = this.readDecimalAsNumber(insight.spend);
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const results = insight.results ?? 0;
      const rawMeta = this.extractCampaignMetaFromRaw(insight.raw);
      const purchaseValue = this.readDecimalAsNumber(insight.purchaseValue);

      if (!existing) {
        campaignPurchaseValueMap.set(entityId, purchaseValue);
        campaignMap.set(entityId, {
          id: entityId,
          name: insight.entityName ?? entityId,
          objective: rawMeta.objective ?? "UNSPECIFIED",
          status: rawMeta.status ?? "UNKNOWN",
          effectiveStatus: rawMeta.effectiveStatus ?? "UNKNOWN",
          spend,
          impressions,
          clicks,
          ctr: this.roundPercentageByCounts(clicks, impressions),
          cpc: this.roundDivision(spend, clicks),
          results,
          roas: this.roundNullableDivision(purchaseValue, spend),
        });
        continue;
      }

      existing.spend += spend;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.results += results;
      existing.ctr = this.roundPercentageByCounts(existing.clicks, existing.impressions);
      existing.cpc = this.roundDivision(existing.spend, existing.clicks);
      campaignPurchaseValueMap.set(
        entityId,
        (campaignPurchaseValueMap.get(entityId) ?? 0) + purchaseValue,
      );
      existing.roas = this.roundNullableDivision(
        campaignPurchaseValueMap.get(entityId) ?? null,
        existing.spend,
      );
      existing.name = insight.entityName ?? existing.name;

      if (rawMeta.objective) {
        existing.objective = rawMeta.objective;
      }
      if (rawMeta.status) {
        existing.status = rawMeta.status;
      }
      if (rawMeta.effectiveStatus) {
        existing.effectiveStatus = rawMeta.effectiveStatus;
      }
    }

    const campaigns = Array.from(campaignMap.values())
      .sort((left, right) => right.spend - left.spend)
      .slice(0, limit)
      .map((campaign) => ({
        ...campaign,
        spend: this.round(campaign.spend),
      }));

    return {
      data: campaigns,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getInsightsByClientProfileId(
    clientProfileId: string,
    query: MetaAdsInsightsQueryDto,
  ): Promise<MetaAdsInsightsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const level = query.level ?? MetaAdsInsightLevel.ACCOUNT;
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.metaAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: metaAdsDailyInsightSelect,
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
        take: limit,
      }),
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
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

  private async getInsightsByFixedLevel(
    clientProfileId: string,
    query: MetaAdsCampaignsQueryDto,
    level: MetaAdsInsightLevel,
  ): Promise<MetaAdsInsightsResponse> {
    return this.getInsightsByClientProfileId(clientProfileId, {
      since: query.since,
      until: query.until,
      level,
      limit: query.limit ?? DEFAULT_INSIGHTS_LIMIT,
    });
  }

  private async getPixelStatusByClientProfileId(
    clientProfileId: string,
    options: {
      revealDetailedError: boolean;
    },
  ): Promise<MetaAdsPixelStatusResponse> {
    const [config, latestAccountInsight] = await this.prisma.$transaction([
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
        select: {
          connectionStatus: true,
          adAccountId: true,
          pixelId: true,
          lastSyncAt: true,
          syncError: true,
        },
      }),
      this.prisma.metaAdsDailyInsight.findFirst({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.ACCOUNT,
        },
        select: {
          date: true,
        },
        orderBy: [{ date: "desc" }],
      }),
    ]);

    const connectionStatus =
      config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED;
    const hasPixelId = Boolean(config?.pixelId && config.pixelId.trim().length > 0);
    const hasInsight = Boolean(latestAccountInsight?.date);

    let eventStatus: MetaAdsPixelStatusResponse["eventStatus"] = "NO_DATA";
    if (connectionStatus === MetaAdsConnectionStatus.ERROR) {
      eventStatus = "CONNECTION_ERROR";
    } else if (!hasPixelId) {
      eventStatus = "NOT_CONFIGURED";
    } else if (hasInsight) {
      eventStatus = "ACTIVE";
    }

    const setupWarning =
      eventStatus === "NOT_CONFIGURED"
        ? "Pixel ID henüz tanımlı değil."
        : eventStatus === "CONNECTION_ERROR"
          ? "Bağlantı hatası nedeniyle event durumu doğrulanamadı."
          : eventStatus === "NO_DATA"
            ? "Seçili tarihlerde event verisi bulunamadı."
            : null;

    return {
      connectionStatus,
      adAccountId: config?.adAccountId ?? null,
      pixelId: config?.pixelId ?? null,
      lastSyncAt: config?.lastSyncAt ?? null,
      lastInsightAt: latestAccountInsight?.date.toISOString() ?? null,
      eventStatus,
      setupWarning,
      syncError: config?.syncError
        ? options.revealDetailedError
          ? config.syncError
          : CLIENT_SAFE_SYNC_ERROR_MESSAGE
        : null,
    };
  }

  private async getPixelStatsByClientProfileId(
    clientProfileId: string,
  ): Promise<MetaAdsPixelStatsResponse> {
    const [config, latestAccountInsight] = await this.prisma.$transaction([
      this.prisma.clientMetaAdsConfig.findUnique({
        where: { clientProfileId },
        select: {
          connectionStatus: true,
          adAccountId: true,
          pixelId: true,
          lastSyncAt: true,
          syncError: true,
        },
      }),
      this.prisma.metaAdsDailyInsight.findFirst({
        where: {
          clientProfileId,
          level: MetaAdsInsightLevel.ACCOUNT,
        },
        select: {
          date: true,
        },
        orderBy: [{ date: "desc" }],
      }),
    ]);

    const connectionStatus =
      config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED;
    const pixelId = config?.pixelId?.trim() || null;

    const emptyChecklist: MetaAdsPixelStatsResponse["checklist"] = [
      {
        key: "connection",
        label: "Meta Ads hesabı bağlı",
        status: connectionStatus === MetaAdsConnectionStatus.CONNECTED ? "ok" : "error",
        detail:
          connectionStatus === MetaAdsConnectionStatus.CONNECTED
            ? null
            : config?.syncError ?? "Bağlantı kurulmamış",
      },
      {
        key: "pixel_id",
        label: "Pixel ID tanımlı",
        status: pixelId ? "ok" : "error",
        detail: pixelId ? `ID: ${pixelId}` : "Admin panelinden Pixel ID girin",
      },
      {
        key: "events_active",
        label: "Event akışı aktif",
        status: "error",
        detail: "Son 7 günde event algılanmadı",
      },
      {
        key: "page_view",
        label: "PageView kurulu",
        status: "warning",
        detail: null,
      },
      {
        key: "purchase",
        label: "Purchase / Conversion eventi",
        status: "warning",
        detail: "Dönüşüm optimizasyonu için gerekli",
      },
      {
        key: "last_fired",
        label: "Son 24 saatte event geldi",
        status: "error",
        detail: null,
      },
    ];

    if (!pixelId || connectionStatus !== MetaAdsConnectionStatus.CONNECTED) {
      return {
        pixelId,
        pixelName: null,
        createdAt: null,
        lastFiredAt: null,
        events: [],
        healthScore: 0,
        healthLevel: "critical",
        checklist: emptyChecklist,
      };
    }

    const { accessToken } = await this.resolveReportingConnection(clientProfileId);
    const nowUnix = Math.floor(Date.now() / 1000);
    const sinceUnix = nowUnix - 7 * 24 * 60 * 60;

    const [pixelDetails, rawEventStats] = await Promise.all([
      this.metaAdsApiService.fetchPixelDetails(pixelId, accessToken),
      this.metaAdsApiService.fetchPixelEventStats(pixelId, accessToken, sinceUnix, nowUnix),
    ]);

    const events = rawEventStats.map((e) => ({ name: e.eventName, count: e.count }));

    const latestInsightDate = latestAccountInsight?.date ?? null;
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const latestInsightWithin7Days =
      latestInsightDate !== null && latestInsightDate.getTime() >= sevenDaysAgoMs;

    let healthScore = 0;
    if (connectionStatus === MetaAdsConnectionStatus.CONNECTED) healthScore += 25;
    if (pixelId) healthScore += 25;
    if (events.length > 0 || latestInsightWithin7Days) healthScore += 25;
    if (
      pixelDetails.lastFiredTime !== null &&
      nowUnix - pixelDetails.lastFiredTime < 86400
    )
      healthScore += 25;

    const healthLevel: MetaAdsPixelStatsResponse["healthLevel"] =
      healthScore >= 75 ? "good" : healthScore >= 50 ? "warning" : "critical";

    const totalEvents = events.reduce((s, e) => s + e.count, 0);

    const checklist: MetaAdsPixelStatsResponse["checklist"] = [
      {
        key: "connection",
        label: "Meta Ads hesabı bağlı",
        status: connectionStatus === MetaAdsConnectionStatus.CONNECTED ? "ok" : "error",
        detail:
          connectionStatus === MetaAdsConnectionStatus.CONNECTED
            ? null
            : config?.syncError ?? "Bağlantı kurulmamış",
      },
      {
        key: "pixel_id",
        label: "Pixel ID tanımlı",
        status: pixelId ? "ok" : "error",
        detail: pixelId ? `ID: ${pixelId}` : "Admin panelinden Pixel ID girin",
      },
      {
        key: "events_active",
        label: "Event akışı aktif",
        status:
          events.length > 0 ? "ok" : latestInsightDate ? "warning" : "error",
        detail:
          events.length > 0
            ? `Son 7 günde ${totalEvents.toLocaleString()} event`
            : "Son 7 günde event algılanmadı",
      },
      {
        key: "page_view",
        label: "PageView kurulu",
        status: events.some((e) => e.name === "PageView") ? "ok" : "warning",
        detail: null,
      },
      {
        key: "purchase",
        label: "Purchase / Conversion eventi",
        status: events.some((e) =>
          ["Purchase", "Lead", "CompleteRegistration"].includes(e.name),
        )
          ? "ok"
          : "warning",
        detail: "Dönüşüm optimizasyonu için gerekli",
      },
      {
        key: "last_fired",
        label: "Son 24 saatte event geldi",
        status:
          pixelDetails.lastFiredTime !== null &&
          nowUnix - pixelDetails.lastFiredTime < 86400
            ? "ok"
            : events.length > 0
              ? "warning"
              : "error",
        detail: pixelDetails.lastFiredTime
          ? new Date(pixelDetails.lastFiredTime * 1000).toLocaleString("tr-TR")
          : null,
      },
    ];

    return {
      pixelId,
      pixelName: pixelDetails.name,
      createdAt: pixelDetails.creationTime
        ? new Date(pixelDetails.creationTime * 1000).toISOString()
        : null,
      lastFiredAt: pixelDetails.lastFiredTime
        ? new Date(pixelDetails.lastFiredTime * 1000).toISOString()
        : null,
      events,
      healthScore,
      healthLevel,
      checklist,
    };
  }

  private async syncInsightsByClientProfileId(
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
    options: {
      trigger: MetaAdsSyncTrigger;
      applySyncTtl: boolean;
      revealDetailedError: boolean;
    },
  ): Promise<MetaAdsSyncResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const startedAt = new Date();
    const syncLog = await this.prisma.metaAdsSyncLog.create({
      data: {
        clientProfileId,
        status: MetaAdsSyncStatus.RUNNING,
        startedAt,
      },
      select: {
        id: true,
      },
    });

    try {
      const connection = await this.resolveReportingConnection(clientProfileId);
      await this.prisma.metaAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          adAccountId: connection.adAccountId,
        },
      });

      if (options.applySyncTtl) {
        const skipReason = this.resolveSyncSkipReason(connection.lastSyncAt, startedAt);
        if (skipReason) {
          await this.prisma.metaAdsSyncLog.update({
            where: { id: syncLog.id },
            data: {
              status: MetaAdsSyncStatus.SKIPPED,
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
              total: 0,
            },
            connectionStatus: connection.connectionStatus,
            lastSyncAt: connection.lastSyncAt,
            syncStatus: MetaAdsSyncStatus.SKIPPED,
            skippedReason: skipReason,
          };
        }
      }

      const snapshot: MetaAdsReportingSnapshotResult =
        await this.metaAdsApiService.fetchReportingSnapshot({
          accessToken: connection.accessToken,
          adAccountId: connection.adAccountId,
          since: dateRange.sinceIsoDate,
          until: dateRange.untilIsoDate,
        });

      const campaignCatalogById = new Map(
        snapshot.campaigns.map((campaign) => [campaign.id, campaign]),
      );
      const accountRows = snapshot.accountInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            connection.adAccountId,
            MetaAdsInsightLevel.ACCOUNT,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.MetaAdsDailyInsightCreateManyInput => row !== null);

      const campaignRows = snapshot.campaignInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            connection.adAccountId,
            MetaAdsInsightLevel.CAMPAIGN,
            row,
            row.campaignId ? campaignCatalogById.get(row.campaignId) ?? null : null,
          ),
        )
        .filter((row): row is Prisma.MetaAdsDailyInsightCreateManyInput => row !== null);

      const adSetRows = snapshot.adSetInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            connection.adAccountId,
            MetaAdsInsightLevel.ADSET,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.MetaAdsDailyInsightCreateManyInput => row !== null);

      const adRows = snapshot.adInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            connection.adAccountId,
            MetaAdsInsightLevel.AD,
            row,
            null,
          ),
        )
        .filter((row): row is Prisma.MetaAdsDailyInsightCreateManyInput => row !== null);

      const allRows = [...accountRows, ...campaignRows, ...adSetRows, ...adRows];
      const syncedAt = new Date();
      const syncStatus =
        allRows.length > 0 ? MetaAdsSyncStatus.SUCCESS : MetaAdsSyncStatus.PARTIAL;

      await this.prisma.$transaction(async (tx) => {
        await tx.metaAdsDailyInsight.deleteMany({
          where: {
            clientProfileId,
            level: {
              in: [
                MetaAdsInsightLevel.ACCOUNT,
                MetaAdsInsightLevel.CAMPAIGN,
                MetaAdsInsightLevel.ADSET,
                MetaAdsInsightLevel.AD,
              ],
            },
            date: {
              gte: dateRange.since,
              lte: dateRange.until,
            },
          },
        });

        if (allRows.length > 0) {
          await tx.metaAdsDailyInsight.createMany({
            data: allRows,
          });
        }

        await tx.clientMetaAdsConfig.upsert({
          where: { clientProfileId },
          update: {
            adAccountId: connection.adAccountId,
            connectionStatus: MetaAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
          create: {
            clientProfileId,
            adAccountId: connection.adAccountId,
            connectionStatus: MetaAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
        });

        await tx.metaAdsSyncLog.update({
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
          total: allRows.length,
        },
        connectionStatus: MetaAdsConnectionStatus.CONNECTED,
        lastSyncAt: syncedAt,
        syncStatus,
        skippedReason: null,
      };
    } catch (error) {
      const syncErrorInfo = this.normalizeSyncError(error);
      const finishedAt = new Date();
      await this.markConnectionAsError(clientProfileId, syncErrorInfo, finishedAt);
      await this.prisma.metaAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: MetaAdsSyncStatus.FAILED,
          finishedAt,
          errorCode: syncErrorInfo.code,
          errorMessage: `[${options.trigger}] ${syncErrorInfo.adminMessage}`,
        },
      });
      throw this.toConnectionTestException(syncErrorInfo, {
        revealDetailedError: options.revealDetailedError,
      });
    }
  }

  private async getReportsByClientProfileId(
    clientProfileId: string,
    query: MetaAdsReportsQueryDto,
    options: {
      onlyClientVisible: boolean;
    },
  ): Promise<MetaAdsReportsResponse> {
    const where: Prisma.MetaAdsReportWhereInput = {
      clientProfileId,
    };

    if (options.onlyClientVisible) {
      where.clientVisible = true;
    } else if (query.clientVisible !== undefined) {
      where.clientVisible = query.clientVisible;
    }

    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    const statsWhere: Prisma.MetaAdsReportWhereInput = {
      clientProfileId,
      ...(options.onlyClientVisible ? { clientVisible: true } : {}),
    };
    const limit = query.limit ?? 30;

    const [reports, total, draft, published, clientVisible] = await this.prisma.$transaction([
      this.prisma.metaAdsReport.findMany({
        where,
        select: metaAdsReportSelect,
        orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
        take: limit,
      }),
      this.prisma.metaAdsReport.count({ where }),
      this.prisma.metaAdsReport.count({
        where: {
          ...statsWhere,
          status: MetaAdsReportStatus.DRAFT,
        },
      }),
      this.prisma.metaAdsReport.count({
        where: {
          ...statsWhere,
          status: MetaAdsReportStatus.PUBLISHED,
        },
      }),
      this.prisma.metaAdsReport.count({
        where: {
          ...statsWhere,
          clientVisible: true,
        },
      }),
    ]);

    return {
      data: reports.map((report) => this.toMetaAdsReportItem(report)),
      meta: {
        total,
        draft,
        published,
        clientVisible,
      },
    };
  }

  private async createReportByClientProfileId(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateMetaAdsReportDto,
  ): Promise<MetaAdsReportItem> {
    const period = this.resolveMetaAdsReportPeriod(dto.periodStart, dto.periodEnd);
    const summary = this.normalizeMetaAdsReportSummary(dto.summary);
    const projectId = await this.resolveMetaAdsReportProjectId(clientProfileId, dto.projectId ?? null);
    const shouldPublish = dto.clientVisible === true || dto.requestAcknowledgement === true;
    const now = new Date();

    let report = await this.prisma.metaAdsReport.create({
      data: {
        clientProfileId,
        projectId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        type: dto.type,
        status: shouldPublish ? MetaAdsReportStatus.PUBLISHED : MetaAdsReportStatus.DRAFT,
        summary,
        metricsSnapshot: dto.metricsSnapshot as Prisma.InputJsonValue | undefined,
        createdByUserId: currentUser.id,
        publishedByUserId: shouldPublish ? currentUser.id : null,
        clientVisible: shouldPublish,
        publishedAt: shouldPublish ? now : null,
      },
      select: metaAdsReportSelect,
    });

    if (dto.requestAcknowledgement === true) {
      const acknowledgementProjectId =
        projectId ?? (await this.resolveMetaAdsReportProjectId(clientProfileId, null));
      if (!acknowledgementProjectId) {
        throw new BadRequestException(
          "A META_ADS project is required to request report acknowledgement.",
        );
      }

      const task = await this.prisma.task.create({
        data: {
          projectId: acknowledgementProjectId,
          title: this.buildReportAcknowledgementTaskTitle(
            report.type,
            report.periodStart,
            report.periodEnd,
          ),
          description: this.buildReportAcknowledgementTaskDescription(summary),
          status: TaskStatus.REVIEW,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.META_ADS_REPORT_ACKNOWLEDGEMENT,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: now,
          approvalContext: {
            reportId: report.id,
            reportType: report.type,
            periodStart: report.periodStart.toISOString(),
            periodEnd: report.periodEnd.toISOString(),
          },
        },
        select: { id: true },
      });

      report = await this.prisma.metaAdsReport.update({
        where: {
          id: report.id,
        },
        data: {
          acknowledgementRequestedAt: now,
          acknowledgementTaskId: task.id,
        },
        select: metaAdsReportSelect,
      });
    }

    return this.toMetaAdsReportItem(report);
  }

  private async updateReportById(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateMetaAdsReportDto,
    options: {
      scope: "ANY" | "ASSIGNED";
      employeeUserId?: string;
    },
  ): Promise<MetaAdsReportItem> {
    this.assertHasMetaAdsReportUpdatePayload(dto);

    const existing = await this.prisma.metaAdsReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        clientProfileId: true,
        projectId: true,
        type: true,
        periodStart: true,
        periodEnd: true,
        summary: true,
        status: true,
        clientVisible: true,
        publishedAt: true,
        publishedByUserId: true,
        acknowledgementTaskId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Meta Ads report not found.");
    }

    if (options.scope === "ASSIGNED") {
      if (!options.employeeUserId) {
        throw new ForbiddenException("Missing employee context for assigned report update.");
      }
      await this.assertAssignedClientProfileOrFail(options.employeeUserId, existing.clientProfileId);
    }

    await this.assertClientHasActiveMetaAdsService(existing.clientProfileId);

    const now = new Date();
    const updateData: Prisma.MetaAdsReportUpdateInput = {};
    const normalizedSummary =
      dto.summary !== undefined ? this.normalizeMetaAdsReportSummary(dto.summary) : undefined;

    if (dto.summary !== undefined) {
      updateData.summary = normalizedSummary;
    }

    if (dto.metricsSnapshot !== undefined) {
      updateData.metricsSnapshot = dto.metricsSnapshot as Prisma.InputJsonValue;
    }

    if (dto.clientVisible !== undefined) {
      updateData.clientVisible = dto.clientVisible;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === MetaAdsReportStatus.DRAFT) {
        updateData.clientVisible = false;
      }
      if (dto.status === MetaAdsReportStatus.ARCHIVED) {
        updateData.clientVisible = false;
      }
    }

    if (dto.status === MetaAdsReportStatus.PUBLISHED && dto.clientVisible === false) {
      throw new BadRequestException("Published report cannot be hidden from client.");
    }

    const shouldPublish =
      dto.requestAcknowledgement === true ||
      dto.clientVisible === true ||
      dto.status === MetaAdsReportStatus.PUBLISHED;

    if (shouldPublish) {
      if (!existing.publishedAt) {
        updateData.publishedAt = now;
      }
      if (!existing.publishedByUserId) {
        updateData.publishedBy = {
          connect: {
            id: currentUser.id,
          },
        };
      }
      if (dto.status === undefined) {
        updateData.status = MetaAdsReportStatus.PUBLISHED;
      }
      if (dto.clientVisible === undefined) {
        updateData.clientVisible = true;
      }
    }

    if (
      dto.requestAcknowledgement === true &&
      (dto.status === MetaAdsReportStatus.DRAFT || dto.status === MetaAdsReportStatus.ARCHIVED)
    ) {
      throw new BadRequestException(
        "Acknowledgement request cannot be created for DRAFT or ARCHIVED report status.",
      );
    }

    const fallbackProjectId =
      existing.projectId ??
      (await this.resolveMetaAdsReportProjectId(existing.clientProfileId, null));

    if (dto.requestAcknowledgement === true && !fallbackProjectId) {
      throw new BadRequestException(
        "A META_ADS project is required to request report acknowledgement.",
      );
    }

    if (dto.requestAcknowledgement === true && fallbackProjectId && !existing.projectId) {
      updateData.project = {
        connect: {
          id: fallbackProjectId,
        },
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let acknowledgementTaskId = existing.acknowledgementTaskId;

      if (dto.requestAcknowledgement === true && fallbackProjectId) {
        const taskPayload: Prisma.TaskUncheckedCreateInput = {
          projectId: fallbackProjectId,
          title: this.buildReportAcknowledgementTaskTitle(
            existing.type,
            existing.periodStart,
            existing.periodEnd,
          ),
          description: this.buildReportAcknowledgementTaskDescription(
            normalizedSummary ?? existing.summary ?? null,
          ),
          status: TaskStatus.REVIEW,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.META_ADS_REPORT_ACKNOWLEDGEMENT,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: now,
          approvalContext: {
            reportId: existing.id,
          },
        };

        if (acknowledgementTaskId) {
          await tx.task.update({
            where: { id: acknowledgementTaskId },
            data: {
              title: taskPayload.title,
              description: taskPayload.description,
              status: TaskStatus.REVIEW,
              approvalRequired: true,
              approvalType: MetaAdsApprovalType.META_ADS_REPORT_ACKNOWLEDGEMENT,
              approvalStatus: MetaAdsApprovalStatus.PENDING,
              approvalRequestedAt: now,
              approvalRespondedAt: null,
              approvalRespondedByUserId: null,
              approvalResponseNote: null,
              approvalContext: taskPayload.approvalContext,
            },
          });
        } else {
          const createdTask = await tx.task.create({
            data: taskPayload,
            select: { id: true },
          });
          acknowledgementTaskId = createdTask.id;
        }

        updateData.acknowledgementRequestedAt = now;
        if (acknowledgementTaskId) {
          updateData.acknowledgementTask = {
            connect: {
              id: acknowledgementTaskId,
            },
          };
        }
      }

      return tx.metaAdsReport.update({
        where: { id: existing.id },
        data: updateData,
        select: metaAdsReportSelect,
      });
    });

    return this.toMetaAdsReportItem(updated);
  }

  private toMetaAdsReportItem(report: MetaAdsReportModel): MetaAdsReportItem {
    const acknowledgementStatus =
      report.acknowledgementRequestedAt === null
        ? "NOT_REQUESTED"
        : report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.ACKNOWLEDGED ||
            report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.APPROVED
          ? "ACKNOWLEDGED"
          : report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.CHANGES_REQUESTED ||
              report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.REJECTED
            ? "CHANGES_REQUESTED"
            : "PENDING";

    return {
      id: report.id,
      clientProfileId: report.clientProfileId,
      projectId: report.projectId ?? null,
      projectName: report.project?.name ?? null,
      periodStart: report.periodStart.toISOString(),
      periodEnd: report.periodEnd.toISOString(),
      type: report.type,
      status: report.status,
      summary: report.summary ?? null,
      metricsSnapshot: (report.metricsSnapshot as Prisma.JsonValue | null) ?? null,
      clientVisible: report.clientVisible,
      publishedAt: report.publishedAt?.toISOString() ?? null,
      acknowledgementRequestedAt: report.acknowledgementRequestedAt?.toISOString() ?? null,
      acknowledgedAt: report.acknowledgedAt?.toISOString() ?? null,
      acknowledgementStatus,
      acknowledgementTaskId: report.acknowledgementTask?.id ?? null,
      acknowledgementTaskUpdatedAt: report.acknowledgementTask?.updatedAt.toISOString() ?? null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }

  private resolveMetaAdsReportPeriod(periodStartRaw: string, periodEndRaw: string): {
    periodStart: Date;
    periodEnd: Date;
  } {
    const periodStart = new Date(periodStartRaw);
    const periodEnd = new Date(periodEndRaw);

    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
      throw new BadRequestException("Report periodStart and periodEnd must be valid ISO date values.");
    }

    if (periodStart > periodEnd) {
      throw new BadRequestException("Report periodStart cannot be greater than periodEnd.");
    }

    return { periodStart, periodEnd };
  }

  private normalizeMetaAdsReportSummary(summary: string | undefined): string | null {
    if (summary === undefined) {
      return null;
    }

    const normalized = summary.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveMetaAdsReportProjectId(
    clientProfileId: string,
    projectId: string | null,
  ): Promise<string | null> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          clientProfileId,
          serviceKey: PurchasedServiceKey.META_ADS,
        },
        select: { id: true },
      });

      if (!project) {
        throw new BadRequestException(
          "Provided projectId is not a META_ADS project for this client.",
        );
      }

      return project.id;
    }

    const project = await this.prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.META_ADS,
      },
      select: { id: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return project?.id ?? null;
  }

  private buildReportAcknowledgementTaskTitle(
    reportType: MetaAdsReportType,
    periodStart: Date,
    periodEnd: Date,
  ): string {
    const start = periodStart.toISOString().slice(0, 10);
    const end = periodEnd.toISOString().slice(0, 10);
    return `Meta Ads Rapor Onayı · ${reportType} (${start} - ${end})`;
  }

  private buildReportAcknowledgementTaskDescription(summary: string | null): string {
    if (summary) {
      return `Rapor müşteri onayına açıldı. Özet: ${summary}`;
    }
    return "Rapor müşteri onayına açıldı.";
  }

  private assertHasMetaAdsReportUpdatePayload(dto: UpdateMetaAdsReportDto): void {
    if (
      dto.status === undefined &&
      dto.summary === undefined &&
      dto.metricsSnapshot === undefined &&
      dto.clientVisible === undefined &&
      dto.requestAcknowledgement === undefined
    ) {
      throw new BadRequestException("Provide at least one report field to update.");
    }
  }

  private async getAudiencesByClientProfileId(
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdSetAudienceItem[]; lastSyncAt: Date | null }> {
    const connection = await this.resolveReportingConnection(clientProfileId);
    const adAccountNode = connection.adAccountId.startsWith("act_")
      ? connection.adAccountId
      : `act_${connection.adAccountId}`;

    const data = await this.metaAdsApiService.fetchAdSetAudiences({
      adAccountNode,
      accessToken: connection.accessToken,
    });

    return { data, lastSyncAt: connection.lastSyncAt };
  }

  private async getAdCreativesByClientProfileId(
    clientProfileId: string,
  ): Promise<{ data: MetaAdsAdCreativeItem[]; lastSyncAt: Date | null }> {
    const connection = await this.resolveReportingConnection(clientProfileId);
    const adAccountNode = connection.adAccountId.startsWith("act_")
      ? connection.adAccountId
      : `act_${connection.adAccountId}`;

    const data = await this.metaAdsApiService.fetchAdCreatives({
      adAccountNode,
      accessToken: connection.accessToken,
    });

    return { data, lastSyncAt: connection.lastSyncAt };
  }

  private async resolveReportingConnection(clientProfileId: string): Promise<{
    accessToken: string;
    adAccountId: string;
    lastSyncAt: Date | null;
    connectionStatus: MetaAdsConnectionStatus;
  }> {
    const snapshot = await this.getConnectionSnapshot(clientProfileId);
    const encryptedAccessToken = snapshot.credential?.accessTokenEnc ?? null;
    const adAccountId = snapshot.config?.adAccountId?.trim() ?? "";

    if (!encryptedAccessToken) {
      throw new BadRequestException(
        "Meta access token not found. Connect this client before running sync.",
      );
    }

    if (!adAccountId) {
      throw new BadRequestException(
        "Meta adAccountId is required. Update connection config before running sync.",
      );
    }

    return {
      accessToken: this.metaAdsTokenService.decrypt(encryptedAccessToken),
      adAccountId,
      lastSyncAt: snapshot.config?.lastSyncAt ?? null,
      connectionStatus:
        snapshot.config?.connectionStatus ?? MetaAdsConnectionStatus.NOT_CONNECTED,
    };
  }

  private toInsightCreateManyInput(
    clientProfileId: string,
    adAccountId: string,
    level: MetaAdsInsightLevel,
    row: {
      dateStart: string;
      campaignId: string | null;
      campaignName: string | null;
      adSetId: string | null;
      adSetName: string | null;
      adId: string | null;
      adName: string | null;
      spend: string | null;
      impressions: number | null;
      reach: number | null;
      clicks: number | null;
      ctr: string | null;
      cpc: string | null;
      cpm: string | null;
      frequency: string | null;
      actions: MetaAdsApiActionMetric[];
      costPerActionType: MetaAdsApiActionMetric[];
      actionValues: MetaAdsApiActionMetric[];
      purchaseRoas: MetaAdsApiActionMetric[];
      raw: Record<string, unknown>;
    },
    campaignCatalog: MetaAdsCampaignCatalogItem | null,
  ): Prisma.MetaAdsDailyInsightCreateManyInput | null {
    const date = this.parseDateToUtcDay(row.dateStart);
    if (!date) {
      return null;
    }

    const spend = this.parseMetricNumber(row.spend);
    const impressions = row.impressions ?? null;
    const reach = row.reach ?? null;
    const clicks = row.clicks ?? null;

    const preferredResultActionType = this.findPreferredActionType(row.actions);
    const results = this.metricFromActions(row.actions, preferredResultActionType, 0);
    const costPerResult = this.metricFromActions(
      row.costPerActionType,
      preferredResultActionType,
      null,
    );
    const purchaseValue = this.metricFromActions(
      row.actionValues,
      "offsite_conversion.fb_pixel_purchase",
      this.metricFromActions(row.actionValues, "purchase", 0),
    );
    const roas = this.metricFromActions(
      row.purchaseRoas,
      "offsite_conversion.fb_pixel_purchase",
      this.metricFromActions(row.purchaseRoas, "purchase", null),
    );

    const ctr = this.parseMetricNumber(row.ctr);
    const cpc = this.parseMetricNumber(row.cpc);
    const cpm = this.parseMetricNumber(row.cpm);
    const frequency = this.parseMetricNumber(row.frequency);
    const rawPayload: Record<string, unknown> = {
      ...row.raw,
      ...(campaignCatalog
        ? {
            campaignMeta: {
              objective: campaignCatalog.objective,
              status: campaignCatalog.status,
              effectiveStatus: campaignCatalog.effectiveStatus,
            },
          }
        : {}),
    };

    return {
      clientProfileId,
      adAccountId,
      date,
      level,
      entityId: this.resolveEntityIdByLevel(level, row),
      entityName: this.resolveEntityNameByLevel(level, row),
      spend: this.toPrismaDecimal(spend),
      impressions,
      reach,
      clicks,
      ctr: this.toPrismaDecimal(
        ctr ?? this.roundPercentageByCounts(clicks ?? 0, impressions ?? 0, 6),
      ),
      cpc: this.toPrismaDecimal(cpc ?? this.roundDivision(spend ?? 0, clicks ?? 0, 6)),
      cpm: this.toPrismaDecimal(cpm ?? this.roundMille(spend ?? 0, impressions ?? 0, 6)),
      frequency: this.toPrismaDecimal(
        frequency ?? this.roundDivision(impressions ?? 0, reach ?? 0, 6),
      ),
      results,
      costPerResult: this.toPrismaDecimal(
        costPerResult ?? this.roundDivision(spend ?? 0, results ?? 0, 6),
      ),
      purchaseValue: this.toPrismaDecimal(purchaseValue),
      roas: this.toPrismaDecimal(
        roas ?? this.roundNullableDivision(purchaseValue, spend, 6),
      ),
      raw: rawPayload as Prisma.InputJsonValue,
    };
  }

  private resolveEntityIdByLevel(
    level: MetaAdsInsightLevel,
    row: {
      campaignId: string | null;
      adSetId: string | null;
      adId: string | null;
    },
  ): string | null {
    if (level === MetaAdsInsightLevel.CAMPAIGN) {
      return row.campaignId;
    }

    if (level === MetaAdsInsightLevel.ADSET) {
      return row.adSetId;
    }

    if (level === MetaAdsInsightLevel.AD) {
      return row.adId;
    }

    return null;
  }

  private resolveEntityNameByLevel(
    level: MetaAdsInsightLevel,
    row: {
      campaignName: string | null;
      adSetName: string | null;
      adName: string | null;
    },
  ): string | null {
    if (level === MetaAdsInsightLevel.CAMPAIGN) {
      return row.campaignName;
    }

    if (level === MetaAdsInsightLevel.ADSET) {
      return row.adSetName;
    }

    if (level === MetaAdsInsightLevel.AD) {
      return row.adName;
    }

    return null;
  }

  private aggregateInsightRows(rows: MetaAdsDailyInsightModel[]): Omit<MetaAdsSummaryResponse, "dateRange" | "lastSyncAt"> {
    let spend = 0;
    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    let results = 0;
    let purchaseValue = 0;

    for (const row of rows) {
      spend += this.readDecimalAsNumber(row.spend);
      impressions += row.impressions ?? 0;
      reach += row.reach ?? 0;
      clicks += row.clicks ?? 0;
      results += row.results ?? 0;
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
      frequency: this.roundDivision(impressions, reach),
      results,
      costPerResult: this.roundDivision(spend, results),
      roas: this.roundNullableDivision(purchaseValue, spend),
    };
  }

  private toInsightItem(insight: MetaAdsDailyInsightModel): MetaAdsInsightItem {
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
      frequency: this.round(this.readDecimalAsNumber(insight.frequency)),
      results: insight.results ?? 0,
      costPerResult: this.round(this.readDecimalAsNumber(insight.costPerResult)),
      purchaseValue: this.round(this.readDecimalAsNumber(insight.purchaseValue)),
      roas: this.roundNullable(this.readDecimalAsNumberNullable(insight.roas)),
      updatedAt: insight.updatedAt.toISOString(),
    };
  }

  private resolveReportDateRange(query: MetaAdsDateRangeQueryDto): MetaAdsReportDateRange {
    const resolvedUntil = query.until
      ? this.parseDateToUtcDay(query.until)
      : this.startOfUtcToday();
    if (!resolvedUntil) {
      throw new BadRequestException("Invalid since/until date range.");
    }

    const resolvedSince = query.since
      ? this.parseDateToUtcDay(query.since)
      : this.addDaysUtc(resolvedUntil, -(DEFAULT_REPORTING_RANGE_DAYS - 1));

    if (!resolvedSince) {
      throw new BadRequestException("Invalid since/until date range.");
    }

    if (resolvedSince.getTime() > resolvedUntil.getTime()) {
      throw new BadRequestException("since must be earlier than or equal to until.");
    }

    const daySpan = this.diffDaysInclusive(resolvedSince, resolvedUntil);
    if (daySpan > MAX_REPORTING_RANGE_DAYS) {
      throw new BadRequestException(
        `Meta Ads reporting range cannot exceed ${MAX_REPORTING_RANGE_DAYS} days.`,
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
      "META_ADS_SYNC_TTL_MINUTES",
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

    return DEFAULT_META_ADS_SYNC_TTL_MINUTES;
  }

  private normalizeSyncError(error: unknown): MetaAdsSyncErrorInfo {
    const normalizedError = this.metaAdsApiService.normalizeError(error);
    const message = this.normalizeErrorMessage(normalizedError.message);
    const lowerMessage = message.toLowerCase();

    if (
      normalizedError.category === "AUTH" ||
      lowerMessage.includes("token") && (lowerMessage.includes("expired") || lowerMessage.includes("invalid"))
    ) {
      return {
        code: "TOKEN_EXPIRED",
        category: normalizedError.category,
        adminMessage: "Meta erişim token süresi dolmuş veya geçersiz.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many") ||
      lowerMessage.includes("throttle")
    ) {
      return {
        code: "RATE_LIMIT",
        category: normalizedError.category,
        adminMessage: "Meta API rate limit sınırına ulaşıldı.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("business") &&
      (lowerMessage.includes("revoked") ||
        lowerMessage.includes("disabled") ||
        lowerMessage.includes("access"))
    ) {
      return {
        code: "BUSINESS_ACCESS_REVOKED",
        category: normalizedError.category,
        adminMessage: "Meta Business erişimi kaldırılmış görünüyor.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      lowerMessage.includes("ad account") &&
      (lowerMessage.includes("not found") ||
        lowerMessage.includes("unavailable") ||
        lowerMessage.includes("disabled"))
    ) {
      return {
        code: "AD_ACCOUNT_UNAVAILABLE",
        category: normalizedError.category,
        adminMessage: "Meta reklam hesabı erişilemez durumda.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      normalizedError.category === "PERMISSION" ||
      lowerMessage.includes("permission") ||
      lowerMessage.includes("not authorized")
    ) {
      return {
        code: "PERMISSION_MISSING",
        category: normalizedError.category,
        adminMessage: "Meta API izinleri eksik veya yetersiz.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    return {
      code: "UNKNOWN_API_ERROR",
      category: normalizedError.category,
      adminMessage:
        message.length > 0 ? `Meta API hatası: ${message}` : "Meta API beklenmeyen bir hata döndürdü.",
      clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
    };
  }

  private normalizeErrorMessage(message: string): string {
    return message.trim().replace(/\s+/g, " ");
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

  private metricFromActions(
    metrics: MetaAdsApiActionMetric[],
    actionType: string | null,
    fallback: number | null,
  ): number | null {
    if (!actionType) {
      return fallback;
    }

    const metric = metrics.find((item) => item.actionType === actionType);
    if (!metric) {
      return fallback;
    }

    const parsed = this.parseMetricNumber(metric.value);
    return parsed ?? fallback;
  }

  private findPreferredActionType(actions: MetaAdsApiActionMetric[]): string | null {
    for (const actionType of RESULT_ACTION_PRIORITY) {
      if (actions.some((item) => item.actionType === actionType)) {
        return actionType;
      }
    }

    return actions[0]?.actionType ?? null;
  }

  private extractCampaignMetaFromRaw(raw: Prisma.JsonValue | null): {
    objective: string | null;
    status: string | null;
    effectiveStatus: string | null;
  } {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {
        objective: null,
        status: null,
        effectiveStatus: null,
      };
    }

    const record = raw as Record<string, unknown>;
    const meta = record.campaignMeta;
    const metaRecord = meta && typeof meta === "object" && !Array.isArray(meta)
      ? (meta as Record<string, unknown>)
      : null;

    return {
      objective: this.readUnknownString(metaRecord?.objective ?? record.objective),
      status: this.readUnknownString(metaRecord?.status ?? record.status),
      effectiveStatus: this.readUnknownString(
        metaRecord?.effectiveStatus ?? record.effective_status ?? record.effectiveStatus,
      ),
    };
  }

  private readUnknownString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
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

  private readDecimalAsNumberNullable(value: Prisma.Decimal | null): number | null {
    return value ? value.toNumber() : null;
  }

  private round(value: number, digits = 2): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const scale = 10 ** digits;
    return Math.round(value * scale) / scale;
  }

  private roundNullable(value: number | null, digits = 2): number | null {
    if (value === null || !Number.isFinite(value)) {
      return null;
    }

    return this.round(value, digits);
  }

  private roundDivision(
    numerator: number,
    denominator: number,
    digits = 2,
  ): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round(numerator / denominator, digits);
  }

  private roundNullableDivision(
    numerator: number | null,
    denominator: number | null,
    digits = 2,
  ): number | null {
    if (
      numerator === null ||
      denominator === null ||
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator <= 0
    ) {
      return null;
    }

    return this.round(numerator / denominator, digits);
  }

  private roundPercentageByCounts(
    clicks: number,
    impressions: number,
    digits = 2,
  ): number {
    if (!Number.isFinite(clicks) || !Number.isFinite(impressions) || impressions <= 0) {
      return 0;
    }

    return this.round((clicks / impressions) * 100, digits);
  }

  private roundMille(spend: number, impressions: number, digits = 2): number {
    if (!Number.isFinite(spend) || !Number.isFinite(impressions) || impressions <= 0) {
      return 0;
    }

    return this.round((spend * 1000) / impressions, digits);
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
    syncErrorInfo: MetaAdsSyncErrorInfo,
    occurredAt = new Date(),
  ): Promise<void> {
    await this.prisma.clientMetaAdsConfig.upsert({
      where: { clientProfileId },
      update: {
        connectionStatus: MetaAdsConnectionStatus.ERROR,
        syncError: syncErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
      create: {
        clientProfileId,
        connectionStatus: MetaAdsConnectionStatus.ERROR,
        syncError: syncErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
    });
  }

  private toConnectionTestException(
    syncErrorInfo: MetaAdsSyncErrorInfo,
    options: {
      revealDetailedError: boolean;
    } = {
      revealDetailedError: true,
    },
  ): Error {
    const errorMessage = options.revealDetailedError
      ? syncErrorInfo.adminMessage
      : syncErrorInfo.clientMessage;

    if (
      syncErrorInfo.code === "PERMISSION_MISSING" ||
      syncErrorInfo.code === "BUSINESS_ACCESS_REVOKED"
    ) {
      return new ForbiddenException(errorMessage);
    }

    if (
      syncErrorInfo.code === "TOKEN_EXPIRED" ||
      syncErrorInfo.code === "AD_ACCOUNT_UNAVAILABLE"
    ) {
      return new BadRequestException(errorMessage);
    }

    return new BadGatewayException(errorMessage);
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

  private assertCanReadReports(currentUser: AuthenticatedUser): void {
    this.assertHasPermission(currentUser, REPORTS_READ_PERMISSION);
  }

  private assertCanManageReports(currentUser: AuthenticatedUser): void {
    this.assertHasPermission(currentUser, REPORTS_MANAGE_PERMISSION);
  }

  private assertCanReadOwnReports(currentUser: AuthenticatedUser): void {
    this.assertHasPermission(currentUser, REPORTS_READ_OWN_PERMISSION);
  }

  private assertCanReadAssignedReporting(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Only employee accounts can read assigned Meta Ads reports.");
    }

    this.assertHasPermission(currentUser, META_ADS_REPORTING_READ_ASSIGNED_PERMISSION);
  }

  private assertCanManageAssignedNotes(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Only employee accounts can manage assigned Meta Ads notes.");
    }

    this.assertHasPermission(currentUser, META_ADS_NOTES_MANAGE_ASSIGNED_PERMISSION);
  }

  private assertCanCreateAssignedApprovals(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Only employee accounts can create Meta Ads approvals.");
    }

    this.assertHasPermission(currentUser, META_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION);
  }

  private assertCanRunAssignedSync(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Only employee accounts can run assigned Meta Ads sync.");
    }

    this.assertHasPermission(currentUser, META_ADS_SYNC_READ_ASSIGNED_PERMISSION);
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

  async syncAllConnectedClientsForScheduler(): Promise<{ attempted: number; succeeded: number; failed: number }> {
    const connectedConfigs = await this.prisma.clientMetaAdsConfig.findMany({
      where: { connectionStatus: MetaAdsConnectionStatus.CONNECTED },
      select: { clientProfileId: true },
    });

    let succeeded = 0;
    let failed = 0;

    for (const config of connectedConfigs) {
      try {
        await this.syncInsightsByClientProfileId(config.clientProfileId, {}, {
          trigger: "MANUAL_SYNC",
          applySyncTtl: true,
          revealDetailedError: false,
        });
        succeeded++;
      } catch {
        failed++;
      }
    }

    return { attempted: connectedConfigs.length, succeeded, failed };
  }
}
