import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Package, CheckCircle, Clock, Upload, Download } from "lucide-react";

const teslimatlar = [
  {
    id: "1",
    title: "Koçtaş Bahar Kampanyası Kreatifleri",
    client: "Koçtaş",
    type: "Tasarım",
    files: 5,
    deliveredAt: "2026-04-25",
    status: "teslim-edildi",
    feedback: "Onaylandı"
  },
  {
    id: "2",
    title: "Türk Telekom Fiber Landing Page",
    client: "Türk Telekom",
    type: "Geliştirme",
    files: 1,
    deliveredAt: "2026-04-20",
    status: "revizyon",
    feedback: "2 revizyon talebi var"
  },
  {
    id: "3",
    title: "Migros Ramazan İçerik Seti",
    client: "Migros",
    type: "İçerik",
    files: 12,
    deliveredAt: "2026-04-22",
    status: "teslim-edildi",
    feedback: "Onaylandı"
  },
  {
    id: "4",
    title: "Getir TikTok Video Serisi",
    client: "Getir",
    type: "Video",
    files: 3,
    deliveredAt: null,
    status: "hazırlanıyor",
    feedback: null
  },
  {
    id: "5",
    title: "Hepsiburada SEO Aksiyon Raporu",
    client: "Hepsiburada",
    type: "Rapor",
    files: 2,
    deliveredAt: "2026-04-26",
    status: "incelemede",
    feedback: "Müşteri inceliyor"
  }
];

export function Teslimatlar() {
  const delivered = teslimatlar.filter(t => t.status === "teslim-edildi").length;
  const inReview = teslimatlar.filter(t => t.status === "incelemede").length;
  const preparing = teslimatlar.filter(t => t.status === "hazırlanıyor").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Teslimatlar</h1>
        <p className="text-[#A0A0A0]">Müşterilere yapılan teslimatlar ve durumları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Teslimat</span>
          </div>
          <div className="text-2xl font-semibold">{teslimatlar.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Teslim Edildi</span>
          </div>
          <div className="text-2xl font-semibold">{delivered}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">İncelemede</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{inReview}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Hazırlanıyor</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{preparing}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Teslimat Listesi</h3>
          <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
            <Upload className="w-4 h-4 mr-2" /> Yeni Teslimat
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Teslimat</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Dosya</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Teslim Tarihi</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Geri Bildirim</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {teslimatlar.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{item.title}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.client}</td>
                  <td className="p-4">
                    <Badge variant="outline">{item.type}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.files} dosya</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {item.deliveredAt
                      ? new Date(item.deliveredAt).toLocaleDateString("tr-TR")
                      : "—"}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        item.status === "teslim-edildi"
                          ? "bg-[#AAFF01]/20 text-[#AAFF01] border-[#AAFF01]/30"
                          : item.status === "incelemede"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : item.status === "revizyon"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-white/10 text-[#A0A0A0] border-white/10"
                      }
                    >
                      {item.status === "teslim-edildi"
                        ? "Teslim Edildi"
                        : item.status === "incelemede"
                        ? "İncelemede"
                        : item.status === "revizyon"
                        ? "Revizyon"
                        : "Hazırlanıyor"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{item.feedback || "—"}</td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
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
