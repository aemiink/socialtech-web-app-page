import type { AccountType, ClientProfileSummary, UserRole } from "../auth/authTypes";
import type { ServiceKey } from "../clients/clientsTypes";

export type ClientApprovalType =
  | "DESIGN_APPROVAL"
  | "FILE_APPROVAL"
  | "TASK_APPROVAL"
  | "SPRINT_APPROVAL"
  | "RELEASE_APPROVAL"
  | "REVISION_APPROVAL"
  | "MEETING_CONFIRMATION"
  | "INFORMATION"
  | "GENERAL_CONFIRMATION";

export type ClientApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACKNOWLEDGED"
  | "CANCELLED"
  | "EXPIRED";

export type ClientApprovalEntityType =
  | "PROJECT"
  | "TASK"
  | "TASK_TODO"
  | "SPRINT"
  | "RELEASE"
  | "PROJECT_FILE"
  | "WORKSPACE_MESSAGE"
  | "DESIGN_ASSET"
  | "REVISION"
  | "MEETING_REQUEST";

export type ClientApprovalUserSummary = {
  id: string;
  displayName: string | null;
  email?: string | null;
  role?: UserRole | string | null;
  accountType?: AccountType | string | null;
};

export type ClientApprovalProjectSummary = {
  id: string;
  name: string;
  serviceKey?: ServiceKey | null;
};

export type ClientApprovalTransition = {
  id: string;
  approvalId: string;
  actorUserId: string;
  fromStatus?: ClientApprovalStatus | null;
  toStatus: ClientApprovalStatus;
  note?: string | null;
  createdAt: string;
  actor?: ClientApprovalUserSummary | null;
};

export type ClientApproval = {
  id: string;
  clientProfileId: string;
  projectId?: string | null;
  serviceKey?: ServiceKey | null;
  requestedByUserId?: string | null;
  assignedToUserId?: string | null;
  respondedByUserId?: string | null;
  type: ClientApprovalType;
  status: ClientApprovalStatus;
  title: string;
  message: string;
  entityType?: ClientApprovalEntityType | null;
  entityId?: string | null;
  actionPayload?: Record<string, unknown> | null;
  requiresExplicitApproval: boolean;
  clientResponseNote?: string | null;
  respondedAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  clientProfile?: ClientProfileSummary | null;
  project?: ClientApprovalProjectSummary | null;
  requestedBy?: ClientApprovalUserSummary | null;
  assignedTo?: ClientApprovalUserSummary | null;
  respondedBy?: ClientApprovalUserSummary | null;
  transitions?: ClientApprovalTransition[];
};

export type ClientApprovalsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ClientApprovalsListResponse = {
  data: ClientApproval[];
  meta: ClientApprovalsListMeta;
};

export type ClientApprovalsListQuery = {
  clientProfileId?: string;
  projectId?: string;
  serviceKey?: ServiceKey;
  type?: ClientApprovalType;
  status?: ClientApprovalStatus;
  entityType?: ClientApprovalEntityType;
  assignedToUserId?: string;
  search?: string;
  onlyPending?: boolean;
  page?: number;
  limit?: number;
};

export type CreateClientApprovalRequest = {
  clientProfileId: string;
  projectId?: string | null;
  serviceKey?: ServiceKey | null;
  assignedToUserId?: string | null;
  type: ClientApprovalType;
  title: string;
  message: string;
  entityType?: ClientApprovalEntityType | null;
  entityId?: string | null;
  actionPayload?: Record<string, unknown> | null;
  requiresExplicitApproval?: boolean;
  dueAt?: string | null;
};

export type UpdateClientApprovalRequest = Partial<
  Omit<CreateClientApprovalRequest, "clientProfileId">
> & {
  status?: ClientApprovalStatus;
};

export type ClientApprovalContextOption = {
  key: string;
  label: string;
  description?: string;
  entityType?: ClientApprovalEntityType;
  entityId?: string | null;
  actionPayload?: Record<string, unknown> | null;
};

export type ClientApprovalComposerPreset = {
  type?: ClientApprovalType;
  title?: string;
  message?: string;
  assignedToUserId?: string;
  requiresExplicitApproval?: boolean;
  dueAt?: string;
  contextKey?: string;
};
