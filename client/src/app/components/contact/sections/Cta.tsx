import ActionButton from "../../site/ActionButton";

export default function Cta() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,rgba(170,255,1,0.28),#101316_72%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
        <h2 className="text-[32px] font-extrabold leading-tight text-white md:text-[46px]">
          Hazırsanız,
          <span className="mx-2 inline-block -rotate-1 bg-[#aaff01] px-3 py-1 text-black">ilk konuşmayı</span>
          başlatalım.
        </h2>
        <p className="mx-auto mt-6 max-w-[720px] text-lg leading-8 text-white/72">
          Bize hedefinizi yazın. Size hizmet satmaya değil, doğru sistemi kurmaya odaklanalım.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ActionButton accent="lime" className="min-w-[260px]" href="#contact-form" label="Formu Aç" />
          <ActionButton accent="violet" className="min-w-[260px]" to="/hizmetler" label="Hizmetleri İncele" />
        </div>
      </div>
    </section>
  );
}
