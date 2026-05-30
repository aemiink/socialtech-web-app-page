import { Injectable } from "@nestjs/common";
import {
  DeliveryReleaseApprovalStatus,
  GrowthHubGoal,
  GrowthHubStatus,
  MetaAdsApprovalStatus,
  Prisma,
  ProjectFileVisibility,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  SocialMediaPostStatus,
  TaskStatus,
  TaskTodoVisibility,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import type { GrowthHubChannelSummary } from "./growth-hub-summary.service";

type AggregationOptions = {
  since: Date;
  until: Date;
  clientVisibleOnly?: boolean;
};

type GrowthHubConfigModel = {
  primaryGoal: GrowthHubGoal | null;
  targetLeads: number | null;
  targetRoas: Prisma.Decimal | null;
  targetCpa: Prisma.Decimal | null;
  targetRevenue: Prisma.Decimal | null;
  reportingDay: string | null;
  notes: string | null;
  status: GrowthHubStatus;
};

type ChannelProject = {
  id: string;
  serviceKey: PurchasedServiceKey | null;
  updatedAt: Date;
};

type ChannelTask = {
  id: string;
  status: TaskStatus;
  dueDate: Date | null;
  approvalRequired: boolean;
  approvalStatus: MetaAdsApprovalStatus | null;
  updatedAt: Date;
  project: {
    serviceKey: PurchasedServiceKey | null;
  };
};

type ChannelFile = {
  id: string;
  serviceKey: PurchasedServiceKey | null;
  approvalRequired: boolean;
  approvalStatus: MetaAdsApprovalStatus | null;
  approvalRequestedAt: Date | null;
  updatedAt: Date;
  project: {
    serviceKey: PurchasedServiceKey | null;
  } | null;
};

type ChannelRelease = {
  id: string;
  approvalStatus: DeliveryReleaseApprovalStatus;
  updatedAt: Date;
  project: {
    serviceKey: PurchasedServiceKey | null;
  };
};

type ChannelTodo = {
  task: {
    project: {
      serviceKey: PurchasedServiceKey | null;
    };
  };
};

type ModuleConfigState = Map<PurchasedServiceKey, boolean>;

type MetricSnapshot = GrowthHubChannelSummary["metrics"];

const CHANNEL_SERVICE_KEYS = [
  PurchasedServiceKey.META_ADS,
  PurchasedServiceKey.GOOGLE_ADS,
  PurchasedServiceKey.TIKTOK_ADS,
  PurchasedServiceKey.AMAZON_ADS,
  PurchasedServiceKey.SOCIAL_MEDIA,
  PurchasedServiceKey.MEDIA_HUB,
  PurchasedServiceKey.WEB_APP,
  PurchasedServiceKey.MOBILE_APP,
  PurchasedServiceKey.LANDING_PAGE,
  PurchasedServiceKey.SEO_AUDIT,
  PurchasedServiceKey.TECHNICAL_SUPPORT,
] as const;

const ACTIVE_MODULE_SERVICE_KEYS = [
  PurchasedServiceKey.META_ADS,
  PurchasedServiceKey.TIKTOK_ADS,
  PurchasedServiceKey.AMAZON_ADS,
  PurchasedServiceKey.SOCIAL_MEDIA,
] as const;

const SERVICE_LABELS: Record<PurchasedServiceKey, string> = {
  GROWTH_HUB: "Growth & Hub",
  SOCIAL_MEDIA: "Sosyal Medya",
  MEDIA_HUB: "Media Hub",
  META_ADS: "Meta Ads",
  TIKTOK_ADS: "TikTok Ads",
  GOOGLE_ADS: "Google Ads",
  AMAZON_ADS: "Amazon Ads",
  WEB_APP: "Web App",
  MOBILE_APP: "Mobil App",
  LANDING_PAGE: "Landing Page",
  WEB_MOBILE_DESIGN: "Web & Mobil Tasarım",
  TECHNICAL_SUPPORT: "Teknik Destek",
  SEO_AUDIT: "SEO Audit",
};

@Injectable()
export class GrowthHubChannelAggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async getClientChannels(
    clientProfileId: string,
    options: AggregationOptions,
  ): Promise<GrowthHubChannelSummary[]> {
    const [config, activeServices, projects, moduleConfigState] = await Promise.all([
      this.prisma.clientGrowthHubConfig.findUnique({
        where: { clientProfileId },
        select: {
          primaryGoal: true,
          targetLeads: true,
          targetRoas: true,
          targetCpa: true,
          targetRevenue: true,
          reportingDay: true,
          notes: true,
          status: true,
        },
      }),
      this.prisma.clientPurchasedService.findMany({
        where: {
          clientProfileId,
          status: PurchasedServiceStatus.ACTIVE,
          serviceKey: { in: [...CHANNEL_SERVICE_KEYS] },
        },
        select: {
          serviceKey: true,
          updatedAt: true,
        },
        orderBy: { serviceKey: "asc" },
      }),
      this.prisma.project.findMany({
        where: { clientProfileId },
        select: {
          id: true,
          serviceKey: true,
          updatedAt: true,
        },
      }),
      this.getModuleConfigState(clientProfileId),
    ]);

    const projectIds = projects.map((project) => project.id);
    const [tasks, files, releases, openTodoCounts, metrics, reportAcknowledgements] =
      await Promise.all([
        this.findTasks(projectIds, options),
        this.findFiles(clientProfileId, projectIds, options),
        this.findReleases(projectIds, options),
        this.findOpenTodoCounts(projectIds, options),
        this.getMetricSnapshots(clientProfileId, options),
        this.getPendingReportAcknowledgementCounts(clientProfileId, options),
      ]);

    return activeServices.map((service) =>
      this.toChannelSummary({
        serviceKey: service.serviceKey,
        serviceUpdatedAt: service.updatedAt,
        config,
        projects,
        tasks,
        files,
        releases,
        openTodoCounts,
        metrics,
        reportAcknowledgements,
        moduleConfigState,
        until: options.until,
      }),
    );
  }

  private async getModuleConfigState(clientProfileId: string): Promise<ModuleConfigState> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: {
        metaAdsConfig: { select: { id: true } },
        tikTokAdsConfig: { select: { id: true } },
        amazonAdsConfig: { select: { id: true } },
        socialMediaConfig: { select: { id: true } },
      },
    });
    const state = new Map<PurchasedServiceKey, boolean>();
    state.set(PurchasedServiceKey.META_ADS, Boolean(client?.metaAdsConfig));
    state.set(PurchasedServiceKey.TIKTOK_ADS, Boolean(client?.tikTokAdsConfig));
    state.set(PurchasedServiceKey.AMAZON_ADS, Boolean(client?.amazonAdsConfig));
    state.set(PurchasedServiceKey.SOCIAL_MEDIA, Boolean(client?.socialMediaConfig));
    return state;
  }

  private findTasks(projectIds: string[], options: AggregationOptions): Promise<ChannelTask[]> {
    return this.prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        ...(options.clientVisibleOnly ? { approvalRequired: true } : {}),
      },
      select: {
        id: true,
        status: true,
        dueDate: true,
        approvalRequired: true,
        approvalStatus: true,
        updatedAt: true,
        project: { select: { serviceKey: true } },
      },
      take: 200,
    });
  }

  private findFiles(
    clientProfileId: string,
    projectIds: string[],
    options: AggregationOptions,
  ): Promise<ChannelFile[]> {
    return this.prisma.projectFile.findMany({
      where: {
        clientProfileId,
        ...(options.clientVisibleOnly ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE } : {}),
        OR: [{ serviceKey: { not: null } }, { projectId: { in: projectIds } }],
      },
      select: {
        id: true,
        serviceKey: true,
        approvalRequired: true,
        approvalStatus: true,
        approvalRequestedAt: true,
        updatedAt: true,
        project: { select: { serviceKey: true } },
      },
      take: 100,
    });
  }

  private findReleases(
    projectIds: string[],
    options: AggregationOptions,
  ): Promise<ChannelRelease[]> {
    return this.prisma.deliveryRelease.findMany({
      where: {
        projectId: { in: projectIds },
        ...(options.clientVisibleOnly
          ? { approvalStatus: { not: DeliveryReleaseApprovalStatus.NOT_REQUESTED } }
          : {}),
      },
      select: {
        id: true,
        approvalStatus: true,
        updatedAt: true,
        project: { select: { serviceKey: true } },
      },
      take: 100,
    });
  }

  private async findOpenTodoCounts(
    projectIds: string[],
    options: AggregationOptions,
  ): Promise<Map<PurchasedServiceKey, number>> {
    const todos: ChannelTodo[] = await this.prisma.taskTodo.findMany({
      where: {
        isCompleted: false,
        ...(options.clientVisibleOnly ? { visibility: TaskTodoVisibility.CLIENT_VISIBLE } : {}),
        task: { projectId: { in: projectIds } },
      },
      select: {
        task: {
          select: {
            project: { select: { serviceKey: true } },
          },
        },
      },
    });

    return todos.reduce((counts, todo) => {
      const serviceKey = todo.task.project.serviceKey;
      if (serviceKey !== null) {
        counts.set(serviceKey, (counts.get(serviceKey) ?? 0) + 1);
      }
      return counts;
    }, new Map<PurchasedServiceKey, number>());
  }

  private async getMetricSnapshots(
    clientProfileId: string,
    options: AggregationOptions,
  ): Promise<Map<PurchasedServiceKey, MetricSnapshot>> {
    const { since, until, clientVisibleOnly } = options;
    const [meta, tikTok, amazon, socialPosts, socialInsights] = await Promise.all([
      this.prisma.metaAdsDailyInsight.aggregate({
        where: { clientProfileId, date: { gte: since, lte: until } },
        _count: { _all: true },
        _sum: { spend: true, impressions: true, clicks: true, results: true, purchaseValue: true },
        _max: { updatedAt: true },
      }),
      this.prisma.tikTokAdsDailyInsight.aggregate({
        where: { clientProfileId, date: { gte: since, lte: until } },
        _count: { _all: true },
        _sum: {
          spend: true,
          impressions: true,
          clicks: true,
          conversions: true,
          purchaseValue: true,
        },
        _max: { updatedAt: true },
      }),
      this.prisma.amazonAdsDailyInsight.aggregate({
        where: { clientProfileId, date: { gte: since, lte: until } },
        _count: { _all: true },
        _sum: { spend: true, impressions: true, clicks: true, sales: true, orders: true },
        _max: { updatedAt: true },
      }),
      this.prisma.socialMediaPost.count({
        where: {
          clientProfileId,
          status: SocialMediaPostStatus.PUBLISHED,
          publishedAt: { gte: since, lte: until },
          ...(clientVisibleOnly ? { clientVisible: true } : {}),
        },
      }),
      this.prisma.socialMediaPostInsight.aggregate({
        where: {
          clientProfileId,
          date: { gte: since, lte: until },
          ...(clientVisibleOnly ? { post: { clientVisible: true } } : {}),
        },
        _count: { _all: true },
        _sum: {
          impressions: true,
          clicks: true,
          likes: true,
          comments: true,
          shares: true,
          saves: true,
        },
        _max: { updatedAt: true },
      }),
    ]);

    const snapshots = new Map<PurchasedServiceKey, MetricSnapshot>();
    const metaSpend = this.readDecimalAsNumber(meta._sum.spend);
    const metaRevenue = this.readDecimalAsNumber(meta._sum.purchaseValue);
    const metaLeads = meta._sum.results ?? 0;
    snapshots.set(PurchasedServiceKey.META_ADS, {
      spend: metaSpend,
      revenue: metaRevenue,
      leads: metaLeads,
      impressions: meta._sum.impressions ?? 0,
      clicks: meta._sum.clicks ?? 0,
      conversions: metaLeads,
      orders: 0,
      publishedPosts: 0,
      engagement: 0,
      roas: this.divide(metaRevenue, metaSpend),
      cpa: this.divide(metaSpend, metaLeads),
      sourceRecords: meta._count._all,
      lastUpdatedAt: meta._max.updatedAt,
    });

    const tikTokSpend = this.readDecimalAsNumber(tikTok._sum.spend);
    const tikTokRevenue = this.readDecimalAsNumber(tikTok._sum.purchaseValue);
    const tikTokConversions = tikTok._sum.conversions ?? 0;
    snapshots.set(PurchasedServiceKey.TIKTOK_ADS, {
      spend: tikTokSpend,
      revenue: tikTokRevenue,
      leads: tikTokConversions,
      impressions: tikTok._sum.impressions ?? 0,
      clicks: tikTok._sum.clicks ?? 0,
      conversions: tikTokConversions,
      orders: 0,
      publishedPosts: 0,
      engagement: 0,
      roas: this.divide(tikTokRevenue, tikTokSpend),
      cpa: this.divide(tikTokSpend, tikTokConversions),
      sourceRecords: tikTok._count._all,
      lastUpdatedAt: tikTok._max.updatedAt,
    });

    const amazonSpend = this.readDecimalAsNumber(amazon._sum.spend);
    const amazonRevenue = this.readDecimalAsNumber(amazon._sum.sales);
    const amazonOrders = amazon._sum.orders ?? 0;
    snapshots.set(PurchasedServiceKey.AMAZON_ADS, {
      spend: amazonSpend,
      revenue: amazonRevenue,
      leads: amazonOrders,
      impressions: amazon._sum.impressions ?? 0,
      clicks: amazon._sum.clicks ?? 0,
      conversions: amazonOrders,
      orders: amazonOrders,
      publishedPosts: 0,
      engagement: 0,
      roas: this.divide(amazonRevenue, amazonSpend),
      cpa: this.divide(amazonSpend, amazonOrders),
      sourceRecords: amazon._count._all,
      lastUpdatedAt: amazon._max.updatedAt,
    });

    const socialEngagement =
      (socialInsights._sum.likes ?? 0) +
      (socialInsights._sum.comments ?? 0) +
      (socialInsights._sum.shares ?? 0) +
      (socialInsights._sum.saves ?? 0);
    snapshots.set(PurchasedServiceKey.SOCIAL_MEDIA, {
      spend: 0,
      revenue: 0,
      leads: 0,
      impressions: socialInsights._sum.impressions ?? 0,
      clicks: socialInsights._sum.clicks ?? 0,
      conversions: 0,
      orders: 0,
      publishedPosts: socialPosts,
      engagement: socialEngagement,
      roas: 0,
      cpa: 0,
      sourceRecords: socialInsights._count._all + socialPosts,
      lastUpdatedAt: socialInsights._max.updatedAt,
    });

    return snapshots;
  }

  private async getPendingReportAcknowledgementCounts(
    clientProfileId: string,
    options: AggregationOptions,
  ): Promise<Map<PurchasedServiceKey, number>> {
    const reportWhere = {
      clientProfileId,
      acknowledgementRequestedAt: { not: null },
      acknowledgedAt: null,
      ...(options.clientVisibleOnly ? { clientVisible: true } : {}),
    };
    const [meta, tikTok, amazon, social] = await Promise.all([
      this.prisma.metaAdsReport.count({ where: reportWhere }),
      this.prisma.tikTokAdsReport.count({ where: reportWhere }),
      this.prisma.amazonAdsReport.count({ where: reportWhere }),
      this.prisma.socialMediaReport.count({ where: reportWhere }),
    ]);

    return new Map([
      [PurchasedServiceKey.META_ADS, meta],
      [PurchasedServiceKey.TIKTOK_ADS, tikTok],
      [PurchasedServiceKey.AMAZON_ADS, amazon],
      [PurchasedServiceKey.SOCIAL_MEDIA, social],
    ]);
  }

  private toChannelSummary({
    serviceKey,
    serviceUpdatedAt,
    config,
    projects,
    tasks,
    files,
    releases,
    openTodoCounts,
    metrics,
    reportAcknowledgements,
    moduleConfigState,
    until,
  }: {
    serviceKey: PurchasedServiceKey;
    serviceUpdatedAt: Date;
    config: GrowthHubConfigModel | null;
    projects: ChannelProject[];
    tasks: ChannelTask[];
    files: ChannelFile[];
    releases: ChannelRelease[];
    openTodoCounts: Map<PurchasedServiceKey, number>;
    metrics: Map<PurchasedServiceKey, MetricSnapshot>;
    reportAcknowledgements: Map<PurchasedServiceKey, number>;
    moduleConfigState: ModuleConfigState;
    until: Date;
  }): GrowthHubChannelSummary {
    const channelProjects = projects.filter((project) => project.serviceKey === serviceKey);
    const channelTasks = tasks.filter((task) => task.project.serviceKey === serviceKey);
    const channelFiles = files.filter((file) => this.resolveFileServiceKey(file) === serviceKey);
    const channelReleases = releases.filter((release) => release.project.serviceKey === serviceKey);
    const metricSnapshot = metrics.get(serviceKey) ?? this.emptyMetrics();
    const reportAcknowledgementCount = reportAcknowledgements.get(serviceKey) ?? 0;
    const openTasks = channelTasks.filter((task) => this.isOpenTask(task.status)).length;
    const openTodos = openTodoCounts.get(serviceKey) ?? 0;
    const overdueTasks = channelTasks.filter((task) => this.isOverdueTask(task, until)).length;
    const pendingApprovals =
      channelTasks.filter((task) => this.isPendingTaskApproval(task)).length +
      channelFiles.filter((file) => this.isPendingFileApproval(file)).length +
      channelReleases.filter((release) => release.approvalStatus === DeliveryReleaseApprovalStatus.PENDING).length +
      reportAcknowledgementCount;
    const sourceStatus = this.resolveSourceStatus(serviceKey);
    const hasSourceConfig = moduleConfigState.get(serviceKey) === true;
    const hasProject = channelProjects.length > 0;
    const hasData =
      metricSnapshot.sourceRecords > 0 ||
      openTasks > 0 ||
      pendingApprovals > 0 ||
      channelFiles.length > 0 ||
      channelReleases.length > 0;
    const progressPercent = this.resolveProgressPercent(channelTasks);
    const status = this.resolveStatus({
      config,
      hasProject,
      hasSourceConfig,
      hasData,
      metrics: metricSnapshot,
      pendingApprovals,
      overdueTasks,
    });
    const riskLevel = this.resolveRiskLevel(status, pendingApprovals, overdueTasks);
    const healthScore = this.resolveHealthScore(status, pendingApprovals, overdueTasks, progressPercent);
    const primary = this.resolvePrimaryMetric(metricSnapshot, serviceKey, progressPercent);
    const secondary = this.resolveSecondaryMetric(metricSnapshot, serviceKey, openTasks);
    const lastUpdatedAt = this.maxDate([
      serviceUpdatedAt,
      metricSnapshot.lastUpdatedAt,
      ...channelProjects.map((project) => project.updatedAt),
      ...channelTasks.map((task) => task.updatedAt),
      ...channelFiles.map((file) => file.updatedAt),
      ...channelReleases.map((release) => release.updatedAt),
    ]);

    return {
      serviceKey,
      label: SERVICE_LABELS[serviceKey] ?? serviceKey,
      sourceStatus,
      status,
      healthScore,
      primaryMetricLabel: primary.label,
      primaryMetricValue: primary.value,
      secondaryMetricLabel: secondary.label,
      secondaryMetricValue: secondary.value,
      spend: metricSnapshot.spend,
      leads: metricSnapshot.leads,
      conversions: metricSnapshot.conversions,
      revenue: metricSnapshot.revenue,
      roas: metricSnapshot.roas,
      cpa: metricSnapshot.cpa,
      progressPercent,
      pendingApprovals,
      openTasks,
      openTodos,
      overdueTasks,
      metrics: metricSnapshot,
      lastUpdatedAt,
      riskLevel,
    };
  }

  private resolveStatus({
    config,
    hasProject,
    hasSourceConfig,
    hasData,
    metrics,
    pendingApprovals,
    overdueTasks,
  }: {
    config: GrowthHubConfigModel | null;
    hasProject: boolean;
    hasSourceConfig: boolean;
    hasData: boolean;
    metrics: MetricSnapshot;
    pendingApprovals: number;
    overdueTasks: number;
  }): GrowthHubChannelSummary["status"] {
    if (!config || !this.hasMeaningfulConfig(config)) {
      return "WAITING_CONFIG";
    }

    if (!hasProject && !hasSourceConfig && metrics.sourceRecords === 0) {
      return "WAITING_CONFIG";
    }

    if (pendingApprovals >= 3 || overdueTasks > 0) {
      return "RISK";
    }

    const targetRoas = this.readDecimalAsNumber(config.targetRoas);
    if (targetRoas > 0 && metrics.spend > 0) {
      return metrics.roas >= targetRoas ? "SCALE" : "OPTIMIZE";
    }

    const targetCpa = this.readDecimalAsNumber(config.targetCpa);
    if (targetCpa > 0 && metrics.cpa > 0) {
      return metrics.cpa <= targetCpa ? "SCALE" : "OPTIMIZE";
    }

    if (!hasData) {
      return "NO_DATA";
    }

    return "ACTIVE";
  }

  private resolveRiskLevel(
    status: GrowthHubChannelSummary["status"],
    pendingApprovals: number,
    overdueTasks: number,
  ): GrowthHubChannelSummary["riskLevel"] {
    if (status === "RISK" || overdueTasks > 0 || pendingApprovals >= 3) {
      return "HIGH";
    }

    if (status === "OPTIMIZE" || pendingApprovals > 0) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private resolveHealthScore(
    status: GrowthHubChannelSummary["status"],
    pendingApprovals: number,
    overdueTasks: number,
    progressPercent: number | null,
  ): number {
    const base =
      status === "SCALE"
        ? 92
        : status === "ACTIVE"
          ? 82
          : status === "OPTIMIZE"
            ? 68
            : status === "WAITING_CONFIG"
              ? 42
              : status === "RISK"
                ? 34
                : 24;
    const progressBonus = progressPercent === null ? 0 : Math.max(Math.round((progressPercent - 50) / 10), -5);
    return Math.max(Math.min(base + progressBonus - Math.min(pendingApprovals * 3, 15) - Math.min(overdueTasks * 10, 20), 100), 0);
  }

  private resolvePrimaryMetric(
    metrics: MetricSnapshot,
    serviceKey: PurchasedServiceKey,
    progressPercent: number | null,
  ): { label: string; value: number } {
    if (metrics.revenue > 0) return { label: "Revenue", value: metrics.revenue };
    if (metrics.leads > 0) return { label: serviceKey === PurchasedServiceKey.AMAZON_ADS ? "Sipariş" : "Lead", value: metrics.leads };
    if (metrics.publishedPosts > 0) return { label: "Yayın", value: metrics.publishedPosts };
    if (metrics.engagement > 0) return { label: "Etkileşim", value: metrics.engagement };
    if (progressPercent !== null) return { label: "Progress", value: progressPercent };
    return { label: "Kaynak", value: metrics.sourceRecords };
  }

  private resolveSecondaryMetric(
    metrics: MetricSnapshot,
    serviceKey: PurchasedServiceKey,
    openTasks: number,
  ): { label: string; value: number } {
    if (metrics.spend > 0) return { label: "Harcama", value: metrics.spend };
    if (metrics.impressions > 0) return { label: "Gösterim", value: metrics.impressions };
    if (metrics.clicks > 0) return { label: "Tıklama", value: metrics.clicks };
    if (serviceKey === PurchasedServiceKey.SOCIAL_MEDIA && metrics.publishedPosts > 0) {
      return { label: "Etkileşim", value: metrics.engagement };
    }
    return { label: "Açık iş", value: openTasks };
  }

  private resolveProgressPercent(tasks: ChannelTask[]): number | null {
    if (tasks.length === 0) {
      return null;
    }

    const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE).length;
    return Math.round((doneTasks / tasks.length) * 100);
  }

  private resolveSourceStatus(serviceKey: PurchasedServiceKey): GrowthHubChannelSummary["sourceStatus"] {
    if (serviceKey === PurchasedServiceKey.GOOGLE_ADS) {
      return "CONTRACT_ONLY";
    }

    if (ACTIVE_MODULE_SERVICE_KEYS.includes(serviceKey as (typeof ACTIVE_MODULE_SERVICE_KEYS)[number])) {
      return "ACTIVE_MODULE";
    }

    return "NOT_IMPLEMENTED";
  }

  private hasMeaningfulConfig(config: GrowthHubConfigModel): boolean {
    return [
      config.primaryGoal,
      config.targetLeads,
      config.targetRoas,
      config.targetCpa,
      config.targetRevenue,
      config.reportingDay,
      config.notes,
    ].some((value) => value !== null && value !== undefined && value !== "");
  }

  private isPendingTaskApproval(task: ChannelTask): boolean {
    return (
      task.approvalRequired &&
      (task.approvalStatus === null || task.approvalStatus === MetaAdsApprovalStatus.PENDING)
    );
  }

  private isPendingFileApproval(file: ChannelFile): boolean {
    return (
      file.approvalRequired &&
      (file.approvalStatus === null || file.approvalStatus === MetaAdsApprovalStatus.PENDING)
    );
  }

  private resolveFileServiceKey(file: ChannelFile): PurchasedServiceKey | null {
    return file.serviceKey ?? file.project?.serviceKey ?? null;
  }

  private isOpenTask(status: TaskStatus): boolean {
    return status !== TaskStatus.DONE && status !== TaskStatus.BLOCKED;
  }

  private isOverdueTask(task: ChannelTask, now: Date): boolean {
    return this.isOpenTask(task.status) && task.dueDate !== null && task.dueDate < now;
  }

  private emptyMetrics(): MetricSnapshot {
    return {
      spend: 0,
      revenue: 0,
      leads: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      orders: 0,
      publishedPosts: 0,
      engagement: 0,
      roas: 0,
      cpa: 0,
      sourceRecords: 0,
      lastUpdatedAt: null,
    };
  }

  private readDecimalAsNumber(value: Prisma.Decimal | number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return value.toNumber();
  }

  private divide(numerator: number, denominator: number): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100) / 100;
  }

  private maxDate(values: Array<Date | null | undefined>): Date | null {
    const timestamps = values
      .filter((value): value is Date => value instanceof Date)
      .map((value) => value.getTime());
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps));
  }
}
