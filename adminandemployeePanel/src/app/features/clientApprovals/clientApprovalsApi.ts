import { baseApi } from "../../services/baseApi";
import type {
  ClientApproval,
  ClientApprovalsListQuery,
  ClientApprovalsListResponse,
  CreateClientApprovalRequest,
  UpdateClientApprovalRequest,
} from "./clientApprovalsTypes";
import {
  normalizeClientApprovalResponse,
  normalizeClientApprovalsListResponse,
} from "./clientApprovalsUtils";

export const clientApprovalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientApprovals: builder.query<ClientApprovalsListResponse, ClientApprovalsListQuery | void>({
      query: (query) => ({
        url: "/client-approvals",
        method: "GET",
        params: serializeClientApprovalListQuery(query),
      }),
      transformResponse: normalizeAdminClientApprovalListResponse,
    }),
    getClientApproval: builder.query<ClientApproval, string>({
      query: (approvalId) => ({
        url: `/client-approvals/${approvalId}`,
        method: "GET",
      }),
      transformResponse: normalizeClientApprovalResponse,
    }),
    createClientApproval: builder.mutation<ClientApproval, CreateClientApprovalRequest>({
      query: (body) => ({
        url: "/client-approvals",
        method: "POST",
        body,
      }),
      transformResponse: normalizeClientApprovalResponse,
    }),
    updateClientApproval: builder.mutation<
      ClientApproval,
      { id: string; body: UpdateClientApprovalRequest }
    >({
      query: ({ id, body }) => ({
        url: `/client-approvals/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: normalizeClientApprovalResponse,
    }),
    cancelClientApproval: builder.mutation<ClientApproval, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/client-approvals/${id}/cancel`,
        method: "PATCH",
        body: note && note.trim().length > 0 ? { note: note.trim() } : {},
      }),
      transformResponse: normalizeClientApprovalResponse,
    }),
  }),
});

export const {
  useGetClientApprovalsQuery,
  useGetClientApprovalQuery,
  useCreateClientApprovalMutation,
  useUpdateClientApprovalMutation,
  useCancelClientApprovalMutation,
} = clientApprovalsApi;

export function serializeClientApprovalListQuery(
  query: ClientApprovalsListQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (typeof query.page === "number") {
    params.page = query.page;
  }

  if (typeof query.limit === "number") {
    params.limit = query.limit;
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.type) {
    params.type = query.type;
  }

  if (query.entityType) {
    params.entityType = query.entityType;
  }

  if (query.serviceKey) {
    params.serviceKey = query.serviceKey;
  }

  if (query.onlyPending !== undefined) {
    params.onlyPending = query.onlyPending;
  }

  if (query.projectId && query.projectId.trim().length > 0) {
    params.projectId = query.projectId.trim();
  }

  if (query.clientProfileId && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.assignedToUserId && query.assignedToUserId.trim().length > 0) {
    params.assignedToUserId = query.assignedToUserId.trim();
  }

  if (query.search && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}

export function normalizeAdminClientApprovalListResponse(
  response: unknown,
): ClientApprovalsListResponse {
  const normalized = normalizeClientApprovalsListResponse(response);

  if (
    typeof response !== "object" ||
    response === null ||
    !("meta" in response) ||
    typeof (response as { meta?: unknown }).meta !== "object" ||
    (response as { meta?: unknown }).meta === null
  ) {
    return {
      data: normalized.data,
      meta: {
        page: 1,
        limit: 20,
        total: normalized.data.length,
        totalPages: normalized.data.length > 0 ? 1 : 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  return normalized;
}
