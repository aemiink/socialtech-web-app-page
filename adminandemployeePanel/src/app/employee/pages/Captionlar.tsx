import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Type, Copy, Plus, CheckCircle } from "lucide-react";

const captionlar = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Bahçeciliği",
    musteri: "Koçtaş",
    platform: "Instagram",
    metin: "🌿 Baharın büyüsünü bahçenize taşıyın! Koçtaş'ın geniş bahçe ürünleri koleksiyonuyla hayalinizdeki yeşil alanı yaratın. 🌸\n\n✅ 500+ çeşit bitki\n✅ Profesyonel bahçe araçları\n✅ Uzman tavsiyesi\n\n#Koçtaş #Bahçe #Bahar2026 #DoğaSevenler",
    karakter: 248,
    durum: "onaylandı"
  },
  {
    id: "2",
    baslik: "Getir Hafta Sonu",
    musteri: "Getir",
    platform: "TikTok",
    metin: "Hafta sonu kıpırdamayın, Getir gelsin! 🛵⚡\n\n30 dakikada kapınızda 🔥\nBinlerce ürün, tek uygulama 📱\n\n#Getir #HızlıTeslimat #HaftaSonu #Sipariş",
    karakter: 142,
    durum: "onaylandı"
  },
  {
    id: "3",
    baslik: "LC Waikiki Yaz Koleksiyonu",
    musteri: "LC Waikiki",
    platform: "Instagram",
    metin: "☀️ 2026 Yaz Koleksiyonu şimdi mağazalarda ve lcwaikiki.com'da!\n\nRenkli yazlar için renkli modalar 🌈 Bu sezonun en trend parçalarını keşfet, favorilerini sepete ekle!\n\n#LCWaikiki #YazKoleksiyonu #Moda2026 #Trend",
    karakter: 218,
    durum: "taslak"
  },
  {
    id: "4",
    baslik: "Migros Pazartesi Fırsatları",
    musteri: "Migros",
    platform: "Instagram Story",
    metin: "🛒 Pazartesi fırsatları başladı! Sepet tutarınıza özel %20 indirim!\n\n⏰ Sadece bugün geçerli\n📲 Migros uygulamasından sipariş verin\n\n#Migros #Fırsat #Alışveriş",
    karakter: 172,
    durum: "onay-bekliyor"
  }
];

const durumRengi: Record<string, string> = {
  "onaylandı": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "onay-bekliyor": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "taslak": "bg-white/10 text-[#A0A0A0] border-white/10"
};

const durumLabel: Record<string, string> = {
  "onaylandı": "Onaylandı",
  "onay-bekliyor": "Onay Bekliyor",
  "taslak": "Taslak"
};

export function Captionlar() {
  const onaylı = captionlar.filter(c => c.durum === "onaylandı").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Captionlar</h1>
          <p className="text-[#A0A0A0]">Sosyal medya gönderi metinleri ve hashtag setleri</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Yeni Caption
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Type className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Caption</span>
          </div>
          <div className="text-2xl font-semibold">{captionlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Onaylanan</span>
          </div>
          <div className="text-2xl font-semibold">{onaylı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Type className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{captionlar.length - onaylı}</div>
        </Card>
      </div>

      <div className="space-y-4">
        {captionlar.map((caption) => (
          <Card key={caption.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{caption.baslik}</h4>
                  <Badge variant="outline">{caption.platform}</Badge>
                  <Badge className={durumRengi[caption.durum]}>
                    {durumLabel[caption.durum]}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0]">
                  Müşteri: {caption.musteri} · {caption.karakter} karakter
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">Düzenle</Button>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#202020] border border-white/[0.06]">
              <p className="text-sm text-[#A0A0A0] whitespace-pre-line leading-relaxed">{caption.metin}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
