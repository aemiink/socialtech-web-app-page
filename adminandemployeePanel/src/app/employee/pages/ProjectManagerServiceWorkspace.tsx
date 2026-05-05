import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Calendar, FileText, Folder, ListChecks, MessageSquare } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAccessToken, selectCurrentEmployeeRole } from "../../features/auth/authSelectors";
import { projectsApi, useGetProjectsQuery, useCreateProjectWorkspaceMessageMutation, useGetProjectWorkspaceMessagesQuery, useGetProjectWorkspaceMeetingRequestsQuery, useGetProjectWorkspaceReportsQuery, useGetProjectWorkspaceRevisionsQuery, useGetProjectFilesQuery, useGetProjectAssigneeCandidatesQuery } from "../../features/projects/projectsApi";
import { extractApiErrorMessage, getProjectStatusBadgeClass, getProjectStatusLabel } from "../../features/projects/projectsUtils";
import { useCreateTaskMutation, useCreateTaskTodoMutation, useGetTasksQuery, useToggleTaskTodoMutation } from "../../features/tasks/tasksApi";
import { getTaskStatusBadgeClass, getTaskStatusLabel } from "../../features/tasks/tasksUtils";
import type { WorkspaceMessage, WorkspaceTabKey } from "../../features/projects/projectsTypes";
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from "../../features/projects/workspaceSocket";
import { useCreateDeliveryReleaseMutation, useCreateDeliverySprintMutation, useGetDeliveryReleasesQuery, useGetDeliverySprintsQuery } from "../../features/delivery/deliveryApi";

type WorkspaceViewTab = "OVERVIEW" | "TASKS" | "FILES" | "MESSAGES" | "REVISIONS" | "REPORTS" | "MEETINGS";
const DEFAULT_VIEW_TAB: WorkspaceViewTab = "OVERVIEW";

