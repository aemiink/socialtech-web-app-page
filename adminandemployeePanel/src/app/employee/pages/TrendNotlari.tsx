import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { TrendingUp, Hash, Plus, Bookmark } from "lucide-react";

const trendler = [
  {
    id: "1",
    baslik: "#YazSezonu2026",
    platform: "Instagram & TikTok",
    kategori: "Mevsimsel",
    aciklama: "Yaz sezonu içerikleri zirveye çıktı. Mavi-beyaz tonlar, outdoor yaşam ve tatil içerikleri çok yüksek etkileşim alıyor.",
    kullanim: "2.4M gönderi",
    uygun: ["LC Waikiki", "Koçtaş"],
    tarih: "2026-04-27"
  },
  {
    id: "2",
    baslik: "Carousel Formatı Artışı",
    platform: "Instagram",
    kategori: "Format",
    aciklama: "Carousel gönderiler, tek görsele göre 3x daha fazla erişim elde ediyor. Ürün kataloğu ve eğitici içeriklerde ideal.",
    kullanim: "Algoritmik avantaj",
    uygun: ["Migros", "Boyner", "Koçtaş"],
    tarih: "2026-04-26"
  },
  {
    id: "3",
    baslik: "TikTok Shop Entegrasyonu",
    platform: "TikTok",
    kategori: "E-ticaret",
    aciklama: "TikTok Shop özelliği Türkiye'de hız kazandı. Video içinde ürün etiketleme ile doğrudan satış akışı oluşturuluyor.",
    kullanim: "Yeni özellik",
    uygun: ["Getir", "Migros"],
    tarih: "2026-04-25"
  },
  {
    id: "4",
    baslik: "#GerçekMüşteri Serisi",
    platform: "Instagram & Facebook",
    kategori: "Sosyal Kanıt",
    aciklama: "Kullanıcı içerikleri (UGC) markaların paylaştığı içeriklere göre %4.5 daha yüksek güvenilirlik sunuyor.",
    kullanim: "Yükselen içerik formatı",
    uygun: ["Koçtaş", "LC Waikiki", "Boyner"],
    tarih: "2026-04-24"
  }
];

const kategoriler = ["Mevsimsel", "Format", "E-ticaret", "Sosyal Kanıt"];
const kategoriRenk: Record<string, string> = {
  "Mevsimsel": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Format": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "E-ticaret": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Sosyal Kanıt": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
};

export function TrendNotlari() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Trend Notları</h1>
          <p className="text-[#A0A0A0]">Güncel sosyal medya trendleri ve içerik stratejisi önerileri</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Not Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kategoriler.map((kat) => (
          <Card key={kat} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
              <span className="text-sm text-[#A0A0A0]">{kat}</span>
            </div>
            <div className="text-2xl font-semibold">
              {trendler.filter(t => t.kategori === kat).length}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {trendler.map((trend) => (
          <Card key={trend.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#AAFF01]" />
                <h4 className="font-semibold text-sm">{trend.baslik}</h4>
                <Badge className={kategoriRenk[trend.kategori]}>{trend.kategori}</Badge>
                <Badge variant="outline">{trend.platform}</Badge>
              </div>
              <span className="text-xs text-[#A0A0A0]">
                {new Date(trend.tarih).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0] leading-relaxed mb-3">{trend.aciklama}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A0A0A0]">{trend.kullanim}</span>
                <span className="text-xs text-[#A0A0A0]">·</span>
                <span className="text-xs text-[#A0A0A0]">
                  Uygun Müşteri: {trend.uygun.join(", ")}
                </span>
              </div>
              <Button size="sm" variant="outline">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
