import { baseApi } from "../../services/baseApi";
import {
  normalizeAdminSocialMediaClientsResponse,
  normalizeSocialMediaPostResponse,
  normalizeSocialMediaPostsListResponse,
  normalizeSocialMediaSummaryResponse,
} from "./socialMediaUtils";
import type {
  AdminSocialMediaClientsResponse,
  CreateSocialMediaPostAssetRequest,
  CreateSocialMediaPostRequest,
  MarkSocialMediaPostPublishedRequest,
  ScheduleSocialMediaPostRequest,
  SocialMediaPost,
  SocialMediaPostsListResponse,
  SocialMediaPostsQuery,
  SocialMediaSummary,
  UpdateSocialMediaPostRequest,
} from "./socialMediaTypes";

const SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID = "ADMIN_CLIENTS_LIST";
const SOCIAL_MEDIA_POSTS_LIST_ID = "LIST";

export const socialMediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSocialMediaClients: builder.query<AdminSocialMediaClientsResponse, void>({
      query: () => ({
        url: "/social-media/clients",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminSocialMediaClientsResponse(response),
      providesTags: (result) => [
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        ...(result
          ? result.data.map((item) => ({
              type: "SocialMediaSummary" as const,
              id: item.client.id,
            }))
          : []),
      ],
    }),
    getClientSocialMediaSummary: builder.query<SocialMediaSummary | null, string>({
      query: (clientId) => ({
        url: `/social-media/clients/${clientId}/summary`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaSummaryResponse(response),
      providesTags: (_result, _error, clientId) => [
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    getClientSocialMediaPosts: builder.query<
      SocialMediaPostsListResponse,
      { clientId: string; query?: SocialMediaPostsQuery }
    >({
      query: ({ clientId, query }) => ({
        url: `/social-media/clients/${clientId}/posts`,
        method: "GET",
        params: serializeSocialMediaPostsQuery(query),
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostsListResponse(response),
      providesTags: (result, _error, { clientId }) => {
        const listTag = { type: "SocialMediaPosts" as const, id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` };

        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          ...result.data.map((post) => ({ type: "SocialMediaPosts" as const, id: post.id })),
        ];
      },
    }),
    createClientSocialMediaPost: builder.mutation<
      SocialMediaPost,
      { clientId: string; body: CreateSocialMediaPostRequest }
    >({
      query: ({ clientId, body }) => ({
        url: `/social-media/clients/${clientId}/posts`,
        method: "POST",
        body: serializeSocialMediaPostMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    getSocialMediaPost: builder.query<SocialMediaPost, string>({
      query: (id) => ({
        url: `/social-media/posts/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      providesTags: (_result, _error, id) => [{ type: "SocialMediaPosts", id }],
    }),
    updateSocialMediaPost: builder.mutation<
      SocialMediaPost,
      { id: string; clientId: string; body: UpdateSocialMediaPostRequest }
    >({
      query: ({ id, body }) => ({
        url: `/social-media/posts/${id}`,
        method: "PATCH",
        body: serializeSocialMediaPostMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    scheduleSocialMediaPost: builder.mutation<
      SocialMediaPost,
      { id: string; clientId: string; body: ScheduleSocialMediaPostRequest }
    >({
      query: ({ id, body }) => ({
        url: `/social-media/posts/${id}/schedule`,
        method: "POST",
        body: serializeSocialMediaPostMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    markSocialMediaPostPublished: builder.mutation<
      SocialMediaPost,
      { id: string; clientId: string; body: MarkSocialMediaPostPublishedRequest }
    >({
      query: ({ id, body }) => ({
        url: `/social-media/posts/${id}/mark-published`,
        method: "POST",
        body: serializeSocialMediaPostMutationBody(body),
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    cancelSocialMediaPost: builder.mutation<SocialMediaPost, { id: string; clientId: string }>({
      query: ({ id }) => ({
        url: `/social-media/posts/${id}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    deleteSocialMediaPost: builder.mutation<{ success: boolean }, { id: string; clientId: string }>({
      query: ({ id }) => ({
        url: `/social-media/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    createSocialMediaPostAsset: builder.mutation<
      SocialMediaPost,
      { id: string; clientId: string; body: CreateSocialMediaPostAssetRequest }
    >({
      query: ({ id, body }) => ({
        url: `/social-media/posts/${id}/assets`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
    deleteSocialMediaPostAsset: builder.mutation<
      SocialMediaPost,
      { id: string; assetId: string; clientId: string }
    >({
      query: ({ id, assetId }) => ({
        url: `/social-media/posts/${id}/assets/${assetId}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => normalizeSocialMediaPostResponse(response),
      invalidatesTags: (_result, _error, { id, clientId }) => [
        { type: "SocialMediaPosts", id },
        { type: "SocialMediaPosts", id: `${SOCIAL_MEDIA_POSTS_LIST_ID}:${clientId}` },
        { type: "SocialMediaSummary", id: SOCIAL_MEDIA_ADMIN_CLIENTS_LIST_ID },
        { type: "SocialMediaSummary", id: clientId },
      ],
    }),
  }),
});

export const {
  useGetAdminSocialMediaClientsQuery,
  useGetClientSocialMediaSummaryQuery,
  useGetClientSocialMediaPostsQuery,
  useCreateClientSocialMediaPostMutation,
  useGetSocialMediaPostQuery,
  useUpdateSocialMediaPostMutation,
  useScheduleSocialMediaPostMutation,
  useMarkSocialMediaPostPublishedMutation,
  useCancelSocialMediaPostMutation,
  useDeleteSocialMediaPostMutation,
  useCreateSocialMediaPostAssetMutation,
  useDeleteSocialMediaPostAssetMutation,
} = socialMediaApi;

function serializeSocialMediaPostsQuery(
  query: SocialMediaPostsQuery | undefined,
): Record<string, string | number | boolean> {
  if (!query) {
    return {};
  }

  const params: Record<string, string | number | boolean> = {};

  if (query.platform) {
    params.platform = query.platform;
  }

  if (query.type) {
    params.type = query.type;
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.clientVisible !== undefined) {
    params.clientVisible = query.clientVisible;
  }

  if (query.projectId?.trim()) {
    params.projectId = query.projectId.trim();
  }

  if (query.assignedToUserId?.trim()) {
    params.assignedToUserId = query.assignedToUserId.trim();
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

function serializeSocialMediaPostMutationBody(
  body:
    | CreateSocialMediaPostRequest
    | UpdateSocialMediaPostRequest
    | ScheduleSocialMediaPostRequest
    | MarkSocialMediaPostPublishedRequest,
): Record<string, unknown> {
  const serializedBody: Record<string, unknown> = {};

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (typeof value === "string") {
      serializedBody[key] = value.trim().length > 0 ? value.trim() : null;
      return;
    }

    serializedBody[key] = value;
  });

  return serializedBody;
}
