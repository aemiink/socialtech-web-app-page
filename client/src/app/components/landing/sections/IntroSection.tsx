import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function IntroSection() {
  return (
    <section className="relative bg-[#090b10] py-24">
        <div className="mx-auto grid w-full max-w-[1540px] items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-[690px]">
            <h2 className="text-[30px] font-bold leading-tight tracking-tight text-white md:text-[42px]">
              Dijital büyümeyi rastlantısal değil
            </h2>
            <div className="mt-3 inline-block -rotate-[1.2deg] bg-[#b5ff15] px-4 py-2">
              <span className="text-[30px] font-bold leading-tight tracking-tight text-black md:text-[42px]">
                sistematik hale getiriyoruz.
              </span>
            </div>
            <div className="mt-10 space-y-7 text-base leading-8 text-white/72 md:text-xl">
              <p>
                Social Tech, markaların dijital dünyada yalnızca görünür olmasını değil, ölçülebilir ve sürdürülebilir şekilde büyümesini hedefler.
              </p>
              <p>
                Bizim için dijital pazarlama; tek seferlik kampanyalar ya da geçici çözümlerden ibaret değildir. Veriye dayalı stratejiler, doğru teknoloji ve net hedeflerle ölçeklenebilir büyüme sistemleri kurarız.
              </p>
              <p>
                Her marka için aynı yöntemle ilerlemiyoruz. Hedeflerinize, mevcut yapınıza ve büyüme önceliklerinize göre ölçeklenebilir bir çalışma modeli kurguluyoruz.
              </p>
            </div>
            <ActionButton accent="lime" className="mt-10" to="/iletisim#contact-form" label="Ücretsiz Ön Görüşme Planlayın" />
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[620px]">
            <div className="absolute right-0 top-0 h-[300px] w-[74%] overflow-hidden rounded-[28px] bg-black/40 shadow-[0_26px_80px_rgba(0,0,0,0.35)]">
              <img alt="Social Tech toplantı" className="h-full w-full object-cover opacity-60" src={aboutBackImage} />
            </div>
            <div className="absolute bottom-0 left-0 h-[340px] w-[82%] overflow-hidden rounded-[28px] border border-white/8 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
              <img alt="Social Tech ekip çalışması" className="h-full w-full object-cover" src={aboutFrontImage} />
            </div>
          </div>
        </div>
      </section>
  );
}
