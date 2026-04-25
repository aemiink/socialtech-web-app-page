import AutomationSectionTitle from "../AutomationSectionTitle";
import { roadmapItems } from "../automationData";

export default function RoadmapSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#0b0d10_0%,#25123e_100%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <AutomationSectionTitle
            description="Google ve Amazon tarafında yedi yeni otomasyon geliştirme aşamasında. Burada amaç reklam hesabını izleyen, alarm veren ve aksiyon öneren bir büyüme işletim sistemi kurmak."
            highlight="Sırada"
            prefix="7 Otomasyon Daha"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {roadmapItems.map(({ icon: Icon, title }) => (
              <article className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/8 p-5" key={title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#aaff01] text-black">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/38">geliştiriliyor</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
