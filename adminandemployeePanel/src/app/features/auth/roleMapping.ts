import type { AuthUserProfile, UserRole } from "./authTypes";

export type EmployeePanelRole =
  | "project-manager"
  | "performance-specialist"
  | "social-media-specialist"
  | "designer"
  | "developer"
  | "support-specialist"
  | "seo-specialist"
  | "crm-specialist";

const BACKEND_ROLE_TO_EMPLOYEE_ROLE: Record<UserRole, EmployeePanelRole | null> = {
  ADMIN: null,
  PROJECT_MANAGER: "project-manager",
  PERFORMANCE_SPECIALIST: "performance-specialist",
  SOCIAL_MEDIA_SPECIALIST: "social-media-specialist",
  DESIGNER: "designer",
  DEVELOPER: "developer",
  SUPPORT_SPECIALIST: "support-specialist",
  SEO_SPECIALIST: "seo-specialist",
  CRM_SPECIALIST: "crm-specialist",
};

const BACKEND_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  PERFORMANCE_SPECIALIST: "Performance Specialist",
  SOCIAL_MEDIA_SPECIALIST: "Social Media Specialist",
  DESIGNER: "Designer",
  DEVELOPER: "Developer",
  SUPPORT_SPECIALIST: "Support Specialist",
  SEO_SPECIALIST: "SEO Specialist",
  CRM_SPECIALIST: "CRM / Satış Uzmanı",
};

export function mapBackendRoleToEmployeeRole(role: UserRole): EmployeePanelRole | null {
  return BACKEND_ROLE_TO_EMPLOYEE_ROLE[role] ?? null;
}

export function getBackendRoleLabel(role: UserRole): string {
  return BACKEND_ROLE_LABELS[role] ?? role;
}

export function getUserDisplayName(user: AuthUserProfile): string {
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  const localPart = user.email.split("@")[0];
  return localPart.length > 0 ? localPart : user.email;
}

export function getUserInitials(user: AuthUserProfile): string {
  const source = getUserDisplayName(user)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((piece) => piece[0]?.toUpperCase() ?? "")
    .join("");

  if (source.length > 0) {
    return source;
  }

  return "ST";
}
