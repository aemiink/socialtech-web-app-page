import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";

export default function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  );
}
