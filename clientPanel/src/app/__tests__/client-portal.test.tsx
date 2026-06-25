import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import type { ReactElement } from "react";
import { ClientVisibleTasksPanel } from "../components/client-visible-tasks-section";
import { ServiceSelectionPage } from "../pages/service-selection";
import { ClientPortalApp } from "../App";
import { baseApi } from "../services/baseApi";
import authReducer, { type AuthState } from "../features/auth/authSlice";
import type { AuthUserProfile, ClientPurchasedService } from "../features/auth/authTypes";
import { getActivePurchasedServiceIds, parseAuthUserProfile } from "../features/auth/authNormalizers";
import type { ClientTask } from "../features/tasks/tasksTypes";

const mockUseGetClientProjectsQuery = vi.hoisted(() => vi.fn());
const mockUseGetClientTasksQuery = vi.hoisted(() => vi.fn());
const mockUseGetWebAppWorkspaceQuery = vi.hoisted(() => vi.fn());
const mockUseGetClientMeetingRequestsQuery = vi.hoisted(() => vi.fn());
const mockUseGetClientGrowthHubSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnSocialMediaSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnMetaAdsSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnTikTokAdsSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnAmazonAdsSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnWebMobileDesignSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnTechnicalSupportSummaryQuery = vi.hoisted(() => vi.fn());
const mockUseGetOwnSeoAuditSummaryQuery = vi.hoisted(() => vi.fn());

vi.mock("../features/projects/projectsApi", () => ({
  useGetClientProjectsQuery: (...args: unknown[]) => mockUseGetClientProjectsQuery(...args),
}));

vi.mock("../features/tasks/tasksApi", () => ({
  useGetClientTasksQuery: (...args: unknown[]) => mockUseGetClientTasksQuery(...args),
}));

vi.mock("../features/webAppWorkspace/webAppWorkspaceApi", () => ({
  useGetWebAppWorkspaceQuery: (...args: unknown[]) => mockUseGetWebAppWorkspaceQuery(...args),
  useGetClientMeetingRequestsQuery: (...args: unknown[]) => mockUseGetClientMeetingRequestsQuery(...args),
}));

vi.mock("../features/growthHub/growthHubApi", () => ({
  useGetClientGrowthHubSummaryQuery: (...args: unknown[]) =>
    mockUseGetClientGrowthHubSummaryQuery(...args),
}));

vi.mock("../features/socialMedia/socialMediaApi", () => ({
  useGetOwnSocialMediaSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnSocialMediaSummaryQuery(...args),
}));

vi.mock("../features/metaAds/metaAdsApi", () => ({
  useGetOwnMetaAdsSummaryQuery: (...args: unknown[]) => mockUseGetOwnMetaAdsSummaryQuery(...args),
}));

vi.mock("../features/tiktokAds/tiktokAdsApi", () => ({
  useGetOwnTikTokAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnTikTokAdsSummaryQuery(...args),
}));

vi.mock("../features/amazonAds/amazonAdsApi", () => ({
  useGetOwnAmazonAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnAmazonAdsSummaryQuery(...args),
}));

vi.mock("../features/webMobileDesign/webMobileDesignApi", () => ({
  useGetOwnWebMobileDesignSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnWebMobileDesignSummaryQuery(...args),
}));

vi.mock("../features/technicalSupport/technicalSupportApi", () => ({
  useGetOwnTechnicalSupportSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnTechnicalSupportSummaryQuery(...args),
}));

vi.mock("../features/seoAudit/seoAuditApi", () => ({
  useGetOwnSeoAuditSummaryQuery: (...args: unknown[]) =>
    mockUseGetOwnSeoAuditSummaryQuery(...args),
}));

vi.mock("../pages/reports", () => ({
  ReportsPage: ({ projectId }: { projectId?: string | null }) => (
    <div data-testid="reports-project-id">{projectId ?? "none"}</div>
  ),
}));

const SELECTED_SERVICE_STORAGE_KEY = "socialtech-client-selected-service";
const CURRENT_PAGE_STORAGE_KEY = "socialtech-client-current-page";

