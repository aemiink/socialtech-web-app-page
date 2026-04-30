/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    employees: 98,
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
    todo: 40,
    inProgress: 120,
    review: 25,
    done: 59,
    blocked: 7,
  },
  auditLogs: {
    total: 12,
    lastActionAt: "2026-04-30T10:30:00.000Z",
  },
  meta: {
    generatedAt: "2026-04-30T10:31:00.000Z",
  },
};

type DashboardSummaryWithSensitiveFields = AdminSummaryResponse & {
  password: string;
  token: string;
  secret: string;
  authorization: string;
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

  it("renders loading placeholders while the summary is loading", () => {
    setupSummaryState({ data: undefined, isLoading: true, isFetching: true });

    renderDashboard();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
  });

  it("renders error state when summary request fails", () => {
    setupSummaryState({
      data: undefined,
      error: { status: 500, data: { message: "Özet servisi kullanılamıyor." } },
      isError: true,
    });

    renderDashboard();

    expect(screen.getByText("Dashboard özeti yüklenemedi")).toBeInTheDocument();
    expect(screen.getByText("Özet servisi kullanılamıyor.")).toBeInTheDocument();
  });

  it("renders permission error message for 403 response", () => {
    setupSummaryState({
      data: undefined,
      error: { status: 403, data: { message: "Bu kaynağa erişim izniniz yok." } },
      isError: true,
    });

    renderDashboard();

    expect(screen.getByText(/yetkiniz bulunmuyor/i)).toBeInTheDocument();
  });

  it("renders KPI values from admin summary response", () => {
    renderDashboard();

    expect(mockUseGetAdminSummaryQuery).toHaveBeenCalledOnce();
    expect(screen.getByText("Toplam Kullanıcı")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("Toplam Çalışan")).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("Aktif Kullanıcı")).toBeInTheDocument();
    expect(screen.getByText("77")).toBeInTheDocument();
    expect(screen.getByText("Toplam Müşteri")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Bloklanan Görev")).toBeInTheDocument();
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    expect(screen.getByText(/Toplam Audit Log:/)).toHaveTextContent("12");
  });

  it("renders lastActionAt null fallback text", () => {
    setupSummaryState({
      data: {
        ...dashboardSummary,
        auditLogs: {
          ...dashboardSummary.auditLogs,
          lastActionAt: null,
        },
      },
    });

    renderDashboard();

    expect(screen.getByText(/Son audit kaydı:/)).toHaveTextContent("Henüz işlem yok");
  });

  it("renders generatedAt text", () => {
    renderDashboard();

    expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();
  });

  it("does not rely on removed legacy fields", () => {
    renderDashboard();

    expect(screen.queryByText(/Son 24 Saat/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Atanmamış/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resourceCount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/suspended/i)).not.toBeInTheDocument();
  });

  it("renders retry button and calls refetch when clicked", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    setupSummaryState({ refetch });

    renderDashboard();

    await user.click(screen.getByRole("button", { name: /Yenile/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not render sensitive fields if they exist in payload", () => {
    const sensitiveSummary: DashboardSummaryWithSensitiveFields = {
      ...dashboardSummary,
      password: "demo123",
      token: "token-value",
      secret: "secret-value",
      authorization: "Bearer should-not-show",
    };
    setupSummaryState({ data: sensitiveSummary });

    renderDashboard();

    expect(document.body).not.toHaveTextContent(/demo123/i);
    expect(document.body).not.toHaveTextContent(/token-value/i);
    expect(document.body).not.toHaveTextContent(/secret-value/i);
    expect(document.body).not.toHaveTextContent(/Bearer should-not-show/i);
  });
});
