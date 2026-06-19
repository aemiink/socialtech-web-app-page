import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../components/button';

type LockedAutomation = {
  name: string;
  description: string;
};

const lockedAutomations: LockedAutomation[] = [
  { name: 'Yapay Zeka Sohbet Botu', description: 'Otomatik potansiyel müşteri nitelendirme' },
  { name: 'Çok Adımlı Diziler', description: 'Gelişmiş besleme akışları' },
  { name: 'CRM Entegrasyonu', description: "Potansiyel müşterileri CRM'inize senkronize edin" },
];

export function AutomationsPage() {
  return (
    <div className="min-h-full bg-[#131313]">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Otomasyonlar</h1>
            <p className="text-[#A0A0A0]">Potansiyel müşteri oluşturma iş akışlarınızı otomatikleştirin</p>
          </div>
        </div>

        {/* Coming soon / empty state */}
        <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#1A1A1A] p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#202020] border border-white/[0.08]">
            <Zap className="h-6 w-6 text-[#A0A0A0]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Otomasyonlar Yakında Aktif Olacak</h2>
          <p className="mx-auto max-w-md text-sm text-[#A0A0A0] leading-relaxed">
            Otomasyon iş akışları ekibimiz tarafından profilinize özel olarak kurulur.
            Hazır olduğunda bu sayfadan canlı takip edebileceksiniz.
          </p>
          <Button
            variant="secondary"
            icon={ArrowRight}
            className="mx-auto"
            onClick={() => window.open('mailto:info@socialtech.com.tr')}
          >
            Hesap yöneticinizle görüşün
          </Button>
        </div>

        {/* Gelecekte eklenecek otomasyon örnekleri */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Yakında Kullanıma Girecek</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {lockedAutomations.map((automation) => (
              <div
                key={automation.name}
                className="group flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[#202020] p-4 opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-[#A0A0A0]" />
                  <p className="text-sm font-medium text-white">{automation.name}</p>
                </div>
                <p className="text-xs text-[#A0A0A0]">{automation.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
