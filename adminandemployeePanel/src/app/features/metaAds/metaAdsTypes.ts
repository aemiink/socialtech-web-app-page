export type MetaAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type AssignedMetaAdsConfigResponse = {
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
