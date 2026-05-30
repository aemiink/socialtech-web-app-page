/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { ProjectManagerServiceWorkspace } from "../ProjectManagerServiceWorkspace";

const mockCreateTask = vi.fn();
const mockCreateTaskTodo = vi.fn();
const mockCreateRevision = vi.fn();
const mockUpdateRevisionStatus = vi.fn();

let currentUser: AuthUserProfile | null = null;
let currentAccessToken = "test-token";
let workspaceRevisions: Array<Record<string, unknown>> = [];

vi.mock("../../../store/hooks", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => {
    const state = {
      auth: {
        accessToken: currentAccessToken,
        currentUser,
      },
    };
    return selector(state);
  },
  useAppDispatch: () => vi.fn(),
}));

vi.mock("../../../features/projects/workspaceSocket", () => ({
  createWorkspaceSocket: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  projectsApi: { util: { updateQueryData: vi.fn() } },
  useGetProjectsQuery: () => ({
    data: {
      data: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          clientProfileId: "11111111-1111-4111-8111-111111111111",
          name: "Web Uygulama Projesi",
          slug: "web-app-projesi",
          status: "IN_PROGRESS",
          priority: "HIGH",
          serviceKey: "web-app",
        },
        {
          id: "55555555-5555-4555-8555-555555555555",
          clientProfileId: "11111111-1111-4111-8111-111111111111",
          name: "Meta Ads Operasyonu",
          slug: "meta-ads-operasyonu",
          status: "IN_PROGRESS",
          priority: "HIGH",
          serviceKey: "meta-ads",
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    isError: false,
    error: undefined,
  }),
  useGetProjectWorkspaceMessagesQuery: () => ({ data: [] }),
  useGetProjectWorkspaceRevisionsQuery: () => ({ data: workspaceRevisions }),
  useGetProjectWorkspaceReportsQuery: () => ({ data: [] }),
  useGetProjectWorkspaceMeetingRequestsQuery: () => ({ data: [] }),
  useGetProjectFilesQuery: () => ({ data: { data: [] } }),
  useGetProjectAssigneeCandidatesQuery: () => ({
    data: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        displayName: "Developer One",
        role: "DEVELOPER",
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        displayName: "Performance One",
        role: "PERFORMANCE_SPECIALIST",
      },
      {
        id: "77777777-7777-4777-8777-777777777777",
        displayName: "Designer One",
        role: "DESIGNER",
      },
    ],
  }),
  useCreateProjectWorkspaceMessageMutation: () => [vi.fn(), { isLoading: false }],
  useCreateProjectWorkspaceRevisionMutation: () => [mockCreateRevision, { isLoading: false }],
  useUpdateProjectWorkspaceRevisionStatusMutation: () => [
    mockUpdateRevisionStatus,
    { isLoading: false },
  ],
}));

vi.mock("../../../features/delivery/deliveryApi", () => ({
  useGetDeliverySprintsQuery: () => ({
    data: {
      data: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          projectId: "22222222-2222-4222-8222-222222222222",
          name: "Sprint 1",
          goal: null,
          status: "PLANNED",
          startDate: "2026-05-05T00:00:00.000Z",
          endDate: "2026-05-19T00:00:00.000Z",
          createdAt: "2026-05-05T00:00:00.000Z",
          updatedAt: "2026-05-05T00:00:00.000Z",
          project: null,
          taskCounts: { total: 0, completed: 0, open: 0 },
          progressPercent: 0,
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
  }),
  useGetDeliveryReleasesQuery: () => ({
    data: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false } },
  }),
  useCreateDeliverySprintMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateDeliverySprintMutation: () => [vi.fn(), { isLoading: false }],
  useCreateDeliveryReleaseMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: () => ({
    data: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false } },
  }),
  useCreateTaskMutation: () => [
    (...args: unknown[]) => mockCreateTask(...args),
    { isLoading: false },
  ],
  useCreateTaskTodoMutation: () => [
    (...args: unknown[]) => mockCreateTaskTodo(...args),
    { isLoading: false },
  ],
  useUpdateTaskMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateTaskTodoMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteTaskTodoMutation: () => [vi.fn(), { isLoading: false }],
  useToggleTaskTodoMutation: () => [vi.fn(), { isLoading: false }],
}));

