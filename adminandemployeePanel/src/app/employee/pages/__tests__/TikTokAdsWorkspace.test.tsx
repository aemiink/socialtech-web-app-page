/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { TikTokAdsWorkspace } from "../../components/TikTokAdsWorkspace";

let currentUser: AuthUserProfile | null = null;
const mockUseGetClientsQuery = vi.fn();
const mockUseGetAssignedClientTikTokAdsConfigQuery = vi.fn();
const mockUseGetAssignedClientTikTokAdsSummaryQuery = vi.fn();
const mockUseGetAssignedClientTikTokAdsCampaignsQuery = vi.fn();
const mockUseGetAssignedClientTikTokAdsInsightsQuery = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetProjectWorkspaceMessagesQuery = vi.fn();
const mockUseCreateProjectWorkspaceMessageMutation = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();
const mockUseUpdateTaskMutation = vi.fn();
const mockUseToggleTaskTodoMutation = vi.fn();
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
}));

vi.mock("../../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetAssignedClientTikTokAdsConfigQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientTikTokAdsConfigQuery(...args),
  useGetAssignedClientTikTokAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientTikTokAdsSummaryQuery(...args),
  useGetAssignedClientTikTokAdsCampaignsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientTikTokAdsCampaignsQuery(...args),
  useGetAssignedClientTikTokAdsInsightsQuery: (...args: unknown[]) =>
    mockUseGetAssignedClientTikTokAdsInsightsQuery(...args),
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
    "tiktokAds.config.read.assigned",
    "tasks.read.assigned",
    "tasks.manage.assigned",
    "tasks.update.assigned",
    "webapp.workspace.interact.assigned",
    "projects.files.manage.assigned",
    "tiktokAds.approvals.create.assigned",
    "tiktokAds.creatives.manage.assigned",
  ],
  clientProfile: null,
};

function setupBaseMocks() {
  mockUseGetClientsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "client-tiktok",
          slug: "tiktok-client",
          companyName: "TikTok Client",
          contactEmail: "tiktok@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-27T08:00:00.000Z",
          updatedAt: "2026-05-27T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "tiktok-ads", status: "ACTIVE" }],
        },
        {
          id: "client-web",
          slug: "web-client",
          companyName: "Web Client",
          contactEmail: "web@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-27T08:00:00.000Z",
          updatedAt: "2026-05-27T08:00:00.000Z",
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

  mockUseGetAssignedClientTikTokAdsConfigQuery.mockReturnValue({
    data: {
      id: "config-1",
      clientProfileId: "client-tiktok",
      advertiserId: "adv-1",
      businessCenterId: "bc-1",
      pixelId: "px-1",
      advertiserName: "TikTok Advertiser",
      currency: "TRY",
      timezone: "Europe/Istanbul",
      connectionStatus: "CONNECTED",
      lastSyncAt: "2026-05-27T07:00:00.000Z",
      syncError: null,
      createdAt: "2026-05-27T07:00:00.000Z",
      updatedAt: "2026-05-27T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientTikTokAdsSummaryQuery.mockReturnValue({
    data: {
      spend: 1200,
      impressions: 10000,
      reach: 9000,
      clicks: 400,
      ctr: 4,
      cpc: 3,
      cpm: 10,
      videoViews: 7200,
      videoViews2s: 6100,
      videoViews6s: 3200,
      videoCompletionRate: 44.4,
      vtr: 72,
      conversions: 28,
      costPerConversion: 42,
      conversionRate: 7,
      purchaseValue: 5000,
      dateRange: { since: "2026-05-20", until: "2026-05-27" },
      lastSyncAt: "2026-05-27T07:00:00.000Z",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientTikTokAdsCampaignsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "campaign-1",
          name: "Spark Awareness",
          objective: "REACH",
          status: "ENABLE",
          spend: 1200,
          impressions: 10000,
          clicks: 400,
          ctr: 4,
          cpc: 3,
          videoViews: 7200,
          conversions: 28,
          costPerConversion: 42,
          purchaseValue: 5000,
        },
      ],
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetAssignedClientTikTokAdsInsightsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "insight-1",
          date: "2026-05-27T00:00:00.000Z",
          level: "ADGROUP",
          entityId: "adgroup-1",
          entityName: "Broad Audience",
          spend: 600,
          impressions: 5000,
          reach: 4200,
          clicks: 200,
          ctr: 4,
          cpc: 3,
          cpm: 12,
          videoViews: 3600,
          videoViews2s: 3100,
          videoViews6s: 1700,
          videoCompletionRate: 47.2,
          vtr: 72,
          conversions: 14,
          costPerConversion: 42.86,
          conversionRate: 7,
          purchaseValue: 2500,
          updatedAt: "2026-05-27T07:00:00.000Z",
        },
      ],
      level: "ADGROUP",
    },
    isLoading: false,
    isError: false,
  });

  mockUseGetProjectsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "project-tiktok-1",
          clientProfileId: "client-tiktok",
          serviceKey: "tiktok-ads",
          name: "TikTok Ads Project",
          slug: "tiktok-ads-project",
          description: null,
          status: "IN_PROGRESS",
          priority: "HIGH",
          startDate: null,
          dueDate: null,
          createdAt: "2026-05-27T08:00:00.000Z",
          updatedAt: "2026-05-27T08:00:00.000Z",
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
          projectId: "project-tiktok-1",
          title: "Onay task",
          description: null,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-1",
          dueDate: null,
          createdAt: "2026-05-27T08:00:00.000Z",
          updatedAt: "2026-05-27T08:00:00.000Z",
          project: null,
          assignee: null,
          todos: [{ id: "todo-1", title: "Hook varyasyonu", isCompleted: false }],
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
        projectId: "project-tiktok-1",
        authorUserId: "u1",
        isInternal: false,
        createdAt: "2026-05-27T08:00:00.000Z",
        updatedAt: "2026-05-27T08:00:00.000Z",
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
}

