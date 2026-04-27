import { useParams, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Users, DollarSign, Calendar } from "lucide-react";

export function ServiceDetail() {
  const { id } = useParams();

  const clients = [
    { name: "XYZ Holding", status: "Aktif", responsible: "Ahmet K.", startDate: "15 Ocak 2024", pendingAction: "Rapor hazırlama" },
    { name: "ABC Corporation", status: "Aktif", responsible: "Zeynep Y.", startDate: "03 Şubat 2024", pendingAction: "-" },
    { name: "DEF Medya", status: "Beklemede", responsible: "Mehmet A.", startDate: "20 Mart 2024", pendingAction: "Müşteri yanıtı bekleniyor" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/hizmetler">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold">Sosyal Medya Yönetimi</h1>
            <Badge className="bg-blue-500/20 text-blue-400">Social</Badge>
          </div>
          <p className="text-[#A0A0A0]">Hizmet detayları ve iş akışı</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Müşteri</span>
          </div>
          <div className="text-2xl font-semibold">28</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aylık Gelir</span>
          </div>
          <div className="text-2xl font-semibold text-[#AAFF01]">₺186K</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Açık Görev</span>
          </div>
          <div className="text-2xl font-semibold">45</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Sorumlu Ekip</span>
          </div>
          <div className="text-lg font-semibold">Social Team</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Clients Using This Service */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Bu Hizmeti Kullanan Müşteriler</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#202020]">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                    <th className="text-left p-3 text-sm font-medium text-[#A0A0A0]">Durum</th>
                    <th className="text-left p-3 text-sm font-medium text-[#A0A0A0]">Sorumlu</th>
                    <th className="text-left p-3 text-sm font-medium text-[#A0A0A0]">Başlangıç</th>
                    <th className="text-left p-3 text-sm font-medium text-[#A0A0A0]">Bekleyen Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, i) => (
                    <tr key={i} className="border-t border-white/[0.06]">
                      <td className="p-3">{client.name}</td>
                      <td className="p-3">
                        <Badge variant={client.status === "Aktif" ? "default" : "secondary"} className={client.status === "Aktif" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{client.responsible}</td>
                      <td className="p-3 text-sm text-[#A0A0A0]">{client.startDate}</td>
                      <td className="p-3 text-sm">{client.pendingAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Standard Workflow */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Standart İş Akışı</h3>
            <div className="space-y-3">
              {["Brief", "İçerik Planlaması", "İçerik Üretimi", "Onay", "Yayınlama", "Raporlama"].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#AAFF01] text-[#131313] flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Task Templates */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Görev Şablonları</h3>
            <div className="space-y-2">
              {["Haftalık içerik planı", "İçerik üretimi", "Müşteri onayı", "Aylık rapor"].map((template, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 text-sm">
                  {template}
                </div>
              ))}
            </div>
          </Card>

          {/* Deliverables */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Teslimatlar</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                <span>Aylık içerik planı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                <span>Haftalık içerik üretimi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                <span>Aylık performans raporu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                <span>Strateji önerileri</span>
              </div>
            </div>
          </Card>

          {/* Team Responsibilities */}
          <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold mb-4">Ekip Sorumlulukları</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="font-medium text-sm mb-1">Social Media Specialist</p>
                <p className="text-xs text-[#A0A0A0]">İçerik üretimi ve yayınlama</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="font-medium text-sm mb-1">Designer</p>
                <p className="text-xs text-[#A0A0A0]">Görsel tasarım</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="font-medium text-sm mb-1">Project Manager</p>
                <p className="text-xs text-[#A0A0A0]">Koordinasyon ve raporlama</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
