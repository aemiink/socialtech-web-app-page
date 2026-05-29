import type {
  SocialMediaApprovalStatus,
  SocialMediaCalendarResponse,
  SocialMediaConfig,
  SocialMediaConnectionStatus,
  SocialMediaCreativeAsset,
  SocialMediaGoal,
  SocialMediaPlatform,
  SocialMediaPost,
  SocialMediaPostAsset,
  SocialMediaPostAssetFile,
  SocialMediaPostStatus,
  SocialMediaPostType,
  SocialMediaProjectSummary,
  SocialMediaSummary,
  SocialMediaSummaryConfig,
  SocialMediaSummaryPost,
  SocialMediaSummaryState,
} from "./socialMediaTypes";

export const SOCIAL_MEDIA_PLATFORM_OPTIONS: SocialMediaPlatform[] = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "LINKEDIN",
  "X",
  "PINTEREST",
];

export const SOCIAL_MEDIA_POST_TYPE_OPTIONS: SocialMediaPostType[] = [
  "FEED",
  "STORY",
  "REEL",
  "CAROUSEL",
  "SHORT_VIDEO",
  "STATIC_IMAGE",
  "TEXT",
];

export const SOCIAL_MEDIA_POST_STATUS_OPTIONS: SocialMediaPostStatus[] = [
  "IDEA",
  "DRAFT",
  "DESIGN",
  "WAITING_APPROVAL",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "REJECTED",
  "REVISION_REQUIRED",
  "CANCELLED",
];

const SOCIAL_MEDIA_CONNECTION_STATUS_OPTIONS: SocialMediaConnectionStatus[] = [
  "NOT_CONNECTED",
  "PENDING",
  "CONNECTED",
  "ERROR",
  "DISCONNECTED",
];

const SOCIAL_MEDIA_GOAL_OPTIONS: SocialMediaGoal[] = [
  "BRAND_AWARENESS",
  "COMMUNITY_GROWTH",
  "ENGAGEMENT",
  "LEAD_GENERATION",
  "SALES_SUPPORT",
  "REPUTATION",
  "MIXED",
];

const SOCIAL_MEDIA_SUMMARY_STATE_OPTIONS: SocialMediaSummaryState[] = [
  "READY",
  "NO_DATA",
  "WAITING_CONFIG",
  "WAITING_CONTENT_PLAN",
];

const SOCIAL_MEDIA_APPROVAL_STATUS_OPTIONS: SocialMediaApprovalStatus[] = [
  "PENDING",
  "APPROVED",
  "CHANGES_REQUESTED",
  "REJECTED",
  "ACKNOWLEDGED",
];

const PLATFORM_LABELS: Record<SocialMediaPlatform, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  LINKEDIN: "LinkedIn",
  X: "X",
  PINTEREST: "Pinterest",
};

const POST_TYPE_LABELS: Record<SocialMediaPostType, string> = {
  FEED: "Feed",
  STORY: "Story",
  REEL: "Reel",
  CAROUSEL: "Carousel",
  SHORT_VIDEO: "Kısa Video",
  STATIC_IMAGE: "Statik Görsel",
  TEXT: "Metin",
};

const STATUS_LABELS: Record<SocialMediaPostStatus, string> = {
  IDEA: "Fikir",
  DRAFT: "Taslak",
  DESIGN: "Tasarım",
  WAITING_APPROVAL: "Onay Bekliyor",
  APPROVED: "Onaylandı",
  SCHEDULED: "Planlandı",
  PUBLISHED: "Yayınlandı",
  REJECTED: "Reddedildi",
  REVISION_REQUIRED: "Revizyon Gerekli",
  CANCELLED: "İptal",
};

const GOAL_LABELS: Record<SocialMediaGoal, string> = {
  BRAND_AWARENESS: "Marka Bilinirliği",
  COMMUNITY_GROWTH: "Topluluk Büyümesi",
  ENGAGEMENT: "Etkileşim",
  LEAD_GENERATION: "Lead Üretimi",
  SALES_SUPPORT: "Satış Desteği",
  REPUTATION: "İtibar",
  MIXED: "Karma",
};

