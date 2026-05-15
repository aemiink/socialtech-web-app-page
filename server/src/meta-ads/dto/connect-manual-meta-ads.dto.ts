import { Transform } from "class-transformer";
import {
  IsArray,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

function normalizeRequiredText(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalStringArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

export class ConnectManualMetaAdsDto {
  @Transform(({ value }) => normalizeRequiredText(value))
  @IsString()
  @MinLength(20)
  @MaxLength(8192)
  accessToken!: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  businessId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  adAccountId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  pixelId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  instagramAccountId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  facebookPageId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(32)
  currency?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsISO8601()
  tokenExpiresAt?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  grantedScopes?: string[];
}
