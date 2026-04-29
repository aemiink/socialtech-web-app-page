import { Link, useParams } from "react-router";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppSelector } from "../store/hooks";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useGetTaskQuery } from "../features/tasks/tasksApi";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskAssigneeName,
  getTaskClientName,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  isTaskOverdue,
  isUuid,
  shortId,
} from "../features/tasks/tasksUtils";

export function TaskDetail() {
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadTasks = hasAdminPermission(currentUser, [
    "tasks.read.any",
    "tasks.manage.any",
    "tasks.read",
  ]);

  const isValidId = typeof id === "string" && isUuid(id);

  const {
    data: task,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetTaskQuery(id ?? "", {
    skip: !canReadTasks || !isValidId,
  });

  if (!canReadTasks) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link to="/gorevler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz görev kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Görev detayı yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to="/gorevler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Görev detayı yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Link to="/gorevler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Görev kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/gorevler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Görevlere Dön
          </Button>
        </Link>
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{task.title}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              {task.project?.name ?? shortId(task.projectId)} • {getTaskClientName(task)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getTaskStatusBadgeClass(task.status)}>
              {getTaskStatusLabel(task.status)}
            </Badge>
            <Badge className={getPriorityBadgeClass(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </div>
        {task.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-[#D8D8D8]">{task.description}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Atanan" value={getTaskAssigneeName(task)} />
        <InfoCard label="Durum" value={getTaskStatusLabel(task.status)} />
        <InfoCard label="Öncelik" value={getPriorityLabel(task.priority)} />
        <InfoCard
          label="Deadline"
          value={`${formatDate(task.dueDate)}${isTaskOverdue(task) ? " (Gecikmiş)" : ""}`}
        />
        <InfoCard label="Proje ID" value={task.projectId} mono />
        <InfoCard label="Assignee User ID" value={task.assigneeUserId ?? "—"} mono />
        <InfoCard label="Oluşturulma" value={formatDateTime(task.createdAt)} />
        <InfoCard label="Güncellenme" value={formatDateTime(task.updatedAt)} />
      </div>
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
        <CheckSquare className="h-4 w-4 text-[#AAFF01]" />
        {label}
      </div>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </Card>
  );
}
