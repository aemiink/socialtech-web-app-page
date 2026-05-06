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
const mockUseGetProjectRepositoryQuery = vi.fn();
const mockUseGetProjectFileFoldersQuery = vi.fn();
const mockUseGetProjectFileFolderAssigneesQuery = vi.fn();
const mockUseGetProjectFilesQuery = vi.fn();
const mockUseCreateProjectFileFolderMutation = vi.fn();
const mockUseUpdateProjectFileFolderAssigneesMutation = vi.fn();
const mockUseCreateProjectFileUploadSignatureMutation = vi.fn();
const mockUseCompleteProjectFileUploadMutation = vi.fn();
const mockUseDeleteProjectFileMutation = vi.fn();
const mockUseGetRelatedTaskCommitsQuery = vi.fn();
const mockUseCreateTaskTodoMutation = vi.fn<() => [TodoMutationTrigger, { isLoading: boolean }]>();
const mockUseCreateTaskWorkNoteMutation = vi.fn();
const mockUsePrepareTaskCodeMutation = vi.fn();
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
  useCreateTaskWorkNoteMutation: () => mockUseCreateTaskWorkNoteMutation(),
  usePrepareTaskCodeMutation: () => mockUsePrepareTaskCodeMutation(),
  useGetRelatedTaskCommitsQuery: (query: unknown, options?: unknown) =>
    mockUseGetRelatedTaskCommitsQuery(query, options),
  useUpdateTaskTodoMutation: () => mockUseUpdateTaskTodoMutation(),
  useToggleTaskTodoMutation: () => mockUseToggleTaskTodoMutation(),
  useDeleteTaskTodoMutation: () => mockUseDeleteTaskTodoMutation(),
}));

