import { Check, X, MessageSquare, Target, Users as UsersIcon } from 'lucide-react';
import { Button } from '../components/button';

const contentItems = [
  {
    title: 'Ürün Tanıtım Videosu - Yaz Koleksiyonu',
    platform: 'Instagram Reels',
    objective: 'Etkileşim artışı',
    targetAudience: '18-34 yaş, moda ilgisi',
    caption: 'Yazın en taze renkleri artık koleksiyonumuzda! 🌈 Hangi kombini denemek isterdiniz?',
    status: 'pending'
  },
  {
    title: 'Müşteri Görüşü - Ayşe Yıldız',
    platform: 'TikTok',
    objective: 'Güven oluşturma',
    targetAudience: '25-45 yaş, kadın',
    caption: 'Gerçek müşterimiz Ayşe\'nin hikayesi 💚 #müşterimemnuniyeti',
    status: 'pending'
  },
  {
    title: 'Perde Arkası - Üretim Süreci',
    platform: 'Instagram Story',
    objective: 'Marka bilinirliği',
    targetAudience: 'Tüm takipçiler',
    caption: 'Ürünlerimiz nasıl üretiliyor? İşte perde arkası! ✨',
    status: 'approved'
  },
];

export function ContentPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">İçerik Onayları</h1>
        <p className="text-[#A0A0A0]">Yayınlanmayı bekleyen içerikleri inceleyin</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contentItems.map((item, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex gap-6">
              <div className="w-64 h-48 bg-[#202020] rounded-xl flex items-center justify-center border border-white/[0.08]">
                <span className="text-[#A0A0A0]">Görsel Önizleme</span>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl text-white">{item.title}</h3>
                    {item.status === 'approved' && (
                      <span className="px-3 py-1 rounded-lg text-sm bg-[#AAFF01]/10 text-[#AAFF01] border border-[#AAFF01]/20">
                        Onaylandı
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                      {item.platform}
                    </span>
                  </div>
                </div>

                <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                  <p className="text-white text-sm mb-3">{item.caption}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#A0A0A0] mb-1">
                        <Target className="w-3 h-3" />
                        <span>Hedef</span>
                      </div>
                      <p className="text-sm text-white">{item.objective}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#A0A0A0] mb-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>Hedef Kitle</span>
                      </div>
                      <p className="text-sm text-white">{item.targetAudience}</p>
                    </div>
                  </div>
                </div>

                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button variant="primary" icon={Check} className="flex-1 justify-center">
                      Onayla ve Yayınla
                    </Button>
                    <Button variant="secondary" icon={X} className="flex-1 justify-center">
                      Revizyon İste
                    </Button>
                    <Button variant="ghost" icon={MessageSquare} className="px-4">
                      Yorum
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
