import { baseApi } from "../../services/baseApi";
import type {
  GoogleAdsAd,
  GoogleAdsAdGroup,
  GoogleAdsAdGroupsResponse,
  GoogleAdsAdsResponse,
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
  GoogleAdsSearchTerm,
  GoogleAdsSearchTermsResponse,
  GoogleAdsSyncResponse,
  GoogleAdsSummaryResponse,
  OwnGoogleAdsConfigResponse,
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

export const googleAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnGoogleAdsConfig: builder.query<OwnGoogleAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/google-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsConfigResponse(response),
    }),
    getOwnGoogleAdsSummary: builder.query<GoogleAdsSummaryResponse, GoogleAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/summary",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsSummaryResponse(response),
    }),
    getOwnGoogleAdsCampaigns: builder.query<GoogleAdsCampaignsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/campaigns",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsCampaignsResponse(response),
    }),
    getOwnGoogleAdsAdGroups: builder.query<GoogleAdsAdGroupsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/ad-groups",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsAdGroupsResponse(response),
    }),
    getOwnGoogleAdsAds: builder.query<GoogleAdsAdsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/ads",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsAdsResponse(response),
    }),
    getOwnGoogleAdsKeywords: builder.query<GoogleAdsKeywordsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/keywords",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsKeywordsResponse(response),
    }),
    getOwnGoogleAdsConversions: builder.query<GoogleAdsConversionsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/conversions",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsConversionsResponse(response),
    }),
    getOwnGoogleAdsSearchTerms: builder.query<GoogleAdsSearchTermsResponse, GoogleAdsCampaignsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/search-terms",
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsSearchTermsResponse(response),
    }),
    getOwnGoogleAdsInsights: builder.query<GoogleAdsInsightsResponse, GoogleAdsInsightsQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/insights",
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsInsightsResponse(response),
    }),
    syncOwnGoogleAds: builder.mutation<GoogleAdsSyncResponse, GoogleAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/google-ads/sync",
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnGoogleAdsSyncResponse(response),
    }),
  }),
});

export const {
  useGetOwnGoogleAdsConfigQuery,
  useGetOwnGoogleAdsSummaryQuery,
  useGetOwnGoogleAdsCampaignsQuery,
  useGetOwnGoogleAdsAdGroupsQuery,
  useGetOwnGoogleAdsAdsQuery,
  useGetOwnGoogleAdsKeywordsQuery,
  useGetOwnGoogleAdsConversionsQuery,
  useGetOwnGoogleAdsSearchTermsQuery,
  useGetOwnGoogleAdsInsightsQuery,
  useSyncOwnGoogleAdsMutation,
} = googleAdsApi;

function normalizeOwnGoogleAdsConfigResponse(response: unknown): OwnGoogleAdsConfigResponse {
  const candidate =
    isRecord(response) && isRecord(response.data) ? response.data : response;
  const account =
    isRecord(candidate) && isRecord(candidate.account)
      ? candidate.account
      : candidate;

  return {
    connectionStatus: normalizeConnectionStatus(
      isRecord(candidate) ? candidate.connectionStatus : undefined,
    ),
    customerId: readNullableString(account, "customerId"),
    managerCustomerId: readNullableString(account, "managerCustomerId"),
    descriptiveName: readNullableString(account, "descriptiveName"),
    currencyCode: readNullableString(account, "currencyCode"),
    timeZone: readNullableString(account, "timeZone"),
    lastSyncAt: readNullableString(candidate, "lastSyncAt"),
    syncError: readNullableString(candidate, "syncError"),
    hasActiveService: readNullableBoolean(candidate, "hasActiveService"),
  };
}

function normalizeOwnGoogleAdsSummaryResponse(response: unknown): GoogleAdsSummaryResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    cost: readNumber(isRecord(candidate) ? candidate.cost : undefined),
    impressions: readNumber(isRecord(candidate) ? candidate.impressions : undefined, 0, true),
    clicks: readNumber(isRecord(candidate) ? candidate.clicks : undefined, 0, true),
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

