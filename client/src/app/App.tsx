import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

function scrollToLocation(location: { hash: string }, attempt = 0) {
  window.requestAnimationFrame(() => {
    const hash = location.hash ? decodeURIComponent(location.hash.slice(1)) : "";
    const target = hash ? document.getElementById(hash) : null;

    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (hash && attempt < 8) {
      window.setTimeout(() => scrollToLocation(location, attempt + 1), 80);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let currentLocationKey = router.state.location.key;
    scrollToLocation(router.state.location);

    return router.subscribe((state) => {
      if (state.navigation.state !== "idle" || state.location.key === currentLocationKey) {
        return;
      }

      currentLocationKey = state.location.key;
      scrollToLocation(state.location);
    });
  }, []);

  return <RouterProvider router={router} />;
}
