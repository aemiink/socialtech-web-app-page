import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
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
  @RequirePermissions("growthHub.summary.read.any")
  getAdminClientActions(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.growthHubService.getAdminClientActions(clientId, actor);
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
