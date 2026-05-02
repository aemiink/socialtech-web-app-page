import type { AdminUser } from "../adminUsers/adminUsersTypes";
import type { ClientStatus } from "../clients/clientsTypes";

export type CrmLeadStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "QUALIFIED" | "WON" | "LOST";
export type CrmLeadSource = "MANUAL" | "WEBSITE_FORM";
export type CrmLeadActivityType = "CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | "STATUS_CHANGE";
export type CrmLeadSortBy = "createdAt" | "updatedAt" | "nextFollowUpAt" | "companyName" | "status";
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
  ownerUserId: string;
  convertedClientProfileId: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: CrmUserSummary;
  convertedClientProfile: CrmConvertedClient | null;
  latestActivity: CrmLeadActivity | null;
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
