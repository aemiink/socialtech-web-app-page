import AutomationSectionTitle from "../AutomationSectionTitle";
import { valueCards } from "../automationData";

export default function ValueSection() {
  return (
    <section className="bg-[#111317] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <AutomationSectionTitle
          center
          description="Reklam hala önemli; ama artık fark, reklamdan sonra çalışan sistemde. Otomasyonlar müşteriyle temas eden her noktayı daha hızlı, tutarlı ve ölçülebilir hale getirir."
          highlight="Yeni Ajans Avantajı"
          prefix="Otomasyonlar Bizim"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {valueCards.map(({ description, icon: Icon, title }) => (
            <article
              className="rounded-[28px] border border-[#aaff01]/18 bg-[linear-gradient(145deg,rgba(170,255,1,0.12),rgba(255,255,255,0.035))] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)]"
              key={title}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#aaff01] text-black">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-7 text-2xl font-black text-white">{title}</h3>
              <p className="mt-4 text-base leading-7 text-white/68">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
