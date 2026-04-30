/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AdminUser,
  AdminUsersListQuery,
  AdminUsersListResponse,
} from "../../features/adminUsers/adminUsersTypes";
import type {
  AdminAssignment,
  AdminAssignmentsListQuery,
  CreateAdminAssignmentRequest,
  UpdateAdminAssignmentRequest,
} from "../../features/adminAssignments/adminAssignmentsTypes";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
} from "../../features/clients/clientsTypes";
import { EmployeeAssignments } from "../EmployeeAssignments";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type AssignmentsQueryResult = {
  data?: AdminAssignment[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type AdminUsersQueryResult = {
  data?: AdminUsersListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type ClientsQueryResult = {
  data?: ClientsListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type CreateAssignmentTrigger = (
  payload: CreateAdminAssignmentRequest,
) => MutationResponse<AdminAssignment>;

type UpdateAssignmentTrigger = (payload: {
  id: string;
  body: UpdateAdminAssignmentRequest;
}) => MutationResponse<AdminAssignment>;

type StatusAssignmentTrigger = (id: string) => MutationResponse<AdminAssignment>;

const mockUseGetAdminAssignmentsQuery = vi.fn<
  (query: AdminAssignmentsListQuery, options?: QueryOptions) => AssignmentsQueryResult
>();
const mockUseCreateAdminAssignmentMutation = vi.fn<
  () => [CreateAssignmentTrigger, { isLoading: boolean }]
>();
const mockUseUpdateAdminAssignmentMutation = vi.fn<
  () => [UpdateAssignmentTrigger, { isLoading: boolean }]
>();
const mockUseDeactivateAdminAssignmentMutation = vi.fn<
  () => [StatusAssignmentTrigger, { isLoading: boolean }]
>();
const mockUseActivateAdminAssignmentMutation = vi.fn<
  () => [StatusAssignmentTrigger, { isLoading: boolean }]
>();
const mockUseGetAdminUsersQuery = vi.fn<
  (query: AdminUsersListQuery) => AdminUsersQueryResult
>();
const mockUseGetClientsQuery = vi.fn<(query: ClientsListQuery) => ClientsQueryResult>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/adminAssignments/adminAssignmentsApi", () => ({
  useGetAdminAssignmentsQuery: (
    query: AdminAssignmentsListQuery,
    options?: QueryOptions,
  ) => mockUseGetAdminAssignmentsQuery(query, options),
  useCreateAdminAssignmentMutation: () => mockUseCreateAdminAssignmentMutation(),
  useUpdateAdminAssignmentMutation: () => mockUseUpdateAdminAssignmentMutation(),
  useDeactivateAdminAssignmentMutation: () => mockUseDeactivateAdminAssignmentMutation(),
  useActivateAdminAssignmentMutation: () => mockUseActivateAdminAssignmentMutation(),
}));

vi.mock("../../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUsersQuery: (query: AdminUsersListQuery) => mockUseGetAdminUsersQuery(query),
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (query: ClientsListQuery) => mockUseGetClientsQuery(query),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["assignments.read", "assignments.manage"],
  clientProfile: null,
};

const adminReadOnlyUser: AuthUserProfile = {
  ...adminUser,
  permissions: ["assignments.read"],
};

const employee: AdminUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "employee@example.com",
  displayName: "Employee User",
  accountType: "EMPLOYEE",
  role: "PROJECT_MANAGER",
  status: "ACTIVE",
  lastLoginAt: null,
  createdAt: "2026-04-20T10:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
};

const client: ClientProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@example.com",
  status: "ACTIVE",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
};

const activeAssignment: AdminAssignment = {
  id: "33333333-3333-4333-8333-333333333333",
  employeeUserId: employee.id,
  clientProfileId: client.id,
  scope: "PROJECT",
  isActive: true,
  createdAt: "2026-04-29T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  employee: {
    id: employee.id,
    email: employee.email,
    displayName: employee.displayName,
    role: employee.role,
    accountType: employee.accountType,
  },
  client: {
    id: client.id,
    slug: client.slug,
    name: client.companyName,
  },
};

const inactiveAssignment: AdminAssignment = {
  ...activeAssignment,
  id: "44444444-4444-4444-8444-444444444444",
  isActive: false,
};

