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
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetTasksQuery = vi.fn();
const mockUseCreateTaskMutation = vi.fn();
const mockCreateTask = vi.fn();
const mockUseUpdateSocialMediaPostMutation = vi.fn();
const mockUpdateSocialMediaPost = vi.fn();

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
  useUpdateSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseUpdateSocialMediaPostMutation(...args),
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
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
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
  mockUseCreateTaskMutation.mockReturnValue([mockCreateTask, { isLoading: false }]);
  mockUseUpdateSocialMediaPostMutation.mockReturnValue([
    mockUpdateSocialMediaPost,
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
