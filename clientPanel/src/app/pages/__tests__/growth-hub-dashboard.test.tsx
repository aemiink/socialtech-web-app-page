import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLIENT_PORTAL_NAVIGATION_EVENT } from "../../lib/client-portal-navigation";
import { GrowthHubDashboard } from "../services/growth-hub-dashboard";

const mockUseGetClientGrowthHubConfigQuery = vi.fn();
const mockUseGetClientGrowthHubSummaryQuery = vi.fn();
const mockUseGetClientGrowthHubChannelsQuery = vi.fn();
const mockUseGetClientGrowthHubActionsQuery = vi.fn();
const mockUseGetClientGrowthHubWeeklyNotesQuery = vi.fn();
const mockUseGetClientGrowthHubActivityQuery = vi.fn();

vi.mock("../../features/growthHub/growthHubApi", () => ({
  useGetClientGrowthHubConfigQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubConfigQuery(...args),
  useGetClientGrowthHubSummaryQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubSummaryQuery(...args),
  useGetClientGrowthHubChannelsQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubChannelsQuery(...args),
  useGetClientGrowthHubActionsQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubActionsQuery(...args),
  useGetClientGrowthHubWeeklyNotesQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubWeeklyNotesQuery(...args),
  useGetClientGrowthHubActivityQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubActivityQuery(...args),
}));

