import { CheckCircle, Clock } from "lucide-react";
import { useGetClientTasksQuery } from "../../features/tasks/tasksApi";
import { useGetWebAppWorkspaceQuery } from "../../features/webAppWorkspace/webAppWorkspaceApi";

export function WebAppDashboard({ projectId }: { projectId?: string | null }) {
  const { data: tasks = [], isLoading: isTasksLoading } = useGetClientTasksQuery(
    projectId ? { projectId } : undefined,
  );
  const { data: workspace, isLoading: isWorkspaceLoading } = useGetWebAppWorkspaceQuery(
    { projectId: projectId ?? "", tabKey: "OVERVIEW" },
    { skip: !projectId },
  );

  const scopedTasks = tasks.filter((task) => !projectId || task.projectId === projectId);
  const completedTasks = scopedTasks.filter((task) => task.status === "DONE").length;
  const openTasks = Math.max(scopedTasks.length - completedTasks, 0);
  const progress = scopedTasks.length > 0 ? Math.round((completedTasks / scopedTasks.length) * 100) : 0;
  const latestRevisions = (workspace?.revisions ?? []).slice(0, 5);
  const latestMessages = (workspace?.messages ?? []).slice(0, 5);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="mb-2 text-3xl text-white">Web Uygulama Geliştirme</h1>
        <p className="text-[#A0A0A0]">Proje ilerleme görünümü</p>
      </div>

      {!projectId ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6 text-sm text-[#A0A0A0]">
          Bu ekranı görüntülemek için bir proje seçin.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Toplam Görev" value={String(scopedTasks.length)} loading={isTasksLoading} />
        <MetricCard title="Tamamlanan" value={String(completedTasks)} loading={isTasksLoading} />
        <MetricCard title="İlerleme" value={`%${progress}`} loading={isTasksLoading} />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <h2 className="text-xl text-white">Aktif İş Durumu</h2>
        {isTasksLoading ? <p className="mt-3 text-sm text-[#A0A0A0]">Görevler yükleniyor...</p> : null}
        {!isTasksLoading && projectId && scopedTasks.length === 0 ? (
          <p className="mt-3 text-sm text-[#A0A0A0]">Bu projede görev bulunmuyor.</p>
        ) : null}
        {!isTasksLoading && scopedTasks.length > 0 ? (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="inline-flex items-center gap-2 text-[#AAFF01]">
              <CheckCircle className="h-4 w-4" />
              Tamamlanan: {completedTasks}
            </span>
            <span className="inline-flex items-center gap-2 text-[#FFA726]">
              <Clock className="h-4 w-4" />
              Açık: {openTasks}
            </span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="text-xl text-white">Son Revizyonlar</h2>
          {isWorkspaceLoading && projectId ? <p className="mt-3 text-sm text-[#A0A0A0]">Revizyonlar yükleniyor...</p> : null}
          {!isWorkspaceLoading && projectId && latestRevisions.length === 0 ? (
            <p className="mt-3 text-sm text-[#A0A0A0]">Revizyon kaydı bulunmuyor.</p>
          ) : null}
          <div className="mt-3 space-y-2">
            {latestRevisions.map((revision) => (
              <div key={revision.id} className="rounded-lg border border-white/[0.08] bg-[#202020] p-3">
                <p className="text-white">{revision.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{revision.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="text-xl text-white">Son Mesajlar</h2>
          {isWorkspaceLoading && projectId ? <p className="mt-3 text-sm text-[#A0A0A0]">Mesajlar yükleniyor...</p> : null}
          {!isWorkspaceLoading && projectId && latestMessages.length === 0 ? (
            <p className="mt-3 text-sm text-[#A0A0A0]">Mesaj bulunmuyor.</p>
          ) : null}
          <div className="mt-3 space-y-2">
            {latestMessages.map((message) => (
              <div key={message.id} className="rounded-lg border border-white/[0.08] bg-[#202020] p-3">
                <p className="text-sm text-white">{message.body}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{new Date(message.createdAt).toLocaleString("tr-TR")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, loading }: { title: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
      <p className="text-sm text-[#A0A0A0]">{title}</p>
      <p className="mt-2 text-3xl text-white">{loading ? "..." : value}</p>
    </div>
  );
}
