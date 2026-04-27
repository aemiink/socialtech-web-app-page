import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { FileArchive, Download, Upload, CheckCircle, Clock, FileImage, FileVideo } from "lucide-react";

const dosyalar = [
  {
    id: "1",
    baslik: "Koçtaş Bahar Kampanyası — Final Set",
    musteri: "Koçtaş",
    dosyalar: ["Meta_ADS_v3.zip", "Google_Display_v2.zip"],
    boyut: "156 MB",
    format: "ZIP (PSD + PNG + MP4)",
    teslimTarihi: "2026-04-24",
    durum: "teslim-edildi",
    tur: "image"
  },
  {
    id: "2",
    baslik: "Migros Ramazan Görselleri",
    musteri: "Migros",
    dosyalar: ["Migros_Ramazan_Final.zip"],
    boyut: "88 MB",
    format: "ZIP (AI + PNG)",
    teslimTarihi: "2026-04-22",
    durum: "teslim-edildi",
    tur: "image"
  },
  {
    id: "3",
    baslik: "Getir TikTok Video Seti",
    musteri: "Getir",
    dosyalar: ["Getir_Video_15s.mp4", "Getir_Video_30s.mp4", "Getir_Thumb.jpg"],
    boyut: "1.2 GB",
    format: "MP4 1080x1920",
    teslimTarihi: null,
    durum: "hazırlanıyor",
    tur: "video"
  },
  {
    id: "4",
    baslik: "Hepsiburada Mobil UI Kit",
    musteri: "Hepsiburada",
    dosyalar: ["HB_Mobile_UI_v1.fig"],
    boyut: "24 MB",
    format: "Figma",
    teslimTarihi: null,
    durum: "revizyon",
    tur: "design"
  }
];

const durumRengi: Record<string, string> = {
  "teslim-edildi": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "hazırlanıyor": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "revizyon": "bg-orange-500/20 text-orange-400 border-orange-500/30"
};

const durumLabel: Record<string, string> = {
  "teslim-edildi": "Teslim Edildi",
  "hazırlanıyor": "Hazırlanıyor",
  "revizyon": "Revizyon"
};

export function TeslimDosyalari() {
  const teslimEdildi = dosyalar.filter(d => d.durum === "teslim-edildi").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Teslim Dosyaları</h1>
          <p className="text-[#A0A0A0]">Müşterilere teslim edilen ve hazırlanan çalışma dosyaları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Upload className="w-4 h-4 mr-2" /> Dosya Yükle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileArchive className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Set</span>
          </div>
          <div className="text-2xl font-semibold">{dosyalar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Teslim Edildi</span>
          </div>
          <div className="text-2xl font-semibold">{teslimEdildi}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Hazırlanıyor</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">
            {dosyalar.filter(d => d.durum !== "teslim-edildi").length}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileArchive className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Boyut</span>
          </div>
          <div className="text-2xl font-semibold">1.5 GB</div>
        </Card>
      </div>

      <div className="space-y-3">
        {dosyalar.map((item) => (
          <Card key={item.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#AAFF01]/10">
                  {item.tur === "video"
                    ? <FileVideo className="w-5 h-5 text-[#AAFF01]" />
                    : <FileImage className="w-5 h-5 text-[#AAFF01]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{item.baslik}</h4>
                  </div>
                  <p className="text-xs text-[#A0A0A0] mb-2">
                    Müşteri: {item.musteri} · Format: {item.format} · Boyut: {item.boyut}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.dosyalar.map((dosya, i) => (
                      <span key={i} className="text-xs bg-[#202020] border border-white/[0.06] px-2 py-1 rounded">
                        {dosya}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.teslimTarihi && (
                  <span className="text-xs text-[#A0A0A0]">
                    {new Date(item.teslimTarihi).toLocaleDateString("tr-TR")}
                  </span>
                )}
                <Badge className={durumRengi[item.durum]}>
                  {durumLabel[item.durum]}
                </Badge>
                {item.durum === "teslim-edildi" && (
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
