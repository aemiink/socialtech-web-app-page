import { ArrowUpRight } from "lucide-react";

import { contactChannels } from "../contactData";

function ContactChannelCard({ title, description, action, icon: Icon, accent }: (typeof contactChannels)[number]) {
  const iconClass = {
    lime: "bg-[#aaff01] text-black",
    violet: "bg-[#8a38f5] text-white",
    cyan: "bg-[#00a2e5] text-black",
  }[accent];

  return (
    <article className="group rounded-[26px] border border-white/10 bg-[#171a20] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-2 hover:border-[#aaff01]/40">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-7 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-white/68">{description}</p>
      <a className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#aaff01]" href="#contact-form">
        {action}
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </article>
  );
}

export default function ContactSelection() {
  return (
    <section className="bg-[#111317] py-24" id="channels">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
            Size En Uygun
            <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">Temas Noktasını</span>
            Seçin
          </h2>
          <p className="mt-7 text-lg leading-8 text-white/72">
            Hızlı bir mesaj, detaylı bir brief ya da planlı bir toplantı. Hangisiyle başlarsanız başlayın, aynı netlikle ilerleriz.
          </p>
        </div>
        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {contactChannels.map((channel) => (
            <ContactChannelCard key={channel.title} {...channel} />
          ))}
        </div>
      </div>
    </section>
  );
}
