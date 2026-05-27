export type AmazonAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type AmazonAdsRegion = "NA" | "EU" | "FE";
export type AmazonAdsInsightLevel =
  | "ACCOUNT"
  | "PORTFOLIO"
  | "CAMPAIGN"
  | "AD_GROUP"
  | "AD"
  | "KEYWORD"
  | "TARGET"
  | "PRODUCT"
  | "SEARCH_TERM";
export type AmazonAdsProductType =
  | "SPONSORED_PRODUCTS"
  | "SPONSORED_BRANDS"
  | "SPONSORED_DISPLAY";

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

export type AmazonAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type AmazonAdsCampaignsQuery = AmazonAdsDateRangeQuery & {
  limit?: number;
  adProduct?: AmazonAdsProductType;
};

export type AmazonAdsSummaryResponse = {
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  unitsSold: number;
  ctr: number;
  cpc: number;
  acos: number;
  roas: number;
  conversionRate: number;
  dateRange: { since: string; until: string };
  lastSyncAt: string | null;
};

export type AmazonAdsCampaignSummary = {
  id: string;
  name: string;
  adProduct: AmazonAdsProductType | null;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

export type AmazonAdsCampaignsResponse = {
  data: AmazonAdsCampaignSummary[];
  dateRange: { since: string; until: string };
  lastSyncAt: string | null;
};

export type AmazonAdsProductSummary = {
  asin: string | null;
  sku: string | null;
  title: string | null;
  spend: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
};

export type AmazonAdsProductsResponse = {
  data: AmazonAdsProductSummary[];
  dateRange: { since: string; until: string };
  lastSyncAt: string | null;
};

export type AmazonAdsInsightItem = {
  id: string;
  date: string;
  level: AmazonAdsInsightLevel;
  entityId: string;
  entityName: string | null;
  adProduct: AmazonAdsProductType | null;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  unitsSold: number;
  ctr: number;
  cpc: number;
  acos: number;
  roas: number;
  conversionRate: number;
  campaignId: string | null;
  campaignName: string | null;
  adGroupId: string | null;
  adGroupName: string | null;
  keywordId: string | null;
  keywordText: string | null;
  keywordType: string | null;
  matchType: string | null;
  targeting: string | null;
  searchTerm: string | null;
  reportTypeId: string | null;
  updatedAt: string;
};

export type AmazonAdsInsightsResponse = {
  data: AmazonAdsInsightItem[];
  level: AmazonAdsInsightLevel;
  dateRange: { since: string; until: string };
  lastSyncAt: string | null;
};
