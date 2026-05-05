import type {
  DeliveryPaginationMeta,
  DeliveryRelease,
  DeliveryReleaseStatus,
  DeliveryReleasesResponse,
  DeliverySprint,
  DeliverySprintStatus,
  DeliverySprintsResponse,
  DeliverySummary,
} from "./deliveryTypes";

export const DELIVERY_SPRINT_STATUS_OPTIONS: DeliverySprintStatus[] = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

export const DELIVERY_RELEASE_STATUS_OPTIONS: DeliveryReleaseStatus[] = [
  "PLANNED",
  "TESTING",
  "READY",
  "DEPLOYED",
  "FAILED",
  "ROLLED_BACK",
];

const SPRINT_STATUS_LABELS: Record<DeliverySprintStatus, string> = {
  PLANNED: "Planlandı",
  ACTIVE: "Aktif",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const RELEASE_STATUS_LABELS: Record<DeliveryReleaseStatus, string> = {
  PLANNED: "Planlandı",
  TESTING: "Testte",
  READY: "Hazır",
  DEPLOYED: "Yayında",
  FAILED: "Başarısız",
  ROLLED_BACK: "Geri Alındı",
};

export function getDeliverySprintStatusLabel(status: DeliverySprintStatus) {
  return SPRINT_STATUS_LABELS[status] ?? status;
}

export function getDeliveryReleaseStatusLabel(status: DeliveryReleaseStatus) {
  return RELEASE_STATUS_LABELS[status] ?? status;
}

export function getDeliverySprintStatusBadgeClass(status: DeliverySprintStatus) {
  if (status === "ACTIVE") {
    return "border-[#AAFF01]/30 bg-[#AAFF01]/20 text-[#d6ff94]";
  }
  if (status === "COMPLETED") {
    return "bg-[#AAFF01] text-[#131313]";
  }
  if (status === "CANCELLED") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getDeliveryReleaseStatusBadgeClass(status: DeliveryReleaseStatus) {
  if (status === "DEPLOYED") {
    return "bg-[#AAFF01] text-[#131313]";
  }
  if (status === "READY") {
    return "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  }
  if (status === "TESTING") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }
  if (status === "FAILED" || status === "ROLLED_BACK") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function normalizeDeliverySprintsResponse(response: unknown): DeliverySprintsResponse {
  const candidate = isRecord(response) ? response : {};
  const data = Array.isArray(candidate.data) ? candidate.data.filter(isRecord) as DeliverySprint[] : [];
  const meta = normalizeMeta(candidate.meta, data.length);
  return { data, meta };
}

export function normalizeDeliveryReleasesResponse(response: unknown): DeliveryReleasesResponse {
  const candidate = isRecord(response) ? response : {};
  const data = Array.isArray(candidate.data) ? candidate.data.filter(isRecord) as DeliveryRelease[] : [];
  const meta = normalizeMeta(candidate.meta, data.length);
  return { data, meta };
}

export function normalizeDeliverySummaryResponse(response: unknown): DeliverySummary {
  if (!isRecord(response)) {
    throw new Error("Delivery summary response could not be parsed.");
  }

  return response as DeliverySummary;
}

function normalizeMeta(meta: unknown, dataLength: number): DeliveryPaginationMeta {
  if (!isRecord(meta)) {
    return {
      page: 1,
      limit: dataLength,
      total: dataLength,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return {
    page: typeof meta.page === "number" ? meta.page : 1,
    limit: typeof meta.limit === "number" ? meta.limit : dataLength,
    total: typeof meta.total === "number" ? meta.total : dataLength,
    totalPages: typeof meta.totalPages === "number" ? meta.totalPages : 1,
    hasNextPage: Boolean(meta.hasNextPage),
    hasPreviousPage: Boolean(meta.hasPreviousPage),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
