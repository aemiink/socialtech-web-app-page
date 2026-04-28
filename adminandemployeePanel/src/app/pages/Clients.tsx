import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router";
import { Users, TrendingUp, AlertTriangle, UserPlus, Search, Filter, X, DollarSign } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { clients as clientData } from "../data/mockData";

const riskyClients = clientData.filter(c => c.riskLevel === "high" || c.riskLevel === "medium");

const kpiCards = [
  { label: "Toplam Müşteri", value: clientData.length.toString(), icon: Users, color: "text-white" },
  { label: "Aktif Müşteri", value: clientData.filter(c => c.status === "active").length.toString(), icon: TrendingUp, color: "text-[#AAFF01]" },
  { label: "Riskli Müşteri", value: riskyClients.length.toString(), icon: AlertTriangle, color: "text-orange-500" },
  { label: "Bu Ay Yeni", value: "2", icon: UserPlus, color: "text-blue-500" },
];

const clientsFormatted = clientData.map(client => ({
  id: client.id,
  name: client.name,
  services: client.services,
  industry: client.industry,
  responsible: client.contactPerson.split(' ')[0] + " " + client.contactPerson.split(' ')[1][0] + ".",
  status: client.riskLevel === "high" ? "Riskli" : client.riskLevel === "medium" ? "Dikkat" : "Aktif",
  lastActivity: "1 gün önce",
  pendingAction: client.paymentStatus === "overdue" ? "Ödeme takibi" : client.riskLevel === "medium" ? "Onay bekleniyor" : "-",
  paymentStatus: client.paymentStatus === "paid" ? "Ödendi" : client.paymentStatus === "overdue" ? "Gecikti" : "Bekliyor",
  monthlyValue: `₺${client.monthlyValue.toLocaleString('tr-TR')}`,
  lastReport: client.services[0] + " - Nisan 2026",
  activeProjects: client.activeProjects
}));

export function Clients() {
  const [selectedClient, setSelectedClient] = useState<typeof clientsFormatted[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Müşteriler</h1>
          <p className="text-[#A0A0A0]">Tüm müşterileri yönetin</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <UserPlus className="w-4 h-4" />
          Yeni Müşteri Ekle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-[#1A1A1A] border-white/[0.06] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-semibold mb-1">{kpi.value}</div>
              <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[240px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <Input placeholder="Müşteri ara..." className="pl-10 bg-[#202020] border-white/[0.06]" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-[#202020] border-white/[0.06]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="riskli">Riskli</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="pasif">Pasif</SelectItem>
            </SelectContent>
          </Select>

          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="w-[160px] bg-[#202020] border-white/[0.06]">
              <SelectValue placeholder="Paket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Paketler</SelectItem>
              <SelectItem value="scale">Growth Scale</SelectItem>
              <SelectItem value="hub">Growth Hub</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Daha Fazla Filtre
          </Button>

          {(statusFilter !== "all" || packageFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setPackageFilter("all"); }} className="gap-1">
              <X className="w-3 h-3" />
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Firma</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Aktif Hizmetler</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Sektör</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Aylık Değer</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Ödeme Durumu</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Bekleyen Aksiyon</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {clientsFormatted.map((client) => (
                <tr key={client.id} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{client.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {client.services.slice(0, 2).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {client.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.industry}</td>
                  <td className="p-4 text-sm font-medium">{client.monthlyValue}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        client.status === "Aktif" ? "default" :
                        client.status === "Riskli" ? "destructive" :
                        "secondary"
                      }
                      className={client.status === "Aktif" ? "bg-[#AAFF01] text-[#131313]" : ""}
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        client.paymentStatus === "Ödendi" ? "default" :
                        client.paymentStatus === "Gecikti" ? "destructive" :
                        "secondary"
                      }
                      className={client.paymentStatus === "Ödendi" ? "bg-[#AAFF01] text-[#131313]" : ""}
                    >
                      {client.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.pendingAction}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedClient(client)}>Önizle</Button>
                      <Link to={`/musteriler/${client.id}`}>
                        <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Detay</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Preview Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="bg-[#1A1A1A] border-l border-white/[0.06] w-[500px]">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedClient.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={selectedClient.status === "Aktif" ? "default" : "destructive"}
                    className={selectedClient.status === "Aktif" ? "bg-[#AAFF01] text-[#131313]" : ""}
                  >
                    {selectedClient.status}
                  </Badge>
                  <Badge variant="outline">{selectedClient.activeProjects} aktif proje</Badge>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-[#202020] border-white/[0.06] p-4">
                    <p className="text-xs text-[#A0A0A0] mb-1">Aylık Değer</p>
                    <p className="text-lg font-semibold text-[#AAFF01]">{selectedClient.monthlyValue}</p>
                  </Card>
                  <Card className="bg-[#202020] border-white/[0.06] p-4">
                    <p className="text-xs text-[#A0A0A0] mb-1">Sorumlu</p>
                    <p className="text-lg font-semibold">{selectedClient.responsible}</p>
                  </Card>
                </div>

                {/* Active Services */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Aktif Hizmetler</h4>
                  <div className="space-y-2">
                    {selectedClient.services.map((service, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#202020] border border-white/[0.06]">
                        <p className="text-sm font-medium">{service}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Report */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Son Rapor</h4>
                  <Card className="bg-[#202020] border-white/[0.06] p-3">
                    <p className="text-sm">{selectedClient.lastReport}</p>
                    <p className="text-xs text-[#A0A0A0] mt-1">Müşteriye gönderildi</p>
                  </Card>
                </div>

                {/* Pending Actions */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Bekleyen Aksiyon</h4>
                  <Card className="bg-[#202020] border-white/[0.06] p-3">
                    <p className="text-sm">{selectedClient.pendingAction || "Bekleyen aksiyon yok"}</p>
                  </Card>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <Link to={`/musteriler/${selectedClient.id}`}>
                    <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                      Müşteri Detayına Git
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
