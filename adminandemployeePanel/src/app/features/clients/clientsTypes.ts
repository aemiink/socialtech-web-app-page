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
