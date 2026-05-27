import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { TikTokAdsService } from "./tiktok-ads.service";
import { UpdateTikTokAdsConfigDto } from "./dto/update-tiktok-ads-config.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TikTokAdsController {
  constructor(private readonly tikTokAdsService: TikTokAdsService) {}

  // ─── Admin endpoints ───────────────────────────────────────────────────────

  @Get("admin/clients/:clientId/tiktok-ads/config")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientConfig(clientId, actor);
  }

  @Patch("admin/clients/:clientId/tiktok-ads/config")
  @RequirePermissions("tiktokAds.config.manage.any")
  updateAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateTikTokAdsConfigDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.updateAdminClientConfig(clientId, dto, actor);
  }

  // ─── Assigned employee endpoints ───────────────────────────────────────────

  @Get("tiktok-ads/clients/:clientId/config")
  @RequirePermissions("tiktokAds.config.read.assigned")
  getAssignedClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAssignedClientConfig(clientId, actor);
  }

  // ─── Own client endpoint ────────────────────────────────────────────────────

  @Get("clients/me/tiktok-ads/config")
  getOwnClientConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.tikTokAdsService.getOwnClientConfig(actor);
  }
}
