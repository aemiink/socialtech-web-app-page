import type { ClientStatus, PurchasedServiceStatus } from "../clients/clientsTypes";

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

export interface TikTokAdsConfig {
  id: string;
  clientProfileId: string;
  advertiserId: string | null;
  businessCenterId: string | null;
  pixelId: string | null;
  advertiserName: string | null;
  currency: string | null;
  timezone: string | null;
  connectionStatus: TikTokAdsConnectionStatus;
  lastSyncAt: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTikTokAdsConnection {
  clientProfileId: string;
  connectionStatus: TikTokAdsConnectionStatus;
  hasActiveService: boolean;
  ids: {
    advertiserId: string | null;
    businessCenterId: string | null;
    pixelId: string | null;
  };
  account: {
    advertiserName: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  credential: {
    hasToken: boolean;
    tokenLastUpdatedAt: string | null;
    tokenExpiresAt: string | null;
    grantedScopes: string[];
  };
}

export interface UpdateTikTokAdsConfigPayload {
  advertiserId?: string | null;
  businessCenterId?: string | null;
  pixelId?: string | null;
  advertiserName?: string | null;
  currency?: string | null;
  timezone?: string | null;
  connectionStatus?: TikTokAdsConnectionStatus;
}

export interface ConnectManualTikTokAdsPayload {
  accessToken: string;
  advertiserId: string;
  businessCenterId?: string;
  pixelId?: string;
  advertiserName?: string;
  currency?: string;
  timezone?: string;
  tokenExpiresAt?: string;
  grantedScopes?: string[];
}

export interface TestTikTokAdsConnectionPayload {
  accessToken?: string;
  advertiserId?: string;
}

export interface TestTikTokAdsConnectionResponse {
  success: true;
  checkedAt: string;
  connection: AdminTikTokAdsConnection;
  account: {
    advertiserId: string;
    advertiserName: string | null;
    currency: string | null;
    timezone: string | null;
  };
  grantedScopes: string[];
}

export type TikTokAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type AdminTikTokAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: ClientStatus;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: TikTokAdsConnectionStatus;
  hasToken: boolean;
  ids: {
    advertiserId: string | null;
    businessCenterId: string | null;
    pixelId: string | null;
  };
  account: {
    advertiserName: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  spendSummary: {
    spend: number;
    impressions: number;
    clicks: number;
    videoViews: number;
    conversions: number;
    costPerConversion: number;
    purchaseValue: number;
  };
  pendingApprovals: number;
  assignedEmployees: Array<{
    userId: string;
    email: string;
    displayName: string | null;
    role: string;
    scope: string;
  }>;
  actionContext: {
    tiktokAdsProjectId: string | null;
  };
};

export type AdminTikTokAdsClientListResponse = {
  data: AdminTikTokAdsClientListItem[];
  dateRange: {
    since: string;
    until: string;
  };
  meta: {
    total: number;
    connected: number;
    error: number;
    pendingApprovals: number;
  };
};

export type TikTokAdsCampaignsQuery = TikTokAdsDateRangeQuery & {
  limit?: number;
};

export type TikTokAdsInsightsQuery = TikTokAdsDateRangeQuery & {
  level?: TikTokAdsInsightLevel;
  limit?: number;
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

export function getTikTokAdsConnectionStatusLabel(
  status: TikTokAdsConnectionStatus,
): string {
  const map: Record<TikTokAdsConnectionStatus, string> = {
    NOT_CONNECTED: "Bağlanmadı",
    PENDING: "Bekleniyor",
    CONNECTED: "Bağlı",
    ERROR: "Hata",
    DISCONNECTED: "Bağlantı Kesildi",
  };
  return map[status] ?? status;
}

export function getTikTokAdsConnectionStatusBadgeClass(
  status: TikTokAdsConnectionStatus,
): string {
  const map: Record<TikTokAdsConnectionStatus, string> = {
    NOT_CONNECTED: "bg-gray-500/20 text-gray-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",
    CONNECTED: "bg-green-500/20 text-green-400",
    ERROR: "bg-red-500/20 text-red-400",
    DISCONNECTED: "bg-orange-500/20 text-orange-400",
  };
  return map[status] ?? "bg-gray-500/20 text-gray-400";
}
