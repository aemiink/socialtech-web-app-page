import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { extractApiErrorMessage } from "../adminUsers/adminUsersUtils";
import type {
  BackendPurchasedServiceKey,
  BackendPurchasedServiceStatus,
  ClientProfile,
  ClientPurchasedService,
  ClientStatus,
  ClientsListMeta,
  ClientsListResponse,
  ClientSummaryRecentProject,
  ClientSummaryRecentTask,
  ClientSummaryResponse,
  PurchasedServiceStatus,
  ServiceKey,
} from "./clientsTypes";

export { extractApiErrorMessage };

export const CLIENT_STATUS_OPTIONS: ClientStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];
export const SERVICE_CATALOG: Array<{ key: ServiceKey; label: string }> = [
  { key: "growth-hub", label: "Growth & Hub" },
  { key: "social-media", label: "Social Media" },
  { key: "media-hub", label: "Media Hub" },
  { key: "meta-ads", label: "Meta ADS" },
  { key: "tiktok-ads", label: "TikTok ADS" },
  { key: "google-ads", label: "Google ADS" },
  { key: "amazon-ads", label: "Amazon ADS" },
  { key: "web-app", label: "Web APP" },
  { key: "mobile-app", label: "Mobile APP" },
  { key: "landing-pages", label: "Landing Pages" },
  { key: "web-mobile-design", label: "Web & Mobile Design" },
  { key: "technical-support", label: "Technical Support" },
  { key: "seo-audit", label: "SEO Audit" },
];
export const SERVICE_KEY_OPTIONS: ServiceKey[] = SERVICE_CATALOG.map((service) => service.key);
export const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CLIENT_OWNER_PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
export const CLIENT_OWNER_PASSWORD_NUMBER_PATTERN = /[0-9]/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UI_TO_BACKEND_SERVICE_KEY_MAP: Record<ServiceKey, BackendPurchasedServiceKey> = {
  "growth-hub": "GROWTH_HUB",
  "social-media": "SOCIAL_MEDIA",
  "media-hub": "MEDIA_HUB",
  "medya-hub": "MEDIA_HUB",
  "meta-ads": "META_ADS",
  "tiktok-ads": "TIKTOK_ADS",
  "google-ads": "GOOGLE_ADS",
  "amazon-ads": "AMAZON_ADS",
  "web-app": "WEB_APP",
  "mobile-app": "MOBILE_APP",
  "landing-page": "LANDING_PAGE",
  "landing-pages": "LANDING_PAGE",
  "web-mobile-design": "WEB_MOBILE_DESIGN",
  "technical-support": "TECHNICAL_SUPPORT",
  "seo-audit": "SEO_AUDIT",
};

const BACKEND_TO_UI_SERVICE_KEY_MAP: Record<BackendPurchasedServiceKey, ServiceKey> = {
  GROWTH_HUB: "growth-hub",
  SOCIAL_MEDIA: "social-media",
  MEDIA_HUB: "media-hub",
  MEDYA_HUB: "media-hub",
  META_ADS: "meta-ads",
  TIKTOK_ADS: "tiktok-ads",
  GOOGLE_ADS: "google-ads",
  AMAZON_ADS: "amazon-ads",
  WEB_APP: "web-app",
  MOBILE_APP: "mobile-app",
  LANDING_PAGE: "landing-pages",
  LANDING_PAGES: "landing-pages",
  WEB_MOBILE_DESIGN: "web-mobile-design",
  TECHNICAL_SUPPORT: "technical-support",
  SEO_AUDIT: "seo-audit",
};

export function normalizeClientsListResponse(response: unknown): ClientsListResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  const data = Array.isArray(responseData)
    ? responseData.map(normalizeClientProfile).filter(isDefined)
    : [];
  const meta = normalizeListMeta(isRecord(response) ? response.meta : null, data.length);

  return { data, meta };
}

export function normalizeClientResponse(response: unknown): ClientProfile {
  const candidate = getClientCandidate(response);

  const client = normalizeClientProfile(candidate);
  if (client) {
    return client;
  }

  throw new Error("Client detail response could not be parsed.");
}

export function normalizeClientSummaryResponse(response: unknown): ClientSummaryResponse {
  const candidate = isRecord(response) && "data" in response ? response.data : response;

  if (!isRecord(candidate)) {
    throw new Error("Client summary response could not be parsed.");
  }

  const clientCandidate = candidate.client ?? candidate.clientProfile;
  const client = normalizeClientSummaryClient(clientCandidate);
  if (!client) {
    throw new Error("Client summary response could not be parsed.");
  }

  const projectsSource = candidate.projects;
  const tasksSource = candidate.tasks;

  return {
    client,
    projects: normalizeProjectSummary(
      candidate.projectCounts ?? readNested(projectsSource, "counts") ?? projectsSource,
      candidate.recentProjects ?? readNested(projectsSource, "recent"),
    ),
    tasks: normalizeTaskSummary(
      candidate.taskCounts ?? readNested(tasksSource, "counts") ?? tasksSource,
      candidate.recentTasks ?? readNested(tasksSource, "recent"),
    ),
    meta: normalizeClientSummaryMeta(candidate.meta),
  };
}

