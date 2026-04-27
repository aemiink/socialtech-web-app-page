import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../components/button';

const automationFlows = [
  { name: 'Yorumdan DM Akışı', status: 'active', conversions: '847', rate: '%12.4' },
  { name: 'Link Tıklamadan Potansiyel Müşteri', status: 'active', conversions: '423', rate: '%8.2' },
  { name: 'Story Yanıt Otomasyonu', status: 'paused', conversions: '124', rate: '%5.1' },
];

const lockedAutomations = [
  { name: 'Yapay Zeka Sohbet Botu', description: 'Otomatik potansiyel müşteri nitelendirme' },
  { name: 'Çok Adımlı Diziler', description: 'Gelişmiş besleme akışları' },
  { name: 'CRM Entegrasyonu', description: 'Potansiyel müşterileri CRM\'inize senkronize edin' },
];

export function AutomationsPage() {
  const isGrowthPlan = true;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Otomasyonlar</h1>
          <p className="text-[#A0A0A0]">Potansiyel müşteri oluşturma iş akışlarınızı otomatikleştirin</p>
        </div>
        {isGrowthPlan && (
          <Button variant="primary" icon={Zap}>Otomasyon Oluştur</Button>
        )}
      </div>

      {isGrowthPlan ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {automationFlows.map((flow, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white">{flow.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    flow.status === 'active'
                      ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                      : 'bg-[#A0A0A0]/10 text-[#A0A0A0] border border-[#A0A0A0]/20'
                  }`}>
                    {flow.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0] text-sm">Dönüşümler</span>
                    <span className="text-white">{flow.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0] text-sm">Dönüşüm Oranı</span>
                    <span className="text-[#AAFF01]">{flow.rate}</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full justify-center text-sm">
                  Detayları Görüntüle
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-xl text-white mb-4">Akış Görselleştirme</h2>
            <div className="flex items-center gap-4 justify-center py-8">
              {['Yorum', 'DM Gönderildi', 'Link Tıklandı', 'Form Gönderildi', 'Potansiyel Müşteri'].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-[#202020] px-6 py-3 rounded-xl border border-white/[0.08]">
                    <span className="text-white">{step}</span>
                  </div>
                  {i < 4 && <ArrowRight className="w-5 h-5 text-[#AAFF01]" />}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lockedAutomations.map((auto, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-[#A0A0A0]" />
              </div>
              <div className="opacity-50 mb-4">
                <h3 className="text-white mb-2">{auto.name}</h3>
                <p className="text-[#A0A0A0] text-sm">{auto.description}</p>
              </div>
              <div className="bg-gradient-to-r from-[#AAFF01]/10 to-[#7B61FF]/10 border border-[#AAFF01]/20 rounded-lg p-3 text-center">
                <p className="text-sm text-white">Büyüme Planında Mevcut</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
