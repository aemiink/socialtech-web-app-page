export type GoogleAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type GoogleAdsInsightLevel = "ACCOUNT" | "CAMPAIGN" | "AD_GROUP" | "AD";

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
