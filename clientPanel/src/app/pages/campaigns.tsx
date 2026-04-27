import { TrendingUp, MessageSquare } from 'lucide-react';

const campaigns = [
  {
    name: 'Yaz İndirimi 2026',
    budget: '₺35,000',
    roas: '4.8x',
    status: 'excellent',
    statusLabel: 'Mükemmel',
    comment: 'Kampanya hedeflerin üzerinde performans gösteriyor. Kullanıcı tarafından oluşturulan içerik formatı çok iyi sonuç veriyor.',
    author: 'Elif Yılmaz'
  },
  {
    name: 'Marka Bilinirliği Q2',
    budget: '₺25,000',
    roas: '3.2x',
    status: 'improving',
    statusLabel: 'İyileşiyor',
    comment: 'İlk hafta düşük performans gösterdi ancak hedef kitle optimizasyonundan sonra iyileşme başladı. Önümüzdeki hafta daha iyi sonuçlar bekliyoruz.',
    author: 'Mehmet Kaya'
  },
  {
    name: 'Yeniden Hedefleme Akışı',
    budget: '₺15,000',
    roas: '6.1x',
    status: 'excellent',
    statusLabel: 'Mükemmel',
    comment: 'En yüksek ROAS\'ı veren kampanya. Carousel format ile ürün gösterimi çok etkili oldu.',
    author: 'Elif Yılmaz'
  },
  {
    name: 'Yeni Kitle Testi',
    budget: '₺10,000',
    roas: '2.1x',
    status: 'testing',
    statusLabel: 'Test Aşamasında',
    comment: 'Henüz erken aşamada. Farklı yaş grupları ve ilgi alanlarını test ediyoruz. 2 hafta sonra veri ile optimize edeceğiz.',
    author: 'Mehmet Kaya'
  },
];

export function CampaignsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Kampanyalar</h1>
        <p className="text-[#A0A0A0]">Aktif kampanyalarınızın durumu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl text-white mb-2">{campaign.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[#A0A0A0] text-sm">Bütçe: {campaign.budget}</span>
                  <span className="text-white">ROAS: {campaign.roas}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm ${
                campaign.status === 'excellent'
                  ? 'bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20'
                  : campaign.status === 'improving'
                  ? 'bg-[#FFA726]/10 text-[#FFA726] border border-[#FFA726]/20'
                  : 'bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20'
              }`}>
                {campaign.statusLabel}
              </span>
            </div>

            <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white mb-3">{campaign.comment}</p>
                  <p className="text-xs text-[#A0A0A0]">— {campaign.author}, Social Tech</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-[#202020] rounded-lg p-3 text-center">
                <div className="text-lg text-white">2.8%</div>
                <div className="text-xs text-[#A0A0A0]">CTR</div>
              </div>
              <div className="bg-[#202020] rounded-lg p-3 text-center">
                <div className="text-lg text-white">₺42</div>
                <div className="text-xs text-[#A0A0A0]">CPA</div>
              </div>
              <div className="bg-[#202020] rounded-lg p-3 text-center">
                <div className="text-lg text-[#AAFF01] flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12%
                </div>
                <div className="text-xs text-[#A0A0A0]">Değişim</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
