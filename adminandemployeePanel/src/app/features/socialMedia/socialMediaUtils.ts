import type { Project, ProjectFile } from "../projects/projectsTypes";
import type {
  AdminSocialMediaAssignedEmployee,
  AdminSocialMediaClientListItem,
  AdminSocialMediaClientsResponse,
  SocialMediaApprovalTaskSummary,
  SocialMediaApprovalStatus,
  SocialMediaConnectionStatus,
  SocialMediaCreativeAsset,
  SocialMediaGoal,
  SocialMediaPlatform,
  SocialMediaPost,
  SocialMediaPostAsset,
  SocialMediaReportAcknowledgementStatus,
  SocialMediaReportItem,
  SocialMediaReportsResponse,
  SocialMediaReportStatus,
  SocialMediaReportType,
  SocialMediaInsightBreakdownItem,
  SocialMediaInsightItem,
  SocialMediaInsightsResponse,
  SocialMediaInsightTrendItem,
  SocialMediaPostStatus,
  SocialMediaPostType,
  SocialMediaPostUserSummary,
  SocialMediaPostsListMeta,
  SocialMediaPostsListResponse,
  SocialMediaRiskStatus,
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

export const SOCIAL_MEDIA_REPORT_TYPE_OPTIONS: SocialMediaReportType[] = [
  "WEEKLY",
  "MONTHLY",
  "POST_PERFORMANCE",
  "CONTENT_CALENDAR",
  "CREATIVE_PERFORMANCE",
  "ENGAGEMENT_REPORT",
];

export const SOCIAL_MEDIA_REPORT_STATUS_OPTIONS: SocialMediaReportStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

const SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT_STATUS_OPTIONS: SocialMediaReportAcknowledgementStatus[] = [
  "NOT_REQUESTED",
  "PENDING",
  "ACKNOWLEDGED",
  "CHANGES_REQUESTED",
];

const SOCIAL_MEDIA_RISK_STATUS_OPTIONS: SocialMediaRiskStatus[] = [
  "READY",
  "ATTENTION",
  "BLOCKED",
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

const REPORT_TYPE_LABELS: Record<SocialMediaReportType, string> = {
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  POST_PERFORMANCE: "Post Performansı",
  CONTENT_CALENDAR: "İçerik Takvimi",
  CREATIVE_PERFORMANCE: "Kreatif Performansı",
  ENGAGEMENT_REPORT: "Etkileşim Raporu",
};

const REPORT_STATUS_LABELS: Record<SocialMediaReportStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayınlandı",
  ARCHIVED: "Arşivlendi",
};

const RISK_STATUS_LABELS: Record<SocialMediaRiskStatus, string> = {
  READY: "Hazır",
  ATTENTION: "Dikkat",
  BLOCKED: "Bloke",
};

export function normalizeSocialMediaPostsListResponse(
  response: unknown,
): SocialMediaPostsListResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  const data = Array.isArray(responseData)
    ? responseData.map(normalizeSocialMediaPost).filter(isDefined)
    : [];
  const meta = normalizeListMeta(isRecord(response) ? response.meta : null, data.length);

  return { data, meta };
}

export function normalizeSocialMediaPostResponse(response: unknown): SocialMediaPost {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const post = normalizeSocialMediaPost(candidate);

  if (post) {
    return post;
  }

  throw new Error("Social media post response could not be parsed.");
}

export function normalizeSocialMediaSummaryResponse(response: unknown): SocialMediaSummary | null {
  const candidate = isRecord(response) && "data" in response && isRecord(response.data)
    ? response.data
    : response;

  return normalizeSocialMediaSummary(candidate);
}

export function normalizeSocialMediaInsightsResponse(response: unknown): SocialMediaInsightsResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  const data = Array.isArray(responseData)
    ? responseData.map(normalizeSocialMediaInsight).filter(isDefined)
    : [];
  const meta = isRecord(response) ? response.meta : null;

  return {
    data,
    meta: normalizeInsightsMeta(meta, data.length),
  };
}

export function normalizeSocialMediaInsightResponse(response: unknown): SocialMediaInsightItem {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const insight = normalizeSocialMediaInsight(candidate);

  if (insight) {
    return insight;
  }

  throw new Error("Social media insight response could not be parsed.");
}

