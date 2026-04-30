import { baseApi } from "../../services/baseApi";
import type { AdminSummaryResponse } from "./dashboardTypes";
import { normalizeAdminSummaryResponse } from "./dashboardUtils";

const ADMIN_SUMMARY_ID = "SUMMARY";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSummary: builder.query<AdminSummaryResponse, void>({
      query: () => ({
        url: "/admin/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminSummaryResponse(response),
      providesTags: [{ type: "AdminSummary", id: ADMIN_SUMMARY_ID }],
    }),
  }),
});

export const { useGetAdminSummaryQuery } = dashboardApi;
