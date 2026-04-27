import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ListChecks, CheckCircle, Clock, TrendingUp, Plus } from "lucide-react";

const aksiyonlar = [
  {
    id: "1",
    baslik: "Hepsiburada — Canonical tag ekleme",
    musteri: "Hepsiburada",
    kategori: "Teknik SEO",
    beklenenEtki: "Duplicate content sorununu çözer, %15 indeksleme artışı bekleniyor",
    oncelik: "yüksek",
    durum: "devam-ediyor",
    sahip: "Burak Çetin",
    baslangic: "2026-04-20",
    bitis: "2026-05-05"
  },
  {
    id: "2",
    baslik: "Koçtaş — Ürün meta açıklamaları yenileme",
    musteri: "Koçtaş",
    kategori: "On-Page SEO",
    beklenenEtki: "Organik CTR %2.4'ten %3.8'e çıkması bekleniyor",
    oncelik: "normal",
    durum: "tamamlandı",
    sahip: "Burak Çetin",
    baslangic: "2026-04-15",
    bitis: "2026-04-25"
  },
  {
    id: "3",
    baslik: "Migros — Sayfa hızı optimizasyonu",
    musteri: "Migros",
    kategori: "Core Web Vitals",
    beklenenEtki: "Mobile LCP 6.2s → 2.5s hedefi. Google sıralamada pozitif etki bekleniyor.",
    oncelik: "kritik",
    durum: "bekliyor",
    sahip: "Burak Çetin",
    baslangic: "2026-05-01",
    bitis: "2026-05-20"
  },
  {
    id: "4",
    baslik: "Hepsiburada — Internal link yapısı güçlendirme",
    musteri: "Hepsiburada",
    kategori: "Link Building",
    beklenenEtki: "Kategori sayfaları link equity'si artacak, %10 sıralama iyileşmesi bekleniyor",
    oncelik: "normal",
    durum: "bekliyor",
    sahip: "Burak Çetin",
    baslangic: "2026-05-10",
    bitis: "2026-05-31"
  }
];

const durumRengi: Record<string, string> = {
  "tamamlandı": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "devam-ediyor": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bekliyor": "bg-orange-500/20 text-orange-400 border-orange-500/30"
};

const durumLabel: Record<string, string> = {
  "tamamlandı": "Tamamlandı",
  "devam-ediyor": "Devam Ediyor",
  "bekliyor": "Bekliyor"
};

export function AksiyonPlani() {
  const tamamlandı = aksiyonlar.filter(a => a.durum === "tamamlandı").length;
  const devamEdiyor = aksiyonlar.filter(a => a.durum === "devam-ediyor").length;
  const bekliyor = aksiyonlar.filter(a => a.durum === "bekliyor").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Aksiyon Planı</h1>
          <p className="text-[#A0A0A0]">SEO iyileştirme aksiyonları ve uygulama takvimi</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Aksiyon Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <ListChecks className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Aksiyon</span>
          </div>
          <div className="text-2xl font-semibold">{aksiyonlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{tamamlandı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Eden</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{devamEdiyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekliyor}</div>
        </Card>
      </div>

      <div className="space-y-4">
        {aksiyonlar.map((aksiyon) => (
          <Card key={aksiyon.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{aksiyon.baslik}</h4>
                  <Badge variant="outline" className="text-xs">{aksiyon.kategori}</Badge>
                  {aksiyon.oncelik === "kritik" && (
                    <Badge variant="destructive" className="text-xs">Kritik</Badge>
                  )}
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">
                  Müşteri: {aksiyon.musteri} · Sahip: {aksiyon.sahip}
                </p>
                <div className="p-3 rounded-lg bg-[#202020] border border-white/[0.06] mb-3">
                  <p className="text-sm text-[#AAFF01] text-xs">Beklenen Etki: {aksiyon.beklenenEtki}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                  <span>Başlangıç: {new Date(aksiyon.baslangic).toLocaleDateString("tr-TR")}</span>
                  <span>Bitiş: {new Date(aksiyon.bitis).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={durumRengi[aksiyon.durum]}>
                  {durumLabel[aksiyon.durum]}
                </Badge>
                {aksiyon.durum !== "tamamlandı" && (
                  <Button size="sm" variant="outline">Detay</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
