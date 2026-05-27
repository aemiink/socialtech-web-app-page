import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { TikTokAdsService } from "./tiktok-ads.service";
import { ConnectManualTikTokAdsDto } from "./dto/connect-manual-tiktok-ads.dto";
import { CreateTikTokAdsReportDto } from "./dto/create-tiktok-ads-report.dto";
import { TestTikTokAdsConnectionDto } from "./dto/test-tiktok-ads-connection.dto";
import { TikTokAdsCampaignsQueryDto } from "./dto/tiktok-ads-campaigns-query.dto";
import { TikTokAdsDateRangeQueryDto } from "./dto/tiktok-ads-date-range-query.dto";
import { TikTokAdsInsightsQueryDto } from "./dto/tiktok-ads-insights-query.dto";
import { TikTokAdsReportsQueryDto } from "./dto/tiktok-ads-reports-query.dto";
import { TikTokAdsSyncLogsQueryDto } from "./dto/tiktok-ads-sync-logs-query.dto";
import { UpdateTikTokAdsReportDto } from "./dto/update-tiktok-ads-report.dto";
import { UpdateTikTokAdsConfigDto } from "./dto/update-tiktok-ads-config.dto";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TikTokAdsController {
  constructor(private readonly tikTokAdsService: TikTokAdsService) {}

  // ─── Admin endpoints ───────────────────────────────────────────────────────

  @Get("admin/tiktok-ads/clients")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminTikTokAdsClients(
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminTikTokAdsClients(query, actor);
  }

  @Get("admin/tiktok-ads/sync-logs")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminTikTokAdsSyncLogs(
    @Query() query: TikTokAdsSyncLogsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminSyncLogs(query, actor);
  }

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

  @Get("admin/clients/:clientId/tiktok-ads/summary")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientSummary(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/tiktok-ads/campaigns")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminClientCampaigns(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientCampaigns(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/tiktok-ads/insights")
  @RequirePermissions("tiktokAds.config.read.any")
  getAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientInsights(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/tiktok-ads/sync")
  @RequirePermissions("tiktokAds.config.manage.any")
  syncAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.syncAdminClientInsights(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/tiktok-ads/sync/retry")
  @RequirePermissions("tiktokAds.config.manage.any")
  retryAdminClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.retryAdminClientInsights(clientId, query, actor);
  }

  @Get("admin/clients/:clientId/tiktok-ads/reports")
  @RequirePermissions("reports.read")
  getAdminClientReports(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAdminClientReports(clientId, query, actor);
  }

  @Post("admin/clients/:clientId/tiktok-ads/reports")
  @RequirePermissions("reports.manage")
  createAdminClientReport(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateTikTokAdsReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.createAdminClientReport(clientId, dto, actor);
  }

  @Patch("admin/tiktok-ads/reports/:reportId")
  @RequirePermissions("reports.manage")
  updateAdminReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateTikTokAdsReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.updateAdminReport(reportId, dto, actor);
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

  @Get("tiktok-ads/clients/:clientId/summary")
  @RequirePermissions("tiktokAds.config.read.assigned")
  getAssignedClientSummary(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAssignedClientSummary(clientId, query, actor);
  }

  @Get("tiktok-ads/clients/:clientId/campaigns")
  @RequirePermissions("tiktokAds.config.read.assigned")
  getAssignedClientCampaigns(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAssignedClientCampaigns(clientId, query, actor);
  }

  @Get("tiktok-ads/clients/:clientId/insights")
  @RequirePermissions("tiktokAds.config.read.assigned")
  getAssignedClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAssignedClientInsights(clientId, query, actor);
  }

  @Post("tiktok-ads/clients/:clientId/sync")
  @RequirePermissions("tiktokAds.config.read.assigned", "tiktokAds.sync.read.assigned")
  syncAssignedClientInsights(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.syncAssignedClientInsights(clientId, query, actor);
  }

  @Get("tiktok-ads/clients/:clientId/reports")
  @RequirePermissions("tiktokAds.config.read.assigned", "tiktokAds.reporting.read.assigned")
  getAssignedClientReports(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: TikTokAdsReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getAssignedClientReports(clientId, query, actor);
  }

  @Post("tiktok-ads/clients/:clientId/reports")
  @RequirePermissions("tiktokAds.config.read.assigned", "tiktokAds.notes.manage.assigned")
  createAssignedClientReport(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateTikTokAdsReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.createAssignedClientReport(clientId, dto, actor);
  }

  @Patch("tiktok-ads/reports/:reportId")
  @RequirePermissions("tiktokAds.config.read.assigned", "tiktokAds.notes.manage.assigned")
  updateAssignedReport(
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateTikTokAdsReportDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.updateAssignedReport(reportId, dto, actor);
  }

  // ─── Own client endpoint ────────────────────────────────────────────────────

  @Get("clients/me/tiktok-ads/config")
  @RequirePermissions("tiktokAds.config.read.own")
  getOwnClientConfig(@CurrentUser() actor: AuthenticatedUser) {
    return this.tikTokAdsService.getOwnClientConfig(actor);
  }

  @Get("clients/me/tiktok-ads/summary")
  @RequirePermissions("tiktokAds.config.read.own")
  getOwnClientSummary(
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getOwnClientSummary(query, actor);
  }

  @Get("clients/me/tiktok-ads/campaigns")
  @RequirePermissions("tiktokAds.config.read.own")
  getOwnClientCampaigns(
    @Query() query: TikTokAdsCampaignsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getOwnClientCampaigns(query, actor);
  }

  @Get("clients/me/tiktok-ads/insights")
  @RequirePermissions("tiktokAds.config.read.own")
  getOwnClientInsights(
    @Query() query: TikTokAdsInsightsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getOwnClientInsights(query, actor);
  }

  @Post("clients/me/tiktok-ads/sync")
  @RequirePermissions("tiktokAds.config.read.own")
  syncOwnClientInsights(
    @Query() query: TikTokAdsDateRangeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.syncOwnClientInsights(query, actor);
  }

  @Get("clients/me/tiktok-ads/reports")
  @RequirePermissions("tiktokAds.config.read.own", "reports.read.own", "tiktokAds.reporting.read.own")
  getOwnClientReports(
    @Query() query: TikTokAdsReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.tikTokAdsService.getOwnClientReports(query, actor);
  }
}
