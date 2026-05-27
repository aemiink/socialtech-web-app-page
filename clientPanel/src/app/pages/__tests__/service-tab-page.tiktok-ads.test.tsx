import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetOwnTikTokAdsConfigQuery = vi.fn();
const mockUseGetOwnTikTokAdsSummaryQuery = vi.fn();
const mockUseGetOwnTikTokAdsCampaignsQuery = vi.fn();
const mockUseGetOwnTikTokAdsInsightsQuery = vi.fn();
const mockUseGetOwnTikTokAdsReportsQuery = vi.fn();
const mockUseExportOwnTikTokAdsReportMutation = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUpdateClientTaskApproval = vi.fn();
const mockExportOwnTikTokAdsReport = vi.fn();

vi.mock("../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetOwnTikTokAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsConfigQuery(...args),
  useGetOwnTikTokAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsSummaryQuery(...args),
  useGetOwnTikTokAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsCampaignsQuery(...args),
  useGetOwnTikTokAdsInsightsQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsInsightsQuery(...args),
  useGetOwnTikTokAdsReportsQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsReportsQuery(...args),
  useExportOwnTikTokAdsReportMutation: (...args: unknown[]) =>
    mockUseExportOwnTikTokAdsReportMutation(...args),
}));

vi.mock("../../features/metaAds/metaAdsApi", () => ({
  useGetOwnMetaAdsConfigQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsSummaryQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsCampaignsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsAdSetsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsAdsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsInsightsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsPixelStatusQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnMetaAdsReportsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
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
  useUpdateClientTaskApprovalMutation: () => [mockUpdateClientTaskApproval, { isLoading: false }],
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({
    data: {
      data: [
        {
          id: "file-1",
          projectId: "project-1",
          category: "ADS_CREATIVE",
          visibility: "CLIENT_VISIBLE",
          title: "UGC Storyboard",
          secureUrl: "https://cdn.example.com/ugc-storyboard.mp4",
          originalFileName: "ugc-storyboard.mp4",
          bytes: 1024,
          mimeType: "video/mp4",
          approvalRequired: true,
          approvalType: "TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL",
          approvalStatus: "PENDING",
          createdAt: "2026-05-27T10:00:00.000Z",
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

const tiktokTask = {
  id: "task-1",
  projectId: "project-1",
  title: "UGC script revizyonu",
  description: "Hook ve CTA akışı müşteri kontrolünde",
  status: "REVIEW",
  visibility: "CLIENT_VISIBLE",
  priority: "HIGH",
  type: "REVISION",
  workstream: "UI_INTEGRATION",
  dueDate: "2026-05-30T00:00:00.000Z",
  updatedAt: "2026-05-27T10:00:00.000Z",
  projectName: "TikTok Ads Ops",
  projectServiceId: "tiktok-ads",
  approvalRequired: false,
  approvalType: null,
  approvalStatus: null,
  sprint: null,
  completion: {
    totalTodos: 2,
    completedTodos: 1,
    remainingTodos: 1,
    completionPercentage: 50,
  },
  todos: [],
  progressPercent: 50,
};

const tiktokApprovalTask = {
  ...tiktokTask,
  id: "approval-task-1",
  title: "UGC script müşteri onayı",
  description: "Script ve storyboard onayı bekleniyor",
  approvalRequired: true,
  approvalType: "TIKTOK_ADS_UGC_SCRIPT_APPROVAL",
  approvalStatus: "PENDING",
};

const tiktokReport = {
  id: "report-1",
  clientProfileId: "client-1",
  projectId: "project-1",
  projectName: "TikTok Ads Ops",
  periodStart: "2026-05-20T00:00:00.000Z",
  periodEnd: "2026-05-26T23:59:59.999Z",
  type: "WEEKLY",
  status: "PUBLISHED",
  summary: "TikTok haftalık rapor müşteri özeti.",
  metricsSnapshot: { spend: 210 },
  clientVisible: true,
  publishedAt: "2026-05-27T12:00:00.000Z",
  acknowledgementRequestedAt: "2026-05-27T12:00:00.000Z",
  acknowledgedAt: null,
  acknowledgementStatus: "PENDING",
  acknowledgementTaskId: "approval-task-1",
  acknowledgementTaskUpdatedAt: "2026-05-27T12:00:00.000Z",
  createdAt: "2026-05-27T11:00:00.000Z",
  updatedAt: "2026-05-27T12:00:00.000Z",
} as const;

describe("ServiceTabPage TikTok Ads tabs", () => {
  beforeEach(() => {
    mockUseGetOwnTikTokAdsConfigQuery.mockReset();
    mockUseGetOwnTikTokAdsSummaryQuery.mockReset();
    mockUseGetOwnTikTokAdsCampaignsQuery.mockReset();
    mockUseGetOwnTikTokAdsInsightsQuery.mockReset();
    mockUseGetOwnTikTokAdsReportsQuery.mockReset();
    mockUseExportOwnTikTokAdsReportMutation.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUpdateClientTaskApproval.mockReset();
    mockExportOwnTikTokAdsReport.mockReset();
    mockUpdateClientTaskApproval.mockReturnValue({
      unwrap: () => Promise.resolve({ ...tiktokApprovalTask, approvalStatus: "APPROVED" }),
    });
    mockExportOwnTikTokAdsReport.mockReturnValue({
      unwrap: () => Promise.resolve("reportId,summary\nreport-1,TikTok"),
    });
    mockUseExportOwnTikTokAdsReportMutation.mockReturnValue([
      mockExportOwnTikTokAdsReport,
      { isLoading: false },
    ]);

    mockUseGetOwnTikTokAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        hasConfig: true,
        advertiserId: "1234567890",
        lastSyncAt: "2026-05-09T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnTikTokAdsSummaryQuery.mockReturnValue({
      data: {
        spend: 210,
        impressions: 42000,
        reach: 22000,
        clicks: 840,
        ctr: 2,
        cpc: 0.25,
        cpm: 5,
        videoViews: 18000,
        videoViews2s: 15000,
        videoViews6s: 9000,
        videoCompletionRate: 50,
        vtr: 42.86,
        conversions: 42,
        costPerConversion: 5,
        conversionRate: 5,
        purchaseValue: 1200,
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnTikTokAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "campaign-1",
            name: "UGC Launch",
            objective: "REACH",
            status: "ENABLE",
            spend: 210,
            impressions: 42000,
            clicks: 840,
            ctr: 2,
            cpc: 0.25,
            videoViews: 18000,
            conversions: 42,
            costPerConversion: 5,
            purchaseValue: 1200,
          },
        ],
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnTikTokAdsInsightsQuery.mockImplementation((query?: { level?: string }) => ({
      data: {
        data: [
          {
            id: `${query?.level ?? "ACCOUNT"}-1`,
            date: "2026-05-08T00:00:00.000Z",
            level: query?.level ?? "ACCOUNT",
            entityId: "entity-1",
            entityName:
              query?.level === "AD"
                ? "UGC Creative 01"
                : query?.level === "ADGROUP"
                  ? "Broad Audience"
                  : "UGC Launch",
            spend: 90,
            impressions: 18000,
            reach: 9000,
            clicks: 360,
            ctr: 2,
            cpc: 0.25,
            cpm: 5,
            videoViews: 8400,
            videoViews2s: 7000,
            videoViews6s: 4200,
            videoCompletionRate: 50,
            vtr: 46.67,
            conversions: 18,
            costPerConversion: 5,
            conversionRate: 5,
            purchaseValue: 600,
            updatedAt: "2026-05-09T08:00:00.000Z",
          },
        ],
        level: query?.level ?? "ACCOUNT",
        dateRange: { since: "2026-05-07", until: "2026-05-08" },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    }));
    mockUseGetOwnTikTokAdsReportsQuery.mockReturnValue({
      data: {
        data: [tiktokReport],
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
    mockUseGetClientTasksQuery.mockImplementation((query?: { type?: string }) => ({
      data: query?.type === "REVISION" ? [] : [tiktokTask],
      isLoading: false,
      isError: false,
    }));
  });

  it("shows connection state when TikTok Ads is not connected", () => {
    mockUseGetOwnTikTokAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "NOT_CONNECTED",
        hasConfig: false,
        advertiserId: null,
        lastSyncAt: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="tiktok-ads" tabId="campaigns" />);

    expect(screen.getByText("TikTok Ads bağlantısı aktif değil")).toBeInTheDocument();
  });

  it("renders campaigns tab with API data", () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="campaigns" />);

    expect(screen.getByText("UGC Launch")).toBeInTheDocument();
    expect(screen.getAllByText("REACH").length).toBeGreaterThan(0);
  });

  it("renders hook tests from ad-level insight data", () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="hook-tests" />);

    expect(screen.getByText("UGC Creative 01")).toBeInTheDocument();
    expect(screen.getByText("Winning hook")).toBeInTheDocument();
  });

  it("renders pixel tab from connection and conversion snapshot data", () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="pixel-events" />);

    expect(screen.getByText(/Advertiser ID:/i)).toBeInTheDocument();
    expect(screen.getByText("Dönüşüm sinyali var")).toBeInTheDocument();
  });

  it("renders UGC script tab from client-visible task data", () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="ugc-scripts" />);

    expect(screen.getByText("UGC script revizyonu")).toBeInTheDocument();
    expect(screen.getByText("Hook ve CTA akışı müşteri kontrolünde")).toBeInTheDocument();
  });

  it("renders TikTok approval queue and sends approval decisions", async () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [tiktokTask, tiktokApprovalTask],
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="tiktok-ads" tabId="ugc-scripts" />);

    expect(screen.getByText("Bekleyen TikTok Ads onayı: 1")).toBeInTheDocument();
    expect(screen.getByText("UGC Storyboard")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Onayla" }));

    await waitFor(() =>
      expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
        taskId: "approval-task-1",
        body: { approvalStatus: "APPROVED", approvalResponseNote: undefined },
      }),
    );
  });

  it("renders published TikTok Ads reports on optimization notes tab", () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="optimization-notes" />);

    expect(screen.getByText("TikTok haftalık rapor müşteri özeti.")).toBeInTheDocument();
    expect(screen.getByText(/Müşteri Onayı Bekliyor/)).toBeInTheDocument();
  });

  it("exports published TikTok Ads reports from optimization notes tab", async () => {
    render(<ServiceTabPage serviceId="tiktok-ads" tabId="optimization-notes" />);

    fireEvent.click(screen.getByRole("button", { name: "CSV" }));

    await waitFor(() =>
      expect(mockExportOwnTikTokAdsReport).toHaveBeenCalledWith({
        reportId: "report-1",
        format: "csv",
      }),
    );
  });
});
