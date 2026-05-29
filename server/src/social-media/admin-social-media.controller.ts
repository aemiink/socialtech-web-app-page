import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateSocialMediaReportDto } from "./dto/create-social-media-report.dto";
import { CreateSocialMediaPostDto } from "./dto/create-social-media-post.dto";
import { SocialMediaInsightsQueryDto } from "./dto/social-media-insights-query.dto";
import { SocialMediaPostQueryDto } from "./dto/social-media-post-query.dto";
import { SocialMediaReportsQueryDto } from "./dto/social-media-reports-query.dto";
import { UpdateSocialMediaConfigDto } from "./dto/update-social-media-config.dto";
import { SocialMediaService } from "./social-media.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("social-media/clients")
export class AdminSocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get()
  getAdminClients(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.socialMediaService.getAdminClients(currentUser);
  }

  @Get(":clientId/config")
  getClientConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.socialMediaService.getClientConfig(currentUser, clientId);
  }

  @Patch(":clientId/config")
  updateClientConfig(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: UpdateSocialMediaConfigDto,
  ) {
    return this.socialMediaService.updateClientConfig(currentUser, clientId, dto);
  }

  @Get(":clientId/summary")
  getClientSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
  ) {
    return this.socialMediaService.getClientSummary(currentUser, clientId);
  }

  @Get(":clientId/posts")
  getClientPosts(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: SocialMediaPostQueryDto,
  ) {
    return this.socialMediaService.getClientPosts(currentUser, clientId, query);
  }

  @Post(":clientId/posts")
  createClientPost(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateSocialMediaPostDto,
  ) {
    return this.socialMediaService.createClientPost(currentUser, clientId, dto);
  }

  @Get(":clientId/insights")
  getClientInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: SocialMediaInsightsQueryDto,
  ) {
    return this.socialMediaService.getClientInsights(currentUser, clientId, query);
  }

  @Get(":clientId/reports")
  getClientReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: SocialMediaReportsQueryDto,
  ) {
    return this.socialMediaService.getClientReports(currentUser, clientId, query);
  }

  @Post(":clientId/reports")
  createClientReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Body() dto: CreateSocialMediaReportDto,
  ) {
    return this.socialMediaService.createClientReport(currentUser, clientId, dto);
  }
}
