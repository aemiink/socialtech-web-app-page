import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { FileText, TrendingUp, CheckCircle, Clock, Download } from "lucide-react";
import { reports } from "../../data/mockData";

export function RaporTakibi() {
  const typeLabel: Record<string, string> = {
    monthly: "Aylık",
    quarterly: "Çeyreklik",
    weekly: "Haftalık",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Rapor Takibi</h1>
        <p className="text-[#A0A0A0]">Müşteri raporlarının durumu ve metrikleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Rapor</span>
          </div>
          <div className="text-2xl font-semibold">{reports.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. ROAS</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">
            {(reports.reduce((sum, r) => sum + r.metrics.roas, 0) / reports.length).toFixed(1)}x
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Dönüşüm</span>
          </div>
          <div className="text-2xl font-semibold">
            {reports.reduce((sum, r) => sum + r.metrics.conversions, 0).toLocaleString("tr-TR")}
          </div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bu Ay Hazırlanan</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">
            {reports.filter(r => r.type === "monthly").length}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rapor Listesi</h3>
          <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Yeni Rapor</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Rapor Adı</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Tür</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Dönem</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">ROAS</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Dönüşüm</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hazırlayan</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium text-sm">{report.title}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{report.client}</td>
                  <td className="p-4">
                    <Badge variant="outline">{typeLabel[report.type] ?? report.type}</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{report.period}</td>
                  <td className="p-4 text-sm text-[#AAFF01] font-semibold">{report.metrics.roas}x</td>
                  <td className="p-4 text-sm">{report.metrics.conversions.toLocaleString("tr-TR")}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{report.createdBy}</td>
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
