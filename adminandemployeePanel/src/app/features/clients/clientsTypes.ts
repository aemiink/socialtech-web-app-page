export type ClientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type ServiceKey =
  | "growth-hub"
  | "social-media"
  | "media-hub"
  | "medya-hub"
  | "meta-ads"
  | "tiktok-ads"
  | "google-ads"
  | "amazon-ads"
  | "web-app"
  | "mobile-app"
  | "landing-page"
  | "landing-pages"
  | "web-mobile-design"
  | "technical-support"
  | "seo-audit";
export type PurchasedServiceStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "SUSPENDED";
export type ClientSocialMediaPlatform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "LINKEDIN"
  | "X"
  | "PINTEREST";

export type BackendPurchasedServiceKey =
  | "GROWTH_HUB"
  | "SOCIAL_MEDIA"
  | "MEDIA_HUB"
  | "MEDYA_HUB"
  | "META_ADS"
  | "TIKTOK_ADS"
  | "GOOGLE_ADS"
  | "AMAZON_ADS"
  | "WEB_APP"
  | "MOBILE_APP"
  | "LANDING_PAGE"
  | "LANDING_PAGES"
  | "WEB_MOBILE_DESIGN"
  | "TECHNICAL_SUPPORT"
  | "SEO_AUDIT";

export type BackendPurchasedServiceStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "CANCELED";

export type ClientPurchasedService = {
  serviceKey: ServiceKey;
  status: PurchasedServiceStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ClientProfile = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  purchasedServices?: ClientPurchasedService[];
};

export type ClientsSortBy = "createdAt" | "updatedAt" | "name" | "slug" | "status";
export type ClientsSortOrder = "asc" | "desc";

export type ClientsListQuery = {
  page?: number;
  limit?: number;
  sortBy?: ClientsSortBy;
  sortOrder?: ClientsSortOrder;
  status?: ClientStatus;
  search?: string;
};

export type ClientsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ClientsListResponse = {
  data: ClientProfile[];
  meta: ClientsListMeta;
};

export type CreateAdminClientRequest = {
  name: string;
  slug?: string;
  status?: ClientStatus;
  purchasedServices: ServiceKey[];
};

export type UpdateAdminClientRequest = {
  name?: string;
  slug?: string;
  status?: ClientStatus;
  purchasedServices?: ServiceKey[];
};

export type CreateClientOwnerRequest = {
  mode: "CREATE";
  email: string;
  displayName: string;
  password: string;
};

export type LinkExistingClientOwnerRequest = {
  mode: "LINK_EXISTING";
  userId: string;
};

export type CreateOrLinkClientOwnerRequest =
  | CreateClientOwnerRequest
  | LinkExistingClientOwnerRequest;

export type ResetClientOwnerPasswordRequest = {
  newPassword: string;
};

export type ClientSummaryProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD";

export type ClientSummaryTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED";

export type ClientSummaryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ClientSummaryRecentProject = {
  id: string;
  name: string;
  status: ClientSummaryProjectStatus;
  priority: ClientSummaryPriority;
  dueDate: string | null;
  updatedAt: string;
};

export type ClientSummaryRecentTask = {
  id: string;
  title: string;
  status: ClientSummaryTaskStatus;
  priority: ClientSummaryPriority;
  dueDate: string | null;
  updatedAt: string;
  projectId: string;
};

export type ClientSummaryResponse = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientStatus;
    createdAt: string;
    updatedAt: string;
    purchasedServices: ClientPurchasedService[];
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
    recent: ClientSummaryRecentProject[];
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
    recent: ClientSummaryRecentTask[];
  };
  meta: {
    generatedAt: string;
  };
};

export type MetaAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type AmazonAdsConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type SocialMediaConnectionStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "DISCONNECTED";

export type SocialMediaGoal =
  | "BRAND_AWARENESS"
  | "COMMUNITY_GROWTH"
  | "ENGAGEMENT"
  | "LEAD_GENERATION"
  | "SALES_SUPPORT"
  | "REPUTATION"
  | "MIXED";

