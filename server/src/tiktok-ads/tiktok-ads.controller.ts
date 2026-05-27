import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { TikTokAdsService } from "./tiktok-ads.service";
import { ConnectManualTikTokAdsDto } from "./dto/connect-manual-tiktok-ads.dto";
import { TestTikTokAdsConnectionDto } from "./dto/test-tiktok-ads-connection.dto";
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

  @Get("admin/clients/:clientId/tiktok-ads/connection")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminClientConnection(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientConnection(clientId, actor);
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

  @Post("admin/clients/:clientId/tiktok-ads/connect")
  @RequirePermissions("tiktokAds.config.manage.any")
  connectAdminClientManual(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: ConnectManualTikTokAdsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.connectAdminClientManual(clientId, dto, actor);
  }

  @Post("admin/clients/:clientId/tiktok-ads/test")
  @RequirePermissions("tiktokAds.config.manage.any")
  testAdminClientConnection(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: TestTikTokAdsConnectionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.testAdminClientConnection(clientId, dto, actor);
  }

  @Delete("admin/clients/:clientId/tiktok-ads/disconnect")
  @RequirePermissions("tiktokAds.config.manage.any")
  disconnectAdminClient(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.disconnectAdminClient(clientId, actor);
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
  @RequirePermissions("tiktokAds.config.read.own")
  getOwnClientConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.tikTokAdsService.getOwnClientConfig(actor);
  }
}
