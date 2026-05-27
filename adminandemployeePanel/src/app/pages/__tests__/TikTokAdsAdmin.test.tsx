/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  AdminTikTokAdsClientListResponse,
  AdminTikTokAdsSyncLogsResponse,
} from "../../features/tiktokAds/tiktokAdsTypes";
import { TikTokAdsAdmin } from "../TikTokAdsAdmin";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type TikTokAdsListQueryResult = {
  data?: AdminTikTokAdsClientListResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const mockUseGetAdminTikTokAdsClientsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => TikTokAdsListQueryResult
>();
const mockUseGetAdminTikTokAdsSyncLogsQuery = vi.fn();
const mockUseUpdateAdminClientTikTokAdsConfigMutation = vi.fn();
const mockUseTestAdminClientTikTokAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientTikTokAdsMutation = vi.fn();
const mockUseRetryAdminClientTikTokAdsSyncMutation = vi.fn();
const mockUseDisconnectAdminClientTikTokAdsMutation = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetAdminTikTokAdsClientsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminTikTokAdsClientsQuery(query, options),
  useGetAdminTikTokAdsSyncLogsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminTikTokAdsSyncLogsQuery(query, options),
  useUpdateAdminClientTikTokAdsConfigMutation: () =>
    mockUseUpdateAdminClientTikTokAdsConfigMutation(),
  useTestAdminClientTikTokAdsConnectionMutation: () =>
    mockUseTestAdminClientTikTokAdsConnectionMutation(),
  useSyncAdminClientTikTokAdsMutation: () => mockUseSyncAdminClientTikTokAdsMutation(),
  useRetryAdminClientTikTokAdsSyncMutation: () => mockUseRetryAdminClientTikTokAdsSyncMutation(),
  useDisconnectAdminClientTikTokAdsMutation: () =>
    mockUseDisconnectAdminClientTikTokAdsMutation(),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["tiktokAds.config.read.any", "tiktokAds.config.manage.any"],
  clientProfile: null,
};

const tikTokAdsClientListResponse: AdminTikTokAdsClientListResponse = {
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
        advertiserId: "adv-1",
        businessCenterId: "bc-1",
        pixelId: "px-1",
      },
      account: {
        advertiserName: "Acme TikTok Advertiser",
      },
      settings: {
        currency: "TRY",
        timezone: "Europe/Istanbul",
      },
      lastSyncAt: "2026-05-27T10:00:00.000Z",
      syncError: null,
      spendSummary: {
        spend: 1550.3,
        impressions: 20000,
        clicks: 350,
        videoViews: 14000,
        conversions: 41,
        costPerConversion: 37.81,
        purchaseValue: 4200,
      },
      pendingApprovals: 1,
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
        tiktokAdsProjectId: "22222222-2222-4222-8222-222222222222",
      },
    },
  ],
  dateRange: {
    since: "2026-05-21",
    until: "2026-05-27",
  },
  meta: {
    total: 1,
    connected: 1,
    error: 0,
    pendingApprovals: 1,
  },
};

const syncLogsResponse: AdminTikTokAdsSyncLogsResponse = {
  data: [
    {
      id: "sync-log-1",
      clientProfileId: "11111111-1111-4111-8111-111111111111",
      clientCompanyName: "Acme E-ticaret",
      advertiserId: "adv-1",
      status: "FAILED",
      trigger: "ERROR_RETRY",
      startedAt: "2026-05-27T11:00:00.000Z",
      finishedAt: "2026-05-27T11:00:02.000Z",
      durationMs: 2000,
      errorCode: "RATE_LIMIT",
      errorMessage: "[ERROR_RETRY] TikTok Ads API rate limit sınırına ulaşıldı.",
      recordsFetched: null,
      apiCallCount: null,
      createdAt: "2026-05-27T11:00:00.000Z",
    },
  ],
  meta: {
    total: 1,
    failed: 1,
    running: 0,
    skipped: 0,
  },
};

function createResolvedMutation<T>(value: T) {
  return vi.fn((): MutationResponse<T> => ({
    unwrap: async () => value,
  }));
}

