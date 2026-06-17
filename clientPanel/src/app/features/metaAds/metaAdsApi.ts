import { baseApi } from "../../services/baseApi";
import type {
  MetaAdsAdCreative,
  MetaAdsAdCreativesResponse,
  MetaAdsAdSetAudience,
  MetaAdsAiCommentary,
  MetaAdsAudiencesResponse,
  MetaAdsCampaign,
  MetaAdsCampaignsResponse,
  MetaAdsInsightItem,
  MetaAdsInsightLevel,
  MetaAdsInsightsResponse,
  MetaAdsPixelStatusResponse,
  MetaAdsReportItem,
  MetaAdsReportsResponse,
  MetaAdsReportStatus,
  MetaAdsReportType,
  MetaAdsSyncResponse,
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

export type MetaAdsReportsQuery = {
  status?: MetaAdsReportStatus;
  type?: MetaAdsReportType;
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
    syncOwnMetaAds: builder.mutation<MetaAdsSyncResponse, MetaAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/sync",
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsSyncResponse(response),
    }),
    getOwnMetaAdsReports: builder.query<MetaAdsReportsResponse, MetaAdsReportsQuery | void>({
      query: (query) => ({
        url: "/clients/me/meta-ads/reports",
        method: "GET",
        params: serializeReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsReportsResponse(response),
    }),
    getOwnMetaAdsAudiences: builder.query<MetaAdsAudiencesResponse, void>({
      query: () => ({
        url: "/clients/me/meta-ads/audiences",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsAudiencesResponse(response),
    }),
    getOwnMetaAdsAdCreatives: builder.query<MetaAdsAdCreativesResponse, void>({
      query: () => ({
        url: "/clients/me/meta-ads/ad-creatives",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsAdCreativesResponse(response),
    }),
    getOwnMetaAdsAiCommentary: builder.query<MetaAdsAiCommentary, void>({
      query: () => ({
        url: "/clients/me/meta-ads/ai-commentary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAiCommentaryResponse(response),
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
  useSyncOwnMetaAdsMutation,
  useGetOwnMetaAdsReportsQuery,
  useGetOwnMetaAdsAudiencesQuery,
  useGetOwnMetaAdsAdCreativesQuery,
  useGetOwnMetaAdsAiCommentaryQuery,
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

function normalizeOwnMetaAdsSyncResponse(response: unknown): MetaAdsSyncResponse {
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
      total: readNumber(inserted, "total", 0, true),
    },
    connectionStatus: normalizeConnectionStatus(isRecord(candidate) ? candidate.connectionStatus : undefined),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
    syncStatus: normalizeSyncStatus(isRecord(candidate) ? candidate.syncStatus : undefined),
    skippedReason:
      isRecord(candidate) && typeof candidate.skippedReason === "string" ? candidate.skippedReason : null,
  };
}

function normalizeOwnMetaAdsReportsResponse(response: unknown): MetaAdsReportsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: rows.map(normalizeReportRow).filter((item): item is MetaAdsReportItem => item !== null),
    meta: {
      total: readNumber(meta, "total", 0, true),
      draft: readNumber(meta, "draft", 0, true),
      published: readNumber(meta, "published", 0, true),
      clientVisible: readNumber(meta, "clientVisible", 0, true),
    },
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

function serializeReportsQuery(
  query: MetaAdsReportsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {};
  if (typeof query.status === "string" && query.status.trim().length > 0) {
    params.status = query.status.trim().toUpperCase();
  }
  if (typeof query.type === "string" && query.type.trim().length > 0) {
    params.type = query.type.trim().toUpperCase();
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }
  return params;
}

function normalizeReportRow(value: unknown): MetaAdsReportItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    clientProfileId: typeof value.clientProfileId === "string" ? value.clientProfileId : "",
    projectId: typeof value.projectId === "string" ? value.projectId : null,
    projectName: typeof value.projectName === "string" ? value.projectName : null,
    periodStart: typeof value.periodStart === "string" ? value.periodStart : "",
    periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : "",
    type: normalizeReportType(value.type),
    status: normalizeReportStatus(value.status),
    summary: typeof value.summary === "string" ? value.summary : null,
    metricsSnapshot: isRecord(value.metricsSnapshot) ? value.metricsSnapshot : null,
    clientVisible: value.clientVisible === true,
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : null,
    acknowledgementRequestedAt:
      typeof value.acknowledgementRequestedAt === "string" ? value.acknowledgementRequestedAt : null,
    acknowledgedAt: typeof value.acknowledgedAt === "string" ? value.acknowledgedAt : null,
    acknowledgementStatus: normalizeReportAcknowledgementStatus(value.acknowledgementStatus),
    acknowledgementTaskId: typeof value.acknowledgementTaskId === "string" ? value.acknowledgementTaskId : null,
    acknowledgementTaskUpdatedAt:
      typeof value.acknowledgementTaskUpdatedAt === "string" ? value.acknowledgementTaskUpdatedAt : null,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
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

function normalizeSyncStatus(value: unknown): MetaAdsSyncResponse["syncStatus"] {
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

function normalizeReportType(value: unknown): MetaAdsReportType {
  if (
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "CAMPAIGN_PERFORMANCE" ||
    value === "CREATIVE_PERFORMANCE" ||
    value === "BUDGET_RECOMMENDATION"
  ) {
    return value;
  }

  return "WEEKLY";
}

function normalizeReportStatus(value: unknown): MetaAdsReportStatus {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "DRAFT";
}

function normalizeReportAcknowledgementStatus(value: unknown): MetaAdsReportItem["acknowledgementStatus"] {
  if (
    value === "NOT_REQUESTED" ||
    value === "PENDING" ||
    value === "ACKNOWLEDGED" ||
    value === "CHANGES_REQUESTED"
  ) {
    return value;
  }

  return "NOT_REQUESTED";
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

function normalizeOwnMetaAdsAudiencesResponse(response: unknown): MetaAdsAudiencesResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  return {
    data: rows.map(normalizeAdSetAudienceRow).filter((x): x is MetaAdsAdSetAudience => x !== null),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeAdSetAudienceRow(value: unknown): MetaAdsAdSetAudience | null {
  if (!isRecord(value) || typeof value.adSetId !== "string") return null;
  return {
    adSetId: value.adSetId,
    adSetName: typeof value.adSetName === "string" ? value.adSetName : null,
    status: typeof value.status === "string" ? value.status : null,
    effectiveStatus: typeof value.effectiveStatus === "string" ? value.effectiveStatus : null,
    ageMin: typeof value.ageMin === "number" ? value.ageMin : null,
    ageMax: typeof value.ageMax === "number" ? value.ageMax : null,
    genders: Array.isArray(value.genders) ? value.genders.filter((g): g is string => typeof g === "string") : [],
    countries: Array.isArray(value.countries) ? value.countries.filter((c): c is string => typeof c === "string") : [],
    interests: Array.isArray(value.interests) ? value.interests.filter((i): i is string => typeof i === "string") : [],
    customAudiences: Array.isArray(value.customAudiences) ? value.customAudiences.filter((a): a is string => typeof a === "string") : [],
    lookalikeAudiences: Array.isArray(value.lookalikeAudiences) ? value.lookalikeAudiences.filter((a): a is string => typeof a === "string") : [],
  };
}

function normalizeOwnMetaAdsAdCreativesResponse(response: unknown): MetaAdsAdCreativesResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  return {
    data: rows.map(normalizeAdCreativeRow).filter((x): x is MetaAdsAdCreative => x !== null),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeAdCreativeRow(value: unknown): MetaAdsAdCreative | null {
  if (!isRecord(value) || typeof value.adId !== "string") return null;
  return {
    adId: value.adId,
    adName: typeof value.adName === "string" ? value.adName : null,
    status: typeof value.status === "string" ? value.status : null,
    effectiveStatus: typeof value.effectiveStatus === "string" ? value.effectiveStatus : null,
    creativeId: typeof value.creativeId === "string" ? value.creativeId : null,
    title: typeof value.title === "string" ? value.title : null,
    body: typeof value.body === "string" ? value.body : null,
    thumbnailUrl: typeof value.thumbnailUrl === "string" ? value.thumbnailUrl : null,
    callToActionType: typeof value.callToActionType === "string" ? value.callToActionType : null,
    imageHash: typeof value.imageHash === "string" ? value.imageHash : null,
  };
}

function normalizeAiCommentaryResponse(response: unknown): MetaAdsAiCommentary {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  if (!isRecord(candidate)) {
    return { generalAnalysis: "", campaignHighlights: "", audienceInsights: "", creativeInsights: "", recommendations: [], generatedAt: new Date().toISOString(), isHeuristic: true };
  }
  return {
    generalAnalysis: typeof candidate.generalAnalysis === "string" ? candidate.generalAnalysis : "",
    campaignHighlights: typeof candidate.campaignHighlights === "string" ? candidate.campaignHighlights : "",
    audienceInsights: typeof candidate.audienceInsights === "string" ? candidate.audienceInsights : "",
    creativeInsights: typeof candidate.creativeInsights === "string" ? candidate.creativeInsights : "",
    recommendations: Array.isArray(candidate.recommendations) ? candidate.recommendations.filter((r): r is string => typeof r === "string") : [],
    generatedAt: typeof candidate.generatedAt === "string" ? candidate.generatedAt : new Date().toISOString(),
    isHeuristic: typeof candidate.isHeuristic === "boolean" ? candidate.isHeuristic : true,
  };
}
