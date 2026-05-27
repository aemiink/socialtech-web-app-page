import { baseApi } from "../../services/baseApi";
import type {
  AdminTikTokAdsClientListResponse,
  AdminTikTokAdsConnection,
  AdminTikTokAdsSyncLogsQuery,
  AdminTikTokAdsSyncLogsResponse,
  ConnectManualTikTokAdsPayload,
  TestTikTokAdsConnectionPayload,
  TestTikTokAdsConnectionResponse,
  TikTokAdsCampaignsQuery,
  TikTokAdsCampaignsResponse,
  TikTokAdsConfig,
  TikTokAdsDateRangeQuery,
  TikTokAdsInsightsQuery,
  TikTokAdsInsightsResponse,
  TikTokAdsSummaryResponse,
  TikTokAdsSyncResponse,
  UpdateTikTokAdsConfigPayload,
} from "./tiktokAdsTypes";

const TIKTOK_ADS_ADMIN_CLIENTS_LIST_ID = "ADMIN_CLIENTS_LIST";
const TIKTOK_ADS_SYNC_LOGS_LIST_ID = "SYNC_LOGS_LIST";

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
  useDisconnectAdminClientTikTokAdsMutation,
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
  useGetAssignedClientTikTokAdsSummaryQuery,
  useRetryAdminClientTikTokAdsSyncMutation,
  useSyncAssignedClientTikTokAdsMutation,
  useSyncAdminClientTikTokAdsMutation,
  useTestAdminClientTikTokAdsConnectionMutation,
  useUpdateAdminClientTikTokAdsConfigMutation,
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
