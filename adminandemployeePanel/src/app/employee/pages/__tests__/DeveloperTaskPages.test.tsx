/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type { TasksListQuery, TasksListResponse } from "../../../features/tasks/tasksTypes";
import { BackendAPI } from "../BackendAPI";
import { Buglar } from "../Buglar";
import { Frontend } from "../Frontend";
import { Revizyonlar } from "../Revizyonlar";
import { UITasarimlar } from "../UITasarimlar";

const mockUseGetTasksQuery = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetProjectWorkspaceRevisionsQuery = vi.fn();
let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: (query: TasksListQuery, options?: unknown) =>
    mockUseGetTasksQuery(query, options),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
  useGetProjectWorkspaceRevisionsQuery: (...args: unknown[]) =>
    mockUseGetProjectWorkspaceRevisionsQuery(...args),
}));

const employeeUser: AuthUserProfile = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "developer@socialtech.com",
  displayName: "Developer User",
  accountType: "EMPLOYEE",
  role: "DEVELOPER",
  status: "ACTIVE",
  permissions: ["tasks.read.assigned"],
  clientProfile: null,
};

const emptyResponse: TasksListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupTasksState() {
  mockUseGetTasksQuery.mockReturnValue({
    data: emptyResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  mockUseGetProjectsQuery.mockReturnValue({
    data: {
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  });
  mockUseGetProjectWorkspaceRevisionsQuery.mockReturnValue({
    data: [],
    error: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
}

function renderPage(element: React.ReactElement) {
  render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("Developer task pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = employeeUser;
    setupTasksState();
  });

  it("Frontend page queries tasks by workstream", () => {
    renderPage(<Frontend />);
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id, workstream: "FRONTEND" },
      expect.objectContaining({ skip: false }),
    );
    expect(screen.getByText("Bu kategori için görev bulunmuyor.")).toBeInTheDocument();
    expect(screen.queryAllByRole("link", { name: "Detay" })).toHaveLength(0);
  });

  it("Backend page queries tasks by workstream", () => {
    renderPage(<BackendAPI />);
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id, workstream: "BACKEND" },
      expect.objectContaining({ skip: false }),
    );
  });

  it("Buglar page queries tasks by type and renders severity column shell", () => {
    renderPage(<Buglar />);
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id, type: "BUG" },
      expect.objectContaining({ skip: false }),
    );
    expect(screen.getByText("Bu kategori için görev bulunmuyor.")).toBeInTheDocument();
  });

  it("Revizyonlar page queries tasks by type", () => {
    renderPage(<Revizyonlar />);
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id, type: "REVISION" },
      expect.objectContaining({ skip: false }),
    );
  });

  it("UI Tasarımlar page queries tasks by UI_INTEGRATION workstream", () => {
    renderPage(<UITasarimlar />);
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id, workstream: "UI_INTEGRATION" },
      expect.objectContaining({ skip: false }),
    );
  });
});
