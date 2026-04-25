import { Clock3, MessageCircle, RadioTower, ShieldCheck, Sparkles } from "lucide-react";

import ActionButton from "../../site/ActionButton";
import HeroBackdrop from "../../site/HeroBackdrop";
import { contactStats } from "../contactData";

function ContactHeroVisual() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[650px]">
      <div className="absolute inset-x-6 top-2 rounded-[34px] border border-[#aaff01]/24 bg-[#111820] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 text-[#101820]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#aaff01] text-black">
              <RadioTower className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/42">contact command center</p>
              <p className="text-lg font-extrabold">Yeni görüşme akışı</p>
            </div>
          </div>
          <span className="rounded-full bg-[#aaff01] px-3 py-1 text-xs font-extrabold text-black">online</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {contactStats.map((stat) => (
            <div key={stat.label} className="rounded-[18px] bg-[#232f3e] px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-[#aaff01]">{stat.value}</p>
              <p className="mt-1 text-[11px] text-white/55">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] bg-[#0b1016] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-[#aaff01]" />
              Brief sinyalleri
            </span>
            <span className="text-xs text-[#aaff01]">hazır</span>
          </div>
          {[
            ["Hedef", "satış / lead / görünürlük"],
            ["Kanal", "web + reklam + sosyal"],
            ["Ölçüm", "dashboard + rapor"],
          ].map(([label, value]) => (
            <div key={label} className="mb-3 flex items-center justify-between rounded-xl bg-white/7 px-4 py-3 text-sm">
              <span className="text-white/82">{label}</span>
              <span className="font-extrabold text-[#aaff01]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 rounded-[26px] border border-white/10 bg-[#232f3e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <Clock3 className="h-4 w-4 text-[#aaff01]" />
          ilk temas
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">hızlı</p>
      </div>

      <div className="absolute bottom-0 right-0 rounded-[26px] border border-[#aaff01]/25 bg-[#0b1016] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="flex items-center gap-2 text-xs text-white/54">
          <ShieldCheck className="h-4 w-4 text-[#aaff01]" />
          yaklaşım
        </p>
        <p className="mt-2 text-4xl font-extrabold text-[#aaff01]">net</p>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[940px] items-center justify-center overflow-hidden bg-[#050607]">
      <HeroBackdrop fadeColor="#111317" />

      <div className="relative z-10 mx-auto grid min-h-[790px] w-full max-w-[1540px] items-center gap-14 px-6 pb-24 pt-24 text-center lg:grid-cols-[0.92fr_0.88fr] lg:px-10 lg:pt-28 lg:text-left">
        <div className="mx-auto flex max-w-[760px] flex-col items-center lg:mx-0 lg:items-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1.5 text-xs font-extrabold text-[#121212]">
            <MessageCircle className="h-4 w-4" />
            İletişim
          </span>
          <h1 className="mt-7 max-w-[860px] text-[40px] font-medium leading-tight tracking-tight text-white md:text-[68px]">
            İletişime geçin,
            <span className="block font-extrabold text-[#aaff01]">büyüme sisteminizi konuşalım.</span>
          </h1>
          <p className="mt-8 max-w-[760px] text-lg leading-8 text-white/76 md:text-xl">
            Markanızın hedefini, mevcut yapısını ve büyüme önceliğini anlayıp size tekil hizmet değil,
            <span className="mx-2 font-extrabold text-[#aaff01]">uygulanabilir dijital yol haritası</span>
            sunalım.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <ActionButton accent="lime" className="min-w-[260px]" href="#contact-form" label="Formu Doldur" />
            <ActionButton accent="violet" className="min-w-[260px]" href="#channels" label="İletişim Kanalları" />
          </div>
        </div>

        <ContactHeroVisual />
      </div>
    </section>
  );
}
