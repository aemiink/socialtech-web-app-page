import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AmazonAdsController } from "./amazon-ads.controller";
import { AmazonAdsService } from "./amazon-ads.service";

@Module({
  imports: [AuthModule],
  controllers: [AmazonAdsController],
  providers: [AmazonAdsService],
  exports: [AmazonAdsService],
})
export class AmazonAdsModule {}
