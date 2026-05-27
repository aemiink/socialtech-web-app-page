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
