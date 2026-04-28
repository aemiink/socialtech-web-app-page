import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { AccountType, UserRole } from "@prisma/client";

export const ADMIN_USER_SORT_BY_VALUES = [
  "createdAt",
  "updatedAt",
  "displayName",
  "email",
  "lastLoginAt",
  "role",
  "status",
] as const;

export type AdminUserSortBy = (typeof ADMIN_USER_SORT_BY_VALUES)[number];

export const ADMIN_USER_SORT_ORDER_VALUES = ["asc", "desc"] as const;

export type AdminUserSortOrder = (typeof ADMIN_USER_SORT_ORDER_VALUES)[number];

const MAX_ADMIN_USERS_PAGE = 10_000;

function parseOptionalBoolean(value: unknown): unknown {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

function parseOptionalPositiveInteger(value: unknown): unknown {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : String(value);
  }

  if (typeof value !== "string") {
    return value;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : value;
}

function normalizeOptionalSearch(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class AdminUserQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(MAX_ADMIN_USERS_PAGE)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(ADMIN_USER_SORT_BY_VALUES)
  sortBy: AdminUserSortBy = "createdAt";

  @IsOptional()
  @IsIn(ADMIN_USER_SORT_ORDER_VALUES)
  sortOrder: AdminUserSortOrder = "desc";

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @Transform(({ value }) => normalizeOptionalSearch(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
