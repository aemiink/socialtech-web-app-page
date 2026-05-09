import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";
import { MetaAdsService } from "./meta-ads.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Get("admin/clients/:clientId/meta-ads/config")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAdminClientConfig(currentUser, clientId);
  }

  @Patch("admin/clients/:clientId/meta-ads/config")
  @RequirePermissions("metaAds.config.manage.any")
  updateAdminClientMetaAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateMetaAdsConfigDto,
  ) {
    return this.metaAdsService.updateAdminClientConfig(currentUser, clientId, dto);
  }

  @Get("meta-ads/clients/:clientId/config")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAssignedClientConfig(currentUser, clientId);
  }

  @Get("clients/me/meta-ads/config")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsConfig(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.metaAdsService.getOwnClientConfig(currentUser);
  }
}
