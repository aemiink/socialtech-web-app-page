import { baseApi } from "../../services/baseApi";
import type {
  GrowthHubActionsResponse,
  GrowthHubActivityResponse,
  GrowthHubChannelsResponse,
  GrowthHubClientsResponse,
  GrowthHubConfig,
  GrowthHubSummary,
} from "./growthHubTypes";
import {
  normalizeGrowthHubActionsResponse,
  normalizeGrowthHubActivityResponse,
  normalizeGrowthHubChannelsResponse,
  normalizeGrowthHubClientsResponse,
  normalizeGrowthHubConfigResponse,
  normalizeGrowthHubSummaryResponse,
} from "./growthHubUtils";

const ADMIN_GROWTH_HUB_LIST_ID = "ADMIN_LIST";
const ASSIGNED_GROWTH_HUB_LIST_ID = "ASSIGNED_LIST";

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
  useGetAdminGrowthHubClientActivityQuery,
  useGetAssignedGrowthHubClientActivityQuery,
} = growthHubApi;