export function formatClientDate(value: string | null): string {
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
  }).format(date);
}

export function formatClientDateTime(value: string | null): string {
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

export function validateClientName(name: string): string | null {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return "Müşteri adı gereklidir.";
  }

  if (normalizedName.length < 2) {
    return "Müşteri adı en az 2 karakter olmalıdır.";
  }

  if (normalizedName.length > 160) {
    return "Müşteri adı en fazla 160 karakter olabilir.";
  }

  return null;
}

export function validateClientSlug(slug: string): string | null {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  if (normalizedSlug.length < 2) {
    return "Slug en az 2 karakter olmalıdır.";
  }

  if (normalizedSlug.length > 80) {
    return "Slug en fazla 80 karakter olabilir.";
  }

  if (!CLIENT_SLUG_PATTERN.test(normalizedSlug)) {
    return "Slug sadece küçük harf, rakam ve tek tire içerebilir.";
  }

  return null;
}

export function validateClientOwnerEmail(email: string): string | null {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "Sahip e-posta adresi gereklidir.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "Geçerli bir sahip e-posta adresi girin.";
  }

  return null;
}

export function validateClientOwnerDisplayName(displayName: string): string | null {
  const normalizedDisplayName = displayName.trim();

  if (!normalizedDisplayName) {
    return "Sahip adı gereklidir.";
  }

  if (normalizedDisplayName.length < 2) {
    return "Sahip adı en az 2 karakter olmalıdır.";
  }

  return null;
}

export function validateClientOwnerPassword(password: string): string | null {
  if (!password) {
    return "Sahip geçici şifresi gereklidir.";
  }

  if (password.length < 8) {
    return "Sahip geçici şifresi en az 8 karakter olmalıdır.";
  }

  if (password.length > 72) {
    return "Sahip geçici şifresi en fazla 72 karakter olabilir.";
  }

  if (!CLIENT_OWNER_PASSWORD_LETTER_PATTERN.test(password)) {
    return "Sahip geçici şifresi en az bir harf içermelidir.";
  }

  if (!CLIENT_OWNER_PASSWORD_NUMBER_PATTERN.test(password)) {
    return "Sahip geçici şifresi en az bir rakam içermelidir.";
  }

  return null;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function isNotFoundError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && error.status === 404;
}

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

export function getClientStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return "Belirtilmedi";
  }

  if (status === "ACTIVE") {
    return "Aktif";
  }

  if (status === "INACTIVE") {
    return "Pasif";
  }

  if (status === "SUSPENDED") {
    return "Askıya Alındı";
  }

  return status;
}

export function getClientStatusBadgeClass(status: string | null | undefined): string {
  if (status === "ACTIVE") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "INACTIVE") {
    return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
  }

  if (status === "SUSPENDED") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.08] text-[#E5E5E5]";
}

export function getServiceLabel(serviceKey: string | null | undefined): string {
  const normalizedServiceKey = normalizeToUiServiceKey(serviceKey);
  const service = SERVICE_CATALOG.find((item) => item.key === normalizedServiceKey);
  return service?.label ?? serviceKey ?? "Belirtilmedi";
}

export function toBackendServiceKey(serviceKey: ServiceKey): BackendPurchasedServiceKey {
  return UI_TO_BACKEND_SERVICE_KEY_MAP[serviceKey];
}

export function normalizeToUiServiceKey(value: unknown): ServiceKey | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  if (isServiceKey(normalized)) {
    return normalized;
  }

  if (normalized.toLowerCase() === "medya-hub") {
    return "media-hub";
  }

  if (normalized.toLowerCase() === "landing-page") {
    return "landing-pages";
  }

  const upperValue = normalized.toUpperCase();
  if (isBackendPurchasedServiceKey(upperValue)) {
    return BACKEND_TO_UI_SERVICE_KEY_MAP[upperValue];
  }

  return null;
}

export function getClientPurchasedServices(client: ClientProfile): ClientPurchasedService[] {
  return client.purchasedServices ?? [];
}

export function getActivePurchasedServices(client: ClientProfile): ClientPurchasedService[] {
  return getClientPurchasedServices(client).filter((service) => service.status === "ACTIVE");
}

export function getActivePurchasedServiceKeys(client: ClientProfile): ServiceKey[] {
  return getActivePurchasedServices(client).map((service) => service.serviceKey);
}

