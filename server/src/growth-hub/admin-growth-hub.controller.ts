import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import {
  CreateGrowthHubActionDto,
  UpdateGrowthHubActionDto,
} from "./dto/growth-hub-action.dto";
import {
  CreateGrowthHubWeeklyNoteDto,
  UpdateGrowthHubWeeklyNoteDto,
} from "./dto/growth-hub-weekly-note.dto";
import {
  CreateGrowthHubReportDto,
  GrowthHubReportsQueryDto,
  PublishGrowthHubReportDto,
  UpdateGrowthHubReportDto,
} from "./dto/growth-hub-report.dto";
import { UpdateGrowthHubConfigDto } from "./dto/update-growth-hub-config.dto";
import { GrowthHubService } from "./growth-hub.service";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminGrowthHubController {
  constructor(private readonly growthHubService: GrowthHubService) {}

  @Get("admin/growth-hub/clients")
  @RequirePermissions("growthHub.summary.read.any")
  getAdminClients(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getAdminClients(actor);
  }

  @Get("admin/clients/:clientId/growth-hub/config")
  @RequirePermissions("growthHub.config.read.any")
  getAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientConfig(clientId, actor);
  }

  @Patch("admin/clients/:clientId/growth-hub/config")
  @RequirePermissions("growthHub.config.manage.any")
  updateAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateGrowthHubConfigDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAdminClientConfig(clientId, dto, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/summary")
  @RequirePermissions("growthHub.summary.read.any")
  getAdminClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientSummary(clientId, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/channels")
  @RequirePermissions("growthHub.summary.read.any")
  getAdminClientChannels(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientChannels(clientId, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/actions")
  @RequirePermissions("growthHub.actions.read.any")
  getAdminClientActions(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientActions(clientId, actor);
  }

  @Post("admin/clients/:clientId/growth-hub/actions")
  @RequirePermissions("growthHub.actions.manage.any")
  createAdminClientAction(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubActionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAdminClientAction(clientId, dto, actor);
  }

  @Patch("admin/growth-hub/actions/:actionId")
  @RequirePermissions("growthHub.actions.manage.any")
  updateAdminAction(
    @Param("actionId", ParseUUIDPipe) actionId: string,
    @Body() dto: UpdateGrowthHubActionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAdminAction(actionId, dto, actor);
  }

  @Delete("admin/growth-hub/actions/:actionId")
  @RequirePermissions("growthHub.actions.manage.any")
  deleteAdminAction(
    @Param("actionId", ParseUUIDPipe) actionId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.deleteAdminAction(actionId, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/weekly-notes")
  @RequirePermissions("growthHub.notes.read.any")
  getAdminClientWeeklyNotes(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientWeeklyNotes(clientId, actor);
  }

  @Post("admin/clients/:clientId/growth-hub/weekly-notes")
  @RequirePermissions("growthHub.notes.manage.any")
  createAdminClientWeeklyNote(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubWeeklyNoteDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAdminClientWeeklyNote(clientId, dto, actor);
  }

  @Patch("admin/growth-hub/weekly-notes/:noteId")
  @RequirePermissions("growthHub.notes.manage.any")
  updateAdminWeeklyNote(
    @Param("noteId", ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateGrowthHubWeeklyNoteDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAdminWeeklyNote(noteId, dto, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/reports")
  @RequirePermissions("growthHub.reports.read.any")
  getAdminClientReports(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GrowthHubReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientReports(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/growth-hub/reports")
  @RequirePermissions("growthHub.reports.manage.any")
  createAdminClientReport(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAdminClientReport(clientId, dto, actor);
  }

  @Patch("admin/growth-hub/reports/:reportId")
  @RequirePermissions("growthHub.reports.manage.any")
  updateAdminReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.updateAdminReport(reportId, dto, actor);
  }

  @Post("admin/growth-hub/reports/:reportId/publish")
  @RequirePermissions("growthHub.reports.manage.any")
  publishAdminReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: PublishGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.publishAdminReport(reportId, dto, actor);
  }

  @Get("admin/clients/:clientId/growth-hub/activity")
  @RequirePermissions("growthHub.summary.read.any")
  getAdminClientActivity(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientActivity(clientId, actor);
  }
}
