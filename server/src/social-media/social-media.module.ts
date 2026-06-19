import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminSocialMediaController } from "./admin-social-media.controller";
import { AdminSocialMediaPostsController } from "./admin-social-media-posts.controller";
import { AdminSocialMediaReportsController } from "./admin-social-media-reports.controller";
import { ClientSocialMediaController } from "./client-social-media.controller";
import { PublicSocialMediaMetaOAuthController } from "./public-social-media-meta-oauth.controller";
import { PublicSocialMediaMetaWebhooksController } from "./public-social-media-meta-webhooks.controller";
import { SocialMediaService } from "./social-media.service";
import { SocialMediaSummaryService } from "./social-media-summary.service";
import { SocialMediaMetaTokenService } from "./social-media-meta-token.service";
import { SocialMediaMetaSyncService } from "./social-media-meta-sync.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminSocialMediaController,
    AdminSocialMediaPostsController,
    AdminSocialMediaReportsController,
    ClientSocialMediaController,
    PublicSocialMediaMetaOAuthController,
    PublicSocialMediaMetaWebhooksController,
  ],
  providers: [
    SocialMediaService,
    SocialMediaSummaryService,
    SocialMediaMetaTokenService,
    SocialMediaMetaSyncService,
  ],
})
export class SocialMediaModule {}
