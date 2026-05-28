/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { AmazonAdsWorkspace } from "../../components/AmazonAdsWorkspace";

let currentUser: AuthUserProfile | null = null;
const mockUseGetClientsQuery = vi.fn();
const mockUseGetAssignedClientAmazonAdsConfigQuery = vi.fn();
const mockUseGetAssignedClientAmazonAdsSummaryQuery = vi.fn();
const mockUseGetAssignedClientAmazonAdsCampaignsQuery = vi.fn();
const mockUseGetAssignedClientAmazonAdsProductsQuery = vi.fn();
const mockUseGetAssignedClientAmazonAdsInsightsQuery = vi.fn();
const mockUseSyncAssignedClientAmazonAdsMutation = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetProjectWorkspaceMessagesQuery = vi.fn();
const mockUseCreateProjectWorkspaceMessageMutation = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();
const mockUseUpdateTaskMutation = vi.fn();
const mockUseToggleTaskTodoMutation = vi.fn();
const mockSyncAssignedAmazonAds = vi.fn();
const mockCreateTask = vi.fn();

vi.mock("../../../store/hooks", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { currentUser },
    }),
}));

vi.mock("../../../features/auth/authSelectors", async () => {
  const actual = await vi.importActual<
    typeof import("../../../features/auth/authSelectors")
  >("../../../features/auth/authSelectors");
  return actual;
});

vi.mock("../../../features/clients/clientsApi", () => ({
  useGetClientsQuery: (...args: unknown[]) => mockUseGetClientsQuery(...args),
  useGetAssignedClientAmazonAdsConfigQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientAmazonAdsConfigQuery(...args),
  useGetAssignedClientAmazonAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientAmazonAdsSummaryQuery(...args),
  useGetAssignedClientAmazonAdsCampaignsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientAmazonAdsCampaignsQuery(...args),
  useGetAssignedClientAmazonAdsProductsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientAmazonAdsProductsQuery(...args),
  useGetAssignedClientAmazonAdsInsightsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientAmazonAdsInsightsQuery(...args),
  useSyncAssignedClientAmazonAdsMutation: (...args: unknown[]) =>
    mockUseSyncAssignedClientAmazonAdsMutation(...args),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
  useGetProjectWorkspaceMessagesQuery: (...args: unknown[]) =>
    mockUseGetProjectWorkspaceMessagesQuery(...args),
  useCreateProjectWorkspaceMessageMutation: (...args: unknown[]) =>
    mockUseCreateProjectWorkspaceMessageMutation(...args),
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: (...args: unknown[]) => mockUseGetTasksQuery(...args),
  useCreateTaskMutation: (...args: unknown[]) => mockUseCreateTaskMutation(...args),
  useUpdateTaskMutation: (...args: unknown[]) => mockUseUpdateTaskMutation(...args),
  useToggleTaskTodoMutation: (...args: unknown[]) => mockUseToggleTaskTodoMutation(...args),
}));

const baseEmployeeUser: AuthUserProfile = {
  id: "employee-1",
  email: "employee@socialtech.com",
  displayName: "Employee User",
  accountType: "EMPLOYEE",
  role: "SOCIAL_MEDIA_SPECIALIST",
  status: "ACTIVE",
  permissions: [
    "clients.read.assigned",
    "amazonAds.config.read.assigned",
    "amazonAds.reporting.read.assigned",
    "amazonAds.notes.manage.assigned",
    "amazonAds.approvals.create.assigned",
    "amazonAds.sync.read.assigned",
    "amazonAds.recommendations.manage.assigned",
    "amazonAds.productCollaboration.manage.assigned",
    "tasks.read.assigned",
    "tasks.manage.assigned",
    "tasks.update.assigned",
    "webapp.workspace.interact.assigned",
    "projects.files.manage.assigned",
  ],
  clientProfile: null,
};

