/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import { SocialMediaContentCalendar } from "../SocialMediaContentCalendar";

const mockUseGetClientsQuery = vi.fn();
const mockUseGetProjectsQuery = vi.fn();
const mockUseGetClientSocialMediaPostsQuery = vi.fn();
const mockUseCreateClientSocialMediaPostMutation = vi.fn();
const mockUseUpdateSocialMediaPostMutation = vi.fn();
const mockUseDeleteSocialMediaPostMutation = vi.fn();
const mockUseScheduleSocialMediaPostMutation = vi.fn();
const mockUseMarkSocialMediaPostPublishedMutation = vi.fn();
const mockUseCancelSocialMediaPostMutation = vi.fn();
const mockSchedulePost = vi.fn();
const mockMarkPublished = vi.fn();
const mockCancelPost = vi.fn();

let currentUser: AuthUserProfile | null = null;

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

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
}));

vi.mock("../../../features/socialMedia/socialMediaApi", () => ({
  useGetClientSocialMediaPostsQuery: (...args: unknown[]) =>
    mockUseGetClientSocialMediaPostsQuery(...args),
  useCreateClientSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseCreateClientSocialMediaPostMutation(...args),
  useUpdateSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseUpdateSocialMediaPostMutation(...args),
  useDeleteSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseDeleteSocialMediaPostMutation(...args),
  useScheduleSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseScheduleSocialMediaPostMutation(...args),
  useMarkSocialMediaPostPublishedMutation: (...args: unknown[]) =>
    mockUseMarkSocialMediaPostPublishedMutation(...args),
  useCancelSocialMediaPostMutation: (...args: unknown[]) =>
    mockUseCancelSocialMediaPostMutation(...args),
}));

const adminUser: AuthUserProfile = {
  id: "admin-1",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: [
    "clients.read",
    "socialMedia.posts.read.any",
    "socialMedia.posts.manage.any",
  ],
  clientProfile: null,
};

describe("SocialMediaContentCalendar publishing actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;

    mockUseGetClientsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "client-1",
            slug: "acme",
            companyName: "Acme",
            contactEmail: "client@acme.test",
            status: "ACTIVE",
            createdAt: "2026-05-28T10:00:00.000Z",
            updatedAt: "2026-05-28T10:00:00.000Z",
            purchasedServices: [{ serviceKey: "social-media", status: "ACTIVE" }],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseGetProjectsQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "project-1",
            clientProfileId: "client-1",
            name: "Social Calendar",
            slug: "social-calendar",
            serviceKey: "social-media",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            startDate: null,
            endDate: null,
            repositoryUrl: null,
            repositoryOwner: null,
            repositoryName: null,
            repositoryDefaultBranch: null,
            githubInstallationId: null,
            figmaUrl: null,
            createdAt: "2026-05-28T10:00:00.000Z",
            updatedAt: "2026-05-28T10:00:00.000Z",
            clientProfile: null,
          },
        ],
      },
      isLoading: false,
    });
    mockUseGetClientSocialMediaPostsQuery.mockReturnValue({
      data: {
        data: [
          buildPost({ id: "approved", status: "APPROVED", title: "Onaylı İçerik" }),
          buildPost({ id: "scheduled", status: "SCHEDULED", title: "Planlı İçerik" }),
          buildPost({ id: "draft", status: "DRAFT", title: "Taslak İçerik" }),
        ],
        meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    mockUseCreateClientSocialMediaPostMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseUpdateSocialMediaPostMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDeleteSocialMediaPostMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseScheduleSocialMediaPostMutation.mockReturnValue([
      mockSchedulePost,
      { isLoading: false },
    ]);
    mockUseMarkSocialMediaPostPublishedMutation.mockReturnValue([
      mockMarkPublished,
      { isLoading: false },
    ]);
    mockUseCancelSocialMediaPostMutation.mockReturnValue([
      mockCancelPost,
      { isLoading: false },
    ]);
    mockSchedulePost.mockReturnValue({ unwrap: async () => ({}) });
    mockMarkPublished.mockReturnValue({ unwrap: async () => ({}) });
    mockCancelPost.mockReturnValue({ unwrap: async () => ({}) });
  });

  it("renders schedule action and calls the schedule endpoint for approved posts", async () => {
    render(<SocialMediaContentCalendar scope="admin" />);

    const approvedCard = screen.getByTestId("social-media-post-approved");
    fireEvent.click(within(approvedCard).getByRole("button", { name: /Planla/ }));

    expect(screen.getByRole("dialog")).toHaveTextContent("İçeriği Planla");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Kaydet" }));

    await waitFor(() => expect(mockSchedulePost).toHaveBeenCalled());
    expect(mockSchedulePost).toHaveBeenCalledWith({
      id: "approved",
      clientId: "client-1",
      body: {
        scheduledAt: expect.any(String),
        clientVisible: true,
      },
    });
  });

  it("opens mark-published modal with external URL input and calls the publish endpoint", async () => {
    render(<SocialMediaContentCalendar scope="admin" />);

    const scheduledCard = screen.getByTestId("social-media-post-scheduled");
    fireEvent.click(within(scheduledCard).getByRole("button", { name: /Yayınlandı İşaretle/ }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Yayınlandı İşaretle");
    fireEvent.change(within(dialog).getByPlaceholderText("https://..."), {
      target: { value: "https://instagram.com/p/acme-phase-7" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));

    await waitFor(() => expect(mockMarkPublished).toHaveBeenCalled());
    expect(mockMarkPublished).toHaveBeenCalledWith({
      id: "scheduled",
      clientId: "client-1",
      body: {
        publishedAt: expect.any(String),
        externalPostUrl: "https://instagram.com/p/acme-phase-7",
        externalPostId: null,
      },
    });
  });

  it("keeps invalid publishing actions disabled for draft posts", () => {
    render(<SocialMediaContentCalendar scope="admin" />);

    const draftCard = screen.getByTestId("social-media-post-draft");
    expect(within(draftCard).getByRole("button", { name: /Planla/ })).toBeDisabled();
    expect(within(draftCard).getByRole("button", { name: /Yayınlandı İşaretle/ })).toBeDisabled();
  });
});

function buildPost(overrides: Record<string, unknown> = {}) {
  return {
    id: "post-1",
    clientProfileId: "client-1",
    projectId: "project-1",
    platform: "INSTAGRAM",
    type: "REEL",
    status: "APPROVED",
    title: "Post",
    caption: "Caption",
    scheduledAt: "2026-06-12T10:00:00.000Z",
    publishedAt: null,
    clientVisible: true,
    approvalTaskId: null,
    createdByUserId: "admin-1",
    assignedToUserId: null,
    externalPostId: null,
    externalPostUrl: null,
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z",
    project: null,
    approvalTask: null,
    createdBy: null,
    assignedTo: null,
    assets: [],
    ...overrides,
  };
}
