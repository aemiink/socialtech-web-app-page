import {
  AccountType,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";

export type PurchasedServiceSummary = {
  serviceKey: PurchasedServiceKey;
  status: PurchasedServiceStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  packageTierKey: string | null;
};

export type ClientProfileSummary = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  purchasedServices: PurchasedServiceSummary[];
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
  purchasedServices: PurchasedServiceSummary[];
};

export type PublicAuthResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: AuthUserProfile;
};

export type AuthServiceResponse = PublicAuthResponse & {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
