/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AdminUser,
  AdminUsersListQuery,
  AdminUsersListResponse,
} from "../../features/adminUsers/adminUsersTypes";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
  CreateAdminClientRequest,
  CreateOrLinkClientOwnerRequest,
  UpdateAdminClientRequest,
} from "../../features/clients/clientsTypes";
import type {
  AdminAssignment,
  CreateAdminAssignmentRequest,
} from "../../features/adminAssignments/adminAssignmentsTypes";
import { Clients } from "../Clients";

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type ClientsQueryResult = {
  data?: ClientsListResponse;
  currentData?: ClientsListResponse;
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

type CreateAdminClientTrigger = (
  payload: CreateAdminClientRequest,
) => MutationResponse<ClientProfile>;

type UpdateAdminClientTrigger = (payload: {
  id: string;
  body: UpdateAdminClientRequest;
}) => MutationResponse<ClientProfile>;

type StatusClientTrigger = (id: string) => MutationResponse<ClientProfile>;

type CreateOrLinkClientOwnerTrigger = (payload: {
  clientId: string;
  body: CreateOrLinkClientOwnerRequest;
}) => MutationResponse<ClientProfile>;

type CreateAdminAssignmentTrigger = (
  payload: CreateAdminAssignmentRequest,
) => MutationResponse<AdminAssignment>;

const mockUseGetClientsQuery = vi.fn<(query: ClientsListQuery) => ClientsQueryResult>();
const mockUseGetAdminUsersQuery = vi.fn<
  (query: AdminUsersListQuery) => AdminUsersQueryResult
>();
const mockUseCreateAdminClientMutation = vi.fn<
  () => [CreateAdminClientTrigger, { isLoading: boolean }]
>();
const mockUseUpdateAdminClientMutation = vi.fn<
  () => [UpdateAdminClientTrigger, { isLoading: boolean }]
>();
const mockUseDeactivateAdminClientMutation = vi.fn<
  () => [StatusClientTrigger, { isLoading: boolean }]
>();
const mockUseActivateAdminClientMutation = vi.fn<
  () => [StatusClientTrigger, { isLoading: boolean }]
>();
const mockUseCreateOrLinkClientOwnerMutation = vi.fn<
  () => [CreateOrLinkClientOwnerTrigger, { isLoading: boolean }]
>();
const mockUseCreateAdminAssignmentMutation = vi.fn<
  () => [CreateAdminAssignmentTrigger, { isLoading: boolean }]
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (query: ClientsListQuery) => mockUseGetClientsQuery(query),
  useCreateAdminClientMutation: () => mockUseCreateAdminClientMutation(),
  useUpdateAdminClientMutation: () => mockUseUpdateAdminClientMutation(),
  useDeactivateAdminClientMutation: () => mockUseDeactivateAdminClientMutation(),
  useActivateAdminClientMutation: () => mockUseActivateAdminClientMutation(),
  useCreateOrLinkClientOwnerMutation: () => mockUseCreateOrLinkClientOwnerMutation(),
}));

vi.mock("../../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUsersQuery: (query: AdminUsersListQuery) => mockUseGetAdminUsersQuery(query),
}));

vi.mock("../../features/adminAssignments/adminAssignmentsApi", () => ({
  useCreateAdminAssignmentMutation: () => mockUseCreateAdminAssignmentMutation(),
}));

const client: ClientProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@example.com",
  status: "INACTIVE",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
  purchasedServices: [
    { serviceKey: "growth-hub", status: "ACTIVE" },
    { serviceKey: "meta-ads", status: "ACTIVE" },
  ],
};

const activeClient: ClientProfile = {
  ...client,
  id: "22222222-2222-4222-8222-222222222222",
  slug: "nova-performance",
  companyName: "Nova Performance",
  status: "ACTIVE",
};

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["clients.manage", "clients.read", "users.manage", "assignments.manage"],
  clientProfile: null,
};

const adminWithoutClientManagePermission: AuthUserProfile = {
  ...adminUser,
  permissions: ["clients.read", "users.manage", "assignments.manage"],
};

const adminWithoutAssignmentManagePermission: AuthUserProfile = {
  ...adminUser,
  permissions: ["clients.manage", "clients.read", "users.manage"],
};