export function getPurchasedServicesSummary(client: ClientProfile): string {
  const activeServices = getActivePurchasedServices(client);

  if (activeServices.length === 0) {
    return "Hizmet yok";
  }

  const [firstService, secondService, ...remainingServices] = activeServices;
  const labels = [firstService, secondService]
    .filter(isDefined)
    .map((service) => getServiceLabel(service.serviceKey));

  return remainingServices.length > 0
    ? `${labels.join(", ")} +${remainingServices.length}`
    : labels.join(", ");
}

export function getClientProjectStatusLabel(status: string | null | undefined): string {
  if (status === "PLANNED") {
    return "Planlandı";
  }

  if (status === "IN_PROGRESS") {
    return "Devam Ediyor";
  }

  if (status === "REVIEW") {
    return "İncelemede";
  }

  if (status === "COMPLETED") {
    return "Tamamlandı";
  }

  if (status === "ON_HOLD") {
    return "Beklemede";
  }

  return status ?? "Belirtilmedi";
}

export function getClientTaskStatusLabel(status: string | null | undefined): string {
  if (status === "TODO") {
    return "Yapılacak";
  }

  if (status === "IN_PROGRESS") {
    return "Devam Ediyor";
  }

  if (status === "REVIEW") {
    return "İncelemede";
  }

  if (status === "DONE") {
    return "Tamamlandı";
  }

  if (status === "BLOCKED") {
    return "Bloke";
  }

  return status ?? "Belirtilmedi";
}

export function getClientPriorityLabel(priority: string | null | undefined): string {
  if (priority === "LOW") {
    return "Düşük";
  }

  if (priority === "MEDIUM") {
    return "Normal";
  }

  if (priority === "HIGH") {
    return "Yüksek";
  }

  if (priority === "URGENT") {
    return "Acil";
  }

  return priority ?? "Belirtilmedi";
}

export function getClientProjectStatusBadgeClass(status: string | null | undefined): string {
  if (status === "COMPLETED") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "IN_PROGRESS") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }

  if (status === "REVIEW") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }

  if (status === "ON_HOLD") {
    return "border-white/[0.12] bg-white/[0.08] text-[#E5E5E5]";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getClientTaskStatusBadgeClass(status: string | null | undefined): string {
  if (status === "DONE") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "IN_PROGRESS") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }

  if (status === "REVIEW") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }

  if (status === "BLOCKED") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getClientPriorityBadgeClass(priority: string | null | undefined): string {
  if (priority === "URGENT") {
    return "bg-red-600 text-white";
  }

  if (priority === "HIGH") {
    return "bg-orange-500 text-white";
  }

  if (priority === "LOW") {
    return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
  }

  return "border-white/[0.12] bg-white/[0.08] text-[#E5E5E5]";
}

function normalizeProjectSummary(
  countsValue: unknown,
  recentValue: unknown,
): ClientSummaryResponse["projects"] {
  const counts = normalizeProjectCounts(countsValue);

  return {
    ...counts,
    recent: normalizeRecentProjects(recentValue),
  };
}

function normalizeTaskSummary(
  countsValue: unknown,
  recentValue: unknown,
): ClientSummaryResponse["tasks"] {
  const counts = normalizeTaskCounts(countsValue);

  return {
    ...counts,
    recent: normalizeRecentTasks(recentValue),
  };
}

function normalizeProjectCounts(
  value: unknown,
): Omit<ClientSummaryResponse["projects"], "recent"> {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total, 0),
    planned: readNumber(record.planned, 0),
    inProgress: readNumber(record.inProgress, 0),
    review: readNumber(record.review, 0),
    completed: readNumber(record.completed, 0),
    onHold: readNumber(record.onHold, 0),
  };
}

function normalizeTaskCounts(value: unknown): Omit<ClientSummaryResponse["tasks"], "recent"> {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total, 0),
    todo: readNumber(record.todo, 0),
    inProgress: readNumber(record.inProgress, 0),
    review: readNumber(record.review, 0),
    done: readNumber(record.done, 0),
    blocked: readNumber(record.blocked, 0),
  };
}

function normalizeRecentProjects(value: unknown): ClientSummaryRecentProject[] {
  return Array.isArray(value) ? value.filter(isClientSummaryProject).slice(0, 5) : [];
}

function normalizeRecentTasks(value: unknown): ClientSummaryRecentTask[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeClientSummaryTask).filter(isDefined).slice(0, 5);
}

function isClientSummaryProject(value: unknown): value is ClientSummaryRecentProject {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    typeof value.priority === "string" &&
    isStringOrNull(value.dueDate) &&
    typeof value.updatedAt === "string"
  );
}

