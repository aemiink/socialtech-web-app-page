import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetOwnSocialMediaSummaryQuery = vi.fn();
const mockUseGetOwnSocialMediaConfigQuery = vi.fn();
const mockUseGetOwnSocialMediaCalendarQuery = vi.fn();
const mockUseGetOwnSocialMediaPostsQuery = vi.fn();
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
        posts: [buildPost({ id: "post-1", title: "API görünür Reels", status: "SCHEDULED" })],
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
        buildPost({ id: "post-2", title: "Caption onayı", status: "WAITING_APPROVAL" }),
        buildPost({ id: "post-3", title: "Yayınlanan Post", status: "PUBLISHED" }),
      ],
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

    expect(screen.getByText("Caption onayı")).toBeInTheDocument();
    expect(screen.getByText("Caption müşteri onayı")).toBeInTheDocument();
    expect(screen.getByText("Onay tipi: SOCIAL MEDIA POST APPROVAL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Onayla" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Onayla" }));

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
});

type SocialPost = {
  id: string;
  clientProfileId: string;
  projectId: string;
  platform: "INSTAGRAM";
  type: "REEL";
  status: "SCHEDULED" | "WAITING_APPROVAL" | "PUBLISHED";
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
  assets: [];
};

function buildPost(overrides: Partial<SocialPost> = {}): SocialPost {
  return {
    id: "post-id",
    clientProfileId: "client-1",
    projectId: "project-1",
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
