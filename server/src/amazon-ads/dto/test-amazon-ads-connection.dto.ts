import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { AmazonAdsRegion } from "@prisma/client";

function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class TestAmazonAdsConnectionDto {
  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MinLength(20)
  @MaxLength(8192)
  refreshToken?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeOptionalText(value))
  @IsString()
  @MaxLength(120)
  profileId?: string;

  @IsOptional()
  @IsEnum(AmazonAdsRegion)
  region?: AmazonAdsRegion;
}
