import { baseApi } from "../../services/baseApi";
import type {
  WebAppWorkspaceResponse,
  WorkspaceMeetingRequest,
  WorkspaceMessage,
  WorkspaceRevision,
  WorkspaceRevisionStatus,
  WorkspaceTabKey,
  WorkspaceWeeklyReport,
} from "./webAppWorkspaceTypes";

export const webAppWorkspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebAppWorkspace: builder.query<WebAppWorkspaceResponse, { projectId: string; tabKey?: WorkspaceTabKey }>({
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
      {
        projectId: string;
        title: string;
        description: string;
        cacheTabKey?: WorkspaceTabKey;
      }
    >({
      query: ({ projectId, title, description }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions`,
        method: "POST",
        body: { title, description },
      }),
      async onQueryStarted({ projectId, cacheTabKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchWorkspaceRevisionCaches(dispatch, {
            projectId,
            cacheTabKey,
            revision: data,
          });
        } catch {
          // Mutation errors are surfaced to the caller.
        }
      },
    }),
    updateWebAppWorkspaceRevisionStatus: builder.mutation<
      WorkspaceRevision,
      {
        projectId: string;
        revisionId: string;
        status: WorkspaceRevisionStatus;
        note?: string;
        cacheTabKey?: WorkspaceTabKey;
      }
    >({
      query: ({ projectId, revisionId, cacheTabKey: _cacheTabKey, ...body }) => ({
        url: `/projects/${projectId}/web-app-workspace/revisions/${revisionId}/status`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ projectId, cacheTabKey }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchWorkspaceRevisionCaches(dispatch, {
            projectId,
            cacheTabKey,
            revision: data,
          });
        } catch {
          // Mutation errors are surfaced to the caller.
        }
      },
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
  useUpdateWebAppWorkspaceRevisionStatusMutation,
  useGetWebAppWorkspaceReportsQuery,
  useGetWebAppWorkspaceMeetingRequestsQuery,
  useCreateWebAppWorkspaceMeetingRequestMutation,
} = webAppWorkspaceApi;

function patchWorkspaceRevisionCaches(
  dispatch: (action: unknown) => void,
  {
    projectId,
    cacheTabKey,
    revision,
  }: {
    projectId: string;
    cacheTabKey?: WorkspaceTabKey;
    revision: WorkspaceRevision;
  },
) {
  for (const tabKey of getWorkspaceRevisionCacheKeys(cacheTabKey)) {
    dispatch(
      webAppWorkspaceApi.util.updateQueryData(
        "getWebAppWorkspace",
        { projectId, tabKey },
        (draft) => {
          const revisions = draft.revisions ?? [];
          const existingIndex = revisions.findIndex((item) => item.id === revision.id);

          if (existingIndex >= 0) {
            revisions[existingIndex] = revision;
          } else {
            revisions.unshift(revision);
          }

          draft.revisions = revisions;
        },
      ),
    );
  }

  dispatch(
    webAppWorkspaceApi.util.updateQueryData(
      "getWebAppWorkspaceRevisions",
      { projectId },
      (draft) => {
        const existingIndex = draft.findIndex((item) => item.id === revision.id);
        if (existingIndex >= 0) {
          draft[existingIndex] = revision;
        } else {
          draft.unshift(revision);
        }
      },
    ),
  );
}

function getWorkspaceRevisionCacheKeys(cacheTabKey?: WorkspaceTabKey): WorkspaceTabKey[] {
  return Array.from(new Set([cacheTabKey, "REVISIONS", "OVERVIEW"].filter(isWorkspaceTabKey)));
}

function isWorkspaceTabKey(value: string | undefined): value is WorkspaceTabKey {
  return value !== undefined;
}
