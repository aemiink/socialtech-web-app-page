import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar, Instagram, Twitter, Plus, CheckCircle, Clock } from "lucide-react";

const icerikler = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Bahçeciliği",
    musteri: "Koçtaş",
    platform: ["Instagram", "Facebook"],
    tarih: "2026-04-28",
    saat: "12:00",
    tur: "Carousel",
    durum: "hazır",
    caption: "Baharın renkleriyle bahçenizi yenileyin..."
  },
  {
    id: "2",
    baslik: "Getir Hafta Sonu Kampanyası",
    musteri: "Getir",
    platform: ["Instagram", "TikTok"],
    tarih: "2026-04-29",
    saat: "18:00",
    tur: "Reels",
    durum: "tasarım-bekliyor",
    caption: "Hafta sonu keyfi kapıda!"
  },
  {
    id: "3",
    baslik: "LC Waikiki Yaz Koleksiyonu Tanıtım",
    musteri: "LC Waikiki",
    platform: ["Instagram", "Twitter"],
    tarih: "2026-04-30",
    saat: "10:00",
    tur: "Post",
    durum: "hazır",
    caption: "2026 Yaz koleksiyonu şimdi mağazalarda!"
  },
  {
    id: "4",
    baslik: "Migros Pazartesi Fırsatları",
    musteri: "Migros",
    platform: ["Instagram"],
    tarih: "2026-05-01",
    saat: "09:00",
    tur: "Story",
    durum: "taslak",
    caption: "Bu haftanın süper fırsatları!"
  },
  {
    id: "5",
    baslik: "Boyner Outlet Duyurusu",
    musteri: "Boyner",
    platform: ["Instagram", "Facebook"],
    tarih: "2026-05-02",
    saat: "14:00",
    tur: "Post",
    durum: "onay-bekliyor",
    caption: "Sezon sonu outlet fırsatlarını kaçırmayın!"
  }
];

const durumRengi: Record<string, string> = {
  "hazır": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "tasarım-bekliyor": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "taslak": "bg-white/10 text-[#A0A0A0] border-white/10",
  "onay-bekliyor": "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

const durumLabel: Record<string, string> = {
  "hazır": "Hazır",
  "tasarım-bekliyor": "Tasarım Bekliyor",
  "taslak": "Taslak",
  "onay-bekliyor": "Onay Bekliyor"
};

export function IcerikTakvimi() {
  const hazır = icerikler.filter(i => i.durum === "hazır").length;
  const bekleyen = icerikler.filter(i => i.durum !== "hazır").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">İçerik Takvimi</h1>
          <p className="text-[#A0A0A0]">Sosyal medya içerik planı ve yayın takvimi</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> İçerik Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta</span>
          </div>
          <div className="text-2xl font-semibold">{icerikler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yayına Hazır</span>
          </div>
          <div className="text-2xl font-semibold">{hazır}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekleyen}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Instagram className="w-5 h-5 text-pink-500" />
            <span className="text-sm text-[#A0A0A0]">Platform</span>
          </div>
          <div className="text-2xl font-semibold">4</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Yaklaşan Yayınlar</h3>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {icerikler.map((icerik) => (
            <div key={icerik.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-[#A0A0A0]">
                      {new Date(icerik.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-sm font-semibold text-[#AAFF01]">{icerik.saat}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{icerik.baslik}</p>
                      <Badge variant="outline">{icerik.tur}</Badge>
                    </div>
                    <p className="text-xs text-[#A0A0A0] mb-2">
                      {icerik.musteri} · {icerik.platform.join(", ")}
                    </p>
                    <p className="text-xs text-[#A0A0A0] italic">"{icerik.caption}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={durumRengi[icerik.durum]}>
                    {durumLabel[icerik.durum]}
                  </Badge>
                  <Button size="sm" variant="outline">Düzenle</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
