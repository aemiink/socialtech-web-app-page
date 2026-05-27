import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type TikTokApiPayload = {
  code?: number;
  message?: string;
  request_id?: string;
  data?: unknown;
};

export type TikTokAdsErrorCategory = "AUTH" | "PERMISSION" | "RATE_LIMIT" | "NETWORK" | "UNKNOWN";

export type NormalizedTikTokAdsApiError = {
  category: TikTokAdsErrorCategory;
  message: string;
};

export type TikTokAdsConnectionTestInput = {
  accessToken: string;
  advertiserId: string;
};

export type TikTokAdsConnectionTestResult = {
  advertiserId: string;
  advertiserName: string | null;
  currency: string | null;
  timezone: string | null;
  grantedScopes: string[];
};

export type TikTokAdsApiInsightRow = {
  dateStart: string;
  campaignId: string | null;
  campaignName: string | null;
  adGroupId: string | null;
  adGroupName: string | null;
  adId: string | null;
  adName: string | null;
  spend: string | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  ctr: string | null;
  cpc: string | null;
  cpm: string | null;
  videoViews: number | null;
  videoViews2s: number | null;
  videoViews6s: number | null;
  videoCompletionRate: string | null;
  vtr: string | null;
  conversions: number | null;
  costPerConversion: string | null;
  conversionRate: string | null;
  purchaseValue: string | null;
  raw: Record<string, unknown>;
};

export type TikTokAdsCampaignCatalogItem = {
  id: string;
  name: string | null;
  objective: string | null;
  status: string | null;
};

export type TikTokAdsReportingSnapshotInput = {
  accessToken: string;
  advertiserId: string;
  since: string;
  until: string;
};

export type TikTokAdsReportingSnapshotResult = {
  advertiserId: string;
  accountInsights: TikTokAdsApiInsightRow[];
  campaignInsights: TikTokAdsApiInsightRow[];
  adGroupInsights: TikTokAdsApiInsightRow[];
  adInsights: TikTokAdsApiInsightRow[];
  campaigns: TikTokAdsCampaignCatalogItem[];
};

const REPORTING_METRICS = [
  "spend",
  "impressions",
  "reach",
  "clicks",
  "ctr",
  "cpc",
  "cpm",
  "video_play_actions",
  "video_watched_2s",
  "video_watched_6s",
  "video_completion_rate",
  "video_play_rate",
  "conversion",
  "cost_per_conversion",
  "conversion_rate",
  "total_purchase_value",
] as const;

@Injectable()
export class TikTokAdsApiService {
  constructor(private readonly configService: ConfigService) {}

  async testConnection(
    input: TikTokAdsConnectionTestInput,
  ): Promise<TikTokAdsConnectionTestResult> {
    const advertiserId = input.advertiserId.trim();
    const response = await this.requestTikTok("advertiser/info/", input.accessToken, {
      advertiser_ids: [advertiserId],
      fields: ["advertiser_id", "name", "currency", "timezone"],
    });

    const data = this.isRecord(response.data) ? response.data : null;
    const rows = Array.isArray(data?.list) ? data.list : [];
    const account = rows.find(
      (row) => this.isRecord(row) && this.readString(row.advertiser_id) === advertiserId,
    );
    const accountRecord = this.isRecord(account) ? account : null;

    if (!accountRecord) {
      throw new BadGatewayException("TikTok Ads advertiser account was not returned by API.");
    }

    return {
      advertiserId: this.readString(accountRecord.advertiser_id) ?? advertiserId,
      advertiserName: this.readString(accountRecord.name),
      currency: this.readString(accountRecord.currency),
      timezone: this.readString(accountRecord.timezone),
      grantedScopes: [],
    };
  }

