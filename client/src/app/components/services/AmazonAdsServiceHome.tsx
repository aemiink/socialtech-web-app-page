import HeroSection from "./amazon-ads/sections/HeroSection";
import SignalsSection from "./amazon-ads/sections/SignalsSection";
import SystemSection from "./amazon-ads/sections/SystemSection";
import FeaturesSection from "./amazon-ads/sections/FeaturesSection";
import PlaybookSection from "./amazon-ads/sections/PlaybookSection";
import PackagesSection from "./amazon-ads/sections/PackagesSection";
import CtaSection from "./amazon-ads/sections/CtaSection";

export default function AmazonAdsServiceHome() {
  return (
    <div className="min-h-screen bg-[#111317] text-white" id="top">
      <HeroSection />
      <SignalsSection />
      <SystemSection />
      <FeaturesSection />
      <PlaybookSection />
      <PackagesSection />
      <CtaSection />
    </div>
  );
}
