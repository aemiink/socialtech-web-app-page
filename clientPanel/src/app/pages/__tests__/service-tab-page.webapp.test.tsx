import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetWebAppWorkspaceQuery = vi.fn();
const mockUseGetClientTasksQuery = vi.fn();
const mockCreateWorkspaceRevision = vi.fn();
const mockUpdateWorkspaceRevisionStatus = vi.fn();

let accessToken: string | null = null;
let currentUser = {
  id: "client-1",
};

vi.mock("../../features/webAppWorkspace/webAppWorkspaceApi", () => ({
  webAppWorkspaceApi: {
    util: {
      updateQueryData: () => ({ type: "mock/updateQueryData" }),
    },
  },
  useGetWebAppWorkspaceQuery: (...args: unknown[]) => mockUseGetWebAppWorkspaceQuery(...args),
  useCreateWebAppWorkspaceMessageMutation: () => [vi.fn(), { isLoading: false }],
  useCreateWebAppWorkspaceRevisionMutation: () => [
    mockCreateWorkspaceRevision,
    { isLoading: false },
  ],
  useUpdateWebAppWorkspaceRevisionStatusMutation: () => [
    mockUpdateWorkspaceRevisionStatus,
    { isLoading: false },
  ],
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
        accessToken,
        currentUser,
      },
    }),
}));

vi.mock("../../features/auth/authSelectors", () => ({
  selectAccessToken: (state: { auth: { accessToken: string | null } }) => state.auth.accessToken,
  selectCurrentUser: (state: { auth: { currentUser: typeof currentUser } }) => state.auth.currentUser,
}));

vi.mock("../../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false }),
}));

describe("ServiceTabPage workspace and revision flows", () => {
  beforeEach(() => {
    accessToken = null;
    currentUser = { id: "client-1" };
    mockUseGetWebAppWorkspaceQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockCreateWorkspaceRevision.mockReset();
    mockUpdateWorkspaceRevisionStatus.mockReset();
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    mockUseGetClientTasksQuery.mockReturnValue({ data: [], isLoading: false });
    mockCreateWorkspaceRevision.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "revision-created" }),
    });
    mockUpdateWorkspaceRevisionStatus.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "revision-updated" }),
    });
  });

  it("renders roadmap and release data on project-roadmap tab", () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: { id: "p1", clientProfileId: "c1", serviceKey: "WEB_APP", name: "Acme Web App" },
        sourceOfTruth: {
          tasks: [],
          sprints: [
            {
              id: "s1",
              name: "Sprint 1",
              status: "ACTIVE",
              startDate: "2026-05-01T00:00:00.000Z",
              endDate: "2026-05-15T00:00:00.000Z",
            },
          ],
          releases: [
            {
              id: "r1",
              title: "Release 1.0.0",
              environment: "STAGING",
              status: "TESTING",
              version: "1.0.0",
            },
          ],
          files: [],
        },
        sections: [],
        messages: [],
        revisions: [],
      },
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="web-app" tabId="project-roadmap" projectId="p1" />);

    expect(screen.getByText("Sprint Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    expect(screen.getByText("Release / Yayın Planı")).toBeInTheDocument();
    expect(screen.getByText("Release 1.0.0")).toBeInTheDocument();
  });

  it("filters tasks for frontend tab by workstream", () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: { id: "p1", clientProfileId: "c1", serviceKey: "WEB_APP", name: "Acme Web App" },
        sourceOfTruth: {
          tasks: [
            {
              id: "t1",
              title: "Landing page komponentleri",
              status: "IN_PROGRESS",
              priority: "HIGH",
              type: "FEATURE",
              workstream: "FRONTEND",
            },
            {
              id: "t2",
              title: "Auth refresh endpoint",
              status: "TODO",
              priority: "MEDIUM",
              type: "FEATURE",
              workstream: "BACKEND",
            },
          ],
          sprints: [],
          releases: [],
          files: [],
        },
        sections: [],
        messages: [],
        revisions: [],
      },
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="web-app" tabId="frontend" projectId="p1" />);

    expect(screen.getByText("Landing page komponentleri")).toBeInTheDocument();
    expect(screen.queryByText("Auth refresh endpoint")).not.toBeInTheDocument();
  });

  it("supports creating and approving web-app revisions on the revisions tab", async () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: { id: "p1", clientProfileId: "c1", serviceKey: "WEB_APP", name: "Acme Web App" },
        sourceOfTruth: {
          tasks: [],
          sprints: [],
          releases: [],
          files: [],
        },
        sections: [],
        messages: [],
        revisions: [
          {
            id: "revision-1",
            projectId: "p1",
            title: "CTA duzeni",
            description: "Hero CTA yerlesimi guncellensin",
            status: "READY_FOR_REVIEW",
            requestedAt: "2026-05-05T09:00:00.000Z",
            requestedByUserId: "client-1",
            requestedBy: { id: "client-1", displayName: "Client User" },
          },
        ],
      },
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="web-app" tabId="revisions" projectId="p1" />);

    fireEvent.change(screen.getByPlaceholderText("Revizyon başlığı"), {
      target: { value: "Navbar copy update" },
    });
    fireEvent.change(screen.getByPlaceholderText("Revizyon talebini detaylandırın"), {
      target: { value: "CTA metni ve spacing guncellensin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Revizyon Talebi Oluştur" }));

    await waitFor(() => {
      expect(mockCreateWorkspaceRevision).toHaveBeenCalledWith({
        projectId: "p1",
        title: "Navbar copy update",
        description: "CTA metni ve spacing guncellensin",
        cacheTabKey: "REVISIONS",
      });
    });

    expect(screen.getByRole("button", { name: "Onayla" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revizyon İste" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Onayla" }));

    await waitFor(() => {
      expect(mockUpdateWorkspaceRevisionStatus).toHaveBeenCalledWith({
        projectId: "p1",
        revisionId: "revision-1",
        status: "APPROVED",
        note: undefined,
        cacheTabKey: "REVISIONS",
      });
    });
  });

  it("uses task-based API data for non-web revision tabs", () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "task-1",
          projectId: "mobile-1",
          title: "Splash screen revizyonu",
          description: "Onboarding spacing duzeltmeleri",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "HIGH",
          type: "REVISION",
          workstream: "UI_INTEGRATION",
          dueDate: "2026-05-12T00:00:00.000Z",
          updatedAt: "2026-05-06T10:00:00.000Z",
          projectName: "Mobile App",
          projectServiceId: "mobile-app",
          sprint: null,
          completion: null,
          todos: [],
          progressPercent: 70,
        },
        {
          id: "task-2",
          projectId: "seo-1",
          title: "SEO rapor revizyonu",
          description: null,
          status: "TODO",
          visibility: "CLIENT_VISIBLE",
          priority: "MEDIUM",
          type: "REVISION",
          workstream: "FULLSTACK",
          dueDate: null,
          updatedAt: "2026-05-06T10:00:00.000Z",
          projectName: "SEO Audit",
          projectServiceId: "seo-audit",
          sprint: null,
          completion: null,
          todos: [],
          progressPercent: 10,
        },
      ],
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="mobile-app" tabId="revisions" />);

    expect(screen.getByText("Revizyon Görevleri")).toBeInTheDocument();
    expect(screen.getByText("Splash screen revizyonu")).toBeInTheDocument();
    expect(screen.queryByText("SEO rapor revizyonu")).not.toBeInTheDocument();
    expect(screen.queryByText("Onay Masası")).not.toBeInTheDocument();
  });
});
