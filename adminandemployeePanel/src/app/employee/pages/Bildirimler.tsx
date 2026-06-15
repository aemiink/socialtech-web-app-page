import { useMemo, useState } from "react";
import { AlertCircle, Bell, CalendarClock, CheckSquare, FileText } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetProjectsQuery } from "../../features/projects/projectsApi";
import type { Project } from "../../features/projects/projectsTypes";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { Task } from "../../features/tasks/tasksTypes";
import { getTaskStatusLabel } from "../../features/tasks/tasksUtils";
import { useAppSelector } from "../../store/hooks";

type NotificationKind = "task" | "approval" | "deadline" | "project";

type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  href?: string;
};

export function Bildirimler() {
  const currentUser = useAppSelector(selectCurrentUser);
  const storageKey = currentUser?.id ? `employee-notification-read:${currentUser.id}` : "";
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadNotificationIds(storageKey));
  const { data: tasksResponse, isLoading: isTasksLoading, isError: isTasksError } = useGetTasksQuery(
    currentUser?.id ? { assigneeUserId: currentUser.id } : undefined,
    { skip: !currentUser?.id },
  );
  const { data: projectsResponse, isLoading: isProjectsLoading } = useGetProjectsQuery();

  const notifications = useMemo(
    () => buildNotifications(tasksResponse?.data ?? [], projectsResponse?.data ?? []),
    [projectsResponse?.data, tasksResponse?.data],
  );
  const unreadCount = notifications.filter((notification) => !readIds.has(notification.id)).length;

  function updateReadIds(nextReadIds: Set<string>) {
    setReadIds(nextReadIds);
    saveReadNotificationIds(storageKey, nextReadIds);
  }

  function markAllRead() {
    updateReadIds(new Set(notifications.map((notification) => notification.id)));
  }

  function clearReadState() {
    updateReadIds(new Set());
  }

  function markOneRead(notificationId: string) {
    updateReadIds(new Set([...readIds, notificationId]));
  }

  const isLoading = isTasksLoading || isProjectsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Bildirimler</h1>
        <p className="text-[#A0A0A0]">Canlı görev, onay ve teslim tarihi güncellemeleri</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-[#AAFF01] text-[#131313]">{unreadCount} okunmamış</Badge>
        <Button size="sm" variant="outline" onClick={markAllRead} disabled={notifications.length === 0}>
          Tümünü Okundu İşaretle
        </Button>
        <Button size="sm" variant="outline" onClick={clearReadState} disabled={readIds.size === 0}>
          Okundu Bilgisini Sıfırla
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <EmptyNotification text="Bildirimler yükleniyor..." />
        ) : isTasksError ? (
          <EmptyNotification text="Görev bildirimleri alınamadı." tone="error" />
        ) : notifications.length === 0 ? (
          <EmptyNotification text="Şu anda bildirilecek canlı kayıt bulunmuyor." />
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.kind);
            const isRead = readIds.has(notification.id);
            const isWarning = notification.kind === "approval" || notification.kind === "deadline";

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer border-white/[0.06] bg-[#1A1A1A] p-4 transition-colors hover:bg-white/5 ${
                  isRead ? "" : "border-[#AAFF01]/30"
                }`}
                onClick={() => markOneRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${isWarning ? "bg-orange-500/20" : "bg-[#AAFF01]/20"}`}>
                    <Icon className={`h-5 w-5 ${isWarning ? "text-orange-500" : "text-[#AAFF01]"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!isRead ? <span className="h-2 w-2 rounded-full bg-[#AAFF01]" /> : null}
                    </div>
                    <p className="text-sm text-[#A0A0A0]">{notification.message}</p>
                    <p className="mt-2 text-xs text-[#A0A0A0]">{formatRelativeDate(notification.createdAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      markOneRead(notification.id);
                    }}
                    aria-label="Okundu işaretle"
                  >
                    <CheckSquare className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function buildNotifications(tasks: Task[], projects: Project[]): NotificationItem[] {
  const now = new Date();
  const threeDaysLater = addDays(now, 3);
  const sevenDaysLater = addDays(now, 7);
  const notifications: NotificationItem[] = [];

  for (const task of tasks) {
    const clientName = task.project?.clientProfile?.companyName ?? "Müşteri";

    if (["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"].includes(task.status)) {
      notifications.push({
        id: `task:${task.id}:${task.updatedAt}`,
        kind: "task",
        title: "Görev güncellemesi",
        message: `${task.title} · ${clientName} · ${getTaskStatusLabel(task.status)}`,
        createdAt: task.updatedAt ?? task.createdAt,
        href: `/employee/gorevlerim/${task.id}`,
      });
    }

    if (task.approvalRequired && task.approvalStatus === "PENDING") {
      notifications.push({
        id: `approval:${task.id}:${task.approvalRequestedAt ?? task.updatedAt}`,
        kind: "approval",
        title: "Müşteri onayı bekleniyor",
        message: `${task.title} için müşteri onay süreci açık.`,
        createdAt: task.approvalRequestedAt ?? task.updatedAt ?? task.createdAt,
        href: `/employee/gorevlerim/${task.id}`,
      });
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const isOpen = task.status !== "DONE";
      if (isOpen && dueDate < now) {
        notifications.push({
          id: `overdue:${task.id}:${task.dueDate}`,
          kind: "deadline",
          title: "Teslim tarihi geçti",
          message: `${task.title} için hedef tarih ${formatDate(task.dueDate)} idi.`,
          createdAt: task.dueDate,
          href: `/employee/gorevlerim/${task.id}`,
        });
      } else if (isOpen && dueDate <= threeDaysLater) {
        notifications.push({
          id: `due-soon:${task.id}:${task.dueDate}`,
          kind: "deadline",
          title: "Teslim tarihi yaklaşıyor",
          message: `${task.title} için hedef tarih ${formatDate(task.dueDate)}.`,
          createdAt: task.dueDate,
          href: `/employee/gorevlerim/${task.id}`,
        });
      }
    }
  }

  for (const project of projects) {
    if (!project.dueDate) {
      continue;
    }

    const dueDate = new Date(project.dueDate);
    if (["COMPLETED", "ON_HOLD"].includes(project.status) || dueDate > sevenDaysLater) {
      continue;
    }

    notifications.push({
      id: `project-due:${project.id}:${project.dueDate}`,
      kind: "project",
      title: "Proje tarihi yaklaşıyor",
      message: `${project.clientProfile?.companyName ?? "Müşteri"} · ${project.name} · ${formatDate(project.dueDate)}`,
      createdAt: project.dueDate,
    });
  }

  return notifications
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 50);
}

function getNotificationIcon(kind: NotificationKind) {
  const icons = {
    task: CheckSquare,
    approval: AlertCircle,
    deadline: CalendarClock,
    project: FileText,
  } satisfies Record<NotificationKind, typeof Bell>;

  return icons[kind];
}

function EmptyNotification({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <p className={tone === "error" ? "text-sm text-red-300" : "text-sm text-[#A0A0A0]"}>
        {text}
      </p>
    </Card>
  );
}

function loadReadNotificationIds(storageKey: string) {
  if (!storageKey || typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return new Set<string>();
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return new Set<string>();
    }

    return new Set(parsedValue.filter((value): value is string => typeof value === "string"));
  } catch {
    return new Set<string>();
  }
}

function saveReadNotificationIds(storageKey: string, ids: Set<string>) {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Tarih yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return diffMinutes >= 0 ? `${absMinutes} dakika önce` : `${absMinutes} dakika sonra`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) {
    return diffHours >= 0 ? `${absHours} saat önce` : `${absHours} saat sonra`;
  }

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  if (absDays <= 7) {
    return diffDays >= 0 ? `${absDays} gün önce` : `${absDays} gün sonra`;
  }

  return formatDate(value);
}
