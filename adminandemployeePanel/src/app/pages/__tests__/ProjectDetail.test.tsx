/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type { Project } from "../../features/projects/projectsTypes";
import { ProjectDetail } from "../ProjectDetail";

type QueryOptions = {
  skip?: boolean;
};

type ProjectQueryResult = {
  data?: Project;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type ProjectWithSensitiveFields = Project & {
  passwordHash: string;
  resetToken: string;
  apiSecret: string;
  authorization: string;
};

const mockUseGetProjectQuery = vi.fn<
  (id: string, options: QueryOptions) => ProjectQueryResult
>();
const mockUseGetProjectRepositoryQuery = vi.fn();
const mockUseGetProjectAssigneeCandidatesQuery = vi.fn();
const mockUseGetProjectRepositoryBranchesQuery = vi.fn();
const mockUseGetProjectRepositoryCommitsQuery = vi.fn();
const mockUseGetProjectRepositoryPullsQuery = vi.fn();
const mockUseGetProjectRepositoryWorkflowRunsQuery = vi.fn();
const mockUseUpsertProjectRepositoryMutation = vi.fn();
const mockUseDeleteProjectRepositoryMutation = vi.fn();
const mockUseCreateProjectFileFolderMutation = vi.fn();
const mockUseUpdateProjectFileFolderMutation = vi.fn();
const mockUseUpdateProjectFileFolderAssigneesMutation = vi.fn();
const mockUseGetProjectFileFoldersQuery = vi.fn();
const mockUseGetProjectFileFolderAssigneesQuery = vi.fn();
const mockUseGetProjectFilesQuery = vi.fn();
const mockUseGetProjectWorkspaceSnapshotQuery = vi.fn();
const mockUseCreateProjectWorkspaceSectionMutation = vi.fn();
const mockUseCreateProjectWorkspaceItemMutation = vi.fn();
const mockUseGetProjectWorkspaceRevisionsQuery = vi.fn();
const mockUseCreateProjectWorkspaceRevisionMutation = vi.fn();
const mockUseUpdateProjectWorkspaceRevisionStatusMutation = vi.fn();
const mockUseGetProjectWorkspaceReportsQuery = vi.fn();
const mockUseCreateProjectWorkspaceReportMutation = vi.fn();
const mockUseGetProjectWorkspaceMeetingRequestsQuery = vi.fn();
const mockUseUpdateProjectWorkspaceMeetingRequestMutation = vi.fn();
const mockUseGetProjectWorkspaceMessagesQuery = vi.fn();
const mockUseCreateProjectWorkspaceMessageMutation = vi.fn();
const mockUseCreateClientApprovalMutation = vi.fn();
const mockDispatch = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { auth: { currentUser: AuthUserProfile | null; accessToken: string | null } }) => unknown) =>
    selector({
      auth: {
        currentUser,
        accessToken: null,
      },
    }),
}));

vi.mock("../../features/projects/projectsApi", () => ({
  projectsApi: {
    util: {
      updateQueryData: vi.fn(() => ({ type: "mock/updateQueryData" })),
    },
  },
  useGetProjectQuery: (id: string, options: QueryOptions) =>
    mockUseGetProjectQuery(id, options),
  useGetProjectRepositoryQuery: (id: string, options: QueryOptions) =>
    mockUseGetProjectRepositoryQuery(id, options),
  useGetProjectAssigneeCandidatesQuery: (id: string, options?: QueryOptions) =>
    mockUseGetProjectAssigneeCandidatesQuery(id, options),
  useGetProjectRepositoryBranchesQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectRepositoryBranchesQuery(query, options),
  useGetProjectRepositoryCommitsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectRepositoryCommitsQuery(query, options),
  useGetProjectRepositoryPullsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectRepositoryPullsQuery(query, options),
  useGetProjectRepositoryWorkflowRunsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectRepositoryWorkflowRunsQuery(query, options),
  useUpsertProjectRepositoryMutation: () => mockUseUpsertProjectRepositoryMutation(),
  useDeleteProjectRepositoryMutation: () => mockUseDeleteProjectRepositoryMutation(),
  useCreateProjectFileFolderMutation: () => mockUseCreateProjectFileFolderMutation(),
  useUpdateProjectFileFolderMutation: () => mockUseUpdateProjectFileFolderMutation(),
  useUpdateProjectFileFolderAssigneesMutation: () =>
    mockUseUpdateProjectFileFolderAssigneesMutation(),
  useGetProjectFileFoldersQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectFileFoldersQuery(query, options),
  useGetProjectFileFolderAssigneesQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectFileFolderAssigneesQuery(query, options),
  useGetProjectFilesQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectFilesQuery(query, options),
  useGetProjectWorkspaceSnapshotQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectWorkspaceSnapshotQuery(query, options),
  useCreateProjectWorkspaceSectionMutation: () => mockUseCreateProjectWorkspaceSectionMutation(),
  useCreateProjectWorkspaceItemMutation: () => mockUseCreateProjectWorkspaceItemMutation(),
  useGetProjectWorkspaceRevisionsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectWorkspaceRevisionsQuery(query, options),
  useCreateProjectWorkspaceRevisionMutation: () => mockUseCreateProjectWorkspaceRevisionMutation(),
  useUpdateProjectWorkspaceRevisionStatusMutation: () =>
    mockUseUpdateProjectWorkspaceRevisionStatusMutation(),
  useGetProjectWorkspaceReportsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectWorkspaceReportsQuery(query, options),
  useCreateProjectWorkspaceReportMutation: () => mockUseCreateProjectWorkspaceReportMutation(),
  useGetProjectWorkspaceMeetingRequestsQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectWorkspaceMeetingRequestsQuery(query, options),
  useUpdateProjectWorkspaceMeetingRequestMutation: () =>
    mockUseUpdateProjectWorkspaceMeetingRequestMutation(),
  useGetProjectWorkspaceMessagesQuery: (query: unknown, options?: unknown) =>
    mockUseGetProjectWorkspaceMessagesQuery(query, options),
  useCreateProjectWorkspaceMessageMutation: () => mockUseCreateProjectWorkspaceMessageMutation(),
}));

