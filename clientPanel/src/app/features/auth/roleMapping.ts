import type { AuthUserProfile, UserRole } from "./authTypes";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  PERFORMANCE_SPECIALIST: "Performance Specialist",
  SOCIAL_MEDIA_SPECIALIST: "Social Media Specialist",
  DESIGNER: "Designer",
  DEVELOPER: "Developer",
  SUPPORT_SPECIALIST: "Support Specialist",
  SEO_SPECIALIST: "SEO Specialist",
  CLIENT_OWNER: "Client Owner",
  CLIENT_MEMBER: "Client Member",
};

export function getBackendRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
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
