/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  AdminAmazonAdsClientListResponse,
  AmazonAdsReportsResponse,
  AdminAmazonAdsSyncLogsResponse,
} from "../../features/clients/clientsTypes";
import type { Task } from "../../features/tasks/tasksTypes";
import { AmazonAdsAdmin } from "../AmazonAdsAdmin";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type AmazonAdsListQueryResult = {
  data?: AdminAmazonAdsClientListResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

const mockUseGetAdminAmazonAdsClientsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => AmazonAdsListQueryResult
>();
const mockUseGetAdminAmazonAdsSyncLogsQuery = vi.fn();
const mockUseGetAdminClientAmazonAdsReportsQuery = vi.fn();
const mockUseUpdateAdminClientAmazonAdsConfigMutation = vi.fn();
const mockUseTestAdminClientAmazonAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientAmazonAdsMutation = vi.fn();
const mockUseRetryAdminClientAmazonAdsSyncMutation = vi.fn();
const mockUseDisconnectAdminClientAmazonAdsMutation = vi.fn();
const mockUseCreateAdminClientAmazonAdsReportMutation = vi.fn();
const mockUseUpdateAdminAmazonAdsReportMutation = vi.fn();
const mockUseExportAdminAmazonAdsReportMutation = vi.fn();
const mockUseCreateTaskMutation = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useGetAdminAmazonAdsClientsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminAmazonAdsClientsQuery(query, options),
  useGetAdminAmazonAdsSyncLogsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminAmazonAdsSyncLogsQuery(query, options),
  useGetAdminClientAmazonAdsReportsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminClientAmazonAdsReportsQuery(query, options),
  useUpdateAdminClientAmazonAdsConfigMutation: () =>
    mockUseUpdateAdminClientAmazonAdsConfigMutation(),
  useTestAdminClientAmazonAdsConnectionMutation: () =>
    mockUseTestAdminClientAmazonAdsConnectionMutation(),
  useSyncAdminClientAmazonAdsMutation: () => mockUseSyncAdminClientAmazonAdsMutation(),
  useRetryAdminClientAmazonAdsSyncMutation: () =>
    mockUseRetryAdminClientAmazonAdsSyncMutation(),
  useDisconnectAdminClientAmazonAdsMutation: () =>
    mockUseDisconnectAdminClientAmazonAdsMutation(),
  useCreateAdminClientAmazonAdsReportMutation: () =>
    mockUseCreateAdminClientAmazonAdsReportMutation(),
  useUpdateAdminAmazonAdsReportMutation: () =>
    mockUseUpdateAdminAmazonAdsReportMutation(),
  useExportAdminAmazonAdsReportMutation: () =>
    mockUseExportAdminAmazonAdsReportMutation(),
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
    "amazonAds.config.read.any",
    "amazonAds.config.manage.any",
    "reports.read",
    "reports.manage",
    "amazonAds.approvals.manage.any",
    "tasks.manage.any",
  ],
  clientProfile: null,
};

const amazonAdsClientListResponse: AdminAmazonAdsClientListResponse = {
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
      ids: {
        profileId: "amzn1.profile.1",
        advertiserAccountId: "ENTITY-1",
        marketplaceId: "ATVPDKIKX0DER",
      },
      account: {
        accountType: "seller",
        accountName: "Acme Seller Account",
        validPaymentMethod: true,
      },
      settings: {
        region: "NA",
        countryCode: "US",
        currencyCode: "USD",
        timezone: "America/Los_Angeles",
      },
      lastSyncAt: "2026-05-27T10:00:00.000Z",
      syncError: null,
      spendSummary: {
        spend: 100,
        sales: 500,
        impressions: 10000,
        clicks: 200,
        orders: 25,
        acos: 20,
        roas: 5,
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
        amazonAdsProjectId: "22222222-2222-4222-8222-222222222222",
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
    pendingApprovals: 2,
  },
};

const amazonAdsSyncLogsResponse: AdminAmazonAdsSyncLogsResponse = {
  data: [
    {
      id: "sync-log-1",
      clientProfileId: "11111111-1111-4111-8111-111111111111",
      clientCompanyName: "Acme E-ticaret",
      profileId: "amzn1.profile.1",
      status: "SUCCESS",
      trigger: "MANUAL_SYNC",
      startedAt: "2026-05-27T10:00:00.000Z",
      finishedAt: "2026-05-27T10:00:05.000Z",
      durationMs: 5000,
      errorCode: null,
      errorMessage: null,
      recordsFetched: 42,
      apiCallCount: 12,
      reportStatus: "COMPLETED",
      createdAt: "2026-05-27T10:00:05.000Z",
    },
  ],
  meta: {
    total: 1,
    failed: 0,
    running: 0,
    skipped: 0,
  },
};

const amazonAdsReportsResponse: AmazonAdsReportsResponse = {
  data: [],
  meta: {
    total: 0,
    draft: 0,
    published: 0,
    clientVisible: 0,
  },
};

function createResolvedMutation<T>(value: T) {
  return vi.fn((): MutationResponse<T> => ({
    unwrap: async () => value,
  }));
}

