import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "node:crypto";

@Controller("social-media/meta-webhooks")
export class PublicSocialMediaMetaWebhooksController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Header("Content-Type", "text/plain")
  verifyMetaWebhook(
    @Query("hub.mode") mode?: string,
    @Query("hub.challenge") challenge?: string,
    @Query("hub.verify_token") verifyToken?: string,
  ): string {
    if (mode !== "subscribe" || !challenge) {
      throw new BadRequestException("Invalid Meta webhook verification request.");
    }

    if (!this.isExpectedVerifyToken(verifyToken)) {
      throw new ForbiddenException("Meta webhook verify token is invalid.");
    }

    return challenge;
  }

  @Post()
  @HttpCode(200)
  receiveMetaWebhookEvent() {
    return { received: true };
  }

  private isExpectedVerifyToken(verifyToken: string | undefined): boolean {
    const expectedToken = this.configService.get<string>("META_WEBHOOK_VERIFY_TOKEN")?.trim();
    const receivedToken = verifyToken?.trim();

    if (!expectedToken || !receivedToken) {
      return false;
    }

    const expectedTokenBuffer = Buffer.from(expectedToken);
    const receivedTokenBuffer = Buffer.from(receivedToken);
    return (
      expectedTokenBuffer.length === receivedTokenBuffer.length &&
      timingSafeEqual(expectedTokenBuffer, receivedTokenBuffer)
    );
  }
}
