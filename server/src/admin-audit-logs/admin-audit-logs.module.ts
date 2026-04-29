import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminAuditLogsController } from "./admin-audit-logs.controller";
import { AdminAuditLogsService } from "./admin-audit-logs.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminAuditLogsController],
  providers: [AdminAuditLogsService],
})
export class AdminAuditLogsModule {}
