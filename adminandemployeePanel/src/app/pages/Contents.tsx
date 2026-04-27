import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { FileText, Calendar as CalendarIcon, AlertCircle, CheckCircle, Plus } from "lucide-react";

const contents = [
  { id: "1", title: "Bahar koleksiyonu tanıtım postu", client: "XYZ Holding", platform: "Instagram", format: "Post", status: "Onay Bekleyen", publishDate: "28 Nisan 2026", responsible: "Mehmet A." },
  { id: "2", title: "Ürün lansmanı video", client: "ABC Corp", platform: "TikTok", format: "Reel", status: "Yayına Hazır", publishDate: "29 Nisan 2026", responsible: "Ayşe D." },
  { id: "3", title: "Haftalık blog yazısı", client: "DEF Medya", platform: "Blog", format: "Blog", status: "Yayınlandı", publishDate: "25 Nisan 2026", responsible: "Ahmet K." },
  { id: "4", title: "Müşteri hikayesi carousel", client: "GHI Teknoloji", platform: "LinkedIn", format: "Carousel", status: "Revizyon İstendi", publishDate: "30 Nisan 2026", responsible: "Mehmet A." },
];

export function Contents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">İçerikler</h1>
          <p className="text-[#A0A0A0]">Merkezi içerik operasyonu</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni İçerik Oluştur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CalendarIcon className="w-5 h-5 text-white" />
            <span className="text-sm text-[#A0A0A0]">Planlanan İçerik</span>
          </div>
          <div className="text-2xl font-semibold">84</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Onay Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold">18</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yayına Hazır</span>
          </div>
          <div className="text-2xl font-semibold">26</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Yayınlanan</span>
          </div>
          <div className="text-2xl font-semibold">342</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon İstendi</span>
          </div>
          <div className="text-2xl font-semibold">5</div>
        </Card>
      </div>

      {/* Content Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">İçerik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Platform</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Format</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Yayın Tarihi</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sorumlu</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => (
                <tr key={content.id} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{content.title}</td>
                  <td className="p-4 text-sm">{content.client}</td>
                  <td className="p-4 text-sm">{content.platform}</td>
                  <td className="p-4">
                    <Badge variant="outline">{content.format}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      content.status === "Yayınlandı" ? "default" :
                      content.status === "Yayına Hazır" ? "secondary" :
                      content.status === "Revizyon İstendi" ? "destructive" :
                      "outline"
                    } className={content.status === "Yayınlandı" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                      {content.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{content.publishDate}</td>
                  <td className="p-4 text-sm">{content.responsible}</td>
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