function setupBaseMocks() {
  mockUseGetClientsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "client-amazon",
          slug: "amazon-client",
          companyName: "Amazon Client",
          contactEmail: "amazon@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "amazon-ads", status: "ACTIVE" }],
        },
        {
          id: "client-web",
          slug: "web-client",
          companyName: "Web Client",
          contactEmail: "web@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "web-app", status: "ACTIVE" }],
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });

  mockUseGetAssignedClientAmazonAdsConfigQuery.mockReturnValue({
    data: {
      clientProfileId: "client-amazon",
      connectionStatus: "CONNECTED",
      ids: {
        profileId: "profile-1",
        advertiserAccountId: "adv-1",
        marketplaceId: "A1PA6795UKMFR9",
      },
      account: {
        accountType: "SELLER",
        accountName: "Amazon Advertiser",
        validPaymentMethod: true,
      },
      settings: {
        region: "EU",
        countryCode: "TR",
        currencyCode: "TRY",
        timezone: "Europe/Istanbul",
      },
      lastSyncAt: "2026-05-28T07:00:00.000Z",
      syncError: null,
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientAmazonAdsSummaryQuery.mockReturnValue({
    data: {
      spend: 1200,
      impressions: 10000,
      clicks: 400,
      sales: 6400,
      orders: 112,
      unitsSold: 123,
      ctr: 4,
      cpc: 3,
      acos: 18.75,
      roas: 5.33,
      conversionRate: 6.1,
      dateRange: { since: "2026-05-20", until: "2026-05-28" },
      lastSyncAt: "2026-05-28T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientAmazonAdsCampaignsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "cmp-1",
          name: "Sponsored Products - Brand Defense",
          adProduct: "SPONSORED_PRODUCTS",
          status: "ENABLED",
          spend: 500,
          impressions: 5000,
          clicks: 200,
          sales: 3200,
          orders: 54,
          acos: 15.6,
          roas: 6.4,
        },
      ],
      dateRange: { since: "2026-05-20", until: "2026-05-28" },
      lastSyncAt: "2026-05-28T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientAmazonAdsProductsQuery.mockReturnValue({
    data: {
      data: [
        {
          asin: "B09TEST123",
          sku: "SKU-123",
          title: "Performance Product",
          spend: 200,
          clicks: 80,
          sales: 1400,
          orders: 22,
          acos: 14.28,
          roas: 7,
        },
      ],
      dateRange: { since: "2026-05-20", until: "2026-05-28" },
      lastSyncAt: "2026-05-28T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientAmazonAdsInsightsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "insight-1",
          date: "2026-05-28T00:00:00.000Z",
          level: "SEARCH_TERM",
          entityId: "st-1",
          entityName: "search term",
          adProduct: "SPONSORED_PRODUCTS",
          spend: 120,
          impressions: 1500,
          clicks: 70,
          sales: 780,
          orders: 12,
          unitsSold: 12,
          ctr: 4.6,
          cpc: 1.7,
          acos: 15.3,
          roas: 6.5,
          conversionRate: 5.1,
          campaignId: "cmp-1",
          campaignName: "SP Campaign",
          adGroupId: "ag-1",
          adGroupName: "Brand Terms",
          keywordId: "kw-1",
          keywordText: "brand search",
          keywordType: "BROAD",
          matchType: "BROAD",
          targeting: null,
          searchTerm: "brand search query",
          reportTypeId: "spSearchTerm",
          updatedAt: "2026-05-28T07:00:00.000Z",
        },
      ],
      level: "SEARCH_TERM",
      dateRange: { since: "2026-05-20", until: "2026-05-28" },
      lastSyncAt: "2026-05-28T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetProjectsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "project-amazon-1",
          clientProfileId: "client-amazon",
          serviceKey: "amazon-ads",
          name: "Amazon Ads Project",
          slug: "amazon-ads-project",
          description: null,
          status: "IN_PROGRESS",
          priority: "HIGH",
          startDate: null,
          dueDate: null,
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          clientProfile: null,
        },
      ],
    },
  });

  mockUseGetTasksQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "task-1",
          projectId: "project-amazon-1",
          title: "Amazon approval task",
          description: null,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-1",
          dueDate: null,
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          project: null,
          assignee: null,
          approvalRequired: true,
          approvalType: null,
          todos: [{ id: "todo-1", title: "Creative revision", isCompleted: false }],
        },
      ],
    },
  });

  mockUseGetProjectWorkspaceMessagesQuery.mockReturnValue({
    data: [
      {
        id: "msg-1",
        body: "Müşteri mesajı",
        tabKey: "MESSAGES",
        projectId: "project-amazon-1",
        authorUserId: "u1",
        isInternal: false,
        createdAt: "2026-05-28T08:00:00.000Z",
        updatedAt: "2026-05-28T08:00:00.000Z",
      },
    ],
  });

  mockCreateTask.mockReturnValue({ unwrap: () => Promise.resolve({ id: "task-new" }) });
  mockUseCreateTaskMutation.mockReturnValue([mockCreateTask, { isLoading: false }]);
  mockUseUpdateTaskMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "task-1" }) })),
    { isLoading: false },
  ]);
  mockUseToggleTaskTodoMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "todo-1" }) })),
    { isLoading: false },
  ]);
  mockUseCreateProjectWorkspaceMessageMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "msg-2" }) })),
    { isLoading: false },
  ]);
  mockSyncAssignedAmazonAds.mockReturnValue({
    unwrap: () => Promise.resolve({ success: true, syncStatus: "SKIPPED" }),
  });
  mockUseSyncAssignedClientAmazonAdsMutation.mockReturnValue([
    mockSyncAssignedAmazonAds,
    { isLoading: false },
  ]);
}

