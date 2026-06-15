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

export type SocialMediaReportType =
  | "WEEKLY"
  | "MONTHLY"
  | "POST_PERFORMANCE"
  | "CONTENT_CALENDAR"
  | "CREATIVE_PERFORMANCE"
  | "ENGAGEMENT_REPORT";

export type SocialMediaReportStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type SocialMediaReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type SocialMediaProjectSummary = {
  id: string;
  name: string;
  slug?: string | null;
  serviceKey?: string | null;
};

export type SocialMediaPostAssetFile = {
  id: string;
  folderId?: string | null;
  title: string;
  secureUrl: string;
  mimeType: string;
  category: string;
  visibility: string;
  folder?: {
    id: string;
    name: string;
  } | null;
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
  approvalTaskId: string | null;
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

export type SocialMediaInsightPostSummary = {
  id: string;
  title: string;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  externalPostUrl: string | null;
  clientVisible: boolean;
};

export type SocialMediaInsightItem = {
  id: string;
  postId: string;
  clientProfileId: string;
  platform: SocialMediaPlatform;
  date: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profileVisits: number;
  follows: number;
  clicks: number;
  engagementRate: number;
  raw: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  post: SocialMediaInsightPostSummary;
};

export type SocialMediaInsightBreakdownItem = {
  key: string;
  impressions: number;
  reach: number;
  engagements: number;
  engagementRate: number;
};

export type SocialMediaInsightTrendItem = {
  date: string;
  impressions: number;
  reach: number;
  engagements: number;
  engagementRate: number;
};

export type SocialMediaTopPostInsight = {
  postId: string;
  title: string;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  engagementRate: number;
  engagementScore: number;
};

export type SocialMediaInsightsResponse = {
  data: SocialMediaInsightItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    generatedAt: string | null;
    totals: {
      impressions: number;
      reach: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      profileVisits: number;
      follows: number;
      clicks: number;
      engagementRate: number;
    };
    topPosts: SocialMediaTopPostInsight[];
    platformBreakdown: SocialMediaInsightBreakdownItem[];
    typeBreakdown: SocialMediaInsightBreakdownItem[];
    trend: SocialMediaInsightTrendItem[];
  };
};

export type SocialMediaInsightsQuery = {
  postId?: string;
  platform?: SocialMediaPlatform;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type SocialMediaReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: SocialMediaReportType;
  status: SocialMediaReportStatus;
  summary: string | null;
  metricsSnapshot: Record<string, unknown> | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: SocialMediaReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SocialMediaReportsResponse = {
  data: SocialMediaReportItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

export type SocialMediaReportsQuery = {
  status?: SocialMediaReportStatus;
  type?: SocialMediaReportType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
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
