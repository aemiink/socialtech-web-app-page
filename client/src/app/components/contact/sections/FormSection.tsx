import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

import { serviceOptions } from "../contactData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

type ContactFormState = {
  fullName: string;
  phone: string;
  contactEmail: string;
  companyName: string;
  serviceInterest: string;
  budgetRange: string;
  goal: string;
  consentAccepted: boolean;
};

const initialFormState: ContactFormState = {
  fullName: "",
  phone: "",
  contactEmail: "",
  companyName: "",
  serviceInterest: serviceOptions[0] ?? "Henüz emin değilim",
  budgetRange: "Henüz net değil",
  goal: "",
  consentAccepted: false,
};

function FormField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-white/78">{label}</span>
      <input
        className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!form.fullName.trim() || !form.companyName.trim()) {
      setSubmitState("error");
      setMessage("Ad soyad ve marka/şirket alanları zorunludur.");
      return;
    }

    if (!form.contactEmail.trim() && !form.phone.trim()) {
      setSubmitState("error");
      setMessage("Size dönebilmemiz için e-posta veya telefon bilgilerinden en az biri gerekli.");
      return;
    }

    if (!form.consentAccepted) {
      setSubmitState("error");
      setMessage("Formu göndermek için iletişim iznini onaylamanız gerekiyor.");
      return;
    }

    setSubmitState("submitting");

    try {
      const response = await fetch(`${API_BASE_URL}/public/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          companyName: form.companyName,
          contactEmail: form.contactEmail || undefined,
          phone: form.phone || undefined,
          serviceInterest: form.serviceInterest,
          budgetRange: form.budgetRange,
          goal: form.goal || undefined,
          consentAccepted: form.consentAccepted,
          sourcePath: `${window.location.pathname}${window.location.hash}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Form gönderilemedi.");
      }

      setForm(initialFormState);
      setSubmitState("success");
      setMessage("Başvurunuz alındı. CRM ekibimiz en kısa sürede sizinle iletişime geçecek.");
    } catch {
      setSubmitState("error");
      setMessage("Başvuru şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin.");
    }
  }

  return (
    <form
      className="rounded-[34px] border border-[#aaff01]/16 bg-[#4d7300] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.34)] md:p-10"
      id="contact-form"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Ad Soyad"
          placeholder="Ahmet Emin Kaya"
          value={form.fullName}
          onChange={(value) => setForm((previous) => ({ ...previous, fullName: value }))}
        />
        <FormField
          label="Telefon"
          placeholder="+90 5xx xxx xx xx"
          type="tel"
          value={form.phone}
          onChange={(value) => setForm((previous) => ({ ...previous, phone: value }))}
        />
        <FormField
          label="E-Posta"
          placeholder="mail@marka.com"
          type="email"
          value={form.contactEmail}
          onChange={(value) => setForm((previous) => ({ ...previous, contactEmail: value }))}
        />
        <FormField
          label="Marka / Şirket"
          placeholder="Social Tech"
          value={form.companyName}
          onChange={(value) => setForm((previous) => ({ ...previous, companyName: value }))}
        />
        <label className="block">
          <span className="text-sm font-bold text-white/78">İlgilendiğiniz Hizmet</span>
          <select
            className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
            value={form.serviceInterest}
            onChange={(event) => setForm((previous) => ({ ...previous, serviceInterest: event.target.value }))}
          >
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-white/78">Bütçe Aralığı</span>
          <select
            className="mt-3 h-14 w-full rounded-[12px] border border-white/10 bg-black/70 px-4 text-sm text-white outline-none transition focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
            value={form.budgetRange}
            onChange={(event) => setForm((previous) => ({ ...previous, budgetRange: event.target.value }))}
          >
            <option>Henüz net değil</option>
            <option>10.000 ₺ - 30.000 ₺</option>
            <option>30.000 ₺ - 75.000 ₺</option>
            <option>75.000 ₺ ve üzeri</option>
          </select>
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-bold text-white/78">Kısaca Hedefiniz</span>
        <textarea
          className="mt-3 min-h-[150px] w-full rounded-[12px] border border-white/10 bg-black/70 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/32 focus:border-[#aaff01]/70 focus:ring-4 focus:ring-[#aaff01]/10"
          placeholder="Markanız şu an nerede, nereye gitmek istiyor? Kısaca anlatın."
          value={form.goal}
          onChange={(event) => setForm((previous) => ({ ...previous, goal: event.target.value }))}
        />
      </label>

      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-white/80">
        <input
          className="mt-1 h-5 w-5 accent-[#aaff01]"
          type="checkbox"
          checked={form.consentAccepted}
          onChange={(event) => setForm((previous) => ({ ...previous, consentAccepted: event.target.checked }))}
        />
        <span>KVKK ve gizlilik şartlarını okudum, iletişim kurulmasını kabul ediyorum.</span>
      </label>

      {message && (
        <div
          className={`mt-5 rounded-[12px] border px-4 py-3 text-sm font-bold ${
            submitState === "success"
              ? "border-[#aaff01]/40 bg-[#aaff01]/15 text-white"
              : "border-red-200/40 bg-red-950/30 text-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <button
        className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-[12px] bg-black px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#aaff01] hover:text-black disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-black disabled:hover:text-white"
        disabled={submitState === "submitting"}
        type="submit"
      >
        {submitState === "submitting" ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function FormSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#111317_0%,#171717_100%)] py-24">
      <div className="mx-auto grid w-full max-w-[1540px] gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
        <div>
          <span className="inline-flex rounded-full bg-[#aaff01] px-4 py-1 text-xs font-extrabold text-black">Başlangıç Brief'i</span>
          <h2 className="mt-6 text-[34px] font-extrabold leading-tight text-white md:text-[52px]">
            Bize biraz markanızdan bahsedin,
            <span className="block text-[#aaff01]">gerisini birlikte netleştirelim.</span>
          </h2>
          <p className="mt-7 text-lg leading-8 text-white/70">
            Bu form satış baskısı için değil; doğru hizmeti, doğru sırayla önermek için var. Cevabınızdan sonra size daha net sorularla döneriz.
          </p>
          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
              <Phone className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
              <div>
                <h3 className="font-extrabold text-white">Telefon / WhatsApp</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">Hızlı dönüş gerektiren konularda WhatsApp üzerinden ilerleyebiliriz.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
              <Mail className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
              <div>
                <h3 className="font-extrabold text-white">E-posta</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">Brief, teklif ve detaylı proje dokümanları için mail akışı daha sağlıklıdır.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-[#aaff01]" />
              <div>
                <h3 className="font-extrabold text-white">Konum Bağımsız Çalışma</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">Toplantı, raporlama ve proje yönetimi dijital sistem üzerinden yürür.</p>
              </div>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
