import type { ClientStatus, PurchasedServiceStatus } from "../clients/clientsTypes";
import type { Project, ProjectFile } from "../projects/projectsTypes";

export type SocialMediaPlatform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "LINKEDIN"
  | "X"
  | "PINTEREST";

export type SocialMediaPostType =
  | "FEED"
  | "STORY"
  | "REEL"
  | "CAROUSEL"
  | "SHORT_VIDEO"
  | "STATIC_IMAGE"
  | "TEXT";

export type SocialMediaPostStatus =
  | "IDEA"
  | "DRAFT"
  | "DESIGN"
  | "WAITING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "REJECTED"
  | "REVISION_REQUIRED"
  | "CANCELLED";

export type SocialMediaConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type SocialMediaGoal =
  | "BRAND_AWARENESS"
  | "COMMUNITY_GROWTH"
  | "ENGAGEMENT"
  | "LEAD_GENERATION"
  | "SALES_SUPPORT"
  | "REPUTATION"
  | "MIXED";

export type SocialMediaSummaryState =
  | "READY"
  | "NO_DATA"
  | "WAITING_CONFIG"
  | "WAITING_CONTENT_PLAN";

export type SocialMediaApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "ACKNOWLEDGED";

export type SocialMediaRiskStatus = "READY" | "ATTENTION" | "BLOCKED";

export type SocialMediaPostUserSummary = {
  id: string;
  displayName: string | null;
  email?: string | null;
  role?: string | null;
};

export type SocialMediaApprovalTaskSummary = {
  id: string;
  title: string;
  status?: string | null;
};

export type SocialMediaPostAsset = {
  id: string;
  postId: string | null;
  projectFileId: string | null;
  sortOrder: number;
  createdAt: string;
  file: ProjectFile | null;
};

export type SocialMediaPost = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  title: string;
  caption: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  clientVisible: boolean;
  approvalTaskId: string | null;
  createdByUserId: string | null;
  assignedToUserId: string | null;
  externalPostId: string | null;
  externalPostUrl: string | null;
  createdAt: string;
  updatedAt: string;
  project: Project | null;
  approvalTask: SocialMediaApprovalTaskSummary | null;
  createdBy: SocialMediaPostUserSummary | null;
  assignedTo: SocialMediaPostUserSummary | null;
  assets: SocialMediaPostAsset[];
};

export type SocialMediaPostsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SocialMediaPostsListResponse = {
  data: SocialMediaPost[];
  meta: SocialMediaPostsListMeta;
};

export type SocialMediaPostsQuery = {
  platform?: SocialMediaPlatform;
  type?: SocialMediaPostType;
  status?: SocialMediaPostStatus;
  clientVisible?: boolean;
  projectId?: string;
  assignedToUserId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type CreateSocialMediaPostRequest = {
  projectId?: string | null;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status?: SocialMediaPostStatus;
  title: string;
  caption?: string | null;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  clientVisible?: boolean;
  approvalTaskId?: string | null;
  assignedToUserId?: string | null;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
};

export type UpdateSocialMediaPostRequest = Partial<CreateSocialMediaPostRequest>;

export type ScheduleSocialMediaPostRequest = {
  scheduledAt: string;
  clientVisible?: boolean;
};

export type MarkSocialMediaPostPublishedRequest = {
  publishedAt: string;
  externalPostUrl?: string | null;
  externalPostId?: string | null;
};

export type CreateSocialMediaPostAssetRequest = {
  fileId: string;
  sortOrder?: number;
};

export type SocialMediaSummaryConfig = {
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
  lastSyncAt: string | null;
  notes?: string | null;
};

export type SocialMediaSummaryPost = {
  id: string;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  title: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  clientVisible: boolean;
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  updatedAt: string;
};

export type SocialMediaCreativeAsset = {
  id: string;
  title: string;
  category: string;
  visibility: string;
  secureUrl: string;
  mimeType: string;
  approvalStatus: SocialMediaApprovalStatus | null;
  project: {
    id: string;
    name: string;
  };
  updatedAt: string;
};

export type SocialMediaSummary = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientStatus | string;
  };
  service: {
    hasActiveService: boolean;
    status: PurchasedServiceStatus | null;
    startedAt: string | null;
    updatedAt: string | null;
  };
  config: SocialMediaSummaryConfig | null;
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
      status: string;
      priority: string;
      dueDate: string | null;
      updatedAt: string;
    }>;
    upcomingPosts: SocialMediaSummaryPost[];
    recentPosts: SocialMediaSummaryPost[];
    topPosts: SocialMediaSummaryPost[];
  };
  creativeAssets: SocialMediaCreativeAsset[];
  meta: {
    generatedAt: string | null;
    lastUpdatedAt: string | null;
    sources: string[];
  };
};

export type AdminSocialMediaAssignedEmployee = {
  userId: string;
  email: string;
  displayName: string | null;
  role: string;
  status?: string;
  scope: string;
};

export type AdminSocialMediaClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: ClientStatus;
  };
  serviceStatus: PurchasedServiceStatus;
  service: SocialMediaSummary["service"];
  config: SocialMediaSummaryConfig | null;
  state: SocialMediaSummaryState;
  metrics: SocialMediaSummary["metrics"] & {
    overdueScheduledPosts: number;
  };
  contentPlan: SocialMediaSummary["contentPlan"];
  creativeAssets: SocialMediaCreativeAsset[];
  assignedEmployees: AdminSocialMediaAssignedEmployee[];
  assignedSocialMediaSpecialists: AdminSocialMediaAssignedEmployee[];
  assignedDesigners: AdminSocialMediaAssignedEmployee[];
  risk: {
    status: SocialMediaRiskStatus;
    reasons: string[];
  };
  lastReport: null;
  actionContext: {
    socialMediaProjectId: string | null;
  };
  meta: {
    generatedAt: string | null;
    lastUpdatedAt: string | null;
  };
};

export type AdminSocialMediaClientsResponse = {
  data: AdminSocialMediaClientListItem[];
  meta: {
    total: number;
    ready: number;
    attention: number;
    blocked: number;
    overdueScheduledPosts: number;
    pendingApprovals: number;
    generatedAt: string | null;
  };
};
