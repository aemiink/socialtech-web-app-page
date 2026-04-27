import { Download, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../components/button';

const reports = [
  { title: 'Nisan 2026 - Aylık Performans Raporu', date: '1 Mayıs 2026', status: 'new' },
  { title: 'Mart 2026 - Aylık Performans Raporu', date: '1 Nisan 2026', status: 'read' },
  { title: 'Q1 2026 - Çeyreklik Özet', date: '5 Nisan 2026', status: 'read' },
];

export function ReportsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Raporlar</h1>
        <p className="text-[#A0A0A0]">Periyodik performans raporlarınız</p>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-white/[0.08]">
        <h2 className="text-2xl text-white mb-6">Nisan 2026 Performans Özeti</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#AAFF01]/10 flex items-center justify-center">
                <span className="text-[#AAFF01]">1</span>
              </div>
              Özet
            </h3>
            <div className="bg-[#202020] rounded-xl p-6 border border-white/[0.08]">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl text-white mb-1">₺124,450</div>
                  <div className="text-sm text-[#A0A0A0]">Toplam Harcama</div>
                </div>
                <div>
                  <div className="text-3xl text-[#AAFF01] mb-1">4.6x</div>
                  <div className="text-sm text-[#A0A0A0]">Ortalama ROAS</div>
                </div>
                <div>
                  <div className="text-3xl text-white mb-1">573</div>
                  <div className="text-sm text-[#A0A0A0]">Toplam Leads</div>
                </div>
                <div>
                  <div className="text-3xl text-white mb-1">₺217</div>
                  <div className="text-sm text-[#A0A0A0]">Lead Başına Maliyet</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#AAFF01]/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
              </div>
              Ne İşe Yaradı
            </h3>
            <div className="bg-[#202020] rounded-xl p-6 border border-white/[0.08] space-y-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white mb-1">Kullanıcı tarafından oluşturulan içerik (UGC) formatı</p>
                  <p className="text-sm text-[#A0A0A0]">Standart ürün fotoğraflarından %240 daha iyi performans gösterdi. Dönüşüm oranı %18 arttı.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white mb-1">Yeniden hedefleme kampanyaları</p>
                  <p className="text-sm text-[#A0A0A0]">Carousel format ile ürün gösterimi çok etkili oldu. 6.1x ROAS elde ettik.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white mb-1">Instagram Reels kısa videolar</p>
                  <p className="text-sm text-[#A0A0A0]">Organik erişim %156 arttı. Story formatından çok daha iyi etkileşim aldık.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFA726]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#FFA726]" />
              </div>
              Üzerinde Çalıştığımız Konular
            </h3>
            <div className="bg-[#202020] rounded-xl p-6 border border-white/[0.08] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#FFA726]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#FFA726] text-xs">→</span>
                </div>
                <div>
                  <p className="text-white mb-1">Görsel yorgunluğu</p>
                  <p className="text-sm text-[#A0A0A0]">Mevcut görseller 2 hafta sonra yorulmaya başladı. 5 yeni konsept hazırladık, teste başlıyoruz.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#FFA726]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#FFA726] text-xs">→</span>
                </div>
                <div>
                  <p className="text-white mb-1">Soğuk kitle maliyeti</p>
                  <p className="text-sm text-[#A0A0A0]">Yeni müşteri edinme maliyeti hedefin %15 üzerinde. Hedefleme stratejisini optimize ediyoruz.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7B61FF]/10 flex items-center justify-center">
                <span className="text-[#7B61FF]">→</span>
              </div>
              Mayıs Planımız
            </h3>
            <div className="bg-[#202020] rounded-xl p-6 border border-white/[0.08] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#AAFF01]"></div>
                </div>
                <div>
                  <p className="text-white mb-1">UGC içerik üretimini artırma</p>
                  <p className="text-sm text-[#A0A0A0]">Gerçek müşterilerle çekim planı. 10 yeni video hedefliyoruz.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#AAFF01]"></div>
                </div>
                <div>
                  <p className="text-white mb-1">Lookalike kitle testi</p>
                  <p className="text-sm text-[#A0A0A0]">En iyi müşterilerinize benzer kitleler bulup test edeceğiz.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#AAFF01]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#AAFF01]"></div>
                </div>
                <div>
                  <p className="text-white mb-1">Email pazarlama entegrasyonu</p>
                  <p className="text-sm text-[#A0A0A0]">Leadleri email ile beslemeye başlayacağız. Dönüşüm oranını artırmayı hedefliyoruz.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.08]">
          <Button variant="secondary" icon={Download}>
            PDF olarak İndir
          </Button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
        <h2 className="text-xl text-white mb-4">Geçmiş Raporlar</h2>
        <div className="space-y-3">
          {reports.map((report, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#202020] rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#AAFF01]" />
                <div>
                  <p className="text-white flex items-center gap-2">
                    {report.title}
                    {report.status === 'new' && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[#AAFF01]/10 text-[#AAFF01]">Yeni</span>
                    )}
                  </p>
                  <p className="text-sm text-[#A0A0A0]">{report.date}</p>
                </div>
              </div>
              <Button variant="ghost" icon={Download}>İndir</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
