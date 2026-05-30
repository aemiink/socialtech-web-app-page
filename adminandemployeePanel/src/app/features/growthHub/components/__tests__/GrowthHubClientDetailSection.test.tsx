/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../auth/authTypes";
import type { AdminAssignmentsListResponse } from "../../../adminAssignments/adminAssignmentsTypes";
import type { UpdateAdminClientGrowthHubConfigRequest } from "../../../clients/clientsTypes";
import type {
  GrowthHubActivityResponse,
  GrowthHubConfig,
  GrowthHubSummary,
} from "../../growthHubTypes";
import { GrowthHubClientDetailSection } from "../GrowthHubClientDetailSection";

type QueryOptions = {
  skip?: boolean;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type UpdateConfigTrigger = (payload: {
  clientId: string;
  body: UpdateAdminClientGrowthHubConfigRequest;
}) => MutationResponse<unknown>;

const mockUseGetAdminGrowthHubClientConfigQuery = vi.fn();
const mockUseGetAdminGrowthHubClientSummaryQuery = vi.fn();
const mockUseGetAdminGrowthHubClientActivityQuery = vi.fn();
const mockUseGetAdminAssignmentsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => { data?: AdminAssignmentsListResponse; isLoading: boolean }
>();
const mockUseUpdateAdminClientGrowthHubConfigMutation = vi.fn<
  () => [UpdateConfigTrigger, { isLoading: boolean }]
>();
const mockUpdateConfig = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../growthHubApi", () => ({
  useGetAdminGrowthHubClientConfigQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAdminGrowthHubClientConfigQuery(clientId, options),
  useGetAdminGrowthHubClientSummaryQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAdminGrowthHubClientSummaryQuery(clientId, options),
  useGetAdminGrowthHubClientActivityQuery: (clientId: string, options?: QueryOptions) =>
    mockUseGetAdminGrowthHubClientActivityQuery(clientId, options),
}));

vi.mock("../../../adminAssignments/adminAssignmentsApi", () => ({
  useGetAdminAssignmentsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminAssignmentsQuery(query, options),
}));

