import { baseApi } from "../../services/baseApi";
import type {
  AdminTikTokAdsClientListResponse,
  AdminTikTokAdsConnection,
  AdminTikTokAdsSyncLogsQuery,
  AdminTikTokAdsSyncLogsResponse,
  ConnectManualTikTokAdsPayload,
  CreateTikTokAdsReportRequest,
  TestTikTokAdsConnectionPayload,
  TestTikTokAdsConnectionResponse,
  TikTokAdsCampaignsQuery,
  TikTokAdsCampaignsResponse,
  TikTokAdsConfig,
  TikTokAdsDateRangeQuery,
  TikTokAdsInsightsQuery,
  TikTokAdsInsightsResponse,
  TikTokAdsReportItem,
  TikTokAdsReportsQuery,
  TikTokAdsReportsResponse,
  TikTokAdsReportStatus,
  TikTokAdsReportType,
  TikTokAdsSummaryResponse,
  TikTokAdsSyncResponse,
  UpdateTikTokAdsReportRequest,
  UpdateTikTokAdsConfigPayload,
} from "./tiktokAdsTypes";

const TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID = "ADMIN_CLIENTS_LIST";
const TIKTOK_ADS_SYNC_LOGS_LIST_ID = "SYNC_LOGS_LIST";
const TIKTOK_ADS_REPORTS_LIST_ID = "REPORTS_LIST";

type AdminClientTikTokAdsQueryArg<TQuery = void> = {
  clientId: string;
  query?: TQuery;
};

const tiktokAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminTikTokAdsClients: build.query<
      AdminTikTokAdsClientListResponse,
      TikTokAdsDateRangeQuery | void
    >({
      query: (query) => ({
        url: "/admin/tiktok-ads/clients",
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      providesTags: (result) => [
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "TikTokAdsConfig" as const,
              id: item.client.id,
            }))
          : []),
      ],
    }),

    getAdminTikTokAdsSyncLogs: build.query<
      AdminTikTokAdsSyncLogsResponse,
      AdminTikTokAdsSyncLogsQuery | void
    >({
      query: (query) => ({
        url: "/admin/tiktok-ads/sync-logs",
        method: "GET",
        params: serializeSyncLogsQuery(query),
      }),
      providesTags: [{ type: "TikTokAdsConfig", id: TIKTOK_ADS_SYNC_LOGS_LIST_ID }],
    }),

    getAdminClientTikTokAdsConfig: build.query<TikTokAdsConfig, string>({
      query: (clientId) => `/admin/clients/${clientId}/tiktok-ads/config`,
      providesTags: (_result, _error, clientId) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsConnection: build.query<AdminTikTokAdsConnection, string>({
      query: (clientId) => `/admin/clients/${clientId}/tiktok-ads/connection`,
      providesTags: (_result, _error, clientId) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAssignedClientTikTokAdsConfig: build.query<TikTokAdsConfig, { clientId: string }>({
      query: ({ clientId }) => `/tiktok-ads/clients/${clientId}/config`,
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsSummary: build.query<
      TikTokAdsSummaryResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsDateRangeQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/summary`,
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAssignedClientTikTokAdsSummary: build.query<
      TikTokAdsSummaryResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsDateRangeQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/tiktok-ads/clients/${clientId}/summary`,
        method: "GET",
        params: serializeDateRangeQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsCampaigns: build.query<
      TikTokAdsCampaignsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/campaigns`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAssignedClientTikTokAdsCampaigns: build.query<
      TikTokAdsCampaignsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsCampaignsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/tiktok-ads/clients/${clientId}/campaigns`,
        method: "GET",
        params: serializeCampaignsQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsInsights: build.query<
      TikTokAdsInsightsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsInsightsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/insights`,
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAssignedClientTikTokAdsInsights: build.query<
      TikTokAdsInsightsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsInsightsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/tiktok-ads/clients/${clientId}/insights`,
        method: "GET",
        params: serializeInsightsQuery(query),
      }),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsReports: build.query<
      TikTokAdsReportsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsReportsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/reports`,
        method: "GET",
        params: serializeReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ADMIN:${clientId}` },
      ],
    }),

    createAdminClientTikTokAdsReport: build.mutation<
      TikTokAdsReportItem,
      { clientId: string; body: CreateTikTokAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ADMIN:${clientId}` },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
      ],
    }),

    updateAdminTikTokAdsReport: build.mutation<
      TikTokAdsReportItem,
      { reportId: string; clientId: string; body: UpdateTikTokAdsReportRequest }
    >({
      query: ({ reportId, body }) => ({
        url: `/admin/tiktok-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ADMIN:${clientId}` },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
      ],
    }),

    getAssignedClientTikTokAdsReports: build.query<
      TikTokAdsReportsResponse,
      AdminClientTikTokAdsQueryArg<TikTokAdsReportsQuery>
    >({
      query: ({ clientId, query }) => ({
        url: `/tiktok-ads/clients/${clientId}/reports`,
        method: "GET",
        params: serializeReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ASSIGNED:${clientId}` },
      ],
    }),

    createAssignedClientTikTokAdsReport: build.mutation<
      TikTokAdsReportItem,
      { clientId: string; body: CreateTikTokAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/tiktok-ads/clients/${clientId}/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ASSIGNED:${clientId}` },
      ],
    }),

    updateAssignedTikTokAdsReport: build.mutation<
      TikTokAdsReportItem,
      { reportId: string; clientId: string; body: UpdateTikTokAdsReportRequest }
    >({
      query: ({ reportId, body }) => ({
        url: `/tiktok-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTikTokAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: `${TIKTOK_ADS_REPORTS_LIST_ID}:ASSIGNED:${clientId}` },
      ],
    }),

    updateAdminClientTikTokAdsConfig: build.mutation<
      TikTokAdsConfig,
      { clientId: string; data: UpdateTikTokAdsConfigPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/config`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),

    connectAdminClientTikTokAdsManual: build.mutation<
      AdminTikTokAdsConnection,
      { clientId: string; data: ConnectManualTikTokAdsPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/connect`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),

    testAdminClientTikTokAdsConnection: build.mutation<
      TestTikTokAdsConnectionResponse,
      { clientId: string; data: TestTikTokAdsConnectionPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/test`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),

    syncAdminClientTikTokAds: build.mutation<
      TikTokAdsSyncResponse,
      { clientId: string; query?: TikTokAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/sync`,
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_SYNC_LOGS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),

    retryAdminClientTikTokAdsSync: build.mutation<
      TikTokAdsSyncResponse,
      { clientId: string; query?: TikTokAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/sync/retry`,
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_SYNC_LOGS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),

    syncAssignedClientTikTokAds: build.mutation<
      TikTokAdsSyncResponse,
      { clientId: string; query?: TikTokAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/tiktok-ads/clients/${clientId}/sync`,
        method: "POST",
        params: serializeDateRangeQuery(query),
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    disconnectAdminClientTikTokAds: build.mutation<AdminTikTokAdsConnection, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/disconnect`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "TikTokAdsConfig", id: TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID },
        { type: "Clients", id: clientId },
      ],
    }),
  }),
});

export const {
  useConnectAdminClientTikTokAdsManualMutation,
  useCreateAdminClientTikTokAdsReportMutation,
  useCreateAssignedClientTikTokAdsReportMutation,
  useDisconnectAdminClientTikTokAdsMutation,
  useGetAdminClientTikTokAdsReportsQuery,
  useGetAdminTikTokAdsClientsQuery,
  useGetAdminTikTokAdsSyncLogsQuery,
  useGetAdminClientTikTokAdsCampaignsQuery,
  useGetAdminClientTikTokAdsConfigQuery,
  useGetAdminClientTikTokAdsConnectionQuery,
  useGetAdminClientTikTokAdsInsightsQuery,
  useGetAdminClientTikTokAdsSummaryQuery,
  useGetAssignedClientTikTokAdsCampaignsQuery,
  useGetAssignedClientTikTokAdsConfigQuery,
  useGetAssignedClientTikTokAdsInsightsQuery,
  useGetAssignedClientTikTokAdsReportsQuery,
  useGetAssignedClientTikTokAdsSummaryQuery,
  useRetryAdminClientTikTokAdsSyncMutation,
  useSyncAssignedClientTikTokAdsMutation,
  useSyncAdminClientTikTokAdsMutation,
  useTestAdminClientTikTokAdsConnectionMutation,
  useUpdateAdminClientTikTokAdsConfigMutation,
  useUpdateAdminTikTokAdsReportMutation,
  useUpdateAssignedTikTokAdsReportMutation,
} = tiktokAdsApi;

function serializeDateRangeQuery(
  query: TikTokAdsDateRangeQuery | void,
): Record<string, string> | undefined {
  if (!query) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (query.since) {
    params.since = query.since;
  }
  if (query.until) {
    params.until = query.until;
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

function serializeCampaignsQuery(
  query?: TikTokAdsCampaignsQuery,
): Record<string, string | number> | undefined {
  const params = serializeDateRangeQuery(query);
  const nextParams: Record<string, string | number> = params ? { ...params } : {};

  if (query?.limit) {
    nextParams.limit = query.limit;
  }

  return Object.keys(nextParams).length > 0 ? nextParams : undefined;
}

function serializeInsightsQuery(
  query?: TikTokAdsInsightsQuery,
): Record<string, string | number> | undefined {
  const params = serializeDateRangeQuery(query);
  const nextParams: Record<string, string | number> = params ? { ...params } : {};

  if (query?.level) {
    nextParams.level = query.level;
  }
  if (query?.limit) {
    nextParams.limit = query.limit;
  }

  return Object.keys(nextParams).length > 0 ? nextParams : undefined;
}

function serializeReportsQuery(
  query?: TikTokAdsReportsQuery,
): Record<string, string | number | boolean> | undefined {
  if (!query) {
    return undefined;
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

  return Object.keys(params).length > 0 ? params : undefined;
}

function serializeSyncLogsQuery(
  query: AdminTikTokAdsSyncLogsQuery | void,
): Record<string, string | number | boolean> | undefined {
  if (!query) {
    return undefined;
  }

  const params: Record<string, string | number | boolean> = {};
  if (query.clientProfileId && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }
  if (query.status) {
    params.status = query.status;
  }
  if (query.failedOnly !== undefined) {
    params.failedOnly = query.failedOnly;
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

function normalizeTikTokAdsReportsResponse(response: unknown): TikTokAdsReportsResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const rows = isRecord(candidate) && Array.isArray(candidate.data) ? candidate.data : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: rows
      .map(normalizeTikTokAdsReportItem)
      .filter((item): item is TikTokAdsReportItem => item !== null),
    meta: {
      total: readNumber(meta, "total", 0, true),
      draft: readNumber(meta, "draft", 0, true),
      published: readNumber(meta, "published", 0, true),
      clientVisible: readNumber(meta, "clientVisible", 0, true),
    },
  };
}

function normalizeTikTokAdsReportItemResponse(response: unknown): TikTokAdsReportItem {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const report = normalizeTikTokAdsReportItem(candidate);
  if (!report) {
    throw new Error("TikTok Ads report response could not be parsed.");
  }

  return report;
}

function normalizeTikTokAdsReportItem(value: unknown): TikTokAdsReportItem | null {
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
    metricsSnapshot: isRecord(value.metricsSnapshot) ? value.metricsSnapshot : null,
    clientVisible: value.clientVisible === true,
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

function normalizeReportType(value: unknown): TikTokAdsReportType {
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

function normalizeReportStatus(value: unknown): TikTokAdsReportStatus {
  if (value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }

  return "DRAFT";
}

function normalizeAcknowledgementStatus(
  value: unknown,
): TikTokAdsReportItem["acknowledgementStatus"] {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
