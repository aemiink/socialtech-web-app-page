import { extractApiErrorMessage } from "../adminUsers/adminUsersUtils";
import type { AccountType, UserRole } from "../auth/authTypes";
import type {
  AdminAssignment,
  AdminAssignmentScope,
  AdminAssignmentsListResponse,
} from "./adminAssignmentsTypes";

export { extractApiErrorMessage };

export const ADMIN_ASSIGNMENT_SCOPE_OPTIONS: AdminAssignmentScope[] = [
  "PROJECT",
  "PERFORMANCE",
  "SOCIAL_MEDIA",
  "DESIGN",
  "DEVELOPMENT",
  "SUPPORT",
  "SEO",
];

const SCOPE_LABELS: Record<AdminAssignmentScope, string> = {
  PROJECT: "Proje",
  PERFORMANCE: "Performans",
  SOCIAL_MEDIA: "Sosyal Medya",
  DESIGN: "Tasarım",
  DEVELOPMENT: "Yazılım",
  SUPPORT: "Destek",
  SEO: "SEO",
};

const USER_ROLES: UserRole[] = [
  "ADMIN",
  "PROJECT_MANAGER",
  "PERFORMANCE_SPECIALIST",
  "SOCIAL_MEDIA_SPECIALIST",
  "DESIGNER",
  "DEVELOPER",
  "SUPPORT_SPECIALIST",
  "SEO_SPECIALIST",
];

const ACCOUNT_TYPES: AccountType[] = ["ADMIN", "EMPLOYEE", "CLIENT"];

export function normalizeAdminAssignmentsListResponse(
  response: unknown,
): AdminAssignmentsListResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;

  return Array.isArray(responseData) ? responseData.filter(isAdminAssignment) : [];
}

export function normalizeAdminAssignmentResponse(response: unknown): AdminAssignment {
  const candidate = isRecord(response) && "data" in response ? response.data : response;

  if (isAdminAssignment(candidate)) {
    return candidate;
  }

  throw new Error("Assignment response could not be parsed.");
}

export function getAssignmentScopeLabel(scope: AdminAssignmentScope): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export function getAssignmentScopeBadgeClass(scope: AdminAssignmentScope): string {
  if (scope === "PERFORMANCE") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }

  if (scope === "SOCIAL_MEDIA") {
    return "border-pink-400/40 bg-pink-500/15 text-pink-200";
  }

  if (scope === "DESIGN") {
    return "border-purple-400/40 bg-purple-500/15 text-purple-200";
  }

  if (scope === "DEVELOPMENT") {
    return "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  }

  if (scope === "SUPPORT") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }

  if (scope === "SEO") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }

  return "bg-[#AAFF01] text-[#131313]";
}

export function getAssignmentStatusLabel(isActive: boolean): string {
  return isActive ? "Aktif" : "Pasif";
}

export function getAssignmentStatusBadgeClass(isActive: boolean): string {
  return isActive
    ? "bg-[#AAFF01] text-[#131313]"
    : "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getAssignmentEmployeeName(assignment: AdminAssignment): string {
  const displayName = assignment.employee.displayName?.trim();

  return displayName && displayName.length > 0 ? displayName : assignment.employee.email;
}

export function formatAssignmentDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function isAdminAssignmentScope(value: unknown): value is AdminAssignmentScope {
  return (
    typeof value === "string" &&
    ADMIN_ASSIGNMENT_SCOPE_OPTIONS.includes(value as AdminAssignmentScope)
  );
}

function isAdminAssignment(value: unknown): value is AdminAssignment {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.employeeUserId === "string" &&
    typeof value.clientProfileId === "string" &&
    isAdminAssignmentScope(value.scope) &&
    typeof value.isActive === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isAssignmentEmployee(value.employee) &&
    isAssignmentClient(value.client)
  );
}

function isAssignmentEmployee(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    isStringOrNull(value.displayName) &&
    isUserRole(value.role) &&
    isAccountType(value.accountType)
  );
}

function isAssignmentClient(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string"
  );
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

function isAccountType(value: unknown): value is AccountType {
  return typeof value === "string" && ACCOUNT_TYPES.includes(value as AccountType);
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
