/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AdminClientAmazonAdsConnection,
  AdminClientMetaAdsConnection,
  AmazonAdsSummaryResponse,
  ClientSummaryResponse,
  MetaAdsSummaryResponse,
} from "../../features/clients/clientsTypes";
import type {
  AdminTikTokAdsConnection,
  TikTokAdsSummaryResponse,
} from "../../features/tiktokAds/tiktokAdsTypes";
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

type AmazonAdsConnectionQueryResult = {
  data?: AdminClientAmazonAdsConnection;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type TikTokAdsConnectionQueryResult = {
  data?: AdminTikTokAdsConnection;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type TikTokAdsSummaryQueryResult = {
  data?: TikTokAdsSummaryResponse;
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
const mockUseGetAdminClientMetaAdsConnectionQuery = vi.fn<
  (id: string, options: QueryOptions) => MetaAdsConnectionQueryResult
>();
const mockUseGetAdminClientMetaAdsSummaryQuery = vi.fn();
const mockUseConnectAdminClientMetaAdsManualMutation = vi.fn();
const mockUseTestAdminClientMetaAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientMetaAdsMutation = vi.fn();
const mockUseDisconnectAdminClientMetaAdsMutation = vi.fn();
const mockUseGetAdminClientAmazonAdsConnectionQuery = vi.fn<
  (id: string, options: QueryOptions) => AmazonAdsConnectionQueryResult
>();
const mockUseGetAdminClientAmazonAdsSummaryQuery = vi.fn();
const mockUseUpdateAdminClientAmazonAdsConfigMutation = vi.fn();
const mockUseCreateAdminClientAmazonAdsOAuthUrlMutation = vi.fn();
const mockUseExchangeAdminClientAmazonAdsOAuthCodeMutation = vi.fn();
const mockUseConnectAdminClientAmazonAdsManualMutation = vi.fn();
const mockUseTestAdminClientAmazonAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientAmazonAdsMutation = vi.fn();
const mockUseDisconnectAdminClientAmazonAdsMutation = vi.fn();
const mockUseResetClientOwnerPasswordMutation = vi.fn();
const mockUseGetAdminClientTikTokAdsConnectionQuery = vi.fn<
  (id: string, options: QueryOptions) => TikTokAdsConnectionQueryResult
>();
const mockUseGetAdminClientTikTokAdsSummaryQuery = vi.fn();
const mockUseConnectAdminClientTikTokAdsManualMutation = vi.fn();
const mockUseTestAdminClientTikTokAdsConnectionMutation = vi.fn();
const mockUseSyncAdminClientTikTokAdsMutation = vi.fn();
const mockUseDisconnectAdminClientTikTokAdsMutation = vi.fn();

vi.mock("../../features/clients/clientsApi", () => ({
  useGetClientSummaryQuery: (id: string, options: QueryOptions) =>
    mockUseGetClientSummaryQuery(id, options),
  useGetAdminClientMetaAdsConnectionQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientMetaAdsConnectionQuery(id, options),
  useGetAdminClientMetaAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAdminClientMetaAdsSummaryQuery(...args),
  useGetAdminClientAmazonAdsConnectionQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientAmazonAdsConnectionQuery(id, options),
  useGetAdminClientAmazonAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAdminClientAmazonAdsSummaryQuery(...args),
  useUpdateAdminClientAmazonAdsConfigMutation: () =>
    mockUseUpdateAdminClientAmazonAdsConfigMutation(),
  useCreateAdminClientAmazonAdsOAuthUrlMutation: () =>
    mockUseCreateAdminClientAmazonAdsOAuthUrlMutation(),
  useExchangeAdminClientAmazonAdsOAuthCodeMutation: () =>
    mockUseExchangeAdminClientAmazonAdsOAuthCodeMutation(),
  useConnectAdminClientAmazonAdsManualMutation: () =>
    mockUseConnectAdminClientAmazonAdsManualMutation(),
  useTestAdminClientAmazonAdsConnectionMutation: () =>
    mockUseTestAdminClientAmazonAdsConnectionMutation(),
  useSyncAdminClientAmazonAdsMutation: () => mockUseSyncAdminClientAmazonAdsMutation(),
  useDisconnectAdminClientAmazonAdsMutation: () =>
    mockUseDisconnectAdminClientAmazonAdsMutation(),
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
vi.mock("../../features/tiktokAds/tiktokAdsApi", () => ({
  useGetAdminClientTikTokAdsConnectionQuery: (id: string, options: QueryOptions) =>
    mockUseGetAdminClientTikTokAdsConnectionQuery(id, options),
  useGetAdminClientTikTokAdsSummaryQuery: (...args: unknown[]) =>
    mockUseGetAdminClientTikTokAdsSummaryQuery(...args),
  useConnectAdminClientTikTokAdsManualMutation: () =>
    mockUseConnectAdminClientTikTokAdsManualMutation(),
  useTestAdminClientTikTokAdsConnectionMutation: () =>
    mockUseTestAdminClientTikTokAdsConnectionMutation(),
  useSyncAdminClientTikTokAdsMutation: () => mockUseSyncAdminClientTikTokAdsMutation(),
  useDisconnectAdminClientTikTokAdsMutation: () =>
    mockUseDisconnectAdminClientTikTokAdsMutation(),
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

const amazonAdsConnectionSummary: AdminClientAmazonAdsConnection = {
  clientProfileId,
  connectionStatus: "CONNECTED",
  hasActiveService: true,
  ids: {
    profileId: "amzn1.profile.test",
    advertiserAccountId: "ENTITY123456789",
    marketplaceId: "ATVPDKIKX0DER",
  },
  account: {
    accountType: "seller",
    accountName: "Amazon Ads E2E",
    validPaymentMethod: true,
  },
  settings: {
    region: "NA",
    countryCode: "US",
    currencyCode: "USD",
    timezone: "America/Los_Angeles",
  },
  lastSyncAt: "2026-05-01T10:00:00.000Z",
  syncError: null,
  credential: {
    hasAccessToken: true,
    hasRefreshToken: true,
    tokenLastUpdatedAt: "2026-05-01T09:00:00.000Z",
    accessTokenExpiresAt: "2026-05-01T10:00:00.000Z",
    refreshTokenExpiresAt: null,
    grantedScopes: ["advertising::campaign_management"],
  },
};

const amazonAdsSummary: AmazonAdsSummaryResponse = {
  spend: 320,
  impressions: 24000,
  clicks: 480,
  sales: 2400,
  orders: 36,
  unitsSold: 40,
  ctr: 2,
  cpc: 0.67,
  acos: 13.33,
  roas: 7.5,
  conversionRate: 7.5,
  dateRange: {
    since: "2026-05-07",
    until: "2026-05-08",
  },
  lastSyncAt: "2026-05-09T10:00:00.000Z",
};

const tikTokAdsConnectionSummary: AdminTikTokAdsConnection = {
  clientProfileId,
  connectionStatus: "CONNECTED",
  hasActiveService: true,
  ids: {
    advertiserId: "1234567890",
    businessCenterId: "bc-1",
    pixelId: "tt-px-1",
  },
  account: {
    advertiserName: "TikTok Test Advertiser",
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
    tokenExpiresAt: "2027-05-01T09:00:00.000Z",
    grantedScopes: [],
  },
};

const tikTokAdsSummary: TikTokAdsSummaryResponse = {
  spend: 210,
  impressions: 42000,
  reach: 22000,
  clicks: 840,
  ctr: 2,
  cpc: 0.25,
  cpm: 5,
  videoViews: 18000,
  videoViews2s: 15000,
  videoViews6s: 9000,
  videoCompletionRate: 50,
  vtr: 42.86,
  conversions: 42,
  costPerConversion: 5,
  conversionRate: 5,
  purchaseValue: 1200,
  dateRange: {
    since: "2026-05-07",
    until: "2026-05-08",
  },
  lastSyncAt: "2026-05-09T10:00:00.000Z",
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

function setupAmazonAdsConnectionState(
  overrides: Partial<AmazonAdsConnectionQueryResult> = {},
) {
  mockUseGetAdminClientAmazonAdsConnectionQuery.mockReturnValue({
    data: amazonAdsConnectionSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupAmazonAdsSummaryState(
  overrides: Partial<{
    data: AmazonAdsSummaryResponse | undefined;
    error: unknown;
    isLoading: boolean;
    isFetching: boolean;
  }> = {},
) {
  mockUseGetAdminClientAmazonAdsSummaryQuery.mockReturnValue({
    data: amazonAdsSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupTikTokAdsConnectionState(
  overrides: Partial<TikTokAdsConnectionQueryResult> = {},
) {
  mockUseGetAdminClientTikTokAdsConnectionQuery.mockReturnValue({
    data: tikTokAdsConnectionSummary,
    error: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupTikTokAdsSummaryState(
  overrides: Partial<TikTokAdsSummaryQueryResult> = {},
) {
  mockUseGetAdminClientTikTokAdsSummaryQuery.mockReturnValue({
    data: tikTokAdsSummary,
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
    setupMetaAdsConnectionState();
    setupAmazonAdsConnectionState();
    setupAmazonAdsSummaryState();
    setupMetaAdsSummaryState();
    setupTikTokAdsConnectionState();
    setupTikTokAdsSummaryState();
    mockUseConnectAdminClientMetaAdsManualMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseTestAdminClientMetaAdsConnectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseSyncAdminClientMetaAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDisconnectAdminClientMetaAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseUpdateAdminClientAmazonAdsConfigMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseCreateAdminClientAmazonAdsOAuthUrlMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseExchangeAdminClientAmazonAdsOAuthCodeMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseConnectAdminClientAmazonAdsManualMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseTestAdminClientAmazonAdsConnectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseSyncAdminClientAmazonAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDisconnectAdminClientAmazonAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseConnectAdminClientTikTokAdsManualMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseTestAdminClientTikTokAdsConnectionMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseSyncAdminClientTikTokAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    mockUseDisconnectAdminClientTikTokAdsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
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
    expect(screen.getByRole("heading", { name: "Acme E-ticaret" })).toBeInTheDocument();
    expect(screen.getAllByText("acme-e-ticaret").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aktif").length).toBeGreaterThan(0);
    expect(screen.getByText(clientProfileId)).toBeInTheDocument();
    expect(screen.getByText("Müşteri Portal Şifre Sıfırlama")).toBeInTheDocument();
    expect(screen.getByText("Meta Ads Bağlantı Yönetimi")).toBeInTheDocument();
    expect(screen.getByText("TikTok Ads Yapılandırması")).toBeInTheDocument();
    expect(screen.getByText("Amazon Ads Yapılandırması")).toBeInTheDocument();
    expect(screen.getByText("Refresh Token ile Bağla")).toBeInTheDocument();
    expect(screen.getByText("OAuth URL Oluştur")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Refresh Token")).toBeInTheDocument();
    expect(screen.getAllByText("Token Durumu").length).toBeGreaterThan(0);
    expect(screen.getByText("Video İzlenme")).toBeInTheDocument();
    expect(screen.getByText("18000")).toBeInTheDocument();
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
