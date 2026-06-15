import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Image, LayoutDashboard, FileText, Rocket, Folder, Clock, CheckSquare } from "lucide-react";
import { useGetClientsQuery } from "../../features/clients/clientsApi";
import type { ClientProfile, ServiceKey } from "../../features/clients/clientsTypes";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import type { Project } from "../../features/projects/projectsTypes";
import { formatDate } from "../../features/projects/projectsUtils";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { Task } from "../../features/tasks/tasksTypes";
import { extractApiErrorMessage, getTaskStatusLabel } from "../../features/tasks/tasksUtils";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useAppSelector } from "../../store/hooks";

type PriorityTone = "urgent" | "high" | "normal";

type PriorityDesignItem = {
  id: string;
  client: string;
  type: string;
  format: string;
  count: number;
  deadline: string;
  priority: PriorityTone;
};

type RevisionItem = {
  id: string;
  client: string;
  project: string;
  revision: string;
  status: string;
  waiting: string;
};

type UiProjectItem = {
  id: string;
  client: string;
  project: string;
  progress: number;
  screens: string;
};

type BrandItem = {
  id: string;
  client: string;
  files: string;
  updated: string;
};

type DeliveryItem = {
  id: string;
  client: string;
  files: string;
  status: string;
  date: string;
};

const OPEN_TASK_STATUSES = new Set<Task["status"]>(["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"]);
const DESIGN_SERVICE_KEYS = new Set<ServiceKey>([
  "web-mobile-design",
  "social-media",
  "media-hub",
  "medya-hub",
  "meta-ads",
  "tiktok-ads",
  "amazon-ads",
  "google-ads",
  "web-app",
  "mobile-app",
  "landing-page",
  "landing-pages",
]);