export function normalizeSocialMediaReportsResponse(response: unknown): SocialMediaReportsResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  const data = Array.isArray(responseData)
    ? responseData.map(normalizeSocialMediaReport).filter(isDefined)
    : [];
  const meta = isRecord(response) ? response.meta : null;

  return {
    data,
    meta: normalizeReportsMeta(meta, data.length),
  };
}

export function normalizeSocialMediaReportResponse(response: unknown): SocialMediaReportItem {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const report = normalizeSocialMediaReport(candidate);

  if (report) {
    return report;
  }

  throw new Error("Social media report response could not be parsed.");
}

export function normalizeAdminSocialMediaClientsResponse(
  response: unknown,
): AdminSocialMediaClientsResponse {
  const candidate = isRecord(response) && "data" in response && isRecord(response.data)
    ? response.data
    : response;
  const rowsSource = isRecord(candidate) ? candidate.data : undefined;
  const metaSource = isRecord(candidate) && isRecord(candidate.meta) ? candidate.meta : {};

  return {
    data: Array.isArray(rowsSource)
      ? rowsSource.map(normalizeAdminSocialMediaClientListItem).filter(isDefined)
      : [],
    meta: {
      total: readNumber(metaSource.total, 0),
      ready: readNumber(metaSource.ready, 0),
      attention: readNumber(metaSource.attention, 0),
      blocked: readNumber(metaSource.blocked, 0),
      overdueScheduledPosts: readNumber(metaSource.overdueScheduledPosts, 0),
      pendingApprovals: readNumber(metaSource.pendingApprovals, 0),
      generatedAt: readNullableString(metaSource.generatedAt),
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

export function getSocialMediaReportTypeLabel(type: SocialMediaReportType): string {
  return REPORT_TYPE_LABELS[type] ?? type;
}

export function getSocialMediaReportStatusLabel(status: SocialMediaReportStatus): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}

export function getSocialMediaRiskStatusLabel(status: SocialMediaRiskStatus): string {
  return RISK_STATUS_LABELS[status] ?? status;
}

export function getSocialMediaRiskStatusBadgeClass(status: SocialMediaRiskStatus): string {
  if (status === "READY") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "ATTENTION") {
    return "border-amber-400/40 bg-amber-500/15 text-amber-200";
  }

  return "border-red-400/40 bg-red-500/15 text-red-200";
}

export function getSocialMediaPostStatusBadgeClass(status: SocialMediaPostStatus): string {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "SCHEDULED") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }

  if (status === "WAITING_APPROVAL" || status === "DESIGN") {
    return "border-amber-400/40 bg-amber-500/15 text-amber-200";
  }

  if (status === "REJECTED" || status === "REVISION_REQUIRED" || status === "CANCELLED") {
    return "border-red-400/40 bg-red-500/15 text-red-200";
  }

  return "border-white/[0.12] bg-white/[0.06] text-[#E5E5E5]";
}

