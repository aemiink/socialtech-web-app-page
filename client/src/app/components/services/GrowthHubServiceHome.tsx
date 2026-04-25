import HeroSection from "./growth-hub/sections/HeroSection";
import JourneySection from "./growth-hub/sections/JourneySection";
import NextStepSection from "./growth-hub/sections/NextStepSection";
import ChannelsSection from "./growth-hub/sections/ChannelsSection";
import PackagesSection from "./growth-hub/sections/PackagesSection";

export default function GrowthHubServiceHome() {
  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection />
      <JourneySection />
      <NextStepSection />
      <ChannelsSection />
      <PackagesSection />
    </div>
  );
}
