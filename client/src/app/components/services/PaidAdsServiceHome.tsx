import type { PaidAdsVariant } from "./PaidAdsServiceHome.shared";
import HeroSection from "./paid-ads/sections/HeroSection";
import IntroSection from "./paid-ads/sections/IntroSection";
import JourneySection from "./paid-ads/sections/JourneySection";
import FeaturesSection from "./paid-ads/sections/FeaturesSection";
import PackagesSection from "./paid-ads/sections/PackagesSection";

export default function PaidAdsServiceHome({ variant }: { variant: PaidAdsVariant }) {
  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <HeroSection variant={variant} />
      <IntroSection variant={variant} />
      <JourneySection variant={variant} />
      <FeaturesSection variant={variant} />
      <PackagesSection variant={variant} />
    </div>
  );
}
