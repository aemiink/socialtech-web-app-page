import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { GoogleAdsConnectionStatus } from "@prisma/client";

function normalizeOptionalTextOrNull(value: unknown): unknown {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class AdminClientGoogleAdsConfigDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTextOrNull(value))
  @IsString()
  @MaxLength(120)
  customerId?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTextOrNull(value))
  @IsString()
  @MaxLength(120)
  managerCustomerId?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTextOrNull(value))
  @IsString()
  @MaxLength(255)
  descriptiveName?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTextOrNull(value))
  @IsString()
  @MaxLength(32)
  currencyCode?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalTextOrNull(value))
  @IsString()
  @MaxLength(80)
  timeZone?: string | null;

  @IsOptional()
  @IsEnum(GoogleAdsConnectionStatus)
  connectionStatus?: GoogleAdsConnectionStatus;
}
