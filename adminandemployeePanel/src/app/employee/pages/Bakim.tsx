import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Settings, CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";

const bakimGorevleri = [
  {
    id: "1",
    baslik: "WordPress çekirdek güncellemesi",
    musteri: "Koçtaş",
    tur: "CMS Güncellemesi",
    planlanan: "2026-04-29",
    sure: "30 dk",
    durum: "planlandı",
    ortam: "Production"
  },
  {
    id: "2",
    baslik: "Database otomatik yedekleme testi",
    musteri: "Hepsiburada",
    tur: "Yedekleme",
    planlanan: "2026-04-28",
    sure: "2 saat",
    durum: "devam-ediyor",
    ortam: "Production"
  },
  {
    id: "3",
    baslik: "SSL sertifikası yenileme — 30 gün kaldı",
    musteri: "Türk Telekom",
    tur: "SSL",
    planlanan: "2026-05-10",
    sure: "15 dk",
    durum: "planlandı",
    ortam: "Production"
  },
  {
    id: "4",
    baslik: "Sunucu log rotasyonu",
    musteri: "Teknosa",
    tur: "Sunucu",
    planlanan: "2026-04-26",
    sure: "45 dk",
    durum: "tamamlandı",
    ortam: "Production"
  },
  {
    id: "5",
    baslik: "Eklenti güvenlik güncellemeleri",
    musteri: "Boyner",
    tur: "Güvenlik",
    planlanan: "2026-05-02",
    sure: "1 saat",
    durum: "planlandı",
    ortam: "Staging → Production"
  }
];

export function Bakim() {
  const planlandı = bakimGorevleri.filter(b => b.durum === "planlandı").length;
  const tamamlandı = bakimGorevleri.filter(b => b.durum === "tamamlandı").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Bakım</h1>
          <p className="text-[#A0A0A0]">Periyodik bakım görevleri ve sistem sağlığı</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Calendar className="w-4 h-4 mr-2" /> Bakım Planla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Görev</span>
          </div>
          <div className="text-2xl font-semibold">{bakimGorevleri.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Planlandı</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{planlandı}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Eden</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">
            {bakimGorevleri.filter(b => b.durum === "devam-ediyor").length}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{tamamlandı}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Bakım Takvimi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Bakım Görevi</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Ortam</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tarih</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Süre</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {bakimGorevleri.map((gorev) => (
                <tr key={gorev.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{gorev.baslik}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{gorev.musteri}</td>
                  <td className="p-4">
                    <Badge variant="outline">{gorev.tur}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{gorev.ortam}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(gorev.planlanan).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{gorev.sure}</td>
                  <td className="p-4">
                    <Badge
                      className={
                        gorev.durum === "tamamlandı"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : gorev.durum === "devam-ediyor"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {gorev.durum === "tamamlandı" ? "Tamamlandı" : gorev.durum === "devam-ediyor" ? "Devam" : "Planlandı"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {gorev.durum !== "tamamlandı" && (
                      <Button size="sm" variant="outline">Başlat</Button>
                    )}
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
