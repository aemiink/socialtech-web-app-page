import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Database, CheckCircle, AlertCircle, Clock, Download, RefreshCw } from "lucide-react";

const yedekler = [
  {
    id: "1",
    musteri: "Hepsiburada",
    tip: "Tam Yedek",
    boyut: "12.4 GB",
    tarih: "2026-04-28 02:00",
    sure: "48 dk",
    konum: "AWS S3 — eu-west-1",
    durum: "başarılı"
  },
  {
    id: "2",
    musteri: "Teknosa",
    tip: "Artımlı Yedek",
    boyut: "2.1 GB",
    tarih: "2026-04-27 02:00",
    sure: "12 dk",
    konum: "AWS S3 — eu-west-1",
    durum: "başarılı"
  },
  {
    id: "3",
    musteri: "Türk Telekom",
    tip: "Tam Yedek",
    boyut: "8.7 GB",
    tarih: "2026-04-27 03:00",
    sure: "34 dk",
    konum: "Google Cloud Storage",
    durum: "başarılı"
  },
  {
    id: "4",
    musteri: "Koçtaş",
    tip: "Artımlı Yedek",
    boyut: "—",
    tarih: "2026-04-26 02:00",
    sure: "—",
    konum: "AWS S3 — eu-west-1",
    durum: "başarısız"
  }
];

export function Yedekleme() {
  const başarılı = yedekler.filter(y => y.durum === "başarılı").length;
  const başarısız = yedekler.filter(y => y.durum === "başarısız").length;
  const toplamBoyut = "23.2 GB";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Yedekleme</h1>
          <p className="text-[#A0A0A0]">Müşteri sistem yedekleme durumu ve geçmişi</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <RefreshCw className="w-4 h-4 mr-2" /> Manuel Yedek Al
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Yedek</span>
          </div>
          <div className="text-2xl font-semibold">{yedekler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Başarılı</span>
          </div>
          <div className="text-2xl font-semibold">{başarılı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Başarısız</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{başarısız}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Boyut</span>
          </div>
          <div className="text-2xl font-semibold">{toplamBoyut}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Yedek Geçmişi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Boyut</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tarih / Saat</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Süre</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Konum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {yedekler.map((yedek) => (
                <tr key={yedek.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{yedek.musteri}</td>
                  <td className="p-4">
                    <Badge variant="outline">{yedek.tip}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{yedek.boyut}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{yedek.tarih}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{yedek.sure}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{yedek.konum}</td>
                  <td className="p-4">
                    <Badge
                      className={
                        yedek.durum === "başarılı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {yedek.durum === "başarılı" ? "Başarılı" : "Başarısız"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {yedek.durum === "başarılı" ? (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-red-400">
                          <RefreshCw className="w-4 h-4 mr-1" /> Tekrar
                        </Button>
                      )}
                    </div>
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
