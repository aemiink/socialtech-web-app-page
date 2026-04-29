/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  Project,
  ProjectsListQuery,
  ProjectsListResponse,
} from "../../features/projects/projectsTypes";
import type {
  CreateTaskRequest,
  Task,
  TasksListQuery,
  TasksListResponse,
  UpdateTaskRequest,
} from "../../features/tasks/tasksTypes";
import { Tasks } from "../Tasks";

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type TasksQueryResult = {
  data?: TasksListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type ProjectsQueryResult = {
  data?: ProjectsListResponse;
  isLoading: boolean;
};

type CreateTaskTrigger = (payload: CreateTaskRequest) => MutationResponse<Task>;

type UpdateTaskTrigger = (payload: {
  id: string;
  body: UpdateTaskRequest;
}) => MutationResponse<Task>;

const mockUseGetTasksQuery = vi.fn<(query: TasksListQuery) => TasksQueryResult>();
const mockUseCreateTaskMutation = vi.fn<() => [CreateTaskTrigger, { isLoading: boolean }]>();
const mockUseUpdateTaskMutation = vi.fn<() => [UpdateTaskTrigger, { isLoading: boolean }]>();
const mockUseGetProjectsQuery = vi.fn<
  (query?: ProjectsListQuery) => ProjectsQueryResult
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: (query: TasksListQuery) => mockUseGetTasksQuery(query),
  useCreateTaskMutation: () => mockUseCreateTaskMutation(),
  useUpdateTaskMutation: () => mockUseUpdateTaskMutation(),
}));

vi.mock("../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (query?: ProjectsListQuery) => mockUseGetProjectsQuery(query),
}));

const clientProfileId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";
const assigneeUserId = "44444444-4444-4444-8444-444444444444";

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["tasks.manage.any"],
  clientProfile: null,
};

const adminWithoutTaskManagePermission: AuthUserProfile = {
  ...adminUser,
  permissions: ["tasks.read.any"],
};

const project: Project = {
  id: projectId,
  clientProfileId,
  name: "Growth Hub Launch",
  slug: "growth-hub-launch",
  description: "Launch kapsamı",
  status: "IN_PROGRESS",
  priority: "HIGH",
  startDate: "2026-05-01T00:00:00.000Z",
  dueDate: "2026-05-20T00:00:00.000Z",
  createdAt: "2026-04-28T10:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  clientProfile: {
    id: clientProfileId,
    slug: "acme-e-ticaret",
    companyName: "Acme E-ticaret",
    contactEmail: "client@example.com",
  },
};

const task: Task = {
  id: taskId,
  projectId,
  title: "Landing page QA",
  description: "Task kapsamı",
  status: "IN_PROGRESS",
  priority: "HIGH",
  assigneeUserId,
  dueDate: "2026-05-10T00:00:00.000Z",
  createdAt: "2026-04-28T10:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  project: {
    id: project.id,
    clientProfileId,
    name: project.name,
    slug: project.slug,
    status: project.status,
    priority: project.priority,
    clientProfile: project.clientProfile,
  },
  assignee: {
    id: assigneeUserId,
    displayName: "Deniz Developer",
    role: "DEVELOPER",
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

const populatedTasksResponse: TasksListResponse = {
  data: [task],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const projectsResponse: ProjectsListResponse = {
  data: [project],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupPointerMocks() {
  Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
  Object.defineProperty(window.HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: () => undefined,
  });
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => undefined,
  });
}

