import PageGlow from "./sections/PageGlow";
import HeroSection from "./sections/HeroSection";
import ManifestoSection from "./sections/ManifestoSection";
import ThinkingSection from "./sections/ThinkingSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import ProcessSection from "./sections/ProcessSection";
import WhySocialTechSection from "./sections/WhySocialTechSection";
import ToolsSection from "./sections/ToolsSection";
import CtaSection from "./sections/CtaSection";

export default function AboutHome() {
  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <PageGlow />
      <HeroSection />
      <ManifestoSection />
      <ThinkingSection />
      <CapabilitiesSection />
      <ProcessSection />
      <WhySocialTechSection />
      <ToolsSection />
      <CtaSection />
    </div>
  );
}
