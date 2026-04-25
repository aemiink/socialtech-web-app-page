import ActionButton from "../../site/ActionButton";
import AutomationSectionTitle from "../AutomationSectionTitle";
import { accessPlans } from "../automationData";

export default function AccessSection() {
  return (
    <section className="bg-[#0b0d10] py-24" id="automation-access">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <AutomationSectionTitle
          center
          description="Bu sayfada fiyatlandırma yok; otomasyonlar paketlerle birlikte gelir. Growth için kredi sistemi, Scale için limitsiz kullanım yaklaşımı planlandı."
          highlight="Paketlerle Gelir"
          prefix="Otomasyonlar"
        />
        <div className="mx-auto mt-14 grid max-w-[1180px] gap-7 lg:grid-cols-2">
          {accessPlans.map(({ description, features, icon: Icon, name, tag, tone }) => {
            const lime = tone === "lime";

            return (
              <article
                className={`rounded-[34px] p-8 ${
                  lime
                    ? "bg-[linear-gradient(145deg,#aaff01_0%,#5d8208_100%)] text-black"
                    : "bg-[linear-gradient(145deg,#8a38f5_0%,#241331_100%)] text-white"
                }`}
                key={name}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className={`grid h-16 w-16 place-items-center rounded-2xl ${lime ? "bg-black text-[#aaff01]" : "bg-[#aaff01] text-black"}`}>
                    <Icon className="h-8 w-8" />
                  </span>
                  <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${lime ? "bg-black/18" : "bg-black/32"}`}>
                    {tag}
                  </span>
                </div>
                <h3 className="mt-8 text-[34px] font-black">{name}</h3>
                <p className={`mt-4 text-base leading-8 ${lime ? "text-black/72" : "text-white/72"}`}>{description}</p>
                <ul className="mt-8 space-y-4">
                  {features.map((feature) => (
                    <li className="flex items-center gap-3 text-base font-bold" key={feature}>
                      <span className={`h-2.5 w-2.5 rounded-full ${lime ? "bg-black" : "bg-[#aaff01]"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <ActionButton accent="lime" label="Paket Uygunluğunu Konuşalım" to="/iletisim#contact-form" />
        </div>
      </div>
    </section>
  );
}
