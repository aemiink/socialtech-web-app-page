import { processSteps } from "../contactData";

function ProcessStep({ title, description, icon: Icon }: (typeof processSteps)[number]) {
  return (
    <article className="rounded-[24px] bg-[#25272b] p-7 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-[#aaff01]">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/66">{description}</p>
    </article>
  );
}

export default function AfterMeet() {
  return (
    <section className="bg-[#111317] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 lg:px-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
            Görüşmeden Sonra
            <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">Ne Olacak?</span>
          </h2>
          <p className="mt-7 text-lg leading-8 text-white/72">
            Belirsiz teklif süreçleri yerine; kısa, ölçülebilir ve uygulanabilir bir başlangıç planı çıkarıyoruz.
          </p>
        </div>
        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {processSteps.map((step) => (
            <ProcessStep key={step.title} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