const SUMMARY_STATE_LABELS: Record<SocialMediaSummaryState, string> = {
  READY: "Hazır",
  NO_DATA: "Veri yok",
  WAITING_CONFIG: "Kurulum bekliyor",
  WAITING_CONTENT_PLAN: "İçerik planı bekliyor",
};

export function normalizeOwnSocialMediaPostsResponse(response: unknown): SocialMediaPost[] {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  return Array.isArray(responseData) ? responseData.map(normalizeSocialMediaPost).filter(isDefined) : [];
}

export function normalizeOwnSocialMediaCalendarResponse(response: unknown): SocialMediaCalendarResponse {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  const posts = isRecord(candidate) && Array.isArray(candidate.posts)
    ? candidate.posts.map(normalizeSocialMediaPost).filter(isDefined)
    : [];
  const meta = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    posts,
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      from: readNullableString(meta.from),
      to: readNullableString(meta.to),
    },
  };
}

export function normalizeOwnSocialMediaConfigResponse(response: unknown): SocialMediaConfig | null {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  return normalizeSocialMediaConfig(candidate);
}

export function normalizeOwnSocialMediaSummaryResponse(response: unknown): SocialMediaSummary | null {
  const candidate = isRecord(response) && isRecord(response.data) ? response.data : response;
  if (!isRecord(candidate)) {
    return null;
  }

  const client = isRecord(candidate.client) ? candidate.client : {};
  const service = isRecord(candidate.service) ? candidate.service : {};
  const metrics = isRecord(candidate.metrics) ? candidate.metrics : {};
  const contentPlan = isRecord(candidate.contentPlan) ? candidate.contentPlan : {};
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
    config: normalizeSocialMediaSummaryConfig(candidate.config),
    state: readEnumValue(candidate.state, SOCIAL_MEDIA_SUMMARY_STATE_OPTIONS) ?? "NO_DATA",
    metrics: {
      projects: readNumber(metrics.projects),
      tasks: readNumber(metrics.tasks),
      plannedPosts: readNumber(metrics.plannedPosts),
      publishedPosts: readNumber(metrics.publishedPosts),
      inDesignPosts: readNumber(metrics.inDesignPosts),
      pendingApprovals: readNumber(metrics.pendingApprovals),
      rejectedPosts: readNumber(metrics.rejectedPosts),
      creativeAssets: readNumber(metrics.creativeAssets),
      openTodos: readNumber(metrics.openTodos),
      completedTodos: readNumber(metrics.completedTodos),
    },
    contentPlan: {
      projects: Array.isArray(contentPlan.projects)
        ? contentPlan.projects.map(normalizeSummaryProject).filter(isDefined)
        : [],
      upcomingPosts: Array.isArray(contentPlan.upcomingPosts)
        ? contentPlan.upcomingPosts.map(normalizeSummaryPost).filter(isDefined)
        : [],
      recentPosts: Array.isArray(contentPlan.recentPosts)
        ? contentPlan.recentPosts.map(normalizeSummaryPost).filter(isDefined)
        : [],
      topPosts: Array.isArray(contentPlan.topPosts)
        ? contentPlan.topPosts.map(normalizeSummaryPost).filter(isDefined)
        : [],
    },
    creativeAssets: Array.isArray(candidate.creativeAssets)
      ? candidate.creativeAssets.map(normalizeCreativeAsset).filter(isDefined)
      : [],
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      lastUpdatedAt: readNullableString(meta.lastUpdatedAt),
      sources: readStringArray(meta.sources),
    },
  };
}

export function getSocialMediaPlatformLabel(platform: SocialMediaPlatform): string {
  return PLATFORM_LABELS[platform] ?? platform;
}

export function getSocialMediaPostTypeLabel(type: SocialMediaPostType): string {
  return POST_TYPE_LABELS[type] ?? type;
}

