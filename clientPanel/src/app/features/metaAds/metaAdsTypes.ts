export type MetaAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type OwnMetaAdsConfigResponse = {
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: string | null;
};
