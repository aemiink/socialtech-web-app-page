import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  useGetProjectWorkspaceMeetingRequestsQuery,
  useGetProjectsQuery,
} from "../../features/projects/projectsApi";
import type { WorkspaceMeetingRequest } from "../../features/projects/projectsTypes";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import type { Task } from "../../features/tasks/tasksTypes";
import { getTaskStatusLabel } from "../../features/tasks/tasksUtils";

type MeetingsByProject = Record<string, WorkspaceMeetingRequest[]>;

export function Takvim() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [meetingsByProject, setMeetingsByProject] = useState<MeetingsByProject>({});
  const { data: tasksResponse, isLoading: isTasksLoading, isError: isTasksError } = useGetTasksQuery(
    currentUser?.id ? { assigneeUserId: currentUser.id } : undefined,
    { skip: !currentUser?.id },
  );
  const { data: projectsResponse } = useGetProjectsQuery();

  const tasks = tasksResponse?.data ?? [];
  const projects = projectsResponse?.data ?? [];
  const todayRange = useMemo(() => getDayRange(new Date()), []);
  const weekEnd = useMemo(() => addDays(todayRange.start, 7), [todayRange.start]);

  const deadlineTasks = useMemo(
    () =>
      tasks
        .filter((task) => Boolean(task.dueDate))
        .sort((first, second) => new Date(first.dueDate ?? "").getTime() - new Date(second.dueDate ?? "").getTime()),
    [tasks],
  );

  const todayTasks = useMemo(
    () =>
      deadlineTasks.filter((task) => {
        const dueDate = new Date(task.dueDate ?? "");
        return dueDate >= todayRange.start && dueDate <= todayRange.end;
      }),
    [deadlineTasks, todayRange.end, todayRange.start],
  );

  const weekDeadlineTasks = useMemo(
    () =>
      deadlineTasks.filter((task) => {
        const dueDate = new Date(task.dueDate ?? "");
        return dueDate >= todayRange.start && dueDate <= weekEnd;
      }),
    [deadlineTasks, todayRange.start, weekEnd],
  );

  const meetingEvents = useMemo(
    () =>
      Object.values(meetingsByProject)
        .flat()
        .filter((meeting) => ["REQUESTED", "CONFIRMED"].includes(meeting.status))
        .sort(
          (first, second) =>
            new Date(getMeetingStart(first)).getTime() - new Date(getMeetingStart(second)).getTime(),
        ),
    [meetingsByProject],
  );

  const todayMeetings = useMemo(
    () =>
      meetingEvents.filter((meeting) => {
        const meetingDate = new Date(getMeetingStart(meeting));
        return meetingDate >= todayRange.start && meetingDate <= todayRange.end;
      }),
    [meetingEvents, todayRange.end, todayRange.start],
  );

  const handleMeetingsLoaded = useCallback((projectId: string, meetings: WorkspaceMeetingRequest[]) => {
    setMeetingsByProject((current) => {
      const currentSignature = getMeetingsSignature(current[projectId] ?? []);
      const nextSignature = getMeetingsSignature(meetings);
      if (currentSignature === nextSignature) {
        return current;
      }

      return { ...current, [projectId]: meetings };
    });
  }, []);

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <MeetingCollector
          key={project.id}
          projectId={project.id}
          onLoaded={handleMeetingsLoaded}
        />
      ))}

      <div>
        <h1 className="mb-1 text-2xl font-semibold">Takvim</h1>
        <p className="text-[#A0A0A0]">Atandığınız görevlerin tarihleri ve proje toplantıları</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Calendar className="h-5 w-5 text-[#AAFF01]" />}
          label="Bugünkü Kayıt"
          value={`${todayTasks.length + todayMeetings.length}`}
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="Bu Hafta Teslim"
          value={`${weekDeadlineTasks.length}`}
          valueClassName="text-orange-500"
        />
        <SummaryCard
          icon={<Users className="h-5 w-5 text-[#AAFF01]" />}
          label="Aktif Toplantı"
          value={`${meetingEvents.length}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Bugün</h3>
            <Badge variant="outline">{formatDate(new Date().toISOString())}</Badge>
          </div>
          <div className="space-y-3">
            {isTasksLoading ? (
              <EmptyState text="Takvim kayıtları yükleniyor..." />
            ) : isTasksError ? (
              <EmptyState text="Görev takvimi alınamadı." tone="error" />
            ) : todayTasks.length === 0 && todayMeetings.length === 0 ? (
              <EmptyState text="Bugün için görev tarihi veya toplantı bulunmuyor." />
            ) : (
              <>
                {todayTasks.map((task) => (
                  <TaskCalendarCard key={task.id} task={task} compact />
                ))}
                {todayMeetings.map((meeting) => (
                  <MeetingCalendarCard key={meeting.id} meeting={meeting} compact />
                ))}
              </>
            )}
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Yaklaşan Teslim Tarihleri</h3>
            <Badge variant="outline">7 Gün</Badge>
          </div>
          <div className="space-y-3">
            {isTasksLoading ? (
              <EmptyState text="Teslim tarihleri yükleniyor..." />
            ) : weekDeadlineTasks.length === 0 ? (
              <EmptyState text="Bu hafta için teslim tarihi bulunmuyor." />
            ) : (
              weekDeadlineTasks.slice(0, 8).map((task) => (
                <TaskCalendarCard key={task.id} task={task} />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Toplantılar</h3>
          <Badge variant="outline">Proje bazlı</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {meetingEvents.length === 0 ? (
            <EmptyState text="Planlanmış veya talep edilmiş toplantı bulunmuyor." />
          ) : (
            meetingEvents.slice(0, 10).map((meeting) => (
              <MeetingCalendarCard key={meeting.id} meeting={meeting} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function MeetingCollector({
  projectId,
  onLoaded,
}: {
  projectId: string;
  onLoaded: (projectId: string, meetings: WorkspaceMeetingRequest[]) => void;
}) {
  const { data } = useGetProjectWorkspaceMeetingRequestsQuery({ projectId });

  useEffect(() => {
    if (data) {
      onLoaded(projectId, data);
    }
  }, [data, onLoaded, projectId]);

  return null;
}

function SummaryCard({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3">
        {icon}
        <span className="text-sm text-[#A0A0A0]">{label}</span>
      </div>
      <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
    </Card>
  );
}

function TaskCalendarCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const isOverdue = task.dueDate ? new Date(task.dueDate) < getDayRange(new Date()).start : false;

  return (
    <div
      className={`rounded-lg border p-3 ${
        isOverdue ? "border-red-500/30 bg-red-500/10" : "border-white/[0.06] bg-white/5"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{task.title}</p>
        <Badge variant={isOverdue ? "destructive" : "outline"} className="shrink-0 text-xs">
          {formatDate(task.dueDate)}
        </Badge>
      </div>
      <p className="text-xs text-[#A0A0A0]">
        {task.project?.clientProfile?.companyName ?? "Müşteri"} · {getTaskStatusLabel(task.status)}
      </p>
      {!compact && task.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-[#A0A0A0]">{task.description}</p>
      ) : null}
    </div>
  );
}

