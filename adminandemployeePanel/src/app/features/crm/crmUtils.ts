import type { CrmLeadActivityType, CrmLeadListResponse, CrmLeadStatus, CrmLeadSource } from "./crmTypes";

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
  return source === "WEBSITE_FORM" ? "Web Form" : "Manuel";
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