describe("GrowthHubDashboard", () => {
  beforeEach(() => {
    mockUseGetClientGrowthHubConfigQuery.mockReset();
    mockUseGetClientGrowthHubSummaryQuery.mockReset();
    mockUseGetClientGrowthHubChannelsQuery.mockReset();
    mockUseGetClientGrowthHubActionsQuery.mockReset();
    mockUseGetClientGrowthHubWeeklyNotesQuery.mockReset();
    mockUseGetClientGrowthHubActivityQuery.mockReset();

    mockUseGetClientGrowthHubConfigQuery.mockReturnValue(successQuery(buildConfig()));
    mockUseGetClientGrowthHubSummaryQuery.mockReturnValue(successQuery(buildSummary()));
    mockUseGetClientGrowthHubChannelsQuery.mockReturnValue(
      successQuery({
        data: buildSummary().channels,
        meta: { generatedAt: "2026-06-01T08:00:00.000Z" },
      }),
    );
    mockUseGetClientGrowthHubActionsQuery.mockReturnValue(
      successQuery({
        data: buildSummary().actions,
        meta: { total: 2, generatedAt: "2026-06-01T08:00:00.000Z" },
      }),
    );
    mockUseGetClientGrowthHubWeeklyNotesQuery.mockReturnValue(
      successQuery({
        data: [
          {
            id: "weekly-note-1",
            clientProfileId: "client-1",
            project: null,
            weekStart: "2026-05-25",
            weekEnd: "2026-06-01",
            summary: "Bu hafta müşteri görünür weekly note kaydı.",
            nextFocus: "Landing page tekliflerini güçlendirmek.",
            risks: null,
            clientVisible: true,
            createdBy: null,
            createdAt: "2026-06-01T08:00:00.000Z",
            updatedAt: "2026-06-01T08:00:00.000Z",
          },
        ],
        meta: { total: 1, generatedAt: "2026-06-01T08:00:00.000Z" },
      }),
    );
    mockUseGetClientGrowthHubActivityQuery.mockReturnValue(
      successQuery({
        data: buildSummary().activity,
        meta: { total: 2, generatedAt: "2026-06-01T08:00:00.000Z" },
      }),
    );
  });

  it("renders Growth Hub summary, channel, action and activity data from own-client API hooks", () => {
    render(<GrowthHubDashboard />);

    expect(screen.getByText("Growth & Hub")).toBeInTheDocument();
    expect(screen.getAllByText("52").length).toBeGreaterThan(0);
    expect(screen.getByText("3,4x")).toBeInTheDocument();
    expect(screen.getByText("Meta Ads")).toBeInTheDocument();
    expect(screen.getByText("Google Ads")).toBeInTheDocument();
    expect(screen.getByText("Landing page kreatif onayı")).toBeInTheDocument();
    expect(screen.getAllByText("Bu hafta müşteri görünür weekly note kaydı.").length).toBeGreaterThan(0);
    expect(screen.getByText("Meta kampanya görevi güncellendi")).toBeInTheDocument();
    expect(screen.queryByText("API kaynaklı Growth Hub notu.")).not.toBeInTheDocument();
    expect(screen.queryByText("247")).not.toBeInTheDocument();
    expect(screen.queryByText("₺42K")).not.toBeInTheDocument();
    expect(screen.queryByText("16 içerik planlandı")).not.toBeInTheDocument();
    expect(screen.queryByText("Elif Yılmaz - Growth Lead")).not.toBeInTheDocument();
    expect(screen.queryByText("Automation Active")).not.toBeInTheDocument();
  });

  it("dispatches service navigation from channel detail action", () => {
    const listener = vi.fn();
    window.addEventListener(CLIENT_PORTAL_NAVIGATION_EVENT, listener as EventListener);

    render(<GrowthHubDashboard />);
    fireEvent.click(screen.getAllByText("Detaya Git")[0]);

    const event = listener.mock.calls[0]?.[0] as CustomEvent | undefined;
    expect(event?.detail).toEqual({ serviceId: "meta-ads", page: "service-dashboard" });
    window.removeEventListener(CLIENT_PORTAL_NAVIGATION_EVENT, listener as EventListener);
  });

  it("shows loading state while Growth Hub data is loading", () => {
    mockUseGetClientGrowthHubSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
    });

    render(<GrowthHubDashboard />);

    expect(screen.getByText("Growth Hub verileri yükleniyor")).toBeInTheDocument();
  });

  it("shows API error state when a Growth Hub query fails", () => {
    mockUseGetClientGrowthHubActionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
    });

    render(<GrowthHubDashboard />);

    expect(screen.getByText("Growth Hub verileri alınamadı")).toBeInTheDocument();
  });

  it("shows empty states without falling back to mock dashboard data", () => {
    mockUseGetClientGrowthHubConfigQuery.mockReturnValue(successQuery(null));
    mockUseGetClientGrowthHubSummaryQuery.mockReturnValue(
      successQuery({
        ...buildSummary(),
        config: null,
        state: "NO_DATA" as const,
        metrics: {
          ...buildSummary().metrics,
          activeChannels: 0,
          pendingApprovals: 0,
          openTasks: 0,
          totalLeads: 0,
          totalSpend: 0,
          blendedRoas: 0,
        },
        channels: [],
        actions: [],
        activity: [],
      }),
    );
    mockUseGetClientGrowthHubChannelsQuery.mockReturnValue(
      successQuery({ data: [], meta: { generatedAt: "2026-06-01T08:00:00.000Z" } }),
    );
    mockUseGetClientGrowthHubActionsQuery.mockReturnValue(
      successQuery({ data: [], meta: { total: 0, generatedAt: "2026-06-01T08:00:00.000Z" } }),
    );
    mockUseGetClientGrowthHubWeeklyNotesQuery.mockReturnValue(
      successQuery({ data: [], meta: { total: 0, generatedAt: "2026-06-01T08:00:00.000Z" } }),
    );
    mockUseGetClientGrowthHubActivityQuery.mockReturnValue(
      successQuery({ data: [], meta: { total: 0, generatedAt: "2026-06-01T08:00:00.000Z" } }),
    );

    render(<GrowthHubDashboard />);

    expect(screen.getByText("Aktif Growth Hub kanalı bulunmuyor.")).toBeInTheDocument();
    expect(screen.getByText("Bekleyen müşteri aksiyonu yok.")).toBeInTheDocument();
    expect(screen.getByText("Son aktivite kaydı yok.")).toBeInTheDocument();
    expect(screen.queryByText("247")).not.toBeInTheDocument();
    expect(screen.queryByText("Bu hafta büyüme metriklerinde güçlü bir performans gördük.")).not.toBeInTheDocument();
  });
});

function successQuery<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    isFetching: false,
  };
}

function buildConfig() {
  return {
    id: "growth-config-1",
    clientProfileId: "client-1",
    primaryGoal: "LEAD_GENERATION" as const,
    targetLeads: 80,
    targetRoas: 3.2,
    targetCpa: 450,
    targetRevenue: 240000,
    reportingDay: "MONDAY",
    notes: "API kaynaklı Growth Hub notu.",
    status: "ACTIVE" as const,
    createdAt: "2026-05-28T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
  };
}

