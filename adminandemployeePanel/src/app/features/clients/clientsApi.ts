import { baseApi } from "../../services/baseApi";
import type {
  AdminAmazonAdsClientListResponse,
  AdminAmazonAdsSyncLogsQuery,
  AdminAmazonAdsSyncLogsResponse,
  AdminMetaAdsSyncLogsQuery,
  AdminMetaAdsSyncLogsResponse,
  AmazonAdsCampaignsQuery,
  AmazonAdsCampaignsResponse,
  AmazonAdsReportExportFormat,
  AmazonAdsReportsQuery,
  AmazonAdsReportItem,
  AmazonAdsReportsResponse,
  CreateMetaAdsReportRequest,
  CreateAmazonAdsReportRequest,
  AdminMetaAdsClientListResponse,
  AssignedClientAmazonAdsConfig,
  AdminClientAmazonAdsConnection,
  AdminClientMetaAdsConnection,
  AdminClientSocialMediaConfig,
  AmazonAdsDateRangeQuery,
  AmazonAdsInsightsQuery,
  AmazonAdsInsightsResponse,
  AmazonAdsOAuthStartResponse,
  AmazonAdsProductsQuery,
  AmazonAdsProductsResponse,
  AmazonAdsRegion,
  AmazonAdsSummaryResponse,
  AmazonAdsSyncResponse,
  ConnectManualAmazonAdsRequest,
  ConnectManualMetaAdsRequest,
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
  ClientSummaryResponse,
  MetaAdsDateRangeQuery,
  MetaAdsReportsQuery,
  MetaAdsReportItem,
  MetaAdsReportsResponse,
  MetaAdsSyncResponse,
  CreateAdminClientRequest,
  CreateOrLinkClientOwnerRequest,
  MetaAdsSummaryResponse,
  ResetClientOwnerPasswordRequest,
  ExchangeAmazonAdsOAuthCodeRequest,
  TestAmazonAdsConnectionRequest,
  TestAmazonAdsConnectionResponse,
  TestMetaAdsConnectionRequest,
  TestMetaAdsConnectionResponse,
  UpdateMetaAdsReportRequest,
  UpdateAmazonAdsReportRequest,
  UpdateAdminClientAmazonAdsConfigRequest,
  UpdateAdminClientMetaAdsConfigRequest,
  UpdateAdminClientSocialMediaConfigRequest,
  UpdateAdminClientRequest,
} from "./clientsTypes";
import {
  normalizeAmazonAdsCampaignsResponse,
  normalizeAssignedAmazonAdsConfigResponse,
  normalizeAdminAmazonAdsConnectionResponse,
  normalizeAdminSocialMediaConfigResponse,
  normalizeAdminAmazonAdsClientListResponse,
  normalizeAdminAmazonAdsSyncLogsResponse,
  normalizeAmazonAdsInsightsResponse,
  normalizeAmazonAdsProductsResponse,
  normalizeAmazonAdsSummaryResponse,
  normalizeAmazonAdsSyncResponse,
  normalizeAmazonAdsOAuthStartResponse,
  normalizeAdminMetaAdsClientListResponse,
  normalizeAdminMetaAdsSyncLogsResponse,
  normalizeClientResponse,
  normalizeClientSummaryResponse,
  normalizeClientsListResponse,
  normalizeAdminMetaAdsConnectionResponse,
  normalizeMetaAdsSyncResponse,
  normalizeAmazonAdsReportsResponse,
  normalizeAmazonAdsReportItemResponse,
  normalizeMetaAdsReportsResponse,
  normalizeMetaAdsReportItemResponse,
  normalizeMetaAdsSummaryResponse,
  normalizeTestAmazonAdsConnectionResponse,
  normalizeTestMetaAdsConnectionResponse,
  toBackendServiceKey,
} from "./clientsUtils";

