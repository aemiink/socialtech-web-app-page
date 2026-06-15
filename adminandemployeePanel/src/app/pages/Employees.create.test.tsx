/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../features/auth/authTypes";
import type {
  AdminUsersListResponse,
  CreateAdminEmployeeUserRequest,
} from "../features/adminUsers/adminUsersTypes";
import { Employees } from "./Employees";

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

const mockUseGetAdminUsersQuery = vi.fn();
const mockUseCreateAdminUserMutation = vi.fn();
const mockUseUpdateAdminUserMutation = vi.fn();
const mockUseDeactivateAdminUserMutation = vi.fn();
const mockUseActivateAdminUserMutation = vi.fn();
const mockUseDeleteAdminUserMutation = vi.fn();
const mockUseResetAdminUserPasswordMutation = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUsersQuery: (...args: unknown[]) => mockUseGetAdminUsersQuery(...args),
  useCreateAdminUserMutation: (...args: unknown[]) =>
    mockUseCreateAdminUserMutation(...args),
  useUpdateAdminUserMutation: (...args: unknown[]) =>
    mockUseUpdateAdminUserMutation(...args),
  useDeactivateAdminUserMutation: (...args: unknown[]) =>
    mockUseDeactivateAdminUserMutation(...args),
  useActivateAdminUserMutation: (...args: unknown[]) =>
    mockUseActivateAdminUserMutation(...args),
  useDeleteAdminUserMutation: (...args: unknown[]) =>
    mockUseDeleteAdminUserMutation(...args),
  useResetAdminUserPasswordMutation: (...args: unknown[]) =>
    mockUseResetAdminUserPasswordMutation(...args),
}));