describe("ProjectManagerServiceWorkspace task routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = {
      id: "99999999-9999-4999-8999-999999999999",
      email: "pm@socialtech.com",
      displayName: "PM User",
      accountType: "EMPLOYEE",
      role: "PROJECT_MANAGER",
      status: "ACTIVE",
      permissions: ["tasks.read.assigned", "tasks.manage.assigned", "delivery.sprints.manage.assigned"],
      clientProfile: null,
    };
    currentAccessToken = "token";
    workspaceRevisions = [];
    mockCreateTask.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: "task-id",
        }),
    });
    mockCreateTaskTodo.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockCreateRevision.mockReset();
    mockCreateRevision.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "revision-id" }),
    });
    mockUpdateRevisionStatus.mockReset();
    mockUpdateRevisionStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "revision-id" }),
    });
  });

  it("creates backend/api tab task with backend workstream", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/employee/project-manager/clients/11111111-1111-4111-8111-111111111111/services/web-app?tab=TASKS",
        ]}
      >
        <Routes>
          <Route
            path="/employee/project-manager/clients/:clientId/services/:serviceKey"
            element={<ProjectManagerServiceWorkspace />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Görev başlığı"), {
      target: { value: "API endpoint geliştir" },
    });

    const targetTabSelect = screen.getByDisplayValue("Hedef Sekme: Görevlerim");
    fireEvent.change(targetTabSelect, { target: { value: "BACKEND_API" } });

    fireEvent.click(screen.getByRole("button", { name: "Görevi ve Checklist'i Oluştur" }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalled();
    });

    const payload = mockCreateTask.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.workstream).toBe("BACKEND");
    expect(payload.type).toBe("FEATURE");
  });

  it("uses service-specific tabs and fields for Meta Ads operations", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/employee/project-manager/clients/11111111-1111-4111-8111-111111111111/services/meta-ads?tab=CAMPAIGNS",
        ]}
      >
        <Routes>
          <Route
            path="/employee/project-manager/clients/:clientId/services/:serviceKey"
            element={<ProjectManagerServiceWorkspace />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("tab", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Optimizasyon" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Kreatifler" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Mesajlar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Toplantılar" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Atanmamış"), {
      target: { value: "66666666-6666-4666-8666-666666666666" },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Hedef Sekme: Reklam Kampanyaları")).toBeInTheDocument();
    });

    expect(screen.queryByRole("option", { name: "Hedef Sekme: Frontend" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Hedef Sekme: Reklam Kampanyaları"), {
      target: { value: "ADS_OPTIMIZATION" },
    });
    fireEvent.change(screen.getByPlaceholderText("Görev başlığı"), {
      target: { value: "Meta optimizasyon kontrolü" },
    });
    fireEvent.change(screen.getByPlaceholderText("Campaign ID / adı"), {
      target: { value: "campaign-123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ad set / grup"), {
      target: { value: "adset-456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Görevi ve Checklist'i Oluştur" }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalled();
    });

    const payload = mockCreateTask.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.projectId).toBe("55555555-5555-4555-8555-555555555555");
    expect(payload.workstream).toBe("BACKEND");
    expect(payload.type).toBe("FEATURE");
    expect(payload.campaignRef).toBe("campaign-123");
    expect(payload.adSetRef).toBe("adset-456");
  });

  it("applies only valid revision transitions with assignee updates", async () => {
    workspaceRevisions = [
      {
        id: "revision-1",
        projectId: "22222222-2222-4222-8222-222222222222",
        title: "Header spacing",
        description: "Header bosluklari duzeltilsin",
        status: "REQUESTED",
        requestedAt: "2026-05-05T09:00:00.000Z",
        requestedByUserId: "client-1",
        requestedBy: { id: "client-1", displayName: "Client User" },
        assignedToUserId: null,
        assignedTo: null,
      },
    ];

    render(
      <MemoryRouter
        initialEntries={[
          "/employee/project-manager/clients/11111111-1111-4111-8111-111111111111/services/web-app?tab=REVISIONS",
        ]}
      >
        <Routes>
          <Route
            path="/employee/project-manager/clients/:clientId/services/:serviceKey"
            element={<ProjectManagerServiceWorkspace />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("option", { name: "APPROVED" })).not.toBeInTheDocument();

    const assigneeSelects = screen.getAllByDisplayValue("Atama yok");
    fireEvent.change(assigneeSelects[1] ?? assigneeSelects[0], {
      target: { value: "33333333-3333-4333-8333-333333333333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Geçişi ve Atamayı Uygula" }));

    await waitFor(() => {
      expect(mockUpdateRevisionStatus).toHaveBeenCalled();
    });

    expect(mockUpdateRevisionStatus).toHaveBeenCalledWith({
      projectId: "22222222-2222-4222-8222-222222222222",
      revisionId: "revision-1",
      status: "ACKNOWLEDGED",
      assignedToUserId: "33333333-3333-4333-8333-333333333333",
      note: undefined,
    });
  });
});