export function formatSocialMediaDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): string | null {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const date = new Date(trimmedValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeAdminSocialMediaClientListItem(
  value: unknown,
): AdminSocialMediaClientListItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const client = isRecord(value.client) ? value.client : {};
  const metrics = normalizeSocialMediaMetrics(value.metrics);
  const assignedEmployees = Array.isArray(value.assignedEmployees)
    ? value.assignedEmployees.map(normalizeAssignedEmployee).filter(isDefined)
    : [];
  const assignedSocialMediaSpecialists = Array.isArray(value.assignedSocialMediaSpecialists)
    ? value.assignedSocialMediaSpecialists.map(normalizeAssignedEmployee).filter(isDefined)
    : assignedEmployees.filter((employee) => employee.scope === "SOCIAL_MEDIA");
  const assignedDesigners = Array.isArray(value.assignedDesigners)
    ? value.assignedDesigners.map(normalizeAssignedEmployee).filter(isDefined)
    : assignedEmployees.filter(
        (employee) => employee.scope === "DESIGN" || employee.role === "DESIGNER",
      );
  const risk = isRecord(value.risk) ? value.risk : {};
  const actionContext = isRecord(value.actionContext) ? value.actionContext : {};
  const meta = isRecord(value.meta) ? value.meta : {};

  if (
    typeof client.id !== "string" ||
    typeof client.slug !== "string" ||
    typeof client.companyName !== "string"
  ) {
    return null;
  }

  return {
    client: {
      id: client.id,
      slug: client.slug,
      companyName: client.companyName,
      status: readClientStatus(client.status),
    },
    serviceStatus: readPurchasedServiceStatus(value.serviceStatus),
    service: normalizeSocialMediaService(value.service),
    config: normalizeSocialMediaSummaryConfig(value.config),
    state: readEnumValue(value.state, SOCIAL_MEDIA_SUMMARY_STATE_OPTIONS) ?? "NO_DATA",
    metrics: {
      ...metrics,
      overdueScheduledPosts: readNumber(metrics.overdueScheduledPosts, 0),
    },
    contentPlan: normalizeSocialMediaContentPlan(value.contentPlan),
    creativeAssets: Array.isArray(value.creativeAssets)
      ? value.creativeAssets.map(normalizeCreativeAsset).filter(isDefined)
      : [],
    assignedEmployees,
    assignedSocialMediaSpecialists,
    assignedDesigners,
    risk: {
      status: readEnumValue(risk.status, SOCIAL_MEDIA_RISK_STATUS_OPTIONS) ?? "ATTENTION",
      reasons: readStringArray(risk.reasons),
    },
    lastReport: null,
    actionContext: {
      socialMediaProjectId: readNullableString(actionContext.socialMediaProjectId),
    },
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      lastUpdatedAt: readNullableString(meta.lastUpdatedAt),
    },
  };
}

function normalizeSocialMediaSummary(value: unknown): SocialMediaSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const client = isRecord(value.client) ? value.client : {};
  const meta = isRecord(value.meta) ? value.meta : {};

  return {
    client: {
      id: readString(client.id),
      name: readString(client.name),
      slug: readString(client.slug),
      status: readString(client.status),
    },
    service: normalizeSocialMediaService(value.service),
    config: normalizeSocialMediaSummaryConfig(value.config),
    state: readEnumValue(value.state, SOCIAL_MEDIA_SUMMARY_STATE_OPTIONS) ?? "NO_DATA",
    metrics: normalizeSocialMediaMetrics(value.metrics),
    contentPlan: normalizeSocialMediaContentPlan(value.contentPlan),
    creativeAssets: Array.isArray(value.creativeAssets)
      ? value.creativeAssets.map(normalizeCreativeAsset).filter(isDefined)
      : [],
    meta: {
      generatedAt: readNullableString(meta.generatedAt),
      lastUpdatedAt: readNullableString(meta.lastUpdatedAt),
      sources: readStringArray(meta.sources),
    },
  };
}

function normalizeSocialMediaService(value: unknown): SocialMediaSummary["service"] {
  const service = isRecord(value) ? value : {};

  return {
    hasActiveService: service.hasActiveService === true,
    status: readNullablePurchasedServiceStatus(service.status),
    startedAt: readNullableString(service.startedAt),
    updatedAt: readNullableString(service.updatedAt),
  };
}

function normalizeSocialMediaMetrics(
  value: unknown,
): SocialMediaSummary["metrics"] & { overdueScheduledPosts?: number } {
  const metrics = isRecord(value) ? value : {};

  return {
    projects: readNumber(metrics.projects, 0),
    tasks: readNumber(metrics.tasks, 0),
    plannedPosts: readNumber(metrics.plannedPosts, 0),
    publishedPosts: readNumber(metrics.publishedPosts, 0),
    inDesignPosts: readNumber(metrics.inDesignPosts, 0),
    pendingApprovals: readNumber(metrics.pendingApprovals, 0),
    rejectedPosts: readNumber(metrics.rejectedPosts, 0),
    creativeAssets: readNumber(metrics.creativeAssets, 0),
    openTodos: readNumber(metrics.openTodos, 0),
    completedTodos: readNumber(metrics.completedTodos, 0),
    overdueScheduledPosts: readNumber(metrics.overdueScheduledPosts, 0),
  };
}

function normalizeSocialMediaContentPlan(value: unknown): SocialMediaSummary["contentPlan"] {
  const contentPlan = isRecord(value) ? value : {};

  return {
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
  };
}

