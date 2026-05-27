import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AmazonAdsService } from "./amazon-ads.service";
import { UpdateAmazonAdsConfigDto } from "./dto/update-amazon-ads-config.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AmazonAdsController {
  constructor(private readonly amazonAdsService: AmazonAdsService) {}

  @Get("admin/clients/:clientId/amazon-ads/config")
  @RequirePermissions("amazonAds.config.read.any")
  getAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientConfig(clientId, actor);
  }

  @Get("admin/clients/:clientId/amazon-ads/connection")
  @RequirePermissions("amazonAds.config.read.any")
  getAdminClientConnection(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientConnection(clientId, actor);
  }

  @Patch("admin/clients/:clientId/amazon-ads/config")
  @RequirePermissions("amazonAds.config.manage.any")
  updateAdminClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateAmazonAdsConfigDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.updateAdminClientConfig(clientId, dto, actor);
  }

  @Get("amazon-ads/clients/:clientId/config")
  @RequirePermissions("amazonAds.config.read.assigned")
  getAssignedClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientConfig(clientId, actor);
  }

  @Get("clients/me/amazon-ads/config")
  @RequirePermissions("amazonAds.config.read.own")
  getOwnClientConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.amazonAdsService.getOwnClientConfig(actor);
  }
}