const adminUsersResponse: AdminUsersListResponse = {
  data: [employee],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const clientsResponse: ClientsListResponse = {
  data: [client],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupListState(overrides: Partial<AssignmentsQueryResult> = {}) {
  mockUseGetAdminAssignmentsQuery.mockReturnValue({
    data: [activeAssignment],
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupPickerState() {
  mockUseGetAdminUsersQuery.mockReturnValue({
    data: adminUsersResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  });
  mockUseGetClientsQuery.mockReturnValue({
    data: clientsResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  });
}

function setupMutationState() {
  const createAdminAssignment = vi.fn<CreateAssignmentTrigger>((payload) => ({
    unwrap: async () => ({
      ...activeAssignment,
      employeeUserId: payload.employeeUserId,
      clientProfileId: payload.clientProfileId,
      scope: payload.scope,
    }),
  }));
  const updateAdminAssignment = vi.fn<UpdateAssignmentTrigger>(({ body }) => ({
    unwrap: async () => ({
      ...activeAssignment,
      scope: body.scope ?? activeAssignment.scope,
      isActive: body.isActive ?? activeAssignment.isActive,
    }),
  }));
  const deactivateAdminAssignment = vi.fn<StatusAssignmentTrigger>((id) => ({
    unwrap: async () => ({ ...activeAssignment, id, isActive: false }),
  }));
  const activateAdminAssignment = vi.fn<StatusAssignmentTrigger>((id) => ({
    unwrap: async () => ({ ...inactiveAssignment, id, isActive: true }),
  }));

  mockUseCreateAdminAssignmentMutation.mockReturnValue([
    createAdminAssignment,
    { isLoading: false },
  ]);
  mockUseUpdateAdminAssignmentMutation.mockReturnValue([
    updateAdminAssignment,
    { isLoading: false },
  ]);
  mockUseDeactivateAdminAssignmentMutation.mockReturnValue([
    deactivateAdminAssignment,
    { isLoading: false },
  ]);
  mockUseActivateAdminAssignmentMutation.mockReturnValue([
    activateAdminAssignment,
    { isLoading: false },
  ]);

  return {
    createAdminAssignment,
    updateAdminAssignment,
    deactivateAdminAssignment,
    activateAdminAssignment,
  };
}

function renderAssignments() {
  render(
    <MemoryRouter>
      <EmployeeAssignments />
    </MemoryRouter>,
  );
}

function getLastAdminUsersQuery(): AdminUsersListQuery {
  const calls = mockUseGetAdminUsersQuery.mock.calls;
  return calls[calls.length - 1][0];
}

function getLastClientsQuery(): ClientsListQuery {
  const calls = mockUseGetClientsQuery.mock.calls;
  return calls[calls.length - 1][0];
}

describe("EmployeeAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupListState();
    setupPickerState();
    setupMutationState();
  });

  it("renders the page and loading state", () => {
    setupListState({ data: undefined, isLoading: true });

    renderAssignments();

    expect(screen.getByText("Çalışan Atamaları")).toBeInTheDocument();
    expect(screen.getByText("Atamalar yükleniyor...")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    setupListState({ data: [] });

    renderAssignments();

    expect(screen.getByText("Henüz çalışan ataması bulunmuyor.")).toBeInTheDocument();
  });

  it("submits create payload with selected employee, client, and scope", async () => {
    const { createAdminAssignment } = setupMutationState();

    renderAssignments();
    fireEvent.click(screen.getByRole("button", { name: "Yeni Atama" }));

    const dialog = screen.getByRole("dialog", { name: "Yeni Çalışan Ataması" });
    fireEvent.click(within(dialog).getByRole("button", { name: /employee@example.com/i }));
    fireEvent.click(within(dialog).getByRole("button", { name: /acme-e-ticaret/i }));
    fireEvent.change(within(dialog).getByLabelText("Kapsam"), {
      target: { value: "SEO" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Atama Oluştur" }));

    await waitFor(() => {
      expect(createAdminAssignment).toHaveBeenCalledTimes(1);
    });
    expect(createAdminAssignment).toHaveBeenCalledWith({
      employeeUserId: employee.id,
      clientProfileId: client.id,
      scope: "SEO",
    });
    expect(
      await screen.findByText("Çalışan ataması başarıyla oluşturuldu."),
    ).toBeInTheDocument();
  });

  it("confirms deactivate and activate actions", async () => {
    const { activateAdminAssignment, deactivateAdminAssignment } = setupMutationState();
    const { rerender } = render(
      <MemoryRouter>
        <EmployeeAssignments />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pasife Al" }));
    let dialog = screen.getByRole("dialog", { name: "Atamayı Pasife Al" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Pasife Al" }));

    await waitFor(() => {
      expect(deactivateAdminAssignment).toHaveBeenCalledWith(activeAssignment.id);
    });

    setupListState({ data: [inactiveAssignment] });
    rerender(
      <MemoryRouter>
        <EmployeeAssignments />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aktifleştir" }));
    dialog = screen.getByRole("dialog", { name: "Atamayı Aktifleştir" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Aktifleştir" }));

    await waitFor(() => {
      expect(activateAdminAssignment).toHaveBeenCalledWith(inactiveAssignment.id);
    });
  });

  it("disables mutation buttons without assignments.manage permission", () => {
    currentUser = adminReadOnlyUser;

    renderAssignments();

    expect(screen.getByRole("button", { name: "Yeni Atama" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Kapsamı Düzenle" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pasife Al" })).toBeDisabled();
  });

  it("debounces employee and client picker query params", async () => {
    renderAssignments();

    expect(getLastAdminUsersQuery()).toEqual({
      accountType: "EMPLOYEE",
      isActive: true,
      limit: 8,
      search: undefined,
    });
    expect(getLastClientsQuery()).toEqual({
      status: "ACTIVE",
      limit: 8,
      search: undefined,
    });

    fireEvent.change(screen.getByLabelText("Çalışan filtresi"), {
      target: { value: "  Employee  " },
    });
    fireEvent.change(screen.getByLabelText("Müşteri filtresi"), {
      target: { value: "  Acme  " },
    });

    expect(getLastAdminUsersQuery().search).toBeUndefined();
    expect(getLastClientsQuery().search).toBeUndefined();

    await waitFor(() => {
      expect(getLastAdminUsersQuery()).toEqual({
        accountType: "EMPLOYEE",
        isActive: true,
        limit: 8,
        search: "Employee",
      });
    });

    await waitFor(() => {
      expect(getLastClientsQuery()).toEqual({
        status: "ACTIVE",
        limit: 8,
        search: "Acme",
      });
    });
  });
});
