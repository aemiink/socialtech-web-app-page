import { Transform } from "class-transformer";
import {
  ClientApprovalEntityType,
  ClientApprovalStatus,
  ClientApprovalType,
  PurchasedServiceKey,
} from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export const CLIENT_APPROVAL_SORT_BY_VALUES = [
  "createdAt",
  "updatedAt",
  "dueAt",
  "status",
] as const;
export type ClientApprovalSortBy = (typeof CLIENT_APPROVAL_SORT_BY_VALUES)[number];

export const CLIENT_APPROVAL_SORT_ORDER_VALUES = ["asc", "desc"] as const;
export type ClientApprovalSortOrder = (typeof CLIENT_APPROVAL_SORT_ORDER_VALUES)[number];

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

function parseOptionalBoolean(value: unknown): unknown {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return value;
}

export class ClientApprovalQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(10_000)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(CLIENT_APPROVAL_SORT_BY_VALUES)
  sortBy: ClientApprovalSortBy = "createdAt";

  @IsOptional()
  @IsIn(CLIENT_APPROVAL_SORT_ORDER_VALUES)
  sortOrder: ClientApprovalSortOrder = "desc";

  @IsOptional()
  @IsEnum(ClientApprovalStatus)
  status?: ClientApprovalStatus;

  @IsOptional()
  @IsEnum(ClientApprovalType)
  type?: ClientApprovalType;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  clientProfileId?: string;

  @IsOptional()
  @IsEnum(PurchasedServiceKey)
  serviceKey?: PurchasedServiceKey;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @IsEnum(ClientApprovalEntityType)
  entityType?: ClientApprovalEntityType;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  onlyPending?: boolean;

  @Transform(({ value }) => normalizeOptionalSearch(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
