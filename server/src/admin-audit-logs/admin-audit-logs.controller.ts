import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import {
  AdminAuditLogsService,
  AUDIT_LOGS_READ_PERMISSION,
} from "./admin-audit-logs.service";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(AUDIT_LOGS_READ_PERMISSION)
@Controller("admin/audit-logs")
export class AdminAuditLogsController {
  constructor(private readonly adminAuditLogsService: AdminAuditLogsService) {}

  @Get()
  getAuditLogs(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.adminAuditLogsService.getAuditLogs(currentUser, query);
  }

  @Get(":id")
  getAuditLogById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) auditLogId: string,
  ) {
    return this.adminAuditLogsService.getAuditLogById(currentUser, auditLogId);
  }
}
