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

export class ConnectManualGoogleAdsDto {
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
  customerId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  managerCustomerId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(255)
  descriptiveName?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(32)
  currencyCode?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(80)
  timeZone?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsISO8601()
  tokenExpiresAt?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  grantedScopes?: string[];
}
