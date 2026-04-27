import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Globe, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";

const indexDurumlari = [
  {
    id: "1",
    musteri: "Hepsiburada",
    domain: "hepsiburada.com",
    toplamSayfa: 12400,
    indeksli: 11850,
    indeksDisi: 280,
    hata: 270,
    oncelikliSayfalar: ["Ana Sayfa", "Kategori", "Ürün Detay"],
    sonGuncelleme: "2026-04-26"
  },
  {
    id: "2",
    musteri: "Koçtaş",
    domain: "koctas.com",
    toplamSayfa: 3800,
    indeksli: 3780,
    indeksDisi: 15,
    hata: 5,
    oncelikliSayfalar: ["Ürün Sayfaları", "Kategori", "Blog"],
    sonGuncelleme: "2026-04-25"
  },
  {
    id: "3",
    musteri: "Migros",
    domain: "migros.com.tr",
    toplamSayfa: 8200,
    indeksli: 7940,
    indeksDisi: 180,
    hata: 80,
    oncelikliSayfalar: ["Ürün Listesi", "Kampanya Sayfaları"],
    sonGuncelleme: "2026-04-24"
  }
];

export function IndexDurumu() {
  const toplamSayfa = indexDurumlari.reduce((sum, i) => sum + i.toplamSayfa, 0);
  const toplamIndeksli = indexDurumlari.reduce((sum, i) => sum + i.indeksli, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Index Durumu</h1>
        <p className="text-[#A0A0A0]">Google tarafından indexlenen sayfa durumları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Sayfa</span>
          </div>
          <div className="text-2xl font-semibold">{toplamSayfa.toLocaleString("tr-TR")}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">İndeksli</span>
          </div>
          <div className="text-2xl font-semibold">{toplamIndeksli.toLocaleString("tr-TR")}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Index Dışı</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">
            {indexDurumlari.reduce((sum, i) => sum + i.indeksDisi, 0)}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Hatalı</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">
            {indexDurumlari.reduce((sum, i) => sum + i.hata, 0)}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {indexDurumlari.map((site) => {
          const indexOrani = Math.round((site.indeksli / site.toplamSayfa) * 100);
          return (
            <Card key={site.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{site.musteri}</h4>
                    <span className="text-xs text-[#A0A0A0] font-mono">{site.domain}</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">
                    Son Güncelleme: {new Date(site.sonGuncelleme).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-1" /> Sitemap Gönder
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#A0A0A0]">Index Oranı</span>
                  <span className="text-sm font-semibold text-[#AAFF01]">%{indexOrani}</span>
                </div>
                <div className="bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#AAFF01]"
                    style={{ width: `${indexOrani}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold">{site.toplamSayfa.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[#A0A0A0]">Toplam</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-[#AAFF01]">{site.indeksli.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[#A0A0A0]">İndeksli</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-orange-400">{site.indeksDisi}</p>
                  <p className="text-xs text-[#A0A0A0]">İndeks Dışı</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020] text-center">
                  <p className="text-lg font-semibold text-red-400">{site.hata}</p>
                  <p className="text-xs text-[#A0A0A0]">Hata</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-[#A0A0A0] mb-2">Öncelikli Kontrol:</p>
                <div className="flex flex-wrap gap-2">
                  {site.oncelikliSayfalar.map((sayfa, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{sayfa}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
