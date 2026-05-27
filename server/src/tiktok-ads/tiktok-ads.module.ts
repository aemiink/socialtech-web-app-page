import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TikTokAdsController } from "./tiktok-ads.controller";
import { TikTokAdsService } from "./tiktok-ads.service";
import { TikTokAdsTokenService } from "./tiktok-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [TikTokAdsController],
  providers: [TikTokAdsService, TikTokAdsTokenService],
  exports: [TikTokAdsService, TikTokAdsTokenService],
})
export class TikTokAdsModule {}