const PRIORITY_RANK: Record<Task["priority"], number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function DesignerDashboard() {
  const currentUser = useAppSelector(selectCurrentUser);
  const clientsQuery = useGetClientsQuery(
    { status: "ACTIVE", limit: 50, sortBy: "updatedAt", sortOrder: "desc" },
    { skip: !currentUser },
  );
  const projectsQuery = useGetProjectsQuery(undefined, { skip: !currentUser });
  const tasksQuery = useGetTasksQuery(undefined, { skip: !currentUser });

  const clients = clientsQuery.data?.data ?? [];
  const projects = projectsQuery.data?.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];
  const designerTasks = tasks.filter((task) => isDesignerTask(task, currentUser?.id));
  const openDesignerTasks = designerTasks.filter((task) => OPEN_TASK_STATUSES.has(task.status));
  const revisionTasks = openDesignerTasks.filter(isRevisionTask);
  const deliveredTasks = designerTasks.filter((task) => task.status === "DONE");
  const priorityDesigns = buildPriorityDesigns(openDesignerTasks);
  const revisionItems = buildRevisionItems(revisionTasks);
  const uiProjectItems = buildUiProjectItems(projects, designerTasks);
  const brandItems = buildBrandItems(clients);
  const deliveryItems = buildDeliveryItems(deliveredTasks);

  const activeCreativeCount = openDesignerTasks.filter(isCreativeTask).length;
  const dueTodayCount = openDesignerTasks.filter((task) => isSameLocalDay(task.dueDate, new Date())).length;
  const completedThisMonthCount = deliveredTasks.filter((task) => isSameLocalMonth(task.updatedAt, new Date())).length;
  const isLoading = clientsQuery.isLoading || projectsQuery.isLoading || tasksQuery.isLoading;
  const isError = clientsQuery.isError || projectsQuery.isError || tasksQuery.isError;

  if (isLoading) {
    return (
      <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
        Designer profili yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        {extractApiErrorMessage(
          clientsQuery.error ?? projectsQuery.error ?? tasksQuery.error,
          "Designer profili alınamadı.",
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Designer Dashboard</h1>
        <p className="text-[#A0A0A0]">Tasarım yönetimi ve kreatif üretim</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Image className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Kreatif</span>
          </div>
          <div className="text-2xl font-semibold">{activeCreativeCount}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">{revisionTasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Bugün Teslim</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">{dueTodayCount}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Teslim Edildi</span>
          </div>
          <div className="text-2xl font-semibold">{deliveredTasks.length}</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Ay Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">{completedThisMonthCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Öncelikli Tasarımlar</h3>
          <div className="space-y-3">
            {priorityDesigns.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border ${item.priority === "urgent" ? "bg-red-500/10 border-red-500/30" : item.priority === "high" ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/[0.06]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{item.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{item.type}</p>
                  </div>
                  <Badge variant={item.priority === "urgent" ? "destructive" : item.priority === "high" ? "default" : "outline"} className="text-xs">
                    {item.count} tasarım
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A0A0A0]">{item.format}</span>
                  <span className={item.priority === "urgent" ? "text-red-500" : "text-[#AAFF01]"}>{item.deadline}</span>
                </div>
              </div>
            ))}
            {priorityDesigns.length === 0 ? <EmptyState text="Öncelikli tasarım görevi bulunmuyor." /> : null}
          </div>
          <Button className="w-full mt-4 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Tasarıma Başla</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Revizyon Talepleri</h3>
          <div className="space-y-3">
            {revisionItems.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.client}</h4>
                  <Badge variant="secondary" className="text-xs">{item.status}</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">{item.project}</p>
                <p className="text-sm mb-2">{item.revision}</p>
                <p className="text-xs text-orange-500">Bekleme: {item.waiting}</p>
              </div>
            ))}
            {revisionItems.length === 0 ? <EmptyState text="Açık revizyon talebi bulunmuyor." /> : null}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">UI Tasarım Projeleri</h3>
          </div>
          <div className="space-y-2">
            {uiProjectItems.map((ui) => (
              <div key={ui.id} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{ui.client}</p>
                  <span className="text-xs text-[#AAFF01]">{ui.progress}%</span>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">{ui.project}</p>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-[#AAFF01] h-1.5 rounded-full" style={{ width: `${ui.progress}%` }} />
                </div>
                <p className="text-xs text-[#A0A0A0] mt-1">{ui.screens}</p>
              </div>
            ))}
            {uiProjectItems.length === 0 ? <EmptyState text="UI tasarım projesi bulunmuyor." /> : null}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Projelere Git</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Marka Dosyaları</h3>
          </div>
          <div className="space-y-2">
            {brandItems.map((brand) => (
              <div key={brand.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <p className="text-sm font-medium mb-1">{brand.client}</p>
                <p className="text-xs text-[#A0A0A0] mb-1">{brand.files}</p>
                <p className="text-xs text-[#AAFF01]">{brand.updated}</p>
              </div>
            ))}
            {brandItems.length === 0 ? <EmptyState text="Atanmış aktif müşteri bulunmuyor." /> : null}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Teslim Dosyaları</h3>
          </div>
          <div className="space-y-2">
            {deliveryItems.map((delivery) => (
              <div key={delivery.id} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-1">{delivery.client}</p>
                <p className="text-xs text-[#A0A0A0] mb-2">{delivery.files}</p>
                <Badge variant="outline" className="text-xs mb-1">{delivery.status}</Badge>
                <p className="text-xs text-[#AAFF01]">{delivery.date}</p>
              </div>
            ))}
            {deliveryItems.length === 0 ? <EmptyState text="Teslim edilmiş tasarım görevi bulunmuyor." /> : null}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Tüm Teslimler</Button>
        </Card>
      </div>
    </div>
  );
}

function buildPriorityDesigns(tasks: Task[]): PriorityDesignItem[] {
  return [...tasks]
    .sort(compareTasksByPriorityAndDueDate)
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      client: getTaskClientName(task),
      type: getDesignTaskType(task),
      format: getDesignTaskFormat(task),
      count: Math.max(task.todos?.length ?? 1, 1),
      deadline: formatTaskDeadline(task.dueDate),
      priority: getTaskPriorityTone(task),
    }));
}

function buildRevisionItems(tasks: Task[]): RevisionItem[] {
  return [...tasks]
    .sort(compareTasksByPriorityAndDueDate)
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      client: getTaskClientName(task),
      project: task.title,
      revision: task.approvalResponseNote ?? task.description ?? task.title,
      status: getTaskStatusLabel(task.status),
      waiting: formatElapsed(task.updatedAt),
    }));
}

