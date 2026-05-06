import { baseApi } from "../../services/baseApi";

export type ClientApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACKNOWLEDGED"
  | "CANCELLED"
  | "EXPIRED";

export type ClientApprovalType =
  | "DESIGN_APPROVAL"
  | "FILE_APPROVAL"
  | "TASK_APPROVAL"
  | "SPRINT_APPROVAL"
  | "RELEASE_APPROVAL"
  | "REVISION_APPROVAL"
  | "MEETING_CONFIRMATION"
  | "INFORMATION"
  | "GENERAL_CONFIRMATION";

export type ClientApproval = {
  id: string;
  clientProfileId: string;
  projectId?: string | null;
  type: ClientApprovalType;
  status: ClientApprovalStatus;
  title: string;
  message: string;
  actionPayload?: Record<string, unknown> | null;
  clientResponseNote?: string | null;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientApprovalListQuery = {
  page?: number;
  limit?: number;
  status?: ClientApprovalStatus;
  type?: ClientApprovalType;
  projectId?: string;
  search?: string;
};

export type ClientApprovalListResponse = {
  data: ClientApproval[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const clientApprovalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientApprovals: builder.query<ClientApprovalListResponse, ClientApprovalListQuery | void>({
      query: (query) => ({
        url: "/client/approvals",
        method: "GET",
        params: serializeClientApprovalListQuery(query),
      }),
      transformResponse: normalizeClientApprovalListResponse,
    }),
    getClientApproval: builder.query<ClientApproval, string>({
      query: (approvalId) => ({
        url: `/client/approvals/${approvalId}`,
        method: "GET",
      }),
    }),
    respondToClientApproval: builder.mutation<
      ClientApproval,
      { id: string; status: "APPROVED" | "REJECTED"; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/client/approvals/${id}/respond`,
        method: "POST",
        body: {
          status,
          ...(note && note.trim().length > 0 ? { note: note.trim() } : {}),
        },
      }),
    }),
    acknowledgeClientApproval: builder.mutation<ClientApproval, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/client/approvals/${id}/acknowledge`,
        method: "POST",
        body: note && note.trim().length > 0 ? { note: note.trim() } : {},
      }),
    }),
  }),
});

export const {
  useGetClientApprovalsQuery,
  useGetClientApprovalQuery,
  useRespondToClientApprovalMutation,
  useAcknowledgeClientApprovalMutation,
} = clientApprovalsApi;

export function serializeClientApprovalListQuery(
  query: ClientApprovalListQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {};

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

  if (query.projectId && query.projectId.trim().length > 0) {
    params.projectId = query.projectId.trim();
  }

  if (query.search && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}

export function normalizeClientApprovalListResponse(response: unknown): ClientApprovalListResponse {
  const fallback: ClientApprovalListResponse = {
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  if (typeof response !== "object" || response === null) {
    return fallback;
  }

  const candidate = response as Partial<ClientApprovalListResponse>;
  return {
    data: Array.isArray(candidate.data) ? candidate.data : [],
    meta: candidate.meta ?? fallback.meta,
  };
}
