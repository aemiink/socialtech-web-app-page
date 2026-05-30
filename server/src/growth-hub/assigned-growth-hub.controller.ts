import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateGrowthHubActionDto } from "./dto/growth-hub-action.dto";
import {
  CreateGrowthHubReportDto,
  GrowthHubReportsQueryDto,
} from "./dto/growth-hub-report.dto";
import { GrowthHubRecommendationsQueryDto } from "./dto/growth-hub-recommendation.dto";
import { CreateGrowthHubWeeklyNoteDto } from "./dto/growth-hub-weekly-note.dto";
import { GrowthHubService } from "./growth-hub.service";

@Controller("growth-hub/clients")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssignedGrowthHubController {
  constructor(private readonly growthHubService: GrowthHubService) {}

  @Get()
  @RequirePermissions("growthHub.summary.read.assigned")
  getAssignedClients(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getAssignedClients(actor);
  }

  @Get(":clientId/config")
  @RequirePermissions("growthHub.config.read.assigned")
  getAssignedClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientConfig(clientId, actor);
  }

  @Get(":clientId/summary")
  @RequirePermissions("growthHub.summary.read.assigned")
  getAssignedClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientSummary(clientId, actor);
  }

  @Get(":clientId/channels")
  @RequirePermissions("growthHub.summary.read.assigned")
  getAssignedClientChannels(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientChannels(clientId, actor);
  }

  @Get(":clientId/actions")
  @RequirePermissions("growthHub.actions.read.assigned")
  getAssignedClientActions(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientActions(clientId, actor);
  }

  @Post(":clientId/actions")
  @RequirePermissions("growthHub.actions.manage.assigned")
  createAssignedClientAction(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubActionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAssignedClientAction(clientId, dto, actor);
  }

  @Get(":clientId/weekly-notes")
  @RequirePermissions("growthHub.notes.read.assigned")
  getAssignedClientWeeklyNotes(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientWeeklyNotes(clientId, actor);
  }

  @Post(":clientId/weekly-notes")
  @RequirePermissions("growthHub.notes.manage.assigned")
  createAssignedClientWeeklyNote(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubWeeklyNoteDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAssignedClientWeeklyNote(clientId, dto, actor);
  }

  @Get(":clientId/reports")
  @RequirePermissions("growthHub.reports.read.assigned")
  getAssignedClientReports(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GrowthHubReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientReports(clientId, query, actor);
  }

  @Post(":clientId/reports")
  @RequirePermissions("growthHub.reports.manage.assigned")
  createAssignedClientReport(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateGrowthHubReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.createAssignedClientReport(clientId, dto, actor);
  }

  @Get(":clientId/recommendations")
  @RequirePermissions("growthHub.recommendations.read.assigned")
  getAssignedClientRecommendations(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GrowthHubRecommendationsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientRecommendations(clientId, query, actor);
  }

  @Post(":clientId/recommendations/generate")
  @RequirePermissions("growthHub.recommendations.manage.assigned")
  generateAssignedClientRecommendations(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.generateAssignedClientRecommendations(clientId, actor);
  }

  @Get(":clientId/activity")
  @RequirePermissions("growthHub.summary.read.assigned")
  getAssignedClientActivity(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientActivity(clientId, actor);
  }
}
