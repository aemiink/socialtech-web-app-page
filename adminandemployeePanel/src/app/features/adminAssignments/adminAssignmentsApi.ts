import { baseApi } from "../../services/baseApi";
import type {
  AdminAssignment,
  AdminAssignmentsListQuery,
  AdminAssignmentsListResponse,
  CreateAdminAssignmentRequest,
  UpdateAdminAssignmentRequest,
} from "./adminAssignmentsTypes";
import {
  normalizeAdminAssignmentResponse,
  normalizeAdminAssignmentsListResponse,
} from "./adminAssignmentsUtils";

const ADMIN_ASSIGNMENTS_LIST_ID = "LIST";
const AUDIT_LOGS_LIST_ID = "LIST";
const ADMIN_SUMMARY_ID = "SUMMARY";
const CLIENTS_LIST_ID = "LIST";

export const adminAssignmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAssignments: builder.query<
      AdminAssignmentsListResponse,
      AdminAssignmentsListQuery | void
    >({
      query: (query) => ({
        url: "/admin/assignments",
        method: "GET",
        params: serializeAdminAssignmentsListQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeAdminAssignmentsListResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "AdminAssignments", id: ADMIN_ASSIGNMENTS_LIST_ID }];
        }

        return [
          { type: "AdminAssignments", id: ADMIN_ASSIGNMENTS_LIST_ID },
          ...result.map((assignment) => ({
            type: "AdminAssignments" as const,
            id: assignment.id,
          })),
        ];
      },
    }),
    createAdminAssignment: builder.mutation<
      AdminAssignment,
      CreateAdminAssignmentRequest
    >({
      query: (body) => ({
        url: "/admin/assignments",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminAssignmentResponse(response),
      invalidatesTags: (result, _error, body) =>
        getAdminAssignmentMutationInvalidations(result, body.clientProfileId),
    }),
    updateAdminAssignment: builder.mutation<
      AdminAssignment,
      { id: string; body: UpdateAdminAssignmentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/assignments/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeAdminAssignmentResponse(response),
      invalidatesTags: (result, _error, { id }) =>
        getAdminAssignmentMutationInvalidations(result, undefined, id),
    }),
    deactivateAdminAssignment: builder.mutation<AdminAssignment, string>({
      query: (id) => ({
        url: `/admin/assignments/${id}/deactivate`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) => normalizeAdminAssignmentResponse(response),
      invalidatesTags: (result, _error, id) =>
        getAdminAssignmentMutationInvalidations(result, undefined, id),
    }),
    activateAdminAssignment: builder.mutation<AdminAssignment, string>({
      query: (id) => ({
        url: `/admin/assignments/${id}/activate`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) => normalizeAdminAssignmentResponse(response),
      invalidatesTags: (result, _error, id) =>
        getAdminAssignmentMutationInvalidations(result, undefined, id),
    }),
  }),
});

export const {
  useGetAdminAssignmentsQuery,
  useCreateAdminAssignmentMutation,
  useUpdateAdminAssignmentMutation,
  useDeactivateAdminAssignmentMutation,
  useActivateAdminAssignmentMutation,
} = adminAssignmentsApi;

function getAdminAssignmentMutationInvalidations(
  result: AdminAssignment | undefined,
  fallbackClientProfileId?: string,
  fallbackAssignmentId?: string,
) {
  const assignmentId = result?.id ?? fallbackAssignmentId;
  const clientProfileId = result?.clientProfileId ?? fallbackClientProfileId;

  return [
    { type: "AdminAssignments" as const, id: ADMIN_ASSIGNMENTS_LIST_ID },
    ...(assignmentId ? [{ type: "AdminAssignments" as const, id: assignmentId }] : []),
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
    { type: "AdminSummary" as const, id: ADMIN_SUMMARY_ID },
    { type: "Clients" as const, id: CLIENTS_LIST_ID },
    ...(clientProfileId ? [{ type: "Clients" as const, id: clientProfileId }] : []),
  ];
}

function serializeAdminAssignmentsListQuery(
  query: AdminAssignmentsListQuery | void,
): Record<string, string | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | boolean> = {};

  if (query.employeeUserId !== undefined && query.employeeUserId.trim().length > 0) {
    params.employeeUserId = query.employeeUserId.trim();
  }

  if (query.clientProfileId !== undefined && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.scope !== undefined) {
    params.scope = query.scope;
  }

  if (query.isActive !== undefined) {
    params.isActive = query.isActive;
  }

  return params;
}
