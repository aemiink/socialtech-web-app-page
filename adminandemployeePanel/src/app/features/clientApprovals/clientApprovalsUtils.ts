import { extractApiErrorMessage as extractClientsApiErrorMessage, normalizeToUiServiceKey } from "../clients/clientsUtils";
import type {
  ClientApproval,
  ClientApprovalEntityType,
  ClientApprovalProjectSummary,
  ClientApprovalStatus,
  ClientApprovalTransition,
  ClientApprovalType,
  ClientApprovalUserSummary,
  ClientApprovalsListMeta,
  ClientApprovalsListResponse,
} from "./clientApprovalsTypes";

export { extractClientsApiErrorMessage as extractClientApprovalApiErrorMessage };

export const CLIENT_APPROVAL_TYPE_OPTIONS: ClientApprovalType[] = [
  "TASK_APPROVAL",
  "RELEASE_APPROVAL",
  "SPRINT_APPROVAL",
  "DESIGN_APPROVAL",
  "FILE_APPROVAL",
  "REVISION_APPROVAL",
  "MEETING_CONFIRMATION",
  "GENERAL_CONFIRMATION",
  "INFORMATION",
];

export const CLIENT_APPROVAL_STATUS_OPTIONS: ClientApprovalStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACKNOWLEDGED",
  "CANCELLED",
  "EXPIRED",
];

export function normalizeClientApprovalsListResponse(response: unknown): ClientApprovalsListResponse {
  const responseData = isRecord(response) && "data" in response ? response.data : response;
  const data = Array.isArray(responseData)
    ? responseData.map(normalizeClientApproval).filter(isDefined)
    : [];
  const meta = normalizeListMeta(isRecord(response) ? response.meta : null, data.length);

  return { data, meta };
}

export function normalizeClientApprovalResponse(response: unknown): ClientApproval {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const approval = normalizeClientApproval(candidate);

  if (!approval) {
    throw new Error("Client approval response could not be parsed.");
  }

  return approval;
}

export function getClientApprovalTypeLabel(type: ClientApprovalType): string {
  const labels: Record<ClientApprovalType, string> = {
    DESIGN_APPROVAL: "Tasarım Onayı",
    FILE_APPROVAL: "Dosya Onayı",
    TASK_APPROVAL: "Görev Onayı",
    SPRINT_APPROVAL: "Sprint Onayı",
    RELEASE_APPROVAL: "Release Onayı",
    REVISION_APPROVAL: "Revizyon Onayı",
    MEETING_CONFIRMATION: "Toplantı Onayı",
    INFORMATION: "Bilgilendirme",
    GENERAL_CONFIRMATION: "Genel Onay",
  };

  return labels[type] ?? type;
}

export function getClientApprovalStatusLabel(status: ClientApprovalStatus): string {
  const labels: Record<ClientApprovalStatus, string> = {
    PENDING: "Bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    ACKNOWLEDGED: "Okundu",
    CANCELLED: "İptal Edildi",
    EXPIRED: "Süresi Doldu",
  };

  return labels[status] ?? status;
}

export function getClientApprovalEntityLabel(entityType: ClientApprovalEntityType | null | undefined): string {
  if (!entityType) {
    return "Genel";
  }

  const labels: Record<ClientApprovalEntityType, string> = {
    PROJECT: "Proje",
    TASK: "Görev",
    TASK_TODO: "Checklist",
    SPRINT: "Sprint",
    RELEASE: "Release",
    PROJECT_FILE: "Proje Dosyası",
    WORKSPACE_MESSAGE: "Mesaj",
    DESIGN_ASSET: "Tasarım Dosyası",
    REVISION: "Revizyon",
    MEETING_REQUEST: "Toplantı",
  };

  return labels[entityType] ?? entityType;
}

export function getClientApprovalStatusBadgeClass(status: ClientApprovalStatus): string {
  if (status === "APPROVED") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
  }

  if (status === "REJECTED") {
    return "border-red-400/25 bg-red-500/10 text-red-100";
  }

  if (status === "ACKNOWLEDGED") {
    return "border-sky-400/25 bg-sky-500/10 text-sky-100";
  }

  if (status === "CANCELLED" || status === "EXPIRED") {
    return "border-white/12 bg-white/6 text-[#B7B7B7]";
  }

  return "border-[#AAFF01]/25 bg-[#AAFF01]/10 text-[#E8FFC2]";
}

