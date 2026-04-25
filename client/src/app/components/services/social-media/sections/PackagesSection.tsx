import { ActionButton, ArrowRight, BarChart3, CalendarDays, CalendarRange, Facebook, FeatureTile, HeroBackdrop, Instagram, JourneyCard, LayoutDashboard, Link, Linkedin, Mail, Megaphone, Menu, MessageCircle, MessageSquareText, Package2, PackageCard, PackageFeatureBullet, Palette, PaymentLogos, Reply, SectionHeading, Users, X, Youtube, featureTiles, getFooterLinkTarget, journeyCards, logoImage, navItems, packageCards, socialBrandIcon, socialFacebookIcon, socialIcons, socialInstagramIcon, socialLinkedinIcon, socialPinterestIcon, socialProIcon, socialSnapchatIcon, socialStartIcon, socialTiktokIcon, socialWhatsappIcon, socialYoutubeIcon, stepAccountImage, stepDashboardImage, stepMeetingImage } from "../../SocialMediaServiceHome.shared";

export default function PackagesSection() {
  return (
    <section className="bg-[#151515] py-24" id="packages">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <SectionHeading center highlight="Ölçeklenen Paketler" prefix="Hedeflerinize Göre" />
          <p className="mx-auto mt-8 max-w-[920px] text-center text-lg leading-8 text-white/72">
            Growth & Hub için en iyi hizmeti en uygun fiyata alın. İstediğiniz zaman iptal edin. Diğer hizmetlerimiz için
            sayfamızı ziyaret etmeyi unutmayın!
          </p>

          <PaymentLogos />

          <div className="mt-16 grid gap-8 xl:grid-cols-[0.96fr_1.08fr_0.96fr]">
            {packageCards.map((card) => (
              <PackageCard key={card.name} {...card} />
            ))}
          </div>

          <div className="mt-12 text-center text-base leading-8 text-white/72 md:text-lg">
            <p>
              Sosyal medyada hiç yoksanız <span className="font-bold text-[#00a2e5]">start</span>, sosyal medyanızı büyütmek için
              <span className="mx-2 font-bold text-[#b5ff15]">pro</span>, marka algısı için
              <span className="mx-2 font-bold text-[#8a38f5]">brand+</span> tercih etmelisiniz.
            </p>
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
