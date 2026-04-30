import { useMemo } from "react";
import type { ReactNode } from "react";
import { Activity, AlertCircle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { useGetClientTasksQuery } from "../features/tasks/tasksApi";
import type { ClientTask, ClientTaskStatus } from "../features/tasks/tasksTypes";
import { filterClientVisibleTodoProgressTasks } from "../features/tasks/tasksUtils";
import type { ServiceId } from "../data/service-pages";

const STATUS_LABELS: Record<ClientTaskStatus, string> = {
  TODO: "Planlandı",
  IN_PROGRESS: "Devam ediyor",
  REVIEW: "İncelemede",
  DONE: "Tamamlandı",
  BLOCKED: "Bloke",
};

export function ClientVisibleTasksSection({ selectedService }: { selectedService?: ServiceId | null }) {
  const { data: tasks = [], isError, isLoading } = useGetClientTasksQuery();

  return (
    <ClientVisibleTasksPanel
      tasks={tasks}
      isError={isError}
      isLoading={isLoading}
      selectedService={selectedService}
    />
  );
}

type ClientVisibleTasksPanelProps = {
  tasks: ClientTask[];
  isError?: boolean;
  isLoading?: boolean;
  selectedService?: ServiceId | null;
};

export function ClientVisibleTasksPanel({
  tasks,
  isError = false,
  isLoading = false,
  selectedService = null,
}: ClientVisibleTasksPanelProps) {
  const visibleTasks = useMemo(() => {
    const serviceScopedTasks =
      selectedService === null
        ? tasks
        : tasks.filter((task) => task.projectServiceId === null || task.projectServiceId === selectedService);

    return filterClientVisibleTodoProgressTasks(serviceScopedTasks);
  }, [selectedService, tasks]);

  return (
    <section className="border-t border-white/[0.08] bg-[#131313] px-6 py-6 md:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#AAFF01]">
              <Activity className="h-4 w-4" />
              Müşteri Görünür İşler
            </div>
            <h2 className="text-2xl text-white">Açık işler ve ilerleme</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              Size açık olan yapılacak ve devam eden işleri buradan takip edebilirsiniz.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#202020] px-4 py-3 text-right">
            <div className="text-2xl text-white">{visibleTasks.length}</div>
            <div className="text-xs text-[#A0A0A0]">Görünür İş</div>
          </div>
        </div>

        {isLoading ? (
          <TaskPanelState icon={<Clock3 className="h-5 w-5" />} text="Görevler yükleniyor..." />
        ) : isError ? (
          <TaskPanelState
            icon={<AlertCircle className="h-5 w-5" />}
            text="Görevler şu anda alınamadı."
          />
        ) : visibleTasks.length === 0 ? (
          <TaskPanelState
            icon={<CheckCircle2 className="h-5 w-5" />}
            text="Müşteriye açık devam eden görev bulunmuyor."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskCard({ task }: { task: ClientTask }) {
  return (
    <article className="rounded-xl border border-white/[0.08] bg-[#202020] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs text-[#A0A0A0]">
            <ListTodo className="h-3.5 w-3.5" />
            <span>{task.projectName ?? "Genel çalışma"}</span>
          </div>
          <h3 className="text-base text-white">{task.title}</h3>
        </div>
        <span className="shrink-0 rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-1 text-xs text-[#AAFF01]">
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {task.description ? (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">
          {task.description}
        </p>
      ) : null}

      <ul className="mb-4 space-y-2">
        {task.todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-[#1A1A1A] px-3 py-2 text-sm text-white"
          >
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                todo.isCompleted ? "text-[#AAFF01]" : "text-[#A0A0A0]"
              }`}
            />
            <div className="min-w-0">
              <div>{todo.title}</div>
              {todo.description ? (
                <div className="mt-0.5 text-xs leading-relaxed text-[#A0A0A0]">
                  {todo.description}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#A0A0A0]">
          <span>İlerleme</span>
          <span>{task.progressPercent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${task.title} ilerleme`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={task.progressPercent}
          className="h-2 overflow-hidden rounded-full bg-white/[0.08]"
        >
          <div
            className="h-full rounded-full bg-[#AAFF01]"
            style={{ width: `${task.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A0A0A0]">
        <span>Öncelik: {task.priority}</span>
        <span>{formatTaskDate(task.dueDate) ?? formatTaskDate(task.updatedAt) ?? "Tarih yok"}</span>
      </div>
    </article>
  );
}

function TaskPanelState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#202020] p-4 text-sm text-[#A0A0A0]">
      <span className="text-[#AAFF01]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function formatTaskDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);
}
