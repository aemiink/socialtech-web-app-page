export type MetaAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type MetaAdsSyncStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "SKIPPED";

export type MetaAdsReportType =
  | "WEEKLY"
  | "MONTHLY"
  | "CAMPAIGN_PERFORMANCE"
  | "CREATIVE_PERFORMANCE"
  | "BUDGET_RECOMMENDATION";

export type MetaAdsReportStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type MetaAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type OwnMetaAdsConfigResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: string | null;
};

export type MetaAdsSummaryResponse = {
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
  lastSyncAt: string | null;
};

export type MetaAdsCampaign = {
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

export type MetaAdsCampaignsResponse = {
  data: MetaAdsCampaign[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type MetaAdsInsightLevel = "ACCOUNT" | "CAMPAIGN" | "ADSET" | "AD";

export type MetaAdsInsightItem = {
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

export type MetaAdsInsightsResponse = {
  data: MetaAdsInsightItem[];
  level: MetaAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type MetaAdsPixelStatusResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  adAccountId: string | null;
  pixelId: string | null;
  lastSyncAt: string | null;
  lastInsightAt: string | null;
  eventStatus: "ACTIVE" | "NO_DATA" | "NOT_CONFIGURED" | "CONNECTION_ERROR";
  setupWarning: string | null;
  syncError: string | null;
};

export type MetaAdsSyncResponse = {
  success: true;
  syncedAt: string;
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
  lastSyncAt: string | null;
  syncStatus: MetaAdsSyncStatus;
  skippedReason: string | null;
};

export type MetaAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  status: MetaAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Record<string, unknown> | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: MetaAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsReportsResponse = {
  data: MetaAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

export type MetaAdsAdSetAudience = {
  adSetId: string;
  adSetName: string | null;
  status: string | null;
  effectiveStatus: string | null;
  ageMin: number | null;
  ageMax: number | null;
  genders: string[];
  countries: string[];
  interests: string[];
  customAudiences: string[];
  lookalikeAudiences: string[];
};

export type MetaAdsAudiencesResponse = {
  data: MetaAdsAdSetAudience[];
  lastSyncAt: string | null;
};

export type MetaAdsAdCreative = {
  adId: string;
  adName: string | null;
  status: string | null;
  effectiveStatus: string | null;
  creativeId: string | null;
  title: string | null;
  body: string | null;
  thumbnailUrl: string | null;
  callToActionType: string | null;
  imageHash: string | null;
};

export type MetaAdsAdCreativesResponse = {
  data: MetaAdsAdCreative[];
  lastSyncAt: string | null;
};

export type MetaAdsAiCommentary = {
  generalAnalysis: string;
  campaignHighlights: string;
  audienceInsights: string;
  creativeInsights: string;
  recommendations: string[];
  generatedAt: string;
  isHeuristic: boolean;
};
