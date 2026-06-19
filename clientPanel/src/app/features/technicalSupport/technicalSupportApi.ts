import { baseApi } from "../../services/baseApi";
import type { TechnicalSupportConfig, TechnicalSupportSummary } from "./technicalSupportTypes";
import {
  normalizeOwnTechnicalSupportConfigResponse,
  normalizeOwnTechnicalSupportSummaryResponse,
} from "./technicalSupportUtils";

export const technicalSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnTechnicalSupportConfig: builder.query<TechnicalSupportConfig | null, void>({
      query: () => ({
        url: "/clients/me/technical-support/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnTechnicalSupportConfigResponse(response),
      providesTags: [{ type: "TechnicalSupportConfig", id: "OWN" }],
    }),
    getOwnTechnicalSupportSummary: builder.query<TechnicalSupportSummary | null, void>({
      query: () => ({
        url: "/clients/me/technical-support/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnTechnicalSupportSummaryResponse(response),
      providesTags: [{ type: "TechnicalSupportSummary", id: "OWN" }],
    }),
  }),
});

export const {
  useGetOwnTechnicalSupportConfigQuery,
  useGetOwnTechnicalSupportSummaryQuery,
} = technicalSupportApi;
