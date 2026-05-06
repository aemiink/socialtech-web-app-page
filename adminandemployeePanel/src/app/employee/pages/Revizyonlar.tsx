import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  selectCurrentUser,
  hasUserPermission,
} from "../../features/auth/authSelectors";
import {
  useGetProjectsQuery,
  useGetProjectWorkspaceRevisionsQuery,
} from "../../features/projects/projectsApi";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
} from "../../features/projects/projectsUtils";
import { useGetTasksQuery } from "../../features/tasks/tasksApi";
import {
  getPriorityBadgeClass,
  getPriorityLabel,
  getTaskClientName,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  getTaskTypeLabel,
  getTaskWorkstreamLabel,
} from "../../features/tasks/tasksUtils";
import { useAppSelector } from "../../store/hooks";

type ServiceFilter = "ALL" | "WEB_APP" | "OTHER_SERVICES";

export function Revizyonlar() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadAssignedTasks =
    currentUser?.accountType === "EMPLOYEE" &&
    currentUser.permissions.includes("tasks.read.assigned");
  const canReadWorkspace = hasUserPermission(currentUser, [
    "webapp.workspace.read.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.read.any",
    "webapp.workspace.manage.any",
  ]);
  const canViewAnyRevisionSource = canReadAssignedTasks || canReadWorkspace;

  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [selectedWebProjectId, setSelectedWebProjectId] = useState("");

  const {
    data: tasksResponse,
    error: tasksError,
    isError: isTasksError,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    {
      type: "REVISION",
      assigneeUserId: currentUser?.id ?? "",
    },
    { skip: !canReadAssignedTasks },
  );

  const { data: projectsResponse } = useGetProjectsQuery(undefined, {
    skip: !canViewAnyRevisionSource,
  });
  const projects = projectsResponse?.data ?? [];
  const webAppProjects = useMemo(
    () => projects.filter((project) => project.serviceKey === "web-app"),
    [projects],
  );

  useEffect(() => {
    if (webAppProjects.length === 0) {
      setSelectedWebProjectId("");
      return;
    }
    if (!selectedWebProjectId || !webAppProjects.some((project) => project.id === selectedWebProjectId)) {
      setSelectedWebProjectId(webAppProjects[0]?.id ?? "");
    }
  }, [selectedWebProjectId, webAppProjects]);

  const {
    data: workspaceRevisions = [],
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetProjectWorkspaceRevisionsQuery(
    { projectId: selectedWebProjectId },
    { skip: !canReadWorkspace || selectedWebProjectId.length === 0 },
  );

  if (!canViewAnyRevisionSource) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Revizyonları görüntüleme yetkiniz bulunmuyor.
      </Card>
    );
  }

  const tasks = tasksResponse?.data ?? [];
  const projectServiceById = new Map(
    projects.map((project) => [project.id, project.serviceKey ?? null]),
  );

  const nonWebRevisionTasks = tasks.filter((task) => {
    const serviceKey = task.projectId ? projectServiceById.get(task.projectId) : null;
    return serviceKey !== "web-app";
  });

  const filteredWorkspaceRevisions = workspaceRevisions.filter((revision) => {
    if (statusFilter !== "ALL" && revision.status !== statusFilter) {
      return false;
    }
    if (
      assigneeFilter !== "ALL" &&
      (revision.assignedToUserId ?? "UNASSIGNED") !== assigneeFilter
    ) {
      return false;
    }
    return true;
  });

  const filteredTaskRevisions = nonWebRevisionTasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) {
      return false;
    }
    if (assigneeFilter !== "ALL" && (task.assigneeUserId ?? "UNASSIGNED") !== assigneeFilter) {
      return false;
    }
    return true;
  });

  const assigneeOptions = Array.from(
    new Map(
      [
        ...workspaceRevisions.map((revision) => [
          revision.assignedToUserId ?? "UNASSIGNED",
          revision.assignedTo?.displayName ?? "Atama yok",
        ]),
        ...nonWebRevisionTasks.map((task) => [
          task.assigneeUserId ?? "UNASSIGNED",
          task.assignee?.displayName ?? "Atama yok",
        ]),
      ].map(([id, label]) => [id, label]),
    ).entries(),
  );

  const shouldShowWorkspace = canReadWorkspace && serviceFilter !== "OTHER_SERVICES";
  const shouldShowTaskRevisions = canReadAssignedTasks && serviceFilter !== "WEB_APP";

  const handleRefresh = () => {
    if (canReadAssignedTasks) {
      void refetchTasks();
    }
    if (canReadWorkspace && selectedWebProjectId.length > 0) {
      void refetchWorkspace();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Revizyonlar</h1>
        <p className="text-[#A0A0A0]">
          WEB_APP için workspace revizyonları, diğer hizmetlerde görev tabanlı revizyonlar
        </p>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            className="h-10 rounded-md border border-white/15 bg-[#151515] px-3 text-sm text-white"
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value as ServiceFilter)}
          >
            <option value="ALL">Tüm Servisler</option>
            <option value="WEB_APP">Sadece WEB_APP</option>
            <option value="OTHER_SERVICES">WEB_APP Hariç</option>
          </select>
          <select
            className="h-10 rounded-md border border-white/15 bg-[#151515] px-3 text-sm text-white"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="READY_FOR_REVIEW">READY_FOR_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="TODO">TODO</option>
            <option value="REVIEW">REVIEW</option>
            <option value="DONE">DONE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
          <select
            className="h-10 rounded-md border border-white/15 bg-[#151515] px-3 text-sm text-white"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          >
            <option value="ALL">Tüm Atamalar</option>
            {assigneeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={handleRefresh}>
            Yenile
          </Button>
        </div>
      </Card>

      {shouldShowWorkspace && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">WEB_APP Workspace Revizyonları</h2>
              <p className="text-xs text-[#A0A0A0]">Proje bazlı müşteri revizyon lifecycle</p>
            </div>
            <select
              className="h-9 rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
              value={selectedWebProjectId}
              onChange={(event) => setSelectedWebProjectId(event.target.value)}
            >
              {webAppProjects.length === 0 && <option value="">WEB_APP projesi yok</option>}
              {webAppProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {isWorkspaceLoading && <p className="text-sm text-[#A0A0A0]">Workspace revizyonları yükleniyor...</p>}
          {isWorkspaceError && (
            <p className="text-sm text-red-300">
              {extractApiErrorMessage(workspaceError, "Workspace revizyonları alınamadı.")}
            </p>
          )}
          {!isWorkspaceLoading && !isWorkspaceError && filteredWorkspaceRevisions.length === 0 && (
            <p className="text-sm text-[#A0A0A0]">Filtreye uygun WEB_APP revizyonu bulunmuyor.</p>
          )}
          <div className="space-y-3">
            {filteredWorkspaceRevisions.map((revision) => (
              <div key={revision.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{revision.title}</p>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                    {revision.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#A0A0A0]">{revision.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
                  <span>Talep: {formatDateTime(revision.requestedAt)}</span>
                  <span>Talep Eden: {revision.requestedBy?.displayName ?? "—"}</span>
                  <span>Atanan: {revision.assignedTo?.displayName ?? "Atama yok"}</span>
                  {revision.task?.title ? <span>Task: {revision.task.title}</span> : null}
                  {revision.release?.title ? <span>Release: {revision.release.title}</span> : null}
                  {revision.projectFile?.title ? <span>Dosya: {revision.projectFile.title}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {shouldShowTaskRevisions && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h2 className="mb-1 text-lg font-semibold text-white">Diğer Servis Revizyon Görevleri</h2>
          <p className="mb-4 text-xs text-[#A0A0A0]">
            Task(type=REVISION) tabanlı non-WEB_APP revizyon akışı
          </p>

          {isTasksLoading && <p className="text-sm text-[#A0A0A0]">Revizyon görevleri yükleniyor...</p>}
          {isTasksError && (
            <p className="text-sm text-red-300">
              {extractApiErrorMessage(tasksError, "Revizyon görevleri alınamadı.")}
            </p>
          )}
          {!isTasksLoading && !isTasksError && filteredTaskRevisions.length === 0 && (
            <p className="text-sm text-[#A0A0A0]">Filtreye uygun non-WEB_APP revizyon görevi bulunmuyor.</p>
          )}
          <div className="space-y-3">
            {filteredTaskRevisions.map((task) => (
              <div key={task.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <Badge className={getTaskStatusBadgeClass(task.status)}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  <Badge className={getPriorityBadgeClass(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                    {getTaskTypeLabel(task.type)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                    {getTaskWorkstreamLabel(task.workstream)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#A0A0A0]">{task.description ?? "Açıklama yok."}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A0A0A0]">
                  <span>Müşteri: {getTaskClientName(task)}</span>
                  <span>Proje: {task.project?.name ?? "—"}</span>
                  <span>Atanan: {task.assignee?.displayName ?? "Atama yok"}</span>
                  <span>Teslim: {formatDate(task.dueDate)}</span>
                </div>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/employee/gorevlerim/${task.id}`}>Detay</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
