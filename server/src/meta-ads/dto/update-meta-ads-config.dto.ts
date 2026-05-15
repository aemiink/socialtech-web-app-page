import { Transform } from "class-transformer";
import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";
import { MetaAdsConnectionStatus } from "@prisma/client";

function optionalTrimmedTextOrNull(value: unknown): unknown {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class UpdateMetaAdsConfigDto {
  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(120)
  businessId?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(120)
  adAccountId?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(120)
  pixelId?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(120)
  instagramAccountId?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(120)
  facebookPageId?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(32)
  currency?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(80)
  timezone?: string | null;

  @IsOptional()
  @IsEnum(MetaAdsConnectionStatus)
  connectionStatus?: MetaAdsConnectionStatus;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsISO8601()
  lastSyncAt?: string | null;

  @IsOptional()
  @Transform(({ value }) => optionalTrimmedTextOrNull(value))
  @IsString()
  @MaxLength(1000)
  syncError?: string | null;
}
