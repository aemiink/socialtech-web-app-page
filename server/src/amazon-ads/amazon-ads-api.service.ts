import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AmazonAdsInsightLevel,
  AmazonAdsProductType,
  AmazonAdsRegion,
} from "@prisma/client";
import { setTimeout as delay } from "timers/promises";
import { gunzipSync } from "zlib";

const AMAZON_ADS_AUTH_URL = "https://www.amazon.com/ap/oa";
const AMAZON_ADS_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
const AMAZON_ADS_REPORTS_PATH = "/reporting/reports";
const DEFAULT_AMAZON_ADS_SCOPES = ["advertising::campaign_management"];
const AMAZON_ADS_REPORT_CREATE_CONTENT_TYPE = "application/vnd.createasyncreportrequest.v3+json";
const AMAZON_ADS_REPORT_CREATE_ACCEPT = "application/vnd.createasyncreportresponse.v3+json";
const AMAZON_ADS_REPORT_STATUS_ACCEPT = "application/vnd.getasyncreportresponse.v3+json";
const DEFAULT_AMAZON_ADS_REPORT_POLL_ATTEMPTS = 6;
const DEFAULT_AMAZON_ADS_REPORT_POLL_INTERVAL_MS = 1000;
const AMAZON_ADS_REGION_HOSTS: Record<AmazonAdsRegion, string> = {
  NA: "https://advertising-api.amazon.com",
  EU: "https://advertising-api-eu.amazon.com",
  FE: "https://advertising-api-fe.amazon.com",
};

const REPORT_DEFINITIONS: AmazonAdsReportDefinition[] = [
  {
    key: "spCampaigns",
    adProduct: "SPONSORED_PRODUCTS",
    reportTypeId: "spCampaigns",
    level: AmazonAdsInsightLevel.CAMPAIGN,
    groupBy: ["campaign"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "campaignStatus",
      "impressions",
      "clicks",
      "cost",
      "sales14d",
      "purchases14d",
      "unitsSoldClicks14d",
      "acosClicks14d",
      "roasClicks14d",
    ],
  },
  {
    key: "sbCampaigns",
    adProduct: "SPONSORED_BRANDS",
    reportTypeId: "sbCampaigns",
    level: AmazonAdsInsightLevel.CAMPAIGN,
    groupBy: ["campaign"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "campaignStatus",
      "impressions",
      "clicks",
      "cost",
      "sales14d",
      "orders14d",
      "unitsSold14d",
      "acosClicks14d",
      "roasClicks14d",
    ],
  },
  {
    key: "sdCampaigns",
    adProduct: "SPONSORED_DISPLAY",
    reportTypeId: "sdCampaigns",
    level: AmazonAdsInsightLevel.CAMPAIGN,
    groupBy: ["campaign"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "campaignStatus",
      "impressions",
      "clicks",
      "cost",
      "sales14d",
      "purchases14d",
      "unitsSold14d",
      "acosClicks14d",
      "roasClicks14d",
    ],
  },
  {
    key: "spSearchTerm",
    adProduct: "SPONSORED_PRODUCTS",
    reportTypeId: "spSearchTerm",
    level: AmazonAdsInsightLevel.SEARCH_TERM,
    groupBy: ["searchTerm"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "adGroupId",
      "adGroupName",
      "keywordId",
      "keyword",
      "keywordType",
      "matchType",
      "targeting",
      "searchTerm",
      "impressions",
      "clicks",
      "cost",
      "sales14d",
      "purchases14d",
      "unitsSoldClicks14d",
      "acosClicks14d",
      "roasClicks14d",
    ],
  },
  {
    key: "spAdvertisedProduct",
    adProduct: "SPONSORED_PRODUCTS",
    reportTypeId: "spAdvertisedProduct",
    level: AmazonAdsInsightLevel.PRODUCT,
    groupBy: ["advertiser"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "adGroupId",
      "adGroupName",
      "adId",
      "advertisedAsin",
      "advertisedSku",
      "impressions",
      "clicks",
      "cost",
      "sales14d",
      "purchases14d",
      "unitsSoldClicks14d",
      "acosClicks14d",
      "roasClicks14d",
    ],
  },
  {
    key: "spPurchasedProduct",
    adProduct: "SPONSORED_PRODUCTS",
    reportTypeId: "spPurchasedProduct",
    level: AmazonAdsInsightLevel.PRODUCT,
    groupBy: ["asin"],
    columns: [
      "date",
      "campaignId",
      "campaignName",
      "adGroupId",
      "adGroupName",
      "keywordId",
      "keyword",
      "keywordType",
      "advertisedAsin",
      "advertisedSku",
      "purchasedAsin",
      "sales14d",
      "purchases14d",
      "unitsSoldClicks14d",
    ],
  },
];

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

