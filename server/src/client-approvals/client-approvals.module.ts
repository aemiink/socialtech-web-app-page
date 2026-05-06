import { Module } from "@nestjs/common";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { AuthModule } from "../auth/auth.module";
import { WebAppWorkspaceModule } from "../web-app-workspace/web-app-workspace.module";
import { ClientApprovalsController } from "./client-approvals.controller";
import { ClientApprovalsService } from "./client-approvals.service";
import { ClientPortalApprovalsController } from "./client-portal-approvals.controller";

@Module({
  imports: [AuthModule, AuditLogModule, WebAppWorkspaceModule],
  controllers: [ClientApprovalsController, ClientPortalApprovalsController],
  providers: [ClientApprovalsService],
})
export class ClientApprovalsModule {}
