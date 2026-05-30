import { baseApi } from "../../services/baseApi";
import type {
  GrowthHubActionsResponse,
  GrowthHubActivityResponse,
  GrowthHubChannelsResponse,
  GrowthHubConfig,
  GrowthHubSummary,
  GrowthHubWeeklyNotesResponse,
} from "./growthHubTypes";
import {
  normalizeClientGrowthHubActionsResponse,
  normalizeClientGrowthHubActivityResponse,
  normalizeClientGrowthHubChannelsResponse,
  normalizeClientGrowthHubConfigResponse,
  normalizeClientGrowthHubSummaryResponse,
  normalizeClientGrowthHubWeeklyNotesResponse,
} from "./growthHubUtils";

export const growthHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientGrowthHubConfig: builder.query<GrowthHubConfig | null, void>({
      query: () => ({
        url: "/clients/me/growth-hub/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubConfigResponse(response),
      providesTags: [{ type: "GrowthHubConfig", id: "OWN" }],
    }),
    getClientGrowthHubSummary: builder.query<GrowthHubSummary | null, void>({
      query: () => ({
        url: "/clients/me/growth-hub/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubSummaryResponse(response),
      providesTags: [{ type: "GrowthHubSummary", id: "OWN" }],
    }),
    getClientGrowthHubChannels: builder.query<GrowthHubChannelsResponse, void>({
      query: () => ({
        url: "/clients/me/growth-hub/channels",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubChannelsResponse(response),
      providesTags: [{ type: "GrowthHubChannels", id: "OWN" }],
    }),
    getClientGrowthHubActions: builder.query<GrowthHubActionsResponse, void>({
      query: () => ({
        url: "/clients/me/growth-hub/actions",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubActionsResponse(response),
      providesTags: [{ type: "GrowthHubActions", id: "OWN" }],
    }),
    getClientGrowthHubWeeklyNotes: builder.query<GrowthHubWeeklyNotesResponse, void>({
      query: () => ({
        url: "/clients/me/growth-hub/weekly-notes",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubWeeklyNotesResponse(response),
      providesTags: [{ type: "GrowthHubWeeklyNotes", id: "OWN" }],
    }),
    getClientGrowthHubActivity: builder.query<GrowthHubActivityResponse, void>({
      query: () => ({
        url: "/clients/me/growth-hub/activity",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeClientGrowthHubActivityResponse(response),
      providesTags: [{ type: "GrowthHubActivity", id: "OWN" }],
    }),
  }),
});

export const {
  useGetClientGrowthHubConfigQuery,
  useGetClientGrowthHubSummaryQuery,
  useGetClientGrowthHubChannelsQuery,
  useGetClientGrowthHubActionsQuery,
  useGetClientGrowthHubWeeklyNotesQuery,
  useGetClientGrowthHubActivityQuery,
} = growthHubApi;
