/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  AdminMetaAdsClientListResponse,
  AdminMetaAdsSyncLogsResponse,
} from "../../features/clients/clientsTypes";
import type { Task } from "../../features/tasks/tasksTypes";
import { MetaAdsAdmin } from "../MetaAdsAdmin";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type MetaAdsListQueryResult = {
  data?: AdminMetaAdsClientListResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const mockUseGetAdminMetaAdsClientsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => MetaAdsListQueryResult
>();
const mockUseGetAdminMetaAdsSyncLogsQuery = vi.fn();
const mockUseUpdateAdminClientMetaAdsConfigMutation = vi.fn();
const mockUseTestAdminClientMetaAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientMetaAdsMutation = vi.fn();
const mockUseRetryAdminClientMetaAdsSyncMutation = vi.fn();
const mockUseDisconnectAdminClientMetaAdsMutation = vi.fn();
const mockUseCreateTaskMutation = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useGetAdminMetaAdsClientsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminMetaAdsClientsQuery(query, options),
  useGetAdminMetaAdsSyncLogsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminMetaAdsSyncLogsQuery(query, options),
  useUpdateAdminClientMetaAdsConfigMutation: () =>
    mockUseUpdateAdminClientMetaAdsConfigMutation(),
  useTestAdminClientMetaAdsConnectionMutation: () =>
    mockUseTestAdminClientMetaAdsConnectionMutation(),
  useSyncAdminClientMetaAdsMutation: () => mockUseSyncAdminClientMetaAdsMutation(),
  useRetryAdminClientMetaAdsSyncMutation: () => mockUseRetryAdminClientMetaAdsSyncMutation(),
  useDisconnectAdminClientMetaAdsMutation: () => mockUseDisconnectAdminClientMetaAdsMutation(),
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useCreateTaskMutation: () => mockUseCreateTaskMutation(),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["metaAds.config.read.any", "metaAds.config.manage.any", "tasks.manage.any"],
  clientProfile: null,
};

const metaAdsClientListResponse: AdminMetaAdsClientListResponse = {
  data: [
    {
      client: {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "acme-e-ticaret",
        companyName: "Acme E-ticaret",
        status: "ACTIVE",
      },
      serviceStatus: "ACTIVE",
      connectionStatus: "CONNECTED",
      hasToken: true,
      ids: {
        businessId: "biz-1",
        adAccountId: "act-1",
        pixelId: "px-1",
        instagramAccountId: "ig-1",
        facebookPageId: "pg-1",
      },
      settings: {
        currency: "TRY",
        timezone: "Europe/Istanbul",
      },
      lastSyncAt: "2026-05-09T10:00:00.000Z",
      syncError: null,
      spendSummary: {
        spend: 1550.3,
        impressions: 20000,
        clicks: 350,
        results: 41,
        roas: 2.6,
      },
      pendingApprovals: 3,
      assignedEmployees: [
        {
          userId: "employee-user-id",
          email: "performance@socialtech.com",
          displayName: "Performance Specialist",
          role: "PERFORMANCE_SPECIALIST",
          scope: "PERFORMANCE",
        },
      ],
      actionContext: {
        metaAdsProjectId: "22222222-2222-4222-8222-222222222222",
      },
    },
  ],
  dateRange: {
    since: "2026-05-03",
    until: "2026-05-09",
  },
  meta: {
    total: 1,
    connected: 1,
    error: 0,
    pendingApprovals: 3,
  },
};

const syncLogsResponse: AdminMetaAdsSyncLogsResponse = {
  data: [
    {
      id: "sync-log-1",
      clientProfileId: "11111111-1111-4111-8111-111111111111",
      clientCompanyName: "Acme E-ticaret",
      adAccountId: "act-1",
      status: "SUCCESS",
      startedAt: "2026-05-09T10:00:00.000Z",
      finishedAt: "2026-05-09T10:00:05.000Z",
      durationMs: 5000,
      errorCode: null,
      errorMessage: null,
      recordsFetched: 18,
      apiCallCount: 5,
      createdAt: "2026-05-09T10:00:05.000Z",
    },
  ],
  meta: {
    total: 1,
    failed: 0,
    running: 0,
    skipped: 0,
  },
};

