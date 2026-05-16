/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { GoogleAdsWorkspace } from "../../components/GoogleAdsWorkspace";

let currentUser: AuthUserProfile | null = null;
const mockUseGetClientsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsSummaryQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsCampaignsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsKeywordsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsSearchTermsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsConversionsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsAdGroupsQuery = vi.fn();
const mockUseGetAssignedClientGoogleAdsReportsQuery = vi.fn();
const mockUseCreateAssignedClientGoogleAdsReportMutation = vi.fn();
const mockUseUpdateAssignedGoogleAdsReportMutation = vi.fn();
const mockUseSyncAssignedClientGoogleAdsMutation = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetProjectWorkspaceMessagesQuery = vi.fn();
const mockUseCreateProjectWorkspaceMessageMutation = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();

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
}));

vi.mock("../../../features/googleAds/googleAdsApi", () => ({
  useGetAssignedClientGoogleAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsSummaryQuery(...args),
  useGetAssignedClientGoogleAdsCampaignsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsCampaignsQuery(...args),
  useGetAssignedClientGoogleAdsKeywordsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsKeywordsQuery(...args),
  useGetAssignedClientGoogleAdsSearchTermsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsSearchTermsQuery(...args),
  useGetAssignedClientGoogleAdsConversionsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsConversionsQuery(...args),
  useGetAssignedClientGoogleAdsAdGroupsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsAdGroupsQuery(...args),
  useGetAssignedClientGoogleAdsReportsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientGoogleAdsReportsQuery(...args),
  useCreateAssignedClientGoogleAdsReportMutation: (...args: unknown[]) =>
    mockUseCreateAssignedClientGoogleAdsReportMutation(...args),
  useUpdateAssignedGoogleAdsReportMutation: (...args: unknown[]) =>
    mockUseUpdateAssignedGoogleAdsReportMutation(...args),
  useSyncAssignedClientGoogleAdsMutation: (...args: unknown[]) =>
    mockUseSyncAssignedClientGoogleAdsMutation(...args),
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
}));

vi.mock("../../../features/projects/projectsUtils", () => ({
  extractApiErrorMessage: (_error: unknown, fallbackMessage: string) => fallbackMessage,
}));

