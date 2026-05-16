import {
  AccountType,
  DeliveryReleaseApprovalStatus,
  GoogleAdsConnectionStatus,
  GoogleAdsInsightLevel,
  GoogleAdsReportStatus,
  GoogleAdsReportType,
  GoogleAdsSyncStatus,
  MetaAdsApprovalType,
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
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { ConnectManualGoogleAdsDto } from "./dto/connect-manual-google-ads.dto";
import { CreateGoogleAdsReportDto } from "./dto/create-google-ads-report.dto";
import { GoogleAdsCampaignsQueryDto } from "./dto/google-ads-campaigns-query.dto";
import { GoogleAdsDateRangeQueryDto } from "./dto/google-ads-date-range-query.dto";
import { GoogleAdsInsightsQueryDto } from "./dto/google-ads-insights-query.dto";
import { GoogleAdsReportsQueryDto } from "./dto/google-ads-reports-query.dto";
import { GoogleAdsSyncLogsQueryDto } from "./dto/google-ads-sync-logs-query.dto";
import { TestGoogleAdsConnectionDto } from "./dto/test-google-ads-connection.dto";
import { UpdateGoogleAdsReportDto } from "./dto/update-google-ads-report.dto";
import { UpdateGoogleAdsConfigDto } from "./dto/update-google-ads-config.dto";
import {
  GoogleAdsApiService,
  type GoogleAdsConnectionTestResult,
  type GoogleAdsReportingInsightRow,
  type GoogleAdsReportingSnapshotResult,
} from "./google-ads-api.service";
import { GoogleAdsTokenService } from "./google-ads-token.service";

const GOOGLE_ADS_CONFIG_READ_ANY_PERMISSION = "googleAds.config.read.any";
const GOOGLE_ADS_CONFIG_MANAGE_ANY_PERMISSION = "googleAds.config.manage.any";
const GOOGLE_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "googleAds.config.read.assigned";
const GOOGLE_ADS_REPORTING_READ_ASSIGNED_PERMISSION = "googleAds.reporting.read.assigned";
const GOOGLE_ADS_NOTES_MANAGE_ASSIGNED_PERMISSION = "googleAds.notes.manage.assigned";
const GOOGLE_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION = "googleAds.approvals.create.assigned";
const GOOGLE_ADS_SYNC_READ_ASSIGNED_PERMISSION = "googleAds.sync.read.assigned";
const GOOGLE_ADS_CONFIG_READ_OWN_PERMISSION = "googleAds.config.read.own";
const GOOGLE_ADS_REPORTING_READ_ANY_PERMISSION = "googleAds.reporting.read.any";
const GOOGLE_ADS_SYNC_RUN_ANY_PERMISSION = "googleAds.sync.run.any";
const REPORTS_READ_PERMISSION = "reports.read";
const REPORTS_MANAGE_PERMISSION = "reports.manage";
const REPORTS_READ_OWN_PERMISSION = "reports.read.own";
const DEFAULT_GOOGLE_ADS_REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/adwords",
] as const;
const DEFAULT_REPORTING_RANGE_DAYS = 7;
const MAX_REPORTING_RANGE_DAYS = 90;
const DEFAULT_CAMPAIGNS_LIMIT = 12;
const DEFAULT_INSIGHTS_LIMIT = 100;
const DEFAULT_GOOGLE_ADS_SYNC_TTL_MINUTES = 30;
const CLIENT_SAFE_SYNC_ERROR_MESSAGE = "Bağlantı problemi var, ekibimiz ilgileniyor.";
const MAX_SANITIZED_SYNC_ERROR_MESSAGE_LENGTH = 280;

const googleAdsConfigSummarySelect = {
  customerId: true,
  managerCustomerId: true,
  descriptiveName: true,
  currencyCode: true,
  timeZone: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
} satisfies Prisma.ClientGoogleAdsConfigSelect;

const googleAdsCredentialSecureSelect = {
  refreshTokenEnc: true,
  accessTokenEnc: true,
  tokenHash: true,
  tokenExpiresAt: true,
  grantedScopes: true,
  updatedAt: true,
} satisfies Prisma.ClientGoogleAdsCredentialSelect;

const googleAdsDailyInsightSelect = {
  id: true,
  clientProfileId: true,
  customerId: true,
  date: true,
  level: true,
  entityId: true,
  entityName: true,
  costMicros: true,
  impressions: true,
  clicks: true,
  conversions: true,
  conversionValue: true,
  ctr: true,
  averageCpc: true,
  costPerConversion: true,
  interactions: true,
  raw: true,
  updatedAt: true,
} satisfies Prisma.GoogleAdsDailyInsightSelect;

const googleAdsSyncLogSelect = {
  id: true,
  clientProfileId: true,
  customerId: true,
  managerCustomerId: true,
  status: true,
  startedAt: true,
  finishedAt: true,
  errorCode: true,
  errorMessage: true,
  recordsFetched: true,
  apiCallCount: true,
  createdAt: true,
} satisfies Prisma.GoogleAdsSyncLogSelect;

const googleAdsReportSelect = {
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
} satisfies Prisma.GoogleAdsReportSelect;

type GoogleAdsConfigModel = Prisma.ClientGoogleAdsConfigGetPayload<{
  select: typeof googleAdsConfigSummarySelect;
}>;

type GoogleAdsCredentialSecureModel = Prisma.ClientGoogleAdsCredentialGetPayload<{
  select: typeof googleAdsCredentialSecureSelect;
}>;

type GoogleAdsDailyInsightModel = Prisma.GoogleAdsDailyInsightGetPayload<{
  select: typeof googleAdsDailyInsightSelect;
}>;

type GoogleAdsReportModel = Prisma.GoogleAdsReportGetPayload<{
  select: typeof googleAdsReportSelect;
}>;

type GoogleAdsConfigPatchData = {
  customerId?: string | null;
  managerCustomerId?: string | null;
  descriptiveName?: string | null;
  currencyCode?: string | null;
  timeZone?: string | null;
  connectionStatus?: GoogleAdsConnectionStatus;
  lastSyncAt?: Date | null;
  syncError?: string | null;
};

type GoogleAdsConfigSummaryResponse = {
  clientProfileId: string;
  connectionStatus: GoogleAdsConnectionStatus;
  account: {
    customerId: string | null;
    managerCustomerId: string | null;
    descriptiveName: string | null;
    currencyCode: string | null;
    timeZone: string | null;
  };
  lastSyncAt: Date | null;
  syncError: string | null;
};

type AdminGoogleAdsConnectionResponse = GoogleAdsConfigSummaryResponse & {
  hasActiveService: boolean;
  credential: {
    hasRefreshToken: boolean;
    tokenLastUpdatedAt: Date | null;
    tokenExpiresAt: Date | null;
    grantedScopes: string[];
  };
};

type OwnGoogleAdsConfigSummaryResponse = {
  connectionStatus: GoogleAdsConnectionStatus;
  account: {
    customerId: string | null;
    managerCustomerId: string | null;
    descriptiveName: string | null;
    currencyCode: string | null;
    timeZone: string | null;
  };
  hasActiveService: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;
};

type AdminGoogleAdsConnectionTestResponse = {
  success: true;
  checkedAt: Date;
  connection: AdminGoogleAdsConnectionResponse;
  account: {
    customerId: string;
    managerCustomerId: string | null;
    descriptiveName: string | null;
    currencyCode: string | null;
    timeZone: string | null;
  };
  grantedScopes: string[];
};

type GoogleAdsReportDateRange = {
  since: Date;
  until: Date;
  sinceIsoDate: string;
  untilIsoDate: string;
};

