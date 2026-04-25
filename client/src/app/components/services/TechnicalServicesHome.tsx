import type { TechnicalServicesVariant } from "./TechnicalServicesHome.shared";
import HeroSection from "./technical/sections/HeroSection";
import SeoContentSection from "./technical/sections/SeoContentSection";
import WebTechnicContentSection from "./technical/sections/WebTechnicContentSection";
import PackagesSection from "./technical/sections/PackagesSection";
import SeoFaqSection from "./technical/sections/SeoFaqSection";

export default function TechnicalServicesHome({ variant }: { variant: TechnicalServicesVariant }) {
  const isSeo = variant === "seo";

  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <HeroSection variant={variant} />
      {isSeo ? <SeoContentSection /> : <WebTechnicContentSection />}
      <PackagesSection variant={variant} />
      {isSeo ? <SeoFaqSection /> : null}
    </div>
  );
}
