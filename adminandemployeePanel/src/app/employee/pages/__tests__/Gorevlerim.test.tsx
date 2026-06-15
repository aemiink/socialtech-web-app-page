/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type {
  CreateTaskRequest,
  Task,
  TasksListQuery,
  TasksListResponse,
} from "../../../features/tasks/tasksTypes";
import { Gorevlerim } from "../Gorevlerim";

type QueryOptions = {
  skip?: boolean;
};

type TasksQueryResult = {
  data?: TasksListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type ToggleTodoTrigger = (payload: {
  taskId: string;
  todoId: string;
  body: { isCompleted: boolean };
}) => MutationResponse<unknown>;

type CreateTaskTrigger = (payload: CreateTaskRequest) => MutationResponse<unknown>;

const mockUseGetTasksQuery = vi.fn<
  (query: TasksListQuery, options?: QueryOptions) => TasksQueryResult
>();
const mockUseToggleTaskTodoMutation = vi.fn<() => [ToggleTodoTrigger, { isLoading: boolean }]>();
const mockUseCreateTaskMutation = vi.fn<() => [CreateTaskTrigger, { isLoading: boolean }]>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
  useCreateTaskMutation: () => mockUseCreateTaskMutation(),
  useGetTasksQuery: (query: TasksListQuery, options?: QueryOptions) =>
    mockUseGetTasksQuery(query, options),
  useToggleTaskTodoMutation: () => mockUseToggleTaskTodoMutation(),
}));

const employeeUser: AuthUserProfile = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "employee@socialtech.com",
  displayName: "Employee User",
  accountType: "EMPLOYEE",
  role: "DEVELOPER",
  status: "ACTIVE",
  permissions: ["tasks.read.assigned"],
  clientProfile: null,
};

const designerUser: AuthUserProfile = {
  ...employeeUser,
  id: "77777777-7777-4777-8777-777777777777",
  email: "designer@socialtech.com",
  displayName: "Designer User",
  role: "DESIGNER",
  permissions: ["tasks.read.assigned", "socialMedia.approvals.create.assigned"],
};

const assignedTask: Task = {
  id: "33333333-3333-4333-8333-333333333333",
  projectId: "22222222-2222-4222-8222-222222222222",
  title: "Landing page QA",
  description: "Responsive kontroller",
  status: "IN_PROGRESS",
  priority: "HIGH",
  type: "QA",
  workstream: "FRONTEND",
  assigneeUserId: employeeUser.id,
  dueDate: "2026-05-01T09:00:00.000Z",
  createdAt: "2026-04-28T10:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  project: {
    id: "22222222-2222-4222-8222-222222222222",
    clientProfileId: "11111111-1111-4111-8111-111111111111",
    name: "Growth Hub Launch",
    slug: "growth-hub-launch",
    status: "IN_PROGRESS",
    priority: "HIGH",
    clientProfile: {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "acme-e-ticaret",
      companyName: "Acme E-ticaret",
      contactEmail: "client@example.com",
    },
  },
  assignee: {
    id: employeeUser.id,
    displayName: "Employee User",
    role: "DEVELOPER",
  },
  todos: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      taskId: "33333333-3333-4333-8333-333333333333",
      title: "Desktop QA",
      isCompleted: true,
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      taskId: "33333333-3333-4333-8333-333333333333",
      title: "Mobile QA",
      isCompleted: false,
    },
  ],
  completion: {
    totalTodos: 2,
    completedTodos: 1,
    percent: 50,
  },
};

const designerTask: Task = {
  ...assignedTask,
  id: "88888888-8888-4888-8888-888888888888",
  title: "Instagram carousel kreatifi",
  description: "Mayıs lansman serisi için 3 görsel hazırlanacak.",
  status: "REVIEW",
  type: "REVISION",
  workstream: "UI_INTEGRATION",
  assigneeUserId: designerUser.id,
  approvalRequired: true,
  approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL",
  approvalStatus: "CHANGES_REQUESTED",
  approvalResponseNote: "Logo kullanımı güncellensin.",
  campaignRef: "Mayıs lansman",
  adSetRef: "Carousel 1080x1080",
  dueDate: "2026-05-01T18:00:00.000Z",
  project: {
    ...assignedTask.project!,
    serviceKey: "social-media",
    name: "Social Media Operasyonu",
    slug: "social-media-operasyonu",
  },
  assignee: {
    id: designerUser.id,
    displayName: "Designer User",
    role: "DESIGNER",
  },
  todos: [
    {
      id: "99999999-9999-4999-8999-999999999999",
      taskId: "88888888-8888-4888-8888-888888888888",
      title: "Key visual export",
      isCompleted: false,
    },
  ],
  completion: {
    totalTodos: 1,
    completedTodos: 0,
    percent: 0,
  },
};

