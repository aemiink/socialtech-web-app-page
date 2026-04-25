import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[900px] items-center justify-center overflow-hidden bg-[#050607]">
        <HeroBackdrop fadeColor="#050816" />

<div className="relative z-10 mx-auto flex min-h-[780px] w-full max-w-[1540px] flex-col items-center justify-center px-6 pb-20 pt-16 text-center lg:px-10">
          <h1 className="max-w-[980px] text-[34px] font-bold leading-tight tracking-tight text-white md:text-[54px]">
            Dijital Büyümeyi Ölçeklenebilir Hale Getiriyoruz
          </h1>
          <p className="mt-8 max-w-[780px] text-base leading-8 text-white/74 md:text-xl">
            Veriye dayalı stratejiler, akıllı teknoloji ve
            <span className="mx-2 font-semibold text-[#b5ff15]">
              ölçülebilir sonuçlarla
            </span>
            markanızı sürdürülebilir şekilde büyütüyoruz.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ActionButton accent="lime" className="min-w-[280px]" label="Hizmetlerimizi Keşfedin" to="/hizmetler" />
            <ActionButton accent="violet" className="min-w-[280px]" to="/iletisim#contact-form" label="Marka Hesabı Oluşturun" />
          </div>
        </div>
      </section>
  );
}