  async fetchReportingSnapshot(
    input: TikTokAdsReportingSnapshotInput,
  ): Promise<TikTokAdsReportingSnapshotResult> {
    const [accountInsights, campaignInsights, adGroupInsights, adInsights, campaigns] =
      await Promise.all([
        this.fetchIntegratedReportLevel({
          accessToken: input.accessToken,
          advertiserId: input.advertiserId,
          since: input.since,
          until: input.until,
          level: "AUCTION_ADVERTISER",
          dimensions: ["stat_time_day"],
        }),
        this.fetchIntegratedReportLevel({
          accessToken: input.accessToken,
          advertiserId: input.advertiserId,
          since: input.since,
          until: input.until,
          level: "AUCTION_CAMPAIGN",
          dimensions: ["stat_time_day", "campaign_id"],
        }),
        this.fetchIntegratedReportLevel({
          accessToken: input.accessToken,
          advertiserId: input.advertiserId,
          since: input.since,
          until: input.until,
          level: "AUCTION_ADGROUP",
          dimensions: ["stat_time_day", "adgroup_id"],
        }),
        this.fetchIntegratedReportLevel({
          accessToken: input.accessToken,
          advertiserId: input.advertiserId,
          since: input.since,
          until: input.until,
          level: "AUCTION_AD",
          dimensions: ["stat_time_day", "ad_id"],
        }),
        this.fetchCampaignCatalog({
          accessToken: input.accessToken,
          advertiserId: input.advertiserId,
        }),
      ]);

    return {
      advertiserId: input.advertiserId,
      accountInsights,
      campaignInsights,
      adGroupInsights,
      adInsights,
      campaigns,
    };
  }

  normalizeError(error: unknown): NormalizedTikTokAdsApiError {
    if (this.isTikTokApiPayload(error)) {
      return this.normalizeTikTokApiError(error);
    }

    if (error instanceof BadGatewayException) {
      const response = error.getResponse();
      return {
        category: "NETWORK",
        message: this.extractNestMessage(response) ?? "TikTok Ads API request failed.",
      };
    }

    if (error instanceof Error) {
      return {
        category: "UNKNOWN",
        message: error.message || "Unexpected TikTok Ads API error.",
      };
    }

    return {
      category: "UNKNOWN",
      message: "Unexpected TikTok Ads API error.",
    };
  }

