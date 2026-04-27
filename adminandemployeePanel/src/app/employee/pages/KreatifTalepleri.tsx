import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Palette, Clock, CheckCircle, Plus, Image, Video } from "lucide-react";

const kreatifler = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Kampanyası Banner Seti",
    musteri: "Koçtaş",
    tur: "Banner",
    format: "1080x1080, 1080x1920, 1200x628",
    adet: 5,
    deadline: "2026-04-28",
    durum: "devam-ediyor",
    talep: "Bahçe ürünleri, yeşil tema, doğa unsurları"
  },
  {
    id: "2",
    baslik: "Getir TikTok Video Serisi",
    musteri: "Getir",
    tur: "Video",
    format: "9:16 — 15 sn ve 30 sn",
    adet: 3,
    deadline: "2026-04-30",
    durum: "bekliyor",
    talep: "Hızlı teslimat mesajı, dinamik montaj, CTA güçlü"
  },
  {
    id: "3",
    baslik: "LC Waikiki Yaz Koleksiyonu Stories",
    musteri: "LC Waikiki",
    tur: "Story",
    format: "1080x1920",
    adet: 8,
    deadline: "2026-05-05",
    durum: "bekliyor",
    talep: "Yaz renkleri, hafif tasarım, ürün vurgusu"
  },
  {
    id: "4",
    baslik: "Migros Ramazan Kolisi",
    musteri: "Migros",
    tur: "Banner",
    format: "1200x628, 1080x1080",
    adet: 4,
    deadline: "2026-04-22",
    durum: "tamamlandı",
    talep: "Tamamlandı ve müşteriye iletildi"
  }
];

export function KreatifTalepleri() {
  const bekliyor = kreatifler.filter(k => k.durum === "bekliyor").length;
  const devamEdiyor = kreatifler.filter(k => k.durum === "devam-ediyor").length;
  const tamamlandı = kreatifler.filter(k => k.durum === "tamamlandı").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Kreatif Talepleri</h1>
        <p className="text-[#A0A0A0]">Kampanyalar için bekleyen ve devam eden tasarım talepleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Talep</span>
          </div>
          <div className="text-2xl font-semibold">{kreatifler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekliyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Ediyor</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{devamEdiyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{tamamlandı}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kreatif Talep Listesi</h3>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Yeni Talep
        </Button>
      </div>

      <div className="space-y-3">
        {kreatifler.map((item) => (
          <Card key={item.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#AAFF01]/10">
                  {item.tur === "Video"
                    ? <Video className="w-5 h-5 text-[#AAFF01]" />
                    : <Image className="w-5 h-5 text-[#AAFF01]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{item.baslik}</p>
                    <Badge variant="outline">{item.tur}</Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0] mb-1">
                    Müşteri: {item.musteri} · Format: {item.format} · {item.adet} adet
                  </p>
                  <p className="text-sm text-[#A0A0A0]">{item.talep}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#A0A0A0]">
                  {new Date(item.deadline).toLocaleDateString("tr-TR")}
                </span>
                <Badge
                  className={
                    item.durum === "tamamlandı"
                      ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                      : item.durum === "devam-ediyor"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  {item.durum === "tamamlandı" ? "Tamamlandı" : item.durum === "devam-ediyor" ? "Devam Ediyor" : "Bekliyor"}
                </Badge>
                {item.durum !== "tamamlandı" && (
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
