import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import {
  SocialMediaPlatform,
  SocialMediaPostStatus,
  SocialMediaPostType,
} from "@prisma/client";

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (
    normalized.length === 0 ||
    normalized.toLowerCase() === "undefined" ||
    normalized.toLowerCase() === "null" ||
    normalized.toUpperCase() === "ALL"
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeOptionalEnum(value: unknown): unknown {
  const normalized = normalizeOptionalString(value);
  return typeof normalized === "string" ? normalized.toUpperCase() : normalized;
}

function toInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return undefined;
}

export class SocialMediaPostQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalEnum(value))
  @IsEnum(SocialMediaPlatform)
  platform?: SocialMediaPlatform;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalEnum(value))
  @IsEnum(SocialMediaPostType)
  type?: SocialMediaPostType;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalEnum(value))
  @IsEnum(SocialMediaPostStatus)
  status?: SocialMediaPostStatus;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  clientVisible?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsDateString()
  from?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
