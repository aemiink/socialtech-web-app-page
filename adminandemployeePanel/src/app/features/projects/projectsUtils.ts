import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { extractApiErrorMessage } from "../adminUsers/adminUsersUtils";
import type {
  Priority,
  Project,
  ProjectClientProfile,
  ProjectsListMeta,
  ProjectsListResponse,
  ProjectStatus,
} from "./projectsTypes";

export { extractApiErrorMessage };

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  "PLANNED",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
];

export const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  REVIEW: "İncelemede",
  COMPLETED: "Tamamlandı",
  ON_HOLD: "Beklemede",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Düşük",
  MEDIUM: "Normal",
  HIGH: "Yüksek",
  URGENT: "Acil",
};

const PROJECT_PROGRESS_BY_STATUS: Record<ProjectStatus, number> = {
  PLANNED: 15,
  IN_PROGRESS: 55,
  REVIEW: 85,
  COMPLETED: 100,
  ON_HOLD: 35,
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeProjectsListResponse(response: unknown): ProjectsListResponse {
  const responseData = isRecord(response) ? response.data : response;
  const data = Array.isArray(responseData) ? responseData.filter(isProject) : [];
  const meta = normalizeListMeta(isRecord(response) ? response.meta : null, data.length);

  return { data, meta };
}

export function normalizeProjectResponse(response: unknown): Project {
  const candidate = isRecord(response) && "data" in response ? response.data : response;

  if (isProject(candidate)) {
    return candidate;
  }

  throw new Error("Project detail response could not be parsed.");
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function getProjectProgress(status: ProjectStatus): number {
  return PROJECT_PROGRESS_BY_STATUS[status] ?? 0;
}

export function getProjectStatusBadgeClass(status: ProjectStatus): string {
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

export function getPriorityBadgeClass(priority: Priority): string {
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

export function getProjectClientName(project: Project): string {
  return project.clientProfile?.companyName ?? shortId(project.clientProfileId);
}

export function formatDate(value: string | null): string {
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

export function formatDateTime(value: string | null): string {
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

export function formatDateInput(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function toNullableText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function getMutationErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return extractApiErrorMessage(error, fallbackMessage);
}

function normalizeListMeta(meta: unknown, dataLength: number): ProjectsListMeta {
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

function createFallbackMeta(dataLength: number): ProjectsListMeta {
  return {
    page: 1,
    limit: dataLength,
    total: dataLength,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function isProject(value: unknown): value is Project {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.clientProfileId === "string" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    isStringOrNull(value.description) &&
    isProjectStatus(value.status) &&
    isPriority(value.priority) &&
    isStringOrNull(value.startDate) &&
    isStringOrNull(value.dueDate) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.clientProfile === null || isProjectClientProfile(value.clientProfile))
  );
}

function isProjectClientProfile(value: unknown): value is ProjectClientProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.companyName === "string" &&
    isStringOrNull(value.contactEmail)
  );
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && PROJECT_STATUS_OPTIONS.includes(value as ProjectStatus);
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITY_OPTIONS.includes(value as Priority);
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

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export type ApiMutationError = FetchBaseQueryError | Error | unknown;
