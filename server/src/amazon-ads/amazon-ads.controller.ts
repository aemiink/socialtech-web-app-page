import {
  Body,
  Controller,
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
import { AmazonAdsService } from "./amazon-ads.service";
import { AmazonAdsOAuthStartQueryDto } from "./dto/amazon-ads-oauth-start-query.dto";
import { ConnectManualAmazonAdsDto } from "./dto/connect-manual-amazon-ads.dto";
import { ExchangeAmazonAdsOAuthCodeDto } from "./dto/exchange-amazon-ads-oauth-code.dto";
import { TestAmazonAdsConnectionDto } from "./dto/test-amazon-ads-connection.dto";
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

  @Get("admin/clients/:clientId/amazon-ads/oauth/start")
  @RequirePermissions("amazonAds.config.manage.any")
  getAdminClientOAuthStartUrl(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsOAuthStartQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.createAdminClientOAuthStartUrl(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/oauth/exchange")
  @RequirePermissions("amazonAds.config.manage.any")
  exchangeAdminClientOAuthCode(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: ExchangeAmazonAdsOAuthCodeDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.exchangeAdminClientOAuthCode(clientId, dto, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/connect/manual")
  @RequirePermissions("amazonAds.config.manage.any")
  connectAdminClientManual(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: ConnectManualAmazonAdsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.connectAdminClientManual(clientId, dto, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/test-connection")
  @RequirePermissions("amazonAds.config.manage.any")
  testAdminClientConnection(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: TestAmazonAdsConnectionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.testAdminClientConnection(clientId, dto, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/disconnect")
  @RequirePermissions("amazonAds.config.manage.any")
  disconnectAdminClient(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.disconnectAdminClient(clientId, actor);
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