export function ProjectManagerServiceWorkspace() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const role = useAppSelector(selectCurrentEmployeeRole);
  const { clientId, serviceKey } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseWorkspaceViewTab(searchParams.get("tab"));
  const [viewTab, setViewTab] = useState<WorkspaceViewTab>(initialTab);
  const [messageBody, setMessageBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [isInternalMessage, setIsInternalMessage] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskTodoTitle, setTaskTodoTitle] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const lastSequenceRef = useRef(0);

  const { data: projectsResponse, isLoading, isError, error } = useGetProjectsQuery(
    { clientProfileId: clientId ?? "" },
    { skip: !clientId },
  );
  const projects = projectsResponse?.data ?? [];
  const project = useMemo(
    () => projects.find((item) => normalizeServiceKey(item.serviceKey) === normalizeServiceKey(serviceKey)),
    [projects, serviceKey],
  );

  const workspaceTabKey = useMemo(() => mapServiceViewTabToWorkspaceTab(viewTab), [viewTab]);
  const { data: workspaceMessages = [] } = useGetProjectWorkspaceMessagesQuery(
    { projectId: project?.id ?? "", tabKey: workspaceTabKey },
    { skip: !project || !isWebAppLikeService(serviceKey) },
  );
  const { data: revisions = [] } = useGetProjectWorkspaceRevisionsQuery(
    { projectId: project?.id ?? "" },
    { skip: !project },
  );
  const { data: reports = [] } = useGetProjectWorkspaceReportsQuery(
    { projectId: project?.id ?? "" },
    { skip: !project },
  );
  const { data: meetings = [] } = useGetProjectWorkspaceMeetingRequestsQuery(
    { projectId: project?.id ?? "" },
    { skip: !project },
  );
  const { data: filesResponse } = useGetProjectFilesQuery(
    { projectId: project?.id ?? "", limit: 20 },
    { skip: !project },
  );
  const { data: tasksResponse } = useGetTasksQuery(
    { projectId: project?.id ?? "" },
    { skip: !project },
  );
  const { data: assigneeCandidates = [] } = useGetProjectAssigneeCandidatesQuery(project?.id ?? "", {
    skip: !project,
  });
  const { data: sprintResponse } = useGetDeliverySprintsQuery(
    { projectId: project?.id ?? "", limit: 20 },
    { skip: !project },
  );
  const { data: releaseResponse } = useGetDeliveryReleasesQuery(
    { projectId: project?.id ?? "", limit: 20 },
    { skip: !project },
  );
  const [createMessage, { isLoading: isSending }] = useCreateProjectWorkspaceMessageMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [createTaskTodo, { isLoading: isCreatingTodo }] = useCreateTaskTodoMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createSprint, { isLoading: isCreatingSprint }] = useCreateDeliverySprintMutation();
  const [createRelease, { isLoading: isCreatingRelease }] = useCreateDeliveryReleaseMutation();

  useEffect(() => {
    if (!project?.id || !accessToken) {
      return;
    }
    const socket = createWorkspaceSocket(accessToken);
    const joinPayload = { projectId: project.id, tabKey: workspaceTabKey };
    socket.emit("project:join", joinPayload);
    const onWorkspaceUpdate = (event: WorkspaceUpdateEvent) => {
      if (event.projectId !== project.id || event.tabKey !== workspaceTabKey) {
        return;
      }
      if (event.sequence <= lastSequenceRef.current) {
        return;
      }
      lastSequenceRef.current = event.sequence;
      const message = (event.payload?.message ?? null) as WorkspaceMessage | null;
      if (event.event === "message.created" && message) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceMessages",
            { projectId: project.id, tabKey: workspaceTabKey },
            (draft) => {
              const exists = draft.some((item) => item.id === message.id);
              if (!exists) {
                draft.push(message);
              }
            },
          ),
        );
      }
    };
    socket.on("workspace:update", onWorkspaceUpdate);
    return () => {
      socket.emit("project:leave", joinPayload);
      socket.off("workspace:update", onWorkspaceUpdate);
      socket.disconnect();
    };
  }, [accessToken, dispatch, project?.id, workspaceTabKey]);

  if (role !== "project-manager") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (!clientId || !serviceKey) {
    return <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">Geçersiz workspace isteği.</Card>;
  }

  if (isLoading) {
    return <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-[#A0A0A0]">Workspace yükleniyor...</Card>;
  }

  if (isError) {
    return <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">{extractApiErrorMessage(error, "Workspace alınamadı.")}</Card>;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to={`/employee/project-manager/clients/${clientId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Müşteri Hizmetlerine Dön
          </Button>
        </Link>
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Bu hizmet için henüz proje oluşturulmamış.
        </Card>
      </div>
    );
  }

  const messagesByParent = buildMessageTree(workspaceMessages);
  const rootMessages = messagesByParent.get("root") ?? [];
  const tasks = tasksResponse?.data ?? [];
  const files = filesResponse?.data ?? [];

  const handleSendMessage = async () => {
    if (!messageBody.trim()) {
      return;
    }
    await createMessage({
      projectId: project.id,
      tabKey: workspaceTabKey,
      body: messageBody.trim(),
      isInternal: isInternalMessage,
      parentMessageId: replyParentId ?? undefined,
    }).unwrap();
    setMessageBody("");
    setReplyParentId(null);
    setIsInternalMessage(false);
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || taskTitle.trim().length < 3) {
      return;
    }
    try {
      setActionError(null);
      const created = await createTask({
        projectId: project.id,
        title: taskTitle.trim(),
        description: taskDescription.trim().length > 0 ? taskDescription.trim() : null,
        status: "TODO",
        priority: "MEDIUM",
        assigneeUserId: taskAssigneeId || null,
      }).unwrap();

      if (taskTodoTitle.trim().length > 0) {
        await createTaskTodo({
          taskId: created.id,
          body: { title: taskTodoTitle.trim(), visibility: "INTERNAL" },
        }).unwrap();
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskAssigneeId("");
      setTaskTodoTitle("");
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Görev oluşturulamadı."));
    }
  };

  const handleCreateSprint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || sprintName.trim().length < 3) {
      return;
    }
    try {
      setActionError(null);
      await createSprint({
        projectId: project.id,
        name: sprintName.trim(),
        status: "PLANNED",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }).unwrap();
      setSprintName("");
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Sprint oluşturulamadı."));
    }
  };

  const handleCreateRelease = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || releaseTitle.trim().length < 3) {
      return;
    }
    try {
      setActionError(null);
      await createRelease({
        projectId: project.id,
        title: releaseTitle.trim(),
        environment: "STAGING",
        status: "PLANNED",
        version: releaseVersion.trim().length > 0 ? releaseVersion.trim() : null,
      }).unwrap();
      setReleaseTitle("");
      setReleaseVersion("");
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Release oluşturulamadı."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/employee/project-manager/clients/${clientId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Müşteri Hizmetlerine Dön
          </Button>
        </Link>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">{serviceKey} operasyon workspace</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge className={getProjectStatusBadgeClass(project.status)}>{getProjectStatusLabel(project.status)}</Badge>
          <Badge variant="outline">{project.serviceKey}</Badge>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(["OVERVIEW", "TASKS", "FILES", "MESSAGES", "REVISIONS", "REPORTS", "MEETINGS"] as WorkspaceViewTab[]).map((tab) => (
          <Button
            key={tab}
            type="button"
            variant={viewTab === tab ? "default" : "outline"}
            onClick={() => {
              setViewTab(tab);
              setSearchParams({ tab });
            }}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Görev Oluştur</h3>
          <form className="space-y-2" onSubmit={(event) => void handleCreateTask(event)}>
            <Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Görev başlığı" required />
            <Input value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Açıklama (opsiyonel)" />
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white"
              value={taskAssigneeId}
              onChange={(event) => setTaskAssigneeId(event.target.value)}
            >
              <option value="">Atanmamış</option>
              {assigneeCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.displayName ?? candidate.id} · {candidate.role}
                </option>
              ))}
            </select>
            <Input value={taskTodoTitle} onChange={(event) => setTaskTodoTitle(event.target.value)} placeholder="İlk checklist maddesi (opsiyonel)" />
            <Button type="submit" size="sm" disabled={isCreatingTask || isCreatingTodo}>
              {isCreatingTask || isCreatingTodo ? "Kaydediliyor..." : "Görev Ekle"}
            </Button>
          </form>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Sprint Oluştur</h3>
          <form className="space-y-2" onSubmit={(event) => void handleCreateSprint(event)}>
            <Input value={sprintName} onChange={(event) => setSprintName(event.target.value)} placeholder="Sprint adı" required />
            <Button type="submit" size="sm" disabled={isCreatingSprint}>
              {isCreatingSprint ? "Oluşturuluyor..." : "Sprint Ekle"}
            </Button>
          </form>
          <div className="mt-3 space-y-1">
            {(sprintResponse?.data ?? []).slice(0, 3).map((sprint) => (
              <p key={sprint.id} className="text-xs text-[#A0A0A0]">{sprint.name} · %{sprint.progressPercent}</p>
            ))}
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Release Planla</h3>
          <form className="space-y-2" onSubmit={(event) => void handleCreateRelease(event)}>
            <Input value={releaseTitle} onChange={(event) => setReleaseTitle(event.target.value)} placeholder="Release başlığı" required />
            <Input value={releaseVersion} onChange={(event) => setReleaseVersion(event.target.value)} placeholder="Versiyon (opsiyonel)" />
            <Button type="submit" size="sm" disabled={isCreatingRelease}>
              {isCreatingRelease ? "Oluşturuluyor..." : "Release Ekle"}
            </Button>
          </form>
          <div className="mt-3 space-y-1">
            {(releaseResponse?.data ?? []).slice(0, 3).map((release) => (
              <p key={release.id} className="text-xs text-[#A0A0A0]">{release.title} · {release.status}</p>
            ))}
          </div>
        </Card>
      </div>

      {actionError ? (
        <Card className="border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{actionError}</Card>
      ) : null}

      {viewTab === "OVERVIEW" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniStat icon={ListChecks} label="Görevler" value={String(tasks.length)} />
          <MiniStat icon={Folder} label="Dosyalar" value={String(files.length)} />
          <MiniStat icon={MessageSquare} label="Mesajlar" value={String(workspaceMessages.length)} />
        </div>
      ) : null}

      {viewTab === "TASKS" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Görevler</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="rounded border border-white/[0.06] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-white">{task.title}</p>
                  <Badge className={getTaskStatusBadgeClass(task.status)}>{getTaskStatusLabel(task.status)}</Badge>
                </div>
                {task.todos && task.todos.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {task.todos.map((todo) => (
                      <label key={todo.id} className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                        <input
                          type="checkbox"
                          checked={todo.isCompleted}
                          disabled={isTogglingTodo}
                          onChange={(event) =>
                            void toggleTaskTodo({
                              taskId: task.id,
                              todoId: todo.id,
                              body: { isCompleted: event.target.checked },
                            })
                          }
                        />
                        {todo.title}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {tasks.length === 0 ? <p className="text-sm text-[#A0A0A0]">Görev bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}

      {viewTab === "FILES" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Dosyalar</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="rounded border border-white/[0.06] p-3">
                <p className="text-white">{file.title}</p>
                <p className="text-xs text-[#A0A0A0]">{file.originalFileName}</p>
              </div>
            ))}
            {files.length === 0 ? <p className="text-sm text-[#A0A0A0]">Dosya bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}

      {viewTab === "MESSAGES" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Mesajlar / Soru-Cevap</h3>
          <div className="mb-4 rounded border border-white/[0.06] bg-white/5 p-3">
            {replyParentId ? <p className="mb-2 text-xs text-[#d8ff8f]">Yanıtlanan mesaj: {replyParentId.slice(0, 8)}...</p> : null}
            <Input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Mesaj yazın" />
            <label className="mt-2 flex items-center gap-2 text-xs text-[#A0A0A0]">
              <input
                type="checkbox"
                checked={isInternalMessage}
                onChange={(event) => setIsInternalMessage(event.target.checked)}
              />
              Internal not (client görmez)
            </label>
            <div className="mt-2 flex gap-2">
              <Button type="button" onClick={() => void handleSendMessage()} disabled={isSending}>
                Gönder
              </Button>
              {replyParentId ? (
                <Button type="button" variant="outline" onClick={() => setReplyParentId(null)}>
                  Yanıtı İptal Et
                </Button>
              ) : null}
            </div>
          </div>
          <div className="space-y-3">
            {rootMessages.map((message) => (
              <MessageNode
                key={message.id}
                message={message}
                map={messagesByParent}
                depth={0}
                onReply={(id) => setReplyParentId(id)}
              />
            ))}
            {rootMessages.length === 0 ? <p className="text-sm text-[#A0A0A0]">Mesaj bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}

      {viewTab === "REVISIONS" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Revizyonlar</h3>
          <div className="space-y-2">
            {revisions.map((revision) => (
              <div key={revision.id} className="rounded border border-white/[0.06] p-3">
                <p className="text-white">{revision.title}</p>
                <p className="text-xs text-[#A0A0A0]">{revision.status}</p>
              </div>
            ))}
            {revisions.length === 0 ? <p className="text-sm text-[#A0A0A0]">Revizyon bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}

      {viewTab === "REPORTS" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Raporlar</h3>
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="rounded border border-white/[0.06] p-3">
                <p className="text-white">{report.summary}</p>
                <p className="text-xs text-[#A0A0A0]">{new Date(report.weekStartDate).toLocaleDateString("tr-TR")}</p>
              </div>
            ))}
            {reports.length === 0 ? <p className="text-sm text-[#A0A0A0]">Rapor bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}

      {viewTab === "MEETINGS" ? (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <h3 className="mb-3 text-lg font-semibold">Toplantılar</h3>
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="rounded border border-white/[0.06] p-3">
                <p className="text-white">{meeting.title}</p>
                <p className="text-xs text-[#A0A0A0]">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {new Date(meeting.preferredStartAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
            {meetings.length === 0 ? <p className="text-sm text-[#A0A0A0]">Toplantı kaydı bulunmuyor.</p> : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function buildMessageTree(messages: WorkspaceMessage[]): Map<string, WorkspaceMessage[]> {
  const map = new Map<string, WorkspaceMessage[]>();
  for (const message of messages) {
    const key = message.parentMessageId ?? "root";
    const bucket = map.get(key) ?? [];
    bucket.push(message);
    map.set(key, bucket);
  }
  return map;
}

function MessageNode({
  message,
  map,
  depth,
  onReply,
}: {
  message: WorkspaceMessage;
  map: Map<string, WorkspaceMessage[]>;
  depth: number;
  onReply: (id: string) => void;
}) {
  const replies = map.get(message.id) ?? [];
  return (
    <div className="space-y-2">
      <div
        className="rounded border border-white/[0.06] bg-white/5 p-3"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <p className="text-sm text-white">{message.body}</p>
        <p className="mt-1 text-xs text-[#A0A0A0]">
          {new Date(message.createdAt).toLocaleString("tr-TR")} · {message.author?.displayName ?? "Kullanıcı"}
        </p>
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => onReply(message.id)}>
          Yanıtla
        </Button>
      </div>
      {replies.map((reply) => (
        <MessageNode key={reply.id} message={reply} map={map} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-[#A0A0A0]">
        <Icon className="h-4 w-4 text-[#AAFF01]" />
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function mapServiceViewTabToWorkspaceTab(tab: WorkspaceViewTab): WorkspaceTabKey {
  if (tab === "TASKS") return "TASKS";
  if (tab === "FILES") return "FILES";
  if (tab === "MESSAGES") return "MESSAGES";
  if (tab === "REVISIONS") return "REVISIONS";
  if (tab === "REPORTS") return "REPORTS";
  if (tab === "MEETINGS") return "MEETINGS";
  return "OVERVIEW";
}

function isWebAppLikeService(serviceKey?: string): boolean {
  const normalized = normalizeServiceKey(serviceKey);
  return normalized === "web-app" || normalized === "mobile-app" || normalized === "landing-pages";
}

function normalizeServiceKey(value?: string | null): string {
  return (value ?? "").toLowerCase().replace(/_/g, "-").trim();
}

function parseWorkspaceViewTab(raw: string | null): WorkspaceViewTab {
  const allowed: WorkspaceViewTab[] = ["OVERVIEW", "TASKS", "FILES", "MESSAGES", "REVISIONS", "REPORTS", "MEETINGS"];
  if (!raw) {
    return DEFAULT_VIEW_TAB;
  }
  const candidate = raw.toUpperCase() as WorkspaceViewTab;
  return allowed.includes(candidate) ? candidate : DEFAULT_VIEW_TAB;
}
