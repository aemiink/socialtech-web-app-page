import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MetaAdsApiService } from "./meta-ads-api.service";
import { MetaAdsController } from "./meta-ads.controller";
import { MetaAdsSchedulerService } from "./meta-ads-scheduler.service";
import { MetaAdsService } from "./meta-ads.service";
import { MetaAdsTokenService } from "./meta-ads-token.service";

@Module({
  imports: [AuthModule],
  controllers: [MetaAdsController],
  providers: [MetaAdsService, MetaAdsTokenService, MetaAdsApiService, MetaAdsSchedulerService],
})
export class MetaAdsModule {}
