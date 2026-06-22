import type { ServiceId } from "../../data/service-pages";

export type AccountType = "ADMIN" | "EMPLOYEE" | "CLIENT";

export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "PERFORMANCE_SPECIALIST"
  | "SOCIAL_MEDIA_SPECIALIST"
  | "DESIGNER"
  | "DEVELOPER"
  | "SUPPORT_SPECIALIST"
  | "SEO_SPECIALIST"
  | "CLIENT_OWNER"
  | "CLIENT_MEMBER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type PurchasedServiceStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "CANCELED"
  | "CANCELLED"
  | "PAUSED";

export type ClientPurchasedService = {
  serviceId: ServiceId;
  status: PurchasedServiceStatus;
  packageTierKey?: string | null;
};

export type ClientProfileSummary = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  purchasedServices: ClientPurchasedService[];
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
  purchasedServices: ClientPurchasedService[];
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
