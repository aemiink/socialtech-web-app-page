import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Activity, CheckCircle, AlertCircle, Code, RefreshCw } from "lucide-react";

const pixels = [
  {
    id: "1",
    musteri: "Koçtaş",
    platform: "Meta Pixel",
    pixelId: "1234567890123456",
    durum: "aktif",
    sonOlay: "Purchase",
    sonOlayZamani: "5 dk önce",
    gunlukOlay: 1842,
    hata: null
  },
  {
    id: "2",
    musteri: "Türk Telekom",
    platform: "Google Tag",
    pixelId: "AW-987654321",
    durum: "aktif",
    sonOlay: "Lead",
    sonOlayZamani: "2 dk önce",
    gunlukOlay: 2156,
    hata: null
  },
  {
    id: "3",
    musteri: "Getir",
    platform: "TikTok Pixel",
    pixelId: "C4JTIK890123456",
    durum: "aktif",
    sonOlay: "Purchase",
    sonOlayZamani: "1 dk önce",
    gunlukOlay: 3845,
    hata: null
  },
  {
    id: "4",
    musteri: "Migros",
    platform: "Meta Pixel",
    pixelId: "9876543210987654",
    durum: "hata",
    sonOlay: "PageView",
    sonOlayZamani: "3 saat önce",
    gunlukOlay: 0,
    hata: "Purchase eventi tetiklenmiyor"
  },
  {
    id: "5",
    musteri: "Hepsiburada",
    platform: "Google Tag",
    pixelId: "AW-112233445",
    durum: "aktif",
    sonOlay: "Purchase",
    sonOlayZamani: "8 dk önce",
    gunlukOlay: 2890,
    hata: null
  }
];

export function PixelTracking() {
  const aktif = pixels.filter(p => p.durum === "aktif").length;
  const hata = pixels.filter(p => p.durum === "hata").length;
  const toplamOlay = pixels.reduce((sum, p) => sum + p.gunlukOlay, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Pixel &amp; Tracking</h1>
        <p className="text-[#A0A0A0]">Meta Pixel, Google Tag ve TikTok Pixel izleme durumları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Pixel</span>
          </div>
          <div className="text-2xl font-semibold">{pixels.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif</span>
          </div>
          <div className="text-2xl font-semibold">{aktif}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Hatalı</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{hata}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bugünkü Olay</span>
          </div>
          <div className="text-2xl font-semibold">{toplamOlay.toLocaleString("tr-TR")}</div>
        </Card>
      </div>

      <div className="space-y-3">
        {pixels.map((pixel) => (
          <Card key={pixel.id} className={`bg-[#1A1A1A] border-white/[0.06] p-5 ${pixel.durum === "hata" ? "border-red-500/30" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${pixel.durum === "aktif" ? "bg-[#AAFF01]/10" : "bg-red-500/10"}`}>
                  <Code className={`w-5 h-5 ${pixel.durum === "aktif" ? "text-[#AAFF01]" : "text-red-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{pixel.musteri}</p>
                    <Badge variant="outline">{pixel.platform}</Badge>
                  </div>
                  <p className="text-xs text-[#A0A0A0] font-mono mb-1">ID: {pixel.pixelId}</p>
                  <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
                    <span>Son Olay: <span className="text-white">{pixel.sonOlay}</span> — {pixel.sonOlayZamani}</span>
                    <span>Bugün: <span className="text-white">{pixel.gunlukOlay.toLocaleString("tr-TR")} olay</span></span>
                  </div>
                  {pixel.hata && (
                    <p className="text-xs text-red-400 mt-1">Hata: {pixel.hata}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  className={
                    pixel.durum === "aktif"
                      ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {pixel.durum === "aktif" ? "Aktif" : "Hata"}
                </Badge>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
