import { Transform } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export const AUDIT_LOG_SORT_BY_VALUES = ["createdAt", "action", "entityType"] as const;

export type AuditLogSortBy = (typeof AUDIT_LOG_SORT_BY_VALUES)[number];

export const AUDIT_LOG_SORT_ORDER_VALUES = ["asc", "desc"] as const;

export type AuditLogSortOrder = (typeof AUDIT_LOG_SORT_ORDER_VALUES)[number];

const MAX_AUDIT_LOGS_PAGE = 10_000;

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

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class AuditLogQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(MAX_AUDIT_LOGS_PAGE)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseOptionalPositiveInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(AUDIT_LOG_SORT_BY_VALUES)
  sortBy: AuditLogSortBy = "createdAt";

  @IsOptional()
  @IsIn(AUDIT_LOG_SORT_ORDER_VALUES)
  sortOrder: AuditLogSortOrder = "desc";

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  action?: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsOptional()
  @IsUUID()
  targetClientProfileId?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  entityType?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  entityId?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