function buildUiProjectItems(projects: Project[], tasks: Task[]): UiProjectItem[] {
  return projects
    .filter((project) => isUiDesignProject(project) || tasks.some((task) => task.projectId === project.id && isDesignerTask(task)))
    .slice(0, 2)
    .map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const completedTasks = projectTasks.filter((task) => task.status === "DONE").length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : getProjectFallbackProgress(project);

      return {
        id: project.id,
        client: project.clientProfile?.companyName ?? "Müşteri yok",
        project: project.name,
        progress,
        screens: totalTasks > 0 ? `${completedTasks}/${totalTasks} görev` : getProjectStatusText(project),
      };
    });
}

function buildBrandItems(clients: ClientProfile[]): BrandItem[] {
  return clients.slice(0, 3).map((client) => ({
    id: client.id,
    client: client.companyName,
    files: getClientDesignServiceSummary(client),
    updated: formatElapsed(client.updatedAt),
  }));
}

function buildDeliveryItems(tasks: Task[]): DeliveryItem[] {
  return [...tasks]
    .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
    .slice(0, 2)
    .map((task) => ({
      id: task.id,
      client: getTaskClientName(task),
      files: task.title,
      status: task.approvalStatus ? formatApprovalStatus(task.approvalStatus) : getTaskStatusLabel(task.status),
      date: formatDate(task.updatedAt),
    }));
}

function isDesignerTask(task: Task, currentUserId?: string): boolean {
  if (currentUserId && task.assigneeUserId === currentUserId) {
    return true;
  }
  if (task.assignee?.role === "DESIGNER") {
    return true;
  }
  return isCreativeTask(task) || isRevisionTask(task);
}

function isCreativeTask(task: Task): boolean {
  const hasDesignService = task.project?.clientProfile?.purchasedServices?.some((service) =>
    DESIGN_SERVICE_KEYS.has(service.serviceKey),
  ) ?? false;
  return (
    task.workstream === "UI_INTEGRATION" ||
    task.approvalType?.includes("CREATIVE") === true ||
    task.approvalType === "SOCIAL_MEDIA_POST_APPROVAL" ||
    task.approvalType === "SOCIAL_MEDIA_CALENDAR_APPROVAL" ||
    hasDesignService
  );
}

function isRevisionTask(task: Task): boolean {
  return task.type === "REVISION" || task.status === "REVIEW" || task.approvalStatus === "CHANGES_REQUESTED";
}

function isUiDesignProject(project: Project): boolean {
  return (
    project.serviceKey === "web-mobile-design" ||
    project.serviceKey === "web-app" ||
    project.serviceKey === "mobile-app" ||
    project.serviceKey === "landing-page" ||
    project.serviceKey === "landing-pages" ||
    Boolean(project.figmaProjectUrl)
  );
}

function compareTasksByPriorityAndDueDate(first: Task, second: Task): number {
  const priorityDiff = PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return getTimeValue(first.dueDate) - getTimeValue(second.dueDate);
}

function getTaskClientName(task: Task): string {
  return task.project?.clientProfile?.companyName ?? "Müşteri yok";
}

function getDesignTaskType(task: Task): string {
  const service = getTaskDesignServiceLabel(task);
  if (task.approvalType?.includes("CREATIVE")) {
    return service ? `${service} Kreatif` : "Kreatif";
  }
  if (task.type === "REVISION") {
    return service ? `${service} Revizyon` : "Revizyon";
  }
  return service ?? task.type;
}

function getTaskDesignServiceLabel(task: Task): string | null {
  const service = task.project?.clientProfile?.purchasedServices?.find((purchasedService) =>
    DESIGN_SERVICE_KEYS.has(purchasedService.serviceKey),
  );
  return getServiceLabel(service?.serviceKey);
}

function getDesignTaskFormat(task: Task): string {
  return task.adSetRef ?? task.adRef ?? task.campaignRef ?? getWorkstreamLabel(task.workstream);
}

