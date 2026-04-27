import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Hash, TrendingUp, TrendingDown, Minus, Search, Plus } from "lucide-react";

const kelimeler = [
  {
    id: "1",
    kelime: "fiber internet paketleri",
    musteri: "Türk Telekom",
    pozisyon: 3,
    oncekiPozisyon: 7,
    aylikArama: 22400,
    tiklama: 1840,
    gosterim: 28600,
    ctr: 6.4,
    zorluk: 65
  },
  {
    id: "2",
    kelime: "online süpermarket",
    musteri: "Hepsiburada",
    pozisyon: 1,
    oncekiPozisyon: 2,
    aylikArama: 48200,
    tiklama: 12400,
    gosterim: 58000,
    ctr: 21.4,
    zorluk: 72
  },
  {
    id: "3",
    kelime: "bahçe malzemeleri",
    musteri: "Koçtaş",
    pozisyon: 5,
    oncekiPozisyon: 4,
    aylikArama: 8900,
    tiklama: 420,
    gosterim: 9800,
    ctr: 4.3,
    zorluk: 42
  },
  {
    id: "4",
    kelime: "seo audit hizmeti",
    musteri: "Hepsiburada",
    pozisyon: 2,
    oncekiPozisyon: 2,
    aylikArama: 1200,
    tiklama: 180,
    gosterim: 2400,
    ctr: 7.5,
    zorluk: 38
  },
  {
    id: "5",
    kelime: "ucuz market alışveriş",
    musteri: "Migros",
    pozisyon: 8,
    oncekiPozisyon: 12,
    aylikArama: 32100,
    tiklama: 890,
    gosterim: 38400,
    ctr: 2.3,
    zorluk: 78
  }
];

export function AnahtarKelimeler() {
  const yükselen = kelimeler.filter(k => k.pozisyon < k.oncekiPozisyon).length;
  const düşen = kelimeler.filter(k => k.pozisyon > k.oncekiPozisyon).length;
  const toplamTiklama = kelimeler.reduce((sum, k) => sum + k.tiklama, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Anahtar Kelimeler</h1>
          <p className="text-[#A0A0A0]">Müşteri siteleri için keyword sıralama takibi</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Kelime Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Hash className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Takip Edilen</span>
          </div>
          <div className="text-2xl font-semibold">{kelimeler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yükselen</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">{yükselen}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Düşen</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{düşen}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Tıklama</span>
          </div>
          <div className="text-2xl font-semibold">{toplamTiklama.toLocaleString("tr-TR")}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Keyword Sıralama Tablosu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Anahtar Kelime</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Pozisyon</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Değişim</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Aylık Arama</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tıklama</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">CTR</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Zorluk</th>
              </tr>
            </thead>
            <tbody>
              {kelimeler.map((k) => {
                const fark = k.oncekiPozisyon - k.pozisyon;
                return (
                  <tr key={k.id} className="border-t border-white/[0.06] hover:bg-white/5">
                    <td className="p-4 font-medium text-sm">{k.kelime}</td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{k.musteri}</td>
                    <td className="p-4">
                      <span className={`text-lg font-bold ${k.pozisyon <= 3 ? "text-[#AAFF01]" : k.pozisyon <= 10 ? "text-white" : "text-[#A0A0A0]"}`}>
                        #{k.pozisyon}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {fark > 0
                          ? <TrendingUp className="w-4 h-4 text-[#AAFF01]" />
                          : fark < 0
                          ? <TrendingDown className="w-4 h-4 text-red-400" />
                          : <Minus className="w-4 h-4 text-[#A0A0A0]" />}
                        <span className={`text-sm ${fark > 0 ? "text-[#AAFF01]" : fark < 0 ? "text-red-400" : "text-[#A0A0A0]"}`}>
                          {fark !== 0 ? (fark > 0 ? `+${fark}` : fark) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{k.aylikArama.toLocaleString("tr-TR")}</td>
                    <td className="p-4 text-sm">{k.tiklama.toLocaleString("tr-TR")}</td>
                    <td className="p-4 text-sm text-[#AAFF01]">%{k.ctr}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${k.zorluk > 70 ? "bg-red-500" : k.zorluk > 50 ? "bg-orange-500" : "bg-[#AAFF01]"}`}
                            style={{ width: `${k.zorluk}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#A0A0A0]">{k.zorluk}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
