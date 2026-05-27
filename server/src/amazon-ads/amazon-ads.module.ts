import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AmazonAdsApiService } from "./amazon-ads-api.service";
import { AmazonAdsController } from "./amazon-ads.controller";
import { AmazonAdsService } from "./amazon-ads.service";
import { AmazonAdsTokenService } from "./amazon-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [AmazonAdsController],
  providers: [AmazonAdsService, AmazonAdsTokenService, AmazonAdsApiService],
  exports: [AmazonAdsService, AmazonAdsTokenService, AmazonAdsApiService],
})
export class AmazonAdsModule {}
