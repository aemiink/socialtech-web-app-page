import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type GoogleAdsErrorCategory =
  | "AUTH"
  | "PERMISSION"
  | "CONFIG"
  | "NETWORK"
  | "UNKNOWN";

export type NormalizedGoogleAdsApiError = {
  category: GoogleAdsErrorCategory;
  message: string;
};

export type GoogleAdsConnectionTestInput = {
  refreshToken: string;
  accessToken: string | null;
  customerId: string;
  managerCustomerId: string | null;
  requiredScopes: string[];
};

export type GoogleAdsConnectionTestResult = {
  customerId: string;
  managerCustomerId: string | null;
  descriptiveName: string | null;
  currencyCode: string | null;
  timeZone: string | null;
  grantedScopes: string[];
};

export type GoogleAdsCampaignCatalogItem = {
  id: string;
  name: string;
  channelType: string;
  status: string;
  servingStatus: string;
};

export type GoogleAdsReportingInsightRow = {
  date: string;
  campaignId: string | null;
  campaignName: string | null;
  adGroupId: string | null;
  adGroupName: string | null;
  adId: string | null;
  adName: string | null;
  costMicros: number;
  impressions: number;
  clicks: number;
  interactions: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  averageCpc: number;
  costPerConversion: number;
  raw: Record<string, unknown>;
};

export type GoogleAdsReportingSnapshotInput = {
  refreshToken: string;
  accessToken: string | null;
  customerId: string;
  managerCustomerId: string | null;
  since: string;
  until: string;
};

export type GoogleAdsReportingSnapshotResult = {
  customerId: string;
  managerCustomerId: string | null;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  accountInsights: GoogleAdsReportingInsightRow[];
  campaignInsights: GoogleAdsReportingInsightRow[];
  adGroupInsights: GoogleAdsReportingInsightRow[];
  adInsights: GoogleAdsReportingInsightRow[];
  campaigns: GoogleAdsCampaignCatalogItem[];
};

const DEFAULT_SCOPE = "https://www.googleapis.com/auth/adwords";

@Injectable()
export class GoogleAdsApiService {
  constructor(private readonly configService: ConfigService) {}

  async testConnection(
    input: GoogleAdsConnectionTestInput,
  ): Promise<GoogleAdsConnectionTestResult> {
    const developerToken = this.configService.get<string>("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!developerToken || developerToken.trim().length === 0) {
      throw new BadGatewayException("Google Ads developer token is not configured.");
    }

    const shouldMock = this.configService.get<string>("GOOGLE_ADS_TEST_CONNECTION_MOCK");
    if (shouldMock === "false") {
      throw new BadGatewayException(
        "Google Ads test connection is in mock mode for FAZ-02; real API call is not enabled.",
      );
    }

    const normalizedToken = input.refreshToken.toLowerCase();
    if (normalizedToken.includes("expired") || normalizedToken.includes("invalid_grant")) {
      throw new Error("Google OAuth refresh token expired.");
    }

    if (normalizedToken.includes("permission") || normalizedToken.includes("forbidden")) {
      throw new Error("Google Ads permission missing for requested customer.");
    }

    if (normalizedToken.includes("customer-not-accessible")) {
      throw new Error("Google Ads customer is not accessible via current manager.");
    }

    const grantedScopes = this.normalizeScopes([
      ...input.requiredScopes,
      DEFAULT_SCOPE,
    ]);

    return {
      customerId: input.customerId,
      managerCustomerId: input.managerCustomerId,
      descriptiveName: `Google Ads ${input.customerId}`,
      currencyCode: "TRY",
      timeZone: "Europe/Istanbul",
      grantedScopes,
    };
  }

  async fetchReportingSnapshot(
    input: GoogleAdsReportingSnapshotInput,
  ): Promise<GoogleAdsReportingSnapshotResult> {
    const developerToken = this.configService.get<string>("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!developerToken || developerToken.trim().length === 0) {
      throw new BadGatewayException("Google Ads developer token is not configured.");
    }

    const normalizedToken = input.refreshToken.toLowerCase();
    if (normalizedToken.includes("expired") || normalizedToken.includes("invalid_grant")) {
      throw new Error("Google OAuth refresh token expired.");
    }

    if (normalizedToken.includes("permission") || normalizedToken.includes("forbidden")) {
      throw new Error("Google Ads permission missing for requested customer.");
    }

    if (normalizedToken.includes("customer-not-accessible")) {
      throw new Error("Google Ads customer is not accessible via current manager.");
    }

    const shouldMock = this.configService.get<string>("GOOGLE_ADS_REPORTING_MOCK");
    if (shouldMock === "false") {
      throw new BadGatewayException(
        "Google Ads reporting sync is in mock mode for FAZ-03; real API call is not enabled.",
      );
    }

    return this.buildMockSnapshot(input);
  }

