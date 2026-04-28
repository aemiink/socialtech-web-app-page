import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "../../database/prisma.service";
import { AuthorizationService } from "../authorization.service";
import { AuthenticatedUser } from "../types/authenticated-user.type";
import { AccessTokenPayload } from "../types/token-payload.type";

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing bearer access token.");
    }

    const payload = await this.verifyAccessToken(token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        accountType: true,
        role: true,
        clientProfileId: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User session is no longer valid.");
    }

    const permissions = await this.authorizationService.getPermissionsForRole(user.role);

    request.user = {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
      clientProfileId: user.clientProfileId,
      permissions,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  private async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });

      if (payload.tokenType !== "access") {
        throw new UnauthorizedException("Invalid token type.");
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }
}
