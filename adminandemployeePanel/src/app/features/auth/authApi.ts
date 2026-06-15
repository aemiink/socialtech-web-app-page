import { baseApi } from "../../services/baseApi";
import type {
  AuthUserProfile,
  ChangeOwnPasswordRequest,
  LoginRequest,
  PublicAuthResponse,
} from "./authTypes";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<PublicAuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    refresh: builder.mutation<PublicAuthResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
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
    }),
    changeOwnPassword: builder.mutation<{ success: true }, ChangeOwnPasswordRequest>({
      query: (body) => ({
        url: "/users/me/password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useMeQuery,
  useLazyMeQuery,
  useChangeOwnPasswordMutation,
} = authApi;