  normalizeError(error: unknown): NormalizedGoogleAdsApiError {
    if (error instanceof BadGatewayException) {
      const response = error.getResponse();
      const message = this.extractNestMessage(response) ?? "Google Ads API request failed.";

      if (/developer token/i.test(message)) {
        return { category: "CONFIG", message };
      }

      return { category: "NETWORK", message };
    }

    if (error instanceof Error) {
      const message = error.message || "Unexpected Google Ads API error.";
      if (/developer token|login-customer-id|customer id missing|oauth client/i.test(message)) {
        return { category: "CONFIG", message };
      }

      if (/permission|forbidden|access denied|not accessible/i.test(message)) {
        return { category: "PERMISSION", message };
      }

      if (/token|oauth|invalid_grant|expired|unauthorized/i.test(message)) {
        return { category: "AUTH", message };
      }

      if (/quota|rate|resource exhausted|too many requests|network/i.test(message)) {
        return { category: "NETWORK", message };
      }

      return { category: "UNKNOWN", message };
    }

    return {
      category: "UNKNOWN",
      message: "Unexpected Google Ads API error.",
    };
  }

  private buildMockSnapshot(
    input: GoogleAdsReportingSnapshotInput,
  ): GoogleAdsReportingSnapshotResult {
    const days = this.listIsoDays(input.since, input.until);
    const campaigns: GoogleAdsCampaignCatalogItem[] = [
      {
        id: "cmp-search-brand",
        name: "Search - Brand",
        channelType: "SEARCH",
        status: "ENABLED",
        servingStatus: "SERVING",
      },
      {
        id: "cmp-pmax-conversions",
        name: "Performance Max - Conversions",
        channelType: "PERFORMANCE_MAX",
        status: "ENABLED",
        servingStatus: "SERVING",
      },
      {
        id: "cmp-display-retargeting",
        name: "Display - Retargeting",
        channelType: "DISPLAY",
        status: "PAUSED",
        servingStatus: "NONE",
      },
    ];

    const accountInsights: GoogleAdsReportingInsightRow[] = [];
    const campaignInsights: GoogleAdsReportingInsightRow[] = [];
    const adGroupInsights: GoogleAdsReportingInsightRow[] = [];
    const adInsights: GoogleAdsReportingInsightRow[] = [];

    days.forEach((day, index) => {
      const dayWeight = index + 1;
      const accountMetrics = this.buildMetrics(1_850_000 * dayWeight, 1250 * dayWeight, 120 * dayWeight, 11.4 * dayWeight, 487.5 * dayWeight);
      accountInsights.push({
        date: day,
        campaignId: null,
        campaignName: null,
        adGroupId: null,
        adGroupName: null,
        adId: null,
        adName: null,
        ...accountMetrics,
        raw: {
          level: "ACCOUNT",
          customerId: input.customerId,
        },
      });

      campaigns.forEach((campaign, campaignIndex) => {
        const ratio = campaignIndex === 0 ? 0.42 : campaignIndex === 1 ? 0.38 : 0.2;
        const costMicros = Math.round(accountMetrics.costMicros * ratio);
        const impressions = Math.max(Math.round(accountMetrics.impressions * ratio), 1);
        const clicks = Math.max(Math.round(accountMetrics.clicks * ratio), 1);
        const conversions = Math.max(accountMetrics.conversions * ratio, 0.1);
        const conversionValue = Math.max(accountMetrics.conversionValue * ratio, 1);

        const campaignMetrics = this.buildMetrics(
          costMicros,
          impressions,
          clicks,
          conversions,
          conversionValue,
        );

        const campaignRaw = {
          level: "CAMPAIGN",
          channelType: campaign.channelType,
          status: campaign.status,
          servingStatus: campaign.servingStatus,
        };

        campaignInsights.push({
          date: day,
          campaignId: campaign.id,
          campaignName: campaign.name,
          adGroupId: null,
          adGroupName: null,
          adId: null,
          adName: null,
          ...campaignMetrics,
          raw: campaignRaw,
        });

        const adGroupId = `${campaign.id}-ag-${(index % 2) + 1}`;
        const adGroupName = `${campaign.name} AdGroup ${(index % 2) + 1}`;
        const keywordTextOptions = [
          "marka kampanya",
          "satın al teklif",
          "performans ajansı",
          "dijital reklam yönetimi",
        ];
        const searchTermOptions = [
          "marka kampanya fiyat",
          "google reklam ajansı",
          "performans reklam yönetimi",
          "retargeting reklam örnekleri",
        ];
        const conversionActionOptions = [
          "Form Submit",
          "Purchase",
          "Lead",
          "Phone Call",
        ];
        const keywordText =
          keywordTextOptions[(campaignIndex + index) % keywordTextOptions.length];
        const searchTerm =
          searchTermOptions[(campaignIndex + index) % searchTermOptions.length];
        const conversionAction =
          conversionActionOptions[(campaignIndex + index) % conversionActionOptions.length];
        const matchType = campaignIndex % 2 === 0 ? "EXACT" : "PHRASE";
        const adGroupMetrics = this.buildMetrics(
          Math.round(campaignMetrics.costMicros * 0.9),
          Math.max(Math.round(campaignMetrics.impressions * 0.9), 1),
          Math.max(Math.round(campaignMetrics.clicks * 0.9), 1),
          Math.max(campaignMetrics.conversions * 0.9, 0.05),
          Math.max(campaignMetrics.conversionValue * 0.9, 0.5),
        );

        adGroupInsights.push({
          date: day,
          campaignId: campaign.id,
          campaignName: campaign.name,
          adGroupId,
          adGroupName,
          adId: null,
          adName: null,
          ...adGroupMetrics,
          raw: {
            ...campaignRaw,
            level: "AD_GROUP",
            adGroupStatus: campaign.status,
            campaignId: campaign.id,
            campaignName: campaign.name,
            adGroupId,
            adGroupName,
          },
        });

        const adId = `${adGroupId}-ad-1`;
        const adName = `${campaign.name} Creative ${dayWeight}`;
        const adMetrics = this.buildMetrics(
          Math.round(adGroupMetrics.costMicros * 0.95),
          Math.max(Math.round(adGroupMetrics.impressions * 0.95), 1),
          Math.max(Math.round(adGroupMetrics.clicks * 0.95), 1),
          Math.max(adGroupMetrics.conversions * 0.95, 0.05),
          Math.max(adGroupMetrics.conversionValue * 0.95, 0.5),
        );

        adInsights.push({
          date: day,
          campaignId: campaign.id,
          campaignName: campaign.name,
          adGroupId,
          adGroupName,
          adId,
          adName,
          ...adMetrics,
          raw: {
            ...campaignRaw,
            level: "AD",
            adStatus: campaign.status,
            campaignId: campaign.id,
            campaignName: campaign.name,
            adGroupId,
            adGroupName,
            adId,
            adName,
            adType: "RESPONSIVE_SEARCH_AD",
            finalUrl: `https://www.socialtech.com/${campaign.id}`,
            keywordText,
            matchType,
            keywordStatus: campaign.status,
            searchTerm,
            conversionAction,
          },
        });
      });
    });

    return {
      customerId: input.customerId,
      managerCustomerId: input.managerCustomerId,
      descriptiveName: `Google Ads ${input.customerId}`,
      currencyCode: "TRY",
      timeZone: "Europe/Istanbul",
      accountInsights,
      campaignInsights,
      adGroupInsights,
      adInsights,
      campaigns,
    };
  }

