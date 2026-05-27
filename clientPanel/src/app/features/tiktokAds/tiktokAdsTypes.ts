export type TikTokAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type TikTokAdsSyncStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "SKIPPED";

export type TikTokAdsInsightLevel = "ACCOUNT" | "CAMPAIGN" | "ADGROUP" | "AD";

export type OwnTikTokAdsConfigResponse = {
  connectionStatus: TikTokAdsConnectionStatus;
  hasConfig: boolean;
  advertiserId: string | null;
  lastSyncAt: string | null;
};

export type TikTokAdsSummaryResponse = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  videoViews: number;
  videoViews2s: number;
  videoViews6s: number;
  videoCompletionRate: number;
  vtr: number;
  conversions: number;
  costPerConversion: number;
  conversionRate: number;
  purchaseValue: number;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type TikTokAdsCampaign = {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  videoViews: number;
  conversions: number;
  costPerConversion: number;
  purchaseValue: number;
};

export type TikTokAdsCampaignsResponse = {
  data: TikTokAdsCampaign[];
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type TikTokAdsInsightItem = {
  id: string;
  date: string;
  level: TikTokAdsInsightLevel;
  entityId: string;
  entityName: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  videoViews: number;
  videoViews2s: number;
  videoViews6s: number;
  videoCompletionRate: number;
  vtr: number;
  conversions: number;
  costPerConversion: number;
  conversionRate: number;
  purchaseValue: number;
  updatedAt: string;
};

export type TikTokAdsInsightsResponse = {
  data: TikTokAdsInsightItem[];
  level: TikTokAdsInsightLevel;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type TikTokAdsSyncResponse = {
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
  connectionStatus: TikTokAdsConnectionStatus;
  lastSyncAt: string | null;
  syncStatus: TikTokAdsSyncStatus;
  skippedReason: string | null;
};
