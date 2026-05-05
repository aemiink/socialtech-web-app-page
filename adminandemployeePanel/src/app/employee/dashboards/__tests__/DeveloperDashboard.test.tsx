/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeveloperDashboard } from "../DeveloperDashboard";

const mockUseGetDeliverySummaryQuery = vi.fn();
const mockUseGetClientsQuery = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock("../../../features/delivery/deliveryApi", () => ({
  useGetDeliverySummaryQuery: () => mockUseGetDeliverySummaryQuery(),
}));
vi.mock("../../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (...args: unknown[]) => mockUseGetClientsQuery(...args),
}));
vi.mock("../../../store/hooks", () => ({
  useAppSelector: (...args: unknown[]) => mockUseAppSelector(...args),
}));

describe("DeveloperDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue({
      id: "employee-user-id",
      accountType: "EMPLOYEE",
      role: "DEVELOPER",
      permissions: [],
    });
    mockUseGetClientsQuery.mockReturnValue({ data: { data: [] } });
  });

  it("renders loading and success summary states", () => {
    mockUseGetDeliverySummaryQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: true,
    });
    const { rerender } = render(<DeveloperDashboard />);
    expect(screen.getByText(/Developer özeti yükleniyor/)).toBeInTheDocument();

    mockUseGetDeliverySummaryQuery.mockReturnValue({
      data: {
        assignedOpenTasks: 8,
        criticalBugs: 2,
        activeSprints: 1,
        testingQueue: 1,
        completedThisSprint: 4,
        activeSprintCards: [],
        criticalBugCards: [],
        todaysTasks: [],
        releaseQueue: [],
        recentCommits: [],
        openPullRequests: [],
      },
      error: undefined,
      isError: false,
      isLoading: false,
    });
    rerender(<DeveloperDashboard />);
    expect(screen.getByText("Açık Task")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Kritik Bug")).toBeInTheDocument();
  });
});