type GoogleAdsSummaryResponse = {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number | null;
  ctr: number;
  averageCpc: number;
  costPerConversion: number | null;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsCampaignSummary = {
  id: string;
  name: string;
  channelType: string;
  status: string;
  servingStatus: string | null;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
};

type GoogleAdsCampaignsResponse = {
  data: GoogleAdsCampaignSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsAdGroupSummary = {
  id: string;
  campaignName: string;
  adGroupName: string;
  status: string;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
};

type GoogleAdsAdGroupsResponse = {
  data: GoogleAdsAdGroupSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsAdSummary = {
  id: string;
  campaignName: string;
  adGroupName: string;
  adName: string;
  adType: string;
  status: string;
  finalUrl: string | null;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
};

type GoogleAdsAdsResponse = {
  data: GoogleAdsAdSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsKeywordSummary = {
  id: string;
  keywordText: string;
  matchType: string;
  campaignName: string;
  adGroupName: string;
  status: string;
  cost: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
};

type GoogleAdsKeywordsResponse = {
  data: GoogleAdsKeywordSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsConversionSummary = {
  id: string;
  conversionAction: string;
  conversions: number;
  conversionValue: number | null;
  costPerConversion: number | null;
  conversionRate: number;
};

type GoogleAdsConversionsResponse = {
  data: GoogleAdsConversionSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsSearchTermSummary = {
  id: string;
  searchTerm: string;
  campaignName: string;
  adGroupName: string;
  keywordText: string | null;
  cost: number;
  clicks: number;
  conversions: number;
  ctr: number;
};

type GoogleAdsSearchTermsResponse = {
  data: GoogleAdsSearchTermSummary[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsInsightItem = {
  id: string;
  date: string;
  level: GoogleAdsInsightLevel;
  entityId: string | null;
  entityName: string | null;
  cost: number;
  costMicros: string;
  impressions: number;
  clicks: number;
  interactions: number;
  conversions: number;
  conversionValue: number | null;
  ctr: number;
  averageCpc: number;
  costPerConversion: number | null;
  updatedAt: string;
};

type GoogleAdsInsightsResponse = {
  data: GoogleAdsInsightItem[];
  level: GoogleAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: Date | null;
};

type GoogleAdsSyncResponse = {
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
  connectionStatus: GoogleAdsConnectionStatus;
  lastSyncAt: Date | null;
  syncStatus: GoogleAdsSyncStatus;
  skippedReason: string | null;
};

type GoogleAdsSyncTrigger =
  | "MANUAL_SYNC"
  | "SCHEDULED_SYNC"
  | "ON_DEMAND_CLIENT_REFRESH"
  | "ON_DEMAND_ASSIGNED_REFRESH"
  | "ERROR_RETRY";

type AdminGoogleAdsSyncLogItem = {
  id: string;
  clientProfileId: string;
  clientCompanyName: string;
  customerId: string | null;
  managerCustomerId: string | null;
  status: GoogleAdsSyncStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  recordsFetched: number | null;
  apiCallCount: number | null;
  createdAt: Date;
};

type AdminGoogleAdsSyncLogsResponse = {
  data: AdminGoogleAdsSyncLogItem[];
  meta: {
    total: number;
    failed: number;
    running: number;
    skipped: number;
  };
};

type AdminGoogleAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: string;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: GoogleAdsConnectionStatus;
  hasRefreshToken: boolean;
  account: {
    customerId: string | null;
    managerCustomerId: string | null;
    descriptiveName: string | null;
    currencyCode: string | null;
    timeZone: string | null;
  };
  lastSyncAt: Date | null;
  syncError: string | null;
  summary: {
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionValue: number | null;
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
    googleAdsProjectId: string | null;
  };
};

type AdminGoogleAdsClientListResponse = {
  data: AdminGoogleAdsClientListItem[];
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

type GoogleAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

type GoogleAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: GoogleAdsReportType;
  status: GoogleAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Prisma.JsonValue | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: GoogleAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type GoogleAdsReportsResponse = {
  data: GoogleAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

type GoogleAdsSyncErrorCode =
  | "TOKEN_EXPIRED"
  | "DEVELOPER_TOKEN_MISSING"
  | "PERMISSION_DENIED"
  | "CUSTOMER_NOT_ENABLED"
  | "INVALID_CUSTOMER_ID"
  | "MANAGER_ACCESS_MISSING"
  | "RATE_LIMIT"
  | "GAQL_QUERY_ERROR"
  | "UNKNOWN_API_ERROR";

type GoogleAdsSyncErrorInfo = {
  code: GoogleAdsSyncErrorCode;
  adminMessage: string;
  clientMessage: string;
};

@Injectable()
export class GoogleAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAdsTokenService: GoogleAdsTokenService,
    private readonly googleAdsApiService: GoogleAdsApiService,
    private readonly configService: ConfigService,
  ) {}

  async getAdminClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<GoogleAdsConfigSummaryResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    const config = await this.prisma.clientGoogleAdsConfig.findUnique({
      where: { clientProfileId },
      select: googleAdsConfigSummarySelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async getAdminClientConnection(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminGoogleAdsConnectionResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    return this.getConnectionSummaryByClientProfileId(clientProfileId);
  }

  async getAdminGoogleAdsClients(
    currentUser: AuthenticatedUser,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<AdminGoogleAdsClientListResponse> {
    this.assertCanReadAnyConfig(currentUser);
    this.assertCanReadAnyReporting(currentUser);
    const dateRange = this.resolveReportDateRange(query);

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
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
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
          },
          select: {
            status: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
        googleAdsConfig: {
          select: googleAdsConfigSummarySelect,
        },
        googleAdsCredential: {
          select: {
            tokenHash: true,
          },
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
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
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
      this.prisma.googleAdsDailyInsight.groupBy({
        by: ["clientProfileId"],
        where: {
          clientProfileId: {
            in: clientProfileIds,
          },
          level: GoogleAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        _sum: {
          costMicros: true,
          impressions: true,
          clicks: true,
          conversions: true,
          conversionValue: true,
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
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
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
            serviceKey: PurchasedServiceKey.GOOGLE_ADS,
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
        cost: number;
        impressions: number;
        clicks: number;
        conversions: number;
        conversionValue: number;
      }
    >();
    for (const row of insightsByClient) {
      insightTotalsByClientId.set(row.clientProfileId, {
        cost: this.microsToCurrency(this.readBigInt(row._sum.costMicros)),
        impressions: row._sum.impressions ?? 0,
        clicks: row._sum.clicks ?? 0,
        conversions: this.readDecimalAsNumber(row._sum.conversions),
        conversionValue: this.readDecimalAsNumber(row._sum.conversionValue),
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

    const data: AdminGoogleAdsClientListItem[] = clients.map((client) => {
      const config = client.googleAdsConfig;
      const insightTotals = insightTotalsByClientId.get(client.id);

      return {
        client: {
          id: client.id,
          slug: client.slug,
          companyName: client.companyName,
          status: client.status,
        },
        serviceStatus: client.purchasedServices[0]?.status ?? PurchasedServiceStatus.INACTIVE,
        connectionStatus: config?.connectionStatus ?? GoogleAdsConnectionStatus.NOT_CONNECTED,
        hasRefreshToken: Boolean(client.googleAdsCredential?.tokenHash),
        account: {
          customerId: config?.customerId ?? null,
          managerCustomerId: config?.managerCustomerId ?? null,
          descriptiveName: config?.descriptiveName ?? null,
          currencyCode: config?.currencyCode ?? null,
          timeZone: config?.timeZone ?? null,
        },
        lastSyncAt: config?.lastSyncAt ?? null,
        syncError: config?.syncError ?? null,
        summary: {
          cost: this.round(insightTotals?.cost ?? 0),
          impressions: insightTotals?.impressions ?? 0,
          clicks: insightTotals?.clicks ?? 0,
          conversions: this.round(insightTotals?.conversions ?? 0),
          conversionValue:
            insightTotals && insightTotals.conversionValue > 0
              ? this.round(insightTotals.conversionValue)
              : null,
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
          googleAdsProjectId: client.projects[0]?.id ?? null,
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
          (item) => item.connectionStatus === GoogleAdsConnectionStatus.CONNECTED,
        ).length,
        error: data.filter((item) => item.connectionStatus === GoogleAdsConnectionStatus.ERROR)
          .length,
        pendingApprovals: data.reduce((total, item) => total + item.pendingApprovals, 0),
      },
    };
  }

  async getAdminSyncLogs(
    currentUser: AuthenticatedUser,
    query: GoogleAdsSyncLogsQueryDto,
  ): Promise<AdminGoogleAdsSyncLogsResponse> {
    this.assertCanReadAnyConfig(currentUser);

    const statusFilter =
      query.status !== undefined
        ? query.status
        : query.failedOnly
          ? {
              in: [GoogleAdsSyncStatus.FAILED, GoogleAdsSyncStatus.PARTIAL],
            }
          : undefined;

    const where: Prisma.GoogleAdsSyncLogWhereInput = {
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    };
    const take = query.limit ?? 40;

    const [rows, total, failed, running, skipped] = await Promise.all([
      this.prisma.googleAdsSyncLog.findMany({
        where,
        select: {
          ...googleAdsSyncLogSelect,
          clientProfile: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take,
      }),
      this.prisma.googleAdsSyncLog.count({ where }),
      this.prisma.googleAdsSyncLog.count({
        where: {
          ...where,
          status: {
            in: [GoogleAdsSyncStatus.FAILED, GoogleAdsSyncStatus.PARTIAL],
          },
        },
      }),
      this.prisma.googleAdsSyncLog.count({
        where: {
          ...where,
          status: GoogleAdsSyncStatus.RUNNING,
        },
      }),
      this.prisma.googleAdsSyncLog.count({
        where: {
          ...where,
          status: GoogleAdsSyncStatus.SKIPPED,
        },
      }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        clientProfileId: row.clientProfileId,
        clientCompanyName: row.clientProfile.companyName,
        customerId: row.customerId,
        managerCustomerId: row.managerCustomerId,
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
    dto: UpdateGoogleAdsConfigDto,
  ): Promise<GoogleAdsConfigSummaryResponse> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertHasConfigUpdatePayload(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    const patchData = this.buildConfigPatchData(dto);
    const config = await this.prisma.clientGoogleAdsConfig.upsert({
      where: { clientProfileId },
      update: patchData,
      create: {
        clientProfileId,
        ...patchData,
      },
      select: googleAdsConfigSummarySelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async connectAdminClientManual(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: ConnectManualGoogleAdsDto,
  ): Promise<AdminGoogleAdsConnectionResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    const refreshToken = dto.refreshToken.trim();
    const accessToken = dto.accessToken?.trim() ?? null;
    const tokenExpiresAt = dto.tokenExpiresAt ? new Date(dto.tokenExpiresAt) : null;
    const grantedScopes = this.resolveGrantedScopes(dto.grantedScopes);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientGoogleAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          refreshTokenEnc: this.googleAdsTokenService.encrypt(refreshToken),
          accessTokenEnc:
            accessToken && accessToken.length > 0
              ? this.googleAdsTokenService.encrypt(accessToken)
              : null,
          tokenHash: this.googleAdsTokenService.hash(refreshToken),
          tokenExpiresAt,
          grantedScopes,
        },
        create: {
          clientProfileId,
          refreshTokenEnc: this.googleAdsTokenService.encrypt(refreshToken),
          accessTokenEnc:
            accessToken && accessToken.length > 0
              ? this.googleAdsTokenService.encrypt(accessToken)
              : null,
          tokenHash: this.googleAdsTokenService.hash(refreshToken),
          tokenExpiresAt,
          grantedScopes,
        },
      });

      const configPatch: GoogleAdsConfigPatchData = {
        ...(dto.customerId !== undefined ? { customerId: dto.customerId } : {}),
        ...(dto.managerCustomerId !== undefined
          ? { managerCustomerId: dto.managerCustomerId }
          : {}),
        ...(dto.descriptiveName !== undefined ? { descriptiveName: dto.descriptiveName } : {}),
        ...(dto.currencyCode !== undefined ? { currencyCode: dto.currencyCode } : {}),
        ...(dto.timeZone !== undefined ? { timeZone: dto.timeZone } : {}),
        connectionStatus: GoogleAdsConnectionStatus.PENDING,
        syncError: null,
      };

      await tx.clientGoogleAdsConfig.upsert({
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
  ): Promise<AdminGoogleAdsConnectionResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientGoogleAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          refreshTokenEnc: null,
          accessTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
        create: {
          clientProfileId,
          refreshTokenEnc: null,
          accessTokenEnc: null,
          tokenHash: null,
          tokenExpiresAt: null,
          grantedScopes: [],
        },
      });

      await tx.clientGoogleAdsConfig.upsert({
        where: { clientProfileId },
        update: {
          connectionStatus: GoogleAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
        create: {
          clientProfileId,
          connectionStatus: GoogleAdsConnectionStatus.DISCONNECTED,
          syncError: null,
        },
      });
    });

    return this.getConnectionSummaryByClientProfileId(clientProfileId);
  }

  async testAdminClientConnection(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: TestGoogleAdsConnectionDto,
  ): Promise<AdminGoogleAdsConnectionTestResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    const existingConnection = await this.getConnectionSnapshot(clientProfileId);
    const refreshToken = this.resolveRefreshTokenForConnectionTest(
      dto.refreshToken,
      existingConnection.credential,
    );
    const accessToken = this.resolveAccessTokenForConnectionTest(
      dto.accessToken,
      existingConnection.credential,
    );
    const customerId = this.resolveCustomerIdForConnectionTest(
      dto.customerId,
      existingConnection.config,
    );
    const managerCustomerId = this.resolveManagerCustomerIdForConnectionTest(
      dto.managerCustomerId,
      existingConnection.config,
    );
    const requiredScopes = this.resolveRequiredScopes(dto.requiredScopes);

    let connectionTestResult: GoogleAdsConnectionTestResult;
    try {
      connectionTestResult = await this.googleAdsApiService.testConnection({
        refreshToken,
        accessToken,
        customerId,
        managerCustomerId,
        requiredScopes,
      });
    } catch (error) {
      const syncErrorInfo = this.normalizeSyncError(error);
      await this.markConnectionAsError(clientProfileId, syncErrorInfo);
      throw this.toConnectionTestException(syncErrorInfo);
    }

    const checkedAt = new Date();
    const grantedScopes = this.normalizeScopes(connectionTestResult.grantedScopes);

    await this.prisma.$transaction(async (tx) => {
      const tokenHash = this.googleAdsTokenService.hash(refreshToken);
      const shouldUseInputAccessToken =
        typeof dto.accessToken === "string" && dto.accessToken.trim().length > 0;

      const nextAccessTokenEnc = shouldUseInputAccessToken
        ? this.googleAdsTokenService.encrypt(dto.accessToken!.trim())
        : existingConnection.credential?.accessTokenEnc ?? null;

      await tx.clientGoogleAdsCredential.upsert({
        where: { clientProfileId },
        update: {
          refreshTokenEnc: this.googleAdsTokenService.encrypt(refreshToken),
          accessTokenEnc: nextAccessTokenEnc,
          tokenHash,
          tokenExpiresAt: existingConnection.credential?.tokenExpiresAt ?? null,
          grantedScopes,
        },
        create: {
          clientProfileId,
          refreshTokenEnc: this.googleAdsTokenService.encrypt(refreshToken),
          accessTokenEnc: nextAccessTokenEnc,
          tokenHash,
          tokenExpiresAt: existingConnection.credential?.tokenExpiresAt ?? null,
          grantedScopes,
        },
      });

      await tx.clientGoogleAdsConfig.upsert({
        where: { clientProfileId },
        update: {
          customerId: connectionTestResult.customerId,
          managerCustomerId: connectionTestResult.managerCustomerId,
          descriptiveName: connectionTestResult.descriptiveName,
          currencyCode: connectionTestResult.currencyCode,
          timeZone: connectionTestResult.timeZone,
          connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
          syncError: null,
          lastSyncAt: checkedAt,
        },
        create: {
          clientProfileId,
          customerId: connectionTestResult.customerId,
          managerCustomerId: connectionTestResult.managerCustomerId,
          descriptiveName: connectionTestResult.descriptiveName,
          currencyCode: connectionTestResult.currencyCode,
          timeZone: connectionTestResult.timeZone,
          connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
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
        customerId: connectionTestResult.customerId,
        managerCustomerId: connectionTestResult.managerCustomerId,
        descriptiveName: connectionTestResult.descriptiveName,
        currencyCode: connectionTestResult.currencyCode,
        timeZone: connectionTestResult.timeZone,
      },
      grantedScopes,
    };
  }

  async getAssignedClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<GoogleAdsConfigSummaryResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);

    const config = await this.prisma.clientGoogleAdsConfig.findUnique({
      where: { clientProfileId },
      select: googleAdsConfigSummarySelect,
    });

    return this.toAdminConfigSummary(clientProfileId, config);
  }

  async getOwnClientConfig(
    currentUser: AuthenticatedUser,
  ): Promise<OwnGoogleAdsConfigSummaryResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);

    const [config, activeServiceCount] = await this.prisma.$transaction([
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: googleAdsConfigSummarySelect,
      }),
      this.prisma.clientPurchasedService.count({
        where: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.GOOGLE_ADS,
          status: PurchasedServiceStatus.ACTIVE,
        },
      }),
    ]);

    return this.toOwnConfigSummary(config, activeServiceCount > 0);
  }

  async getAdminClientSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSummaryResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getAdminClientCampaigns(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsCampaignsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsInsightsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async getAdminClientAdGroups(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, GoogleAdsInsightLevel.AD_GROUP);
  }

  async getAdminClientAds(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, GoogleAdsInsightLevel.AD);
  }

  async syncAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSyncResponse> {
    this.assertCanRunAnySync(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "MANUAL_SYNC",
      applySyncTtl: false,
      revealDetailedError: true,
    });
  }

  async retryAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSyncResponse> {
    this.assertCanRunAnySync(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ERROR_RETRY",
      applySyncTtl: false,
      revealDetailedError: true,
    });
  }

  async getAdminClientReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsReportsQueryDto,
  ): Promise<GoogleAdsReportsResponse> {
    this.assertCanReadAnyConfig(currentUser);
    this.assertCanReadReports(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: false,
    });
  }

  async createAdminClientReport(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateGoogleAdsReportDto,
  ): Promise<GoogleAdsReportItem> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertCanManageReports(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.createReportByClientProfileId(currentUser, clientProfileId, dto);
  }

  async updateAdminReport(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateGoogleAdsReportDto,
  ): Promise<GoogleAdsReportItem> {
    this.assertCanManageAnyConfig(currentUser);
    this.assertCanManageReports(currentUser);

    return this.updateReportById(currentUser, reportId, dto, { scope: "ANY" });
  }

  async getAssignedClientSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSummaryResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientCampaigns(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsCampaignsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsInsightsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientAdGroups(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, GoogleAdsInsightLevel.AD_GROUP);
  }

  async getAssignedClientAds(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByFixedLevel(clientProfileId, query, GoogleAdsInsightLevel.AD);
  }

  async getAssignedClientKeywords(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsKeywordsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getKeywordsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientConversions(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsConversionsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getConversionsByClientProfileId(clientProfileId, query);
  }

  async getAssignedClientSearchTerms(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsSearchTermsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getSearchTermsByClientProfileId(clientProfileId, query);
  }

  async syncAssignedClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSyncResponse> {
    this.assertCanReadAssignedSync(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ON_DEMAND_ASSIGNED_REFRESH",
      applySyncTtl: true,
      revealDetailedError: true,
    });
  }

  async getAssignedClientReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: GoogleAdsReportsQueryDto,
  ): Promise<GoogleAdsReportsResponse> {
    this.assertCanReadAssignedReporting(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: false,
    });
  }

  async createAssignedClientReport(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateGoogleAdsReportDto,
  ): Promise<GoogleAdsReportItem> {
    this.assertCanReadAssignedConfig(currentUser);
    this.assertCanManageAssignedNotes(currentUser);
    if (dto.requestAcknowledgement === true) {
      this.assertCanCreateAssignedApprovals(currentUser);
    }
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.createReportByClientProfileId(currentUser, clientProfileId, dto);
  }

  async updateAssignedReport(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateGoogleAdsReportDto,
  ): Promise<GoogleAdsReportItem> {
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

  async getOwnClientSummary(
    currentUser: AuthenticatedUser,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSummaryResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getSummaryByClientProfileId(clientProfileId, query);
  }

  async getOwnClientCampaigns(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsCampaignsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getCampaignsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientAdGroups(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsAdGroupsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getAdGroupsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientAds(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsAdsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getAdsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientKeywords(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsKeywordsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getKeywordsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientConversions(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsConversionsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getConversionsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientSearchTerms(
    currentUser: AuthenticatedUser,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsSearchTermsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getSearchTermsByClientProfileId(clientProfileId, query);
  }

  async getOwnClientInsights(
    currentUser: AuthenticatedUser,
    query: GoogleAdsInsightsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query);
  }

  async syncOwnClientInsights(
    currentUser: AuthenticatedUser,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSyncResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query, {
      trigger: "ON_DEMAND_CLIENT_REFRESH",
      applySyncTtl: true,
      revealDetailedError: false,
    });
  }

  async getOwnClientReports(
    currentUser: AuthenticatedUser,
    query: GoogleAdsReportsQueryDto,
  ): Promise<GoogleAdsReportsResponse> {
    this.assertCanReadOwnConfig(currentUser);
    this.assertCanReadOwnReports(currentUser);
    const clientProfileId = this.getClientProfileIdOrFail(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGoogleAdsService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, {
      onlyClientVisible: true,
    });
  }

  private async getSummaryByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
  ): Promise<GoogleAdsSummaryResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.ACCOUNT,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
        orderBy: { date: "asc" },
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const totals = this.aggregateAccountRows(insights);
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
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsCampaignsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_CAMPAIGNS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.CAMPAIGN,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const campaignMap = new Map<string, GoogleAdsCampaignSummary>();

    for (const insight of insights) {
      const campaignId = insight.entityId ?? "";
      if (!campaignId) {
        continue;
      }

      const meta = this.extractCampaignMetaFromRaw(insight.raw);
      const existing = campaignMap.get(campaignId);
      const costMicros = this.readBigInt(insight.costMicros);
      const cost = this.microsToCurrency(costMicros);
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);

      if (!existing) {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: insight.entityName ?? campaignId,
          channelType: meta.channelType ?? "UNSPECIFIED",
          status: meta.status ?? "UNKNOWN",
          servingStatus: meta.servingStatus ?? null,
          cost,
          impressions,
          clicks,
          conversions,
          ctr: this.roundPercentageByCounts(clicks, impressions),
          averageCpc: this.roundDivision(cost, clicks),
        });
        continue;
      }

      existing.cost += cost;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.conversions += conversions;
      existing.ctr = this.roundPercentageByCounts(existing.clicks, existing.impressions);
      existing.averageCpc = this.roundDivision(existing.cost, existing.clicks);
      existing.name = insight.entityName ?? existing.name;
      if (meta.channelType) {
        existing.channelType = meta.channelType;
      }
      if (meta.status) {
        existing.status = meta.status;
      }
      if (meta.servingStatus) {
        existing.servingStatus = meta.servingStatus;
      }
    }

    const campaigns = Array.from(campaignMap.values())
      .sort((left, right) => right.cost - left.cost)
      .slice(0, limit)
      .map((item) => ({
        ...item,
        cost: this.round(item.cost),
        conversions: this.round(item.conversions),
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

  private async getAdGroupsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsAdGroupsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.AD_GROUP,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const adGroupMap = new Map<string, GoogleAdsAdGroupSummary>();
    for (const insight of insights) {
      const meta = this.extractEntityMetaFromRaw(insight.raw);
      const adGroupId = insight.entityId ?? `${meta.adGroupName ?? "ad-group"}-${insight.id}`;
      const campaignName = meta.campaignName ?? "—";
      const adGroupName = insight.entityName ?? meta.adGroupName ?? adGroupId;
      const status = meta.adGroupStatus ?? meta.status ?? "UNKNOWN";
      const cost = this.microsToCurrency(this.readBigInt(insight.costMicros));
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);

      const existing = adGroupMap.get(adGroupId);
      if (!existing) {
        adGroupMap.set(adGroupId, {
          id: adGroupId,
          campaignName,
          adGroupName,
          status,
          cost,
          impressions,
          clicks,
          conversions,
          ctr: this.roundPercentageByCounts(clicks, impressions),
          averageCpc: this.roundDivision(cost, clicks),
        });
        continue;
      }

      existing.cost += cost;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.conversions += conversions;
      existing.ctr = this.roundPercentageByCounts(existing.clicks, existing.impressions);
      existing.averageCpc = this.roundDivision(existing.cost, existing.clicks);
      if (campaignName !== "—") {
        existing.campaignName = campaignName;
      }
      existing.adGroupName = adGroupName;
      if (status !== "UNKNOWN") {
        existing.status = status;
      }
    }

    const data = Array.from(adGroupMap.values())
      .sort((left, right) => right.cost - left.cost)
      .slice(0, limit)
      .map((item) => ({
        ...item,
        cost: this.round(item.cost),
        conversions: this.round(item.conversions),
      }));

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getAdsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsAdsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.AD,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const adMap = new Map<string, GoogleAdsAdSummary>();
    for (const insight of insights) {
      const meta = this.extractEntityMetaFromRaw(insight.raw);
      const adId = insight.entityId ?? `${meta.adName ?? "ad"}-${insight.id}`;
      const campaignName = meta.campaignName ?? "—";
      const adGroupName = meta.adGroupName ?? "—";
      const adName = insight.entityName ?? meta.adName ?? adId;
      const status = meta.adStatus ?? meta.status ?? "UNKNOWN";
      const adType = meta.adType ?? "UNSPECIFIED";
      const finalUrl = meta.finalUrl;
      const cost = this.microsToCurrency(this.readBigInt(insight.costMicros));
      const impressions = insight.impressions ?? 0;
      const clicks = insight.clicks ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);

      const existing = adMap.get(adId);
      if (!existing) {
        adMap.set(adId, {
          id: adId,
          campaignName,
          adGroupName,
          adName,
          adType,
          status,
          finalUrl,
          cost,
          impressions,
          clicks,
          conversions,
        });
        continue;
      }

      existing.cost += cost;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.conversions += conversions;
      if (campaignName !== "—") {
        existing.campaignName = campaignName;
      }
      if (adGroupName !== "—") {
        existing.adGroupName = adGroupName;
      }
      existing.adName = adName;
      if (adType !== "UNSPECIFIED") {
        existing.adType = adType;
      }
      if (status !== "UNKNOWN") {
        existing.status = status;
      }
      if (finalUrl) {
        existing.finalUrl = finalUrl;
      }
    }

    const data = Array.from(adMap.values())
      .sort((left, right) => right.cost - left.cost)
      .slice(0, limit)
      .map((item) => ({
        ...item,
        cost: this.round(item.cost),
        conversions: this.round(item.conversions),
      }));

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getKeywordsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsKeywordsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.AD,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const keywordMap = new Map<
      string,
      GoogleAdsKeywordSummary & {
        impressions: number;
      }
    >();
    for (const insight of insights) {
      const meta = this.extractEntityMetaFromRaw(insight.raw);
      const keywordText =
        meta.keywordText ??
        meta.searchTerm ??
        insight.entityName ??
        "Anahtar Kelime";
      const matchType = meta.matchType ?? "UNSPECIFIED";
      const campaignName = meta.campaignName ?? "—";
      const adGroupName = meta.adGroupName ?? "—";
      const status = meta.keywordStatus ?? meta.adStatus ?? meta.status ?? "UNKNOWN";
      const key = `${keywordText}::${matchType}::${campaignName}::${adGroupName}`;

      const cost = this.microsToCurrency(this.readBigInt(insight.costMicros));
      const clicks = insight.clicks ?? 0;
      const impressions = insight.impressions ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);

      const existing = keywordMap.get(key);
      if (!existing) {
        keywordMap.set(key, {
          id: key,
          keywordText,
          matchType,
          campaignName,
          adGroupName,
          status,
          cost,
          impressions,
          clicks,
          conversions,
          ctr: this.roundPercentageByCounts(clicks, impressions),
          averageCpc: this.roundDivision(cost, clicks),
        });
        continue;
      }

      existing.cost += cost;
      existing.clicks += clicks;
      existing.impressions += impressions;
      existing.conversions += conversions;
      existing.ctr = this.roundPercentageByCounts(existing.clicks, existing.impressions);
      existing.averageCpc = this.roundDivision(existing.cost, existing.clicks);
      if (status !== "UNKNOWN") {
        existing.status = status;
      }
    }

    const data = Array.from(keywordMap.values())
      .sort((left, right) => right.cost - left.cost)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        keywordText: item.keywordText,
        matchType: item.matchType,
        campaignName: item.campaignName,
        adGroupName: item.adGroupName,
        status: item.status,
        cost: this.round(item.cost),
        clicks: item.clicks,
        conversions: this.round(item.conversions),
        ctr: item.ctr,
        averageCpc: item.averageCpc,
      }));

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getConversionsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsConversionsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.AD,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const actionMap = new Map<
      string,
      {
        id: string;
        conversionAction: string;
        conversions: number;
        conversionValue: number;
        cost: number;
        clicks: number;
      }
    >();

    for (const insight of insights) {
      const meta = this.extractEntityMetaFromRaw(insight.raw);
      const conversionAction = meta.conversionAction ?? "Toplam Dönüşüm";
      const key = conversionAction;
      const cost = this.microsToCurrency(this.readBigInt(insight.costMicros));
      const clicks = insight.clicks ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);
      const conversionValue = this.readDecimalAsNumber(insight.conversionValue);
      const existing = actionMap.get(key);

      if (!existing) {
        actionMap.set(key, {
          id: key,
          conversionAction,
          conversions,
          conversionValue,
          cost,
          clicks,
        });
        continue;
      }

      existing.conversions += conversions;
      existing.conversionValue += conversionValue;
      existing.cost += cost;
      existing.clicks += clicks;
    }

    const data = Array.from(actionMap.values())
      .sort((left, right) => right.conversions - left.conversions)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        conversionAction: item.conversionAction,
        conversions: this.round(item.conversions),
        conversionValue: item.conversionValue > 0 ? this.round(item.conversionValue) : null,
        costPerConversion:
          item.conversions > 0 ? this.roundDivision(item.cost, item.conversions) : null,
        conversionRate: this.roundPercentageByCounts(item.conversions, item.clicks),
      }));

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getSearchTermsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsCampaignsQueryDto,
  ): Promise<GoogleAdsSearchTermsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level: GoogleAdsInsightLevel.AD,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: { lastSyncAt: true },
      }),
    ]);

    const termMap = new Map<
      string,
      {
        id: string;
        searchTerm: string;
        campaignName: string;
        adGroupName: string;
        keywordText: string | null;
        cost: number;
        clicks: number;
        conversions: number;
        impressions: number;
      }
    >();

    for (const insight of insights) {
      const meta = this.extractEntityMetaFromRaw(insight.raw);
      const searchTerm =
        meta.searchTerm ??
        meta.keywordText ??
        insight.entityName ??
        "Arama Terimi";
      const campaignName = meta.campaignName ?? "—";
      const adGroupName = meta.adGroupName ?? "—";
      const keywordText = meta.keywordText ?? null;
      const key = `${searchTerm}::${campaignName}::${adGroupName}`;

      const cost = this.microsToCurrency(this.readBigInt(insight.costMicros));
      const clicks = insight.clicks ?? 0;
      const impressions = insight.impressions ?? 0;
      const conversions = this.readDecimalAsNumber(insight.conversions);
      const existing = termMap.get(key);

      if (!existing) {
        termMap.set(key, {
          id: key,
          searchTerm,
          campaignName,
          adGroupName,
          keywordText,
          cost,
          clicks,
          conversions,
          impressions,
        });
        continue;
      }

      existing.cost += cost;
      existing.clicks += clicks;
      existing.impressions += impressions;
      existing.conversions += conversions;
      if (!existing.keywordText && keywordText) {
        existing.keywordText = keywordText;
      }
    }

    const data = Array.from(termMap.values())
      .sort((left, right) => right.cost - left.cost)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        searchTerm: item.searchTerm,
        campaignName: item.campaignName,
        adGroupName: item.adGroupName,
        keywordText: item.keywordText,
        cost: this.round(item.cost),
        clicks: item.clicks,
        conversions: this.round(item.conversions),
        ctr: this.roundPercentageByCounts(item.clicks, item.impressions),
      }));

    return {
      data,
      dateRange: {
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
    };
  }

  private async getInsightsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsInsightsQueryDto,
  ): Promise<GoogleAdsInsightsResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const level = query.level ?? GoogleAdsInsightLevel.ACCOUNT;
    const limit = query.limit ?? DEFAULT_INSIGHTS_LIMIT;
    const [insights, config] = await this.prisma.$transaction([
      this.prisma.googleAdsDailyInsight.findMany({
        where: {
          clientProfileId,
          level,
          date: {
            gte: dateRange.since,
            lte: dateRange.until,
          },
        },
        select: googleAdsDailyInsightSelect,
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
        take: limit,
      }),
      this.prisma.clientGoogleAdsConfig.findUnique({
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
    query: GoogleAdsCampaignsQueryDto,
    level: GoogleAdsInsightLevel,
  ): Promise<GoogleAdsInsightsResponse> {
    return this.getInsightsByClientProfileId(clientProfileId, {
      since: query.since,
      until: query.until,
      level,
      limit: query.limit ?? DEFAULT_INSIGHTS_LIMIT,
    });
  }

  private async getReportsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsReportsQueryDto,
    options: {
      onlyClientVisible: boolean;
    },
  ): Promise<GoogleAdsReportsResponse> {
    const where: Prisma.GoogleAdsReportWhereInput = {
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

    const statsWhere: Prisma.GoogleAdsReportWhereInput = {
      clientProfileId,
      ...(options.onlyClientVisible ? { clientVisible: true } : {}),
    };
    const limit = query.limit ?? 30;

    const [reports, total, draft, published, clientVisible] = await this.prisma.$transaction([
      this.prisma.googleAdsReport.findMany({
        where,
        select: googleAdsReportSelect,
        orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
        take: limit,
      }),
      this.prisma.googleAdsReport.count({ where }),
      this.prisma.googleAdsReport.count({
        where: {
          ...statsWhere,
          status: GoogleAdsReportStatus.DRAFT,
        },
      }),
      this.prisma.googleAdsReport.count({
        where: {
          ...statsWhere,
          status: GoogleAdsReportStatus.PUBLISHED,
        },
      }),
      this.prisma.googleAdsReport.count({
        where: {
          ...statsWhere,
          clientVisible: true,
        },
      }),
    ]);

    return {
      data: reports.map((report) => this.toGoogleAdsReportItem(report)),
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
    dto: CreateGoogleAdsReportDto,
  ): Promise<GoogleAdsReportItem> {
    const period = this.resolveGoogleAdsReportPeriod(dto.periodStart, dto.periodEnd);
    const summary = this.normalizeGoogleAdsReportSummary(dto.summary);
    const projectId = await this.resolveGoogleAdsReportProjectId(clientProfileId, dto.projectId ?? null);
    const shouldPublish = dto.clientVisible === true || dto.requestAcknowledgement === true;
    const now = new Date();

    let report = await this.prisma.googleAdsReport.create({
      data: {
        clientProfileId,
        projectId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        type: dto.type,
        status: shouldPublish ? GoogleAdsReportStatus.PUBLISHED : GoogleAdsReportStatus.DRAFT,
        summary,
        metricsSnapshot: dto.metricsSnapshot as Prisma.InputJsonValue | undefined,
        createdByUserId: currentUser.id,
        publishedByUserId: shouldPublish ? currentUser.id : null,
        clientVisible: shouldPublish,
        publishedAt: shouldPublish ? now : null,
      },
      select: googleAdsReportSelect,
    });

    if (dto.requestAcknowledgement === true) {
      const acknowledgementProjectId =
        projectId ?? (await this.resolveGoogleAdsReportProjectId(clientProfileId, null));
      if (!acknowledgementProjectId) {
        throw new BadRequestException(
          "A GOOGLE_ADS project is required to request report acknowledgement.",
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
          approvalType: MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
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

      report = await this.prisma.googleAdsReport.update({
        where: {
          id: report.id,
        },
        data: {
          acknowledgementRequestedAt: now,
          acknowledgementTaskId: task.id,
        },
        select: googleAdsReportSelect,
      });
    }

    return this.toGoogleAdsReportItem(report);
  }

  private async updateReportById(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateGoogleAdsReportDto,
    options: {
      scope: "ANY" | "ASSIGNED";
      employeeUserId?: string;
    },
  ): Promise<GoogleAdsReportItem> {
    this.assertHasGoogleAdsReportUpdatePayload(dto);

    const existing = await this.prisma.googleAdsReport.findUnique({
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
      throw new NotFoundException("Google Ads report not found.");
    }

    if (options.scope === "ASSIGNED") {
      if (!options.employeeUserId) {
        throw new ForbiddenException("Missing employee context for assigned report update.");
      }
      await this.assertAssignedClientProfileOrFail(options.employeeUserId, existing.clientProfileId);
    }

    await this.assertClientHasActiveGoogleAdsService(existing.clientProfileId);

    const now = new Date();
    const updateData: Prisma.GoogleAdsReportUpdateInput = {};
    const normalizedSummary =
      dto.summary !== undefined ? this.normalizeGoogleAdsReportSummary(dto.summary) : undefined;

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
      if (dto.status === GoogleAdsReportStatus.DRAFT) {
        updateData.clientVisible = false;
      }
      if (dto.status === GoogleAdsReportStatus.ARCHIVED) {
        updateData.clientVisible = false;
      }
    }

    if (dto.status === GoogleAdsReportStatus.PUBLISHED && dto.clientVisible === false) {
      throw new BadRequestException("Published report cannot be hidden from client.");
    }

    const shouldPublish =
      dto.requestAcknowledgement === true ||
      dto.clientVisible === true ||
      dto.status === GoogleAdsReportStatus.PUBLISHED;

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
        updateData.status = GoogleAdsReportStatus.PUBLISHED;
      }
      if (dto.clientVisible === undefined) {
        updateData.clientVisible = true;
      }
    }

    if (
      dto.requestAcknowledgement === true &&
      (dto.status === GoogleAdsReportStatus.DRAFT || dto.status === GoogleAdsReportStatus.ARCHIVED)
    ) {
      throw new BadRequestException(
        "Acknowledgement request cannot be created for DRAFT or ARCHIVED report status.",
      );
    }

    const fallbackProjectId =
      existing.projectId ??
      (await this.resolveGoogleAdsReportProjectId(existing.clientProfileId, null));

    if (dto.requestAcknowledgement === true && !fallbackProjectId) {
      throw new BadRequestException(
        "A GOOGLE_ADS project is required to request report acknowledgement.",
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
          approvalType: MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
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
              approvalType: MetaAdsApprovalType.GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,
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

      return tx.googleAdsReport.update({
        where: { id: existing.id },
        data: updateData,
        select: googleAdsReportSelect,
      });
    });

    return this.toGoogleAdsReportItem(updated);
  }

  private toGoogleAdsReportItem(report: GoogleAdsReportModel): GoogleAdsReportItem {
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

  private resolveGoogleAdsReportPeriod(periodStartRaw: string, periodEndRaw: string): {
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

  private normalizeGoogleAdsReportSummary(summary: string | undefined): string | null {
    if (summary === undefined) {
      return null;
    }

    const normalized = summary.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveGoogleAdsReportProjectId(
    clientProfileId: string,
    projectId: string | null,
  ): Promise<string | null> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          clientProfileId,
          serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        },
        select: { id: true },
      });

      if (!project) {
        throw new BadRequestException(
          "Provided projectId is not a GOOGLE_ADS project for this client.",
        );
      }

      return project.id;
    }

    const project = await this.prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
      },
      select: { id: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return project?.id ?? null;
  }

  private buildReportAcknowledgementTaskTitle(
    reportType: GoogleAdsReportType,
    periodStart: Date,
    periodEnd: Date,
  ): string {
    const start = periodStart.toISOString().slice(0, 10);
    const end = periodEnd.toISOString().slice(0, 10);
    return `Google Ads Rapor Onayı · ${reportType} (${start} - ${end})`;
  }

  private buildReportAcknowledgementTaskDescription(summary: string | null): string {
    if (summary) {
      return `Rapor müşteri onayına açıldı. Özet: ${summary}`;
    }
    return "Rapor müşteri onayına açıldı.";
  }

  private assertHasGoogleAdsReportUpdatePayload(dto: UpdateGoogleAdsReportDto): void {
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

  private async syncInsightsByClientProfileId(
    clientProfileId: string,
    query: GoogleAdsDateRangeQueryDto,
    options: {
      trigger: GoogleAdsSyncTrigger;
      applySyncTtl: boolean;
      revealDetailedError: boolean;
    },
  ): Promise<GoogleAdsSyncResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const startedAt = new Date();
    const syncLog = await this.prisma.googleAdsSyncLog.create({
      data: {
        clientProfileId,
        status: GoogleAdsSyncStatus.RUNNING,
        startedAt,
      },
      select: {
        id: true,
      },
    });

    try {
      const connection = await this.resolveReportingConnection(clientProfileId);
      await this.prisma.googleAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          customerId: connection.customerId,
          managerCustomerId: connection.managerCustomerId,
        },
      });

      if (options.applySyncTtl) {
        const skipReason = this.resolveSyncSkipReason(connection.lastSyncAt, startedAt);
        if (skipReason) {
          await this.prisma.googleAdsSyncLog.update({
            where: { id: syncLog.id },
            data: {
              status: GoogleAdsSyncStatus.SKIPPED,
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
            syncStatus: GoogleAdsSyncStatus.SKIPPED,
            skippedReason: skipReason,
          };
        }
      }

      const snapshot: GoogleAdsReportingSnapshotResult =
        await this.googleAdsApiService.fetchReportingSnapshot({
          refreshToken: connection.refreshToken,
          accessToken: connection.accessToken,
          customerId: connection.customerId,
          managerCustomerId: connection.managerCustomerId,
          since: dateRange.sinceIsoDate,
          until: dateRange.untilIsoDate,
        });

      const accountRows = snapshot.accountInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            snapshot.customerId,
            GoogleAdsInsightLevel.ACCOUNT,
            row,
          ),
        )
        .filter((row): row is Prisma.GoogleAdsDailyInsightCreateManyInput => row !== null);

      const campaignRows = snapshot.campaignInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            snapshot.customerId,
            GoogleAdsInsightLevel.CAMPAIGN,
            row,
          ),
        )
        .filter((row): row is Prisma.GoogleAdsDailyInsightCreateManyInput => row !== null);

      const adGroupRows = snapshot.adGroupInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            snapshot.customerId,
            GoogleAdsInsightLevel.AD_GROUP,
            row,
          ),
        )
        .filter((row): row is Prisma.GoogleAdsDailyInsightCreateManyInput => row !== null);

      const adRows = snapshot.adInsights
        .map((row) =>
          this.toInsightCreateManyInput(
            clientProfileId,
            snapshot.customerId,
            GoogleAdsInsightLevel.AD,
            row,
          ),
        )
        .filter((row): row is Prisma.GoogleAdsDailyInsightCreateManyInput => row !== null);

      const allRows = [...accountRows, ...campaignRows, ...adGroupRows, ...adRows];
      const syncedAt = new Date();
      const syncStatus =
        allRows.length > 0 ? GoogleAdsSyncStatus.SUCCESS : GoogleAdsSyncStatus.PARTIAL;

      await this.prisma.$transaction(async (tx) => {
        await tx.googleAdsDailyInsight.deleteMany({
          where: {
            clientProfileId,
            level: {
              in: [
                GoogleAdsInsightLevel.ACCOUNT,
                GoogleAdsInsightLevel.CAMPAIGN,
                GoogleAdsInsightLevel.AD_GROUP,
                GoogleAdsInsightLevel.AD,
              ],
            },
            date: {
              gte: dateRange.since,
              lte: dateRange.until,
            },
          },
        });

        if (allRows.length > 0) {
          await tx.googleAdsDailyInsight.createMany({
            data: allRows,
          });
        }

        await tx.clientGoogleAdsConfig.upsert({
          where: { clientProfileId },
          update: {
            customerId: snapshot.customerId,
            managerCustomerId: snapshot.managerCustomerId,
            descriptiveName: snapshot.descriptiveName,
            currencyCode: snapshot.currencyCode,
            timeZone: snapshot.timeZone,
            connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
          create: {
            clientProfileId,
            customerId: snapshot.customerId,
            managerCustomerId: snapshot.managerCustomerId,
            descriptiveName: snapshot.descriptiveName,
            currencyCode: snapshot.currencyCode,
            timeZone: snapshot.timeZone,
            connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
            syncError: null,
            lastSyncAt: syncedAt,
          },
        });

        await tx.googleAdsSyncLog.update({
          where: { id: syncLog.id },
          data: {
            customerId: snapshot.customerId,
            managerCustomerId: snapshot.managerCustomerId,
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
        connectionStatus: GoogleAdsConnectionStatus.CONNECTED,
        lastSyncAt: syncedAt,
        syncStatus,
        skippedReason: null,
      };
    } catch (error) {
      const syncErrorInfo = this.normalizeSyncError(error);
      const finishedAt = new Date();
      await this.markConnectionAsError(clientProfileId, syncErrorInfo, finishedAt);
      await this.prisma.googleAdsSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: GoogleAdsSyncStatus.FAILED,
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

  private async resolveReportingConnection(clientProfileId: string): Promise<{
    refreshToken: string;
    accessToken: string | null;
    customerId: string;
    managerCustomerId: string | null;
    lastSyncAt: Date | null;
    connectionStatus: GoogleAdsConnectionStatus;
  }> {
    const snapshot = await this.getConnectionSnapshot(clientProfileId);
    const encryptedRefreshToken = snapshot.credential?.refreshTokenEnc ?? null;
    const encryptedAccessToken = snapshot.credential?.accessTokenEnc ?? null;
    const customerId = snapshot.config?.customerId?.trim() ?? "";
    const managerCustomerId = snapshot.config?.managerCustomerId?.trim() || null;

    if (!encryptedRefreshToken) {
      throw new BadRequestException(
        "Google Ads refresh token not found. Connect this client before running sync.",
      );
    }

    if (!customerId) {
      throw new BadRequestException(
        "Google Ads customerId is required. Update connection config before running sync.",
      );
    }

    return {
      refreshToken: this.googleAdsTokenService.decrypt(encryptedRefreshToken),
      accessToken: encryptedAccessToken
        ? this.googleAdsTokenService.decrypt(encryptedAccessToken)
        : null,
      customerId,
      managerCustomerId,
      lastSyncAt: snapshot.config?.lastSyncAt ?? null,
      connectionStatus:
        snapshot.config?.connectionStatus ?? GoogleAdsConnectionStatus.NOT_CONNECTED,
    };
  }

  private toInsightCreateManyInput(
    clientProfileId: string,
    customerId: string,
    level: GoogleAdsInsightLevel,
    row: GoogleAdsReportingInsightRow,
  ): Prisma.GoogleAdsDailyInsightCreateManyInput | null {
    const date = this.parseDateToUtcDay(row.date);
    if (!date) {
      return null;
    }

    return {
      clientProfileId,
      customerId,
      date,
      level,
      entityId: this.resolveEntityIdByLevel(level, row),
      entityName: this.resolveEntityNameByLevel(level, row),
      costMicros: BigInt(Math.max(Math.trunc(row.costMicros), 0)),
      impressions: Math.max(Math.trunc(row.impressions), 0),
      clicks: Math.max(Math.trunc(row.clicks), 0),
      interactions: Math.max(Math.trunc(row.interactions), 0),
      conversions: this.toPrismaDecimal(row.conversions),
      conversionValue: this.toPrismaDecimal(row.conversionValue),
      ctr: this.toPrismaDecimal(row.ctr),
      averageCpc: this.toPrismaDecimal(row.averageCpc),
      costPerConversion: this.toPrismaDecimal(row.costPerConversion),
      raw: row.raw as Prisma.InputJsonValue,
    };
  }

  private resolveEntityIdByLevel(
    level: GoogleAdsInsightLevel,
    row: Pick<GoogleAdsReportingInsightRow, "campaignId" | "adGroupId" | "adId">,
  ): string | null {
    if (level === GoogleAdsInsightLevel.CAMPAIGN) {
      return row.campaignId;
    }
    if (level === GoogleAdsInsightLevel.AD_GROUP) {
      return row.adGroupId;
    }
    if (level === GoogleAdsInsightLevel.AD) {
      return row.adId;
    }
    return null;
  }

  private resolveEntityNameByLevel(
    level: GoogleAdsInsightLevel,
    row: Pick<GoogleAdsReportingInsightRow, "campaignName" | "adGroupName" | "adName">,
  ): string | null {
    if (level === GoogleAdsInsightLevel.CAMPAIGN) {
      return row.campaignName;
    }
    if (level === GoogleAdsInsightLevel.AD_GROUP) {
      return row.adGroupName;
    }
    if (level === GoogleAdsInsightLevel.AD) {
      return row.adName;
    }
    return null;
  }

  private aggregateAccountRows(
    rows: GoogleAdsDailyInsightModel[],
  ): Omit<GoogleAdsSummaryResponse, "dateRange" | "lastSyncAt"> {
    let costMicros = BigInt(0);
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;
    let conversionValue = 0;

    for (const row of rows) {
      costMicros += this.readBigInt(row.costMicros);
      impressions += row.impressions ?? 0;
      clicks += row.clicks ?? 0;
      conversions += this.readDecimalAsNumber(row.conversions);
      conversionValue += this.readDecimalAsNumber(row.conversionValue);
    }

    const cost = this.microsToCurrency(costMicros);
    return {
      cost: this.round(cost),
      impressions,
      clicks,
      conversions: this.round(conversions),
      conversionValue:
        conversionValue > 0 ? this.round(conversionValue) : null,
      ctr: this.roundPercentageByCounts(clicks, impressions),
      averageCpc: this.roundDivision(cost, clicks),
      costPerConversion: conversions > 0 ? this.roundDivision(cost, conversions) : null,
    };
  }

  private toInsightItem(insight: GoogleAdsDailyInsightModel): GoogleAdsInsightItem {
    const costMicros = this.readBigInt(insight.costMicros);
    const cost = this.microsToCurrency(costMicros);

    return {
      id: insight.id,
      date: insight.date.toISOString(),
      level: insight.level,
      entityId: insight.entityId,
      entityName: insight.entityName,
      cost: this.round(cost),
      costMicros: costMicros.toString(),
      impressions: insight.impressions ?? 0,
      clicks: insight.clicks ?? 0,
      interactions: insight.interactions ?? 0,
      conversions: this.round(this.readDecimalAsNumber(insight.conversions)),
      conversionValue: this.readDecimalAsNumberNullable(insight.conversionValue),
      ctr: this.round(this.readDecimalAsNumber(insight.ctr)),
      averageCpc: this.round(this.readDecimalAsNumber(insight.averageCpc)),
      costPerConversion: this.roundNullable(
        this.readDecimalAsNumberNullable(insight.costPerConversion),
      ),
      updatedAt: insight.updatedAt.toISOString(),
    };
  }

  private extractCampaignMetaFromRaw(raw: Prisma.JsonValue | null): {
    channelType: string | null;
    status: string | null;
    servingStatus: string | null;
  } {
    const entityMeta = this.extractEntityMetaFromRaw(raw);

    return {
      channelType: entityMeta.channelType,
      status: entityMeta.status,
      servingStatus: entityMeta.servingStatus,
    };
  }

  private extractEntityMetaFromRaw(raw: Prisma.JsonValue | null): {
    channelType: string | null;
    status: string | null;
    servingStatus: string | null;
    campaignName: string | null;
    adGroupName: string | null;
    adName: string | null;
    adGroupStatus: string | null;
    adStatus: string | null;
    keywordStatus: string | null;
    keywordText: string | null;
    matchType: string | null;
    searchTerm: string | null;
    conversionAction: string | null;
    adType: string | null;
    finalUrl: string | null;
  } {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {
        channelType: null,
        status: null,
        servingStatus: null,
        campaignName: null,
        adGroupName: null,
        adName: null,
        adGroupStatus: null,
        adStatus: null,
        keywordStatus: null,
        keywordText: null,
        matchType: null,
        searchTerm: null,
        conversionAction: null,
        adType: null,
        finalUrl: null,
      };
    }

    const payload = raw as Record<string, unknown>;
    return {
      channelType:
        this.readNullableString(payload.channelType) ??
        this.readNullableString(payload.channel_type),
      status: this.readNullableString(payload.status),
      servingStatus:
        this.readNullableString(payload.servingStatus) ??
        this.readNullableString(payload.serving_status),
      campaignName:
        this.readNullableString(payload.campaignName) ??
        this.readNullableString(payload.campaign_name),
      adGroupName:
        this.readNullableString(payload.adGroupName) ??
        this.readNullableString(payload.ad_group_name),
      adName:
        this.readNullableString(payload.adName) ??
        this.readNullableString(payload.ad_name),
      adGroupStatus:
        this.readNullableString(payload.adGroupStatus) ??
        this.readNullableString(payload.ad_group_status),
      adStatus:
        this.readNullableString(payload.adStatus) ??
        this.readNullableString(payload.ad_status),
      keywordStatus:
        this.readNullableString(payload.keywordStatus) ??
        this.readNullableString(payload.keyword_status),
      keywordText:
        this.readNullableString(payload.keywordText) ??
        this.readNullableString(payload.keyword_text),
      matchType:
        this.readNullableString(payload.matchType) ??
        this.readNullableString(payload.match_type),
      searchTerm:
        this.readNullableString(payload.searchTerm) ??
        this.readNullableString(payload.search_term),
      conversionAction:
        this.readNullableString(payload.conversionAction) ??
        this.readNullableString(payload.conversion_action),
      adType:
        this.readNullableString(payload.adType) ??
        this.readNullableString(payload.ad_type),
      finalUrl:
        this.readNullableString(payload.finalUrl) ??
        this.readNullableString(payload.final_url),
    };
  }

  private resolveReportDateRange(query: GoogleAdsDateRangeQueryDto): GoogleAdsReportDateRange {
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
        `Google Ads reporting range cannot exceed ${MAX_REPORTING_RANGE_DAYS} days.`,
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
      "GOOGLE_ADS_SYNC_TTL_MINUTES",
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

    return DEFAULT_GOOGLE_ADS_SYNC_TTL_MINUTES;
  }

  private microsToCurrency(micros: bigint): number {
    return Number(micros) / 1_000_000;
  }

  private readBigInt(value: unknown): bigint {
    if (typeof value === "bigint") {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return BigInt(Math.trunc(value));
    }

    if (typeof value === "string" && value.trim().length > 0) {
      try {
        return BigInt(value.trim());
      } catch {
        return BigInt(0);
      }
    }

    return BigInt(0);
  }

  private readDecimalAsNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (value instanceof Prisma.Decimal) {
      return value.toNumber();
    }

    if (typeof value === "object" && value !== null && "toString" in value) {
      const parsed = Number.parseFloat(String(value));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private readDecimalAsNumberNullable(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    return this.round(this.readDecimalAsNumber(value));
  }

  private toPrismaDecimal(value: number | null): Prisma.Decimal | null {
    if (value === null || !Number.isFinite(value)) {
      return null;
    }

    return new Prisma.Decimal(value);
  }

  private round(value: number, precision = 2): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  private roundNullable(value: number | null, precision = 2): number | null {
    if (value === null || !Number.isFinite(value)) {
      return null;
    }

    return this.round(value, precision);
  }

  private roundDivision(numerator: number, denominator: number, precision = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round(numerator / denominator, precision);
  }

  private roundPercentageByCounts(clicks: number, impressions: number, precision = 2): number {
    if (!Number.isFinite(clicks) || !Number.isFinite(impressions) || impressions <= 0) {
      return 0;
    }

    return this.round((clicks / impressions) * 100, precision);
  }

  private readNullableString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }

  private buildConfigPatchData(dto: UpdateGoogleAdsConfigDto): GoogleAdsConfigPatchData {
    const patchData: GoogleAdsConfigPatchData = {};

    if (dto.customerId !== undefined) {
      patchData.customerId = dto.customerId;
    }
    if (dto.managerCustomerId !== undefined) {
      patchData.managerCustomerId = dto.managerCustomerId;
    }
    if (dto.descriptiveName !== undefined) {
      patchData.descriptiveName = dto.descriptiveName;
    }
    if (dto.currencyCode !== undefined) {
      patchData.currencyCode = dto.currencyCode;
    }
    if (dto.timeZone !== undefined) {
      patchData.timeZone = dto.timeZone;
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

  private assertHasConfigUpdatePayload(dto: UpdateGoogleAdsConfigDto): void {
    if (
      dto.customerId === undefined &&
      dto.managerCustomerId === undefined &&
      dto.descriptiveName === undefined &&
      dto.currencyCode === undefined &&
      dto.timeZone === undefined &&
      dto.connectionStatus === undefined &&
      dto.lastSyncAt === undefined &&
      dto.syncError === undefined
    ) {
      throw new BadRequestException(
        "Provide at least one config field to update Google Ads configuration.",
      );
    }
  }

  private async getConnectionSummaryByClientProfileId(
    clientProfileId: string,
  ): Promise<AdminGoogleAdsConnectionResponse> {
    const snapshot = await this.getConnectionSnapshot(clientProfileId);
    return this.toAdminConnectionSummary(
      clientProfileId,
      snapshot.config,
      snapshot.credential,
      snapshot.hasActiveService,
    );
  }

  private async getConnectionSnapshot(clientProfileId: string): Promise<{
    config: GoogleAdsConfigModel | null;
    credential: GoogleAdsCredentialSecureModel | null;
    hasActiveService: boolean;
  }> {
    const [config, credential, serviceCount] = await this.prisma.$transaction([
      this.prisma.clientGoogleAdsConfig.findUnique({
        where: { clientProfileId },
        select: googleAdsConfigSummarySelect,
      }),
      this.prisma.clientGoogleAdsCredential.findUnique({
        where: { clientProfileId },
        select: googleAdsCredentialSecureSelect,
      }),
      this.prisma.clientPurchasedService.count({
        where: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.GOOGLE_ADS,
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

  private async assertClientHasActiveGoogleAdsService(clientProfileId: string): Promise<void> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GOOGLE_ADS,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!activeService) {
      throw new BadRequestException(
        "Client must have an ACTIVE GOOGLE_ADS purchased service to manage Google Ads connection.",
      );
    }
  }

  private resolveRefreshTokenForConnectionTest(
    tokenFromRequest: string | undefined,
    credential: GoogleAdsCredentialSecureModel | null,
  ): string {
    if (tokenFromRequest && tokenFromRequest.trim().length > 0) {
      return tokenFromRequest.trim();
    }

    if (!credential?.refreshTokenEnc) {
      throw new BadRequestException(
        "Provide refreshToken or connect the client manually before testing connection.",
      );
    }

    return this.googleAdsTokenService.decrypt(credential.refreshTokenEnc);
  }

  private resolveAccessTokenForConnectionTest(
    tokenFromRequest: string | undefined,
    credential: GoogleAdsCredentialSecureModel | null,
  ): string | null {
    if (tokenFromRequest && tokenFromRequest.trim().length > 0) {
      return tokenFromRequest.trim();
    }

    if (!credential?.accessTokenEnc) {
      return null;
    }

    return this.googleAdsTokenService.decrypt(credential.accessTokenEnc);
  }

  private resolveCustomerIdForConnectionTest(
    customerIdFromRequest: string | undefined,
    config: GoogleAdsConfigModel | null,
  ): string {
    const resolved = customerIdFromRequest ?? config?.customerId ?? null;
    if (!resolved || resolved.trim().length === 0) {
      throw new BadRequestException(
        "customerId is required to test Google Ads connection. Set it in config or provide in request.",
      );
    }

    return resolved.trim();
  }

  private resolveManagerCustomerIdForConnectionTest(
    managerCustomerIdFromRequest: string | undefined,
    config: GoogleAdsConfigModel | null,
  ): string | null {
    const resolved = managerCustomerIdFromRequest ?? config?.managerCustomerId ?? null;
    if (!resolved || resolved.trim().length === 0) {
      return null;
    }

    return resolved.trim();
  }

  private resolveRequiredScopes(requiredScopes: string[] | undefined): string[] {
    if (!requiredScopes || requiredScopes.length === 0) {
      return [...DEFAULT_GOOGLE_ADS_REQUIRED_SCOPES];
    }

    return this.normalizeScopes(requiredScopes);
  }

  private resolveGrantedScopes(grantedScopes: string[] | undefined): string[] {
    if (!grantedScopes || grantedScopes.length === 0) {
      return [...DEFAULT_GOOGLE_ADS_REQUIRED_SCOPES];
    }

    return this.normalizeScopes(grantedScopes);
  }

  private normalizeScopes(scopes: string[]): string[] {
    const normalized = scopes
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);

    return Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b));
  }

  private async markConnectionAsError(
    clientProfileId: string,
    syncErrorInfo: GoogleAdsSyncErrorInfo,
    occurredAt = new Date(),
  ): Promise<void> {
    await this.prisma.clientGoogleAdsConfig.upsert({
      where: { clientProfileId },
      update: {
        connectionStatus: GoogleAdsConnectionStatus.ERROR,
        syncError: syncErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
      create: {
        clientProfileId,
        connectionStatus: GoogleAdsConnectionStatus.ERROR,
        syncError: syncErrorInfo.adminMessage,
        lastSyncAt: occurredAt,
      },
    });
  }

  private normalizeSyncError(error: unknown): GoogleAdsSyncErrorInfo {
    const normalizedError = this.googleAdsApiService.normalizeError(error);
    const normalizedMessage = this.sanitizeSyncErrorMessage(normalizedError.message);
    const lowerMessage = normalizedMessage.toLowerCase();

    if (
      normalizedError.category === "CONFIG" ||
      /developer token/i.test(normalizedMessage)
    ) {
      return {
        code: "DEVELOPER_TOKEN_MISSING",
        adminMessage:
          "Google Ads developer token eksik veya geçersiz. GOOGLE_ADS_DEVELOPER_TOKEN ayarını doğrulayın.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      /gaql|query error|syntax error|invalid query|field .* not found|invalid argument/i.test(
        normalizedMessage,
      )
    ) {
      return {
        code: "GAQL_QUERY_ERROR",
        adminMessage:
          "Google Ads GAQL sorgusunda hata var. Sorgu alanlarını/filtrelerini kontrol edip tekrar deneyin.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      /rate|quota|too many requests|resource exhausted/i.test(normalizedMessage)
    ) {
      return {
        code: "RATE_LIMIT",
        adminMessage: "Google Ads API rate limit sınırına ulaşıldı.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      /invalid customer|customer id.*invalid|customerid.*invalid|malformed customer/i.test(
        normalizedMessage,
      )
    ) {
      return {
        code: "INVALID_CUSTOMER_ID",
        adminMessage:
          "Google Ads customerId formatı geçersiz. customerId değerini doğrulayıp tekrar deneyin.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      /customer.*not enabled|customer.*disabled|account.*disabled|not enabled/i.test(
        normalizedMessage,
      )
    ) {
      return {
        code: "CUSTOMER_NOT_ENABLED",
        adminMessage: "Google Ads müşteri hesabı etkin değil veya erişime kapalı görünüyor.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      /manager|login-customer-id|linked manager|login customer/i.test(normalizedMessage)
    ) {
      return {
        code: "MANAGER_ACCESS_MISSING",
        adminMessage:
          "Google Ads manager account erişimi doğrulanamadı. managerCustomerId ve login-customer-id ayarlarını kontrol edin.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      normalizedError.category === "PERMISSION" ||
      /permission|forbidden|access denied|not authorized/i.test(normalizedMessage)
    ) {
      return {
        code: "PERMISSION_DENIED",
        adminMessage:
          "Google Ads izinleri eksik. OAuth scope ve manager-account erişim izinlerini kontrol edin.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    if (
      normalizedError.category === "AUTH" ||
      /token|oauth|expired|invalid_grant|unauthorized/i.test(normalizedMessage)
    ) {
      return {
        code: "TOKEN_EXPIRED",
        adminMessage:
          "Google Ads OAuth token doğrulanamadı veya süresi doldu. Refresh token güncelleyip tekrar deneyin.",
        clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
      };
    }

    return {
      code: "UNKNOWN_API_ERROR",
      adminMessage: `Google Ads API hatası: ${
        lowerMessage.length > 0 ? normalizedMessage : "unknown error"
      }.`,
      clientMessage: CLIENT_SAFE_SYNC_ERROR_MESSAGE,
    };
  }

  private sanitizeSyncErrorMessage(message: string): string {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return "";
    }

    const redactPatterns: Array<[RegExp, string]> = [
      [/((?:refresh|access|developer)[\s_-]*token\s*[:=]\s*)([^\s,;]+)/gi, "$1[REDACTED]"],
      [/(bearer\s+)([^\s,;]+)/gi, "$1[REDACTED]"],
      [/\bya29\.[A-Za-z0-9._-]+\b/g, "[REDACTED]"],
      [/\b1\/\/[A-Za-z0-9._-]+\b/g, "[REDACTED]"],
      [/\bAIza[0-9A-Za-z\-_]{20,}\b/g, "[REDACTED]"],
    ];

    let sanitized = trimmed;
    for (const [pattern, replacement] of redactPatterns) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    if (sanitized.length > MAX_SANITIZED_SYNC_ERROR_MESSAGE_LENGTH) {
      return `${sanitized.slice(0, MAX_SANITIZED_SYNC_ERROR_MESSAGE_LENGTH)}...`;
    }

    return sanitized;
  }

  private toConnectionTestException(
    syncErrorInfo: GoogleAdsSyncErrorInfo,
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
      syncErrorInfo.code === "PERMISSION_DENIED" ||
      syncErrorInfo.code === "MANAGER_ACCESS_MISSING" ||
      syncErrorInfo.code === "CUSTOMER_NOT_ENABLED"
    ) {
      return new ForbiddenException(errorMessage);
    }

    if (
      syncErrorInfo.code === "TOKEN_EXPIRED" ||
      syncErrorInfo.code === "DEVELOPER_TOKEN_MISSING" ||
      syncErrorInfo.code === "INVALID_CUSTOMER_ID" ||
      syncErrorInfo.code === "GAQL_QUERY_ERROR"
    ) {
      return new BadRequestException(errorMessage);
    }

    return new BadGatewayException(errorMessage);
  }

  private toAdminConfigSummary(
    clientProfileId: string,
    config: GoogleAdsConfigModel | null,
  ): GoogleAdsConfigSummaryResponse {
    return {
      clientProfileId,
      connectionStatus: config?.connectionStatus ?? GoogleAdsConnectionStatus.NOT_CONNECTED,
      account: {
        customerId: config?.customerId ?? null,
        managerCustomerId: config?.managerCustomerId ?? null,
        descriptiveName: config?.descriptiveName ?? null,
        currencyCode: config?.currencyCode ?? null,
        timeZone: config?.timeZone ?? null,
      },
      lastSyncAt: config?.lastSyncAt ?? null,
      syncError: config?.syncError ?? null,
    };
  }

  private toAdminConnectionSummary(
    clientProfileId: string,
    config: GoogleAdsConfigModel | null,
    credential: GoogleAdsCredentialSecureModel | null,
    hasActiveService: boolean,
  ): AdminGoogleAdsConnectionResponse {
    return {
      ...this.toAdminConfigSummary(clientProfileId, config),
      hasActiveService,
      credential: {
        hasRefreshToken: Boolean(credential?.tokenHash),
        tokenLastUpdatedAt: credential?.updatedAt ?? null,
        tokenExpiresAt: credential?.tokenExpiresAt ?? null,
        grantedScopes: this.normalizeScopes(credential?.grantedScopes ?? []),
      },
    };
  }

  private toOwnConfigSummary(
    config: GoogleAdsConfigModel | null,
    hasActiveService: boolean,
  ): OwnGoogleAdsConfigSummaryResponse {
    return {
      connectionStatus: config?.connectionStatus ?? GoogleAdsConnectionStatus.NOT_CONNECTED,
      account: {
        customerId: config?.customerId ?? null,
        managerCustomerId: config?.managerCustomerId ?? null,
        descriptiveName: config?.descriptiveName ?? null,
        currencyCode: config?.currencyCode ?? null,
        timeZone: config?.timeZone ?? null,
      },
      hasActiveService,
      lastSyncAt: config?.lastSyncAt ?? null,
      syncError: config?.syncError ? CLIENT_SAFE_SYNC_ERROR_MESSAGE : null,
    };
  }

  private assertCanReadAnyConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can read Google Ads config for any client.");
    }

    this.assertHasPermission(currentUser, GOOGLE_ADS_CONFIG_READ_ANY_PERMISSION);
  }

  private assertCanManageAnyConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can manage Google Ads connection.");
    }

    this.assertHasPermission(currentUser, GOOGLE_ADS_CONFIG_MANAGE_ANY_PERMISSION);
  }

  private assertCanReadAnyReporting(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can read Google Ads reporting.");
    }

    this.assertHasPermission(currentUser, GOOGLE_ADS_REPORTING_READ_ANY_PERMISSION);
  }

  private assertCanRunAnySync(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can run Google Ads sync.");
    }

    this.assertHasPermission(currentUser, GOOGLE_ADS_SYNC_RUN_ANY_PERMISSION);
  }

  private assertCanReadAssignedConfig(currentUser: AuthenticatedUser): void {
    this.assertEmployeeAccount(currentUser, "read assigned client Google Ads configurations");

    this.assertHasPermission(currentUser, GOOGLE_ADS_CONFIG_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadAssignedReporting(currentUser: AuthenticatedUser): void {
    this.assertEmployeeAccount(currentUser, "read assigned client Google Ads reporting");
    this.assertHasPermission(currentUser, GOOGLE_ADS_REPORTING_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadAssignedSync(currentUser: AuthenticatedUser): void {
    this.assertEmployeeAccount(currentUser, "run assigned client Google Ads sync");
    this.assertHasPermission(currentUser, GOOGLE_ADS_SYNC_READ_ASSIGNED_PERMISSION);
  }

  private assertCanReadOwnConfig(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.CLIENT) {
      throw new ForbiddenException("Only client accounts can access /clients/me/google-ads/config.");
    }

    this.assertHasPermission(currentUser, GOOGLE_ADS_CONFIG_READ_OWN_PERMISSION);
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

  private assertCanManageAssignedNotes(currentUser: AuthenticatedUser): void {
    this.assertEmployeeAccount(currentUser, "manage assigned Google Ads notes");
    this.assertHasPermission(currentUser, GOOGLE_ADS_NOTES_MANAGE_ASSIGNED_PERMISSION);
  }

  private assertCanCreateAssignedApprovals(currentUser: AuthenticatedUser): void {
    this.assertEmployeeAccount(currentUser, "create Google Ads approvals");
    this.assertHasPermission(currentUser, GOOGLE_ADS_APPROVALS_CREATE_ASSIGNED_PERMISSION);
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

  private assertEmployeeAccount(currentUser: AuthenticatedUser, actionLabel: string): void {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException(`Only employee accounts can ${actionLabel}.`);
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
