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

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/projects/projectsApi", () => ({
  useGetProjectQuery: (id: string, options: QueryOptions) =>
    mockUseGetProjectQuery(id, options),
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

  it("does not render sensitive fields returned by the API", () => {
    setupQueryState({ data: projectDetail });

    renderProjectDetail();

    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/reset-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
    expect(document.body).not.toHaveTextContent(/Bearer sensitive-value/i);
  });
});
