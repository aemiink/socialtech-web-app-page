import { Injectable } from "@nestjs/common";
import {
  ClientStatus,
  DeliveryReleaseApprovalStatus,
  GrowthHubActionPriority,
  GrowthHubActionStatus,
  GrowthHubGoal,
  GrowthHubStatus,
  MetaAdsApprovalStatus,
  Prisma,
  ProjectFileVisibility,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TaskStatus,
  TaskTodoVisibility,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { GrowthHubChannelAggregationService } from "./growth-hub-channel-aggregation.service";

export type GrowthHubSummaryState =
  | "READY"
  | "NO_DATA"
  | "WAITING_CONFIG"
  | "RISK"
  | "OPTIMIZE"
  | "SCALE";

export type GrowthHubChannelSourceStatus =
  | "ACTIVE_MODULE"
  | "CONTRACT_ONLY"
  | "NOT_IMPLEMENTED";

export type GrowthHubChannelStatus =
  | "ACTIVE"
  | "NO_DATA"
  | "WAITING_CONFIG"
  | "RISK"
  | "OPTIMIZE"
  | "SCALE";

export type GrowthHubActionType =
  | "GROWTH_ACTION"
  | "TASK_APPROVAL"
  | "FILE_APPROVAL"
  | "RELEASE_APPROVAL"
  | "REPORT_ACKNOWLEDGEMENT";

const growthHubConfigSelect = {
  id: true,
  clientProfileId: true,
  primaryGoal: true,
  targetLeads: true,
  targetRoas: true,
  targetCpa: true,
  targetRevenue: true,
  reportingDay: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientGrowthHubConfigSelect;

const growthHubProjectSelect = {
  id: true,
  name: true,
  slug: true,
  serviceKey: true,
  status: true,
  priority: true,
  dueDate: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

const growthHubTaskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  dueDate: true,
  approvalRequired: true,
  approvalStatus: true,
  approvalRequestedAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
} satisfies Prisma.TaskSelect;

const growthHubFileSelect = {
  id: true,
  title: true,
  category: true,
  visibility: true,
  approvalRequired: true,
  approvalStatus: true,
  approvalRequestedAt: true,
  updatedAt: true,
  serviceKey: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
} satisfies Prisma.ProjectFileSelect;

const growthHubReleaseSelect = {
  id: true,
  title: true,
  environment: true,
  status: true,
  approvalStatus: true,
  approvalRequestedAt: true,
  scheduledAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
} satisfies Prisma.DeliveryReleaseSelect;

const growthHubMessageSelect = {
  id: true,
  body: true,
  createdAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  author: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
} satisfies Prisma.WebAppWorkspaceMessageSelect;

const growthHubReportSelect = {
  id: true,
  summary: true,
  periodEnd: true,
  clientVisible: true,
  acknowledgementRequestedAt: true,
  acknowledgedAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
} as const;

type GrowthHubConfigModel = Prisma.ClientGrowthHubConfigGetPayload<{
  select: typeof growthHubConfigSelect;
}>;

type GrowthHubProjectModel = Prisma.ProjectGetPayload<{
  select: typeof growthHubProjectSelect;
}>;

type GrowthHubTaskModel = Prisma.TaskGetPayload<{
  select: typeof growthHubTaskSelect;
}>;

type GrowthHubFileModel = Prisma.ProjectFileGetPayload<{
  select: typeof growthHubFileSelect;
}>;

type GrowthHubReleaseModel = Prisma.DeliveryReleaseGetPayload<{
  select: typeof growthHubReleaseSelect;
}>;

type GrowthHubMessageModel = Prisma.WebAppWorkspaceMessageGetPayload<{
  select: typeof growthHubMessageSelect;
}>;

type GrowthHubReportAcknowledgementModel = {
  id: string;
  summary: string | null;
  periodEnd: Date;
  acknowledgementRequestedAt: Date | null;
  acknowledgedAt: Date | null;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: PurchasedServiceKey | null;
  } | null;
};

type GrowthHubClientModel = {
  id: string;
  slug: string;
  companyName: string;
  status: ClientStatus;
};

type GrowthHubPurchasedServiceModel = {
  serviceKey: PurchasedServiceKey;
  status: PurchasedServiceStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  updatedAt: Date;
};

type GrowthHubSummaryOptions = {
  clientVisibleOnly?: boolean;
};

type GrowthHubChannelMetricSnapshot = {
  spend: number;
  revenue: number;
  leads: number;
  impressions: number;
  clicks: number;
  conversions: number;
  orders: number;
  publishedPosts: number;
  engagement: number;
  roas: number;
  cpa: number;
  sourceRecords: number;
  lastUpdatedAt: Date | null;
};

export type GrowthHubConfigSummary = {
  id: string;
  primaryGoal: GrowthHubGoal | null;
  targetLeads: number | null;
  targetRoas: number | null;
  targetCpa: number | null;
  targetRevenue: number | null;
  reportingDay: string | null;
  notes: string | null;
  status: GrowthHubStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type GrowthHubChannelSummary = {
  serviceKey: PurchasedServiceKey;
  label: string;
  sourceStatus: GrowthHubChannelSourceStatus;
  status: GrowthHubChannelStatus;
  healthScore: number;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  spend: number;
  leads: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpa: number;
  progressPercent: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  metrics: GrowthHubChannelMetricSnapshot;
  openTasks: number;
  openTodos: number;
  pendingApprovals: number;
  overdueTasks: number;
  lastUpdatedAt: Date | null;
};

export type GrowthHubActionItem = {
  id: string;
  type: GrowthHubActionType;
  title: string;
  description?: string | null;
  serviceKey: PurchasedServiceKey | null;
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  owner?: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  status?: GrowthHubActionStatus | null;
  priority?: GrowthHubActionPriority | null;
  clientVisible?: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  dueAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date;
};

export type GrowthHubActivityItem = {
  id: string;
  type: "TASK" | "FILE" | "RELEASE" | "MESSAGE";
  title: string;
  serviceKey: PurchasedServiceKey | null;
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  occurredAt: Date;
};

export type GrowthHubSummaryResponse = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientStatus;
  };
  service: {
    hasActiveService: boolean;
    status: PurchasedServiceStatus | null;
    startedAt: Date | null;
    updatedAt: Date | null;
  };
  config: GrowthHubConfigSummary | null;
  state: GrowthHubSummaryState;
  dateRange: {
    since: string;
    until: string;
  };
  metrics: {
    activeServices: number;
    activeChannels: number;
    projects: number;
    openTasks: number;
    overdueTasks: number;
    openTodos: number;
    pendingApprovals: number;
    pendingReportAcknowledgements: number;
    totalSpend: number;
    totalRevenue: number;
    totalLeads: number;
    blendedRoas: number;
    blendedCpa: number;
  };
  channels: GrowthHubChannelSummary[];
  actions: GrowthHubActionItem[];
  activity: GrowthHubActivityItem[];
  meta: {
    generatedAt: Date;
    lastUpdatedAt: Date | null;
    sources: string[];
  };
};

