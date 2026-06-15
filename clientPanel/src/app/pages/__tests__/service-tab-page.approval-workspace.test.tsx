import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockUseGetClientTasksQuery = vi.fn();
const mockUpdateClientTaskApproval = vi.fn();

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
  useUpdateClientTaskApprovalMutation: () => [mockUpdateClientTaskApproval, { isLoading: false }],
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false }),
}));

describe("ServiceTabPage generic approval workspace", () => {
  beforeEach(() => {
    mockUseGetClientTasksQuery.mockReset();
    mockUpdateClientTaskApproval.mockReset();

    mockUseGetClientTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUpdateClientTaskApproval.mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
  });

  it("renders task-based approvals for landing pages copywriting tab", async () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "lp-approval-1",
          projectId: "project-landing",
          title: "Landing copy onayı",
          description: "Yeni headline ve CTA onayı bekliyor.",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "MEDIUM",
          dueDate: null,
          updatedAt: "2026-05-31T10:00:00.000Z",
          projectName: "Landing Pages Operasyon",
          projectServiceId: "landing-pages",
          approvalRequired: true,
          approvalType: "SOCIAL_MEDIA_CAPTION_APPROVAL",
          approvalStatus: "PENDING",
          approvalResponseNote: null,
          approvalRequestedAt: "2026-05-31T09:30:00.000Z",
          approvalRespondedAt: null,
          todos: [],
          progressPercent: 0,
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockUpdateClientTaskApproval.mockReturnValue({
      unwrap: () => Promise.resolve({ approvalStatus: "APPROVED" }),
    });

    render(<ServiceTabPage serviceId="landing-pages" tabId="copywriting" />);

    expect(screen.getByText("Onay Masası")).toBeInTheDocument();
    expect(screen.getByText("Landing copy onayı")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Landing copy onayı için onayla" }),
    );

    await waitFor(() => {
      expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
        taskId: "lp-approval-1",
        body: { approvalStatus: "APPROVED", approvalResponseNote: undefined },
      });
    });
  });
});
