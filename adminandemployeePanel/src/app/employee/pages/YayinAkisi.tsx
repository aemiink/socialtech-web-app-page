import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Send, Instagram, Clock, CheckCircle, BarChart2 } from "lucide-react";

const yayinlar = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Tanıtımı",
    musteri: "Koçtaş",
    platform: "Instagram",
    tarih: "2026-04-25",
    saat: "12:00",
    tur: "Carousel",
    begeniler: 1842,
    yorumlar: 134,
    ulasim: 48200,
    durum: "yayında"
  },
  {
    id: "2",
    baslik: "Getir Sabah Kampanyası",
    musteri: "Getir",
    platform: "TikTok",
    tarih: "2026-04-26",
    saat: "09:00",
    tur: "Video",
    begeniler: 5640,
    yorumlar: 289,
    ulasim: 124500,
    durum: "yayında"
  },
  {
    id: "3",
    baslik: "Migros Haftalık Fırsatlar",
    musteri: "Migros",
    platform: "Instagram",
    tarih: "2026-04-27",
    saat: "18:00",
    tur: "Story",
    begeniler: 920,
    yorumlar: 45,
    ulasim: 22400,
    durum: "yayında"
  },
  {
    id: "4",
    baslik: "Boyner Yeni Sezon",
    musteri: "Boyner",
    platform: "Facebook",
    tarih: "2026-04-28",
    saat: "14:00",
    tur: "Post",
    begeniler: 0,
    yorumlar: 0,
    ulasim: 0,
    durum: "planlandı"
  },
  {
    id: "5",
    baslik: "LC Waikiki Yaz Koleksiyonu",
    musteri: "LC Waikiki",
    platform: "Instagram",
    tarih: "2026-04-29",
    saat: "10:00",
    tur: "Reels",
    begeniler: 0,
    yorumlar: 0,
    ulasim: 0,
    durum: "planlandı"
  }
];

export function YayinAkisi() {
  const yayında = yayinlar.filter(y => y.durum === "yayında").length;
  const toplamUlasim = yayinlar.reduce((sum, y) => sum + y.ulasim, 0);
  const toplamBegeniler = yayinlar.reduce((sum, y) => sum + y.begeniler, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Yayın Akışı</h1>
        <p className="text-[#A0A0A0]">Yayınlanan ve planlanan içeriklerin performansı</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Send className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yayında</span>
          </div>
          <div className="text-2xl font-semibold">{yayında}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart2 className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Ulaşım</span>
          </div>
          <div className="text-2xl font-semibold">{(toplamUlasim / 1000).toFixed(1)}K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Beğeni</span>
          </div>
          <div className="text-2xl font-semibold">{toplamBegeniler.toLocaleString("tr-TR")}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Planlandı</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">
            {yayinlar.filter(y => y.durum === "planlandı").length}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Yayın Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">İçerik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Platform</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tarih / Saat</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Ulaşım</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Beğeni</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {yayinlar.map((yayin) => (
                <tr key={yayin.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-sm">{yayin.baslik}</span>
                      <Badge variant="outline" className="text-xs">{yayin.tur}</Badge>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{yayin.musteri}</td>
                  <td className="p-4 text-sm">{yayin.platform}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(yayin.tarih).toLocaleDateString("tr-TR")} {yayin.saat}
                  </td>
                  <td className="p-4 text-sm">
                    {yayin.ulasim > 0 ? yayin.ulasim.toLocaleString("tr-TR") : "—"}
                  </td>
                  <td className="p-4 text-sm">
                    {yayin.begeniler > 0 ? yayin.begeniler.toLocaleString("tr-TR") : "—"}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        yayin.durum === "yayında"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {yayin.durum === "yayında" ? "Yayında" : "Planlandı"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">Detay</Button>
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