  private async requestTikTok(
    path: string,
    accessToken: string,
    query: Record<string, string | string[]>,
  ): Promise<TikTokApiPayload> {
    const apiVersion = this.configService.get<string>("TIKTOK_ADS_API_VERSION") ?? "v1.3";
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(
      `/open_api/${apiVersion}/${normalizedPath}`,
      "https://business-api.tiktok.com",
    );

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, Array.isArray(value) ? JSON.stringify(value) : value);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Access-Token": accessToken,
        },
      });
    } catch (error) {
      throw new BadGatewayException(
        `TikTok Ads API network request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }.`,
      );
    }

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!this.isTikTokApiPayload(payload)) {
      throw new BadGatewayException("TikTok Ads API returned a malformed response.");
    }

    if (!response.ok || payload.code !== 0) {
      throw payload;
    }

    return payload;
  }

  private async fetchIntegratedReportLevel(params: {
    accessToken: string;
    advertiserId: string;
    since: string;
    until: string;
    level: "AUCTION_ADVERTISER" | "AUCTION_CAMPAIGN" | "AUCTION_ADGROUP" | "AUCTION_AD";
    dimensions: string[];
  }): Promise<TikTokAdsApiInsightRow[]> {
    const response = await this.requestTikTok("report/integrated/get/", params.accessToken, {
      advertiser_id: params.advertiserId,
      report_type: "BASIC",
      data_level: params.level,
      dimensions: params.dimensions,
      metrics: [...REPORTING_METRICS],
      start_date: params.since,
      end_date: params.until,
      page: "1",
      page_size: "1000",
    });

    const data = this.isRecord(response.data) ? response.data : null;
    const rows = Array.isArray(data?.list) ? data.list : [];
    return rows
      .map((row) => this.normalizeIntegratedReportRow(row))
      .filter((row): row is TikTokAdsApiInsightRow => row !== null);
  }

  private async fetchCampaignCatalog(params: {
    accessToken: string;
    advertiserId: string;
  }): Promise<TikTokAdsCampaignCatalogItem[]> {
    const response = await this.requestTikTok("campaign/get/", params.accessToken, {
      advertiser_id: params.advertiserId,
      fields: ["campaign_id", "campaign_name", "objective_type", "operation_status"],
      page: "1",
      page_size: "1000",
    });

    const data = this.isRecord(response.data) ? response.data : null;
    const rows = Array.isArray(data?.list) ? data.list : [];
    return rows
      .map((row) => this.normalizeCampaignCatalogRow(row))
      .filter((row): row is TikTokAdsCampaignCatalogItem => row !== null);
  }

  private normalizeIntegratedReportRow(row: unknown): TikTokAdsApiInsightRow | null {
    if (!this.isRecord(row)) {
      return null;
    }

    const dimensions = this.isRecord(row.dimensions) ? row.dimensions : row;
    const metrics = this.isRecord(row.metrics) ? row.metrics : row;
    const dateStart = this.readString(dimensions.stat_time_day) ?? this.readString(row.stat_time_day);
    if (!dateStart) {
      return null;
    }

    return {
      dateStart,
      campaignId: this.readString(dimensions.campaign_id ?? row.campaign_id),
      campaignName: this.readString(metrics.campaign_name ?? dimensions.campaign_name ?? row.campaign_name),
      adGroupId: this.readString(dimensions.adgroup_id ?? row.adgroup_id),
      adGroupName: this.readString(metrics.adgroup_name ?? dimensions.adgroup_name ?? row.adgroup_name),
      adId: this.readString(dimensions.ad_id ?? row.ad_id),
      adName: this.readString(metrics.ad_name ?? dimensions.ad_name ?? row.ad_name),
      spend: this.readMetricString(metrics.spend),
      impressions: this.readInteger(metrics.impressions),
      reach: this.readInteger(metrics.reach),
      clicks: this.readInteger(metrics.clicks),
      ctr: this.readMetricString(metrics.ctr),
      cpc: this.readMetricString(metrics.cpc),
      cpm: this.readMetricString(metrics.cpm),
      videoViews: this.readInteger(metrics.video_play_actions ?? metrics.video_views),
      videoViews2s: this.readInteger(metrics.video_watched_2s),
      videoViews6s: this.readInteger(metrics.video_watched_6s),
      videoCompletionRate: this.readMetricString(metrics.video_completion_rate),
      vtr: this.readMetricString(metrics.video_play_rate ?? metrics.vtr),
      conversions: this.readInteger(metrics.conversion ?? metrics.conversions),
      costPerConversion: this.readMetricString(metrics.cost_per_conversion),
      conversionRate: this.readMetricString(metrics.conversion_rate),
      purchaseValue: this.readMetricString(metrics.total_purchase_value ?? metrics.purchase_value),
      raw: row,
    };
  }

  private normalizeCampaignCatalogRow(row: unknown): TikTokAdsCampaignCatalogItem | null {
    if (!this.isRecord(row)) {
      return null;
    }

    const id = this.readString(row.campaign_id);
    if (!id) {
      return null;
    }

    return {
      id,
      name: this.readString(row.campaign_name),
      objective: this.readString(row.objective_type),
      status: this.readString(row.operation_status),
    };
  }

  private normalizeTikTokApiError(payload: TikTokApiPayload): NormalizedTikTokAdsApiError {
    const code = typeof payload.code === "number" ? payload.code : null;
    const message = payload.message?.trim() || "TikTok Ads API request failed.";
    const normalizedMessage = message.toLowerCase();

    if (
      code === 40100 ||
      code === 40104 ||
      normalizedMessage.includes("token") ||
      normalizedMessage.includes("auth")
    ) {
      return { category: "AUTH", message };
    }

    if (
      normalizedMessage.includes("permission") ||
      normalizedMessage.includes("scope") ||
      normalizedMessage.includes("access")
    ) {
      return { category: "PERMISSION", message };
    }

    if (normalizedMessage.includes("rate") || normalizedMessage.includes("too many")) {
      return { category: "RATE_LIMIT", message };
    }

    return { category: "NETWORK", message };
  }

  private isTikTokApiPayload(value: unknown): value is TikTokApiPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      (typeof value.code === "number" || value.code === undefined) &&
      (typeof value.message === "string" || value.message === undefined)
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private readString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }

  private readMetricString(value: unknown): string | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return this.readString(value);
  }

  private readInteger(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? Math.trunc(value) : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isNaN(parsed) ? null : parsed;
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
      return message.filter((item): item is string => typeof item === "string").join(" ");
    }

    return null;
  }
}
