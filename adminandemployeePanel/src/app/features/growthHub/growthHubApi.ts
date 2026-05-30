import { baseApi } from "../../services/baseApi";
import type {
  GrowthHubActionsResponse,
  GrowthHubActivityResponse,
  GrowthHubActionItem,
  GrowthHubActionMutationRequest,
  GrowthHubChannelsResponse,
  GrowthHubClientsResponse,
  GrowthHubConfig,
  GrowthHubSummary,
  GrowthHubWeeklyNote,
  GrowthHubWeeklyNoteMutationRequest,
  GrowthHubWeeklyNotesResponse,
} from "./growthHubTypes";
import {
  normalizeGrowthHubActionsResponse,
  normalizeGrowthHubActivityResponse,
  normalizeGrowthHubChannelsResponse,
  normalizeGrowthHubClientsResponse,
  normalizeGrowthHubConfigResponse,
  normalizeGrowthHubSummaryResponse,
  normalizeGrowthHubWeeklyNotesResponse,
} from "./growthHubUtils";

const ADMIN_GROWTH_HUB_LIST_ID = "ADMIN_LIST";
const ASSIGNED_GROWTH_HUB_LIST_ID = "ASSIGNED_LIST";

function normalizeGrowthHubActionItemResponse(response: unknown): GrowthHubActionItem {
  const normalized = normalizeGrowthHubActionsResponse([response]);
  if (!normalized.data[0]) {
    throw new Error("Growth Hub action response could not be normalized.");
  }

  return normalized.data[0];
}

function normalizeGrowthHubWeeklyNoteResponse(response: unknown): GrowthHubWeeklyNote {
  const normalized = normalizeGrowthHubWeeklyNotesResponse([response]);
  if (!normalized.data[0]) {
    throw new Error("Growth Hub weekly note response could not be normalized.");
  }

  return normalized.data[0];
}

