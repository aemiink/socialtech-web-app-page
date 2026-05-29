import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { GrowthHubService } from "./growth-hub.service";

@Controller("clients/me/growth-hub")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientGrowthHubController {
  constructor(private readonly growthHubService: GrowthHubService) {}

  @Get("config")
  @RequirePermissions("growthHub.config.read.own")
  getOwnConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getOwnConfig(actor);
  }

  @Get("summary")
  @RequirePermissions("growthHub.summary.read.own")
  getOwnSummary(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getOwnSummary(actor);
  }

  @Get("channels")
  @RequirePermissions("growthHub.summary.read.own")
  getOwnChannels(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getOwnChannels(actor);
  }

  @Get("actions")
  @RequirePermissions("growthHub.actions.read.own")
  getOwnActions(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getOwnActions(actor);
  }

  @Get("activity")
  @RequirePermissions("growthHub.summary.read.own")
  getOwnActivity(@CurrentUser() actor: AuthenticatedUser) {
    return this.growthHubService.getOwnActivity(actor);
  }
}
