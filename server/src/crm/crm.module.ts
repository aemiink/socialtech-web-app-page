import { Module } from "@nestjs/common";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AuthModule } from "../auth/auth.module";
import { AdminCrmLeadsController } from "./admin-crm-leads.controller";
import { CrmLeadsService } from "./crm-leads.service";
import { EmployeeCrmLeadsController } from "./employee-crm-leads.controller";
import { PublicCrmLeadsController } from "./public-crm-leads.controller";

@Module({
  imports: [AuthModule, AuditLogModule],
  controllers: [AdminCrmLeadsController, EmployeeCrmLeadsController, PublicCrmLeadsController],
  providers: [CrmLeadsService],
})
export class CrmModule {}
