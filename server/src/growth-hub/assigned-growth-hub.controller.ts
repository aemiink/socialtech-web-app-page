import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
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

  @Get(":clientId/activity")
  @RequirePermissions("growthHub.summary.read.assigned")
  getAssignedClientActivity(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAssignedClientActivity(clientId, actor);
  }
}
