import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetOwnMetaAdsConfigQuery = vi.fn();
const mockUseGetOwnMetaAdsSummaryQuery = vi.fn();
const mockUseGetOwnMetaAdsCampaignsQuery = vi.fn();
const mockUseGetOwnMetaAdsAdSetsQuery = vi.fn();
const mockUseGetOwnMetaAdsAdsQuery = vi.fn();
const mockUseGetOwnMetaAdsInsightsQuery = vi.fn();
const mockUseGetOwnMetaAdsPixelStatusQuery = vi.fn();
const mockUseGetOwnMetaAdsReportsQuery = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUseUpdateClientTaskApprovalMutation = vi.fn();

vi.mock("../../features/metaAds/metaAdsApi", () => ({
  useGetOwnMetaAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsConfigQuery(...args),
  useGetOwnMetaAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsSummaryQuery(...args),
  useGetOwnMetaAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsCampaignsQuery(...args),
  useGetOwnMetaAdsAdSetsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsAdSetsQuery(...args),
  useGetOwnMetaAdsAdsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsAdsQuery(...args),
  useGetOwnMetaAdsInsightsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsInsightsQuery(...args),
  useGetOwnMetaAdsPixelStatusQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsPixelStatusQuery(...args),
  useGetOwnMetaAdsReportsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsReportsQuery(...args),
}));

vi.mock("../../features/webAppWorkspace/webAppWorkspaceApi", () => ({
  webAppWorkspaceApi: {
    util: {
      updateQueryData: () => ({ type: "mock/updateQueryData" }),
    },
  },
  useGetWebAppWorkspaceQuery: () => ({ data: undefined, isLoading: false }),
  useCreateWebAppWorkspaceMessageMutation: () => [vi.fn(), { isLoading: false }],
  useCreateWebAppWorkspaceRevisionMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateWebAppWorkspaceRevisionStatusMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("../../features/webAppWorkspace/workspaceSocket", () => ({
  createWorkspaceSocket: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        accessToken: "test-token",
        currentUser: { id: "client-1" },
      },
    }),
}));

vi.mock("../../features/auth/authSelectors", () => ({
  selectAccessToken: (state: { auth: { accessToken: string | null } }) => state.auth.accessToken,
  selectCurrentUser: (state: { auth: { currentUser: { id: string } | null } }) => state.auth.currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
  useUpdateClientTaskApprovalMutation: (...args: unknown[]) =>
    mockUseUpdateClientTaskApprovalMutation(...args),
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false }),
}));

