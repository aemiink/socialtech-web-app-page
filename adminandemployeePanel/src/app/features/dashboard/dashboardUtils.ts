import type { AdminSummaryResponse } from "./dashboardTypes";

export const EMPTY_ADMIN_SUMMARY: AdminSummaryResponse = {
  users: {
    total: 0,
    active: 0,
    inactive: 0,
    employees: 0,
    clients: 0,
    admins: 0,
  },
  clients: {
    total: 0,
    active: 0,
    inactive: 0,
  },
  projects: {
    total: 0,
    planned: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    onHold: 0,
  },
  tasks: {
    total: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    blocked: 0,
  },
  auditLogs: {
    total: 0,
    lastActionAt: null,
  },
  meta: {
    generatedAt: "",
  },
};

export function normalizeAdminSummaryResponse(response: unknown): AdminSummaryResponse {
  const candidate = isRecord(response) && "data" in response ? response.data : response;
  const record = isRecord(candidate) ? candidate : {};

  return {
    users: normalizeUsersSummary(record.users),
    clients: normalizeClientsSummary(record.clients),
    projects: normalizeProjectsSummary(record.projects),
    tasks: normalizeTasksSummary(record.tasks),
    auditLogs: normalizeAuditLogsSummary(record.auditLogs),
    meta: normalizeMeta(record.meta),
  };
}

export function formatDashboardMetric(value: number, isLoading: boolean, isError: boolean): string {
  if (isLoading) {
    return "...";
  }

  if (isError) {
    return "--";
  }

  return value.toLocaleString("tr-TR");
}

export function formatDashboardDateTime(value: string | null): string {
  if (!value) {
    return "Henüz işlem yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Henüz işlem yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeUsersSummary(value: unknown): AdminSummaryResponse["users"] {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total),
    active: readNumber(record.active),
    inactive: readNumber(record.inactive),
    employees: readNumber(record.employees),
    clients: readNumber(record.clients),
    admins: readNumber(record.admins),
  };
}

function normalizeClientsSummary(value: unknown): AdminSummaryResponse["clients"] {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total),
    active: readNumber(record.active),
    inactive: readNumber(record.inactive),
  };
}

function normalizeProjectsSummary(value: unknown): AdminSummaryResponse["projects"] {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total),
    planned: readNumber(record.planned),
    inProgress: readNumber(record.inProgress),
    review: readNumber(record.review),
    completed: readNumber(record.completed),
    onHold: readNumber(record.onHold),
  };
}

function normalizeTasksSummary(value: unknown): AdminSummaryResponse["tasks"] {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total),
    todo: readNumber(record.todo),
    inProgress: readNumber(record.inProgress),
    review: readNumber(record.review),
    done: readNumber(record.done),
    blocked: readNumber(record.blocked),
  };
}

function normalizeAuditLogsSummary(value: unknown): AdminSummaryResponse["auditLogs"] {
  const record = isRecord(value) ? value : {};

  return {
    total: readNumber(record.total),
    lastActionAt: typeof record.lastActionAt === "string" ? record.lastActionAt : null,
  };
}

function normalizeMeta(value: unknown): AdminSummaryResponse["meta"] {
  const record = isRecord(value) ? value : {};

  return {
    generatedAt: typeof record.generatedAt === "string" ? record.generatedAt : "",
  };
}

function readNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
