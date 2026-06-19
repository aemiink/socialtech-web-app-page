import type {
  DesignSystemStatus,
  WebMobileDesignConfig,
  WebMobileDesignSummary,
} from "./webMobileDesignTypes";

function normalizeDesignSystemStatus(value: unknown): DesignSystemStatus {
  if (value === "IN_PROGRESS" || value === "COMPLETED") return value;
  return "NONE";
}

function normalizeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function normalizeOwnWebMobileDesignConfigResponse(
  response: unknown,
): WebMobileDesignConfig | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;
  if (!data.id) return null;
  return {
    id: String(data.id),
    clientProfileId: normalizeString(data.clientProfileId) ?? "",
    figmaFileUrl: normalizeString(data.figmaFileUrl),
    prototypeUrl: normalizeString(data.prototypeUrl),
    styleGuideUrl: normalizeString(data.styleGuideUrl),
    designSystemStatus: normalizeDesignSystemStatus(data.designSystemStatus),
    primaryColor: normalizeString(data.primaryColor),
    secondaryColor: normalizeString(data.secondaryColor),
    fontFamily: normalizeString(data.fontFamily),
    targetPlatforms: normalizeStringArray(data.targetPlatforms),
    gridSystem: normalizeString(data.gridSystem),
    notes: normalizeString(data.notes),
    updatedAt: normalizeString(data.updatedAt),
  };
}

function normalizeProjectList(value: unknown): WebMobileDesignSummary["projects"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .map((p) => ({
      id: String(p.id ?? ""),
      name: String(p.name ?? ""),
      status: String(p.status ?? "PLANNED"),
      priority: String(p.priority ?? "MEDIUM"),
      figmaProjectUrl: normalizeString(p.figmaProjectUrl),
      startDate: normalizeString(p.startDate),
      dueDate: normalizeString(p.dueDate),
      taskCount: typeof p.taskCount === "number" ? p.taskCount : 0,
      fileCount: typeof p.fileCount === "number" ? p.fileCount : 0,
    }));
}

function normalizeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeOwnWebMobileDesignSummaryResponse(
  response: unknown,
): WebMobileDesignSummary | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  const taskStats = data.taskStats && typeof data.taskStats === "object"
    ? (data.taskStats as Record<string, unknown>)
    : {};
  const approvalStats = data.approvalStats && typeof data.approvalStats === "object"
    ? (data.approvalStats as Record<string, unknown>)
    : {};

  const recentTasks = Array.isArray(data.recentTasks)
    ? (data.recentTasks as unknown[])
        .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
        .map((t) => ({
          id: String(t.id ?? ""),
          title: String(t.title ?? ""),
          status: String(t.status ?? "TODO"),
          priority: String(t.priority ?? "MEDIUM"),
          type: String(t.type ?? "TASK"),
          approvalStatus: normalizeString(t.approvalStatus),
          approvalRequired: Boolean(t.approvalRequired),
          dueDate: normalizeString(t.dueDate),
        }))
    : [];

  const recentFiles = Array.isArray(data.recentFiles)
    ? (data.recentFiles as unknown[])
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
        }))
    : [];

  const configRaw = data.config && typeof data.config === "object"
    ? (data.config as Record<string, unknown>)
    : null;
  const config = configRaw?.id ? normalizeOwnWebMobileDesignConfigResponse(configRaw) : null;

  return {
    hasActiveService: Boolean(data.hasActiveService),
    config,
    projects: normalizeProjectList(data.projects),
    taskStats: {
      total: normalizeNumber(taskStats.total),
      todo: normalizeNumber(taskStats.todo),
      inProgress: normalizeNumber(taskStats.inProgress),
      review: normalizeNumber(taskStats.review),
      done: normalizeNumber(taskStats.done),
      blocked: normalizeNumber(taskStats.blocked),
    },
    approvalStats: {
      total: normalizeNumber(approvalStats.total),
      pending: normalizeNumber(approvalStats.pending),
      approved: normalizeNumber(approvalStats.approved),
    },
    revisionCount: normalizeNumber(data.revisionCount),
    progressPercent: normalizeNumber(data.progressPercent),
    recentTasks,
    recentFiles,
    meta: {
      generatedAt: normalizeString((data.meta as Record<string, unknown>)?.generatedAt) ?? new Date().toISOString(),
    },
  };
}
