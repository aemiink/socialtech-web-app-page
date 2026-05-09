import { baseApi } from "../../services/baseApi";
import type { ClientTask, UpdateClientTaskApprovalRequest } from "./tasksTypes";
import { normalizeClientTaskResponse, normalizeClientTasksResponse } from "./tasksUtils";

export type GetClientTasksQueryParams = {
  projectId?: string;
  type?: string;
  workstream?: string;
  severity?: string;
  environment?: string;
  sprintId?: string;
  approvalRequired?: boolean;
  approvalStatus?: string;
  approvalType?: string;
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientTasks: builder.query<ClientTask[], GetClientTasksQueryParams | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: serializeGetClientTasksQueryParams(params),
      }),
      transformResponse: normalizeClientTasksResponse,
    }),
    updateClientTaskApproval: builder.mutation<
      ClientTask,
      { taskId: string; body: UpdateClientTaskApprovalRequest }
    >({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: normalizeClientTaskResponse,
    }),
  }),
});

export const { useGetClientTasksQuery, useUpdateClientTaskApprovalMutation } = tasksApi;

function serializeGetClientTasksQueryParams(
  params: GetClientTasksQueryParams | void,
): Record<string, string | boolean> {
  if (!params) {
    return {};
  }

  const query: Record<string, string | boolean> = {};

  if (params.projectId) {
    query.projectId = params.projectId;
  }
  if (params.type) {
    query.type = params.type;
  }
  if (params.workstream) {
    query.workstream = params.workstream;
  }
  if (params.severity) {
    query.severity = params.severity;
  }
  if (params.environment) {
    query.environment = params.environment;
  }
  if (params.sprintId) {
    query.sprintId = params.sprintId;
  }
  if (params.approvalRequired !== undefined) {
    query.approvalRequired = params.approvalRequired;
  }
  if (params.approvalStatus) {
    query.approvalStatus = params.approvalStatus;
  }
  if (params.approvalType) {
    query.approvalType = params.approvalType;
  }

  return query;
}
