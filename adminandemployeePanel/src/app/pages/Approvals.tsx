import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ThumbsUp, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const approvals = [
  { id: "1", type: "İçerik", client: "XYZ Holding", service: "Social Media", title: "Haftalık sosyal medya içerikleri", status: "Müşteri Bekleniyor", responsible: "Mehmet A.", deadline: "28 Nisan 2026" },
  { id: "2", type: "Kreatif", client: "ABC Corp", service: "Meta ADS", title: "Kampanya görselleri", status: "Ajans İncelemesinde", responsible: "Ayşe D.", deadline: "29 Nisan 2026" },
  { id: "3", type: "Rapor", client: "DEF Medya", service: "Google ADS", title: "Aylık performans raporu", status: "Onaylandı", responsible: "Zeynep Y.", deadline: "25 Nisan 2026" },
  { id: "4", type: "Tasarım", client: "GHI Teknoloji", service: "Landing Pages", title: "Ana sayfa tasarım revizyonu", status: "Revizyon İstendi", responsible: "Ayşe D.", deadline: "30 Nisan 2026" },
];

export function Approvals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Onaylar</h1>
        <p className="text-[#A0A0A0]">Tüm müşteri ve iç onayları yönetin</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen Onay</span>
          </div>
          <div className="text-2xl font-semibold">24</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Müşteri Bekleniyor</span>
          </div>
          <div className="text-2xl font-semibold">16</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon İstendi</span>
          </div>
          <div className="text-2xl font-semibold">5</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Onaylandı</span>
          </div>
          <div className="text-2xl font-semibold">142</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Geciken Onay</span>
          </div>
          <div className="text-2xl font-semibold">3</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-[#1A1A1A] border border-white/[0.06]">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="content">İçerik</TabsTrigger>
          <TabsTrigger value="creative">Kreatif</TabsTrigger>
          <TabsTrigger value="ad">Reklam</TabsTrigger>
          <TabsTrigger value="design">Tasarım</TabsTrigger>
          <TabsTrigger value="report">Rapor</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#202020]">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hizmet</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Başlık</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sorumlu</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Son Tarih</th>
                    <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <Badge variant="outline">{approval.type}</Badge>
                      </td>
                      <td className="p-4 text-sm">{approval.client}</td>
                      <td className="p-4 text-sm">{approval.service}</td>
                      <td className="p-4 font-medium">{approval.title}</td>
                      <td className="p-4">
                        <Badge variant={
                          approval.status === "Onaylandı" ? "default" :
                          approval.status === "Revizyon İstendi" ? "destructive" :
                          "secondary"
                        } className={approval.status === "Onaylandı" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                          {approval.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">{approval.responsible}</td>
                      <td className="p-4 text-sm text-[#A0A0A0]">{approval.deadline}</td>
                      <td className="p-4">
                        <Button size="sm" variant="outline">Detay</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
