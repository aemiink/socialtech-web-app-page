export type TikTokAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export interface TikTokAdsConfig {
  id: string;
  clientProfileId: string;
  advertiserId: string | null;
  businessCenterId: string | null;
  pixelId: string | null;
  advertiserName: string | null;
  currency: string | null;
  timezone: string | null;
  connectionStatus: TikTokAdsConnectionStatus;
  lastSyncAt: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTikTokAdsConnection {
  clientProfileId: string;
  connectionStatus: TikTokAdsConnectionStatus;
  hasActiveService: boolean;
  ids: {
    advertiserId: string | null;
    businessCenterId: string | null;
    pixelId: string | null;
  };
  account: {
    advertiserName: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  credential: {
    hasToken: boolean;
    tokenLastUpdatedAt: string | null;
    tokenExpiresAt: string | null;
    grantedScopes: string[];
  };
}

export interface UpdateTikTokAdsConfigPayload {
  advertiserId?: string;
  businessCenterId?: string;
  pixelId?: string;
  advertiserName?: string;
  currency?: string;
  timezone?: string;
  connectionStatus?: TikTokAdsConnectionStatus;
}

export interface ConnectManualTikTokAdsPayload {
  accessToken: string;
  advertiserId: string;
  businessCenterId?: string;
  pixelId?: string;
  advertiserName?: string;
  currency?: string;
  timezone?: string;
  tokenExpiresAt?: string;
  grantedScopes?: string[];
}

export interface TestTikTokAdsConnectionPayload {
  accessToken?: string;
  advertiserId?: string;
}

export interface TestTikTokAdsConnectionResponse {
  success: true;
  checkedAt: string;
  connection: AdminTikTokAdsConnection;
  account: {
    advertiserId: string;
    advertiserName: string | null;
    currency: string | null;
    timezone: string | null;
  };
  grantedScopes: string[];
}

export function getTikTokAdsConnectionStatusLabel(
  status: TikTokAdsConnectionStatus,
): string {
  const map: Record<TikTokAdsConnectionStatus, string> = {
    NOT_CONNECTED: "Bağlanmadı",
    PENDING: "Bekleniyor",
    CONNECTED: "Bağlı",
    ERROR: "Hata",
    DISCONNECTED: "Bağlantı Kesildi",
  };
  return map[status] ?? status;
}

export function getTikTokAdsConnectionStatusBadgeClass(
  status: TikTokAdsConnectionStatus,
): string {
  const map: Record<TikTokAdsConnectionStatus, string> = {
    NOT_CONNECTED: "bg-gray-500/20 text-gray-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",
    CONNECTED: "bg-green-500/20 text-green-400",
    ERROR: "bg-red-500/20 text-red-400",
    DISCONNECTED: "bg-orange-500/20 text-orange-400",
  };
  return map[status] ?? "bg-gray-500/20 text-gray-400";
}
