import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { clients, projects } from "../../data/mockData";

const activeClients = clients.filter(c => c.status === "active");
const riskyClients = clients.filter(c => c.riskLevel === "high" || c.riskLevel === "medium");
const activeProjects = projects.filter(p => p.status === "in-progress");

export function Musterilerim() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Müşterilerim</h1>
        <p className="text-[#A0A0A0]">Sorumlu olduğum müşteriler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">{activeClients.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Proje</span>
          </div>
          <div className="text-2xl font-semibold">{activeProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Dikkat Gerekli</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{riskyClients.length}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hizmetler</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Açık Görev</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Son İletişim</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium">{client.name}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{client.services.join(", ")}</td>
                  <td className="p-4">
                    <Badge variant="outline">{client.activeProjects} proje</Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">1 gün önce</td>
                  <td className="p-4">
                    <Badge variant={client.riskLevel === "low" ? "default" : "destructive"} className={client.riskLevel === "low" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                      {client.riskLevel === "low" ? "Aktif" : "Dikkat"}
                    </Badge>
                  </td>
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
