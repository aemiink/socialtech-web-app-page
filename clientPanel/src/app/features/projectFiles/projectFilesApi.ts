import { baseApi } from "../../services/baseApi";
import type { ProjectFilesResponse } from "./projectFilesTypes";

export const projectFilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProjectFiles: builder.query<ProjectFilesResponse, { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/files`,
        method: "GET",
        params: {
          visibility: "CLIENT_VISIBLE",
          limit: 50,
        },
      }),
    }),
  }),
});

export const { useGetClientProjectFilesQuery } = projectFilesApi;