describe("ServiceTabPage Meta Ads tabs", () => {
  beforeEach(() => {
    mockUseGetOwnMetaAdsConfigQuery.mockReset();
    mockUseGetOwnMetaAdsSummaryQuery.mockReset();
    mockUseGetOwnMetaAdsCampaignsQuery.mockReset();
    mockUseGetOwnMetaAdsAdSetsQuery.mockReset();
    mockUseGetOwnMetaAdsAdsQuery.mockReset();
    mockUseGetOwnMetaAdsInsightsQuery.mockReset();
    mockUseGetOwnMetaAdsPixelStatusQuery.mockReset();
    mockUseGetOwnMetaAdsReportsQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseUpdateClientTaskApprovalMutation.mockReset();

    mockUseGetOwnMetaAdsConfigQuery.mockReturnValue({
      data: { connectionStatus: "CONNECTED", lastSyncAt: "2026-05-09T10:00:00.000Z" },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsSummaryQuery.mockReturnValue({
      data: {
        spend: 150,
        impressions: 15000,
        reach: 8000,
        clicks: 300,
        ctr: 2,
        cpc: 0.5,
        cpm: 10,
        frequency: 1.88,
        results: 30,
        costPerResult: 5,
        roas: 2.8,
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "cmp-1",
            name: "Prospecting CBO",
            objective: "OUTCOME_SALES",
            status: "ACTIVE",
            effectiveStatus: "ACTIVE",
            spend: 150,
            impressions: 15000,
            clicks: 300,
            ctr: 2,
            cpc: 0.5,
            results: 30,
            roas: 2.8,
          },
        ],
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsAdSetsQuery.mockReturnValue({
      data: {
        data: [],
        level: "ADSET",
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsAdsQuery.mockReturnValue({
      data: {
        data: [],
        level: "AD",
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsInsightsQuery.mockReturnValue({
      data: {
        data: [],
        level: "ACCOUNT",
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsPixelStatusQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        adAccountId: "act-own-001",
        pixelId: "px-own-001",
        lastSyncAt: "2026-05-09T08:00:00.000Z",
        lastInsightAt: "2026-05-09T00:00:00.000Z",
        eventStatus: "ACTIVE",
        setupWarning: null,
        syncError: null,
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsReportsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "report-1",
            clientProfileId: "client-1",
            projectId: "project-1",
            projectName: "Meta Ads Ops",
            periodStart: "2026-05-01T00:00:00.000Z",
            periodEnd: "2026-05-07T23:59:59.000Z",
            type: "WEEKLY",
            status: "PUBLISHED",
            summary: "Haftalık performans raporu yayınlandı.",
            metricsSnapshot: { spend: 1200 },
            clientVisible: true,
            publishedAt: "2026-05-08T09:00:00.000Z",
            acknowledgementRequestedAt: "2026-05-08T09:00:00.000Z",
            acknowledgedAt: null,
            acknowledgementStatus: "PENDING",
            acknowledgementTaskId: "task-1",
            acknowledgementTaskUpdatedAt: "2026-05-08T09:00:00.000Z",
            createdAt: "2026-05-08T09:00:00.000Z",
            updatedAt: "2026-05-08T09:00:00.000Z",
          },
        ],
        meta: {
          total: 1,
          draft: 0,
          published: 1,
          clientVisible: 1,
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseUpdateClientTaskApprovalMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: () => Promise.resolve({}) })),
      { isLoading: false },
    ]);
  });

  it("shows connection state when Meta Ads is not connected", () => {
    mockUseGetOwnMetaAdsConfigQuery.mockReturnValue({
      data: { connectionStatus: "NOT_CONNECTED", lastSyncAt: null },
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="meta-ads" tabId="campaigns" />);

    expect(screen.getByText("Meta Ads bağlantısı aktif değil")).toBeInTheDocument();
  });

  it("shows safe pending state when Meta Ads data is preparing", () => {
    mockUseGetOwnMetaAdsConfigQuery.mockReturnValue({
      data: { connectionStatus: "PENDING", lastSyncAt: null },
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="meta-ads" tabId="campaigns" />);

    expect(screen.getByText("Veriler hazırlanıyor")).toBeInTheDocument();
    expect(
      screen.getByText("Veriler hazırlanıyor, kısa süre içinde dashboard güncellenecek."),
    ).toBeInTheDocument();
  });

  it("renders campaigns tab with API data", () => {
    render(<ServiceTabPage serviceId="meta-ads" tabId="campaigns" />);

    expect(screen.getByText("Prospecting CBO")).toBeInTheDocument();
    expect(screen.getByText("OUTCOME_SALES")).toBeInTheDocument();
  });

  it("renders approvals tab from task API data", () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "task-1",
          projectId: "project-1",
          title: "Kreatif set onayı",
          description: "Yeni kreatifler müşteri onayında",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "HIGH",
          type: "REVISION",
          workstream: "UI_INTEGRATION",
          dueDate: null,
          updatedAt: "2026-05-09T10:00:00.000Z",
          projectName: "Meta Ads Ops",
          projectServiceId: "meta-ads",
          approvalRequired: true,
          approvalType: "META_ADS_CREATIVE_APPROVAL",
          approvalStatus: "PENDING",
          sprint: null,
          completion: null,
          todos: [],
          progressPercent: 70,
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="meta-ads" tabId="approvals" />);

    expect(screen.getByText("Kreatif set onayı")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Kreatif set onayı için onayla" }),
    ).toBeInTheDocument();
  });

  it("renders meta reports tab from report API data", () => {
    render(<ServiceTabPage serviceId="meta-ads" tabId="meta-reports" />);

    expect(screen.getByText("Haftalık performans raporu yayınlandı.")).toBeInTheDocument();
    expect(screen.getByText(/Onay: Müşteri Onayı Bekliyor/i)).toBeInTheDocument();
  });

  it("shows error state on pixel tab when pixel query fails", () => {
    mockUseGetOwnMetaAdsPixelStatusQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<ServiceTabPage serviceId="meta-ads" tabId="pixel-events" />);

    expect(screen.getByText("Pixel/Event durumu alınamadı")).toBeInTheDocument();
  });
});
