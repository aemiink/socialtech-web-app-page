/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestYayin } from "../TestYayin";

const mockUseGetDeliveryReleasesQuery = vi.fn();
const mockUseGetProjectRepositoryQuery = vi.fn();
const mockUseGetProjectRepositoryWorkflowRunsQuery = vi.fn();

vi.mock("../../../features/delivery/deliveryApi", () => ({
  useGetDeliveryReleasesQuery: () => mockUseGetDeliveryReleasesQuery(),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectRepositoryQuery: (id: string) => mockUseGetProjectRepositoryQuery(id),
  useGetProjectRepositoryWorkflowRunsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectRepositoryWorkflowRunsQuery(query, options),
}));

describe("TestYayin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetProjectRepositoryQuery.mockReturnValue({ data: undefined });
    mockUseGetProjectRepositoryWorkflowRunsQuery.mockReturnValue({ data: [] });
  });

  it("renders loading and release cards", () => {
    mockUseGetDeliveryReleasesQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    const { rerender } = render(
      <MemoryRouter>
        <TestYayin />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Release kayıtları yükleniyor/)).toBeInTheDocument();

    mockUseGetDeliveryReleasesQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            projectId: "2",
            title: "Checkout Stabilization Release",
            environment: "STAGING",
            status: "TESTING",
            approvalStatus: "PENDING",
            version: "v0.9.4",
            releaseNotes: "Notes",
            scheduledAt: "2026-05-12T10:00:00.000Z",
            deployedAt: null,
            createdAt: "",
            updatedAt: "",
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
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetProjectRepositoryQuery.mockReturnValue({
      data: {
        id: "repo-id",
        projectId: "2",
        provider: "GITHUB",
        owner: "socialtech",
        repo: "growth-hub",
        repositoryUrl: "https://github.com/socialtech/growth-hub",
        defaultBranch: "main",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
    });
    mockUseGetProjectRepositoryWorkflowRunsQuery.mockReturnValue({
      data: [
        {
          id: 1,
          name: "Deploy Preview",
          status: "completed",
          conclusion: "success",
        },
      ],
    });
    rerender(
      <MemoryRouter>
        <TestYayin />
      </MemoryRouter>,
    );
    expect(screen.getByText("Checkout Stabilization Release")).toBeInTheDocument();
    expect(screen.getByText("Testte")).toBeInTheDocument();
    expect(screen.getByText("Yayın Onayı Bekliyor")).toBeInTheDocument();
    expect(screen.getByText(/CI\/CD: Deploy Preview · success/)).toBeInTheDocument();
  });
});
