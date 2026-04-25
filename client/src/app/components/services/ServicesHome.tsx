import PageGlow from "./overview/sections/PageGlow";
import HeroSection from "./overview/sections/HeroSection";
import ModulesSection from "./overview/sections/ModulesSection";
import PrinciplesSection from "./overview/sections/PrinciplesSection";
import FocusSection from "./overview/sections/FocusSection";
import CtaSection from "./overview/sections/CtaSection";

export default function ServicesHome() {
  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <PageGlow />
      <HeroSection />
      <ModulesSection />
      <PrinciplesSection />
      <FocusSection />
      <CtaSection />
    </div>
  );
}
