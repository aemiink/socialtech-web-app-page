import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import {
  ADMIN_SUMMARY_READ_PERMISSION,
  AdminSummaryService,
} from "./admin-summary.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(ADMIN_SUMMARY_READ_PERMISSION)
@Controller("admin/summary")
export class AdminSummaryController {
  constructor(private readonly adminSummaryService: AdminSummaryService) {}

  @Get()
  getAdminSummary(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.adminSummaryService.getAdminSummary(currentUser);
  }
}