export function getClientApprovalContextSummary(approval: ClientApproval): string {
  const actionPayload = approval.actionPayload;
  const payloadLabel = typeof actionPayload?.contextLabel === "string" ? actionPayload.contextLabel : null;
  const payloadType = typeof actionPayload?.contextType === "string" ? actionPayload.contextType : null;

  if (payloadLabel && payloadType) {
    return `${payloadType} · ${payloadLabel}`;
  }

  if (payloadLabel) {
    return payloadLabel;
  }

  const entityLabel = getClientApprovalEntityLabel(approval.entityType);
  if (approval.entityId) {
    return `${entityLabel} · ${approval.entityId}`;
  }

  return entityLabel;
}

export function isClientApprovalPending(status: ClientApprovalStatus): boolean {
  return status === "PENDING";
}

function normalizeClientApproval(value: unknown): ClientApproval | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const clientProfileId = readString(value.clientProfileId);
  const type = readString(value.type) as ClientApprovalType | null;
  const status = readString(value.status) as ClientApprovalStatus | null;
  const title = readString(value.title);
  const message = readString(value.message);
  const createdAt = readString(value.createdAt);
  const updatedAt = readString(value.updatedAt);

  if (!id || !clientProfileId || !type || !status || !title || !message || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    clientProfileId,
    projectId: readString(value.projectId),
    serviceKey: normalizeToUiServiceKey(value.serviceKey) ?? null,
    requestedByUserId: readString(value.requestedByUserId),
    assignedToUserId: readString(value.assignedToUserId),
    respondedByUserId: readString(value.respondedByUserId),
    type,
    status,
    title,
    message,
    entityType: (readString(value.entityType) as ClientApprovalEntityType | null) ?? null,
    entityId: readString(value.entityId),
    actionPayload: isRecord(value.actionPayload) ? value.actionPayload : null,
    requiresExplicitApproval: readBoolean(value.requiresExplicitApproval) ?? true,
    clientResponseNote: readString(value.clientResponseNote),
    respondedAt: readString(value.respondedAt),
    dueAt: readString(value.dueAt),
    createdAt,
    updatedAt,
    clientProfile: normalizeClientProfileSummary(value.clientProfile),
    project: normalizeClientApprovalProject(value.project),
    requestedBy: normalizeClientApprovalUser(value.requestedBy),
    assignedTo: normalizeClientApprovalUser(value.assignedTo),
    respondedBy: normalizeClientApprovalUser(value.respondedBy),
    transitions: Array.isArray(value.transitions)
      ? value.transitions.map(normalizeClientApprovalTransition).filter(isDefined)
      : [],
  };
}

function normalizeClientProfileSummary(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const slug = readString(value.slug);
  const companyName = readString(value.companyName);
  if (!id || !slug || !companyName) {
    return null;
  }

  return {
    id,
    slug,
    companyName,
    contactEmail: readString(value.contactEmail),
  };
}

function normalizeClientApprovalProject(value: unknown): ClientApprovalProjectSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    serviceKey: normalizeToUiServiceKey(value.serviceKey) ?? null,
  };
}

function normalizeClientApprovalUser(value: unknown): ClientApprovalUserSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  if (!id) {
    return null;
  }

  return {
    id,
    displayName: readString(value.displayName),
    email: readString(value.email),
    role: readString(value.role),
    accountType: readString(value.accountType),
  };
}

function normalizeClientApprovalTransition(value: unknown): ClientApprovalTransition | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const approvalId = readString(value.approvalId);
  const actorUserId = readString(value.actorUserId);
  const toStatus = readString(value.toStatus) as ClientApprovalStatus | null;
  const createdAt = readString(value.createdAt);

  if (!id || !approvalId || !actorUserId || !toStatus || !createdAt) {
    return null;
  }

  return {
    id,
    approvalId,
    actorUserId,
    fromStatus: (readString(value.fromStatus) as ClientApprovalStatus | null) ?? null,
    toStatus,
    note: readString(value.note),
    createdAt,
    actor: normalizeClientApprovalUser(value.actor),
  };
}

function normalizeListMeta(value: unknown, totalFallback: number): ClientApprovalsListMeta {
  if (!isRecord(value)) {
    return {
      page: 1,
      limit: totalFallback,
      total: totalFallback,
      totalPages: totalFallback > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const total = readNumber(value.total) ?? totalFallback;
  const limit = readNumber(value.limit) ?? total;
  const page = readNumber(value.page) ?? 1;
  const totalPages = readNumber(value.totalPages) ?? (limit > 0 ? Math.ceil(total / limit) : 0);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: readBoolean(value.hasNextPage) ?? page < totalPages,
    hasPreviousPage: readBoolean(value.hasPreviousPage) ?? page > 1,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
