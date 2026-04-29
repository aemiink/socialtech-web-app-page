/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../features/auth/authTypes";
import type {
  AdminAuditLog,
  AdminAuditLogsListQuery,
  AdminAuditLogsListResponse,
} from "../features/auditLogs/auditLogsTypes";
import { AuditLogs } from "./AuditLogs";

type QueryOptions = {
  skip?: boolean;
};

type AuditLogsQueryResult = {
  data?: AdminAuditLogsListResponse;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

type DetailState = {
  data?: AdminAuditLog;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
};

type FetchDetail = (id: string) => void;

const mockUseGetAdminAuditLogsQuery = vi.fn<
  (query: AdminAuditLogsListQuery, options: QueryOptions) => AuditLogsQueryResult
>();
const mockUseLazyGetAdminAuditLogQuery = vi.fn<() => [FetchDetail, DetailState]>();

let currentUser: AuthUserProfile | null = null;
let fetchDetail: FetchDetail = vi.fn();

vi.mock("../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../features/auditLogs/auditLogsApi", () => ({
  useGetAdminAuditLogsQuery: (
    query: AdminAuditLogsListQuery,
    options: QueryOptions,
  ) => mockUseGetAdminAuditLogsQuery(query, options),
  useLazyGetAdminAuditLogQuery: () => mockUseLazyGetAdminAuditLogQuery(),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["audit_logs.read"],
  clientProfile: null,
};

const auditLog: AdminAuditLog = {
  id: "11111111-1111-4111-8111-111111111111",
  action: "ADMIN_USER_UPDATED",
  entityType: "User",
  entityId: "22222222-2222-4222-8222-222222222222",
  actorUserId: "33333333-3333-4333-8333-333333333333",
  targetUserId: "44444444-4444-4444-8444-444444444444",
  targetClientProfileId: null,
  metadata: {
    displayName: "Deniz Developer",
    status: "ACTIVE",
  },
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0",
  createdAt: "2026-04-29T10:15:00.000Z",
};

const auditLogWithSensitiveMetadata: AdminAuditLog = {
  ...auditLog,
  metadata: {
    displayName: "Deniz Developer",
    status: "ACTIVE",
    passwordHash: "hashed-password-value",
    resetToken: "reset-token-value",
    nestedSecret: {
      apiSecret: "api-secret-value",
    },
    requestHeaders: {
      authorization: "Bearer sensitive-value",
    },
  },
};

const emptyListResponse: AdminAuditLogsListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const populatedListResponse: AdminAuditLogsListResponse = {
  data: [auditLog],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function setupListState(overrides: Partial<AuditLogsQueryResult> = {}) {
  mockUseGetAdminAuditLogsQuery.mockReturnValue({
    data: emptyListResponse,
    error: undefined,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...overrides,
  });
}

function setupDetailState(overrides: Partial<DetailState> = {}) {
  fetchDetail = vi.fn<FetchDetail>();
  mockUseLazyGetAdminAuditLogQuery.mockReturnValue([
    fetchDetail,
    {
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      ...overrides,
    },
  ]);
}

function renderAuditLogs() {
  render(<AuditLogs />);
}

function openDetailDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Detay" }));
}

function getLastListQueryCall() {
  return mockUseGetAdminAuditLogsQuery.mock.calls[
    mockUseGetAdminAuditLogsQuery.mock.calls.length - 1
  ];
}

describe("AuditLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = adminUser;
    setupListState();
    setupDetailState();
  });

  it("shows loading state while audit logs are loading", () => {
    setupListState({ data: undefined, isLoading: true });

    renderAuditLogs();

    expect(screen.getByText("Audit log kayıtları yükleniyor...")).toBeInTheDocument();
  });

  it("shows error state when audit logs request fails", () => {
    setupListState({
      data: undefined,
      error: { status: 500, data: { message: "Audit log servisi kullanılamıyor." } },
      isError: true,
    });

    renderAuditLogs();

    expect(screen.getByText("Audit log servisi kullanılamıyor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tekrar Dene" })).toBeInTheDocument();
  });

  it("shows empty state when no audit logs match the filters", () => {
    renderAuditLogs();

    expect(
      screen.getByText("Filtrelere uygun audit log kaydı bulunamadı."),
    ).toBeInTheDocument();
  });

  it("renders audit log rows with formatted labels and identifiers", () => {
    setupListState({ data: populatedListResponse });

    renderAuditLogs();

    expect(screen.getByText("Çalışan Güncellendi")).toBeInTheDocument();
    expect(screen.getByText("Kullanıcı")).toBeInTheDocument();
    expect(screen.getByText("22222222...222222")).toBeInTheDocument();
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Detay" })).toBeInTheDocument();
  });

  it("shows a date range error and skips querying when dateFrom is after dateTo", async () => {
    renderAuditLogs();

    fireEvent.change(screen.getByLabelText("Başlangıç Tarihi"), {
      target: { value: "2026-05-10" },
    });
    fireEvent.change(screen.getByLabelText("Bitiş Tarihi"), {
      target: { value: "2026-05-01" },
    });

    expect(
      await screen.findByText("Başlangıç tarihi bitiş tarihinden büyük olamaz."),
    ).toBeInTheDocument();

    await waitFor(() => {
      const lastCall = getLastListQueryCall();
      expect(lastCall[1]).toEqual({ skip: true });
    });
  });

  it("opens the detail dialog and triggers lazy detail fetch", () => {
    setupListState({ data: populatedListResponse });

    renderAuditLogs();
    openDetailDialog();

    expect(fetchDetail).toHaveBeenCalledWith(auditLog.id);
    expect(screen.getByRole("dialog", { name: "Audit Log Detayı" })).toBeInTheDocument();
  });

  it("shows detail loading state inside the dialog", () => {
    setupListState({ data: populatedListResponse });
    setupDetailState({ isLoading: true });

    renderAuditLogs();
    openDetailDialog();

    expect(screen.getByText("Detay yükleniyor...")).toBeInTheDocument();
  });

  it("shows detail error state inside the dialog", () => {
    setupListState({ data: populatedListResponse });
    setupDetailState({
      error: { status: 500, data: { message: "Audit log detayı alınamadı." } },
      isError: true,
    });

    renderAuditLogs();
    openDetailDialog();

    expect(screen.getByText("Audit log detayı alınamadı.")).toBeInTheDocument();
  });

  it("shows detail success state and sanitizes sensitive metadata", () => {
    setupListState({ data: populatedListResponse });
    setupDetailState({ data: auditLogWithSensitiveMetadata });

    renderAuditLogs();
    openDetailDialog();

    const dialog = screen.getByRole("dialog", { name: "Audit Log Detayı" });
    expect(dialog).toHaveTextContent("Deniz Developer");
    expect(dialog).toHaveTextContent("ACTIVE");
    expect(dialog).not.toHaveTextContent(/password/i);
    expect(dialog).not.toHaveTextContent(/token/i);
    expect(dialog).not.toHaveTextContent(/secret/i);
    expect(dialog).not.toHaveTextContent(/authorization/i);
    expect(dialog).not.toHaveTextContent("hashed-password-value");
    expect(dialog).not.toHaveTextContent("reset-token-value");
    expect(dialog).not.toHaveTextContent("api-secret-value");
    expect(dialog).not.toHaveTextContent("Bearer sensitive-value");
  });

  it("shows forbidden state and skips the list query without audit log permission", () => {
    currentUser = {
      ...adminUser,
      permissions: [],
    };

    renderAuditLogs();

    expect(screen.getByText("Bu sayfaya erişim yetkiniz bulunmuyor.")).toBeInTheDocument();
    expect(getLastListQueryCall()[1]).toEqual({ skip: true });
  });
});
