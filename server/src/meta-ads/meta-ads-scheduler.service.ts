import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MetaAdsService } from "./meta-ads.service";

@Injectable()
export class MetaAdsSchedulerService {
  private readonly logger = new Logger(MetaAdsSchedulerService.name);

  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailySync(): Promise<void> {
    this.logger.log("Scheduled daily Meta Ads sync started.");

    try {
      const result = await this.metaAdsService.syncAllConnectedClientsForScheduler();
      this.logger.log(
        `Scheduled sync completed — attempted: ${result.attempted}, succeeded: ${result.succeeded}, failed: ${result.failed}`,
      );
    } catch (error) {
      this.logger.error("Scheduled Meta Ads sync encountered a fatal error.", error);
    }
  }
}
