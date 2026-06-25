import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { ClientActionCenter } from "./components/client-action-center";
import { ClientVisibleTasksSection } from "./components/client-visible-tasks-section";
import { ClientLogin, DemoClient } from "./components/client-login";
import { ServiceSelectionPage } from "./pages/service-selection";
import type { ServiceId } from "./data/service-pages";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";
import { useLoginMutation, useLogoutMutation } from "./features/auth/authApi";
import { clearAuth, setAuthError, setCredentials } from "./features/auth/authSlice";
import { selectCurrentUser, selectIsAuthenticated } from "./features/auth/authSelectors";
import {
  getBackendRoleLabel,
  getUserDisplayName,
  getUserInitials,
} from "./features/auth/roleMapping";
import { getActivePurchasedServiceIds, normalizeServiceId } from "./features/auth/authNormalizers";
import type { AuthUserProfile } from "./features/auth/authTypes";
import { useGetClientProjectsQuery } from "./features/projects/projectsApi";
import {
  CLIENT_PORTAL_NAVIGATION_EVENT,
  type ClientPortalNavigationDetail,
} from "./lib/client-portal-navigation";

const SELECTED_SERVICE_STORAGE_KEY = "socialtech-client-selected-service";
const CURRENT_PAGE_STORAGE_KEY = "socialtech-client-current-page";
const DEFAULT_PAGE = "overview";
const SHARED_PAGE_IDS = new Set(["reports", "meetings", "billing", "settings"]);

const DEMO_CLIENT: DemoClient = {
  email: "client@socialtech.com",
  password: "demo123",
  name: "Ahmet Yılmaz",
  company: "Acme E-ticaret",
  initials: "AY",
};

