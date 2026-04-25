import { useEffect, useState } from "react";
import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function DigitalSolutionsSection() {
  const [serviceSlide, setServiceSlide] = useState(0);
  const [servicesPaused, setServicesPaused] = useState(false);
  const [visibleServiceCount, setVisibleServiceCount] = useState(getVisibleServiceCount);
  const maxServiceSlide = Math.max(services.length - visibleServiceCount, 0);

  useEffect(() => {
    const updateVisibleCards = () => setVisibleServiceCount(getVisibleServiceCount());
    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  useEffect(() => {
    setServiceSlide((current) => Math.min(current, maxServiceSlide));
  }, [maxServiceSlide]);

  useEffect(() => {
    if (servicesPaused || maxServiceSlide === 0) return;
    const timer = window.setInterval(() => {
      setServiceSlide((current) => (current >= maxServiceSlide ? 0 : current + 1));
    }, SERVICE_SLIDE_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [maxServiceSlide, servicesPaused]);
  return (
    <section className="bg-[#111317] py-24" id="services">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Dijital Çözümler" prefix="Hedeflerinize Uygun" />
          <div
            className="-mx-3 mt-14 overflow-hidden py-2"
            onBlurCapture={() => setServicesPaused(false)}
            onFocusCapture={() => setServicesPaused(true)}
            onMouseEnter={() => setServicesPaused(true)}
            onMouseLeave={() => setServicesPaused(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(-${serviceSlide * (100 / services.length)}%)`,
                width: `${(services.length / visibleServiceCount) * 100}%`,
              }}
            >
              {services.map((service) => (
                <div
                  className="shrink-0 px-3"
                  key={service.title}
                  style={{ width: `${100 / services.length}%` }}
                >
                  <ServiceCard {...service} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxServiceSlide + 1 }).map((_, index) => (
              <button
                aria-label={`${index + 1}. çözüm grubuna geç`}
                className={`h-2.5 rounded-full transition-all ${
                  serviceSlide === index ? "w-8 bg-[#b5ff15]" : "w-2.5 bg-white/18 hover:bg-white/36"
                }`}
                key={index}
                onClick={() => setServiceSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>
  );
}
