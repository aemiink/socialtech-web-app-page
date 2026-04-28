import { AccountType, UserRole, UserStatus } from "@prisma/client";

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

export type AuthServiceResponse = PublicAuthResponse & {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};