const ReportsPage = lazy(() =>
  import("./pages/reports").then((module) => ({ default: module.ReportsPage })),
);
const MeetingsPage = lazy(() =>
  import("./pages/meetings").then((module) => ({ default: module.MeetingsPage })),
);
const BillingPage = lazy(() =>
  import("./pages/billing").then((module) => ({ default: module.BillingPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/settings").then((module) => ({ default: module.SettingsPage })),
);
const GrowthHubDashboard = lazy(() =>
  import("./pages/services/growth-hub-dashboard").then((module) => ({
    default: module.GrowthHubDashboard,
  })),
);
const SocialMediaDashboard = lazy(() =>
  import("./pages/services/social-media-dashboard").then((module) => ({
    default: module.SocialMediaDashboard,
  })),
);
const MediaHubDashboard = lazy(() =>
  import("./pages/services/medya-hub-dashboard").then((module) => ({
    default: module.MediaHubDashboard,
  })),
);
const MetaAdsDashboard = lazy(() =>
  import("./pages/services/meta-ads-dashboard").then((module) => ({
    default: module.MetaAdsDashboard,
  })),
);
const TikTokAdsDashboard = lazy(() =>
  import("./pages/services/tiktok-ads-dashboard").then((module) => ({
    default: module.TikTokAdsDashboard,
  })),
);
const GoogleAdsDashboard = lazy(() =>
  import("./pages/services/google-ads-dashboard").then((module) => ({
    default: module.GoogleAdsDashboard,
  })),
);
const AmazonAdsDashboard = lazy(() =>
  import("./pages/services/amazon-ads-dashboard").then((module) => ({
    default: module.AmazonAdsDashboard,
  })),
);
const WebAppDashboard = lazy(() =>
  import("./pages/services/web-app-dashboard").then((module) => ({
    default: module.WebAppDashboard,
  })),
);
const SocialAccountsDashboard = lazy(() =>
  import("./pages/services/social-accounts-dashboard").then((module) => ({
    default: module.SocialAccountsDashboard,
  })),
);
const SeoAuditDashboard = lazy(() =>
  import("./pages/services/seo-dashboard").then((module) => ({
    default: module.SeoAuditDashboard,
  })),
);
const TechnicalSupportDashboard = lazy(() =>
  import("./pages/services/technical-support-dashboard").then((module) => ({
    default: module.TechnicalSupportDashboard,
  })),
);
const MobileAppDashboard = lazy(() =>
  import("./pages/services/mobile-app-dashboard").then((module) => ({
    default: module.MobileAppDashboard,
  })),
);
const LandingPagesDashboard = lazy(() =>
  import("./pages/services/landing-pages-dashboard").then((module) => ({
    default: module.LandingPagesDashboard,
  })),
);
const WebMobileDesignDashboard = lazy(() =>
  import("./pages/services/web-mobile-design-dashboard").then((module) => ({
    default: module.WebMobileDesignDashboard,
  })),
);
const ServiceTabPage = lazy(() =>
  import("./pages/service-tab-page").then((module) => ({
    default: module.ServiceTabPage,
  })),
);
const AutomationsPage = lazy(() =>
  import("./pages/automations").then((module) => ({
    default: module.AutomationsPage,
  })),
);

export default function App() {
  return (
    <AuthBootstrap>
      <ClientPortalApp />
    </AuthBootstrap>
  );
}

export function ClientPortalApp() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [selectedService, setSelectedService] = useState<ServiceId | null>(() => readStoredService());
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(() => readStoredPage());
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const activePurchasedServiceIds = useMemo(
    () => (currentUser ? getActivePurchasedServiceIds(currentUser) : []),
    [currentUser],
  );
  const activePurchasedServiceSet = useMemo(
    () => new Set<ServiceId>(activePurchasedServiceIds),
    [activePurchasedServiceIds],
  );
  const { data: clientProjects = [] } = useGetClientProjectsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const scopedProjects = useMemo(() => {
    if (!selectedService) {
      return [];
    }

    return clientProjects.filter((project) => {
      const normalizedService = normalizeServiceId(project.serviceKey);
      return normalizedService ? normalizedService === selectedService : true;
    });
  }, [clientProjects, selectedService]);
  const activeProjectId = selectedProjectId || scopedProjects[0]?.id || null;
  const shouldShowProjectSelector =
    (selectedService === "web-app" || selectedService === "web-mobile-design") &&
    scopedProjects.length > 1;

  // Reports still need web-app workspace specifically.
  const workspaceProjectId = useMemo(() => {
    const webAppProject = clientProjects.find(
      (p) => normalizeServiceId(p.serviceKey) === "web-app",
    );
    return webAppProject?.id ?? null;
  }, [clientProjects]);

  // Meetings: önce seçili servisin projesi, yoksa herhangi bir proje.
  const meetingProjectId = activeProjectId ?? clientProjects[0]?.id ?? null;

  useEffect(() => {
    if (!isAuthenticated || !currentUser || isSupportedClientPortalUser(currentUser)) {
      return;
    }

    setAuthNotice(
      `Bu hesap (${getBackendRoleLabel(currentUser.role)}) Client Portal erişimine uygun değil.`,
    );

    void logout()
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        dispatch(clearAuth());
        setSelectedService(null);
        setCurrentPage(DEFAULT_PAGE);
        clearPortalSelectionStorage();
      });
  }, [currentUser, dispatch, isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || !selectedService) {
      return;
    }

    if (activePurchasedServiceSet.has(selectedService)) {
      return;
    }

    setSelectedService(null);
    setCurrentPage(DEFAULT_PAGE);
    clearPortalSelectionStorage();
  }, [activePurchasedServiceSet, currentUser, isAuthenticated, selectedService]);

  useEffect(() => {
    if (!selectedService) {
      setSelectedProjectId("");
      return;
    }

    if (selectedProjectId && scopedProjects.some((project) => project.id === selectedProjectId)) {
      return;
    }

    setSelectedProjectId(scopedProjects[0]?.id ?? "");
  }, [scopedProjects, selectedProjectId, selectedService]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await login({ email: normalizedEmail, password }).unwrap();

      if (!isSupportedClientPortalUser(result.user)) {
        await logout().unwrap().catch(() => undefined);
        dispatch(clearAuth());

        return {
          success: false,
          message: "Bu hesap Client Portal için yetkili değil.",
        };
      }

      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          currentUser: result.user,
        }),
      );
      dispatch(setAuthError(null));
      setAuthNotice(null);
      return { success: true };
    } catch {
      dispatch(clearAuth());
      return {
        success: false,
        message: "E-posta veya şifre hatalı.",
      };
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Frontend local state should be cleared even when backend logout fails.
    } finally {
      dispatch(clearAuth());
      setSelectedService(null);
      setCurrentPage(DEFAULT_PAGE);
      setAuthNotice(null);
      clearPortalSelectionStorage();
    }
  };

  const handleServiceSelect = (serviceId: ServiceId) => {
    if (!activePurchasedServiceSet.has(serviceId)) {
      setSelectedService(null);
      setCurrentPage(DEFAULT_PAGE);
      clearPortalSelectionStorage();
      return;
    }

    setSelectedService(serviceId);
    setCurrentPage("service-dashboard");
    writeStoredService(serviceId);
    writeStoredPage("service-dashboard");
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setCurrentPage(DEFAULT_PAGE);
    clearPortalSelectionStorage();
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (selectedService) {
      writeStoredPage(page);
    }
  };

  useEffect(() => {
    const handleServiceNavigation = (event: Event) => {
      const detail = (event as CustomEvent<ClientPortalNavigationDetail>).detail;
      const serviceId = normalizeServiceId(detail?.serviceId);
      if (!serviceId || !activePurchasedServiceSet.has(serviceId)) {
        return;
      }

      const page = detail.page ?? "service-dashboard";
      setSelectedService(serviceId);
      setCurrentPage(page);
      writeStoredService(serviceId);
      writeStoredPage(page);
    };

    window.addEventListener(CLIENT_PORTAL_NAVIGATION_EVENT, handleServiceNavigation);
    return () => {
      window.removeEventListener(CLIENT_PORTAL_NAVIGATION_EVENT, handleServiceNavigation);
    };
  }, [activePurchasedServiceSet]);

  const renderContent = () => {
    if (currentPage === "reports") return <ReportsPage projectId={workspaceProjectId} selectedService={selectedService} />;
    if (currentPage === "meetings") return <MeetingsPage projectId={meetingProjectId} />;
    if (currentPage === "billing") return <BillingPage />;
    if (currentPage === "settings") return <SettingsPage />;
    if (currentPage === "competitor-analysis") return <AutomationsPage />;

    if (selectedService === "social-media" && currentPage === "social-accounts") {
      return <SocialAccountsDashboard />;
    }

    if (currentPage === "service-dashboard") {
      switch (selectedService) {
        case "growth-hub":
          return <GrowthHubDashboard />;
        case "social-media":
          return <SocialMediaDashboard />;
        case "media-hub":
          return <MediaHubDashboard />;
        case "meta-ads":
          return <MetaAdsDashboard />;
        case "tiktok-ads":
          return <TikTokAdsDashboard />;
        case "google-ads":
          return <GoogleAdsDashboard />;
        case "amazon-ads":
          return <AmazonAdsDashboard />;
        case "web-app":
          return <WebAppDashboard projectId={activeProjectId} />;
        case "mobile-app":
          return <MobileAppDashboard />;
        case "landing-pages":
          return <LandingPagesDashboard />;
        case "web-mobile-design":
          return <WebMobileDesignDashboard projectId={activeProjectId} />;
        case "technical-support":
          return <TechnicalSupportDashboard />;
        case "seo-audit":
          return <SeoAuditDashboard />;
        default:
          return <GrowthHubDashboard />;
      }
    }

    return (
      <ServiceTabPage
        serviceId={selectedService || "growth-hub"}
        tabId={currentPage}
        projectId={activeProjectId}
      />
    );
  };

  if (!isAuthenticated || !currentUser || !isSupportedClientPortalUser(currentUser)) {
    return (
      <ClientLogin
        demoClient={DEMO_CLIENT}
        onLogin={handleLogin}
        notice={authNotice}
      />
    );
  }

  const clientName = getUserDisplayName(currentUser);
  const companyName = currentUser.clientProfile?.companyName ?? DEMO_CLIENT.company;
  const initials = getUserInitials(currentUser);

  const selectedServiceIsAuthorized =
    selectedService !== null && activePurchasedServiceSet.has(selectedService);
  const isServiceTabDetailPage = !SHARED_PAGE_IDS.has(currentPage) && currentPage !== "service-dashboard";
  const shouldShowClientTasksSection =
    !SHARED_PAGE_IDS.has(currentPage) &&
    !(selectedService === "web-app" && isServiceTabDetailPage);

  if (!selectedServiceIsAuthorized) {
    return (
      <ServiceSelectionPage
        onServiceSelect={handleServiceSelect}
        onLogout={handleLogout}
        clientName={clientName}
        companyName={companyName}
        availableServiceIds={activePurchasedServiceIds}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#131313]">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        selectedService={selectedService}
        onBackToServices={handleBackToServices}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          selectedService={selectedService}
          clientName={clientName}
          companyName={companyName}
          initials={initials}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">
          {shouldShowProjectSelector ? (
            <div className="px-8 pt-6">
              <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-4 py-3">
                <label className="mb-2 block text-xs text-[#A0A0A0]">Proje Seçimi</label>
                <select
                  className="w-full rounded-lg border border-white/[0.12] bg-[#202020] px-3 py-2 text-sm text-white"
                  value={activeProjectId ?? ""}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                >
                  {scopedProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          <Suspense fallback={<PortalContentFallback />}>{renderContent()}</Suspense>
          {shouldShowClientTasksSection ? <ClientVisibleTasksSection selectedService={selectedService} /> : null}
        </main>
        <ClientActionCenter />
      </div>
    </div>
  );
}

function PortalContentFallback() {
  return (
    <div className="p-8">
      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-sm text-[#A0A0A0]">
        Sayfa yükleniyor...
      </div>
    </div>
  );
}

function isSupportedClientPortalUser(user: AuthUserProfile): boolean {
  if (user.accountType !== "CLIENT") {
    return false;
  }

  if (user.status !== "ACTIVE") {
    return false;
  }

  return user.role === "CLIENT_OWNER" || user.role === "CLIENT_MEMBER";
}

function readStoredService(): ServiceId | null {
  if (typeof window === "undefined") return null;

  try {
    const serviceId = window.localStorage.getItem(SELECTED_SERVICE_STORAGE_KEY);
    return normalizeServiceId(serviceId);
  } catch {
    return null;
  }
}

function readStoredPage(): string {
  if (typeof window === "undefined") return DEFAULT_PAGE;

  try {
    return window.localStorage.getItem(CURRENT_PAGE_STORAGE_KEY) ?? DEFAULT_PAGE;
  } catch {
    return DEFAULT_PAGE;
  }
}

function writeStoredService(serviceId: ServiceId): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SELECTED_SERVICE_STORAGE_KEY, serviceId);
  } catch {
    // Optional persistence only.
  }
}

function writeStoredPage(page: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, page);
  } catch {
    // Optional persistence only.
  }
}

function clearPortalSelectionStorage(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(SELECTED_SERVICE_STORAGE_KEY);
    window.localStorage.removeItem(CURRENT_PAGE_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}
