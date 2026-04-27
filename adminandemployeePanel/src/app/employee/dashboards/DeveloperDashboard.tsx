import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Code, Zap, Bug, Rocket, FolderKanban, GitBranch, CheckSquare, AlertCircle } from "lucide-react";

export function DeveloperDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Developer Dashboard</h1>
        <p className="text-[#A0A0A0]">Yazılım geliştirme ve proje yönetimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FolderKanban className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Sprint</span>
          </div>
          <div className="text-2xl font-semibold">3</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Code className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Açık Task</span>
          </div>
          <div className="text-2xl font-semibold">15</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Bug className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Kritik Bug</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">4</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Test Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">6</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Sprint Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">12</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Aktif Sprintler</h3>
          <div className="space-y-3">
            {[
              { client: "ABC Corp", project: "E-commerce Web APP", sprint: "Sprint 12", progress: 65, tasks: "13/20", deadline: "30 Nisan" },
              { client: "GHI Teknoloji", project: "CRM Dashboard", sprint: "Sprint 5", progress: 40, tasks: "8/15", deadline: "4 Mayıs" },
              { client: "XYZ Holding", project: "Landing Page Builder", sprint: "Sprint 3", progress: 80, tasks: "12/14", deadline: "28 Nisan" },
            ].map((sprint, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{sprint.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{sprint.project}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{sprint.sprint}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-[#A0A0A0]">{sprint.tasks} task</span>
                  <span className="text-[#AAFF01]">{sprint.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                  <div className="bg-[#AAFF01] h-1.5 rounded-full" style={{ width: `${sprint.progress}%` }} />
                </div>
                <p className="text-xs text-[#A0A0A0]">Deadline: {sprint.deadline}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Kritik Buglar</h3>
          <div className="space-y-3">
            {[
              { client: "ABC Corp", title: "Checkout payment gateway hatası", severity: "Critical", assigned: "Sana atandı", reported: "2 saat önce" },
              { client: "GHI Teknoloji", title: "Dashboard loading infinite loop", severity: "High", assigned: "Sana atandı", reported: "5 saat önce" },
              { client: "XYZ Holding", title: "Form validation bypass sorunu", severity: "Critical", assigned: "Sana atandı", reported: "1 gün önce" },
            ].map((bug, i) => (
              <div key={i} className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">{bug.severity}</Badge>
                  <span className="text-sm font-medium">{bug.client}</span>
                </div>
                <p className="text-sm mb-2">{bug.title}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A0A0A0]">{bug.assigned}</span>
                  <span className="text-red-500">{bug.reported}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-red-500 text-white hover:bg-red-600">Bug Çözmeye Başla</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Aktif Branch'ler</h3>
          </div>
          <div className="space-y-2">
            {[
              { branch: "feature/payment-integration", project: "ABC Corp", commits: 8, pr: "open" },
              { branch: "bugfix/dashboard-loading", project: "GHI Teknoloji", commits: 3, pr: "review" },
              { branch: "feature/form-builder", project: "XYZ Holding", commits: 12, pr: "merged" },
            ].map((branch, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium font-mono text-[#AAFF01]">{branch.branch}</p>
                  <Badge variant={branch.pr === 'open' ? 'outline' : branch.pr === 'review' ? 'default' : 'secondary'} className="text-xs">
                    {branch.pr === 'open' ? 'PR Open' : branch.pr === 'review' ? 'In Review' : 'Merged'}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{branch.project}</p>
                <p className="text-xs text-[#A0A0A0]">{branch.commits} commits</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Test & Yayın</h3>
          </div>
          <div className="space-y-2">
            {[
              { project: "ABC Corp - E-commerce", env: "Staging", status: "ready", tests: "18/18 passed" },
              { project: "GHI Teknoloji - CRM", env: "Testing", status: "testing", tests: "12/15 passed" },
              { project: "XYZ Holding - LP", env: "Production", status: "deployed", tests: "All passed" },
            ].map((deploy, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{deploy.project}</p>
                  <Badge variant={deploy.status === 'deployed' ? 'default' : deploy.status === 'ready' ? 'secondary' : 'outline'} className="text-xs">
                    {deploy.env}
                  </Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-1">{deploy.tests}</p>
                {deploy.status === 'ready' && (
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-7">Deploy to Production</Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Bugünkü Tasklar</h3>
          </div>
          <div className="space-y-2">
            {[
              { task: "Payment API integration", project: "ABC Corp", estimate: "4h", priority: "high" },
              { task: "Dashboard loading fix", project: "GHI Teknoloji", estimate: "2h", priority: "critical" },
              { task: "Form validation review", project: "XYZ Holding", estimate: "1h", priority: "normal" },
            ].map((task, i) => (
              <div key={i} className={`p-3 rounded-lg ${task.priority === 'critical' ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{task.task}</p>
                  {task.priority === 'critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A0A0A0]">{task.project}</span>
                  <span className="text-[#AAFF01]">{task.estimate}</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Tüm Tasklar</Button>
        </Card>
      </div>
    </div>
  );
}
