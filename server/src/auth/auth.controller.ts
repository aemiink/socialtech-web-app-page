import {
  Body,
  Controller,
  Get,
  Req,
  Res,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CookieOptions, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthenticatedUser } from "./types/authenticated-user.type";
import { AuthServiceResponse, PublicAuthResponse } from "./types/auth-response.type";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicAuthResponse> {
    const authResponse = await this.authService.login(payload);
    this.setRefreshTokenCookie(
      response,
      authResponse.refreshToken,
      authResponse.refreshTokenExpiresAt,
    );

    return this.toPublicAuthResponse(authResponse);
  }

  @Post("refresh")
  async refresh(
    @Body() payload: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicAuthResponse> {
    const refreshToken = this.extractRefreshToken(request, payload.refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is missing.");
    }

    const authResponse = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(
      response,
      authResponse.refreshToken,
      authResponse.refreshTokenExpiresAt,
    );

    return this.toPublicAuthResponse(authResponse);
  }

  @Post("logout")
  async logout(
    @Body() payload: LogoutDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    const refreshToken = this.extractRefreshToken(request, payload.refreshToken);
    const result = await this.authService.logout(refreshToken ?? undefined);
    this.clearRefreshTokenCookie(response);

    return result;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.me(currentUser);
  }

  private extractRefreshToken(request: Request, bodyToken?: string): string | null {
    const cookieName =
      this.configService.get<string>("REFRESH_TOKEN_COOKIE_NAME") ?? "socialtech_refresh_token";
    const cookieToken = request.cookies?.[cookieName];
    if (typeof cookieToken === "string" && cookieToken.length > 0) {
      return cookieToken;
    }

    if (typeof bodyToken === "string" && bodyToken.length > 0) {
      return bodyToken;
    }

    return null;
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string, expiresAt: Date): void {
    const cookieName =
      this.configService.get<string>("REFRESH_TOKEN_COOKIE_NAME") ?? "socialtech_refresh_token";
    response.cookie(cookieName, refreshToken, this.buildCookieOptions(expiresAt));
  }

  private clearRefreshTokenCookie(response: Response): void {
    const cookieName =
      this.configService.get<string>("REFRESH_TOKEN_COOKIE_NAME") ?? "socialtech_refresh_token";
    response.clearCookie(cookieName, this.buildCookieOptions(new Date(0)));
  }

  private buildCookieOptions(expiresAt: Date): CookieOptions {
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const cookieDomain = this.configService.get<string>("COOKIE_DOMAIN");
    const maxAge = Math.max(expiresAt.getTime() - Date.now(), 0);

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  private toPublicAuthResponse(authResponse: AuthServiceResponse): PublicAuthResponse {
    return {
      accessToken: authResponse.accessToken,
      accessTokenExpiresAt: authResponse.accessTokenExpiresAt,
      user: authResponse.user,
    };
  }
}
