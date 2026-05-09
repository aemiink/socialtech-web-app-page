import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MetaAdsApiService } from "./meta-ads-api.service";
import { MetaAdsController } from "./meta-ads.controller";
import { MetaAdsService } from "./meta-ads.service";
import { MetaAdsTokenService } from "./meta-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [MetaAdsController],
  providers: [MetaAdsService, MetaAdsTokenService, MetaAdsApiService],
})
export class MetaAdsModule {}
