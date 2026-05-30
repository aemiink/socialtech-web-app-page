import {
  GrowthHubActionPriority,
  GrowthHubRecommendationStatus,
} from "@prisma/client";
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
  MinLength,
  ValidateIf,
} from "class-validator";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
}

function normalizeNullableText(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalInteger(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}

function normalizeOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return value;
}

export class GrowthHubRecommendationsQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsEnum(GrowthHubRecommendationStatus)
  status?: GrowthHubRecommendationStatus;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalBoolean(value))
  @IsBoolean()
  clientVisible?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdateGrowthHubRecommendationDto {
  @IsOptional()
  @IsEnum(GrowthHubRecommendationStatus)
  status?: GrowthHubRecommendationStatus;

  @IsOptional()
  @IsEnum(GrowthHubActionPriority)
  priority?: GrowthHubActionPriority;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  clientVisible?: boolean;
}

export class ConvertGrowthHubRecommendationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assigneeUserId?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsDateString()
  dueDate?: string | null;
}
