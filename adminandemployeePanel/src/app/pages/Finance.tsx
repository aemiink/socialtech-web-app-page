import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { clients as clientData, projects } from "../data/mockData";

const totalMonthlyRevenue = clientData.reduce((sum, c) => sum + c.monthlyValue, 0);
const totalProjectRevenue = projects.reduce((sum, p) => sum + p.budget, 0);
const overdueClients = clientData.filter(c => c.paymentStatus === "overdue");
const pendingClients = clientData.filter(c => c.paymentStatus === "pending");

const clientsFormatted = clientData.map(client => ({
  client: client.name,
  industry: client.industry,
  monthlyAmount: `₺${client.monthlyValue.toLocaleString('tr-TR')}`,
  projectAmount: client.activeProjects > 0 ? `₺${(client.monthlyValue * 2).toLocaleString('tr-TR')}` : "-",
  paymentStatus: client.paymentStatus === "paid" ? "Ödendi" : client.paymentStatus === "overdue" ? "Gecikti" : "Bekliyor",
  lastPayment: "15 Nisan 2026",
  nextPayment: "15 Mayıs 2026"
}));

const serviceRevenue = [
  { service: "Sosyal Medya Yönetimi", revenue: "₺186K", percentage: 38 },
  { service: "Growth & Hub", revenue: "₺145K", percentage: 30 },
  { service: "Meta ADS", revenue: "₺98K", percentage: 20 },
  { service: "Web APP", revenue: "₺124K", percentage: 26 },
  { service: "Google ADS", revenue: "₺87K", percentage: 18 },
  { service: "Diğer Hizmetler", revenue: "₺132K", percentage: 27 },
];

export function Finance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Finans</h1>
        <p className="text-[#A0A0A0]">Admin finans genel bakış</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Retainer Geliri</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">₺{Math.round(totalMonthlyRevenue / 1000)}K</div>
          <p className="text-xs text-[#A0A0A0] mt-1">Aylık düzenli</p>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Proje Geliri</span>
          </div>
          <div className="text-2xl font-semibold text-blue-400">₺{Math.round(totalProjectRevenue / 1000)}K</div>
          <p className="text-xs text-[#A0A0A0] mt-1">Tek seferlik</p>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Bekleyen Ödeme</span>
          </div>
          <div className="text-2xl font-semibold">₺{pendingClients.reduce((sum, c) => sum + c.monthlyValue, 0).toLocaleString('tr-TR')}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Geciken Ödeme</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">₺45K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Tahsilat Riski</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">₺28K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aylık Büyüme</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">+12%</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Aylık Gelir Trendi</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[420, 445, 438, 462, 475, 487].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#AAFF01] rounded-t-lg transition-all hover:bg-[#AAFF01]/80"
                  style={{ height: `${(value / 500) * 100}%` }}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  {['Kas', 'Ara', 'Oca', 'Şub', 'Mar', 'Nis'][i]}
                </p>
                <p className="text-xs font-medium">₺{value}K</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Revenue Breakdown */}
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Hizmet Bazlı Gelir</h3>
          <div className="space-y-4">
            {serviceRevenue.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#A0A0A0]">{item.service}</span>
                  <span className="font-medium text-[#AAFF01]">{item.revenue}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#AAFF01]" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Client Revenue Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold">Müşteri Gelir Tablosu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sektör</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Retainer (Aylık)</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Proje (Tek Seferlik)</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Ödeme Durumu</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Son Ödeme</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sonraki Ödeme</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {clientsFormatted.map((client, i) => (
                <tr key={i} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{client.client}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.industry}</td>
                  <td className="p-4 text-sm font-medium text-[#AAFF01]">{client.monthlyAmount}</td>
                  <td className="p-4 text-sm font-medium text-blue-400">{client.projectAmount}</td>
                  <td className="p-4">
                    <Badge variant={
                      client.paymentStatus === "Ödendi" ? "default" :
                      client.paymentStatus === "Gecikti" ? "destructive" :
                      "secondary"
                    } className={client.paymentStatus === "Ödendi" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                      {client.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.lastPayment}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.nextPayment}</td>
                  <td className="p-4">
                    {client.paymentStatus === "Gecikti" && (
                      <Button size="sm" variant="outline">Hatırlat</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Profitability Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-[#AAFF01]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <h4 className="font-semibold">En Karlı Müşteri</h4>
          </div>
          <p className="text-lg font-semibold mb-1">GHI Teknoloji</p>
          <p className="text-sm text-[#A0A0A0]">₺97,000 toplam (retainer + proje)</p>
          <p className="text-xs text-[#AAFF01] mt-2">Yüksek margin, düşük operasyon maliyeti</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-orange-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold">Düşük Margin Hizmet</h4>
          </div>
          <p className="text-lg font-semibold mb-1">Teknik Destek</p>
          <p className="text-sm text-[#A0A0A0]">₺48K gelir, yüksek zaman maliyeti</p>
          <p className="text-xs text-orange-500 mt-2">Fiyatlandırma revizyonu önerilir</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#202020] border-red-500/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold">Ödeme Riski</h4>
          </div>
          <p className="text-lg font-semibold mb-1">DEF Medya</p>
          <p className="text-sm text-[#A0A0A0]">15 gün gecikmiş ödeme</p>
          <p className="text-xs text-red-500 mt-2">Hizmet askıya alınma riski</p>
        </Card>
      </div>
    </div>
  );
}
