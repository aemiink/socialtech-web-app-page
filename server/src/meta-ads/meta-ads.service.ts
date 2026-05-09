import {
  AccountType,
  DeliveryReleaseApprovalStatus,
  MetaAdsApprovalStatus,
  MetaAdsInsightLevel,
  MetaAdsConnectionStatus,
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
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { ConnectManualMetaAdsDto } from "./dto/connect-manual-meta-ads.dto";
import { MetaAdsCampaignsQueryDto } from "./dto/meta-ads-campaigns-query.dto";
import { MetaAdsDateRangeQueryDto } from "./dto/meta-ads-date-range-query.dto";
import { MetaAdsInsightsQueryDto } from "./dto/meta-ads-insights-query.dto";
import { TestMetaAdsConnectionDto } from "./dto/test-meta-ads-connection.dto";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";
import {
  MetaAdsApiActionMetric,
  MetaAdsApiService,
  MetaAdsCampaignCatalogItem,
  MetaAdsConnectionTestResult,
  MetaAdsReportingSnapshotResult,
  NormalizedMetaAdsApiError,
} from "./meta-ads-api.service";
import { MetaAdsTokenService } from "./meta-ads-token.service";

const META_ADS_CONFIG_READ_ANY_PERMISSION = "metaAds.config.read.any";
const META_ADS_CONFIG_MANAGE_ANY_PERMISSION = "metaAds.config.manage.any";
const META_ADS_CONFIG_READ_ASSIGNED_PERMISSION = "metaAds.config.read.assigned";
const META_ADS_CONFIG_READ_OWN_PERMISSION = "metaAds.config.read.own";
const DEFAULT_META_ADS_REQUIRED_SCOPES = ["ads_read"] as const;
const DEFAULT_REPORTING_RANGE_DAYS = 7;
const MAX_REPORTING_RANGE_DAYS = 90;
const DEFAULT_CAMPAIGNS_LIMIT = 12;
const DEFAULT_INSIGHTS_LIMIT = 100;
const RESULT_ACTION_PRIORITY = [
  "offsite_conversion.fb_pixel_purchase",
  "purchase",
  "onsite_conversion.purchase",
  "onsite_conversion.lead_grouped",
  "lead",
  "link_click",
] as const;

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

    return this.getPixelStatusByClientProfileId(clientProfileId);
  }

  async syncAdminClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanManageAnyConfig(currentUser);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query);
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

  async getAssignedClientPixelStatus(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<MetaAdsPixelStatusResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.getPixelStatusByClientProfileId(clientProfileId);
  }

  async syncAssignedClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    this.assertCanReadAssignedConfig(currentUser);
    await this.assertAssignedClientProfileOrFail(currentUser.id, clientProfileId);
    await this.assertClientHasActiveMetaAdsService(clientProfileId);

    return this.syncInsightsByClientProfileId(clientProfileId, query);
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

    return this.getPixelStatusByClientProfileId(clientProfileId);
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
      syncError: config?.syncError ?? null,
    };
  }

  private async syncInsightsByClientProfileId(
    clientProfileId: string,
    query: MetaAdsDateRangeQueryDto,
  ): Promise<MetaAdsSyncResponse> {
    const dateRange = this.resolveReportDateRange(query);
    const connection = await this.resolveReportingConnection(clientProfileId);

    let snapshot: MetaAdsReportingSnapshotResult;
    try {
      snapshot = await this.metaAdsApiService.fetchReportingSnapshot({
        accessToken: connection.accessToken,
        adAccountId: connection.adAccountId,
        since: dateRange.sinceIsoDate,
        until: dateRange.untilIsoDate,
      });
    } catch (error) {
      const normalizedError = this.metaAdsApiService.normalizeError(error);
      await this.markConnectionAsError(clientProfileId, normalizedError);
      throw this.toConnectionTestException(normalizedError);
    }

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
    };
  }

  private async resolveReportingConnection(clientProfileId: string): Promise<{
    accessToken: string;
    adAccountId: string;
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
