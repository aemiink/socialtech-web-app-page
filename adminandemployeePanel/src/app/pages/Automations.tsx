import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Zap, CheckCircle, AlertTriangle, Clock, Users, ExternalLink } from "lucide-react";

const clients = [
  { client: "XYZ Holding", package: "Growth Scale", automationStatus: "Aktif", hubUrl: "xyz.socialtech.ai", credentials: "Verildi", accessStatus: "Aktif", lastTrigger: "2 saat önce", health: "Çalışıyor", actions: ["Şifre Sıfırla", "Erişimi İptal"] },
  { client: "ABC Corporation", package: "Growth Hub", automationStatus: "Aktif", hubUrl: "abc.socialtech.ai", credentials: "Verildi", accessStatus: "Aktif", lastTrigger: "5 dakika önce", health: "Çalışıyor", actions: ["Şifre Sıfırla", "Erişimi İptal"] },
  { client: "DEF Medya", package: "Growth Hub", automationStatus: "Hata", hubUrl: "def.socialtech.ai", credentials: "Verildi", accessStatus: "Hata", lastTrigger: "1 gün önce", health: "API Hatası", actions: ["Erişim Gönder", "Hatayı İncele"] },
  { client: "GHI Teknoloji", package: "Growth Scale", automationStatus: "Beklemede", hubUrl: "ghi.socialtech.ai", credentials: "Bekliyor", accessStatus: "Bekliyor", lastTrigger: "-", health: "Kurulum Bekleniyor", actions: ["Giriş Oluştur", "Erişim Gönder"] },
  { client: "JKL Perakende", package: "Growth Hub", automationStatus: "Aktif", hubUrl: "jkl.socialtech.ai", credentials: "Verildi", accessStatus: "Aktif", lastTrigger: "15 dakika önce", health: "Çalışıyor", actions: ["Şifre Sıfırla"] },
];

const automationTypes = [
  { name: "PromptIMG", description: "AI görsel üretimi", activeClients: 12 },
  { name: "PromptVisual", description: "Görsel düzenleme otomasyonu", activeClients: 18 },
  { name: "PromptAnalysis", description: "Performans analizi", activeClients: 24 },
  { name: "PromptWhatsApp", description: "WhatsApp entegrasyonu", activeClients: 8 },
  { name: "PromptCommander", description: "Merkezi komut sistemi", activeClients: 15 },
];

export function Automations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Otomasyonlar</h1>
        <p className="text-[#A0A0A0]">Otomasyon erişim ve durum yönetimi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Otomasyon</span>
          </div>
          <div className="text-2xl font-semibold">32</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Growth/Scale Müşterisi</span>
          </div>
          <div className="text-2xl font-semibold">28</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Giriş Bilgisi Verildi</span>
          </div>
          <div className="text-2xl font-semibold">25</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Hata Veren Akış</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">3</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Tetiklenen</span>
          </div>
          <div className="text-2xl font-semibold">1,248</div>
        </Card>
      </div>

      {/* Automation Types */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold mb-4">Otomasyon Tipleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {automationTypes.map((type, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#AAFF01]" />
                <h4 className="font-semibold text-sm">{type.name}</h4>
              </div>
              <p className="text-xs text-[#A0A0A0] mb-3">{type.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">Aktif</span>
                <span className="font-medium text-[#AAFF01]">{type.activeClients}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Client Automation Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Müşteri Otomasyon Tablosu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Paket</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hub URL</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Giriş Bilgisi</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Erişim Durumu</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Son Tetiklenme</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Akış Sağlığı</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr key={i} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{client.client}</td>
                  <td className="p-4 text-sm">{client.package}</td>
                  <td className="p-4">
                    <a href={`https://${client.hubUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#AAFF01] hover:underline flex items-center gap-1">
                      {client.hubUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4">
                    <Badge variant={client.credentials === "Verildi" ? "default" : "outline"} className={client.credentials === "Verildi" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                      {client.credentials}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      client.accessStatus === "Aktif" ? "default" :
                      client.accessStatus === "Hata" ? "destructive" :
                      "secondary"
                    } className={client.accessStatus === "Aktif" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                      {client.accessStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.lastTrigger}</td>
                  <td className="p-4">
                    <Badge variant={
                      client.health === "Çalışıyor" ? "secondary" :
                      client.health.includes("Hata") ? "destructive" :
                      "outline"
                    }>
                      {client.health}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {client.actions.slice(0, 1).map((action, j) => (
                        <Button key={j} size="sm" variant="outline">{action}</Button>
                      ))}
                      {client.actions.length > 1 && (
                        <Button size="sm" variant="ghost">+{client.actions.length - 1}</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Subdomain / Hub Information */}
      <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-[#AAFF01]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#AAFF01]/10 flex-shrink-0">
            <Zap className="w-6 h-6 text-[#AAFF01]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2 text-lg">Otomasyon Hub Sistemi</h4>
            <p className="text-sm text-[#A0A0A0] mb-4">
              Otomasyonlar ayrı subdomainlerde çalışır. Growth ve Scale müşterilerine erişim açılır.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-[#A0A0A0] mb-1">Subdomain Yapısı</p>
                <code className="text-sm text-[#AAFF01]">musteri-adi.socialtech.ai</code>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-[#A0A0A0] mb-1">Erişim Yönetimi</p>
                <p className="text-sm">E-posta ile otomatik gönderim</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Yeni Hub Oluştur</Button>
              <Button size="sm" variant="outline">Hub Şablonları</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
