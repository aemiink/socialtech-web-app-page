import type { SeoAuditConfig, SeoAuditSummary } from "./seoAuditTypes";

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "true";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function normalizeOwnSeoAuditConfigResponse(
  response: unknown,
): SeoAuditConfig | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;
  if (!data.id) return null;
  return {
    id: String(data.id),
    clientProfileId: normalizeString(data.clientProfileId) ?? "",
    siteUrl: normalizeString(data.siteUrl),
    gaPropertyId: normalizeString(data.gaPropertyId),
    searchConsolePropertyUrl: normalizeString(data.searchConsolePropertyUrl),
    targetKeywords: normalizeStringArray(data.targetKeywords),
    auditFrequency: normalizeString(data.auditFrequency),
    lastAuditScore:
      typeof data.lastAuditScore === "number" && Number.isFinite(data.lastAuditScore)
        ? data.lastAuditScore
        : null,
    notes: normalizeString(data.notes),
    updatedAt: normalizeString(data.updatedAt),
  };
}

function normalizeRecentTasks(value: unknown): SeoAuditSummary["recentTasks"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
    .map((t) => ({
      id: String(t.id ?? ""),
      title: String(t.title ?? ""),
      status: String(t.status ?? "TODO"),
      priority: String(t.priority ?? "MEDIUM"),
      type: String(t.type ?? "TASK"),
      approvalStatus: normalizeString(t.approvalStatus),
      approvalRequired: normalizeBoolean(t.approvalRequired),
      dueDate: normalizeString(t.dueDate),
    }));
}

function normalizeRecentFiles(value: unknown): SeoAuditSummary["recentFiles"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
    .map((f) => ({
      id: String(f.id ?? ""),
      title: String(f.title ?? ""),
      originalFileName: String(f.originalFileName ?? ""),
      secureUrl: String(f.secureUrl ?? ""),
      visibility: String(f.visibility ?? "INTERNAL"),
      mimeType: String(f.mimeType ?? ""),
      approvalStatus: normalizeString(f.approvalStatus),
      createdAt: String(f.createdAt ?? ""),
    }));
}

export function normalizeOwnSeoAuditSummaryResponse(
  response: unknown,
): SeoAuditSummary | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const taskStats =
    data.taskStats && typeof data.taskStats === "object"
      ? (data.taskStats as Record<string, unknown>)
      : {};

  const projects = Array.isArray(data.projects)
    ? (data.projects as unknown[])
        .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
        .map((p) => ({
          id: String(p.id ?? ""),
          name: String(p.name ?? ""),
          status: String(p.status ?? "PLANNED"),
          priority: String(p.priority ?? "MEDIUM"),
          taskCount: normalizeNumber(p.taskCount),
          fileCount: normalizeNumber(p.fileCount),
          startDate: normalizeString(p.startDate),
          dueDate: normalizeString(p.dueDate),
        }))
    : [];

  const configRaw =
    data.config && typeof data.config === "object"
      ? (data.config as Record<string, unknown>)
      : null;

  return {
    hasActiveService: normalizeBoolean(data.hasActiveService),
    config: configRaw?.id ? normalizeOwnSeoAuditConfigResponse(configRaw) : null,
    projects,
    taskStats: {
      total: normalizeNumber(taskStats.total),
      todo: normalizeNumber(taskStats.todo),
      inProgress: normalizeNumber(taskStats.inProgress),
      review: normalizeNumber(taskStats.review),
      done: normalizeNumber(taskStats.done),
      blocked: normalizeNumber(taskStats.blocked),
    },
    progressPercent: normalizeNumber(data.progressPercent),
    recentTasks: normalizeRecentTasks(data.recentTasks),
    recentFiles: normalizeRecentFiles(data.recentFiles),
    meta: {
      generatedAt:
        normalizeString((data.meta as Record<string, unknown>)?.generatedAt) ??
        new Date().toISOString(),
    },
  };
}
