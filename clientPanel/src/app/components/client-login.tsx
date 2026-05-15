import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-react';
import yatayLogo from '../../assets/branding/yatay-logo.svg';

export interface DemoClient {
  email: string;
  password: string;
  name: string;
  company: string;
  initials: string;
}

interface ClientLoginProps {
  demoClient: DemoClient;
  onLogin: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  notice?: string | null;
}

export function ClientLogin({ demoClient, onLogin, notice = null }: ClientLoginProps) {
  const [email, setEmail] = useState(demoClient.email);
  const [password, setPassword] = useState(demoClient.password);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('E-posta adresi gerekli.');
      return;
    }

    if (!password.trim()) {
      setError('Şifre gerekli.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.message ?? 'Giriş başarısız.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden lg:flex rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-8 flex-col justify-between shadow-[0_0_40px_rgba(170,255,1,0.06)]">
          <div>
            <img alt="Social Tech" className="mb-8 h-11 w-auto object-contain" src={yatayLogo} />
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-1 text-xs text-[#AAFF01]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Müşteri görünürlük portalı
            </div>
            <h1 className="mb-4 text-4xl font-semibold leading-tight">
              Hizmet performansı ve ajans aksiyonları tek ekranda.
            </h1>
            <p className="max-w-md text-sm leading-6 text-[#A0A0A0]">
              Raporlar, toplantılar, faturalama, onaylar ve satın alınan hizmet
              panelleri müşteri portalında demo giriş sonrası görünür.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              'Giriş sonrası mevcut hizmet seçimi akışı korunur.',
              'Refresh token HttpOnly cookie ile session restore yapılır.',
              'Client erişimleri backend yetkisine göre korunur.',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 shadow-[0_0_40px_rgba(170,255,1,0.06)] sm:p-8">
          <div className="mb-7">
            <div className="mb-5 flex items-center gap-3">
              <img alt="Social Tech" className="h-10 w-auto object-contain" src={yatayLogo} />
              <div>
                <h1 className="text-2xl font-semibold">Müşteri Portalı</h1>
                <p className="text-sm text-[#A0A0A0]">
                  Social Tech hizmet görünümünü açın.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {notice && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {notice}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="client-email" className="text-sm text-[#F5F5F5]">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#131313] px-3 pl-10 text-sm text-white outline-none transition-all placeholder:text-[#A0A0A0] focus:border-[#AAFF01]/60 focus:ring-2 focus:ring-[#AAFF01]/20"
                  placeholder={demoClient.email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="client-password" className="text-sm text-[#F5F5F5]">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  id="client-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#131313] px-3 pl-10 text-sm text-white outline-none transition-all placeholder:text-[#A0A0A0] focus:border-[#AAFF01]/60 focus:ring-2 focus:ring-[#AAFF01]/20"
                  placeholder={demoClient.password}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !password.trim()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#AAFF01] text-sm font-medium text-[#131313] transition-all hover:bg-[#AAFF01]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Portalı Aç'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-3 inline-flex rounded-full border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-1 text-xs text-[#AAFF01]">
              Seed demo erişim
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-white">{demoClient.email}</p>
              <p className="text-[#A0A0A0]">Şifre: {demoClient.password}</p>
              <p className="text-xs text-[#A0A0A0]">
                {demoClient.name} / {demoClient.company}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