function normalizeSocialMediaSummaryConfig(value: unknown): SocialMediaSummaryConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    activePlatforms: readSocialMediaPlatforms(value.activePlatforms),
    instagramUsername: readNullableString(value.instagramUsername),
    instagramAccountId: readNullableString(value.instagramAccountId),
    facebookPageId: readNullableString(value.facebookPageId),
    tiktokUsername: readNullableString(value.tiktokUsername),
    linkedinPageUrl: readNullableString(value.linkedinPageUrl),
    contentFrequency: readNullableString(value.contentFrequency),
    primaryGoal: readEnumValue(value.primaryGoal, SOCIAL_MEDIA_GOAL_OPTIONS),
    toneOfVoice: readNullableString(value.toneOfVoice),
    hashtags: readStringArray(value.hashtags),
    connectionStatus:
      readEnumValue(value.connectionStatus, SOCIAL_MEDIA_CONNECTION_STATUS_OPTIONS) ?? "NOT_CONNECTED",
    lastSyncAt: readNullableString(value.lastSyncAt),
    notes: readNullableString(value.notes),
  };
}

function readSocialMediaPlatforms(value: unknown): SocialMediaPlatform[] {
  return Array.isArray(value)
    ? value.filter((item): item is SocialMediaPlatform => isSocialMediaPlatform(item))
    : [];
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

function normalizeCreativeAsset(value: unknown): SocialMediaCreativeAsset | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  const project = isRecord(value.project) ? value.project : {};

  return {
    id: value.id,
    title: value.title,
    category: readString(value.category),
    visibility: readString(value.visibility),
    secureUrl: readString(value.secureUrl),
    mimeType: readString(value.mimeType),
    approvalStatus: readEnumValue(value.approvalStatus, SOCIAL_MEDIA_APPROVAL_STATUS_OPTIONS),
    project: {
      id: readString(project.id),
      name: readString(project.name),
    },
    updatedAt: readString(value.updatedAt),
  };
}

function normalizeAssignedEmployee(value: unknown): AdminSocialMediaAssignedEmployee | null {
  if (!isRecord(value) || typeof value.userId !== "string" || typeof value.email !== "string") {
    return null;
  }

  return {
    userId: value.userId,
    email: value.email,
    displayName: readNullableString(value.displayName),
    role: readString(value.role),
    status: readString(value.status),
    scope: readString(value.scope),
  };
}

function normalizeSocialMediaInsight(value: unknown): SocialMediaInsightItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const platform = readEnumValue(value.platform, SOCIAL_MEDIA_PLATFORM_OPTIONS);
  const post = normalizeInsightPost(value.post);

  if (
    typeof value.id !== "string" ||
    typeof value.postId !== "string" ||
    typeof value.clientProfileId !== "string" ||
    !platform ||
    typeof value.date !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !post
  ) {
    return null;
  }

  return {
    id: value.id,
    postId: value.postId,
    clientProfileId: value.clientProfileId,
    platform,
    date: value.date,
    impressions: readNumber(value.impressions, 0),
    reach: readNumber(value.reach, 0),
    likes: readNumber(value.likes, 0),
    comments: readNumber(value.comments, 0),
    shares: readNumber(value.shares, 0),
    saves: readNumber(value.saves, 0),
    profileVisits: readNumber(value.profileVisits, 0),
    follows: readNumber(value.follows, 0),
    clicks: readNumber(value.clicks, 0),
    engagementRate: readNumber(value.engagementRate, 0),
    raw: isRecord(value.raw) ? value.raw : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    post,
  };
}

function normalizeInsightPost(value: unknown): SocialMediaInsightItem["post"] | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = readEnumValue(value.type, SOCIAL_MEDIA_POST_TYPE_OPTIONS);
  const status = readEnumValue(value.status, SOCIAL_MEDIA_POST_STATUS_OPTIONS);
  if (typeof value.id !== "string" || typeof value.title !== "string" || !type || !status) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    type,
    status,
    scheduledAt: readNullableString(value.scheduledAt),
    publishedAt: readNullableString(value.publishedAt),
    externalPostUrl: readNullableString(value.externalPostUrl),
    clientVisible: value.clientVisible === true,
  };
}