function MeetingCalendarCard({
  meeting,
  compact = false,
}: {
  meeting: WorkspaceMeetingRequest;
  compact?: boolean;
}) {
  const start = getMeetingStart(meeting);

  return (
    <div className="rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/10 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{meeting.title}</p>
        <Badge className="shrink-0 bg-[#AAFF01] text-[#131313]">
          {getMeetingStatusLabel(meeting.status)}
        </Badge>
      </div>
      <p className="text-xs text-[#A0A0A0]">
        {formatDateTime(start)} · {meeting.timezone}
      </p>
      {!compact && meeting.agenda ? (
        <p className="mt-2 line-clamp-2 text-xs text-[#A0A0A0]">{meeting.agenda}</p>
      ) : null}
    </div>
  );
}

function EmptyState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 text-sm">
      <span className={tone === "error" ? "text-red-300" : "text-[#A0A0A0]"}>{text}</span>
    </div>
  );
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMeetingStart(meeting: WorkspaceMeetingRequest) {
  return meeting.scheduledStartAt ?? meeting.preferredStartAt;
}

function getMeetingStatusLabel(status: WorkspaceMeetingRequest["status"]) {
  const labels: Record<WorkspaceMeetingRequest["status"], string> = {
    REQUESTED: "Talep Edildi",
    CONFIRMED: "Planlandı",
    DECLINED: "Reddedildi",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal",
  };

  return labels[status] ?? status;
}

function getMeetingsSignature(meetings: WorkspaceMeetingRequest[]) {
  return meetings
    .map((meeting) =>
      [
        meeting.id,
        meeting.status,
        meeting.scheduledStartAt ?? "",
        meeting.preferredStartAt,
        meeting.updatedAt,
      ].join(":"),
    )
    .sort()
    .join("|");
}
