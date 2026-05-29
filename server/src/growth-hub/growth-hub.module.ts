import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminGrowthHubController } from "./admin-growth-hub.controller";
import { AssignedGrowthHubController } from "./assigned-growth-hub.controller";
import { ClientGrowthHubController } from "./client-growth-hub.controller";
import { GrowthHubService } from "./growth-hub.service";
import { GrowthHubSummaryService } from "./growth-hub-summary.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminGrowthHubController,
    AssignedGrowthHubController,
    ClientGrowthHubController,
  ],
  providers: [GrowthHubService, GrowthHubSummaryService],
})
export class GrowthHubModule {}