export type GrowthHubGoal =
  | "LEAD_GENERATION"
  | "ECOMMERCE_SALES"
  | "BRAND_AWARENESS"
  | "APP_GROWTH"
  | "RETENTION"
  | "MIXED";

export type GrowthHubStatus = "ACTIVE" | "PAUSED" | "ON_HOLD";

export type AmazonAdsRegion = "NA" | "EU" | "FE";
export type AmazonAdsProductType =
  | "SPONSORED_PRODUCTS"
  | "SPONSORED_BRANDS"
  | "SPONSORED_DISPLAY";
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

export type AmazonAdsSyncStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "SKIPPED";

export type MetaAdsSyncStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "SKIPPED";

export type AdminClientMetaAdsConnection = {
  clientProfileId: string;
  connectionStatus: MetaAdsConnectionStatus;
  hasActiveService: boolean;
  ids: {
    businessId: string | null;
    adAccountId: string | null;
    pixelId: string | null;
    instagramAccountId: string | null;
    facebookPageId: string | null;
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
};

export type ConnectManualMetaAdsRequest = {
  accessToken: string;
  businessId?: string;
  adAccountId?: string;
  pixelId?: string;
  instagramAccountId?: string;
  facebookPageId?: string;
  currency?: string;
  timezone?: string;
  tokenExpiresAt?: string;
  grantedScopes?: string[];
};

export type AdminClientAmazonAdsConnection = {
  clientProfileId: string;
  connectionStatus: AmazonAdsConnectionStatus;
  hasActiveService: boolean;
  ids: {
    profileId: string | null;
    advertiserAccountId: string | null;
    marketplaceId: string | null;
  };
  account: {
    accountType: string | null;
    accountName: string | null;
    validPaymentMethod: boolean | null;
  };
  settings: {
    region: AmazonAdsRegion | null;
    countryCode: string | null;
    currencyCode: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  credential: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenLastUpdatedAt: string | null;
    accessTokenExpiresAt: string | null;
    refreshTokenExpiresAt: string | null;
    grantedScopes: string[];
  };
};

export type UpdateAdminClientAmazonAdsConfigRequest = {
  profileId?: string | null;
  advertiserAccountId?: string | null;
  marketplaceId?: string | null;
  region?: AmazonAdsRegion | null;
  countryCode?: string | null;
  currencyCode?: string | null;
  timezone?: string | null;
  accountType?: string | null;
  accountName?: string | null;
  validPaymentMethod?: boolean | null;
  connectionStatus?: AmazonAdsConnectionStatus;
};

export type AdminClientSocialMediaConfig = {
  clientProfileId: string;
  hasActiveService: boolean;
  activePlatforms: ClientSocialMediaPlatform[];
  instagramUsername: string | null;
  instagramAccountId: string | null;
  facebookPageId: string | null;
  tiktokUsername: string | null;
  linkedinPageUrl: string | null;
  contentFrequency: string | null;
  primaryGoal: SocialMediaGoal | null;
  toneOfVoice: string | null;
  hashtags: string[];
  connectionStatus: SocialMediaConnectionStatus;
  lastSyncAt: string | null;
  syncError: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpdateAdminClientSocialMediaConfigRequest = {
  activePlatforms?: ClientSocialMediaPlatform[];
  instagramUsername?: string | null;
  instagramAccountId?: string | null;
  facebookPageId?: string | null;
  tiktokUsername?: string | null;
  linkedinPageUrl?: string | null;
  contentFrequency?: string | null;
  primaryGoal?: SocialMediaGoal | null;
  toneOfVoice?: string | null;
  hashtags?: string[];
  connectionStatus?: SocialMediaConnectionStatus;
  lastSyncAt?: string | null;
  syncError?: string | null;
  notes?: string | null;
};

export type AdminClientGrowthHubConfig = {
  id: string;
  clientProfileId: string;
  hasActiveService: boolean;
  primaryGoal: GrowthHubGoal | null;
  targetLeads: number | null;
  targetRoas: number | null;
  targetCpa: number | null;
  targetRevenue: number | null;
  reportingDay: string | null;
  notes: string | null;
  status: GrowthHubStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UpdateAdminClientGrowthHubConfigRequest = {
  primaryGoal?: GrowthHubGoal | null;
  targetLeads?: number | null;
  targetRoas?: number | null;
  targetCpa?: number | null;
  targetRevenue?: number | null;
  reportingDay?: string | null;
  notes?: string | null;
  status?: GrowthHubStatus;
};

export type DesignSystemStatus = "NONE" | "IN_PROGRESS" | "COMPLETED";

export type AdminClientWebMobileDesignConfig = {
  id: string;
  clientProfileId: string;
  figmaFileUrl: string | null;
  prototypeUrl: string | null;
  styleGuideUrl: string | null;
  designSystemStatus: DesignSystemStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontFamily: string | null;
  targetPlatforms: string[];
  gridSystem: string | null;
  notes: string | null;
  updatedAt: string | null;
};

export type UpdateAdminClientWebMobileDesignConfigRequest = {
  figmaFileUrl?: string | null;
  prototypeUrl?: string | null;
  styleGuideUrl?: string | null;
  designSystemStatus?: DesignSystemStatus;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  fontFamily?: string | null;
  targetPlatforms?: string[];
  gridSystem?: string | null;
  notes?: string | null;
};

export type AdminWebMobileDesignSummary = {
  hasActiveService: boolean;
  config: AdminClientWebMobileDesignConfig | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    figmaProjectUrl: string | null;
    startDate: string | null;
    dueDate: string | null;
    taskCount: number;
    fileCount: number;
  }>;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  approvalStats: {
    total: number;
    pending: number;
    approved: number;
  };
  revisionCount: number;
  progressPercent: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    approvalStatus: string | null;
    approvalRequired: boolean;
    dueDate: string | null;
  }>;
  recentFiles: Array<{
    id: string;
    title: string;
    originalFileName: string;
    secureUrl: string;
    visibility: string;
    mimeType: string;
    approvalStatus: string | null;
    createdAt: string;
  }>;
  meta: { generatedAt: string };
};

export type ConnectManualAmazonAdsRequest = {
  refreshToken: string;
  accessToken?: string;
  profileId?: string;
  advertiserAccountId?: string;
  marketplaceId?: string;
  region?: AmazonAdsRegion;
  countryCode?: string;
  currencyCode?: string;
  timezone?: string;
  accountType?: string;
  accountName?: string;
  validPaymentMethod?: boolean;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  grantedScopes?: string[];
};

export type TestAmazonAdsConnectionRequest = {
  refreshToken?: string;
  profileId?: string;
  region?: AmazonAdsRegion;
};

export type AmazonAdsProfileSummary = {
  profileId: string;
  advertiserAccountId: string | null;
  marketplaceId: string | null;
  region: AmazonAdsRegion;
  countryCode: string | null;
  currencyCode: string | null;
  timezone: string | null;
  accountType: string | null;
  accountName: string | null;
  validPaymentMethod: boolean | null;
};

export type TestAmazonAdsConnectionResponse = {
  success: true;
  checkedAt: string;
  connection: AdminClientAmazonAdsConnection;
  profile: AmazonAdsProfileSummary;
  profiles: AmazonAdsProfileSummary[];
  grantedScopes: string[];
};

export type AmazonAdsOAuthStartResponse = {
  authorizationUrl: string;
  state: string;
  redirectUri: string;
  scopes: string[];
};

export type SocialMediaMetaOAuthStartResponse = {
  authorizationUrl: string;
  state: string;
  redirectUri: string;
  scopes: string[];
  generatedAt: string | null;
};

export type ExchangeAmazonAdsOAuthCodeRequest = {
  code: string;
  profileId?: string;
  region?: AmazonAdsRegion;
};

export type AmazonAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type AmazonAdsCampaignsQuery = AmazonAdsDateRangeQuery & {
  limit?: number;
  adProduct?: AmazonAdsProductType;
};

export type AmazonAdsProductsQuery = AmazonAdsDateRangeQuery & {
  limit?: number;
};

export type AmazonAdsInsightsQuery = AmazonAdsDateRangeQuery & {
  level?: AmazonAdsInsightLevel;
  limit?: number;
};

export type AssignedClientAmazonAdsConfig = {
  clientProfileId: string;
  connectionStatus: AmazonAdsConnectionStatus;
  ids: {
    profileId: string | null;
    advertiserAccountId: string | null;
    marketplaceId: string | null;
  };
  account: {
    accountType: string | null;
    accountName: string | null;
    validPaymentMethod: boolean | null;
  };
  settings: {
    region: AmazonAdsRegion | null;
    countryCode: string | null;
    currencyCode: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
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
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type AmazonAdsSyncResponse = {
  success: true;
  syncedAt: string;
  dateRange: {
    since: string;
    until: string;
  };
  inserted: {
    account: number;
    campaigns: number;
    products: number;
    searchTerms: number;
    total: number;
  };
  connectionStatus: AmazonAdsConnectionStatus;
  lastSyncAt: string | null;
  syncStatus: AmazonAdsSyncStatus;
  skippedReason: string | null;
};

export type AdminAmazonAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: ClientStatus;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: AmazonAdsConnectionStatus;
  hasRefreshToken: boolean;
  ids: {
    profileId: string | null;
    advertiserAccountId: string | null;
    marketplaceId: string | null;
  };
  account: {
    accountType: string | null;
    accountName: string | null;
    validPaymentMethod: boolean | null;
  };
  settings: {
    region: AmazonAdsRegion | null;
    countryCode: string | null;
    currencyCode: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  spendSummary: {
    spend: number;
    sales: number;
    impressions: number;
    clicks: number;
    orders: number;
    acos: number;
    roas: number;
  };
  pendingApprovals: number;
  assignedEmployees: Array<{
    userId: string;
    email: string;
    displayName: string | null;
    role: string;
    scope: string;
  }>;
  actionContext: {
    amazonAdsProjectId: string | null;
  };
};

export type AdminAmazonAdsClientListResponse = {
  data: AdminAmazonAdsClientListItem[];
  dateRange: {
    since: string;
    until: string;
  };
  meta: {
    total: number;
    connected: number;
    error: number;
    pendingApprovals: number;
  };
};

export type AdminAmazonAdsSyncLogItem = {
  id: string;
  clientProfileId: string;
  clientCompanyName: string;
  profileId: string | null;
  status: AmazonAdsSyncStatus;
  trigger: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  recordsFetched: number | null;
  apiCallCount: number | null;
  reportStatus: string | null;
  createdAt: string;
};

export type AdminAmazonAdsSyncLogsResponse = {
  data: AdminAmazonAdsSyncLogItem[];
  meta: {
    total: number;
    failed: number;
    running: number;
    skipped: number;
  };
};

export type AdminAmazonAdsSyncLogsQuery = {
  clientProfileId?: string;
  status?: AmazonAdsSyncStatus;
  failedOnly?: boolean;
  limit?: number;
};

export type AmazonAdsReportType =
  | "WEEKLY"
  | "MONTHLY"
  | "SPONSORED_PRODUCTS_PERFORMANCE"
  | "SPONSORED_BRANDS_PERFORMANCE"
  | "SPONSORED_DISPLAY_PERFORMANCE"
  | "PRODUCT_PERFORMANCE"
  | "SEARCH_TERMS"
  | "BUDGET_RECOMMENDATION"
  | "ACOS_OPTIMIZATION";

export type AmazonAdsReportStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AmazonAdsReportExportFormat = "json" | "csv";

export type AmazonAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type AmazonAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: AmazonAdsReportType;
  status: AmazonAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Record<string, unknown> | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: AmazonAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AmazonAdsReportsResponse = {
  data: AmazonAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

export type AmazonAdsReportsQuery = {
  status?: AmazonAdsReportStatus;
  type?: AmazonAdsReportType;
  clientVisible?: boolean;
  limit?: number;
};

export type CreateAmazonAdsReportRequest = {
  projectId?: string;
  periodStart: string;
  periodEnd: string;
  type: AmazonAdsReportType;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};

export type UpdateAmazonAdsReportRequest = {
  status?: AmazonAdsReportStatus;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};

export type TestMetaAdsConnectionRequest = {
  accessToken?: string;
  adAccountId?: string;
  requiredScopes?: string[];
};

export type TestMetaAdsConnectionResponse = {
  success: true;
  checkedAt: string;
  connection: AdminClientMetaAdsConnection;
  account: {
    adAccountId: string;
    currency: string | null;
    timezone: string | null;
  };
  grantedScopes: string[];
};

export type MetaAdsSummaryResponse = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  results: number;
  costPerResult: number;
  roas: number | null;
  dateRange: {
    since: string;
    until: string;
  };
  lastSyncAt: string | null;
};

export type MetaAdsDateRangeQuery = {
  since?: string;
  until?: string;
};

export type UpdateAdminClientMetaAdsConfigRequest = {
  businessId?: string | null;
  adAccountId?: string | null;
  pixelId?: string | null;
  instagramAccountId?: string | null;
  facebookPageId?: string | null;
  currency?: string | null;
  timezone?: string | null;
  connectionStatus?: MetaAdsConnectionStatus;
  lastSyncAt?: string | null;
  syncError?: string | null;
};

export type MetaAdsSyncResponse = {
  success: true;
  syncedAt: string;
  dateRange: {
    since: string;
    until: string;
  };
  inserted: {
    account: number;
    campaigns: number;
    total: number;
  };
  connectionStatus: MetaAdsConnectionStatus;
  lastSyncAt: string | null;
  syncStatus: MetaAdsSyncStatus;
  skippedReason: string | null;
};

export type AdminMetaAdsClientListItem = {
  client: {
    id: string;
    slug: string;
    companyName: string;
    status: ClientStatus;
  };
  serviceStatus: PurchasedServiceStatus;
  connectionStatus: MetaAdsConnectionStatus;
  hasToken: boolean;
  ids: {
    businessId: string | null;
    adAccountId: string | null;
    pixelId: string | null;
    instagramAccountId: string | null;
    facebookPageId: string | null;
  };
  settings: {
    currency: string | null;
    timezone: string | null;
  };
  lastSyncAt: string | null;
  syncError: string | null;
  spendSummary: {
    spend: number;
    impressions: number;
    clicks: number;
    results: number;
    roas: number | null;
  };
  pendingApprovals: number;
  assignedEmployees: Array<{
    userId: string;
    email: string;
    displayName: string | null;
    role: string;
    scope: string;
  }>;
  actionContext: {
    metaAdsProjectId: string | null;
  };
};

export type AdminMetaAdsClientListResponse = {
  data: AdminMetaAdsClientListItem[];
  dateRange: {
    since: string;
    until: string;
  };
  meta: {
    total: number;
    connected: number;
    error: number;
    pendingApprovals: number;
  };
};

export type AdminMetaAdsSyncLogItem = {
  id: string;
  clientProfileId: string;
  clientCompanyName: string;
  adAccountId: string | null;
  status: MetaAdsSyncStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  recordsFetched: number | null;
  apiCallCount: number | null;
  createdAt: string;
};

export type AdminMetaAdsSyncLogsResponse = {
  data: AdminMetaAdsSyncLogItem[];
  meta: {
    total: number;
    failed: number;
    running: number;
    skipped: number;
  };
};

export type AdminMetaAdsSyncLogsQuery = {
  clientProfileId?: string;
  status?: MetaAdsSyncStatus;
  failedOnly?: boolean;
  limit?: number;
};

export type MetaAdsReportType =
  | "WEEKLY"
  | "MONTHLY"
  | "CAMPAIGN_PERFORMANCE"
  | "CREATIVE_PERFORMANCE"
  | "BUDGET_RECOMMENDATION";

export type MetaAdsReportStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type MetaAdsReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type MetaAdsReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  projectName: string | null;
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  status: MetaAdsReportStatus;
  summary: string | null;
  metricsSnapshot: Record<string, unknown> | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: MetaAdsReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsReportsResponse = {
  data: MetaAdsReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
  };
};

export type MetaAdsReportsQuery = {
  status?: MetaAdsReportStatus;
  type?: MetaAdsReportType;
  clientVisible?: boolean;
  limit?: number;
};

export type CreateMetaAdsReportRequest = {
  projectId?: string;
  periodStart: string;
  periodEnd: string;
  type: MetaAdsReportType;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};

export type UpdateMetaAdsReportRequest = {
  status?: MetaAdsReportStatus;
  summary?: string;
  metricsSnapshot?: Record<string, unknown>;
  clientVisible?: boolean;
  requestAcknowledgement?: boolean;
};

// Technical Support types

export type AdminClientTechnicalSupportConfig = {
  id: string;
  clientProfileId: string;
  slaLevel: string | null;
  supportPortalUrl: string | null;
  maintenanceWindowDay: string | null;
  maintenanceWindowTime: string | null;
  monitoringEnabled: boolean;
  backupFrequency: string | null;
  uptimeTarget: number | null;
  notes: string | null;
  updatedAt: string | null;
};

export type AdminTechnicalSupportSummary = {
  hasActiveService: boolean;
  config: AdminClientTechnicalSupportConfig | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    taskCount: number;
    fileCount: number;
    startDate: string | null;
    dueDate: string | null;
  }>;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  openTicketCount: number;
  resolvedTicketCount: number;
  progressPercent: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    approvalStatus: string | null;
    approvalRequired: boolean;
    dueDate: string | null;
  }>;
  recentFiles: Array<{
    id: string;
    title: string;
    originalFileName: string;
    secureUrl: string;
    visibility: string;
    mimeType: string;
    approvalStatus: string | null;
    createdAt: string;
  }>;
  meta: { generatedAt: string };
};

