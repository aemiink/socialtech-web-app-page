import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { CheckSquare, AlertCircle, Clock, Plus, Filter } from "lucide-react";
import { tasks } from "../data/mockData";

const inProgressTasks = tasks.filter(t => t.status === "in-progress");
const pendingTasks = tasks.filter(t => t.status === "pending");
const reviewTasks = tasks.filter(t => t.status === "review");

export function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Görevler</h1>
          <p className="text-[#A0A0A0]">Tüm görevleri yönetin</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Görev Oluştur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Görev</span>
          </div>
          <div className="text-2xl font-semibold">{tasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Devam Ediyor</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{inProgressTasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">İncelemede</span>
          </div>
          <div className="text-2xl font-semibold">{reviewTasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bekliyor</span>
          </div>
          <div className="text-2xl font-semibold">{pendingTasks.length}</div>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrele
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Görev</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Proje</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Atanan</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const daysUntilDeadline = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <tr key={task.id} className="border-t border-white/[0.06] hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium mb-1">{task.title}</div>
                      <p className="text-xs text-[#A0A0A0]">{task.description}</p>
                    </td>
                    <td className="p-4 text-sm">{task.client}</td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{task.project}</td>
                    <td className="p-4 text-sm">{task.assignedTo}</td>
                    <td className="p-4">
                      <Badge variant={
                        task.priority === "critical" ? "destructive" :
                        task.priority === "high" ? "default" :
                        "secondary"
                      } className={task.priority === "high" ? "bg-orange-500" : ""}>
                        {task.priority === "critical" ? "Kritik" :
                         task.priority === "high" ? "Yüksek" :
                         "Normal"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-medium">{new Date(task.deadline).toLocaleDateString('tr-TR')}</p>
                        <p className={`text-xs ${daysUntilDeadline <= 1 ? 'text-red-500' : 'text-[#A0A0A0]'}`}>
                          {daysUntilDeadline <= 0 ? 'Gecikti' : `${daysUntilDeadline} gün kaldı`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        task.status === "completed" ? "default" :
                        task.status === "in-progress" ? "secondary" :
                        task.status === "review" ? "outline" :
                        "outline"
                      } className={task.status === "completed" ? "bg-[#AAFF01] text-[#131313]" : ""}>
                        {task.status === "in-progress" ? "Devam Ediyor" :
                         task.status === "review" ? "İncelemede" :
                         task.status === "pending" ? "Bekliyor" :
                         "Tamamlandı"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Link to={`/gorevler/${task.id}`}>
                        <Button size="sm" variant="outline">Detay</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
