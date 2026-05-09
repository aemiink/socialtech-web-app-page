import { baseApi } from "../../services/baseApi";
import type { OwnMetaAdsConfigResponse } from "./metaAdsTypes";

export const metaAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnMetaAdsConfig: builder.query<OwnMetaAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/meta-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnMetaAdsConfigResponse(response),
    }),
  }),
});

export const { useGetOwnMetaAdsConfigQuery } = metaAdsApi;

function normalizeOwnMetaAdsConfigResponse(response: unknown): OwnMetaAdsConfigResponse {
  const candidate =
    isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      connectionStatus: "NOT_CONNECTED",
      lastSyncAt: null,
    };
  }

  return {
    connectionStatus: normalizeConnectionStatus(candidate.connectionStatus),
    lastSyncAt: typeof candidate.lastSyncAt === "string" ? candidate.lastSyncAt : null,
  };
}

function normalizeConnectionStatus(value: unknown): OwnMetaAdsConfigResponse["connectionStatus"] {
  if (value === "CONNECTED") {
    return "CONNECTED";
  }

  if (value === "PENDING") {
    return "PENDING";
  }

  if (value === "ERROR") {
    return "ERROR";
  }

  if (value === "DISCONNECTED") {
    return "DISCONNECTED";
  }

  return "NOT_CONNECTED";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
