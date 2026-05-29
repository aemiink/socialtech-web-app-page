import { baseApi } from "../../services/baseApi";
import type {
  SocialMediaCalendarResponse,
  SocialMediaConfig,
  SocialMediaPost,
  SocialMediaPostsQuery,
  SocialMediaSummary,
} from "./socialMediaTypes";
import {
  normalizeOwnSocialMediaConfigResponse,
  normalizeOwnSocialMediaCalendarResponse,
  normalizeOwnSocialMediaPostsResponse,
  normalizeOwnSocialMediaSummaryResponse,
} from "./socialMediaUtils";

export const socialMediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnSocialMediaConfig: builder.query<SocialMediaConfig | null, void>({
      query: () => ({
        url: "/clients/me/social-media/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnSocialMediaConfigResponse(response),
      providesTags: [{ type: "SocialMediaConfig", id: "OWN" }],
    }),
    getOwnSocialMediaSummary: builder.query<SocialMediaSummary | null, void>({
      query: () => ({
        url: "/clients/me/social-media/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnSocialMediaSummaryResponse(response),
      providesTags: [{ type: "SocialMediaSummary", id: "OWN" }],
    }),
    getOwnSocialMediaPosts: builder.query<SocialMediaPost[], SocialMediaPostsQuery | void>({
      query: (query) => ({
        url: "/clients/me/social-media/posts",
        method: "GET",
        params: serializeSocialMediaPostsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnSocialMediaPostsResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "SocialMediaPosts", id: "LIST" }];
        }

        return [
          { type: "SocialMediaPosts", id: "LIST" },
          ...result.map((post) => ({ type: "SocialMediaPosts" as const, id: post.id })),
        ];
      },
    }),
    getOwnSocialMediaCalendar: builder.query<SocialMediaCalendarResponse, SocialMediaPostsQuery | void>({
      query: (query) => ({
        url: "/clients/me/social-media/calendar",
        method: "GET",
        params: serializeSocialMediaPostsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeOwnSocialMediaCalendarResponse(response),
      providesTags: [{ type: "SocialMediaPosts", id: "CALENDAR" }],
    }),
  }),
});

export const {
  useGetOwnSocialMediaConfigQuery,
  useGetOwnSocialMediaSummaryQuery,
  useGetOwnSocialMediaPostsQuery,
  useGetOwnSocialMediaCalendarQuery,
} = socialMediaApi;

function serializeSocialMediaPostsQuery(
  query: SocialMediaPostsQuery | void,
): Record<string, string | number> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number> = {};

  if (query.platform) {
    params.platform = query.platform;
  }

  if (query.type) {
    params.type = query.type;
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.from?.trim()) {
    params.from = query.from.trim();
  }

  if (query.to?.trim()) {
    params.to = query.to.trim();
  }

  if (query.q?.trim()) {
    params.q = query.q.trim();
  }

  if (query.page !== undefined) {
    params.page = query.page;
  }

  if (query.limit !== undefined) {
    params.limit = query.limit;
  }

  return params;
}
