import type {
  CrmLeadActivityType,
  CrmLeadDetail,
  CrmLeadListResponse,
  CrmLeadScanLogSummary,
  CrmLeadScanLogsResponse,
  CrmLeadScanUsageSummary,
  CrmLeadStatus,
  CrmLeadSource,
  RunAdminCrmLeadScanResponse,
} from "./crmTypes";

export const CRM_LEAD_STATUS_OPTIONS: CrmLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "WON",
  "LOST",
];

export const EMPLOYEE_CRM_STATUS_OPTIONS: Array<Exclude<CrmLeadStatus, "NEW" | "WON">> = [
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "LOST",
];

export const CRM_ACTIVITY_OPTIONS: Array<Exclude<CrmLeadActivityType, "STATUS_CHANGE">> = [
  "CALL",
  "EMAIL",
  "WHATSAPP",
  "NOTE",
];

export function getCrmLeadStatusLabel(status: CrmLeadStatus): string {
  const labels: Record<CrmLeadStatus, string> = {
    NEW: "Yeni",
    CONTACTED: "İletişime Geçildi",
    FOLLOW_UP: "Takipte",
    QUALIFIED: "Nitelikli",
    WON: "Kazanıldı",
    LOST: "Kaybedildi",
  };
  return labels[status] ?? status;
}

export function getCrmLeadSourceLabel(source: CrmLeadSource): string {
  if (source === "WEBSITE_FORM") {
    return "Web Form";
  }
  if (source === "SERPAPI") {
    return "SerpAPI Tarama";
  }
  return "Manuel";
}

export function getCrmActivityTypeLabel(type: CrmLeadActivityType): string {
  const labels: Record<CrmLeadActivityType, string> = {
    CALL: "Telefon",
    EMAIL: "E-posta",
    WHATSAPP: "WhatsApp",
    NOTE: "Not",
    STATUS_CHANGE: "Durum Değişimi",
  };
  return labels[type] ?? type;
}

export function getCrmLeadStatusClass(status: CrmLeadStatus): string {
  const classes: Record<CrmLeadStatus, string> = {
    NEW: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    CONTACTED: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    FOLLOW_UP: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    QUALIFIED: "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d2ff8a]",
    WON: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    LOST: "border-red-400/30 bg-red-400/10 text-red-200",
  };
  return classes[status] ?? "";
}

export function formatCrmDateTime(value: string | null | undefined): string {
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

export function getTodayIsoRange(now = new Date()): { from: string; to: string } {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function extractCrmApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
      if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
        return message.join(" ");
      }
    }
  }
  return fallback;
}

export function isCrmLeadListResponse(value: unknown): value is CrmLeadListResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Partial<CrmLeadListResponse>).data) &&
    typeof (value as Partial<CrmLeadListResponse>).meta === "object"
  );
}

export function normalizeCrmLeadScanResponse(response: unknown): RunAdminCrmLeadScanResponse {
  const record = isRecord(response) ? response : {};

  return {
    scanId: getString(record.scanId) ?? "",
    status: getString(record.status) as RunAdminCrmLeadScanResponse["status"],
    totalQueriesUsed: getNumber(record.totalQueriesUsed) ?? 0,
    totalBusinessesFetched: getNumber(record.totalBusinessesFetched) ?? 0,
    totalDuplicates: getNumber(record.totalDuplicates) ?? 0,
    totalWebsitesAnalyzed: getNumber(record.totalWebsitesAnalyzed) ?? 0,
    totalQualified: getNumber(record.totalQualified) ?? 0,
    totalSaved: getNumber(record.totalSaved) ?? 0,
    totalFailed: getNumber(record.totalFailed) ?? 0,
    summary: getString(record.summary) ?? "",
    usage: normalizeCrmLeadScanUsageSummary(record.usage),
  };
}

export function normalizeCrmLeadScanLogsResponse(response: unknown): CrmLeadScanLogsResponse {
  const record = isRecord(response) ? response : {};
  const data = Array.isArray(record.data) ? record.data.map((item) => normalizeCrmLeadScanLogSummary(item)) : [];

  return {
    data,
    meta: normalizeCrmLeadScanUsageSummary(record.meta),
  };
}

export function normalizeCrmLeadScanLogSummary(value: unknown): CrmLeadScanLogSummary {
  const record = isRecord(value) ? value : {};

  return {
    id: getString(record.id) ?? "",
    startedAt: getString(record.startedAt) ?? "",
    finishedAt: getString(record.finishedAt),
    status: (getString(record.status) as CrmLeadScanLogSummary["status"]) ?? "FAILED",
    triggeredBy: (getString(record.triggeredBy) as CrmLeadScanLogSummary["triggeredBy"]) ?? "MANUAL",
    triggeredByUserId: getString(record.triggeredByUserId),
    totalQueriesUsed: getNumber(record.totalQueriesUsed) ?? 0,
    totalBusinessesFetched: getNumber(record.totalBusinessesFetched) ?? 0,
    totalDuplicates: getNumber(record.totalDuplicates) ?? 0,
    totalWebsitesAnalyzed: getNumber(record.totalWebsitesAnalyzed) ?? 0,
    totalQualified: getNumber(record.totalQualified) ?? 0,
    totalSaved: getNumber(record.totalSaved) ?? 0,
    totalFailed: getNumber(record.totalFailed) ?? 0,
    summary: getString(record.summary),
    queries: record.queries,
    errors: record.errors,
    createdAt: getString(record.createdAt) ?? "",
    updatedAt: getString(record.updatedAt) ?? "",
  };
}