vi.mock("../../features/projects/projectsApi", () => ({
  useGetProjectRepositoryQuery: (id: string, options?: QueryOptions) =>
    mockUseGetProjectRepositoryQuery(id, options),
  useGetProjectFileFoldersQuery: (query: unknown, options?: QueryOptions) =>
    mockUseGetProjectFileFoldersQuery(query, options),
  useGetProjectFileFolderAssigneesQuery: (query: unknown, options?: QueryOptions) =>
    mockUseGetProjectFileFolderAssigneesQuery(query, options),
  useGetProjectFilesQuery: (query: unknown, options?: QueryOptions) =>
    mockUseGetProjectFilesQuery(query, options),
  useCreateProjectFileFolderMutation: () => mockUseCreateProjectFileFolderMutation(),
  useUpdateProjectFileFolderAssigneesMutation: () =>
    mockUseUpdateProjectFileFolderAssigneesMutation(),
  useCreateProjectFileUploadSignatureMutation: () =>
    mockUseCreateProjectFileUploadSignatureMutation(),
  useCompleteProjectFileUploadMutation: () => mockUseCompleteProjectFileUploadMutation(),
  useDeleteProjectFileMutation: () => mockUseDeleteProjectFileMutation(),
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

const developerUser: AuthUserProfile = {
  id: "developer-user-id",
  email: "developer@socialtech.com",
  displayName: "Developer User",
  accountType: "EMPLOYEE",
  role: "DEVELOPER",
  status: "ACTIVE",
  permissions: ["tasks.read.assigned", "integrations.github.read.assigned"],
  clientProfile: null,
};

const designerUser: AuthUserProfile = {
  id: "designer-user-id",
  email: "designer@socialtech.com",
  displayName: "Designer User",
  accountType: "EMPLOYEE",
  role: "DESIGNER",
  status: "ACTIVE",
  permissions: ["tasks.read.assigned", "projects.files.manage.assigned"],
  clientProfile: null,
};

const taskDetail: TaskWithSensitiveFields = {
  id: taskId,
  projectId,
  title: "Landing page QA tamamla",
  description: "Growth Hub landing page regresyon kontrolleri.",
  status: "IN_PROGRESS",
  priority: "URGENT",
  type: "QA",
  workstream: "FRONTEND",
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
  mockUseGetProjectRepositoryQuery.mockReturnValue({ data: undefined });
  mockUseGetProjectFileFoldersQuery.mockReturnValue({ data: [] });
  mockUseGetProjectFileFolderAssigneesQuery.mockReturnValue({ data: [] });
  mockUseGetProjectFilesQuery.mockReturnValue({
    data: { data: [] },
    refetch: vi.fn(),
    isFetching: false,
  });
  mockUseGetRelatedTaskCommitsQuery.mockReturnValue({ data: [] });
}

function setupTodoMutations() {
  const createTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const updateTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const toggleTodo = vi.fn<TodoMutationTrigger>(() => ({ unwrap: async () => ({}) }));
  const deleteTodo = vi.fn<DeleteTodoTrigger>(() => ({ unwrap: async () => ({}) }));
  const createWorkNote = vi.fn(() => ({ unwrap: async () => ({}) }));
  const prepareTaskCode = vi.fn(() => ({ unwrap: async () => ({}) }));
  const createFolder = vi.fn(() => ({ unwrap: async () => ({ id: "folder-id" }) }));
  const updateFolderAssignees = vi.fn(() => ({ unwrap: async () => ({}) }));
  const createUploadSignature = vi.fn(() => ({ unwrap: async () => ({}) }));
  const completeUpload = vi.fn(() => ({ unwrap: async () => ({}) }));
  const deleteProjectFile = vi.fn(() => ({ unwrap: async () => ({}) }));

  mockUseCreateTaskTodoMutation.mockReturnValue([createTodo, { isLoading: false }]);
  mockUseCreateTaskWorkNoteMutation.mockReturnValue([createWorkNote, { isLoading: false }]);
  mockUsePrepareTaskCodeMutation.mockReturnValue([prepareTaskCode, { isLoading: false }]);
  mockUseUpdateTaskTodoMutation.mockReturnValue([updateTodo, { isLoading: false }]);
  mockUseToggleTaskTodoMutation.mockReturnValue([toggleTodo, { isLoading: false }]);
  mockUseDeleteTaskTodoMutation.mockReturnValue([deleteTodo, { isLoading: false }]);
  mockUseCreateProjectFileFolderMutation.mockReturnValue([createFolder, { isLoading: false }]);
  mockUseUpdateProjectFileFolderAssigneesMutation.mockReturnValue([
    updateFolderAssignees,
    { isLoading: false },
  ]);
  mockUseCreateProjectFileUploadSignatureMutation.mockReturnValue([
    createUploadSignature,
    { isLoading: false },
  ]);
  mockUseCompleteProjectFileUploadMutation.mockReturnValue([completeUpload, { isLoading: false }]);
  mockUseDeleteProjectFileMutation.mockReturnValue([deleteProjectFile, { isLoading: false }]);

  return {
    createTodo,
    createWorkNote,
    prepareTaskCode,
    updateTodo,
    toggleTodo,
    deleteTodo,
    createFolder,
    updateFolderAssignees,
  };
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

  it("allows assigned-scope employee users to read task detail", () => {
    currentUser = developerUser;
    setupQueryState({ data: taskDetail });

    renderTaskDetail();

    expect(screen.getByRole("heading", { name: "Landing page QA tamamla" })).toBeInTheDocument();
    expect(mockUseGetTaskQuery).toHaveBeenCalledWith(taskId, {
      skip: false,
    });
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

  it("renders local work note section and related commits when repository data is available", () => {
    currentUser = developerUser;
    setupQueryState({
      data: {
        ...taskDetail,
        code: "WEB-204",
      },
    });
    mockUseGetProjectRepositoryQuery.mockReturnValue({
      data: {
        id: "repo-id",
        projectId,
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
    mockUseGetRelatedTaskCommitsQuery.mockReturnValue({
      data: [
        {
          sha: "abc123",
          shortSha: "abc123",
          message: "WEB-204 landing page QA fixes",
          githubAuthorLogin: "denizdev",
          committedAt: "2026-05-10T10:00:00.000Z",
          htmlUrl: "https://github.com/socialtech/growth-hub/commit/abc123",
        },
      ],
    });

    renderTaskDetail();

    expect(screen.getByText("Yapılanlar / Çalışma Notu")).toBeInTheDocument();
    expect(screen.getByText("İlgili Commitler")).toBeInTheDocument();
    expect(screen.getByText("WEB-204 landing page QA fixes")).toBeInTheDocument();
  });

  it("renders design folder panel instead of commits for UI/UX tasks", async () => {
    currentUser = designerUser;
    setupQueryState({
      data: {
        ...taskDetail,
        code: "DES-21",
        type: "FEATURE",
        workstream: "UI_INTEGRATION",
      },
    });
    mockUseGetProjectFileFoldersQuery.mockReturnValue({
      data: [
        {
          id: "folder-1",
          projectId,
          name: "DESIGN-DES-21 - Landing page QA tamamla",
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      ],
    });
    mockUseGetProjectFilesQuery.mockReturnValue({
      data: {
        data: [],
      },
      refetch: vi.fn(),
      isFetching: false,
    });

    renderTaskDetail();

    await waitFor(() => {
      expect(screen.getByText("Tasarım Klasörü")).toBeInTheDocument();
    });
    expect(screen.queryByText("İlgili Commitler")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tasarım Dosyası Yükle" })).toBeInTheDocument();
  });
});
