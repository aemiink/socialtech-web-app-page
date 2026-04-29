export type AccountType = "ADMIN" | "EMPLOYEE" | "CLIENT";

export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "PERFORMANCE_SPECIALIST"
  | "SOCIAL_MEDIA_SPECIALIST"
  | "DESIGNER"
  | "DEVELOPER"
  | "SUPPORT_SPECIALIST"
  | "SEO_SPECIALIST";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type ClientProfileSummary = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
};

export type AuthUserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  accountType: AccountType;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  clientProfile: ClientProfileSummary | null;
};

export type PublicAuthResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: AuthUserProfile;
};

export type LoginRequest = {
  email: string;
  password: string;
};
