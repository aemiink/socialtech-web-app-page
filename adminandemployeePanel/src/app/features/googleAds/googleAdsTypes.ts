export type GoogleAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type GoogleAdsInsightLevel = "ACCOUNT" | "CAMPAIGN" | "AD_GROUP" | "AD";

export type GoogleAdsReportType =
  | "WEEKLY"
  | "MONTHLY"
  | "CAMPAIGN_PERFORMANCE"
  | "SEARCH_TERMS"
  | "KEYWORD_PERFORMANCE"
  | "BUDGET_RECOMMENDATION"
  | "CONVERSION_TRACKING";

export type GoogleAdsReportStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type GoogleAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type AssignedGoogleAdsConfigResponse = {
  clientProfileId: string;
  connectionStatus: GoogleAdsConnectionStatus;
  account: {
    customerId: string | null;
    managerCustomerId: string | null;
    descriptiveName: string | null;
    currencyCode: string | null;
    timeZone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
};

export type GoogleAdsSummaryResponse = {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number | null;
  ctr: number;
  averageCpc: number;
  costPerConversion: number | null;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsCampaign = {
  id: string;
  name: string;
  channelType: string;
  status: string;
  servingStatus: string | null;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
};

export type GoogleAdsCampaignsResponse = {
  data: GoogleAdsCampaign[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsKeyword = {
  id: string;
  keywordText: string;
  matchType: string;
  campaignName: string;
  adGroupName: string;
  status: string;
  cost: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
};

export type GoogleAdsKeywordsResponse = {
  data: GoogleAdsKeyword[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsConversion = {
  id: string;
  conversionAction: string;
  conversions: number;
  conversionValue: number | null;
  costPerConversion: number | null;
  conversionRate: number;
};

export type GoogleAdsConversionsResponse = {
  data: GoogleAdsConversion[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsSearchTerm = {
  id: string;
  searchTerm: string;
  campaignName: string;
  adGroupName: string;
  keywordText: string | null;
  cost: number;
  clicks: number;
  conversions: number;
  ctr: number;
};

export type GoogleAdsSearchTermsResponse = {
  data: GoogleAdsSearchTerm[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsInsightItem = {
  id: string;
  date: string;
  level: GoogleAdsInsightLevel;
  entityId: string | null;
  entityName: string | null;
  cost: number;
  costMicros: string;
  impressions: number;
  clicks: number;
  interactions: number;
  conversions: number;
  conversionValue: number | null;
  ctr: number;
  averageCpc: number;
  costPerConversion: number | null;
  updatedAt: string;
};

export type GoogleAdsInsightsResponse = {
  data: GoogleAdsInsightItem[];
  level: GoogleAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type GoogleAdsSyncResponse = {
  success: true;
  syncedAt: string;
  dateRange: {
    since: string;
    until: string;
  };
  inserted: {
    account: number;
    campaigns: number;
    adGroups: number;
    ads: number;
    total: number;
  };
  connectionStatus: GoogleAdsConnectionStatus;
  lastSyncAt: string | null;
  syncStatus: "SUCCESS" | "PARTIAL" | "SKIPPED";
  skippedReason: string | null;
};

export type GoogleAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: GoogleAdsReportType;
  status: GoogleAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Record<string, unknown> | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: GoogleAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoogleAdsReportsResponse = {
  data: GoogleAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

export type GoogleAdsReportsQuery = {
  status?: GoogleAdsReportStatus;
  type?: GoogleAdsReportType;
  clientVisible?: boolean;
  limit?: number;
};

export type CreateGoogleAdsReportRequest = {
  projectId?: string;
  periodStart: string;
  periodEnd: string;
  type: GoogleAdsReportType;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};

export type UpdateGoogleAdsReportRequest = {
  status?: GoogleAdsReportStatus;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};
