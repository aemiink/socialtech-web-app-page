import type {
  GrowthHubActionItem,
  GrowthHubActionType,
  GrowthHubActionsResponse,
  GrowthHubActivityItem,
  GrowthHubActivityResponse,
  GrowthHubActivityType,
  GrowthHubChannelMetrics,
  GrowthHubChannelSourceStatus,
  GrowthHubChannelStatus,
  GrowthHubChannelSummary,
  GrowthHubChannelsResponse,
  GrowthHubConfig,
  GrowthHubConfigStatus,
  GrowthHubGoal,
  GrowthHubServiceKey,
  GrowthHubSummary,
  GrowthHubSummaryState,
} from "./growthHubTypes";

const SERVICE_KEY_OPTIONS: GrowthHubServiceKey[] = [
  "GROWTH_HUB",
  "SOCIAL_MEDIA",
  "MEDIA_HUB",
  "META_ADS",
  "TIKTOK_ADS",
  "GOOGLE_ADS",
  "AMAZON_ADS",
  "WEB_APP",
  "MOBILE_APP",
  "LANDING_PAGE",
  "WEB_MOBILE_DESIGN",
  "TECHNICAL_SUPPORT",
  "SEO_AUDIT",
];

const GOAL_OPTIONS: GrowthHubGoal[] = [
  "LEAD_GENERATION",
  "ECOMMERCE_SALES",
  "BRAND_AWARENESS",
  "APP_GROWTH",
  "RETENTION",
  "MIXED",
];

const CONFIG_STATUS_OPTIONS: GrowthHubConfigStatus[] = ["ACTIVE", "PAUSED", "ON_HOLD"];

const SUMMARY_STATE_OPTIONS: GrowthHubSummaryState[] = [
  "READY",
  "NO_DATA",
  "WAITING_CONFIG",
  "RISK",
  "OPTIMIZE",
  "SCALE",
];

const SOURCE_STATUS_OPTIONS: GrowthHubChannelSourceStatus[] = [
  "ACTIVE_MODULE",
  "CONTRACT_ONLY",
  "NOT_IMPLEMENTED",
];

const CHANNEL_STATUS_OPTIONS: GrowthHubChannelStatus[] = [
  "READY",
  "NO_DATA",
  "WAITING_SOURCE",
  "RISK",
  "OPTIMIZE",
  "SCALE",
];

const ACTION_TYPE_OPTIONS: GrowthHubActionType[] = [
  "TASK_APPROVAL",
  "FILE_APPROVAL",
  "RELEASE_APPROVAL",
  "REPORT_ACKNOWLEDGEMENT",
];

const ACTIVITY_TYPE_OPTIONS: GrowthHubActivityType[] = ["TASK", "FILE", "RELEASE", "MESSAGE"];

const SERVICE_LABELS: Record<GrowthHubServiceKey, string> = {
  GROWTH_HUB: "Growth & Hub",
  SOCIAL_MEDIA: "Sosyal Medya",
  MEDIA_HUB: "Medya Hub",
  META_ADS: "Meta Ads",
  TIKTOK_ADS: "TikTok Ads",
  GOOGLE_ADS: "Google Ads",
  AMAZON_ADS: "Amazon Ads",
  WEB_APP: "Web App",
  MOBILE_APP: "Mobil App",
  LANDING_PAGE: "Landing Page",
  WEB_MOBILE_DESIGN: "Web & Mobil Tasarım",
  TECHNICAL_SUPPORT: "Teknik Destek",
  SEO_AUDIT: "SEO Denetimi",
};

const GOAL_LABELS: Record<GrowthHubGoal, string> = {
  LEAD_GENERATION: "Lead üretimi",
  ECOMMERCE_SALES: "E-ticaret satışı",
  BRAND_AWARENESS: "Marka bilinirliği",
  APP_GROWTH: "Uygulama büyümesi",
  RETENTION: "Elde tutma",
  MIXED: "Karma büyüme",
};

const SUMMARY_STATE_LABELS: Record<GrowthHubSummaryState, string> = {
  READY: "Hazır",
  NO_DATA: "Veri yok",
  WAITING_CONFIG: "Kurulum bekliyor",
  RISK: "Risk var",
  OPTIMIZE: "Optimize ediliyor",
  SCALE: "Ölçekleniyor",
};

