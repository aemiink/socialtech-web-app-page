import { Controller, Get, Query } from "@nestjs/common";
import { SocialMediaService } from "./social-media.service";

@Controller("social-media/meta-oauth")
export class PublicSocialMediaMetaOAuthController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get("callback")
  completeMetaOAuthCallback(
    @Query("code") code?: string,
    @Query("state") state?: string,
    @Query("error") error?: string,
    @Query("error_description") errorDescription?: string,
  ) {
    return this.socialMediaService.completeClientMetaOAuthCallback({
      code,
      state,
      error,
      errorDescription,
    });
  }
}
