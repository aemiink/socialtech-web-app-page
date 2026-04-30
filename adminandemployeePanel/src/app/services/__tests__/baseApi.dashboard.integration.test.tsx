/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, { setCredentials } from "../../features/auth/authSlice";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import { dashboardApi } from "../../features/dashboard/dashboardApi";
import { baseApi } from "../baseApi";

type CapturedRequest = {
  url: URL;
  method: string;
  authorization: string | null;
};

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["admin.summary.read"],
  clientProfile: null,
};

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

class TestRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;

  constructor(input: string | URL | TestRequest, init?: RequestInit) {
    if (input instanceof TestRequest) {
      this.url = input.url;
      this.method = init?.method ?? input.method;
      this.headers = new Headers(init?.headers ?? input.headers);
      return;
    }

    this.url = input.toString();
    this.method = init?.method ?? "GET";
    this.headers = new Headers(init?.headers);
  }

  clone(): TestRequest {
    return new TestRequest(this);
  }
}

function createIntegrationStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

describe("baseApi dashboard integration", () => {
  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("Request", TestRequest);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("transforms admin summary response through the dashboard normalizer", async () => {
    const store = createIntegrationStore();
    const requests: CapturedRequest[] = [];

    fetchMock.mockImplementation(async (input, init) => {
      const request = captureRequest(input, init);
      requests.push(request);

      return jsonResponse({
        data: {
          users: {
            total: 12,
            active: "invalid",
            employees: 8,
          },
          clients: {
            total: 4,
            active: 3,
            inactive: null,
            suspended: 1,
          },
          projects: {
            total: 6,
            inProgress: 2,
            completed: -1,
          },
          tasks: {
            total: 20,
            todo: 5,
            blocked: Number.NaN,
          },
          auditLogs: {
            total: "invalid",
            lastActionAt: 123,
          },
          meta: {
            generatedAt: false,
          },
        },
      });
    });

    const result = await store.dispatch(dashboardApi.endpoints.getAdminSummary.initiate());

    expect(result.data).toEqual({
      users: {
        total: 12,
        active: 0,
        inactive: 0,
        employees: 8,
        clients: 0,
        admins: 0,
      },
      clients: {
        total: 4,
        active: 3,
        inactive: 0,
      },
      projects: {
        total: 6,
        planned: 0,
        inProgress: 2,
        review: 0,
        completed: 0,
        onHold: 0,
      },
      tasks: {
        total: 20,
        todo: 5,
        inProgress: 0,
        review: 0,
        done: 0,
        blocked: 0,
      },
      auditLogs: {
        total: 0,
        lastActionAt: null,
      },
      meta: {
        generatedAt: "",
      },
    });
    expect(requests.map((request) => `${request.method} ${request.url.pathname}`)).toEqual([
      "GET /api/v1/admin/summary",
    ]);
  });

  it("clears auth when summary 401 refresh also fails", async () => {
    const store = createIntegrationStore();
    const requests: CapturedRequest[] = [];

    store.dispatch(
      setCredentials({
        accessToken: "stale-access-token",
        currentUser: adminUser,
      }),
    );

    fetchMock.mockImplementation(async (input, init) => {
      const request = captureRequest(input, init);
      requests.push(request);

      if (request.url.pathname.endsWith("/admin/summary")) {
        return jsonResponse({ message: "Unauthorized" }, 401);
      }

      if (request.url.pathname.endsWith("/auth/refresh")) {
        return jsonResponse({ message: "Refresh failed" }, 401);
      }

      return jsonResponse({ message: "Unexpected request" }, 500);
    });

    const result = await store.dispatch(dashboardApi.endpoints.getAdminSummary.initiate());

    expect((result.error as { status?: unknown } | undefined)?.status).toBe(401);
    expect(requests.map((request) => `${request.method} ${request.url.pathname}`)).toEqual([
      "GET /api/v1/admin/summary",
      "POST /api/v1/auth/refresh",
    ]);
    expect(requests[0].authorization).toBe("Bearer stale-access-token");
    expect(store.getState().auth.accessToken).toBeNull();
    expect(store.getState().auth.currentUser).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function captureRequest(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
): CapturedRequest {
  const request = input instanceof Request ? input : new Request(input, init);

  return {
    url: new URL(request.url),
    method: request.method,
    authorization: request.headers.get("authorization"),
  };
}
