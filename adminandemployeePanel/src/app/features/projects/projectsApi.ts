import { baseApi } from "../../services/baseApi";
import { toBackendServiceKey } from "../clients/clientsUtils";
import type {
  CreateProjectRequest,
  ProjectAssigneeCandidate,
  CreateProjectFileShareLinkRequest,
  CompleteProjectFileUploadRequest,
  CreateProjectFileFolderRequest,
  GithubBranch,
  GithubCommit,
  GithubPullRequest,
  GithubWorkflowRun,
  Project,
  ProjectFile,
  ProjectFileFolderAssignee,
  ProjectFileFolder,
  ProjectFileShareLink,
  ProjectFilesListQuery,
  ProjectFilesListResponse,
  ProjectFileUploadSignatureRequest,
  ProjectFileUploadSignatureResponse,
  ProjectRepository,
  ProjectRepositoryConnectRequest,
  WorkspaceMeetingRequest,
  WorkspaceMeetingRequestStatus,
  WorkspaceMessage,
  WorkspaceRevision,
  WorkspaceRevisionStatus,
  WorkspaceSection,
  WorkspaceSnapshotResponse,
  WorkspaceTabKey,
  WorkspaceWeeklyReport,
  ProjectsListQuery,
  ProjectsListResponse,
  UpdateProjectRequest,
  UpdateProjectFileFolderAssigneesRequest,
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
    getProjectAssigneeCandidates: builder.query<ProjectAssigneeCandidate[], string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/assignee-candidates`,
        method: "GET",
      }),
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
    getProjectRepository: builder.query<ProjectRepository, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/repository`,
        method: "GET",
      }),
      providesTags: (_result, _error, projectId) => [{ type: "Projects", id: `REPO:${projectId}` }],
    }),
    upsertProjectRepository: builder.mutation<
      ProjectRepository,
      { projectId: string; body: ProjectRepositoryConnectRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/repository`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: `REPO:${projectId}` },
        { type: "Projects", id: projectId },
      ],
    }),
    deleteProjectRepository: builder.mutation<{ success: boolean }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/repository`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, projectId) => [
        { type: "Projects", id: `REPO:${projectId}` },
        { type: "Projects", id: projectId },
      ],
    }),
    getProjectRepositoryBranches: builder.query<GithubBranch[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/repository/branches`,
        method: "GET",
      }),
    }),
    getProjectRepositoryCommits: builder.query<GithubCommit[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/repository/commits`,
        method: "GET",
      }),
    }),
    getProjectRepositoryPulls: builder.query<GithubPullRequest[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/repository/pulls`,
        method: "GET",
      }),
    }),
    getProjectRepositoryWorkflowRuns: builder.query<GithubWorkflowRun[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/repository/workflows/runs`,
        method: "GET",
      }),
    }),
    getProjectFiles: builder.query<ProjectFilesListResponse, ProjectFilesListQuery>({
      query: ({ projectId, ...query }) => ({
        url: `/projects/${projectId}/files`,
        method: "GET",
        params: query,
      }),
      providesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `LIST:${arg.projectId}` }],
    }),
    getProjectFileFolders: builder.query<ProjectFileFolder[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/files/folders`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `FOLDERS:${arg.projectId}` }],
    }),
    createProjectFileFolder: builder.mutation<ProjectFileFolder, CreateProjectFileFolderRequest>({
      query: ({ projectId, name }) => ({
        url: `/projects/${projectId}/files/folders`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `FOLDERS:${arg.projectId}` }],
    }),
    getProjectFileFolderAssignees: builder.query<
      ProjectFileFolderAssignee[],
      { projectId: string; folderId: string }
    >({
      query: ({ projectId, folderId }) => ({
        url: `/projects/${projectId}/files/folders/${folderId}/assignees`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        { type: "ProjectFiles", id: `FOLDER_ASSIGNEES:${arg.projectId}:${arg.folderId}` },
      ],
    }),
    updateProjectFileFolderAssignees: builder.mutation<
      ProjectFileFolderAssignee[],
      UpdateProjectFileFolderAssigneesRequest
    >({
      query: ({ projectId, folderId, userIds }) => ({
        url: `/projects/${projectId}/files/folders/${folderId}/assignees`,
        method: "PUT",
        body: { userIds },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ProjectFiles", id: `FOLDER_ASSIGNEES:${arg.projectId}:${arg.folderId}` },
      ],
    }),
    getProjectFileById: builder.query<ProjectFile, { projectId: string; fileId: string }>({
      query: ({ projectId, fileId }) => ({
        url: `/projects/${projectId}/files/${fileId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: arg.fileId }],
    }),
    createProjectFileUploadSignature: builder.mutation<
      ProjectFileUploadSignatureResponse,
      ProjectFileUploadSignatureRequest
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/files/upload-signature`,
        method: "POST",
        body,
      }),
    }),
    completeProjectFileUpload: builder.mutation<ProjectFile, CompleteProjectFileUploadRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/files/complete-upload`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `LIST:${arg.projectId}` }],
    }),
    deleteProjectFile: builder.mutation<{ success: boolean }, { projectId: string; fileId: string }>({
      query: ({ projectId, fileId }) => ({
        url: `/projects/${projectId}/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `LIST:${arg.projectId}` }],
    }),
    updateProjectFileFolder: builder.mutation<
      ProjectFile,
      { projectId: string; fileId: string; folderId?: string | null }
    >({
      query: ({ projectId, fileId, folderId }) => ({
        url: `/projects/${projectId}/files/${fileId}/folder`,
        method: "PATCH",
        body: { folderId: folderId ?? null },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ProjectFiles", id: `LIST:${arg.projectId}` },
        { type: "ProjectFiles", id: `FOLDERS:${arg.projectId}` },
      ],
    }),
    createProjectFileShareLink: builder.mutation<
      { id: string; token: string; shareUrl: string; expiresAt: string },
      CreateProjectFileShareLinkRequest
    >({
      query: ({ projectId, fileId, expiresInHours }) => ({
        url: `/projects/${projectId}/files/${fileId}/share-links`,
        method: "POST",
        body: expiresInHours ? { expiresInHours } : {},
      }),
    }),
    revokeProjectFileShareLink: builder.mutation<
      { success: boolean },
      { projectId: string; fileId: string; shareId: string }
    >({
      query: ({ projectId, fileId, shareId }) => ({
        url: `/projects/${projectId}/files/${fileId}/share-links/${shareId}/revoke`,
        method: "PATCH",
      }),
    }),
    getProjectFileShareLinks: builder.query<ProjectFileShareLink[], { projectId: string; fileId?: string }>({
      query: ({ projectId, fileId }) => ({
        url: `/projects/${projectId}/files/share-links`,
        method: "GET",
        params: fileId ? { fileId } : {},
      }),
      providesTags: (_result, _error, arg) => [{ type: "ProjectFiles", id: `SHARES:${arg.projectId}` }],
    }),
    getProjectWorkspaceSnapshot: builder.query<
      WorkspaceSnapshotResponse,
      { projectId: string; tabKey?: WorkspaceTabKey }
    >({
      query: ({ projectId, tabKey }) => ({
        url: `/projects/${projectId}/web-app-workspace`,
        method: "GET",
        params: tabKey ? { tabKey } : {},
      }),
      providesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE:${arg.projectId}` }],
    }),
    createProjectWorkspaceSection: builder.mutation<
      WorkspaceSection,
      { projectId: string; tabKey: WorkspaceTabKey; key: string; title: string; description?: string; sortOrder?: number }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/sections`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE:${arg.projectId}` }],
    }),
    createProjectWorkspaceItem: builder.mutation<
      unknown,
      { projectId: string; sectionId: string; itemType: "TEXT" | "LINK" | "EMBED" | "CHECKLIST" | "METRIC"; title: string; body?: string; href?: string; sortOrder?: number }
    >({
      query: ({ projectId, sectionId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/sections/${sectionId}/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE:${arg.projectId}` }],
    }),
    getProjectWorkspaceRevisions: builder.query<WorkspaceRevision[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE_REVISIONS:${arg.projectId}` }],
    }),
    createProjectWorkspaceRevision: builder.mutation<
      WorkspaceRevision,
      {
        projectId: string;
        title: string;
        description: string;
        taskId?: string;
        releaseId?: string;
        projectFileId?: string;
        assignedToUserId?: string | null;
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Projects", id: `WORKSPACE:${arg.projectId}` },
        { type: "Projects", id: `WORKSPACE_REVISIONS:${arg.projectId}` },
      ],
    }),
    updateProjectWorkspaceRevisionStatus: builder.mutation<
      WorkspaceRevision,
      { projectId: string; revisionId: string; status: WorkspaceRevisionStatus; note?: string; assignedToUserId?: string | null }
    >({
      query: ({ projectId, revisionId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions/${revisionId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Projects", id: `WORKSPACE:${arg.projectId}` },
        { type: "Projects", id: `WORKSPACE_REVISIONS:${arg.projectId}` },
      ],
    }),
    getProjectWorkspaceReports: builder.query<WorkspaceWeeklyReport[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/weekly-reports`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE_REPORTS:${arg.projectId}` }],
    }),
    createProjectWorkspaceReport: builder.mutation<
      WorkspaceWeeklyReport,
      {
        projectId: string;
        weekStartDate: string;
        weekEndDate: string;
        summary: string;
        accomplishments?: string;
        plannedNext?: string;
        blockers?: string;
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/weekly-reports`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Projects", id: `WORKSPACE:${arg.projectId}` },
        { type: "Projects", id: `WORKSPACE_REPORTS:${arg.projectId}` },
      ],
    }),
    getProjectWorkspaceMeetingRequests: builder.query<WorkspaceMeetingRequest[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/meeting-requests`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE_MEETINGS:${arg.projectId}` }],
    }),
    updateProjectWorkspaceMeetingRequest: builder.mutation<
      WorkspaceMeetingRequest,
      {
        projectId: string;
        meetingRequestId: string;
        status?: WorkspaceMeetingRequestStatus;
        responseNote?: string;
        scheduledStartAt?: string | null;
        scheduledEndAt?: string | null;
      }
    >({
      query: ({ projectId, meetingRequestId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/meeting-requests/${meetingRequestId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Projects", id: `WORKSPACE:${arg.projectId}` },
        { type: "Projects", id: `WORKSPACE_MEETINGS:${arg.projectId}` },
      ],
    }),
    getProjectWorkspaceMessages: builder.query<WorkspaceMessage[], { projectId: string; tabKey?: WorkspaceTabKey }>({
      query: ({ projectId, tabKey }) => ({
        url: `/projects/${projectId}/web-app-workspace/messages`,
        method: "GET",
        params: tabKey ? { tabKey } : {},
      }),
      providesTags: (_result, _error, arg) => [{ type: "Projects", id: `WORKSPACE_MESSAGES:${arg.projectId}` }],
    }),
    createProjectWorkspaceMessage: builder.mutation<
      WorkspaceMessage,
      {
        projectId: string;
        tabKey: WorkspaceTabKey;
        body: string;
        isInternal?: boolean;
        parentMessageId?: string;
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Projects", id: `WORKSPACE:${arg.projectId}` },
        { type: "Projects", id: `WORKSPACE_MESSAGES:${arg.projectId}` },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectAssigneeCandidatesQuery,
  useLazyGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectRepositoryQuery,
  useUpsertProjectRepositoryMutation,
  useDeleteProjectRepositoryMutation,
  useGetProjectRepositoryBranchesQuery,
  useGetProjectRepositoryCommitsQuery,
  useGetProjectRepositoryPullsQuery,
  useGetProjectRepositoryWorkflowRunsQuery,
  useGetProjectFilesQuery,
  useGetProjectFileFoldersQuery,
  useCreateProjectFileFolderMutation,
  useGetProjectFileFolderAssigneesQuery,
  useUpdateProjectFileFolderAssigneesMutation,
  useGetProjectFileByIdQuery,
  useCreateProjectFileUploadSignatureMutation,
  useCompleteProjectFileUploadMutation,
  useDeleteProjectFileMutation,
  useUpdateProjectFileFolderMutation,
  useCreateProjectFileShareLinkMutation,
  useRevokeProjectFileShareLinkMutation,
  useGetProjectFileShareLinksQuery,
  useGetProjectWorkspaceSnapshotQuery,
  useCreateProjectWorkspaceSectionMutation,
  useCreateProjectWorkspaceItemMutation,
  useGetProjectWorkspaceRevisionsQuery,
  useCreateProjectWorkspaceRevisionMutation,
  useUpdateProjectWorkspaceRevisionStatusMutation,
  useGetProjectWorkspaceReportsQuery,
  useCreateProjectWorkspaceReportMutation,
  useGetProjectWorkspaceMeetingRequestsQuery,
  useUpdateProjectWorkspaceMeetingRequestMutation,
  useGetProjectWorkspaceMessagesQuery,
  useCreateProjectWorkspaceMessageMutation,
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
