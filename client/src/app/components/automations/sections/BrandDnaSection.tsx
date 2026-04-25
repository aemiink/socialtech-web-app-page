import AutomationSectionTitle from "../AutomationSectionTitle";
import { brandDnaSteps } from "../automationData";

export default function BrandDnaSection() {
  return (
    <section className="bg-[#101114] py-24">
      <div className="mx-auto grid w-full max-w-[1540px] items-center gap-12 px-6 lg:grid-cols-[0.9fr_1fr] lg:px-10">
        <AutomationSectionTitle
          description="Her otomasyon aynı merkeze bağlanır: Brand DNA. Böylece görsel, metin, müşteri cevabı ve analiz raporu birbirinden kopuk değil; aynı marka aklıyla çalışır."
          highlight="Brand DNA"
          prefix="Sistemin Kalbi"
        />
        <div className="rounded-[34px] border border-white/10 bg-black/42 p-5 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {brandDnaSteps.map(({ description, icon: Icon, title }, index) => (
              <article className="rounded-[24px] bg-white/[0.06] p-6" key={title}>
                <div className="flex items-center justify-between gap-5">
                  <span className="text-sm font-black text-[#aaff01]">0{index + 1}</span>
                  <Icon className="h-7 w-7 text-[#aaff01]" />
                </div>
                <h3 className="mt-8 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
