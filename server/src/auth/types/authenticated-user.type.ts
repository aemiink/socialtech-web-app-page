import { AccountType, UserRole } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  accountType: AccountType;
  role: UserRole;
  clientProfileId: string | null;
  permissions: string[];
};
