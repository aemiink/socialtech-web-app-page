import { baseApi } from "../../services/baseApi";
import type {
  OwnTikTokAdsConfigResponse,
  TikTokAdsCampaign,
  TikTokAdsCampaignsResponse,
  TikTokAdsInsightItem,
  TikTokAdsInsightLevel,
  TikTokAdsInsightsResponse,
  TikTokAdsSummaryResponse,
  TikTokAdsSyncResponse,
} from "./tiktokAdsTypes";

export type TikTokAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type TikTokAdsCampaignsQuery = TikTokAdsDateRangeQuery & {
  limit?: number;
};

export type TikTokAdsInsightsQuery = TikTokAdsDateRangeQuery & {
  level?: TikTokAdsInsightLevel;
  limit?: number;
};

const tiktokAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnTikTokAdsConfig: build.query<OwnTikTokAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/tiktok-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnTikTokAdsConfigResponse(response),
      providesTags: ["TikTokAdsConfig"],
    }),
    getOwnTikTokAdsSummary: build.query<TikTokAdsSummaryResponse, TikTokAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/tiktok-ads/summary",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnTikTokAdsSummaryResponse(response),
      providesTags: ["TikTokAdsConfig"],
    }),
    getOwnTikTokAdsCampaigns: build.query<TikTokAdsCampaignsResponse, TikTokAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/tiktok-ads/campaigns",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnTikTokAdsCampaignsResponse(response),
      providesTags: ["TikTokAdsConfig"],
    }),
    getOwnTikTokAdsInsights: build.query<TikTokAdsInsightsResponse, TikTokAdsInsightsQuery | void>({
      query: (query) => ({
        url: "/clients/me/tiktok-ads/insights",
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnTikTokAdsInsightsResponse(response),
      providesTags: ["TikTokAdsConfig"],
    }),
    syncOwnTikTokAds: build.mutation<TikTokAdsSyncResponse, TikTokAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/tiktok-ads/sync",
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnTikTokAdsSyncResponse(response),
      invalidatesTags: ["TikTokAdsConfig"],
    }),
  }),
});

export const {
  useGetOwnTikTokAdsConfigQuery,
  useGetOwnTikTokAdsSummaryQuery,
  useGetOwnTikTokAdsCampaignsQuery,
  useGetOwnTikTokAdsInsightsQuery,
  useSyncOwnTikTokAdsMutation,
} = tiktokAdsApi;

function normalizeOwnTikTokAdsConfigResponse(response: unknown): OwnTikTokAdsConfigResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      connectionStatus: "NOT_CONNECTED",
      hasConfig: false,
      advertiserId: null,
      lastSyncAt: null,
    };
  }

  return {
    connectionStatus: normalizeConnectionStatus(candidate.connectionStatus),
    hasConfig: candidate.hasConfig === true,
    advertiserId: typeof candidate.advertiserId === "string" ? candidate.advertiserId : null,
    lastSyncAt: typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnTikTokAdsSummaryResponse(response: unknown): TikTokAdsSummaryResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    spend: readNumber(candidate, "spend"),
    impressions: readNumber(candidate, "impressions", 0, true),
    reach: readNumber(candidate, "reach", 0, true),
    clicks: readNumber(candidate, "clicks", 0, true),
    ctr: readNumber(candidate, "ctr"),
    cpc: readNumber(candidate, "cpc"),
    cpm: readNumber(candidate, "cpm"),
    videoViews: readNumber(candidate, "videoViews", 0, true),
    videoViews2s: readNumber(candidate, "videoViews2s", 0, true),
    videoViews6s: readNumber(candidate, "videoViews6s", 0, true),
    videoCompletionRate: readNumber(candidate, "videoCompletionRate"),
    vtr: readNumber(candidate, "vtr"),
    conversions: readNumber(candidate, "conversions", 0, true),
    costPerConversion: readNumber(candidate, "costPerConversion"),
    conversionRate: readNumber(candidate, "conversionRate"),
    purchaseValue: readNumber(candidate, "purchaseValue"),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnTikTokAdsCampaignsResponse(response: unknown): TikTokAdsCampaignsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeCampaignRow).filter((item): item is TikTokAdsCampaign => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnTikTokAdsInsightsResponse(response: unknown): TikTokAdsInsightsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeInsightRow).filter((item): item is TikTokAdsInsightItem => item !== null),
    level: normalizeInsightLevel(isRecord(candidate) ? candidate.level : undefined),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnTikTokAdsSyncResponse(response: unknown): TikTokAdsSyncResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};
  const inserted = isRecord(candidate) && isRecord(candidate.inserted) ? candidate.inserted : {};

  return {
    success: true,
    syncedAt: isRecord(candidate) && typeof candidate.syncedAt === "string" ? candidate.syncedAt : "",
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    inserted: {
      account: readNumber(inserted, "account", 0, true),
      campaigns: readNumber(inserted, "campaigns", 0, true),
      adGroups: readNumber(inserted, "adGroups", 0, true),
      ads: readNumber(inserted, "ads", 0, true),
      total: readNumber(inserted, "total", 0, true),
    },
    connectionStatus: normalizeConnectionStatus(isRecord(candidate) ? candidate.connectionStatus : undefined),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
    syncStatus: normalizeSyncStatus(isRecord(candidate) ? candidate.syncStatus : undefined),
    skippedReason:
      isRecord(candidate) && typeof candidate.skippedReason === "string" ? candidate.skippedReason : null,
  };
}

