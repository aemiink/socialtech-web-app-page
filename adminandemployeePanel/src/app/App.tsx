import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";

export default function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthBootstrap>
  );
}
