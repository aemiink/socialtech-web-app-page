import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  Priority,
  Prisma,
  ProjectFileVisibility,
  SocialMediaReportStatus,
  SocialMediaReportType,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  SocialMediaConnectionStatus,
  SocialMediaPlatform,
  SocialMediaPostStatus,
  SocialMediaPostType,
  TaskStatus,
  TaskType,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { AttachSocialMediaPostAssetDto } from "./dto/attach-social-media-post-asset.dto";
import { CreateSocialMediaPostInsightDto } from "./dto/create-social-media-post-insight.dto";
import { CreateSocialMediaReportDto } from "./dto/create-social-media-report.dto";
import { CreateSocialMediaPostDto } from "./dto/create-social-media-post.dto";
import { MarkSocialMediaPostPublishedDto } from "./dto/mark-social-media-post-published.dto";
import { ScheduleSocialMediaPostDto } from "./dto/schedule-social-media-post.dto";
import { SocialMediaInsightsQueryDto } from "./dto/social-media-insights-query.dto";
import { SocialMediaPostQueryDto } from "./dto/social-media-post-query.dto";
import { SocialMediaReportsQueryDto } from "./dto/social-media-reports-query.dto";
import { UpdateSocialMediaConfigDto } from "./dto/update-social-media-config.dto";
import { UpdateSocialMediaPostDto } from "./dto/update-social-media-post.dto";
import { UpdateSocialMediaReportDto } from "./dto/update-social-media-report.dto";
import {
  SocialMediaSummaryResponse,
  SocialMediaSummaryService,
} from "./social-media-summary.service";

const SOCIAL_MEDIA_CONFIG_READ_ANY_PERMISSION = "socialMedia.config.read.any";
const SOCIAL_MEDIA_CONFIG_MANAGE_ANY_PERMISSION = "socialMedia.config.manage.any";
const SOCIAL_MEDIA_CONFIG_READ_ASSIGNED_PERMISSION = "socialMedia.config.read.assigned";
const SOCIAL_MEDIA_CONFIG_READ_OWN_PERMISSION = "socialMedia.config.read.own";
const SOCIAL_MEDIA_SUMMARY_READ_ANY_PERMISSION = "socialMedia.summary.read.any";
const SOCIAL_MEDIA_SUMMARY_READ_ASSIGNED_PERMISSION = "socialMedia.summary.read.assigned";
const SOCIAL_MEDIA_SUMMARY_READ_OWN_PERMISSION = "socialMedia.summary.read.own";
const SOCIAL_MEDIA_POSTS_READ_ANY_PERMISSION = "socialMedia.posts.read.any";
const SOCIAL_MEDIA_POSTS_MANAGE_ANY_PERMISSION = "socialMedia.posts.manage.any";
const SOCIAL_MEDIA_POSTS_READ_ASSIGNED_PERMISSION = "socialMedia.posts.read.assigned";
const SOCIAL_MEDIA_POSTS_MANAGE_ASSIGNED_PERMISSION = "socialMedia.posts.manage.assigned";
const SOCIAL_MEDIA_POSTS_ASSETS_MANAGE_ASSIGNED_PERMISSION =
  "socialMedia.posts.assets.manage.assigned";
const SOCIAL_MEDIA_CREATIVES_MANAGE_ASSIGNED_PERMISSION =
  "socialMedia.creatives.manage.assigned";
const SOCIAL_MEDIA_POSTS_READ_OWN_PERMISSION = "socialMedia.posts.read.own";
const SOCIAL_MEDIA_REPORTS_MANAGE_ASSIGNED_PERMISSION =
  "socialMedia.reports.manage.assigned";
const REPORTS_READ_PERMISSION = "reports.read";
const REPORTS_MANAGE_PERMISSION = "reports.manage";
const REPORTS_READ_OWN_PERMISSION = "reports.read.own";
const SOCIAL_MEDIA_ADMIN_RELEVANT_ASSIGNMENT_SCOPES = [
  EmployeeClientAssignmentScope.SOCIAL_MEDIA,
  EmployeeClientAssignmentScope.DESIGN,
] as const;

const allowedPostStatusTransitions: Record<
  SocialMediaPostStatus,
  readonly SocialMediaPostStatus[]
> = {
  IDEA: [SocialMediaPostStatus.DRAFT, SocialMediaPostStatus.CANCELLED],
  DRAFT: [
    SocialMediaPostStatus.DESIGN,
    SocialMediaPostStatus.WAITING_APPROVAL,
    SocialMediaPostStatus.CANCELLED,
  ],
  DESIGN: [
    SocialMediaPostStatus.WAITING_APPROVAL,
    SocialMediaPostStatus.REVISION_REQUIRED,
    SocialMediaPostStatus.CANCELLED,
  ],
  WAITING_APPROVAL: [
    SocialMediaPostStatus.APPROVED,
    SocialMediaPostStatus.REJECTED,
    SocialMediaPostStatus.REVISION_REQUIRED,
    SocialMediaPostStatus.CANCELLED,
  ],
  APPROVED: [
    SocialMediaPostStatus.SCHEDULED,
    SocialMediaPostStatus.PUBLISHED,
    SocialMediaPostStatus.CANCELLED,
  ],
  SCHEDULED: [SocialMediaPostStatus.PUBLISHED, SocialMediaPostStatus.CANCELLED],
  PUBLISHED: [],
  REJECTED: [SocialMediaPostStatus.REVISION_REQUIRED, SocialMediaPostStatus.CANCELLED],
  REVISION_REQUIRED: [
    SocialMediaPostStatus.DESIGN,
    SocialMediaPostStatus.WAITING_APPROVAL,
    SocialMediaPostStatus.CANCELLED,
  ],
  CANCELLED: [],
};

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

const socialMediaUserSelect = {
  id: true,
  displayName: true,
  role: true,
} satisfies Prisma.UserSelect;

const socialMediaPostSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  platform: true,
  type: true,
  status: true,
  title: true,
  caption: true,
  scheduledAt: true,
  publishedAt: true,
  clientVisible: true,
  approvalTaskId: true,
  createdByUserId: true,
  assignedToUserId: true,
  externalPostId: true,
  externalPostUrl: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  approvalTask: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
    },
  },
  createdBy: {
    select: socialMediaUserSelect,
  },
  assignedTo: {
    select: socialMediaUserSelect,
  },
  assets: {
    select: {
      id: true,
      sortOrder: true,
      createdAt: true,
      file: {
        select: {
          id: true,
          projectId: true,
          title: true,
          secureUrl: true,
          mimeType: true,
          category: true,
          visibility: true,
          serviceKey: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.SocialMediaPostSelect;

const socialMediaPostInsightSelect = {
  id: true,
  postId: true,
  clientProfileId: true,
  platform: true,
  date: true,
  impressions: true,
  reach: true,
  likes: true,
  comments: true,
  shares: true,
  saves: true,
  profileVisits: true,
  follows: true,
  clicks: true,
  engagementRate: true,
  raw: true,
  createdAt: true,
  updatedAt: true,
  post: {
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      scheduledAt: true,
      publishedAt: true,
      externalPostUrl: true,
      clientVisible: true,
    },
  },
} satisfies Prisma.SocialMediaPostInsightSelect;

const socialMediaReportSelect = {
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
  acknowledgementTaskId: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  acknowledgementTask: {
    select: {
      id: true,
      approvalStatus: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.SocialMediaReportSelect;

const adminSocialMediaClientSelect = {
  id: true,
  slug: true,
  companyName: true,
  status: true,
  purchasedServices: {
    where: { serviceKey: PurchasedServiceKey.SOCIAL_MEDIA },
    select: {
      status: true,
      startedAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 1,
  },
  projects: {
    where: { serviceKey: PurchasedServiceKey.SOCIAL_MEDIA },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 1,
  },
  employeeAssignments: {
    where: {
      isActive: true,
      scope: { in: [...SOCIAL_MEDIA_ADMIN_RELEVANT_ASSIGNMENT_SCOPES] },
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
    orderBy: [{ scope: "asc" }, { employeeUser: { displayName: "asc" } }],
  },
} satisfies Prisma.ClientProfileSelect;

type SocialMediaConfigModel = Prisma.ClientSocialMediaConfigGetPayload<{
  select: typeof socialMediaConfigSelect;
}>;

type SocialMediaPostModel = Prisma.SocialMediaPostGetPayload<{
  select: typeof socialMediaPostSelect;
}>;

type SocialMediaPostInsightModel = Prisma.SocialMediaPostInsightGetPayload<{
  select: typeof socialMediaPostInsightSelect;
}>;

type SocialMediaReportModel = Prisma.SocialMediaReportGetPayload<{
  select: typeof socialMediaReportSelect;
}>;

type AdminSocialMediaClientModel = Prisma.ClientProfileGetPayload<{
  select: typeof adminSocialMediaClientSelect;
}>;

type SocialMediaConfigPatchData = {
  instagramUsername?: string | null;
  instagramAccountId?: string | null;
  facebookPageId?: string | null;
  tiktokUsername?: string | null;
  linkedinPageUrl?: string | null;
  contentFrequency?: string | null;
  primaryGoal?: NonNullable<UpdateSocialMediaConfigDto["primaryGoal"]> | null;
  toneOfVoice?: string | null;
  hashtags?: string[];
  connectionStatus?: SocialMediaConnectionStatus;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  notes?: string | null;
};

type NormalizedCreatePostPayload = {
  projectId: string | null;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  title: string;
  caption: string | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  clientVisible: boolean;
  approvalTaskId: string | null;
  assignedToUserId: string | null;
  externalPostId: string | null;
  externalPostUrl: string | null;
};

type NormalizedUpdatePostPayload = {
  projectId?: string | null;
  platform?: SocialMediaPlatform;
  type?: SocialMediaPostType;
  status?: SocialMediaPostStatus;
  title?: string;
  caption?: string | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  clientVisible?: boolean;
  approvalTaskId?: string | null;
  assignedToUserId?: string | null;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
};

type AdminSocialMediaConfigResponse = {
  clientProfileId: string;
  hasActiveService: boolean;
  instagramUsername: string | null;
  instagramAccountId: string | null;
  facebookPageId: string | null;
  tiktokUsername: string | null;
  linkedinPageUrl: string | null;
  contentFrequency: string | null;
  primaryGoal: UpdateSocialMediaConfigDto["primaryGoal"] | null;
  toneOfVoice: string | null;
  hashtags: string[];
  connectionStatus: SocialMediaConnectionStatus;
  lastSyncAt: Date | null;
  syncError: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type OwnSocialMediaConfigResponse = Omit<
  AdminSocialMediaConfigResponse,
  "hasActiveService" | "syncError" | "createdAt" | "updatedAt"
>;

type AdminSocialMediaRiskStatus = "READY" | "ATTENTION" | "BLOCKED";

type AdminSocialMediaAssignedEmployee = {
  userId: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  scope: EmployeeClientAssignmentScope;
};

type AdminSocialMediaClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: AdminSocialMediaClientModel["status"];
  };
  serviceStatus: PurchasedServiceStatus;
  service: SocialMediaSummaryResponse["service"];
  config: SocialMediaSummaryResponse["config"];
  state: SocialMediaSummaryResponse["state"];
  metrics: SocialMediaSummaryResponse["metrics"] & {
    overdueScheduledPosts: number;
  };
  contentPlan: SocialMediaSummaryResponse["contentPlan"];
  creativeAssets: SocialMediaSummaryResponse["creativeAssets"];
  assignedEmployees: AdminSocialMediaAssignedEmployee[];
  assignedSocialMediaSpecialists: AdminSocialMediaAssignedEmployee[];
  assignedDesigners: AdminSocialMediaAssignedEmployee[];
  risk: {
    status: AdminSocialMediaRiskStatus;
    reasons: string[];
  };
  lastReport: null;
  actionContext: {
    socialMediaProjectId: string | null;
  };
  meta: {
    generatedAt: Date;
    lastUpdatedAt: Date | null;
  };
};

type AdminSocialMediaClientsResponse = {
  data: AdminSocialMediaClientListItem[];
  meta: {
    total: number;
    ready: number;
    attention: number;
    blocked: number;
    overdueScheduledPosts: number;
    pendingApprovals: number;
    generatedAt: Date;
  };
};

@Injectable()
export class SocialMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly summaryService: SocialMediaSummaryService,
  ) {}

  async getAdminClients(
    currentUser: AuthenticatedUser,
  ): Promise<AdminSocialMediaClientsResponse> {
    this.assertCanReadAdminOverview(currentUser);

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
            status: PurchasedServiceStatus.ACTIVE,
          },
        },
      },
      select: adminSocialMediaClientSelect,
      orderBy: { companyName: "asc" },
    });
    const clientProfileIds = clients.map((client) => client.id);

    if (clientProfileIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          ready: 0,
          attention: 0,
          blocked: 0,
          overdueScheduledPosts: 0,
          pendingApprovals: 0,
          generatedAt: new Date(),
        },
      };
    }

    const [summaries, overdueScheduledPostGroups] = await Promise.all([
      Promise.all(clientProfileIds.map((clientProfileId) => this.summaryService.getSummary(clientProfileId))),
      this.prisma.socialMediaPost.groupBy({
        by: ["clientProfileId"],
        where: {
          clientProfileId: { in: clientProfileIds },
          status: SocialMediaPostStatus.SCHEDULED,
          scheduledAt: { lt: new Date() },
        },
        _count: { _all: true },
      }),
    ]);
    const summariesByClient = new Map(summaries.map((summary) => [summary.client.id, summary]));
    const overdueScheduledPostsByClient = new Map(
      overdueScheduledPostGroups.map((group) => [group.clientProfileId, group._count._all]),
    );
    const items = clients
      .map((client) => {
        const summary = summariesByClient.get(client.id);
        if (!summary) {
          return null;
        }

        return this.toAdminClientListItem(
          client,
          summary,
          overdueScheduledPostsByClient.get(client.id) ?? 0,
        );
      })
      .filter((item): item is AdminSocialMediaClientListItem => item !== null);

    return {
      data: items,
      meta: {
        total: items.length,
        ready: items.filter((item) => item.risk.status === "READY").length,
        attention: items.filter((item) => item.risk.status === "ATTENTION").length,
        blocked: items.filter((item) => item.risk.status === "BLOCKED").length,
        overdueScheduledPosts: items.reduce(
          (sum, item) => sum + item.metrics.overdueScheduledPosts,
          0,
        ),
        pendingApprovals: items.reduce(
          (sum, item) => sum + item.metrics.pendingApprovals,
          0,
        ),
        generatedAt: new Date(),
      },
    };
  }

  async getClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<AdminSocialMediaConfigResponse> {
    await this.assertCanReadConfig(currentUser, clientProfileId);

    const [config, hasActiveService] = await Promise.all([
      this.prisma.clientSocialMediaConfig.findUnique({
        where: { clientProfileId },
        select: socialMediaConfigSelect,
      }),
      this.hasActiveSocialMediaService(clientProfileId),
    ]);

    return this.toAdminConfigResponse(clientProfileId, config, hasActiveService);
  }

  async updateClientConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: UpdateSocialMediaConfigDto,
  ): Promise<AdminSocialMediaConfigResponse> {
    this.assertCanManageConfig(currentUser);
    this.assertHasConfigUpdatePayload(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    const patchData = this.buildConfigPatchData(dto);
    const config = await this.prisma.clientSocialMediaConfig.upsert({
      where: { clientProfileId },
      update: patchData,
      create: {
        clientProfileId,
        ...patchData,
      },
      select: socialMediaConfigSelect,
    });

    return this.toAdminConfigResponse(clientProfileId, config, true);
  }

  async getClientSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<SocialMediaSummaryResponse> {
    await this.assertCanReadSummary(currentUser, clientProfileId);
    return this.summaryService.getSummary(clientProfileId);
  }

  async getClientPosts(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: SocialMediaPostQueryDto,
  ): Promise<SocialMediaPostModel[]> {
    await this.assertCanReadPosts(currentUser, clientProfileId);

    return this.findPosts(clientProfileId, query, false);
  }

  async createClientPost(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateSocialMediaPostDto,
  ): Promise<SocialMediaPostModel> {
    this.assertBodyObject(dto);
    await this.assertCanManagePosts(currentUser, clientProfileId);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    const payload = this.normalizeCreatePostPayload(dto);
    await this.assertPostReferencesAreValid(clientProfileId, payload);

    return this.prisma.socialMediaPost.create({
      data: {
        clientProfileId,
        projectId: payload.projectId,
        platform: payload.platform,
        type: payload.type,
        status: payload.status,
        title: payload.title,
        caption: payload.caption,
        scheduledAt: payload.scheduledAt,
        publishedAt: payload.publishedAt,
        clientVisible: payload.clientVisible,
        approvalTaskId: payload.approvalTaskId,
        createdByUserId: currentUser.id,
        assignedToUserId: payload.assignedToUserId,
        externalPostId: payload.externalPostId,
        externalPostUrl: payload.externalPostUrl,
      },
      select: socialMediaPostSelect,
    });
  }

  async getPostById(
    currentUser: AuthenticatedUser,
    postId: string,
  ): Promise<SocialMediaPostModel> {
    const post = await this.getPostOrNotFound(postId);
    await this.assertCanReadPosts(currentUser, post.clientProfileId);
    return post;
  }

  async updatePost(
    currentUser: AuthenticatedUser,
    postId: string,
    dto: UpdateSocialMediaPostDto,
  ): Promise<SocialMediaPostModel> {
    this.assertBodyObject(dto);
    this.assertHasPostUpdatePayload(dto);

    const existingPost = await this.getPostOrNotFound(postId);
    await this.assertCanManagePosts(currentUser, existingPost.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingPost.clientProfileId);

    const payload = this.normalizeUpdatePostPayload(dto);
    await this.assertPostReferencesAreValid(existingPost.clientProfileId, payload);
    this.assertPostStatusTransition(existingPost.status, payload.status);
    this.assertPostTimingIsValid(existingPost, payload);

    const data = this.buildPostUpdateData(existingPost, payload);
    return this.prisma.socialMediaPost.update({
      where: { id: postId },
      data,
      select: socialMediaPostSelect,
    });
  }

  async schedulePost(
    currentUser: AuthenticatedUser,
    postId: string,
    dto: ScheduleSocialMediaPostDto,
  ): Promise<SocialMediaPostModel> {
    this.assertBodyObject(dto);

    const existingPost = await this.getPostOrNotFound(postId);
    await this.assertCanManagePosts(currentUser, existingPost.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingPost.clientProfileId);

    if (existingPost.status !== SocialMediaPostStatus.APPROVED) {
      throw new BadRequestException("Only APPROVED Social Media posts can be scheduled.");
    }

    const scheduledAt = this.parseNullableDate(dto.scheduledAt, "scheduledAt");
    if (!scheduledAt) {
      throw new BadRequestException("scheduledAt is required when scheduling a post.");
    }

    const data: Prisma.SocialMediaPostUncheckedUpdateInput = {
      status: SocialMediaPostStatus.SCHEDULED,
      scheduledAt,
    };
    this.assignIfDefined(data, "clientVisible", this.parseOptionalBoolean(dto.clientVisible));

    return this.prisma.socialMediaPost.update({
      where: { id: postId },
      data,
      select: socialMediaPostSelect,
    });
  }

  async markPostPublished(
    currentUser: AuthenticatedUser,
    postId: string,
    dto: MarkSocialMediaPostPublishedDto,
  ): Promise<SocialMediaPostModel> {
    this.assertBodyObject(dto);

    const existingPost = await this.getPostOrNotFound(postId);
    await this.assertCanManagePosts(currentUser, existingPost.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingPost.clientProfileId);

    if (
      existingPost.status !== SocialMediaPostStatus.APPROVED &&
      existingPost.status !== SocialMediaPostStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        "Only APPROVED or SCHEDULED Social Media posts can be marked as published.",
      );
    }

    const publishedAt = this.parseNullableDate(dto.publishedAt, "publishedAt");
    if (!publishedAt) {
      throw new BadRequestException("publishedAt is required when marking a post as published.");
    }

    const data: Prisma.SocialMediaPostUncheckedUpdateInput = {
      status: SocialMediaPostStatus.PUBLISHED,
      publishedAt,
      clientVisible: true,
    };
    this.assignIfDefined(
      data,
      "externalPostUrl",
      this.normalizeNullableText(dto.externalPostUrl, "externalPostUrl", 500),
    );
    this.assignIfDefined(
      data,
      "externalPostId",
      this.normalizeNullableText(dto.externalPostId, "externalPostId", 180),
    );

    return this.prisma.socialMediaPost.update({
      where: { id: postId },
      data,
      select: socialMediaPostSelect,
    });
  }

  async cancelPost(
    currentUser: AuthenticatedUser,
    postId: string,
  ): Promise<SocialMediaPostModel> {
    const existingPost = await this.getPostOrNotFound(postId);
    await this.assertCanManagePosts(currentUser, existingPost.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingPost.clientProfileId);

    if (
      existingPost.status === SocialMediaPostStatus.PUBLISHED ||
      existingPost.status === SocialMediaPostStatus.CANCELLED
    ) {
      throw new BadRequestException("Published or already cancelled Social Media posts cannot be cancelled.");
    }

    return this.prisma.socialMediaPost.update({
      where: { id: postId },
      data: { status: SocialMediaPostStatus.CANCELLED },
      select: socialMediaPostSelect,
    });
  }

  async deletePost(
    currentUser: AuthenticatedUser,
    postId: string,
  ): Promise<{ id: string; deleted: true }> {
    const post = await this.getPostOrNotFound(postId);
    await this.assertCanManagePosts(currentUser, post.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(post.clientProfileId);

    await this.prisma.socialMediaPost.delete({ where: { id: postId } });
    return { id: postId, deleted: true };
  }

  async attachPostAsset(
    currentUser: AuthenticatedUser,
    postId: string,
    dto: AttachSocialMediaPostAssetDto,
  ): Promise<SocialMediaPostModel> {
    this.assertBodyObject(dto);
    const post = await this.getPostOrNotFound(postId);
    await this.assertCanManagePostAssets(currentUser, post.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(post.clientProfileId);

    const fileId = this.normalizeRequiredUuid(dto.fileId, "fileId");
    const sortOrder = this.normalizeSortOrder(dto.sortOrder);
    await this.assertFileCanBeAttachedToPost(post, fileId);

    await this.prisma.socialMediaPostAsset.upsert({
      where: {
        postId_fileId: {
          postId,
          fileId,
        },
      },
      update: { sortOrder },
      create: {
        postId,
        fileId,
        sortOrder,
      },
    });

    return this.getPostById(currentUser, postId);
  }

  async deletePostAsset(
    currentUser: AuthenticatedUser,
    postId: string,
    assetId: string,
  ): Promise<SocialMediaPostModel> {
    const post = await this.getPostOrNotFound(postId);
    await this.assertCanManagePostAssets(currentUser, post.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(post.clientProfileId);

    const result = await this.prisma.socialMediaPostAsset.deleteMany({
      where: {
        id: assetId,
        postId,
      },
    });
    if (result.count !== 1) {
      throw new NotFoundException("Social Media post asset not found.");
    }

    return this.getPostById(currentUser, postId);
  }

  async getOwnConfig(currentUser: AuthenticatedUser): Promise<OwnSocialMediaConfigResponse> {
    this.assertCanReadOwnConfig(currentUser);
    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    const config = await this.prisma.clientSocialMediaConfig.findUnique({
      where: { clientProfileId },
      select: socialMediaConfigSelect,
    });

    return this.toOwnConfigResponse(clientProfileId, config);
  }

  async getOwnSummary(currentUser: AuthenticatedUser): Promise<SocialMediaSummaryResponse> {
    this.assertCanReadOwnSummary(currentUser);
    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.summaryService.getSummary(clientProfileId, { clientVisibleOnly: true });
  }

  async getOwnPosts(currentUser: AuthenticatedUser, query: SocialMediaPostQueryDto) {
    this.assertCanReadOwnPosts(currentUser);
    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    const posts = await this.findPosts(clientProfileId, query, true);
    return posts.map((post) => this.toOwnPostResponse(post));
  }

  async getOwnPostById(currentUser: AuthenticatedUser, postId: string) {
    this.assertCanReadOwnPosts(currentUser);
    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    const post = await this.prisma.socialMediaPost.findFirst({
      where: {
        id: postId,
        clientProfileId,
        clientVisible: true,
      },
      select: socialMediaPostSelect,
    });
    if (!post) {
      throw new NotFoundException("Social Media post not found.");
    }

    return this.toOwnPostResponse(post);
  }

  async getOwnCalendar(currentUser: AuthenticatedUser, query: SocialMediaPostQueryDto) {
    const posts = await this.getOwnPosts(currentUser, query);
    return {
      posts,
      meta: {
        generatedAt: new Date(),
        from: this.normalizeOptionalText(query.from) ?? null,
        to: this.normalizeOptionalText(query.to) ?? null,
      },
    };
  }

  async createPostInsight(
    currentUser: AuthenticatedUser,
    postId: string,
    dto: CreateSocialMediaPostInsightDto,
  ) {
    this.assertBodyObject(dto);

    const post = await this.getPostOrNotFound(postId);
    await this.assertCanManageInsights(currentUser, post.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(post.clientProfileId);

    const insight = await this.prisma.socialMediaPostInsight.create({
      data: {
        postId,
        clientProfileId: post.clientProfileId,
        platform: post.platform,
        date: this.parseRequiredDate(dto.date, "date"),
        impressions: this.normalizeOptionalMetric(dto.impressions, "impressions"),
        reach: this.normalizeOptionalMetric(dto.reach, "reach"),
        likes: this.normalizeOptionalMetric(dto.likes, "likes"),
        comments: this.normalizeOptionalMetric(dto.comments, "comments"),
        shares: this.normalizeOptionalMetric(dto.shares, "shares"),
        saves: this.normalizeOptionalMetric(dto.saves, "saves"),
        profileVisits: this.normalizeOptionalMetric(dto.profileVisits, "profileVisits"),
        follows: this.normalizeOptionalMetric(dto.follows, "follows"),
        clicks: this.normalizeOptionalMetric(dto.clicks, "clicks"),
        engagementRate: this.normalizeOptionalDecimal(dto.engagementRate, "engagementRate"),
        raw: dto.raw as Prisma.InputJsonValue | undefined,
      },
      select: socialMediaPostInsightSelect,
    });

    return this.toInsightItem(insight);
  }

  async getClientInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: SocialMediaInsightsQueryDto,
  ) {
    await this.assertCanReadInsights(currentUser, clientProfileId);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query, { clientVisibleOnly: false });
  }

  async getOwnInsights(currentUser: AuthenticatedUser, query: SocialMediaInsightsQueryDto) {
    this.assertCanReadOwnPosts(currentUser);
    if (!this.hasPermission(currentUser, REPORTS_READ_OWN_PERMISSION)) {
      throw new ForbiddenException("Missing required report permission.");
    }

    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.getInsightsByClientProfileId(clientProfileId, query, { clientVisibleOnly: true });
  }

  async getClientReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    query: SocialMediaReportsQueryDto,
  ) {
    await this.assertCanReadReports(currentUser, clientProfileId);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, { onlyPublished: false });
  }

  async createClientReport(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateSocialMediaReportDto,
  ) {
    this.assertBodyObject(dto);
    await this.assertCanManageReports(currentUser, clientProfileId);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.createReportByClientProfileId(currentUser, clientProfileId, dto);
  }

  async updateReport(
    currentUser: AuthenticatedUser,
    reportId: string,
    dto: UpdateSocialMediaReportDto,
  ) {
    this.assertBodyObject(dto);
    this.assertHasReportUpdatePayload(dto);

    const existingReport = await this.prisma.socialMediaReport.findUnique({
      where: { id: reportId },
      select: socialMediaReportSelect,
    });
    if (!existingReport) {
      throw new NotFoundException("Social Media report not found.");
    }

    await this.assertCanManageReports(currentUser, existingReport.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingReport.clientProfileId);

    return this.updateReportModel(currentUser, existingReport, dto);
  }

  async publishReport(currentUser: AuthenticatedUser, reportId: string) {
    const existingReport = await this.prisma.socialMediaReport.findUnique({
      where: { id: reportId },
      select: socialMediaReportSelect,
    });
    if (!existingReport) {
      throw new NotFoundException("Social Media report not found.");
    }

    await this.assertCanManageReports(currentUser, existingReport.clientProfileId);
    await this.assertClientHasActiveSocialMediaService(existingReport.clientProfileId);

    return this.updateReportModel(currentUser, existingReport, {
      status: SocialMediaReportStatus.PUBLISHED,
      clientVisible: true,
    });
  }

  async getOwnReports(currentUser: AuthenticatedUser, query: SocialMediaReportsQueryDto) {
    if (
      currentUser.accountType !== AccountType.CLIENT ||
      !this.hasPermission(currentUser, REPORTS_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required report permission.");
    }

    const clientProfileId = this.getOwnClientProfileIdOrFail(currentUser);
    await this.assertClientHasActiveSocialMediaService(clientProfileId);

    return this.getReportsByClientProfileId(clientProfileId, query, { onlyPublished: true });
  }

  private async getInsightsByClientProfileId(
    clientProfileId: string,
    query: SocialMediaInsightsQueryDto,
    options: { clientVisibleOnly: boolean },
  ) {
    const { page, limit } = this.normalizePagination(query);
    const where = this.buildInsightWhere(clientProfileId, query, options);
    const [insights, total, allInsights] = await this.prisma.$transaction([
      this.prisma.socialMediaPostInsight.findMany({
        where,
        select: socialMediaPostInsightSelect,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.socialMediaPostInsight.count({ where }),
      this.prisma.socialMediaPostInsight.findMany({
        where,
        select: socialMediaPostInsightSelect,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 500,
      }),
    ]);

    return {
      data: insights.map((insight) => this.toInsightItem(insight)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        generatedAt: new Date().toISOString(),
        ...this.buildInsightsSummary(allInsights),
      },
    };
  }

  private buildInsightWhere(
    clientProfileId: string,
    query: SocialMediaInsightsQueryDto,
    options: { clientVisibleOnly: boolean },
  ): Prisma.SocialMediaPostInsightWhereInput {
    const date = this.buildScheduledAtWhere(query.from, query.to);
    return {
      clientProfileId,
      ...(query.postId ? { postId: query.postId } : {}),
      ...(query.platform ? { platform: query.platform } : {}),
      ...(date ? { date } : {}),
      ...(options.clientVisibleOnly
        ? {
            post: {
              clientVisible: true,
            },
          }
        : {}),
    };
  }

  private buildInsightsSummary(insights: SocialMediaPostInsightModel[]) {
    const totals = insights.reduce(
      (accumulator, insight) => ({
        impressions: accumulator.impressions + (insight.impressions ?? 0),
        reach: accumulator.reach + (insight.reach ?? 0),
        likes: accumulator.likes + (insight.likes ?? 0),
        comments: accumulator.comments + (insight.comments ?? 0),
        shares: accumulator.shares + (insight.shares ?? 0),
        saves: accumulator.saves + (insight.saves ?? 0),
        profileVisits: accumulator.profileVisits + (insight.profileVisits ?? 0),
        follows: accumulator.follows + (insight.follows ?? 0),
        clicks: accumulator.clicks + (insight.clicks ?? 0),
      }),
      {
        impressions: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        profileVisits: 0,
        follows: 0,
        clicks: 0,
      },
    );
    const engagementActions =
      totals.likes + totals.comments + totals.shares + totals.saves + totals.clicks;
    const engagementRate = totals.reach > 0 ? this.round((engagementActions / totals.reach) * 100) : 0;

    const topPosts = [...insights]
      .sort((first, second) => this.getInsightScore(second) - this.getInsightScore(first))
      .slice(0, 5)
      .map((insight) => ({
        postId: insight.postId,
        title: insight.post.title,
        platform: insight.platform,
        type: insight.post.type,
        engagementRate: this.round(this.readDecimalAsNumber(insight.engagementRate)),
        engagementScore: this.getInsightScore(insight),
      }));

    return {
      totals: {
        ...totals,
        engagementRate,
      },
      topPosts,
      platformBreakdown: this.buildInsightBreakdown(insights, "platform"),
      typeBreakdown: this.buildInsightBreakdown(insights, "type"),
      trend: this.buildInsightTrend(insights),
    };
  }

  private buildInsightBreakdown(
    insights: SocialMediaPostInsightModel[],
    field: "platform" | "type",
  ) {
    const grouped = new Map<string, { impressions: number; reach: number; engagements: number }>();

    for (const insight of insights) {
      const key = field === "platform" ? insight.platform : insight.post.type;
      const current = grouped.get(key) ?? { impressions: 0, reach: 0, engagements: 0 };
      current.impressions += insight.impressions ?? 0;
      current.reach += insight.reach ?? 0;
      current.engagements += this.getInsightScore(insight);
      grouped.set(key, current);
    }

    return [...grouped.entries()].map(([key, value]) => ({
      key,
      ...value,
      engagementRate: value.reach > 0 ? this.round((value.engagements / value.reach) * 100) : 0,
    }));
  }

  private buildInsightTrend(insights: SocialMediaPostInsightModel[]) {
    const grouped = new Map<string, { impressions: number; reach: number; engagements: number }>();

    for (const insight of insights) {
      const key = insight.date.toISOString().slice(0, 10);
      const current = grouped.get(key) ?? { impressions: 0, reach: 0, engagements: 0 };
      current.impressions += insight.impressions ?? 0;
      current.reach += insight.reach ?? 0;
      current.engagements += this.getInsightScore(insight);
      grouped.set(key, current);
    }

    return [...grouped.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([date, value]) => ({
        date,
        ...value,
        engagementRate: value.reach > 0 ? this.round((value.engagements / value.reach) * 100) : 0,
      }));
  }

  private getInsightScore(insight: SocialMediaPostInsightModel): number {
    return (
      (insight.likes ?? 0) +
      (insight.comments ?? 0) +
      (insight.shares ?? 0) +
      (insight.saves ?? 0) +
      (insight.clicks ?? 0)
    );
  }

  private async getReportsByClientProfileId(
    clientProfileId: string,
    query: SocialMediaReportsQueryDto,
    options: { onlyPublished: boolean },
  ) {
    const { page, limit } = this.normalizePagination(query);
    const where = this.buildReportWhere(clientProfileId, query, options);
    const statsWhere: Prisma.SocialMediaReportWhereInput = {
      clientProfileId,
      ...(options.onlyPublished
        ? { status: SocialMediaReportStatus.PUBLISHED, clientVisible: true }
        : {}),
    };
    const [reports, total, draft, published, clientVisible] = await this.prisma.$transaction([
      this.prisma.socialMediaReport.findMany({
        where,
        select: socialMediaReportSelect,
        orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.socialMediaReport.count({ where }),
      this.prisma.socialMediaReport.count({
        where: { ...statsWhere, status: SocialMediaReportStatus.DRAFT },
      }),
      this.prisma.socialMediaReport.count({
        where: { ...statsWhere, status: SocialMediaReportStatus.PUBLISHED },
      }),
      this.prisma.socialMediaReport.count({
        where: { ...statsWhere, clientVisible: true },
      }),
    ]);

    return {
      data: reports.map((report) => this.toReportItem(report)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        draft,
        published,
        clientVisible,
      },
    };
  }

  private buildReportWhere(
    clientProfileId: string,
    query: SocialMediaReportsQueryDto,
    options: { onlyPublished: boolean },
  ): Prisma.SocialMediaReportWhereInput {
    const periodStart = this.parseOptionalDate(query.from, "from");
    const periodEnd = this.parseOptionalDate(query.to, "to");
    if (periodStart && periodEnd && periodStart.getTime() > periodEnd.getTime()) {
      throw new BadRequestException("from must be before or equal to to.");
    }

    return {
      clientProfileId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(periodStart || periodEnd
        ? {
            periodEnd: {
              ...(periodStart ? { gte: periodStart } : {}),
              ...(periodEnd ? { lte: periodEnd } : {}),
            },
          }
        : {}),
      ...(options.onlyPublished
        ? { status: SocialMediaReportStatus.PUBLISHED, clientVisible: true }
        : {}),
    };
  }

  private resolveReportPeriod(
    periodStartValue: unknown,
    periodEndValue: unknown,
  ): { periodStart: Date; periodEnd: Date } {
    const periodStart = this.parseRequiredDate(periodStartValue, "periodStart");
    const periodEnd = this.parseRequiredDate(periodEndValue, "periodEnd");
    if (periodStart.getTime() > periodEnd.getTime()) {
      throw new BadRequestException("periodStart must be before or equal to periodEnd.");
    }

    return { periodStart, periodEnd };
  }

  private async createReportByClientProfileId(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
    dto: CreateSocialMediaReportDto,
  ) {
    const period = this.resolveReportPeriod(dto.periodStart, dto.periodEnd);
    const summary = this.normalizeNullableText(dto.summary, "summary", 4000) ?? null;
    const projectId = await this.resolveSocialMediaReportProjectId(
      clientProfileId,
      dto.projectId ?? null,
    );
    const acknowledgementProjectId =
      dto.requestAcknowledgement === true
        ? projectId ?? (await this.resolveSocialMediaReportProjectId(clientProfileId, null))
        : null;
    const shouldPublish = dto.clientVisible === true || dto.requestAcknowledgement === true;
    const now = new Date();

    if (dto.requestAcknowledgement === true && !acknowledgementProjectId) {
      throw new BadRequestException(
        "A SOCIAL_MEDIA project is required to request report acknowledgement.",
      );
    }

    const report = await this.prisma.$transaction(async (tx) => {
      const createdReport = await tx.socialMediaReport.create({
        data: {
          clientProfileId,
          projectId: projectId ?? acknowledgementProjectId,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          type: dto.type,
          status: shouldPublish ? SocialMediaReportStatus.PUBLISHED : SocialMediaReportStatus.DRAFT,
          summary,
          metricsSnapshot: dto.metricsSnapshot as Prisma.InputJsonValue | undefined,
          createdByUserId: currentUser.id,
          publishedByUserId: shouldPublish ? currentUser.id : null,
          clientVisible: shouldPublish,
          publishedAt: shouldPublish ? now : null,
        },
        select: socialMediaReportSelect,
      });

      if (dto.requestAcknowledgement !== true || !acknowledgementProjectId) {
        return createdReport;
      }

      const task = await tx.task.create({
        data: this.buildReportAcknowledgementTaskPayload(
          acknowledgementProjectId,
          createdReport,
          summary,
          now,
        ),
        select: { id: true },
      });

      return tx.socialMediaReport.update({
        where: { id: createdReport.id },
        data: {
          acknowledgementRequestedAt: now,
          acknowledgementTaskId: task.id,
        },
        select: socialMediaReportSelect,
      });
    });

    return this.toReportItem(report);
  }

  private async updateReportModel(
    currentUser: AuthenticatedUser,
    existingReport: SocialMediaReportModel,
    dto: UpdateSocialMediaReportDto,
  ) {
    const now = new Date();
    const data: Prisma.SocialMediaReportUpdateInput = {};
    const summary =
      dto.summary !== undefined
        ? this.normalizeNullableText(dto.summary, "summary", 4000) ?? null
        : undefined;

    if (dto.summary !== undefined) {
      data.summary = summary;
    }

    if (dto.metricsSnapshot !== undefined) {
      data.metricsSnapshot = dto.metricsSnapshot as Prisma.InputJsonValue;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (
        dto.status === SocialMediaReportStatus.DRAFT ||
        dto.status === SocialMediaReportStatus.ARCHIVED
      ) {
        data.clientVisible = false;
      }
    }

    if (dto.clientVisible !== undefined) {
      data.clientVisible = dto.clientVisible;
    }

    if (dto.status === SocialMediaReportStatus.PUBLISHED && dto.clientVisible === false) {
      throw new BadRequestException("Published report cannot be hidden from client.");
    }

    const shouldPublish =
      dto.requestAcknowledgement === true ||
      dto.clientVisible === true ||
      dto.status === SocialMediaReportStatus.PUBLISHED;

    if (shouldPublish) {
      data.status = SocialMediaReportStatus.PUBLISHED;
      data.clientVisible = true;
      if (!existingReport.publishedAt) {
        data.publishedAt = now;
      }
      data.publishedBy = { connect: { id: currentUser.id } };
    }

    const acknowledgementProjectId =
      dto.requestAcknowledgement === true
        ? existingReport.projectId ??
          (await this.resolveSocialMediaReportProjectId(existingReport.clientProfileId, null))
        : null;

    if (dto.requestAcknowledgement === true && !acknowledgementProjectId) {
      throw new BadRequestException(
        "A SOCIAL_MEDIA project is required to request report acknowledgement.",
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let acknowledgementTaskId = existingReport.acknowledgementTaskId;

      if (dto.requestAcknowledgement === true && acknowledgementProjectId) {
        const taskPayload = this.buildReportAcknowledgementTaskPayload(
          acknowledgementProjectId,
          existingReport,
          summary ?? existingReport.summary ?? null,
          now,
        );

        if (acknowledgementTaskId) {
          await tx.task.update({
            where: { id: acknowledgementTaskId },
            data: {
              title: taskPayload.title,
              description: taskPayload.description,
              status: TaskStatus.REVIEW,
              approvalRequired: true,
              approvalType: MetaAdsApprovalType.SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT,
              approvalStatus: MetaAdsApprovalStatus.PENDING,
              approvalRequestedAt: now,
              approvalRespondedAt: null,
              approvalRespondedByUserId: null,
              approvalResponseNote: null,
              approvalContext: taskPayload.approvalContext,
            },
          });
        } else {
          const task = await tx.task.create({
            data: taskPayload,
            select: { id: true },
          });
          acknowledgementTaskId = task.id;
        }

        data.acknowledgementRequestedAt = now;
        data.acknowledgementTask = { connect: { id: acknowledgementTaskId } };
        if (!existingReport.projectId) {
          data.project = { connect: { id: acknowledgementProjectId } };
        }
      }

      return tx.socialMediaReport.update({
        where: { id: existingReport.id },
        data,
        select: socialMediaReportSelect,
      });
    });

    return this.toReportItem(updated);
  }

  private buildReportAcknowledgementTaskPayload(
    projectId: string,
    report: Pick<SocialMediaReportModel, "id" | "type" | "periodStart" | "periodEnd">,
    summary: string | null,
    requestedAt: Date,
  ): Prisma.TaskUncheckedCreateInput {
    return {
      projectId,
      title: this.buildReportAcknowledgementTaskTitle(
        report.type,
        report.periodStart,
        report.periodEnd,
      ),
      description: summary
        ? `Social Media raporu müşteri onayına açıldı. Özet: ${summary}`
        : "Social Media raporu müşteri onayına açıldı.",
      status: TaskStatus.REVIEW,
      priority: Priority.MEDIUM,
      type: TaskType.REVISION,
      approvalRequired: true,
      approvalType: MetaAdsApprovalType.SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT,
      approvalStatus: MetaAdsApprovalStatus.PENDING,
      approvalRequestedAt: requestedAt,
      approvalContext: {
        reportId: report.id,
        reportType: report.type,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
      },
    };
  }

  private buildReportAcknowledgementTaskTitle(
    reportType: SocialMediaReportType,
    periodStart: Date,
    periodEnd: Date,
  ): string {
    return `Social Media Rapor Onayı · ${reportType} (${periodStart.toISOString().slice(0, 10)} - ${periodEnd.toISOString().slice(0, 10)})`;
  }

  private async resolveSocialMediaReportProjectId(
    clientProfileId: string,
    projectId: string | null,
  ): Promise<string | null> {
    if (projectId) {
      await this.assertProjectBelongsToSocialMediaClient(projectId, clientProfileId);
      return projectId;
    }

    const project = await this.prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    return project?.id ?? null;
  }

  private toInsightItem(insight: SocialMediaPostInsightModel) {
    return {
      id: insight.id,
      postId: insight.postId,
      clientProfileId: insight.clientProfileId,
      platform: insight.platform,
      date: insight.date.toISOString(),
      impressions: insight.impressions ?? 0,
      reach: insight.reach ?? 0,
      likes: insight.likes ?? 0,
      comments: insight.comments ?? 0,
      shares: insight.shares ?? 0,
      saves: insight.saves ?? 0,
      profileVisits: insight.profileVisits ?? 0,
      follows: insight.follows ?? 0,
      clicks: insight.clicks ?? 0,
      engagementRate: this.round(this.readDecimalAsNumber(insight.engagementRate)),
      raw: (insight.raw as Prisma.JsonValue | null) ?? null,
      createdAt: insight.createdAt.toISOString(),
      updatedAt: insight.updatedAt.toISOString(),
      post: {
        id: insight.post.id,
        title: insight.post.title,
        type: insight.post.type,
        status: insight.post.status,
        scheduledAt: insight.post.scheduledAt?.toISOString() ?? null,
        publishedAt: insight.post.publishedAt?.toISOString() ?? null,
        externalPostUrl: insight.post.externalPostUrl ?? null,
        clientVisible: insight.post.clientVisible,
      },
    };
  }

  private toReportItem(report: SocialMediaReportModel) {
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

  private async findPosts(
    clientProfileId: string,
    query: SocialMediaPostQueryDto,
    ownVisibleOnly: boolean,
  ): Promise<SocialMediaPostModel[]> {
    const { page, limit } = this.normalizePagination(query);
    const where: Prisma.SocialMediaPostWhereInput = {
      clientProfileId,
      ...this.buildPostQueryWhere(query, ownVisibleOnly),
    };

    return this.prisma.socialMediaPost.findMany({
      where,
      select: socialMediaPostSelect,
      orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  private buildPostQueryWhere(
    query: SocialMediaPostQueryDto,
    ownVisibleOnly: boolean,
  ): Prisma.SocialMediaPostWhereInput {
    const where: Prisma.SocialMediaPostWhereInput = {};
    const platform = this.parseOptionalEnumValue(
      query.platform,
      Object.values(SocialMediaPlatform),
      "platform",
    );
    const type = this.parseOptionalEnumValue(
      query.type,
      Object.values(SocialMediaPostType),
      "type",
    );
    const status = this.parseOptionalEnumValue(
      query.status,
      Object.values(SocialMediaPostStatus),
      "status",
    );
    const clientVisible = ownVisibleOnly ? true : this.parseOptionalBoolean(query.clientVisible);
    const projectId = this.normalizeOptionalUuid(query.projectId, "projectId");
    const assignedToUserId = this.normalizeOptionalUuid(query.assignedToUserId, "assignedToUserId");
    const scheduledAt = this.buildScheduledAtWhere(query.from, query.to);
    const q = this.normalizeOptionalText(query.q);

    if (platform) {
      where.platform = platform;
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (clientVisible !== undefined) {
      where.clientVisible = clientVisible;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (assignedToUserId) {
      where.assignedToUserId = assignedToUserId;
    }
    if (scheduledAt) {
      where.scheduledAt = scheduledAt;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { caption: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private toAdminClientListItem(
    client: AdminSocialMediaClientModel,
    summary: SocialMediaSummaryResponse,
    overdueScheduledPosts: number,
  ): AdminSocialMediaClientListItem {
    const assignedEmployees = client.employeeAssignments.map((assignment) => ({
      userId: assignment.employeeUser.id,
      email: assignment.employeeUser.email,
      displayName: assignment.employeeUser.displayName,
      role: assignment.employeeUser.role,
      status: assignment.employeeUser.status,
      scope: assignment.scope,
    }));
    const assignedSocialMediaSpecialists = assignedEmployees.filter(
      (employee) => employee.scope === EmployeeClientAssignmentScope.SOCIAL_MEDIA,
    );
    const assignedDesigners = assignedEmployees.filter(
      (employee) =>
        employee.scope === EmployeeClientAssignmentScope.DESIGN ||
        employee.role === UserRole.DESIGNER,
    );
    const risk = this.resolveAdminClientRisk({
      summary,
      overdueScheduledPosts,
      assignedSocialMediaSpecialists,
      assignedDesigners,
    });

    return {
      client: {
        id: client.id,
        slug: client.slug,
        companyName: client.companyName,
        status: client.status,
      },
      serviceStatus: client.purchasedServices[0]?.status ?? PurchasedServiceStatus.ACTIVE,
      service: summary.service,
      config: summary.config,
      state: summary.state,
      metrics: {
        ...summary.metrics,
        overdueScheduledPosts,
      },
      contentPlan: summary.contentPlan,
      creativeAssets: summary.creativeAssets,
      assignedEmployees,
      assignedSocialMediaSpecialists,
      assignedDesigners,
      risk,
      lastReport: null,
      actionContext: {
        socialMediaProjectId: client.projects[0]?.id ?? null,
      },
      meta: {
        generatedAt: summary.meta.generatedAt,
        lastUpdatedAt: summary.meta.lastUpdatedAt,
      },
    };
  }

  private resolveAdminClientRisk({
    summary,
    overdueScheduledPosts,
    assignedSocialMediaSpecialists,
    assignedDesigners,
  }: {
    summary: SocialMediaSummaryResponse;
    overdueScheduledPosts: number;
    assignedSocialMediaSpecialists: AdminSocialMediaAssignedEmployee[];
    assignedDesigners: AdminSocialMediaAssignedEmployee[];
  }): { status: AdminSocialMediaRiskStatus; reasons: string[] } {
    const reasons: string[] = [];

    if (summary.state === "WAITING_CONFIG") {
      reasons.push("Social Media config eksik.");
    }
    if (summary.config?.connectionStatus === SocialMediaConnectionStatus.ERROR) {
      reasons.push("Social Media bağlantı durumu hata veriyor.");
    }
    if (assignedSocialMediaSpecialists.length === 0) {
      reasons.push("Social Media specialist ataması yok.");
    }

    if (reasons.length > 0) {
      return { status: "BLOCKED", reasons };
    }

    if (summary.state === "WAITING_CONTENT_PLAN") {
      reasons.push("İçerik planı bekleniyor.");
    }
    if (overdueScheduledPosts > 0) {
      reasons.push(`${overdueScheduledPosts} planlı içerik gecikmiş.`);
    }
    if (summary.metrics.pendingApprovals > 0) {
      reasons.push(`${summary.metrics.pendingApprovals} onay bekliyor.`);
    }
    if (summary.metrics.rejectedPosts > 0) {
      reasons.push(`${summary.metrics.rejectedPosts} revizyon/rejected içerik var.`);
    }
    if (assignedDesigners.length === 0) {
      reasons.push("Designer ataması yok.");
    }

    if (reasons.length > 0) {
      return { status: "ATTENTION", reasons };
    }

    return { status: "READY", reasons: ["Operasyon akışı hazır."] };
  }

  private assertCanReadAdminOverview(currentUser: AuthenticatedUser): void {
    if (
      currentUser.accountType !== AccountType.ADMIN ||
      currentUser.role !== UserRole.ADMIN ||
      !this.hasPermission(currentUser, SOCIAL_MEDIA_SUMMARY_READ_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Social Media summary permission.");
    }
  }

  private async assertCanReadConfig(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.hasPermission(currentUser, SOCIAL_MEDIA_CONFIG_READ_ANY_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (this.hasPermission(currentUser, SOCIAL_MEDIA_CONFIG_READ_ASSIGNED_PERMISSION)) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media config permission.");
  }

  private async assertCanReadSummary(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.hasPermission(currentUser, SOCIAL_MEDIA_SUMMARY_READ_ANY_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (this.hasPermission(currentUser, SOCIAL_MEDIA_SUMMARY_READ_ASSIGNED_PERMISSION)) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media summary permission.");
  }

  private async assertCanReadPosts(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_READ_ANY_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_READ_ASSIGNED_PERMISSION)) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media posts permission.");
  }

  private async assertCanManagePosts(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ANY_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ASSIGNED_PERMISSION)) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media posts permission.");
  }

  private async assertCanManagePostAssets(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ANY_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (
      this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_ASSETS_MANAGE_ASSIGNED_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_CREATIVES_MANAGE_ASSIGNED_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ASSIGNED_PERMISSION)
    ) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media post asset permission.");
  }

  private async assertCanReadInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (
      this.isAdminUser(currentUser) &&
      (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_READ_ANY_PERMISSION) ||
        this.hasPermission(currentUser, REPORTS_READ_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (
      this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_READ_ASSIGNED_PERMISSION) ||
      this.hasPermission(currentUser, REPORTS_READ_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_REPORTS_MANAGE_ASSIGNED_PERMISSION)
    ) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media insights permission.");
  }

  private async assertCanManageInsights(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (
      this.isAdminUser(currentUser) &&
      (this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ANY_PERMISSION) ||
        this.hasPermission(currentUser, REPORTS_MANAGE_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (
      this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_MANAGE_ASSIGNED_PERMISSION) ||
      this.hasPermission(currentUser, REPORTS_MANAGE_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_REPORTS_MANAGE_ASSIGNED_PERMISSION)
    ) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media insights permission.");
  }

  private async assertCanReadReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.isAdminUser(currentUser) && this.hasPermission(currentUser, REPORTS_READ_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (
      this.hasPermission(currentUser, REPORTS_READ_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_REPORTS_MANAGE_ASSIGNED_PERMISSION)
    ) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media report permission.");
  }

  private async assertCanManageReports(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (this.isAdminUser(currentUser) && this.hasPermission(currentUser, REPORTS_MANAGE_PERMISSION)) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    if (
      this.hasPermission(currentUser, REPORTS_MANAGE_PERMISSION) ||
      this.hasPermission(currentUser, SOCIAL_MEDIA_REPORTS_MANAGE_ASSIGNED_PERMISSION)
    ) {
      await this.assertAssignedSocialMediaClientOrFail(currentUser, clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Social Media report permission.");
  }

  private assertCanManageConfig(currentUser: AuthenticatedUser): void {
    if (!this.hasPermission(currentUser, SOCIAL_MEDIA_CONFIG_MANAGE_ANY_PERMISSION)) {
      throw new ForbiddenException("Missing required Social Media config permission.");
    }
  }

  private assertCanReadOwnConfig(currentUser: AuthenticatedUser): void {
    if (
      currentUser.accountType !== AccountType.CLIENT ||
      !this.hasPermission(currentUser, SOCIAL_MEDIA_CONFIG_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Social Media config permission.");
    }
  }

  private assertCanReadOwnSummary(currentUser: AuthenticatedUser): void {
    if (
      currentUser.accountType !== AccountType.CLIENT ||
      !this.hasPermission(currentUser, SOCIAL_MEDIA_SUMMARY_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Social Media summary permission.");
    }
  }

  private assertCanReadOwnPosts(currentUser: AuthenticatedUser): void {
    if (
      currentUser.accountType !== AccountType.CLIENT ||
      !this.hasPermission(currentUser, SOCIAL_MEDIA_POSTS_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Social Media posts permission.");
    }
  }

  private async assertAssignedSocialMediaClientOrFail(
    currentUser: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (currentUser.accountType !== AccountType.EMPLOYEE || currentUser.role === UserRole.ADMIN) {
      throw new NotFoundException("Client profile not found.");
    }

    const assignedClient = await this.prisma.clientProfile.findFirst({
      where: {
        id: clientProfileId,
        employeeAssignments: {
          some: {
            employeeUserId: currentUser.id,
            isActive: true,
          },
        },
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
            status: PurchasedServiceStatus.ACTIVE,
          },
        },
      },
      select: { id: true },
    });

    if (!assignedClient) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private async assertPostReferencesAreValid(
    clientProfileId: string,
    payload: NormalizedCreatePostPayload | NormalizedUpdatePostPayload,
  ): Promise<void> {
    if (payload.projectId !== undefined && payload.projectId !== null) {
      await this.assertProjectBelongsToSocialMediaClient(payload.projectId, clientProfileId);
    }

    if (payload.assignedToUserId !== undefined && payload.assignedToUserId !== null) {
      await this.assertAssignedUserIsValidForClient(payload.assignedToUserId, clientProfileId);
    }

    if (payload.approvalTaskId !== undefined && payload.approvalTaskId !== null) {
      await this.assertApprovalTaskBelongsToClient(payload.approvalTaskId, clientProfileId);
    }
  }

  private async assertProjectBelongsToSocialMediaClient(
    projectId: string,
    clientProfileId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
      },
      select: { id: true },
    });

    if (!project) {
      throw new BadRequestException("Project must belong to the client Social Media workspace.");
    }
  }

  private async assertAssignedUserIsValidForClient(
    assignedToUserId: string,
    clientProfileId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: assignedToUserId,
        accountType: AccountType.EMPLOYEE,
        status: UserStatus.ACTIVE,
        employeeClientAssignments: {
          some: {
            clientProfileId,
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException("Assigned user must be an active assigned employee.");
    }
  }

  private async assertApprovalTaskBelongsToClient(
    approvalTaskId: string,
    clientProfileId: string,
  ): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: approvalTaskId,
        project: {
          clientProfileId,
        },
      },
      select: { id: true },
    });

    if (!task) {
      throw new BadRequestException("Approval task must belong to the client.");
    }
  }

  private async assertFileCanBeAttachedToPost(
    post: SocialMediaPostModel,
    fileId: string,
  ): Promise<void> {
    const file = await this.prisma.projectFile.findFirst({
      where: {
        id: fileId,
        clientProfileId: post.clientProfileId,
      },
      select: {
        id: true,
        projectId: true,
        serviceKey: true,
      },
    });

    if (!file) {
      throw new BadRequestException("Project file must belong to the same client.");
    }

    if (post.projectId && file.projectId !== post.projectId) {
      throw new BadRequestException("Project file must belong to the Social Media post project.");
    }

    if (!post.projectId && file.serviceKey !== PurchasedServiceKey.SOCIAL_MEDIA) {
      throw new BadRequestException("Project file must be a Social Media asset.");
    }
  }

  private async getPostOrNotFound(postId: string): Promise<SocialMediaPostModel> {
    const post = await this.prisma.socialMediaPost.findUnique({
      where: { id: postId },
      select: socialMediaPostSelect,
    });

    if (!post) {
      throw new NotFoundException("Social Media post not found.");
    }

    return post;
  }

  private async assertClientProfileExists(clientProfileId: string): Promise<void> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private async assertClientHasActiveSocialMediaService(clientProfileId: string): Promise<void> {
    const hasActiveService = await this.hasActiveSocialMediaService(clientProfileId);
    if (!hasActiveService) {
      throw new BadRequestException(
        "Client must have an ACTIVE SOCIAL_MEDIA purchased service to manage Social Media.",
      );
    }
  }

  private async hasActiveSocialMediaService(clientProfileId: string): Promise<boolean> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    return Boolean(activeService);
  }

  private getOwnClientProfileIdOrFail(currentUser: AuthenticatedUser): string {
    if (!currentUser.clientProfileId) {
      throw new ForbiddenException("Client profile context is missing.");
    }

    return currentUser.clientProfileId;
  }

  private assertBodyObject(dto: unknown): asserts dto is Record<string, unknown> {
    if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
      throw new BadRequestException("Request body must be an object.");
    }
  }

  private assertHasConfigUpdatePayload(dto: UpdateSocialMediaConfigDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Social Media config field is required.");
    }
  }

  private assertHasPostUpdatePayload(dto: UpdateSocialMediaPostDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Social Media post field is required.");
    }
  }

  private assertHasReportUpdatePayload(dto: UpdateSocialMediaReportDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Social Media report field is required.");
    }
  }

  private normalizeCreatePostPayload(dto: CreateSocialMediaPostDto): NormalizedCreatePostPayload {
    const status =
      this.parseOptionalEnumValue(
        dto.status,
        Object.values(SocialMediaPostStatus),
        "status",
      ) ?? SocialMediaPostStatus.IDEA;
    const scheduledAt = this.parseNullableDate(dto.scheduledAt, "scheduledAt") ?? null;
    const publishedAt =
      this.resolvePublishedAt(
        status,
        this.parseNullableDate(dto.publishedAt, "publishedAt") ?? null,
      ) ?? null;

    if (status === SocialMediaPostStatus.SCHEDULED && !scheduledAt) {
      throw new BadRequestException("scheduledAt is required when status is SCHEDULED.");
    }

    return {
      projectId: this.normalizeNullableUuid(dto.projectId, "projectId") ?? null,
      platform: this.parseEnumValue(dto.platform, Object.values(SocialMediaPlatform), "platform"),
      type: this.parseEnumValue(dto.type, Object.values(SocialMediaPostType), "type"),
      status,
      title: this.normalizeRequiredText(dto.title, "title", 2, 180),
      caption: this.normalizeNullableText(dto.caption, "caption", 4000) ?? null,
      scheduledAt,
      publishedAt,
      clientVisible: this.parseOptionalBoolean(dto.clientVisible) ?? false,
      approvalTaskId: this.normalizeNullableUuid(dto.approvalTaskId, "approvalTaskId") ?? null,
      assignedToUserId:
        this.normalizeNullableUuid(dto.assignedToUserId, "assignedToUserId") ?? null,
      externalPostId: this.normalizeNullableText(dto.externalPostId, "externalPostId", 180) ?? null,
      externalPostUrl:
        this.normalizeNullableText(dto.externalPostUrl, "externalPostUrl", 500) ?? null,
    };
  }

  private normalizeUpdatePostPayload(dto: UpdateSocialMediaPostDto): NormalizedUpdatePostPayload {
    const payload: NormalizedUpdatePostPayload = {};
    this.assignIfDefined(payload, "projectId", this.normalizeNullableUuid(dto.projectId, "projectId"));
    this.assignIfDefined(
      payload,
      "platform",
      this.parseOptionalEnumValue(dto.platform, Object.values(SocialMediaPlatform), "platform"),
    );
    this.assignIfDefined(
      payload,
      "type",
      this.parseOptionalEnumValue(dto.type, Object.values(SocialMediaPostType), "type"),
    );
    this.assignIfDefined(
      payload,
      "status",
      this.parseOptionalEnumValue(dto.status, Object.values(SocialMediaPostStatus), "status"),
    );
    this.assignIfDefined(
      payload,
      "title",
      dto.title === undefined
        ? undefined
        : this.normalizeRequiredText(dto.title, "title", 2, 180),
    );
    this.assignIfDefined(payload, "caption", this.normalizeNullableText(dto.caption, "caption", 4000));
    this.assignIfDefined(
      payload,
      "scheduledAt",
      this.parseNullableDate(dto.scheduledAt, "scheduledAt"),
    );
    this.assignIfDefined(
      payload,
      "publishedAt",
      this.parseNullableDate(dto.publishedAt, "publishedAt"),
    );
    this.assignIfDefined(payload, "clientVisible", this.parseOptionalBoolean(dto.clientVisible));
    this.assignIfDefined(
      payload,
      "approvalTaskId",
      this.normalizeNullableUuid(dto.approvalTaskId, "approvalTaskId"),
    );
    this.assignIfDefined(
      payload,
      "assignedToUserId",
      this.normalizeNullableUuid(dto.assignedToUserId, "assignedToUserId"),
    );
    this.assignIfDefined(
      payload,
      "externalPostId",
      this.normalizeNullableText(dto.externalPostId, "externalPostId", 180),
    );
    this.assignIfDefined(
      payload,
      "externalPostUrl",
      this.normalizeNullableText(dto.externalPostUrl, "externalPostUrl", 500),
    );

    return payload;
  }

  private assertPostStatusTransition(
    currentStatus: SocialMediaPostStatus,
    nextStatus: SocialMediaPostStatus | undefined,
  ): void {
    if (!nextStatus || nextStatus === currentStatus) {
      return;
    }

    if (!allowedPostStatusTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid Social Media post status transition from ${currentStatus} to ${nextStatus}.`,
      );
    }
  }

  private assertPostTimingIsValid(
    existingPost: SocialMediaPostModel,
    payload: NormalizedUpdatePostPayload,
  ): void {
    const nextStatus = payload.status ?? existingPost.status;
    const nextScheduledAt =
      payload.scheduledAt === undefined ? existingPost.scheduledAt : payload.scheduledAt;

    if (nextStatus === SocialMediaPostStatus.SCHEDULED && !nextScheduledAt) {
      throw new BadRequestException("scheduledAt is required when status is SCHEDULED.");
    }
  }

  private buildPostUpdateData(
    existingPost: SocialMediaPostModel,
    payload: NormalizedUpdatePostPayload,
  ): Prisma.SocialMediaPostUncheckedUpdateInput {
    const data: Prisma.SocialMediaPostUncheckedUpdateInput = {};
    this.assignIfDefined(data, "projectId", payload.projectId);
    this.assignIfDefined(data, "platform", payload.platform);
    this.assignIfDefined(data, "type", payload.type);
    this.assignIfDefined(data, "status", payload.status);
    this.assignIfDefined(data, "title", payload.title);
    this.assignIfDefined(data, "caption", payload.caption);
    this.assignIfDefined(data, "scheduledAt", payload.scheduledAt);
    this.assignIfDefined(data, "publishedAt", payload.publishedAt);
    this.assignIfDefined(data, "clientVisible", payload.clientVisible);
    this.assignIfDefined(data, "approvalTaskId", payload.approvalTaskId);
    this.assignIfDefined(data, "assignedToUserId", payload.assignedToUserId);
    this.assignIfDefined(data, "externalPostId", payload.externalPostId);
    this.assignIfDefined(data, "externalPostUrl", payload.externalPostUrl);

    const nextStatus = payload.status ?? existingPost.status;
    if (
      nextStatus === SocialMediaPostStatus.PUBLISHED &&
      payload.publishedAt === undefined &&
      !existingPost.publishedAt
    ) {
      data.publishedAt = new Date();
    }

    return data;
  }

  private resolvePublishedAt(
    status: SocialMediaPostStatus,
    publishedAt: Date | null,
  ): Date | null {
    if (publishedAt) {
      return publishedAt;
    }

    if (status === SocialMediaPostStatus.PUBLISHED) {
      return new Date();
    }

    return null;
  }

  private buildConfigPatchData(dto: UpdateSocialMediaConfigDto): SocialMediaConfigPatchData {
    const patchData: SocialMediaConfigPatchData = {};

    this.assignIfDefined(
      patchData,
      "instagramUsername",
      this.normalizeNullableText(dto.instagramUsername, "instagramUsername"),
    );
    this.assignIfDefined(
      patchData,
      "instagramAccountId",
      this.normalizeNullableText(dto.instagramAccountId, "instagramAccountId"),
    );
    this.assignIfDefined(
      patchData,
      "facebookPageId",
      this.normalizeNullableText(dto.facebookPageId, "facebookPageId"),
    );
    this.assignIfDefined(
      patchData,
      "tiktokUsername",
      this.normalizeNullableText(dto.tiktokUsername, "tiktokUsername"),
    );
    this.assignIfDefined(
      patchData,
      "linkedinPageUrl",
      this.normalizeNullableText(dto.linkedinPageUrl, "linkedinPageUrl"),
    );
    this.assignIfDefined(
      patchData,
      "contentFrequency",
      this.normalizeNullableText(dto.contentFrequency, "contentFrequency"),
    );
    this.assignIfDefined(patchData, "primaryGoal", dto.primaryGoal);
    this.assignIfDefined(
      patchData,
      "toneOfVoice",
      this.normalizeNullableText(dto.toneOfVoice, "toneOfVoice"),
    );
    this.assignIfDefined(patchData, "hashtags", this.normalizeHashtags(dto.hashtags));
    this.assignIfDefined(patchData, "connectionStatus", dto.connectionStatus);
    this.assignIfDefined(
      patchData,
      "syncError",
      this.normalizeNullableText(dto.syncError, "syncError"),
    );
    this.assignIfDefined(patchData, "notes", this.normalizeNullableText(dto.notes, "notes"));

    if (dto.lastSyncAt !== undefined) {
      patchData.lastSyncAt = dto.lastSyncAt === null ? null : new Date(dto.lastSyncAt);
    }

    return patchData;
  }

  private normalizeRequiredText(
    value: unknown,
    fieldName: string,
    minLength: number,
    maxLength: number,
  ): string {
    if (typeof value !== "string") {
      throw new BadRequestException(`${fieldName} must be a string.`);
    }

    const normalizedValue = value.trim();
    if (normalizedValue.length < minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters.`);
    }
    if (normalizedValue.length > maxLength) {
      throw new BadRequestException(`${fieldName} must be at most ${maxLength} characters.`);
    }

    return normalizedValue;
  }

  private normalizeNullableText(
    value: string | null | undefined,
    fieldName: string,
    maxLength = 4000,
  ): string | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new BadRequestException(`${fieldName} must be a string.`);
    }

    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      return null;
    }
    if (normalizedValue.length > maxLength) {
      throw new BadRequestException(`${fieldName} must be at most ${maxLength} characters.`);
    }

    return normalizedValue;
  }

  private normalizeOptionalText(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new BadRequestException("Query value must be a string.");
    }

    const normalizedValue = value.trim();
    if (
      normalizedValue.length === 0 ||
      normalizedValue.toLowerCase() === "undefined" ||
      normalizedValue.toLowerCase() === "null" ||
      normalizedValue.toUpperCase() === "ALL"
    ) {
      return undefined;
    }

    return normalizedValue;
  }

  private normalizeHashtags(value: string[] | undefined): string[] | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalizedValues = value
      .map((item) => item.trim())
      .filter((item, index, items) => item.length > 0 && items.indexOf(item) === index);

    return normalizedValues.slice(0, 30);
  }

  private normalizeRequiredUuid(value: unknown, fieldName: string): string {
    if (typeof value !== "string" || !this.isUuid(value.trim())) {
      throw new BadRequestException(`${fieldName} must be a valid UUID.`);
    }

    return value.trim();
  }

  private normalizeNullableUuid(value: unknown, fieldName: string): string | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new BadRequestException(`${fieldName} must be a valid UUID.`);
    }

    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      return null;
    }
    if (!this.isUuid(normalizedValue)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID.`);
    }

    return normalizedValue;
  }

  private normalizeOptionalUuid(value: unknown, fieldName: string): string | undefined {
    const normalizedValue = this.normalizeOptionalText(value);
    if (!normalizedValue) {
      return undefined;
    }

    if (!this.isUuid(normalizedValue)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID.`);
    }

    return normalizedValue;
  }

  private parseNullableDate(value: unknown, fieldName: string): Date | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new BadRequestException(`${fieldName} must be an ISO date string.`);
    }

    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      return null;
    }

    const date = new Date(normalizedValue);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be an ISO date string.`);
    }

    return date;
  }

  private buildScheduledAtWhere(
    fromValue: unknown,
    toValue: unknown,
  ): { gte?: Date; lte?: Date } | undefined {
    const from = this.parseOptionalDate(fromValue, "from");
    const to = this.parseOptionalDate(toValue, "to");
    if (!from && !to) {
      return undefined;
    }
    if (from && to && from.getTime() > to.getTime()) {
      throw new BadRequestException("from must be before or equal to to.");
    }

    return {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  private parseOptionalDate(value: unknown, fieldName: string): Date | undefined {
    const normalizedValue = this.normalizeOptionalText(value);
    if (!normalizedValue) {
      return undefined;
    }

    const date = new Date(normalizedValue);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be an ISO date string.`);
    }

    return date;
  }

  private parseRequiredDate(value: unknown, fieldName: string): Date {
    const date = this.parseNullableDate(value, fieldName);
    if (!date) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return date;
  }

  private normalizeOptionalMetric(
    value: unknown,
    fieldName: string,
  ): number | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    const parsedValue =
      typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`${fieldName} must be a non-negative integer.`);
    }

    return parsedValue;
  }

  private normalizeOptionalDecimal(
    value: unknown,
    fieldName: string,
  ): number | null | undefined {
    if (value === undefined || value === null) {
      return value;
    }

    const parsedValue = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new BadRequestException(`${fieldName} must be a non-negative number.`);
    }

    return this.round(parsedValue);
  }

  private readDecimalAsNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number {
    if (value === undefined || value === null) {
      return 0;
    }

    const parsedValue = typeof value === "object" ? Number(value.toString()) : Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private parseEnumValue<T extends string>(
    value: unknown,
    values: readonly T[],
    fieldName: string,
  ): T {
    const normalizedValue = typeof value === "string" ? value.trim().toUpperCase() : value;
    if (typeof normalizedValue !== "string" || !values.includes(normalizedValue as T)) {
      throw new BadRequestException(`${fieldName} must be a valid value.`);
    }

    return normalizedValue as T;
  }

  private parseOptionalEnumValue<T extends string>(
    value: unknown,
    values: readonly T[],
    fieldName: string,
  ): T | undefined {
    const normalizedValue = this.normalizeOptionalText(value);
    if (!normalizedValue) {
      return undefined;
    }

    return this.parseEnumValue(normalizedValue, values, fieldName);
  }

  private parseOptionalBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value !== "string") {
      throw new BadRequestException("Boolean field must be a boolean.");
    }

    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true" || normalizedValue === "1") {
      return true;
    }
    if (normalizedValue === "false" || normalizedValue === "0") {
      return false;
    }

    throw new BadRequestException("Boolean field must be a boolean.");
  }

  private normalizeSortOrder(value: unknown): number {
    if (value === undefined || value === null || value === "") {
      return 0;
    }

    const parsedValue =
      typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
    if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 1000) {
      throw new BadRequestException("sortOrder must be an integer between 0 and 1000.");
    }

    return parsedValue;
  }

  private normalizePagination(query: { page?: unknown; limit?: unknown }): {
    page: number;
    limit: number;
  } {
    return {
      page: this.normalizePositiveInteger(query.page, "page", 1, 1, Number.MAX_SAFE_INTEGER),
      limit: this.normalizePositiveInteger(query.limit, "limit", 50, 1, 100),
    };
  }

  private normalizePositiveInteger(
    value: unknown,
    fieldName: string,
    fallback: number,
    min: number,
    max: number,
  ): number {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const parsedValue =
      typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
    if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
      throw new BadRequestException(`${fieldName} must be an integer between ${min} and ${max}.`);
    }

    return parsedValue;
  }

  private assignIfDefined<T extends Record<string, unknown>, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | undefined,
  ): void {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private toAdminConfigResponse(
    clientProfileId: string,
    config: SocialMediaConfigModel | null,
    hasActiveService: boolean,
  ): AdminSocialMediaConfigResponse {
    return {
      clientProfileId,
      hasActiveService,
      instagramUsername: config?.instagramUsername ?? null,
      instagramAccountId: config?.instagramAccountId ?? null,
      facebookPageId: config?.facebookPageId ?? null,
      tiktokUsername: config?.tiktokUsername ?? null,
      linkedinPageUrl: config?.linkedinPageUrl ?? null,
      contentFrequency: config?.contentFrequency ?? null,
      primaryGoal: config?.primaryGoal ?? null,
      toneOfVoice: config?.toneOfVoice ?? null,
      hashtags: config?.hashtags ?? [],
      connectionStatus: config?.connectionStatus ?? SocialMediaConnectionStatus.NOT_CONNECTED,
      lastSyncAt: config?.lastSyncAt ?? null,
      syncError: config?.syncError ?? null,
      notes: config?.notes ?? null,
      createdAt: config?.createdAt ?? null,
      updatedAt: config?.updatedAt ?? null,
    };
  }

  private toOwnConfigResponse(
    clientProfileId: string,
    config: SocialMediaConfigModel | null,
  ): OwnSocialMediaConfigResponse {
    const adminResponse = this.toAdminConfigResponse(clientProfileId, config, true);
    return {
      clientProfileId: adminResponse.clientProfileId,
      instagramUsername: adminResponse.instagramUsername,
      instagramAccountId: adminResponse.instagramAccountId,
      facebookPageId: adminResponse.facebookPageId,
      tiktokUsername: adminResponse.tiktokUsername,
      linkedinPageUrl: adminResponse.linkedinPageUrl,
      contentFrequency: adminResponse.contentFrequency,
      primaryGoal: adminResponse.primaryGoal,
      toneOfVoice: adminResponse.toneOfVoice,
      hashtags: adminResponse.hashtags,
      connectionStatus: adminResponse.connectionStatus,
      lastSyncAt: adminResponse.lastSyncAt,
      notes: adminResponse.notes,
    };
  }

  private toOwnPostResponse(post: SocialMediaPostModel) {
    return {
      id: post.id,
      clientProfileId: post.clientProfileId,
      projectId: post.projectId,
      platform: post.platform,
      type: post.type,
      status: post.status,
      title: post.title,
      caption: post.caption,
      scheduledAt: post.scheduledAt,
      publishedAt: post.publishedAt,
      clientVisible: post.clientVisible,
      externalPostUrl: post.externalPostUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      project: post.project,
      assets: post.assets
        .filter((asset) => asset.file.visibility !== ProjectFileVisibility.INTERNAL)
        .map((asset) => ({
          id: asset.id,
          sortOrder: asset.sortOrder,
          createdAt: asset.createdAt,
          file: {
            id: asset.file.id,
            title: asset.file.title,
            secureUrl: asset.file.secureUrl,
            mimeType: asset.file.mimeType,
            category: asset.file.category,
            visibility: asset.file.visibility,
          },
        })),
    };
  }

  private hasPermission(currentUser: AuthenticatedUser, permission: string): boolean {
    return currentUser.permissions.includes(permission);
  }

  private isAdminUser(currentUser: AuthenticatedUser): boolean {
    return currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN;
  }
}