function normalizeSocialMediaReport(value: unknown): SocialMediaReportItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = readEnumValue(value.type, SOCIAL_MEDIA_REPORT_TYPE_OPTIONS);
  const status = readEnumValue(value.status, SOCIAL_MEDIA_REPORT_STATUS_OPTIONS);
  const acknowledgementStatus =
    readEnumValue(
      value.acknowledgementStatus,
      SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT_STATUS_OPTIONS,
    ) ?? "NOT_REQUESTED";

  if (
    typeof value.id !== "string" ||
    typeof value.clientProfileId !== "string" ||
    typeof value.periodStart !== "string" ||
    typeof value.periodEnd !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !type ||
    !status
  ) {
    return null;
  }

  return {
    id: value.id,
    clientProfileId: value.clientProfileId,
    projectId: readNullableString(value.projectId),
    projectName: readNullableString(value.projectName),
    periodStart: value.periodStart,
    periodEnd: value.periodEnd,
    type,
    status,
    summary: readNullableString(value.summary),
    metricsSnapshot: isRecord(value.metricsSnapshot) ? value.metricsSnapshot : null,
    clientVisible: value.clientVisible === true,
    publishedAt: readNullableString(value.publishedAt),
    acknowledgementRequestedAt: readNullableString(value.acknowledgementRequestedAt),
    acknowledgedAt: readNullableString(value.acknowledgedAt),
    acknowledgementStatus,
    acknowledgementTaskId: readNullableString(value.acknowledgementTaskId),
    acknowledgementTaskUpdatedAt: readNullableString(value.acknowledgementTaskUpdatedAt),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
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
    !isStringOrNull(value.approvalTaskId) ||
    !isStringOrNull(value.createdByUserId) ||
    !isStringOrNull(value.assignedToUserId) ||
    !isStringOrNull(value.externalPostId) ||
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
    approvalTaskId: value.approvalTaskId,
    createdByUserId: value.createdByUserId,
    assignedToUserId: value.assignedToUserId,
    externalPostId: value.externalPostId,
    externalPostUrl: value.externalPostUrl,
    externalMediaUrl: readNullableString(value.externalMediaUrl),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    project: normalizeProjectSummary(value.project),
    approvalTask: normalizeApprovalTask(value.approvalTask),
    createdBy: normalizeUserSummary(value.createdBy),
    assignedTo: normalizeUserSummary(value.assignedTo),
    assets: Array.isArray(value.assets)
      ? value.assets.map(normalizePostAsset).filter(isDefined)
      : [],
  };
}

function normalizePostAsset(value: unknown): SocialMediaPostAsset | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.sortOrder !== "number" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  const file = normalizeProjectFile(value.file);

  return {
    id: value.id,
    postId: readNullableString(value.postId),
    projectFileId: readNullableString(value.projectFileId) ?? readNullableString(value.fileId) ?? file?.id ?? null,
    sortOrder: value.sortOrder,
    createdAt: value.createdAt,
    file,
  };
}

function normalizeProjectSummary(value: unknown): Project | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  return value as Project;
}

function normalizeProjectFile(value: unknown): ProjectFile | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.projectId !== "string") {
    return null;
  }

  return value as ProjectFile;
}

function normalizeUserSummary(value: unknown): SocialMediaPostUserSummary | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    displayName: isStringOrNull(value.displayName) ? value.displayName : null,
    email: isStringOrNull(value.email) ? value.email ?? undefined : undefined,
    role: isStringOrNull(value.role) ? value.role ?? undefined : undefined,
  };
}

function normalizeApprovalTask(value: unknown): SocialMediaApprovalTaskSummary | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    status: isStringOrNull(value.status) ? value.status : null,
  };
}

