import { baseApi } from "../../services/baseApi";
import type { WebMobileDesignConfig, WebMobileDesignSummary } from "./webMobileDesignTypes";
import {
  normalizeOwnWebMobileDesignConfigResponse,
  normalizeOwnWebMobileDesignSummaryResponse,
} from "./webMobileDesignUtils";

export const webMobileDesignApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnWebMobileDesignConfig: builder.query<WebMobileDesignConfig | null, void>({
      query: () => ({
        url: "/clients/me/web-mobile-design/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnWebMobileDesignConfigResponse(response),
      providesTags: [{ type: "WebMobileDesignConfig", id: "OWN" }],
    }),
    getOwnWebMobileDesignSummary: builder.query<WebMobileDesignSummary | null, void>({
      query: () => ({
        url: "/clients/me/web-mobile-design/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnWebMobileDesignSummaryResponse(response),
      providesTags: [{ type: "WebMobileDesignSummary", id: "OWN" }],
    }),
  }),
});

export const {
  useGetOwnWebMobileDesignConfigQuery,
  useGetOwnWebMobileDesignSummaryQuery,
} = webMobileDesignApi;
