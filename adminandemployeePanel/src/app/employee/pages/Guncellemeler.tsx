import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, ArrowUpCircle } from "lucide-react";

const guncellemeler = [
  {
    id: "1",
    musteri: "Koçtaş",
    bileşen: "WordPress 6.5.3",
    mevcutVersiyon: "6.4.1",
    yeniVersiyon: "6.5.3",
    tip: "CMS",
    onem: "güvenlik",
    tarih: "2026-04-28",
    durum: "bekliyor"
  },
  {
    id: "2",
    musteri: "Boyner",
    bileşen: "WooCommerce Eklentisi",
    mevcutVersiyon: "8.5.0",
    yeniVersiyon: "8.7.1",
    tip: "Eklenti",
    onem: "güvenlik",
    tarih: "2026-04-27",
    durum: "bekliyor"
  },
  {
    id: "3",
    musteri: "Hepsiburada",
    bileşen: "PHP 8.2 → 8.3",
    mevcutVersiyon: "8.2.18",
    yeniVersiyon: "8.3.6",
    tip: "Altyapı",
    onem: "performans",
    tarih: "2026-05-05",
    durum: "planlandı"
  },
  {
    id: "4",
    musteri: "Teknosa",
    bileşen: "Node.js v20 LTS",
    mevcutVersiyon: "v18.18.0",
    yeniVersiyon: "v20.12.0",
    tip: "Runtime",
    onem: "lts",
    tarih: "2026-04-25",
    durum: "tamamlandı"
  },
  {
    id: "5",
    musteri: "Türk Telekom",
    bileşen: "Nginx 1.26",
    mevcutVersiyon: "1.24.0",
    yeniVersiyon: "1.26.1",
    tip: "Sunucu",
    onem: "performans",
    tarih: "2026-05-02",
    durum: "planlandı"
  }
];

const onemRengi: Record<string, string> = {
  "güvenlik": "bg-red-500/20 text-red-400 border-red-500/30",
  "performans": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "lts": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
};

export function Guncellemeler() {
  const bekliyor = guncellemeler.filter(g => g.durum === "bekliyor").length;
  const güvenlik = guncellemeler.filter(g => g.onem === "güvenlik" && g.durum !== "tamamlandı").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Güncellemeler</h1>
        <p className="text-[#A0A0A0]">Müşteri sistemleri için bekleyen yazılım güncellemeleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Güncelleme</span>
          </div>
          <div className="text-2xl font-semibold">{guncellemeler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Güvenlik</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{güvenlik}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekliyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">
            {guncellemeler.filter(g => g.durum === "tamamlandı").length}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Güncelleme Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Bileşen</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Mevcut</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Yeni</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Önem</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {guncellemeler.map((g) => (
                <tr key={g.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{g.bileşen}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{g.musteri}</td>
                  <td className="p-4">
                    <Badge variant="outline">{g.tip}</Badge>
                  </td>
                  <td className="p-4 text-sm font-mono text-[#A0A0A0]">{g.mevcutVersiyon}</td>
                  <td className="p-4 text-sm font-mono text-[#AAFF01]">{g.yeniVersiyon}</td>
                  <td className="p-4">
                    <Badge className={onemRengi[g.onem]}>
                      {g.onem === "güvenlik" ? "Güvenlik" : g.onem === "performans" ? "Performans" : "LTS"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(g.tarih).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        g.durum === "tamamlandı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : g.durum === "planlandı"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {g.durum === "tamamlandı" ? "Tamamlandı" : g.durum === "planlandı" ? "Planlandı" : "Bekliyor"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {g.durum !== "tamamlandı" && (
                      <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                        Uygula
                      </Button>
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
