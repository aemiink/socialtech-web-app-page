import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TikTokAdsController } from "./tiktok-ads.controller";
import { TikTokAdsApiService } from "./tiktok-ads-api.service";
import { TikTokAdsService } from "./tiktok-ads.service";
import { TikTokAdsTokenService } from "./tiktok-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [TikTokAdsController],
  providers: [TikTokAdsService, TikTokAdsTokenService, TikTokAdsApiService],
  exports: [TikTokAdsService, TikTokAdsTokenService, TikTokAdsApiService],
})
export class TikTokAdsModule {}