const assignedTasksResponse: TasksListResponse = {
  data: [assignedTask],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const emptyTasksResponse: TasksListResponse = {
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

function setupTasksState(overrides: Partial<TasksQueryResult> = {}) {
  mockUseGetTasksQuery.mockReturnValue({
    data: assignedTasksResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupTodoMutation() {
  const toggleTodo = vi.fn<ToggleTodoTrigger>(() => ({ unwrap: async () => ({}) }));
  mockUseToggleTaskTodoMutation.mockReturnValue([toggleTodo, { isLoading: false }]);
  return { toggleTodo };
}

function setupCreateTaskMutation() {
  const createTask = vi.fn<CreateTaskTrigger>(() => ({ unwrap: async () => ({}) }));
  mockUseCreateTaskMutation.mockReturnValue([createTask, { isLoading: false }]);
  return { createTask };
}

function renderGorevlerim() {
  render(
    <MemoryRouter>
      <Gorevlerim />
    </MemoryRouter>,
  );
}

describe("Gorevlerim", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T09:00:00.000Z"));
    vi.clearAllMocks();
    currentUser = employeeUser;
    setupTasksState();
    setupTodoMutation();
    setupCreateTaskMutation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows loading state", () => {
    setupTasksState({ data: undefined, isLoading: true });

    renderGorevlerim();

    expect(screen.getByText("Görevler yükleniyor...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    setupTasksState({
      data: undefined,
      error: { status: 500, data: { message: "Görev servisi kullanılamıyor." } },
      isError: true,
    });

    renderGorevlerim();

    expect(screen.getByText("Görev servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("shows empty state", () => {
    setupTasksState({ data: emptyTasksResponse });

    renderGorevlerim();

    expect(screen.getByText("Atama kapsamınızda görev bulunmuyor.")).toBeInTheDocument();
  });

  it("renders assigned tasks from the API response", () => {
    renderGorevlerim();

    expect(screen.getByText("Landing page QA")).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Growth Hub Launch").length).toBeGreaterThan(0);
    expect(screen.getByText("Yüksek")).toBeInTheDocument();
    expect(screen.getByText("Devam Ediyor")).toBeInTheDocument();
    expect(screen.getByText("Desktop QA")).toBeInTheDocument();
    expect(screen.getByText("Mobile QA")).toBeInTheDocument();
    expect(screen.getByText("1/2 tamamlandı")).toBeInTheDocument();
    expect(screen.getByText("%50")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Detay" }).length).toBeGreaterThan(0);
  });

  it("uses designer-specific labels and creative context for designer employees", () => {
    currentUser = designerUser;
    setupTasksState({
      data: {
        ...assignedTasksResponse,
        data: [designerTask],
      },
    });

    renderGorevlerim();

    expect(screen.getByText("Tasarım Görevlerim")).toBeInTheDocument();
    expect(screen.getByText("Kreatif, UI ve revizyon işlerin")).toBeInTheDocument();
    expect(screen.getByText("Bugünkü Tasarım")).toBeInTheDocument();
    expect(screen.getByText("Geciken Teslim")).toBeInTheDocument();
    expect(screen.getByText("Revizyon / Onay")).toBeInTheDocument();
    expect(screen.getByText("Teslim Edilen")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Tasarım Görevi" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Alan / Kanal" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Checklist" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Teslim" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Proje" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Deadline" })).not.toBeInTheDocument();
    expect(screen.getByText("Instagram carousel kreatifi")).toBeInTheDocument();
    expect(screen.getByText("Social Media Kreatif")).toBeInTheDocument();
    expect(screen.getByText("Revizyon İstendi")).toBeInTheDocument();
    expect(screen.getByText("Revizyon notu: Logo kullanımı güncellensin.")).toBeInTheDocument();
    expect(screen.getByText("Social Media")).toBeInTheDocument();
    expect(screen.getByText("Format: Carousel 1080x1080")).toBeInTheDocument();
    expect(screen.getByText("0/1 checklist")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Müşteri Onayına Gönder" })).toBeInTheDocument();
  });

  it("creates a customer approval task for supported designer work", async () => {
    currentUser = designerUser;
    const { createTask } = setupCreateTaskMutation();
    setupTasksState({
      data: {
        ...assignedTasksResponse,
        data: [designerTask],
      },
    });

    renderGorevlerim();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Müşteri Onayına Gönder" }));
      await Promise.resolve();
    });

    expect(createTask).toHaveBeenCalled();
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: designerTask.projectId,
        title: "Müşteri onayı: Instagram carousel kreatifi",
        status: "REVIEW",
        type: "REVISION",
        workstream: "UI_INTEGRATION",
        approvalRequired: true,
        approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL",
        approvalStatus: "PENDING",
        campaignRef: "Mayıs lansman",
        adSetRef: "Carousel 1080x1080",
      }),
    );
    expect(screen.getByText("Instagram carousel kreatifi müşteri onayına gönderildi.")).toBeInTheDocument();
  });

  it("toggles an own task todo", async () => {
    const { toggleTodo } = setupTodoMutation();

    renderGorevlerim();

    fireEvent.click(screen.getByLabelText("Mobile QA durumunu değiştir"));

    expect(toggleTodo).toHaveBeenCalledWith({
      taskId: assignedTask.id,
      todoId: "66666666-6666-4666-8666-666666666666",
      body: { isCompleted: true },
    });
  });

  it("queries tasks with assignee filter and does not skip for authorized employees", () => {
    renderGorevlerim();

    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id },
      { skip: false },
    );
  });

  it("shows unauthorized state and skips the query without assigned-task permission", () => {
    currentUser = {
      ...employeeUser,
      permissions: [],
    };

    renderGorevlerim();

    expect(screen.getByText("Atanmış görevleri görüntüleme yetkiniz bulunmuyor."))
      .toBeInTheDocument();
    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      { assigneeUserId: employeeUser.id },
      { skip: true },
    );
  });
});