function normalizeOwnGoogleAdsCampaignsResponse(response: unknown): GoogleAdsCampaignsResponse {
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

function normalizeOwnGoogleAdsAdGroupsResponse(response: unknown): GoogleAdsAdGroupsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeAdGroupRow).filter((item): item is GoogleAdsAdGroup => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnGoogleAdsAdsResponse(response: unknown): GoogleAdsAdsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const dateRange = isRecord(candidate) && isRecord(candidate.dateRange) ? candidate.dateRange : {};

  return {
    data: rows.map(normalizeAdRow).filter((item): item is GoogleAdsAd => item !== null),
    dateRange: {
      since: typeof dateRange.since === "string" ? dateRange.since : "",
      until: typeof dateRange.until === "string" ? dateRange.until : "",
    },
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeOwnGoogleAdsKeywordsResponse(response: unknown): GoogleAdsKeywordsResponse {
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

function normalizeOwnGoogleAdsConversionsResponse(response: unknown): GoogleAdsConversionsResponse {
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

function normalizeOwnGoogleAdsSearchTermsResponse(response: unknown): GoogleAdsSearchTermsResponse {
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

function normalizeOwnGoogleAdsInsightsResponse(response: unknown): GoogleAdsInsightsResponse {
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

function normalizeOwnGoogleAdsSyncResponse(response: unknown): GoogleAdsSyncResponse {
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
      account: readNumber(inserted.account, 0, true),
      campaigns: readNumber(inserted.campaigns, 0, true),
      adGroups: readNumber(inserted.adGroups, 0, true),
      ads: readNumber(inserted.ads, 0, true),
      total: readNumber(inserted.total, 0, true),
    },
    connectionStatus:
      isRecord(candidate) && candidate.connectionStatus
        ? normalizeConnectionStatus(candidate.connectionStatus)
        : "NOT_CONNECTED",
    lastSyncAt:
      isRecord(candidate) && typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
    syncStatus:
      isRecord(candidate) &&
      (candidate.syncStatus === "RUNNING" ||
        candidate.syncStatus === "SUCCESS" ||
        candidate.syncStatus === "FAILED" ||
        candidate.syncStatus === "PARTIAL" ||
        candidate.syncStatus === "SKIPPED")
        ? candidate.syncStatus
        : "SUCCESS",
    skippedReason:
      isRecord(candidate) && typeof candidate.skippedReason === "string" ? candidate.skippedReason : null,
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
    impressions: readNumber(value.impressions, 0, true),
    clicks: readNumber(value.clicks, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
  };
}

function normalizeAdGroupRow(value: unknown): GoogleAdsAdGroup | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    campaignName: typeof value.campaignName === "string" ? value.campaignName : "—",
    adGroupName: typeof value.adGroupName === "string" ? value.adGroupName : "—",
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    cost: readNumber(value.cost),
    impressions: readNumber(value.impressions, 0, true),
    clicks: readNumber(value.clicks, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
  };
}

function normalizeAdRow(value: unknown): GoogleAdsAd | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    campaignName: typeof value.campaignName === "string" ? value.campaignName : "—",
    adGroupName: typeof value.adGroupName === "string" ? value.adGroupName : "—",
    adName: typeof value.adName === "string" ? value.adName : value.id,
    adType: typeof value.adType === "string" ? value.adType : "UNSPECIFIED",
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    finalUrl: typeof value.finalUrl === "string" ? value.finalUrl : null,
    cost: readNumber(value.cost),
    impressions: readNumber(value.impressions, 0, true),
    clicks: readNumber(value.clicks, 0, true),
    conversions: readNumber(value.conversions),
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
    clicks: readNumber(value.clicks, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
  };
}

function normalizeConversionRow(value: unknown): GoogleAdsConversion | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.conversionAction !== "string") {
    return null;
  }

  return {
    id: value.id,
    conversionAction: value.conversionAction,
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
    clicks: readNumber(value.clicks, 0, true),
    conversions: readNumber(value.conversions),
    ctr: readNumber(value.ctr),
  };
}

function normalizeInsightRow(value: unknown): GoogleAdsInsightItem | null {
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
    cost: readNumber(value.cost),
    costMicros: typeof value.costMicros === "string" ? value.costMicros : "0",
    impressions: readNumber(value.impressions, 0, true),
    clicks: readNumber(value.clicks, 0, true),
    interactions: readNumber(value.interactions, 0, true),
    conversions: readNumber(value.conversions),
    conversionValue: readNullableNumber(value.conversionValue),
    ctr: readNumber(value.ctr),
    averageCpc: readNumber(value.averageCpc),
    costPerConversion: readNullableNumber(value.costPerConversion),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
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

function serializeDateRangeQuery(
  query: GoogleAdsDateRangeQuery | void,
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
  query: GoogleAdsCampaignsQuery | void,
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
  query: GoogleAdsInsightsQuery | void,
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

function readNullableString(
  value: unknown,
  key: string,
): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value[key] === "string" ? value[key] : null;
}

function readNullableBoolean(
  value: unknown,
  key: string,
): boolean | null {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value[key] === "boolean" ? value[key] : null;
}

function readNumber(
  value: unknown,
  fallback = 0,
  integer = false,
): number {
  let resolved: number | null = null;

  if (typeof value === "number" && Number.isFinite(value)) {
    resolved = value;
  } else if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    resolved = Number.isFinite(parsed) ? parsed : null;
  }

  const output = resolved ?? fallback;
  return integer ? Math.trunc(output) : output;
}

function readNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readNumber(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
