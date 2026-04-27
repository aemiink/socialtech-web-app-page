import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Bug, AlertCircle, CheckCircle, Clock, Plus } from "lucide-react";

const buglar = [
  {
    id: "BUG-001",
    baslik: "Ödeme sayfasında iOS Safari'de form gönderilmiyor",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    oncelik: "kritik",
    durum: "devam-ediyor",
    raporlayan: "QA Ekibi",
    tarih: "2026-04-26",
    ortam: "Production"
  },
  {
    id: "BUG-002",
    baslik: "Ürün fiyatları virgül yerine nokta gösteriyor",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    oncelik: "yüksek",
    durum: "bekliyor",
    raporlayan: "Can Arslan",
    tarih: "2026-04-25",
    ortam: "Staging"
  },
  {
    id: "BUG-003",
    baslik: "Arama sonuçları sayfalanması çalışmıyor",
    proje: "Teknosa E-ticaret Platformu",
    musteri: "Teknosa",
    oncelik: "normal",
    durum: "bekliyor",
    raporlayan: "Ahmet Yıldırım",
    tarih: "2026-04-24",
    ortam: "Staging"
  },
  {
    id: "BUG-004",
    baslik: "Landing page hero image Retina ekranda bulanık",
    proje: "Boyner Landing Page Redesign",
    musteri: "Boyner",
    oncelik: "normal",
    durum: "çözüldü",
    raporlayan: "Ayşe Özkan",
    tarih: "2026-04-22",
    ortam: "Production"
  },
  {
    id: "BUG-005",
    baslik: "API timeout — CRM auth 30s sonra yanıt vermiyor",
    proje: "Türk Telekom Fiber Lansmanı",
    musteri: "Türk Telekom",
    oncelik: "kritik",
    durum: "devam-ediyor",
    raporlayan: "Can Arslan",
    tarih: "2026-04-27",
    ortam: "Production"
  }
];

export function Buglar() {
  const kritik = buglar.filter(b => b.oncelik === "kritik" && b.durum !== "çözüldü").length;
  const açık = buglar.filter(b => b.durum !== "çözüldü").length;
  const çözüldü = buglar.filter(b => b.durum === "çözüldü").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Buglar</h1>
          <p className="text-[#A0A0A0]">Açık ve çözülen hata raporları</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Bug Raporu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Bug className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Bug</span>
          </div>
          <div className="text-2xl font-semibold">{buglar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{kritik}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Açık</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{açık}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Çözüldü</span>
          </div>
          <div className="text-2xl font-semibold">{çözüldü}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Bug Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">ID</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Başlık</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Ortam</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {buglar.map((bug) => (
                <tr key={bug.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-mono text-xs text-[#A0A0A0]">{bug.id}</td>
                  <td className="p-4 font-medium text-sm max-w-xs">{bug.baslik}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{bug.musteri}</td>
                  <td className="p-4">
                    <Badge variant={bug.ortam === "Production" ? "destructive" : "outline"} className="text-xs">
                      {bug.ortam}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={bug.oncelik === "kritik" ? "destructive" : bug.oncelik === "yüksek" ? "default" : "secondary"}
                    >
                      {bug.oncelik === "kritik" ? "Kritik" : bug.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(bug.tarih).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        bug.durum === "çözüldü"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : bug.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {bug.durum === "çözüldü" ? "Çözüldü" : bug.durum === "devam-ediyor" ? "Devam" : "Bekliyor"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">Detay</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
