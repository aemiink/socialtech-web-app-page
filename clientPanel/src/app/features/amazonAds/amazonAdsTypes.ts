export type AmazonAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type AmazonAdsRegion = "NA" | "EU" | "FE";

export type OwnAmazonAdsConfigResponse = {
  connectionStatus: AmazonAdsConnectionStatus;
  hasConfig: boolean;
  profileId: string | null;
  advertiserAccountId: string | null;
  marketplaceId: string | null;
  region: AmazonAdsRegion | null;
  countryCode: string | null;
  currencyCode: string | null;
  accountName: string | null;
  lastSyncAt: string | null;
};
