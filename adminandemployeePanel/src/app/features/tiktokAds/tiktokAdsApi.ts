import { baseApi } from "../../services/baseApi";
import { TikTokAdsConfig, UpdateTikTokAdsConfigPayload } from "./tiktokAdsTypes";

const tiktokAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminClientTikTokAdsConfig: build.query<TikTokAdsConfig, string>({
      query: (clientId) => `/admin/clients/${clientId}/tiktok-ads/config`,
      providesTags: (_result, _error, clientId) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    updateAdminClientTikTokAdsConfig: build.mutation<
      TikTokAdsConfig,
      { clientId: string; data: UpdateTikTokAdsConfigPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/config`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "Clients", id: clientId },
      ],
    }),
  }),
});

export const {
  useGetAdminClientTikTokAdsConfigQuery,
  useUpdateAdminClientTikTokAdsConfigMutation,
} = tiktokAdsApi;
