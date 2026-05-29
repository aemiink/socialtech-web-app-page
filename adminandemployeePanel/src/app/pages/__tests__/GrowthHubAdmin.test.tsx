/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type { AdminAssignmentsListResponse } from "../../features/adminAssignments/adminAssignmentsTypes";
import type { UpdateAdminClientGrowthHubConfigRequest } from "../../features/clients/clientsTypes";
import type { GrowthHubClientsResponse } from "../../features/growthHub/growthHubTypes";
import { GrowthHubAdmin } from "../GrowthHubAdmin";

type QueryOptions = {
  skip?: boolean;
};

type GrowthHubClientsQueryResult = {
  data?: GrowthHubClientsResponse;
  error?: unknown;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

type MutationResponse<T> = {
  unwrap: () => Promise<T>;
};

type UpdateConfigTrigger = (payload: {
  clientId: string;
  body: UpdateAdminClientGrowthHubConfigRequest;
}) => MutationResponse<unknown>;

const mockUseGetAdminGrowthHubClientsQuery = vi.fn<
  (arg?: void, options?: QueryOptions) => GrowthHubClientsQueryResult
>();
const mockUseGetAdminAssignmentsQuery = vi.fn<
  (query?: unknown, options?: QueryOptions) => { data?: AdminAssignmentsListResponse; isLoading: boolean }
>();
const mockUseUpdateAdminClientGrowthHubConfigMutation = vi.fn<
  () => [UpdateConfigTrigger, { isLoading: boolean }]
>();
const mockUpdateConfig = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/growthHub/growthHubApi", () => ({
  useGetAdminGrowthHubClientsQuery: (arg?: void, options?: QueryOptions) =>
    mockUseGetAdminGrowthHubClientsQuery(arg, options),
}));

vi.mock("../../features/adminAssignments/adminAssignmentsApi", () => ({
  useGetAdminAssignmentsQuery: (query?: unknown, options?: QueryOptions) =>
    mockUseGetAdminAssignmentsQuery(query, options),
}));

vi.mock("../../features/clients/clientsApi", () => ({
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

const readOnlyAdminUser: AuthUserProfile = {
  ...adminUser,
  permissions: ["growthHub.summary.read.any", "growthHub.config.read.any"],
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
        targetLeads: 320,
        targetRoas: 4.5,
        targetCpa: 125,
        targetRevenue: 500000,
        reportingDay: "MONDAY",
        notes: "Mayıs growth planı",
        status: "ACTIVE",
        createdAt: "2026-05-29T09:00:00.000Z",
        updatedAt: "2026-05-29T10:00:00.000Z",
      },
      state: "RISK",
      metrics: {
        activeServices: 3,
        activeChannels: 2,
        projects: 1,
        openTasks: 6,
        overdueTasks: 2,
        openTodos: 4,
        pendingApprovals: 3,
        pendingReportAcknowledgements: 1,
        totalSpend: 120000,
        totalRevenue: 540000,
        totalLeads: 210,
        blendedRoas: 4.5,
        blendedCpa: 115,
      },
      channels: [
        {
          serviceKey: "META_ADS",
          sourceStatus: "ACTIVE_MODULE",
          status: "RISK",
          metrics: {
            spend: 100000,
            revenue: 450000,
            leads: 180,
            impressions: 100000,
            clicks: 1500,
            conversions: 160,
            orders: 90,
            publishedPosts: 0,
            engagement: 0,
            roas: 4.5,
            cpa: 110,
            sourceRecords: 1,
            lastUpdatedAt: "2026-05-29T10:00:00.000Z",
          },
          openTasks: 4,
          pendingApprovals: 2,
          overdueTasks: 1,
          lastUpdatedAt: "2026-05-29T10:00:00.000Z",
        },
      ],
      actions: [
        {
          id: "action-1",
          type: "TASK_APPROVAL",
          title: "Mayıs optimizasyon onayı",
          serviceKey: "META_ADS",
          project: null,
          dueAt: "2026-05-30T10:00:00.000Z",
          createdAt: "2026-05-29T09:00:00.000Z",
          updatedAt: "2026-05-29T10:00:00.000Z",
        },
      ],
      meta: {
        generatedAt: "2026-05-29T10:00:00.000Z",
        lastUpdatedAt: "2026-05-29T10:00:00.000Z",
        sources: ["META_ADS"],
      },
    },
  ],
  meta: {
    total: 1,
    ready: 0,
    risk: 1,
    optimize: 0,
    scale: 0,
    waitingConfig: 0,
    pendingApprovals: 3,
    generatedAt: "2026-05-29T10:00:00.000Z",
  },
};

function setupListState(overrides: Partial<GrowthHubClientsQueryResult> = {}) {
  mockUseGetAdminGrowthHubClientsQuery.mockReturnValue({
    data: growthHubClientsResponse,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderGrowthHubAdmin() {
  render(<GrowthHubAdmin />, { wrapper: MemoryRouter });
}

describe("GrowthHubAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupListState();
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

  it("skips the list query without Growth Hub admin permission", () => {
    currentUser = null;

    renderGrowthHubAdmin();

    expect(screen.getByText("Bu ekran için Growth Hub admin yetkisi gerekiyor.")).toBeInTheDocument();
    expect(mockUseGetAdminGrowthHubClientsQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it("renders loading state", () => {
    setupListState({ data: undefined, isLoading: true, isFetching: true });

    renderGrowthHubAdmin();

    expect(screen.getByText("Growth Hub müşterileri yükleniyor")).toBeInTheDocument();
  });

  it("renders selected client details and assignment visibility", () => {
    renderGrowthHubAdmin();

    expect(screen.getByText("Growth Hub Operasyonları")).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText("Mayıs optimizasyon onayı")).toBeInTheDocument();
  });

  it("submits Growth Hub config changes", async () => {
    renderGrowthHubAdmin();

    fireEvent.click(screen.getByRole("button", { name: "Config Düzenle" }));
    fireEvent.change(screen.getByLabelText("Target Leads"), {
      target: { value: "420" },
    });
    fireEvent.submit(screen.getByLabelText("Target Leads").closest("form")!);

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          targetLeads: 420,
        }),
      });
    });
  });

  it("disables config edit for read-only admin", () => {
    currentUser = readOnlyAdminUser;

    renderGrowthHubAdmin();

    expect(screen.getByRole("button", { name: "Config Düzenle" })).toBeDisabled();
  });
});
