import { baseApi } from "../../services/baseApi";
import type {
  AdminAuditLog,
  AdminAuditLogsListQuery,
  AdminAuditLogsListResponse,
} from "./auditLogsTypes";

const AUDIT_LOGS_LIST_ID = "LIST";

export const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAuditLogs: builder.query<AdminAuditLogsListResponse, AdminAuditLogsListQuery | void>({
      query: (query) => ({
        url: "/admin/audit-logs",
        method: "GET",
        params: serializeAuditLogsListQuery(query),
      }),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "AuditLogs", id: AUDIT_LOGS_LIST_ID }];
        }

        return [
          { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
          ...result.data.map((log) => ({ type: "AuditLogs" as const, id: log.id })),
        ];
      },
    }),
    getAdminAuditLog: builder.query<AdminAuditLog, string>({
      query: (id) => ({
        url: `/admin/audit-logs/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "AuditLogs", id }],
    }),
  }),
});

export const {
  useGetAdminAuditLogsQuery,
  useGetAdminAuditLogQuery,
  useLazyGetAdminAuditLogQuery,
} = auditLogsApi;

function serializeAuditLogsListQuery(
  query: AdminAuditLogsListQuery | void,
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

  if (query.action !== undefined && query.action.trim().length > 0) {
    params.action = query.action.trim();
  }

  if (query.actorUserId !== undefined && query.actorUserId.trim().length > 0) {
    params.actorUserId = query.actorUserId.trim();
  }

  if (query.targetUserId !== undefined && query.targetUserId.trim().length > 0) {
    params.targetUserId = query.targetUserId.trim();
  }

  if (
    query.targetClientProfileId !== undefined &&
    query.targetClientProfileId.trim().length > 0
  ) {
    params.targetClientProfileId = query.targetClientProfileId.trim();
  }

  if (query.entityType !== undefined && query.entityType.trim().length > 0) {
    params.entityType = query.entityType.trim();
  }

  if (query.entityId !== undefined && query.entityId.trim().length > 0) {
    params.entityId = query.entityId.trim();
  }

  if (query.dateFrom !== undefined && query.dateFrom.trim().length > 0) {
    params.dateFrom = query.dateFrom.trim();
  }

  if (query.dateTo !== undefined && query.dateTo.trim().length > 0) {
    params.dateTo = query.dateTo.trim();
  }

  if (query.search !== undefined && query.search.trim().length > 0) {
    params.search = query.search.trim();
  }

  return params;
}