type AmazonAdsReportDefinition = {
  key: string;
  adProduct: AmazonAdsProductType;
  reportTypeId: string;
  level: AmazonAdsInsightLevel;
  groupBy: string[];
  columns: string[];
};

type AmazonAdsCreateReportResponse = {
  reportId?: string;
  id?: string;
};

type AmazonAdsReportStatusResponse = {
  reportId?: string;
  id?: string;
  status?: string;
  statusDetails?: string;
  url?: string;
  location?: string;
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

export type AmazonAdsReportingSnapshotInput = {
  refreshToken: string;
  profileId: string;
  region: AmazonAdsRegion;
  since: string;
  until: string;
};

export type AmazonAdsApiInsightRow = {
  date: string;
  level: AmazonAdsInsightLevel;
  entityId: string;
  entityName: string | null;
  adProduct: AmazonAdsProductType;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  sales: number | null;
  orders: number | null;
  unitsSold: number | null;
  ctr: number | null;
  cpc: number | null;
  acos: number | null;
  roas: number | null;
  conversionRate: number | null;
  raw: Record<string, unknown>;
};

export type AmazonAdsReportingSnapshotResult = {
  rows: AmazonAdsApiInsightRow[];
  reportRequests: Array<{
    key: string;
    reportTypeId: string;
    reportId: string | null;
    status: "REQUESTED" | "SKIPPED";
    message?: string;
  }>;
  reportStatuses: Array<{
    key: string;
    reportId: string | null;
    status: string;
    rows: number;
    message?: string;
  }>;
  apiCallCount: number;
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

  async fetchReportingSnapshot(
    input: AmazonAdsReportingSnapshotInput,
  ): Promise<AmazonAdsReportingSnapshotResult> {
    const token = await this.refreshAccessToken(input.refreshToken);
    const rows: AmazonAdsApiInsightRow[] = [];
    const reportRequests: AmazonAdsReportingSnapshotResult["reportRequests"] = [];
    const reportStatuses: AmazonAdsReportingSnapshotResult["reportStatuses"] = [];
    let apiCallCount = 1;

    for (const definition of REPORT_DEFINITIONS) {
      try {
        const reportId = await this.createSponsoredAdsReport(token.accessToken, input, definition);
        reportRequests.push({
          key: definition.key,
          reportTypeId: definition.reportTypeId,
          reportId,
          status: "REQUESTED",
        });
        apiCallCount += 1;

        const status = await this.pollSponsoredAdsReport(token.accessToken, input, reportId);
        apiCallCount += status.apiCallCount;
        const downloadUrl = status.downloadUrl;
        if (!downloadUrl) {
          reportStatuses.push({
            key: definition.key,
            reportId,
            status: status.status,
            rows: 0,
            message: status.message ?? "Report completed without a download URL.",
          });
          continue;
        }

        const reportRows = await this.downloadSponsoredAdsReport(downloadUrl);
        const normalizedRows = reportRows
          .map((row) => this.normalizeReportingRow(row, definition))
          .filter((row): row is AmazonAdsApiInsightRow => row !== null);

        rows.push(...normalizedRows);
        reportStatuses.push({
          key: definition.key,
          reportId,
          status: status.status,
          rows: normalizedRows.length,
          message: status.message,
        });
      } catch (error) {
        const normalizedError = this.normalizeError(error);
        reportRequests.push({
          key: definition.key,
          reportTypeId: definition.reportTypeId,
          reportId: null,
          status: "SKIPPED",
          message: normalizedError.message,
        });
        reportStatuses.push({
          key: definition.key,
          reportId: null,
          status: "FAILED",
          rows: 0,
          message: normalizedError.message,
        });
      }
    }

    const allReportsFailed =
      reportStatuses.length > 0 && reportStatuses.every((status) => status.status === "FAILED");
    if (rows.length === 0 && allReportsFailed) {
      throw new BadGatewayException("Amazon Ads Reporting API returned no usable rows.");
    }

    return {
      rows,
      reportRequests,
      reportStatuses,
      apiCallCount,
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

  private async createSponsoredAdsReport(
    accessToken: string,
    input: AmazonAdsReportingSnapshotInput,
    definition: AmazonAdsReportDefinition,
  ): Promise<string> {
    const url = new URL(AMAZON_ADS_REPORTS_PATH, AMAZON_ADS_REGION_HOSTS[input.region]);
    const response = (await this.performJsonRequest(url, {
      method: "POST",
      headers: this.createAdvertisingApiHeaders(accessToken, input.profileId, {
        Accept: AMAZON_ADS_REPORT_CREATE_ACCEPT,
        "Content-Type": AMAZON_ADS_REPORT_CREATE_CONTENT_TYPE,
      }),
      body: JSON.stringify({
        name: `${definition.key} ${input.since} - ${input.until}`,
        startDate: input.since,
        endDate: input.until,
        configuration: {
          adProduct: definition.adProduct,
          groupBy: definition.groupBy,
          columns: definition.columns,
          reportTypeId: definition.reportTypeId,
          timeUnit: "DAILY",
          format: "GZIP_JSON",
        },
      }),
    })) as AmazonAdsCreateReportResponse;

    const reportId = this.readString(response.reportId) ?? this.readString(response.id);
    if (!reportId) {
      throw new BadGatewayException("Amazon Ads report create response is missing reportId.");
    }

    return reportId;
  }

  private async pollSponsoredAdsReport(
    accessToken: string,
    input: AmazonAdsReportingSnapshotInput,
    reportId: string,
  ): Promise<{
    status: string;
    downloadUrl: string | null;
    message?: string;
    apiCallCount: number;
  }> {
    const attempts = this.getReportPollAttempts();
    const intervalMs = this.getReportPollIntervalMs();
    let apiCallCount = 0;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const url = new URL(`${AMAZON_ADS_REPORTS_PATH}/${reportId}`, AMAZON_ADS_REGION_HOSTS[input.region]);
      const response = (await this.performJsonRequest(url, {
        method: "GET",
        headers: this.createAdvertisingApiHeaders(accessToken, input.profileId, {
          Accept: AMAZON_ADS_REPORT_STATUS_ACCEPT,
        }),
      })) as AmazonAdsReportStatusResponse;
      apiCallCount += 1;
      const status = this.readString(response.status)?.toUpperCase() ?? "UNKNOWN";
      const downloadUrl = this.readString(response.url) ?? this.readString(response.location);

      if (status === "COMPLETED" || status === "SUCCESS") {
        return {
          status,
          downloadUrl,
          message: this.readString(response.statusDetails) ?? undefined,
          apiCallCount,
        };
      }

      if (status === "FAILED" || status === "FAILURE" || status === "CANCELLED") {
        throw new BadGatewayException(
          `Amazon Ads report ${reportId} failed: ${
            this.readString(response.statusDetails) ?? status
          }.`,
        );
      }

      if (attempt < attempts) {
        await delay(intervalMs);
      }
    }

    return {
      status: "PENDING",
      downloadUrl: null,
      message: `Amazon Ads report ${reportId} did not complete within poll window.`,
      apiCallCount,
    };
  }

  private async downloadSponsoredAdsReport(url: string): Promise<Record<string, unknown>[]> {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json, application/octet-stream" },
      });
    } catch (error) {
      throw new BadGatewayException(
        `Amazon Ads report download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }.`,
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `Amazon Ads report download failed with status ${response.status}.`,
      );
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const decoded = this.decodeReportPayload(bytes);
    const payload = JSON.parse(decoded) as unknown;
    const rows = Array.isArray(payload)
      ? payload
      : this.isRecord(payload) && Array.isArray(payload.data)
        ? payload.data
        : [];

    return rows.filter((row): row is Record<string, unknown> => this.isRecord(row));
  }

  private decodeReportPayload(bytes: Buffer): string {
    try {
      return gunzipSync(bytes).toString("utf8");
    } catch {
      return bytes.toString("utf8");
    }
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

  private createAdvertisingApiHeaders(
    accessToken: string,
    profileId: string,
    overrides: Record<string, string> = {},
  ): Record<string, string> {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Amazon-Advertising-API-ClientId": this.getClientId(),
      "Amazon-Advertising-API-Scope": profileId,
      ...overrides,
    };
  }

  private normalizeReportingRow(
    row: Record<string, unknown>,
    definition: AmazonAdsReportDefinition,
  ): AmazonAdsApiInsightRow | null {
    const date =
      this.readString(row.date) ?? this.readString(row.startDate) ?? this.readString(row.endDate);
    if (!date) {
      return null;
    }

    const entityId = this.resolveReportingEntityId(row, definition);
    if (!entityId) {
      return null;
    }

    const spend = this.readMetricNumber(row.cost) ?? this.readMetricNumber(row.spend);
    const impressions = this.readInteger(row.impressions);
    const clicks = this.readInteger(row.clicks);
    const sales =
      this.readMetricNumber(row.sales14d) ??
      this.readMetricNumber(row.sales7d) ??
      this.readMetricNumber(row.sales30d);
    const orders =
      this.readInteger(row.purchases14d) ??
      this.readInteger(row.orders14d) ??
      this.readInteger(row.purchases7d) ??
      this.readInteger(row.purchases30d);
    const unitsSold =
      this.readInteger(row.unitsSoldClicks14d) ??
      this.readInteger(row.unitsSold14d) ??
      this.readInteger(row.unitsSoldClicks7d) ??
      this.readInteger(row.unitsSoldClicks30d);
    const ctr =
      this.readMetricNumber(row.clickThroughRate) ??
      this.roundPercentageByCounts(clicks ?? 0, impressions ?? 0, 6);
    const cpc =
      this.readMetricNumber(row.costPerClick) ?? this.roundDivision(spend ?? 0, clicks ?? 0, 6);
    const acos =
      this.readMetricNumber(row.acosClicks14d) ??
      this.roundPercentageByValue(spend ?? 0, sales ?? 0, 6);
    const roas =
      this.readMetricNumber(row.roasClicks14d) ?? this.roundDivision(sales ?? 0, spend ?? 0, 6);
    const conversionRate = this.roundPercentageByCounts(orders ?? 0, clicks ?? 0, 6);

    return {
      date,
      level: definition.level,
      entityId,
      entityName: this.resolveReportingEntityName(row, definition),
      adProduct: definition.adProduct,
      spend,
      impressions,
      clicks,
      sales,
      orders,
      unitsSold,
      ctr,
      cpc,
      acos,
      roas,
      conversionRate,
      raw: {
        ...row,
        reportTypeId: definition.reportTypeId,
        adProduct: definition.adProduct,
      },
    };
  }

  private resolveReportingEntityId(
    row: Record<string, unknown>,
    definition: AmazonAdsReportDefinition,
  ): string | null {
    if (definition.level === AmazonAdsInsightLevel.CAMPAIGN) {
      return this.readString(row.campaignId);
    }

    if (definition.level === AmazonAdsInsightLevel.SEARCH_TERM) {
      return (
        this.readString(row.searchTerm) ??
        this.readString(row.keywordId) ??
        this.readString(row.targeting)
      );
    }

    if (definition.level === AmazonAdsInsightLevel.PRODUCT) {
      return (
        this.readString(row.advertisedAsin) ??
        this.readString(row.purchasedAsin) ??
        this.readString(row.advertisedSku) ??
        this.readString(row.adId)
      );
    }

    return this.readString(row.campaignId) ?? this.readString(row.adGroupId);
  }

  private resolveReportingEntityName(
    row: Record<string, unknown>,
    definition: AmazonAdsReportDefinition,
  ): string | null {
    if (definition.level === AmazonAdsInsightLevel.CAMPAIGN) {
      return this.readString(row.campaignName);
    }

    if (definition.level === AmazonAdsInsightLevel.SEARCH_TERM) {
      return this.readString(row.searchTerm) ?? this.readString(row.keyword);
    }

    if (definition.level === AmazonAdsInsightLevel.PRODUCT) {
      return (
        this.readString(row.productName) ??
        this.readString(row.advertisedAsin) ??
        this.readString(row.purchasedAsin) ??
        this.readString(row.advertisedSku)
      );
    }

    return this.readString(row.campaignName) ?? this.readString(row.adGroupName);
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

  private getReportPollAttempts(): number {
    const configuredValue = this.configService.get<string | number | undefined>(
      "AMAZON_ADS_REPORT_POLL_ATTEMPTS",
    );

    return this.normalizePositiveInteger(
      configuredValue,
      DEFAULT_AMAZON_ADS_REPORT_POLL_ATTEMPTS,
    );
  }

  private getReportPollIntervalMs(): number {
    const configuredValue = this.configService.get<string | number | undefined>(
      "AMAZON_ADS_REPORT_POLL_INTERVAL_MS",
    );

    return this.normalizePositiveInteger(
      configuredValue,
      DEFAULT_AMAZON_ADS_REPORT_POLL_INTERVAL_MS,
    );
  }

  private normalizePositiveInteger(
    value: string | number | undefined,
    fallback: number,
  ): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(1, Math.trunc(value));
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value.trim(), 10);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return Math.max(1, parsed);
      }
    }

    return fallback;
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

  private readMetricNumber(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim().replace(",", ".");
    if (normalized.length === 0) {
      return null;
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private readInteger(value: unknown): number | null {
    const parsed = this.readMetricNumber(value);
    return parsed === null ? null : Math.trunc(parsed);
  }

  private round(value: number, digits = 2): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const scale = 10 ** digits;
    return Math.round(value * scale) / scale;
  }

  private roundDivision(numerator: number, denominator: number, digits = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round(numerator / denominator, digits);
  }

  private roundPercentageByCounts(numerator: number, denominator: number, digits = 2): number {
    return this.roundPercentageByValue(numerator, denominator, digits);
  }

  private roundPercentageByValue(numerator: number, denominator: number, digits = 2): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return 0;
    }

    return this.round((numerator / denominator) * 100, digits);
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
