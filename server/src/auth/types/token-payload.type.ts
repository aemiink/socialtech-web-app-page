import { AccountType, UserRole } from "@prisma/client";

type BaseTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  clientProfileId: string | null;
  iat?: number;
  exp?: number;
  siv?: number;
};

export type AccessTokenPayload = BaseTokenPayload & {
  tokenType: "access";
};

export type RefreshTokenPayload = BaseTokenPayload & {
  tokenType: "refresh";
  jti: string;
};
