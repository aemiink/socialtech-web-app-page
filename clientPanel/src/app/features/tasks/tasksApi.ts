import { baseApi } from "../../services/baseApi";
import type { ClientTask } from "./tasksTypes";
import { normalizeClientTasksResponse } from "./tasksUtils";

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientTasks: builder.query<ClientTask[], void>({
      query: () => ({
        url: "/tasks",
        method: "GET",
      }),
      transformResponse: normalizeClientTasksResponse,
    }),
  }),
});

export const { useGetClientTasksQuery } = tasksApi;
