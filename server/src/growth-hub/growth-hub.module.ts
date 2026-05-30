import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminGrowthHubController } from "./admin-growth-hub.controller";
import { AssignedGrowthHubController } from "./assigned-growth-hub.controller";
import { ClientGrowthHubController } from "./client-growth-hub.controller";
import { GrowthHubChannelAggregationService } from "./growth-hub-channel-aggregation.service";
import { GrowthHubManagementController } from "./growth-hub-management.controller";
import { GrowthHubService } from "./growth-hub.service";
import { GrowthHubSummaryService } from "./growth-hub-summary.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminGrowthHubController,
    AssignedGrowthHubController,
    ClientGrowthHubController,
    GrowthHubManagementController,
  ],
  providers: [GrowthHubService, GrowthHubSummaryService, GrowthHubChannelAggregationService],
})
export class GrowthHubModule {}
