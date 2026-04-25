import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function PageGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#8a38f5]/20 blur-[140px]" />
        <div className="absolute right-[-9rem] top-[18rem] h-[22rem] w-[22rem] rounded-full bg-[#b5ff15]/10 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[26rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/10 blur-[160px]" />
      </div>
  );
}
