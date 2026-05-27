import { IsEnum, IsOptional, IsString } from "class-validator";
import { TikTokAdsConnectionStatus } from "@prisma/client";

export class UpdateTikTokAdsConfigDto {
  @IsOptional()
  @IsString()
  advertiserId?: string | null;

  @IsOptional()
  @IsString()
  businessCenterId?: string | null;

  @IsOptional()
  @IsString()
  pixelId?: string | null;

  @IsOptional()
  @IsString()
  advertiserName?: string | null;

  @IsOptional()
  @IsString()
  currency?: string | null;

  @IsOptional()
  @IsString()
  timezone?: string | null;

  @IsOptional()
  @IsEnum(TikTokAdsConnectionStatus)
  connectionStatus?: TikTokAdsConnectionStatus;
}
