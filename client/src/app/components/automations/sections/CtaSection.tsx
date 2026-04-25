import ActionButton from "../../site/ActionButton";

export default function CtaSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#25123e_0%,#aaff01_100%)] py-24">
      <div className="mx-auto w-full max-w-[1540px] px-6 text-center lg:px-10">
        <h2 className="text-[36px] font-black leading-tight text-white md:text-[56px]">
          Reklamı Yalnız Bırakmayalım.
          <br />
          <span className="inline-block -rotate-1 bg-black px-3 text-[#aaff01]">Otomasyonla Büyütelim.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[760px] text-lg leading-8 text-black/72">
          Markanız için hangi otomasyonların en hızlı değer üreteceğini birlikte seçelim. Önce akışı dinliyor, sonra sistemi kuruyoruz.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <ActionButton accent="violet" label="Otomasyon Stratejisi Planla" to="/iletisim#contact-form" />
          <ActionButton accent="lime" label="Growth Paketini İncele" to="/hizmetler/buyume-hub" />
        </div>
      </div>
    </section>
  );
}
