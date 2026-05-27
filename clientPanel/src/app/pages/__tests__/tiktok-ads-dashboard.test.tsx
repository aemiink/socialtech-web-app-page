import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TikTokAdsDashboard } from "../services/tiktok-ads-dashboard";

const mockUseGetOwnTikTokAdsConfigQuery = vi.fn();
const mockUseGetOwnTikTokAdsSummaryQuery = vi.fn();
const mockUseGetOwnTikTokAdsCampaignsQuery = vi.fn();
const mockUseGetOwnTikTokAdsInsightsQuery = vi.fn();
const mockUseSyncOwnTikTokAdsMutation = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();

vi.mock("../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetOwnTikTokAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsConfigQuery(...args),
  useGetOwnTikTokAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsSummaryQuery(...args),
  useGetOwnTikTokAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsCampaignsQuery(...args),
  useGetOwnTikTokAdsInsightsQuery: (...args: unknown[]) => mockUseGetOwnTikTokAdsInsightsQuery(...args),
  useSyncOwnTikTokAdsMutation: (...args: unknown[]) => mockUseSyncOwnTikTokAdsMutation(...args),
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
}));

describe("TikTokAdsDashboard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

    mockUseGetOwnTikTokAdsConfigQuery.mockReset();
    mockUseGetOwnTikTokAdsSummaryQuery.mockReset();
    mockUseGetOwnTikTokAdsCampaignsQuery.mockReset();
    mockUseGetOwnTikTokAdsInsightsQuery.mockReset();
    mockUseSyncOwnTikTokAdsMutation.mockReset();
    mockUseGetClientTasksQuery.mockReset();

    mockUseGetOwnTikTokAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        advertiserId: "1234567890",
        lastSyncAt: "2026-05-09T08:00:00.000Z",
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
      refetch: vi.fn(),
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
      refetch: vi.fn(),
    });
    mockUseGetOwnTikTokAdsInsightsQuery.mockImplementation((query?: { level?: string }) => ({
      data: {
        data: [
          {
            id: `${query?.level ?? "ACCOUNT"}-1`,
            date: "2026-05-08T00:00:00.000Z",
            level: query?.level ?? "ACCOUNT",
            entityId: "entity-1",
            entityName: query?.level === "AD" ? "UGC Creative 01" : "Broad Audience",
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
    mockUseSyncOwnTikTokAdsMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: () => Promise.resolve({ syncStatus: "SUCCESS" }) })),
      { isLoading: false },
    ]);
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows connection issue state when TikTok Ads is not connected", () => {
    mockUseGetOwnTikTokAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "NOT_CONNECTED",
        advertiserId: null,
        lastSyncAt: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<TikTokAdsDashboard />);

    expect(screen.getByText("Bağlantıda sorun var")).toBeInTheDocument();
    expect(screen.getByText("TikTok reklam kampanyaları ve UGC içerik")).toBeInTheDocument();
  });

  it("renders summary KPI cards and campaign list with API data when connected", () => {
    render(<TikTokAdsDashboard />);

    expect(screen.getByText("TikTok Ads")).toBeInTheDocument();
    expect(screen.getByText("UGC Launch")).toBeInTheDocument();
    expect(screen.getAllByText("18.000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
  });

  it("shows reporting error banner when summary/campaign queries fail", () => {
    mockUseGetOwnTikTokAdsSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mockUseGetOwnTikTokAdsCampaignsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<TikTokAdsDashboard />);

    expect(
      screen.getByText("Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin."),
    ).toBeInTheDocument();
  });
});
