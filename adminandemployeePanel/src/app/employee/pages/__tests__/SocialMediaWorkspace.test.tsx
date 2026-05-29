/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { SocialMediaWorkspace } from "../../components/SocialMediaWorkspace";

let currentUser: AuthUserProfile | null = null;
const mockUseGetClientsQuery = vi.fn();
const mockUseGetClientSocialMediaSummaryQuery = vi.fn();
const mockUseGetClientSocialMediaPostsQuery = vi.fn();
const mockUseGetClientSocialMediaInsightsQuery = vi.fn();
const mockUseGetClientSocialMediaReportsQuery = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();
const mockCreateTask = vi.fn();
const mockUseUpdateSocialMediaPostMutation = vi.fn();
const mockUpdateSocialMediaPost = vi.fn();
const mockUseCreateSocialMediaPostInsightMutation = vi.fn();
const mockCreateSocialMediaPostInsight = vi.fn();
const mockUseCreateClientSocialMediaReportMutation = vi.fn();
const mockCreateClientSocialMediaReport = vi.fn();
const mockUsePublishSocialMediaReportMutation = vi.fn();
const mockPublishSocialMediaReport = vi.fn();

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

vi.mock("../../../features/socialMedia/socialMediaApi", () => ({
  useGetClientSocialMediaSummaryQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaSummaryQuery(...args),
  useGetClientSocialMediaPostsQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaPostsQuery(...args),
  useGetClientSocialMediaInsightsQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaInsightsQuery(...args),
  useGetClientSocialMediaReportsQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaReportsQuery(...args),
  useUpdateSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseUpdateSocialMediaPostMutation(...args),
  useCreateSocialMediaPostInsightMutation: (...args: unknown[]) =>
    mockUseCreateSocialMediaPostInsightMutation(...args),
  useCreateClientSocialMediaReportMutation: (...args: unknown[]) =>
    mockUseCreateClientSocialMediaReportMutation(...args),
  usePublishSocialMediaReportMutation: (...args: unknown[]) =>
    mockUsePublishSocialMediaReportMutation(...args),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
}));

vi.mock("../../../features/tasks/tasksApi", () => ({
  useGetTasksQuery: (...args: unknown[]) => mockUseGetTasksQuery(...args),
  useCreateTaskMutation: (...args: unknown[]) => mockUseCreateTaskMutation(...args),
}));

vi.mock("../../components/SocialMediaContentCalendar", () => ({
  SocialMediaContentCalendar: ({ scope }: { scope: string }) => (
    <div data-testid="social-media-calendar">Calendar {scope}</div>
  ),
}));

const baseEmployeeUser: AuthUserProfile = {
  id: "employee-1",
  email: "social@socialtech.com",
  displayName: "Social Specialist",
  accountType: "EMPLOYEE",
  role: "SOCIAL_MEDIA_SPECIALIST",
  status: "ACTIVE",
  permissions: [
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "socialMedia.summary.read.assigned",
    "socialMedia.posts.read.assigned",
    "socialMedia.posts.manage.assigned",
    "socialMedia.posts.assets.manage.assigned",
    "socialMedia.creatives.manage.assigned",
    "socialMedia.approvals.create.assigned",
    "socialMedia.reports.manage.assigned",
    "socialMedia.notes.manage.assigned",
    "projects.files.manage.assigned",
    "reports.manage",
  ],
  clientProfile: null,
};

