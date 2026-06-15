import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetOwnSocialMediaSummaryQuery = vi.fn();
const mockUseGetOwnSocialMediaConfigQuery = vi.fn();
const mockUseGetOwnSocialMediaCalendarQuery = vi.fn();
const mockUseGetOwnSocialMediaPostsQuery = vi.fn();
const mockUseGetOwnSocialMediaInsightsQuery = vi.fn();
const mockUseGetOwnSocialMediaReportsQuery = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockUseUpdateClientTaskApprovalMutation = vi.fn();
const mockUpdateClientTaskApproval = vi.fn();

vi.mock("../../features/socialMedia/socialMediaApi", () => ({
  useGetOwnSocialMediaSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaSummaryQuery(...args),
  useGetOwnSocialMediaConfigQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaConfigQuery(...args),
  useGetOwnSocialMediaCalendarQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaCalendarQuery(...args),
  useGetOwnSocialMediaPostsQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaPostsQuery(...args),
  useGetOwnSocialMediaInsightsQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaInsightsQuery(...args),
  useGetOwnSocialMediaReportsQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaReportsQuery(...args),
}));

vi.mock("../../features/webAppWorkspace/webAppWorkspaceApi", () => ({
  webAppWorkspaceApi: {
    util: {
      updateQueryData: () => ({ type: "mock/updateQueryData" }),
    },
  },
  useGetWebAppWorkspaceQuery: () => ({ data: undefined, isLoading: false }),
  useCreateWebAppWorkspaceMessageMutation: () => [vi.fn(), { isLoading: false }],
  useCreateWebAppWorkspaceRevisionMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateWebAppWorkspaceRevisionStatusMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("../../features/webAppWorkspace/workspaceSocket", () => ({
  createWorkspaceSocket: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        accessToken: "test-token",
        currentUser: { id: "client-1" },
      },
    }),
}));

