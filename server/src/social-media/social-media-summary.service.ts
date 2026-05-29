import { Injectable } from "@nestjs/common";
import {
  ClientStatus,
  MetaAdsApprovalStatus,
  Prisma,
  ProjectFileCategory,
  ProjectFileVisibility,
  ProjectStatus,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  SocialMediaConnectionStatus,
  SocialMediaGoal,
  SocialMediaPlatform,
  SocialMediaPostStatus,
  SocialMediaPostType,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export type SocialMediaSummaryState =
  | "READY"
  | "NO_DATA"
  | "WAITING_CONFIG"
  | "WAITING_CONTENT_PLAN";

const socialMediaConfigSelect = {
  instagramUsername: true,
  instagramAccountId: true,
  facebookPageId: true,
  tiktokUsername: true,
  linkedinPageUrl: true,
  contentFrequency: true,
  primaryGoal: true,
  toneOfVoice: true,
  hashtags: true,
  connectionStatus: true,
  lastSyncAt: true,
  syncError: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientSocialMediaConfigSelect;

const socialMediaProjectSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  priority: true,
  dueDate: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

const socialMediaTaskSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  dueDate: true,
  approvalRequired: true,
  approvalStatus: true,
  updatedAt: true,
  projectId: true,
} satisfies Prisma.TaskSelect;

const socialMediaFileSelect = {
  id: true,
  title: true,
  category: true,
  visibility: true,
  secureUrl: true,
  mimeType: true,
  approvalRequired: true,
  approvalStatus: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ProjectFileSelect;

const socialMediaPostSummarySelect = {
  id: true,
  platform: true,
  type: true,
  status: true,
  title: true,
  scheduledAt: true,
  publishedAt: true,
  clientVisible: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.SocialMediaPostSelect;

type SocialMediaConfigModel = Prisma.ClientSocialMediaConfigGetPayload<{
  select: typeof socialMediaConfigSelect;
}>;

type SocialMediaProjectModel = Prisma.ProjectGetPayload<{
  select: typeof socialMediaProjectSelect;
}>;

type SocialMediaTaskModel = Prisma.TaskGetPayload<{
  select: typeof socialMediaTaskSelect;
}>;

type SocialMediaFileModel = Prisma.ProjectFileGetPayload<{
  select: typeof socialMediaFileSelect;
}>;

type SocialMediaPostSummaryModel = Prisma.SocialMediaPostGetPayload<{
  select: typeof socialMediaPostSummarySelect;
}>;

type SocialMediaServiceModel = {
  status: PurchasedServiceStatus;
  startedAt: Date | null;
  updatedAt: Date;
};

type SocialMediaClientModel = {
  id: string;
  slug: string;
  companyName: string;
  status: ClientStatus;
};

type SocialMediaSummaryOptions = {
  clientVisibleOnly?: boolean;
};

export type SocialMediaConfigSummary = {
  instagramUsername: string | null;
  instagramAccountId: string | null;
  facebookPageId: string | null;
  tiktokUsername: string | null;
  linkedinPageUrl: string | null;
  contentFrequency: string | null;
  primaryGoal: SocialMediaGoal | null;
  toneOfVoice: string | null;
  hashtags: string[];
  connectionStatus: SocialMediaConnectionStatus;
  lastSyncAt: Date | null;
  notes?: string | null;
};

export type SocialMediaPostSummary = {
  id: string;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  title: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  clientVisible: boolean;
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  updatedAt: Date;
};

export type SocialMediaSummaryResponse = {
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
  config: SocialMediaConfigSummary | null;
  state: SocialMediaSummaryState;
  metrics: {
    projects: number;
    tasks: number;
    plannedPosts: number;
    publishedPosts: number;
    inDesignPosts: number;
    pendingApprovals: number;
    rejectedPosts: number;
    creativeAssets: number;
    openTodos: number;
    completedTodos: number;
  };
  contentPlan: {
    projects: Array<{
      id: string;
      name: string;
      slug: string;
      status: ProjectStatus;
      priority: string;
      dueDate: Date | null;
      updatedAt: Date;
    }>;
    upcomingPosts: SocialMediaPostSummary[];
    recentPosts: SocialMediaPostSummary[];
    topPosts: [];
  };
  creativeAssets: Array<{
    id: string;
    title: string;
    category: ProjectFileCategory;
    visibility: ProjectFileVisibility;
    secureUrl: string;
    mimeType: string;
    approvalStatus: MetaAdsApprovalStatus | null;
    project: {
      id: string;
      name: string;
    };
    updatedAt: Date;
  }>;
  meta: {
    generatedAt: Date;
    lastUpdatedAt: Date | null;
    sources: string[];
  };
};

@Injectable()
export class SocialMediaSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    clientProfileId: string,
    options: SocialMediaSummaryOptions = {},
  ): Promise<SocialMediaSummaryResponse> {
    const [client, service, config, projects] = await this.prisma.$transaction([
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
            serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
          },
        },
        select: {
          status: true,
          startedAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.clientSocialMediaConfig.findUnique({
        where: { clientProfileId },
        select: socialMediaConfigSelect,
      }),
      this.prisma.project.findMany({
        where: {
          clientProfileId,
          serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        },
        select: socialMediaProjectSelect,
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      }),
    ]);

    const projectIds = projects.map((project) => project.id);
    const [tasks, files, posts, openTodos, completedTodos] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where: { projectId: { in: projectIds } },
        select: socialMediaTaskSelect,
        orderBy: [{ updatedAt: "desc" }, { dueDate: "asc" }],
      }),
      this.prisma.projectFile.findMany({
        where: {
          clientProfileId,
          ...(options.clientVisibleOnly ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE } : {}),
          OR: [
            { serviceKey: PurchasedServiceKey.SOCIAL_MEDIA },
            { projectId: { in: projectIds } },
          ],
        },
        select: socialMediaFileSelect,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
      this.prisma.socialMediaPost.findMany({
        where: {
          clientProfileId,
          ...(options.clientVisibleOnly ? { clientVisible: true } : {}),
        },
        select: socialMediaPostSummarySelect,
        orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
        take: 24,
      }),
      this.prisma.taskTodo.count({
        where: {
          isCompleted: false,
          task: { projectId: { in: projectIds } },
        },
      }),
      this.prisma.taskTodo.count({
        where: {
          isCompleted: true,
          task: { projectId: { in: projectIds } },
        },
      }),
    ]);

    return this.buildSummary({
      client,
      service,
      config,
      projects,
      tasks,
      files,
      posts,
      openTodos,
      completedTodos,
    });
  }

  private buildSummary({
    client,
    service,
    config,
    projects,
    tasks,
    files,
    posts,
    openTodos,
    completedTodos,
  }: {
    client: SocialMediaClientModel;
    service: SocialMediaServiceModel | null;
    config: SocialMediaConfigModel | null;
    projects: SocialMediaProjectModel[];
    tasks: SocialMediaTaskModel[];
    files: SocialMediaFileModel[];
    posts: SocialMediaPostSummaryModel[];
    openTodos: number;
    completedTodos: number;
  }): SocialMediaSummaryResponse {
    const hasActiveService = service?.status === PurchasedServiceStatus.ACTIVE;
    const pendingApprovals =
      this.countPendingApprovals(tasks, files) +
      posts.filter((post) => post.status === SocialMediaPostStatus.WAITING_APPROVAL).length;
    const rejectedPosts = posts.filter(
      (post) =>
        post.status === SocialMediaPostStatus.REJECTED ||
        post.status === SocialMediaPostStatus.REVISION_REQUIRED,
    ).length;
    const state = this.resolveState(hasActiveService, config, projects, posts);
    const lastUpdatedAt = this.resolveLastUpdatedAt(service, config, projects, tasks, files, posts);
    const now = new Date();
    const upcomingPosts = posts
      .filter(
        (post) =>
          post.scheduledAt &&
          post.scheduledAt >= now &&
          post.status !== SocialMediaPostStatus.PUBLISHED &&
          post.status !== SocialMediaPostStatus.CANCELLED,
      )
      .slice(0, 6)
      .map((post) => this.toPostSummary(post));
    const recentPosts = posts
      .filter((post) => post.status === SocialMediaPostStatus.PUBLISHED || post.publishedAt)
      .sort((a, b) => this.resolvePostActivityTime(b) - this.resolvePostActivityTime(a))
      .slice(0, 6)
      .map((post) => this.toPostSummary(post));

    return {
      client: {
        id: client.id,
        name: client.companyName,
        slug: client.slug,
        status: client.status,
      },
      service: {
        hasActiveService,
        status: service?.status ?? null,
        startedAt: service?.startedAt ?? null,
        updatedAt: service?.updatedAt ?? null,
      },
      config: config ? this.toConfigSummary(config) : null,
      state,
      metrics: {
        projects: projects.length,
        tasks: tasks.length,
        plannedPosts: posts.filter(
          (post) =>
            post.status !== SocialMediaPostStatus.PUBLISHED &&
            post.status !== SocialMediaPostStatus.CANCELLED,
        ).length,
        publishedPosts: posts.filter((post) => post.status === SocialMediaPostStatus.PUBLISHED)
          .length,
        inDesignPosts: posts.filter((post) => post.status === SocialMediaPostStatus.DESIGN).length,
        pendingApprovals,
        rejectedPosts,
        creativeAssets: files.length,
        openTodos,
        completedTodos,
      },
      contentPlan: {
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          status: project.status,
          priority: project.priority,
          dueDate: project.dueDate,
          updatedAt: project.updatedAt,
        })),
        upcomingPosts,
        recentPosts,
        topPosts: [],
      },
      creativeAssets: files.slice(0, 6).map((file) => ({
        id: file.id,
        title: file.title,
        category: file.category,
        visibility: file.visibility,
        secureUrl: file.secureUrl,
        mimeType: file.mimeType,
        approvalStatus: file.approvalStatus,
        project: {
          id: file.project.id,
          name: file.project.name,
        },
        updatedAt: file.updatedAt,
      })),
      meta: {
        generatedAt: new Date(),
        lastUpdatedAt,
        sources: [
          "ClientPurchasedService",
          "ClientSocialMediaConfig",
          "Project",
          "Task",
          "TaskTodo",
          "ProjectFile",
          "SocialMediaPost",
        ],
      },
    };
  }

  private toConfigSummary(config: SocialMediaConfigModel): SocialMediaConfigSummary {
    return {
      instagramUsername: config.instagramUsername,
      instagramAccountId: config.instagramAccountId,
      facebookPageId: config.facebookPageId,
      tiktokUsername: config.tiktokUsername,
      linkedinPageUrl: config.linkedinPageUrl,
      contentFrequency: config.contentFrequency,
      primaryGoal: config.primaryGoal,
      toneOfVoice: config.toneOfVoice,
      hashtags: config.hashtags,
      connectionStatus: config.connectionStatus,
      lastSyncAt: config.lastSyncAt,
      notes: config.notes,
    };
  }

  private resolveState(
    hasActiveService: boolean,
    config: SocialMediaConfigModel | null,
    projects: SocialMediaProjectModel[],
    posts: SocialMediaPostSummaryModel[],
  ): SocialMediaSummaryState {
    if (!hasActiveService) {
      return "NO_DATA";
    }

    if (!config || !this.hasMeaningfulConfig(config)) {
      return "WAITING_CONFIG";
    }

    if (projects.length === 0 && posts.length === 0) {
      return "WAITING_CONTENT_PLAN";
    }

    return "READY";
  }

  private hasMeaningfulConfig(config: SocialMediaConfigModel): boolean {
    return [
      config.instagramUsername,
      config.instagramAccountId,
      config.facebookPageId,
      config.tiktokUsername,
      config.linkedinPageUrl,
      config.contentFrequency,
      config.primaryGoal,
      config.toneOfVoice,
      config.notes,
    ].some((value) => Boolean(value)) || config.hashtags.length > 0;
  }

  private countPendingApprovals(
    tasks: SocialMediaTaskModel[],
    files: SocialMediaFileModel[],
  ): number {
    const pendingTaskApprovals = tasks.filter(
      (task) =>
        task.approvalRequired &&
        (task.approvalStatus === null || task.approvalStatus === MetaAdsApprovalStatus.PENDING),
    ).length;
    const pendingFileApprovals = files.filter(
      (file) =>
        file.approvalRequired &&
        (file.approvalStatus === null || file.approvalStatus === MetaAdsApprovalStatus.PENDING),
    ).length;

    return pendingTaskApprovals + pendingFileApprovals;
  }

  private resolveLastUpdatedAt(
    service: SocialMediaServiceModel | null,
    config: SocialMediaConfigModel | null,
    projects: SocialMediaProjectModel[],
    tasks: SocialMediaTaskModel[],
    files: SocialMediaFileModel[],
    posts: SocialMediaPostSummaryModel[],
  ): Date | null {
    const dates = [
      service?.updatedAt,
      config?.updatedAt,
      ...projects.map((project) => project.updatedAt),
      ...tasks.map((task) => task.updatedAt),
      ...files.map((file) => file.updatedAt),
      ...posts.map((post) => post.updatedAt),
    ].filter((date): date is Date => date instanceof Date);

    if (dates.length === 0) {
      return null;
    }

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }

  private toPostSummary(post: SocialMediaPostSummaryModel): SocialMediaPostSummary {
    return {
      id: post.id,
      platform: post.platform,
      type: post.type,
      status: post.status,
      title: post.title,
      scheduledAt: post.scheduledAt,
      publishedAt: post.publishedAt,
      clientVisible: post.clientVisible,
      project: post.project,
      updatedAt: post.updatedAt,
    };
  }

  private resolvePostActivityTime(post: SocialMediaPostSummaryModel): number {
    return (post.publishedAt ?? post.scheduledAt ?? post.updatedAt).getTime();
  }
}
