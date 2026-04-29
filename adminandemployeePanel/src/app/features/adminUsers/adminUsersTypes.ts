import type { AccountType, UserRole } from "../auth/authTypes";

export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type EmployeeRole =
  | "PROJECT_MANAGER"
  | "PERFORMANCE_SPECIALIST"
  | "SOCIAL_MEDIA_SPECIALIST"
  | "DESIGNER"
  | "DEVELOPER"
  | "SUPPORT_SPECIALIST"
  | "SEO_SPECIALIST";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: AdminUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminUsersListResponse = {
  data: AdminUser[];
  meta: AdminUsersListMeta;
};

export type AdminUsersSortBy =
  | "createdAt"
  | "updatedAt"
  | "displayName"
  | "email"
  | "lastLoginAt"
  | "role"
  | "status";

export type SortOrder = "asc" | "desc";

export type AdminUsersListQuery = {
  page?: number;
  limit?: number;
  sortBy?: AdminUsersSortBy;
  sortOrder?: SortOrder;
  accountType?: AccountType;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
};

export type CreateAdminEmployeeUserRequest = {
  email: string;
  displayName: string;
  accountType: "EMPLOYEE";
  role: EmployeeRole;
  password: string;
};

export type UpdateAdminUserRequest = {
  displayName?: string;
  role?: EmployeeRole;
  isActive?: boolean;
};

export type ResetAdminUserPasswordRequest = {
  newPassword: string;
};