vi.mock("../../features/auth/authSelectors", () => ({
  selectAccessToken: (state: { auth: { accessToken: string | null } }) => state.auth.accessToken,
  selectCurrentUser: (state: { auth: { currentUser: { id: string } | null } }) => state.auth.currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
  useUpdateClientTaskApprovalMutation: (...args: unknown[]) =>
    mockUseUpdateClientTaskApprovalMutation(...args),
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

describe("ServiceTabPage Social Media tabs", () => {
  beforeEach(() => {
    mockUseGetOwnSocialMediaSummaryQuery.mockReset();
    mockUseGetOwnSocialMediaConfigQuery.mockReset();
    mockUseGetOwnSocialMediaCalendarQuery.mockReset();
    mockUseGetOwnSocialMediaPostsQuery.mockReset();
    mockUseGetOwnSocialMediaInsightsQuery.mockReset();
    mockUseGetOwnSocialMediaReportsQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseUpdateClientTaskApprovalMutation.mockReset();

    mockUseGetOwnSocialMediaSummaryQuery.mockReturnValue({
      data: buildSummary(),
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaConfigQuery.mockReturnValue({
      data: {
        clientProfileId: "client-1",
        instagramUsername: "@acme",
        instagramAccountId: null,
        facebookPageId: null,
        tiktokUsername: null,
        linkedinPageUrl: null,
        contentFrequency: "Haftada 3 içerik",
        primaryGoal: "ENGAGEMENT",
        toneOfVoice: "Sıcak ve net",
        hashtags: ["#acme"],
        connectionStatus: "NOT_CONNECTED",
        lastSyncAt: null,
        notes: "Social Media ajans notu API data.",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaCalendarQuery.mockReturnValue({
      data: {
        posts: [
          buildPost({ id: "post-1", title: "API görünür Reels", status: "SCHEDULED" }),
          buildPost({ id: "post-draft", title: "Takvim dışı taslak", status: "DRAFT" }),
        ],
        meta: {
          generatedAt: "2026-06-01T08:00:00.000Z",
          from: null,
          to: null,
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaPostsQuery.mockReturnValue({
      data: [
        buildPost({
          id: "post-2",
          title: "Caption onayı",
          status: "WAITING_APPROVAL",
          approvalTaskId: "task-1",
          assets: [
            {
              id: "asset-1",
              sortOrder: 0,
              createdAt: "2026-06-01T07:50:00.000Z",
              file: {
                id: "file-1",
                folderId: "folder-approval-1",
                title: "FeedPost2.png",
                secureUrl: "https://cdn.socialtech.test/feed-post-2.png",
                mimeType: "image/png",
                category: "CREATIVE",
                visibility: "CLIENT_VISIBLE",
                folder: {
                  id: "folder-approval-1",
                  name: "Onay Klasörü 1",
                },
              },
            },
          ],
        }),
        buildPost({
          id: "post-3",
          title: "Yayınlanan Post",
          status: "PUBLISHED",
          externalPostUrl: "https://instagram.com/p/acme-phase-7",
        }),
        buildPost({
          id: "post-4",
          title: "Onaylanan Carousel",
          status: "APPROVED",
          type: "CAROUSEL",
          assets: [
            {
              id: "asset-2",
              sortOrder: 0,
              createdAt: "2026-06-01T08:10:00.000Z",
              file: {
                id: "file-2",
                folderId: "folder-approval-1",
                title: "Carousel1.png",
                secureUrl: "https://cdn.socialtech.test/carousel-1.png",
                mimeType: "image/png",
                category: "CREATIVE",
                visibility: "CLIENT_VISIBLE",
                folder: {
                  id: "folder-approval-1",
                  name: "Onay Klasörü 1",
                },
              },
            },
            {
              id: "asset-3",
              sortOrder: 1,
              createdAt: "2026-06-01T08:11:00.000Z",
              file: {
                id: "file-3",
                folderId: "folder-approval-1",
                title: "Carousel2.png",
                secureUrl: "https://cdn.socialtech.test/carousel-2.png",
                mimeType: "image/png",
                category: "CREATIVE",
                visibility: "CLIENT_VISIBLE",
                folder: {
                  id: "folder-approval-1",
                  name: "Onay Klasörü 1",
                },
              },
            },
          ],
        }),
      ],
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaInsightsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "insight-1",
            postId: "post-3",
            clientProfileId: "client-1",
            platform: "INSTAGRAM",
            date: "2026-06-05T00:00:00.000Z",
            impressions: 2400,
            reach: 1800,
            likes: 210,
            comments: 24,
            shares: 18,
            saves: 33,
            profileVisits: 20,
            follows: 7,
            clicks: 45,
            engagementRate: 18.33,
            raw: null,
            createdAt: "2026-06-05T00:00:00.000Z",
            updatedAt: "2026-06-05T00:00:00.000Z",
            post: {
              id: "post-3",
              title: "Yayınlanan Post",
              type: "REEL",
              status: "PUBLISHED",
              scheduledAt: "2026-06-01T10:00:00.000Z",
              publishedAt: "2026-06-01T12:00:00.000Z",
              externalPostUrl: "https://instagram.com/p/acme-phase-7",
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
            impressions: 2400,
            reach: 1800,
            likes: 210,
            comments: 24,
            shares: 18,
            saves: 33,
            profileVisits: 20,
            follows: 7,
            clicks: 45,
            engagementRate: 18.33,
          },
          topPosts: [
            {
              postId: "post-3",
              title: "Yayınlanan Post",
              platform: "INSTAGRAM",
              type: "REEL",
              engagementRate: 18.33,
              engagementScore: 330,
            },
          ],
          platformBreakdown: [
            {
              key: "INSTAGRAM",
              impressions: 2400,
              reach: 1800,
              engagements: 330,
              engagementRate: 18.33,
            },
          ],
          typeBreakdown: [],
          trend: [],
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaReportsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "report-1",
            clientProfileId: "client-1",
            projectId: "project-1",
            projectName: "Social Media",
            periodStart: "2026-06-01T00:00:00.000Z",
            periodEnd: "2026-06-07T23:59:59.999Z",
            type: "WEEKLY",
            status: "PUBLISHED",
            summary: "Haftalık Social Media performans özeti.",
            metricsSnapshot: null,
            clientVisible: true,
            publishedAt: "2026-06-08T09:00:00.000Z",
            acknowledgementRequestedAt: "2026-06-08T09:00:00.000Z",
            acknowledgedAt: null,
            acknowledgementStatus: "PENDING",
            acknowledgementTaskId: "task-report-1",
            acknowledgementTaskUpdatedAt: "2026-06-08T09:00:00.000Z",
            createdAt: "2026-06-08T08:00:00.000Z",
            updatedAt: "2026-06-08T09:00:00.000Z",
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          draft: 0,
          published: 1,
          clientVisible: 1,
        },
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseUpdateClientTaskApprovalMutation.mockReturnValue([
      mockUpdateClientTaskApproval,
      { isLoading: false },
    ]);
    mockUpdateClientTaskApproval.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it("renders content calendar from Social Media calendar API without generic static KPIs", () => {
    render(<ServiceTabPage serviceId="social-media" tabId="content-calendar" />);

    expect(screen.getByText("API görünür Reels")).toBeInTheDocument();
    expect(screen.queryByText("Takvim dışı taslak")).not.toBeInTheDocument();
    expect(screen.queryByText("Planlanan İçerik")).not.toBeInTheDocument();
  });

  it("renders pending approvals from visible posts and client approval tasks", async () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "task-1",
          projectId: "project-1",
          title: "Caption müşteri onayı",
          description: "Caption revizyonu bekliyor.",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "HIGH",
          type: "REVISION",
          workstream: "UI_INTEGRATION",
          dueDate: null,
          updatedAt: "2026-06-01T08:00:00.000Z",
          projectName: "Social Media",
          projectServiceId: "social-media",
          approvalRequired: true,
          approvalType: "SOCIAL_MEDIA_POST_APPROVAL",
          approvalStatus: "PENDING",
          sprint: null,
          completion: null,
          todos: [],
          progressPercent: 0,
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<ServiceTabPage serviceId="social-media" tabId="pending-approvals" />);

    expect(screen.getAllByText("Caption onayı").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Onaylanan Carousel").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Onay Klasörü 1").length).toBeGreaterThan(0);
    expect(screen.getAllByAltText("FeedPost2.png").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Klasörü Onayla" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Klasörü Onayla" }));

    await waitFor(() => expect(mockUpdateClientTaskApproval).toHaveBeenCalled());
    expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
      taskId: "task-1",
      body: {
        approvalStatus: "APPROVED",
        approvalResponseNote: undefined,
      },
    });
  });

  it("renders agency note tab from config and does not show static trend table data", () => {
    render(<ServiceTabPage serviceId="social-media" tabId="trend-notes" />);

    expect(screen.getByText("Social Media ajans notu API data.")).toBeInTheDocument();
    expect(screen.queryByText("Problem/Çözüm Reels")).not.toBeInTheDocument();
  });

  it("renders published posts with external platform links", () => {
    render(<ServiceTabPage serviceId="social-media" tabId="published-content" />);

    expect(screen.getByText("Yayınlanan Post")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dış yayını aç/ })).toHaveAttribute(
      "href",
      "https://instagram.com/p/acme-phase-7",
    );
  });

  it("renders performance tab from Social Media insights API", () => {
    render(<ServiceTabPage serviceId="social-media" tabId="performance" />);

    expect(screen.getByText("Performans")).toBeInTheDocument();
    expect(screen.getAllByText("Yayınlanan Post").length).toBeGreaterThan(0);
    expect(screen.getByText("2.400")).toBeInTheDocument();
    expect(screen.getByText("INSTAGRAM")).toBeInTheDocument();
  });

  it("renders reports tab from Social Media reports API", () => {
    render(<ServiceTabPage serviceId="social-media" tabId="reports" />);

    expect(screen.getByText("Raporlar")).toBeInTheDocument();
    expect(screen.getByText("Haftalık Social Media performans özeti.")).toBeInTheDocument();
    expect(screen.getByText("Onay: PENDING")).toBeInTheDocument();
    expect(screen.queryByText("Bu sekme için henüz Social Media API veri kaynağı aktif değil. Mock içerik gösterilmiyor.")).not.toBeInTheDocument();
  });

  it("renders empty performance and reports states without static fallback", () => {
    mockUseGetOwnSocialMediaInsightsQuery.mockReturnValue({
      data: buildEmptyInsightsResponse(),
      isLoading: false,
      isError: false,
    });

    const { rerender } = render(<ServiceTabPage serviceId="social-media" tabId="performance" />);

    expect(screen.getByText("Henüz client-visible performans snapshot yok.")).toBeInTheDocument();
    expect(screen.queryByText("Bu sekme için henüz Social Media API veri kaynağı aktif değil. Mock içerik gösterilmiyor.")).not.toBeInTheDocument();

    mockUseGetOwnSocialMediaReportsQuery.mockReturnValue({
      data: buildEmptyReportsResponse(),
      isLoading: false,
      isError: false,
    });

    rerender(<ServiceTabPage serviceId="social-media" tabId="reports" />);

    expect(screen.getByText("Henüz yayınlanmış Social Media raporu yok.")).toBeInTheDocument();
    expect(screen.queryByText("Bu sekme için henüz Social Media API veri kaynağı aktif değil. Mock içerik gösterilmiyor.")).not.toBeInTheDocument();
  });

  it("renders Social Media performance error state", () => {
    mockUseGetOwnSocialMediaInsightsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<ServiceTabPage serviceId="social-media" tabId="performance" />);

    expect(screen.getByText("Sosyal medya verileri alınamadı")).toBeInTheDocument();
  });
});

type SocialPost = {
  id: string;
  clientProfileId: string;
  projectId: string;
  approvalTaskId: string | null;
  platform: "INSTAGRAM";
  type: "REEL" | "CAROUSEL";
  status: "DRAFT" | "SCHEDULED" | "WAITING_APPROVAL" | "APPROVED" | "PUBLISHED";
  title: string;
  caption: string;
  scheduledAt: string;
  publishedAt: string | null;
  clientVisible: boolean;
  externalPostUrl: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: string;
  };
  assets: Array<{
    id: string;
    sortOrder: number;
    createdAt: string;
    file: {
      id: string;
      folderId?: string;
      title: string;
      secureUrl: string;
      mimeType: string;
      category: string;
      visibility: string;
      folder?: {
        id: string;
        name: string;
      };
    } | null;
  }>;
};

function buildPost(overrides: Partial<SocialPost> = {}): SocialPost {
  return {
    id: "post-id",
    clientProfileId: "client-1",
    projectId: "project-1",
    approvalTaskId: null,
    platform: "INSTAGRAM",
    type: "REEL",
    status: "SCHEDULED",
    title: "Post",
    caption: "Caption",
    scheduledAt: "2026-06-01T10:00:00.000Z",
    publishedAt: null,
    clientVisible: true,
    externalPostUrl: null,
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z",
    project: {
      id: "project-1",
      name: "Social Media",
      slug: "social-media",
      serviceKey: "SOCIAL_MEDIA",
    },
    assets: [],
    ...overrides,
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
    config: {
      instagramUsername: "@acme",
      instagramAccountId: null,
      facebookPageId: null,
      tiktokUsername: null,
      linkedinPageUrl: null,
      contentFrequency: "Haftada 3 içerik",
      primaryGoal: "ENGAGEMENT" as const,
      toneOfVoice: "Sıcak ve net",
      hashtags: ["#acme"],
      connectionStatus: "NOT_CONNECTED" as const,
      lastSyncAt: null,
      notes: "Social Media ajans notu API data.",
    },
    state: "READY" as const,
    metrics: {
      projects: 1,
      tasks: 1,
      plannedPosts: 1,
      publishedPosts: 1,
      inDesignPosts: 0,
      pendingApprovals: 1,
      rejectedPosts: 0,
      creativeAssets: 0,
      openTodos: 0,
      completedTodos: 0,
    },
    contentPlan: {
      projects: [],
      upcomingPosts: [],
      recentPosts: [],
      topPosts: [],
    },
    creativeAssets: [],
    meta: {
      generatedAt: "2026-06-01T08:00:00.000Z",
      lastUpdatedAt: "2026-06-01T08:00:00.000Z",
      sources: ["SocialMediaPost"],
    },
  };
}

function buildEmptyInsightsResponse() {
  return {
    data: [],
    meta: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
      generatedAt: "2026-06-05T00:00:00.000Z",
      totals: {
        impressions: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        profileVisits: 0,
        follows: 0,
        clicks: 0,
        engagementRate: 0,
      },
      topPosts: [],
      platformBreakdown: [],
      typeBreakdown: [],
      trend: [],
    },
  };
}

function buildEmptyReportsResponse() {
  return {
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      draft: 0,
      published: 0,
      clientVisible: 0,
    },
  };
}
