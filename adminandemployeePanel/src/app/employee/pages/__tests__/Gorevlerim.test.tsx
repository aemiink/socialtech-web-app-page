/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type {
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

const mockUseGetTasksQuery = vi.fn<
  (query: TasksListQuery, options?: QueryOptions) => TasksQueryResult
>();
const mockUseToggleTaskTodoMutation = vi.fn<() => [ToggleTodoTrigger, { isLoading: boolean }]>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
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

const scopedTeamTask: Task = {
  id: "77777777-7777-4777-8777-777777777777",
  projectId: "22222222-2222-4222-8222-222222222222",
  title: "Client workshop follow-up",
  description: "Takım içi koordinasyon görevleri",
  status: "TODO",
  priority: "MEDIUM",
  type: "FEATURE",
  workstream: "FULLSTACK",
  assigneeUserId: "88888888-8888-4888-8888-888888888888",
  dueDate: "2026-05-03T09:00:00.000Z",
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
    id: "88888888-8888-4888-8888-888888888888",
    displayName: "Team Member",
    role: "DEVELOPER",
  },
  todos: [
    {
      id: "99999999-9999-4999-8999-999999999999",
      taskId: "77777777-7777-4777-8777-777777777777",
      title: "Workshop notes",
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
  data: [assignedTask, scopedTeamTask],
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

  it("toggles a scoped team task todo", async () => {
    const { toggleTodo } = setupTodoMutation();

    renderGorevlerim();

    fireEvent.click(screen.getByLabelText("Workshop notes durumunu değiştir"));

    expect(toggleTodo).toHaveBeenCalledWith({
      taskId: scopedTeamTask.id,
      todoId: "99999999-9999-4999-8999-999999999999",
      body: { isCompleted: true },
    });
  });

  it("queries tasks without assignee filter and does not skip for authorized employees", () => {
    renderGorevlerim();

    expect(mockUseGetTasksQuery).toHaveBeenCalledWith(
      {},
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
      {},
      { skip: true },
    );
  });
});
