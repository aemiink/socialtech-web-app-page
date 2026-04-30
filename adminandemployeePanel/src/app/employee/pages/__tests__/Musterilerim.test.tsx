/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type {
  ClientProfile,
  ClientsListQuery,
  ClientsListResponse,
} from "../../../features/clients/clientsTypes";
import { Musterilerim } from "../Musterilerim";

type QueryOptions = {
  skip?: boolean;
};

type ClientsQueryResult = {
  data?: ClientsListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

const mockUseGetClientsQuery = vi.fn<
  (query: ClientsListQuery, options?: QueryOptions) => ClientsQueryResult
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (query: ClientsListQuery, options?: QueryOptions) =>
    mockUseGetClientsQuery(query, options),
}));

const employeeUser: AuthUserProfile = {
  id: "employee-user-id",
  email: "employee@socialtech.com",
  displayName: "Employee User",
  accountType: "EMPLOYEE",
  role: "PROJECT_MANAGER",
  status: "ACTIVE",
  permissions: ["clients.read.assigned"],
  clientProfile: null,
};

const assignedClient: ClientProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@example.com",
  status: "ACTIVE",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
};

const assignedClientsResponse: ClientsListResponse = {
  data: [assignedClient],
  meta: {
    page: 1,
    limit: 100,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupClientsState(overrides: Partial<ClientsQueryResult> = {}) {
  mockUseGetClientsQuery.mockReturnValue({
    data: assignedClientsResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

describe("Musterilerim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = employeeUser;
    setupClientsState();
  });

  it("queries assigned active clients through the clients API", () => {
    render(<Musterilerim />);

    expect(mockUseGetClientsQuery).toHaveBeenCalledWith(
      {
        status: "ACTIVE",
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      },
      { skip: false },
    );
    expect(screen.getByText("Acme E-ticaret")).toBeInTheDocument();
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
  });

  it("shows loading, error, and empty states", () => {
    setupClientsState({ data: undefined, isLoading: true });
    const { rerender } = render(<Musterilerim />);

    expect(screen.getByText("Müşteriler yükleniyor...")).toBeInTheDocument();

    setupClientsState({
      data: undefined,
      error: { status: 500, data: { message: "Müşteri servisi kullanılamıyor." } },
      isError: true,
    });
    rerender(<Musterilerim />);

    expect(screen.getByText("Müşteri servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();

    setupClientsState({
      data: {
        ...assignedClientsResponse,
        data: [],
        meta: {
          ...assignedClientsResponse.meta,
          total: 0,
        },
      },
    });
    rerender(<Musterilerim />);

    expect(screen.getByText("Henüz atanmış aktif müşteri bulunmuyor.")).toBeInTheDocument();
  });

  it("shows unauthorized state and skips the query without assigned-client permission", () => {
    currentUser = {
      ...employeeUser,
      permissions: [],
    };

    render(<Musterilerim />);

    expect(screen.getByText("Atanmış müşteri listesini görüntüleme yetkiniz bulunmuyor."))
      .toBeInTheDocument();
    expect(mockUseGetClientsQuery).toHaveBeenCalledWith(
      {
        status: "ACTIVE",
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      },
      { skip: true },
    );
  });
});
