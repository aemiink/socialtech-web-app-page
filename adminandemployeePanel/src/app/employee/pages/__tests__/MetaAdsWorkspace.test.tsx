/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { MetaAdsWorkspace } from "../../components/MetaAdsWorkspace";

let currentUser: AuthUserProfile | null = null;
const mockUseGetClientsQuery = vi.fn();
const mockUseGetAssignedClientMetaAdsSummaryQuery = vi.fn();
const mockUseGetAssignedClientMetaAdsCampaignsQuery = vi.fn();
const mockUseGetAssignedClientMetaAdsAdSetsQuery = vi.fn();
const mockUseGetAssignedClientMetaAdsPixelStatusQuery = vi.fn();
const mockUseGetAssignedClientMetaAdsReportsQuery = vi.fn();
const mockUseCreateAssignedClientMetaAdsReportMutation = vi.fn();
const mockUseUpdateAssignedMetaAdsReportMutation = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetProjectWorkspaceMessagesQuery = vi.fn();
const mockUseCreateProjectWorkspaceMessageMutation = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();
const mockUseUpdateTaskMutation = vi.fn();
const mockUseToggleTaskTodoMutation = vi.fn();

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

vi.mock("../../../features/metaAds/metaAdsApi", () => ({
  useGetAssignedClientMetaAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientMetaAdsSummaryQuery(...args),
  useGetAssignedClientMetaAdsCampaignsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientMetaAdsCampaignsQuery(...args),
  useGetAssignedClientMetaAdsAdSetsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientMetaAdsAdSetsQuery(...args),
  useGetAssignedClientMetaAdsPixelStatusQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientMetaAdsPixelStatusQuery(...args),
  useGetAssignedClientMetaAdsReportsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientMetaAdsReportsQuery(...args),
  useCreateAssignedClientMetaAdsReportMutation: (...args: unknown[]) =>
    mockUseCreateAssignedClientMetaAdsReportMutation(...args),
  useUpdateAssignedMetaAdsReportMutation: (...args: unknown[]) =>
    mockUseUpdateAssignedMetaAdsReportMutation(...args),
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

vi.mock("../../../features/projects/projectsUtils", () => ({
  extractApiErrorMessage: (_error: unknown, fallbackMessage: string) => fallbackMessage,
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
    "metaAds.config.read.assigned",
    "metaAds.reporting.read.assigned",
    "metaAds.notes.manage.assigned",
    "metaAds.approvals.create.assigned",
    "metaAds.creatives.manage.assigned",
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
          id: "client-meta",
          slug: "meta-client",
          companyName: "Meta Client",
          contactEmail: "meta@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-09T08:00:00.000Z",
          updatedAt: "2026-05-09T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "meta-ads", status: "ACTIVE" }],
        },
        {
          id: "client-web",
          slug: "web-client",
          companyName: "Web Client",
          contactEmail: "web@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-09T08:00:00.000Z",
          updatedAt: "2026-05-09T08:00:00.000Z",
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

  mockUseGetAssignedClientMetaAdsSummaryQuery.mockReturnValue({
    data: {
      spend: 1200,
      impressions: 10000,
      reach: 9000,
      clicks: 400,
      ctr: 4,
      cpc: 3,
      cpm: 10,
      frequency: 1.4,
      results: 28,
      costPerResult: 42,
      roas: 3.2,
      dateRange: { since: "2026-05-01", until: "2026-05-08" },
      lastSyncAt: "2026-05-09T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientMetaAdsCampaignsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "cmp-1",
          name: "Prospecting",
          objective: "OUTCOME_SALES",
          status: "ACTIVE",
          effectiveStatus: "ACTIVE",
          spend: 1200,
          impressions: 10000,
          clicks: 400,
          ctr: 4,
          cpc: 3,
          results: 28,
          roas: 3.2,
        },
      ],
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientMetaAdsAdSetsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "adset-1",
          entityName: "Adset 1",
          spend: 600,
          cpm: 11,
          ctr: 3.6,
          costPerResult: 50,
        },
      ],
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientMetaAdsPixelStatusQuery.mockReturnValue({
    data: {
      connectionStatus: "CONNECTED",
      adAccountId: "act-1",
      pixelId: "px-1",
      lastSyncAt: "2026-05-09T07:00:00.000Z",
      lastInsightAt: "2026-05-09T00:00:00.000Z",
      eventStatus: "ACTIVE",
      setupWarning: null,
      syncError: null,
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientMetaAdsReportsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "report-1",
          clientProfileId: "client-meta",
          projectId: "project-meta-1",
          projectName: "Meta Ads Project",
          periodStart: "2026-05-01T00:00:00.000Z",
          periodEnd: "2026-05-07T23:59:59.000Z",
          type: "WEEKLY",
          status: "DRAFT",
          summary: "Haftalık özet",
          metricsSnapshot: null,
          clientVisible: false,
          publishedAt: null,
          acknowledgementRequestedAt: null,
          acknowledgedAt: null,
          acknowledgementStatus: "NOT_REQUESTED",
          acknowledgementTaskId: null,
          acknowledgementTaskUpdatedAt: null,
          createdAt: "2026-05-09T08:00:00.000Z",
          updatedAt: "2026-05-09T08:00:00.000Z",
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
          id: "project-meta-1",
          clientProfileId: "client-meta",
          serviceKey: "meta-ads",
          name: "Meta Ads Project",
          slug: "meta-ads-project",
          description: null,
          status: "IN_PROGRESS",
          priority: "HIGH",
          startDate: null,
          dueDate: null,
          createdAt: "2026-05-09T08:00:00.000Z",
          updatedAt: "2026-05-09T08:00:00.000Z",
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
          projectId: "project-meta-1",
          title: "Onay task",
          description: null,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-1",
          dueDate: null,
          createdAt: "2026-05-09T08:00:00.000Z",
          updatedAt: "2026-05-09T08:00:00.000Z",
          project: null,
          assignee: null,
          todos: [{ id: "todo-1", title: "Kreatif güncelle", isCompleted: false }],
        },
      ],
    },
  });

  mockUseGetProjectWorkspaceMessagesQuery.mockReturnValue({
    data: [{ id: "msg-1", body: "Müşteri mesajı", tabKey: "MESSAGES", projectId: "project-meta-1", authorUserId: "u1", isInternal: false, createdAt: "2026-05-09T08:00:00.000Z", updatedAt: "2026-05-09T08:00:00.000Z" }],
  });

  mockUseCreateTaskMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "task-new" }) })),
    { isLoading: false },
  ]);
  mockUseCreateAssignedClientMetaAdsReportMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "report-new" }) })),
    { isLoading: false },
  ]);
  mockUseUpdateAssignedMetaAdsReportMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: () => Promise.resolve({ id: "report-1" }) })),
    { isLoading: false },
  ]);
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
}

