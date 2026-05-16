/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  AdminGoogleAdsClientListResponse,
  AdminGoogleAdsSyncLogsResponse,
} from "../../features/clients/clientsTypes";
import type { Task } from "../../features/tasks/tasksTypes";
import { GoogleAdsAdmin } from "../GoogleAdsAdmin";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type GoogleAdsListQueryResult = {
  data?: AdminGoogleAdsClientListResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

type GoogleAdsSyncLogsQueryResult = {
  data?: AdminGoogleAdsSyncLogsResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
};

const mockUseGetAdminGoogleAdsClientsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => GoogleAdsListQueryResult
>();
const mockUseGetAdminGoogleAdsSyncLogsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => GoogleAdsSyncLogsQueryResult
>();
const mockUseUpdateAdminClientGoogleAdsConfigMutation = vi.fn();
const mockUseTestAdminClientGoogleAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientGoogleAdsMutation = vi.fn();
const mockUseRetryAdminClientGoogleAdsSyncMutation = vi.fn();
const mockUseDisconnectAdminClientGoogleAdsMutation = vi.fn();
const mockUseCreateTaskMutation = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useGetAdminGoogleAdsClientsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminGoogleAdsClientsQuery(query, options),
  useGetAdminGoogleAdsSyncLogsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminGoogleAdsSyncLogsQuery(query, options),
  useUpdateAdminClientGoogleAdsConfigMutation: () =>
    mockUseUpdateAdminClientGoogleAdsConfigMutation(),
  useTestAdminClientGoogleAdsConnectionMutation: () =>
    mockUseTestAdminClientGoogleAdsConnectionMutation(),
  useSyncAdminClientGoogleAdsMutation: () => mockUseSyncAdminClientGoogleAdsMutation(),
  useRetryAdminClientGoogleAdsSyncMutation: () =>
    mockUseRetryAdminClientGoogleAdsSyncMutation(),
  useDisconnectAdminClientGoogleAdsMutation: () =>
    mockUseDisconnectAdminClientGoogleAdsMutation(),
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
  permissions: [
    "googleAds.config.read.any",
    "googleAds.reporting.read.any",
    "googleAds.config.manage.any",
    "googleAds.sync.run.any",
    "googleAds.approvals.manage.any",
    "tasks.manage.any",
  ],
  clientProfile: null,
};

const googleAdsClientListResponse: AdminGoogleAdsClientListResponse = {
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
      hasRefreshToken: true,
      account: {
        customerId: "123-456-7890",
        managerCustomerId: "999-888-7777",
        descriptiveName: "Acme Search",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
      },
      lastSyncAt: "2026-05-09T10:00:00.000Z",
      syncError: null,
      summary: {
        cost: 1220.45,
        impressions: 18000,
        clicks: 420,
        conversions: 32.5,
        conversionValue: 4400,
      },
      pendingApprovals: 2,
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
        googleAdsProjectId: "22222222-2222-4222-8222-222222222222",
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
    pendingApprovals: 2,
  },
};

