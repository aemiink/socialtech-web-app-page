import { baseApi } from "../../services/baseApi";
import type {
  AdminMetaAdsSyncLogsQuery,
  AdminMetaAdsSyncLogsResponse,
  CreateMetaAdsReportRequest,
  AdminMetaAdsClientListResponse,
  AdminClientAmazonAdsConnection,
  AdminClientMetaAdsConnection,
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
  TestMetaAdsConnectionRequest,
  TestMetaAdsConnectionResponse,
  UpdateMetaAdsReportRequest,
  UpdateAdminClientAmazonAdsConfigRequest,
  UpdateAdminClientMetaAdsConfigRequest,
  UpdateAdminClientRequest,
} from "./clientsTypes";
import {
  normalizeAdminAmazonAdsConnectionResponse,
  normalizeAdminMetaAdsClientListResponse,
  normalizeAdminMetaAdsSyncLogsResponse,
  normalizeClientResponse,
  normalizeClientSummaryResponse,
  normalizeClientsListResponse,
  normalizeAdminMetaAdsConnectionResponse,
  normalizeMetaAdsSyncResponse,
  normalizeMetaAdsReportsResponse,
  normalizeMetaAdsReportItemResponse,
  normalizeMetaAdsSummaryResponse,
  normalizeTestMetaAdsConnectionResponse,
  toBackendServiceKey,
} from "./clientsUtils";

const CLIENTS_LIST_ID = "LIST";
const CLIENT_SUMMARY_ID_PREFIX = "SUMMARY";
const CLIENT_META_ADS_CONNECTION_ID_PREFIX = "META_ADS_CONNECTION";
const CLIENT_AMAZON_ADS_CONNECTION_ID_PREFIX = "AMAZON_ADS_CONNECTION";
const CLIENT_META_ADS_GLOBAL_LIST_ID = "META_ADS_GLOBAL_LIST";
const CLIENT_META_ADS_SYNC_LOGS_LIST_ID = "META_ADS_SYNC_LOGS_LIST";
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
  useGetAdminClientMetaAdsSummaryQuery,
  useGetAdminMetaAdsClientsQuery,
  useGetAdminMetaAdsSyncLogsQuery,
  useUpdateAdminClientMetaAdsConfigMutation,
  useUpdateAdminClientAmazonAdsConfigMutation,
  useConnectAdminClientMetaAdsManualMutation,
  useDisconnectAdminClientMetaAdsMutation,
  useTestAdminClientMetaAdsConnectionMutation,
  useSyncAdminClientMetaAdsMutation,
  useRetryAdminClientMetaAdsSyncMutation,
  useGetAdminClientMetaAdsReportsQuery,
  useCreateAdminClientMetaAdsReportMutation,
  useUpdateAdminMetaAdsReportMutation,
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

function getAdminClientMutationInvalidations(id: string) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    { type: "Clients" as const, id: CLIENT_META_ADS_GLOBAL_LIST_ID },
    { type: "Clients" as const, id },
    { type: "Clients" as const, id: getClientSummaryTagId(id) },
    { type: "Clients" as const, id: getClientAmazonAdsConnectionTagId(id) },
    { type: "AdminSummary" as const, id: ADMIN_SUMMARY_ID },
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
  ];
}

function getAdminClientCreateInvalidations(result: ClientProfile | undefined) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    { type: "Clients" as const, id: CLIENT_META_ADS_GLOBAL_LIST_ID },
    ...(result
      ? [
          { type: "Clients" as const, id: result.id },
          { type: "Clients" as const, id: getClientSummaryTagId(result.id) },
          { type: "Clients" as const, id: getClientAmazonAdsConnectionTagId(result.id) },
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