export function getSocialMediaPostStatusLabel(status: SocialMediaPostStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getSocialMediaGoalLabel(goal: SocialMediaGoal | null): string {
  return goal ? GOAL_LABELS[goal] ?? goal : "Hedef tanımlı değil";
}

export function getSocialMediaSummaryStateLabel(state: SocialMediaSummaryState): string {
  return SUMMARY_STATE_LABELS[state] ?? state;
}

export function getSocialMediaStatusTone(status: SocialMediaPostStatus): string {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]";
  }

  if (status === "SCHEDULED") {
    return "border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]";
  }

  if (status === "WAITING_APPROVAL" || status === "DESIGN") {
    return "border-[#FFA726]/20 bg-[#FFA726]/10 text-[#FFA726]";
  }

  if (status === "REJECTED" || status === "REVISION_REQUIRED" || status === "CANCELLED") {
    return "border-[#ff4444]/20 bg-[#ff4444]/10 text-[#ff4444]";
  }

  return "border-white/[0.08] bg-white/[0.05] text-[#A0A0A0]";
}

export function formatSocialMediaDate(value: string | null): string {
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

export function groupPostsByDay(posts: SocialMediaPost[]): Array<{ day: string; posts: SocialMediaPost[] }> {
  const formatter = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "2-digit", month: "short" });
  const grouped = posts.reduce<Record<string, SocialMediaPost[]>>((accumulator, post) => {
    const dateValue = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
    const date = new Date(dateValue);
    const key = Number.isNaN(date.getTime()) ? "Tarih yok" : formatter.format(date);
    accumulator[key] = [...(accumulator[key] ?? []), post];
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([day, groupedPosts]) => ({ day, posts: groupedPosts }));
}

function normalizeSocialMediaPost(value: unknown): SocialMediaPost | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.clientProfileId !== "string" ||
    !isStringOrNull(value.projectId) ||
    !isSocialMediaPlatform(value.platform) ||
    !isSocialMediaPostType(value.type) ||
    !isSocialMediaPostStatus(value.status) ||
    typeof value.title !== "string" ||
    !isStringOrNull(value.caption) ||
    !isStringOrNull(value.scheduledAt) ||
    !isStringOrNull(value.publishedAt) ||
    typeof value.clientVisible !== "boolean" ||
    !isStringOrNull(value.externalPostUrl) ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    clientProfileId: value.clientProfileId,
    projectId: value.projectId,
    platform: value.platform,
    type: value.type,
    status: value.status,
    title: value.title,
    caption: value.caption,
    scheduledAt: value.scheduledAt,
    publishedAt: value.publishedAt,
    clientVisible: value.clientVisible,
    externalPostUrl: value.externalPostUrl,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    project: normalizeProjectSummary(value.project),
    assets: Array.isArray(value.assets)
      ? value.assets.map(normalizePostAsset).filter(isDefined)
      : [],
  };
}

function normalizeSocialMediaConfig(value: unknown): SocialMediaConfig | null {
  const record = isRecord(value) ? value : null;
  if (!record) {
    return null;
  }

  return {
    clientProfileId: readString(record.clientProfileId),
    ...normalizeConfigFields(record),
  };
}

function normalizeSocialMediaSummaryConfig(value: unknown): SocialMediaSummaryConfig | null {
  const record = isRecord(value) ? value : null;
  return record ? normalizeConfigFields(record) : null;
}

function normalizeConfigFields(record: Record<string, unknown>): SocialMediaSummaryConfig {
  return {
    instagramUsername: readNullableString(record.instagramUsername),
    instagramAccountId: readNullableString(record.instagramAccountId),
    facebookPageId: readNullableString(record.facebookPageId),
    tiktokUsername: readNullableString(record.tiktokUsername),
    linkedinPageUrl: readNullableString(record.linkedinPageUrl),
    contentFrequency: readNullableString(record.contentFrequency),
    primaryGoal: readEnumValue(record.primaryGoal, SOCIAL_MEDIA_GOAL_OPTIONS),
    toneOfVoice: readNullableString(record.toneOfVoice),
    hashtags: readStringArray(record.hashtags),
    connectionStatus:
      readEnumValue(record.connectionStatus, SOCIAL_MEDIA_CONNECTION_STATUS_OPTIONS) ?? "NOT_CONNECTED",
    lastSyncAt: readNullableString(record.lastSyncAt),
    notes: readNullableString(record.notes),
  };
}

