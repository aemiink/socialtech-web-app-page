/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  CreateProjectRequest,
  Project,
  ProjectsListQuery,
  ProjectsListResponse,
  UpdateProjectRequest,
} from "../../features/projects/projectsTypes";
import { Projects } from "../Projects";

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type ProjectsQueryResult = {
  data?: ProjectsListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type CreateProjectTrigger = (
  payload: CreateProjectRequest,
) => MutationResponse<Project>;

type UpdateProjectTrigger = (payload: {
  id: string;
  body: UpdateProjectRequest;
}) => MutationResponse<Project>;

const mockUseGetProjectsQuery = vi.fn<(query: ProjectsListQuery) => ProjectsQueryResult>();
const mockUseCreateProjectMutation = vi.fn<
  () => [CreateProjectTrigger, { isLoading: boolean }]
>();
const mockUseUpdateProjectMutation = vi.fn<
  () => [UpdateProjectTrigger, { isLoading: boolean }]
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (query: ProjectsListQuery) => mockUseGetProjectsQuery(query),
  useCreateProjectMutation: () => mockUseCreateProjectMutation(),
  useUpdateProjectMutation: () => mockUseUpdateProjectMutation(),
}));

const clientProfileId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["projects.manage.any"],
  clientProfile: null,
};

const adminWithoutProjectManagePermission: AuthUserProfile = {
  ...adminUser,
  permissions: ["projects.read.any"],
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

const emptyProjectsResponse: ProjectsListResponse = {
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

const populatedProjectsResponse: ProjectsListResponse = {
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

function setupListState(overrides: Partial<ProjectsQueryResult> = {}) {
  mockUseGetProjectsQuery.mockReturnValue({
    data: emptyProjectsResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupMutationState() {
  const createProject = vi.fn<CreateProjectTrigger>((payload) => ({
    unwrap: async () => ({
      ...project,
      ...payload,
      id: "33333333-3333-4333-8333-333333333333",
      createdAt: "2026-04-30T10:00:00.000Z",
      updatedAt: "2026-04-30T10:00:00.000Z",
      clientProfile: project.clientProfile,
    }),
  }));
  const updateProject = vi.fn<UpdateProjectTrigger>(({ body }) => ({
    unwrap: async () => ({
      ...project,
      ...body,
      updatedAt: "2026-04-30T10:00:00.000Z",
    }),
  }));

  mockUseCreateProjectMutation.mockReturnValue([createProject, { isLoading: false }]);
  mockUseUpdateProjectMutation.mockReturnValue([updateProject, { isLoading: false }]);

  return { createProject, updateProject };
}

function renderProjects() {
  render(
    <MemoryRouter>
      <Projects />
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
  fireEvent.click(screen.getByRole("button", { name: "Yeni Proje Oluştur" }));
  return screen.getByRole("dialog", { name: "Yeni Proje Oluştur" });
}

function getLastProjectsQuery() {
  const calls = mockUseGetProjectsQuery.mock.calls;
  return calls[calls.length - 1][0];
}

describe("Projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPointerMocks();
    currentUser = adminUser;
    setupListState();
    setupMutationState();
  });

  it("shows loading, error, empty, and list states", () => {
    setupListState({ data: undefined, isLoading: true });
    const { rerender } = render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    expect(screen.getByText("Projeler yükleniyor...")).toBeInTheDocument();

    setupListState({
      data: undefined,
      error: { status: 500, data: { message: "Proje servisi kullanılamıyor." } },
      isError: true,
    });
    rerender(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    expect(screen.getByText("Proje servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();

    setupListState();
    rerender(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    expect(screen.getByText("Filtrelere uygun proje bulunamadı.")).toBeInTheDocument();

    setupListState({ data: populatedProjectsResponse });
    rerender(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    expect(screen.getByText("Growth Hub Launch")).toBeInTheDocument();
    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(screen.getByText("growth-hub-launch")).toBeInTheDocument();
  });

  it("disables create and edit actions for an admin without project manage permission", () => {
    currentUser = adminWithoutProjectManagePermission;
    setupListState({ data: populatedProjectsResponse });

    renderProjects();

    expect(screen.getByRole("button", { name: "Yeni Proje Oluştur" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeDisabled();
  });

  it("enables create and edit actions for an admin with project manage permission", () => {
    currentUser = adminUser;
    setupListState({ data: populatedProjectsResponse });

    renderProjects();

    expect(screen.getByRole("button", { name: "Yeni Proje Oluştur" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeEnabled();
  });

  it("changes the projects query when status filter changes", async () => {
    const user = userEvent.setup();

    renderProjects();
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(document.body, "Durum"),
      "Devam Ediyor",
    );

    await waitFor(() => {
      expect(getLastProjectsQuery()).toMatchObject({ status: "IN_PROGRESS" });
    });
  });

  it("changes the projects query when priority filter changes", async () => {
    const user = userEvent.setup();

    renderProjects();
    await selectComboboxOption(
      user,
      getComboboxByFieldLabel(document.body, "Öncelik"),
      "Acil",
    );

    await waitFor(() => {
      expect(getLastProjectsQuery()).toMatchObject({ priority: "URGENT" });
    });
  });

  it("validates and applies the clientProfileId filter", async () => {
    renderProjects();

    fireEvent.change(screen.getByLabelText("Müşteri Profil ID"), {
      target: { value: "not-a-uuid" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrele" }));

    expect(
      await screen.findByText("Müşteri profil ID geçerli bir UUID olmalıdır."),
    ).toBeInTheDocument();
    expect(getLastProjectsQuery().clientProfileId).toBeUndefined();

    fireEvent.change(screen.getByLabelText("Müşteri Profil ID"), {
      target: { value: clientProfileId },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrele" }));

    await waitFor(() => {
      expect(getLastProjectsQuery()).toMatchObject({ clientProfileId });
    });
    expect(
      screen.queryByText("Müşteri profil ID geçerli bir UUID olmalıdır."),
    ).not.toBeInTheDocument();
  });

  it("opens the create modal", () => {
    renderProjects();

    expect(openCreateDialog()).toBeInTheDocument();
  });

  it("shows create validation for required, UUID, and date rules", async () => {
    const { createProject } = setupMutationState();

    renderProjects();
    const dialog = openCreateDialog();

    fireEvent.click(within(dialog).getByRole("button", { name: "Proje Oluştur" }));
    expect(await screen.findByText("Müşteri profil ID gereklidir.")).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Profil ID"), {
      target: { value: "not-a-uuid" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Proje Oluştur" }));
    expect(
      await screen.findByText("Müşteri profil ID geçerli bir UUID olmalıdır."),
    ).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Profil ID"), {
      target: { value: clientProfileId },
    });
    fireEvent.change(within(dialog).getByLabelText("Proje Adı"), {
      target: { value: "Launch Plan" },
    });
    fireEvent.change(within(dialog).getByLabelText("Başlangıç"), {
      target: { value: "2026-05-20" },
    });
    fireEvent.change(within(dialog).getByLabelText("Deadline"), {
      target: { value: "2026-05-10" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Proje Oluştur" }));

    expect(
      await screen.findByText("Deadline başlangıç tarihinden önce olamaz."),
    ).toBeInTheDocument();
    expect(createProject).not.toHaveBeenCalled();
  });

  it("submits a valid create payload and shows success", async () => {
    const { createProject } = setupMutationState();

    renderProjects();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Profil ID"), {
      target: { value: ` ${clientProfileId} ` },
    });
    fireEvent.change(within(dialog).getByLabelText("Proje Adı"), {
      target: { value: "  Yeni Proje  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Açıklama"), {
      target: { value: "  Kapsam notu  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Başlangıç"), {
      target: { value: "2026-05-01" },
    });
    fireEvent.change(within(dialog).getByLabelText("Deadline"), {
      target: { value: "2026-05-20" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Proje Oluştur" }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledTimes(1);
    });
    expect(createProject.mock.calls[0][0]).toEqual({
      clientProfileId,
      name: "Yeni Proje",
      description: "Kapsam notu",
      status: "PLANNED",
      priority: "MEDIUM",
      startDate: "2026-05-01",
      dueDate: "2026-05-20",
    });
    expect(await screen.findByText("Proje başarıyla oluşturuldu.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps create modal open and shows API error message", async () => {
    const createProject = vi.fn<CreateProjectTrigger>(() => ({
      unwrap: async () =>
        Promise.reject({
          status: 500,
          data: { message: "Proje API geçici hata döndürdü." },
        }),
    }));
    mockUseCreateProjectMutation.mockReturnValue([createProject, { isLoading: false }]);

    renderProjects();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Profil ID"), {
      target: { value: clientProfileId },
    });
    fireEvent.change(within(dialog).getByLabelText("Proje Adı"), {
      target: { value: "Yeni Proje" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Proje Oluştur" }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Proje API geçici hata döndürdü.")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Yeni Proje Oluştur" })).toBeInTheDocument();
  });

  it("opens the update modal and submits update payload", async () => {
    const { updateProject } = setupMutationState();
    setupListState({ data: populatedProjectsResponse });

    renderProjects();
    fireEvent.click(screen.getByRole("button", { name: "Düzenle" }));

    const dialog = screen.getByRole("dialog", { name: "Proje Güncelle" });
    expect(dialog).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Proje Adı"), {
      target: { value: "Updated Launch" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Değişiklikleri Kaydet" }));

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledTimes(1);
    });
    expect(updateProject.mock.calls[0][0]).toEqual({
      id: projectId,
      body: {
        clientProfileId,
        name: "Updated Launch",
        description: "Launch kapsamı",
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: "2026-05-01",
        dueDate: "2026-05-20",
      },
    });
  });

  it("does not render sensitive fields from project data", () => {
    const projectWithSensitiveFields = {
      ...project,
      passwordHash: "hashed-password-value",
      refreshToken: "refresh-token-value",
      apiSecret: "api-secret-value",
    };
    setupListState({
      data: {
        ...populatedProjectsResponse,
        data: [projectWithSensitiveFields],
      },
    });

    renderProjects();

    expect(screen.getByText("Growth Hub Launch")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/refresh-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
  });
});