describe("client portal service access", () => {
  beforeEach(() => {
    mockUseGetClientProjectsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
    mockUseGetClientMeetingRequestsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseGetClientGrowthHubSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnSocialMediaSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnMetaAdsSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnTikTokAdsSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnAmazonAdsSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnWebMobileDesignSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnTechnicalSupportSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetOwnSeoAuditSummaryQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    mockUseGetClientProjectsQuery.mockReset();
    mockUseGetClientTasksQuery.mockReset();
    mockUseGetWebAppWorkspaceQuery.mockReset();
    mockUseGetClientMeetingRequestsQuery.mockReset();
    mockUseGetClientGrowthHubSummaryQuery.mockReset();
    mockUseGetOwnSocialMediaSummaryQuery.mockReset();
    mockUseGetOwnMetaAdsSummaryQuery.mockReset();
    mockUseGetOwnTikTokAdsSummaryQuery.mockReset();
    mockUseGetOwnAmazonAdsSummaryQuery.mockReset();
    mockUseGetOwnWebMobileDesignSummaryQuery.mockReset();
    mockUseGetOwnTechnicalSupportSummaryQuery.mockReset();
    mockUseGetOwnSeoAuditSummaryQuery.mockReset();
    vi.unstubAllGlobals();
  });

  it("shows all service cards with active purchased services first", () => {
    render(
      <ServiceSelectionPage
        onServiceSelect={vi.fn()}
        onLogout={vi.fn()}
        clientName="Ahmet Yılmaz"
        companyName="Acme E-ticaret"
        availableServiceIds={["growth-hub"]}
      />,
    );

    const growthHubCard = screen.getByRole("button", { name: /Growth & Hub/ });
    const metaAdsCard = screen.getByRole("button", { name: /Meta ADS/ });

    expect(growthHubCard).toBeEnabled();
    expect(metaAdsCard).toBeDisabled();
    expect(
      growthHubCard.compareDocumentPosition(metaAdsCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("clears an unauthorized stored service and falls back to service selection", async () => {
    window.localStorage.setItem(SELECTED_SERVICE_STORAGE_KEY, "meta-ads");
    window.localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, "service-dashboard");

    renderWithStore(<ClientPortalApp />, {
      auth: createAuthenticatedAuthState([
        {
          serviceId: "growth-hub",
          status: "ACTIVE",
        },
      ]),
    });

    expect(
      screen.getByText("Hangi hizmet panelini görüntülemek istiyorsunuz?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Growth & Hub")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Meta ADS/ })).toBeDisabled();

    await waitFor(() => {
      expect(window.localStorage.getItem(SELECTED_SERVICE_STORAGE_KEY)).toBeNull();
      expect(window.localStorage.getItem(CURRENT_PAGE_STORAGE_KEY)).toBeNull();
    });
  });

  it("shows an empty state when there are no active purchased services", () => {
    render(
      <ServiceSelectionPage
        onServiceSelect={vi.fn()}
        onLogout={vi.fn()}
        clientName="Ahmet Yılmaz"
        companyName="Acme E-ticaret"
        availableServiceIds={[]}
      />,
    );

    expect(screen.getByText("Aktif hizmet bulunmuyor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Growth & Hub/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Meta ADS/ })).toBeDisabled();
  });

  it("renders Web APP card KPIs from workspace and client task data", () => {
    mockUseGetClientProjectsQuery.mockReturnValue({
      data: [{ id: "web-project", name: "Client Portal Build", serviceKey: "WEB_APP" }],
      isLoading: false,
      isError: false,
    });
    mockUseGetClientTasksQuery.mockReturnValue({
      data: [
        {
          ...createTaskBase(),
          id: "task-1",
          projectId: "web-project",
          projectServiceId: "web-app",
          progressPercent: 40,
          sprint: { id: "sprint-1", name: "Sprint 1", status: "ACTIVE" },
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        sourceOfTruth: {
          tasks: [
            {
              id: "workspace-task-1",
              title: "Canlı önizleme",
              status: "IN_PROGRESS",
              priority: "HIGH",
              progressPercent: 70,
            },
          ],
          sprints: [
            {
              id: "sprint-1",
              name: "Sprint 1",
              status: "ACTIVE",
              startDate: "2026-06-01T00:00:00.000Z",
              endDate: "2026-06-15T00:00:00.000Z",
            },
            {
              id: "sprint-2",
              name: "Sprint 2",
              status: "PLANNED",
              startDate: "2026-06-16T00:00:00.000Z",
              endDate: "2026-06-30T00:00:00.000Z",
            },
          ],
          releases: [],
          files: [],
        },
      },
      isLoading: false,
      isError: false,
    });

    render(
      <ServiceSelectionPage
        onServiceSelect={vi.fn()}
        onLogout={vi.fn()}
        clientName="Ahmet Yılmaz"
        companyName="Acme E-ticaret"
        availableServiceIds={["web-app"]}
      />,
    );

    const webAppCard = screen.getByRole("button", { name: /Web APP/ });

    expect(within(webAppCard).getByText("%70")).toBeInTheDocument();
    expect(within(webAppCard).getByText("2")).toBeInTheDocument();
    expect(within(webAppCard).getByText("Sprint")).toBeInTheDocument();
  });

  it("normalizes active purchased services from auth profile serviceKey fields", () => {
    const user = parseAuthUserProfile({
      id: "user-1",
      email: "client@socialtech.com",
      displayName: "Ahmet Yılmaz",
      accountType: "CLIENT",
      role: "CLIENT_OWNER",
      status: "ACTIVE",
      permissions: ["portal.read.own"],
      clientProfile: {
        id: "client-1",
        slug: "acme-e-ticaret",
        companyName: "Acme E-ticaret",
        contactEmail: "client@socialtech.com",
        purchasedServices: [
          { serviceKey: "GROWTH_HUB", status: "ACTIVE" },
          { serviceKey: "MEDIA_HUB", status: "ACTIVE" },
          { serviceKey: "META_ADS", status: "ACTIVE" },
          { serviceKey: "GOOGLE_ADS", status: "INACTIVE" },
        ],
      },
    });

    expect(getActivePurchasedServiceIds(user)).toEqual(["growth-hub", "media-hub", "meta-ads"]);
  });

  it("does not send Growth Hub project ids to shared web-app report queries", async () => {
    window.localStorage.setItem(SELECTED_SERVICE_STORAGE_KEY, "growth-hub");
    window.localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, "reports");
    mockUseGetClientProjectsQuery.mockReturnValue({
      data: [{ id: "growth-project", name: "Growth Hub Launch", serviceKey: "GROWTH_HUB" }],
      isLoading: false,
      isError: false,
    });

    renderWithStore(<ClientPortalApp />, {
      auth: createAuthenticatedAuthState([{ serviceId: "growth-hub", status: "ACTIVE" }]),
    });

    expect(await screen.findByTestId("reports-project-id")).toHaveTextContent("none");
  });

  it("keeps web-app project ids available for shared report queries", async () => {
    window.localStorage.setItem(SELECTED_SERVICE_STORAGE_KEY, "web-app");
    window.localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, "reports");
    mockUseGetClientProjectsQuery.mockReturnValue({
      data: [{ id: "web-project", name: "Client Portal Build", serviceKey: "WEB_APP" }],
      isLoading: false,
      isError: false,
    });

    renderWithStore(<ClientPortalApp />, {
      auth: createAuthenticatedAuthState([{ serviceId: "web-app", status: "ACTIVE" }]),
    });

    expect(await screen.findByTestId("reports-project-id")).toHaveTextContent("web-project");
  });
});

describe("client visible tasks", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders client-visible todo tasks and hides internal todo tasks", () => {
    render(
      <ClientVisibleTasksPanel
        tasks={[
          {
            ...createTaskBase(),
            id: "task-1",
            title: "Growth task",
            description: "Müşteriye açık yapılacak iş",
            status: "TODO",
            projectName: "Growth sprint",
            todos: [
              {
                id: "todo-1",
                title: "Client visible todo",
                description: "Müşterinin görebileceği aksiyon",
                visibility: "CLIENT_VISIBLE",
                isCompleted: false,
              },
              {
                id: "todo-2",
                title: "Internal todo",
                description: "İç ekip notu",
                visibility: "INTERNAL",
                isCompleted: false,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Client visible todo")).toBeInTheDocument();
    expect(screen.queryByText("Internal todo")).not.toBeInTheDocument();
  });

  it("renders progress for client-visible in-progress tasks", () => {
    render(
      <ClientVisibleTasksPanel
        tasks={[
          {
            ...createTaskBase(),
            id: "task-3",
            title: "Progress task",
            description: "Devam eden müşteri görünür iş",
            status: "IN_PROGRESS",
            visibility: "CLIENT_VISIBLE",
            priority: "HIGH",
            projectName: "Web app",
            todos: [
              {
                id: "todo-3",
                title: "Tamamlanan görünür aksiyon",
                description: null,
                visibility: "CLIENT_VISIBLE",
                isCompleted: true,
              },
              {
                id: "todo-4",
                title: "Devam eden görünür aksiyon",
                description: null,
                visibility: "CLIENT_VISIBLE",
                isCompleted: false,
              },
            ],
          },
        ]}
      />,
    );

    const progressbar = screen.getByRole("progressbar", {
      name: "Progress task ilerleme",
    });

    expect(screen.getByText("Progress task")).toBeInTheDocument();
    expect(screen.getByText("Devam ediyor")).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
  });
});

function createTaskBase(): ClientTask {
  return {
    id: "task-1",
    projectId: null,
    title: "Task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    visibility: "CLIENT_VISIBLE",
    dueDate: null,
    updatedAt: null,
    projectName: null,
    todos: [],
    progressPercent: 15,
  };
}

function renderWithStore(
  ui: ReactElement,
  options: { auth?: AuthState } = {},
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
      auth: options.auth ?? createAuthenticatedAuthState([]),
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

function createAuthenticatedAuthState(purchasedServices: ClientPurchasedService[]): AuthState {
  return {
    accessToken: "test-token",
    currentUser: createClientUser(purchasedServices),
    isAuthenticated: true,
    isBootstrapping: false,
    error: null,
  };
}

function createClientUser(purchasedServices: ClientPurchasedService[]): AuthUserProfile {
  return {
    id: "user-1",
    email: "client@socialtech.com",
    displayName: "Ahmet Yılmaz",
    accountType: "CLIENT",
    role: "CLIENT_OWNER",
    status: "ACTIVE",
    permissions: ["portal.read.own"],
    purchasedServices: [],
    clientProfile: {
      id: "client-1",
      slug: "acme-e-ticaret",
      companyName: "Acme E-ticaret",
      contactEmail: "client@socialtech.com",
      purchasedServices,
    },
  };
}
