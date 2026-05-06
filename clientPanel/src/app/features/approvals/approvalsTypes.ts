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

export type ClientApproval = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  serviceKey: string | null;
  type: ClientApprovalType;
  status: ClientApprovalStatus;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  actionPayload: Record<string, unknown> | null;
  requiresExplicitApproval: boolean;
  clientResponseNote: string | null;
  respondedAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: string | null;
    status: string;
    priority: string;
  } | null;
};

export type ClientApprovalListResponse = {
  data: ClientApproval[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
