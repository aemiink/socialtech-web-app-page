import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AmazonAdsRegion } from "@prisma/client";

const AMAZON_ADS_AUTH_URL = "https://www.amazon.com/ap/oa";
const AMAZON_ADS_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
const DEFAULT_AMAZON_ADS_SCOPES = ["advertising::campaign_management"];
const AMAZON_ADS_REGION_HOSTS: Record<AmazonAdsRegion, string> = {
  NA: "https://advertising-api.amazon.com",
  EU: "https://advertising-api-eu.amazon.com",
  FE: "https://advertising-api-fe.amazon.com",
};

type AmazonAdsApiErrorPayload = {
  code?: string;
  message?: string;
  details?: string;
  errors?: Array<{
    code?: string;
    message?: string;
    details?: string;
  }>;
};

type AmazonLwaTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type AmazonAdsErrorCategory =
  | "AUTH"
  | "PERMISSION"
  | "RATE_LIMIT"
  | "NETWORK"
  | "UNKNOWN";

export type NormalizedAmazonAdsApiError = {
  category: AmazonAdsErrorCategory;
  message: string;
  statusCode?: number;
};

export type AmazonAdsAccessTokenResult = {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date;
  grantedScopes: string[];
};

export type AmazonAdsProfile = {
  profileId: string;
  advertiserAccountId: string | null;
  marketplaceId: string | null;
  region: AmazonAdsRegion;
  countryCode: string | null;
  currencyCode: string | null;
  timezone: string | null;
  accountType: string | null;
  accountName: string | null;
  validPaymentMethod: boolean | null;
};

export type AmazonAdsConnectionTestInput = {
  refreshToken: string;
  profileId?: string | null;
  region?: AmazonAdsRegion | null;
};

export type AmazonAdsConnectionTestResult = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  grantedScopes: string[];
  selectedProfile: AmazonAdsProfile;
  profiles: AmazonAdsProfile[];
};

@Injectable()
export class AmazonAdsApiService {
  constructor(private readonly configService: ConfigService) {}

  createAuthorizationUrl(params: {
    clientId: string;
    state: string;
    region?: AmazonAdsRegion | null;
  }): { authorizationUrl: string; redirectUri: string; scopes: string[] } {
    const redirectUri = this.getRedirectUri();
    const scopes = this.getOAuthScopes();
    const authorizationUrl = new URL(AMAZON_ADS_AUTH_URL);
    authorizationUrl.searchParams.set("client_id", params.clientId);
    authorizationUrl.searchParams.set("scope", scopes.join(" "));
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("state", params.state);
    if (params.region) {
      authorizationUrl.searchParams.set("region", params.region);
    }

    return {
      authorizationUrl: authorizationUrl.toString(),
      redirectUri,
      scopes,
    };
  }

