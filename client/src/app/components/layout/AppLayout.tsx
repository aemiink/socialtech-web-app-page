import { Outlet } from "react-router";

import SiteFooter from "../site/SiteFooter";
import SiteHeader from "../site/SiteHeader";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
