import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminSocialMediaController } from "./admin-social-media.controller";
import { AdminSocialMediaPostsController } from "./admin-social-media-posts.controller";
import { AdminSocialMediaReportsController } from "./admin-social-media-reports.controller";
import { ClientSocialMediaController } from "./client-social-media.controller";
import { SocialMediaService } from "./social-media.service";
import { SocialMediaSummaryService } from "./social-media-summary.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminSocialMediaController,
    AdminSocialMediaPostsController,
    AdminSocialMediaReportsController,
    ClientSocialMediaController,
  ],
  providers: [SocialMediaService, SocialMediaSummaryService],
})
export class SocialMediaModule {}
