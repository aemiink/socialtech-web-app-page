/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type {
  GrowthHubActivityResponse,
  GrowthHubClientsResponse,
  GrowthHubSummary,
} from "../../../features/growthHub/growthHubTypes";
import { GrowthHubCalismaAlani } from "../GrowthHubCalismaAlani";

type QueryOptions = {
  skip?: boolean;
};

const mockUseGetAssignedGrowthHubClientsQuery = vi.fn();
const mockUseGetAssignedGrowthHubClientSummaryQuery = vi.fn();
const mockUseGetAssignedGrowthHubClientActivityQuery = vi.fn();
const mockUseGetAssignedGrowthHubClientActionsQuery = vi.fn();
const mockUseGetAssignedGrowthHubClientWeeklyNotesQuery = vi.fn();
const mockUseCreateAssignedGrowthHubActionMutation = vi.fn();
const mockUseUpdateAssignedGrowthHubActionMutation = vi.fn();
const mockUseDeleteAssignedGrowthHubActionMutation = vi.fn();
const mockUseCreateAssignedGrowthHubWeeklyNoteMutation = vi.fn();
const mockUseUpdateAssignedGrowthHubWeeklyNoteMutation = vi.fn();
const mockMutation = vi.fn(() => ({ unwrap: async () => ({}) }));

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/growthHub/growthHubApi", () => ({
  useGetAssignedGrowthHubClientsQuery: (arg?: void, options?: QueryOptions) =>
    mockUseGetAssignedGrowthHubClientsQuery(arg, options),
  useGetAssignedGrowthHubClientSummaryQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAssignedGrowthHubClientSummaryQuery(clientId, options),
  useGetAssignedGrowthHubClientActivityQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAssignedGrowthHubClientActivityQuery(clientId, options),
  useGetAssignedGrowthHubClientActionsQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAssignedGrowthHubClientActionsQuery(clientId, options),
  useGetAssignedGrowthHubClientWeeklyNotesQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAssignedGrowthHubClientWeeklyNotesQuery(clientId, options),
  useCreateAssignedGrowthHubActionMutation: () => mockUseCreateAssignedGrowthHubActionMutation(),
  useUpdateAssignedGrowthHubActionMutation: () => mockUseUpdateAssignedGrowthHubActionMutation(),
  useDeleteAssignedGrowthHubActionMutation: () => mockUseDeleteAssignedGrowthHubActionMutation(),
  useCreateAssignedGrowthHubWeeklyNoteMutation: () => mockUseCreateAssignedGrowthHubWeeklyNoteMutation(),
  useUpdateAssignedGrowthHubWeeklyNoteMutation: () => mockUseUpdateAssignedGrowthHubWeeklyNoteMutation(),
}));

const projectManagerUser: AuthUserProfile = {
  id: "project-user-id",
  email: "project@socialtech.com",
  displayName: "Project Manager",
  accountType: "EMPLOYEE",
  role: "PROJECT_MANAGER",
  status: "ACTIVE",
  permissions: [
    "growthHub.summary.read.assigned",
    "growthHub.actions.read.assigned",
    "growthHub.actions.manage.assigned",
    "growthHub.notes.read.assigned",
    "growthHub.notes.manage.assigned",
  ],
  clientProfile: null,
};

const growthHubClientsResponse: GrowthHubClientsResponse = {
  data: [
    {
      client: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Acme E-ticaret",
        slug: "acme-e-ticaret",
        status: "ACTIVE",
      },
      serviceStatus: "ACTIVE",
      config: {
        id: "config-1",
        clientProfileId: "11111111-1111-4111-8111-111111111111",
        hasActiveService: true,
        primaryGoal: "ECOMMERCE_SALES",
        targetLeads: 300,
        targetRoas: 4.2,
        targetCpa: 120,
        targetRevenue: 450000,
        reportingDay: "MONDAY",
        notes: "Growth notu",
        status: "ACTIVE",
        createdAt: "2026-05-29T09:00:00.000Z",
        updatedAt: "2026-05-29T10:00:00.000Z",
      },
      state: "READY",
      metrics: {
        activeServices: 2,
        activeChannels: 2,
        projects: 1,
        openTasks: 3,
        overdueTasks: 1,
        openTodos: 2,
        pendingApprovals: 1,
        pendingReportAcknowledgements: 1,
        totalSpend: 100000,
        totalRevenue: 420000,
        totalLeads: 200,
        blendedRoas: 4.2,
        blendedCpa: 110,
      },
      channels: [],
      actions: [],
      meta: {
        generatedAt: "2026-05-29T10:00:00.000Z",
        lastUpdatedAt: "2026-05-29T10:00:00.000Z",
        sources: ["META_ADS"],
      },
    },
  ],
  meta: {
    total: 1,
    ready: 1,
    risk: 0,
    optimize: 0,
    scale: 0,
    waitingConfig: 0,
    pendingApprovals: 1,
    generatedAt: "2026-05-29T10:00:00.000Z",
  },
};

