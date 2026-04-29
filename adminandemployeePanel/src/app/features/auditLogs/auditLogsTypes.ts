export type AuditLogSortBy = "createdAt" | "action" | "entityType";
export type AuditLogSortOrder = "asc" | "desc";

export type KnownAuditLogAction =
  | "ADMIN_USER_CREATED"
  | "ADMIN_USER_UPDATED"
  | "ADMIN_USER_DEACTIVATED"
  | "ADMIN_USER_ACTIVATED"
  | "ADMIN_USER_PASSWORD_RESET"
  | "USER_PASSWORD_CHANGED";

export type AuditLogAction = KnownAuditLogAction | (string & {});

export type KnownAuditEntityType = "User" | "ClientProfile" | "Project" | "Task";
export type AuditEntityType = KnownAuditEntityType | (string & {});

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
  [key: string]: JsonValue;
};

export type AdminAuditLog = {
  id: string;
  action: AuditLogAction;
  entityType: AuditEntityType;
  entityId: string | null;
  actorUserId: string | null;
  targetUserId: string | null;
  targetClientProfileId: string | null;
  metadata: JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminAuditLogsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminAuditLogsListResponse = {
  data: AdminAuditLog[];
  meta: AdminAuditLogsListMeta;
};

export type AdminAuditLogsListQuery = {
  page?: number;
  limit?: number;
  sortBy?: AuditLogSortBy;
  sortOrder?: AuditLogSortOrder;
  action?: string;
  actorUserId?: string;
  targetUserId?: string;
  targetClientProfileId?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};
