import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UpdateGrowthHubActionDto } from "./dto/growth-hub-action.dto";
import {
  PublishGrowthHubReportDto,
  UpdateGrowthHubReportDto,
} from "./dto/growth-hub-report.dto";
import { UpdateGrowthHubWeeklyNoteDto } from "./dto/growth-hub-weekly-note.dto";
import { GrowthHubService } from "./growth-hub.service";

@Controller("growth-hub")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GrowthHubManagementController {
  constructor(private readonly growthHubService: GrowthHubService) {}

  @Patch("actions/:actionId")
  @RequirePermissions("growthHub.actions.manage.assigned")
  updateAssignedAction(
    @Param("actionId", ParseUUIDPipe) actionId: string,
    @Body() dto: UpdateGrowthHubActionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAssignedAction(actionId, dto, actor);
  }

  @Delete("actions/:actionId")
  @RequirePermissions("growthHub.actions.manage.assigned")
  deleteAssignedAction(
    @Param("actionId", ParseUUIDPipe) actionId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.deleteAssignedAction(actionId, actor);
  }

  @Patch("weekly-notes/:noteId")
  @RequirePermissions("growthHub.notes.manage.assigned")
  updateAssignedWeeklyNote(
    @Param("noteId", ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateGrowthHubWeeklyNoteDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAssignedWeeklyNote(noteId, dto, actor);
  }

  @Patch("reports/:reportId")
  @RequirePermissions("growthHub.reports.manage.assigned")
  updateAssignedReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAssignedReport(reportId, dto, actor);
  }

  @Post("reports/:reportId/publish")
  @RequirePermissions("growthHub.reports.manage.assigned")
  publishAssignedReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: PublishGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.publishAssignedReport(reportId, dto, actor);
  }
}
