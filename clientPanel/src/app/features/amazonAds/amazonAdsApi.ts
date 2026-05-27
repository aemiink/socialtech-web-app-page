import { baseApi } from "../../services/baseApi";
import type {
  AmazonAdsConnectionStatus,
  AmazonAdsRegion,
  OwnAmazonAdsConfigResponse,
} from "./amazonAdsTypes";

const amazonAdsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOwnAmazonAdsConfig: build.query<OwnAmazonAdsConfigResponse, void>({
      query: () => ({
        url: "/clients/me/amazon-ads/config",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeOwnAmazonAdsConfigResponse(response),
      providesTags: ["AmazonAdsConfig"],
    }),
  }),
});

export const { useGetOwnAmazonAdsConfigQuery } = amazonAdsApi;

function normalizeOwnAmazonAdsConfigResponse(response: unknown): OwnAmazonAdsConfigResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;

  if (!isRecord(candidate)) {
    return {
      connectionStatus: "NOT_CONNECTED",
      hasConfig: false,
      profileId: null,
      advertiserAccountId: null,
      marketplaceId: null,
      region: null,
      countryCode: null,
      currencyCode: null,
      accountName: null,
      lastSyncAt: null,
    };
  }

  return {
    connectionStatus: normalizeConnectionStatus(candidate.connectionStatus),
    hasConfig: candidate.hasConfig === true,
    profileId: readNullableString(candidate.profileId),
    advertiserAccountId: readNullableString(candidate.advertiserAccountId),
    marketplaceId: readNullableString(candidate.marketplaceId),
    region: normalizeRegion(candidate.region),
    countryCode: readNullableString(candidate.countryCode),
    currencyCode: readNullableString(candidate.currencyCode),
    accountName: readNullableString(candidate.accountName),
    lastSyncAt: readNullableString(candidate.lastSyncAt),
  };
}

function normalizeConnectionStatus(value: unknown): AmazonAdsConnectionStatus {
  if (
    value === "CONNECTED" ||
    value === "PENDING" ||
    value === "ERROR" ||
    value === "DISCONNECTED"
  ) {
    return value;
  }

  return "NOT_CONNECTED";
}

function normalizeRegion(value: unknown): AmazonAdsRegion | null {
  if (value === "NA" || value === "EU" || value === "FE") {
    return value;
  }

  return null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
