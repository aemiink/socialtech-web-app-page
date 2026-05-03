import type { AdminUser } from "../adminUsers/adminUsersTypes";
import type { ClientStatus } from "../clients/clientsTypes";

export type CrmLeadStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "QUALIFIED" | "WON" | "LOST";
export type CrmLeadSource = "MANUAL" | "WEBSITE_FORM" | "SERPAPI";
export type CrmLeadActivityType = "CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | "STATUS_CHANGE";
export type CrmLeadSortBy = "createdAt" | "updatedAt" | "nextFollowUpAt" | "companyName" | "status";
export type CrmLeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type CrmLeadWebsiteStatus = "NO_WEBSITE" | "FETCH_FAILED" | "ANALYZED";
export type CrmLeadScanStatus = "RUNNING" | "COMPLETED" | "FAILED";
export type CrmLeadScanTrigger = "MANUAL" | "CRON";
export type SortOrder = "asc" | "desc";

export type CrmUserSummary = Pick<AdminUser, "id" | "displayName" | "email" | "role" | "status">;

export type CrmConvertedClient = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
};

export type CrmLeadActivity = {
  id: string;
  leadId: string;
  actorUserId: string | null;
  type: CrmLeadActivityType;
  note: string;
  nextFollowUpAt: string | null;
  createdAt: string;
  actor: CrmUserSummary | null;
};

export type CrmLead = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string | null;
  phone: string | null;
  source: CrmLeadSource;
  status: CrmLeadStatus;
  priority?: CrmLeadPriority | null;
  ownerUserId: string;
  convertedClientProfileId: string | null;
  address?: string | null;
  city?: string | null;
  sector?: string | null;
  website?: string | null;
  websiteStatus?: CrmLeadWebsiteStatus | null;
  websiteIssues?: unknown;
  detectedPainPoints?: unknown;
  recommendedServices?: unknown;
  outreachAngle?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  whatsappMessage?: string | null;
  sourceQuery?: string | null;
  sourceProvider?: string | null;
  googleMapsUrl?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  instagramUrl?: string | null;
  whatsappPhone?: string | null;
  leadScore?: number | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: CrmUserSummary;
  convertedClientProfile: CrmConvertedClient | null;
  latestActivity: CrmLeadActivity | null;
  importMetadata?: Record<string, unknown> | null;
  scanMetadata?: Record<string, unknown> | null;
  draftCopy?: string | null;
  notesDraft?: string | null;
};

export type CrmLeadDetail = CrmLead & {
  activities: CrmLeadActivity[];
};

export type CrmLeadListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CrmLeadListResponse = {
  data: CrmLead[];
  meta: CrmLeadListMeta;
};

export type CrmLeadListQuery = {
  page?: number;
  limit?: number;
  status?: CrmLeadStatus;
  ownerUserId?: string;
  source?: CrmLeadSource;
  search?: string;
  nextFollowUpFrom?: string;
  nextFollowUpTo?: string;
  sortBy?: CrmLeadSortBy;
  sortOrder?: SortOrder;
};

export type CreateCrmLeadRequest = {
  companyName: string;
  contactName: string;
  contactEmail?: string;
  phone?: string;
  ownerUserId: string;
  source?: CrmLeadSource;
  status?: CrmLeadStatus;
  nextFollowUpAt?: string;
  initialNote?: string;
};

export type UpdateAdminCrmLeadRequest = Partial<
  Pick<
    CreateCrmLeadRequest,
    "companyName" | "contactName" | "contactEmail" | "phone" | "ownerUserId" | "status" | "nextFollowUpAt"
  >
>;

export type UpdateAssignedCrmLeadRequest = {
  status?: Exclude<CrmLeadStatus, "NEW" | "WON">;
  nextFollowUpAt?: string | null;
};

export type CreateCrmLeadActivityRequest = {
  type: Exclude<CrmLeadActivityType, "STATUS_CHANGE">;
  note: string;
  nextFollowUpAt?: string;
};

export type ConvertCrmLeadRequest = {
  clientName?: string;
  slug?: string;
};

export type ConvertCrmLeadResponse = {
  lead: CrmLeadDetail;
  convertedClientProfile: CrmConvertedClient;
};

export type RunAdminCrmLeadScanRequest = {
  queryLimit?: number;
  cities?: string[];
  sectors?: string[];
};

export type CrmLeadScanUsageSummary = {
  dailyQueryLimit: number;
  absoluteMaxDailyQueryLimit: number;
  usedToday: number;
  remainingToday: number;
};

export type CrmLeadScanLogSummary = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: CrmLeadScanStatus;
  triggeredBy: CrmLeadScanTrigger;
  triggeredByUserId: string | null;
  totalQueriesUsed: number;
  totalBusinessesFetched: number;
  totalDuplicates: number;
  totalWebsitesAnalyzed: number;
  totalQualified: number;
  totalSaved: number;
  totalFailed: number;
  summary: string | null;
  queries: unknown;
  errors: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CrmLeadScanLogsResponse = {
  data: CrmLeadScanLogSummary[];
  meta: CrmLeadScanUsageSummary;
};

export type RunAdminCrmLeadScanResponse = {
  scanId: string;
  status: CrmLeadScanStatus;
  totalQueriesUsed: number;
  totalBusinessesFetched: number;
  totalDuplicates: number;
  totalWebsitesAnalyzed: number;
  totalQualified: number;
  totalSaved: number;
  totalFailed: number;
  summary: string;
  usage: CrmLeadScanUsageSummary;
};
