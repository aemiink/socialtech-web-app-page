import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function PackagesSection() {
  return (
    <section className="bg-[#101215] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionEyebrow center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[900px] text-center text-lg leading-8 text-white/72">
            Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için için sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <div className="mt-12 text-center text-base leading-8 text-white/72 md:text-lg">
            <p>Çoğu marka Launch ile başlar, Growth ile büyür ve Scale ile sistemi kurar.</p>
            <p>
              Eğer hangi paketin size uygun olduğunu bilmiyorsanız hemen
              <Link className="mx-2 font-bold text-[#b5ff15] underline" to="/iletisim#contact-form">
                formu
              </Link>
              doldurun, beraber karar verelim!
            </p>
          </div>
        </div>
      </section>
  );
}
