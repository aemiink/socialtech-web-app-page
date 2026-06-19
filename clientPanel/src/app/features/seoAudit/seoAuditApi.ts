import { baseApi } from "../../services/baseApi";
import type { SeoAuditConfig, SeoAuditSummary } from "./seoAuditTypes";
import {
  normalizeOwnSeoAuditConfigResponse,
  normalizeOwnSeoAuditSummaryResponse,
} from "./seoAuditUtils";

export const seoAuditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnSeoAuditConfig: builder.query<SeoAuditConfig | null, void>({
      query: () => ({
        url: "/clients/me/seo-audit/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnSeoAuditConfigResponse(response),
      providesTags: [{ type: "SeoAuditConfig", id: "OWN" }],
    }),
    getOwnSeoAuditSummary: builder.query<SeoAuditSummary | null, void>({
      query: () => ({
        url: "/clients/me/seo-audit/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeOwnSeoAuditSummaryResponse(response),
      providesTags: [{ type: "SeoAuditSummary", id: "OWN" }],
    }),
  }),
});

export const {
  useGetOwnSeoAuditConfigQuery,
  useGetOwnSeoAuditSummaryQuery,
} = seoAuditApi;