function normalizeCampaignRow(value: unknown): TikTokAdsCampaign | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    objective: typeof value.objective === "string" ? value.objective : "UNSPECIFIED",
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    spend: readNumber(value, "spend"),
    impressions: readNumber(value, "impressions", 0, true),
    clicks: readNumber(value, "clicks", 0, true),
    ctr: readNumber(value, "ctr"),
    cpc: readNumber(value, "cpc"),
    videoViews: readNumber(value, "videoViews", 0, true),
    conversions: readNumber(value, "conversions", 0, true),
    costPerConversion: readNumber(value, "costPerConversion"),
    purchaseValue: readNumber(value, "purchaseValue"),
  };
}

function normalizeInsightRow(value: unknown): TikTokAdsInsightItem | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    date: typeof value.date === "string" ? value.date : "",
    level: normalizeInsightLevel(value.level),
    entityId: typeof value.entityId === "string" ? value.entityId : "",
    entityName: typeof value.entityName === "string" ? value.entityName : null,
    spend: readNumber(value, "spend"),
    impressions: readNumber(value, "impressions", 0, true),
    reach: readNumber(value, "reach", 0, true),
    clicks: readNumber(value, "clicks", 0, true),
    ctr: readNumber(value, "ctr"),
    cpc: readNumber(value, "cpc"),
    cpm: readNumber(value, "cpm"),
    videoViews: readNumber(value, "videoViews", 0, true),
    videoViews2s: readNumber(value, "videoViews2s", 0, true),
    videoViews6s: readNumber(value, "videoViews6s", 0, true),
    videoCompletionRate: readNumber(value, "videoCompletionRate"),
    vtr: readNumber(value, "vtr"),
    conversions: readNumber(value, "conversions", 0, true),
    costPerConversion: readNumber(value, "costPerConversion"),
    conversionRate: readNumber(value, "conversionRate"),
    purchaseValue: readNumber(value, "purchaseValue"),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function serializeDateRangeQuery(query: TikTokAdsDateRangeQuery | void): Record<string, string> {
  if (!query) {
    return {};
  }

  const params: Record<string, string> = {};
  if (typeof query.since === "string" && query.since.trim().length > 0) {
    params.since = query.since.trim();
  }
  if (typeof query.until === "string" && query.until.trim().length > 0) {
    params.until = query.until.trim();
  }
  return params;
}

function serializeCampaignsQuery(query: TikTokAdsCampaignsQuery | void): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = serializeDateRangeQuery(query);
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }
  return params;
}

function serializeInsightsQuery(query: TikTokAdsInsightsQuery | void): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = serializeCampaignsQuery(query);
  if (typeof query.level === "string" && query.level.trim().length > 0) {
    params.level = query.level.trim().toUpperCase();
  }
  return params;
}

function normalizeConnectionStatus(value: unknown): OwnTikTokAdsConfigResponse["connectionStatus"] {
  if (
    value === "CONNECTED" ||
    value === "PENDING" ||
    value === "ERROR" ||
    value === "DISCONNECTED"
  ) {
    return value;
  }

  return "NOT_CONNECTED";
}

function normalizeInsightLevel(value: unknown): TikTokAdsInsightLevel {
  if (value === "ACCOUNT" || value === "CAMPAIGN" || value === "ADGROUP" || value === "AD") {
    return value;
  }

  return "ACCOUNT";
}

function normalizeSyncStatus(value: unknown): TikTokAdsSyncResponse["syncStatus"] {
  if (
    value === "RUNNING" ||
    value === "SUCCESS" ||
    value === "FAILED" ||
    value === "PARTIAL" ||
    value === "SKIPPED"
  ) {
    return value;
  }

  return "SUCCESS";
}

function readNumber(
  source: unknown,
  key: string,
  fallback = 0,
  integer = false,
): number {
  if (!isRecord(source)) {
    return fallback;
  }

  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return integer ? Math.trunc(value) : value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) {
      return integer ? Math.trunc(parsed) : parsed;
    }
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