describe("TikTokAdsAdmin", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    currentUser = adminUser;
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockUseGetAdminTikTokAdsClientsQuery.mockReturnValue({
      data: tikTokAdsClientListResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminTikTokAdsSyncLogsQuery.mockReturnValue({
      data: syncLogsResponse,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseUpdateAdminClientTikTokAdsConfigMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseTestAdminClientTikTokAdsConnectionMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseSyncAdminClientTikTokAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseRetryAdminClientTikTokAdsSyncMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseDisconnectAdminClientTikTokAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
  });

  it("renders success, loading, error, and empty states", () => {
    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "TikTok Ads Yönetimi" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getByText("Performance Specialist (PERFORMANCE)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sync Logları" })).toBeInTheDocument();
    expect(screen.getByText(/TikTok Ads API rate limit sınırına ulaşıldı/)).toBeInTheDocument();

    mockUseGetAdminTikTokAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("TikTok Ads müşterileri yükleniyor...")).toBeInTheDocument();

    mockUseGetAdminTikTokAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: { status: 500, data: { message: "TikTok Ads listesi okunamadı." } },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("TikTok Ads listesi okunamadı.")).toBeInTheDocument();

    mockUseGetAdminTikTokAdsClientsQuery.mockReturnValueOnce({
      data: { ...tikTokAdsClientListResponse, data: [], meta: { ...tikTokAdsClientListResponse.meta, total: 0 } },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("TikTok Ads hizmeti olan müşteri bulunmuyor.")).toBeInTheDocument();
  });

  it("submits config update action", async () => {
    const updateMutation = createResolvedMutation({});
    mockUseUpdateAdminClientTikTokAdsConfigMutation.mockReturnValue([
      updateMutation,
      { isLoading: false },
    ]);

    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Config" }));
    fireEvent.change(screen.getByLabelText("Advertiser ID"), { target: { value: "adv-updated-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Config Kaydet" }));

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        data: expect.objectContaining({
          advertiserId: "adv-updated-123",
        }),
      });
    });
  });

  it("runs manual sync, connection test, and disconnect actions", async () => {
    const syncMutation = createResolvedMutation({});
    const testMutation = createResolvedMutation({});
    const disconnectMutation = createResolvedMutation({});
    mockUseSyncAdminClientTikTokAdsMutation.mockReturnValue([syncMutation, { isLoading: false }]);
    mockUseTestAdminClientTikTokAdsConnectionMutation.mockReturnValue([testMutation, { isLoading: false }]);
    mockUseDisconnectAdminClientTikTokAdsMutation.mockReturnValue([
      disconnectMutation,
      { isLoading: false },
    ]);

    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });

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
        data: {
          advertiserId: "adv-1",
        },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    await waitFor(() => {
      expect(disconnectMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      });
    });
  });

  it("shows failed sync row and runs retry action", async () => {
    const retryMutation = createResolvedMutation({});
    mockUseRetryAdminClientTikTokAdsSyncMutation.mockReturnValue([retryMutation, { isLoading: false }]);
    mockUseGetAdminTikTokAdsClientsQuery.mockReturnValue({
      data: {
        ...tikTokAdsClientListResponse,
        data: [
          {
            ...tikTokAdsClientListResponse.data[0],
            connectionStatus: "ERROR",
            syncError: "TikTok Ads API rate limit sınırına ulaşıldı.",
          },
        ],
        meta: {
          ...tikTokAdsClientListResponse.meta,
          connected: 0,
          error: 1,
        },
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() =>
      expect(retryMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      }),
    );
  });

  it("disables management actions when permission is missing", () => {
    currentUser = {
      ...adminUser,
      permissions: ["tiktokAds.config.read.any"],
    };

    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Config" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Test" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeDisabled();
  });

  it("shows permission guard when read permission is missing", () => {
    currentUser = {
      ...adminUser,
      permissions: [],
    };

    render(<TikTokAdsAdmin />, { wrapper: MemoryRouter });

    expect(
      screen.getByText(/tiktokAds\.config\.read\.any/),
    ).toBeInTheDocument();
    expect(mockUseGetAdminTikTokAdsClientsQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });
});
