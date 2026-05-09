import { baseApi } from "../../services/baseApi";
import type { ProjectFilesResponse } from "./projectFilesTypes";

export const projectFilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProjectFiles: builder.query<
      ProjectFilesResponse,
      {
        projectId: string;
        category?: string;
        approvalRequired?: boolean;
        approvalStatus?: string;
      }
    >({
      query: ({ projectId, category, approvalRequired, approvalStatus }) => ({
        url: `/projects/${projectId}/files`,
        method: "GET",
        params: {
          visibility: "CLIENT_VISIBLE",
          limit: 50,
          ...(category ? { category } : {}),
          ...(approvalRequired !== undefined ? { approvalRequired } : {}),
          ...(approvalStatus ? { approvalStatus } : {}),
        },
      }),
    }),
  }),
});

export const { useGetClientProjectFilesQuery } = projectFilesApi;
