import { IsEnum, IsOptional } from "class-validator";
import { AmazonAdsRegion } from "@prisma/client";

export class AmazonAdsOAuthStartQueryDto {
  @IsOptional()
  @IsEnum(AmazonAdsRegion)
  region?: AmazonAdsRegion;
}
