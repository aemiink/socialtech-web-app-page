import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { FolderKanban, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { projects, clients } from "../data/mockData";

const activeProjects = projects.filter(p => p.status === "in-progress");
const planningProjects = projects.filter(p => p.status === "planning");
const completedProjects = projects.filter(p => p.status === "completed");

export function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Projeler</h1>
          <p className="text-[#A0A0A0]">Proje tabanlı hizmetleri yönetin</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Proje Oluştur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FolderKanban className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Devam Eden</span>
          </div>
          <div className="text-2xl font-semibold">{activeProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Planlama</span>
          </div>
          <div className="text-2xl font-semibold">{planningProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{completedProjects.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Kritik</span>
          </div>
          <div className="text-2xl font-semibold">{projects.filter(p => p.priority === "critical").length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FolderKanban className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Bütçe</span>
          </div>
          <div className="text-2xl font-semibold">₺{Math.round(projects.reduce((sum, p) => sum + p.budget, 0) / 1000)}K</div>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="bg-[#1A1A1A] border-white/[0.06] p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Badge variant={
                    project.status === "completed" ? "default" :
                    project.status === "in-progress" ? "secondary" :
                    "outline"
                  } className={project.status === "completed" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                    {project.status === "in-progress" ? "Devam Ediyor" :
                     project.status === "completed" ? "Tamamlandı" :
                     "Planlama"}
                  </Badge>
                  {project.priority === "critical" && (
                    <Badge variant="destructive" className="text-xs">Kritik</Badge>
                  )}
                  {project.priority === "high" && (
                    <Badge variant="default" className="text-xs bg-orange-500">Yüksek Öncelik</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                  <span>{project.client}</span>
                  <span>•</span>
                  <span>{project.service}</span>
                  <span>•</span>
                  <span>Sorumlu: {project.assignedTo.join(", ")}</span>
                </div>
              </div>
              <Link to={`/projeler/${project.id}`}>
                <Button size="sm" variant="outline">Detay</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Bütçe</p>
                <p className="font-medium">₺{project.budget.toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Harcanan</p>
                <p className="font-medium">₺{project.spent.toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Başlangıç</p>
                <p className="font-medium">{new Date(project.startDate).toLocaleDateString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Bitiş</p>
                <p className="font-medium">{new Date(project.endDate).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A0A0A0]">İlerleme</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
