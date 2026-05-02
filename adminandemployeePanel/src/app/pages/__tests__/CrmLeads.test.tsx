/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminUsersListQuery, AdminUsersListResponse } from "../../features/adminUsers/adminUsersTypes";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  CreateCrmLeadRequest,
  CrmLeadListQuery,
  CrmLeadListResponse,
} from "../../features/crm/crmTypes";
import { CrmLeads } from "../CrmLeads";

type QueryOptions = { skip?: boolean };
type MutationResponse<T> = { unwrap: () => Promise<T> };
type CrmListResult = {
  data?: CrmLeadListResponse;
  currentData?: CrmLeadListResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};
type AdminUsersResult = {
  data?: AdminUsersListResponse;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const mockUseGetAdminCrmLeadsQuery = vi.fn<(query: CrmLeadListQuery, options?: QueryOptions) => CrmListResult>();
const mockUseCreateAdminCrmLeadMutation = vi.fn<() => [(body: CreateCrmLeadRequest) => MutationResponse<unknown>, { isLoading: boolean }]>();
const mockUseGetAdminUsersQuery = vi.fn<(query: AdminUsersListQuery, options?: QueryOptions) => AdminUsersResult>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/crm/crmApi", () => ({
  useGetAdminCrmLeadsQuery: (query: CrmLeadListQuery, options?: QueryOptions) =>
    mockUseGetAdminCrmLeadsQuery(query, options),
  useCreateAdminCrmLeadMutation: () => mockUseCreateAdminCrmLeadMutation(),
}));

vi.mock("../../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUsersQuery: (query: AdminUsersListQuery, options?: QueryOptions) =>
    mockUseGetAdminUsersQuery(query, options),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["crm.leads.read.any", "crm.leads.manage.any"],
  clientProfile: null,
};

const crmOwner = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "crm@socialtech.com",
  displayName: "CRM / Satış Uzmanı",
  accountType: "EMPLOYEE" as const,
  role: "CRM_SPECIALIST" as const,
  status: "ACTIVE" as const,
  lastLoginAt: null,
  createdAt: "2026-05-02T09:00:00.000Z",
  updatedAt: "2026-05-02T09:00:00.000Z",
};

const leadListResponse: CrmLeadListResponse = {
  data: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      companyName: "Atlas Mobilya",
      contactName: "Ayşe Atlas",
      contactEmail: "ayse@example.com",
      phone: null,
      source: "MANUAL",
      status: "QUALIFIED",
      ownerUserId: crmOwner.id,
      convertedClientProfileId: null,
      nextFollowUpAt: "2026-05-02T11:00:00.000Z",
      createdAt: "2026-05-01T09:00:00.000Z",
      updatedAt: "2026-05-01T09:00:00.000Z",
      owner: crmOwner,
      convertedClientProfile: null,
      latestActivity: null,
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

describe("CrmLeads", () => {
  beforeEach(() => {
    currentUser = adminUser;
    mockUseGetAdminCrmLeadsQuery.mockReturnValue({
      data: leadListResponse,
      currentData: leadListResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminUsersQuery.mockReturnValue({
      data: {
        data: [crmOwner],
        meta: { page: 1, limit: 8, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseCreateAdminCrmLeadMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => leadListResponse.data[0] })),
      { isLoading: false },
    ]);
  });

  it("renders success, empty, loading, and error states", () => {
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText("Atlas Mobilya")).toBeInTheDocument();

    mockUseGetAdminCrmLeadsQuery.mockReturnValueOnce({
      data: { ...leadListResponse, data: [], meta: { ...leadListResponse.meta, total: 0 } },
      currentData: undefined,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText("Henüz CRM lead bulunmuyor.")).toBeInTheDocument();

    mockUseGetAdminCrmLeadsQuery.mockReturnValueOnce({
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText("CRM leadleri yükleniyor...")).toBeInTheDocument();

    mockUseGetAdminCrmLeadsQuery.mockReturnValueOnce({
      error: { data: { message: "CRM failure" } },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText("CRM failure")).toBeInTheDocument();
  });

  it("validates create form and sends manual lead payload to selected CRM owner", async () => {
    const createLead = vi.fn((body: CreateCrmLeadRequest) => ({
      unwrap: async () => ({ ...leadListResponse.data[0], ...body }),
    }));
    mockUseCreateAdminCrmLeadMutation.mockReturnValue([createLead, { isLoading: false }]);

    render(<CrmLeads />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole("button", { name: /lead oluştur/i }));
    fireEvent.click(screen.getByRole("button", { name: /^lead oluştur$/i }));
    expect(screen.getByText("Şirket, kontak ve CRM sahibi seçimi gereklidir.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Şirket"), { target: { value: "Vega Klinik" } });
    fireEvent.change(screen.getByLabelText("Kontak"), { target: { value: "Vega Owner" } });
    fireEvent.change(screen.getByLabelText("E-posta"), { target: { value: "vega@example.com" } });
    const ownerMatches = screen.getAllByText("CRM / Satış Uzmanı");
    fireEvent.click(ownerMatches[ownerMatches.length - 1]);
    fireEvent.click(screen.getByRole("button", { name: /^lead oluştur$/i }));

    await waitFor(() => {
      expect(createLead).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Vega Klinik",
          contactName: "Vega Owner",
          contactEmail: "vega@example.com",
          ownerUserId: crmOwner.id,
          source: "MANUAL",
        }),
      );
    });
    expect(mockUseGetAdminUsersQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        accountType: "EMPLOYEE",
        role: "CRM_SPECIALIST",
        isActive: true,
        limit: 8,
      }),
      expect.any(Object),
    );
  });

  it("shows unauthorized state without crm.leads.read.any", () => {
    currentUser = { ...adminUser, permissions: [] };
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText(/crm.leads.read.any/)).toBeInTheDocument();
  });
});