export type UpdateAdminClientTechnicalSupportConfigRequest = {
  slaLevel?: string | null;
  supportPortalUrl?: string | null;
  maintenanceWindowDay?: string | null;
  maintenanceWindowTime?: string | null;
  monitoringEnabled?: boolean;
  backupFrequency?: string | null;
  uptimeTarget?: number | null;
  notes?: string | null;
};

// SEO Audit types

export type AdminClientSeoAuditConfig = {
  id: string;
  clientProfileId: string;
  siteUrl: string | null;
  gaPropertyId: string | null;
  searchConsolePropertyUrl: string | null;
  targetKeywords: string[];
  auditFrequency: string | null;
  lastAuditScore: number | null;
  notes: string | null;
  updatedAt: string | null;
};

export type AdminSeoAuditSummary = {
  hasActiveService: boolean;
  config: AdminClientSeoAuditConfig | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    taskCount: number;
    fileCount: number;
    startDate: string | null;
    dueDate: string | null;
  }>;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  progressPercent: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    approvalStatus: string | null;
    approvalRequired: boolean;
    dueDate: string | null;
  }>;
  recentFiles: Array<{
    id: string;
    title: string;
    originalFileName: string;
    secureUrl: string;
    visibility: string;
    mimeType: string;
    approvalStatus: string | null;
    createdAt: string;
  }>;
  meta: { generatedAt: string };
};

export type UpdateAdminClientSeoAuditConfigRequest = {
  siteUrl?: string | null;
  gaPropertyId?: string | null;
  searchConsolePropertyUrl?: string | null;
  targetKeywords?: string[];
  auditFrequency?: string | null;
  lastAuditScore?: number | null;
  notes?: string | null;
};
