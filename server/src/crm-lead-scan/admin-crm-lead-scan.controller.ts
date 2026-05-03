import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { RunCrmLeadScanDto } from "./dto/run-crm-lead-scan.dto";
import { CrmLeadScanService } from "./crm-lead-scan.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/crm/lead-scan")
export class AdminCrmLeadScanController {
  constructor(private readonly crmLeadScanService: CrmLeadScanService) {}

  @Post("run")
  @RequirePermissions("crm.leadScan.run")
  run(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: RunCrmLeadScanDto,
    @Req() request: Request,
  ) {
    return this.crmLeadScanService.runLeadScan(
      currentUser,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Get("logs")
  @RequirePermissions("crm.leadScan.read")
  listLogs(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.crmLeadScanService.listLogs(currentUser);
  }

  @Get("logs/:id")
  @RequirePermissions("crm.leadScan.read")
  detail(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) logId: string,
  ) {
    return this.crmLeadScanService.getLogDetail(currentUser, logId);
  }

  private toAuditRequestContext(request: Request): AuditLogRequestContext {
    return {
      ipAddress: request.ip ?? null,
      userAgent: request.get("user-agent") ?? null,
    };
  }
}