function normalizeSummaryPost(value: unknown): SocialMediaSummaryPost | null {
  if (!isRecord(value)) {
    return null;
  }

  const platform = readEnumValue(value.platform, SOCIAL_MEDIA_PLATFORM_OPTIONS);
  const type = readEnumValue(value.type, SOCIAL_MEDIA_POST_TYPE_OPTIONS);
  const status = readEnumValue(value.status, SOCIAL_MEDIA_POST_STATUS_OPTIONS);
  if (typeof value.id !== "string" || !platform || !type || !status || typeof value.title !== "string") {
    return null;
  }

  return {
    id: value.id,
    platform,
    type,
    status,
    title: value.title,
    scheduledAt: readNullableString(value.scheduledAt),
    publishedAt: readNullableString(value.publishedAt),
    clientVisible: value.clientVisible === true,
    project: normalizeSummaryPostProject(value.project),
    updatedAt: readString(value.updatedAt),
  };
}

function normalizeSummaryPostProject(value: unknown): SocialMediaSummaryPost["project"] {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: readString(value.slug),
  };
}

function normalizeSummaryProject(value: unknown): SocialMediaSummary["contentPlan"]["projects"][number] | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: readString(value.slug),
    status: readString(value.status),
    priority: readString(value.priority),
    dueDate: readNullableString(value.dueDate),
    updatedAt: readString(value.updatedAt),
  };
}

function normalizeCreativeAsset(value: unknown): SocialMediaCreativeAsset | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.secureUrl !== "string" ||
    typeof value.mimeType !== "string"
  ) {
    return null;
  }

  const project = isRecord(value.project) ? value.project : {};
  const projectId = readString(project.id);
  const projectName = readString(project.name);

  return {
    id: value.id,
    title: value.title,
    category: readString(value.category),
    visibility: readString(value.visibility),
    secureUrl: value.secureUrl,
    mimeType: value.mimeType,
    approvalStatus: readEnumValue(value.approvalStatus, SOCIAL_MEDIA_APPROVAL_STATUS_OPTIONS),
    project: {
      id: projectId,
      name: projectName,
    },
    updatedAt: readString(value.updatedAt),
  };
}

function normalizePostAsset(value: unknown): SocialMediaPostAsset | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.sortOrder !== "number") {
    return null;
  }

  return {
    id: value.id,
    sortOrder: value.sortOrder,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    file: normalizePostAssetFile(value.file),
  };
}

function normalizePostAssetFile(value: unknown): SocialMediaPostAssetFile | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.secureUrl !== "string" ||
    typeof value.mimeType !== "string" ||
    typeof value.category !== "string" ||
    typeof value.visibility !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    secureUrl: value.secureUrl,
    mimeType: value.mimeType,
    category: value.category,
    visibility: value.visibility,
  };
}

function normalizeProjectSummary(value: unknown): SocialMediaProjectSummary | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: readNullableString(value.slug),
    serviceKey: readNullableString(value.serviceKey),
  };
}

function isSocialMediaPlatform(value: unknown): value is SocialMediaPlatform {
  return typeof value === "string" && SOCIAL_MEDIA_PLATFORM_OPTIONS.includes(value as SocialMediaPlatform);
}

function isSocialMediaPostType(value: unknown): value is SocialMediaPostType {
  return typeof value === "string" && SOCIAL_MEDIA_POST_TYPE_OPTIONS.includes(value as SocialMediaPostType);
}

function isSocialMediaPostStatus(value: unknown): value is SocialMediaPostStatus {
  return typeof value === "string" && SOCIAL_MEDIA_POST_STATUS_OPTIONS.includes(value as SocialMediaPostStatus);
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readEnumValue<T extends string>(value: unknown, allowedValues: readonly T[]): T | null {
  return typeof value === "string" && allowedValues.includes(value as T) ? (value as T) : null;
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}
