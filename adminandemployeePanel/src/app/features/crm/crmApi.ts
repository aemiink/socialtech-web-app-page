import { baseApi } from "../../services/baseApi";
import type {
  ConvertCrmLeadRequest,
  ConvertCrmLeadResponse,
  CreateCrmLeadActivityRequest,
  CreateCrmLeadRequest,
  CrmLeadDetail,
  CrmLeadListQuery,
  CrmLeadListResponse,
  CrmLeadScanLogSummary,
  CrmLeadScanLogsResponse,
  RunAdminCrmLeadScanRequest,
  RunAdminCrmLeadScanResponse,
  UpdateAdminCrmLeadRequest,
  UpdateAssignedCrmLeadRequest,
} from "./crmTypes";
import {
  isCrmLeadListResponse,
  normalizeCrmLeadScanLogsResponse,
  normalizeCrmLeadScanLogSummary,
  normalizeCrmLeadScanResponse,
} from "./crmUtils";

const CRM_LEADS_LIST_ID = "LIST";
const CLIENTS_LIST_ID = "LIST";
const ADMIN_SUMMARY_ID = "SUMMARY";
const AUDIT_LOGS_LIST_ID = "LIST";

export const crmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCrmLeads: builder.query<CrmLeadListResponse, CrmLeadListQuery | void>({
      query: (query) => ({
        url: "/admin/crm/leads",
        method: "GET",
        params: serializeCrmLeadListQuery(query),
      }),
      transformResponse: normalizeCrmLeadListResponse,
      providesTags: (result) => getCrmLeadListTags(result),
    }),
    getAdminCrmLead: builder.query<CrmLeadDetail, string>({
      query: (id) => ({ url: `/admin/crm/leads/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "CrmLeads", id }],
    }),
    createAdminCrmLead: builder.mutation<CrmLeadDetail, CreateCrmLeadRequest>({
      query: (body) => ({ url: "/admin/crm/leads", method: "POST", body }),
      invalidatesTags: [
        { type: "CrmLeads", id: CRM_LEADS_LIST_ID },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    runAdminCrmLeadScan: builder.mutation<RunAdminCrmLeadScanResponse, RunAdminCrmLeadScanRequest>({
      query: (body) => ({ url: "/admin/crm/lead-scan/run", method: "POST", body }),
      transformResponse: normalizeCrmLeadScanResponse,
      invalidatesTags: [
        { type: "CrmLeads", id: CRM_LEADS_LIST_ID },
        { type: "AuditLogs", id: AUDIT_LOGS_LIST_ID },
      ],
    }),
    getAdminCrmLeadScanLogs: builder.query<CrmLeadScanLogsResponse, void>({
      query: () => ({ url: "/admin/crm/lead-scan/logs", method: "GET" }),
      transformResponse: normalizeCrmLeadScanLogsResponse,
      providesTags: [{ type: "AuditLogs", id: AUDIT_LOGS_LIST_ID }],
    }),
    getAdminCrmLeadScanLog: builder.query<CrmLeadScanLogSummary, string>({
      query: (id) => ({ url: `/admin/crm/lead-scan/logs/${id}`, method: "GET" }),
      transformResponse: normalizeCrmLeadScanLogSummary,
      providesTags: (_result, _error, id) => [{ type: "AuditLogs", id }],
    }),
    updateAdminCrmLead: builder.mutation<CrmLeadDetail, { id: string; body: UpdateAdminCrmLeadRequest }>({
      query: ({ id, body }) => ({ url: `/admin/crm/leads/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => getLeadMutationInvalidations(id),
    }),
    createAdminCrmLeadActivity: builder.mutation<
      unknown,
      { id: string; body: CreateCrmLeadActivityRequest }
    >({
      query: ({ id, body }) => ({ url: `/admin/crm/leads/${id}/activities`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => getLeadMutationInvalidations(id),
    }),
    convertAdminCrmLead: builder.mutation<
      ConvertCrmLeadResponse,
      { id: string; body: ConvertCrmLeadRequest }
    >({
      query: ({ id, body }) => ({ url: `/admin/crm/leads/${id}/convert`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => [
        ...getLeadMutationInvalidations(id),
        { type: "Clients", id: CLIENTS_LIST_ID },
        { type: "AdminSummary", id: ADMIN_SUMMARY_ID },
      ],
    }),
    getCrmLeads: builder.query<CrmLeadListResponse, CrmLeadListQuery | void>({
      query: (query) => ({
        url: "/crm/leads",
        method: "GET",
        params: serializeCrmLeadListQuery(query),
      }),
      transformResponse: normalizeCrmLeadListResponse,
      providesTags: (result) => getCrmLeadListTags(result),
    }),
    getCrmLead: builder.query<CrmLeadDetail, string>({
      query: (id) => ({ url: `/crm/leads/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "CrmLeads", id }],
    }),
    updateCrmLead: builder.mutation<CrmLeadDetail, { id: string; body: UpdateAssignedCrmLeadRequest }>({
      query: ({ id, body }) => ({ url: `/crm/leads/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => getLeadMutationInvalidations(id),
    }),
    createCrmLeadActivity: builder.mutation<
      unknown,
      { id: string; body: CreateCrmLeadActivityRequest }
    >({
      query: ({ id, body }) => ({ url: `/crm/leads/${id}/activities`, method: "POST", body }),
      invalidatesTags: (_result, _error, { id }) => getLeadMutationInvalidations(id),
    }),
  }),
});

export const {
  useGetAdminCrmLeadsQuery,
  useGetAdminCrmLeadQuery,
  useCreateAdminCrmLeadMutation,
  useRunAdminCrmLeadScanMutation,
  useGetAdminCrmLeadScanLogsQuery,
  useGetAdminCrmLeadScanLogQuery,
  useUpdateAdminCrmLeadMutation,
  useCreateAdminCrmLeadActivityMutation,
  useConvertAdminCrmLeadMutation,
  useGetCrmLeadsQuery,
  useGetCrmLeadQuery,
  useUpdateCrmLeadMutation,
  useCreateCrmLeadActivityMutation,
} = crmApi;

function serializeCrmLeadListQuery(query: CrmLeadListQuery | void): Record<string, string | number> {
  if (!query) {
    return {};
  }
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      continue;
    }
    params[key] = typeof value === "string" ? value.trim() : value;
  }
  return params;
}

function normalizeCrmLeadListResponse(response: unknown): CrmLeadListResponse {
  if (isCrmLeadListResponse(response)) {
    return response;
  }
  return {
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

function getCrmLeadListTags(result: CrmLeadListResponse | undefined) {
  if (!result) {
    return [{ type: "CrmLeads" as const, id: CRM_LEADS_LIST_ID }];
  }
  return [
    { type: "CrmLeads" as const, id: CRM_LEADS_LIST_ID },
    ...result.data.map((lead) => ({ type: "CrmLeads" as const, id: lead.id })),
  ];
}

function getLeadMutationInvalidations(id: string) {
  return [
    { type: "CrmLeads" as const, id: CRM_LEADS_LIST_ID },
    { type: "CrmLeads" as const, id },
    { type: "CrmActivities" as const, id },
    { type: "AuditLogs" as const, id: AUDIT_LOGS_LIST_ID },
  ];
}