@Injectable()
export class GrowthHubSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAggregationService: GrowthHubChannelAggregationService,
  ) {}

  async getSummary(
    clientProfileId: string,
    options: GrowthHubSummaryOptions = {},
  ): Promise<GrowthHubSummaryResponse> {
    const now = new Date();
    const since = new Date(now.getTime() - 7 * 86_400_000);
    const [client, growthHubService, config, activeServices, projects] =
      await this.prisma.$transaction([
        this.prisma.clientProfile.findUniqueOrThrow({
          where: { id: clientProfileId },
          select: {
            id: true,
            slug: true,
            companyName: true,
            status: true,
          },
        }),
        this.prisma.clientPurchasedService.findUnique({
          where: {
            clientProfileId_serviceKey: {
              clientProfileId,
              serviceKey: PurchasedServiceKey.GROWTH_HUB,
            },
          },
          select: {
            serviceKey: true,
            status: true,
            startedAt: true,
            endedAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.clientGrowthHubConfig.findUnique({
          where: { clientProfileId },
          select: growthHubConfigSelect,
        }),
        this.prisma.clientPurchasedService.findMany({
          where: {
            clientProfileId,
            status: PurchasedServiceStatus.ACTIVE,
          },
          select: {
            serviceKey: true,
            status: true,
            startedAt: true,
            endedAt: true,
            updatedAt: true,
          },
          orderBy: { serviceKey: "asc" },
        }),
        this.prisma.project.findMany({
          where: { clientProfileId },
          select: growthHubProjectSelect,
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        }),
      ]);

    const projectIds = projects.map((project) => project.id);
    const [
      tasks,
      files,
      releases,
      messages,
      openTodos,
      reportAcknowledgements,
      channels,
    ] = await Promise.all([
      this.findTasks(projectIds, options),
      this.findFiles(clientProfileId, projectIds, options),
      this.findReleases(projectIds, options),
      this.findMessages(projectIds, options),
      this.countOpenTodos(projectIds, options),
      this.findReportAcknowledgements(clientProfileId, options),
      this.channelAggregationService.getClientChannels(clientProfileId, {
        since,
        until: now,
        clientVisibleOnly: options.clientVisibleOnly,
      }),
    ]);

    return this.buildSummary({
      client,
      growthHubService,
      config,
      activeServices,
      projects,
      tasks,
      files,
      releases,
      messages,
      openTodos,
      reportAcknowledgements,
      channels,
      since,
      until: now,
    });
  }

  private async findTasks(
    projectIds: string[],
    options: GrowthHubSummaryOptions,
  ): Promise<GrowthHubTaskModel[]> {
    return this.prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        ...(options.clientVisibleOnly ? { approvalRequired: true } : {}),
      },
      select: growthHubTaskSelect,
      orderBy: [{ updatedAt: "desc" }, { dueDate: "asc" }],
      take: 80,
    });
  }

  private async findFiles(
    clientProfileId: string,
    projectIds: string[],
    options: GrowthHubSummaryOptions,
  ): Promise<GrowthHubFileModel[]> {
    return this.prisma.projectFile.findMany({
      where: {
        clientProfileId,
        ...(options.clientVisibleOnly ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE } : {}),
        OR: [{ serviceKey: { not: null } }, { projectId: { in: projectIds } }],
      },
      select: growthHubFileSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 40,
    });
  }

  private async findReleases(
    projectIds: string[],
    options: GrowthHubSummaryOptions,
  ): Promise<GrowthHubReleaseModel[]> {
    return this.prisma.deliveryRelease.findMany({
      where: {
        projectId: { in: projectIds },
        ...(options.clientVisibleOnly
          ? { approvalStatus: { not: DeliveryReleaseApprovalStatus.NOT_REQUESTED } }
          : {}),
      },
      select: growthHubReleaseSelect,
      orderBy: [{ updatedAt: "desc" }, { scheduledAt: "asc" }],
      take: 40,
    });
  }

  private async findMessages(
    projectIds: string[],
    options: GrowthHubSummaryOptions,
  ): Promise<GrowthHubMessageModel[]> {
    return this.prisma.webAppWorkspaceMessage.findMany({
      where: {
        projectId: { in: projectIds },
        ...(options.clientVisibleOnly ? { isInternal: false } : {}),
      },
      select: growthHubMessageSelect,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  private countOpenTodos(
    projectIds: string[],
    options: GrowthHubSummaryOptions,
  ): Promise<number> {
    return this.prisma.taskTodo.count({
      where: {
        isCompleted: false,
        ...(options.clientVisibleOnly ? { visibility: TaskTodoVisibility.CLIENT_VISIBLE } : {}),
        task: { projectId: { in: projectIds } },
      },
    });
  }

  private async findReportAcknowledgements(
    clientProfileId: string,
    options: GrowthHubSummaryOptions,
  ): Promise<GrowthHubActionItem[]> {
    const reportWhere = {
      clientProfileId,
      acknowledgementRequestedAt: { not: null },
      acknowledgedAt: null,
      ...(options.clientVisibleOnly ? { clientVisible: true } : {}),
    };

    const [metaReports, tikTokReports, amazonReports, socialReports] = await Promise.all([
      this.prisma.metaAdsReport.findMany({
        where: reportWhere,
        select: growthHubReportSelect,
        orderBy: [{ updatedAt: "desc" }],
        take: 20,
      }),
      this.prisma.tikTokAdsReport.findMany({
        where: reportWhere,
        select: growthHubReportSelect,
        orderBy: [{ updatedAt: "desc" }],
        take: 20,
      }),
      this.prisma.amazonAdsReport.findMany({
        where: reportWhere,
        select: growthHubReportSelect,
        orderBy: [{ updatedAt: "desc" }],
        take: 20,
      }),
      this.prisma.socialMediaReport.findMany({
        where: reportWhere,
        select: growthHubReportSelect,
        orderBy: [{ updatedAt: "desc" }],
        take: 20,
      }),
    ]);

    return [
      ...this.toReportActions(metaReports, PurchasedServiceKey.META_ADS),
      ...this.toReportActions(tikTokReports, PurchasedServiceKey.TIKTOK_ADS),
      ...this.toReportActions(amazonReports, PurchasedServiceKey.AMAZON_ADS),
      ...this.toReportActions(socialReports, PurchasedServiceKey.SOCIAL_MEDIA),
    ].sort((first, second) => second.updatedAt.getTime() - first.updatedAt.getTime());
  }

  private buildSummary({
    client,
    growthHubService,
    config,
    activeServices,
    projects,
    tasks,
    files,
    releases,
    messages,
    openTodos,
    reportAcknowledgements,
    channels,
    since,
    until,
  }: {
    client: GrowthHubClientModel;
    growthHubService: GrowthHubPurchasedServiceModel | null;
    config: GrowthHubConfigModel | null;
    activeServices: GrowthHubPurchasedServiceModel[];
    projects: GrowthHubProjectModel[];
    tasks: GrowthHubTaskModel[];
    files: GrowthHubFileModel[];
    releases: GrowthHubReleaseModel[];
    messages: GrowthHubMessageModel[];
    openTodos: number;
    reportAcknowledgements: GrowthHubActionItem[];
    channels: GrowthHubChannelSummary[];
    since: Date;
    until: Date;
  }): GrowthHubSummaryResponse {
    const openTasks = tasks.filter((task) => this.isOpenTask(task.status)).length;
    const overdueTasks = tasks.filter((task) => this.isOverdueTask(task, until)).length;
    const approvalActions = [
      ...this.toTaskActions(tasks),
      ...this.toFileActions(files),
      ...this.toReleaseActions(releases),
      ...reportAcknowledgements,
    ].sort((first, second) => second.updatedAt.getTime() - first.updatedAt.getTime());
    const totals = channels.reduce(
      (accumulator, channel) => ({
        spend: accumulator.spend + channel.metrics.spend,
        revenue: accumulator.revenue + channel.metrics.revenue,
        leads: accumulator.leads + channel.metrics.leads,
      }),
      { spend: 0, revenue: 0, leads: 0 },
    );
    const lastUpdatedAt = this.resolveLastUpdatedAt({
      growthHubService,
      config,
      activeServices,
      projects,
      tasks,
      files,
      releases,
      messages,
      channels,
    });

    return {
      client: {
        id: client.id,
        name: client.companyName,
        slug: client.slug,
        status: client.status,
      },
      service: {
        hasActiveService: growthHubService?.status === PurchasedServiceStatus.ACTIVE,
        status: growthHubService?.status ?? null,
        startedAt: growthHubService?.startedAt ?? null,
        updatedAt: growthHubService?.updatedAt ?? null,
      },
      config: config ? this.toConfigSummary(config) : null,
      state: this.resolveSummaryState(growthHubService, config, channels, approvalActions),
      dateRange: {
        since: since.toISOString().slice(0, 10),
        until: until.toISOString().slice(0, 10),
      },
      metrics: {
        activeServices: activeServices.length,
        activeChannels: channels.length,
        projects: projects.length,
        openTasks,
        overdueTasks,
        openTodos,
        pendingApprovals: approvalActions.length,
        pendingReportAcknowledgements: reportAcknowledgements.length,
        totalSpend: this.round(totals.spend),
        totalRevenue: this.round(totals.revenue),
        totalLeads: totals.leads,
        blendedRoas: this.divide(totals.revenue, totals.spend),
        blendedCpa: this.divide(totals.spend, totals.leads),
      },
      channels,
      actions: approvalActions.slice(0, 30),
      activity: this.buildActivity(tasks, files, releases, messages).slice(0, 30),
      meta: {
        generatedAt: new Date(),
        lastUpdatedAt,
        sources: [
          "ClientPurchasedService",
          "ClientGrowthHubConfig",
          "Project",
          "Task",
          "TaskTodo",
          "ProjectFile",
          "DeliveryRelease",
          "WebAppWorkspaceMessage",
          "MetaAdsDailyInsight",
          "TikTokAdsDailyInsight",
          "AmazonAdsDailyInsight",
          "SocialMediaPost",
          "SocialMediaPostInsight",
          "MetaAdsReport",
          "TikTokAdsReport",
          "AmazonAdsReport",
          "SocialMediaReport",
        ],
      },
    };
  }

  private toConfigSummary(config: GrowthHubConfigModel): GrowthHubConfigSummary {
    return {
      id: config.id,
      primaryGoal: config.primaryGoal,
      targetLeads: config.targetLeads,
      targetRoas: this.readDecimalAsNullableNumber(config.targetRoas),
      targetCpa: this.readDecimalAsNullableNumber(config.targetCpa),
      targetRevenue: this.readDecimalAsNullableNumber(config.targetRevenue),
      reportingDay: config.reportingDay,
      notes: config.notes,
      status: config.status,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private toTaskActions(tasks: GrowthHubTaskModel[]): GrowthHubActionItem[] {
    return tasks
      .filter(
        (task) =>
          task.approvalRequired &&
          (task.approvalStatus === null || task.approvalStatus === MetaAdsApprovalStatus.PENDING),
      )
      .map((task) => ({
        id: task.id,
        type: "TASK_APPROVAL",
        title: task.title,
        serviceKey: task.project.serviceKey,
        project: this.toProjectReference(task.project),
        dueAt: task.dueDate,
        createdAt: task.approvalRequestedAt,
        updatedAt: task.updatedAt,
      }));
  }

  private toFileActions(files: GrowthHubFileModel[]): GrowthHubActionItem[] {
    return files
      .filter(
        (file) =>
          file.approvalRequired &&
          (file.approvalStatus === null || file.approvalStatus === MetaAdsApprovalStatus.PENDING),
      )
      .map((file) => ({
        id: file.id,
        type: "FILE_APPROVAL",
        title: file.title,
        serviceKey: this.resolveFileServiceKey(file),
        project: this.toProjectReference(file.project),
        dueAt: null,
        createdAt: file.approvalRequestedAt,
        updatedAt: file.updatedAt,
      }));
  }

  private toReleaseActions(releases: GrowthHubReleaseModel[]): GrowthHubActionItem[] {
    return releases
      .filter((release) => release.approvalStatus === DeliveryReleaseApprovalStatus.PENDING)
      .map((release) => ({
        id: release.id,
        type: "RELEASE_APPROVAL",
        title: release.title,
        serviceKey: release.project.serviceKey,
        project: this.toProjectReference(release.project),
        dueAt: release.scheduledAt,
        createdAt: release.approvalRequestedAt,
        updatedAt: release.updatedAt,
      }));
  }

  private toReportActions(
    reports: GrowthHubReportAcknowledgementModel[],
    fallbackServiceKey: PurchasedServiceKey,
  ): GrowthHubActionItem[] {
    return reports.map((report) => ({
      id: report.id,
      type: "REPORT_ACKNOWLEDGEMENT",
      title: report.summary ?? "Rapor onayı bekliyor",
      serviceKey: report.project?.serviceKey ?? fallbackServiceKey,
      project: report.project ? this.toProjectReference(report.project) : null,
      dueAt: report.periodEnd,
      createdAt: report.acknowledgementRequestedAt,
      updatedAt: report.updatedAt,
    }));
  }

  private buildActivity(
    tasks: GrowthHubTaskModel[],
    files: GrowthHubFileModel[],
    releases: GrowthHubReleaseModel[],
    messages: GrowthHubMessageModel[],
  ): GrowthHubActivityItem[] {
    return [
      ...tasks.slice(0, 12).map((task) => ({
        id: task.id,
        type: "TASK" as const,
        title: task.title,
        serviceKey: task.project.serviceKey,
        project: this.toProjectReference(task.project),
        occurredAt: task.updatedAt,
      })),
      ...files.slice(0, 8).map((file) => ({
        id: file.id,
        type: "FILE" as const,
        title: file.title,
        serviceKey: this.resolveFileServiceKey(file),
        project: this.toProjectReference(file.project),
        occurredAt: file.updatedAt,
      })),
      ...releases.slice(0, 8).map((release) => ({
        id: release.id,
        type: "RELEASE" as const,
        title: release.title,
        serviceKey: release.project.serviceKey,
        project: this.toProjectReference(release.project),
        occurredAt: release.updatedAt,
      })),
      ...messages.slice(0, 8).map((message) => ({
        id: message.id,
        type: "MESSAGE" as const,
        title: this.toMessageActivityTitle(message),
        serviceKey: message.project.serviceKey,
        project: this.toProjectReference(message.project),
        occurredAt: message.createdAt,
      })),
    ].sort((first, second) => second.occurredAt.getTime() - first.occurredAt.getTime());
  }

  private resolveSummaryState(
    service: GrowthHubPurchasedServiceModel | null,
    config: GrowthHubConfigModel | null,
    channels: GrowthHubChannelSummary[],
    actions: GrowthHubActionItem[],
  ): GrowthHubSummaryState {
    if (service?.status !== PurchasedServiceStatus.ACTIVE) {
      return "NO_DATA";
    }

    if (!config || !this.hasMeaningfulConfig(config)) {
      return "WAITING_CONFIG";
    }

    if (actions.length > 0 || channels.some((channel) => channel.status === "RISK")) {
      return "RISK";
    }

    if (channels.some((channel) => channel.status === "SCALE")) {
      return "SCALE";
    }

    if (channels.some((channel) => channel.status === "OPTIMIZE")) {
      return "OPTIMIZE";
    }

    if (channels.length === 0 || channels.every((channel) => channel.status === "NO_DATA")) {
      return "NO_DATA";
    }

    return "READY";
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

  private isOpenTask(status: TaskStatus): boolean {
    return status !== TaskStatus.DONE && status !== TaskStatus.BLOCKED;
  }

  private isOverdueTask(task: GrowthHubTaskModel, now: Date): boolean {
    return this.isOpenTask(task.status) && task.dueDate !== null && task.dueDate < now;
  }

  private resolveFileServiceKey(file: GrowthHubFileModel): PurchasedServiceKey | null {
    return file.serviceKey ?? file.project.serviceKey;
  }

  private toProjectReference(project: {
    id: string;
    name: string;
    slug: string;
  }): { id: string; name: string; slug: string } {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
    };
  }

  private toMessageActivityTitle(message: GrowthHubMessageModel): string {
    const author = message.author.displayName ?? message.author.role;
    const preview = message.body.trim().slice(0, 80);
    return preview.length > 0 ? `${author}: ${preview}` : `${author}: Mesaj`;
  }

  private resolveLastUpdatedAt({
    growthHubService,
    config,
    activeServices,
    projects,
    tasks,
    files,
    releases,
    messages,
    channels,
  }: {
    growthHubService: GrowthHubPurchasedServiceModel | null;
    config: GrowthHubConfigModel | null;
    activeServices: GrowthHubPurchasedServiceModel[];
    projects: GrowthHubProjectModel[];
    tasks: GrowthHubTaskModel[];
    files: GrowthHubFileModel[];
    releases: GrowthHubReleaseModel[];
    messages: GrowthHubMessageModel[];
    channels: GrowthHubChannelSummary[];
  }): Date | null {
    return this.maxDate([
      growthHubService?.updatedAt,
      config?.updatedAt,
      ...activeServices.map((service) => service.updatedAt),
      ...projects.map((project) => project.updatedAt),
      ...tasks.map((task) => task.updatedAt),
      ...files.map((file) => file.updatedAt),
      ...releases.map((release) => release.updatedAt),
      ...messages.map((message) => message.createdAt),
      ...channels.map((channel) => channel.lastUpdatedAt),
    ]);
  }

  private maxDate(dates: Array<Date | null | undefined>): Date | null {
    const validDates = dates.filter((date): date is Date => date instanceof Date);
    if (validDates.length === 0) {
      return null;
    }

    return new Date(Math.max(...validDates.map((date) => date.getTime())));
  }

  private readDecimalAsNullableNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    return this.readDecimalAsNumber(value);
  }

  private readDecimalAsNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return value.toNumber();
  }

  private divide(numerator: number, denominator: number): number {
    if (denominator <= 0) {
      return 0;
    }

    return this.round(numerator / denominator);
  }

  private round(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.round(value * 100) / 100;
  }
}