function renderWorkspace(initialView?: Parameters<typeof AmazonAdsWorkspace>[0]["initialView"]) {
  render(
    <MemoryRouter>
      <AmazonAdsWorkspace initialView={initialView} />
    </MemoryRouter>,
  );
}

describe("AmazonAdsWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = { ...baseEmployeeUser };
    setupBaseMocks();
  });

  it("lists only assigned ACTIVE AMAZON_ADS clients", () => {
    renderWorkspace("campaigns");

    expect(screen.getByText("Amazon Client")).toBeInTheDocument();
    expect(screen.queryByText("Web Client")).not.toBeInTheDocument();
  });

  it("shows performance metrics for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("products");

    expect(screen.getByText("Performance Aksiyonları")).toBeInTheDocument();
    expect(screen.getByText("Toplam Harcama")).toBeInTheDocument();
    expect(screen.getByText("₺1.200,00")).toBeInTheDocument();
  });

  it("shows creative upload action for designer", () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("creative");

    expect(screen.getByRole("link", { name: "Creative Asset Yükle" })).toBeInTheDocument();
  });

  it("runs assigned sync with sync permission", async () => {
    renderWorkspace("overview");

    fireEvent.click(screen.getByRole("button", { name: "Sync Çalıştır" }));

    await waitFor(() =>
      expect(mockSyncAssignedAmazonAds).toHaveBeenCalledWith({
        clientId: "client-amazon",
      }),
    );
    expect(await screen.findByText("Son senkron çok yeni.")).toBeInTheDocument();
  });

  it("creates amazon approval task with role-based approval type", async () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("overview");

    fireEvent.click(screen.getByRole("button", { name: "Onay Talebi Oluştur" }));

    await waitFor(() =>
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "project-amazon-1",
          approvalRequired: true,
          approvalStatus: "PENDING",
          approvalType: "AMAZON_ADS_BUDGET_CHANGE_APPROVAL",
        }),
      ),
    );
  });

  it("hides products tab for social media specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "SOCIAL_MEDIA_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arama Terimleri" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ürünler / ASIN" })).not.toBeInTheDocument();
  });

  it("disables recommendation action when recommendation permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      role: "PERFORMANCE_SPECIALIST",
      permissions: baseEmployeeUser.permissions.filter(
        (permission) =>
          permission !== "amazonAds.recommendations.manage.assigned" &&
          permission !== "amazonAds.notes.manage.assigned",
      ),
    };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Performance Önerisi" })).toBeDisabled();
  });

  it("shows empty state when assigned clients have no ACTIVE AMAZON_ADS service", () => {
    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-web",
            slug: "web-client",
            companyName: "Web Client",
            contactEmail: "web@client.com",
            status: "ACTIVE",
            createdAt: "2026-05-28T08:00:00.000Z",
            updatedAt: "2026-05-28T08:00:00.000Z",
            purchasedServices: [{ serviceKey: "web-app", status: "ACTIVE" }],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderWorkspace("campaigns");

    expect(
      screen.getByText(
        "Assigned scope içinde `ACTIVE AMAZON_ADS` servisi olan müşteri bulunmuyor.",
      ),
    ).toBeInTheDocument();
  });

  it("shows permission warning when Amazon Ads read permissions are missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "amazonAds.config.read.assigned",
      ),
    };

    renderWorkspace("overview");

    expect(
      screen.getByText(
        "Amazon Ads workspace için `amazonAds.config.read.assigned` ve `amazonAds.reporting.read.assigned` izinleri gereklidir.",
      ),
    ).toBeInTheDocument();
  });
});
