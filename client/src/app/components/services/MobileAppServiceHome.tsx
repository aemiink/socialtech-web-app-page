import HeroSection from "./mobile-app/sections/HeroSection";
import ProductSystemSection from "./mobile-app/sections/ProductSystemSection";
import CapabilitiesSection from "./mobile-app/sections/CapabilitiesSection";
import ProcessSection from "./mobile-app/sections/ProcessSection";
import PackagesSection from "./mobile-app/sections/PackagesSection";
import CtaSection from "./mobile-app/sections/CtaSection";

export default function MobileAppServiceHome() {
  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection />
      <ProductSystemSection />
      <CapabilitiesSection />
      <ProcessSection />
      <PackagesSection />
      <CtaSection />
    </div>
  );
}
