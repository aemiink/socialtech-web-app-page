import { baseApi } from "../../services/baseApi";
import type {
  AdminUser,
  AdminUsersListQuery,
  AdminUsersListResponse,
  CreateAdminEmployeeUserRequest,
  ResetAdminUserPasswordRequest,
  UpdateAdminUserRequest,
} from "./adminUsersTypes";

const ADMIN_USERS_LIST_ID = "LIST";
const AUDIT_LOGS_LIST_ID = "LIST";
const ADMIN_ASSIGNMENTS_LIST_ID = "LIST";

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUsersListResponse, AdminUsersListQuery | void>({
      query: (query) => ({
        url: "/admin/users",
        method: "GET",
        params: serializeAdminUsersListQuery(query),
      }),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "AdminUsers", id: ADMIN_USERS_LIST_ID }];
        }

        return [
          { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
          ...result.data.map((user) => ({ type: "AdminUsers" as const, id: user.id })),
        ];
      },
    }),
    getAdminUser: builder.query<AdminUser, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "AdminUsers", id }],
    }),
    createAdminUser: builder.mutation<AdminUser, CreateAdminEmployeeUserRequest>({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; body: UpdateAdminUserRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AdminUsers", id },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    deactivateAdminUser: builder.mutation<AdminUser, string>({
      query: (id) => ({
        url: `/admin/users/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AdminUsers", id },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    activateAdminUser: builder.mutation<AdminUser, string>({
      query: (id) => ({
        url: `/admin/users/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AdminUsers", id },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    deleteAdminUser: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AdminUsers", id },
        { type: "AdminAssignments", id: ADMIN_ASSIGNMENTS_LIST_ID },
        { type: "AdminSummary", id: "SUMMARY" },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    resetAdminUserPassword: builder.mutation<
      { success?: boolean; updatedAt?: string } | AdminUser,
      { id: string; body: ResetAdminUserPasswordRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/reset-password`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminUsers", id: ADMIN_USERS_LIST_ID },
        { type: "AdminUsers", id },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeactivateAdminUserMutation,
  useActivateAdminUserMutation,
  useDeleteAdminUserMutation,
  useResetAdminUserPasswordMutation,
} = adminUsersApi;

function serializeAdminUsersListQuery(
  query: AdminUsersListQuery | void,
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
  if (query.accountType !== undefined) {
    params.accountType = query.accountType;
  }
  if (query.role !== undefined) {
    params.role = query.role;
  }
  if (query.isActive !== undefined) {
    params.isActive = query.isActive;
  }
  if (query.search !== undefined && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}
