import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { SocialMediaInsightsQueryDto } from "./dto/social-media-insights-query.dto";
import { SocialMediaPostQueryDto } from "./dto/social-media-post-query.dto";
import { SocialMediaReportsQueryDto } from "./dto/social-media-reports-query.dto";
import { SocialMediaService } from "./social-media.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ClientSocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get(["clients/me/social-media/config", "client/social-media/config"])
  getOwnConfig(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.socialMediaService.getOwnConfig(currentUser);
  }

  @Get(["clients/me/social-media/summary", "client/social-media/summary"])
  getOwnSummary(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.socialMediaService.getOwnSummary(currentUser);
  }

  @Get(["clients/me/social-media/posts", "client/social-media/posts"])
  getOwnPosts(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SocialMediaPostQueryDto,
  ) {
    return this.socialMediaService.getOwnPosts(currentUser, query);
  }

  @Get(["clients/me/social-media/calendar", "client/social-media/calendar"])
  getOwnCalendar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SocialMediaPostQueryDto,
  ) {
    return this.socialMediaService.getOwnCalendar(currentUser, query);
  }

  @Get(["clients/me/social-media/insights", "client/social-media/insights"])
  getOwnInsights(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SocialMediaInsightsQueryDto,
  ) {
    return this.socialMediaService.getOwnInsights(currentUser, query);
  }

  @Get(["clients/me/social-media/reports", "client/social-media/reports"])
  getOwnReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SocialMediaReportsQueryDto,
  ) {
    return this.socialMediaService.getOwnReports(currentUser, query);
  }

  @Get(["clients/me/social-media/posts/:id", "client/social-media/posts/:id"])
  getOwnPostById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) postId: string,
  ) {
    return this.socialMediaService.getOwnPostById(currentUser, postId);
  }
}
