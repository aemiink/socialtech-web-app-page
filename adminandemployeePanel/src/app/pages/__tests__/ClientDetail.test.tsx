/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AdminClientGoogleAdsConnection,
  AdminClientGoogleAdsConfig,
  AdminClientMetaAdsConnection,
  ClientSummaryResponse,
  GoogleAdsSummaryResponse,
  MetaAdsSummaryResponse,
} from "../../features/clients/clientsTypes";
import { ClientDetail } from "../ClientDetail";

type QueryOptions = {
  skip?: boolean;
};

type ClientSummaryQueryResult = {
  data?: ClientSummaryResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type MetaAdsConnectionQueryResult = {
  data?: AdminClientMetaAdsConnection;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type GoogleAdsConfigQueryResult = {
  data?: AdminClientGoogleAdsConfig;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type GoogleAdsConnectionQueryResult = {
  data?: AdminClientGoogleAdsConnection;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type ClientSummaryWithSensitiveFields = ClientSummaryResponse & {
  passwordHash: string;
  resetToken: string;
  apiSecret: string;
  authorization: string;
};

const mockUseGetClientSummaryQuery = vi.fn<
  (id: string, options: QueryOptions) => ClientSummaryQueryResult
>();
const mockUseGetAdminAssignmentsQuery = vi.fn();
const mockUseGetAdminClientGoogleAdsConfigQuery = vi.fn<
  (id: string, options: QueryOptions) => GoogleAdsConfigQueryResult
>();
const mockUseGetAdminClientGoogleAdsConnectionQuery = vi.fn<
  (id: string, options: QueryOptions) => GoogleAdsConnectionQueryResult
>();
const mockUseGetAdminClientGoogleAdsSummaryQuery = vi.fn();
const mockUseGetAdminClientMetaAdsConnectionQuery = vi.fn<
  (id: string, options: QueryOptions) => MetaAdsConnectionQueryResult
>();
const mockUseGetAdminClientMetaAdsSummaryQuery = vi.fn();
const mockUseUpdateAdminClientGoogleAdsConfigMutation = vi.fn();
const mockUseConnectAdminClientGoogleAdsManualMutation = vi.fn();
const mockUseTestAdminClientGoogleAdsConnectionMutation = vi.fn();
const mockUseDisconnectAdminClientGoogleAdsMutation = vi.fn();
const mockUseConnectAdminClientMetaAdsManualMutation = vi.fn();
const mockUseTestAdminClientMetaAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientMetaAdsMutation = vi.fn();
const mockUseDisconnectAdminClientMetaAdsMutation = vi.fn();
const mockUseResetClientOwnerPasswordMutation = vi.fn();

vi.mock("../../features/clients/clientsApi", () => ({
  useGetClientSummaryQuery: (id: string, options: QueryOptions) =>
    mockUseGetClientSummaryQuery(id, options),
  useGetAdminClientGoogleAdsConfigQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientGoogleAdsConfigQuery(id, options),
  useGetAdminClientGoogleAdsConnectionQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientGoogleAdsConnectionQuery(id, options),
  useGetAdminClientGoogleAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAdminClientGoogleAdsSummaryQuery(...args),
  useConnectAdminClientGoogleAdsManualMutation: () =>
    mockUseConnectAdminClientGoogleAdsManualMutation(),
  useTestAdminClientGoogleAdsConnectionMutation: () =>
    mockUseTestAdminClientGoogleAdsConnectionMutation(),
  useDisconnectAdminClientGoogleAdsMutation: () =>
    mockUseDisconnectAdminClientGoogleAdsMutation(),
  useGetAdminClientMetaAdsConnectionQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientMetaAdsConnectionQuery(id, options),
  useGetAdminClientMetaAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAdminClientMetaAdsSummaryQuery(...args),
  useUpdateAdminClientGoogleAdsConfigMutation: () =>
    mockUseUpdateAdminClientGoogleAdsConfigMutation(),
  useConnectAdminClientMetaAdsManualMutation: () =>
    mockUseConnectAdminClientMetaAdsManualMutation(),
  useTestAdminClientMetaAdsConnectionMutation: () =>
    mockUseTestAdminClientMetaAdsConnectionMutation(),
  useSyncAdminClientMetaAdsMutation: () => mockUseSyncAdminClientMetaAdsMutation(),
  useDisconnectAdminClientMetaAdsMutation: () =>
    mockUseDisconnectAdminClientMetaAdsMutation(),
  useResetClientOwnerPasswordMutation: () => mockUseResetClientOwnerPasswordMutation(),
}));
vi.mock("../../features/adminAssignments/adminAssignmentsApi", () => ({
  useGetAdminAssignmentsQuery: (...args: unknown[]) => mockUseGetAdminAssignmentsQuery(...args),
}));

const clientProfileId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";

const clientSummary: ClientSummaryResponse = {
  client: {
    id: clientProfileId,
    name: "Acme E-ticaret",
    slug: "acme-e-ticaret",
    status: "ACTIVE",
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-29T10:00:00.000Z",
  },
  projects: {
    total: 9,
    planned: 1,
    inProgress: 2,
    review: 3,
    completed: 4,
    onHold: 5,
    recent: [
      {
        id: projectId,
        name: "Growth Hub Launch",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2026-05-20T00:00:00.000Z",
        updatedAt: "2026-04-29T10:00:00.000Z",
      },
    ],
  },
  tasks: {
    total: 14,
    todo: 6,
    inProgress: 7,
    review: 8,
    done: 9,
    blocked: 10,
    recent: [
      {
        id: taskId,
        title: "Landing page QA",
        status: "REVIEW",
        priority: "URGENT",
        dueDate: "2026-05-10T00:00:00.000Z",
        updatedAt: "2026-04-29T11:00:00.000Z",
        projectId,
      },
    ],
  },
  meta: {
    generatedAt: "2026-04-30T10:00:00.000Z",
  },
};

const metaAdsConnectionSummary: AdminClientMetaAdsConnection = {
  clientProfileId,
  connectionStatus: "CONNECTED",
  hasActiveService: true,
  ids: {
    businessId: "biz-1",
    adAccountId: "act-1",
    pixelId: "px-1",
    instagramAccountId: "ig-1",
    facebookPageId: "pg-1",
  },
  settings: {
    currency: "TRY",
    timezone: "Europe/Istanbul",
  },
  lastSyncAt: "2026-05-01T10:00:00.000Z",
  syncError: null,
  credential: {
    hasToken: true,
    tokenLastUpdatedAt: "2026-05-01T09:00:00.000Z",
    tokenExpiresAt: "2026-06-01T09:00:00.000Z",
    grantedScopes: ["ads_read"],
  },
};

const metaAdsSummary: MetaAdsSummaryResponse = {
  spend: 150,
  impressions: 15000,
  reach: 8000,
  clicks: 300,
  ctr: 2,
  cpc: 0.5,
  cpm: 10,
  frequency: 1.88,
  results: 30,
  costPerResult: 5,
  roas: 2.8,
  dateRange: {
    since: "2026-05-07",
    until: "2026-05-08",
  },
  lastSyncAt: "2026-05-09T10:00:00.000Z",
};

const googleAdsConfigSummary: AdminClientGoogleAdsConfig = {
  clientProfileId,
  customerId: "1234567890",
  managerCustomerId: "0987654321",
  descriptiveName: "Acme Ads",
  currencyCode: "TRY",
  timeZone: "Europe/Istanbul",
  connectionStatus: "CONNECTED",
  lastSyncAt: "2026-05-10T12:00:00.000Z",
  syncError: null,
};

const googleAdsConnectionSummary: AdminClientGoogleAdsConnection = {
  clientProfileId,
  connectionStatus: "CONNECTED",
  hasActiveService: true,
  account: {
    customerId: "1234567890",
    managerCustomerId: "0987654321",
    descriptiveName: "Acme Ads",
    currencyCode: "TRY",
    timeZone: "Europe/Istanbul",
  },
  lastSyncAt: "2026-05-10T12:00:00.000Z",
  syncError: null,
  credential: {
    hasRefreshToken: true,
    tokenLastUpdatedAt: "2026-05-10T11:30:00.000Z",
    tokenExpiresAt: "2026-06-10T11:30:00.000Z",
    grantedScopes: ["https://www.googleapis.com/auth/adwords"],
  },
};

const googleAdsSummary: GoogleAdsSummaryResponse = {
  cost: 1200,
  impressions: 45000,
  clicks: 2400,
  conversions: 132,
  conversionValue: 5200,
  ctr: 5.33,
  averageCpc: 0.5,
  costPerConversion: 9.09,
  dateRange: {
    since: "2026-05-01",
    until: "2026-05-10",
  },
  lastSyncAt: "2026-05-10T12:00:00.000Z",
};

function setupSummaryState(overrides: Partial<ClientSummaryQueryResult> = {}) {
  mockUseGetClientSummaryQuery.mockReturnValue({
    data: clientSummary,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupMetaAdsConnectionState(overrides: Partial<MetaAdsConnectionQueryResult> = {}) {
  mockUseGetAdminClientMetaAdsConnectionQuery.mockReturnValue({
    data: metaAdsConnectionSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupGoogleAdsConfigState(overrides: Partial<GoogleAdsConfigQueryResult> = {}) {
  mockUseGetAdminClientGoogleAdsConfigQuery.mockReturnValue({
    data: googleAdsConfigSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupGoogleAdsConnectionState(
  overrides: Partial<GoogleAdsConnectionQueryResult> = {},
) {
  mockUseGetAdminClientGoogleAdsConnectionQuery.mockReturnValue({
    data: googleAdsConnectionSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupGoogleAdsSummaryState(
  overrides: Partial<{
    data: GoogleAdsSummaryResponse | undefined;
    error: unknown;
    isLoading: boolean;
    isFetching: boolean;
  }> = {},
) {
  mockUseGetAdminClientGoogleAdsSummaryQuery.mockReturnValue({
    data: googleAdsSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupMetaAdsSummaryState(
  overrides: Partial<{
    data: MetaAdsSummaryResponse | undefined;
    error: unknown;
    isLoading: boolean;
    isFetching: boolean;
  }> = {},
) {
  mockUseGetAdminClientMetaAdsSummaryQuery.mockReturnValue({
    data: metaAdsSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderClientDetail(id: string = clientProfileId) {
  render(
    <MemoryRouter initialEntries={[`/musteriler/${id}`]}>
      <Routes>
        <Route path="/musteriler/:id" element={<ClientDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ClientDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSummaryState();
    setupGoogleAdsConfigState();
    setupGoogleAdsConnectionState();
    setupGoogleAdsSummaryState();
    setupMetaAdsConnectionState();
    setupMetaAdsSummaryState();
    mockUseUpdateAdminClientGoogleAdsConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseConnectAdminClientGoogleAdsManualMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseTestAdminClientGoogleAdsConnectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDisconnectAdminClientGoogleAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseConnectAdminClientMetaAdsManualMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseTestAdminClientMetaAdsConnectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseSyncAdminClientMetaAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDisconnectAdminClientMetaAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseResetClientOwnerPasswordMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseGetAdminAssignmentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it("shows invalid UUID state and skips the summary query", () => {
    renderClientDetail("not-a-uuid");

    expect(screen.getByText("Geçersiz müşteri kimliği.")).toBeInTheDocument();
    expect(mockUseGetClientSummaryQuery).toHaveBeenCalledWith("", { skip: true });
    expect(mockUseGetAdminClientGoogleAdsConfigQuery).toHaveBeenCalledWith("", { skip: true });
  });

  it("shows loading state while summary is loading", () => {
    setupSummaryState({ data: undefined, isLoading: true, isFetching: true });

    renderClientDetail();

    expect(screen.getByText("Müşteri özeti yükleniyor...")).toBeInTheDocument();
    expect(mockUseGetClientSummaryQuery).toHaveBeenCalledWith(clientProfileId, { skip: false });
  });

  it("shows not found state for 404 summary errors", () => {
    setupSummaryState({
      data: undefined,
      error: { status: 404, data: { message: "Client summary not found." } },
      isError: true,
    });

    renderClientDetail();

    expect(screen.getByText("Müşteri kaydı bulunamadı.")).toBeInTheDocument();
  });

  it("shows error state when summary request fails", () => {
    setupSummaryState({
      data: undefined,
      error: { status: 500, data: { message: "Müşteri summary servisi kullanılamıyor." } },
      isError: true,
    });

    renderClientDetail();

    expect(screen.getByText("Müşteri summary servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("renders client info from the summary endpoint", () => {
    renderClientDetail();

    expect(mockUseGetClientSummaryQuery).toHaveBeenCalledWith(clientProfileId, { skip: false });
    expect(mockUseGetAdminClientGoogleAdsConfigQuery).toHaveBeenCalledWith(clientProfileId, {
      skip: false,
    });
    expect(mockUseUpdateAdminClientGoogleAdsConfigMutation).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Acme E-ticaret" })).toBeInTheDocument();
    expect(screen.getAllByText("acme-e-ticaret").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aktif").length).toBeGreaterThan(0);
    expect(screen.getByText(clientProfileId)).toBeInTheDocument();
    expect(screen.getByText("Müşteri Portal Şifre Sıfırlama")).toBeInTheDocument();
    expect(screen.getByText("Google Ads Konfigürasyonu")).toBeInTheDocument();
    expect(screen.getByText("Config düzenle")).toBeInTheDocument();
    expect(screen.getByText("Customer ID")).toBeInTheDocument();
    expect(screen.getAllByText("Token Güncelle / Manual Connect").length).toBeGreaterThan(0);
    expect(screen.getByText("Google Ads Performans Özeti")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Yeni refresh token (write-only)")).toBeInTheDocument();
    expect(screen.getByText("Meta Ads Bağlantı Yönetimi")).toBeInTheDocument();
    expect(screen.getAllByText("Token Durumu").length).toBeGreaterThan(0);
  });

  it("renders project and task counts", () => {
    renderClientDetail();

    expect(screen.getByText("Proje Sayıları")).toBeInTheDocument();
    expect(screen.getByText("Görev Sayıları")).toBeInTheDocument();
    expect(screen.getByText("Toplam Proje")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Planlandı")).toBeInTheDocument();
    expect(screen.getByText("Bloke")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders Google Ads config values in the detail card", () => {
    renderClientDetail();

    expect(screen.getByText("Google Ads Konfigürasyonu")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("0987654321")).toBeInTheDocument();
    expect(screen.getByText("Europe/Istanbul")).toBeInTheDocument();
    expect(screen.getByText("TRY")).toBeInTheDocument();
  });

  it("deduplicates repeated Google Ads permission errors into a single message", () => {
    setupGoogleAdsConfigState({
      data: undefined,
      error: { status: 403, data: { message: "Missing required permissions." } },
    });
    setupGoogleAdsConnectionState({
      data: undefined,
      error: { status: 403, data: { message: "Missing required permissions." } },
    });
    setupGoogleAdsSummaryState({
      data: undefined,
      error: { status: 403, data: { message: "Missing required permissions." } },
    });

    renderClientDetail();

    expect(screen.getAllByText("Bu işlem için yetkiniz bulunmuyor.")).toHaveLength(1);
  });

  it("renders recent projects and tasks with links", () => {
    renderClientDetail();

    expect(screen.getByText("Son Projeler")).toBeInTheDocument();
    expect(screen.getByText("Son Görevler")).toBeInTheDocument();
    expect(screen.getAllByText("Growth Hub Launch").length).toBeGreaterThan(0);
    expect(screen.getByText("Landing page QA")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Projeyi Aç/i })).toHaveAttribute(
      "href",
      `/projeler/${projectId}`,
    );
    expect(screen.getByRole("link", { name: /Görevi Aç/i })).toHaveAttribute(
      "href",
      `/gorevler/${taskId}`,
    );
    expect(screen.getByRole("link", { name: /Projeye Git/i })).toHaveAttribute(
      "href",
      `/projeler/${projectId}`,
    );
  });

  it("shows empty recent states", () => {
    setupSummaryState({
      data: {
        ...clientSummary,
        projects: {
          ...clientSummary.projects,
          recent: [],
        },
        tasks: {
          ...clientSummary.tasks,
          recent: [],
        },
      },
    });

    renderClientDetail();

    expect(screen.getByText("Bu müşteriye bağlı son proje bulunmuyor.")).toBeInTheDocument();
    expect(screen.getByText("Bu müşteriye bağlı son görev bulunmuyor.")).toBeInTheDocument();
  });

  it("does not render sensitive fields returned by the summary API", () => {
    const sensitiveSummary: ClientSummaryWithSensitiveFields = {
      ...clientSummary,
      passwordHash: "hashed-password-value",
      resetToken: "reset-token-value",
      apiSecret: "api-secret-value",
      authorization: "Bearer sensitive-value",
    };

    setupSummaryState({ data: sensitiveSummary });

    renderClientDetail();

    expect(document.body).not.toHaveTextContent(/hashed-password-value/i);
    expect(document.body).not.toHaveTextContent(/reset-token-value/i);
    expect(document.body).not.toHaveTextContent(/api-secret-value/i);
    expect(document.body).not.toHaveTextContent(/Bearer sensitive-value/i);
  });
});
