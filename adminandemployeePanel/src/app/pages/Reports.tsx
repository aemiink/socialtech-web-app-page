import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { BarChart3, FileText, AlertCircle, CheckCircle, Plus, Download } from "lucide-react";
import { reports } from "../data/mockData";

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Raporlar</h1>
          <p className="text-[#A0A0A0]">Müşteri performans raporları</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Rapor Oluştur
        </Button>
      </div>

      {/* KPI Cards */}
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
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Ay Gönderilen</span>
          </div>
          <div className="text-2xl font-semibold">{reports.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Hazırlanıyor</span>
          </div>
          <div className="text-2xl font-semibold">2</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ort. Performans</span>
          </div>
          <div className="text-2xl font-semibold">92%</div>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="bg-[#1A1A1A] border-white/[0.06] p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{report.title}</h3>
                  <Badge variant={report.type === "monthly" ? "default" : report.type === "weekly" ? "secondary" : "outline"}>
                    {report.type === "monthly" ? "Aylık" : report.type === "weekly" ? "Haftalık" : "Çeyreklik"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0] mb-4">
                  <span>{report.client}</span>
                  <span>•</span>
                  <span>{report.period}</span>
                  <span>•</span>
                  <span>Oluşturan: {report.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(report.createdDate).toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {report.services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  İndir
                </Button>
                <Link to={`/raporlar/${report.id}`}>
                  <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Detay</Button>
                </Link>
              </div>
            </div>

            {report.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Harcama</p>
                  <p className="font-medium">₺{report.metrics.totalSpent.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Gelir</p>
                  <p className="font-medium text-[#AAFF01]">₺{report.metrics.totalRevenue.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">ROAS</p>
                  <p className="font-medium text-[#AAFF01]">{report.metrics.roas}x</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Conversion</p>
                  <p className="font-medium">{report.metrics.conversions.toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Tıklama</p>
                  <p className="font-medium">{report.metrics.clicks.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
