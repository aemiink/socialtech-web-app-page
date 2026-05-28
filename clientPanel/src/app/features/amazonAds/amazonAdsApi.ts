import { baseApi } from "../../services/baseApi";
import type {
  AmazonAdsCampaignsQuery,
  AmazonAdsCampaignsResponse,
  AmazonAdsConnectionStatus,
  AmazonAdsDateRangeQuery,
  AmazonAdsInsightLevel,
  AmazonAdsInsightsResponse,
  AmazonAdsProductType,
  AmazonAdsProductsResponse,
  AmazonAdsReportsQuery,
  AmazonAdsReportsResponse,
  AmazonAdsRegion,
  AmazonAdsReportAcknowledgementStatus,
  AmazonAdsReportStatus,
  AmazonAdsReportType,
  AmazonAdsSummaryResponse,
  OwnAmazonAdsConfigResponse,
} from "./amazonAdsTypes";

const amazonAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnAmazonAdsConfig: build.query<OwnAmazonAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/amazon-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnAmazonAdsConfigResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
    getOwnAmazonAdsSummary: build.query<AmazonAdsSummaryResponse, AmazonAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/clients/me/amazon-ads/summary",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSummaryResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
    getOwnAmazonAdsCampaigns: build.query<
      AmazonAdsCampaignsResponse,
      AmazonAdsCampaignsQuery | void
    >({
      query: (query) => ({
        url: "/clients/me/amazon-ads/campaigns",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsCampaignsResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
    getOwnAmazonAdsProducts: build.query<
      AmazonAdsProductsResponse,
      (AmazonAdsDateRangeQuery & { limit?: number }) | void
    >({
      query: (query) => ({
        url: "/clients/me/amazon-ads/products",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsProductsResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
    getOwnAmazonAdsInsights: build.query<
      AmazonAdsInsightsResponse,
      (AmazonAdsDateRangeQuery & { level?: AmazonAdsInsightLevel; limit?: number }) | void
    >({
      query: (query) => ({
        url: "/clients/me/amazon-ads/insights",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsInsightsResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
    getOwnAmazonAdsReports: build.query<AmazonAdsReportsResponse, AmazonAdsReportsQuery | void>({
      query: (query) => ({
        url: "/clients/me/amazon-ads/reports",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportsResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
  }),
});

export const {
  useGetOwnAmazonAdsConfigQuery,
  useGetOwnAmazonAdsSummaryQuery,
  useGetOwnAmazonAdsCampaignsQuery,
  useGetOwnAmazonAdsProductsQuery,
  useGetOwnAmazonAdsInsightsQuery,
  useGetOwnAmazonAdsReportsQuery,
} = amazonAdsApi;

function normalizeOwnAmazonAdsConfigResponse(response: unknown): OwnAmazonAdsConfigResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      connectionStatus: "NOT_CONNECTED",
      hasConfig: false,
      profileId: null,
      advertiserAccountId: null,
      marketplaceId: null,
      region: null,
      countryCode: null,
      currencyCode: null,
      accountName: null,
      lastSyncAt: null,
    };
  }

  return {
    connectionStatus: normalizeConnectionStatus(candidate.connectionStatus),
    hasConfig: candidate.hasConfig === true,
    profileId: readNullableString(candidate.profileId),
    advertiserAccountId: readNullableString(candidate.advertiserAccountId),
    marketplaceId: readNullableString(candidate.marketplaceId),
    region: normalizeRegion(candidate.region),
    countryCode: readNullableString(candidate.countryCode),
    currencyCode: readNullableString(candidate.currencyCode),
    accountName: readNullableString(candidate.accountName),
    lastSyncAt: readNullableString(candidate.lastSyncAt),
  };
}

function normalizeAmazonAdsSummaryResponse(response: unknown): AmazonAdsSummaryResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  return {
    spend: readNumber(isRecord(candidate) ? candidate.spend : undefined),
    impressions: Math.trunc(readNumber(isRecord(candidate) ? candidate.impressions : undefined)),
    clicks: Math.trunc(readNumber(isRecord(candidate) ? candidate.clicks : undefined)),
    sales: readNumber(isRecord(candidate) ? candidate.sales : undefined),
    orders: Math.trunc(readNumber(isRecord(candidate) ? candidate.orders : undefined)),
    unitsSold: Math.trunc(readNumber(isRecord(candidate) ? candidate.unitsSold : undefined)),
    ctr: readNumber(isRecord(candidate) ? candidate.ctr : undefined),
    cpc: readNumber(isRecord(candidate) ? candidate.cpc : undefined),
    acos: readNumber(isRecord(candidate) ? candidate.acos : undefined),
    roas: readNumber(isRecord(candidate) ? candidate.roas : undefined),
    conversionRate: readNumber(isRecord(candidate) ? candidate.conversionRate : undefined),
    dateRange: normalizeDateRange(isRecord(candidate) ? candidate.dateRange : undefined),
    lastSyncAt: readNullableString(isRecord(candidate) ? candidate.lastSyncAt : undefined),
  };
}

function normalizeAmazonAdsCampaignsResponse(response: unknown): AmazonAdsCampaignsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const data = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];

  return {
    data: data.map(normalizeAmazonAdsCampaign).filter(isDefined),
    dateRange: normalizeDateRange(isRecord(candidate) ? candidate.dateRange : undefined),
    lastSyncAt: readNullableString(isRecord(candidate) ? candidate.lastSyncAt : undefined),
  };
}

function normalizeAmazonAdsProductsResponse(response: unknown): AmazonAdsProductsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const data = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];

  return {
    data: data.map(normalizeAmazonAdsProduct).filter(isDefined),
    dateRange: normalizeDateRange(isRecord(candidate) ? candidate.dateRange : undefined),
    lastSyncAt: readNullableString(isRecord(candidate) ? candidate.lastSyncAt : undefined),
  };
}

function normalizeAmazonAdsInsightsResponse(response: unknown): AmazonAdsInsightsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const data = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];

  return {
    data: data.map(normalizeAmazonAdsInsight).filter(isDefined),
    level: normalizeInsightLevel(isRecord(candidate) ? candidate.level : undefined) ?? "ACCOUNT",
    dateRange: normalizeDateRange(isRecord(candidate) ? candidate.dateRange : undefined),
    lastSyncAt: readNullableString(isRecord(candidate) ? candidate.lastSyncAt : undefined),
  };
}

function normalizeAmazonAdsReportsResponse(response: unknown): AmazonAdsReportsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const data = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: data.map(normalizeAmazonAdsReportItem).filter(isDefined),
    meta: {
      total: Math.trunc(readNumber(meta.total)),
      draft: Math.trunc(readNumber(meta.draft)),
      published: Math.trunc(readNumber(meta.published)),
      clientVisible: Math.trunc(readNumber(meta.clientVisible)),
    },
  };
}

