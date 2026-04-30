import { Module } from "@nestjs/common";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AuthModule } from "../auth/auth.module";
import { AdminClientsController } from "./admin-clients.controller";
import { AdminClientsService } from "./admin-clients.service";

@Module({
  imports: [AuthModule, AuditLogModule],
  controllers: [AdminClientsController],
  providers: [AdminClientsService],
})
export class AdminClientsModule {}
