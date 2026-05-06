import { baseApi } from "../../services/baseApi";
import type {
  ClientApproval,
  ClientApprovalListResponse,
  ClientApprovalStatus,
} from "./approvalsTypes";

const CLIENT_APPROVAL_LIST_ID = "LIST";

export const approvalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientApprovals: builder.query<
      ClientApprovalListResponse,
      { onlyPending?: boolean; projectId?: string } | void
    >({
      query: (query) => ({
        url: "/client/approvals",
        method: "GET",
        params: query ?? {},
      }),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "ClientApprovals", id: CLIENT_APPROVAL_LIST_ID }];
        }
        return [
          { type: "ClientApprovals", id: CLIENT_APPROVAL_LIST_ID },
          ...result.data.map((item) => ({ type: "ClientApprovals" as const, id: item.id })),
        ];
      },
    }),
    getClientApproval: builder.query<ClientApproval, string>({
      query: (id) => ({
        url: `/client/approvals/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ClientApprovals", id }],
    }),
    respondClientApproval: builder.mutation<
      ClientApproval,
      { id: string; status: Extract<ClientApprovalStatus, "APPROVED" | "REJECTED">; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/client/approvals/${id}/respond`,
        method: "POST",
        body: { status, note },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ClientApprovals", id: CLIENT_APPROVAL_LIST_ID },
        { type: "ClientApprovals", id: arg.id },
      ],
    }),
    acknowledgeClientApproval: builder.mutation<ClientApproval, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/client/approvals/${id}/acknowledge`,
        method: "POST",
        body: note ? { note } : {},
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ClientApprovals", id: CLIENT_APPROVAL_LIST_ID },
        { type: "ClientApprovals", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetClientApprovalsQuery,
  useGetClientApprovalQuery,
  useRespondClientApprovalMutation,
  useAcknowledgeClientApprovalMutation,
} = approvalsApi;
