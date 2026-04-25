import HeroSection from "./web-app/sections/HeroSection";
import ProductSystemSection from "./web-app/sections/ProductSystemSection";
import FaqSection from "./web-app/sections/FaqSection";

export default function WebAppServiceHome() {
  return (
    <div className="min-h-screen bg-[#111111] text-white" id="top">
      <HeroSection />
      <ProductSystemSection />
      <FaqSection />
    </div>
  );
}