function getTaskPriorityTone(task: Task): PriorityTone {
  if (task.priority === "URGENT" || isOverdue(task.dueDate) || isSameLocalDay(task.dueDate, new Date())) {
    return "urgent";
  }
  if (task.priority === "HIGH") {
    return "high";
  }
  return "normal";
}

function getClientDesignServiceSummary(client: ClientProfile): string {
  const services = (client.purchasedServices ?? [])
    .filter((service) => DESIGN_SERVICE_KEYS.has(service.serviceKey))
    .map((service) => getServiceLabel(service.serviceKey));

  if (services.length === 0) {
    return "Aktif marka varlığı bekleniyor";
  }

  return services.slice(0, 3).join(", ");
}

function getProjectFallbackProgress(project: Project): number {
  if (project.status === "COMPLETED") return 100;
  if (project.status === "REVIEW") return 80;
  if (project.status === "IN_PROGRESS") return 50;
  if (project.status === "ON_HOLD") return 25;
  return 0;
}

function getProjectStatusText(project: Project): string {
  if (project.figmaProjectUrl) {
    return "Figma bağlı";
  }
  return "Görev bekleniyor";
}

function getTimeValue(value: string | null | undefined): number {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function formatTaskDeadline(value: string | null): string {
  if (!value) {
    return "Tarih yok";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }
  if (isSameLocalDay(value, new Date())) {
    return "Bugün";
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(value, tomorrow)) {
    return "Yarın";
  }
  return formatDate(value);
}

function formatElapsed(value: string | null | undefined): string {
  if (!value) {
    return "Tarih yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return "Az önce";
  }
  if (diffHours < 24) {
    return `${diffHours} saat`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} gün`;
}

function isSameLocalDay(value: string | null | undefined, date: Date): boolean {
  if (!value) {
    return false;
  }
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) {
    return false;
  }
  return (
    candidate.getFullYear() === date.getFullYear() &&
    candidate.getMonth() === date.getMonth() &&
    candidate.getDate() === date.getDate()
  );
}

function isSameLocalMonth(value: string | null | undefined, date: Date): boolean {
  if (!value) {
    return false;
  }
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) {
    return false;
  }
  return candidate.getFullYear() === date.getFullYear() && candidate.getMonth() === date.getMonth();
}

function isOverdue(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now() && !isSameLocalDay(value, new Date());
}

function getServiceLabel(serviceKey?: ServiceKey | null): string | null {
  if (!serviceKey) {
    return null;
  }
  const labels: Record<ServiceKey, string> = {
    "growth-hub": "Growth Hub",
    "social-media": "Social Media",
    "media-hub": "Media Hub",
    "medya-hub": "Medya Hub",
    "meta-ads": "Meta Ads",
    "tiktok-ads": "TikTok Ads",
    "google-ads": "Google Ads",
    "amazon-ads": "Amazon Ads",
    "web-app": "Web App",
    "mobile-app": "Mobile App",
    "landing-page": "Landing Page",
    "landing-pages": "Landing Pages",
    "web-mobile-design": "Web & Mobile Design",
    "technical-support": "Technical Support",
    "seo-audit": "SEO Audit",
  };
  return labels[serviceKey] ?? serviceKey;
}

function getWorkstreamLabel(workstream: Task["workstream"]): string {
  const labels: Record<Task["workstream"], string> = {
    FRONTEND: "Frontend",
    BACKEND: "Backend / API",
    FULLSTACK: "Fullstack",
    QA: "QA",
    DEVOPS: "DevOps",
    UI_INTEGRATION: "UI Integration",
  };
  return labels[workstream] ?? workstream;
}

function formatApprovalStatus(status: NonNullable<Task["approvalStatus"]>): string {
  const labels: Record<NonNullable<Task["approvalStatus"]>, string> = {
    PENDING: "Onay bekliyor",
    APPROVED: "Onaylandı",
    CHANGES_REQUESTED: "Revizyon istendi",
    REJECTED: "Reddedildi",
    ACKNOWLEDGED: "Görüldü",
  };
  return labels[status] ?? status;
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg bg-white/5 p-3 text-sm text-[#A0A0A0]">{text}</p>;
}