const baseEmployeeUser: AuthUserProfile = {
  id: "employee-google-ads-1",
  email: "employee@socialtech.com",
  displayName: "Employee User",
  accountType: "EMPLOYEE",
  role: "PERFORMANCE_SPECIALIST",
  status: "ACTIVE",
  permissions: [
    "clients.read.assigned",
    "googleAds.config.read.assigned",
    "googleAds.reporting.read.assigned",
    "googleAds.sync.read.assigned",
    "googleAds.notes.manage.assigned",
    "googleAds.approvals.create.assigned",
    "googleAds.recommendations.manage.assigned",
    "tasks.read.assigned",
    "tasks.manage.assigned",
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
          id: "client-google",
          slug: "google-client",
          companyName: "Google Client",
          contactEmail: "google@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "google-ads", status: "ACTIVE" }],
        },
        {
          id: "client-web",
          slug: "web-client",
          companyName: "Web Client",
          contactEmail: "web@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "web-app", status: "ACTIVE" }],
        },
      ],
    },
    isLoading: false,
    isFetching: false,
  });

  mockUseGetAssignedClientGoogleAdsSummaryQuery.mockReturnValue({
    data: {
      cost: 600,
      impressions: 12000,
      clicks: 320,
      conversions: 35,
      conversionValue: 5200,
      ctr: 2.67,
      averageCpc: 1.88,
      costPerConversion: 17.14,
      dateRange: { since: "2026-05-01", until: "2026-05-15" },
      lastSyncAt: "2026-05-16T07:00:00.000Z",
    },
    isLoading: false,
  });

  mockUseGetAssignedClientGoogleAdsCampaignsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "cmp-1",
          name: "Search Brand",
          channelType: "SEARCH",
          status: "ENABLED",
          servingStatus: "SERVING",
          cost: 600,
          impressions: 12000,
          clicks: 320,
          conversions: 35,
          ctr: 2.67,
          averageCpc: 1.88,
        },
      ],
    },
    isLoading: false,
  });

  mockUseGetAssignedClientGoogleAdsKeywordsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "kw-1",
          keywordText: "marka anahtar kelime",
          matchType: "EXACT",
          campaignName: "Search Brand",
          adGroupName: "Brand",
          status: "ENABLED",
          cost: 300,
          clicks: 100,
          conversions: 15,
          ctr: 3.2,
          averageCpc: 3,
        },
      ],
    },
  });

  mockUseGetAssignedClientGoogleAdsSearchTermsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "st-1",
          searchTerm: "marka reklam",
          campaignName: "Search Brand",
          adGroupName: "Brand",
          keywordText: "marka anahtar kelime",
          cost: 120,
          clicks: 40,
          conversions: 6,
          ctr: 2.1,
        },
      ],
    },
  });

  mockUseGetAssignedClientGoogleAdsConversionsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "conv-1",
          conversionAction: "Satın Alma",
          conversions: 35,
          conversionValue: 5200,
          costPerConversion: 17.14,
          conversionRate: 10.9,
        },
      ],
    },
  });

  mockUseGetAssignedClientGoogleAdsAdGroupsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "ag-1",
          date: "2026-05-15",
          level: "AD_GROUP",
          entityId: "ag-1",
          entityName: "Brand Ad Group",
          cost: 300,
          costMicros: "300000000",
          impressions: 6000,
          clicks: 60,
          interactions: 60,
          conversions: 8,
          conversionValue: 1100,
          ctr: 1,
          averageCpc: 5,
          costPerConversion: 37.5,
          updatedAt: "2026-05-16T07:00:00.000Z",
        },
      ],
    },
  });

  mockUseGetAssignedClientGoogleAdsReportsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "report-1",
          clientProfileId: "client-google",
          projectId: "project-google-1",
          projectName: "Google Ads Project",
          periodStart: "2026-05-01T00:00:00.000Z",
          periodEnd: "2026-05-07T23:59:59.999Z",
          type: "SEARCH_TERMS",
          status: "DRAFT",
          summary: "Search terms eşleşme kalitesi raporu.",
          metricsSnapshot: {
            topSearchTerms: [],
          },
          clientVisible: false,
          publishedAt: null,
          acknowledgementRequestedAt: null,
          acknowledgedAt: null,
          acknowledgementStatus: "NOT_REQUESTED",
          acknowledgementTaskId: null,
          acknowledgementTaskUpdatedAt: null,
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
        },
      ],
      meta: {
        total: 1,
        draft: 1,
        published: 0,
        clientVisible: 0,
      },
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetProjectsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "project-google-1",
          clientProfileId: "client-google",
          serviceKey: "google-ads",
          name: "Google Ads Project",
          slug: "google-ads-project",
          description: null,
          status: "IN_PROGRESS",
          priority: "HIGH",
          startDate: null,
          dueDate: null,
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
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
          projectId: "project-google-1",
          title: "Google Ads onay task",
          description: null,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          approvalRequired: true,
          approvalType: "GOOGLE_ADS_BUDGET_CHANGE_APPROVAL",
          approvalStatus: "PENDING",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-google-ads-1",
          dueDate: null,
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
          project: null,
          assignee: null,
          todos: [],
        },
        {
          id: "task-2",
          projectId: "project-google-1",
          title: "Google Ads creative revizyonu",
          description: null,
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          type: "REVISION",
          approvalRequired: true,
          approvalType: "GOOGLE_ADS_CREATIVE_APPROVAL",
          approvalStatus: "CHANGES_REQUESTED",
          approvalResponseNote: "Banner başlığı güncellensin.",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-google-ads-1",
          dueDate: null,
          createdAt: "2026-05-16T08:00:00.000Z",
          updatedAt: "2026-05-16T08:00:00.000Z",
          project: null,
          assignee: null,
          todos: [],
        },
      ],
    },
  });

  mockUseGetProjectWorkspaceMessagesQuery.mockReturnValue({
    data: [
      {
        id: "msg-1",
        body: "Müşteri rapor sorusu",
        tabKey: "MESSAGES",
        projectId: "project-google-1",
        authorUserId: "u-1",
        isInternal: false,
        createdAt: "2026-05-16T08:00:00.000Z",
        updatedAt: "2026-05-16T08:00:00.000Z",
      },
    ],
  });

  mockUseSyncAssignedClientGoogleAdsMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ success: true }) })),
    { isLoading: false },
  ]);

  mockUseCreateAssignedClientGoogleAdsReportMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "report-new" }) })),
    { isLoading: false },
  ]);

  mockUseUpdateAssignedGoogleAdsReportMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "report-updated" }) })),
    { isLoading: false },
  ]);

  mockUseCreateTaskMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "task-new" }) })),
    { isLoading: false },
  ]);

  mockUseCreateProjectWorkspaceMessageMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "msg-new" }) })),
    { isLoading: false },
  ]);
}