function setupBaseMocks() {
  mockUseGetClientsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "client-social",
          slug: "social-client",
          companyName: "Social Client",
          contactEmail: "social@client.com",
          status: "ACTIVE",
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          purchasedServices: [{ serviceKey: "social-media", status: "ACTIVE" }],
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

  mockUseGetClientSocialMediaSummaryQuery.mockReturnValue({
    data: {
      client: {
        id: "client-social",
        name: "Social Client",
        slug: "social-client",
        status: "ACTIVE",
      },
      service: {
        hasActiveService: true,
        status: "ACTIVE",
        startedAt: null,
        updatedAt: "2026-05-28T08:00:00.000Z",
      },
      config: {
        instagramUsername: "@socialclient",
        instagramAccountId: null,
        facebookPageId: null,
        tiktokUsername: null,
        linkedinPageUrl: null,
        contentFrequency: "Haftada 3 post",
        primaryGoal: "ENGAGEMENT",
        toneOfVoice: "Samimi",
        hashtags: ["#social", "#growth"],
        connectionStatus: "CONNECTED",
        lastSyncAt: "2026-05-28T08:00:00.000Z",
      },
      state: "READY",
      metrics: {
        projects: 1,
        tasks: 2,
        plannedPosts: 4,
        publishedPosts: 1,
        inDesignPosts: 1,
        pendingApprovals: 1,
        rejectedPosts: 0,
        creativeAssets: 1,
        openTodos: 2,
        completedTodos: 3,
      },
      contentPlan: {
        projects: [],
        upcomingPosts: [
          {
            id: "post-1",
            platform: "INSTAGRAM",
            type: "REEL",
            status: "WAITING_APPROVAL",
            title: "Launch Reels",
            scheduledAt: "2026-06-01T08:00:00.000Z",
            publishedAt: null,
            clientVisible: true,
            project: { id: "project-social-1", name: "Social Project", slug: "social-project" },
            updatedAt: "2026-05-28T08:00:00.000Z",
          },
        ],
        recentPosts: [],
        topPosts: [],
      },
      creativeAssets: [
        {
          id: "asset-1",
          title: "Launch Creative",
          category: "ADS_CREATIVE",
          visibility: "CLIENT_VISIBLE",
          secureUrl: "https://cdn.socialtech.test/launch.png",
          mimeType: "image/png",
          approvalStatus: "PENDING",
          project: { id: "project-social-1", name: "Social Project" },
          updatedAt: "2026-05-28T08:00:00.000Z",
        },
      ],
      meta: {
        generatedAt: "2026-05-28T08:00:00.000Z",
        lastUpdatedAt: "2026-05-28T08:00:00.000Z",
        sources: ["Project", "SocialMediaPost"],
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });

  mockUseGetClientSocialMediaPostsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "post-1",
          clientProfileId: "client-social",
          projectId: "project-social-1",
          platform: "INSTAGRAM",
          type: "REEL",
          status: "WAITING_APPROVAL",
          title: "Launch Reels",
          caption: "Yeni lansman duyurusu",
          scheduledAt: "2026-06-01T08:00:00.000Z",
          publishedAt: null,
          clientVisible: true,
          approvalTaskId: null,
          createdByUserId: "employee-1",
          assignedToUserId: null,
          externalPostId: null,
          externalPostUrl: null,
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          project: null,
          approvalTask: null,
          createdBy: null,
          assignedTo: null,
          assets: [],
        },
        {
          id: "post-2",
          clientProfileId: "client-social",
          projectId: "project-social-1",
          platform: "INSTAGRAM",
          type: "STATIC_IMAGE",
          status: "DESIGN",
          title: "Story Design",
          caption: null,
          scheduledAt: "2026-06-03T08:00:00.000Z",
          publishedAt: null,
          clientVisible: false,
          approvalTaskId: null,
          createdByUserId: "employee-1",
          assignedToUserId: null,
          externalPostId: null,
          externalPostUrl: null,
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          project: null,
          approvalTask: null,
          createdBy: null,
          assignedTo: null,
          assets: [],
        },
        {
          id: "post-3",
          clientProfileId: "client-social",
          projectId: "project-social-1",
          platform: "INSTAGRAM",
          type: "REEL",
          status: "PUBLISHED",
          title: "Published Reel",
          caption: "Yayınlandı",
          scheduledAt: "2026-06-04T08:00:00.000Z",
          publishedAt: "2026-06-04T10:00:00.000Z",
          clientVisible: true,
          approvalTaskId: null,
          createdByUserId: "employee-1",
          assignedToUserId: null,
          externalPostId: "ig-post-3",
          externalPostUrl: "https://instagram.com/p/post-3",
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          project: null,
          approvalTask: null,
          createdBy: null,
          assignedTo: null,
          assets: [],
        },
      ],
      meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });

  mockUseGetProjectsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "project-social-1",
          clientProfileId: "client-social",
          serviceKey: "social-media",
          name: "Social Project",
          slug: "social-project",
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
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  });

  mockUseGetTasksQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "task-1",
          projectId: "project-social-1",
          title: "Social approval task",
          description: null,
          status: "REVIEW",
          priority: "HIGH",
          type: "REVISION",
          workstream: "FULLSTACK",
          assigneeUserId: "employee-1",
          dueDate: null,
          createdAt: "2026-05-28T08:00:00.000Z",
          updatedAt: "2026-05-28T08:00:00.000Z",
          project: { id: "project-social-1", name: "Social Project" },
          assignee: null,
          approvalRequired: true,
          approvalStatus: "PENDING",
          todos: [],
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  });

  mockCreateTask.mockReturnValue({ unwrap: () => Promise.resolve({ id: "task-new" }) });
  mockUpdateSocialMediaPost.mockReturnValue({ unwrap: () => Promise.resolve({ id: "post-1" }) });
  mockCreateSocialMediaPostInsight.mockReturnValue({
    unwrap: () => Promise.resolve({ id: "insight-new" }),
  });
  mockCreateClientSocialMediaReport.mockReturnValue({
    unwrap: () => Promise.resolve({ id: "report-new" }),
  });
  mockPublishSocialMediaReport.mockReturnValue({
    unwrap: () => Promise.resolve({ id: "report-1", status: "PUBLISHED" }),
  });
  mockUseCreateTaskMutation.mockReturnValue([mockCreateTask, { isLoading: false }]);
  mockUseUpdateSocialMediaPostMutation.mockReturnValue([
    mockUpdateSocialMediaPost,
    { isLoading: false },
  ]);
  mockUseGetClientSocialMediaInsightsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "insight-1",
          postId: "post-3",
          clientProfileId: "client-social",
          platform: "INSTAGRAM",
          date: "2026-06-05T00:00:00.000Z",
          impressions: 1200,
          reach: 900,
          likes: 120,
          comments: 12,
          shares: 8,
          saves: 15,
          profileVisits: 20,
          follows: 5,
          clicks: 30,
          engagementRate: 20.56,
          raw: null,
          createdAt: "2026-06-05T00:00:00.000Z",
          updatedAt: "2026-06-05T00:00:00.000Z",
          post: {
            id: "post-3",
            title: "Published Reel",
            type: "REEL",
            status: "PUBLISHED",
            scheduledAt: "2026-06-04T08:00:00.000Z",
            publishedAt: "2026-06-04T10:00:00.000Z",
            externalPostUrl: "https://instagram.com/p/post-3",
            clientVisible: true,
          },
        },
      ],
      meta: {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
        generatedAt: "2026-06-05T00:00:00.000Z",
        totals: {
          impressions: 1200,
          reach: 900,
          likes: 120,
          comments: 12,
          shares: 8,
          saves: 15,
          profileVisits: 20,
          follows: 5,
          clicks: 30,
          engagementRate: 20.56,
        },
        topPosts: [],
        platformBreakdown: [],
        typeBreakdown: [],
        trend: [],
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });
  mockUseGetClientSocialMediaReportsQuery.mockReturnValue({
    data: {
      data: [
        {
          id: "report-1",
          clientProfileId: "client-social",
          projectId: "project-social-1",
          projectName: "Social Project",
          periodStart: "2026-06-01T00:00:00.000Z",
          periodEnd: "2026-06-07T23:59:59.999Z",
          type: "WEEKLY",
          status: "DRAFT",
          summary: "Haftalık performans taslağı.",
          metricsSnapshot: null,
          clientVisible: false,
          publishedAt: null,
          acknowledgementRequestedAt: null,
          acknowledgedAt: null,
          acknowledgementStatus: "NOT_REQUESTED",
          acknowledgementTaskId: null,
          acknowledgementTaskUpdatedAt: null,
          createdAt: "2026-06-05T00:00:00.000Z",
          updatedAt: "2026-06-05T00:00:00.000Z",
        },
      ],
      meta: {
        page: 1,
        limit: 30,
        total: 1,
        totalPages: 1,
        draft: 1,
        published: 0,
        clientVisible: 0,
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  });
  mockUseCreateSocialMediaPostInsightMutation.mockReturnValue([
    mockCreateSocialMediaPostInsight,
    { isLoading: false },
  ]);
  mockUseCreateClientSocialMediaReportMutation.mockReturnValue([
    mockCreateClientSocialMediaReport,
    { isLoading: false },
  ]);
  mockUsePublishSocialMediaReportMutation.mockReturnValue([
    mockPublishSocialMediaReport,
    { isLoading: false },
  ]);
}

function renderWorkspace(initialView?: Parameters<typeof SocialMediaWorkspace>[0]["initialView"]) {
  render(
    <MemoryRouter>
      <SocialMediaWorkspace initialView={initialView} />
    </MemoryRouter>,
  );
}

describe("SocialMediaWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = { ...baseEmployeeUser };
    setupBaseMocks();
  });

  it("lists only assigned ACTIVE Social Media clients", () => {
    renderWorkspace("overview");

    const clientSelect = screen.getByRole("combobox", { name: "Social Media müşterisi" });
    expect(clientSelect).toHaveValue("client-social");
    expect(within(clientSelect).getByRole("option", { name: "Social Client" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Web Client" })).not.toBeInTheDocument();
  });

  it("shows creative upload action for designer", async () => {
    currentUser = { ...baseEmployeeUser, role: "DESIGNER" };
    renderWorkspace("creatives");

    expect(await screen.findByRole("link", { name: "Creative Asset Yükle" })).toBeInTheDocument();
  });

  it("opens the Project Manager workspace view", async () => {
    currentUser = { ...baseEmployeeUser, role: "PROJECT_MANAGER" };
    renderWorkspace("overview");

    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(await screen.findByText("Planlı Post")).toBeInTheDocument();
  });

  it("renders the embedded calendar view", async () => {
    renderWorkspace("calendar");

    expect(await screen.findByTestId("social-media-calendar")).toHaveTextContent(
      "Calendar employee",
    );
  });

  it("renders report workspace and creates insight/report actions", async () => {
    renderWorkspace("reports");

    expect(await screen.findByText("Performans Snapshot")).toBeInTheDocument();
    expect(screen.getAllByText("Published Reel").length).toBeGreaterThan(0);
    expect(screen.getByText("Haftalık performans taslağı.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Snapshot Kaydet" }));
    await waitFor(() => expect(mockCreateSocialMediaPostInsight).toHaveBeenCalled());
    expect(mockCreateSocialMediaPostInsight.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        id: "post-3",
        clientId: "client-social",
      }),
    );

    fireEvent.change(screen.getByLabelText("Özet"), {
      target: { value: "Yeni rapor özeti" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rapor Oluştur" }));
    await waitFor(() => expect(mockCreateClientSocialMediaReport).toHaveBeenCalled());
    expect(mockCreateClientSocialMediaReport.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        clientId: "client-social",
        body: expect.objectContaining({
          summary: "Yeni rapor özeti",
          type: "WEEKLY",
        }),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Yayınla" }));
    await waitFor(() => expect(mockPublishSocialMediaReport).toHaveBeenCalledWith({
      id: "report-1",
      clientId: "client-social",
    }));
  });

  it("creates a Social Media approval task with assigned approval permission", async () => {
    renderWorkspace("approvals");

    fireEvent.click(await screen.findByRole("button", { name: "Onay Talebi Oluştur" }));

    await waitFor(() => expect(mockCreateTask).toHaveBeenCalled());
    const payload = mockCreateTask.mock.calls[0]?.[0];
    expect(payload).toEqual(
      expect.objectContaining({
        projectId: "project-social-1",
        approvalRequired: true,
        approvalStatus: "PENDING",
        approvalType: "SOCIAL_MEDIA_CALENDAR_APPROVAL",
      }),
    );
  });

  it("creates a linked post approval task and marks the post client-visible", async () => {
    renderWorkspace("approvals");

    fireEvent.click(await screen.findByRole("button", { name: "Post Onayına Gönder" }));

    await waitFor(() => expect(mockCreateTask).toHaveBeenCalled());
    expect(mockCreateTask.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        projectId: "project-social-1",
        approvalRequired: true,
        approvalStatus: "PENDING",
        approvalType: "SOCIAL_MEDIA_POST_APPROVAL",
        title: "Launch Reels onayı",
      }),
    );
    await waitFor(() => expect(mockUpdateSocialMediaPost).toHaveBeenCalled());
    expect(mockUpdateSocialMediaPost.mock.calls[0]?.[0]).toEqual({
      id: "post-1",
      clientId: "client-social",
      body: {
        approvalTaskId: "task-new",
        clientVisible: true,
        status: "WAITING_APPROVAL",
      },
    });
  });

  it("disables approval creation when permission is missing", async () => {
    currentUser = {
      ...baseEmployeeUser,
      permissions: baseEmployeeUser.permissions.filter(
        (permission) => permission !== "socialMedia.approvals.create.assigned",
      ),
    };
    renderWorkspace("approvals");

    expect(await screen.findByRole("button", { name: "Onay Talebi Oluştur" })).toBeDisabled();
  });
});
