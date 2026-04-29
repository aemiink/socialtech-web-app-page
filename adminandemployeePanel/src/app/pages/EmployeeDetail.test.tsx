/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../features/auth/authTypes";
import type { AdminUser } from "../features/adminUsers/adminUsersTypes";
import { EmployeeDetail } from "./EmployeeDetail";

type QueryOptions = {
  skip?: boolean;
};

type AdminUserQueryResult = {
  data?: AdminUser;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type AdminUserWithSensitiveFields = AdminUser & {
  passwordHash: string;
  resetToken: string;
  apiSecret: string;
  authorization: string;
};

const mockUseGetAdminUserQuery = vi.fn<
  (id: string, options: QueryOptions) => AdminUserQueryResult
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUserQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminUserQuery(id, options),
}));

const employeeId = "11111111-1111-4111-8111-111111111111";

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["users.manage"],
  clientProfile: null,
};

const employeeDetail: AdminUserWithSensitiveFields = {
  id: employeeId,
  email: "deniz.developer@socialtech.com",
  displayName: "Deniz Developer",
  accountType: "EMPLOYEE",
  role: "DEVELOPER",
  status: "ACTIVE",
  lastLoginAt: "2026-04-28T12:00:00.000Z",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  passwordHash: "hashed-password-value",
  resetToken: "reset-token-value",
  apiSecret: "api-secret-value",
  authorization: "Bearer sensitive-value",
};

function setupQueryState(overrides: Partial<AdminUserQueryResult> = {}) {
  mockUseGetAdminUserQuery.mockReturnValue({
    data: undefined,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderEmployeeDetail(id: string = employeeId) {
  render(
    <MemoryRouter initialEntries={[`/calisanlar/${id}`]}>
      <Routes>
        <Route path="/calisanlar/:id" element={<EmployeeDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EmployeeDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupQueryState();
  });

  it("shows loading state while employee detail is loading", () => {
    setupQueryState({ isLoading: true });

    renderEmployeeDetail();

    expect(screen.getByText("Çalışan detayı yükleniyor...")).toBeInTheDocument();
  });

  it("shows error state when employee detail request fails", () => {
    setupQueryState({
      error: { status: 500, data: { message: "Çalışan detayı alınamadı." } },
      isError: true,
    });

    renderEmployeeDetail();

    expect(screen.getByText("Çalışan detayı alınamadı.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("shows invalid UUID state and skips the detail query", () => {
    renderEmployeeDetail("not-a-uuid");

    expect(screen.getByText("Geçersiz çalışan kimliği.")).toBeInTheDocument();
    expect(mockUseGetAdminUserQuery).toHaveBeenCalledWith("not-a-uuid", {
      skip: true,
    });
  });

  it("shows not found state when no employee is returned", () => {
    setupQueryState({ data: undefined });

    renderEmployeeDetail();

    expect(screen.getByText("Çalışan kaydı bulunamadı.")).toBeInTheDocument();
  });

  it("renders employee display name, email, role and status on success", () => {
    setupQueryState({ data: employeeDetail });

    renderEmployeeDetail();

    expect(
      screen.getByRole("heading", { name: "Deniz Developer" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("deniz.developer@socialtech.com")).toHaveLength(2);
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });

  it("does not render sensitive fields returned by the API", () => {
    setupQueryState({ data: employeeDetail });

    renderEmployeeDetail();

    expect(screen.queryByText("hashed-password-value")).not.toBeInTheDocument();
    expect(screen.queryByText("reset-token-value")).not.toBeInTheDocument();
    expect(screen.queryByText("api-secret-value")).not.toBeInTheDocument();
    expect(screen.queryByText("Bearer sensitive-value")).not.toBeInTheDocument();
  });

  it("shows forbidden state and skips the detail query without user management permission", () => {
    currentUser = {
      ...adminUser,
      permissions: [],
    };

    renderEmployeeDetail();

    expect(screen.getByText("Bu sayfaya erişim yetkiniz bulunmuyor.")).toBeInTheDocument();
    expect(mockUseGetAdminUserQuery).toHaveBeenCalledWith(employeeId, {
      skip: true,
    });
  });
});