describe("AmazonAdsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockUseGetAdminAmazonAdsClientsQuery.mockReturnValue({
      data: amazonAdsClientListResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminAmazonAdsSyncLogsQuery.mockReturnValue({
      data: amazonAdsSyncLogsResponse,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseGetAdminClientAmazonAdsReportsQuery.mockReturnValue({
      data: amazonAdsReportsResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
    });
    mockUseUpdateAdminClientAmazonAdsConfigMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseTestAdminClientAmazonAdsConnectionMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseSyncAdminClientAmazonAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseRetryAdminClientAmazonAdsSyncMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseDisconnectAdminClientAmazonAdsMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseCreateAdminClientAmazonAdsReportMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseUpdateAdminAmazonAdsReportMutation.mockReturnValue([
      createResolvedMutation({}),
      { isLoading: false },
    ]);
    mockUseExportAdminAmazonAdsReportMutation.mockReturnValue([
      createResolvedMutation("mock-report-body"),
      { isLoading: false },
    ]);
    mockUseCreateTaskMutation.mockReturnValue([
      createResolvedMutation({} as Task),
      { isLoading: false },
    ]);
  });

  it("renders success, loading, error, and empty states", () => {
    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByRole("heading", { name: "Amazon Ads Yönetimi" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getByText("Performance Specialist (PERFORMANCE)")).toBeInTheDocument();
    expect(screen.getByText("Sync Logları")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();

    mockUseGetAdminAmazonAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    });
    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Amazon Ads müşterileri yükleniyor...")).toBeInTheDocument();

    mockUseGetAdminAmazonAdsClientsQuery.mockReturnValueOnce({
      data: undefined,
      error: { status: 500, data: { message: "Amazon Ads listesi okunamadı." } },
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Amazon Ads listesi okunamadı.")).toBeInTheDocument();

    mockUseGetAdminAmazonAdsClientsQuery.mockReturnValueOnce({
      data: {
        ...amazonAdsClientListResponse,
        data: [],
        meta: { ...amazonAdsClientListResponse.meta, total: 0 },
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });
    expect(screen.getByText("Amazon Ads hizmeti olan müşteri bulunmuyor.")).toBeInTheDocument();
  });

  it("submits config update action", async () => {
    const updateMutation = createResolvedMutation({});
    mockUseUpdateAdminClientAmazonAdsConfigMutation.mockReturnValue([
      updateMutation,
      { isLoading: false },
    ]);

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Config" }));
    fireEvent.change(screen.getByLabelText("Profile ID"), { target: { value: "amzn1.profile.updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Config Kaydet" }));

    await waitFor(() => {
      expect(updateMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          profileId: "amzn1.profile.updated",
        }),
      });
    });
  });

  it("runs manual sync, connection test, and disconnect actions", async () => {
    const syncMutation = createResolvedMutation({});
    const testMutation = createResolvedMutation({});
    const disconnectMutation = createResolvedMutation({});
    mockUseSyncAdminClientAmazonAdsMutation.mockReturnValue([syncMutation, { isLoading: false }]);
    mockUseTestAdminClientAmazonAdsConnectionMutation.mockReturnValue([
      testMutation,
      { isLoading: false },
    ]);
    mockUseDisconnectAdminClientAmazonAdsMutation.mockReturnValue([
      disconnectMutation,
      { isLoading: false },
    ]);

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

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
          profileId: "amzn1.profile.1",
          region: "NA",
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

  it("runs retry sync action from failed clients panel", async () => {
    const retryMutation = createResolvedMutation({});
    mockUseRetryAdminClientAmazonAdsSyncMutation.mockReturnValue([
      retryMutation,
      { isLoading: false },
    ]);
    mockUseGetAdminAmazonAdsClientsQuery.mockReturnValue({
      data: {
        ...amazonAdsClientListResponse,
        data: [
          {
            ...amazonAdsClientListResponse.data[0],
            connectionStatus: "ERROR",
            syncError: "Amazon Ads API rate limit sınırına ulaşıldı.",
          },
        ],
      },
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Retry Sync" }));
    await waitFor(() => {
      expect(retryMutation).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
      });
    });
  });

  it("creates approval request from amazon ads row action", async () => {
    const createTaskMutation = createResolvedMutation({} as Task);
    mockUseCreateTaskMutation.mockReturnValue([createTaskMutation, { isLoading: false }]);

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole("button", { name: "Onay Talebi" }));

    await waitFor(() => {
      expect(createTaskMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "22222222-2222-4222-8222-222222222222",
          status: "REVIEW",
          type: "REVISION",
          approvalRequired: true,
          approvalStatus: "PENDING",
          approvalType: "AMAZON_ADS_STRATEGY_APPROVAL",
        }),
      );
    });
  });

  it("disables management actions when permission is missing", () => {
    currentUser = {
      ...adminUser,
      permissions: ["amazonAds.config.read.any"],
    };

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Config" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Test" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Onay Talebi" })).toBeDisabled();
  });

  it("shows permission guard when read permission is missing", () => {
    currentUser = {
      ...adminUser,
      permissions: [],
    };

    render(<AmazonAdsAdmin />, { wrapper: MemoryRouter });

    expect(
      screen.getByText(/amazonAds\.config\.read\.any/),
    ).toBeInTheDocument();
    expect(mockUseGetAdminAmazonAdsClientsQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });
});