vi.mock("../../features/clientApprovals/clientApprovalsApi", () => ({
  useCreateClientApprovalMutation: () => mockUseCreateClientApprovalMutation(),
}));

const projectId = "11111111-1111-4111-8111-111111111111";
const clientProfileId = "22222222-2222-4222-8222-222222222222";

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["projects.read.any"],
  clientProfile: null,
};

const adminWithoutProjectReadPermission: AuthUserProfile = {
  ...adminUser,
  permissions: [],
};

const developerUser: AuthUserProfile = {
  id: "developer-user-id",
  email: "developer@socialtech.com",
  displayName: "Developer User",
  accountType: "EMPLOYEE",
  role: "DEVELOPER",
  status: "ACTIVE",
  permissions: ["projects.read.assigned", "integrations.github.read.assigned"],
  clientProfile: null,
};

const approvalManagerUser: AuthUserProfile = {
  ...adminUser,
  permissions: ["projects.read.any", "approvals.manage"],
};

const projectDetail: ProjectWithSensitiveFields = {
  id: projectId,
  clientProfileId,
  name: "Growth Hub Launch",
  slug: "growth-hub-launch",
  description: "Acme büyüme paneli lansman hazırlıkları.",
  status: "IN_PROGRESS",
  priority: "HIGH",
  startDate: "2026-04-01T09:00:00.000Z",
  dueDate: "2026-05-15T18:00:00.000Z",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  clientProfile: {
    id: clientProfileId,
    slug: "acme-e-ticaret",
    companyName: "Acme E-ticaret",
    contactEmail: "client@acme.test",
  },
  passwordHash: "hashed-password-value",
  resetToken: "reset-token-value",
  apiSecret: "api-secret-value",
  authorization: "Bearer sensitive-value",
};

