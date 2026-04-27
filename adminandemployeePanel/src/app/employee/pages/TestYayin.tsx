import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { TestTube, Rocket, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const testler = [
  {
    id: "1",
    ad: "Ödeme Akışı E2E Test Suite",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    tur: "E2E",
    toplam: 24,
    gecen: 20,
    kalan: 4,
    sonCalisma: "2026-04-27 14:22",
    durum: "kısmi-başarısız"
  },
  {
    id: "2",
    ad: "Ürün API Unit Testleri",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    tur: "Unit",
    toplam: 48,
    gecen: 48,
    kalan: 0,
    sonCalisma: "2026-04-26 11:05",
    durum: "başarılı"
  },
  {
    id: "3",
    ad: "Landing Page Cross-Browser Testi",
    proje: "Boyner Landing Page Redesign",
    musteri: "Boyner",
    tur: "Uyumluluk",
    toplam: 12,
    gecen: 12,
    kalan: 0,
    sonCalisma: "2026-04-25 16:40",
    durum: "başarılı"
  }
];

const deploymentlar = [
  { proje: "Türk Telekom Fiber", ortam: "Staging", tarih: "2026-04-27", durum: "başarılı", versiyon: "v2.4.1" },
  { proje: "Teknosa E-ticaret", ortam: "Staging", tarih: "2026-04-26", durum: "başarılı", versiyon: "v1.8.0" },
  { proje: "Türk Telekom Fiber", ortam: "Production", tarih: "2026-04-25", durum: "başarılı", versiyon: "v2.3.0" },
  { proje: "Boyner Landing", ortam: "Production", tarih: "2026-04-22", durum: "geri-alındı", versiyon: "v1.1.0" }
];

export function TestYayin() {
  const başarılı = testler.filter(t => t.durum === "başarılı").length;
  const toplam = testler.reduce((sum, t) => sum + t.toplam, 0);
  const toplamGecen = testler.reduce((sum, t) => sum + t.gecen, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Test &amp; Yayın</h1>
        <p className="text-[#A0A0A0]">Test süreçleri ve deployment durumları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TestTube className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Test Suite</span>
          </div>
          <div className="text-2xl font-semibold">{testler.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Başarı Oranı</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">
            %{Math.round((toplamGecen / toplam) * 100)}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Başarılı Suite</span>
          </div>
          <div className="text-2xl font-semibold">{başarılı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Başarısız</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{testler.length - başarılı}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Test Sonuçları</h3>
          <div className="space-y-3">
            {testler.map((test) => (
              <Card key={test.id} className="bg-[#1A1A1A] border-white/[0.06] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{test.ad}</h4>
                      <Badge variant="outline" className="text-xs">{test.tur}</Badge>
                    </div>
                    <p className="text-xs text-[#A0A0A0]">{test.musteri} · {test.sonCalisma}</p>
                  </div>
                  <Badge
                    className={
                      test.durum === "başarılı"
                        ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    }
                  >
                    {test.durum === "başarılı" ? "Başarılı" : "Kısmi Başarısız"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${test.durum === "başarılı" ? "bg-[#AAFF01]" : "bg-orange-500"}`}
                      style={{ width: `${Math.round((test.gecen / test.toplam) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#A0A0A0]">{test.gecen}/{test.toplam}</span>
                </div>
                <Button size="sm" variant="outline" className="mt-2">
                  <RefreshCw className="w-4 h-4 mr-1" /> Yeniden Çalıştır
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Deployment Geçmişi</h3>
          <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
            <div className="divide-y divide-white/[0.06]">
              {deploymentlar.map((dep, i) => (
                <div key={i} className="p-4 hover:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{dep.proje}</p>
                        <Badge variant="outline" className="text-xs">{dep.versiyon}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                        <span>{dep.ortam}</span>
                        <span>·</span>
                        <span>{new Date(dep.tarih).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dep.durum === "başarılı"
                        ? <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                      <Badge
                        className={
                          dep.durum === "başarılı"
                            ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {dep.durum === "başarılı" ? "Başarılı" : "Geri Alındı"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Button size="sm" className="mt-3 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
            <Rocket className="w-4 h-4 mr-2" /> Yeni Deployment
          </Button>
        </div>
      </div>
    </div>
  );
}
