import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Server, Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";

const backendGorevleri = [
  {
    id: "1",
    baslik: "CRM sistemi API bağlantısı — OAuth2 entegrasyonu",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    endpoint: "POST /api/crm/auth",
    teknoloji: "Node.js + Express",
    oncelik: "kritik",
    durum: "devam-ediyor",
    deadline: "2026-04-29"
  },
  {
    id: "2",
    baslik: "Ürün kataloğu GraphQL şeması",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    endpoint: "GraphQL /api/products",
    teknoloji: "Apollo + PostgreSQL",
    oncelik: "yüksek",
    durum: "devam-ediyor",
    deadline: "2026-05-04"
  },
  {
    id: "3",
    baslik: "Ödeme gateway webhook handler",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    endpoint: "POST /webhooks/payment",
    teknoloji: "Node.js + Redis",
    oncelik: "kritik",
    durum: "bekliyor",
    deadline: "2026-05-10"
  },
  {
    id: "4",
    baslik: "Rate limiting middleware",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    endpoint: "Middleware",
    teknoloji: "Express + Redis",
    oncelik: "normal",
    durum: "tamamlandı",
    deadline: "2026-04-20"
  }
];

const endpointler = [
  { metod: "GET", path: "/api/v1/customers", durum: "aktif", yanıtSüresi: "42ms" },
  { metod: "POST", path: "/api/v1/orders", durum: "aktif", yanıtSüresi: "128ms" },
  { metod: "POST", path: "/api/crm/auth", durum: "geliştirme", yanıtSüresi: "—" },
  { metod: "GET", path: "/api/v1/products", durum: "aktif", yanıtSüresi: "67ms" },
];

const metodRenk: Record<string, string> = {
  GET: "bg-[#AAFF01]/20 text-[#AAFF01]",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-orange-500/20 text-orange-400",
  DELETE: "bg-red-500/20 text-red-400"
};

export function BackendAPI() {
  const devamEdiyor = backendGorevleri.filter(g => g.durum === "devam-ediyor").length;
  const bekliyor = backendGorevleri.filter(g => g.durum === "bekliyor").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Backend / API</h1>
        <p className="text-[#A0A0A0]">Backend geliştirme görevleri ve API endpoint durumları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Görev</span>
          </div>
          <div className="text-2xl font-semibold">{backendGorevleri.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Ediyor</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{devamEdiyor}</div>
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
            <span className="text-sm text-[#A0A0A0]">Aktif Endpoint</span>
          </div>
          <div className="text-2xl font-semibold">
            {endpointler.filter(e => e.durum === "aktif").length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-lg font-semibold">Görev Listesi</h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {backendGorevleri.map((gorev) => (
              <div key={gorev.id} className="p-4 hover:bg-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm mb-1">{gorev.baslik}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A0A0A0] font-mono">{gorev.endpoint}</span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] mt-1">{gorev.musteri} · {gorev.teknoloji}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={gorev.oncelik === "kritik" ? "destructive" : gorev.oncelik === "yüksek" ? "default" : "secondary"}
                    >
                      {gorev.oncelik === "kritik" ? "Kritik" : gorev.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                    </Badge>
                    <Badge
                      className={
                        gorev.durum === "tamamlandı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : gorev.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {gorev.durum === "tamamlandı" ? "Tamamlandı" : gorev.durum === "devam-ediyor" ? "Devam" : "Bekliyor"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-lg font-semibold">API Endpoint Durumu</h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {endpointler.map((ep, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${metodRenk[ep.metod]}`}>
                    {ep.metod}
                  </span>
                  <code className="text-sm text-[#A0A0A0]">{ep.path}</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A0A0A0]">{ep.yanıtSüresi}</span>
                  <Badge
                    className={
                      ep.durum === "aktif"
                        ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    }
                  >
                    {ep.durum === "aktif" ? "Aktif" : "Geliştirmede"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
