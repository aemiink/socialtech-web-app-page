/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type { Task } from "../../features/tasks/tasksTypes";
import { TaskDetail } from "../TaskDetail";

type QueryOptions = {
  skip?: boolean;
};

type TaskQueryResult = {
  data?: Task;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type TodoMutationTrigger = (payload: {
  taskId: string;
  todoId?: string;
  body?: unknown;
}) => MutationResponse<unknown>;

type DeleteTodoTrigger = (payload: {
  taskId: string;
  todoId: string;
}) => MutationResponse<unknown>;

type TaskWithSensitiveFields = Task & {
  passwordHash: string;
  resetToken: string;
  apiSecret: string;
  authorization: string;
};

const mockUseGetTaskQuery = vi.fn<
  (id: string, options: QueryOptions) => TaskQueryResult
>();
const mockUseCreateTaskTodoMutation = vi.fn<() => [TodoMutationTrigger, { isLoading: boolean }]>();
const mockUseUpdateTaskTodoMutation = vi.fn<() => [TodoMutationTrigger, { isLoading: boolean }]>();
const mockUseToggleTaskTodoMutation = vi.fn<() => [TodoMutationTrigger, { isLoading: boolean }]>();
const mockUseDeleteTaskTodoMutation = vi.fn<() => [DeleteTodoTrigger, { isLoading: boolean }]>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetTaskQuery: (id: string, options: QueryOptions) =>
    mockUseGetTaskQuery(id, options),
  useCreateTaskTodoMutation: () => mockUseCreateTaskTodoMutation(),
  useUpdateTaskTodoMutation: () => mockUseUpdateTaskTodoMutation(),
  useToggleTaskTodoMutation: () => mockUseToggleTaskTodoMutation(),
  useDeleteTaskTodoMutation: () => mockUseDeleteTaskTodoMutation(),
}));

const taskId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const clientProfileId = "33333333-3333-4333-8333-333333333333";
const assigneeUserId = "44444444-4444-4444-8444-444444444444";

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["tasks.read.any"],
  clientProfile: null,
};

const adminWithoutTaskReadPermission: AuthUserProfile = {
  ...adminUser,
  permissions: [],
};

const taskManagerUser: AuthUserProfile = {
  ...adminUser,
  permissions: ["tasks.read.any", "tasks.manage.any"],
};

const taskDetail: TaskWithSensitiveFields = {
  id: taskId,
  projectId,
  title: "Landing page QA tamamla",
  description: "Growth Hub landing page regresyon kontrolleri.",
  status: "IN_PROGRESS",
  priority: "URGENT",
  assigneeUserId,
  dueDate: "2026-05-15T18:00:00.000Z",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  project: {
    id: projectId,
    clientProfileId,
    name: "Growth Hub Launch",
    slug: "growth-hub-launch",
    status: "IN_PROGRESS",
    priority: "HIGH",
    clientProfile: {
      id: clientProfileId,
      slug: "acme-e-ticaret",
      companyName: "Acme E-ticaret",
      contactEmail: "client@acme.test",
    },
  },
  assignee: {
    id: assigneeUserId,
    displayName: "Deniz Developer",
    role: "DEVELOPER",
  },
  todos: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      taskId,
      title: "Desktop QA",
      isCompleted: true,
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      taskId,
      title: "Mobile QA",
      isCompleted: false,
    },
  ],
  completion: {
    totalTodos: 2,
    completedTodos: 1,
    percent: 50,
  },
  passwordHash: "hashed-password-value",
  resetToken: "reset-token-value",
  apiSecret: "api-secret-value",
  authorization: "Bearer sensitive-value",
};