function renderWorkspace(initialView?: Parameters<typeof GoogleAdsWorkspace>[0]["initialView"]) {
  render(
    <MemoryRouter>
      <GoogleAdsWorkspace initialView={initialView} />
    </MemoryRouter>,
  );
}

describe("GoogleAdsWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = { ...baseEmployeeUser };
    setupBaseMocks();
  });

  it("lists only assigned ACTIVE GOOGLE_ADS clients", () => {
    renderWorkspace("campaigns");

    expect(screen.getByText("Google Client")).toBeInTheDocument();
    expect(screen.queryByText("Web Client")).not.toBeInTheDocument();
  });

  it("shows Google Ads metrics for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByText("Performance & Optimization")).toBeInTheDocument();
    expect(screen.getByText("₺600,00")).toBeInTheDocument();
  });

  it("shows Google Ads service workspace for project manager", () => {
    currentUser = { ...baseEmployeeUser, role: "PROJECT_MANAGER" };
    renderWorkspace("tasks");

    expect(screen.getByText("Google Ads Service Workspace")).toBeInTheDocument();
    expect(screen.getByText("Project / Task Workspace")).toBeInTheDocument();
  });

  it("shows creative upload action for designer", () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("design");

    expect(screen.getByRole("link", { name: "Kreatif Asset Yükle" })).toBeInTheDocument();
  });

  it("shows permission warning when Google Ads config permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "googleAds.config.read.assigned",
      ),
    };

    renderWorkspace("overview");

    expect(
      screen.getByText(
        "Google Ads yapılandırmasını görüntülemek için `googleAds.config.read.assigned` izni gereklidir.",
      ),
    ).toBeInTheDocument();
  });

  it("disables task create action when task manage permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "tasks.manage.assigned",
      ),
    };

    renderWorkspace("tasks");

    expect(screen.getByRole("button", { name: "Task Oluştur" })).toBeDisabled();
  });

  it("renders approval type and rejection note in approvals view", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("approvals");

    expect(screen.getByText("Pending approvals: 1")).toBeInTheDocument();
    expect(screen.getByText("Tip: Budget Change")).toBeInTheDocument();
    expect(screen.getByText("Onay Geçmişi")).toBeInTheDocument();
    expect(screen.getByText("Not: Banner başlığı güncellensin.")).toBeInTheDocument();
  });

  it("renders report draft section and search terms report row in reports view", () => {
    currentUser = { ...baseEmployeeUser, role: "PROJECT_MANAGER" };
    renderWorkspace("reports");

    expect(screen.getByRole("button", { name: "Rapor Taslağı Oluştur" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Search Terms Report" })).toBeInTheDocument();
    expect(screen.getByText("Search terms eşleşme kalitesi raporu.")).toBeInTheDocument();
  });

  it("shows empty state when assigned clients have no ACTIVE GOOGLE_ADS service", () => {
    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-web",
            slug: "web-client",
            companyName: "Web Client",
            contactEmail: "web@client.com",
            status: "ACTIVE",
            createdAt: "2026-05-16T08:00:00.000Z",
            updatedAt: "2026-05-16T08:00:00.000Z",
            purchasedServices: [{ serviceKey: "web-app", status: "ACTIVE" }],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    });

    renderWorkspace("overview");

    expect(
      screen.getByText(
        "Assigned scope içinde `ACTIVE GOOGLE_ADS` servisi olan müşteri bulunmuyor.",
      ),
    ).toBeInTheDocument();
  });
});
