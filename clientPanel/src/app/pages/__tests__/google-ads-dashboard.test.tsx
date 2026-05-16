import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleAdsDashboard } from "../services/google-ads-dashboard";

const mockUseGetOwnGoogleAdsConfigQuery = vi.fn();
const mockUseGetOwnGoogleAdsSummaryQuery = vi.fn();
const mockUseGetOwnGoogleAdsCampaignsQuery = vi.fn();
const mockUseGetOwnGoogleAdsAdGroupsQuery = vi.fn();
const mockUseGetOwnGoogleAdsAdsQuery = vi.fn();
const mockUseGetOwnGoogleAdsKeywordsQuery = vi.fn();
const mockUseGetOwnGoogleAdsConversionsQuery = vi.fn();
const mockUseGetOwnGoogleAdsSearchTermsQuery = vi.fn();
const mockUseGetOwnGoogleAdsReportsQuery = vi.fn();
const mockUseSyncOwnGoogleAdsMutation = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUseGetClientProjectFilesQuery = vi.fn();
const mockUseUpdateClientTaskApprovalMutation = vi.fn();
const mockUpdateClientTaskApproval = vi.fn();
const mockSyncOwnGoogleAds = vi.fn();
const mockRefetchApprovals = vi.fn();

vi.mock("../../features/googleAds/googleAdsApi", () => ({
  useGetOwnGoogleAdsConfigQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsConfigQuery(...args),
  useGetOwnGoogleAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsSummaryQuery(...args),
  useGetOwnGoogleAdsCampaignsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsCampaignsQuery(...args),
  useGetOwnGoogleAdsAdGroupsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsAdGroupsQuery(...args),
  useGetOwnGoogleAdsAdsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsAdsQuery(...args),
  useGetOwnGoogleAdsKeywordsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsKeywordsQuery(...args),
  useGetOwnGoogleAdsConversionsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsConversionsQuery(...args),
  useGetOwnGoogleAdsSearchTermsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsSearchTermsQuery(...args),
  useGetOwnGoogleAdsReportsQuery: (...args: unknown[]) => mockUseGetOwnGoogleAdsReportsQuery(...args),
  useSyncOwnGoogleAdsMutation: (...args: unknown[]) => mockUseSyncOwnGoogleAdsMutation(...args),
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
  useUpdateClientTaskApprovalMutation: (...args: unknown[]) =>
    mockUseUpdateClientTaskApprovalMutation(...args),
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: (...args: unknown[]) => mockUseGetClientProjectFilesQuery(...args),
}));

vi.mock("../../components/automation-preview", () => ({
  AutomationPreview: () => <div data-testid="automation-preview" />,
}));