function setupQueryState(overrides: Partial<TaskQueryResult> = {}) {
  mockUseGetTaskQuery.mockReturnValue({
    data: undefined,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupTodoMutations() {
  const createTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const updateTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const toggleTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const deleteTodo = vi.fn<DeleteTodoTrigger>(() => ({ unwrap: async () => ({}) }));

  mockUseCreateTaskTodoMutation.mockReturnValue([createTodo, { isLoading: false }]);
  mockUseUpdateTaskTodoMutation.mockReturnValue([updateTodo, { isLoading: false }]);
  mockUseToggleTaskTodoMutation.mockReturnValue([toggleTodo, { isLoading: false }]);
  mockUseDeleteTaskTodoMutation.mockReturnValue([deleteTodo, { isLoading: false }]);

  return { createTodo, updateTodo, toggleTodo, deleteTodo };
}

function renderTaskDetail(id: string = taskId) {
  render(
    <MemoryRouter initialEntries={[`/gorevler/${id}`]}>
      <Routes>
        <Route path="/gorevler/:id" element={<TaskDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TaskDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupQueryState();
    setupTodoMutations();
  });

  it("shows invalid UUID state and skips the detail query", () => {
    renderTaskDetail("not-a-uuid");

    expect(screen.getByText("Geçersiz görev kimliği.")).toBeInTheDocument();
    expect(mockUseGetTaskQuery).toHaveBeenCalledWith("not-a-uuid", {
      skip: true,
    });
  });

  it("shows forbidden state and skips the detail query when user lacks task read permission", () => {
    currentUser = adminWithoutTaskReadPermission;

    renderTaskDetail();

    expect(screen.getByText("Bu sayfaya erişim yetkiniz bulunmuyor.")).toBeInTheDocument();
    expect(mockUseGetTaskQuery).toHaveBeenCalledWith(taskId, {
      skip: true,
    });
  });

  it("shows loading state while task detail is loading", () => {
    setupQueryState({ isLoading: true });

    renderTaskDetail();

    expect(screen.getByText("Görev detayı yükleniyor...")).toBeInTheDocument();
  });

  it("shows error state when task detail request fails", () => {
    setupQueryState({
      error: { status: 500, data: { message: "Görev detayı alınamadı." } },
      isError: true,
    });

    renderTaskDetail();

    expect(screen.getByText("Görev detayı alınamadı.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("shows not found state when no task is returned", () => {
    setupQueryState({ data: undefined });

    renderTaskDetail();

    expect(screen.getByText("Görev kaydı bulunamadı.")).toBeInTheDocument();
  });

  it("renders task title, project, client, assignee and identifiers on success", () => {
    setupQueryState({ data: taskDetail });

    renderTaskDetail();

    expect(screen.getByRole("heading", { name: "Landing page QA tamamla" })).toBeInTheDocument();
    expect(screen.getByText(/Growth Hub Launch/)).toBeInTheDocument();
    expect(screen.getByText(/Acme E-ticaret/)).toBeInTheDocument();
    expect(screen.getByText("Deniz Developer")).toBeInTheDocument();
    expect(screen.getAllByText("Acil").length).toBeGreaterThan(0);
    expect(screen.getByText("Todo Listesi")).toBeInTheDocument();
    expect(screen.getByText("1/2 tamamlandı · %50")).toBeInTheDocument();
    expect(screen.getByText("Desktop QA")).toBeInTheDocument();
    expect(screen.getByText("Mobile QA")).toBeInTheDocument();
    expect(screen.getByText(projectId)).toBeInTheDocument();
    expect(screen.getByText(assigneeUserId)).toBeInTheDocument();
  });

  it("allows admins with manage permission to create, toggle, update, and delete todos", async () => {
    currentUser = taskManagerUser;
    const { createTodo, toggleTodo, updateTodo, deleteTodo } = setupTodoMutations();
    setupQueryState({ data: taskDetail });

    renderTaskDetail();

    fireEvent.change(screen.getByLabelText("Yeni todo"), {
      target: { value: "  Tablet QA  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Todo Ekle" }));

    await waitFor(() => {
      expect(createTodo).toHaveBeenCalledWith({
        taskId,
        body: { title: "Tablet QA", visibility: "INTERNAL" },
      });
    });

    fireEvent.click(screen.getByLabelText("Mobile QA durumunu değiştir"));
    await waitFor(() => {
      expect(toggleTodo).toHaveBeenCalledWith({
        taskId,
        todoId: "66666666-6666-4666-8666-666666666666",
        body: { isCompleted: true },
      });
    });

    const todoList = screen.getByText("Todo Listesi").closest("div");
    if (!(todoList instanceof HTMLElement)) {
      throw new Error("Todo list container not found.");
    }

    fireEvent.click(screen.getAllByRole("button", { name: "Düzenle" })[0]);
    fireEvent.change(screen.getByLabelText("Todo başlığı"), {
      target: { value: "Desktop QA updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalledWith({
        taskId,
        todoId: "55555555-5555-4555-8555-555555555555",
        body: { title: "Desktop QA updated" },
      });
    });

    fireEvent.click(within(document.body).getAllByRole("button", { name: /Sil/ })[0]);
    await waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith({
        taskId,
        todoId: "55555555-5555-4555-8555-555555555555",
      });
    });
  });

  it("does not render sensitive fields returned by the API", () => {
    setupQueryState({ data: taskDetail });

    renderTaskDetail();

    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/reset-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
    expect(document.body).not.toHaveTextContent(/Bearer sensitive-value/i);
  });
});
