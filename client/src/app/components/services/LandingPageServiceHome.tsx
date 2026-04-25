import HeroSection from "./landing-page/sections/HeroSection";
import ValueSection from "./landing-page/sections/ValueSection";
import PackagesSection from "./landing-page/sections/PackagesSection";
import WorkflowSection from "./landing-page/sections/WorkflowSection";
import CtaSection from "./landing-page/sections/CtaSection";

export default function LandingPageServiceHome() {
  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <HeroSection />
      <ValueSection />
      <PackagesSection />
      <WorkflowSection />
      <CtaSection />
    </div>
  );
}
