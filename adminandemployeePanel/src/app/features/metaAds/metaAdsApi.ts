import { baseApi } from "../../services/baseApi";
import type {
  AssignedMetaAdsConfigResponse,
  MetaAdsCampaign,
  MetaAdsCampaignsResponse,
  MetaAdsInsightItem,
  MetaAdsInsightLevel,
  MetaAdsInsightsResponse,
  MetaAdsPixelStatusResponse,
  MetaAdsSummaryResponse,
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

type AssignedClientQueryArg<TQuery = void> = {
  clientId: string;
  query?: TQuery;
};

export const metaAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignedClientMetaAdsConfig: builder.query<
      AssignedMetaAdsConfigResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAssignedMetaAdsConfigResponse(response),
    }),
    getAssignedClientMetaAdsSummary: builder.query<
      MetaAdsSummaryResponse,
      AssignedClientQueryArg<MetaAdsDateRangeQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/summary`,
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsSummaryResponse(response),
    }),
    getAssignedClientMetaAdsCampaigns: builder.query<
      MetaAdsCampaignsResponse,
      AssignedClientQueryArg<MetaAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/campaigns`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsCampaignsResponse(response),
    }),
    getAssignedClientMetaAdsAdSets: builder.query<
      MetaAdsInsightsResponse,
      AssignedClientQueryArg<MetaAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/adsets`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsInsightsResponse(response),
    }),
    getAssignedClientMetaAdsAds: builder.query<
      MetaAdsInsightsResponse,
      AssignedClientQueryArg<MetaAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/ads`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsInsightsResponse(response),
    }),
    getAssignedClientMetaAdsInsights: builder.query<
      MetaAdsInsightsResponse,
      AssignedClientQueryArg<MetaAdsInsightsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/insights`,
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsInsightsResponse(response),
    }),
    getAssignedClientMetaAdsPixelStatus: builder.query<
      MetaAdsPixelStatusResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/pixel-status`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsPixelStatusResponse(response),
    }),
  }),
});

export const {
  useGetAssignedClientMetaAdsConfigQuery,
  useGetAssignedClientMetaAdsSummaryQuery,
  useGetAssignedClientMetaAdsCampaignsQuery,
  useGetAssignedClientMetaAdsAdSetsQuery,
  useGetAssignedClientMetaAdsAdsQuery,
  useGetAssignedClientMetaAdsInsightsQuery,
  useGetAssignedClientMetaAdsPixelStatusQuery,
} = metaAdsApi;

function normalizeAssignedMetaAdsConfigResponse(response: unknown): AssignedMetaAdsConfigResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

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

function normalizeConnectionStatus(
  value: unknown,
): AssignedMetaAdsConfigResponse["connectionStatus"] {
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

function normalizeMetaAdsSummaryResponse(response: unknown): MetaAdsSummaryResponse {
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

function normalizeMetaAdsCampaignsResponse(response: unknown): MetaAdsCampaignsResponse {
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

function normalizeMetaAdsInsightsResponse(response: unknown): MetaAdsInsightsResponse {
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

function normalizeMetaAdsPixelStatusResponse(response: unknown): MetaAdsPixelStatusResponse {
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

function serializeDateRangeQuery(query: MetaAdsDateRangeQuery | void): Record<string, string> {
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

function normalizePixelEventStatus(value: unknown): MetaAdsPixelStatusResponse["eventStatus"] {
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

  return fallback;
}

function readNullableNumber(source: unknown, key: string): number | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