const CLIENTS_LIST_ID = "LIST";
const CLIENT_SUMMARY_ID_PREFIX = "SUMMARY";
const CLIENT_META_ADS_CONNECTION_ID_PREFIX = "META_ADS_CONNECTION";
const CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX = "AMAZON_ADS_CONNECTION";
const CLIENT_SOCIAL_MEDIA_CONFIG_ID_PREFIX = "SOCIAL_MEDIA_CONFIG";
const CLIENT_META_ADS_GLOBAL_LIST_ID = "META_ADS_GLOBAL_LIST";
const CLIENT_AMAZON_ADS_GLOBAL_LIST_ID = "AMAZON_ADS_GLOBAL_LIST";
const CLIENT_META_ADS_SYNC_LOGS_LIST_ID = "META_ADS_SYNC_LOGS_LIST";
const CLIENT_AMAZON_ADS_SYNC_LOGS_LIST_ID = "AMAZON_ADS_SYNC_LOGS_LIST";
const ADMIN_SUMMARY_ID = "SUMMARY";
const AUDIT_LOGS_LIST_ID = "LIST";
const ADMIN_USERS_LIST_ID = "LIST";

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ClientsListResponse, ClientsListQuery | void>({
      query: (query) => ({
        url: "/clients",
        method: "GET",
        params: serializeClientsListQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeClientsListResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "Clients", id: CLIENTS_LIST_ID }];
        }

        return [
          { type: "Clients", id: CLIENTS_LIST_ID },
          ...result.data.map((client) => ({ type: "Clients" as const, id: client.id })),
        ];
      },
    }),
    getClient: builder.query<ClientProfile, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Clients", id }],
    }),
    getClientSummary: builder.query<ClientSummaryResponse, string>({
      query: (id) => ({
        url: `/clients/${id}/summary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientSummaryResponse(response),
      providesTags: (_result, _error, id) => [
        { type: "Clients", id: getClientSummaryTagId(id) },
      ],
    }),
    getAdminClientMetaAdsConnection: builder.query<AdminClientMetaAdsConnection, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/meta-ads/connection`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsConnectionResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
      ],
    }),
    getAdminClientAmazonAdsConnection: builder.query<AdminClientAmazonAdsConnection, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/amazon-ads/connection`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsConnectionResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAdminClientSocialMediaConfig: builder.query<AdminClientSocialMediaConfig, string>({
      query: (clientId) => ({
        url: `/social-media/clients/${clientId}/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminSocialMediaConfigResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "Clients", id: getClientSocialMediaConfigTagId(clientId) },
      ],
    }),
    getAdminClientAmazonAdsSummary: builder.query<
      AmazonAdsSummaryResponse,
      { clientId: string; query?: AmazonAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/summary`,
        method: "GET",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSummaryResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAssignedClientAmazonAdsConfig: builder.query<
      AssignedClientAmazonAdsConfig,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/amazon-ads/clients/${clientId}/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeAssignedAmazonAdsConfigResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAssignedClientAmazonAdsSummary: builder.query<
      AmazonAdsSummaryResponse,
      { clientId: string; query?: AmazonAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/summary`,
        method: "GET",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSummaryResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAssignedClientAmazonAdsCampaigns: builder.query<
      AmazonAdsCampaignsResponse,
      { clientId: string; query?: AmazonAdsCampaignsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/campaigns`,
        method: "GET",
        params: serializeAmazonAdsCampaignsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsCampaignsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAssignedClientAmazonAdsProducts: builder.query<
      AmazonAdsProductsResponse,
      { clientId: string; query?: AmazonAdsProductsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/products`,
        method: "GET",
        params: serializeAmazonAdsProductsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsProductsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAssignedClientAmazonAdsInsights: builder.query<
      AmazonAdsInsightsResponse,
      { clientId: string; query?: AmazonAdsInsightsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/insights`,
        method: "GET",
        params: serializeAmazonAdsInsightsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsInsightsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    getAdminClientMetaAdsSummary: builder.query<MetaAdsSummaryResponse, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/meta-ads/summary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsSummaryResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
      ],
    }),
    getAdminMetaAdsClients: builder.query<AdminMetaAdsClientListResponse, MetaAdsDateRangeQuery | void>({
      query: (query) => ({
        url: "/admin/meta-ads/clients",
        method: "GET",
        params: serializeMetaAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsClientListResponse(response),
      providesTags: (result) => [
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "Clients" as const,
              id: getClientMetaAdsConnectionTagId(item.client.id),
            }))
          : []),
      ],
    }),
    getAdminAmazonAdsClients: builder.query<
      AdminAmazonAdsClientListResponse,
      AmazonAdsDateRangeQuery | void
    >({
      query: (query) => ({
        url: "/admin/amazon-ads/clients",
        method: "GET",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsClientListResponse(response),
      providesTags: (result) => [
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "Clients" as const,
              id: getClientAmazonAdsConnectionTagId(item.client.id),
            }))
          : []),
      ],
    }),
    getAdminMetaAdsSyncLogs: builder.query<
      AdminMetaAdsSyncLogsResponse,
      AdminMetaAdsSyncLogsQuery | void
    >({
      query: (query) => ({
        url: "/admin/meta-ads/sync-logs",
        method: "GET",
        params: serializeMetaAdsSyncLogsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsSyncLogsResponse(response),
      providesTags: [{ type: "Clients", id: CLIENT_META_ADS_SYNC_LOGS_LIST_ID }],
    }),
    getAdminAmazonAdsSyncLogs: builder.query<
      AdminAmazonAdsSyncLogsResponse,
      AdminAmazonAdsSyncLogsQuery | void
    >({
      query: (query) => ({
        url: "/admin/amazon-ads/sync-logs",
        method: "GET",
        params: serializeAmazonAdsSyncLogsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsSyncLogsResponse(response),
      providesTags: [{ type: "Clients", id: CLIENT_AMAZON_ADS_SYNC_LOGS_LIST_ID }],
    }),
    updateAdminClientMetaAdsConfig: builder.mutation<
      AdminClientMetaAdsConnection,
      { clientId: string; body: UpdateAdminClientMetaAdsConfigRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/meta-ads/config`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    updateAdminClientAmazonAdsConfig: builder.mutation<
      AdminClientAmazonAdsConnection,
      { clientId: string; body: UpdateAdminClientAmazonAdsConfigRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/config`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    updateAdminClientSocialMediaConfig: builder.mutation<
      AdminClientSocialMediaConfig,
      { clientId: string; body: UpdateAdminClientSocialMediaConfigRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/social-media/clients/${clientId}/config`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminSocialMediaConfigResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientSocialMediaConfigTagId(clientId) },
        { type: "SocialMediaConfig", id: clientId },
        { type: "SocialMediaSummary", id: clientId },
        { type: "SocialMediaSummary", id: "ADMIN_CLIENTS_LIST" },
      ],
    }),
    createAdminClientAmazonAdsOAuthUrl: builder.mutation<
      AmazonAdsOAuthStartResponse,
      { clientId: string; region?: AmazonAdsRegion }
    >({
      query: ({ clientId, region }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/oauth/start`,
        method: "GET",
        params: region ? { region } : undefined,
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsOAuthStartResponse(response),
    }),
    exchangeAdminClientAmazonAdsOAuthCode: builder.mutation<
      TestAmazonAdsConnectionResponse,
      { clientId: string; body: ExchangeAmazonAdsOAuthCodeRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/oauth/exchange`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTestAmazonAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    connectAdminClientAmazonAdsManual: builder.mutation<
      AdminClientAmazonAdsConnection,
      { clientId: string; body: ConnectManualAmazonAdsRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/connect/manual`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    testAdminClientAmazonAdsConnection: builder.mutation<
      TestAmazonAdsConnectionResponse,
      { clientId: string; body: TestAmazonAdsConnectionRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/test-connection`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTestAmazonAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    syncAdminClientAmazonAds: builder.mutation<
      AmazonAdsSyncResponse,
      { clientId: string; query?: AmazonAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/sync`,
        method: "POST",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
        { type: "Clients", id: CLIENT_AMAZON_ADS_SYNC_LOGS_LIST_ID },
      ],
    }),
    retryAdminClientAmazonAdsSync: builder.mutation<
      AmazonAdsSyncResponse,
      { clientId: string; query?: AmazonAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/sync/retry`,
        method: "POST",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
        { type: "Clients", id: CLIENT_AMAZON_ADS_SYNC_LOGS_LIST_ID },
      ],
    }),
    syncAssignedClientAmazonAds: builder.mutation<
      AmazonAdsSyncResponse,
      { clientId: string; query?: AmazonAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/sync`,
        method: "POST",
        params: serializeAmazonAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: CLIENTS_LIST_ID },
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
      ],
    }),
    disconnectAdminClientAmazonAds: builder.mutation<
      AdminClientAmazonAdsConnection,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/disconnect`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => normalizeAdminAmazonAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientAmazonAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    connectAdminClientMetaAdsManual: builder.mutation<
      AdminClientMetaAdsConnection,
      { clientId: string; body: ConnectManualMetaAdsRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/meta-ads/connect/manual`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    disconnectAdminClientMetaAds: builder.mutation<AdminClientMetaAdsConnection, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/admin/clients/${clientId}/meta-ads/disconnect`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => normalizeAdminMetaAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    testAdminClientMetaAdsConnection: builder.mutation<
      TestMetaAdsConnectionResponse,
      { clientId: string; body: TestMetaAdsConnectionRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/meta-ads/test-connection`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeTestMetaAdsConnectionResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    syncAdminClientMetaAds: builder.mutation<
      MetaAdsSyncResponse,
      { clientId: string; query?: MetaAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/meta-ads/sync`,
        method: "POST",
        params: serializeMetaAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
        { type: "Clients", id: CLIENT_META_ADS_SYNC_LOGS_LIST_ID },
      ],
    }),
    retryAdminClientMetaAdsSync: builder.mutation<
      MetaAdsSyncResponse,
      { clientId: string; query?: MetaAdsDateRangeQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/meta-ads/sync/retry`,
        method: "POST",
        params: serializeMetaAdsDateRangeQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsSyncResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "Clients", id: getClientMetaAdsConnectionTagId(clientId) },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
        { type: "Clients", id: CLIENT_META_ADS_SYNC_LOGS_LIST_ID },
      ],
    }),
    getAdminClientMetaAdsReports: builder.query<
      MetaAdsReportsResponse,
      { clientId: string; query?: MetaAdsReportsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/meta-ads/reports`,
        method: "GET",
        params: serializeMetaAdsReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_META_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
      ],
    }),
    createAdminClientMetaAdsReport: builder.mutation<
      MetaAdsReportItem,
      { clientId: string; body: CreateMetaAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/meta-ads/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_META_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    updateAdminMetaAdsReport: builder.mutation<
      MetaAdsReportItem,
      { reportId: string; body: UpdateMetaAdsReportRequest; clientId: string }
    >({
      query: ({ reportId, body }) => ({
        url: `/admin/meta-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeMetaAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_META_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
        { type: "Clients", id: CLIENT_META_ADS_GLOBAL_LIST_ID },
      ],
    }),
    getAdminClientAmazonAdsReports: builder.query<
      AmazonAdsReportsResponse,
      { clientId: string; query?: AmazonAdsReportsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/reports`,
        method: "GET",
        params: serializeAmazonAdsReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
      ],
    }),
    createAdminClientAmazonAdsReport: builder.mutation<
      AmazonAdsReportItem,
      { clientId: string; body: CreateAmazonAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/amazon-ads/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    updateAdminAmazonAdsReport: builder.mutation<
      AmazonAdsReportItem,
      { reportId: string; body: UpdateAmazonAdsReportRequest; clientId: string }
    >({
      query: ({ reportId, body }) => ({
        url: `/admin/amazon-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_GLOBAL_LIST_ID}:REPORTS:${clientId}` },
        { type: "Clients", id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
      ],
    }),
    exportAdminAmazonAdsReport: builder.mutation<
      string,
      { reportId: string; format: AmazonAdsReportExportFormat }
    >({
      query: ({ reportId, format }) => ({
        url: `/admin/amazon-ads/reports/${reportId}/export`,
        method: "GET",
        params: { format },
        responseHandler: (response: Response) => response.text(),
      }),
    }),
    getAssignedClientAmazonAdsReports: builder.query<
      AmazonAdsReportsResponse,
      { clientId: string; query?: AmazonAdsReportsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/amazon-ads/clients/${clientId}/reports`,
        method: "GET",
        params: serializeAmazonAdsReportsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportsResponse(response),
      providesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX}:REPORTS:${clientId}` },
      ],
    }),
    createAssignedClientAmazonAdsReport: builder.mutation<
      AmazonAdsReportItem,
      { clientId: string; body: CreateAmazonAdsReportRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/amazon-ads/clients/${clientId}/reports`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX}:REPORTS:${clientId}` },
      ],
    }),
    updateAssignedAmazonAdsReport: builder.mutation<
      AmazonAdsReportItem,
      { reportId: string; body: UpdateAmazonAdsReportRequest; clientId: string }
    >({
      query: ({ reportId, body }) => ({
        url: `/amazon-ads/reports/${reportId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAmazonAdsReportItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "Clients", id: `${CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX}:REPORTS:${clientId}` },
      ],
    }),
    exportAssignedAmazonAdsReport: builder.mutation<
      string,
      { reportId: string; format: AmazonAdsReportExportFormat }
    >({
      query: ({ reportId, format }) => ({
        url: `/amazon-ads/reports/${reportId}/export`,
        method: "GET",
        params: { format },
        responseHandler: (response: Response) => response.text(),
      }),
    }),
    createAdminClient: builder.mutation<ClientProfile, CreateAdminClientRequest>({
      query: (body) => ({
        url: "/admin/clients",
        method: "POST",
        body: serializeAdminClientMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (result) => getAdminClientCreateInvalidations(result),
    }),
    updateAdminClient: builder.mutation<
      ClientProfile,
      { id: string; body: UpdateAdminClientRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/clients/${id}`,
        method: "PATCH",
        body: serializeAdminClientMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (_result, _error, { id }) => getAdminClientMutationInvalidations(id),
    }),
    deactivateAdminClient: builder.mutation<ClientProfile, string>({
      query: (id) => ({
        url: `/admin/clients/${id}/deactivate`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (_result, _error, id) => getAdminClientMutationInvalidations(id),
    }),
    activateAdminClient: builder.mutation<ClientProfile, string>({
      query: (id) => ({
        url: `/admin/clients/${id}/activate`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (_result, _error, id) => getAdminClientMutationInvalidations(id),
    }),
    createOrLinkClientOwner: builder.mutation<
      ClientProfile,
      { clientId: string; body: CreateOrLinkClientOwnerRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/owner`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        ...getAdminClientMutationInvalidations(clientId),
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
      ],
    }),
    resetClientOwnerPassword: builder.mutation<
      ClientProfile,
      { clientId: string; body: ResetClientOwnerPasswordRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/reset-owner-password`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeClientResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => getAdminClientMutationInvalidations(clientId),
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useLazyGetClientQuery,
  useGetClientSummaryQuery,
  useGetAdminClientMetaAdsConnectionQuery,
  useGetAdminClientAmazonAdsConnectionQuery,
  useGetAdminClientSocialMediaConfigQuery,
  useGetAdminClientAmazonAdsSummaryQuery,
  useGetAssignedClientAmazonAdsConfigQuery,
  useGetAssignedClientAmazonAdsSummaryQuery,
  useGetAssignedClientAmazonAdsCampaignsQuery,
  useGetAssignedClientAmazonAdsProductsQuery,
  useGetAssignedClientAmazonAdsInsightsQuery,
  useGetAssignedClientAmazonAdsReportsQuery,
  useGetAdminClientMetaAdsSummaryQuery,
  useGetAdminMetaAdsClientsQuery,
  useGetAdminAmazonAdsClientsQuery,
  useGetAdminMetaAdsSyncLogsQuery,
  useGetAdminAmazonAdsSyncLogsQuery,
  useUpdateAdminClientMetaAdsConfigMutation,
  useUpdateAdminClientAmazonAdsConfigMutation,
  useUpdateAdminClientSocialMediaConfigMutation,
  useCreateAdminClientAmazonAdsOAuthUrlMutation,
  useExchangeAdminClientAmazonAdsOAuthCodeMutation,
  useConnectAdminClientAmazonAdsManualMutation,
  useTestAdminClientAmazonAdsConnectionMutation,
  useSyncAdminClientAmazonAdsMutation,
  useRetryAdminClientAmazonAdsSyncMutation,
  useSyncAssignedClientAmazonAdsMutation,
  useDisconnectAdminClientAmazonAdsMutation,
  useConnectAdminClientMetaAdsManualMutation,
  useDisconnectAdminClientMetaAdsMutation,
  useTestAdminClientMetaAdsConnectionMutation,
  useSyncAdminClientMetaAdsMutation,
  useRetryAdminClientMetaAdsSyncMutation,
  useGetAdminClientMetaAdsReportsQuery,
  useCreateAdminClientMetaAdsReportMutation,
  useUpdateAdminMetaAdsReportMutation,
  useGetAdminClientAmazonAdsReportsQuery,
  useCreateAdminClientAmazonAdsReportMutation,
  useUpdateAdminAmazonAdsReportMutation,
  useExportAdminAmazonAdsReportMutation,
  useCreateAssignedClientAmazonAdsReportMutation,
  useUpdateAssignedAmazonAdsReportMutation,
  useExportAssignedAmazonAdsReportMutation,
  useCreateAdminClientMutation,
  useUpdateAdminClientMutation,
  useDeactivateAdminClientMutation,
  useActivateAdminClientMutation,
  useCreateOrLinkClientOwnerMutation,
  useResetClientOwnerPasswordMutation,
} = clientsApi;

function getClientSummaryTagId(id: string): string {
  return `${CLIENT_SUMMARY_ID_PREFIX}:${id}`;
}

function getClientMetaAdsConnectionTagId(id: string): string {
  return `${CLIENT_META_ADS_CONNECTION_ID_PREFIX}:${id}`;
}

function getClientAmazonAdsConnectionTagId(id: string): string {
  return `${CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX}:${id}`;
}

function getClientSocialMediaConfigTagId(id: string): string {
  return `${CLIENT_SOCIAL_MEDIA_CONFIG_ID_PREFIX}:${id}`;
}

function getAdminClientMutationInvalidations(id: string) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    { type: "Clients" as const, id: CLIENT_META_ADS_GLOBAL_LIST_ID },
    { type: "Clients" as const, id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
    { type: "Clients" as const, id },
    { type: "Clients" as const, id: getClientSummaryTagId(id) },
    { type: "Clients" as const, id: getClientAmazonAdsConnectionTagId(id) },
    { type: "Clients" as const, id: getClientSocialMediaConfigTagId(id) },
    { type: "AdminSummary" as const, id: ADMIN_SUMMARY_ID },
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
  ];
}

function getAdminClientCreateInvalidations(result: ClientProfile | undefined) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    { type: "Clients" as const, id: CLIENT_META_ADS_GLOBAL_LIST_ID },
    { type: "Clients" as const, id: CLIENT_AMAZON_ADS_GLOBAL_LIST_ID },
    ...(result
      ? [
          { type: "Clients" as const, id: result.id },
          { type: "Clients" as const, id: getClientSummaryTagId(result.id) },
          { type: "Clients" as const, id: getClientAmazonAdsConnectionTagId(result.id) },
          { type: "Clients" as const, id: getClientSocialMediaConfigTagId(result.id) },
        ]
      : []),
    { type: "AdminSummary" as const, id: ADMIN_SUMMARY_ID },
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
  ];
}

function serializeClientsListQuery(
  query: ClientsListQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.page !== undefined) {
    params.page = query.page;
  }

  if (query.limit !== undefined) {
    params.limit = query.limit;
  }

  if (query.sortBy !== undefined) {
    params.sortBy = query.sortBy;
  }

  if (query.sortOrder !== undefined) {
    params.sortOrder = query.sortOrder;
  }

  if (query.search !== undefined && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  return params;
}

function serializeMetaAdsDateRangeQuery(
  query: MetaAdsDateRangeQuery | void,
): Record<string, string> {
  if (!query) {
    return {};
  }

  const params: Record<string, string> = {};

  if (query.since !== undefined && query.since.trim().length > 0) {
    params.since = query.since.trim();
  }

  if (query.until !== undefined && query.until.trim().length > 0) {
    params.until = query.until.trim();
  }

  return params;
}

function serializeAmazonAdsDateRangeQuery(
  query: AmazonAdsDateRangeQuery | void,
): Record<string, string> {
  if (!query) {
    return {};
  }

  const params: Record<string, string> = {};

  if (query.since !== undefined && query.since.trim().length > 0) {
    params.since = query.since.trim();
  }

  if (query.until !== undefined && query.until.trim().length > 0) {
    params.until = query.until.trim();
  }

  return params;
}

function serializeAmazonAdsCampaignsQuery(
  query: AmazonAdsCampaignsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {
    ...serializeAmazonAdsDateRangeQuery(query),
  };

  if (query.adProduct !== undefined) {
    params.adProduct = query.adProduct;
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return params;
}

function serializeAmazonAdsProductsQuery(
  query: AmazonAdsProductsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {
    ...serializeAmazonAdsDateRangeQuery(query),
  };

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return params;
}

function serializeAmazonAdsInsightsQuery(
  query: AmazonAdsInsightsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {
    ...serializeAmazonAdsDateRangeQuery(query),
  };

  if (query.level !== undefined) {
    params.level = query.level;
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return params;
}

function serializeMetaAdsSyncLogsQuery(
  query: AdminMetaAdsSyncLogsQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.clientProfileId !== undefined && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.failedOnly !== undefined) {
    params.failedOnly = query.failedOnly;
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return params;
}

function serializeAmazonAdsSyncLogsQuery(
  query: AdminAmazonAdsSyncLogsQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.clientProfileId !== undefined && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.failedOnly !== undefined) {
    params.failedOnly = query.failedOnly;
  }

  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.limit = Math.trunc(query.limit);
  }

  return params;
}

function serializeMetaAdsReportsQuery(
  query: MetaAdsReportsQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.type !== undefined) {
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

function serializeAmazonAdsReportsQuery(
  query: AmazonAdsReportsQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.type !== undefined) {
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

function serializeAdminClientMutationBody(
  body: CreateAdminClientRequest | UpdateAdminClientRequest,
): Record<string, unknown> {
  const serializedBody: Record<string, unknown> = { ...body };

  if (body.purchasedServices !== undefined) {
    serializedBody.purchasedServices = body.purchasedServices.map((serviceKey) => ({
      serviceKey: toBackendServiceKey(serviceKey),
      status: "ACTIVE",
    }));
  }

  return serializedBody;
}
