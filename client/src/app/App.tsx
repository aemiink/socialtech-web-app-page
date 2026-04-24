import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let currentLocationKey = router.state.location.key;

    return router.subscribe((state) => {
      if (state.navigation.state !== "idle" || state.location.key === currentLocationKey) {
        return;
      }

      currentLocationKey = state.location.key;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, []);

  return <RouterProvider router={router} />;
}
