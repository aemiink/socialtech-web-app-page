/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type { UpdateAdminClientSocialMediaConfigRequest } from "../../features/clients/clientsTypes";
import type { AdminSocialMediaClientsResponse } from "../../features/socialMedia/socialMediaTypes";
import { SocialMediaAdmin } from "../SocialMediaAdmin";

type QueryOptions = {
  skip?: boolean;
};

type SocialMediaClientsQueryResult = {
  data?: AdminSocialMediaClientsResponse;
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
  body: UpdateAdminClientSocialMediaConfigRequest;
}) => MutationResponse<unknown>;

const mockUseGetAdminSocialMediaClientsQuery = vi.fn<
  (arg?: void, options?: QueryOptions) => SocialMediaClientsQueryResult
>();
const mockUseGetClientSocialMediaInsightsQuery = vi.fn();
const mockUseUpdateAdminClientSocialMediaConfigMutation = vi.fn<
  () => [UpdateConfigTrigger, { isLoading: boolean }]
>();
const mockUpdateConfig = vi.fn();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/socialMedia/socialMediaApi", () => ({
  useGetAdminSocialMediaClientsQuery: (arg?: void, options?: QueryOptions) =>
    mockUseGetAdminSocialMediaClientsQuery(arg, options),
  useGetClientSocialMediaInsightsQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaInsightsQuery(...args),
}));

vi.mock("../../features/clients/clientsApi", () => ({
  useCreateAdminClientSocialMediaMetaOAuthUrlMutation: () => [
    vi.fn(() => ({ unwrap: async () => ({}) })),
    { isLoading: false },
  ],
  useUpdateAdminClientSocialMediaConfigMutation: () =>
    mockUseUpdateAdminClientSocialMediaConfigMutation(),
}));

