import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
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

export class ExchangeAmazonAdsOAuthCodeDto {
  @Transform(({ value }) => normalizeRequiredText(value))
  @IsString()
  @MinLength(8)
  @MaxLength(8192)
  code!: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  profileId?: string;

  @IsOptional()
  @IsEnum(AmazonAdsRegion)
  region?: AmazonAdsRegion;
}
