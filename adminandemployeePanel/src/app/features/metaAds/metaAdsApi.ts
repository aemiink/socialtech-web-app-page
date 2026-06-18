import { baseApi } from "../../services/baseApi";
import type {
  AssignedMetaAdsConfigResponse,
  CreateMetaAdsReportRequest,
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
  MetaAdsPixelChecklistItem,
  MetaAdsPixelEvent,
  MetaAdsPixelStatusResponse,
  MetaAdsPixelStatsResponse,
  MetaAdsReportItem,
  MetaAdsReportsQuery,
  MetaAdsReportsResponse,
  MetaAdsReportStatus,
  MetaAdsReportType,
  MetaAdsSummaryResponse,
  UpdateMetaAdsReportRequest,
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
    getAssignedClientMetaAdsReports: builder.query<
      MetaAdsReportsResponse,
      AssignedClientQueryArg<MetaAdsReportsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/meta-ads/clients/${clientId}/reports`,
        method: "GET",
        params: serializeReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportsResponse(response),
    }),
    createAssignedClientMetaAdsReport: builder.mutation<
      MetaAdsReportItem,
      { clientId: string; body: CreateMetaAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/meta-ads/clients/${clientId}/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportItemResponse(response),
    }),
    updateAssignedMetaAdsReport: builder.mutation<
      MetaAdsReportItem,
      { reportId: string; body: UpdateMetaAdsReportRequest }
    >({
      query: ({ reportId, body }) => ({
        url: `/meta-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportItemResponse(response),
    }),
    getAssignedClientMetaAdsAdCreatives: builder.query<
      MetaAdsAdCreativesResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/ad-creatives`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsAdCreativesResponse(response),
    }),
    getAssignedClientMetaAdsAudiences: builder.query<
      MetaAdsAudiencesResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/audiences`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsAudiencesResponse(response),
    }),
    getAssignedClientMetaAdsAiCommentary: builder.query<
      MetaAdsAiCommentary,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/ai-commentary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAiCommentaryResponse(response),
    }),
    getAssignedClientMetaAdsPixelStats: builder.query<
      MetaAdsPixelStatsResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/meta-ads/clients/${clientId}/pixel-stats`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizePixelStatsResponse(response),
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
  useGetAssignedClientMetaAdsReportsQuery,
  useCreateAssignedClientMetaAdsReportMutation,
  useUpdateAssignedMetaAdsReportMutation,
  useGetAssignedClientMetaAdsAdCreativesQuery,
  useGetAssignedClientMetaAdsAudiencesQuery,
  useGetAssignedClientMetaAdsAiCommentaryQuery,
  useGetAssignedClientMetaAdsPixelStatsQuery,
} = metaAdsApi;

function normalizeMetaAdsAudiencesResponse(response: unknown): MetaAdsAudiencesResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];

  return {
    data: rows.map(normalizeAdSetAudienceRow).filter((item): item is MetaAdsAdSetAudience => item !== null),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeAdSetAudienceRow(value: unknown): MetaAdsAdSetAudience | null {
  if (!isRecord(value)) return null;
  if (typeof value.adSetId !== "string") return null;

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

function normalizeMetaAdsAdCreativesResponse(response: unknown): MetaAdsAdCreativesResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];

  return {
    data: rows.map(normalizeAdCreativeRow).filter((item): item is MetaAdsAdCreative => item !== null),
    lastSyncAt: isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeAdCreativeRow(value: unknown): MetaAdsAdCreative | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.adId !== "string") {
    return null;
  }

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

function normalizeMetaAdsReportsResponse(response: unknown): MetaAdsReportsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: rows.map(normalizeMetaAdsReportItem).filter((item): item is MetaAdsReportItem => item !== null),
    meta: {
      total: readNumber(meta, "total", 0, true),
      draft: readNumber(meta, "draft", 0, true),
      published: readNumber(meta, "published", 0, true),
      clientVisible: readNumber(meta, "clientVisible", 0, true),
    },
  };
}

function normalizeMetaAdsReportItemResponse(response: unknown): MetaAdsReportItem {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const report = normalizeMetaAdsReportItem(candidate);
  if (!report) {
    throw new Error("Meta Ads report response could not be parsed.");
  }

  return report;
}

function normalizeMetaAdsReportItem(value: unknown): MetaAdsReportItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.clientProfileId !== "string" ||
    typeof value.periodStart !== "string" ||
    typeof value.periodEnd !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    clientProfileId: value.clientProfileId,
    projectId: typeof value.projectId === "string" ? value.projectId : null,
    projectName: typeof value.projectName === "string" ? value.projectName : null,
    periodStart: value.periodStart,
    periodEnd: value.periodEnd,
    type: normalizeReportType(value.type),
    status: normalizeReportStatus(value.status),
    summary: typeof value.summary === "string" ? value.summary : null,
    metricsSnapshot: isRecord(value.metricsSnapshot)
      ? value.metricsSnapshot
      : value.metricsSnapshot === null
        ? null
        : null,
    clientVisible: typeof value.clientVisible === "boolean" ? value.clientVisible : false,
    publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : null,
    acknowledgementRequestedAt:
      typeof value.acknowledgementRequestedAt === "string" ? value.acknowledgementRequestedAt : null,
    acknowledgedAt: typeof value.acknowledgedAt === "string" ? value.acknowledgedAt : null,
    acknowledgementStatus: normalizeAcknowledgementStatus(value.acknowledgementStatus),
    acknowledgementTaskId: typeof value.acknowledgementTaskId === "string" ? value.acknowledgementTaskId : null,
    acknowledgementTaskUpdatedAt:
      typeof value.acknowledgementTaskUpdatedAt === "string" ? value.acknowledgementTaskUpdatedAt : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
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

function serializeReportsQuery(
  query: MetaAdsReportsQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};
  if (query.status) {
    params.status = query.status;
  }
  if (query.type) {
    params.type = query.type;
  }
  if (query.clientVisible !== undefined) {
    params.clientVisible = query.clientVisible;
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
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

function normalizeAcknowledgementStatus(value: unknown): MetaAdsReportItem["acknowledgementStatus"] {
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

export function normalizePixelStatsResponse(response: unknown): MetaAdsPixelStatsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      pixelId: null,
      pixelName: null,
      createdAt: null,
      lastFiredAt: null,
      events: [],
      healthScore: 0,
      healthLevel: "critical",
      checklist: [],
    };
  }

  const rawEvents = Array.isArray(candidate.events) ? candidate.events : [];
  const events: MetaAdsPixelEvent[] = rawEvents
    .map((e): MetaAdsPixelEvent | null => {
      if (!isRecord(e)) return null;
      if (typeof e.name !== "string") return null;
      return { name: e.name, count: readNumber(e, "count", 0, true) };
    })
    .filter((e): e is MetaAdsPixelEvent => e !== null);

  const rawChecklist = Array.isArray(candidate.checklist) ? candidate.checklist : [];
  const checklist: MetaAdsPixelChecklistItem[] = rawChecklist
    .map((item): MetaAdsPixelChecklistItem | null => {
      if (!isRecord(item)) return null;
      if (typeof item.key !== "string" || typeof item.label !== "string") return null;
      const status = item.status === "ok" || item.status === "warning" || item.status === "error"
        ? item.status
        : "error";
      return {
        key: item.key,
        label: item.label,
        status,
        detail: typeof item.detail === "string" ? item.detail : null,
      };
    })
    .filter((item): item is MetaAdsPixelChecklistItem => item !== null);

  const rawScore = readNumber(candidate, "healthScore", 0);
  const healthScore = Math.min(100, Math.max(0, Math.trunc(rawScore)));

  const rawLevel = candidate.healthLevel;
  const healthLevel: MetaAdsPixelStatsResponse["healthLevel"] =
    rawLevel === "good" || rawLevel === "warning" || rawLevel === "critical"
      ? rawLevel
      : "critical";

  return {
    pixelId: typeof candidate.pixelId === "string" ? candidate.pixelId : null,
    pixelName: typeof candidate.pixelName === "string" ? candidate.pixelName : null,
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : null,
    lastFiredAt: typeof candidate.lastFiredAt === "string" ? candidate.lastFiredAt : null,
    events,
    healthScore,
    healthLevel,
    checklist,
  };
}
