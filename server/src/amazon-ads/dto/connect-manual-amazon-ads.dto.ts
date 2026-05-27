import { Transform } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { AmazonAdsRegion } from "@prisma/client";

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

export class ConnectManualAmazonAdsDto {
  @Transform(({ value }) => normalizeRequiredText(value))
  @IsString()
  @MinLength(20)
  @MaxLength(8192)
  refreshToken!: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MinLength(20)
  @MaxLength(8192)
  accessToken?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  profileId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  advertiserAccountId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(80)
  marketplaceId?: string;

  @IsOptional()
  @IsEnum(AmazonAdsRegion)
  region?: AmazonAdsRegion;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(80)
  accountType?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(160)
  accountName?: string;

  @IsOptional()
  @IsBoolean()
  validPaymentMethod?: boolean;

  @IsOptional()
  @IsISO8601()
  accessTokenExpiresAt?: string;

  @IsOptional()
  @IsISO8601()
  refreshTokenExpiresAt?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  grantedScopes?: string[];
}