export function getCrmLeadScanUsageItems(
  usage: CrmLeadScanUsageSummary | null | undefined,
): Array<{ label: string; value: string }> {
  if (!usage) {
    return [];
  }

  return [
    { label: "Bugünkü Kullanım", value: String(usage.usedToday) },
    { label: "Günlük Limit", value: String(usage.dailyQueryLimit) },
    { label: "Kalan", value: String(usage.remainingToday) },
    { label: "Absolute Max", value: String(usage.absoluteMaxDailyQueryLimit) },
  ];
}

export function getCrmLeadImportedDetails(
  lead: CrmLeadDetail,
): Array<{ label: string; value: string; copyValue: string; href?: string }> {
  const importMetadata = isRecord(lead.importMetadata) ? lead.importMetadata : {};
  const scanMetadata = isRecord(lead.scanMetadata) ? lead.scanMetadata : {};
  const rawItems = [
    { label: "Adres", value: lead.address ?? getString(importMetadata.address) ?? getString(scanMetadata.address) },
    { label: "Şehir", value: lead.city ?? getString(importMetadata.city) ?? getString(scanMetadata.city) },
    { label: "Sektör", value: lead.sector ?? getString(importMetadata.category) ?? getString(scanMetadata.category) },
    { label: "Website", value: lead.website ?? getString(importMetadata.website) ?? getString(importMetadata.websiteUrl), href: true },
    { label: "Google Maps", value: lead.googleMapsUrl ?? getString(importMetadata.sourceUrl), href: true },
    { label: "Instagram", value: lead.instagramUrl, href: true },
    { label: "WhatsApp", value: lead.whatsappPhone },
    { label: "Kaynak Sorgu", value: lead.sourceQuery },
    { label: "Kaynak", value: lead.sourceProvider },
    { label: "Website Durumu", value: lead.websiteStatus },
    { label: "Skor", value: typeof lead.leadScore === "number" ? String(lead.leadScore) : null },
    { label: "Google Puanı", value: typeof lead.googleRating === "number" ? String(lead.googleRating) : getNumber(importMetadata.rating)?.toString() ?? null },
    { label: "Yorum Sayısı", value: typeof lead.reviewCount === "number" ? String(lead.reviewCount) : getNumber(importMetadata.reviewsCount)?.toString() ?? null },
  ];

  return rawItems
    .filter((item): item is { label: string; value: string; href?: boolean } => typeof item.value === "string" && item.value.length > 0)
    .map((item) => ({
      label: item.label,
      value: item.value,
      copyValue: item.value,
      ...(item.href ? { href: ensureExternalUrl(item.value) } : {}),
    }));
}

export function getCrmLeadDraftSections(
  lead: CrmLeadDetail,
): Array<{ title: string; body: string; copyLabel: string }> {
  const importMetadata = isRecord(lead.importMetadata) ? lead.importMetadata : {};
  const legacyDraftCopy = getString(importMetadata.draftCopy) ?? getString(lead.draftCopy) ?? getString(lead.notesDraft);
  const sections = [
    legacyDraftCopy
      ? { title: "Taslak Metin", body: legacyDraftCopy, copyLabel: "Taslak kopyalandı." }
      : null,
    lead.emailSubject ? { title: "E-posta Konusu", body: lead.emailSubject, copyLabel: "Konu kopyalandı." } : null,
    lead.emailBody ? { title: "E-posta Taslağı", body: lead.emailBody, copyLabel: "E-posta taslağı kopyalandı." } : null,
    lead.whatsappMessage
      ? { title: "WhatsApp Taslağı", body: lead.whatsappMessage, copyLabel: "WhatsApp mesajı kopyalandı." }
      : null,
  ];

  return sections.filter((item): item is { title: string; body: string; copyLabel: string } => Boolean(item));
}

export function normalizeJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeCrmLeadScanUsageSummary(value: unknown): CrmLeadScanUsageSummary {
  const record = isRecord(value) ? value : {};

  return {
    dailyQueryLimit: getNumber(record.dailyQueryLimit) ?? 5,
    absoluteMaxDailyQueryLimit: getNumber(record.absoluteMaxDailyQueryLimit) ?? 6,
    usedToday: getNumber(record.usedToday) ?? 0,
    remainingToday: getNumber(record.remainingToday) ?? 0,
  };
}

function ensureExternalUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
