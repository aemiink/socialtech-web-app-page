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
import { ConnectManualGoogleAdsDto } from "./dto/connect-manual-google-ads.dto";
import { GoogleAdsCampaignsQueryDto } from "./dto/google-ads-campaigns-query.dto";
import { GoogleAdsDateRangeQueryDto } from "./dto/google-ads-date-range-query.dto";
import { GoogleAdsInsightsQueryDto } from "./dto/google-ads-insights-query.dto";
import { GoogleAdsSyncLogsQueryDto } from "./dto/google-ads-sync-logs-query.dto";
import { TestGoogleAdsConnectionDto } from "./dto/test-google-ads-connection.dto";
import { UpdateGoogleAdsConfigDto } from "./dto/update-google-ads-config.dto";
import { GoogleAdsService } from "./google-ads.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class GoogleAdsController {
  constructor(private readonly googleAdsService: GoogleAdsService) {}

  @Get("admin/google-ads/clients")
  @RequirePermissions("googleAds.config.read.any", "googleAds.reporting.read.any")
  getAdminGoogleAdsClients(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.getAdminGoogleAdsClients(currentUser, query);
  }

  @Get("admin/google-ads/sync-logs")
  @RequirePermissions("googleAds.config.read.any")
  getAdminGoogleAdsSyncLogs(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsSyncLogsQueryDto,
  ) {
    return this.googleAdsService.getAdminSyncLogs(currentUser, query);
  }

  @Get("admin/clients/:clientId/google-ads/config")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.googleAdsService.getAdminClientConfig(currentUser, clientId);
  }

  @Get("admin/clients/:clientId/google-ads/connection")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsConnection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.googleAdsService.getAdminClientConnection(currentUser, clientId);
  }

  @Patch("admin/clients/:clientId/google-ads/config")
  @RequirePermissions("googleAds.config.manage.any")
  updateAdminClientGoogleAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateGoogleAdsConfigDto,
  ) {
    return this.googleAdsService.updateAdminClientConfig(currentUser, clientId, dto);
  }

  @Post("admin/clients/:clientId/google-ads/connect/manual")
  @RequirePermissions("googleAds.config.manage.any")
  connectAdminClientGoogleAdsManual(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: ConnectManualGoogleAdsDto,
  ) {
    return this.googleAdsService.connectAdminClientManual(currentUser, clientId, dto);
  }

  @Post("admin/clients/:clientId/google-ads/disconnect")
  @RequirePermissions("googleAds.config.manage.any")
  disconnectAdminClientGoogleAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.googleAdsService.disconnectAdminClient(currentUser, clientId);
  }

  @Post("admin/clients/:clientId/google-ads/test-connection")
  @RequirePermissions("googleAds.config.manage.any")
  testAdminClientGoogleAdsConnection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: TestGoogleAdsConnectionDto,
  ) {
    return this.googleAdsService.testAdminClientConnection(currentUser, clientId, dto);
  }

  @Get("admin/clients/:clientId/google-ads/summary")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.getAdminClientSummary(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/google-ads/campaigns")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAdminClientCampaigns(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/google-ads/ad-groups")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsAdGroups(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAdminClientAdGroups(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/google-ads/ads")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAdminClientAds(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/google-ads/insights")
  @RequirePermissions("googleAds.config.read.any")
  getAdminClientGoogleAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsInsightsQueryDto,
  ) {
    return this.googleAdsService.getAdminClientInsights(currentUser, clientId, query);
  }

  @Post("admin/clients/:clientId/google-ads/sync")
  @RequirePermissions("googleAds.sync.run.any")
  syncAdminClientGoogleAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.syncAdminClientInsights(currentUser, clientId, query);
  }

  @Post("admin/clients/:clientId/google-ads/sync/retry")
  @RequirePermissions("googleAds.sync.run.any")
  retryAdminClientGoogleAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.retryAdminClientInsights(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/config")
  @RequirePermissions("googleAds.config.read.assigned")
  getAssignedClientGoogleAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.googleAdsService.getAssignedClientConfig(currentUser, clientId);
  }

  @Get("google-ads/clients/:clientId/summary")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientSummary(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/campaigns")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientCampaigns(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/ad-groups")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsAdGroups(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientAdGroups(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/ads")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientAds(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/keywords")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsKeywords(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientKeywords(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/conversions")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsConversions(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientConversions(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/search-terms")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsSearchTerms(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientSearchTerms(currentUser, clientId, query);
  }

  @Get("google-ads/clients/:clientId/insights")
  @RequirePermissions("googleAds.reporting.read.assigned")
  getAssignedClientGoogleAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsInsightsQueryDto,
  ) {
    return this.googleAdsService.getAssignedClientInsights(currentUser, clientId, query);
  }

  @Post("google-ads/clients/:clientId/sync")
  @RequirePermissions("googleAds.sync.read.assigned")
  syncAssignedClientGoogleAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.syncAssignedClientInsights(currentUser, clientId, query);
  }

  @Get("clients/me/google-ads/config")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsConfig(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.googleAdsService.getOwnClientConfig(currentUser);
  }

  @Get("clients/me/google-ads/summary")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.getOwnClientSummary(currentUser, query);
  }

  @Get("clients/me/google-ads/campaigns")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientCampaigns(currentUser, query);
  }

  @Get("clients/me/google-ads/ad-groups")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsAdGroups(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientAdGroups(currentUser, query);
  }

  @Get("clients/me/google-ads/ads")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientAds(currentUser, query);
  }

  @Get("clients/me/google-ads/keywords")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsKeywords(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientKeywords(currentUser, query);
  }

  @Get("clients/me/google-ads/conversions")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsConversions(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientConversions(currentUser, query);
  }

  @Get("clients/me/google-ads/search-terms")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsSearchTerms(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsCampaignsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientSearchTerms(currentUser, query);
  }

  @Get("clients/me/google-ads/insights")
  @RequirePermissions("googleAds.config.read.own")
  getOwnClientGoogleAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsInsightsQueryDto,
  ) {
    return this.googleAdsService.getOwnClientInsights(currentUser, query);
  }

  @Post("clients/me/google-ads/sync")
  @RequirePermissions("googleAds.config.read.own")
  syncOwnClientGoogleAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: GoogleAdsDateRangeQueryDto,
  ) {
    return this.googleAdsService.syncOwnClientInsights(currentUser, query);
  }
}
