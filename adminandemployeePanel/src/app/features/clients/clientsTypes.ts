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
