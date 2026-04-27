import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Wrench, AlertCircle, Clock, User, Plus } from "lucide-react";

const acikIsler = [
  {
    id: "1",
    baslik: "SSL sertifikası yenileme — Türk Telekom subdomain",
    musteri: "Türk Telekom",
    kategori: "Güvenlik",
    oncelik: "kritik",
    atanan: "Selin Yılmaz",
    tarih: "2026-04-27",
    son: "2026-04-28"
  },
  {
    id: "2",
    baslik: "SMTP bağlantı hatası düzeltmesi — Teknosa",
    musteri: "Teknosa",
    kategori: "E-posta",
    oncelik: "yüksek",
    atanan: "Selin Yılmaz",
    tarih: "2026-04-26",
    son: "2026-04-29"
  },
  {
    id: "3",
    baslik: "CDN cache temizleme — Getir landing page",
    musteri: "Getir",
    kategori: "Performans",
    oncelik: "normal",
    atanan: "Selin Yılmaz",
    tarih: "2026-04-25",
    son: "2026-05-01"
  },
  {
    id: "4",
    baslik: "Backup doğrulama — Hepsiburada sunucusu",
    musteri: "Hepsiburada",
    kategori: "Yedekleme",
    oncelik: "normal",
    atanan: "Selin Yılmaz",
    tarih: "2026-04-28",
    son: "2026-05-02"
  }
];

export function AcikIsler() {
  const kritik = acikIsler.filter(i => i.oncelik === "kritik").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Açık İşler</h1>
          <p className="text-[#A0A0A0]">Devam eden ve bekleyen destek işleri</p>
        </div>
        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
          <Plus className="w-4 h-4 mr-2" /> Yeni İş
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Açık</span>
          </div>
          <div className="text-2xl font-semibold">{acikIsler.length}</div>
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
            <span className="text-sm text-[#A0A0A0]">Bugün Bitiyor</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">
            {acikIsler.filter(i => i.son === "2026-04-28").length}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">
            {new Set(acikIsler.map(i => i.musteri)).size}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Açık İş Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">İş</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Kategori</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Atanan</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Açılış</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {acikIsler.map((is) => (
                <tr key={is.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{is.baslik}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{is.musteri}</td>
                  <td className="p-4">
                    <Badge variant="outline">{is.kategori}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{is.atanan}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(is.tarih).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={is.son === "2026-04-28" ? "text-orange-400 font-medium" : "text-[#A0A0A0]"}>
                      {new Date(is.son).toLocaleDateString("tr-TR")}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={is.oncelik === "kritik" ? "destructive" : is.oncelik === "yüksek" ? "default" : "secondary"}
                    >
                      {is.oncelik === "kritik" ? "Kritik" : is.oncelik === "yüksek" ? "Yüksek" : "Normal"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                      Çöz
                    </Button>
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
