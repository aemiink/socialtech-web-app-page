import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialMediaDashboard } from "../services/social-media-dashboard";

const mockUseGetOwnSocialMediaSummaryQuery = vi.fn();
const mockUseGetOwnSocialMediaConfigQuery = vi.fn();
const mockUseGetOwnSocialMediaCalendarQuery = vi.fn();

vi.mock("../../features/socialMedia/socialMediaApi", () => ({
  useGetOwnSocialMediaSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaSummaryQuery(...args),
  useGetOwnSocialMediaConfigQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaConfigQuery(...args),
  useGetOwnSocialMediaCalendarQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaCalendarQuery(...args),
}));

describe("SocialMediaDashboard", () => {
  beforeEach(() => {
    mockUseGetOwnSocialMediaSummaryQuery.mockReset();
    mockUseGetOwnSocialMediaConfigQuery.mockReset();
    mockUseGetOwnSocialMediaCalendarQuery.mockReset();

    mockUseGetOwnSocialMediaSummaryQuery.mockReturnValue({
      data: buildSummary(),
      isLoading: false,
      isError: false,
      isFetching: false,
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
        hashtags: ["#acme", "#sosyal"],
        connectionStatus: "NOT_CONNECTED",
        lastSyncAt: null,
        notes: "Haftalık ajans notu API üzerinden geldi.",
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetOwnSocialMediaCalendarQuery.mockReturnValue({
      data: {
        posts: [
          buildPost({
            id: "post-1",
            title: "API görünür Reels",
            status: "SCHEDULED",
          }),
          buildPost({
            id: "post-2",
            title: "Yayınlanan Carousel",
            status: "PUBLISHED",
            publishedAt: "2026-06-02T09:00:00.000Z",
          }),
          buildPost({
            id: "post-3",
            title: "Caption onayı",
            status: "WAITING_APPROVAL",
          }),
        ],
        meta: {
          generatedAt: "2026-06-01T08:00:00.000Z",
          from: null,
          to: null,
        },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    });
  });

  it("renders summary, config, calendar and creative data from the Social Media API", () => {
    render(<SocialMediaDashboard />);

    expect(screen.getByText("Sosyal Medya")).toBeInTheDocument();
    expect(screen.getAllByText("API görünür Reels").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Yayınlanan Carousel").length).toBeGreaterThan(0);
    expect(screen.getByText("Kreatif Onay Görseli")).toBeInTheDocument();
    expect(screen.getByText("Haftalık ajans notu API üzerinden geldi.")).toBeInTheDocument();
    expect(screen.getByText("Etkileşim")).toBeInTheDocument();
    expect(screen.queryByText("Yanıtlanan DM")).not.toBeInTheDocument();
  });

  it("shows API error state when a Social Media query fails", () => {
    mockUseGetOwnSocialMediaSummaryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
    });

    render(<SocialMediaDashboard />);

    expect(screen.getByText("Sosyal medya verileri alınamadı")).toBeInTheDocument();
  });

  it("shows empty state when no visible content or creative assets exist", () => {
    mockUseGetOwnSocialMediaSummaryQuery.mockReturnValue({
      data: {
        ...buildSummary(),
        metrics: {
          ...buildSummary().metrics,
          plannedPosts: 0,
          publishedPosts: 0,
          pendingApprovals: 0,
          creativeAssets: 0,
        },
        creativeAssets: [],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    });
    mockUseGetOwnSocialMediaCalendarQuery.mockReturnValue({
      data: {
        posts: [],
        meta: {
          generatedAt: "2026-06-01T08:00:00.000Z",
          from: null,
          to: null,
        },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    });

    render(<SocialMediaDashboard />);

    expect(screen.getByText("Görünür içerik yok")).toBeInTheDocument();
  });
});

type DashboardPost = {
  id: string;
  clientProfileId: string;
  projectId: string;
  platform: "INSTAGRAM";
  type: "REEL";
  status: "SCHEDULED" | "PUBLISHED" | "WAITING_APPROVAL";
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

function buildPost(overrides: Partial<DashboardPost> = {}): DashboardPost {
  return {
    id: "post-id",
    clientProfileId: "client-1",
    projectId: "project-1",
    platform: "INSTAGRAM" as const,
    type: "REEL" as const,
    status: "SCHEDULED" as const,
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
      notes: "Haftalık ajans notu API üzerinden geldi.",
    },
    state: "READY" as const,
    metrics: {
      projects: 1,
      tasks: 2,
      plannedPosts: 2,
      publishedPosts: 1,
      inDesignPosts: 0,
      pendingApprovals: 1,
      rejectedPosts: 0,
      creativeAssets: 1,
      openTodos: 0,
      completedTodos: 0,
    },
    contentPlan: {
      projects: [],
      upcomingPosts: [],
      recentPosts: [],
      topPosts: [],
    },
    creativeAssets: [
      {
        id: "file-1",
        title: "Kreatif Onay Görseli",
        category: "ADS_CREATIVE",
        visibility: "CLIENT_VISIBLE",
        secureUrl: "https://cdn.socialtech.test/social.png",
        mimeType: "image/png",
        approvalStatus: "PENDING" as const,
        project: {
          id: "project-1",
          name: "Social Media",
        },
        updatedAt: "2026-05-28T10:00:00.000Z",
      },
    ],
    meta: {
      generatedAt: "2026-06-01T08:00:00.000Z",
      lastUpdatedAt: "2026-06-01T08:00:00.000Z",
      sources: ["SocialMediaPost"],
    },
  };
}