function createResolvedMutation<T>(value: T) {
  return vi.fn((): MutationResponse<T> => ({
    unwrap: async () => value,
  }));
}

describe("MetaAdsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;

    mockUseGetAdminMetaAdsClientsQuery.mockReturnValue({
      data: metaAdsClientListResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminMetaAdsSyncLogsQuery.mockReturnValue({
      data: syncLogsResponse,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseUpdateAdminClientMetaAdsConfigMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseTestAdminClientMetaAdsConnectionMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseSyncAdminClientMetaAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseRetryAdminClientMetaAdsSyncMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseDisconnectAdminClientMetaAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseCreateTaskMutation.mockReturnValue([
      createResolvedMutation({} as Task),
      { isLoading: false },
    ]);
  });

  it("renders success, loading, error, and empty states", () => {
    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "Meta Ads Yönetimi" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);

    mockUseGetAdminMetaAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Meta Ads müşterileri yükleniyor...")).toBeInTheDocument();

    mockUseGetAdminMetaAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: { status: 500, data: { message: "Meta Ads listesi okunamadı." } },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Meta Ads listesi okunamadı.")).toBeInTheDocument();

    mockUseGetAdminMetaAdsClientsQuery.mockReturnValueOnce({
      data: { ...metaAdsClientListResponse, data: [], meta: { ...metaAdsClientListResponse.meta, total: 0 } },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Meta Ads hizmeti olan müşteri bulunmuyor.")).toBeInTheDocument();
  });

  it("renders pending approvals and assigned employee summary", () => {
    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getAllByText("Bekleyen Onay").length).toBeGreaterThan(0);
    expect(screen.getByText("Performance Specialist (PERFORMANCE)")).toBeInTheDocument();
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getByText("Sync Logları")).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
  });

  it("submits config update action", async () => {
    const updateMutation = createResolvedMutation({});
    mockUseUpdateAdminClientMetaAdsConfigMutation.mockReturnValue([updateMutation, { isLoading: false }]);

    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Config" }));
    fireEvent.change(screen.getByLabelText("Business ID"), { target: { value: "biz-updated-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Config Kaydet" }));

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          businessId: "biz-updated-123",
        }),
      });
    });
  });

  it("runs manual sync and connection test actions", async () => {
    const syncMutation = createResolvedMutation({});
    const testMutation = createResolvedMutation({});
    mockUseSyncAdminClientMetaAdsMutation.mockReturnValue([syncMutation, { isLoading: false }]);
    mockUseTestAdminClientMetaAdsConnectionMutation.mockReturnValue([testMutation, { isLoading: false }]);

    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Sync" }));
    await waitFor(() => {
      expect(syncMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    await waitFor(() => {
      expect(testMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: {
          adAccountId: "act-1",
          requiredScopes: ["ads_read"],
        },
      });
    });
  });

  it("shows failed sync row and runs retry action", async () => {
    const retryMutation = createResolvedMutation({});
    mockUseRetryAdminClientMetaAdsSyncMutation.mockReturnValue([retryMutation, { isLoading: false }]);
    mockUseGetAdminMetaAdsClientsQuery.mockReturnValue({
      data: {
        ...metaAdsClientListResponse,
        data: [
          {
            ...metaAdsClientListResponse.data[0],
            connectionStatus: "ERROR",
            syncError: "Meta API rate limit sınırına ulaşıldı.",
          },
        ],
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => {
      expect(retryMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      });
    });
  });

  it("disables management actions when permission is missing", () => {
    currentUser = {
      ...adminUser,
      permissions: ["metaAds.config.read.any"],
    };

    render(<MetaAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Config" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Test" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Onay Talebi" })).toBeDisabled();
  });
});
