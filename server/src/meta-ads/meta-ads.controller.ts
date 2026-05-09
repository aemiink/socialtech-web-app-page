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
import { ConnectManualMetaAdsDto } from "./dto/connect-manual-meta-ads.dto";
import { CreateMetaAdsReportDto } from "./dto/create-meta-ads-report.dto";
import { MetaAdsCampaignsQueryDto } from "./dto/meta-ads-campaigns-query.dto";
import { MetaAdsDateRangeQueryDto } from "./dto/meta-ads-date-range-query.dto";
import { MetaAdsInsightsQueryDto } from "./dto/meta-ads-insights-query.dto";
import { MetaAdsReportsQueryDto } from "./dto/meta-ads-reports-query.dto";
import { MetaAdsSyncLogsQueryDto } from "./dto/meta-ads-sync-logs-query.dto";
import { TestMetaAdsConnectionDto } from "./dto/test-meta-ads-connection.dto";
import { UpdateMetaAdsReportDto } from "./dto/update-meta-ads-report.dto";
import { UpdateMetaAdsConfigDto } from "./dto/update-meta-ads-config.dto";
import { MetaAdsService } from "./meta-ads.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Get("admin/meta-ads/clients")
  @RequirePermissions("metaAds.config.read.any")
  getAdminMetaAdsClients(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.getAdminMetaAdsClients(currentUser, query);
  }

  @Get("admin/meta-ads/sync-logs")
  @RequirePermissions("metaAds.config.read.any")
  getAdminMetaAdsSyncLogs(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsSyncLogsQueryDto,
  ) {
    return this.metaAdsService.getAdminSyncLogs(currentUser, query);
  }

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

  @Get("admin/clients/:clientId/meta-ads/summary")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.getAdminClientSummary(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/meta-ads/campaigns")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAdminClientCampaigns(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/meta-ads/adsets")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsAdSets(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAdminClientAdSets(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/meta-ads/ads")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAdminClientAds(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/meta-ads/pixel-status")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsPixelStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAdminClientPixelStatus(currentUser, clientId);
  }

  @Get("admin/clients/:clientId/meta-ads/insights")
  @RequirePermissions("metaAds.config.read.any")
  getAdminClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsInsightsQueryDto,
  ) {
    return this.metaAdsService.getAdminClientInsights(currentUser, clientId, query);
  }

  @Post("admin/clients/:clientId/meta-ads/sync")
  @RequirePermissions("metaAds.config.manage.any")
  syncAdminClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.syncAdminClientInsights(currentUser, clientId, query);
  }

  @Post("admin/clients/:clientId/meta-ads/sync/retry")
  @RequirePermissions("metaAds.config.manage.any")
  retryAdminClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.retryAdminClientInsights(currentUser, clientId, query);
  }

  @Get("admin/clients/:clientId/meta-ads/reports")
  @RequirePermissions("reports.read")
  getAdminClientMetaAdsReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsReportsQueryDto,
  ) {
    return this.metaAdsService.getAdminClientReports(currentUser, clientId, query);
  }

  @Post("admin/clients/:clientId/meta-ads/reports")
  @RequirePermissions("reports.manage")
  createAdminClientMetaAdsReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateMetaAdsReportDto,
  ) {
    return this.metaAdsService.createAdminClientReport(currentUser, clientId, dto);
  }

  @Patch("admin/meta-ads/reports/:reportId")
  @RequirePermissions("reports.manage")
  updateAdminMetaAdsReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateMetaAdsReportDto,
  ) {
    return this.metaAdsService.updateAdminReport(currentUser, reportId, dto);
  }

  @Get("meta-ads/clients/:clientId/config")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAssignedClientConfig(currentUser, clientId);
  }

  @Get("meta-ads/clients/:clientId/summary")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientSummary(currentUser, clientId, query);
  }

  @Get("meta-ads/clients/:clientId/campaigns")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientCampaigns(currentUser, clientId, query);
  }

  @Get("meta-ads/clients/:clientId/adsets")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsAdSets(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientAdSets(currentUser, clientId, query);
  }

  @Get("meta-ads/clients/:clientId/ads")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientAds(currentUser, clientId, query);
  }

  @Get("meta-ads/clients/:clientId/pixel-status")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsPixelStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.metaAdsService.getAssignedClientPixelStatus(currentUser, clientId);
  }

  @Get("meta-ads/clients/:clientId/insights")
  @RequirePermissions("metaAds.config.read.assigned")
  getAssignedClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsInsightsQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientInsights(currentUser, clientId, query);
  }

  @Post("meta-ads/clients/:clientId/sync")
  @RequirePermissions("metaAds.config.read.assigned", "metaAds.sync.read.assigned")
  syncAssignedClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.syncAssignedClientInsights(currentUser, clientId, query);
  }

  @Get("meta-ads/clients/:clientId/reports")
  @RequirePermissions("metaAds.config.read.assigned", "metaAds.reporting.read.assigned")
  getAssignedClientMetaAdsReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: MetaAdsReportsQueryDto,
  ) {
    return this.metaAdsService.getAssignedClientReports(currentUser, clientId, query);
  }

  @Post("meta-ads/clients/:clientId/reports")
  @RequirePermissions("metaAds.config.read.assigned", "metaAds.notes.manage.assigned")
  createAssignedClientMetaAdsReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateMetaAdsReportDto,
  ) {
    return this.metaAdsService.createAssignedClientReport(currentUser, clientId, dto);
  }

  @Patch("meta-ads/reports/:reportId")
  @RequirePermissions("metaAds.config.read.assigned", "metaAds.notes.manage.assigned")
  updateAssignedMetaAdsReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateMetaAdsReportDto,
  ) {
    return this.metaAdsService.updateAssignedReport(currentUser, reportId, dto);
  }

  @Get("clients/me/meta-ads/config")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsConfig(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.metaAdsService.getOwnClientConfig(currentUser);
  }

  @Get("clients/me/meta-ads/summary")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.getOwnClientSummary(currentUser, query);
  }

  @Get("clients/me/meta-ads/campaigns")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsCampaigns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getOwnClientCampaigns(currentUser, query);
  }

  @Get("clients/me/meta-ads/adsets")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsAdSets(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getOwnClientAdSets(currentUser, query);
  }

  @Get("clients/me/meta-ads/ads")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsAds(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsCampaignsQueryDto,
  ) {
    return this.metaAdsService.getOwnClientAds(currentUser, query);
  }

  @Get("clients/me/meta-ads/pixel-status")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsPixelStatus(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.metaAdsService.getOwnClientPixelStatus(currentUser);
  }

  @Get("clients/me/meta-ads/insights")
  @RequirePermissions("metaAds.config.read.own")
  getOwnClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsInsightsQueryDto,
  ) {
    return this.metaAdsService.getOwnClientInsights(currentUser, query);
  }

  @Post("clients/me/meta-ads/sync")
  @RequirePermissions("metaAds.config.read.own")
  syncOwnClientMetaAdsInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsDateRangeQueryDto,
  ) {
    return this.metaAdsService.syncOwnClientInsights(currentUser, query);
  }

  @Get("clients/me/meta-ads/reports")
  @RequirePermissions("metaAds.config.read.own", "reports.read.own")
  getOwnClientMetaAdsReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: MetaAdsReportsQueryDto,
  ) {
    return this.metaAdsService.getOwnClientReports(currentUser, query);
  }
}