function renderWorkspace(initialView?: Parameters<typeof MetaAdsWorkspace>[0]["initialView"]) {
  render(
    <MemoryRouter>
      <MetaAdsWorkspace initialView={initialView} />
    </MemoryRouter>,
  );
}

describe("MetaAdsWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = { ...baseEmployeeUser };
    setupBaseMocks();
  });

  it("lists only assigned ACTIVE META_ADS clients", () => {
    renderWorkspace("campaigns");

    expect(screen.getByText("Meta Client")).toBeInTheDocument();
    expect(screen.queryByText("Web Client")).not.toBeInTheDocument();
  });

  it("shows performance metrics for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("performance");

    expect(screen.getByText("Performance & Optimization")).toBeInTheDocument();
    expect(screen.getByText("Spend: ₺600,00")).toBeInTheDocument();
  });

  it("shows creative upload action for designer", () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("creatives");

    expect(screen.getByRole("link", { name: "Kreatif Asset Yükle" })).toBeInTheDocument();
  });

  it("hides performance-specific tabs for social media specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "SOCIAL_MEDIA_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Raporlar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Performans" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pixel" })).not.toBeInTheDocument();
  });

  it("shows pixel tab for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Performans" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pixel" })).toBeInTheDocument();
  });

  it("shows permission warning when Meta Ads reporting permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "metaAds.config.read.assigned",
      ),
    };
    renderWorkspace("campaigns");

    expect(
      screen.getByText(
        "Meta Ads raporlarını görüntülemek için `metaAds.config.read.assigned` izni gereklidir.",
      ),
    ).toBeInTheDocument();
  });

  it("disables task create action when manage permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "tasks.manage.assigned",
      ),
    };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Task Oluştur" })).toBeDisabled();
  });

  it("shows empty state when assigned clients have no ACTIVE META_ADS service", () => {
    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-web",
            slug: "web-client",
            companyName: "Web Client",
            contactEmail: "web@client.com",
            status: "ACTIVE",
            createdAt: "2026-05-09T08:00:00.000Z",
            updatedAt: "2026-05-09T08:00:00.000Z",
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
        "Assigned scope içinde `ACTIVE META_ADS` servisi olan müşteri bulunmuyor.",
      ),
    ).toBeInTheDocument();
  });
});
