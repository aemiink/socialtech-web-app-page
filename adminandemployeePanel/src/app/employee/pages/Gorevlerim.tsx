import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { CheckSquare, AlertCircle, Clock, FileText } from "lucide-react";
import { tasks } from "../../data/mockData";

const inProgressTasks = tasks.filter(t => t.status === "in-progress");
const reviewTasks = tasks.filter(t => t.status === "review");

export function Gorevlerim() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Görevlerim</h1>
        <p className="text-[#A0A0A0]">Bana atanan tüm görevler</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bugünkü Görev</span>
          </div>
          <div className="text-2xl font-semibold">{tasks.filter(t => new Date(t.deadline).toDateString() === new Date('2026-04-28').toDateString()).length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Geciken Görev</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">0</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Hafta Teslim</span>
          </div>
          <div className="text-2xl font-semibold">{tasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-[#A0A0A0]">İncelemede</span>
          </div>
          <div className="text-2xl font-semibold">{reviewTasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">28</div>
        </Card>
      </div>

      {/* Task Table */}
      <Card className="bg-[#1A1A1A] border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Görev</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Müşteri</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Hizmet</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Öncelik</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Deadline</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0A0]"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t border-white/[0.06] hover:bg-white/5">
                  <td className="p-4 font-medium">{task.title}</td>
                  <td className="p-4 text-sm">{task.client}</td>
                  <td className="p-4 text-sm">{task.project}</td>
                  <td className="p-4">
                    <Badge variant={task.priority === "critical" ? "destructive" : task.priority === "high" ? "default" : "secondary"}>
                      {task.priority === "critical" ? "Kritik" : task.priority === "high" ? "Yüksek" : "Normal"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{new Date(task.deadline).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4">
                    <Badge variant="outline">
                      {task.status === "in-progress" ? "Devam Ediyor" :
                       task.status === "review" ? "İncelemede" :
                       task.status === "pending" ? "Bekliyor" : "Tamamlandı"}
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
