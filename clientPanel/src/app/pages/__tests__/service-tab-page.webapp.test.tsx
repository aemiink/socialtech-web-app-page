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
          tasks: [
            {
              id: "t1",
              title: "Homepage review",
              code: "FEAT-001",
              status: "REVIEW",
              priority: "HIGH",
              type: "FEATURE",
              sprintId: "s1",
              sprint: {
                id: "s1",
                name: "Sprint 1",
                status: "ACTIVE",
                startDate: "2026-05-01T00:00:00.000Z",
                endDate: "2026-05-15T00:00:00.000Z",
              },
            },
          ],
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
          files: [
            {
              id: "file-1",
              title: "Homepage wireframe",
              category: "DESIGN",
              originalFileName: "homepage-wireframe.pdf",
              secureUrl:
                "https://res.cloudinary.com/demo/image/upload/v1781469859/project/homepage-wireframe.pdf",
              mimeType: "application/pdf",
              visibility: "CLIENT_VISIBLE",
              createdAt: "2026-05-02T09:00:00.000Z",
              folder: { id: "folder-1", name: "PROJECT-Acme Web App/DESIGN-FEAT-001 - Homepage review" },
            },
          ],
        },
        sections: [],
        messages: [],
        revisions: [],
      },
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="web-app" tabId="project-roadmap" projectId="p1" />);

    expect(screen.getByText("Sprint Yol Haritası")).toBeInTheDocument();
    expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    expect(screen.getByText("Yayın Planı")).toBeInTheDocument();
    expect(screen.getByText("Release 1.0.0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Homepage review/ }));

    expect(screen.getByText("Göreve Eklenen Dosyalar")).toBeInTheDocument();
    expect(screen.getAllByText("Homepage wireframe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("homepage-wireframe.pdf").length).toBeGreaterThan(0);
    expect(screen.getByTitle("Homepage wireframe önizleme")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/demo/image/upload/v1781469859/project/homepage-wireframe.pdf",
    );

    fireEvent.click(screen.getByRole("button", { name: "Homepage wireframe önizlemeyi büyüt" }));

    expect(screen.getByRole("button", { name: "Önizlemeyi kapat" })).toBeInTheDocument();
    expect(screen.getAllByTitle("Homepage wireframe önizleme")).toHaveLength(2);
  });

  it("shows selectable sprint progress on sprint-status tab", () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: { id: "p1", clientProfileId: "c1", serviceKey: "WEB_APP", name: "Acme Web App" },
        sourceOfTruth: {
          tasks: [
            {
              id: "t1",
              title: "Arayüz analizi",
              code: "FEAT-010",
              status: "TODO",
              priority: "HIGH",
              type: "FEATURE",
              sprintId: "s1",
              completion: {
                totalTodos: 2,
                completedTodos: 1,
                remainingTodos: 1,
                completionPercentage: 50,
              },
              progressPercent: 50,
              sprint: {
                id: "s1",
                name: "Sprint 1",
                status: "ACTIVE",
                startDate: "2026-05-01T00:00:00.000Z",
                endDate: "2026-05-15T00:00:00.000Z",
              },
            },
            {
              id: "t2",
              title: "Wireframe tasarımı",
              code: "FEAT-011",
              status: "IN_PROGRESS",
              priority: "MEDIUM",
              type: "FEATURE",
              sprintId: "s1",
              completion: {
                totalTodos: 2,
                completedTodos: 1,
                remainingTodos: 1,
                completionPercentage: 50,
              },
              progressPercent: 50,
              sprint: {
                id: "s1",
                name: "Sprint 1",
                status: "ACTIVE",
                startDate: "2026-05-01T00:00:00.000Z",
                endDate: "2026-05-15T00:00:00.000Z",
              },
            },
            {
              id: "t3",
              title: "Yayın kontrolü",
              code: "FEAT-012",
              status: "TODO",
              priority: "LOW",
              type: "QA",
              sprintId: "s2",
              completion: {
                totalTodos: 3,
                completedTodos: 3,
                remainingTodos: 0,
                completionPercentage: 100,
              },
              progressPercent: 100,
              sprint: {
                id: "s2",
                name: "Sprint 2",
                status: "COMPLETED",
                startDate: "2026-05-16T00:00:00.000Z",
                endDate: "2026-05-30T00:00:00.000Z",
              },
            },
          ],
          sprints: [
            {
              id: "s1",
              name: "Sprint 1",
              status: "ACTIVE",
              startDate: "2026-05-01T00:00:00.000Z",
              endDate: "2026-05-15T00:00:00.000Z",
            },
            {
              id: "s2",
              name: "Sprint 2",
              status: "COMPLETED",
              startDate: "2026-05-16T00:00:00.000Z",
              endDate: "2026-05-30T00:00:00.000Z",
            },
          ],
          releases: [],
          files: [],
        },
        sections: [],
        messages: [],
        revisions: [],
      },
      isLoading: false,
    });

    render(<ServiceTabPage serviceId="web-app" tabId="sprint-status" projectId="p1" />);

    expect(screen.getAllByText("Sprint Durumu").length).toBeGreaterThan(0);
    expect(screen.getByText("%50 tamamlandı")).toBeInTheDocument();
    expect(screen.getByText("Seçili sprint kontrol listesi tamamlanma oranı: %50")).toBeInTheDocument();
    expect(screen.getByText("Arayüz analizi")).toBeInTheDocument();
    expect(screen.getByText("Wireframe tasarımı")).toBeInTheDocument();
    expect(screen.getAllByText("Kontrol listesi: 1/2").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Sprint 2/ }));

    expect(screen.getAllByText("%100 tamamlandı").length).toBeGreaterThan(0);
    expect(screen.getByText("Seçili sprint kontrol listesi tamamlanma oranı: %100")).toBeInTheDocument();
    expect(screen.getByText("Yayın kontrolü")).toBeInTheDocument();
    expect(screen.getByText("Kontrol listesi: 3/3")).toBeInTheDocument();
    expect(screen.queryByText("Wireframe tasarımı")).not.toBeInTheDocument();
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

  it("embeds the project Figma prototype on the ui-ux tab", () => {
    const figmaUrl =
      "https://www.figma.com/proto/acme-file/Client-Portal?node-id=1-2&starting-point-node-id=1%3A2";

    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: {
          id: "p1",
          clientProfileId: "c1",
          serviceKey: "WEB_APP",
          name: "Acme Web App",
          figmaProjectUrl: figmaUrl,
        },
        sourceOfTruth: {
          tasks: [
            {
              id: "t1",
              title: "Prototype interaction review",
              status: "REVIEW",
              priority: "HIGH",
              type: "FEATURE",
              workstream: "UI_INTEGRATION",
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

    render(<ServiceTabPage serviceId="web-app" tabId="ui-ux" projectId="p1" />);

    expect(screen.getByText("Figma Prototip Önizlemesi")).toBeInTheDocument();
    expect(screen.getByText("Prototype interaction review")).toBeInTheDocument();

    const iframe = screen.getByTitle("Figma Prototype Preview");
    expect(iframe).toHaveAttribute("src", expect.stringContaining("https://www.figma.com/embed"));
    expect(iframe).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(figmaUrl)));
  });

  it("renders live preview on the test-deploy tab", () => {
    const livePreviewUrl = "https://staging.acme-web-app.com";

    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: {
          id: "p1",
          clientProfileId: "c1",
          serviceKey: "WEB_APP",
          name: "Acme Web App",
          livePreviewUrl,
        },
        sourceOfTruth: {
          tasks: [],
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

    render(<ServiceTabPage serviceId="web-app" tabId="test-deploy" projectId="p1" />);

    expect(screen.getByText("Web Sayfasının Canlı Önizlemesi")).toBeInTheDocument();
    expect(screen.getByTitle("Web Page Live Preview")).toHaveAttribute("src", livePreviewUrl);
    expect(screen.getByRole("link", { name: "Yeni sekmede aç" })).toHaveAttribute("href", livePreviewUrl);
  });

  it("renders dedicated GA4 integration details on the GA4 tab", () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: {
          id: "p1",
          clientProfileId: "c1",
          serviceKey: "WEB_APP",
          name: "Acme Web App",
          livePreviewUrl: "https://staging.acme-web-app.com",
          ga4MeasurementId: "G-ABC1234567",
          ga4PropertyId: "123456789",
          ga4Status: "CONNECTED",
          ga4MeasurementProfile: "ECOMMERCE",
          ga4LastVerifiedAt: "2026-06-25T12:30:00.000Z",
        },
        sourceOfTruth: {
          tasks: [
            {
              id: "t1",
              title: "GA4 event doğrulama",
              code: "GA4-001",
              status: "IN_PROGRESS",
              priority: "HIGH",
              type: "QA",
              workstream: "QA",
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

    render(<ServiceTabPage serviceId="web-app" tabId="ga4-integration" projectId="p1" />);

    expect(screen.getAllByText("GA4 Entegrasyonu").length).toBeGreaterThan(0);
    expect(screen.getByText("Ölçüm Gözlemi")).toBeInTheDocument();
    expect(screen.getByText("İzleme Kapsamı")).toBeInTheDocument();
    expect(screen.getByText("E-ticaret")).toBeInTheDocument();
    expect(screen.getByText("E-ticaret Satın Alma Yolculuğu")).toBeInTheDocument();
    expect(screen.getByText("Ödeme Yolculuğu")).toBeInTheDocument();
    expect(screen.getByText("GA4 Görevleri")).toBeInTheDocument();
    expect(screen.getByText("GA4 event doğrulama")).toBeInTheDocument();
    expect(screen.getAllByText("Bağlı").length).toBeGreaterThan(0);
    expect(screen.getByText("G-ABC1234567")).toBeInTheDocument();
    expect(screen.getByText("123456789")).toBeInTheDocument();
    expect(screen.getByText("Form gönderimleri")).toBeInTheDocument();
    expect(screen.getByText("view_item")).toBeInTheDocument();
    expect(screen.getByText("add_to_cart")).toBeInTheDocument();
    expect(screen.getAllByText("begin_checkout").length).toBeGreaterThan(0);
    expect(screen.getByText("add_payment_info")).toBeInTheDocument();
    expect(screen.getByText("payment_failed")).toBeInTheDocument();
    expect(screen.getAllByText("purchase").length).toBeGreaterThan(0);
  });

  it("uses the GA4 measurement profile to hide ecommerce payment journeys for corporate sites", () => {
    mockUseGetWebAppWorkspaceQuery.mockReturnValue({
      data: {
        project: {
          id: "p1",
          clientProfileId: "c1",
          serviceKey: "WEB_APP",
          name: "Acme Corporate Site",
          ga4MeasurementId: "G-CORP123456",
          ga4PropertyId: "987654321",
          ga4Status: "CONNECTED",
          ga4MeasurementProfile: "CORPORATE",
        },
        sourceOfTruth: {
          tasks: [],
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

    render(<ServiceTabPage serviceId="web-app" tabId="ga4-integration" projectId="p1" />);

    expect(screen.getByText("Kurumsal site")).toBeInTheDocument();
    expect(screen.getByText("Kurumsal İletişim Yolculuğu")).toBeInTheDocument();
    expect(screen.getByText("İçerik Etkileşim Yolculuğu")).toBeInTheDocument();
    expect(screen.getByText("form_submit")).toBeInTheDocument();
    expect(screen.getByText("click_whatsapp")).toBeInTheDocument();
    expect(screen.queryByText("E-ticaret Satın Alma Yolculuğu")).not.toBeInTheDocument();
    expect(screen.queryByText("Ödeme Yolculuğu")).not.toBeInTheDocument();
    expect(screen.queryByText("add_payment_info")).not.toBeInTheDocument();
    expect(screen.queryByText("purchase")).not.toBeInTheDocument();
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