const CHANNEL_STATUS_LABELS: Record<GrowthHubChannelStatus, string> = {
  READY: "Hazır",
  NO_DATA: "Bu kanal için henüz rapor yok",
  WAITING_SOURCE: "Bağlantı bekleniyor",
  RISK: "Risk var",
  OPTIMIZE: "Optimize",
  SCALE: "Scale",
};

const SOURCE_STATUS_LABELS: Record<GrowthHubChannelSourceStatus, string> = {
  ACTIVE_MODULE: "Aktif kaynak",
  CONTRACT_ONLY: "Bağlantı bekleniyor",
  NOT_IMPLEMENTED: "Veri henüz bağlanmadı",
};

const ACTION_TYPE_LABELS: Record<GrowthHubActionType, string> = {
  TASK_APPROVAL: "Görev onayı",
  FILE_APPROVAL: "Dosya onayı",
  RELEASE_APPROVAL: "Yayın onayı",
  REPORT_ACKNOWLEDGEMENT: "Rapor teyidi",
};

const ACTIVITY_TYPE_LABELS: Record<GrowthHubActivityType, string> = {
  TASK: "Görev",
  FILE: "Dosya",
  RELEASE: "Yayın",
  MESSAGE: "Mesaj",
};

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const numberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

export function normalizeClientGrowthHubConfigResponse(response: unknown): GrowthHubConfig | null {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  return normalizeConfig(candidate);
}

export function normalizeClientGrowthHubSummaryResponse(response: unknown): GrowthHubSummary | null {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  if (!isRecord(candidate)) {
    return null;
  }

  const client = isRecord(candidate.client) ? candidate.client : {};
  const service = isRecord(candidate.service) ? candidate.service : {};
  const dateRange = isRecord(candidate.dateRange) ? candidate.dateRange : {};
  const metrics = isRecord(candidate.metrics) ? candidate.metrics : {};
  const meta = isRecord(candidate.meta) ? candidate.meta : {};

  return {
    client: {
      id: readString(client.id),
      name: readString(client.name),
      slug: readString(client.slug),
      status: readString(client.status),
    },
    service: {
      hasActiveService: service.hasActiveService === true,
      status: readNullableString(service.status),
      startedAt: readNullableString(service.startedAt),
      updatedAt: readNullableString(service.updatedAt),
    },
    config: normalizeConfig(candidate.config),
    state: readEnumValue(candidate.state, SUMMARY_STATE_OPTIONS) ?? "NO_DATA",
    dateRange: {
      since: readString(dateRange.since),
      until: readString(dateRange.until),
    },
    metrics: {
      activeServices: readNumber(metrics.activeServices),
      activeChannels: readNumber(metrics.activeChannels),
      projects: readNumber(metrics.projects),
      openTasks: readNumber(metrics.openTasks),
      overdueTasks: readNumber(metrics.overdueTasks),
      openTodos: readNumber(metrics.openTodos),
      pendingApprovals: readNumber(metrics.pendingApprovals),
      pendingReportAcknowledgements: readNumber(metrics.pendingReportAcknowledgements),
      totalSpend: readNumber(metrics.totalSpend),
      totalRevenue: readNumber(metrics.totalRevenue),
      totalLeads: readNumber(metrics.totalLeads),
      blendedRoas: readNumber(metrics.blendedRoas),
      blendedCpa: readNumber(metrics.blendedCpa),
    },
    channels: Array.isArray(candidate.channels)
      ? candidate.channels.map(normalizeChannel).filter(isDefined)
      : [],
    actions: Array.isArray(candidate.actions)
      ? candidate.actions.map(normalizeAction).filter(isDefined)
      : [],
    activity: Array.isArray(candidate.activity)
      ? candidate.activity.map(normalizeActivity).filter(isDefined)
      : [],
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      lastUpdatedAt: readNullableString(meta.lastUpdatedAt),
      sources: readStringArray(meta.sources),
    },
  };
}

