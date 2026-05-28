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
import { AmazonAdsCampaignsQueryDto } from "./dto/amazon-ads-campaigns-query.dto";
import { AmazonAdsDateRangeQueryDto } from "./dto/amazon-ads-date-range-query.dto";
import { AmazonAdsInsightsQueryDto } from "./dto/amazon-ads-insights-query.dto";
import { AmazonAdsOAuthStartQueryDto } from "./dto/amazon-ads-oauth-start-query.dto";
import { AmazonAdsProductsQueryDto } from "./dto/amazon-ads-products-query.dto";
import { AmazonAdsSyncLogsQueryDto } from "./dto/amazon-ads-sync-logs-query.dto";
import { ConnectManualAmazonAdsDto } from "./dto/connect-manual-amazon-ads.dto";
import { ExchangeAmazonAdsOAuthCodeDto } from "./dto/exchange-amazon-ads-oauth-code.dto";
import { TestAmazonAdsConnectionDto } from "./dto/test-amazon-ads-connection.dto";
import { UpdateAmazonAdsConfigDto } from "./dto/update-amazon-ads-config.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AmazonAdsController {
  constructor(private readonly amazonAdsService: AmazonAdsService) {}

  @Get("admin/amazon-ads/clients")
  @RequirePermissions("amazonAds.config.read.any")
  getAdminAmazonAdsClients(
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminAmazonAdsClients(query, actor);
  }

  @Get("admin/amazon-ads/sync-logs")
  @RequirePermissions("amazonAds.config.read.any")
  getAdminAmazonAdsSyncLogs(
    @Query() query: AmazonAdsSyncLogsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminSyncLogs(query, actor);
  }

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

  @Get("admin/clients/:clientId/amazon-ads/summary")
  @RequirePermissions("amazonAds.config.read.any", "amazonAds.reporting.read.any")
  getAdminClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientSummary(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/amazon-ads/campaigns")
  @RequirePermissions("amazonAds.config.read.any", "amazonAds.reporting.read.any")
  getAdminClientCampaigns(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientCampaigns(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/amazon-ads/products")
  @RequirePermissions("amazonAds.config.read.any", "amazonAds.reporting.read.any")
  getAdminClientProducts(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsProductsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientProducts(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/amazon-ads/insights")
  @RequirePermissions("amazonAds.config.read.any", "amazonAds.reporting.read.any")
  getAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAdminClientInsights(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/sync")
  @RequirePermissions("amazonAds.config.manage.any", "amazonAds.sync.run.any")
  syncAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.syncAdminClientInsights(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/amazon-ads/sync/retry")
  @RequirePermissions("amazonAds.config.manage.any", "amazonAds.sync.run.any")
  retryAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.retryAdminClientInsights(clientId, query, actor);
  }

  @Get("amazon-ads/clients/:clientId/config")
  @RequirePermissions("amazonAds.config.read.assigned")
  getAssignedClientConfig(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientConfig(clientId, actor);
  }

  @Get("amazon-ads/clients/:clientId/summary")
  @RequirePermissions("amazonAds.config.read.assigned", "amazonAds.reporting.read.assigned")
  getAssignedClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientSummary(clientId, query, actor);
  }

  @Get("amazon-ads/clients/:clientId/campaigns")
  @RequirePermissions("amazonAds.config.read.assigned", "amazonAds.reporting.read.assigned")
  getAssignedClientCampaigns(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientCampaigns(clientId, query, actor);
  }

  @Get("amazon-ads/clients/:clientId/products")
  @RequirePermissions("amazonAds.config.read.assigned", "amazonAds.reporting.read.assigned")
  getAssignedClientProducts(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsProductsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientProducts(clientId, query, actor);
  }

  @Get("amazon-ads/clients/:clientId/insights")
  @RequirePermissions("amazonAds.config.read.assigned", "amazonAds.reporting.read.assigned")
  getAssignedClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getAssignedClientInsights(clientId, query, actor);
  }

  @Post("amazon-ads/clients/:clientId/sync")
  @RequirePermissions("amazonAds.config.read.assigned", "amazonAds.sync.read.assigned")
  syncAssignedClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.syncAssignedClientInsights(clientId, query, actor);
  }

  @Get("clients/me/amazon-ads/config")
  @RequirePermissions("amazonAds.config.read.own")
  getOwnClientConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.amazonAdsService.getOwnClientConfig(actor);
  }

  @Get("clients/me/amazon-ads/summary")
  @RequirePermissions("amazonAds.config.read.own", "amazonAds.reporting.read.own")
  getOwnClientSummary(
    @Query() query: AmazonAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getOwnClientSummary(query, actor);
  }

  @Get("clients/me/amazon-ads/campaigns")
  @RequirePermissions("amazonAds.config.read.own", "amazonAds.reporting.read.own")
  getOwnClientCampaigns(
    @Query() query: AmazonAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getOwnClientCampaigns(query, actor);
  }

  @Get("clients/me/amazon-ads/products")
  @RequirePermissions("amazonAds.config.read.own", "amazonAds.reporting.read.own")
  getOwnClientProducts(
    @Query() query: AmazonAdsProductsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getOwnClientProducts(query, actor);
  }

  @Get("clients/me/amazon-ads/insights")
  @RequirePermissions("amazonAds.config.read.own", "amazonAds.reporting.read.own")
  getOwnClientInsights(
    @Query() query: AmazonAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.amazonAdsService.getOwnClientInsights(query, actor);
  }
}
