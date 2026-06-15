import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTabPage } from "../service-tab-page";

const mockGrowthHubDashboard = vi.fn((props: { tabId?: string }) => (
  <div data-testid="growth-hub-tab-view">{props.tabId ?? "service-dashboard"}</div>
));
const mockUseGetClientTasksQuery = vi.fn();
const mockUpdateClientTaskApproval = vi.fn();

vi.mock("../services/growth-hub-dashboard", () => ({
  GrowthHubDashboard: (props: { tabId?: string }) => mockGrowthHubDashboard(props),
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
  useUpdateClientTaskApprovalMutation: () => [mockUpdateClientTaskApproval, { isLoading: false }],
}));

vi.mock("../../features/projectFiles/projectFilesApi", () => ({
  useGetClientProjectFilesQuery: () => ({ data: { data: [] }, isLoading: false }),
}));

describe("ServiceTabPage Growth Hub tabs", () => {
  beforeEach(() => {
    mockGrowthHubDashboard.mockClear();
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

  it("uses API-driven Growth Hub dashboard for non-dashboard tabs", () => {
    render(<ServiceTabPage serviceId="growth-hub" tabId="channels" />);

    expect(screen.getByTestId("growth-hub-tab-view")).toHaveTextContent("channels");
    expect(mockGrowthHubDashboard).toHaveBeenCalled();
    expect(screen.queryByText("247")).not.toBeInTheDocument();
  });

  it("uses task-based approval flow on growth-hub content approvals tab", async () => {
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          id: "gh-approval-task-1",
          projectId: "project-1",
          title: "Landing page kreatif onayı",
          description: "Yeni kreatifler müşteri onayı bekliyor.",
          status: "REVIEW",
          visibility: "CLIENT_VISIBLE",
          priority: "HIGH",
          dueDate: null,
          updatedAt: "2026-05-31T10:00:00.000Z",
          projectName: "Growth Hub Operasyon",
          projectServiceId: "growth-hub",
          approvalRequired: true,
          approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL",
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

    render(<ServiceTabPage serviceId="growth-hub" tabId="content-approvals" />);

    expect(screen.queryByTestId("growth-hub-tab-view")).not.toBeInTheDocument();
    expect(screen.getByText("Onay Masası")).toBeInTheDocument();
    expect(screen.getByText("Landing page kreatif onayı")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Landing page kreatif onayı için onayla" }),
    );

    await waitFor(() => {
      expect(mockUpdateClientTaskApproval).toHaveBeenCalledWith({
        taskId: "gh-approval-task-1",
        body: { approvalStatus: "APPROVED", approvalResponseNote: undefined },
      });
    });
  });
});
