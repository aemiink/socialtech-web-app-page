import { baseApi } from "../../services/baseApi";
import type {
  MetaAdsCampaign,
  MetaAdsCampaignsResponse,
  MetaAdsInsightItem,
  MetaAdsInsightLevel,
  MetaAdsInsightsResponse,
  MetaAdsPixelStatusResponse,
  MetaAdsSummaryResponse,
  OwnMetaAdsConfigResponse,
} from "./metaAdsTypes";

export type MetaAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type MetaAdsCampaignsQuery = MetaAdsDateRangeQuery & {
  limit?: number;
};

export type MetaAdsInsightsQuery = MetaAdsDateRangeQuery & {
  level?: MetaAdsInsightLevel;
  limit?: number;
};

export const metaAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnMetaAdsConfig: builder.query<OwnMetaAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/meta-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsConfigResponse(response),
    }),
    getOwnMetaAdsSummary: builder.query<MetaAdsSummaryResponse, MetaAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/summary",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsSummaryResponse(response),
    }),
    getOwnMetaAdsCampaigns: builder.query<MetaAdsCampaignsResponse, MetaAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/campaigns",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsCampaignsResponse(response),
    }),
    getOwnMetaAdsAdSets: builder.query<MetaAdsInsightsResponse, MetaAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/adsets",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsInsightsResponse(response),
    }),
    getOwnMetaAdsAds: builder.query<MetaAdsInsightsResponse, MetaAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/ads",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsInsightsResponse(response),
    }),
    getOwnMetaAdsInsights: builder.query<MetaAdsInsightsResponse, MetaAdsInsightsQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/insights",
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsInsightsResponse(response),
    }),
    getOwnMetaAdsPixelStatus: builder.query<MetaAdsPixelStatusResponse, void>({
      query: () => ({
        url: "/clients/me/meta-ads/pixel-status",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsPixelStatusResponse(response),
    }),
  }),
});

export const {
  useGetOwnMetaAdsConfigQuery,
  useGetOwnMetaAdsSummaryQuery,
  useGetOwnMetaAdsCampaignsQuery,
  useGetOwnMetaAdsAdSetsQuery,
  useGetOwnMetaAdsAdsQuery,
  useGetOwnMetaAdsInsightsQuery,
  useGetOwnMetaAdsPixelStatusQuery,
} = metaAdsApi;

function normalizeOwnMetaAdsConfigResponse(response: unknown): OwnMetaAdsConfigResponse {
  const candidate =
    isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      connectionStatus: "NOT_CONNECTED",
      lastSyncAt: null,
    };
  }

  return {
    connectionStatus: normalizeConnectionStatus(candidate.connectionStatus),
    lastSyncAt: typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeConnectionStatus(value: unknown): OwnMetaAdsConfigResponse["connectionStatus"] {
  if (value === "CONNECTED") {
    return "CONNECTED";
  }

  if (value === "PENDING") {
    return "PENDING";
  }

  if (value === "ERROR") {
    return "ERROR";
  }

  if (value === "DISCONNECTED") {
    return "DISCONNECTED";
  }

  return "NOT_CONNECTED";
}

function normalizeOwnMetaAdsSummaryResponse(response: unknown): MetaAdsSummaryResponse {
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
    frequency: readNumber(candidate, "frequency"),
    results: readNumber(candidate, "results", 0, true),
    costPerResult: readNumber(candidate, "costPerResult"),
    roas: readNullableNumber(candidate, "roas"),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnMetaAdsCampaignsResponse(response: unknown): MetaAdsCampaignsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeCampaignRow).filter((item): item is MetaAdsCampaign => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnMetaAdsInsightsResponse(response: unknown): MetaAdsInsightsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeInsightRow).filter((item): item is MetaAdsInsightItem => item !== null),
    level: normalizeInsightLevel(isRecord(candidate) ? candidate.level : undefined),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnMetaAdsPixelStatusResponse(response: unknown): MetaAdsPixelStatusResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  return {
    connectionStatus: normalizeConnectionStatus(isRecord(candidate) ? candidate.connectionStatus : undefined),
    adAccountId: isRecord(candidate) && typeof candidate.adAccountId === "string" ? candidate.adAccountId : null,
    pixelId: isRecord(candidate) && typeof candidate.pixelId === "string" ? candidate.pixelId : null,
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
    lastInsightAt: isRecord(candidate) && typeof candidate.lastInsightAt === "string" ? candidate.lastInsightAt : null,
    eventStatus: normalizePixelEventStatus(isRecord(candidate) ? candidate.eventStatus : undefined),
    setupWarning: isRecord(candidate) && typeof candidate.setupWarning === "string" ? candidate.setupWarning : null,
    syncError: isRecord(candidate) && typeof candidate.syncError === "string" ? candidate.syncError : null,
  };
}

function normalizeCampaignRow(value: unknown): MetaAdsCampaign | null {
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
    effectiveStatus: typeof value.effectiveStatus === "string" ? value.effectiveStatus : "UNKNOWN",
    spend: readNumber(value, "spend"),
    impressions: readNumber(value, "impressions", 0, true),
    clicks: readNumber(value, "clicks", 0, true),
    ctr: readNumber(value, "ctr"),
    cpc: readNumber(value, "cpc"),
    results: readNumber(value, "results", 0, true),
    roas: readNullableNumber(value, "roas"),
  };
}

function normalizeInsightRow(value: unknown): MetaAdsInsightItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    date: typeof value.date === "string" ? value.date : "",
    level: normalizeInsightLevel(value.level),
    entityId: typeof value.entityId === "string" ? value.entityId : null,
    entityName: typeof value.entityName === "string" ? value.entityName : null,
    spend: readNumber(value, "spend"),
    impressions: readNumber(value, "impressions", 0, true),
    reach: readNumber(value, "reach", 0, true),
    clicks: readNumber(value, "clicks", 0, true),
    ctr: readNumber(value, "ctr"),
    cpc: readNumber(value, "cpc"),
    cpm: readNumber(value, "cpm"),
    frequency: readNumber(value, "frequency"),
    results: readNumber(value, "results", 0, true),
    costPerResult: readNumber(value, "costPerResult"),
    purchaseValue: readNumber(value, "purchaseValue"),
    roas: readNullableNumber(value, "roas"),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function serializeDateRangeQuery(
  query: MetaAdsDateRangeQuery | void,
): Record<string, string> {
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

function serializeCampaignsQuery(
  query: MetaAdsCampaignsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = serializeDateRangeQuery(query);
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }
  return params;
}

function serializeInsightsQuery(
  query: MetaAdsInsightsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = serializeCampaignsQuery(query);
  if (typeof query.level === "string" && query.level.trim().length > 0) {
    params.level = query.level.trim().toUpperCase();
  }
  return params;
}

function normalizeInsightLevel(value: unknown): MetaAdsInsightLevel {
  if (value === "ACCOUNT" || value === "CAMPAIGN" || value === "ADSET" || value === "AD") {
    return value;
  }

  return "ACCOUNT";
}

function normalizePixelEventStatus(
  value: unknown,
): MetaAdsPixelStatusResponse["eventStatus"] {
  if (
    value === "ACTIVE" ||
    value === "NO_DATA" ||
    value === "NOT_CONFIGURED" ||
    value === "CONNECTION_ERROR"
  ) {
    return value;
  }

  return "NO_DATA";
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

function readNullableNumber(source: unknown, key: string): number | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
