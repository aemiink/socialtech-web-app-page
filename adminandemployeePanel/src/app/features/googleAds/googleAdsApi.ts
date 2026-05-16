import { baseApi } from "../../services/baseApi";
import type {
  AssignedGoogleAdsConfigResponse,
  CreateGoogleAdsReportRequest,
  GoogleAdsCampaign,
  GoogleAdsCampaignsResponse,
  GoogleAdsConnectionStatus,
  GoogleAdsConversion,
  GoogleAdsConversionsResponse,
  GoogleAdsInsightItem,
  GoogleAdsInsightLevel,
  GoogleAdsInsightsResponse,
  GoogleAdsKeyword,
  GoogleAdsKeywordsResponse,
  GoogleAdsReportItem,
  GoogleAdsReportsQuery,
  GoogleAdsReportsResponse,
  GoogleAdsReportStatus,
  GoogleAdsReportType,
  GoogleAdsSearchTerm,
  GoogleAdsSearchTermsResponse,
  GoogleAdsSummaryResponse,
  GoogleAdsSyncResponse,
  UpdateGoogleAdsReportRequest,
} from "./googleAdsTypes";

export type GoogleAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type GoogleAdsCampaignsQuery = GoogleAdsDateRangeQuery & {
  limit?: number;
};

export type GoogleAdsInsightsQuery = GoogleAdsDateRangeQuery & {
  level?: GoogleAdsInsightLevel;
  limit?: number;
};

type AssignedClientQueryArg<TQuery = void> = {
  clientId: string;
  query?: TQuery;
};

const ASSIGNED_GOOGLE_ADS_SCOPE_TAG_PREFIX = "GOOGLE_ADS_ASSIGNED_SCOPE";
const ASSIGNED_GOOGLE_ADS_REPORTS_TAG_PREFIX = "GOOGLE_ADS_ASSIGNED_REPORTS";
const ASSIGNED_GOOGLE_ADS_GLOBAL_TAG_ID = "GOOGLE_ADS_ASSIGNED_GLOBAL";
const ASSIGNED_GOOGLE_ADS_GLOBAL_TAG = {
  type: "Clients",
  id: ASSIGNED_GOOGLE_ADS_GLOBAL_TAG_ID,
} as const;

