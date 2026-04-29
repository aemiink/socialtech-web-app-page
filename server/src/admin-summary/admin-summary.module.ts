import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminSummaryController } from "./admin-summary.controller";
import { AdminSummaryService } from "./admin-summary.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminSummaryController],
  providers: [AdminSummaryService],
})
export class AdminSummaryModule {}
