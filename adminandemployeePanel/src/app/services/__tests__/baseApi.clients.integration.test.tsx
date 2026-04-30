/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setCredentials } from "../../features/auth/authSlice";
import type { AuthUserProfile, PublicAuthResponse } from "../../features/auth/authTypes";
import { clientsApi } from "../../features/clients/clientsApi";
import type { ClientProfile } from "../../features/clients/clientsTypes";
import authReducer from "../../features/auth/authSlice";
import { baseApi } from "../baseApi";

type CapturedRequest = {
  url: URL;
  method: string;
  authorization: string | null;
  body: unknown;
};

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["clients.read", "clients.manage", "admin.summary.read"],
  clientProfile: null,
};

const clientProfile: ClientProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@example.com",
  status: "ACTIVE",
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-29T10:00:00.000Z",
};

const refreshedAuth: PublicAuthResponse = {
  accessToken: "fresh-access-token",
  accessTokenExpiresAt: "2026-04-30T11:00:00.000Z",
  user: {
    ...adminUser,
    displayName: "Refreshed Admin",
  },
};

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

class TestRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
  private readonly bodyText: string;

  constructor(input: string | URL | TestRequest, init?: RequestInit) {
    if (input instanceof TestRequest) {
      this.url = input.url;
      this.method = init?.method ?? input.method;
      this.headers = new Headers(init?.headers ?? input.headers);
      this.bodyText = typeof init?.body === "string" ? init.body : input.bodyText;
      return;
    }

    this.url = input.toString();
    this.method = init?.method ?? "GET";
    this.headers = new Headers(init?.headers);
    this.bodyText = typeof init?.body === "string" ? init.body : "";
  }

  clone(): TestRequest {
    return new TestRequest(this);
  }

  async text(): Promise<string> {
    return this.bodyText;
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

describe("baseApi clients integration", () => {
  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("Request", TestRequest);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serializes clients query params and transforms list response envelopes", async () => {
    const store = createIntegrationStore();
    const requests: CapturedRequest[] = [];

    fetchMock.mockImplementation(async (input, init) => {
      const request = await captureRequest(input, init);
      requests.push(request);

      return jsonResponse({
        data: [
          clientProfile,
          {
            id: 123,
            slug: null,
            companyName: null,
          },
        ],
        meta: {
          page: 2,
          limit: 20,
          total: 31,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });

    const result = await store.dispatch(
      clientsApi.endpoints.getClients.initiate({
        page: 2,
        limit: 20,
        sortBy: "name",
        sortOrder: "asc",
        status: "ACTIVE",
        search: "  Acme  ",
      }),
    );

    expect(result.data).toEqual({
      data: [clientProfile],
      meta: {
        page: 2,
        limit: 20,
        total: 31,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].url.pathname).toBe("/api/v1/clients");
    expect(requests[0].url.searchParams.get("page")).toBe("2");
    expect(requests[0].url.searchParams.get("limit")).toBe("20");
    expect(requests[0].url.searchParams.get("sortBy")).toBe("name");
    expect(requests[0].url.searchParams.get("sortOrder")).toBe("asc");
    expect(requests[0].url.searchParams.get("status")).toBe("ACTIVE");
    expect(requests[0].url.searchParams.get("search")).toBe("Acme");
  });

  it("refreshes on 401 and retries clients query with the new access token", async () => {
    const store = createIntegrationStore();
    const requests: CapturedRequest[] = [];
    let clientRequestCount = 0;

    store.dispatch(
      setCredentials({
        accessToken: "stale-access-token",
        currentUser: adminUser,
      }),
    );

    fetchMock.mockImplementation(async (input, init) => {
      const request = await captureRequest(input, init);
      requests.push(request);

      if (request.url.pathname.endsWith("/clients")) {
        clientRequestCount += 1;

        if (clientRequestCount === 1) {
          return jsonResponse({ message: "Unauthorized" }, 401);
        }

        return jsonResponse({
          data: [clientProfile],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      if (request.url.pathname.endsWith("/auth/refresh")) {
        return jsonResponse(refreshedAuth);
      }

      return jsonResponse({ message: "Unexpected request" }, 500);
    });

    const result = await store.dispatch(clientsApi.endpoints.getClients.initiate({ page: 1 }));

    expect(result.data?.data).toEqual([clientProfile]);
    expect(requests.map((request) => `${request.method} ${request.url.pathname}`)).toEqual([
      "GET /api/v1/clients",
      "POST /api/v1/auth/refresh",
      "GET /api/v1/clients",
    ]);
    expect(requests[0].authorization).toBe("Bearer stale-access-token");
    expect(requests[2].authorization).toBe("Bearer fresh-access-token");
    expect(store.getState().auth.accessToken).toBe("fresh-access-token");
    expect(store.getState().auth.currentUser?.displayName).toBe("Refreshed Admin");
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

async function captureRequest(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
): Promise<CapturedRequest> {
  const request = input instanceof Request ? input : new Request(input, init);
  const bodyText =
    request.method === "GET" || request.method === "HEAD"
      ? ""
      : await request.clone().text();

  return {
    url: new URL(request.url),
    method: request.method,
    authorization: request.headers.get("authorization"),
    body: bodyText ? JSON.parse(bodyText) as unknown : null,
  };
}