export const googleAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignedClientGoogleAdsConfig: builder.query<
      AssignedGoogleAdsConfigResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/google-ads/clients/${clientId}/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAssignedGoogleAdsConfigResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsSummary: builder.query<
      GoogleAdsSummaryResponse,
      AssignedClientQueryArg<GoogleAdsDateRangeQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/summary`,
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsSummaryResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsCampaigns: builder.query<
      GoogleAdsCampaignsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/campaigns`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsCampaignsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsAdGroups: builder.query<
      GoogleAdsInsightsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/ad-groups`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsInsightsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsAds: builder.query<
      GoogleAdsInsightsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/ads`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsInsightsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsKeywords: builder.query<
      GoogleAdsKeywordsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/keywords`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsKeywordsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsConversions: builder.query<
      GoogleAdsConversionsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/conversions`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsConversionsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsSearchTerms: builder.query<
      GoogleAdsSearchTermsResponse,
      AssignedClientQueryArg<GoogleAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/search-terms`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsSearchTermsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsInsights: builder.query<
      GoogleAdsInsightsResponse,
      AssignedClientQueryArg<GoogleAdsInsightsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/insights`,
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsInsightsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
      ],
    }),
    getAssignedClientGoogleAdsReports: builder.query<
      GoogleAdsReportsResponse,
      AssignedClientQueryArg<GoogleAdsReportsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/reports`,
        method: "GET",
        params: serializeReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
        { type: "Clients", id: getAssignedGoogleAdsReportsTagId(clientId) },
      ],
    }),
    createAssignedClientGoogleAdsReport: builder.mutation<
      GoogleAdsReportItem,
      { clientId: string; body: CreateGoogleAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/google-ads/clients/${clientId}/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
        { type: "Clients", id: getAssignedGoogleAdsReportsTagId(clientId) },
      ],
    }),
    updateAssignedGoogleAdsReport: builder.mutation<
      GoogleAdsReportItem,
      { reportId: string; body: UpdateGoogleAdsReportRequest }
    >({
      query: ({ reportId, body }) => ({
        url: `/google-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsReportItemResponse(response),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Clients", id: getAssignedGoogleAdsScopeTagId(result.clientProfileId) },
              { type: "Clients", id: getAssignedGoogleAdsReportsTagId(result.clientProfileId) },
            ]
          : [ASSIGNED_GOOGLE_ADS_GLOBAL_TAG],
    }),
    syncAssignedClientGoogleAds: builder.mutation<
      GoogleAdsSyncResponse,
      AssignedClientQueryArg<GoogleAdsDateRangeQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/google-ads/clients/${clientId}/sync`,
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeGoogleAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getAssignedGoogleAdsScopeTagId(clientId) },
        { type: "Clients", id: getAssignedGoogleAdsReportsTagId(clientId) },
      ],
    }),
  }),
});

export const {
  useGetAssignedClientGoogleAdsConfigQuery,
  useGetAssignedClientGoogleAdsSummaryQuery,
  useGetAssignedClientGoogleAdsCampaignsQuery,
  useGetAssignedClientGoogleAdsAdGroupsQuery,
  useGetAssignedClientGoogleAdsAdsQuery,
  useGetAssignedClientGoogleAdsKeywordsQuery,
  useGetAssignedClientGoogleAdsConversionsQuery,
  useGetAssignedClientGoogleAdsSearchTermsQuery,
  useGetAssignedClientGoogleAdsInsightsQuery,
  useGetAssignedClientGoogleAdsReportsQuery,
  useCreateAssignedClientGoogleAdsReportMutation,
  useUpdateAssignedGoogleAdsReportMutation,
  useSyncAssignedClientGoogleAdsMutation,
} = googleAdsApi;

function normalizeAssignedGoogleAdsConfigResponse(response: unknown): AssignedGoogleAdsConfigResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const account = isRecord(candidate) && isRecord(candidate.account) ? candidate.account : {};

  return {
    clientProfileId:
      isRecord(candidate) && typeof candidate.clientProfileId === "string"
        ? candidate.clientProfileId
        : "",
    connectionStatus: normalizeConnectionStatus(
      isRecord(candidate) ? candidate.connectionStatus : undefined,
    ),
    account: {
      customerId: readNullableString(account, "customerId"),
      managerCustomerId: readNullableString(account, "managerCustomerId"),
      descriptiveName: readNullableString(account, "descriptiveName"),
      currencyCode: readNullableString(account, "currencyCode"),
      timeZone: readNullableString(account, "timeZone"),
    },
    lastSyncAt: readNullableString(candidate, "lastSyncAt"),
    syncError: readNullableString(candidate, "syncError"),
  };
}

function getAssignedGoogleAdsScopeTagId(clientId: string): string {
  return `${ASSIGNED_GOOGLE_ADS_SCOPE_TAG_PREFIX}:${clientId}`;
}

function getAssignedGoogleAdsReportsTagId(clientId: string): string {
  return `${ASSIGNED_GOOGLE_ADS_REPORTS_TAG_PREFIX}:${clientId}`;
}

function normalizeGoogleAdsSummaryResponse(response: unknown): GoogleAdsSummaryResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    cost: readNumber(isRecord(candidate) ? candidate.cost : undefined),
    impressions: readNumber(
      isRecord(candidate) ? candidate.impressions : undefined,
      undefined,
      0,
      true,
    ),
    clicks: readNumber(
      isRecord(candidate) ? candidate.clicks : undefined,
      undefined,
      0,
      true,
    ),
    conversions: readNumber(isRecord(candidate) ? candidate.conversions : undefined),
    conversionValue: readNullableNumber(isRecord(candidate) ? candidate.conversionValue : undefined),
    ctr: readNumber(isRecord(candidate) ? candidate.ctr : undefined),
    averageCpc: readNumber(isRecord(candidate) ? candidate.averageCpc : undefined),
    costPerConversion: readNullableNumber(
      isRecord(candidate) ? candidate.costPerConversion : undefined,
    ),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsCampaignsResponse(response: unknown): GoogleAdsCampaignsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeCampaignRow).filter((item): item is GoogleAdsCampaign => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsKeywordsResponse(response: unknown): GoogleAdsKeywordsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeKeywordRow).filter((item): item is GoogleAdsKeyword => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsConversionsResponse(response: unknown): GoogleAdsConversionsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeConversionRow).filter((item): item is GoogleAdsConversion => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsSearchTermsResponse(response: unknown): GoogleAdsSearchTermsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeSearchTermRow).filter((item): item is GoogleAdsSearchTerm => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsInsightsResponse(response: unknown): GoogleAdsInsightsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeInsightRow).filter((item): item is GoogleAdsInsightItem => item !== null),
    level: normalizeInsightLevel(isRecord(candidate) ? candidate.level : undefined),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeGoogleAdsReportsResponse(response: unknown): GoogleAdsReportsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: rows.map(normalizeGoogleAdsReportItem).filter((item): item is GoogleAdsReportItem => item !== null),
    meta: {
      total: readNumber(meta, "total", 0, true),
      draft: readNumber(meta, "draft", 0, true),
      published: readNumber(meta, "published", 0, true),
      clientVisible: readNumber(meta, "clientVisible", 0, true),
    },
  };
}

function normalizeGoogleAdsReportItemResponse(response: unknown): GoogleAdsReportItem {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const report = normalizeGoogleAdsReportItem(candidate);
  if (!report) {
    throw new Error("Google Ads report response could not be parsed.");
  }

  return report;
}

function normalizeGoogleAdsReportItem(value: unknown): GoogleAdsReportItem | null {
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

function normalizeGoogleAdsSyncResponse(response: unknown): GoogleAdsSyncResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};
  const inserted = isRecord(candidate) && isRecord(candidate.inserted) ? candidate.inserted : {};

  return {
    success: true,
    syncedAt:
      isRecord(candidate) && typeof candidate.syncedAt === "string"
        ? candidate.syncedAt
        : new Date().toISOString(),
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
    connectionStatus: normalizeConnectionStatus(
      isRecord(candidate) ? candidate.connectionStatus : undefined,
    ),
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
    syncStatus: normalizeSyncStatus(isRecord(candidate) ? candidate.syncStatus : undefined),
    skippedReason: readNullableString(candidate, "skippedReason"),
  };
}

function normalizeCampaignRow(value: unknown): GoogleAdsCampaign | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    channelType: typeof value.channelType === "string" ? value.channelType : "UNSPECIFIED",
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    servingStatus: typeof value.servingStatus === "string" ? value.servingStatus : null,
    cost: readNumber(value.cost),
    impressions: readNumber(value.impressions, undefined, 0, true),
    clicks: readNumber(value.clicks, undefined, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
  };
}

function normalizeKeywordRow(value: unknown): GoogleAdsKeyword | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.keywordText !== "string") {
    return null;
  }

  return {
    id: value.id,
    keywordText: value.keywordText,
    matchType: typeof value.matchType === "string" ? value.matchType : "UNSPECIFIED",
    campaignName: typeof value.campaignName === "string" ? value.campaignName : "—",
    adGroupName: typeof value.adGroupName === "string" ? value.adGroupName : "—",
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    cost: readNumber(value.cost),
    clicks: readNumber(value.clicks, undefined, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
  };
}

function normalizeConversionRow(value: unknown): GoogleAdsConversion | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    conversionAction:
      typeof value.conversionAction === "string" ? value.conversionAction : value.id,
    conversions: readNumber(value.conversions),
    conversionValue: readNullableNumber(value.conversionValue),
    costPerConversion: readNullableNumber(value.costPerConversion),
    conversionRate: readNumber(value.conversionRate),
  };
}

function normalizeSearchTermRow(value: unknown): GoogleAdsSearchTerm | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.searchTerm !== "string") {
    return null;
  }

  return {
    id: value.id,
    searchTerm: value.searchTerm,
    campaignName: typeof value.campaignName === "string" ? value.campaignName : "—",
    adGroupName: typeof value.adGroupName === "string" ? value.adGroupName : "—",
    keywordText: typeof value.keywordText === "string" ? value.keywordText : null,
    cost: readNumber(value.cost),
    clicks: readNumber(value.clicks, undefined, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
  };
}

function normalizeInsightRow(value: unknown): GoogleAdsInsightItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.date !== "string") {
    return null;
  }

  return {
    id: value.id,
    date: value.date,
    level: normalizeInsightLevel(value.level),
    entityId: typeof value.entityId === "string" ? value.entityId : null,
    entityName: typeof value.entityName === "string" ? value.entityName : null,
    cost: readNumber(value.cost),
    costMicros: typeof value.costMicros === "string" ? value.costMicros : "0",
    impressions: readNumber(value.impressions, undefined, 0, true),
    clicks: readNumber(value.clicks, undefined, 0, true),
    interactions: readNumber(value.interactions, undefined, 0, true),
    conversions: readNumber(value.conversions),
    conversionValue: readNullableNumber(value.conversionValue),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
    costPerConversion: readNullableNumber(value.costPerConversion),
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
  };
}

function normalizeConnectionStatus(value: unknown): GoogleAdsConnectionStatus {
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

function normalizeSyncStatus(value: unknown): GoogleAdsSyncResponse["syncStatus"] {
  if (value === "PARTIAL") {
    return "PARTIAL";
  }

  if (value === "SKIPPED") {
    return "SKIPPED";
  }

  return "SUCCESS";
}

function normalizeInsightLevel(value: unknown): GoogleAdsInsightLevel {
  if (value === "CAMPAIGN") {
    return "CAMPAIGN";
  }

  if (value === "AD_GROUP") {
    return "AD_GROUP";
  }

  if (value === "AD") {
    return "AD";
  }

  return "ACCOUNT";
}

function serializeDateRangeQuery(
  query: GoogleAdsDateRangeQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (typeof query.since === "string" && query.since.trim().length > 0) {
    params.since = query.since.trim();
  }

  if (typeof query.until === "string" && query.until.trim().length > 0) {
    params.until = query.until.trim();
  }

  return params;
}

function serializeCampaignsQuery(
  query: GoogleAdsCampaignsQuery | void,
): Record<string, string | number | boolean> {
  const params = serializeDateRangeQuery(query);
  if (query?.limit !== undefined) {
    params.limit = query.limit;
  }

  return params;
}

function serializeInsightsQuery(
  query: GoogleAdsInsightsQuery | void,
): Record<string, string | number | boolean> {
  const params = serializeCampaignsQuery(query);
  if (query?.level !== undefined) {
    params.level = query.level;
  }

  return params;
}

function serializeReportsQuery(
  query: GoogleAdsReportsQuery | void,
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

function normalizeReportType(value: unknown): GoogleAdsReportType {
  if (
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "CAMPAIGN_PERFORMANCE" ||
    value === "SEARCH_TERMS" ||
    value === "KEYWORD_PERFORMANCE" ||
    value === "BUDGET_RECOMMENDATION" ||
    value === "CONVERSION_TRACKING"
  ) {
    return value;
  }

  return "WEEKLY";
}

function normalizeReportStatus(value: unknown): GoogleAdsReportStatus {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "DRAFT";
}

function normalizeAcknowledgementStatus(value: unknown): GoogleAdsReportItem["acknowledgementStatus"] {
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
  key?: string,
  fallback = 0,
  integer = false,
): number {
  const value = key ? readValue(source, key) : source;
  if (typeof value === "number" && Number.isFinite(value)) {
    return integer ? Math.trunc(value) : value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return integer ? Math.trunc(parsed) : parsed;
    }
  }

  return fallback;
}

function readNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readNumber(value);
}

function readNullableString(source: unknown, key: string): string | null {
  const value = readValue(source, key);
  return typeof value === "string" ? value : null;
}

function readValue(source: unknown, key: string): unknown {
  if (!isRecord(source)) {
    return undefined;
  }

  return source[key];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