  private buildMetrics(
    costMicros: number,
    impressions: number,
    clicks: number,
    conversions: number,
    conversionValue: number,
  ): Omit<GoogleAdsReportingInsightRow, "date" | "campaignId" | "campaignName" | "adGroupId" | "adGroupName" | "adId" | "adName" | "raw"> {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cost = costMicros / 1_000_000;
    const averageCpc = clicks > 0 ? cost / clicks : 0;
    const costPerConversion = conversions > 0 ? cost / conversions : 0;

    return {
      costMicros,
      impressions,
      clicks,
      interactions: clicks,
      conversions: this.round(conversions, 4),
      conversionValue: this.round(conversionValue, 4),
      ctr: this.round(ctr, 4),
      averageCpc: this.round(averageCpc, 6),
      costPerConversion: this.round(costPerConversion, 6),
    };
  }

  private round(value: number, precision = 2): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  private listIsoDays(since: string, until: string): string[] {
    const sinceDate = this.toUtcDay(since);
    const untilDate = this.toUtcDay(until);

    if (!sinceDate || !untilDate || sinceDate.getTime() > untilDate.getTime()) {
      return [new Date().toISOString().slice(0, 10)];
    }

    const days: string[] = [];
    const cursor = new Date(sinceDate);
    while (cursor.getTime() <= untilDate.getTime()) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return days;
  }

  private toUtcDay(value: string): Date | null {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }

  private normalizeScopes(scopes: string[]): string[] {
    const normalized = scopes
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);

    return Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b));
  }

  private extractNestMessage(response: unknown): string | null {
    if (typeof response === "string") {
      return response;
    }

    if (response === null || typeof response !== "object" || Array.isArray(response)) {
      return null;
    }

    const candidate = response as Record<string, unknown>;
    const message = candidate.message;
    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string");
      return messages.length > 0 ? messages.join(" ") : null;
    }

    return null;
  }
}