export const growthHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminGrowthHubClients: builder.query<GrowthHubClientsResponse, void>({
      query: () => ({
        url: "/admin/growth-hub/clients",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubClientsResponse(response),
      providesTags: (result) => [
        { type: "GrowthHubSummary", id: ADMIN_GROWTH_HUB_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "GrowthHubSummary" as const,
              id: item.client.id,
            }))
          : []),
      ],
    }),
    getAssignedGrowthHubClients: builder.query<GrowthHubClientsResponse, void>({
      query: () => ({
        url: "/growth-hub/clients",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubClientsResponse(response),
      providesTags: (result) => [
        { type: "GrowthHubSummary", id: ASSIGNED_GROWTH_HUB_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "GrowthHubSummary" as const,
              id: item.client.id,
            }))
          : []),
      ],
    }),
    getAdminGrowthHubClientConfig: builder.query<GrowthHubConfig | null, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubConfigResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubConfig", id: clientId },
      ],
    }),
    getAssignedGrowthHubClientConfig: builder.query<GrowthHubConfig | null, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/config`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubConfigResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubConfig", id: `assigned:${clientId}` },
      ],
    }),
    getAdminGrowthHubClientSummary: builder.query<GrowthHubSummary | null, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/summary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubSummaryResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubSummary", id: clientId },
      ],
    }),
    getAssignedGrowthHubClientSummary: builder.query<GrowthHubSummary | null, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/summary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubSummaryResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
      ],
    }),
    getAdminGrowthHubClientChannels: builder.query<GrowthHubChannelsResponse, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/channels`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubChannelsResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubChannels", id: clientId },
      ],
    }),
    getAssignedGrowthHubClientChannels: builder.query<GrowthHubChannelsResponse, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/channels`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubChannelsResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubChannels", id: `assigned:${clientId}` },
      ],
    }),
    getAdminGrowthHubClientActions: builder.query<GrowthHubActionsResponse, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/actions`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionsResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubActions", id: clientId },
      ],
    }),
    createAdminGrowthHubAction: builder.mutation<
      GrowthHubActionItem,
      { clientId: string; body: GrowthHubActionMutationRequest & { title: string } }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/growth-hub/actions`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: clientId },
        { type: "GrowthHubSummary", id: clientId },
        { type: "GrowthHubSummary", id: ADMIN_GROWTH_HUB_LIST_ID },
      ],
    }),
    updateAdminGrowthHubAction: builder.mutation<
      GrowthHubActionItem,
      { actionId: string; clientId: string; body: GrowthHubActionMutationRequest }
    >({
      query: ({ actionId, body }) => ({
        url: `/admin/growth-hub/actions/${actionId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: clientId },
        { type: "GrowthHubSummary", id: clientId },
        { type: "GrowthHubSummary", id: ADMIN_GROWTH_HUB_LIST_ID },
      ],
    }),
    deleteAdminGrowthHubAction: builder.mutation<
      { id: string; deleted: true },
      { actionId: string; clientId: string }
    >({
      query: ({ actionId }) => ({
        url: `/admin/growth-hub/actions/${actionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: clientId },
        { type: "GrowthHubSummary", id: clientId },
        { type: "GrowthHubSummary", id: ADMIN_GROWTH_HUB_LIST_ID },
      ],
    }),
    getAssignedGrowthHubClientActions: builder.query<GrowthHubActionsResponse, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/actions`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionsResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubActions", id: `assigned:${clientId}` },
      ],
    }),
    createAssignedGrowthHubAction: builder.mutation<
      GrowthHubActionItem,
      { clientId: string; body: GrowthHubActionMutationRequest & { title: string } }
    >({
      query: ({ clientId, body }) => ({
        url: `/growth-hub/clients/${clientId}/actions`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: ASSIGNED_GROWTH_HUB_LIST_ID },
      ],
    }),
    updateAssignedGrowthHubAction: builder.mutation<
      GrowthHubActionItem,
      { actionId: string; clientId: string; body: GrowthHubActionMutationRequest }
    >({
      query: ({ actionId, body }) => ({
        url: `/growth-hub/actions/${actionId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActionItemResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: ASSIGNED_GROWTH_HUB_LIST_ID },
      ],
    }),
    deleteAssignedGrowthHubAction: builder.mutation<
      { id: string; deleted: true },
      { actionId: string; clientId: string }
    >({
      query: ({ actionId }) => ({
        url: `/growth-hub/actions/${actionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubActions", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: ASSIGNED_GROWTH_HUB_LIST_ID },
      ],
    }),
    getAdminGrowthHubClientWeeklyNotes: builder.query<GrowthHubWeeklyNotesResponse, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/weekly-notes`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNotesResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubWeeklyNotes", id: clientId },
      ],
    }),
    createAdminGrowthHubWeeklyNote: builder.mutation<
      GrowthHubWeeklyNote,
      { clientId: string; body: GrowthHubWeeklyNoteMutationRequest & { weekStart: string; weekEnd: string; summary: string } }
    >({
      query: ({ clientId, body }) => ({
        url: `/admin/clients/${clientId}/growth-hub/weekly-notes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNoteResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubWeeklyNotes", id: clientId },
        { type: "GrowthHubSummary", id: clientId },
      ],
    }),
    updateAdminGrowthHubWeeklyNote: builder.mutation<
      GrowthHubWeeklyNote,
      { noteId: string; clientId: string; body: GrowthHubWeeklyNoteMutationRequest }
    >({
      query: ({ noteId, body }) => ({
        url: `/admin/growth-hub/weekly-notes/${noteId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNoteResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubWeeklyNotes", id: clientId },
        { type: "GrowthHubSummary", id: clientId },
      ],
    }),
    getAssignedGrowthHubClientWeeklyNotes: builder.query<GrowthHubWeeklyNotesResponse, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/weekly-notes`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNotesResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubWeeklyNotes", id: `assigned:${clientId}` },
      ],
    }),
    createAssignedGrowthHubWeeklyNote: builder.mutation<
      GrowthHubWeeklyNote,
      { clientId: string; body: GrowthHubWeeklyNoteMutationRequest & { weekStart: string; weekEnd: string; summary: string } }
    >({
      query: ({ clientId, body }) => ({
        url: `/growth-hub/clients/${clientId}/weekly-notes`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNoteResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubWeeklyNotes", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
      ],
    }),
    updateAssignedGrowthHubWeeklyNote: builder.mutation<
      GrowthHubWeeklyNote,
      { noteId: string; clientId: string; body: GrowthHubWeeklyNoteMutationRequest }
    >({
      query: ({ noteId, body }) => ({
        url: `/growth-hub/weekly-notes/${noteId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubWeeklyNoteResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "GrowthHubWeeklyNotes", id: `assigned:${clientId}` },
        { type: "GrowthHubSummary", id: `assigned:${clientId}` },
      ],
    }),
    getAdminGrowthHubClientActivity: builder.query<GrowthHubActivityResponse, string>({
      query: (clientId) => ({
        url: `/admin/clients/${clientId}/growth-hub/activity`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActivityResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubActivity", id: clientId },
      ],
    }),
    getAssignedGrowthHubClientActivity: builder.query<GrowthHubActivityResponse, string>({
      query: (clientId) => ({
        url: `/growth-hub/clients/${clientId}/activity`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeGrowthHubActivityResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "GrowthHubActivity", id: `assigned:${clientId}` },
      ],
    }),
  }),
});

export const {
  useGetAdminGrowthHubClientsQuery,
  useGetAssignedGrowthHubClientsQuery,
  useGetAdminGrowthHubClientConfigQuery,
  useGetAssignedGrowthHubClientConfigQuery,
  useGetAdminGrowthHubClientSummaryQuery,
  useGetAssignedGrowthHubClientSummaryQuery,
  useGetAdminGrowthHubClientChannelsQuery,
  useGetAssignedGrowthHubClientChannelsQuery,
  useGetAdminGrowthHubClientActionsQuery,
  useGetAssignedGrowthHubClientActionsQuery,
  useCreateAdminGrowthHubActionMutation,
  useUpdateAdminGrowthHubActionMutation,
  useDeleteAdminGrowthHubActionMutation,
  useCreateAssignedGrowthHubActionMutation,
  useUpdateAssignedGrowthHubActionMutation,
  useDeleteAssignedGrowthHubActionMutation,
  useGetAdminGrowthHubClientWeeklyNotesQuery,
  useCreateAdminGrowthHubWeeklyNoteMutation,
  useUpdateAdminGrowthHubWeeklyNoteMutation,
  useGetAssignedGrowthHubClientWeeklyNotesQuery,
  useCreateAssignedGrowthHubWeeklyNoteMutation,
  useUpdateAssignedGrowthHubWeeklyNoteMutation,
  useGetAdminGrowthHubClientActivityQuery,
  useGetAssignedGrowthHubClientActivityQuery,
} = growthHubApi;
