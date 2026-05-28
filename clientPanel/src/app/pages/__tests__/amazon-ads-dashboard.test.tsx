/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AmazonAdsDashboard } from "../services/amazon-ads-dashboard";

const mockUseGetOwnAmazonAdsConfigQuery = vi.fn();
const mockUseGetOwnAmazonAdsSummaryQuery = vi.fn();
const mockUseGetOwnAmazonAdsCampaignsQuery = vi.fn();
const mockUseGetOwnAmazonAdsProductsQuery = vi.fn();
const mockUseGetOwnAmazonAdsInsightsQuery = vi.fn();
let refetchSpy = vi.fn();

vi.mock("../../features/amazonAds/amazonAdsApi", () => ({
  useGetOwnAmazonAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsConfigQuery(...args),
  useGetOwnAmazonAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsSummaryQuery(...args),
  useGetOwnAmazonAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsCampaignsQuery(...args),
  useGetOwnAmazonAdsProductsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsProductsQuery(...args),
  useGetOwnAmazonAdsInsightsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsInsightsQuery(...args),
}));

describe("AmazonAdsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refetchSpy = vi.fn(async () => ({}));

    mockUseGetOwnAmazonAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        hasConfig: true,
        profileId: "profile-1",
        advertiserAccountId: "adv-1",
        marketplaceId: "ATVPDKIKX0DER",
        region: "NA",
        countryCode: "US",
        currencyCode: "USD",
        accountName: "Amazon Ads Account",
        lastSyncAt: "2026-05-28T09:30:00.000Z",
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: refetchSpy,
    });

    mockUseGetOwnAmazonAdsSummaryQuery.mockReturnValue({
      data: {
        spend: 250,
        impressions: 12000,
        clicks: 320,
        sales: 1800,
        orders: 48,
        unitsSold: 60,
        ctr: 2.66,
        cpc: 0.78,
        acos: 13.88,
        roas: 7.2,
        conversionRate: 15,
        dateRange: { since: "2026-05-21", until: "2026-05-27" },
        lastSyncAt: "2026-05-28T09:30:00.000Z",
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: refetchSpy,
    });

    mockUseGetOwnAmazonAdsCampaignsQuery.mockReturnValue({
      data: { data: [], dateRange: { since: "2026-05-21", until: "2026-05-27" }, lastSyncAt: null },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: refetchSpy,
    });

    mockUseGetOwnAmazonAdsProductsQuery.mockReturnValue({
      data: { data: [], dateRange: { since: "2026-05-21", until: "2026-05-27" }, lastSyncAt: null },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: refetchSpy,
    });

    mockUseGetOwnAmazonAdsInsightsQuery.mockReturnValue({
      data: {
        data: [],
        level: "SEARCH_TERM",
        dateRange: { since: "2026-05-21", until: "2026-05-27" },
        lastSyncAt: null,
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: refetchSpy,
    });
  });

  it("shows safe connection error state", () => {
    mockUseGetOwnAmazonAdsConfigQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(async () => ({})),
    });

    render(<AmazonAdsDashboard />);

    expect(screen.getByText("Amazon Ads bağlantı durumu alınamadı")).toBeInTheDocument();
    expect(
      screen.getByText("Ajans ekibi bağlantı durumunu kontrol edene kadar performans verileri gösterilmiyor."),
    ).toBeInTheDocument();
  });

  it("applies refresh cooldown after manual refresh", async () => {
    render(<AmazonAdsDashboard />);

    const refreshButton = screen.getByRole("button", { name: "Yenile" });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refetchSpy).toHaveBeenCalled();
    });

    expect(screen.getByRole("button", { name: /Yenile \(\d+s\)/ })).toBeDisabled();
  });
});