const growthHubSummary: GrowthHubSummary = {
  client: growthHubClientsResponse.data[0].client,
  service: {
    hasActiveService: true,
    status: "ACTIVE",
    startedAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-29T10:00:00.000Z",
  },
  config: growthHubClientsResponse.data[0].config,
  state: "READY",
  dateRange: {
    since: "2026-05-01T00:00:00.000Z",
    until: "2026-05-29T23:59:59.000Z",
  },
  metrics: growthHubClientsResponse.data[0].metrics,
  channels: [
    {
      serviceKey: "META_ADS",
      sourceStatus: "ACTIVE_MODULE",
      status: "READY",
      metrics: {
        spend: 100000,
        revenue: 420000,
        leads: 200,
        impressions: 120000,
        clicks: 2000,
        conversions: 180,
        orders: 90,
        publishedPosts: 0,
        engagement: 0,
        roas: 4.2,
        cpa: 110,
        sourceRecords: 1,
        lastUpdatedAt: "2026-05-29T10:00:00.000Z",
      },
      openTasks: 3,
      pendingApprovals: 1,
      overdueTasks: 1,
      lastUpdatedAt: "2026-05-29T10:00:00.000Z",
    },
  ],
  actions: [
    {
      id: "action-1",
      type: "TASK_APPROVAL",
      title: "Creative onayı bekleniyor",
      serviceKey: "META_ADS",
      project: null,
      dueAt: "2026-05-30T10:00:00.000Z",
      createdAt: "2026-05-29T09:00:00.000Z",
      updatedAt: "2026-05-29T10:00:00.000Z",
    },
    {
      id: "action-2",
      type: "REPORT_ACKNOWLEDGEMENT",
      title: "Haftalık rapor teyidi",
      serviceKey: "GROWTH_HUB",
      project: null,
      dueAt: "2026-05-31T10:00:00.000Z",
      createdAt: "2026-05-29T09:00:00.000Z",
      updatedAt: "2026-05-29T10:00:00.000Z",
    },
  ],
  activity: [],
  meta: {
    generatedAt: "2026-05-29T10:00:00.000Z",
    lastUpdatedAt: "2026-05-29T10:00:00.000Z",
    sources: ["META_ADS"],
  },
};

const growthHubActivity: GrowthHubActivityResponse = {
  data: [
    {
      id: "activity-1",
      type: "MESSAGE",
      title: "Client yeni kreatif istedi",
      serviceKey: "META_ADS",
      project: null,
      occurredAt: "2026-05-29T10:00:00.000Z",
    },
    {
      id: "activity-2",
      type: "TASK",
      title: "Meta optimizasyon görevi güncellendi",
      serviceKey: "META_ADS",
      project: null,
      occurredAt: "2026-05-29T09:00:00.000Z",
    },
  ],
  meta: {
    total: 2,
    generatedAt: "2026-05-29T10:00:00.000Z",
  },
};

function renderWorkspace() {
  render(<GrowthHubCalismaAlani />, { wrapper: MemoryRouter });
}

describe("GrowthHubCalismaAlani", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = projectManagerUser;
    mockUseGetAssignedGrowthHubClientsQuery.mockReturnValue({
      data: growthHubClientsResponse,
      error: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAssignedGrowthHubClientSummaryQuery.mockReturnValue({
      data: growthHubSummary,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAssignedGrowthHubClientActivityQuery.mockReturnValue({
      data: growthHubActivity,
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAssignedGrowthHubClientActionsQuery.mockReturnValue({
      data: { data: growthHubSummary.actions, meta: { total: 2, generatedAt: null } },
      isLoading: false,
    });
    mockUseGetAssignedGrowthHubClientWeeklyNotesQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, generatedAt: null } },
      isLoading: false,
    });
    mockUseCreateAssignedGrowthHubActionMutation.mockReturnValue([mockMutation]);
    mockUseUpdateAssignedGrowthHubActionMutation.mockReturnValue([mockMutation]);
    mockUseDeleteAssignedGrowthHubActionMutation.mockReturnValue([mockMutation]);
    mockUseCreateAssignedGrowthHubWeeklyNoteMutation.mockReturnValue([mockMutation]);
    mockUseUpdateAssignedGrowthHubWeeklyNoteMutation.mockReturnValue([mockMutation]);
  });

  it("renders permission gate without assigned Growth Hub permission", () => {
    currentUser = { ...projectManagerUser, permissions: [] };

    renderWorkspace();

    expect(screen.getByText("Bu ekran için assigned Growth Hub summary yetkisi gerekiyor.")).toBeInTheDocument();
    expect(mockUseGetAssignedGrowthHubClientsQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it("renders assigned clients, channels, actions and messages", () => {
    renderWorkspace();

    expect(screen.getByText("Growth Hub Çalışma Alanı")).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Creative onayı bekleniyor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Haftalık rapor teyidi").length).toBeGreaterThan(0);
    expect(screen.getByText("Client yeni kreatif istedi")).toBeInTheDocument();
    expect(screen.getByText("Meta Ads")).toBeInTheDocument();
  });

  it("keeps approval/report actions disabled without manage permissions", () => {
    currentUser = {
      ...projectManagerUser,
      permissions: ["growthHub.summary.read.assigned", "growthHub.actions.read.assigned"],
    };

    renderWorkspace();

    expect(screen.getByRole("button", { name: "Approval Request" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Report Publish" })).toBeDisabled();
  });
});
