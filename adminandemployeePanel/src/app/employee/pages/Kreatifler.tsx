import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Palette, Image, Video, CheckCircle, Clock, Upload } from "lucide-react";

const kreatifler = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Kampanyası — Banner Seti",
    musteri: "Koçtaş",
    tur: "Banner",
    format: "1080x1080, 1080x1920, 1200x628",
    adet: 5,
    versiyon: "v3",
    durum: "onaylandı",
    teslimTarihi: "2026-04-24"
  },
  {
    id: "2",
    baslik: "Getir TikTok Video Kreatifleri",
    musteri: "Getir",
    tur: "Video",
    format: "1080x1920 — 15s/30s",
    adet: 3,
    versiyon: "v2",
    durum: "revizyon",
    teslimTarihi: "2026-04-27"
  },
  {
    id: "3",
    baslik: "LC Waikiki Yaz Lookbook",
    musteri: "LC Waikiki",
    tur: "Lookbook",
    format: "PDF + Instagram Carousel",
    adet: 12,
    versiyon: "v1",
    durum: "devam-ediyor",
    teslimTarihi: "2026-05-03"
  },
  {
    id: "4",
    baslik: "Migros Ramazan Kolisi Görselleri",
    musteri: "Migros",
    tur: "Banner",
    format: "1200x628, 1080x1080",
    adet: 4,
    versiyon: "v2",
    durum: "onaylandı",
    teslimTarihi: "2026-04-22"
  },
  {
    id: "5",
    baslik: "Boyner Outlet Reklamı",
    musteri: "Boyner",
    tur: "Banner",
    format: "1080x1080, 300x250",
    adet: 6,
    versiyon: "v1",
    durum: "bekliyor",
    teslimTarihi: "2026-05-05"
  }
];

const durumRengi: Record<string, string> = {
  "onaylandı": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "revizyon": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "devam-ediyor": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bekliyor": "bg-white/10 text-[#A0A0A0] border-white/10"
};

const durumLabel: Record<string, string> = {
  "onaylandı": "Onaylandı",
  "revizyon": "Revizyon",
  "devam-ediyor": "Devam Ediyor",
  "bekliyor": "Bekliyor"
};

export function Kreatifler() {
  const onaylı = kreatifler.filter(k => k.durum === "onaylandı").length;
  const revizyon = kreatifler.filter(k => k.durum === "revizyon").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Kreatifler</h1>
          <p className="text-[#A0A0A0]">Kampanya kreatif tasarımları ve durumları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Upload className="w-4 h-4 mr-2" /> Kreatif Yükle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam</span>
          </div>
          <div className="text-2xl font-semibold">{kreatifler.length}</div>
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
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{revizyon}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Image className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Dosya</span>
          </div>
          <div className="text-2xl font-semibold">
            {kreatifler.reduce((sum, k) => sum + k.adet, 0)}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Kreatif Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Kreatif</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Format</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Adet</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Versiyon</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Teslim</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {kreatifler.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{item.baslik}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.musteri}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {item.tur === "Video" ? <Video className="w-4 h-4 text-[#A0A0A0]" /> : <Image className="w-4 h-4 text-[#A0A0A0]" />}
                      <span className="text-sm">{item.tur}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[#A0A0A0]">{item.format}</td>
                  <td className="p-4 text-sm">{item.adet}</td>
                  <td className="p-4">
                    <Badge variant="outline">{item.versiyon}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(item.teslimTarihi).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge className={durumRengi[item.durum]}>
                      {durumLabel[item.durum]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">Görüntüle</Button>
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
