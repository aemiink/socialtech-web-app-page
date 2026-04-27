import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";

const revizyonlar = [
  {
    id: "1",
    baslik: "Getir TikTok Videosu — Renk Düzeltmesi",
    musteri: "Getir",
    tur: "Video",
    talep: "Logo renginin videoda çok koyu göründüğü belirtildi. Brand guideline'a göre #FF4500 kullanılmalı.",
    oncelik: "yüksek",
    durum: "devam-ediyor",
    tarih: "2026-04-26",
    deadline: "2026-04-29",
    revizyonNo: 2
  },
  {
    id: "2",
    baslik: "Hepsiburada Mobil Onboarding — Buton Boyutu",
    musteri: "Hepsiburada",
    tur: "UI Tasarım",
    talep: "CTA butonları iOS Human Interface Guidelines'a göre minimum 44px olmalı. Ayrıca font-weight artırılmalı.",
    oncelik: "normal",
    durum: "bekliyor",
    tarih: "2026-04-27",
    deadline: "2026-05-08",
    revizyonNo: 1
  },
  {
    id: "3",
    baslik: "Koçtaş Banner Seti — Arka Plan Değişikliği",
    musteri: "Koçtaş",
    tur: "Banner",
    talep: "Arka planın beyaz yerine açık yeşil (#F0F7E6) olması isteniyor. Mevsimsel tema ile uyum.",
    oncelik: "normal",
    durum: "tamamlandı",
    tarih: "2026-04-24",
    deadline: "2026-04-26",
    revizyonNo: 1
  }
];

const durumRengi: Record<string, string> = {
  "tamamlandı": "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30",
  "devam-ediyor": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bekliyor": "bg-orange-500/20 text-orange-400 border-orange-500/30"
};

const durumLabel: Record<string, string> = {
  "tamamlandı": "Tamamlandı",
  "devam-ediyor": "Devam Ediyor",
  "bekliyor": "Bekliyor"
};

export function Revizyonlar() {
  const bekliyor = revizyonlar.filter(r => r.durum !== "tamamlandı").length;
  const tamamlandı = revizyonlar.filter(r => r.durum === "tamamlandı").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Revizyonlar</h1>
        <p className="text-[#A0A0A0]">Müşteri revizyon talepleri ve düzeltme süreçleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Revizyon</span>
          </div>
          <div className="text-2xl font-semibold">{revizyonlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{bekliyor}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{tamamlandı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Acil</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">
            {revizyonlar.filter(r => r.oncelik === "yüksek" && r.durum !== "tamamlandı").length}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {revizyonlar.map((revizyon) => (
          <Card
            key={revizyon.id}
            className={`bg-[#1A1A1A] border-white/[0.06] p-5 ${revizyon.oncelik === "yüksek" && revizyon.durum !== "tamamlandı" ? "border-l-2 border-l-red-500" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <RefreshCw className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{revizyon.baslik}</h4>
                    <Badge variant="outline">{revizyon.tur}</Badge>
                    <Badge variant="outline" className="text-xs">Rev #{revizyon.revizyonNo}</Badge>
                    {revizyon.oncelik === "yüksek" && (
                      <Badge variant="destructive" className="text-xs">Yüksek Öncelik</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Müşteri: {revizyon.musteri}</p>
                  <div className="p-3 rounded-lg bg-[#202020] border border-white/[0.06] mb-2">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#A0A0A0] mt-0.5 shrink-0" />
                      <p className="text-sm text-[#A0A0A0]">{revizyon.talep}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">
                    Tarih: {new Date(revizyon.tarih).toLocaleDateString("tr-TR")} ·
                    Deadline: {new Date(revizyon.deadline).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={durumRengi[revizyon.durum]}>
                  {durumLabel[revizyon.durum]}
                </Badge>
                {revizyon.durum !== "tamamlandı" && (
                  <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                    Tamamla
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
