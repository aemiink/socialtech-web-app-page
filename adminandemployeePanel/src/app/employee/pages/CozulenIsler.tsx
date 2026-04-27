import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { CheckCircle, Clock, Award, Filter } from "lucide-react";

const cozulenler = [
  {
    id: "TKT-0138",
    baslik: "Google Analytics GA4 entegrasyonu — Migros",
    musteri: "Migros",
    kategori: "Analytics",
    oncelik: "yüksek",
    cozumTarihi: "2026-04-24",
    suresi: "2.5 saat",
    cozen: "Selin Yılmaz",
    cozum: "GA4 mülk yetkilendirmesi yenilendi, tag manager güncellendi."
  },
  {
    id: "TKT-0137",
    baslik: "Domain DNS propagasyon sorunu — Boyner",
    musteri: "Boyner",
    kategori: "Domain",
    oncelik: "kritik",
    cozumTarihi: "2026-04-23",
    suresi: "4 saat",
    cozen: "Selin Yılmaz",
    cozum: "DNS kayıtları doğru nameserver'a yönlendirildi."
  },
  {
    id: "TKT-0135",
    baslik: "Sayfa yükleme süresi optimizasyonu — Teknosa",
    musteri: "Teknosa",
    kategori: "Performans",
    oncelik: "normal",
    cozumTarihi: "2026-04-22",
    suresi: "6 saat",
    cozen: "Selin Yılmaz",
    cozum: "Image lazy loading ve CDN cache TTL değerleri optimize edildi. LCP 4.2s → 1.8s."
  },
  {
    id: "TKT-0133",
    baslik: "Hatalı yönlendirme — 404 sayfaları",
    musteri: "Hepsiburada",
    kategori: "SEO",
    oncelik: "normal",
    cozumTarihi: "2026-04-20",
    suresi: "1.5 saat",
    cozen: "Selin Yılmaz",
    cozum: "Eski URL'lerden yeni URL yapısına 301 yönlendirme kuralları eklendi."
  }
];

export function CozulenIsler() {
  const buHafta = cozulenler.filter(c => new Date(c.cozumTarihi) >= new Date("2026-04-21")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Çözülen İşler</h1>
          <p className="text-[#A0A0A0]">Başarıyla kapatılan destek talepleri ve çözüm geçmişi</p>
        </div>
        <Button size="sm" variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filtrele
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Çözülen</span>
          </div>
          <div className="text-2xl font-semibold">{cozulenler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta</span>
          </div>
          <div className="text-2xl font-semibold">{buHafta}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Müşteri Memnuniyeti</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">%94</div>
        </Card>
      </div>

      <div className="space-y-3">
        {cozulenler.map((is) => (
          <Card key={is.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[#AAFF01]/10 shrink-0">
                <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[#A0A0A0]">{is.id}</span>
                      <h4 className="font-semibold text-sm">{is.baslik}</h4>
                      <Badge variant="outline" className="text-xs">{is.kategori}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                      <span>Müşteri: {is.musteri}</span>
                      <span>Çözen: {is.cozen}</span>
                      <span>Süre: {is.suresi}</span>
                      <span>{new Date(is.cozumTarihi).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  <Badge
                    variant={is.oncelik === "kritik" ? "destructive" : is.oncelik === "yüksek" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {is.oncelik === "kritik" ? "Kritik" : is.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] border border-white/[0.06]">
                  <p className="text-sm text-[#A0A0A0]">{is.cozum}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