function normalizeInsightsMeta(
  meta: unknown,
  dataLength: number,
): SocialMediaInsightsResponse["meta"] {
  const pagination = normalizeListMeta(meta, dataLength);
  const source = isRecord(meta) ? meta : {};
  const totals = isRecord(source.totals) ? source.totals : {};

  return {
    ...pagination,
    generatedAt: readNullableString(source.generatedAt),
    totals: {
      impressions: readNumber(totals.impressions, 0),
      reach: readNumber(totals.reach, 0),
      likes: readNumber(totals.likes, 0),
      comments: readNumber(totals.comments, 0),
      shares: readNumber(totals.shares, 0),
      saves: readNumber(totals.saves, 0),
      profileVisits: readNumber(totals.profileVisits, 0),
      follows: readNumber(totals.follows, 0),
      clicks: readNumber(totals.clicks, 0),
      engagementRate: readNumber(totals.engagementRate, 0),
    },
    topPosts: Array.isArray(source.topPosts)
      ? source.topPosts.map(normalizeTopPostInsight).filter(isDefined)
      : [],
    platformBreakdown: Array.isArray(source.platformBreakdown)
      ? source.platformBreakdown.map(normalizeInsightBreakdown).filter(isDefined)
      : [],
    typeBreakdown: Array.isArray(source.typeBreakdown)
      ? source.typeBreakdown.map(normalizeInsightBreakdown).filter(isDefined)
      : [],
    trend: Array.isArray(source.trend)
      ? source.trend.map(normalizeInsightTrend).filter(isDefined)
      : [],
  };
}

function normalizeReportsMeta(meta: unknown, dataLength: number): SocialMediaReportsResponse["meta"] {
  const pagination = normalizeListMeta(meta, dataLength);
  const source = isRecord(meta) ? meta : {};

  return {
    ...pagination,
    draft: readNumber(source.draft, 0),
    published: readNumber(source.published, 0),
    clientVisible: readNumber(source.clientVisible, 0),
  };
}

function normalizeTopPostInsight(
  value: unknown,
): SocialMediaInsightsResponse["meta"]["topPosts"][number] | null {
  if (!isRecord(value)) {
    return null;
  }

  const platform = readEnumValue(value.platform, SOCIAL_MEDIA_PLATFORM_OPTIONS);
  const type = readEnumValue(value.type, SOCIAL_MEDIA_POST_TYPE_OPTIONS);
  if (typeof value.postId !== "string" || typeof value.title !== "string" || !platform || !type) {
    return null;
  }

  return {
    postId: value.postId,
    title: value.title,
    platform,
    type,
    engagementRate: readNumber(value.engagementRate, 0),
    engagementScore: readNumber(value.engagementScore, 0),
  };
}

function normalizeInsightBreakdown(value: unknown): SocialMediaInsightBreakdownItem | null {
  if (!isRecord(value) || typeof value.key !== "string") {
    return null;
  }

  return {
    key: value.key,
    impressions: readNumber(value.impressions, 0),
    reach: readNumber(value.reach, 0),
    engagements: readNumber(value.engagements, 0),
    engagementRate: readNumber(value.engagementRate, 0),
  };
}

function normalizeInsightTrend(value: unknown): SocialMediaInsightTrendItem | null {
  if (!isRecord(value) || typeof value.date !== "string") {
    return null;
  }

  return {
    date: value.date,
    impressions: readNumber(value.impressions, 0),
    reach: readNumber(value.reach, 0),
    engagements: readNumber(value.engagements, 0),
    engagementRate: readNumber(value.engagementRate, 0),
  };
}

function normalizeListMeta(meta: unknown, dataLength: number): SocialMediaPostsListMeta {
  if (!isRecord(meta)) {
    return {
      page: 1,
      limit: dataLength,
      total: dataLength,
      totalPages: 1,
    };
  }

  const total = readNumber(meta.total, dataLength);
  const limit = Math.max(readNumber(meta.limit, dataLength || 1), 1);
  const totalPages = Math.max(readNumber(meta.totalPages, Math.ceil(total / limit) || 1), 1);
  const page = Math.min(Math.max(readNumber(meta.page, 1), 1), totalPages);

  return { page, limit, total, totalPages };
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

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readEnumValue<T extends string>(value: unknown, values: readonly T[]): T | null {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : null;
}

function readClientStatus(value: unknown): AdminSocialMediaClientListItem["client"]["status"] {
  return value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function readPurchasedServiceStatus(value: unknown): AdminSocialMediaClientListItem["serviceStatus"] {
  if (value === "PAUSED" || value === "INACTIVE" || value === "SUSPENDED") {
    return value;
  }

  return "ACTIVE";
}

function readNullablePurchasedServiceStatus(
  value: unknown,
): AdminSocialMediaClientListItem["serviceStatus"] | null {
  return value === null || value === undefined ? null : readPurchasedServiceStatus(value);
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}
