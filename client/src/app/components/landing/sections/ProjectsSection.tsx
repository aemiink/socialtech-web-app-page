import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function ProjectsSection() {
  return (
    <section className="bg-[#060708] py-24" id="projects">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SectionEyebrow highlight="Çalışmalar" prefix="Yaptığımız Projeler ve" />
              <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/72">
                Ürettiğimiz projeleri inceleyin, yaklaşımımızı yakından görün. Her projede nasıl değer ürettiğimizi keşfedin.
              </p>
            </div>
            <ActionButton accent="lime" className="self-start" label="Behance'de Gözlemleyin" />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>
  );
}
