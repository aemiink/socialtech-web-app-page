import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetaAdsDashboard } from "../services/meta-ads-dashboard";

const mockUseGetOwnMetaAdsConfigQuery = vi.fn();
const mockUseGetOwnMetaAdsSummaryQuery = vi.fn();
const mockUseGetOwnMetaAdsCampaignsQuery = vi.fn();
const mockUseGetOwnMetaAdsInsightsQuery = vi.fn();
const mockUseGetOwnMetaAdsAdSetsQuery = vi.fn();
const mockUseGetOwnMetaAdsPixelStatusQuery = vi.fn();
const mockUseGetOwnMetaAdsReportsQuery = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUseSyncOwnMetaAdsMutation = vi.fn();

vi.mock("../../features/metaAds/metaAdsApi", () => ({
  useGetOwnMetaAdsConfigQuery: () => mockUseGetOwnMetaAdsConfigQuery(),
  useGetOwnMetaAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsSummaryQuery(...args),
  useGetOwnMetaAdsCampaignsQuery: (...args: unknown[]) =>
    mockUseGetOwnMetaAdsCampaignsQuery(...args),
  useGetOwnMetaAdsInsightsQuery: (...args: unknown[]) =>
    mockUseGetOwnMetaAdsInsightsQuery(...args),
  useGetOwnMetaAdsAdSetsQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsAdSetsQuery(...args),
  useGetOwnMetaAdsPixelStatusQuery: (...args: unknown[]) =>
    mockUseGetOwnMetaAdsPixelStatusQuery(...args),
  useGetOwnMetaAdsReportsQuery: (...args: unknown[]) =>
    mockUseGetOwnMetaAdsReportsQuery(...args),
  useSyncOwnMetaAdsMutation: (...args: unknown[]) => mockUseSyncOwnMetaAdsMutation(...args),
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
}));

describe("MetaAdsDashboard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

    mockUseGetOwnMetaAdsConfigQuery.mockReset();
    mockUseGetOwnMetaAdsSummaryQuery.mockReset();
    mockUseGetOwnMetaAdsCampaignsQuery.mockReset();
    mockUseGetOwnMetaAdsInsightsQuery.mockReset();
    mockUseGetOwnMetaAdsAdSetsQuery.mockReset();
    mockUseGetOwnMetaAdsPixelStatusQuery.mockReset();
    mockUseGetOwnMetaAdsReportsQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseSyncOwnMetaAdsMutation.mockReset();

    mockUseGetOwnMetaAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
      },
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
        dateRange: {
          since: "2026-05-07",
          until: "2026-05-08",
        },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "12010000001",
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
        dateRange: {
          since: "2026-05-07",
          until: "2026-05-08",
        },
        lastSyncAt: "2026-05-09T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnMetaAdsInsightsQuery.mockReturnValue({
      data: {
        data: [],
      },
    });
    mockUseGetOwnMetaAdsAdSetsQuery.mockReturnValue({
      data: {
        data: [],
      },
    });
    mockUseGetOwnMetaAdsPixelStatusQuery.mockReturnValue({
      data: {
        pixelId: null,
        adAccountId: null,
        eventStatus: "UNKNOWN",
        setupWarning: null,
        lastInsightAt: null,
      },
    });
    mockUseGetOwnMetaAdsReportsQuery.mockReturnValue({
      data: {
        data: [],
      },
    });
    mockUseGetClientTasksQuery.mockReturnValue([]);
    mockUseSyncOwnMetaAdsMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: () => Promise.resolve({ syncStatus: "SUCCESS" }) })),
      { isLoading: false },
    ]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows connection issue state when Meta Ads is not connected", () => {
    mockUseGetOwnMetaAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "NOT_CONNECTED",
      },
      isLoading: false,
      isError: false,
    });

    render(<MetaAdsDashboard />);

    expect(screen.getByText("Bağlantıda sorun var")).toBeInTheDocument();
    expect(screen.getByText("Facebook ve Instagram reklam performansı")).toBeInTheDocument();
  });

  it("renders summary KPI cards and campaign list with API data when connected", () => {
    render(<MetaAdsDashboard />);

    expect(screen.getByText("Meta Ads")).toBeInTheDocument();
    expect(screen.getAllByText("2.80x").length).toBeGreaterThan(0);
    expect(screen.getByText("Prospecting CBO")).toBeInTheDocument();
    expect(screen.getByText("OUTCOME_SALES")).toBeInTheDocument();
  });

  it("shows reporting error banner when summary/campaign queries fail", () => {
    mockUseGetOwnMetaAdsSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    mockUseGetOwnMetaAdsCampaignsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<MetaAdsDashboard />);

    expect(
      screen.getByText("Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin."),
    ).toBeInTheDocument();
  });
});