const googleAdsSyncLogsResponse: AdminGoogleAdsSyncLogsResponse = {
  data: [
    {
      id: "sync-log-1",
      clientProfileId: "11111111-1111-4111-8111-111111111111",
      clientCompanyName: "Acme E-ticaret",
      customerId: "123-456-7890",
      managerCustomerId: "999-888-7777",
      status: "SUCCESS",
      startedAt: "2026-05-09T09:59:00.000Z",
      finishedAt: "2026-05-09T10:00:00.000Z",
      durationMs: 60000,
      errorCode: null,
      errorMessage: null,
      recordsFetched: 45,
      apiCallCount: 5,
      createdAt: "2026-05-09T10:00:00.000Z",
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

describe("GoogleAdsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;

    mockUseGetAdminGoogleAdsClientsQuery.mockReturnValue({
      data: googleAdsClientListResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminGoogleAdsSyncLogsQuery.mockReturnValue({
      data: googleAdsSyncLogsResponse,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseUpdateAdminClientGoogleAdsConfigMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseTestAdminClientGoogleAdsConnectionMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseSyncAdminClientGoogleAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseRetryAdminClientGoogleAdsSyncMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseDisconnectAdminClientGoogleAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseCreateTaskMutation.mockReturnValue([
      createResolvedMutation({} as Task),
      { isLoading: false },
    ]);
  });

  it("renders success, loading, error, and empty states", () => {
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "Google Ads Yönetimi" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);

    mockUseGetAdminGoogleAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads müşterileri yükleniyor...")).toBeInTheDocument();

    mockUseGetAdminGoogleAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: { status: 500, data: { message: "Google Ads listesi okunamadı." } },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads listesi okunamadı.")).toBeInTheDocument();

    mockUseGetAdminGoogleAdsClientsQuery.mockReturnValueOnce({
      data: {
        ...googleAdsClientListResponse,
        data: [],
        meta: { ...googleAdsClientListResponse.meta, total: 0 },
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads hizmeti olan müşteri bulunmuyor.")).toBeInTheDocument();
  });

  it("renders pending approvals and assigned employee summary", () => {
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getAllByText("Bekleyen Onay").length).toBeGreaterThan(0);
    expect(screen.getByText("Performance Specialist (PERFORMANCE)")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });

  it("renders sync logs with api status badge and last successful sync", () => {
    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getByText("Sync Logları")).toBeInTheDocument();
    expect(screen.getByText("API: Sağlıklı")).toBeInTheDocument();
    expect(screen.getByText(/Son başarılı:/)).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("submits config update action", async () => {
    const updateMutation = createResolvedMutation({});
    mockUseUpdateAdminClientGoogleAdsConfigMutation.mockReturnValue([
      updateMutation,
      { isLoading: false },
    ]);

    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Config" }));
    fireEvent.change(screen.getByLabelText("Customer ID"), { target: { value: "555-444-3333" } });
    fireEvent.click(screen.getByRole("button", { name: "Config Kaydet" }));

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          customerId: "555-444-3333",
        }),
      });
    });
  });

  it("runs manual sync and connection test actions", async () => {
    const syncMutation = createResolvedMutation({});
    const testMutation = createResolvedMutation({});
    mockUseSyncAdminClientGoogleAdsMutation.mockReturnValue([syncMutation, { isLoading: false }]);
    mockUseTestAdminClientGoogleAdsConnectionMutation.mockReturnValue([
      testMutation,
      { isLoading: false },
    ]);

    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

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
          customerId: "123-456-7890",
          managerCustomerId: "999-888-7777",
          requiredScopes: ["https://www.googleapis.com/auth/adwords"],
        },
      });
    });
  });

  it("retries failed sync from failed-clients section", async () => {
    const retryMutation = createResolvedMutation({});
    mockUseRetryAdminClientGoogleAdsSyncMutation.mockReturnValue([
      retryMutation,
      { isLoading: false },
    ]);
    mockUseGetAdminGoogleAdsClientsQuery.mockReturnValueOnce({
      data: {
        ...googleAdsClientListResponse,
        data: [
          {
            ...googleAdsClientListResponse.data[0],
            connectionStatus: "ERROR",
            syncError: "Google Ads API rate limit sınırına ulaşıldı.",
          },
        ],
        meta: {
          ...googleAdsClientListResponse.meta,
          error: 1,
        },
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(retryMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      });
    });
  });

  it("creates approval request action", async () => {
    const createTaskMutation = createResolvedMutation({} as Task);
    mockUseCreateTaskMutation.mockReturnValue([createTaskMutation, { isLoading: false }]);

    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Onay Talebi" }));
    await waitFor(() => {
      expect(createTaskMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "22222222-2222-4222-8222-222222222222",
          status: "REVIEW",
          type: "REVISION",
          approvalRequired: true,
          approvalStatus: "PENDING",
        }),
      );
    });
  });

  it("disables management actions when permissions are missing", () => {
    currentUser = {
      ...adminUser,
      permissions: ["googleAds.config.read.any", "googleAds.reporting.read.any"],
    };

    render(<GoogleAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Config" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Test" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Onay Talebi" })).toBeDisabled();
  });
});
