import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Zap, Monitor, Smartphone, AlertCircle, CheckCircle } from "lucide-react";

const sayfaHizlari = [
  {
    id: "1",
    musteri: "Hepsiburada",
    domain: "hepsiburada.com",
    desktop: { lcp: 1.8, fid: 12, cls: 0.04, puan: 88 },
    mobile: { lcp: 3.2, fid: 28, cls: 0.08, puan: 64 },
    oncekiPuan: { desktop: 82, mobile: 58 }
  },
  {
    id: "2",
    musteri: "Migros",
    domain: "migros.com.tr",
    desktop: { lcp: 4.8, fid: 45, cls: 0.18, puan: 52 },
    mobile: { lcp: 6.2, fid: 78, cls: 0.24, puan: 38 },
    oncekiPuan: { desktop: 50, mobile: 36 }
  },
  {
    id: "3",
    musteri: "Koçtaş",
    domain: "koctas.com",
    desktop: { lcp: 1.4, fid: 8, cls: 0.02, puan: 94 },
    mobile: { lcp: 2.1, fid: 18, cls: 0.05, puan: 82 },
    oncekiPuan: { desktop: 88, mobile: 74 }
  }
];

const metrikDurum = (lcp: number) => {
  if (lcp <= 2.5) return "iyi";
  if (lcp <= 4) return "geliştirilmeli";
  return "kötü";
};

const puanRengi = (puan: number) => {
  if (puan >= 90) return "text-[#AAFF01]";
  if (puan >= 70) return "text-orange-400";
  return "text-red-400";
};

export function SayfaHizi() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Sayfa Hızı</h1>
        <p className="text-[#A0A0A0]">Core Web Vitals ve sayfa performans skorları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Takip Edilen Site</span>
          </div>
          <div className="text-2xl font-semibold">{sayfaHizlari.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Core Web Vitals Geçen</span>
          </div>
          <div className="text-2xl font-semibold">
            {sayfaHizlari.filter(s => s.mobile.puan >= 70).length}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">İyileştirme Gerekli</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">
            {sayfaHizlari.filter(s => s.mobile.puan < 70).length}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {sayfaHizlari.map((site) => (
          <Card key={site.id} className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-semibold text-lg">{site.musteri}</h4>
                <p className="text-xs text-[#A0A0A0] font-mono">{site.domain}</p>
              </div>
              <Button size="sm" variant="outline">Detaylı Rapor</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="w-5 h-5 text-[#A0A0A0]" />
                  <span className="font-medium">Desktop</span>
                  <span className={`text-2xl font-bold ml-auto ${puanRengi(site.desktop.puan)}`}>
                    {site.desktop.puan}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex-1 bg-white/10 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${site.desktop.puan >= 90 ? "bg-[#AAFF01]" : site.desktop.puan >= 70 ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${site.desktop.puan}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "LCP", value: `${site.desktop.lcp}s`, durum: metrikDurum(site.desktop.lcp) },
                    { label: "FID", value: `${site.desktop.fid}ms`, durum: site.desktop.fid <= 100 ? "iyi" : "kötü" },
                    { label: "CLS", value: site.desktop.cls.toFixed(2), durum: site.desktop.cls <= 0.1 ? "iyi" : "kötü" }
                  ].map((metrik, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-[#202020]">
                      <span className="text-sm text-[#A0A0A0]">{metrik.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{metrik.value}</span>
                        <Badge
                          className={
                            metrik.durum === "iyi"
                              ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30 text-xs"
                              : "bg-red-500/20 text-red-400 border-red-500/30 text-xs"
                          }
                        >
                          {metrik.durum === "iyi" ? "İyi" : "İyileştir"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-[#A0A0A0]" />
                  <span className="font-medium">Mobil</span>
                  <span className={`text-2xl font-bold ml-auto ${puanRengi(site.mobile.puan)}`}>
                    {site.mobile.puan}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex-1 bg-white/10 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${site.mobile.puan >= 90 ? "bg-[#AAFF01]" : site.mobile.puan >= 70 ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${site.mobile.puan}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "LCP", value: `${site.mobile.lcp}s`, durum: metrikDurum(site.mobile.lcp) },
                    { label: "FID", value: `${site.mobile.fid}ms`, durum: site.mobile.fid <= 100 ? "iyi" : "kötü" },
                    { label: "CLS", value: site.mobile.cls.toFixed(2), durum: site.mobile.cls <= 0.1 ? "iyi" : "kötü" }
                  ].map((metrik, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-[#202020]">
                      <span className="text-sm text-[#A0A0A0]">{metrik.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{metrik.value}</span>
                        <Badge
                          className={
                            metrik.durum === "iyi"
                              ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30 text-xs"
                              : "bg-red-500/20 text-red-400 border-red-500/30 text-xs"
                          }
                        >
                          {metrik.durum === "iyi" ? "İyi" : "İyileştir"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
