import { Bot, Boxes, BrainCircuit, MessageCircle, Sparkles } from "lucide-react";
import ActionButton from "../../site/ActionButton";
import HeroBackdrop from "../../site/HeroBackdrop";

function AutomationHeroVisual() {
  const modules = ["PromptIMG", "PromptVisual", "PromptAnalysis", "PromptWhatsApp", "PromptCommander"];

  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[610px]">
      <div className="absolute inset-x-6 top-5 rounded-[34px] border border-[#aaff01]/24 bg-[#101821] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between rounded-[24px] bg-white px-5 py-4 text-black">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#aaff01]">
              <Bot className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-black/42">Social Tech MDA</p>
              <p className="text-xl font-black">Automation Command</p>
            </div>
          </div>
          <span className="rounded-full bg-[#aaff01] px-3 py-1 text-xs font-black">live</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {modules.map((module) => (
            <div key={module} className="rounded-[20px] bg-[#222b38] p-4">
              <p className="text-lg font-black text-[#aaff01]">{module}</p>
              <p className="mt-1 text-xs text-white/48">automation module</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] bg-black/62 p-5">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-[#aaff01]" />
            <p className="font-black">Brand DNA Core</p>
          </div>
          {["Marka dili eşleşti", "Lead sıcaklığı: Warm", "Aksiyon listesi üretildi"].map((item, index) => (
            <div key={item} className="mt-4 flex items-center justify-between rounded-[16px] bg-white/8 px-4 py-3">
              <span className="text-sm text-white/70">{item}</span>
              <span className={index === 1 ? "text-[#8a38f5]" : "text-[#aaff01]"}>{index === 1 ? "tagged" : "ok"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -left-1 bottom-20 rounded-[26px] border border-[#8a38f5]/38 bg-[#151923]/92 px-6 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 text-[#aaff01]">
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-[0.18em]">Live Message</span>
        </div>
        <p className="mt-2 text-4xl font-black text-white">7/24</p>
      </div>

      <div className="absolute -right-3 bottom-0 rounded-[26px] border border-[#aaff01]/32 bg-[#101820]/95 px-6 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 text-[#aaff01]">
          <Boxes className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-[0.18em]">paket içinde</span>
        </div>
        <p className="mt-2 text-3xl font-black text-[#aaff01]">0 ekstra araç</p>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0b0d10] pt-28">
      <HeroBackdrop fadeColor="#0b0d10" />
      <div className="relative z-10 mx-auto grid min-h-[820px] w-full max-w-[1540px] items-center gap-12 px-6 py-20 lg:grid-cols-[0.92fr_1fr] lg:px-10">
        <div className="max-w-[760px] text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#aaff01] px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
            <Sparkles className="h-4 w-4" />
            Otomasyonlar
          </span>
          <h1 className="mt-6 text-[44px] font-black leading-[1.04] text-white md:text-[68px]">
            Reklam Yetmez.
            <br />
            <span className="text-[#aaff01]">Satış Kanalı Otomasyonu</span> Gerekir.
          </h1>
          <p className="mt-7 text-lg leading-8 text-white/72 md:text-xl">
            Ajanslar çoğaldı, reklam herkesin oyunu oldu. Biz Social Tech olarak reklamı;
            <span className="font-black text-[#aaff01]"> cevap veren, analiz eden, görsel üreten ve lead’i etiketleyen </span>
            otomasyon sistemleriyle büyütüyoruz.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <ActionButton accent="lime" label="Otomasyonları İncele" to="/otomasyonlar#automation-modules" />
            <ActionButton accent="violet" label="Paketlerde Nasıl Geliyor?" to="/otomasyonlar#automation-access" />
          </div>
        </div>
        <AutomationHeroVisual />
      </div>
    </section>
  );
}
