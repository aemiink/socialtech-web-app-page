import HeroSection from "./social-media/sections/HeroSection";
import JourneySection from "./social-media/sections/JourneySection";
import FeaturesSection from "./social-media/sections/FeaturesSection";
import PackagesSection from "./social-media/sections/PackagesSection";

export default function SocialMediaServiceHome() {
  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <HeroSection />
      <JourneySection />
      <FeaturesSection />
      <PackagesSection />
    </div>
  );
}
