import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Search, TrendingUp, MousePointerClick, Eye, BarChart2 } from "lucide-react";

const konsolVerileri = [
  {
    id: "1",
    musteri: "Hepsiburada",
    domain: "hepsiburada.com",
    donem: "Son 28 gün",
    toplamTiklama: 124500,
    toplamGosterim: 2840000,
    ortalamaCTR: 4.4,
    ortalamaKonum: 8.2,
    oncekiTiklama: 98400,
    oncekiGosterim: 2450000
  },
  {
    id: "2",
    musteri: "Koçtaş",
    domain: "koctas.com",
    donem: "Son 28 gün",
    toplamTiklama: 18400,
    toplamGosterim: 480000,
    ortalamaCTR: 3.8,
    ortalamaKonum: 12.4,
    oncekiTiklama: 15200,
    oncekiGosterim: 420000
  },
  {
    id: "3",
    musteri: "Migros",
    domain: "migros.com.tr",
    donem: "Son 28 gün",
    toplamTiklama: 42800,
    toplamGosterim: 1240000,
    ortalamaCTR: 3.5,
    ortalamaKonum: 15.8,
    oncekiTiklama: 38500,
    oncekiGosterim: 1180000
  }
];

const topSorgular = [
  { sorgu: "fiber internet", musteri: "Hepsiburada", tiklama: 8420, gosterim: 124000, ctr: 6.8 },
  { sorgu: "online market", musteri: "Hepsiburada", tiklama: 12400, gosterim: 280000, ctr: 4.4 },
  { sorgu: "bahçe aletleri", musteri: "Koçtaş", tiklama: 2840, gosterim: 64000, ctr: 4.4 },
  { sorgu: "indirimli market", musteri: "Migros", tiklama: 5600, gosterim: 184000, ctr: 3.0 }
];

export function SearchConsole() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Search Console</h1>
        <p className="text-[#A0A0A0]">Google Search Console performans verileri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <MousePointerClick className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Tıklama</span>
          </div>
          <div className="text-2xl font-semibold">
            {konsolVerileri.reduce((sum, k) => sum + k.toplamTiklama, 0).toLocaleString("tr-TR")}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Gösterim</span>
          </div>
          <div className="text-2xl font-semibold">
            {(konsolVerileri.reduce((sum, k) => sum + k.toplamGosterim, 0) / 1000000).toFixed(1)}M
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. CTR</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">
            %{(konsolVerileri.reduce((sum, k) => sum + k.ortalamaCTR, 0) / konsolVerileri.length).toFixed(1)}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. Konum</span>
          </div>
          <div className="text-2xl font-semibold">
            {(konsolVerileri.reduce((sum, k) => sum + k.ortalamaKonum, 0) / konsolVerileri.length).toFixed(1)}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {konsolVerileri.map((veri) => {
          const tiklamaArtis = ((veri.toplamTiklama - veri.oncekiTiklama) / veri.oncekiTiklama * 100).toFixed(1);
          return (
            <Card key={veri.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{veri.musteri}</h4>
                    <span className="text-xs text-[#A0A0A0] font-mono">{veri.domain}</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">{veri.donem}</p>
                </div>
                <Button size="sm" variant="outline">
                  <BarChart2 className="w-4 h-4 mr-1" /> Detay
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-[#202020]">
                  <p className="text-xs text-[#A0A0A0] mb-1">Tıklama</p>
                  <p className="text-lg font-semibold">{veri.toplamTiklama.toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[#AAFF01]">+{tiklamaArtis}%</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020]">
                  <p className="text-xs text-[#A0A0A0] mb-1">Gösterim</p>
                  <p className="text-lg font-semibold">{(veri.toplamGosterim / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020]">
                  <p className="text-xs text-[#A0A0A0] mb-1">CTR</p>
                  <p className="text-lg font-semibold text-[#AAFF01]">%{veri.ortalamaCTR}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#202020]">
                  <p className="text-xs text-[#A0A0A0] mb-1">Ort. Konum</p>
                  <p className="text-lg font-semibold">{veri.ortalamaKonum}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">En Çok Tıklanan Sorgular</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sorgu</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tıklama</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Gösterim</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">CTR</th>
              </tr>
            </thead>
            <tbody>
              {topSorgular.map((sorgu, i) => (
                <tr key={i} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{sorgu.sorgu}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{sorgu.musteri}</td>
                  <td className="p-4 text-sm">{sorgu.tiklama.toLocaleString("tr-TR")}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{sorgu.gosterim.toLocaleString("tr-TR")}</td>
                  <td className="p-4 text-sm text-[#AAFF01] font-semibold">%{sorgu.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
