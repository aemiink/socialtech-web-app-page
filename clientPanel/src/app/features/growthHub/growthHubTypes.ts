export type GrowthHubServiceKey =
  | "GROWTH_HUB"
  | "SOCIAL_MEDIA"
  | "MEDIA_HUB"
  | "META_ADS"
  | "TIKTOK_ADS"
  | "GOOGLE_ADS"
  | "AMAZON_ADS"
  | "WEB_APP"
  | "MOBILE_APP"
  | "LANDING_PAGE"
  | "WEB_MOBILE_DESIGN"
  | "TECHNICAL_SUPPORT"
  | "SEO_AUDIT";

export type GrowthHubGoal =
  | "LEAD_GENERATION"
  | "ECOMMERCE_SALES"
  | "BRAND_AWARENESS"
  | "APP_GROWTH"
  | "RETENTION"
  | "MIXED";

export type GrowthHubConfigStatus = "ACTIVE" | "PAUSED" | "ON_HOLD";

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
  | "READY"
  | "NO_DATA"
  | "WAITING_SOURCE"
  | "RISK"
  | "OPTIMIZE"
  | "SCALE";

export type GrowthHubActionType =
  | "TASK_APPROVAL"
  | "FILE_APPROVAL"
  | "RELEASE_APPROVAL"
  | "REPORT_ACKNOWLEDGEMENT";

export type GrowthHubActivityType = "TASK" | "FILE" | "RELEASE" | "MESSAGE";

export type GrowthHubClientSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type GrowthHubServiceSummary = {
  hasActiveService: boolean;
  status: string | null;
  startedAt: string | null;
  updatedAt: string | null;
};

export type GrowthHubConfig = {
  id: string;
  clientProfileId?: string;
  primaryGoal: GrowthHubGoal | null;
  targetLeads: number | null;
  targetRoas: number | null;
  targetCpa: number | null;
  targetRevenue: number | null;
  reportingDay: string | null;
  notes: string | null;
  status: GrowthHubConfigStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type GrowthHubChannelMetrics = {
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
  lastUpdatedAt: string | null;
};

export type GrowthHubProjectReference = {
  id: string;
  name: string;
  slug: string;
};

export type GrowthHubChannelSummary = {
  serviceKey: GrowthHubServiceKey;
  sourceStatus: GrowthHubChannelSourceStatus;
  status: GrowthHubChannelStatus;
  metrics: GrowthHubChannelMetrics;
  openTasks: number;
  pendingApprovals: number;
  overdueTasks: number;
  lastUpdatedAt: string | null;
};

export type GrowthHubActionItem = {
  id: string;
  type: GrowthHubActionType;
  title: string;
  serviceKey: GrowthHubServiceKey | null;
  project: GrowthHubProjectReference | null;
  dueAt: string | null;
  createdAt: string | null;
  updatedAt: string;
};

export type GrowthHubActivityItem = {
  id: string;
  type: GrowthHubActivityType;
  title: string;
  serviceKey: GrowthHubServiceKey | null;
  project: GrowthHubProjectReference | null;
  occurredAt: string;
};

export type GrowthHubSummary = {
  client: GrowthHubClientSummary;
  service: GrowthHubServiceSummary;
  config: GrowthHubConfig | null;
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
    generatedAt: string | null;
    lastUpdatedAt: string | null;
    sources: string[];
  };
};

export type GrowthHubChannelsResponse = {
  data: GrowthHubChannelSummary[];
  meta: {
    generatedAt: string | null;
  };
};

export type GrowthHubActionsResponse = {
  data: GrowthHubActionItem[];
  meta: {
    total: number;
    generatedAt: string | null;
  };
};

export type GrowthHubActivityResponse = {
  data: GrowthHubActivityItem[];
  meta: {
    total: number;
    generatedAt: string | null;
  };
};
