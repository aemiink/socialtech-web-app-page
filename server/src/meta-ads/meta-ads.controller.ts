import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ConnectManualMetaAdsDto } from "./dto/connect-manual-meta-ads.dto";
import { TestMetaAdsConnectionDto } from "./dto/test-meta-ads-connection.dto";
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

  @Get("admin/clients/:clientId/meta-ads/connection")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsConnection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAdminClientConnection(currentUser, clientId);
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

  @Post("admin/clients/:clientId/meta-ads/connect/manual")
  @RequirePermissions("metaAds.config.manage.any")
  connectAdminClientMetaAdsManual(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: ConnectManualMetaAdsDto,
  ) {
    return this.metaAdsService.connectAdminClientManual(currentUser, clientId, dto);
  }

  @Post("admin/clients/:clientId/meta-ads/disconnect")
  @RequirePermissions("metaAds.config.manage.any")
  disconnectAdminClientMetaAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.disconnectAdminClient(currentUser, clientId);
  }

  @Post("admin/clients/:clientId/meta-ads/test-connection")
  @RequirePermissions("metaAds.config.manage.any")
  testAdminClientMetaAdsConnection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: TestMetaAdsConnectionDto,
  ) {
    return this.metaAdsService.testAdminClientConnection(currentUser, clientId, dto);
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
