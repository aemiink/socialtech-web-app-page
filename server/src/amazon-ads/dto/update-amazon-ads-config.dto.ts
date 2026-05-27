import { AmazonAdsConnectionStatus, AmazonAdsRegion } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateAmazonAdsConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  profileId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  advertiserAccountId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  marketplaceId?: string | null;

  @IsOptional()
  @IsEnum(AmazonAdsRegion)
  region?: AmazonAdsRegion | null;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  accountType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  accountName?: string | null;

  @IsOptional()
  @IsBoolean()
  validPaymentMethod?: boolean | null;

  @IsOptional()
  @IsEnum(AmazonAdsConnectionStatus)
  connectionStatus?: AmazonAdsConnectionStatus;
}
