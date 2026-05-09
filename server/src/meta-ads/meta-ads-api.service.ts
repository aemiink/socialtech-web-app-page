import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type MetaAdsGraphErrorPayload = {
  error: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id?: string;
  };
};

export type MetaAdsErrorCategory = "AUTH" | "PERMISSION" | "NETWORK" | "UNKNOWN";

export type NormalizedMetaAdsApiError = {
  category: MetaAdsErrorCategory;
  message: string;
};

export type MetaAdsConnectionTestInput = {
  accessToken: string;
  adAccountId: string;
  requiredScopes: string[];
};

export type MetaAdsConnectionTestResult = {
  adAccountId: string;
  currency: string | null;
  timezone: string | null;
  grantedScopes: string[];
};

@Injectable()
export class MetaAdsApiService {
  constructor(private readonly configService: ConfigService) {}

  async testConnection(input: MetaAdsConnectionTestInput): Promise<MetaAdsConnectionTestResult> {
    const normalizedAdAccountId = this.toAdAccountNode(input.adAccountId);
    const [accountSnapshot, grantedScopes] = await Promise.all([
      this.fetchAdAccountSnapshot(normalizedAdAccountId, input.accessToken),
      this.fetchGrantedScopes(input.accessToken),
    ]);

    const missingScopes = input.requiredScopes.filter(
      (scope) => !grantedScopes.includes(scope),
    );

    if (missingScopes.length > 0) {
      throw new BadGatewayException(
        `Missing required Meta Ads permissions: ${missingScopes.join(", ")}.`,
      );
    }

    return {
      adAccountId: accountSnapshot.id ?? normalizedAdAccountId,
      currency: accountSnapshot.currency ?? null,
      timezone: accountSnapshot.timezone_name ?? null,
      grantedScopes,
    };
  }

  normalizeError(error: unknown): NormalizedMetaAdsApiError {
    if (this.isGraphErrorPayload(error)) {
      return this.normalizeGraphError(error.error);
    }

    if (error instanceof BadGatewayException) {
      const response = error.getResponse();
      const message = this.extractNestMessage(response) ?? "Meta API request failed.";
      return {
        category: "NETWORK",
        message,
      };
    }

    if (error instanceof Error) {
      return {
        category: "UNKNOWN",
        message: error.message || "Unexpected Meta API error.",
      };
    }

    return {
      category: "UNKNOWN",
      message: "Unexpected Meta API error.",
    };
  }

  private async fetchAdAccountSnapshot(adAccountNode: string, accessToken: string) {
    const response = await this.requestGraph(
      `${adAccountNode}`,
      {
        fields: "id,name,account_status,currency,timezone_name",
        access_token: accessToken,
      },
    );

    return {
      id: this.readString(response.id),
      currency: this.readString(response.currency),
      timezone_name: this.readString(response.timezone_name),
    };
  }

  private async fetchGrantedScopes(accessToken: string): Promise<string[]> {
    const appId = this.configService.get<string>("META_APP_ID")?.trim();
    const appSecret = this.configService.get<string>("META_APP_SECRET")?.trim();

    if (!appId || !appSecret) {
      throw new BadGatewayException(
        "META_APP_ID and META_APP_SECRET must be configured to validate granted scopes.",
      );
    }

    const response = await this.requestGraph("debug_token", {
      input_token: accessToken,
      access_token: `${appId}|${appSecret}`,
    });

    const data = this.isRecord(response.data) ? response.data : null;
    const scopesRaw = data?.scopes;

    if (!Array.isArray(scopesRaw)) {
      return [];
    }

    return scopesRaw
      .map((scope) => (typeof scope === "string" ? scope.trim() : ""))
      .filter((scope) => scope.length > 0);
  }

  private async requestGraph(
    path: string,
    query: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    const apiVersion = this.configService.get<string>("META_GRAPH_API_VERSION") ?? "v22.0";
    const base = `https://graph.facebook.com/${apiVersion}/`;
    const url = new URL(path, base);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      throw new BadGatewayException(
        `Meta API network request failed: ${error instanceof Error ? error.message : "Unknown error"}.`,
      );
    }

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      if (this.isGraphErrorPayload(payload)) {
        throw payload;
      }

      throw new BadGatewayException(`Meta API request failed with status ${response.status}.`);
    }

    if (this.isGraphErrorPayload(payload)) {
      throw payload;
    }

    if (!this.isRecord(payload)) {
      throw new BadGatewayException("Meta API returned a malformed response.");
    }

    return payload;
  }

  private normalizeGraphError(
    graphError: MetaAdsGraphErrorPayload["error"],
  ): NormalizedMetaAdsApiError {
    const code = typeof graphError.code === "number" ? graphError.code : null;
    const message =
      graphError.error_user_msg?.trim() ||
      graphError.error_user_title?.trim() ||
      graphError.message?.trim() ||
      "Meta API request failed.";

    if (code === 190) {
      return { category: "AUTH", message: "Meta access token is invalid or expired." };
    }

    if (code === 10 || (code !== null && code >= 200 && code < 300)) {
      return { category: "PERMISSION", message };
    }

    return {
      category: "NETWORK",
      message,
    };
  }

  private toAdAccountNode(adAccountId: string): string {
    const trimmed = adAccountId.trim();
    return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
  }

  private extractNestMessage(response: unknown): string | null {
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
      const messages = message.filter((item): item is string => typeof item === "string");
      return messages.length > 0 ? messages.join(" ") : null;
    }

    return null;
  }

  private readString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }

  private isGraphErrorPayload(value: unknown): value is MetaAdsGraphErrorPayload {
    return (
      this.isRecord(value) &&
      this.isRecord(value.error) &&
      (typeof value.error.message === "string" ||
        typeof value.error.code === "number" ||
        typeof value.error.type === "string")
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
}
