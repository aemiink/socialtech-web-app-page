import HeroSection from "./sections/HeroSection";
import ValueSection from "./sections/ValueSection";
import AutomationGridSection from "./sections/AutomationGridSection";
import BrandDnaSection from "./sections/BrandDnaSection";
import AccessSection from "./sections/AccessSection";
import RoadmapSection from "./sections/RoadmapSection";
import CtaSection from "./sections/CtaSection";

export default function AutomationHome() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white" id="top">
      <HeroSection />
      <ValueSection />
      <AutomationGridSection />
      <BrandDnaSection />
      <AccessSection />
      <RoadmapSection />
      <CtaSection />
    </div>
  );
}
