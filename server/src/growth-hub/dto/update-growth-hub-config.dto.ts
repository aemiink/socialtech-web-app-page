import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { GrowthHubGoal, GrowthHubStatus } from "@prisma/client";

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

function normalizeNullableNumber(value: unknown): unknown {
  if (value === null || value === undefined || value === "") {
    return value === undefined ? undefined : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? Number(trimmed) : null;
  }

  return value;
}

export class UpdateGrowthHubConfigDto {
  @IsOptional()
  @IsEnum(GrowthHubGoal)
  primaryGoal?: GrowthHubGoal | null;

  @Transform(({ value }) => normalizeNullableNumber(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  targetLeads?: number | null;

  @Transform(({ value }) => normalizeNullableNumber(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  targetRoas?: number | null;

  @Transform(({ value }) => normalizeNullableNumber(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  targetCpa?: number | null;

  @Transform(({ value }) => normalizeNullableNumber(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  targetRevenue?: number | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(40)
  reportingDay?: string | null;

  @Transform(({ value }) => normalizeNullableText(value))
  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @IsOptional()
  @IsEnum(GrowthHubStatus)
  status?: GrowthHubStatus;
}
