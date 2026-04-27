import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { AlertTriangle, Link2Off, Globe, CheckCircle, Filter } from "lucide-react";

const teknikHatalar = [
  {
    id: "1",
    tip: "Broken Link",
    musteri: "Hepsiburada",
    url: "/urunler/elektronik/laptop-123",
    detay: "HTTP 404 — Ürün sayfası silinmiş, 301 yönlendirme eksik",
    etki: "yüksek",
    durum: "açık",
    sayfaSayisi: 14
  },
  {
    id: "2",
    tip: "Duplicate Meta",
    musteri: "Hepsiburada",
    url: "/kampanyalar/*",
    detay: "48 kampanya sayfasında aynı meta description kullanılıyor",
    etki: "orta",
    durum: "açık",
    sayfaSayisi: 48
  },
  {
    id: "3",
    tip: "Missing Alt Text",
    musteri: "Koçtaş",
    url: "/urunler/*",
    detay: "Ürün görsellerinin %34'ünde alt metin eksik",
    etki: "düşük",
    durum: "açık",
    sayfaSayisi: 234
  },
  {
    id: "4",
    tip: "Slow Page Speed",
    musteri: "Migros",
    url: "/ana-sayfa",
    detay: "LCP 4.8s — Core Web Vitals başarısız (hedef < 2.5s)",
    etki: "yüksek",
    durum: "devam-ediyor",
    sayfaSayisi: 1
  },
  {
    id: "5",
    tip: "Missing Canonical",
    musteri: "Hepsiburada",
    url: "/filtreleme-sayfasi",
    detay: "Filtreli URL'lerde canonical tag eksik, içerik kopyalanıyor",
    etki: "yüksek",
    durum: "çözüldü",
    sayfaSayisi: 89
  }
];

const etkiRengi: Record<string, string> = {
  "yüksek": "bg-red-500/20 text-red-400 border-red-500/30",
  "orta": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "düşük": "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

export function TeknikHatalar() {
  const açık = teknikHatalar.filter(h => h.durum !== "çözüldü").length;
  const çözüldü = teknikHatalar.filter(h => h.durum === "çözüldü").length;
  const yüksekEtki = teknikHatalar.filter(h => h.etki === "yüksek" && h.durum !== "çözüldü").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Teknik Hatalar</h1>
          <p className="text-[#A0A0A0]">SEO teknik sorunları ve düzeltme öncelikleri</p>
        </div>
        <Button size="sm" variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filtrele
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Hata</span>
          </div>
          <div className="text-2xl font-semibold">{teknikHatalar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Yüksek Etki</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{yüksekEtki}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Link2Off className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Açık</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{açık}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Çözüldü</span>
          </div>
          <div className="text-2xl font-semibold">{çözüldü}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Hata Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hata Tipi</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">URL</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Detay</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Etkilenen</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Etki</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {teknikHatalar.map((hata) => (
                <tr key={hata.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {hata.tip === "Broken Link" ? <Link2Off className="w-4 h-4 text-red-400" /> : <Globe className="w-4 h-4 text-[#A0A0A0]" />}
                      <span className="font-medium text-sm">{hata.tip}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{hata.musteri}</td>
                  <td className="p-4 text-xs font-mono text-[#A0A0A0]">{hata.url}</td>
                  <td className="p-4 text-sm text-[#A0A0A0] max-w-xs">{hata.detay}</td>
                  <td className="p-4 text-sm">{hata.sayfaSayisi} sayfa</td>
                  <td className="p-4">
                    <Badge className={etkiRengi[hata.etki]}>
                      {hata.etki === "yüksek" ? "Yüksek" : hata.etki === "orta" ? "Orta" : "Düşük"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        hata.durum === "çözüldü"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : hata.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {hata.durum === "çözüldü" ? "Çözüldü" : hata.durum === "devam-ediyor" ? "Devam" : "Açık"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {hata.durum !== "çözüldü" && (
                      <Button size="sm" variant="outline">Düzelt</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
