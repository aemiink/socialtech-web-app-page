import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../database/prisma.service";
import { AuthorizationService } from "./authorization.service";
import { LoginDto } from "./dto/login.dto";
import { AuthenticatedUser } from "./types/authenticated-user.type";
import { AuthServiceResponse, AuthUserProfile } from "./types/auth-response.type";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/token-payload.type";

type UserWithClientProfile = Prisma.UserGetPayload<{
  include: { clientProfile: true };
}>;

type IssuedTokenPair = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

type PasswordVerificationResult = {
  isValid: boolean;
  upgradedHash?: string;
};

const DUMMY_BCRYPT_HASH = "$2b$12$1/4Fr2Wf96g5BbmtmGc38eQhKEXovdmOVhU9TzMXXldec3r/Y4Hbm";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async login(payload: LoginDto): Promise<AuthServiceResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: { clientProfile: true },
    });

    if (!user) {
      await bcrypt.compare(payload.password, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordVerification = await this.verifyPassword(
      payload.email,
      payload.password,
      user.passwordHash,
    );
    if (!passwordVerification.isValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException("User account is inactive.");
    }

    const tokenPair = await this.prisma.$transaction(async (tx) => {
      const issuedTokenPair = await this.issueTokenPair(user, tx);

      const updateData: Prisma.UserUpdateInput = {
        lastLoginAt: new Date(),
      };
      if (passwordVerification.upgradedHash) {
        updateData.passwordHash = passwordVerification.upgradedHash;
      }

      await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return issuedTokenPair;
    });

    const userProfile = await this.buildUserProfile(user.id);
    return this.toAuthServiceResponse(tokenPair, userProfile);
  }

  async refresh(refreshToken: string): Promise<AuthServiceResponse> {
    const refreshPayload = await this.verifyRefreshToken(refreshToken);
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    const storedRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: {
        user: {
          include: { clientProfile: true },
        },
      },
    });

    if (!storedRefreshToken) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    if (
      storedRefreshToken.id !== refreshPayload.jti ||
      storedRefreshToken.userId !== refreshPayload.sub
    ) {
      throw new UnauthorizedException("Refresh token payload mismatch.");
    }

    if (storedRefreshToken.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException("User account is inactive.");
    }

    const now = new Date();
    if (storedRefreshToken.revokedAt) {
      await this.revokeAllActiveRefreshTokens(storedRefreshToken.userId, now);
      throw new UnauthorizedException("Refresh token is revoked.");
    }

    if (storedRefreshToken.expiresAt <= now) {
      await this.revokeRefreshTokenIfActive(storedRefreshToken.id, now);
      throw new UnauthorizedException("Refresh token has expired.");
    }

    this.assertRefreshTokenSessionIsValid(refreshPayload, storedRefreshToken.user.sessionInvalidatedAt);

    const tokenPair = await this.prisma.$transaction(async (tx) => {
      const revocationResult = await tx.refreshToken.updateMany({
        where: {
          id: storedRefreshToken.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      if (revocationResult.count !== 1) {
        await tx.refreshToken.updateMany({
          where: {
            userId: storedRefreshToken.userId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });

        throw new UnauthorizedException("Refresh token is revoked.");
      }

      return this.issueTokenPair(storedRefreshToken.user, tx);
    });

    const userProfile = await this.buildUserProfile(storedRefreshToken.userId);
    return this.toAuthServiceResponse(tokenPair, userProfile);
  }

  async logout(refreshToken?: string): Promise<{ success: true }> {
    if (!refreshToken) {
      return { success: true };
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  async me(currentUser: AuthenticatedUser): Promise<AuthUserProfile> {
    return this.buildUserProfile(currentUser.id);
  }

  async hashUserPassword(plainPassword: string): Promise<string> {
    return this.hashPassword(plainPassword);
  }

  async verifyUserPassword(
    email: string,
    plainPassword: string,
    storedHash: string,
  ): Promise<boolean> {
    const passwordVerification = await this.verifyPassword(email, plainPassword, storedHash);
    return passwordVerification.isValid;
  }

  async revokeActiveRefreshTokensForUser(userId: string): Promise<void> {
    await this.revokeAllActiveRefreshTokens(userId, new Date());
  }

  private async buildUserProfile(userId: string): Promise<AuthUserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: {
          include: {
            purchasedServices: {
              select: {
                serviceKey: true,
                status: true,
                startedAt: true,
                endedAt: true,
              },
              orderBy: [{ serviceKey: "asc" }, { id: "asc" }],
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    const permissions = await this.authorizationService.getPermissionsForRole(user.role);

    const purchasedServices = user.clientProfile
      ? user.clientProfile.purchasedServices.map((service) => ({
          serviceKey: service.serviceKey,
          status: service.status,
          startedAt: service.startedAt,
          endedAt: service.endedAt,
        }))
      : [];

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accountType: user.accountType,
      role: user.role,
      status: user.status,
      permissions,
      clientProfile: user.clientProfile
        ? {
            id: user.clientProfile.id,
            slug: user.clientProfile.slug,
            companyName: user.clientProfile.companyName,
            contactEmail: user.clientProfile.contactEmail,
            purchasedServices,
          }
        : null,
      purchasedServices,
    };
  }

  private async issueTokenPair(
    user: UserWithClientProfile,
    tx: Prisma.TransactionClient,
  ): Promise<IssuedTokenPair> {
    const sessionInvalidationVersion = user.sessionInvalidatedAt?.getTime() ?? 0;

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
      clientProfileId: user.clientProfileId,
      tokenType: "access",
      siv: sessionInvalidationVersion,
    };

    const refreshTokenId = randomUUID();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
      clientProfileId: user.clientProfileId,
      tokenType: "refresh",
      jti: refreshTokenId,
      siv: sessionInvalidationVersion,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.resolveDurationInSeconds(
        this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
        15 * 60,
      ),
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.resolveDurationInSeconds(
        this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d",
        7 * 24 * 60 * 60,
      ),
    });

    const accessTokenExpiresAt = this.resolveTokenExpiration(accessToken);
    const refreshTokenExpiresAt = this.resolveTokenExpiration(refreshToken);

    await tx.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });

      if (payload.tokenType !== "refresh" || typeof payload.jti !== "string") {
        throw new UnauthorizedException("Invalid refresh token type.");
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired refresh token.");
    }
  }

  private assertRefreshTokenSessionIsValid(
    payload: RefreshTokenPayload,
    sessionInvalidatedAt: Date | null,
  ): void {
    if (!sessionInvalidatedAt) {
      return;
    }

    const sessionInvalidatedAtVersion = sessionInvalidatedAt.getTime();
    if (typeof payload.siv === "number" && Number.isFinite(payload.siv)) {
      if (Math.floor(payload.siv) !== sessionInvalidatedAtVersion) {
        throw new UnauthorizedException("Refresh token session is no longer valid.");
      }
      return;
    }

    if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat)) {
      throw new UnauthorizedException("Refresh token session is no longer valid.");
    }

    // Backward-compatible fallback for tokens minted before `siv` claim rollout.
    const tokenIssuedAtSeconds = Math.floor(payload.iat);
    const sessionInvalidatedAtSeconds = Math.floor(sessionInvalidatedAt.getTime() / 1000);
    if (tokenIssuedAtSeconds <= sessionInvalidatedAtSeconds) {
      throw new UnauthorizedException("Refresh token session is no longer valid.");
    }
  }

  private hashRefreshToken(refreshToken: string): string {
    const secret = this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");
    return createHash("sha256").update(`${secret}:${refreshToken}`).digest("hex");
  }

  private resolveTokenExpiration(token: string): Date {
    const decodedToken = this.jwtService.decode(token);
    if (
      !decodedToken ||
      typeof decodedToken !== "object" ||
      typeof (decodedToken as { exp?: unknown }).exp !== "number"
    ) {
      throw new InternalServerErrorException("Unable to resolve token expiration.");
    }

    return new Date((decodedToken as { exp: number }).exp * 1000);
  }

  private resolveDurationInSeconds(rawDuration: string, fallbackSeconds: number): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(rawDuration);
    if (!match) {
      return fallbackSeconds;
    }

    const value = Number.parseInt(match[1], 10);
    if (!Number.isInteger(value) || value <= 0) {
      return fallbackSeconds;
    }

    const unit = match[2];
    if (unit === "s") {
      return value;
    }
    if (unit === "m") {
      return value * 60;
    }
    if (unit === "h") {
      return value * 60 * 60;
    }

    return value * 24 * 60 * 60;
  }

  private async verifyPassword(
    email: string,
    plainPassword: string,
    storedHash: string,
  ): Promise<PasswordVerificationResult> {
    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
      const isValid = await bcrypt.compare(plainPassword, storedHash);
      return { isValid };
    }

    if (storedHash.startsWith("seed-sha256$")) {
      const legacyHash = this.createLegacySeedHash(email, plainPassword);
      const isValid = this.timingSafeStringEqual(storedHash, legacyHash);
      if (!isValid) {
        return { isValid: false };
      }

      return {
        isValid: true,
        upgradedHash: await this.hashPassword(plainPassword),
      };
    }

    return { isValid: false };
  }

  private async hashPassword(plainPassword: string): Promise<string> {
    const configuredRounds = Number(this.configService.get<number>("BCRYPT_SALT_ROUNDS") ?? 12);
    const saltRounds = Number.isInteger(configuredRounds)
      ? Math.min(Math.max(configuredRounds, 10), 14)
      : 12;
    return bcrypt.hash(plainPassword, saltRounds);
  }

  private createLegacySeedHash(email: string, password: string): string {
    const digest = createHash("sha256")
      .update(`socialtech-seed:${email}:${password}`)
      .digest("hex");

    return `seed-sha256$${digest}`;
  }

  private timingSafeStringEqual(valueA: string, valueB: string): boolean {
    const bufferA = Buffer.from(valueA);
    const bufferB = Buffer.from(valueB);
    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  }

  private async revokeRefreshTokenIfActive(tokenId: string, revokedAt: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id: tokenId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  }

  private async revokeAllActiveRefreshTokens(userId: string, revokedAt: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  }

  private toAuthServiceResponse(
    tokenPair: IssuedTokenPair,
    user: AuthUserProfile,
  ): AuthServiceResponse {
    return {
      accessToken: tokenPair.accessToken,
      accessTokenExpiresAt: tokenPair.accessTokenExpiresAt.toISOString(),
      refreshToken: tokenPair.refreshToken,
      refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt,
      user,
    };
  }
}