  async exchangeAuthorizationCode(code: string): Promise<AmazonAdsAccessTokenResult> {
    const token = await this.requestLwaToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.getRedirectUri(),
    });

    if (!token.refreshToken) {
      throw new BadGatewayException("Amazon LwA did not return a refresh token.");
    }

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<AmazonAdsAccessTokenResult> {
    return this.requestLwaToken({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
  }

  async testConnection(
    input: AmazonAdsConnectionTestInput,
  ): Promise<AmazonAdsConnectionTestResult> {
    const token = await this.refreshAccessToken(input.refreshToken);
    const targetRegion = input.region ?? null;
    const regionsToSearch = targetRegion ? [targetRegion] : this.getRegionSearchOrder();
    const profiles: AmazonAdsProfile[] = [];

    for (const region of regionsToSearch) {
      profiles.push(...(await this.fetchProfiles(token.accessToken, region)));
    }

    const selectedProfile = this.selectProfile(profiles, input.profileId ?? null);

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? input.refreshToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      grantedScopes: token.grantedScopes,
      selectedProfile,
      profiles,
    };
  }

  normalizeError(error: unknown): NormalizedAmazonAdsApiError {
    if (this.isAmazonApiErrorPayload(error)) {
      return this.normalizeAmazonApiError(error.payload, error.statusCode);
    }

    if (error instanceof BadGatewayException) {
      const response = error.getResponse();
      return {
        category: "NETWORK",
        message: this.extractNestMessage(response) ?? "Amazon Ads API request failed.",
      };
    }

    if (error instanceof Error) {
      return {
        category: "UNKNOWN",
        message: error.message || "Unexpected Amazon Ads API error.",
      };
    }

    return {
      category: "UNKNOWN",
      message: "Unexpected Amazon Ads API error.",
    };
  }

  private async requestLwaToken(
    body: Record<string, string>,
  ): Promise<AmazonAdsAccessTokenResult> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const payload = new URLSearchParams({
      ...body,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await this.performJsonRequest(new URL(AMAZON_ADS_TOKEN_URL), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    const tokenResponse = response as AmazonLwaTokenResponse;
    if (!tokenResponse.access_token) {
      throw new BadGatewayException("Amazon LwA token response is missing access_token.");
    }

    const expiresInSeconds =
      typeof tokenResponse.expires_in === "number" && Number.isFinite(tokenResponse.expires_in)
        ? tokenResponse.expires_in
        : 3600;

    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? null,
      accessTokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      grantedScopes: this.normalizeScopes(tokenResponse.scope?.split(" ") ?? []),
    };
  }

  private async fetchProfiles(
    accessToken: string,
    region: AmazonAdsRegion,
  ): Promise<AmazonAdsProfile[]> {
    const url = new URL("/v2/profiles", AMAZON_ADS_REGION_HOSTS[region]);
    const response = await this.performJsonRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": this.getClientId(),
      },
    });

    const rows = Array.isArray(response) ? response : this.isRecord(response) && Array.isArray(response.data) ? response.data : [];

    return rows
      .map((row) => this.normalizeProfile(row, region))
      .filter((profile): profile is AmazonAdsProfile => profile !== null);
  }

  private async performJsonRequest(url: URL, init: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      throw new BadGatewayException(
        `Amazon Ads API network request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }.`,
      );
    }

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      if (this.isRecord(payload)) {
        throw {
          payload,
          statusCode: response.status,
        };
      }

      throw new BadGatewayException(
        `Amazon Ads API request failed with status ${response.status}.`,
      );
    }

    if (!this.isRecord(payload) && !Array.isArray(payload)) {
      throw new BadGatewayException("Amazon Ads API returned a malformed response.");
    }

    return payload;
  }

  private normalizeProfile(value: unknown, region: AmazonAdsRegion): AmazonAdsProfile | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const accountInfo = this.isRecord(value.accountInfo) ? value.accountInfo : {};
    const profileId = this.readString(value.profileId);
    if (!profileId) {
      return null;
    }

    return {
      profileId,
      advertiserAccountId: this.readString(accountInfo.id),
      marketplaceId: this.readString(accountInfo.marketplaceStringId),
      region,
      countryCode: this.readString(value.countryCode)?.toUpperCase() ?? null,
      currencyCode: this.readString(value.currencyCode)?.toUpperCase() ?? null,
      timezone: this.readString(value.timezone),
      accountType: this.readString(accountInfo.type),
      accountName: this.readString(accountInfo.name),
      validPaymentMethod:
        typeof accountInfo.validPaymentMethod === "boolean"
          ? accountInfo.validPaymentMethod
          : null,
    };
  }

  private selectProfile(
    profiles: AmazonAdsProfile[],
    requestedProfileId: string | null,
  ): AmazonAdsProfile {
    if (requestedProfileId) {
      const selectedProfile = profiles.find((profile) => profile.profileId === requestedProfileId);
      if (!selectedProfile) {
        throw new BadGatewayException(
          "Amazon Ads profileId is not available for the provided refresh token.",
        );
      }

      return selectedProfile;
    }

    if (profiles.length === 1) {
      return profiles[0];
    }

    if (profiles.length === 0) {
      throw new BadGatewayException("Amazon Ads profile list is empty for this account.");
    }

    throw new BadGatewayException("Multiple Amazon Ads profiles found; profileId is required.");
  }

  private normalizeAmazonApiError(
    payload: AmazonAdsApiErrorPayload,
    statusCode?: number,
  ): NormalizedAmazonAdsApiError {
    const firstError = Array.isArray(payload.errors) ? payload.errors[0] : undefined;
    const message =
      firstError?.message?.trim() ||
      firstError?.details?.trim() ||
      payload.message?.trim() ||
      payload.details?.trim() ||
      "Amazon Ads API request failed.";

    if (statusCode === 401 || payload.code === "UNAUTHORIZED") {
      return { category: "AUTH", message, statusCode };
    }

    if (statusCode === 403) {
      return { category: "PERMISSION", message, statusCode };
    }

    if (statusCode === 429) {
      return { category: "RATE_LIMIT", message, statusCode };
    }

    if (statusCode !== undefined && statusCode >= 500) {
      return { category: "NETWORK", message, statusCode };
    }

    return { category: "UNKNOWN", message, statusCode };
  }

  private getClientId(): string {
    return this.getRequiredConfig("AMAZON_ADS_LWA_CLIENT_ID", "AMAZON_ADS_CLIENT_ID");
  }

  private getClientSecret(): string {
    return this.getRequiredConfig(
      "AMAZON_ADS_LWA_CLIENT_SECRET",
      "AMAZON_ADS_CLIENT_SECRET",
    );
  }

  private getRedirectUri(): string {
    return this.getRequiredConfig("AMAZON_ADS_REDIRECT_URI");
  }

  private getRequiredConfig(primaryKey: string, fallbackKey?: string): string {
    const value =
      this.configService.get<string>(primaryKey)?.trim() ||
      (fallbackKey ? this.configService.get<string>(fallbackKey)?.trim() : undefined);

    if (!value) {
      throw new BadGatewayException(
        `${fallbackKey ? `${primaryKey} or ${fallbackKey}` : primaryKey} must be configured.`,
      );
    }

    return value;
  }

  private getOAuthScopes(): string[] {
    const rawScopes = this.configService.get<string>("AMAZON_ADS_OAUTH_SCOPES")?.trim();
    if (!rawScopes) {
      return DEFAULT_AMAZON_ADS_SCOPES;
    }

    return this.normalizeScopes(rawScopes.split(/[,\s]+/));
  }

  private getRegionSearchOrder(): AmazonAdsRegion[] {
    const defaultRegion = this.configService.get<string>("AMAZON_ADS_DEFAULT_REGION")?.trim();
    if (defaultRegion === "NA" || defaultRegion === "EU" || defaultRegion === "FE") {
      return [defaultRegion];
    }

    return ["NA", "EU", "FE"];
  }

  private normalizeScopes(scopes: string[]): string[] {
    return Array.from(
      new Set(scopes.map((scope) => scope.trim()).filter((scope) => scope.length > 0)),
    );
  }

  private readString(value: unknown): string | null {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  private extractNestMessage(response: string | object): string | null {
    if (typeof response === "string") {
      return response;
    }

    if (!this.isRecord(response)) {
      return null;
    }

    const message = response.message;
    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === "string").join(", ");
    }

    return null;
  }

  private isAmazonApiErrorPayload(
    value: unknown,
  ): value is { payload: AmazonAdsApiErrorPayload; statusCode?: number } {
    return (
      this.isRecord(value) &&
      this.isRecord(value.payload) &&
      (typeof value.statusCode === "number" || value.statusCode === undefined)
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
