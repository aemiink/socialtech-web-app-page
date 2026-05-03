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
  CrmLeadScanLogsResponse,
  RunAdminCrmLeadScanRequest,
  RunAdminCrmLeadScanResponse,
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
const mockUseRunAdminCrmLeadScanMutation = vi.fn<
  () => [(body: RunAdminCrmLeadScanRequest) => MutationResponse<RunAdminCrmLeadScanResponse>, { isLoading: boolean }]
>();
const mockUseGetAdminCrmLeadScanLogsQuery = vi.fn<() => { data?: CrmLeadScanLogsResponse }>();
const mockUseGetAdminUsersQuery = vi.fn<(query: AdminUsersListQuery, options?: QueryOptions) => AdminUsersResult>();
const toastSuccess = vi.fn();
const toastError = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/crm/crmApi", () => ({
  useGetAdminCrmLeadsQuery: (query: CrmLeadListQuery, options?: QueryOptions) =>
    mockUseGetAdminCrmLeadsQuery(query, options),
  useCreateAdminCrmLeadMutation: () => mockUseCreateAdminCrmLeadMutation(),
  useRunAdminCrmLeadScanMutation: () => mockUseRunAdminCrmLeadScanMutation(),
  useGetAdminCrmLeadScanLogsQuery: () => mockUseGetAdminCrmLeadScanLogsQuery(),
}));

vi.mock("../../features/adminUsers/adminUsersApi", () => ({
  useGetAdminUsersQuery: (query: AdminUsersListQuery, options?: QueryOptions) =>
    mockUseGetAdminUsersQuery(query, options),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["crm.leads.read.any", "crm.leads.manage.any", "crm.leadScan.read", "crm.leadScan.run"],
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
    toastSuccess.mockReset();
    toastError.mockReset();
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
    mockUseGetAdminCrmLeadScanLogsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "scan-log-id",
            startedAt: "2026-05-03T09:00:00.000Z",
            finishedAt: "2026-05-03T09:01:00.000Z",
            status: "COMPLETED",
            triggeredBy: "MANUAL",
            triggeredByUserId: adminUser.id,
            totalQueriesUsed: 3,
            totalBusinessesFetched: 30,
            totalDuplicates: 5,
            totalWebsitesAnalyzed: 12,
            totalQualified: 7,
            totalSaved: 4,
            totalFailed: 1,
            summary: "Son tarama 4 lead kaydetti.",
            queries: [],
            errors: [],
            createdAt: "2026-05-03T09:00:00.000Z",
            updatedAt: "2026-05-03T09:01:00.000Z",
          },
        ],
        meta: {
          dailyQueryLimit: 5,
          absoluteMaxDailyQueryLimit: 6,
          usedToday: 3,
          remainingToday: 2,
        },
      },
    });
    mockUseRunAdminCrmLeadScanMutation.mockReturnValue([
      vi.fn(() => ({
        unwrap: async () => ({
          scanId: "scan-1",
          status: "COMPLETED" as const,
          totalQueriesUsed: 5,
          totalBusinessesFetched: 100,
          totalDuplicates: 12,
          totalWebsitesAnalyzed: 40,
          totalQualified: 10,
          totalSaved: 3,
          totalFailed: 1,
          summary: "SerpAPI taraması 3 lead kaydetti.",
          usage: {
            dailyQueryLimit: 5,
            absoluteMaxDailyQueryLimit: 6,
            usedToday: 5,
            remainingToday: 0,
          },
        }),
      })),
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

  it("runs a lead scan and renders the scan summary card", async () => {
    const runLeadScan = vi.fn(() => ({
      unwrap: async () => ({
        scanId: "scan-2",
        status: "COMPLETED" as const,
        totalQueriesUsed: 4,
        totalBusinessesFetched: 80,
        totalDuplicates: 11,
        totalWebsitesAnalyzed: 25,
        totalQualified: 9,
        totalSaved: 4,
        totalFailed: 0,
        summary: "SerpAPI taraması 4 lead kaydetti.",
        usage: {
          dailyQueryLimit: 5,
          absoluteMaxDailyQueryLimit: 6,
          usedToday: 4,
          remainingToday: 1,
        },
      }),
    }));
    mockUseRunAdminCrmLeadScanMutation.mockReturnValue([runLeadScan, { isLoading: false }]);

    render(<CrmLeads />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText("Şehirler"), { target: { value: "Ankara, İzmir" } });
    fireEvent.change(screen.getByLabelText("Sektörler"), { target: { value: "diş kliniği, otel" } });
    fireEvent.change(screen.getByLabelText("Sorgu Limiti"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: /lead tara/i }));

    await waitFor(() => {
      expect(runLeadScan).toHaveBeenCalledWith({
        cities: ["Ankara", "İzmir"],
        sectors: ["diş kliniği", "otel"],
        queryLimit: 4,
      });
    });

    expect(await screen.findByText("Son tarama özeti")).toBeInTheDocument();
    expect(screen.getByText("4 lead kaydedildi")).toBeInTheDocument();
    expect(screen.getAllByText(/Bugünkü Kullanım:/).length).toBeGreaterThan(0);
    expect(toastSuccess).toHaveBeenCalledWith("Lead taraması tamamlandı.", {
      description: "SerpAPI taraması 4 lead kaydetti.",
    });
  });

  it("shows unauthorized state without crm.leads.read.any", () => {
    currentUser = { ...adminUser, permissions: [] };
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.getByText(/crm.leads.read.any/)).toBeInTheDocument();
  });

  it("hides lead scan controls without scan permissions", () => {
    currentUser = {
      ...adminUser,
      permissions: ["crm.leads.read.any", "crm.leads.manage.any"],
    };
    render(<CrmLeads />, { wrapper: MemoryRouter });
    expect(screen.queryByText("SerpAPI Lead Taraması")).not.toBeInTheDocument();
  });
});
