import { CrmLeadScanStatus, CrmLeadScanTrigger, CrmLeadWebsiteStatus, Priority } from "@prisma/client";

export const DEFAULT_LEAD_SCAN_CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa"] as const;
export const DEFAULT_LEAD_SCAN_SECTORS = [
  "diş kliniği",
  "estetik kliniği",
  "özel klinik",
  "güzellik merkezi",
  "lazer epilasyon merkezi",
  "restoran",
  "butik",
  "kadın giyim mağazası",
  "mobilya mağazası",
  "otel",
  "butik otel",
] as const;
export const AGENCY_SERVICES = [
  "Web sitesi",
  "Reklam yönetimi",
  "Sosyal medya yönetimi",
  "Kreatif üretimi",
  "SEO",
  "Otomasyon",
  "E-ticaret altyapısı",
  "Mobile App",
  "İş akışı otomasyonları",
] as const;

export type LeadScanPriority = "HOT" | "WARM" | "COLD" | "LOW_QUALITY";

export type GeneratedLeadScanQuery = {
  city: string;
  sector: string;
  query: string;
};

export type LeadScanCandidate = {
  businessName: string;
  sector: string;
  city: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string | null;
  placeId: string | null;
  sourceQuery: string;
  sourceProvider: "serpapi";
};

export type WebsiteAnalysisResult = {
  websiteStatus: CrmLeadWebsiteStatus;
  websiteIssues: string[];
  email: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  whatsappLink: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteTitle: string | null;
  metaDescription: string | null;
  hasContactForm: boolean;
  hasAppointment: boolean;
  hasReservation: boolean;
  hasEcommerce: boolean;
  hasCTA: boolean;
};

export type LeadScoreResult = {
  lead_score: number;
  priority: LeadScanPriority;
  detected_pain_points: string[];
  recommended_services: string[];
  outreach_angle: string;
  email_subject: string;
  email_body: string;
  whatsapp_message: string;
  reasoning_summary: string;
};

export type QualifiedLeadCandidate = {
  candidate: LeadScanCandidate;
  analysis: WebsiteAnalysisResult;
  score: LeadScoreResult;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappPhone: string | null;
};

export type LeadScanUsageSummary = {
  dailyQueryLimit: number;
  absoluteMaxDailyQueryLimit: number;
  usedToday: number;
  remainingToday: number;
};

export type CrmLeadScanLogSummary = {
  id: string;
  startedAt: Date;
  finishedAt: Date | null;
  status: CrmLeadScanStatus;
  triggeredBy: CrmLeadScanTrigger;
  triggeredByUserId: string | null;
  totalQueriesUsed: number;
  totalBusinessesFetched: number;
  totalDuplicates: number;
  totalWebsitesAnalyzed: number;
  totalQualified: number;
  totalSaved: number;
  totalFailed: number;
  summary: string | null;
  queries: unknown;
  errors: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function normalizeComparablePhone(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D+/g, "");
  if (digits.length < 7) {
    return null;
  }

  if (digits.startsWith("90") && digits.length > 10) {
    return digits;
  }

  return digits;
}

export function normalizeComparableUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const normalized = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);
    const pathname = url.pathname.replace(/\/+$/, "");
    const query = url.search ? url.search : "";
    return `${url.protocol}//${url.hostname.toLowerCase()}${pathname}${query}`;
  } catch {
    return null;
  }
}

export function normalizeComparableName(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9çğıöşü\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapLeadScanPriorityToPriority(priority: LeadScanPriority): Priority {
  if (priority === "HOT") {
    return Priority.URGENT;
  }
  if (priority === "WARM") {
    return Priority.HIGH;
  }
  if (priority === "LOW_QUALITY") {
    return Priority.LOW;
  }
  return Priority.MEDIUM;
}

export function isQualifiedLeadCandidate(candidate: QualifiedLeadCandidate): boolean {
  const hasContactChannel = Boolean(
    candidate.contactEmail || candidate.contactPhone || candidate.whatsappPhone,
  );

  return (
    hasContactChannel &&
    candidate.score.lead_score >= 60 &&
    (candidate.score.priority === "HOT" || candidate.score.priority === "WARM")
  );
}

export function getLeadScanRotationSeed(now = new Date()): number {
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.max(Math.floor((current.getTime() - start.getTime()) / 86_400_000), 0);
}
