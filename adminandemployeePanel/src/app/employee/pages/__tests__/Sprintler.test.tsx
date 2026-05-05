/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sprintler } from "../Sprintler";

const mockUseGetDeliverySprintsQuery = vi.fn();

vi.mock("../../../features/delivery/deliveryApi", () => ({
  useGetDeliverySprintsQuery: () => mockUseGetDeliverySprintsQuery(),
}));

describe("Sprintler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading, empty and success states", () => {
    mockUseGetDeliverySprintsQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    const { rerender } = render(
      <MemoryRouter>
        <Sprintler />
      </MemoryRouter>,
    );
    expect(screen.getByText("Sprintler yükleniyor...")).toBeInTheDocument();

    mockUseGetDeliverySprintsQuery.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false } },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    rerender(
      <MemoryRouter>
        <Sprintler />
      </MemoryRouter>,
    );
    expect(screen.getByText("Sprint bulunmuyor.")).toBeInTheDocument();

    mockUseGetDeliverySprintsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            projectId: "2",
            name: "Sprint Alpha",
            goal: "Goal",
            status: "ACTIVE",
            startDate: "2026-05-01T00:00:00.000Z",
            endDate: "2026-05-14T00:00:00.000Z",
            createdAt: "2026-05-01T00:00:00.000Z",
            updatedAt: "2026-05-01T00:00:00.000Z",
            project: {
              id: "2",
              clientProfileId: "3",
              name: "Growth Hub Launch",
              slug: "growth-hub-launch",
              description: null,
              status: "IN_PROGRESS",
              priority: "HIGH",
              startDate: null,
              dueDate: null,
              createdAt: "",
              updatedAt: "",
              clientProfile: { id: "3", slug: "acme", companyName: "Acme", contactEmail: null },
            },
            taskCounts: { total: 4, completed: 2, open: 2 },
            progressPercent: 50,
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    rerender(
      <MemoryRouter>
        <Sprintler />
      </MemoryRouter>,
    );
    expect(screen.getByText("Sprint Alpha")).toBeInTheDocument();
    expect(screen.getByText("2/4 tamamlandı")).toBeInTheDocument();
  });
});
