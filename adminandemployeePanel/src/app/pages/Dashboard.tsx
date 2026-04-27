import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Users, Briefcase, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown, Calendar, FileText, AlertTriangle } from "lucide-react";
import { clients, employees, projects, tasks, approvals } from "../data/mockData";

const activeClients = clients.filter(c => c.status === "active").length;
const totalMonthlyRevenue = clients.reduce((sum, c) => sum + c.monthlyValue, 0);
const activeProjects = projects.filter(p => p.status === "in-progress").length;
const pendingApprovals = approvals.filter(a => a.status === "pending").length;
const activeTasks = tasks.length;
const overdueTasks = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== "completed").length;

const kpiCards = [
  { label: "Aktif Müşteri", value: activeClients.toString(), icon: Users, trend: "+2", color: "text-[#AAFF01]" },
  { label: "Aktif Proje", value: activeProjects.toString(), icon: Briefcase, trend: "+3", color: "text-[#AAFF01]" },
  { label: "Aylık Gelir", value: `₺${Math.round(totalMonthlyRevenue / 1000)}K`, icon: DollarSign, trend: "+8%", color: "text-[#AAFF01]" },
  { label: "Bekleyen Onay", value: pendingApprovals.toString(), icon: AlertCircle, trend: "-1", color: "text-orange-500" },
  { label: "Açık Görev", value: activeTasks.toString(), icon: CheckCircle, trend: "-4", color: "text-white" },
  { label: "Geciken İş", value: overdueTasks.toString(), icon: Clock, trend: "-2", color: "text-red-500" },
];

const riskyClientsList = clients.filter(c => c.riskLevel === "high" || c.riskLevel === "medium");

const operationHealth = [
  { label: "Zamanında İlerleyen", value: "87%", status: "success", icon: TrendingUp },
  { label: "Riskli Müşteri", value: riskyClientsList.length.toString(), status: "warning", icon: AlertCircle },
  { label: "Müşteri Yanıtı Beklenen", value: "2", status: "info", icon: Clock },
  { label: "İç Ekipte Bekleyen", value: pendingApprovals.toString(), status: "info", icon: Users },
];

const todayActivity = [
  { time: "14:00", type: "Toplantı", title: "Koçtaş Aylık Değerlendirme", responsible: "Ahmet Yıldırım" },
  { time: "11:00", type: "Sprint Review", title: "Türk Telekom - Sprint 8 Tamamlama", responsible: "Can Arslan" },
  { time: "15:30", type: "Brief", title: "Getir - Mayıs Kampanya Kreatif Brief", responsible: "Mehmet Demir" },
  { time: "18:00", type: "Teslimat", title: "Koçtaş - Meta ADS Kreatif Setleri", responsible: "Ayşe Özkan" },
];

const riskyClientsData = [
  { client: "Migros", reason: "Ödeme 12 gün gecikti (₺95,000)", responsible: "Ahmet Yıldırım", lastActivity: "1 gün önce", status: "critical" },
  { client: "LC Waikiki", reason: "Onay süreci gecikmeli", responsible: "Mehmet Demir", lastActivity: "3 gün önce", status: "warning" },
];

const teamWorkload = [
  { name: "Ahmet Yıldırım", role: "Project Manager", active: 12, late: 0, status: "normal" },
  { name: "Elif Kara", role: "Performance Specialist", active: 18, late: 0, status: "high" },
  { name: "Mehmet Demir", role: "Social Media Specialist", active: 24, late: 1, status: "high" },
  { name: "Ayşe Özkan", role: "Designer", active: 15, late: 0, status: "normal" },
  { name: "Can Arslan", role: "Developer", active: 11, late: 0, status: "normal" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-[#A0A0A0]">Social Tech ajans operasyonlarına genel bakış</p>
      </div>

      {/* Agency Health Score */}
      <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-white/[0.06] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Operasyon Sağlığı</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-[#AAFF01]">82</span>
              <span className="text-3xl text-[#A0A0A0]">/100</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-[#A0A0A0]">5 geciken görev</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span className="text-[#A0A0A0]">3 müşteri yanıtı bekliyor</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-[#AAFF01]" />
              <span className="text-[#A0A0A0]">92% zamanında teslimat</span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-[#1A1A1A] border-white/[0.06] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm ${kpi.trend.startsWith('+') ? 'text-[#AAFF01]' : 'text-red-500'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="text-2xl font-semibold mb-1">{kpi.value}</div>
              <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operation Health */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Operasyon Sağlığı</h3>
          <div className="space-y-4">
            {operationHealth.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${
                      item.status === 'success' ? 'text-[#AAFF01]' :
                      item.status === 'warning' ? 'text-orange-500' :
                      'text-blue-500'
                    }`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-lg font-semibold">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today's Command Center */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            Bugünkü Komuta Merkezi
          </h3>
          <div className="space-y-3">
            {todayActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-sm text-[#AAFF01] font-medium min-w-[60px]">{item.time}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Sorumlu: {item.responsible}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-xs">Görüntüle</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Risky Clients */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Riskli Müşteriler
          </h3>
          <Badge variant="destructive">{riskyClientsData.length} Müşteri</Badge>
        </div>
        <div className="space-y-3">
          {riskyClientsData.map((client, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-2 h-2 rounded-full ${
                  client.status === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                }`} />
                <div className="flex-1">
                  <p className="font-medium mb-1">{client.client}</p>
                  <p className="text-sm text-[#A0A0A0]">{client.reason}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-[#A0A0A0] text-xs">Sorumlu</p>
                  <p className="font-medium">{client.responsible}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-[#A0A0A0] text-xs">Son Aktivite</p>
                  <p className="font-medium">{client.lastActivity}</p>
                </div>
              </div>
              <Button size="sm" className="ml-4 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">İncele</Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Ekip Yoğunluğu</h3>
          <div className="space-y-3">
            {teamWorkload.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex-1">
                  <p className="font-medium mb-1">{member.name}</p>
                  <p className="text-xs text-[#A0A0A0]">{member.role}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-[#A0A0A0]">Aktif: </span>
                    <span className="font-medium">{member.active}</span>
                  </div>
                  <div>
                    <span className="text-[#A0A0A0]">Geciken: </span>
                    <span className={`font-medium ${member.late > 0 ? 'text-red-500' : 'text-[#AAFF01]'}`}>
                      {member.late}
                    </span>
                  </div>
                  <Badge variant={member.status === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {member.status === 'high' ? 'Yoğun' : 'Normal'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 h-auto py-6 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Yeni Müşteri Ekle</span>
            </Button>
            <Button className="bg-[#202020] hover:bg-[#2A2A2A] h-auto py-6 flex-col gap-2">
              <CheckCircle className="w-6 h-6" />
              <span>Görev Oluştur</span>
            </Button>
            <Button className="bg-[#202020] hover:bg-[#2A2A2A] h-auto py-6 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Rapor Oluştur</span>
            </Button>
            <Button className="bg-[#202020] hover:bg-[#2A2A2A] h-auto py-6 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span>Toplantı Planla</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