vi.mock("../../../clients/clientsApi", () => ({
  useUpdateAdminClientGrowthHubConfigMutation: () =>
    mockUseUpdateAdminClientGrowthHubConfigMutation(),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: [
    "growthHub.summary.read.any",
    "growthHub.config.read.any",
    "growthHub.config.manage.any",
  ],
  clientProfile: null,
};

const config: GrowthHubConfig = {
  id: "config-1",
  clientProfileId: "11111111-1111-4111-8111-111111111111",
  hasActiveService: true,
  primaryGoal: "ECOMMERCE_SALES",
  targetLeads: 320,
  targetRoas: 4.5,
  targetCpa: 120,
  targetRevenue: 540000,
  reportingDay: "MONDAY",
  notes: "Growth Hub note",
  status: "ACTIVE",
  createdAt: "2026-05-29T09:00:00.000Z",
  updatedAt: "2026-05-29T10:00:00.000Z",
};

const summary: GrowthHubSummary = {
  client: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Acme E-ticaret",
    slug: "acme-e-ticaret",
    status: "ACTIVE",
  },
  service: {
    hasActiveService: true,
    status: "ACTIVE",
    startedAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-29T10:00:00.000Z",
  },
  config,
  state: "RISK",
  dateRange: {
    since: "2026-05-01T00:00:00.000Z",
    until: "2026-05-29T23:59:59.000Z",
  },
  metrics: {
    activeServices: 3,
    activeChannels: 2,
    projects: 1,
    openTasks: 6,
    overdueTasks: 2,
    openTodos: 4,
    pendingApprovals: 2,
    pendingReportAcknowledgements: 1,
    totalSpend: 100000,
    totalRevenue: 540000,
    totalLeads: 220,
    blendedRoas: 4.5,
    blendedCpa: 115,
  },
  channels: [
    {
      serviceKey: "META_ADS",
      label: "Meta Ads",
      sourceStatus: "ACTIVE_MODULE",
      status: "RISK",
      healthScore: 34,
      primaryMetricLabel: "Revenue",
      primaryMetricValue: 540000,
      secondaryMetricLabel: "Harcama",
      secondaryMetricValue: 100000,
      spend: 100000,
      leads: 220,
      conversions: 170,
      revenue: 540000,
      roas: 4.5,
      cpa: 115,
      progressPercent: 50,
      riskLevel: "HIGH",
      metrics: {
        spend: 100000,
        revenue: 540000,
        leads: 220,
        impressions: 110000,
        clicks: 1800,
        conversions: 170,
        orders: 95,
        publishedPosts: 0,
        engagement: 0,
        roas: 4.5,
        cpa: 115,
        sourceRecords: 1,
        lastUpdatedAt: "2026-05-29T10:00:00.000Z",
      },
      openTasks: 4,
      openTodos: 4,
      pendingApprovals: 2,
      overdueTasks: 1,
      lastUpdatedAt: "2026-05-29T10:00:00.000Z",
    },
  ],
  actions: [
    {
      id: "action-1",
      type: "TASK_APPROVAL",
      title: "Mayıs Meta onayı",
      serviceKey: "META_ADS",
      project: null,
      dueAt: "2026-05-30T10:00:00.000Z",
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

const activity: GrowthHubActivityResponse = {
  data: [
    {
      id: "activity-1",
      type: "MESSAGE",
      title: "Client mesaj bıraktı",
      serviceKey: "META_ADS",
      project: null,
      occurredAt: "2026-05-29T10:00:00.000Z",
    },
  ],
  meta: {
    total: 1,
    generatedAt: "2026-05-29T10:00:00.000Z",
  },
};

describe("GrowthHubClientDetailSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    mockUseGetAdminGrowthHubClientConfigQuery.mockReturnValue({
      data: config,
      error: undefined,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminGrowthHubClientSummaryQuery.mockReturnValue({
      data: summary,
      error: undefined,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminGrowthHubClientActivityQuery.mockReturnValue({
      data: activity,
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseGetAdminAssignmentsQuery.mockReturnValue({
      data: [
        {
          id: "assignment-1",
          employeeUserId: "employee-1",
          clientProfileId: "11111111-1111-4111-8111-111111111111",
          scope: "PROJECT",
          isActive: true,
          createdAt: "2026-05-29T09:00:00.000Z",
          updatedAt: "2026-05-29T09:00:00.000Z",
          employee: {
            id: "employee-1",
            email: "project@socialtech.com",
            displayName: "Project Manager",
            role: "PROJECT_MANAGER",
            accountType: "EMPLOYEE",
          },
          client: {
            id: "11111111-1111-4111-8111-111111111111",
            slug: "acme-e-ticaret",
            name: "Acme E-ticaret",
          },
        },
      ],
      isLoading: false,
    });
    mockUpdateConfig.mockReturnValue({ unwrap: async () => ({}) });
    mockUseUpdateAdminClientGrowthHubConfigMutation.mockReturnValue([
      mockUpdateConfig,
      { isLoading: false },
    ]);
  });

  it("renders growth hub summary, channels and assignments", () => {
    render(<GrowthHubClientDetailSection clientProfileId="11111111-1111-4111-8111-111111111111" />);

    expect(screen.getByText("Growth Hub Özeti")).toBeInTheDocument();
    expect(screen.getByText("Mayıs Meta onayı")).toBeInTheDocument();
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getAllByText("Meta Ads").length).toBeGreaterThan(0);
  });

  it("submits config update from detail section", async () => {
    render(<GrowthHubClientDetailSection clientProfileId="11111111-1111-4111-8111-111111111111" />);

    fireEvent.click(screen.getByRole("button", { name: "Config Düzenle" }));
    fireEvent.change(screen.getByLabelText("Target Leads"), {
      target: { value: "500" },
    });
    fireEvent.submit(screen.getByLabelText("Target Leads").closest("form")!);

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          targetLeads: 500,
        }),
      });
    });
  });

  it("hides the section when the client has no active Growth Hub service", () => {
    mockUseGetAdminGrowthHubClientConfigQuery.mockReturnValue({
      data: { ...config, hasActiveService: false },
      error: undefined,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    const { container } = render(
      <GrowthHubClientDetailSection clientProfileId="11111111-1111-4111-8111-111111111111" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
