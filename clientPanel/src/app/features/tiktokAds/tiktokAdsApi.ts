import { baseApi } from "../../services/baseApi";

export interface ClientTikTokAdsConfigSummary {
  connectionStatus: "NOT_CONNECTED" | "PENDING" | "CONNECTED" | "ERROR" | "DISCONNECTED";
  hasConfig: boolean;
  advertiserId?: string | null;
  lastSyncAt?: string | null;
}

const tiktokAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnTikTokAdsConfig: build.query<ClientTikTokAdsConfigSummary, void>({
      query: () => "/clients/me/tiktok-ads/config",
      providesTags: ["TikTokAdsConfig"],
    }),
  }),
});

export const { useGetOwnTikTokAdsConfigQuery } = tiktokAdsApi;
