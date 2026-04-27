import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Users, FolderKanban, DollarSign, TrendingUp, AlertCircle, Clock, CheckSquare, Bell } from "lucide-react";
import { clients, projects, employees } from "../../data/mockData";

const activeClients = clients.filter(c => c.status === "active").length;
const totalMonthlyRevenue = clients.reduce((sum, c) => sum + c.monthlyValue, 0);
const activeProjects = projects.filter(p => p.status === "in-progress").length;

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-[#A0A0A0]">Ajans genel yönetimi ve kontrol merkezi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">{activeClients}</div>
          <p className="text-xs text-[#A0A0A0] mt-2">+2 bu ay</p>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FolderKanban className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Proje</span>
          </div>
          <div className="text-2xl font-semibold">{activeProjects}</div>
          <p className="text-xs text-[#A0A0A0] mt-2">8 hizmet kategorisi</p>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aylık Gelir</span>
          </div>
          <div className="text-2xl font-semibold">₺{Math.round(totalMonthlyRevenue / 1000)}K</div>
          <p className="text-xs text-green-500 mt-2">+8% geçen aya göre</p>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Ajans Skoru</span>
          </div>
          <div className="text-2xl font-semibold">87/100</div>
          <p className="text-xs text-[#A0A0A0] mt-2">Çok İyi</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Kritik Uyarılar</h3>
          <div className="space-y-3">
            {[
              { type: "Ödeme", client: "Migros", message: "Fatura vadesi geçti - ₺95,000", level: "urgent" },
              { type: "Teslimat", client: "Getir", message: "TikTok kreatifler deadline bugün", level: "warning" },
              { type: "Sözleşme", client: "Boyner", message: "Sözleşme 2 ay içinde bitiyor", level: "info" },
            ].map((alert, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`w-4 h-4 ${alert.level === 'urgent' ? 'text-red-500' : alert.level === 'warning' ? 'text-orange-500' : 'text-blue-500'}`} />
                  <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                  <span className="text-sm font-medium">{alert.client}</span>
                </div>
                <p className="text-sm text-[#A0A0A0]">{alert.message}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Ekip Durumu</h3>
          <div className="space-y-3">
            {[
              { role: "Project Manager", name: "1 kişi", tasks: 12, overdue: 0 },
              { role: "Performance Specialist", name: "2 kişi", tasks: 34, overdue: 0 },
              { role: "Social Media", name: "1 kişi", tasks: 24, overdue: 1 },
              { role: "Designer", name: "1 kişi", tasks: 15, overdue: 0 },
              { role: "Developer", name: "1 kişi", tasks: 11, overdue: 0 },
            ].map((team, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{team.role}</p>
                  <p className="text-xs text-[#A0A0A0]">{team.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{team.tasks}</p>
                    <p className="text-xs text-[#A0A0A0]">Açık görev</p>
                  </div>
                  {team.overdue > 0 && (
                    <Badge variant="destructive" className="text-xs">{team.overdue} gecikti</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Bugünkü Öncelikler</h3>
          </div>
          <div className="space-y-2">
            {[
              { task: "XYZ Holding ödeme takibi", time: "09:00" },
              { task: "Yeni müşteri onboarding toplantısı", time: "14:00" },
              { task: "Haftalık ekip değerlendirmesi", time: "16:30" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                <p className="text-sm">{item.task}</p>
                <span className="text-xs text-[#AAFF01]">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Onay Bekleyenler</h3>
          </div>
          <div className="space-y-2">
            {[
              { type: "Harcama", amount: "₺12,500", desc: "Reklam yatırımı onayı" },
              { type: "İşe Alım", amount: "-", desc: "Yeni Designer başvurusu" },
              { type: "Sözleşme", amount: "₺45,000/ay", desc: "GHI Holding teklifi" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  {item.amount !== "-" && <span className="text-xs text-[#AAFF01]">{item.amount}</span>}
                </div>
                <p className="text-sm text-[#A0A0A0]">{item.desc}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">Tüm Onaylar</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
          </div>
          <div className="space-y-3">
            {[
              { action: "Yeni müşteri eklendi", detail: "JKL Corporation", time: "15 dk önce" },
              { action: "Kampanya onaylandı", detail: "Meta ADS - ABC Corp", time: "1 saat önce" },
              { action: "Ödeme alındı", detail: "₺25,000 - XYZ Holding", time: "2 saat önce" },
            ].map((activity, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-1">{activity.action}</p>
                <p className="text-xs text-[#A0A0A0] mb-1">{activity.detail}</p>
                <p className="text-xs text-[#AAFF01]">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
