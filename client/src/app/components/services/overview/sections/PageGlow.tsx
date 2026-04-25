import { ActionButton, ArrowRight, CalendarDays, ChartColumn, Code2, Facebook, Globe, HeroBackdrop, Instagram, Layers3, LayoutTemplate, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MonitorSmartphone, Package2, Search, SectionHeading, ServiceCard, Smartphone, Sparkles, Wrench, X, Youtube, amazonIcon, focusFeatures, focusIllustration, getFooterLinkTarget, googleAdsIcon, growthHubIcon, hubIcon, logoImage, metaIcon, navItems, principles, serviceGroups, tiktokIcon } from "../../ServicesHome.shared";

export default function PageGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[20rem] h-[24rem] w-[24rem] rounded-full bg-[#b5ff15]/10 blur-[140px]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-[#8a38f5]/16 blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/8 blur-[180px]" />
      </div>
  );
}
