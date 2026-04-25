import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function BlogSection() {
  return (
    <section className="bg-[#0b0d11] py-24" id="blog">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow highlight="Dijital!" prefix="Kısa, Net:" />
          <p className="mt-6 text-lg leading-8 text-white/72">
            Gerçek projelerden, uygulanabilir pazarlama ve teknoloji yazıları.
          </p>

          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.title} {...post} />
            ))}
          </div>

          <div className="mt-16 border-t border-[#476b00] pt-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-[22px] font-bold text-white">
                Yeni yazılar yayınlandığında ilk siz haberdar olun.
              </p>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[560px]">
                <label className="flex-1">
                  <span className="sr-only">E-posta adresi</span>
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#b5ff15]/20 bg-[#232323] px-4 py-3 text-white/56">
                    <Search className="h-4 w-4" />
                    <input
                      className="w-full bg-transparent text-sm outline-none placeholder:text-white/36"
                      placeholder="E-Posta Adresiniz..."
                      type="email"
                    />
                  </div>
                </label>
                <ActionButton accent="lime" filled className="justify-center" label="Haberdar Ol!" />
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
