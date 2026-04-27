import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { FileText, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";

const notlar = [
  {
    id: "1",
    baslik: "Koçtaş Meta ADS — Nisan Değerlendirmesi",
    musteri: "Koçtaş",
    platform: "Meta ADS",
    tarih: "2026-04-26",
    trend: "yukarı",
    not: "CPM geçen aya göre %12 düştü. Geniş kitle testi başarılı. Bahçe ürünleri kategorisi öne çıkarılmalı.",
    ekleyen: "Elif Kara"
  },
  {
    id: "2",
    baslik: "Türk Telekom Google ADS — Haftalık Özet",
    musteri: "Türk Telekom",
    platform: "Google ADS",
    tarih: "2026-04-25",
    trend: "yukarı",
    not: "Fiber anahtar kelimelerinde ROAS 5.2x'e ulaştı. Marka kelimelerindeki teklif stratejisi revize edilmeli.",
    ekleyen: "Elif Kara"
  },
  {
    id: "3",
    baslik: "Migros Meta ADS — Ramazan Sonucu",
    musteri: "Migros",
    platform: "Meta ADS",
    tarih: "2026-04-24",
    trend: "aşağı",
    not: "Ramazan döneminde CPA beklentinin üzerinde geldi. Video formatı görsel ile karşılaştırıldığında %40 daha pahalı. Önümüzdeki dönem statik banner tercih edilmeli.",
    ekleyen: "Zeynep Şen"
  },
  {
    id: "4",
    baslik: "Getir TikTok — Viral İçerik Analizi",
    musteri: "Getir",
    platform: "TikTok ADS",
    tarih: "2026-04-23",
    trend: "yukarı",
    not: "18-24 yaş segmentinde CTR %3.2 ile sektör ortalamasının 2 katı. #GetirHızı hashtag organik büyüme sağladı.",
    ekleyen: "Elif Kara"
  }
];

const trendIcon = (trend: string) => {
  if (trend === "yukarı") return <TrendingUp className="w-4 h-4 text-[#AAFF01]" />;
  if (trend === "aşağı") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-[#A0A0A0]" />;
};

export function RaporNotlari() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Rapor Notları</h1>
          <p className="text-[#A0A0A0]">Kampanya ve platform bazlı performans notları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Not Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Not</span>
          </div>
          <div className="text-2xl font-semibold">{notlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Pozitif Trend</span>
          </div>
          <div className="text-2xl font-semibold">{notlar.filter(n => n.trend === "yukarı").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">İyileştirme Gerekli</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{notlar.filter(n => n.trend === "aşağı").length}</div>
        </Card>
      </div>

      <div className="space-y-4">
        {notlar.map((not) => (
          <Card key={not.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {trendIcon(not.trend)}
                <h4 className="font-semibold text-sm">{not.baslik}</h4>
                <Badge variant="outline">{not.platform}</Badge>
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {new Date(not.tarih).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0] leading-relaxed mb-3">{not.not}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#A0A0A0]">Ekleyen: {not.ekleyen}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">Düzenle</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
