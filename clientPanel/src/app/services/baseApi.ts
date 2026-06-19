import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { clearAuth, setCredentials, setCurrentUser } from "../features/auth/authSlice";
import { normalizePublicAuthResponse } from "../features/auth/authNormalizers";
import type { PublicAuthResponse } from "../features/auth/authTypes";
import type { RootState } from "../store/store";

const FALLBACK_API_BASE_URL = "http://localhost:4000/api/v1";
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl =
  configuredBaseUrl && configuredBaseUrl.length > 0 ? configuredBaseUrl : FALLBACK_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    headers.set("X-Auth-Scope", "CLIENT");

    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

let refreshRequestPromise: Promise<PublicAuthResponse | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = getRequestUrl(args);

  if (
    result.error?.status === 401 &&
    !isAuthRefreshRequest(requestUrl) &&
    !isAuthLoginRequest(requestUrl) &&
    !isAuthLogoutRequest(requestUrl)
  ) {
    const refreshedAuth = await getOrCreateRefreshRequest(api, extraOptions);
    if (refreshedAuth) {
      api.dispatch(
        setCredentials({
          accessToken: refreshedAuth.accessToken,
          currentUser: refreshedAuth.user,
        }),
      );
      api.dispatch(setCurrentUser(refreshedAuth.user));
      result = await rawBaseQuery(args, api, extraOptions);
      if (result.error?.status === 401) {
        api.dispatch(clearAuth());
      }
    } else {
      api.dispatch(clearAuth());
    }
  } else if (result.error?.status === 401 && isAuthRefreshRequest(requestUrl)) {
    api.dispatch(clearAuth());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "TikTokAdsConfig",
    "AmazonAdsConfig",
    "SocialMediaConfig",
    "SocialMediaSummary",
    "SocialMediaPosts",
    "SocialMediaInsights",
    "SocialMediaReports",
    "GrowthHubConfig",
    "GrowthHubSummary",
    "GrowthHubChannels",
    "GrowthHubActions",
    "GrowthHubWeeklyNotes",
    "GrowthHubReports",
    "GrowthHubRecommendations",
    "GrowthHubActivity",
    "WebMobileDesignConfig",
    "WebMobileDesignSummary",
    "TechnicalSupportConfig",
    "TechnicalSupportSummary",
    "SeoAuditConfig",
    "SeoAuditSummary",
  ],
  endpoints: () => ({}),
});

function getRequestUrl(args: string | FetchArgs): string {
  if (typeof args === "string") {
    return args;
  }

  return args.url;
}

function isAuthRefreshRequest(url: string): boolean {
  return url.includes("/auth/refresh");
}

function isAuthLoginRequest(url: string): boolean {
  return url.includes("/auth/login");
}

function isAuthLogoutRequest(url: string): boolean {
  return url.includes("/auth/logout");
}

async function getOrCreateRefreshRequest(
  api: Parameters<typeof rawBaseQuery>[1],
  extraOptions: Parameters<typeof rawBaseQuery>[2],
): Promise<PublicAuthResponse | null> {
  if (!refreshRequestPromise) {
    refreshRequestPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
      );

      return normalizePublicAuthResponse(refreshResult.data);
    })().finally(() => {
      refreshRequestPromise = null;
    });
  }

  return refreshRequestPromise;
}
