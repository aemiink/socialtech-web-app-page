import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

const optimizasyonlar = [
  {
    id: "1",
    kampanya: "Koçtaş - Bahçe Ürünleri",
    platform: "Meta ADS",
    oneri: "CPM yüksek — hedef kitle daraltılmalı",
    etki: "Yüksek",
    durum: "bekliyor",
    kazanim: "~₺2.400 tasarruf bekleniyor"
  },
  {
    id: "2",
    kampanya: "Türk Telekom - Fiber İnternet",
    platform: "Google ADS",
    oneri: "Dönüşüm oranı düşük anahtar kelimeler durdurulmalı",
    etki: "Orta",
    durum: "uygulandı",
    kazanim: "CPA %18 azaldı"
  },
  {
    id: "3",
    kampanya: "Getir - Hızlı Teslimat",
    platform: "TikTok ADS",
    oneri: "18-24 yaş segmenti için bütçe artırılmalı",
    etki: "Yüksek",
    durum: "uygulandı",
    kazanim: "ROAS 5.8x → 6.4x"
  },
  {
    id: "4",
    kampanya: "Migros - Ramazan Kolisi",
    platform: "Meta ADS",
    oneri: "Video kreatif tıklama oranı düşük, yeni format denenmeli",
    etki: "Orta",
    durum: "bekliyor",
    kazanim: "CTR %0.4 → %1.2 hedefleniyor"
  },
  {
    id: "5",
    kampanya: "Hepsiburada - Elektronik",
    platform: "Google ADS",
    oneri: "Shopping kampanyası ürün grupları yeniden segmentlenmeli",
    etki: "Yüksek",
    durum: "devam-ediyor",
    kazanim: "ROAS %12 artış bekleniyor"
  }
];

export function Optimizasyonlar() {
  const uygulandı = optimizasyonlar.filter(o => o.durum === "uygulandı").length;
  const bekliyor = optimizasyonlar.filter(o => o.durum === "bekliyor").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Optimizasyonlar</h1>
        <p className="text-[#A0A0A0]">Kampanya optimizasyon önerileri ve uygulamalar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Öneri</span>
          </div>
          <div className="text-2xl font-semibold">{optimizasyonlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Uygulanan</span>
          </div>
          <div className="text-2xl font-semibold">{uygulandı}</div>
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
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Etki Oranı</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">
            %{Math.round((uygulandı / optimizasyonlar.length) * 100)}
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {optimizasyonlar.map((item) => (
          <Card key={item.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${item.durum === "uygulandı" ? "bg-[#AAFF01]/10" : item.durum === "bekliyor" ? "bg-orange-500/10" : "bg-blue-500/10"}`}>
                  {item.durum === "uygulandı"
                    ? <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
                    : item.durum === "bekliyor"
                    ? <AlertCircle className="w-5 h-5 text-orange-500" />
                    : <TrendingDown className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{item.kampanya}</p>
                    <Badge variant="outline">{item.platform}</Badge>
                    <Badge variant={item.etki === "Yüksek" ? "default" : "secondary"}>
                      {item.etki} Etki
                    </Badge>
                  </div>
                  <p className="text-sm text-[#A0A0A0] mb-2">{item.oneri}</p>
                  <p className="text-xs text-[#AAFF01]">{item.kazanim}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  className={
                    item.durum === "uygulandı"
                      ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                      : item.durum === "bekliyor"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }
                >
                  {item.durum === "uygulandı" ? "Uygulandı" : item.durum === "bekliyor" ? "Bekliyor" : "Devam Ediyor"}
                </Badge>
                {item.durum === "bekliyor" && (
                  <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Uygula</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