export function normalizeClientGrowthHubChannelsResponse(response: unknown): GrowthHubChannelsResponse {
  const data = readResponseArray(response).map(normalizeChannel).filter(isDefined);
  const meta = isRecord(response) && isRecord(response.meta) ? response.meta : {};

  return {
    data,
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
    },
  };
}

export function normalizeClientGrowthHubActionsResponse(response: unknown): GrowthHubActionsResponse {
  const data = readResponseArray(response).map(normalizeAction).filter(isDefined);
  const meta = isRecord(response) && isRecord(response.meta) ? response.meta : {};

  return {
    data,
    meta: {
      total: readNumber(meta.total, data.length),
      generatedAt: readNullableString(meta.generatedAt),
    },
  };
}

export function normalizeClientGrowthHubActivityResponse(response: unknown): GrowthHubActivityResponse {
  const data = readResponseArray(response).map(normalizeActivity).filter(isDefined);
  const meta = isRecord(response) && isRecord(response.meta) ? response.meta : {};

  return {
    data,
    meta: {
      total: readNumber(meta.total, data.length),
      generatedAt: readNullableString(meta.generatedAt),
    },
  };
}

export function getGrowthHubServiceLabel(serviceKey: GrowthHubServiceKey | null): string {
  return serviceKey ? SERVICE_LABELS[serviceKey] ?? serviceKey : "Genel";
}

export function getGrowthHubGoalLabel(goal: GrowthHubGoal | null): string {
  return goal ? GOAL_LABELS[goal] ?? goal : "Hedef tanımlı değil";
}

export function getGrowthHubSummaryStateLabel(state: GrowthHubSummaryState): string {
  return SUMMARY_STATE_LABELS[state] ?? state;
}

export function getGrowthHubChannelStatusLabel(status: GrowthHubChannelStatus): string {
  return CHANNEL_STATUS_LABELS[status] ?? status;
}

export function getGrowthHubSourceStatusLabel(status: GrowthHubChannelSourceStatus): string {
  return SOURCE_STATUS_LABELS[status] ?? status;
}

export function getGrowthHubActionTypeLabel(type: GrowthHubActionType): string {
  return ACTION_TYPE_LABELS[type] ?? type;
}

export function getGrowthHubActivityTypeLabel(type: GrowthHubActivityType): string {
  return ACTIVITY_TYPE_LABELS[type] ?? type;
}

export function getGrowthHubStatusTone(status: GrowthHubSummaryState | GrowthHubChannelStatus): string {
  if (status === "SCALE" || status === "READY") {
    return "border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]";
  }

  if (status === "OPTIMIZE") {
    return "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]";
  }

  if (status === "WAITING_CONFIG" || status === "WAITING_SOURCE") {
    return "border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]";
  }

  if (status === "RISK") {
    return "border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]";
  }

  return "border-white/[0.08] bg-white/[0.05] text-[#A0A0A0]";
}

export function calculateGrowthHealthScore(
  summary: GrowthHubSummary | null,
  channels: GrowthHubChannelSummary[],
): number {
  if (!summary || !summary.service.hasActiveService || summary.state === "NO_DATA") {
    return 0;
  }

  if (summary.state === "WAITING_CONFIG") {
    return 35;
  }

  const channelScores = channels.map((channel) => {
    if (channel.status === "SCALE") return 100;
    if (channel.status === "READY") return 88;
    if (channel.status === "OPTIMIZE") return 72;
    if (channel.status === "WAITING_SOURCE") return 48;
    if (channel.status === "RISK") return 36;
    return 20;
  });
  const baseScore =
    channelScores.length > 0
      ? channelScores.reduce((sum, value) => sum + value, 0) / channelScores.length
      : 50;
  const approvalPenalty = Math.min(summary.metrics.pendingApprovals * 4, 20);
  const overduePenalty = Math.min(summary.metrics.overdueTasks * 8, 24);

  return Math.max(Math.round(baseScore - approvalPenalty - overduePenalty), 0);
}

