import { IsEnum, IsOptional, IsString } from "class-validator";
import { TikTokAdsConnectionStatus } from "@prisma/client";

export class UpdateTikTokAdsConfigDto {
  @IsOptional()
  @IsString()
  advertiserId?: string;

  @IsOptional()
  @IsString()
  businessCenterId?: string;

  @IsOptional()
  @IsString()
  pixelId?: string;

  @IsOptional()
  @IsString()
  advertiserName?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(TikTokAdsConnectionStatus)
  connectionStatus?: TikTokAdsConnectionStatus;
}
