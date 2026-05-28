import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetOwnAmazonAdsConfigQuery = vi.fn();
const mockUseGetOwnAmazonAdsSummaryQuery = vi.fn();
const mockUseGetOwnAmazonAdsCampaignsQuery = vi.fn();
const mockUseGetOwnAmazonAdsProductsQuery = vi.fn();
const mockUseGetOwnAmazonAdsInsightsQuery = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUseUpdateClientTaskApprovalMutation = vi.fn();

vi.mock("../../features/amazonAds/amazonAdsApi", () => ({
  useGetOwnAmazonAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsConfigQuery(...args),
  useGetOwnAmazonAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsSummaryQuery(...args),
  useGetOwnAmazonAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsCampaignsQuery(...args),
  useGetOwnAmazonAdsProductsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsProductsQuery(...args),
  useGetOwnAmazonAdsInsightsQuery: (...args: unknown[]) => mockUseGetOwnAmazonAdsInsightsQuery(...args),
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

vi.mock("../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetOwnTikTokAdsConfigQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnTikTokAdsSummaryQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnTikTokAdsCampaignsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnTikTokAdsInsightsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useGetOwnTikTokAdsReportsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useExportOwnTikTokAdsReportMutation: () => [vi.fn(), { isLoading: false }],
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
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

describe("ServiceTabPage Amazon Ads tabs", () => {
  beforeEach(() => {
    mockUseGetOwnAmazonAdsConfigQuery.mockReset();
    mockUseGetOwnAmazonAdsSummaryQuery.mockReset();
    mockUseGetOwnAmazonAdsCampaignsQuery.mockReset();
    mockUseGetOwnAmazonAdsProductsQuery.mockReset();
    mockUseGetOwnAmazonAdsInsightsQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseUpdateClientTaskApprovalMutation.mockReset();

    mockUseGetOwnAmazonAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        hasConfig: true,
        profileId: "123",
        advertiserAccountId: "456",
        marketplaceId: "ATVPDKIKX0DER",
        region: "NA",
        countryCode: "US",
        currencyCode: "USD",
        accountName: "Amazon NA",
        lastSyncAt: "2026-05-27T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnAmazonAdsSummaryQuery.mockReturnValue({
      data: {
        spend: 520,
        impressions: 28000,
        clicks: 1200,
        sales: 3100,
        orders: 126,
        unitsSold: 190,
        ctr: 4.29,
        cpc: 0.43,
        acos: 16.77,
        roas: 5.96,
        conversionRate: 10.5,
        dateRange: { since: "2026-05-20", until: "2026-05-26" },
        lastSyncAt: "2026-05-27T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnAmazonAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "sp-1",
            name: "SP Scale",
            adProduct: "SPONSORED_PRODUCTS",
            status: "ENABLED",
            spend: 260,
            impressions: 12000,
            clicks: 620,
            sales: 1900,
            orders: 78,
            acos: 13.68,
            roas: 7.31,
          },
          {
            id: "sb-1",
            name: "SB Brand Lift",
            adProduct: "SPONSORED_BRANDS",
            status: "ENABLED",
            spend: 140,
            impressions: 9000,
            clicks: 320,
            sales: 700,
            orders: 28,
            acos: 20,
            roas: 5,
          },
          {
            id: "sd-1",
            name: "SD Retarget",
            adProduct: "SPONSORED_DISPLAY",
            status: "ENABLED",
            spend: 120,
            impressions: 7000,
            clicks: 260,
            sales: 500,
            orders: 20,
            acos: 24,
            roas: 4.17,
          },
        ],
        dateRange: { since: "2026-05-20", until: "2026-05-26" },
        lastSyncAt: "2026-05-27T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnAmazonAdsProductsQuery.mockReturnValue({
      data: {
        data: [
          {
            asin: "B0TEST001",
            sku: "SKU-001",
            title: "Hydration Bottle",
            spend: 210,
            clicks: 410,
            sales: 1620,
            orders: 64,
            acos: 12.96,
            roas: 7.71,
          },
        ],
        dateRange: { since: "2026-05-20", until: "2026-05-26" },
        lastSyncAt: "2026-05-27T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnAmazonAdsInsightsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "ins-1",
            date: "2026-05-26T00:00:00.000Z",
            level: "SEARCH_TERM",
            entityId: "ins-1",
            entityName: "hydration bottle",
            adProduct: "SPONSORED_PRODUCTS",
            spend: 60,
            impressions: 3000,
            clicks: 120,
            sales: 540,
            orders: 18,
            unitsSold: 24,
            ctr: 4,
            cpc: 0.5,
            acos: 11.11,
            roas: 9,
            conversionRate: 15,
            campaignId: "sp-1",
            campaignName: "SP Scale",
            adGroupId: "ag-1",
            adGroupName: "Core Keywords",
            keywordId: "kw-1",
            keywordText: "hydration bottle",
            keywordType: "BROAD",
            matchType: "BROAD",
            targeting: "asin=\"B0TEST001\"",
            searchTerm: "hydration bottle",
            reportTypeId: "spSearchTerm",
            updatedAt: "2026-05-27T10:00:00.000Z",
          },
        ],
        level: "SEARCH_TERM",
        dateRange: { since: "2026-05-20", until: "2026-05-26" },
        lastSyncAt: "2026-05-27T10:00:00.000Z",
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

  it("shows connection state when Amazon Ads is not connected", () => {
    mockUseGetOwnAmazonAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "NOT_CONNECTED",
        hasConfig: false,
        profileId: null,
        advertiserAccountId: null,
        marketplaceId: null,
        region: null,
        countryCode: null,
        currencyCode: null,
        accountName: null,
        lastSyncAt: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="amazon-ads" tabId="campaigns" />);

    expect(screen.getByText("Amazon Ads bağlantısı aktif değil")).toBeInTheDocument();
  });

  it("renders sponsored products tab from API data", () => {
    render(<ServiceTabPage serviceId="amazon-ads" tabId="sponsored-products" />);

    expect(screen.getByText("SP Scale")).toBeInTheDocument();
    expect(screen.getAllByText("Sponsored Products").length).toBeGreaterThan(0);
  });

  it("renders keywords tab using search-term insight context", () => {
    render(<ServiceTabPage serviceId="amazon-ads" tabId="keywords" />);

    expect(screen.getAllByText("hydration bottle").length).toBeGreaterThan(0);
    expect(screen.getByText("BROAD")).toBeInTheDocument();
  });

  it("renders targeting tab using search-term insight context", () => {
    render(<ServiceTabPage serviceId="amazon-ads" tabId="targeting" />);

    expect(screen.getByText('asin="B0TEST001"')).toBeInTheDocument();
    expect(screen.getByText("ASIN")).toBeInTheDocument();
  });

  it("renders approvals tab from task API data", () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "task-1",
          projectId: "project-1",
          title: "Amazon bütçe artışı onayı",
          description: "Q2 scale için bütçe artışı talebi",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "HIGH",
          type: "REVISION",
          workstream: "UI_INTEGRATION",
          dueDate: null,
          updatedAt: "2026-05-27T10:00:00.000Z",
          projectName: "Amazon Ads Ops",
          projectServiceId: "amazon-ads",
          approvalRequired: true,
          approvalType: "AMAZON_ADS_BUDGET_CHANGE_APPROVAL",
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

    render(<ServiceTabPage serviceId="amazon-ads" tabId="approvals" />);

    expect(screen.getByText("Amazon bütçe artışı onayı")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Onayla" })).toBeInTheDocument();
  });

  it("renders report acknowledgement action as Okudum", () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "task-report-1",
          projectId: "project-1",
          title: "Amazon haftalık rapor paylaşımı",
          description: "Haftalık performans raporu paylaşıldı.",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "MEDIUM",
          type: "QA",
          workstream: "QA",
          dueDate: null,
          updatedAt: "2026-05-27T10:00:00.000Z",
          projectName: "Amazon Ads Ops",
          projectServiceId: "amazon-ads",
          approvalRequired: true,
          approvalType: "AMAZON_ADS_REPORT_ACKNOWLEDGEMENT",
          approvalStatus: "PENDING",
          sprint: null,
          completion: null,
          todos: [],
          progressPercent: 100,
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="amazon-ads" tabId="approvals" />);

    expect(screen.getByRole("button", { name: "Okudum" })).toBeInTheDocument();
  });
});