function setupQueryState(overrides: Partial<ProjectQueryResult> = {}) {
  mockUseGetProjectQuery.mockReturnValue({
    data: undefined,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
  mockUseGetProjectRepositoryQuery.mockReturnValue({
    data: undefined,
    refetch: vi.fn(),
  });
  mockUseGetProjectAssigneeCandidatesQuery.mockReturnValue({ data: [] });
  mockUseGetProjectRepositoryBranchesQuery.mockReturnValue({ data: [] });
  mockUseGetProjectRepositoryCommitsQuery.mockReturnValue({ data: [] });
  mockUseGetProjectRepositoryPullsQuery.mockReturnValue({ data: [] });
  mockUseGetProjectRepositoryWorkflowRunsQuery.mockReturnValue({ data: [] });
  mockUseUpsertProjectRepositoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseDeleteProjectRepositoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseCreateProjectFileFolderMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseUpdateProjectFileFolderMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseUpdateProjectFileFolderAssigneesMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseGetProjectFileFoldersQuery.mockReturnValue({ data: [] });
  mockUseGetProjectFileFolderAssigneesQuery.mockReturnValue({ data: [] });
  mockUseGetProjectFilesQuery.mockReturnValue({ data: { data: [] }, isFetching: false });
  mockUseGetProjectWorkspaceSnapshotQuery.mockReturnValue({ data: undefined, isFetching: false });
  mockUseCreateProjectWorkspaceSectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseCreateProjectWorkspaceItemMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseGetProjectWorkspaceRevisionsQuery.mockReturnValue({ data: [] });
  mockUseCreateProjectWorkspaceRevisionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseUpdateProjectWorkspaceRevisionStatusMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseGetProjectWorkspaceReportsQuery.mockReturnValue({ data: [] });
  mockUseCreateProjectWorkspaceReportMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseGetProjectWorkspaceMeetingRequestsQuery.mockReturnValue({ data: [] });
  mockUseUpdateProjectWorkspaceMeetingRequestMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseGetProjectWorkspaceMessagesQuery.mockReturnValue({ data: [] });
  mockUseCreateProjectWorkspaceMessageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  mockUseCreateClientApprovalMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
}

function renderProjectDetail(id: string = projectId) {
  render(
    <MemoryRouter initialEntries={[`/projeler/${id}`]}>
      <Routes>
        <Route path="/projeler/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProjectDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupQueryState();
  });

  it("shows invalid UUID state and skips the detail query", () => {
    renderProjectDetail("not-a-uuid");

    expect(screen.getByText("Geçersiz proje kimliği.")).toBeInTheDocument();
    expect(mockUseGetProjectQuery).toHaveBeenCalledWith("not-a-uuid", {
      skip: true,
    });
  });

  it("shows forbidden state and skips the detail query when user lacks project read permission", () => {
    currentUser = adminWithoutProjectReadPermission;

    renderProjectDetail();

    expect(screen.getByText("Bu sayfaya erişim yetkiniz bulunmuyor.")).toBeInTheDocument();
    expect(mockUseGetProjectQuery).toHaveBeenCalledWith(projectId, {
      skip: true,
    });
  });

  it("shows loading state while project detail is loading", () => {
    setupQueryState({ isLoading: true });

    renderProjectDetail();

    expect(screen.getByText("Proje detayı yükleniyor...")).toBeInTheDocument();
  });

  it("shows error state when project detail request fails", () => {
    setupQueryState({
      error: { status: 500, data: { message: "Proje detayı alınamadı." } },
      isError: true,
    });

    renderProjectDetail();

    expect(screen.getByText("Proje detayı alınamadı.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("shows not found state when no project is returned", () => {
    setupQueryState({ data: undefined });

    renderProjectDetail();

    expect(screen.getByText("Proje kaydı bulunamadı.")).toBeInTheDocument();
  });

  it("renders project name, client, status, priority and identifiers on success", () => {
    setupQueryState({ data: projectDetail });

    renderProjectDetail();

    expect(screen.getByRole("heading", { name: "Growth Hub Launch" })).toBeInTheDocument();
    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(screen.getByText("Devam Ediyor")).toBeInTheDocument();
    expect(screen.getByText("Yüksek")).toBeInTheDocument();
    expect(screen.getByText("growth-hub-launch")).toBeInTheDocument();
    expect(screen.getByText(clientProfileId)).toBeInTheDocument();
  });

  it("allows assigned-scope employee users to read project detail", () => {
    currentUser = developerUser;
    setupQueryState({ data: projectDetail });

    renderProjectDetail();

    expect(screen.getByRole("heading", { name: "Growth Hub Launch" })).toBeInTheDocument();
    expect(mockUseGetProjectQuery).toHaveBeenCalledWith(projectId, {
      skip: false,
    });
  });

  it("renders github repository section for admins with permission", () => {
    currentUser = {
      ...adminUser,
      permissions: ["projects.read.any", "integrations.github.read.any", "integrations.github.manage.any"],
    };
    setupQueryState({ data: projectDetail });
    mockUseGetProjectRepositoryQuery.mockReturnValue({
      data: {
        id: "repo-id",
        projectId,
        provider: "GITHUB",
        owner: "facebook",
        repo: "react",
        repositoryUrl: "https://github.com/facebook/react",
        defaultBranch: "main",
        installationId: null,
        isActive: true,
        createdAt: "",
        updatedAt: "",
        project: null,
      },
      refetch: vi.fn(),
    });

    renderProjectDetail();

    expect(screen.getByText("GitHub Repository")).toBeInTheDocument();
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByLabelText("PAT / Token")).toHaveAttribute("type", "password");
  });

  it("does not render sensitive fields returned by the API", () => {
    setupQueryState({ data: projectDetail });

    renderProjectDetail();

    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/reset-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
    expect(document.body).not.toHaveTextContent(/Bearer sensitive-value/i);
  });

  it("shows repository-required guidance for web and mobile app projects without a repository", () => {
    currentUser = {
      ...adminUser,
      permissions: ["projects.read.any", "integrations.github.read.any"],
    };
    setupQueryState({
      data: {
        ...projectDetail,
        serviceKey: "web-app",
      },
    });

    renderProjectDetail();

    expect(screen.getByText("GitHub bağlantısı zorunlu")).toBeInTheDocument();
  });

  it("shows project approval actions for approval managers", () => {
    currentUser = approvalManagerUser;
    setupQueryState({ data: projectDetail });

    renderProjectDetail();

    expect(screen.getByText("Müşteri Onay / Bilgilendirme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Müşteri Onayı İste/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bilgilendirme Gönder/ })).toBeInTheDocument();
  });
});
