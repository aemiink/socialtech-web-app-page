import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { TrendingUp, Target, Zap, DollarSign, AlertCircle, CheckSquare, Image, BarChart } from "lucide-react";

export function PerformanceSpecialistDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Performance Specialist Dashboard</h1>
        <p className="text-[#A0A0A0]">Kampanya yönetimi ve performans optimizasyonu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Kampanya</span>
          </div>
          <div className="text-2xl font-semibold">18</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Günlük Bütçe</span>
          </div>
          <div className="text-2xl font-semibold">₺45K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ortalama ROAS</span>
          </div>
          <div className="text-2xl font-semibold">4.2x</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Optimizasyon Gerekli</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">5</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik Durum</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">2</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Kritik Kampanyalar</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", campaign: "Meta ADS - Conversion", budget: "₺8,500/gün", roas: "2.1x", status: "critical", issue: "ROAS hedefin altında" },
              { client: "ABC Corp", campaign: "Google ADS - Brand", budget: "₺5,200/gün", roas: "5.8x", status: "optimize", issue: "Bütçe artırılabilir" },
              { client: "DEF Medya", campaign: "TikTok ADS - Awareness", budget: "₺3,100/gün", roas: "3.2x", status: "warning", issue: "CTR düşüyor" },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border ${item.status === 'critical' ? 'bg-red-500/10 border-red-500/30' : item.status === 'optimize' ? 'bg-[#AAFF01]/10 border-[#AAFF01]/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{item.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{item.campaign}</p>
                  </div>
                  <Badge variant="outline" className={item.status === 'critical' ? 'text-red-500 border-red-500' : item.status === 'optimize' ? 'text-[#AAFF01] border-[#AAFF01]' : 'text-orange-500 border-orange-500'}>
                    {item.roas}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">{item.budget}</span>
                  <span className={item.status === 'critical' ? 'text-red-500' : item.status === 'optimize' ? 'text-[#AAFF01]' : 'text-orange-500'}>{item.issue}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Optimizasyon Yap</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Bugünkü Aksiyonlar</h3>
          <div className="space-y-3">
            {[
              { type: "Optimizasyon", client: "XYZ Holding", action: "CBO stratejisi değişikliği", time: "10:00", priority: "high" },
              { type: "Rapor", client: "ABC Corp", action: "Haftalık performans raporu hazırla", time: "14:00", priority: "normal" },
              { type: "Kreatif", client: "DEF Medya", action: "A/B test sonuçları analizi", time: "16:30", priority: "normal" },
              { type: "Toplantı", client: "GHI Teknoloji", action: "Kampanya stratejisi toplantısı", time: "15:00", priority: "high" },
            ].map((task, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{task.type}</Badge>
                  <span className="text-sm font-medium">{task.client}</span>
                  {task.priority === 'high' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                </div>
                <p className="text-sm text-[#A0A0A0] mb-1">{task.action}</p>
                <span className="text-xs text-[#AAFF01]">{task.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Kreatif Talepleri</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", type: "Meta ADS", count: 5, deadline: "Yarın" },
              { client: "ABC Corp", type: "Google Display", count: 3, deadline: "29 Nisan" },
              { client: "DEF Medya", type: "TikTok Video", count: 2, deadline: "30 Nisan" },
            ].map((request, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{request.client}</p>
                  <Badge variant="secondary" className="text-xs">{request.count} kreatif</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{request.type}</p>
                <p className="text-xs text-orange-500">Deadline: {request.deadline}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Yeni Talep</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Pixel & Tracking</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", platform: "Meta Pixel", status: "active", events: "12 event" },
              { client: "ABC Corp", platform: "Google Tag", status: "warning", events: "Eksik conversion" },
              { client: "DEF Medya", platform: "TikTok Pixel", status: "active", events: "8 event" },
            ].map((pixel, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{pixel.client}</p>
                  <Badge variant={pixel.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                    {pixel.status === 'active' ? 'Aktif' : 'Uyarı'}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{pixel.platform}</p>
                <p className="text-xs text-[#AAFF01]">{pixel.events}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Bu Hafta Teslim</h3>
          </div>
          <div className="space-y-2">
            {[
              { task: "XYZ Holding haftalık rapor", date: "28 Nisan", status: "pending" },
              { task: "ABC Corp kampanya analizi", date: "29 Nisan", status: "in-progress" },
              { task: "DEF Medya aylık özet", date: "30 Nisan", status: "pending" },
            ].map((delivery, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-1">{delivery.task}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A0A0A0]">{delivery.date}</span>
                  <Badge variant={delivery.status === 'in-progress' ? 'default' : 'outline'} className="text-xs">
                    {delivery.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
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
