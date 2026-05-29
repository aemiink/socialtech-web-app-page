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
  GrowthHubClientsListItem,
  GrowthHubClientsResponse,
  GrowthHubConfig,
  GrowthHubConfigStatus,
  GrowthHubGoal,
  GrowthHubProjectReference,
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
  MEDIA_HUB: "Media Hub",
  META_ADS: "Meta Ads",
  TIKTOK_ADS: "TikTok Ads",
  GOOGLE_ADS: "Google Ads",
  AMAZON_ADS: "Amazon Ads",
  WEB_APP: "Web App",
  MOBILE_APP: "Mobil App",
  LANDING_PAGE: "Landing Page",
  WEB_MOBILE_DESIGN: "Web & Mobil Tasarım",
  TECHNICAL_SUPPORT: "Teknik Destek",
  SEO_AUDIT: "SEO Audit",
};

const GOAL_LABELS: Record<GrowthHubGoal, string> = {
  LEAD_GENERATION: "Lead üretimi",
  ECOMMERCE_SALES: "E-ticaret satışı",
  BRAND_AWARENESS: "Marka bilinirliği",
  APP_GROWTH: "Uygulama büyümesi",
  RETENTION: "Retention",
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
  NO_DATA: "Veri yok",
  WAITING_SOURCE: "Kaynak bekleniyor",
  RISK: "Risk var",
  OPTIMIZE: "Optimize",
  SCALE: "Scale",
};

const SOURCE_STATUS_LABELS: Record<GrowthHubChannelSourceStatus, string> = {
  ACTIVE_MODULE: "Aktif kaynak",
  CONTRACT_ONLY: "Sözleşme var",
  NOT_IMPLEMENTED: "Henüz bağlı değil",
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

const numberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export const growthHubGoalOptions = GOAL_OPTIONS.map((value) => ({
  value,
  label: GOAL_LABELS[value],
}));

export const growthHubStatusOptions = CONFIG_STATUS_OPTIONS.map((value) => ({
  value,
  label: value === "ACTIVE" ? "Aktif" : value === "PAUSED" ? "Duraklatıldı" : "Beklemede",
}));

export function normalizeGrowthHubClientsResponse(response: unknown): GrowthHubClientsResponse {
  const data = readResponseArray(response).map(normalizeClientListItem).filter(isDefined);
  const meta = isRecord(response) && isRecord(response.meta) ? response.meta : {};

  return {
    data,
    meta: {
      total: readNumber(meta.total, data.length),
      ready: readNumber(meta.ready),
      risk: readNumber(meta.risk),
      optimize: readNumber(meta.optimize),
      scale: readNumber(meta.scale),
      waitingConfig: readNumber(meta.waitingConfig),
      pendingApprovals: readNumber(meta.pendingApprovals),
      generatedAt: readNullableString(meta.generatedAt),
    },
  };
}

export function normalizeGrowthHubConfigResponse(response: unknown): GrowthHubConfig | null {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  return normalizeConfig(candidate);
}

export function normalizeGrowthHubSummaryResponse(response: unknown): GrowthHubSummary | null {
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

export function normalizeGrowthHubChannelsResponse(response: unknown): GrowthHubChannelsResponse {
  const data = readResponseArray(response).map(normalizeChannel).filter(isDefined);
  const meta = isRecord(response) && isRecord(response.meta) ? response.meta : {};

  return {
    data,
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
    },
  };
}

export function normalizeGrowthHubActionsResponse(response: unknown): GrowthHubActionsResponse {
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

export function normalizeGrowthHubActivityResponse(response: unknown): GrowthHubActivityResponse {
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
  return goal ? GOAL_LABELS[goal] ?? goal : "Tanımlanmadı";
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

export function getGrowthHubStatusTone(
  status: GrowthHubSummaryState | GrowthHubChannelStatus,
): string {
  switch (status) {
    case "READY":
    case "SCALE":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "OPTIMIZE":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "WAITING_CONFIG":
    case "WAITING_SOURCE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "RISK":
      return "border-red-500/30 bg-red-500/10 text-red-200";
    default:
      return "border-white/[0.12] bg-white/5 text-[#D6D6D6]";
  }
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
  return `${value.toFixed(2)}x`;
}

export function formatGrowthHubDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("tr-TR");
}

export function formatGrowthHubDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("tr-TR");
}

function normalizeClientListItem(value: unknown): GrowthHubClientsListItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const client = isRecord(value.client) ? value.client : {};
  const metrics = isRecord(value.metrics) ? value.metrics : {};
  const meta = isRecord(value.meta) ? value.meta : {};

  return {
    client: {
      id: readString(client.id),
      name: readString(client.name),
      slug: readString(client.slug),
      status: readString(client.status),
    },
    serviceStatus: readNullableString(value.serviceStatus),
    config: normalizeConfig(value.config),
    state: readEnumValue(value.state, SUMMARY_STATE_OPTIONS) ?? "NO_DATA",
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
    channels: Array.isArray(value.channels)
      ? value.channels.map(normalizeChannel).filter(isDefined)
      : [],
    actions: Array.isArray(value.actions)
      ? value.actions.map(normalizeAction).filter(isDefined)
      : [],
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      lastUpdatedAt: readNullableString(meta.lastUpdatedAt),
      sources: readStringArray(meta.sources),
    },
  };
}

function normalizeConfig(value: unknown): GrowthHubConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: readString(value.id),
    clientProfileId: readString(value.clientProfileId),
    hasActiveService: value.hasActiveService === true,
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

  const metrics = isRecord(value.metrics) ? value.metrics : {};

  return {
    serviceKey: readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS) ?? "GROWTH_HUB",
    sourceStatus: readEnumValue(value.sourceStatus, SOURCE_STATUS_OPTIONS) ?? "NOT_IMPLEMENTED",
    status: readEnumValue(value.status, CHANNEL_STATUS_OPTIONS) ?? "NO_DATA",
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
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: readString(value.id),
    type: readEnumValue(value.type, ACTION_TYPE_OPTIONS) ?? "TASK_APPROVAL",
    title: readString(value.title),
    serviceKey: readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS),
    project: normalizeProject(value.project),
    dueAt: readNullableString(value.dueAt),
    createdAt: readNullableString(value.createdAt),
    updatedAt: readString(value.updatedAt),
  };
}

function normalizeActivity(value: unknown): GrowthHubActivityItem | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: readString(value.id),
    type: readEnumValue(value.type, ACTIVITY_TYPE_OPTIONS) ?? "TASK",
    title: readString(value.title),
    serviceKey: readEnumValue(value.serviceKey, SERVICE_KEY_OPTIONS),
    project: normalizeProject(value.project),
    occurredAt: readString(value.occurredAt),
  };
}

function normalizeProject(value: unknown): GrowthHubProjectReference | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: readString(value.id),
    name: readString(value.name),
    slug: readString(value.slug),
  };
}

function readResponseArray(response: unknown): unknown[] {
  if (isRecord(response) && Array.isArray(response.data)) {
    return response.data;
  }

  return Array.isArray(response) ? response : [];
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
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

function readEnumValue<T extends string>(value: unknown, options: readonly T[]): T | null {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