function setupTasksState(overrides: Partial<TasksQueryResult> = {}) {
  mockUseGetTasksQuery.mockReturnValue({
    data: emptyTasksResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupProjectsState(response: ProjectsListResponse = projectsResponse) {
  mockUseGetProjectsQuery.mockReturnValue({
    data: response,
    isLoading: false,
  });
}

function setupMutationState() {
  const createTask = vi.fn<CreateTaskTrigger>((payload) => ({
    unwrap: async () => ({
      ...task,
      ...payload,
      id: "55555555-5555-4555-8555-555555555555",
      createdAt: "2026-04-30T10:00:00.000Z",
      updatedAt: "2026-04-30T10:00:00.000Z",
    }),
  }));
  const updateTask = vi.fn<UpdateTaskTrigger>(({ body }) => ({
    unwrap: async () => ({
      ...task,
      ...body,
      updatedAt: "2026-04-30T10:00:00.000Z",
    }),
  }));

  mockUseCreateTaskMutation.mockReturnValue([createTask, { isLoading: false }]);
  mockUseUpdateTaskMutation.mockReturnValue([updateTask, { isLoading: false }]);

  return { createTask, updateTask };
}

function renderTasks() {
  render(
    <MemoryRouter>
      <Tasks />
    </MemoryRouter>,
  );
}

async function selectComboboxOption(
  user: ReturnType<typeof userEvent.setup>,
  combobox: HTMLElement,
  optionName: string,
) {
  await user.click(combobox);
  await user.click(await screen.findByRole("option", { name: optionName }));
}

function getComboboxByFieldLabel(container: HTMLElement, labelText: string) {
  const label = within(container).getByText(labelText, { selector: "label" });
  const fieldRoot = label.closest("div");

  if (!(fieldRoot instanceof HTMLElement)) {
    throw new Error(`Could not find field wrapper for "${labelText}".`);
  }

  return within(fieldRoot).getByRole("combobox");
}

function openCreateDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Yeni Görev Oluştur" }));
  return screen.getByRole("dialog", { name: "Yeni Görev Oluştur" });
}

function getLastTasksQuery() {
  const calls = mockUseGetTasksQuery.mock.calls;
  return calls[calls.length - 1][0];
}

describe("Tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPointerMocks();
    currentUser = adminUser;
    setupTasksState();
    setupProjectsState();
    setupMutationState();
  });

  it("shows loading, error, empty, and list states", () => {
    setupTasksState({ data: undefined, isLoading: true });
    const { rerender } = render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText("Görevler yükleniyor...")).toBeInTheDocument();

    setupTasksState({
      data: undefined,
      error: { status: 500, data: { message: "Görev servisi kullanılamıyor." } },
      isError: true,
    });
    rerender(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText("Görev servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();

    setupTasksState();
    rerender(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText("Filtrelere uygun görev bulunamadı.")).toBeInTheDocument();

    setupTasksState({ data: populatedTasksResponse });
    rerender(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText("Landing page QA")).toBeInTheDocument();
    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(screen.getAllByText("Growth Hub Launch").length).toBeGreaterThan(0);
    expect(screen.getByText("Deniz Developer")).toBeInTheDocument();
  });

  it("disables create and edit actions for an admin without task manage permission", () => {
    currentUser = adminWithoutTaskManagePermission;
    setupTasksState({ data: populatedTasksResponse });

    renderTasks();

    expect(screen.getByRole("button", { name: "Yeni Görev Oluştur" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeDisabled();
  });

  it("enables create and edit actions for an admin with task manage permission", () => {
    currentUser = adminUser;
    setupTasksState({ data: populatedTasksResponse });

    renderTasks();

    expect(screen.getByRole("button", { name: "Yeni Görev Oluştur" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeEnabled();
  });

  it("changes the tasks query when projectId filter changes", async () => {
    const user = userEvent.setup();

    renderTasks();
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(document.body, "Proje"),
      "Growth Hub Launch",
    );

    await waitFor(() => {
      expect(getLastTasksQuery()).toMatchObject({ projectId });
    });
  });

  it("changes the tasks query when assigneeUserId filter is submitted", async () => {
    renderTasks();
    fireEvent.change(screen.getByLabelText("Atanan Kullanıcı ID"), {
      target: { value: ` ${assigneeUserId} ` },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrele" }));

    await waitFor(() => {
      expect(getLastTasksQuery()).toMatchObject({ assigneeUserId });
    });
  });

  it("changes the tasks query when status and priority filters change", async () => {
    const user = userEvent.setup();

    renderTasks();
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(document.body, "Durum"),
      "Devam Ediyor",
    );
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(document.body, "Öncelik"),
      "Acil",
    );

    await waitFor(() => {
      expect(getLastTasksQuery()).toMatchObject({
        status: "IN_PROGRESS",
        priority: "URGENT",
      });
    });
  });

  it("opens the create modal", () => {
    renderTasks();

    expect(openCreateDialog()).toBeInTheDocument();
  });

  it("shows create validation for project, title length, and UUID rules", async () => {
    const user = userEvent.setup();
    const { createTask } = setupMutationState();
    const invalidProject = {
      ...project,
      id: "not-a-uuid",
      name: "Bozuk Proje",
    };
    setupProjectsState({
      ...projectsResponse,
      data: [project, invalidProject],
      meta: {
        ...projectsResponse.meta,
        total: 2,
      },
    });

    renderTasks();
    const dialog = openCreateDialog();

    fireEvent.click(within(dialog).getByRole("button", { name: "Görev Oluştur" }));
    expect(await screen.findByText("Proje seçimi gereklidir.")).toBeInTheDocument();

    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(dialog, "Proje"),
      "Growth Hub Launch",
    );
    fireEvent.change(within(dialog).getByLabelText("Görev Başlığı"), {
      target: { value: "A" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Görev Oluştur" }));
    expect(
      await screen.findByText("Görev başlığı en az 2 karakter olmalıdır."),
    ).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Görev Başlığı"), {
      target: { value: "Valid title" },
    });
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(dialog, "Proje"),
      "Bozuk Proje",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Görev Oluştur" }));

    expect(await screen.findByText("Proje ID geçerli bir UUID olmalıdır.")).toBeInTheDocument();
    expect(createTask).not.toHaveBeenCalled();
  });

  it("submits a valid create payload and shows success", async () => {
    const user = userEvent.setup();
    const { createTask } = setupMutationState();

    renderTasks();
    const dialog = openCreateDialog();

    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(dialog, "Proje"),
      "Growth Hub Launch",
    );
    fireEvent.change(within(dialog).getByLabelText("Görev Başlığı"), {
      target: { value: "  Yeni Görev  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Açıklama"), {
      target: { value: "  Görev kapsamı  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Atanan Kullanıcı ID"), {
      target: { value: ` ${assigneeUserId} ` },
    });
    fireEvent.change(within(dialog).getByLabelText("Deadline"), {
      target: { value: "2026-05-10" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Görev Oluştur" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledTimes(1);
    });
    expect(createTask.mock.calls[0][0]).toEqual({
      projectId,
      title: "Yeni Görev",
      description: "Görev kapsamı",
      status: "TODO",
      priority: "MEDIUM",
      assigneeUserId,
      dueDate: "2026-05-10",
    });
    expect(await screen.findByText("Görev başarıyla oluşturuldu.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps create modal open and shows API error message", async () => {
    const user = userEvent.setup();
    const createTask = vi.fn<CreateTaskTrigger>(() => ({
      unwrap: async () =>
        Promise.reject({
          status: 500,
          data: { message: "Görev API geçici hata döndürdü." },
        }),
    }));
    mockUseCreateTaskMutation.mockReturnValue([createTask, { isLoading: false }]);

    renderTasks();
    const dialog = openCreateDialog();

    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(dialog, "Proje"),
      "Growth Hub Launch",
    );
    fireEvent.change(within(dialog).getByLabelText("Görev Başlığı"), {
      target: { value: "Yeni Görev" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Görev Oluştur" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Görev API geçici hata döndürdü.")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Yeni Görev Oluştur" })).toBeInTheDocument();
  });

  it("opens the update modal and submits update payload", async () => {
    const { updateTask } = setupMutationState();
    setupTasksState({ data: populatedTasksResponse });

    renderTasks();
    fireEvent.click(screen.getByRole("button", { name: "Düzenle" }));

    const dialog = screen.getByRole("dialog", { name: "Görev Güncelle" });
    expect(dialog).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Görev Başlığı"), {
      target: { value: "Updated QA" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Değişiklikleri Kaydet" }));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledTimes(1);
    });
    expect(updateTask.mock.calls[0][0]).toEqual({
      id: taskId,
      body: {
        projectId,
        title: "Updated QA",
        description: "Task kapsamı",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeUserId,
        dueDate: "2026-05-10",
      },
    });
  });

  it("does not render sensitive fields from task data", () => {
    const taskWithSensitiveFields = {
      ...task,
      passwordHash: "hashed-password-value",
      refreshToken: "refresh-token-value",
      apiSecret: "api-secret-value",
    };
    setupTasksState({
      data: {
        ...populatedTasksResponse,
        data: [taskWithSensitiveFields],
      },
    });

    renderTasks();

    expect(screen.getByText("Landing page QA")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/refresh-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
  });
});