const existingClientOwner: AdminUser = {
  id: "44444444-4444-4444-8444-444444444444",
  email: "owner@example.com",
  displayName: "Owner User",
  accountType: "CLIENT",
  role: "ADMIN",
  status: "ACTIVE",
  lastLoginAt: null,
  createdAt: "2026-04-20T10:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
};

const defaultClientsResponse: ClientsListResponse = {
  data: [client],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const defaultAdminUsersResponse: AdminUsersListResponse = {
  data: [existingClientOwner],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupListState(overrides: Partial<ClientsQueryResult> = {}) {
  mockUseGetClientsQuery.mockReturnValue({
    data: defaultClientsResponse,
    currentData: defaultClientsResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupOwnerPickerState(overrides: Partial<AdminUsersQueryResult> = {}) {
  mockUseGetAdminUsersQuery.mockReturnValue({
    data: defaultAdminUsersResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupMutationState() {
  const createAdminClient = vi.fn<CreateAdminClientTrigger>((payload) => {
    const createdClient: ClientProfile = {
      ...client,
      id: "33333333-3333-4333-8333-333333333333",
      companyName: payload.name,
      slug: payload.slug ?? "yeni-musteri",
      status: payload.status ?? "ACTIVE",
      createdAt: "2026-04-30T10:00:00.000Z",
      updatedAt: "2026-04-30T10:00:00.000Z",
      purchasedServices: payload.purchasedServices.map((serviceKey) => ({
        serviceKey,
        status: "ACTIVE",
      })),
    };

    return { unwrap: async () => createdClient };
  });

  const updateAdminClient = vi.fn<UpdateAdminClientTrigger>(({ id, body }) => {
    const updatedClient: ClientProfile = {
      ...client,
      id,
      companyName: body.name ?? client.companyName,
      slug: body.slug ?? client.slug,
      status: body.status ?? client.status,
      updatedAt: "2026-04-30T10:00:00.000Z",
      purchasedServices: body.purchasedServices?.map((serviceKey) => ({
        serviceKey,
        status: "ACTIVE",
      })) ?? client.purchasedServices,
    };

    return { unwrap: async () => updatedClient };
  });

  const deactivateAdminClient = vi.fn<StatusClientTrigger>((id) => ({
    unwrap: async () => ({
      ...activeClient,
      id,
      status: "INACTIVE",
      updatedAt: "2026-04-30T10:00:00.000Z",
    }),
  }));

  const activateAdminClient = vi.fn<StatusClientTrigger>((id) => ({
    unwrap: async () => ({
      ...client,
      id,
      status: "ACTIVE",
      updatedAt: "2026-04-30T10:00:00.000Z",
    }),
  }));

  const createOrLinkClientOwner = vi.fn<CreateOrLinkClientOwnerTrigger>((payload) => ({
    unwrap: async () => ({
      ...client,
      id: payload.clientId,
      status: "ACTIVE",
    }),
  }));

  const createAdminAssignment = vi.fn<CreateAdminAssignmentTrigger>((payload) => ({
    unwrap: async () => ({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      employeeUserId: payload.employeeUserId,
      clientProfileId: payload.clientProfileId,
      scope: payload.scope,
      isActive: true,
      createdAt: "2026-04-30T10:00:00.000Z",
      updatedAt: "2026-04-30T10:00:00.000Z",
      employee: {
        id: payload.employeeUserId,
        email: "employee@example.com",
        displayName: "Employee User",
        role: "PROJECT_MANAGER",
        accountType: "EMPLOYEE",
      },
      client: {
        id: payload.clientProfileId,
        slug: "acme-e-ticaret",
        name: "Acme E-ticaret",
      },
    }),
  }));

  mockUseCreateAdminClientMutation.mockReturnValue([createAdminClient, { isLoading: false }]);
  mockUseUpdateAdminClientMutation.mockReturnValue([updateAdminClient, { isLoading: false }]);
  mockUseDeactivateAdminClientMutation.mockReturnValue([
    deactivateAdminClient,
    { isLoading: false },
  ]);
  mockUseActivateAdminClientMutation.mockReturnValue([activateAdminClient, { isLoading: false }]);
  mockUseCreateOrLinkClientOwnerMutation.mockReturnValue([
    createOrLinkClientOwner,
    { isLoading: false },
  ]);
  mockUseCreateAdminAssignmentMutation.mockReturnValue([
    createAdminAssignment,
    { isLoading: false },
  ]);

  return {
    createAdminClient,
    updateAdminClient,
    deactivateAdminClient,
    activateAdminClient,
    createOrLinkClientOwner,
    createAdminAssignment,
  };
}

function setupPaginatedState() {
  mockUseGetClientsQuery.mockImplementation((query) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = 25;
    const totalPages = 3;
    const response: ClientsListResponse = {
      data: [client],
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    return {
      data: response,
      currentData: response,
      error: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    };
  });
}

function setupStaleDataTransitionState() {
  mockUseGetClientsQuery.mockImplementation((query) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = 25;
    const totalPages = 3;

    if (page === 1) {
      const response: ClientsListResponse = {
        data: [client],
        meta: {
          page: 1,
          limit,
          total,
          totalPages,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      return {
        data: response,
        currentData: response,
        error: undefined,
        isError: false,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      };
    }

    return {
      data: {
        data: [client],
        meta: {
          page: 1,
          limit,
          total,
          totalPages,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
      currentData: {
        data: [client],
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      error: undefined,
      isError: false,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    };
  });
}

function renderClients() {
  render(
    <MemoryRouter>
      <Clients />
    </MemoryRouter>,
  );
}

function openAssignmentDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Çalışan Ata" }));
  return screen.getByRole("dialog", { name: "Çalışan Ata" });
}

function openCreateDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Yeni Müşteri Ekle" }));
  return screen.getByRole("dialog", { name: "Yeni Müşteri Oluştur" });
}

function getLastClientsQuery(): ClientsListQuery {
  const calls = mockUseGetClientsQuery.mock.calls;
  if (calls.length === 0) {
    throw new Error("Clients query hook was not called.");
  }

  return calls[calls.length - 1][0];
}

function getLastAdminUsersQuery(): AdminUsersListQuery {
  const calls = mockUseGetAdminUsersQuery.mock.calls;
  if (calls.length === 0) {
    throw new Error("Admin users query hook was not called.");
  }

  return calls[calls.length - 1][0];
}

describe("Clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    );
    currentUser = adminUser;
    setupListState();
    setupOwnerPickerState();
    setupMutationState();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("requests the initial server-side query params", () => {
    renderClients();

    expect(mockUseGetClientsQuery).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: undefined,
      status: undefined,
    });
  });

  it("sends status, sort, limit, and debounced search params without filtering returned rows locally", async () => {
    vi.useFakeTimers();

    renderClients();

    fireEvent.change(screen.getByPlaceholderText("Firma veya slug ara..."), {
      target: { value: "  Nova  " },
    });
    fireEvent.change(screen.getByLabelText("Durum filtresi"), {
      target: { value: "ACTIVE" },
    });
    fireEvent.change(screen.getByLabelText("Sıralama alanı"), {
      target: { value: "slug" },
    });
    fireEvent.change(screen.getByLabelText("Sıralama yönü"), {
      target: { value: "asc" },
    });
    fireEvent.change(screen.getByLabelText("Sayfa boyutu"), {
      target: { value: "20" },
    });

    expect(getLastClientsQuery()).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: "slug",
      sortOrder: "asc",
      status: "ACTIVE",
    });
    expect(getLastClientsQuery().search).toBeUndefined();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getLastClientsQuery()).toEqual({
      page: 1,
      limit: 20,
      sortBy: "slug",
      sortOrder: "asc",
      search: "Nova",
      status: "ACTIVE",
    });
    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(screen.getAllByText("Pasif").length).toBeGreaterThan(0);
  });

  it("debounces search, resets to page one, and omits empty search", async () => {
    vi.useFakeTimers();
    setupPaginatedState();

    renderClients();
    fireEvent.click(screen.getByRole("button", { name: /Sonraki/i }));

    expect(getLastClientsQuery()).toMatchObject({ page: 2, search: undefined });

    fireEvent.change(screen.getByPlaceholderText("Firma veya slug ara..."), {
      target: { value: "Nova" },
    });
    expect(getLastClientsQuery()).toMatchObject({ page: 2, search: undefined });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getLastClientsQuery()).toMatchObject({ page: 1, search: "Nova" });

    fireEvent.change(screen.getByPlaceholderText("Firma veya slug ara..."), {
      target: { value: "   " },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getLastClientsQuery()).toMatchObject({ page: 1, search: undefined });
  });

  it("uses backend meta for pagination labels and next/previous queries", async () => {
    const user = userEvent.setup();
    setupPaginatedState();

    renderClients();

    expect(screen.getByText("1-10 / 25 kayıt")).toBeInTheDocument();
    expect(screen.getByText("Sayfa 1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Önceki/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Sonraki/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Sonraki/i }));
    await waitFor(() => {
      expect(getLastClientsQuery()).toMatchObject({ page: 2 });
    });
    expect(await screen.findByText("11-20 / 25 kayıt")).toBeInTheDocument();
    expect(await screen.findByText("Sayfa 2 / 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Sonraki/i }));
    await waitFor(() => {
      expect(getLastClientsQuery()).toMatchObject({ page: 3 });
    });
    expect(await screen.findByText("21-25 / 25 kayıt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sonraki/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Önceki/i }));
    await waitFor(() => {
      expect(getLastClientsQuery()).toMatchObject({ page: 2 });
    });
    expect(await screen.findByText("11-20 / 25 kayıt")).toBeInTheDocument();
  });

  it("does not snap back to stale previous page when query data is stale during transition", async () => {
    const user = userEvent.setup();
    setupStaleDataTransitionState();

    renderClients();

    await user.click(screen.getByRole("button", { name: /Sonraki/i }));

    await waitFor(() => {
      expect(getLastClientsQuery()).toMatchObject({ page: 2 });
    });

    const queriedPages = mockUseGetClientsQuery.mock.calls.map((call) => call[0].page);
    expect(queriedPages[queriedPages.length - 1]).toBe(2);
  });

  it("disables create and row management actions without clients.manage permission", () => {
    currentUser = adminWithoutClientManagePermission;

    renderClients();

    expect(screen.getByRole("button", { name: "Yeni Müşteri Ekle" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Aktifleştir" })).toBeDisabled();
  });

  it("enables create and row management actions with clients.manage permission", () => {
    renderClients();

    expect(screen.getByRole("button", { name: "Yeni Müşteri Ekle" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Düzenle" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Çalışan Ata" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Aktifleştir" })).toBeEnabled();
  });

  it("disables assignment action without assignments.manage permission", () => {
    currentUser = adminWithoutAssignmentManagePermission;

    renderClients();

    expect(screen.getByRole("button", { name: "Çalışan Ata" })).toBeDisabled();
  });

  it("shows purchased service badges in list and preview", () => {
    renderClients();

    expect(screen.getByText("Growth & Hub")).toBeInTheDocument();
    expect(screen.getByText("Meta ADS")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Önizle" }));

    expect(screen.getByText("Satın Alınan Hizmetler")).toBeInTheDocument();
    expect(screen.getAllByText("Growth & Hub").length).toBeGreaterThan(0);
  });

  it("validates create modal fields before submitting", async () => {
    const { createAdminClient } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));
    expect(await screen.findByText("Müşteri adı gereklidir.")).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Acme E-ticaret" },
    });
    fireEvent.change(within(dialog).getByLabelText("Portal Slug"), {
      target: { value: "Invalid Slug" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));
    expect(
      await screen.findByText("Slug sadece küçük harf, rakam ve tek tire içerebilir."),
    ).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText("Portal Slug"), {
      target: { value: "acme-e-ticaret" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "CREATE" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    expect(await screen.findByText("Sahip e-posta adresi gereklidir.")).toBeInTheDocument();
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("shows Google Ads config fields only when Google ADS service is selected", () => {
    renderClients();
    const createDialog = openCreateDialog();

    expect(within(createDialog).queryByLabelText("Customer ID")).not.toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("Manager Customer ID")).not.toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("Account Name")).not.toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("Timezone")).not.toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("Currency")).not.toBeInTheDocument();
    expect(within(createDialog).queryByLabelText("Connection Status")).not.toBeInTheDocument();

    fireEvent.click(within(createDialog).getByLabelText("Google ADS"));

    expect(within(createDialog).getByLabelText("Customer ID")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Manager Customer ID")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Account Name")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Timezone")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Currency")).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Connection Status")).toBeInTheDocument();
  });

  it("shows a searchable owner picker for LINK_EXISTING", () => {
    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "LINK_EXISTING" },
    });

    expect(within(dialog).getByLabelText("Mevcut Kullanıcı Ara")).toBeInTheDocument();
    expect(within(dialog).getByText("Owner User")).toBeInTheDocument();
    expect(within(dialog).getByText("owner@example.com")).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Mevcut Kullanıcı ID")).not.toBeInTheDocument();
  });

  it("queries client account owners with debounced search", async () => {
    vi.useFakeTimers();

    renderClients();
    const dialog = openCreateDialog();
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "LINK_EXISTING" },
    });

    expect(getLastAdminUsersQuery()).toEqual({
      accountType: "CLIENT",
      limit: 8,
      search: undefined,
    });

    fireEvent.change(within(dialog).getByLabelText("Mevcut Kullanıcı Ara"), {
      target: { value: "  Owner  " },
    });
    expect(getLastAdminUsersQuery()).toEqual({
      accountType: "CLIENT",
      limit: 8,
      search: undefined,
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(getLastAdminUsersQuery()).toEqual({
      accountType: "CLIENT",
      limit: 8,
      search: "Owner",
    });
  });

  it("requires selecting an existing owner before submitting LINK_EXISTING", async () => {
    const { createAdminClient } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Yeni Müşteri" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "LINK_EXISTING" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    expect(
      await within(dialog).findByText("Bağlanacak mevcut portal sahibini seçin."),
    ).toBeInTheDocument();
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("submits LINK_EXISTING with only selected userId in the owner payload", async () => {
    const { createAdminClient, createOrLinkClientOwner } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Yeni Müşteri" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "LINK_EXISTING" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /owner@example.com/i }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    await waitFor(() => {
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(createOrLinkClientOwner).toHaveBeenCalledWith({
      clientId: "33333333-3333-4333-8333-333333333333",
      body: {
        mode: "LINK_EXISTING",
        userId: existingClientOwner.id,
      },
    });
    expect(Object.keys(createOrLinkClientOwner.mock.calls[0][0].body)).toEqual([
      "mode",
      "userId",
    ]);
  });

  it("requires selecting employee before creating assignment", async () => {
    const { createAdminAssignment } = setupMutationState();

    renderClients();
    const dialog = openAssignmentDialog();

    fireEvent.click(within(dialog).getByRole("button", { name: "Atamayı Oluştur" }));

    expect(await within(dialog).findByText("Atanacak çalışanı seçin.")).toBeInTheDocument();
    expect(createAdminAssignment).not.toHaveBeenCalled();
  });

  it("creates assignment payload with selected employee and scope", async () => {
    const { createAdminAssignment } = setupMutationState();
    const employeeCandidate: AdminUser = {
      id: "99999999-9999-4999-8999-999999999999",
      email: "employee@example.com",
      displayName: "Employee User",
      accountType: "EMPLOYEE",
      role: "PROJECT_MANAGER",
      status: "ACTIVE",
      lastLoginAt: null,
      createdAt: "2026-04-10T10:00:00.000Z",
      updatedAt: "2026-04-20T10:00:00.000Z",
    };
    setupOwnerPickerState({
      data: {
        data: [employeeCandidate],
        meta: defaultAdminUsersResponse.meta,
      },
    });

    renderClients();
    const dialog = openAssignmentDialog();

    fireEvent.change(within(dialog).getByLabelText("Atama Kapsamı"), {
      target: { value: "DEVELOPMENT" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /employee@example.com/i }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Atamayı Oluştur" }));

    await waitFor(() => {
      expect(createAdminAssignment).toHaveBeenCalledTimes(1);
    });
    expect(createAdminAssignment).toHaveBeenCalledWith({
      employeeUserId: employeeCandidate.id,
      clientProfileId: client.id,
      scope: "DEVELOPMENT",
    });
    expect(await screen.findByText("Çalışan ataması başarıyla oluşturuldu.")).toBeInTheDocument();
  });

  it("submits create client without owner payload when owner mode is NONE", async () => {
    const { createAdminClient, createOrLinkClientOwner } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Yeni Müşteri" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    await waitFor(() => {
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(createOrLinkClientOwner).not.toHaveBeenCalled();
    expect(await screen.findByText("Müşteri başarıyla oluşturuldu.")).toBeInTheDocument();
  });

  it("includes googleAdsConfig in create payload when Google ADS service is selected", async () => {
    const { createAdminClient } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Google Client" },
    });
    fireEvent.click(within(dialog).getByLabelText("Google ADS"));
    fireEvent.change(within(dialog).getByLabelText("Customer ID"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(within(dialog).getByLabelText("Manager Customer ID"), {
      target: { value: "0987654321" },
    });
    fireEvent.change(within(dialog).getByLabelText("Account Name"), {
      target: { value: "Google Primary" },
    });
    fireEvent.change(within(dialog).getByLabelText("Timezone"), {
      target: { value: "Europe/Istanbul" },
    });
    fireEvent.change(within(dialog).getByLabelText("Currency"), {
      target: { value: "try" },
    });
    fireEvent.change(within(dialog).getByLabelText("Connection Status"), {
      target: { value: "CONNECTED" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    await waitFor(() => {
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(createAdminClient.mock.calls[0][0]).toEqual({
      name: "Google Client",
      status: "ACTIVE",
      purchasedServices: ["google-ads"],
      googleAdsConfig: {
        customerId: "1234567890",
        managerCustomerId: "0987654321",
        descriptiveName: "Google Primary",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        connectionStatus: "CONNECTED",
      },
    });
  });

  it("submits create client and owner payloads, then shows success", async () => {
    const { createAdminClient, createOrLinkClientOwner } = setupMutationState();

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "  Yeni Müşteri  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Portal Slug"), {
      target: { value: " yeni-musteri " },
    });
    fireEvent.change(within(dialog).getByLabelText("Durum"), {
      target: { value: "INACTIVE" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.click(within(dialog).getByLabelText("Meta ADS"));
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "CREATE" },
    });
    fireEvent.change(within(dialog).getByLabelText("Sahip E-posta"), {
      target: { value: " Owner@Example.com " },
    });
    fireEvent.change(within(dialog).getByLabelText("Sahip Adı"), {
      target: { value: "  Owner User  " },
    });
    fireEvent.change(within(dialog).getByLabelText("Geçici Şifre"), {
      target: { value: "Owner123" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    await waitFor(() => {
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(createAdminClient.mock.calls[0][0]).toEqual({
      name: "Yeni Müşteri",
      slug: "yeni-musteri",
      status: "INACTIVE",
      purchasedServices: ["growth-hub", "meta-ads"],
    });
    expect(createOrLinkClientOwner).toHaveBeenCalledWith({
      clientId: "33333333-3333-4333-8333-333333333333",
      body: {
        mode: "CREATE",
        email: "owner@example.com",
        displayName: "Owner User",
        password: "Owner123",
      },
    });
    expect(await screen.findByText("Müşteri ve portal sahibi başarıyla kaydedildi.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Yeni Müşteri Oluştur" })).not.toBeInTheDocument();
  });

  it("keeps create modal open and shows API errors", async () => {
    const createAdminClient = vi.fn<CreateAdminClientTrigger>(() => ({
      unwrap: async () =>
        Promise.reject({
          status: 500,
          data: { message: "Müşteri API geçici hata döndürdü." },
        }),
    }));
    mockUseCreateAdminClientMutation.mockReturnValue([createAdminClient, { isLoading: false }]);

    renderClients();
    const dialog = openCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Yeni Müşteri" },
    });
    fireEvent.click(within(dialog).getByLabelText("Growth & Hub"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    await waitFor(() => {
      expect(createAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Müşteri API geçici hata döndürdü.")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Yeni Müşteri Oluştur" })).toBeInTheDocument();
  });

  it("submits edit modal payload and shows success", async () => {
    const { updateAdminClient } = setupMutationState();

    renderClients();
    fireEvent.click(screen.getByRole("button", { name: "Düzenle" }));

    const dialog = screen.getByRole("dialog", { name: "Müşteri Güncelle" });
    fireEvent.change(within(dialog).getByLabelText("Müşteri Adı"), {
      target: { value: "Updated Client" },
    });
    fireEvent.change(within(dialog).getByLabelText("Portal Slug"), {
      target: { value: "updated-client" },
    });
    fireEvent.change(within(dialog).getByLabelText("Durum"), {
      target: { value: "ACTIVE" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Değişiklikleri Kaydet" }));

    await waitFor(() => {
      expect(updateAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(updateAdminClient.mock.calls[0][0]).toEqual({
      id: client.id,
      body: {
        name: "Updated Client",
        slug: "updated-client",
        status: "ACTIVE",
        purchasedServices: ["growth-hub", "meta-ads"],
      },
    });
    expect(await screen.findByText("Müşteri bilgileri güncellendi.")).toBeInTheDocument();
  });

  it("includes googleAdsConfig in edit payload when Google ADS service is selected", async () => {
    const { updateAdminClient } = setupMutationState();

    renderClients();
    fireEvent.click(screen.getByRole("button", { name: "Düzenle" }));

    const dialog = screen.getByRole("dialog", { name: "Müşteri Güncelle" });
    fireEvent.click(within(dialog).getByLabelText("Google ADS"));
    fireEvent.change(within(dialog).getByLabelText("Customer ID"), {
      target: { value: "1111111111" },
    });
    fireEvent.change(within(dialog).getByLabelText("Manager Customer ID"), {
      target: { value: "2222222222" },
    });
    fireEvent.change(within(dialog).getByLabelText("Account Name"), {
      target: { value: "Edit Account" },
    });
    fireEvent.change(within(dialog).getByLabelText("Timezone"), {
      target: { value: "Europe/Berlin" },
    });
    fireEvent.change(within(dialog).getByLabelText("Currency"), {
      target: { value: "eur" },
    });
    fireEvent.change(within(dialog).getByLabelText("Connection Status"), {
      target: { value: "PENDING" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Değişiklikleri Kaydet" }));

    await waitFor(() => {
      expect(updateAdminClient).toHaveBeenCalledTimes(1);
    });
    expect(updateAdminClient.mock.calls[0][0]).toEqual({
      id: client.id,
      body: {
        name: "Acme E-ticaret",
        slug: "acme-e-ticaret",
        status: "INACTIVE",
        purchasedServices: ["growth-hub", "meta-ads", "google-ads"],
        googleAdsConfig: {
          customerId: "1111111111",
          managerCustomerId: "2222222222",
          descriptiveName: "Edit Account",
          currencyCode: "EUR",
          timeZone: "Europe/Berlin",
          connectionStatus: "PENDING",
        },
      },
    });
  });

  it("confirms activate and deactivate actions", async () => {
    const { activateAdminClient, deactivateAdminClient } = setupMutationState();

    renderClients();
    fireEvent.click(screen.getByRole("button", { name: "Aktifleştir" }));
    let dialog = screen.getByRole("dialog", { name: "Müşteriyi Aktifleştir" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Aktifleştir" }));

    await waitFor(() => {
      expect(activateAdminClient).toHaveBeenCalledWith(client.id);
    });
    expect(await screen.findByText("Müşteri tekrar aktif edildi.")).toBeInTheDocument();

    setupListState({
      data: {
        ...defaultClientsResponse,
        data: [activeClient],
      },
      currentData: {
        ...defaultClientsResponse,
        data: [activeClient],
      },
    });
    renderClients();
    fireEvent.click(screen.getByRole("button", { name: "Pasife Al" }));
    dialog = screen.getByRole("dialog", { name: "Müşteriyi Pasife Al" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Pasife Al" }));

    await waitFor(() => {
      expect(deactivateAdminClient).toHaveBeenCalledWith(activeClient.id);
    });
  });

  it("does not render sensitive fields from client data", () => {
    const clientWithSensitiveFields: ClientProfile & {
      passwordHash: string;
      refreshToken: string;
      apiSecret: string;
    } = {
      ...client,
      passwordHash: "hashed-password-value",
      refreshToken: "refresh-token-value",
      apiSecret: "api-secret-value",
    };
    setupListState({
      data: {
        ...defaultClientsResponse,
        data: [clientWithSensitiveFields],
      },
      currentData: {
        ...defaultClientsResponse,
        data: [clientWithSensitiveFields],
      },
    });

    renderClients();

    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/refresh-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
  });
});