function buildSummary() {
  return {
    client: {
      id: "client-1",
      name: "Acme",
      slug: "acme",
      status: "ACTIVE",
    },
    service: {
      hasActiveService: true,
      status: "ACTIVE",
      startedAt: "2026-05-28T00:00:00.000Z",
      updatedAt: "2026-05-28T00:00:00.000Z",
    },
    config: buildConfig(),
    state: "SCALE" as const,
    dateRange: {
      since: "2026-05-25",
      until: "2026-06-01",
    },
    metrics: {
      activeServices: 4,
      activeChannels: 3,
      projects: 2,
      openTasks: 5,
      overdueTasks: 0,
      openTodos: 4,
      pendingApprovals: 2,
      pendingReportAcknowledgements: 1,
      totalSpend: 12400,
      totalRevenue: 42160,
      totalLeads: 52,
      blendedRoas: 3.4,
      blendedCpa: 238.46,
    },
    channels: [
      {
        serviceKey: "META_ADS" as const,
        label: "Meta Ads",
        sourceStatus: "ACTIVE_MODULE" as const,
        status: "SCALE" as const,
        healthScore: 92,
        primaryMetricLabel: "Revenue",
        primaryMetricValue: 31160,
        secondaryMetricLabel: "Harcama",
        secondaryMetricValue: 8200,
        spend: 8200,
        leads: 41,
        conversions: 41,
        revenue: 31160,
        roas: 3.8,
        cpa: 200,
        progressPercent: 75,
        riskLevel: "LOW" as const,
        metrics: {
          spend: 8200,
          revenue: 31160,
          leads: 41,
          impressions: 52000,
          clicks: 2200,
          conversions: 41,
          orders: 0,
          publishedPosts: 0,
          engagement: 0,
          roas: 3.8,
          cpa: 200,
          sourceRecords: 7,
          lastUpdatedAt: "2026-06-01T08:00:00.000Z",
        },
        openTasks: 2,
        openTodos: 4,
        pendingApprovals: 1,
        overdueTasks: 0,
        lastUpdatedAt: "2026-06-01T08:00:00.000Z",
      },
      {
        serviceKey: "GOOGLE_ADS" as const,
        label: "Google Ads",
        sourceStatus: "CONTRACT_ONLY" as const,
        status: "WAITING_CONFIG" as const,
        healthScore: 42,
        primaryMetricLabel: "Kaynak",
        primaryMetricValue: 0,
        secondaryMetricLabel: "Açık iş",
        secondaryMetricValue: 0,
        spend: 0,
        leads: 0,
        conversions: 0,
        revenue: 0,
        roas: 0,
        cpa: 0,
        progressPercent: null,
        riskLevel: "LOW" as const,
        metrics: {
          spend: 0,
          revenue: 0,
          leads: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          orders: 0,
          publishedPosts: 0,
          engagement: 0,
          roas: 0,
          cpa: 0,
          sourceRecords: 0,
          lastUpdatedAt: null,
        },
        openTasks: 0,
        openTodos: 0,
        pendingApprovals: 0,
        overdueTasks: 0,
        lastUpdatedAt: null,
      },
    ],
    actions: [
      {
        id: "task-1",
        type: "TASK_APPROVAL" as const,
        title: "Landing page kreatif onayı",
        serviceKey: "META_ADS" as const,
        project: {
          id: "project-1",
          name: "Growth sprint",
          slug: "growth-sprint",
        },
        dueAt: "2026-06-03T12:00:00.000Z",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
      },
      {
        id: "report-1",
        type: "REPORT_ACKNOWLEDGEMENT" as const,
        title: "Haftalık performans raporu",
        serviceKey: "SOCIAL_MEDIA" as const,
        project: null,
        dueAt: "2026-06-04T12:00:00.000Z",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
      },
    ],
    activity: [
      {
        id: "activity-1",
        type: "TASK" as const,
        title: "Meta kampanya görevi güncellendi",
        serviceKey: "META_ADS" as const,
        project: {
          id: "project-1",
          name: "Growth sprint",
          slug: "growth-sprint",
        },
        occurredAt: "2026-06-01T08:00:00.000Z",
      },
      {
        id: "activity-2",
        type: "MESSAGE" as const,
        title: "Müşteri notu eklendi",
        serviceKey: "SOCIAL_MEDIA" as const,
        project: null,
        occurredAt: "2026-06-01T07:00:00.000Z",
      },
    ],
    meta: {
      generatedAt: "2026-06-01T08:00:00.000Z",
      lastUpdatedAt: "2026-06-01T08:00:00.000Z",
      sources: ["ClientPurchasedService", "Task", "MetaAdsDailyInsight"],
    },
  };
}