function normalizeAmazonAdsCampaign(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : "";
  if (!id) {
    return null;
  }

  return {
    id,
    name: typeof value.name === "string" ? value.name : id,
    adProduct: normalizeProductType(value.adProduct),
    status: typeof value.status === "string" ? value.status : "UNKNOWN",
    spend: readNumber(value.spend),
    impressions: Math.trunc(readNumber(value.impressions)),
    clicks: Math.trunc(readNumber(value.clicks)),
    sales: readNumber(value.sales),
    orders: Math.trunc(readNumber(value.orders)),
    acos: readNumber(value.acos),
    roas: readNumber(value.roas),
  };
}

function normalizeAmazonAdsProduct(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  return {
    asin: readNullableString(value.asin),
    sku: readNullableString(value.sku),
    title: readNullableString(value.title),
    spend: readNumber(value.spend),
    clicks: Math.trunc(readNumber(value.clicks)),
    sales: readNumber(value.sales),
    orders: Math.trunc(readNumber(value.orders)),
    acos: readNumber(value.acos),
    roas: readNumber(value.roas),
  };
}

function normalizeAmazonAdsInsight(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : "";
  const level = normalizeInsightLevel(value.level);
  if (!id || !level) {
    return null;
  }

  return {
    id,
    date: typeof value.date === "string" ? value.date : "",
    level,
    entityId: typeof value.entityId === "string" ? value.entityId : "",
    entityName: readNullableString(value.entityName),
    adProduct: normalizeProductType(value.adProduct),
    spend: readNumber(value.spend),
    impressions: Math.trunc(readNumber(value.impressions)),
    clicks: Math.trunc(readNumber(value.clicks)),
    sales: readNumber(value.sales),
    orders: Math.trunc(readNumber(value.orders)),
    unitsSold: Math.trunc(readNumber(value.unitsSold)),
    ctr: readNumber(value.ctr),
    cpc: readNumber(value.cpc),
    acos: readNumber(value.acos),
    roas: readNumber(value.roas),
    conversionRate: readNumber(value.conversionRate),
    campaignId: readNullableString(value.campaignId),
    campaignName: readNullableString(value.campaignName),
    adGroupId: readNullableString(value.adGroupId),
    adGroupName: readNullableString(value.adGroupName),
    keywordId: readNullableString(value.keywordId),
    keywordText: readNullableString(value.keywordText),
    keywordType: readNullableString(value.keywordType),
    matchType: readNullableString(value.matchType),
    targeting: readNullableString(value.targeting),
    searchTerm: readNullableString(value.searchTerm),
    reportTypeId: readNullableString(value.reportTypeId),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function normalizeAmazonAdsReportItem(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : "";
  if (!id) {
    return null;
  }

  return {
    id,
    clientProfileId: typeof value.clientProfileId === "string" ? value.clientProfileId : "",
    projectId: readNullableString(value.projectId),
    projectName: readNullableString(value.projectName),
    periodStart: typeof value.periodStart === "string" ? value.periodStart : "",
    periodEnd: typeof value.periodEnd === "string" ? value.periodEnd : "",
    type: normalizeReportType(value.type),
    status: normalizeReportStatus(value.status),
    summary: readNullableString(value.summary),
    metricsSnapshot: isRecord(value.metricsSnapshot)
      ? value.metricsSnapshot
      : value.metricsSnapshot === null
        ? null
        : null,
    clientVisible: typeof value.clientVisible === "boolean" ? value.clientVisible : false,
    publishedAt: readNullableString(value.publishedAt),
    acknowledgementRequestedAt: readNullableString(value.acknowledgementRequestedAt),
    acknowledgedAt: readNullableString(value.acknowledgedAt),
    acknowledgementStatus: normalizeReportAcknowledgementStatus(value.acknowledgementStatus),
    acknowledgementTaskId: readNullableString(value.acknowledgementTaskId),
    acknowledgementTaskUpdatedAt: readNullableString(value.acknowledgementTaskUpdatedAt),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

function normalizeConnectionStatus(value: unknown): AmazonAdsConnectionStatus {
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

function normalizeRegion(value: unknown): AmazonAdsRegion | null {
  if (value === "NA" || value === "EU" || value === "FE") {
    return value;
  }

  return null;
}

function normalizeInsightLevel(value: unknown): AmazonAdsInsightLevel | null {
  if (
    value === "ACCOUNT" ||
    value === "PORTFOLIO" ||
    value === "CAMPAIGN" ||
    value === "AD_GROUP" ||
    value === "AD" ||
    value === "KEYWORD" ||
    value === "TARGET" ||
    value === "PRODUCT" ||
    value === "SEARCH_TERM"
  ) {
    return value;
  }

  return null;
}

function normalizeProductType(value: unknown): AmazonAdsProductType | null {
  if (
    value === "SPONSORED_PRODUCTS" ||
    value === "SPONSORED_BRANDS" ||
    value === "SPONSORED_DISPLAY"
  ) {
    return value;
  }

  return null;
}

function normalizeReportType(value: unknown): AmazonAdsReportType {
  if (
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "SPONSORED_PRODUCTS_PERFORMANCE" ||
    value === "SPONSORED_BRANDS_PERFORMANCE" ||
    value === "SPONSORED_DISPLAY_PERFORMANCE" ||
    value === "PRODUCT_PERFORMANCE" ||
    value === "SEARCH_TERMS" ||
    value === "BUDGET_RECOMMENDATION" ||
    value === "ACOS_OPTIMIZATION"
  ) {
    return value;
  }

  return "WEEKLY";
}

function normalizeReportStatus(value: unknown): AmazonAdsReportStatus {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "DRAFT";
}

function normalizeReportAcknowledgementStatus(value: unknown): AmazonAdsReportAcknowledgementStatus {
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

function normalizeDateRange(value: unknown): { since: string; until: string } {
  if (!isRecord(value)) {
    return { since: "", until: "" };
  }

  return {
    since: typeof value.since === "string" ? value.since : "",
    until: typeof value.until === "string" ? value.until : "",
  };
}

function serializeDateRangeQuery(
  query:
    | AmazonAdsDateRangeQuery
    | {
        limit?: number;
        level?: AmazonAdsInsightLevel;
        adProduct?: AmazonAdsProductType;
        status?: AmazonAdsReportStatus;
        type?: AmazonAdsReportType;
        clientVisible?: boolean;
        since?: string;
        until?: string;
      }
    | void,
) {
  if (!query) {
    return undefined;
  }

  return {
    ...(query.since ? { since: query.since } : {}),
    ...(query.until ? { until: query.until } : {}),
    ...("limit" in query && query.limit ? { limit: query.limit } : {}),
    ...("level" in query && query.level ? { level: query.level } : {}),
    ...("adProduct" in query && query.adProduct ? { adProduct: query.adProduct } : {}),
    ...("status" in query && query.status ? { status: query.status } : {}),
    ...("type" in query && query.type ? { type: query.type } : {}),
    ...(
      "clientVisible" in query && typeof query.clientVisible === "boolean"
        ? { clientVisible: query.clientVisible }
        : {}
    ),
  };
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
