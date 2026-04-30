import { baseApi } from "../../services/baseApi";
import type { AuthUserProfile, LoginRequest, PublicAuthResponse } from "./authTypes";
import { parseAuthUserProfile, parsePublicAuthResponse } from "./authNormalizers";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<PublicAuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: parsePublicAuthResponse,
    }),
    refresh: builder.mutation<PublicAuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: parsePublicAuthResponse,
    }),
    logout: builder.mutation<{ success: true }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    me: builder.query<AuthUserProfile, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: parseAuthUserProfile,
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation, useLazyMeQuery } = authApi;
