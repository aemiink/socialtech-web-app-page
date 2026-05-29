import { Body, Controller, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UpdateSocialMediaReportDto } from "./dto/update-social-media-report.dto";
import { SocialMediaService } from "./social-media.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("social-media/reports")
export class AdminSocialMediaReportsController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Patch(":id")
  updateReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) reportId: string,
    @Body() dto: UpdateSocialMediaReportDto,
  ) {
    return this.socialMediaService.updateReport(currentUser, reportId, dto);
  }

  @Post(":id/publish")
  publishReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) reportId: string,
  ) {
    return this.socialMediaService.publishReport(currentUser, reportId);
  }
}