export function formatGrowthHubCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatGrowthHubCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatGrowthHubNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatGrowthHubRatio(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value)}x`;
}

export function formatGrowthHubDate(value: string | null): string {
  if (!value) {
    return "Tarih yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatGrowthHubDateRange(since: string, until: string): string {
  if (!since || !until) {
    return "Tarih aralığı yok";
  }

  const sinceDate = new Date(since);
  const untilDate = new Date(until);
  if (Number.isNaN(sinceDate.getTime()) || Number.isNaN(untilDate.getTime())) {
    return "Tarih aralığı yok";
  }

  const formatter = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" });
  return `${formatter.format(sinceDate)} - ${formatter.format(untilDate)}`;
}

function normalizeConfig(value: unknown): GrowthHubConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: readString(value.id),
    clientProfileId: readNullableString(value.clientProfileId) ?? undefined,
    primaryGoal: readEnumValue(value.primaryGoal, GOAL_OPTIONS),
    targetLeads: readNullableNumber(value.targetLeads),
    targetRoas: readNullableNumber(value.targetRoas),
    targetCpa: readNullableNumber(value.targetCpa),
    targetRevenue: readNullableNumber(value.targetRevenue),
    reportingDay: readNullableString(value.reportingDay),
    notes: readNullableString(value.notes),
    status: readEnumValue(value.status, CONFIG_STATUS_OPTIONS) ?? "ACTIVE",
    createdAt: readNullableString(value.createdAt),
    updatedAt: readNullableString(value.updatedAt),
  };
}

function normalizeChannel(value: unknown): GrowthHubChannelSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const serviceKey = readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS);
  const sourceStatus = readEnumValue(value.sourceStatus, SOURCE_STATUS_OPTIONS);
  const status = readEnumValue(value.status, CHANNEL_STATUS_OPTIONS);
  if (!serviceKey || !sourceStatus || !status) {
    return null;
  }

  const metrics = isRecord(value.metrics) ? value.metrics : {};

  return {
    serviceKey,
    sourceStatus,
    status,
    metrics: normalizeMetrics(metrics),
    openTasks: readNumber(value.openTasks),
    pendingApprovals: readNumber(value.pendingApprovals),
    overdueTasks: readNumber(value.overdueTasks),
    lastUpdatedAt: readNullableString(value.lastUpdatedAt),
  };
}

function normalizeMetrics(value: Record<string, unknown>): GrowthHubChannelMetrics {
  return {
    spend: readNumber(value.spend),
    revenue: readNumber(value.revenue),
    leads: readNumber(value.leads),
    impressions: readNumber(value.impressions),
    clicks: readNumber(value.clicks),
    conversions: readNumber(value.conversions),
    orders: readNumber(value.orders),
    publishedPosts: readNumber(value.publishedPosts),
    engagement: readNumber(value.engagement),
    roas: readNumber(value.roas),
    cpa: readNumber(value.cpa),
    sourceRecords: readNumber(value.sourceRecords),
    lastUpdatedAt: readNullableString(value.lastUpdatedAt),
  };
}

function normalizeAction(value: unknown): GrowthHubActionItem | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  const type = readEnumValue(value.type, ACTION_TYPE_OPTIONS);
  if (!type) {
    return null;
  }

  return {
    id: value.id,
    type,
    title: value.title,
    serviceKey: readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS),
    project: normalizeProject(value.project),
    dueAt: readNullableString(value.dueAt),
    createdAt: readNullableString(value.createdAt),
    updatedAt: readString(value.updatedAt),
  };
}

function normalizeActivity(value: unknown): GrowthHubActivityItem | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  const type = readEnumValue(value.type, ACTIVITY_TYPE_OPTIONS);
  if (!type) {
    return null;
  }

  return {
    id: value.id,
    type,
    title: value.title,
    serviceKey: readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS),
    project: normalizeProject(value.project),
    occurredAt: readString(value.occurredAt),
  };
}

function normalizeProject(value: unknown): GrowthHubActionItem["project"] {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: readString(value.slug),
  };
}

function readResponseArray(response: unknown): unknown[] {
  if (isRecord(response) && Array.isArray(response.data)) {
    return response.data;
  }

  return Array.isArray(response) ? response : [];
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readEnumValue<T extends string>(value: unknown, allowedValues: readonly T[]): T | null {
  return typeof value === "string" && allowedValues.includes(value as T) ? (value as T) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}
