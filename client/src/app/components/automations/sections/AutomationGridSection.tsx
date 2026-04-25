import AutomationSectionTitle from "../AutomationSectionTitle";
import { automationCards } from "../automationData";

export default function AutomationGridSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111317_0%,#1d1030_52%,#101114_100%)] py-24" id="automation-modules">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <AutomationSectionTitle
          center
          description="İlk etapta beş ana otomasyonla başlıyoruz. Her biri dışarıda ayrı ayrı ücretli erişilebilecek işleri, paket deneyiminin doğal parçası haline getiriyor."
          eyebrow="Social Tech MDA Suite"
          highlight="Otomasyonlar"
          prefix="Canlı"
        />
        <div className="mt-14 grid gap-6 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
          {automationCards.map(({ description, eyebrow, features, icon: Icon, name }) => (
            <article
              className="group flex min-h-[440px] flex-col rounded-[30px] border border-[#8a38f5]/42 bg-[#080a0d] p-6 transition duration-300 hover:-translate-y-2 hover:border-[#aaff01]/60 hover:shadow-[0_24px_80px_rgba(170,255,1,0.12)]"
              key={name}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#aaff01] text-black transition group-hover:rotate-3">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/46">
                  live
                </span>
              </div>
              <p className="mt-6 text-sm font-black text-[#aaff01]">{eyebrow}</p>
              <h3 className="mt-2 text-[22px] font-black leading-tight text-white">{name}</h3>
              <p className="mt-4 text-sm leading-7 text-white/64">{description}</p>
              <ul className="mt-auto space-y-3 pt-7">
                {features.map((feature) => (
                  <li className="flex items-center gap-3 text-sm font-semibold text-white/76" key={feature}>
                    <span className="h-2 w-2 rounded-full bg-[#aaff01]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