describe("GoogleAdsDashboard", () => {
  beforeEach(() => {
    mockUseGetOwnGoogleAdsConfigQuery.mockReset();
    mockUseGetOwnGoogleAdsSummaryQuery.mockReset();
    mockUseGetOwnGoogleAdsCampaignsQuery.mockReset();
    mockUseGetOwnGoogleAdsAdGroupsQuery.mockReset();
    mockUseGetOwnGoogleAdsAdsQuery.mockReset();
    mockUseGetOwnGoogleAdsKeywordsQuery.mockReset();
    mockUseGetOwnGoogleAdsConversionsQuery.mockReset();
    mockUseGetOwnGoogleAdsSearchTermsQuery.mockReset();
    mockUseGetOwnGoogleAdsReportsQuery.mockReset();
    mockUseSyncOwnGoogleAdsMutation.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseGetClientProjectFilesQuery.mockReset();
    mockUseUpdateClientTaskApprovalMutation.mockReset();
    mockUpdateClientTaskApproval.mockReset();
    mockSyncOwnGoogleAds.mockReset();
    mockRefetchApprovals.mockReset();

    mockUseGetOwnGoogleAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        customerId: "1234567890",
        managerCustomerId: "0987654321",
        descriptiveName: "Acme Search Account",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        lastSyncAt: "2026-01-10T08:00:00.000Z",
        syncError: null,
        hasActiveService: true,
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsSummaryQuery.mockReturnValue({
      data: {
        cost: 2500,
        impressions: 120000,
        clicks: 8600,
        conversions: 420,
        conversionValue: 9800,
        ctr: 7.16,
        averageCpc: 0.29,
        costPerConversion: 5.95,
        dateRange: {
          since: "2026-05-09",
          until: "2026-05-16",
        },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "cmp-1",
            name: "Search - Brand",
            channelType: "SEARCH",
            status: "ENABLED",
            servingStatus: "SERVING",
            cost: 1200,
            impressions: 55000,
            clicks: 4100,
            conversions: 230,
            ctr: 7.45,
            averageCpc: 0.29,
          },
        ],
        dateRange: {
          since: "2026-05-09",
          until: "2026-05-16",
        },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsAdGroupsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "ag-1",
            campaignName: "Search - Brand",
            adGroupName: "Brand Core",
            status: "ENABLED",
            cost: 840,
            impressions: 32000,
            clicks: 2500,
            conversions: 140,
            ctr: 7.8,
            averageCpc: 0.34,
          },
        ],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsAdsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "ad-1",
            campaignName: "Search - Brand",
            adGroupName: "Brand Core",
            adName: "Brand RSA 1",
            adType: "RESPONSIVE_SEARCH_AD",
            status: "ENABLED",
            finalUrl: "https://example.com",
            cost: 620,
            impressions: 25000,
            clicks: 1700,
            conversions: 95,
          },
        ],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsKeywordsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "kw-1",
            keywordText: "marka kampanya",
            matchType: "EXACT",
            campaignName: "Search - Brand",
            adGroupName: "Brand Core",
            status: "ENABLED",
            cost: 310,
            clicks: 840,
            conversions: 62,
            ctr: 8.2,
            averageCpc: 0.37,
          },
        ],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsConversionsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "conv-1",
            conversionAction: "Purchase",
            conversions: 58,
            conversionValue: 4200,
            costPerConversion: 7.8,
            conversionRate: 6.9,
          },
        ],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsSearchTermsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "st-1",
            searchTerm: "google reklam ajansı",
            campaignName: "Search - Brand",
            adGroupName: "Brand Core",
            keywordText: "marka kampanya",
            cost: 200,
            clicks: 500,
            conversions: 30,
            ctr: 7.5,
          },
        ],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-01-10T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetOwnGoogleAdsReportsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "report-1",
            clientProfileId: "client-google-1",
            projectId: "project-google-1",
            projectName: "Google Ads Project",
            periodStart: "2026-05-01T00:00:00.000Z",
            periodEnd: "2026-05-07T23:59:59.999Z",
            type: "SEARCH_TERMS",
            status: "PUBLISHED",
            summary: "Arama terimleri optimizasyon raporu.",
            metricsSnapshot: {
              topSearchTerms: [],
            },
            clientVisible: true,
            publishedAt: "2026-05-08T08:00:00.000Z",
            acknowledgementRequestedAt: "2026-05-08T08:05:00.000Z",
            acknowledgedAt: null,
            acknowledgementStatus: "PENDING",
            acknowledgementTaskId: "task-ack-1",
            acknowledgementTaskUpdatedAt: "2026-05-08T08:05:00.000Z",
            createdAt: "2026-05-08T08:00:00.000Z",
            updatedAt: "2026-05-08T08:05:00.000Z",
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

    mockRefetchApprovals.mockResolvedValue([]);

    mockUseGetClientTasksQuery.mockImplementation((query?: { approvalRequired?: boolean }) => {
      if (query?.approvalRequired) {
        return {
          data: [
            {
              id: "approval-1",
              title: "Google Ads bütçe artışı",
              description: "Haftalık bütçe artışı için onay bekleniyor.",
              projectId: "project-google-1",
              projectServiceId: "google-ads",
              approvalRequired: true,
              approvalType: "GOOGLE_ADS_BUDGET_CHANGE_APPROVAL",
              approvalStatus: "PENDING",
            },
            {
              id: "approval-2",
              title: "Mayıs raporu onayı",
              description: "Aylık raporu okuduğunuzu onaylayın.",
              projectId: "project-google-1",
              projectServiceId: "google-ads",
              approvalRequired: true,
              approvalType: "GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT",
              approvalStatus: "PENDING",
            },
            {
              id: "approval-history-1",
              title: "Creative test onayı",
              description: "Creative V2 onayı",
              projectId: "project-google-1",
              projectServiceId: "google-ads",
              approvalRequired: true,
              approvalType: "GOOGLE_ADS_CREATIVE_APPROVAL",
              approvalStatus: "CHANGES_REQUESTED",
              approvalResponseNote: "Headline varyantı güncellensin.",
            },
          ],
          isLoading: false,
          isError: false,
          refetch: mockRefetchApprovals,
        };
      }

      return {
        data: [
          {
            id: "note-1",
            title: "Search term temizliği",
            description: "Negatif keyword listesi güncellendi.",
            projectServiceId: "google-ads",
            approvalRequired: false,
            updatedAt: "2026-05-16T08:00:00.000Z",
          },
        ],
        isLoading: false,
        isError: false,
      };
    });

    mockUseGetClientProjectFilesQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "creative-1",
            projectId: "project-google-1",
            category: "ADS_CREATIVE",
            visibility: "CLIENT_VISIBLE",
            title: "PMax Banner V2",
            description: null,
            secureUrl: "https://cdn.example.com/creative-1.png",
            originalFileName: "pmax-banner-v2.png",
            bytes: 1024,
            mimeType: "image/png",
            approvalRequired: true,
            approvalType: "GOOGLE_ADS_CREATIVE_APPROVAL",
            approvalStatus: "PENDING",
            createdAt: "2026-05-16T08:00:00.000Z",
          },
        ],
        meta: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
    });

    mockUpdateClientTaskApproval.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          id: "approval-updated",
        }),
    }));

    mockUseUpdateClientTaskApprovalMutation.mockReturnValue([
      mockUpdateClientTaskApproval,
      { isLoading: false },
    ]);

    mockSyncOwnGoogleAds.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          success: true,
          syncedAt: "2026-05-16T08:15:00.000Z",
          dateRange: {
            since: "2026-05-09",
            until: "2026-05-16",
          },
          inserted: {
            account: 1,
            campaigns: 1,
            adGroups: 1,
            ads: 1,
            total: 4,
          },
          connectionStatus: "CONNECTED",
          lastSyncAt: "2026-05-16T08:15:00.000Z",
          syncStatus: "SUCCESS",
          skippedReason: null,
        }),
    }));

    mockUseSyncOwnGoogleAdsMutation.mockReturnValue([mockSyncOwnGoogleAds, { isLoading: false }]);
  });

  it("renders loading state while config query is in progress", () => {
    mockUseGetOwnGoogleAdsConfigQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<GoogleAdsDashboard />);

    expect(screen.getByText("Google Ads bağlantı durumu yükleniyor...")).toBeInTheDocument();
  });

  it("renders connection-missing state message", () => {
    mockUseGetOwnGoogleAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "NOT_CONNECTED",
        customerId: null,
        managerCustomerId: null,
        descriptiveName: null,
        currencyCode: null,
        timeZone: null,
        lastSyncAt: null,
        syncError: null,
        hasActiveService: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<GoogleAdsDashboard />);

    expect(screen.getByText("Google Ads bağlantısı bekleniyor")).toBeInTheDocument();
    expect(screen.getByText("Google Ads hesabı henüz bağlanmamış görünüyor.")).toBeInTheDocument();
  });

  it("renders summary endpoint data on overview", () => {
    render(<GoogleAdsDashboard />);

    expect(screen.getByText("Bağlantı aktif")).toBeInTheDocument();
    expect(screen.getByText("Toplam Harcama")).toBeInTheDocument();
    expect(screen.getByText("Kampanya Genel Bakışı")).toBeInTheDocument();
    expect(screen.getByText("Search - Brand")).toBeInTheDocument();
  });

  it("renders ad group list on tab switch", () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Reklam Grupları" }));

    expect(screen.getByText("Brand Core")).toBeInTheDocument();
  });

  it("renders keyword list on tab switch", () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Anahtar Kelimeler" }));

    expect(screen.getByText("marka kampanya")).toBeInTheDocument();
    expect(screen.getByText("EXACT")).toBeInTheDocument();
  });

  it("renders reporting error state", () => {
    mockUseGetOwnGoogleAdsSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<GoogleAdsDashboard />);

    expect(screen.getByText("Rapor verileri alınamadı. Lütfen daha sonra tekrar deneyin.")).toBeInTheDocument();
  });

  it("runs own sync refresh action from dashboard button", async () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Veriyi Yenile" }));

    await waitFor(() => {
      expect(mockSyncOwnGoogleAds).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Google Ads verileri güncellendi.")).toBeInTheDocument();
  });

  it("disables refresh button while rate-limit cooldown is active", () => {
    const nowIso = new Date().toISOString();
    mockUseGetOwnGoogleAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        customerId: "1234567890",
        managerCustomerId: "0987654321",
        descriptiveName: "Acme Search Account",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        lastSyncAt: nowIso,
        syncError: null,
        hasActiveService: true,
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnGoogleAdsSummaryQuery.mockReturnValue({
      data: {
        cost: 2500,
        impressions: 120000,
        clicks: 8600,
        conversions: 420,
        conversionValue: 9800,
        ctr: 7.16,
        averageCpc: 0.29,
        costPerConversion: 5.95,
        dateRange: {
          since: "2026-05-09",
          until: "2026-05-16",
        },
        lastSyncAt: nowIso,
      },
      isLoading: false,
      isError: false,
    });

    render(<GoogleAdsDashboard />);

    const button = screen.getByRole("button", { name: /Yenile \(/ });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Rate limit güvenliği nedeniyle/)).toBeInTheDocument();
  });

  it("shows only safe sync error message for client-facing error state", () => {
    mockUseGetOwnGoogleAdsConfigQuery.mockReturnValue({
      data: {
        connectionStatus: "CONNECTED",
        customerId: "1234567890",
        managerCustomerId: "0987654321",
        descriptiveName: "Acme Search Account",
        currencyCode: "TRY",
        timeZone: "Europe/Istanbul",
        lastSyncAt: "2026-01-10T08:00:00.000Z",
        syncError: "Bağlantı problemi var, ekibimiz ilgileniyor.",
        hasActiveService: true,
      },
      isLoading: false,
      isError: false,
    });

    render(<GoogleAdsDashboard />);

    expect(
      screen.getByText("Son veri güncellemesi tamamlanamadı. Ekibimiz bağlantıyı kontrol ediyor."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/developer token/i)).not.toBeInTheDocument();
  });

  it("switches tab and enables related query", () => {
    render(<GoogleAdsDashboard />);

    expect(mockUseGetOwnGoogleAdsAdGroupsQuery).toHaveBeenLastCalledWith(
      { limit: 50 },
      { skip: true },
    );

    fireEvent.click(screen.getByRole("button", { name: "Reklam Grupları" }));

    expect(mockUseGetOwnGoogleAdsAdGroupsQuery).toHaveBeenLastCalledWith(
      { limit: 50 },
      { skip: false },
    );
  });

  it("renders pending approvals in approvals tab", () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Onaylar" }));

    expect(screen.getByText("Google Ads bütçe artışı")).toBeInTheDocument();
    expect(screen.getByText("Mayıs raporu onayı")).toBeInTheDocument();
    expect(screen.getByText("Creative Preview")).toBeInTheDocument();
    expect(screen.getByText("Onay Geçmişi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Onayla" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Okudum" })).toBeInTheDocument();
  });

  it("renders reports tab rows with search terms report type and acknowledgement status", () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Raporlar" }));

    expect(screen.getByText("Search Terms Report")).toBeInTheDocument();
    expect(screen.getByText("Arama terimleri optimizasyon raporu.")).toBeInTheDocument();
    expect(screen.getByText("Onay: Bekleniyor")).toBeInTheDocument();
  });

  it("renders reports loading state", () => {
    mockUseGetOwnGoogleAdsReportsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(<GoogleAdsDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Raporlar" }));
    expect(screen.getByText("Google Ads raporları yükleniyor...")).toBeInTheDocument();
  });

  it("renders reports error state", () => {
    mockUseGetOwnGoogleAdsReportsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<GoogleAdsDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Raporlar" }));
    expect(screen.getByText("Google Ads raporları alınamadı.")).toBeInTheDocument();
  });

  it("renders reports empty state", () => {
    mockUseGetOwnGoogleAdsReportsQuery.mockReturnValue({
      data: {
        data: [],
        meta: {
          total: 0,
          draft: 0,
          published: 0,
          clientVisible: 0,
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<GoogleAdsDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Raporlar" }));
    expect(screen.getByText("Henüz yayınlanan Google Ads raporu bulunmuyor.")).toBeInTheDocument();
  });

  it("submits approval and acknowledgement actions", async () => {
    render(<GoogleAdsDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Onaylar" }));
    fireEvent.click(screen.getByRole("button", { name: "Onayla" }));

    await waitFor(() => {
      expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
        taskId: "approval-1",
        body: {
          approvalStatus: "APPROVED",
          approvalResponseNote: undefined,
        },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Okudum" }));

    await waitFor(() => {
      expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
        taskId: "approval-2",
        body: {
          approvalStatus: "ACKNOWLEDGED",
          approvalResponseNote: undefined,
        },
      });
    });

    expect(mockRefetchApprovals).toHaveBeenCalled();
  });

  it("does not use mock fallback when campaigns are empty", () => {
    mockUseGetOwnGoogleAdsCampaignsQuery.mockReturnValue({
      data: {
        data: [],
        dateRange: { since: "2026-05-09", until: "2026-05-16" },
        lastSyncAt: "2026-05-16T08:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    });

    render(<GoogleAdsDashboard />);

    expect(screen.getByText("Kampanya verisi henüz bulunamadı.")).toBeInTheDocument();
    expect(screen.queryByText("Search - Brand")).not.toBeInTheDocument();
  });
});
