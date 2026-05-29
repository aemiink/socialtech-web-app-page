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

export type SocialMediaProjectSummary = {
  id: string;
  name: string;
  slug?: string | null;
  serviceKey?: string | null;
};

export type SocialMediaPostAssetFile = {
  id: string;
  title: string;
  secureUrl: string;
  mimeType: string;
  category: string;
  visibility: string;
};

export type SocialMediaPostAsset = {
  id: string;
  sortOrder: number;
  createdAt: string;
  file: SocialMediaPostAssetFile | null;
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
  externalPostUrl: string | null;
  createdAt: string;
  updatedAt: string;
  project: SocialMediaProjectSummary | null;
  assets: SocialMediaPostAsset[];
};

export type SocialMediaPostsQuery = {
  platform?: SocialMediaPlatform;
  type?: SocialMediaPostType;
  status?: SocialMediaPostStatus;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type SocialMediaCalendarResponse = {
  posts: SocialMediaPost[];
  meta: {
    generatedAt: string | null;
    from: string | null;
    to: string | null;
  };
};

export type SocialMediaConfig = {
  clientProfileId: string;
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
  notes: string | null;
};

export type SocialMediaSummaryConfig = Omit<SocialMediaConfig, "clientProfileId">;

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
    status: string;
  };
  service: {
    hasActiveService: boolean;
    status: string | null;
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
