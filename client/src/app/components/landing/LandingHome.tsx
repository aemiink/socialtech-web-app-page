import PageGlow from "./sections/PageGlow";
import HeroSection from "./sections/HeroSection";
import IntroSection from "./sections/IntroSection";
import DigitalSolutionsSection from "./sections/DigitalSolutionsSection";
import ProjectsSection from "./sections/ProjectsSection";
import PackagesSection from "./sections/PackagesSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import BlogSection from "./sections/BlogSection";

export default function LandingHome() {
  return (
    <div className="min-h-screen bg-[#050816] text-white" id="top">
      <PageGlow />
      <HeroSection />
      <IntroSection />
      <DigitalSolutionsSection />
      <ProjectsSection />
      <PackagesSection />
      <TestimonialsSection />
      <FaqSection />
      <BlogSection />
    </div>
  );
}
