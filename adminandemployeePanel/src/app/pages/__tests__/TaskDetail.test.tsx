/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
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

type TaskWithSensitiveFields = Task & {
  passwordHash: string;
  resetToken: string;
  apiSecret: string;
  authorization: string;
};

const mockUseGetTaskQuery = vi.fn<
  (id: string, options: QueryOptions) => TaskQueryResult
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetTaskQuery: (id: string, options: QueryOptions) =>
    mockUseGetTaskQuery(id, options),
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
    expect(screen.getByText(projectId)).toBeInTheDocument();
    expect(screen.getByText(assigneeUserId)).toBeInTheDocument();
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
