import { baseApi } from "../../services/baseApi";
import type { ProjectFilesResponse } from "./projectFilesTypes";

export const projectFilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProjectFiles: builder.query<
      ProjectFilesResponse,
      { projectId: string; category?: string }
    >({
      query: ({ projectId, category }) => ({
        url: `/projects/${projectId}/files`,
        method: "GET",
        params: {
          visibility: "CLIENT_VISIBLE",
          limit: 50,
          ...(category ? { category } : {}),
        },
      }),
    }),
  }),
});

export const { useGetClientProjectFilesQuery } = projectFilesApi;
