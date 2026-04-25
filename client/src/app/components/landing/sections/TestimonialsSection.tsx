import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function TestimonialsSection() {
  return (
    <section className="bg-[#050608] py-24">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Yorumları" prefix="Kullanıcılarımızdan Social Tech" />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </div>

          <div className="mt-14 grid overflow-hidden rounded-[24px] border border-[#8a38f5]/70 bg-[#5a2499] shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:grid-cols-[360px_1fr]">
            <div className="min-h-[240px] overflow-hidden">
              <img alt="Mutlu müşteri" className="h-full w-full object-cover" src={trustBannerImage} />
            </div>
            <div className="flex flex-col justify-center px-8 py-10 md:px-12">
              <h3 className="text-[30px] font-bold tracking-tight text-white">Sonuçları Gözlemleyin!</h3>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="text-[34px] font-extrabold tracking-tight text-[#b5ff15]">4.9 / 5</span>
                <div className="flex gap-1 text-[#b5ff15]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-5 max-w-[560px] text-base leading-7 text-white/80">
                Bizi tercih eden her bir müşterimiz işte bu kadar mutlu! Siz de bizi tercih edin, erişilebilirliğinizi artırın.
              </p>
              <ActionButton accent="lime" className="mt-8 self-start" label="Trustpilot'a Göz At" />
            </div>
          </div>
        </div>
      </section>
  );
}
