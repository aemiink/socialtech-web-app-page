import { baseApi } from "../../services/baseApi";
import type { ClientTask } from "./tasksTypes";
import { normalizeClientTasksResponse } from "./tasksUtils";

export type GetClientTasksQueryParams = {
  projectId?: string;
  type?: string;
  workstream?: string;
  severity?: string;
  environment?: string;
  sprintId?: string;
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientTasks: builder.query<ClientTask[], GetClientTasksQueryParams | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: normalizeClientTasksResponse,
    }),
  }),
});

export const { useGetClientTasksQuery } = tasksApi;
