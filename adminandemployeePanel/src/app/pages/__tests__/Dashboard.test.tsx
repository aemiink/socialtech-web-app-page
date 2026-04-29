/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminSummaryResponse } from "../../features/dashboard/dashboardTypes";
import { Dashboard } from "../Dashboard";

type DashboardSummaryQueryResult = {
  data?: AdminSummaryResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

const mockUseGetAdminSummaryQuery = vi.fn<() => DashboardSummaryQueryResult>();

vi.mock("../../features/dashboard/dashboardApi", () => ({
  useGetAdminSummaryQuery: () => mockUseGetAdminSummaryQuery(),
}));

const dashboardSummary: AdminSummaryResponse = {
  users: {
    total: 99,
    active: 77,
    inactive: 22,
    employees: 99,
    clients: 123,
    admins: 1,
  },
  clients: {
    total: 123,
    active: 100,
    inactive: 20,
  },
  projects: {
    total: 45,
    planned: 8,
    inProgress: 31,
    review: 4,
    completed: 6,
    onHold: 2,
  },
  tasks: {
    total: 250,
    unassigned: 5,
    todo: 40,
    inProgress: 120,
    review: 25,
    done: 59,
    blocked: 7,
  },
  auditLogs: {
    total: 12,
    last24Hours: 4,
    lastActionAt: "2026-04-30T10:30:00.000Z",
  },
  meta: {
    generatedAt: "2026-04-30T10:31:00.000Z",
    resourceCount: 5,
  },
};

function setupSummaryState(overrides: Partial<DashboardSummaryQueryResult> = {}) {
  mockUseGetAdminSummaryQuery.mockReturnValue({
    data: dashboardSummary,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderDashboard() {
  render(<Dashboard />);
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSummaryState();
  });

  it("renders KPI values from the admin summary endpoint", () => {
    renderDashboard();

    expect(mockUseGetAdminSummaryQuery).toHaveBeenCalledOnce();
    expect(screen.getByText("Toplam Çalışan")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("Aktif Çalışan")).toBeInTheDocument();
    expect(screen.getByText("77")).toBeInTheDocument();
    expect(screen.getByText("Toplam Müşteri")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Bloklanan Görev")).toBeInTheDocument();
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    expect(screen.getByText(/Toplam Audit Log:/)).toHaveTextContent("12");
  });

  it("shows loading placeholders while the summary is loading", () => {
    setupSummaryState({ data: undefined, isLoading: true, isFetching: true });

    renderDashboard();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
  });

  it("shows an error state when the summary request fails", () => {
    setupSummaryState({
      data: undefined,
      error: { status: 500, data: { message: "Özet servisi kullanılamıyor." } },
      isError: true,
    });

    renderDashboard();

    expect(screen.getByText("Dashboard özeti yüklenemedi")).toBeInTheDocument();
    expect(screen.getByText("Özet servisi kullanılamıyor.")).toBeInTheDocument();
  });
});
