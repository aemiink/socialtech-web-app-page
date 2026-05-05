import { baseApi } from "../../services/baseApi";
import type {
  WorkspaceMeetingRequest,
  WorkspaceMessage,
  WorkspaceRevision,
  WorkspaceTabKey,
  WorkspaceWeeklyReport,
} from "./webAppWorkspaceTypes";

type WorkspaceResponse = {
  sections?: Array<{
    id: string;
    title: string;
    description?: string | null;
    items?: Array<{
      id: string;
      title: string;
      body?: string | null;
    }>;
  }>;
  messages?: WorkspaceMessage[];
  revisions?: WorkspaceRevision[];
  weeklyReports?: WorkspaceWeeklyReport[];
  meetingRequests?: WorkspaceMeetingRequest[];
};

export const webAppWorkspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebAppWorkspace: builder.query<WorkspaceResponse, { projectId: string; tabKey?: WorkspaceTabKey }>({
      query: ({ projectId, tabKey }) => ({
        url: `/projects/${projectId}/web-app-workspace`,
        method: "GET",
        params: tabKey ? { tabKey } : {},
      }),
    }),
    getWebAppWorkspaceMessages: builder.query<
      WorkspaceMessage[],
      { projectId: string; tabKey?: WorkspaceTabKey }
    >({
      query: ({ projectId, tabKey }) => ({
        url: `/projects/${projectId}/web-app-workspace/messages`,
        method: "GET",
        params: tabKey ? { tabKey } : {},
      }),
    }),
    createWebAppWorkspaceMessage: builder.mutation<
      WorkspaceMessage,
      { projectId: string; tabKey: WorkspaceTabKey; body: string; parentMessageId?: string }
    >({
      query: ({ projectId, tabKey, body, parentMessageId }) => ({
        url: `/projects/${projectId}/web-app-workspace/messages`,
        method: "POST",
        body: { tabKey, body, parentMessageId },
      }),
    }),
    getWebAppWorkspaceRevisions: builder.query<WorkspaceRevision[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions`,
        method: "GET",
      }),
    }),
    createWebAppWorkspaceRevision: builder.mutation<
      WorkspaceRevision,
      { projectId: string; title: string; description: string }
    >({
      query: ({ projectId, title, description }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions`,
        method: "POST",
        body: { title, description },
      }),
    }),
    getWebAppWorkspaceReports: builder.query<WorkspaceWeeklyReport[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/weekly-reports`,
        method: "GET",
      }),
    }),
    getWebAppWorkspaceMeetingRequests: builder.query<WorkspaceMeetingRequest[], { projectId: string }>({
      query: ({ projectId }) => ({
        url: `/projects/${projectId}/web-app-workspace/meeting-requests`,
        method: "GET",
      }),
    }),
    createWebAppWorkspaceMeetingRequest: builder.mutation<
      WorkspaceMeetingRequest,
      {
        projectId: string;
        title: string;
        agenda?: string;
        preferredStartAt: string;
        preferredEndAt: string;
        timezone: string;
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/meeting-requests`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetWebAppWorkspaceQuery,
  useGetWebAppWorkspaceMessagesQuery,
  useCreateWebAppWorkspaceMessageMutation,
  useGetWebAppWorkspaceRevisionsQuery,
  useCreateWebAppWorkspaceRevisionMutation,
  useGetWebAppWorkspaceReportsQuery,
  useGetWebAppWorkspaceMeetingRequestsQuery,
  useCreateWebAppWorkspaceMeetingRequestMutation,
} = webAppWorkspaceApi;
