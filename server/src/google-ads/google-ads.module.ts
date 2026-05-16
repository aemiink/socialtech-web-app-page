import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GoogleAdsApiService } from "./google-ads-api.service";
import { GoogleAdsController } from "./google-ads.controller";
import { GoogleAdsService } from "./google-ads.service";
import { GoogleAdsTokenService } from "./google-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [GoogleAdsController],
  providers: [GoogleAdsService, GoogleAdsTokenService, GoogleAdsApiService],
})
export class GoogleAdsModule {}
