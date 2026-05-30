import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("../features/projects/projectsApi", () => ({
  useGetClientProjectsQuery: (...args: unknown[]) => mockUseGetClientProjectsQuery(...args),
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
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    mockUseGetClientProjectsQuery.mockReset();
    vi.unstubAllGlobals();
  });

  it("filters service selection by active purchased services", () => {
    render(
      <ServiceSelectionPage
        onServiceSelect={vi.fn()}
        onLogout={vi.fn()}
        clientName="Ahmet Yılmaz"
        companyName="Acme E-ticaret"
        availableServiceIds={["growth-hub"]}
      />,
    );

    expect(screen.getByText("Growth & Hub")).toBeInTheDocument();
    expect(screen.queryByText("Meta ADS")).not.toBeInTheDocument();
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
    expect(screen.queryByText("Meta ADS")).not.toBeInTheDocument();

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
    expect(screen.queryByText("Growth & Hub")).not.toBeInTheDocument();
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