vi.mock("../../employee/components/SocialMediaContentCalendar", () => ({
  SocialMediaContentCalendar: ({ scope }: { scope: string }) => (
    <div data-testid="content-calendar">Calendar scope: {scope}</div>
  ),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: [
    "socialMedia.summary.read.any",
    "socialMedia.config.read.any",
    "socialMedia.posts.read.any",
    "socialMedia.config.manage.any",
    "socialMedia.posts.manage.any",
  ],
  clientProfile: null,
};

const readOnlyAdminUser: AuthUserProfile = {
  ...adminUser,
  permissions: ["socialMedia.summary.read.any", "socialMedia.config.read.any"],
};

const socialMediaClientsResponse: AdminSocialMediaClientsResponse = {
  data: [
    {
      client: {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "acme-e-ticaret",
        companyName: "Acme E-ticaret",
        status: "ACTIVE",
      },
      serviceStatus: "ACTIVE",
      service: {
        hasActiveService: true,
        status: "ACTIVE",
        startedAt: "2026-05-28T00:00:00.000Z",
        updatedAt: "2026-05-28T10:00:00.000Z",
      },
      config: {
        activePlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN"],
        instagramUsername: "@acme",
        instagramAccountId: "ig-1",
        facebookPageId: "fb-1",
        tiktokUsername: "@acmetiktok",
        linkedinPageUrl: "https://linkedin.com/company/acme",
        contentFrequency: "Haftada 3 post",
        primaryGoal: "ENGAGEMENT",
        toneOfVoice: "Samimi",
        hashtags: ["#acme", "#growth"],
        connectionStatus: "CONNECTED",
        lastSyncAt: "2026-05-28T10:00:00.000Z",
        notes: "Mayıs planı.",
      },
      state: "READY",
      metrics: {
        projects: 1,
        tasks: 3,
        plannedPosts: 4,
        publishedPosts: 2,
        inDesignPosts: 1,
        pendingApprovals: 1,
        rejectedPosts: 1,
        creativeAssets: 2,
        openTodos: 2,
        completedTodos: 4,
        overdueScheduledPosts: 1,
      },
      contentPlan: {
        projects: [],
        upcomingPosts: [
          {
            id: "post-1",
            platform: "INSTAGRAM",
            type: "REEL",
            status: "WAITING_APPROVAL",
            title: "Haziran lansman reels",
            scheduledAt: "2026-06-12T09:00:00.000Z",
            publishedAt: null,
            clientVisible: true,
            project: null,
            updatedAt: "2026-05-28T10:00:00.000Z",
          },
        ],
        recentPosts: [],
        topPosts: [],
      },
      creativeAssets: [
        {
          id: "creative-1",
          title: "Reels kapak görseli",
          category: "CREATIVE",
          visibility: "CLIENT_VISIBLE",
          secureUrl: "https://example.com/reels.png",
          mimeType: "image/png",
          approvalStatus: "PENDING",
          project: {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Social Calendar Refresh",
          },
          updatedAt: "2026-05-28T10:00:00.000Z",
        },
      ],
      assignedEmployees: [],
      assignedSocialMediaSpecialists: [
        {
          userId: "social-user-id",
          email: "social@socialtech.com",
          displayName: "Social Specialist",
          role: "SOCIAL_MEDIA_SPECIALIST",
          status: "ACTIVE",
          scope: "SOCIAL_MEDIA",
        },
      ],
      assignedDesigners: [
        {
          userId: "designer-user-id",
          email: "designer@socialtech.com",
          displayName: "Designer User",
          role: "DESIGNER",
          status: "ACTIVE",
          scope: "DESIGN",
        },
      ],
      risk: {
        status: "ATTENTION",
        reasons: ["1 onay bekliyor.", "1 planlı içerik gecikmiş."],
      },
      lastReport: null,
      actionContext: {
        socialMediaProjectId: "22222222-2222-4222-8222-222222222222",
      },
      meta: {
        generatedAt: "2026-05-28T10:00:00.000Z",
        lastUpdatedAt: "2026-05-28T10:00:00.000Z",
      },
    },
  ],
  meta: {
    total: 1,
    ready: 0,
    attention: 1,
    blocked: 0,
    overdueScheduledPosts: 1,
    pendingApprovals: 1,
    generatedAt: "2026-05-28T10:00:00.000Z",
  },
};

function setupListState(overrides: Partial<SocialMediaClientsQueryResult> = {}) {
  mockUseGetAdminSocialMediaClientsQuery.mockReturnValue({
    data: socialMediaClientsResponse,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderSocialMediaAdmin() {
  render(<SocialMediaAdmin />, { wrapper: MemoryRouter });
}

describe("SocialMediaAdmin", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.clearAllMocks();
    currentUser = adminUser;
    setupListState();
    mockUseGetClientSocialMediaInsightsQuery.mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 25,
          total: 1,
          totalPages: 1,
          generatedAt: "2026-05-28T10:00:00.000Z",
          totals: {
            impressions: 1200,
            reach: 900,
            likes: 100,
            comments: 12,
            shares: 6,
            saves: 8,
            profileVisits: 44,
            follows: 5,
            clicks: 20,
            engagementRate: 20.56,
          },
          topPosts: [
            {
              postId: "post-1",
              title: "Haziran lansman reels",
              platform: "INSTAGRAM",
              type: "REEL",
              engagementRate: 20.56,
              engagementScore: 126,
            },
          ],
          platformBreakdown: [],
          typeBreakdown: [],
          trend: [],
        },
      },
      currentData: {
        data: [],
        meta: {
          page: 1,
          limit: 25,
          total: 1,
          totalPages: 1,
          generatedAt: "2026-05-28T10:00:00.000Z",
          totals: {
            impressions: 1200,
            reach: 900,
            likes: 100,
            comments: 12,
            shares: 6,
            saves: 8,
            profileVisits: 44,
            follows: 5,
            clicks: 20,
            engagementRate: 20.56,
          },
          topPosts: [
            {
              postId: "post-1",
              title: "Haziran lansman reels",
              platform: "INSTAGRAM",
              type: "REEL",
              engagementRate: 20.56,
              engagementScore: 126,
            },
          ],
          platformBreakdown: [],
          typeBreakdown: [],
          trend: [],
        },
      },
      isFetching: false,
      isError: false,
      error: undefined,
    });
    mockUpdateConfig.mockReturnValue({ unwrap: async () => ({}) });
    mockUseUpdateAdminClientSocialMediaConfigMutation.mockReturnValue([
      mockUpdateConfig,
      { isLoading: false },
    ]);
  });

  it("skips the global list query without admin Social Media permission", () => {
    currentUser = null;

    renderSocialMediaAdmin();

    expect(screen.getByText("Bu ekran için admin Social Media yetkisi gerekiyor.")).toBeInTheDocument();
    expect(mockUseGetAdminSocialMediaClientsQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it("renders loading state", () => {
    setupListState({ data: undefined, isLoading: true, isFetching: true });

    renderSocialMediaAdmin();

    expect(screen.getByText("Social Media müşterileri yükleniyor")).toBeInTheDocument();
  });

  it("renders error state", () => {
    setupListState({
      data: undefined,
      error: { status: 500, data: { message: "Social Media endpoint kullanılamıyor." } },
      isError: true,
    });

    renderSocialMediaAdmin();

    expect(screen.getByText("Social Media endpoint kullanılamıyor.")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    setupListState({
      data: {
        data: [],
        meta: {
          total: 0,
          ready: 0,
          attention: 0,
          blocked: 0,
          overdueScheduledPosts: 0,
          pendingApprovals: 0,
          generatedAt: "2026-05-28T10:00:00.000Z",
        },
      },
    });

    renderSocialMediaAdmin();

    expect(screen.getByText("Social Media müşterisi yok")).toBeInTheDocument();
  });

  it("renders Social Media client list, counts, assignments, and embedded calendar", () => {
    renderSocialMediaAdmin();

    expect(screen.getByText("Social Media Operasyonları")).toBeInTheDocument();
    expect(screen.getAllByText("Acme E-ticaret").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dikkat").length).toBeGreaterThan(0);
    expect(screen.getByText("1 müşteride onay, revizyon veya geciken plan aksiyonu var.")).toBeInTheDocument();
    expect(screen.getByText("Specialist: Social Specialist")).toBeInTheDocument();
    expect(screen.getByText("Designer: Designer User")).toBeInTheDocument();
    expect(screen.getByText("Meta ID Eşleşmesi")).toBeInTheDocument();
    expect(screen.getByText("Instagram Profili")).toBeInTheDocument();
    expect(screen.getByText("@acme")).toBeInTheDocument();
    expect(screen.getByText("ig-1")).toBeInTheDocument();
    expect(screen.getByText("Facebook Sayfası")).toBeInTheDocument();
    expect(screen.getByText("Page ID fb-1")).toBeInTheDocument();
    expect(screen.getByText("Performans Snapshot")).toBeInTheDocument();
    expect(screen.getByText("1.200")).toBeInTheDocument();
    expect(screen.getByText("900")).toBeInTheDocument();
    expect(screen.getAllByText("20,56%").length).toBeGreaterThan(0);
    expect(screen.getByText("Aksiyon Kuyruğu")).toBeInTheDocument();
    expect(screen.getAllByText("Haziran lansman reels").length).toBeGreaterThan(0);
    expect(screen.getByText("1 son kreatif asset görünüyor.")).toBeInTheDocument();
    expect(screen.getByTestId("content-calendar")).toHaveTextContent("Calendar scope: admin");
  });

  it("submits config edit action", async () => {
    renderSocialMediaAdmin();

    fireEvent.click(screen.getByRole("button", { name: /Config Düzenle/i }));
    fireEvent.change(screen.getByDisplayValue("Haftada 3 post"), {
      target: { value: "Haftada 5 post" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Kaydet/i }));

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        clientId: "11111111-1111-4111-8111-111111111111",
        body: expect.objectContaining({
          activePlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN"],
          contentFrequency: "Haftada 5 post",
          instagramUsername: "@acme",
          hashtags: ["#acme", "#growth"],
        }),
      });
    });
  });

  it("disables manage actions without manage permissions", () => {
    currentUser = readOnlyAdminUser;

    renderSocialMediaAdmin();

    expect(screen.getByRole("button", { name: /Config Düzenle/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Post Oluştur/i })).toBeDisabled();
    expect(
      screen.getByText("Snapshot insightlarını görmek için Social Media post veya rapor okuma yetkisi gerekiyor."),
    ).toBeInTheDocument();
  });
});
