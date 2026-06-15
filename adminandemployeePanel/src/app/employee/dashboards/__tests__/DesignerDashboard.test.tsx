/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignerDashboard } from "../DesignerDashboard";

const mockUseGetClientsQuery = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock("../../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (...args: unknown[]) => mockUseGetClientsQuery(...args),
}));
vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
}));
vi.mock("../../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: (...args: unknown[]) => mockUseGetTasksQuery(...args),
}));
vi.mock("../../../store/hooks", () => ({
  useAppSelector: (...args: unknown[]) => mockUseAppSelector(...args),
}));

describe("DesignerDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-30T12:00:00.000Z"));
    mockUseAppSelector.mockReturnValue({
      id: "designer-user-id",
      email: "designer@socialtech.com",
      displayName: "Derya Designer",
      accountType: "EMPLOYEE",
      role: "DESIGNER",
      status: "ACTIVE",
      permissions: [],
      clientProfile: null,
    });
    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-real",
            slug: "gercek-marka",
            companyName: "Gerçek Marka",
            contactEmail: "hello@gercekmarka.com",
            status: "ACTIVE",
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-29T10:00:00.000Z",
            purchasedServices: [{ serviceKey: "web-mobile-design", status: "ACTIVE" }],
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockUseGetProjectsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "project-real",
            clientProfileId: "client-real",
            serviceKey: "web-mobile-design",
            figmaProjectUrl: "https://figma.example/file",
            repositoryUrl: null,
            name: "Gerçek Marka UI Redesign",
            slug: "gercek-marka-ui-redesign",
            description: null,
            status: "IN_PROGRESS",
            priority: "HIGH",
            startDate: null,
            dueDate: "2026-06-15T00:00:00.000Z",
            createdAt: "2026-05-01T10:00:00.000Z",
            updatedAt: "2026-05-29T10:00:00.000Z",
            clientProfile: {
              id: "client-real",
              slug: "gercek-marka",
              companyName: "Gerçek Marka",
              contactEmail: "hello@gercekmarka.com",
              purchasedServices: [{ serviceKey: "web-mobile-design", status: "ACTIVE" }],
            },
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockUseGetTasksQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "task-real",
            projectId: "project-real",
            sprintId: null,
            title: "Homepage hero revizyonu",
            description: "Hero kreatifi marka yönergelerine göre güncellenecek.",
            status: "REVIEW",
            priority: "URGENT",
            type: "REVISION",
            workstream: "UI_INTEGRATION",
            assigneeUserId: "designer-user-id",
            dueDate: "2026-05-30T18:00:00.000Z",
            approvalRequired: true,
            approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL",
            approvalStatus: "CHANGES_REQUESTED",
            approvalResponseNote: "Logo kullanımı güncellensin.",
            campaignRef: "Q2 marka yenileme",
            adSetRef: "Desktop + Mobile",
            adRef: null,
            createdAt: "2026-05-29T10:00:00.000Z",
            updatedAt: "2026-05-30T09:00:00.000Z",
            project: {
              id: "project-real",
              clientProfileId: "client-real",
              name: "Gerçek Marka UI Redesign",
              slug: "gercek-marka-ui-redesign",
              status: "IN_PROGRESS",
              priority: "HIGH",
              clientProfile: {
                id: "client-real",
                slug: "gercek-marka",
                companyName: "Gerçek Marka",
                contactEmail: "hello@gercekmarka.com",
                purchasedServices: [{ serviceKey: "web-mobile-design", status: "ACTIVE" }],
              },
            },
            assignee: { id: "designer-user-id", displayName: "Derya Designer", role: "DESIGNER" },
            todos: [{ id: "todo-1", title: "Hero export", isCompleted: false }],
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders designer dashboard from API data instead of mock clients", () => {
    render(<DesignerDashboard />);

    expect(screen.getAllByText("Gerçek Marka").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gerçek Marka UI Redesign").length).toBeGreaterThan(0);
    expect(screen.getByText("Homepage hero revizyonu")).toBeInTheDocument();
    expect(screen.getByText("Logo kullanımı güncellensin.")).toBeInTheDocument();
    expect(screen.queryByText("XYZ Holding")).not.toBeInTheDocument();
    expect(screen.queryByText("ABC Corp")).not.toBeInTheDocument();
  });

  it("renders loading state without static mock rows", () => {
    mockUseGetClientsQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseGetProjectsQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    mockUseGetTasksQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(<DesignerDashboard />);

    expect(screen.getByText("Designer profili yükleniyor...")).toBeInTheDocument();
    expect(screen.queryByText("XYZ Holding")).not.toBeInTheDocument();
  });
});
