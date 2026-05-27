import { baseApi } from "../../services/baseApi";
import type {
  AdminTikTokAdsConnection,
  ConnectManualTikTokAdsPayload,
  TestTikTokAdsConnectionPayload,
  TestTikTokAdsConnectionResponse,
  TikTokAdsConfig,
  UpdateTikTokAdsConfigPayload,
} from "./tiktokAdsTypes";

const tiktokAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminClientTikTokAdsConfig: build.query<TikTokAdsConfig, string>({
      query: (clientId) => `/admin/clients/${clientId}/tiktok-ads/config`,
      providesTags: (_result, _error, clientId) => [
        { type: "TikTokAdsConfig", id: clientId },
      ],
    }),

    getAdminClientTikTokAdsConnection: build.query<AdminTikTokAdsConnection, string>({
      query: (clientId) => `/admin/clients/${clientId}/tiktok-ads/connection`,
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

    connectAdminClientTikTokAdsManual: build.mutation<
      AdminTikTokAdsConnection,
      { clientId: string; data: ConnectManualTikTokAdsPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/connect`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "Clients", id: clientId },
      ],
    }),

    testAdminClientTikTokAdsConnection: build.mutation<
      TestTikTokAdsConnectionResponse,
      { clientId: string; data: TestTikTokAdsConnectionPayload }
    >({
      query: ({ clientId, data }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/test`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "Clients", id: clientId },
      ],
    }),

    disconnectAdminClientTikTokAds: build.mutation<AdminTikTokAdsConnection, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/admin/clients/${clientId}/tiktok-ads/disconnect`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: "TikTokAdsConfig", id: clientId },
        { type: "Clients", id: clientId },
      ],
    }),
  }),
});

export const {
  useConnectAdminClientTikTokAdsManualMutation,
  useDisconnectAdminClientTikTokAdsMutation,
  useGetAdminClientTikTokAdsConfigQuery,
  useGetAdminClientTikTokAdsConnectionQuery,
  useTestAdminClientTikTokAdsConnectionMutation,
  useUpdateAdminClientTikTokAdsConfigMutation,
} = tiktokAdsApi;
