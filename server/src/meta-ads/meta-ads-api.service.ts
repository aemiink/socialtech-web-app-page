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

export type MetaAdsApiActionMetric = {
  actionType: string;
  value: string;
};

export type MetaAdsApiInsightRow = {
  dateStart: string;
  dateStop: string;
  campaignId: string | null;
  campaignName: string | null;
  adSetId: string | null;
  adSetName: string | null;
  adId: string | null;
  adName: string | null;
  spend: string | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  ctr: string | null;
  cpc: string | null;
  cpm: string | null;
  frequency: string | null;
  actions: MetaAdsApiActionMetric[];
  costPerActionType: MetaAdsApiActionMetric[];
  actionValues: MetaAdsApiActionMetric[];
  purchaseRoas: MetaAdsApiActionMetric[];
  raw: Record<string, unknown>;
};

export type MetaAdsCampaignCatalogItem = {
  id: string;
  name: string | null;
  objective: string | null;
  status: string | null;
  effectiveStatus: string | null;
};

export type MetaAdsReportingSnapshotInput = {
  accessToken: string;
  adAccountId: string;
  since: string;
  until: string;
};

export type MetaAdsReportingSnapshotResult = {
  adAccountId: string;
  accountInsights: MetaAdsApiInsightRow[];
  campaignInsights: MetaAdsApiInsightRow[];
  adSetInsights: MetaAdsApiInsightRow[];
  adInsights: MetaAdsApiInsightRow[];
  campaigns: MetaAdsCampaignCatalogItem[];
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

  async fetchReportingSnapshot(
    input: MetaAdsReportingSnapshotInput,
  ): Promise<MetaAdsReportingSnapshotResult> {
    const adAccountNode = this.toAdAccountNode(input.adAccountId);
    const [accountInsights, campaignInsights, adSetInsights, adInsights, campaigns] = await Promise.all([
      this.fetchInsightsLevel({
        adAccountNode,
        accessToken: input.accessToken,
        since: input.since,
        until: input.until,
        level: "account",
      }),
      this.fetchInsightsLevel({
        adAccountNode,
        accessToken: input.accessToken,
        since: input.since,
        until: input.until,
        level: "campaign",
      }),
      this.fetchInsightsLevel({
        adAccountNode,
        accessToken: input.accessToken,
        since: input.since,
        until: input.until,
        level: "adset",
      }),
      this.fetchInsightsLevel({
        adAccountNode,
        accessToken: input.accessToken,
        since: input.since,
        until: input.until,
        level: "ad",
      }),
      this.fetchCampaignCatalog({
        adAccountNode,
        accessToken: input.accessToken,
      }),
    ]);

    return {
      adAccountId: adAccountNode,
      accountInsights,
      campaignInsights,
      adSetInsights,
      adInsights,
      campaigns,
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

  private async fetchInsightsLevel(params: {
    adAccountNode: string;
    accessToken: string;
    since: string;
    until: string;
    level: "account" | "campaign" | "adset" | "ad";
  }): Promise<MetaAdsApiInsightRow[]> {
    const fields = this.getInsightFieldsByLevel(params.level);

    const firstPage = await this.requestGraph(`${params.adAccountNode}/insights`, {
      access_token: params.accessToken,
      fields,
      level: params.level,
      time_increment: "1",
      time_range: JSON.stringify({
        since: params.since,
        until: params.until,
      }),
      limit: "200",
    });

    const result: MetaAdsApiInsightRow[] = [];
    this.appendInsightsFromPage(firstPage, result);

    let nextUrl = this.readPagingNext(firstPage);
    let pageGuard = 0;
    while (nextUrl && pageGuard < 20) {
      const page = await this.requestGraphAbsolute(nextUrl);
      this.appendInsightsFromPage(page, result);
      nextUrl = this.readPagingNext(page);
      pageGuard += 1;
    }

    return result;
  }

  private appendInsightsFromPage(page: Record<string, unknown>, result: MetaAdsApiInsightRow[]): void {
    const rows = Array.isArray(page.data) ? page.data : [];
    for (const row of rows) {
      if (!this.isRecord(row)) {
        continue;
      }

      const dateStart = this.readString(row.date_start);
      const dateStop = this.readString(row.date_stop);
      if (!dateStart || !dateStop) {
        continue;
      }

      result.push({
        dateStart,
        dateStop,
        campaignId: this.readString(row.campaign_id),
        campaignName: this.readString(row.campaign_name),
        adSetId: this.readString(row.adset_id),
        adSetName: this.readString(row.adset_name),
        adId: this.readString(row.ad_id),
        adName: this.readString(row.ad_name),
        spend: this.readString(row.spend),
        impressions: this.readInteger(row.impressions),
        reach: this.readInteger(row.reach),
        clicks: this.readInteger(row.clicks),
        ctr: this.readString(row.ctr),
        cpc: this.readString(row.cpc),
        cpm: this.readString(row.cpm),
        frequency: this.readString(row.frequency),
        actions: this.readActionMetrics(row.actions),
        costPerActionType: this.readActionMetrics(row.cost_per_action_type),
        actionValues: this.readActionMetrics(row.action_values),
        purchaseRoas: this.readActionMetrics(row.purchase_roas),
        raw: row,
      });
    }
  }

  private async fetchCampaignCatalog(params: {
    adAccountNode: string;
    accessToken: string;
  }): Promise<MetaAdsCampaignCatalogItem[]> {
    const firstPage = await this.requestGraph(`${params.adAccountNode}/campaigns`, {
      access_token: params.accessToken,
      fields: "id,name,objective,status,effective_status",
      limit: "200",
    });

    const result: MetaAdsCampaignCatalogItem[] = [];
    this.appendCampaignsFromPage(firstPage, result);

    let nextUrl = this.readPagingNext(firstPage);
    let pageGuard = 0;
    while (nextUrl && pageGuard < 20) {
      const page = await this.requestGraphAbsolute(nextUrl);
      this.appendCampaignsFromPage(page, result);
      nextUrl = this.readPagingNext(page);
      pageGuard += 1;
    }

    return result;
  }

  private getInsightFieldsByLevel(level: "account" | "campaign" | "adset" | "ad"): string {
    const baseFields =
      "date_start,date_stop,spend,impressions,reach,clicks,ctr,cpc,cpm,frequency,actions,cost_per_action_type,action_values,purchase_roas";

    if (level === "account") {
      return baseFields;
    }

    if (level === "campaign") {
      return `${baseFields},campaign_id,campaign_name`;
    }

    if (level === "adset") {
      return `${baseFields},campaign_id,campaign_name,adset_id,adset_name`;
    }

    return `${baseFields},campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name`;
  }

  private appendCampaignsFromPage(
    page: Record<string, unknown>,
    result: MetaAdsCampaignCatalogItem[],
  ): void {
    const rows = Array.isArray(page.data) ? page.data : [];
    for (const row of rows) {
      if (!this.isRecord(row)) {
        continue;
      }

      const id = this.readString(row.id);
      if (!id) {
        continue;
      }

      result.push({
        id,
        name: this.readString(row.name),
        objective: this.readString(row.objective),
        status: this.readString(row.status),
        effectiveStatus: this.readString(row.effective_status),
      });
    }
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

    return this.performGraphRequest(url);
  }

  private async requestGraphAbsolute(url: string): Promise<Record<string, unknown>> {
    return this.performGraphRequest(new URL(url));
  }

  private async performGraphRequest(url: URL): Promise<Record<string, unknown>> {
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

  private readPagingNext(payload: Record<string, unknown>): string | null {
    if (!this.isRecord(payload.paging)) {
      return null;
    }

    return this.readString(payload.paging.next);
  }

  private readInteger(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value);
    }

    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized.length === 0) {
        return null;
      }

      const parsed = Number.parseInt(normalized, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  private readActionMetrics(value: unknown): MetaAdsApiActionMetric[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const metrics: MetaAdsApiActionMetric[] = [];
    for (const item of value) {
      if (!this.isRecord(item)) {
        continue;
      }

      const actionType = this.readString(item.action_type);
      const metricValue = this.readString(item.value);
      if (!actionType || !metricValue) {
        continue;
      }

      metrics.push({
        actionType,
        value: metricValue,
      });
    }

    return metrics;
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
