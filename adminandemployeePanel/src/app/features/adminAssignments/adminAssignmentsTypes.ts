import type { AccountType, UserRole } from "../auth/authTypes";

export type AdminAssignmentScope =
  | "PROJECT"
  | "PERFORMANCE"
  | "SOCIAL_MEDIA"
  | "DESIGN"
  | "DEVELOPMENT"
  | "SUPPORT"
  | "SEO";

export type AdminAssignmentEmployee = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  accountType: AccountType;
};

export type AdminAssignmentClient = {
  id: string;
  slug: string;
  name: string;
};

export type AdminAssignment = {
  id: string;
  employeeUserId: string;
  clientProfileId: string;
  scope: AdminAssignmentScope;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employee: AdminAssignmentEmployee;
  client: AdminAssignmentClient;
};

export type AdminAssignmentsListResponse = AdminAssignment[];

export type AdminAssignmentsListQuery = {
  employeeUserId?: string;
  clientProfileId?: string;
  scope?: AdminAssignmentScope;
  isActive?: boolean;
};

export type CreateAdminAssignmentRequest = {
  employeeUserId: string;
  clientProfileId: string;
  scope: AdminAssignmentScope;
};

export type UpdateAdminAssignmentRequest = {
  scope?: AdminAssignmentScope;
  isActive?: boolean;
};
