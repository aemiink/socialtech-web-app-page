import { baseApi } from "../../services/baseApi";
import { toBackendServiceKey } from "../clients/clientsUtils";
import type {
  CreateProjectRequest,
  Project,
  ProjectsListQuery,
  ProjectsListResponse,
  UpdateProjectRequest,
} from "./projectsTypes";
import { normalizeProjectResponse, normalizeProjectsListResponse } from "./projectsUtils";

const PROJECTS_LIST_ID = "LIST";
const TASKS_LIST_ID = "LIST";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsListResponse, ProjectsListQuery | void>({
      query: (query) => ({
        url: "/projects",
        method: "GET",
        params: serializeProjectsListQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeProjectsListResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "Projects", id: PROJECTS_LIST_ID }];
        }

        return [
          { type: "Projects", id: PROJECTS_LIST_ID },
          ...result.data.map((project) => ({ type: "Projects" as const, id: project.id })),
        ];
      },
    }),
    getProject: builder.query<Project, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeProjectResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Projects", id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body: serializeProjectMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeProjectResponse(response),
      invalidatesTags: [{ type: "Projects", id: PROJECTS_LIST_ID }],
    }),
    updateProject: builder.mutation<Project, { id: string; body: UpdateProjectRequest }>({
      query: ({ id, body }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        body: serializeProjectMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeProjectResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Projects", id: PROJECTS_LIST_ID },
        { type: "Projects", id },
        { type: "Tasks", id: TASKS_LIST_ID },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useLazyGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} = projectsApi;

function serializeProjectsListQuery(
  query: ProjectsListQuery | void,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.clientProfileId !== undefined && query.clientProfileId.trim().length > 0) {
    params.clientProfileId = query.clientProfileId.trim();
  }

  if (query.status !== undefined) {
    params.status = query.status;
  }

  if (query.priority !== undefined) {
    params.priority = query.priority;
  }

  if (query.q !== undefined && query.q.trim().length > 0) {
    params.q = query.q.trim();
  }

  if (query.dueFrom !== undefined && query.dueFrom.trim().length > 0) {
    params.dueFrom = query.dueFrom.trim();
  }

  if (query.dueTo !== undefined && query.dueTo.trim().length > 0) {
    params.dueTo = query.dueTo.trim();
  }

  return params;
}

function serializeProjectMutationBody(
  body: CreateProjectRequest | UpdateProjectRequest,
): Record<string, unknown> {
  const serializedBody: Record<string, unknown> = { ...body };
  if (body.serviceKey !== undefined) {
    serializedBody.serviceKey = body.serviceKey === null ? null : toBackendServiceKey(body.serviceKey);
  }

  return serializedBody;
}
