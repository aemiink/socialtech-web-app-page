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
    unassigned: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    blocked: 0,
  },
  auditLogs: {
    total: 0,
    last24Hours: 0,
    lastActionAt: null,
  },
  meta: {
    generatedAt: "",
    resourceCount: 0,
  },
};

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
    return "Henüz kayıt yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Henüz kayıt yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
