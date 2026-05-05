import { baseApi } from "../../services/baseApi";

export type ClientProject = {
  id: string;
  name: string;
  serviceKey?: string | null;
};

type ProjectsResponse = {
  data?: ClientProject[];
};

export const clientProjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientProjects: builder.query<ClientProject[], void>({
      query: () => ({
        url: "/projects",
        method: "GET",
      }),
      transformResponse: (response: ProjectsResponse | ClientProject[] | unknown) => {
        if (Array.isArray(response)) {
          return response as ClientProject[];
        }
        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray((response as ProjectsResponse).data)
        ) {
          return (response as ProjectsResponse).data ?? [];
        }
        return [];
      },
    }),
  }),
});

export const { useGetClientProjectsQuery } = clientProjectsApi;
