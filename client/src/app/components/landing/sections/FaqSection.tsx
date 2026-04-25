import { useState } from "react";
import { ActionButton, ArrowRight, BlogCard, CalendarDays, ChevronDown, Facebook, HeroBackdrop, Instagram, Link, Linkedin, Mail, Menu, MessageCircle, MonitorSmartphone, Package2, PackageCard, PackageFeatureBullet, PaymentLogos, Plus, ProjectCard, ReviewCard, SERVICE_SLIDE_DELAY_MS, Search, SectionEyebrow, ServiceCard, Share2, Smartphone, Star, X, Youtube, aboutBackImage, aboutFrontImage, avatarJhon, avatarRobbie, avatarSue, blogEcommerceImage, blogPosts, blogSeoImage, blogWireframeImage, faqItems, getFooterLinkTarget, getVisibleServiceCount, iconAws, iconContent, iconDigitalMarketing, iconGoogleAds, iconGraphicDesign, iconGrowth, iconLaunch, iconMeta, iconScale, logoImage, navItems, packageCards, projectInstagramPosts, projectInstagramStory, projectWebLanding, projects, services, testimonials, trustBannerImage } from "../LandingHome.shared";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <section className="bg-[linear-gradient(180deg,#11190a_0%,#0a0d10_100%)] py-24" id="faq">
        <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SectionEyebrow highlight="Sorular" prefix="Sıkça Sorulan" />
            </div>
            <div className="max-w-[420px]">
              <img alt="Social Tech" className="h-10 w-auto object-contain" src={logoImage} />
              <p className="mt-6 text-sm leading-7 text-white/72">
                Sizden gelen en özel en değerli sorular ve yanıtlarını keşfedin. Aklınızda bir soru kaldıysa bize ulaşın!
              </p>
              <ActionButton accent="lime" className="mt-6" label="Hala Kafanız mı Karışık?" />
            </div>
          </div>

          <div className="mt-14 space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-[12px] border border-[#476b00] bg-[#182306]/80 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                >
                  <button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="text-lg font-semibold text-white md:text-[26px]">
                        {item.question}
                      </span>
                      {item.popular ? (
                        <span className="hidden text-sm text-white/60 md:inline">{item.popular}</span>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-white">
                      {isOpen ? <ChevronDown className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-white/8 px-6 pb-6 pt-5 text-base leading-7 text-white/72 md:px-8 md:text-lg">
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