const adminUsersListResponse: AdminUsersListResponse = {
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

function setupDefaultHookMocks() {
  const refetch = vi.fn();
  mockUseGetAdminUsersQuery.mockReturnValue({
    data: adminUsersListResponse,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch,
  });

  const noopMutation = vi.fn((): MutationResponse<object> => ({
    unwrap: async () => ({}),
  }));

  mockUseUpdateAdminUserMutation.mockReturnValue([noopMutation, { isLoading: false }]);
  mockUseDeactivateAdminUserMutation.mockReturnValue([
    noopMutation,
    { isLoading: false },
  ]);
  mockUseActivateAdminUserMutation.mockReturnValue([noopMutation, { isLoading: false }]);
  mockUseDeleteAdminUserMutation.mockReturnValue([noopMutation, { isLoading: false }]);
  mockUseResetAdminUserPasswordMutation.mockReturnValue([
    noopMutation,
    { isLoading: false },
  ]);
}

function openCreateModal() {
  fireEvent.click(screen.getByRole("button", { name: "Yeni Çalışan" }));
}

function renderEmployees() {
  render(
    <MemoryRouter>
      <Employees />
    </MemoryRouter>,
  );
}

describe("Employees create employee modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupDefaultHookMocks();
  });

  it("shows required field validation errors on empty submit", async () => {
    const createMutationTrigger = vi.fn<
      (payload: CreateAdminEmployeeUserRequest) => MutationResponse<object>
    >();
    mockUseCreateAdminUserMutation.mockReturnValue([
      createMutationTrigger,
      { isLoading: false },
    ]);

    renderEmployees();
    openCreateModal();
    fireEvent.click(screen.getByRole("button", { name: "Çalışan Oluştur" }));

    expect(await screen.findByText("Çalışan adı gereklidir.")).toBeInTheDocument();
    expect(screen.getByText("E-posta adresi gereklidir.")).toBeInTheDocument();
    expect(screen.getByText("Şifre gereklidir.")).toBeInTheDocument();
    expect(screen.getByText("Şifre tekrarı gereklidir.")).toBeInTheDocument();
    expect(createMutationTrigger).not.toHaveBeenCalled();
  });

  it("shows invalid email, weak password and confirm password mismatch errors", async () => {
    const createMutationTrigger = vi.fn<
      (payload: CreateAdminEmployeeUserRequest) => MutationResponse<object>
    >();

    mockUseCreateAdminUserMutation.mockReturnValue([
      createMutationTrigger,
      { isLoading: false },
    ]);

    renderEmployees();
    openCreateModal();

    fireEvent.change(screen.getByLabelText("Ad Soyad"), { target: { value: "Ali" } });
    fireEvent.change(screen.getByLabelText("E-posta"), { target: { value: "invalid-email" } });
    fireEvent.change(screen.getByLabelText("Geçici Şifre"), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText("Şifre Tekrarı"), { target: { value: "abcd" } });

    fireEvent.click(screen.getByRole("button", { name: "Çalışan Oluştur" }));

    expect(await screen.findByText("Geçerli bir e-posta adresi girin.")).toBeInTheDocument();
    expect(screen.getByText("Şifre en az 8 karakter olmalıdır.")).toBeInTheDocument();
    expect(screen.getByText("Şifreler eşleşmiyor.")).toBeInTheDocument();
    expect(createMutationTrigger).not.toHaveBeenCalled();
  });

  it("submits sanitized create payload and does not send confirmPassword", async () => {
    const createMutationTrigger = vi.fn<
      (payload: CreateAdminEmployeeUserRequest) => MutationResponse<object>
    >((payload) => ({
      unwrap: async () => ({
        id: "new-user-id",
        ...payload,
        status: "ACTIVE",
      }),
    }));

    mockUseCreateAdminUserMutation.mockReturnValue([
      createMutationTrigger,
      { isLoading: false },
    ]);

    renderEmployees();
    openCreateModal();

    fireEvent.change(screen.getByLabelText("Ad Soyad"), {
      target: { value: "  Yeni Developer  " },
    });
    fireEvent.change(screen.getByLabelText("E-posta"), {
      target: { value: "DEVELOPER2@SOCIALTECH.COM " },
    });
    fireEvent.change(screen.getByLabelText("Geçici Şifre"), { target: { value: "TempPass123" } });
    fireEvent.change(screen.getByLabelText("Şifre Tekrarı"), { target: { value: "TempPass123" } });

    fireEvent.click(screen.getByRole("button", { name: "Çalışan Oluştur" }));

    await waitFor(() => {
      expect(createMutationTrigger).toHaveBeenCalledTimes(1);
    });

    const submittedPayload = createMutationTrigger.mock.calls[0][0];
    expect(submittedPayload).toEqual({
      accountType: "EMPLOYEE",
      displayName: "Yeni Developer",
      email: "developer2@socialtech.com",
      role: "PROJECT_MANAGER",
      password: "TempPass123",
    });
    expect(Object.prototype.hasOwnProperty.call(submittedPayload, "confirmPassword")).toBe(
      false,
    );

    expect(await screen.findByText("Çalışan başarıyla oluşturuldu.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    openCreateModal();
    expect(screen.getByLabelText("Ad Soyad")).toHaveValue("");
    expect(screen.getByLabelText("E-posta")).toHaveValue("");
    expect(screen.getByLabelText("Geçici Şifre")).toHaveValue("");
    expect(screen.getByLabelText("Şifre Tekrarı")).toHaveValue("");
  });

  it("keeps modal open and shows duplicate email message when API returns conflict", async () => {
    const user = userEvent.setup();
    const createMutationTrigger = vi.fn<
      (payload: CreateAdminEmployeeUserRequest) => MutationResponse<object>
    >(() => ({
      unwrap: async () =>
        Promise.reject({
          status: 409,
          data: { message: "Aynı bilgilere sahip bir kayıt zaten mevcut." },
        }),
    }));

    mockUseCreateAdminUserMutation.mockReturnValue([
      createMutationTrigger,
      { isLoading: false },
    ]);

    renderEmployees();
    openCreateModal();

    await user.type(screen.getByLabelText("Ad Soyad"), "Yeni Uzman");
    await user.type(screen.getByLabelText("E-posta"), "developer2@socialtech.com");
    await user.type(screen.getByLabelText("Geçici Şifre"), "TempPass123");
    await user.type(screen.getByLabelText("Şifre Tekrarı"), "TempPass123");

    fireEvent.click(screen.getByRole("button", { name: "Çalışan Oluştur" }));

    expect(
      await screen.findByText("Aynı bilgilere sahip bir kayıt zaten mevcut."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("TempPass123")).not.toBeInTheDocument();
  });
});
