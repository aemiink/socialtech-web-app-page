import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Briefcase, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { projects } from "../../data/mockData";

export function Projeler() {
  const activeProjects = projects.filter(p => p.status === "in-progress");
  const plannedProjects = projects.filter(p => p.status === "planning");
  const completedProjects = projects.filter(p => p.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Projelerim</h1>
        <p className="text-[#A0A0A0]">Atandığım aktif ve planlanan projeler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Proje</span>
          </div>
          <div className="text-2xl font-semibold">{projects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Eden</span>
          </div>
          <div className="text-2xl font-semibold text-blue-500">{activeProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Planlama</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{plannedProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{completedProjects.length}</div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Proje Listesi</h3>
          <Button size="sm" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Yeni Proje</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Proje Adı</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hizmet</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">İlerleme</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Bitiş</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{project.client}</td>
                  <td className="p-4 text-sm">{project.service}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5 w-24">
                        <div
                          className="h-1.5 rounded-full bg-[#AAFF01]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#A0A0A0]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    {new Date(project.endDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        project.status === "completed"
                          ? "default"
                          : project.status === "in-progress"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {project.status === "in-progress"
                        ? "Devam Ediyor"
                        : project.status === "planning"
                        ? "Planlama"
                        : "Tamamlandı"}
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
