import { baseApi } from "../../services/baseApi";
import type {
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
  ClientSummaryResponse,
  CreateAdminClientRequest,
  CreateOrLinkClientOwnerRequest,
  UpdateAdminClientRequest,
} from "./clientsTypes";
import {
  normalizeClientResponse,
  normalizeClientSummaryResponse,
  normalizeClientsListResponse,
  toBackendServiceKey,
} from "./clientsUtils";

const CLIENTS_LIST_ID = "LIST";
const CLIENT_SUMMARY_ID_PREFIX = "SUMMARY";
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
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useLazyGetClientQuery,
  useGetClientSummaryQuery,
  useCreateAdminClientMutation,
  useUpdateAdminClientMutation,
  useDeactivateAdminClientMutation,
  useActivateAdminClientMutation,
  useCreateOrLinkClientOwnerMutation,
} = clientsApi;

function getClientSummaryTagId(id: string): string {
  return `${CLIENT_SUMMARY_ID_PREFIX}:${id}`;
}

function getAdminClientMutationInvalidations(id: string) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    { type: "Clients" as const, id },
    { type: "Clients" as const, id: getClientSummaryTagId(id) },
    { type: "AdminSummary" as const, id: ADMIN_SUMMARY_ID },
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
  ];
}

function getAdminClientCreateInvalidations(result: ClientProfile | undefined) {
  return [
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    ...(result
      ? [
          { type: "Clients" as const, id: result.id },
          { type: "Clients" as const, id: getClientSummaryTagId(result.id) },
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
