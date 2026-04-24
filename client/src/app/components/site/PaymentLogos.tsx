import axessLogo from "../../../assets/payment-axess.png";
import iyzicoLogo from "../../../assets/payment-iyzico.png";
import maestroLogo from "../../../assets/payment-maestro.png";
import mastercardLogo from "../../../assets/payment-mastercard.png";
import maximumLogo from "../../../assets/payment-maximum.png";
import troyLogo from "../../../assets/payment-troy.svg";
import visaLogo from "../../../assets/payment-visa.png";

const paymentLogos = [
  { alt: "iyzico", src: iyzicoLogo, className: "h-7 md:h-8" },
  { alt: "Visa", src: visaLogo, className: "h-7 md:h-8" },
  { alt: "Mastercard", src: mastercardLogo, className: "h-9 md:h-10" },
  { alt: "Maestro", src: maestroLogo, className: "h-8 md:h-9" },
  { alt: "Maximum", src: maximumLogo, className: "h-8 md:h-9" },
  { alt: "Axess", src: axessLogo, className: "h-8 md:h-9" },
  { alt: "TROY", src: troyLogo, className: "h-9 opacity-95 [filter:brightness(0)_invert(1)] md:h-10" },
];

export default function PaymentLogos() {
  return (
    <div className="mx-auto mt-10 grid max-w-[1120px] grid-cols-2 items-center justify-center gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {paymentLogos.map((logo) => (
        <div
          className="flex h-16 w-full items-center justify-center rounded-[16px] border border-white/8 bg-white/[0.035] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur transition duration-300 hover:border-[#aaff01]/28 hover:bg-white/[0.06]"
          key={logo.alt}
        >
          <img alt={logo.alt} className={`max-w-[118px] object-contain ${logo.className}`} src={logo.src} />
        </div>
      ))}
    </div>
  );
}
