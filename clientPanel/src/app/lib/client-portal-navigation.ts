import type { ServiceId } from "../data/service-pages";

export const CLIENT_PORTAL_NAVIGATION_EVENT = "socialtech-client-navigate-service";

export type ClientPortalNavigationDetail = {
  serviceId: ServiceId;
  page?: string;
};

export function dispatchClientPortalNavigation(detail: ClientPortalNavigationDetail): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ClientPortalNavigationDetail>(CLIENT_PORTAL_NAVIGATION_EVENT, {
      detail,
    }),
  );
}
