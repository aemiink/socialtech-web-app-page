/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
  CreateAdminClientRequest,
  CreateOrLinkClientOwnerRequest,
  UpdateAdminClientRequest,
} from "../../features/clients/clientsTypes";
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

const mockUseGetClientsQuery = vi.fn<(query: ClientsListQuery) => ClientsQueryResult>();
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

const client: ClientProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@example.com",
  status: "INACTIVE",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
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
  permissions: ["clients.manage", "clients.read"],
  clientProfile: null,
};

const adminWithoutClientManagePermission: AuthUserProfile = {
  ...adminUser,
  permissions: ["clients.read"],
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

  return {
    createAdminClient,
    updateAdminClient,
    deactivateAdminClient,
    activateAdminClient,
    createOrLinkClientOwner,
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

describe("Clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    currentUser = adminUser;
    setupListState();
    setupMutationState();
  });

  afterEach(() => {
    vi.useRealTimers();
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
    expect(screen.getByText("Sayfa 2 / 3")).toBeInTheDocument();

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
    expect(screen.getByRole("button", { name: "Aktifleştir" })).toBeEnabled();
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
    fireEvent.change(within(dialog).getByLabelText("Sahip İşlemi"), {
      target: { value: "CREATE" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Müşteri Oluştur" }));

    expect(await screen.findByText("Sahip e-posta adresi gereklidir.")).toBeInTheDocument();
    expect(createAdminClient).not.toHaveBeenCalled();
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
      },
    });
    expect(await screen.findByText("Müşteri bilgileri güncellendi.")).toBeInTheDocument();
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