function normalizeClientSummaryTask(value: unknown): ClientSummaryRecentTask | null {
  if (!isRecord(value)) {
    return null;
  }

  const projectId = typeof value.projectId === "string"
    ? value.projectId
    : readNested(value.project, "id");

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.status !== "string" ||
    typeof value.priority !== "string" ||
    !isStringOrNull(value.dueDate) ||
    typeof value.updatedAt !== "string" ||
    typeof projectId !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    status: value.status as ClientSummaryRecentTask["status"],
    priority: value.priority as ClientSummaryRecentTask["priority"],
    dueDate: value.dueDate,
    updatedAt: value.updatedAt,
    projectId,
  };
}

function normalizeClientSummaryClient(value: unknown): ClientSummaryResponse["client"] | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = typeof value.name === "string"
    ? value.name
    : typeof value.companyName === "string"
      ? value.companyName
      : null;

  if (
    typeof value.id !== "string" ||
    typeof name !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.status !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    name,
    slug: value.slug,
    status: value.status as ClientStatus,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function getClientCandidate(response: unknown): unknown {
  if (!isRecord(response)) {
    return response;
  }

  if ("data" in response) {
    return getClientCandidate(response.data);
  }

  if ("client" in response) {
    return response.client;
  }

  if ("clientProfile" in response) {
    return response.clientProfile;
  }

  return response;
}

function normalizeClientSummaryMeta(value: unknown): ClientSummaryResponse["meta"] {
  const generatedAt = readNested(value, "generatedAt");

  return {
    generatedAt: typeof generatedAt === "string" ? generatedAt : "",
  };
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function readNested(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function normalizeListMeta(meta: unknown, dataLength: number): ClientsListMeta {
  if (!isRecord(meta)) {
    return createFallbackMeta(dataLength);
  }

  const total = readNumber(meta.total, dataLength);
  const limit = Math.max(readNumber(meta.limit, dataLength || 1), 1);
  const totalPages = Math.max(readNumber(meta.totalPages, Math.ceil(total / limit) || 1), 1);
  const page = Math.min(Math.max(readNumber(meta.page, 1), 1), totalPages);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: readBoolean(meta.hasNextPage, page < totalPages),
    hasPreviousPage: readBoolean(meta.hasPreviousPage, page > 1),
  };
}

function createFallbackMeta(dataLength: number): ClientsListMeta {
  return {
    page: 1,
    limit: dataLength,
    total: dataLength,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function normalizeClientProfile(value: unknown): ClientProfile | null {
  if (!isClientProfile(value)) {
    return null;
  }

  if (!isRecord(value) || !("purchasedServices" in value)) {
    return value;
  }

  return {
    ...value,
    purchasedServices: normalizePurchasedServices(value.purchasedServices),
  };
}

function isClientProfile(value: unknown): value is ClientProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.companyName === "string" &&
    isStringOrNull(value.contactEmail) &&
    isOptionalStringOrNull(value.status) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function normalizePurchasedServices(value: unknown): ClientPurchasedService[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizePurchasedService).filter(isDefined);
}

function normalizePurchasedService(value: unknown): ClientPurchasedService | null {
  if (typeof value === "string") {
    const normalizedServiceKey = normalizeToUiServiceKey(value);
    return normalizedServiceKey
      ? {
          serviceKey: normalizedServiceKey,
          status: "ACTIVE",
        }
      : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const serviceKey = normalizeToUiServiceKey(value.serviceKey);
  if (!serviceKey) {
    return null;
  }

  return {
    serviceKey,
    status: normalizePurchasedServiceStatus(value.status),
    startedAt: isStringOrNull(value.startedAt) ? value.startedAt : undefined,
    endedAt: isStringOrNull(value.endedAt) ? value.endedAt : undefined,
    createdAt: isStringOrNull(value.createdAt) ? value.createdAt : undefined,
    updatedAt: isStringOrNull(value.updatedAt) ? value.updatedAt : undefined,
  };
}

function isServiceKey(value: unknown): value is ServiceKey {
  return typeof value === "string" && SERVICE_KEY_OPTIONS.includes(value as ServiceKey);
}

function isBackendPurchasedServiceKey(value: string): value is BackendPurchasedServiceKey {
  return value in BACKEND_TO_UI_SERVICE_KEY_MAP;
}

function isPurchasedServiceStatus(value: unknown): value is PurchasedServiceStatus {
  return value === "ACTIVE" || value === "INACTIVE" || value === "PAUSED" || value === "SUSPENDED";
}

function normalizePurchasedServiceStatus(value: unknown): PurchasedServiceStatus {
  if (isPurchasedServiceStatus(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase() as BackendPurchasedServiceStatus | string;
    if (normalized === "CANCELED") {
      return "INACTIVE";
    }

    if (normalized === "PAUSED") {
      return "PAUSED";
    }
  }

  return "ACTIVE";
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isOptionalStringOrNull(value: unknown): value is string | null | undefined {
  return typeof value === "undefined" || typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}