function renderWorkspace(initialView?: Parameters<typeof TikTokAdsWorkspace>[0]["initialView"]) {
  render(
    <MemoryRouter>
      <TikTokAdsWorkspace initialView={initialView} />
    </MemoryRouter>,
  );
}

describe("TikTokAdsWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = { ...baseEmployeeUser };
    setupBaseMocks();
  });

  it("lists only assigned ACTIVE TIKTOK_ADS clients", () => {
    renderWorkspace("campaigns");

    expect(screen.getByText("TikTok Client")).toBeInTheDocument();
    expect(screen.queryByText("Web Client")).not.toBeInTheDocument();
  });

  it("shows performance metrics for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("performance");

    expect(screen.getByText("Performance & Optimization")).toBeInTheDocument();
    expect(screen.getByText("Spend: ₺600,00")).toBeInTheDocument();
  });

  it("shows video upload action for designer", () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("video-creatives");

    expect(screen.getByRole("link", { name: "Video Dosyası Yükle" })).toBeInTheDocument();
  });

  it("creates approval task with TikTok approval metadata", async () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("approvals");

    fireEvent.click(screen.getByRole("button", { name: "Onay Talebi Oluştur" }));

    await waitFor(() =>
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "project-tiktok-1",
          approvalRequired: true,
          approvalType: "TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL",
          approvalStatus: "PENDING",
        }),
      ),
    );
  });

  it("hides performance-specific tabs for social media specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "SOCIAL_MEDIA_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Video Kreatifler" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rapor Notları" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Performans" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pixel" })).not.toBeInTheDocument();
  });

  it("shows pixel tab for performance specialist", () => {
    currentUser = { ...baseEmployeeUser, role: "PERFORMANCE_SPECIALIST" };
    renderWorkspace("overview");

    expect(screen.getByRole("button", { name: "Performans" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pixel" })).toBeInTheDocument();
  });

  it("shows permission warning when TikTok Ads reporting permission is missing", () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "tiktokAds.config.read.assigned",
      ),
    };
    renderWorkspace("campaigns");

    expect(
      screen.getByText(
        "TikTok Ads raporlarını görüntülemek için `tiktokAds.config.read.assigned` izni gereklidir.",
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

  it("shows empty state when assigned clients have no ACTIVE TIKTOK_ADS service", () => {
    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-web",
            slug: "web-client",
            companyName: "Web Client",
            contactEmail: "web@client.com",
            status: "ACTIVE",
            createdAt: "2026-05-27T08:00:00.000Z",
            updatedAt: "2026-05-27T08:00:00.000Z",
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
        "Assigned scope içinde `ACTIVE TIKTOK_ADS` servisi olan müşteri bulunmuyor.",
      ),
    ).toBeInTheDocument();
  });
});
