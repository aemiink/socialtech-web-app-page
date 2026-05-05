import { io, type Socket } from "socket.io-client";

const FALLBACK_API_BASE_URL = "http://localhost:4000/api/v1";

function getSocketBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const apiBaseUrl =
    configuredBaseUrl && configuredBaseUrl.length > 0 ? configuredBaseUrl : FALLBACK_API_BASE_URL;
  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

export type WorkspaceUpdateEvent = {
  projectId: string;
  tabKey: string;
  event: string;
  payload: Record<string, unknown>;
  sequence: number;
  emittedAt: string;
};

export function createWorkspaceSocket(accessToken: string): Socket {
  return io(`${getSocketBaseUrl()}/web-app-workspace`, {
    transports: ["websocket"],
    auth: {
      token: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  });
}
