import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Folder,
  ListChecks,
  MessageSquare,
  Rocket,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { selectAccessToken, selectCurrentEmployeeRole } from "../../features/auth/authSelectors";
import {
  useCreateDeliveryReleaseMutation,
  useCreateDeliverySprintMutation,
  useGetDeliveryReleasesQuery,
  useGetDeliverySprintsQuery,
  useUpdateDeliverySprintMutation,
} from "../../features/delivery/deliveryApi";
import type { DeliverySprintStatus } from "../../features/delivery/deliveryTypes";
import {
  projectsApi,
  useCreateProjectWorkspaceRevisionMutation,
  useCreateProjectWorkspaceMessageMutation,
  useGetProjectAssigneeCandidatesQuery,
  useGetProjectFilesQuery,
  useGetProjectWorkspaceMeetingRequestsQuery,
  useGetProjectWorkspaceMessagesQuery,
  useGetProjectWorkspaceReportsQuery,
  useGetProjectWorkspaceRevisionsQuery,
  useGetProjectsQuery,
  useUpdateProjectWorkspaceRevisionStatusMutation,
} from "../../features/projects/projectsApi";
import type {
  WorkspaceMessage,
  WorkspaceRevision,
  WorkspaceRevisionStatus,
  WorkspaceTabKey,
} from "../../features/projects/projectsTypes";
import { extractApiErrorMessage, getProjectStatusBadgeClass, getProjectStatusLabel } from "../../features/projects/projectsUtils";
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from "../../features/projects/workspaceSocket";
import {
  useCreateTaskMutation,
  useCreateTaskTodoMutation,
  useDeleteTaskTodoMutation,
  useGetTasksQuery,
  useToggleTaskTodoMutation,
  useUpdateTaskMutation,
  useUpdateTaskTodoMutation,
} from "../../features/tasks/tasksApi";
import type {
  TaskStatus,
  Task,
  TaskEnvironment,
  TaskSeverity,
  TaskTodo,
  TaskType,
  TaskWorkstream,
  UpdateTaskRequest,
} from "../../features/tasks/tasksTypes";
import {
  TASK_ENVIRONMENT_OPTIONS,
  TASK_SEVERITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
  TASK_WORKSTREAM_OPTIONS,
  getTaskEnvironmentLabel,
  getTaskSeverityLabel,
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
  getTaskTypeLabel,
  getTaskWorkstreamLabel,
} from "../../features/tasks/tasksUtils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type WorkspaceViewTab = "OVERVIEW" | "TASKS" | "FILES" | "MESSAGES" | "REVISIONS" | "REPORTS" | "MEETINGS";
const DEFAULT_VIEW_TAB: WorkspaceViewTab = "OVERVIEW";
const WORKSPACE_TABS: WorkspaceViewTab[] = ["OVERVIEW", "TASKS", "FILES", "MESSAGES", "REVISIONS", "REPORTS", "MEETINGS"];
type EmployeePanelTargetTab =
  | "GOREVLERIM"
  | "FRONTEND"
  | "BACKEND_API"
  | "BUGLAR"
  | "REVIZYONLAR"
  | "TEST_YAYIN"
  | "UI_TASARIMLAR";

const TASK_TARGET_TAB_LABELS: Record<EmployeePanelTargetTab, string> = {
  GOREVLERIM: "Görevlerim",
  FRONTEND: "Frontend",
  BACKEND_API: "Backend / API",
  BUGLAR: "Buglar",
  REVIZYONLAR: "Revizyonlar",
  TEST_YAYIN: "Test & Yayın",
  UI_TASARIMLAR: "UI Tasarımları",
};

const TASK_TARGET_TAB_PRESETS: Record<EmployeePanelTargetTab, { type: TaskType; workstream: TaskWorkstream }> = {
  GOREVLERIM: { type: "FEATURE", workstream: "FULLSTACK" },
  FRONTEND: { type: "FEATURE", workstream: "FRONTEND" },
  BACKEND_API: { type: "FEATURE", workstream: "BACKEND" },
  BUGLAR: { type: "BUG", workstream: "FULLSTACK" },
  REVIZYONLAR: { type: "REVISION", workstream: "UI_INTEGRATION" },
  TEST_YAYIN: { type: "DEPLOYMENT", workstream: "DEVOPS" },
  UI_TASARIMLAR: { type: "FEATURE", workstream: "UI_INTEGRATION" },
};

const TASK_PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number];
const SPRINT_STATUS_OPTIONS: DeliverySprintStatus[] = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];

const ASSIGNEE_ROLE_TARGET_TABS: Partial<Record<string, EmployeePanelTargetTab[]>> = {
  DESIGNER: ["UI_TASARIMLAR", "REVIZYONLAR", "GOREVLERIM"],
  DEVELOPER: ["FRONTEND", "BACKEND_API", "BUGLAR", "TEST_YAYIN", "GOREVLERIM"],
  PROJECT_MANAGER: ["GOREVLERIM", "REVIZYONLAR"],
  PERFORMANCE_SPECIALIST: ["GOREVLERIM", "TEST_YAYIN"],
  SOCIAL_MEDIA_SPECIALIST: ["GOREVLERIM", "REVIZYONLAR"],
  SUPPORT_SPECIALIST: ["GOREVLERIM", "BUGLAR", "TEST_YAYIN"],
  SEO_SPECIALIST: ["GOREVLERIM", "BUGLAR"],
  CRM_SPECIALIST: ["GOREVLERIM"],
};

const ASSIGNEE_ROLE_LABELS: Partial<Record<string, string>> = {
  DESIGNER: "Designer",
  DEVELOPER: "Developer",
  PROJECT_MANAGER: "Project Manager",
  PERFORMANCE_SPECIALIST: "Performance Specialist",
  SOCIAL_MEDIA_SPECIALIST: "Social Media Specialist",
  SUPPORT_SPECIALIST: "Support Specialist",
  SEO_SPECIALIST: "SEO Specialist",
  CRM_SPECIALIST: "CRM Specialist",
};

const DESIGNER_ALLOWED_TASK_TYPES: TaskType[] = ["FEATURE", "REVISION"];

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
  const [taskSprintId, setTaskSprintId] = useState("");
  const [taskTodoDraft, setTaskTodoDraft] = useState("");
  const [taskTargetTab, setTaskTargetTab] = useState<EmployeePanelTargetTab>("GOREVLERIM");
  const [taskType, setTaskType] = useState<TaskType>("FEATURE");
  const [taskWorkstream, setTaskWorkstream] = useState<TaskWorkstream>("FULLSTACK");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("MEDIUM");
  const [taskSeverity, setTaskSeverity] = useState<TaskSeverity>("MEDIUM");
  const [taskEnvironment, setTaskEnvironment] = useState<TaskEnvironment>("STAGING");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState(() => toDateInput(new Date()));
  const [sprintEndDate, setSprintEndDate] = useState(() =>
    toDateInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
  );
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [revisionTitle, setRevisionTitle] = useState("");
  const [revisionDescription, setRevisionDescription] = useState("");
  const [revisionAssigneeId, setRevisionAssigneeId] = useState("");
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [revisionAssigneeDrafts, setRevisionAssigneeDrafts] = useState<Record<string, string>>({});
  const [revisionStatusDrafts, setRevisionStatusDrafts] = useState<Record<string, WorkspaceRevisionStatus>>({});
  const lastSequenceRef = useRef(0);
  const lastAssigneeRoleRef = useRef<string | null>(null);
  const taskCreatePanelRef = useRef<HTMLDivElement | null>(null);
  const taskTitleInputRef = useRef<HTMLInputElement | null>(null);

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
  const sprints = sprintResponse?.data ?? [];
  const tasks = tasksResponse?.data ?? [];
  const files = filesResponse?.data ?? [];
  const releases = releaseResponse?.data ?? [];
  const tasksBySprint = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = task.sprintId ?? "UNASSIGNED";
      const bucket = map.get(key) ?? [];
      bucket.push(task);
      map.set(key, bucket);
    }
    return map;
  }, [tasks]);
  const unassignedTasks = tasksBySprint.get("UNASSIGNED") ?? [];
  const [createMessage, { isLoading: isSending }] = useCreateProjectWorkspaceMessageMutation();
  const [createRevision, { isLoading: isCreatingRevision }] = useCreateProjectWorkspaceRevisionMutation();
  const [updateRevisionStatus, { isLoading: isUpdatingRevisionStatus }] =
    useUpdateProjectWorkspaceRevisionStatusMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [createTaskTodo, { isLoading: isCreatingTodo }] = useCreateTaskTodoMutation();
  const [updateTaskTodo, { isLoading: isUpdatingTodo }] = useUpdateTaskTodoMutation();
  const [deleteTaskTodo, { isLoading: isDeletingTodo }] = useDeleteTaskTodoMutation();
  const [toggleTaskTodo, { isLoading: isTogglingTodo }] = useToggleTaskTodoMutation();
  const [createSprint, { isLoading: isCreatingSprint }] = useCreateDeliverySprintMutation();
  const [updateSprint, { isLoading: isUpdatingSprint }] = useUpdateDeliverySprintMutation();
  const [createRelease, { isLoading: isCreatingRelease }] = useCreateDeliveryReleaseMutation();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkMoveSprintId, setBulkMoveSprintId] = useState("");
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [focusedSprintId, setFocusedSprintId] = useState<string | null>(null);
  const selectedAssigneeRole = useMemo(
    () => assigneeCandidates.find((candidate) => candidate.id === taskAssigneeId)?.role ?? null,
    [assigneeCandidates, taskAssigneeId],
  );
  const targetTabOptions = useMemo(
    () => getTargetTabsByAssigneeRole(selectedAssigneeRole),
    [selectedAssigneeRole],
  );
  const taskTypeOptions = useMemo(
    () =>
      selectedAssigneeRole === "DESIGNER" ? DESIGNER_ALLOWED_TASK_TYPES : TASK_TYPE_OPTIONS,
    [selectedAssigneeRole],
  );
  const taskWorkstreamOptions = useMemo(
    () =>
      selectedAssigneeRole === "DESIGNER"
        ? (["UI_INTEGRATION"] as TaskWorkstream[])
        : TASK_WORKSTREAM_OPTIONS,
    [selectedAssigneeRole],
  );

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
      const revisionPayload = (event.payload?.revision ?? null) as WorkspaceRevision | null;
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
      if (event.event === "revision.created" && revisionPayload) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceRevisions",
            { projectId: project.id },
            (draft) => {
              const exists = draft.some((item) => item.id === revisionPayload.id);
              if (!exists) {
                draft.unshift(revisionPayload);
              }
            },
          ),
        );
      }
      if (event.event === "revision.updated" && revisionPayload) {
        dispatch(
          projectsApi.util.updateQueryData(
            "getProjectWorkspaceRevisions",
            { projectId: project.id },
            (draft) => {
              const target = draft.find((item) => item.id === revisionPayload.id);
              if (target) {
                Object.assign(target, revisionPayload);
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

  useEffect(() => {
    if (sprints.length === 0) {
      setTaskSprintId("");
      return;
    }
    if (!taskSprintId) {
      setTaskSprintId(sprints[0]?.id ?? "");
      return;
    }
    const exists = sprints.some((sprint) => sprint.id === taskSprintId);
    if (!exists) {
      setTaskSprintId(sprints[0]?.id ?? "");
    }
  }, [sprints, taskSprintId]);

  useEffect(() => {
    if (sprints.length === 0) {
      setBulkMoveSprintId("");
      return;
    }
    if (!bulkMoveSprintId) {
      setBulkMoveSprintId(sprints[0]?.id ?? "");
      return;
    }
    const exists = sprints.some((sprint) => sprint.id === bulkMoveSprintId);
    if (!exists) {
      setBulkMoveSprintId(sprints[0]?.id ?? "");
    }
  }, [bulkMoveSprintId, sprints]);

  useEffect(() => {
    setSelectedTaskIds((prev) => {
      const next = prev.filter((taskId) => tasks.some((task) => task.id === taskId));
      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [tasks]);

  useEffect(() => {
    const preset = TASK_TARGET_TAB_PRESETS[taskTargetTab];
    setTaskType(preset.type);
    setTaskWorkstream(preset.workstream);
    if (preset.type === "BUG") {
      setTaskPriority((prev) => (prev === "LOW" ? "MEDIUM" : prev));
    }
  }, [taskTargetTab]);

  useEffect(() => {
    if (targetTabOptions.length === 0) {
      return;
    }
    if (!targetTabOptions.includes(taskTargetTab)) {
      setTaskTargetTab(targetTabOptions[0]);
    }
  }, [targetTabOptions, taskTargetTab]);

  useEffect(() => {
    if (lastAssigneeRoleRef.current === selectedAssigneeRole) {
      return;
    }
    lastAssigneeRoleRef.current = selectedAssigneeRole;
    if (targetTabOptions.length > 0) {
      setTaskTargetTab(targetTabOptions[0]);
    }
  }, [selectedAssigneeRole, targetTabOptions]);

  useEffect(() => {
    if (selectedAssigneeRole !== "DESIGNER") {
      return;
    }
    setTaskWorkstream("UI_INTEGRATION");
    setTaskType((prev) => (prev === "REVISION" ? "REVISION" : "FEATURE"));
  }, [selectedAssigneeRole]);

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

  const checklistPreview = parseChecklistLines(taskTodoDraft);
  const completedTaskCount = tasks.filter((task) => task.status === "DONE").length;
  const totalTodoCount = tasks.reduce((sum, task) => sum + (task.todos?.length ?? 0), 0);
  const completedTodoCount = tasks.reduce(
    (sum, task) => sum + (task.todos?.filter((todo) => todo.isCompleted).length ?? 0),
    0,
  );
  const workspaceProgress = totalTodoCount > 0 ? Math.round((completedTodoCount / totalTodoCount) * 100) : 0;
  const latestTask = tasks[0] ?? null;
  const latestRevision = revisions[0] ?? null;
  const latestReport = reports[0] ?? null;
  const latestMeeting = meetings[0] ?? null;
  const recentFile = files[0] ?? null;
  const roadmapUpcomingCount =
    sprints.filter((sprint) => sprint.status === "PLANNED" || sprint.status === "ACTIVE").length +
    releases.filter((release) => release.status === "PLANNED" || release.status === "TESTING" || release.status === "READY").length;

  const handleViewTabChange = (nextTab: string) => {
    const parsedTab = parseWorkspaceViewTab(nextTab);
    setViewTab(parsedTab);
    setSearchParams({ tab: parsedTab });
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim()) {
      return;
    }
    try {
      setActionError(null);
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
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Mesaj gönderilemedi."));
    }
  };

  const handleCreateRevision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || revisionTitle.trim().length < 2 || revisionDescription.trim().length < 2) {
      return;
    }
    try {
      setActionError(null);
      await createRevision({
        projectId: project.id,
        title: revisionTitle.trim(),
        description: revisionDescription.trim(),
        assignedToUserId: revisionAssigneeId || null,
      }).unwrap();
      setRevisionTitle("");
      setRevisionDescription("");
      setRevisionAssigneeId("");
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Revizyon oluşturulamadı."));
    }
  };

  const handleUpdateRevision = async ({
    revisionId,
    status,
    assignedToUserId,
  }: {
    revisionId: string;
    status: WorkspaceRevisionStatus;
    assignedToUserId?: string | null;
  }) => {
    if (!project) {
      return;
    }
    try {
      setActionError(null);
      await updateRevisionStatus({
        projectId: project.id,
        revisionId,
        status,
        assignedToUserId,
        note: revisionNotes[revisionId]?.trim() || undefined,
      }).unwrap();
      setRevisionNotes((prev) => {
        if (!(revisionId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[revisionId];
        return next;
      });
      setRevisionStatusDrafts((prev) => {
        if (!(revisionId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[revisionId];
        return next;
      });
      if (assignedToUserId !== undefined) {
        setRevisionAssigneeDrafts((prev) => ({
          ...prev,
          [revisionId]: assignedToUserId ?? "",
        }));
      }
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Revizyon güncellenemedi."));
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || taskTitle.trim().length < 3) {
      return;
    }
    if (!taskSprintId) {
      setActionError("Görev oluşturmak için mevcut bir sprint seçmelisiniz.");
      return;
    }
    try {
      setActionError(null);
      const normalizedTask = normalizeTaskByAssigneeRole({
        assigneeRole: selectedAssigneeRole,
        type: taskType,
        workstream: taskWorkstream,
      });
      const created = await createTask({
        projectId: project.id,
        title: taskTitle.trim(),
        description: taskDescription.trim().length > 0 ? taskDescription.trim() : null,
        status: "TODO",
        priority: taskPriority,
        type: normalizedTask.type,
        workstream: normalizedTask.workstream,
        severity: normalizedTask.type === "BUG" ? taskSeverity : null,
        environment: normalizedTask.type === "BUG" ? taskEnvironment : null,
        assigneeUserId: taskAssigneeId || null,
        sprintId: taskSprintId,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      }).unwrap();

      const checklistLines = parseChecklistLines(taskTodoDraft);
      for (const [index, title] of checklistLines.entries()) {
        await createTaskTodo({
          taskId: created.id,
          body: { title, visibility: "INTERNAL", sortOrder: index },
        }).unwrap();
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskAssigneeId("");
      setTaskTodoDraft("");
      setTaskDueDate("");
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Görev oluşturulamadı."));
    }
  };

  const handleCreateSprint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || sprintName.trim().length < 3) {
      return;
    }
    if (!sprintStartDate || !sprintEndDate) {
      setActionError("Yol haritası sprinti için başlangıç ve bitiş tarihi zorunludur.");
      return;
    }
    if (sprintEndDate < sprintStartDate) {
      setActionError("Sprint bitiş tarihi başlangıç tarihinden önce olamaz.");
      return;
    }
    try {
      setActionError(null);
      await createSprint({
        projectId: project.id,
        name: sprintName.trim(),
        goal: sprintGoal.trim().length > 0 ? sprintGoal.trim() : null,
        status: "PLANNED",
        startDate: new Date(sprintStartDate).toISOString(),
        endDate: new Date(sprintEndDate).toISOString(),
      }).unwrap();
      setSprintName("");
      setSprintGoal("");
      setSprintStartDate(toDateInput(new Date()));
      setSprintEndDate(toDateInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)));
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Sprint oluşturulamadı."));
    }
  };

  const handleSprintStatusChange = async (sprintId: string, status: DeliverySprintStatus) => {
    try {
      setActionError(null);
      await updateSprint({
        id: sprintId,
        body: { status },
      }).unwrap();
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Sprint durumu güncellenemedi."));
    }
  };

  const activateTaskCreateForSprint = (sprintId: string) => {
    setFocusedSprintId(sprintId);
    setTaskSprintId(sprintId);
    setBulkMoveSprintId(sprintId);
    setViewTab("TASKS");
    setSearchParams({ tab: "TASKS" });
    setActionError(null);
    taskCreatePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      taskTitleInputRef.current?.focus();
    }, 80);
  };

  const handleOpenSprintTaskPlanner = (sprintId: string) => {
    activateTaskCreateForSprint(sprintId);
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

  const handleUpdateTask = async (taskId: string, body: UpdateTaskRequest) => {
    try {
      setActionError(null);
      await updateTask({ id: taskId, body }).unwrap();
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Görev güncellenemedi."));
      throw mutationError;
    }
  };

  const handleCreateTaskTodo = async (taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    try {
      setActionError(null);
      await createTaskTodo({
        taskId,
        body: { title: trimmed, visibility: "INTERNAL" },
      }).unwrap();
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Checklist maddesi eklenemedi."));
      throw mutationError;
    }
  };

  const handleUpdateTaskTodo = async (taskId: string, todoId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    try {
      setActionError(null);
      await updateTaskTodo({
        taskId,
        todoId,
        body: { title: trimmed },
      }).unwrap();
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Checklist maddesi güncellenemedi."));
      throw mutationError;
    }
  };

  const handleDeleteTaskTodo = async (taskId: string, todoId: string) => {
    try {
      setActionError(null);
      await deleteTaskTodo({ taskId, todoId }).unwrap();
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Checklist maddesi silinemedi."));
      throw mutationError;
    }
  };

  const handleTaskSelectionChange = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((prev) => {
      if (checked) {
        return prev.includes(taskId) ? prev : [...prev, taskId];
      }
      return prev.filter((id) => id !== taskId);
    });
  };

  const toggleSprintSelection = (taskIds: string[]) => {
    if (taskIds.length === 0) {
      return;
    }
    setSelectedTaskIds((prev) => {
      const allSelected = taskIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !taskIds.includes(id));
      }
      const next = new Set(prev);
      for (const id of taskIds) {
        next.add(id);
      }
      return Array.from(next);
    });
  };

  const handleBulkMoveToSprint = async () => {
    if (!bulkMoveSprintId) {
      setActionError("Toplu taşıma için hedef sprint seçin.");
      return;
    }
    if (selectedTaskIds.length === 0) {
      setActionError("Toplu taşıma için en az bir görev seçin.");
      return;
    }

    const tasksToMove = tasks.filter(
      (task) => selectedTaskIds.includes(task.id) && task.sprintId !== bulkMoveSprintId,
    );
    if (tasksToMove.length === 0) {
      setActionError("Seçilen görevler zaten hedef sprintte.");
      return;
    }

    try {
      setActionError(null);
      setIsBulkMoving(true);
      await Promise.all(
        tasksToMove.map((task) =>
          updateTask({ id: task.id, body: { sprintId: bulkMoveSprintId } }).unwrap(),
        ),
      );
      setSelectedTaskIds([]);
    } catch (mutationError) {
      setActionError(extractApiErrorMessage(mutationError, "Görevler sprint'e taşınamadı."));
    } finally {
      setIsBulkMoving(false);
    }
  };

  const isTaskMutationBusy =
    isCreatingTask ||
    isUpdatingTask ||
    isCreatingTodo ||
    isUpdatingTodo ||
    isDeletingTodo ||
    isTogglingTodo ||
    isBulkMoving;

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

      <Card className="overflow-hidden border-white/[0.06] bg-[#141414]">
        <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getProjectStatusBadgeClass(project.status)}>{getProjectStatusLabel(project.status)}</Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                {project.serviceKey}
              </Badge>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">{project.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A0A0A0]">
                Proje yöneticisi workspace: görevler, teslimatlar ve müşteri iletişimi tek akışta yönetilir.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <WorkspaceStat icon={ListChecks} label="Açık Görev" value={String(tasks.length)} hint={`${completedTaskCount} tamamlandı`} />
              <WorkspaceStat icon={Folder} label="Dosya" value={String(files.length)} hint={recentFile ? recentFile.title : "Henüz dosya yok"} />
              <WorkspaceStat icon={MessageSquare} label="Mesaj" value={String(workspaceMessages.length)} hint={rootMessages.length > 0 ? "Aktif iletişim var" : "Soru-cevap bekliyor"} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Checklist ilerlemesi</p>
                <p className="text-xs text-[#A0A0A0]">Tüm görev todo maddeleri üzerinden hesaplanır.</p>
              </div>
              <span className="text-2xl font-semibold text-[#AAFF01]">%{workspaceProgress}</span>
            </div>
            <Progress value={workspaceProgress} className="mt-4 h-2.5 bg-white/10 [&>[data-slot=progress-indicator]]:bg-[#AAFF01]" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CompactMetric label="Tamamlanan madde" value={`${completedTodoCount}/${totalTodoCount || 0}`} />
              <CompactMetric label="Aktif sprint" value={sprints[0]?.name ?? "Planlanmadı"} />
              <CompactMetric label="Son release" value={releases[0]?.title ?? "Beklemede"} />
              <CompactMetric label="Atama havuzu" value={`${assigneeCandidates.length} kişi`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <div ref={taskCreatePanelRef}>
          <ActionPanel
            icon={ListChecks}
            title="Görev Oluştur"
            description="Görevi hedef sekmeye yönlendir, çalışan ataması yap ve checklist ile başlat."
            footer={checklistPreview.length > 0 ? `${checklistPreview.length} checklist maddesi hazır` : "Checklist isteğe bağlı"}
          >
            <form className="space-y-3" onSubmit={(event) => void handleCreateTask(event)}>
              <Input
                ref={taskTitleInputRef}
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Görev başlığı"
                required
              />
            <Textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Kısa kapsam, teslim beklentisi veya ekip notu"
              className="min-h-24 bg-black/20"
            />
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
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
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={taskTargetTab}
              onChange={(event) => setTaskTargetTab(event.target.value as EmployeePanelTargetTab)}
            >
              {targetTabOptions.map((key) => (
                <option key={key} value={key}>
                  Hedef Sekme: {TASK_TARGET_TAB_LABELS[key]}
                </option>
              ))}
            </select>
            {selectedAssigneeRole ? (
              <p className="text-xs text-[#9AA0AA]">
                Atanan rol: <span className="text-[#D8D8D8]">{getAssigneeRoleLabel(selectedAssigneeRole)}</span>. Sekme seçenekleri role göre filtrelendi.
              </p>
            ) : (
              <p className="text-xs text-[#9AA0AA]">
                Çalışan seçmezseniz genel sekme havuzu kullanılır.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                value={taskType}
                onChange={(event) => setTaskType(event.target.value as TaskType)}
              >
                {taskTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    Tür: {getTaskTypeLabel(type)}
                  </option>
                ))}
              </select>
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                value={taskWorkstream}
                onChange={(event) => setTaskWorkstream(event.target.value as TaskWorkstream)}
                disabled={selectedAssigneeRole === "DESIGNER"}
              >
                {taskWorkstreamOptions.map((workstream) => (
                  <option key={workstream} value={workstream}>
                    Workstream: {getTaskWorkstreamLabel(workstream)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}
              >
                {TASK_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    Öncelik: {priority}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(event) => setTaskDueDate(event.target.value)}
                className="bg-black/20"
              />
            </div>
            {taskType === "BUG" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                  value={taskSeverity}
                  onChange={(event) => setTaskSeverity(event.target.value as TaskSeverity)}
                >
                  {TASK_SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity} value={severity}>
                      Severity: {getTaskSeverityLabel(severity)}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                  value={taskEnvironment}
                  onChange={(event) => setTaskEnvironment(event.target.value as TaskEnvironment)}
                >
                  {TASK_ENVIRONMENT_OPTIONS.map((environment) => (
                    <option key={environment} value={environment}>
                      Ortam: {getTaskEnvironmentLabel(environment)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={taskSprintId}
              onChange={(event) => setTaskSprintId(event.target.value)}
              required
              disabled={sprints.length === 0}
            >
              {sprints.length === 0 ? <option value="">Önce sprint oluşturun</option> : null}
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} · {sprint.status}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#9AA0AA]">
              Seçtiğiniz hedef sekmeye göre görevin türü/workstream’i otomatik set edilir; isterseniz manuel değiştirebilirsiniz.
            </p>
            {selectedAssigneeRole === "DESIGNER" ? (
              <p className="text-xs text-[#E8FFC2]">
                Designer seçildiği için workstream otomatik olarak UI Integration'a kilitlendi.
              </p>
            ) : null}
            <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Checklist Maddeleri</p>
                  <p className="text-xs text-[#A0A0A0]">Her satır ayrı todo olarak kaydedilir.</p>
                </div>
                <span className="text-xs text-[#AAFF01]">{checklistPreview.length} madde</span>
              </div>
              <Textarea
                value={taskTodoDraft}
                onChange={(event) => setTaskTodoDraft(event.target.value)}
                placeholder={"Tasarım onayı al\nHomepage responsive kontrol\nStaging deploy sonrası QA"}
                className="min-h-28 bg-transparent"
              />
              {checklistPreview.length > 0 ? (
                <div className="space-y-1 rounded-lg bg-white/5 p-2">
                  {checklistPreview.slice(0, 4).map((item, index) => (
                    <p key={`${item}-${index}`} className="text-xs text-[#D8D8D8]">
                      {index + 1}. {item}
                    </p>
                  ))}
                  {checklistPreview.length > 4 ? (
                    <p className="text-xs text-[#A0A0A0]">+{checklistPreview.length - 4} madde daha</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={isCreatingTask || isCreatingTodo || sprints.length === 0 || !taskSprintId}
            >
              {isCreatingTask || isCreatingTodo ? "Kaydediliyor..." : "Görevi ve Checklist'i Oluştur"}
            </Button>
            {sprints.length === 0 ? (
              <p className="text-xs text-amber-300">
                Görev açmadan önce bu proje için en az bir sprint oluşturmalısınız.
              </p>
            ) : null}
            </form>
          </ActionPanel>
        </div>

        <ActionPanel
          icon={Rocket}
          title="Yol Haritası Sprinti Oluştur"
          description="Proje yol haritasını sprint bazlı planla ve hedefi netleştir."
          footer={sprints.length > 0 ? `${sprints.length} roadmap sprinti listelendi` : "Henüz roadmap sprinti yok"}
        >
          <form className="space-y-3" onSubmit={(event) => void handleCreateSprint(event)}>
            <Input value={sprintName} onChange={(event) => setSprintName(event.target.value)} placeholder="Sprint adı" required />
            <Textarea
              value={sprintGoal}
              onChange={(event) => setSprintGoal(event.target.value)}
              placeholder="Sprint hedefi / yol haritası çıktısı"
              className="min-h-20 bg-black/20"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="date"
                value={sprintStartDate}
                onChange={(event) => setSprintStartDate(event.target.value)}
                className="bg-black/20"
                required
              />
              <Input
                type="date"
                value={sprintEndDate}
                onChange={(event) => setSprintEndDate(event.target.value)}
                className="bg-black/20"
                required
              />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={isCreatingSprint}>
              {isCreatingSprint ? "Oluşturuluyor..." : "Yol Haritasına Sprint Ekle"}
            </Button>
          </form>
          <div className="space-y-2">
            {sprints.slice(0, 3).map((sprint) => (
              <div
                key={sprint.id}
                onClick={() => handleOpenSprintTaskPlanner(sprint.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenSprintTaskPlanner(sprint.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`rounded-xl border p-3 ${
                  focusedSprintId === sprint.id
                    ? "border-[#AAFF01]/45 bg-[#AAFF01]/10"
                    : "border-white/[0.06] bg-black/20"
                }`}
              >
                <SummaryRow
                  title={sprint.name}
                  meta={`${formatDate(sprint.startDate)} → ${formatDate(sprint.endDate)} • %${sprint.progressPercent} ilerleme`}
                  badge={sprint.status}
                />
                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-black/40 px-3 text-xs text-white outline-none"
                    value={sprint.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      void handleSprintStatusChange(sprint.id, event.target.value as DeliverySprintStatus)
                    }
                    disabled={isUpdatingSprint}
                  >
                    {SPRINT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        Durum: {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenSprintTaskPlanner(sprint.id);
                    }}
                  >
                    Sprint Görevlerini Düzenle
                  </Button>
                </div>
              </div>
            ))}
            {sprints.length === 0 ? <EmptyHint text="Planlanmış roadmap sprinti bulunmuyor." /> : null}
          </div>
        </ActionPanel>

        <ActionPanel
          icon={Calendar}
          title="Release Planla"
          description="Bir sonraki staging veya yayın çıkışını netleştir."
          footer={releases.length > 0 ? `${releases.length} release listelendi` : "Henüz release yok"}
        >
          <form className="space-y-3" onSubmit={(event) => void handleCreateRelease(event)}>
            <Input value={releaseTitle} onChange={(event) => setReleaseTitle(event.target.value)} placeholder="Release başlığı" required />
            <Input value={releaseVersion} onChange={(event) => setReleaseVersion(event.target.value)} placeholder="Versiyon (opsiyonel)" />
            <Button type="submit" size="sm" className="w-full" disabled={isCreatingRelease}>
              {isCreatingRelease ? "Oluşturuluyor..." : "Release Ekle"}
            </Button>
          </form>
          <div className="space-y-2">
            {releases.slice(0, 3).map((release) => (
              <SummaryRow key={release.id} title={release.title} meta={release.version ?? "Versiyon yok"} badge={release.status} />
            ))}
            {releases.length === 0 ? <EmptyHint text="Planlanmış release bulunmuyor." /> : null}
          </div>
        </ActionPanel>
      </div>

      {actionError ? (
        <Card className="border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{actionError}</Card>
      ) : null}

      <Tabs value={viewTab} onValueChange={handleViewTabChange} className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-white/8 bg-[#141414] p-2">
          {WORKSPACE_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-none rounded-xl border border-transparent px-4 py-2 data-[state=active]:border-white/10 data-[state=active]:bg-white data-[state=active]:text-black"
            >
              {getViewTabLabel(tab)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="OVERVIEW">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Genel Görünüm</CardTitle>
                <CardDescription>Hızlı durum özeti ve son hareketler.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <SnapshotCard
                  icon={CheckCircle2}
                  title="Son görev"
                  value={latestTask?.title ?? "Görev bulunmuyor"}
                  meta={latestTask ? getTaskStatusLabel(latestTask.status) : "Görev eklenmedi"}
                />
                <SnapshotCard
                  icon={Folder}
                  title="Son dosya"
                  value={recentFile?.title ?? "Dosya yok"}
                  meta={recentFile?.originalFileName ?? "Henüz yükleme yapılmadı"}
                />
                <SnapshotCard
                  icon={FileText}
                  title="Son rapor"
                  value={latestReport?.summary ?? "Rapor bulunmuyor"}
                  meta={latestReport ? formatDate(latestReport.weekStartDate) : "Yayınlanmadı"}
                />
                <SnapshotCard
                  icon={Calendar}
                  title="Son toplantı talebi"
                  value={latestMeeting?.title ?? "Toplantı bulunmuyor"}
                  meta={latestMeeting ? formatDateTime(latestMeeting.preferredStartAt) : "Talep bekleniyor"}
                />
              </CardContent>
            </Card>

            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Aksiyon Özeti</CardTitle>
                <CardDescription>Son kayıtlar ve takip gerektiren başlıklar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <InsightRow label="Revizyon" value={latestRevision?.title ?? "Açık revizyon yok"} meta={latestRevision?.status ?? "Temiz"} />
                <InsightRow label="Mesaj akışı" value={`${workspaceMessages.length} mesaj`} meta={replyParentId ? "Yanıt modu aktif" : "Bekleyen yanıt yok"} />
                <InsightRow label="Checklist" value={`${completedTodoCount}/${totalTodoCount || 0} tamamlandı`} meta={`%${workspaceProgress} genel ilerleme`} />
                <InsightRow label="Ekip" value={`${assigneeCandidates.length} atanabilir kişi`} meta={assigneeCandidates.length > 0 ? "Dağıtım yapılabilir" : "Aday bulunamadı"} />
                <InsightRow label="Yol Haritası" value={`${roadmapUpcomingCount} aktif plan`} meta={`${sprints.length} sprint • ${releases.length} release`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="TASKS">
          <Card className="border-white/[0.06] bg-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="text-white">Görevler</CardTitle>
              <CardDescription>Sprint bazlı görev yönetimi, atama ve checklist düzenleme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {focusedSprintId ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-3 py-2 text-xs text-[#E8FFC2]">
                  <p>
                    Sprint düzenleme modu aktif:{" "}
                    {sprints.find((item) => item.id === focusedSprintId)?.name ?? "Seçili sprint"}.
                    Toplu taşıma için görevleri seçip hedef sprinti belirleyin.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-[#AAFF01]/35 bg-[#AAFF01]/10 text-[#E8FFC2] hover:bg-[#AAFF01]/20"
                    onClick={() => activateTaskCreateForSprint(focusedSprintId)}
                  >
                    Seçili Sprint'e Görev Ekle
                  </Button>
                </div>
              ) : null}
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">Toplu Sprint Taşıma</p>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                    {selectedTaskIds.length} görev seçili
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <select
                    className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                    value={bulkMoveSprintId}
                    onChange={(event) => setBulkMoveSprintId(event.target.value)}
                    disabled={sprints.length === 0}
                  >
                    {sprints.length === 0 ? <option value="">Önce sprint oluşturun</option> : null}
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        Hedef Sprint: {sprint.name} · {sprint.status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTaskIds([])}
                    disabled={selectedTaskIds.length === 0 || isBulkMoving}
                  >
                    Seçimi Temizle
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleBulkMoveToSprint()}
                    disabled={selectedTaskIds.length === 0 || !bulkMoveSprintId || isBulkMoving}
                  >
                    {isBulkMoving ? "Taşınıyor..." : "Seçilenleri Taşı"}
                  </Button>
                </div>
              </div>
              {sprints.map((sprint) => {
                const sprintTasks = tasksBySprint.get(sprint.id) ?? [];
                const sprintTaskIds = sprintTasks.map((task) => task.id);
                const sprintAllSelected =
                  sprintTaskIds.length > 0 &&
                  sprintTaskIds.every((taskId) => selectedTaskIds.includes(taskId));
                return (
                  <div
                    key={sprint.id}
                    className={`rounded-2xl border p-4 ${
                      focusedSprintId === sprint.id
                        ? "border-[#AAFF01]/45 bg-[#AAFF01]/10"
                        : "border-white/[0.06] bg-black/20"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{sprint.name}</p>
                        <p className="text-xs text-[#A0A0A0]">
                          {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                        {sprint.status} · {sprintTasks.length} görev
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <label className="inline-flex items-center gap-2 text-xs text-[#D8D8D8]">
                        <Checkbox
                          checked={sprintAllSelected}
                          onCheckedChange={() => toggleSprintSelection(sprintTaskIds)}
                          disabled={sprintTaskIds.length === 0}
                        />
                        Bu sprintteki tüm görevleri seç
                      </label>
                    </div>
                    <div className="space-y-3">
                      {sprintTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          sprints={sprints}
                          assigneeCandidates={assigneeCandidates}
                          isMutating={isTaskMutationBusy}
                          isSelected={selectedTaskIds.includes(task.id)}
                          onSelectionChange={(checked) => handleTaskSelectionChange(task.id, checked)}
                          onToggleTodo={(todo, checked) =>
                            void toggleTaskTodo({
                              taskId: task.id,
                              todoId: todo.id,
                              body: { isCompleted: checked },
                            })
                          }
                          onUpdateTask={(body) => handleUpdateTask(task.id, body)}
                          onCreateTodo={(title) => handleCreateTaskTodo(task.id, title)}
                          onUpdateTodo={(todoId, title) => handleUpdateTaskTodo(task.id, todoId, title)}
                          onDeleteTodo={(todoId) => handleDeleteTaskTodo(task.id, todoId)}
                        />
                      ))}
                      {sprintTasks.length === 0 ? <EmptyHint text="Bu sprintte görev yok." /> : null}
                    </div>
                  </div>
                );
              })}
              {unassignedTasks.length > 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-amber-100">Sprint’e Atanmamış Görevler</p>
                    <Badge variant="outline" className="border-amber-300/30 bg-amber-400/10 text-amber-100">
                      {unassignedTasks.length} görev
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <label className="inline-flex items-center gap-2 text-xs text-amber-100">
                      <Checkbox
                        checked={
                          unassignedTasks.length > 0 &&
                          unassignedTasks.every((task) => selectedTaskIds.includes(task.id))
                        }
                        onCheckedChange={() =>
                          toggleSprintSelection(unassignedTasks.map((task) => task.id))
                        }
                      />
                      Atanmamış görevlerin tümünü seç
                    </label>
                  </div>
                  <div className="space-y-3">
                    {unassignedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        sprints={sprints}
                        assigneeCandidates={assigneeCandidates}
                        isMutating={isTaskMutationBusy}
                        isSelected={selectedTaskIds.includes(task.id)}
                        onSelectionChange={(checked) => handleTaskSelectionChange(task.id, checked)}
                        onToggleTodo={(todo, checked) =>
                          void toggleTaskTodo({
                            taskId: task.id,
                            todoId: todo.id,
                            body: { isCompleted: checked },
                          })
                        }
                        onUpdateTask={(body) => handleUpdateTask(task.id, body)}
                        onCreateTodo={(title) => handleCreateTaskTodo(task.id, title)}
                        onUpdateTodo={(todoId, title) => handleUpdateTaskTodo(task.id, todoId, title)}
                        onDeleteTodo={(todoId) => handleDeleteTaskTodo(task.id, todoId)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {tasks.length === 0 ? <EmptyHint text="Görev bulunmuyor." /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="FILES">
          <Card className="border-white/[0.06] bg-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="text-white">Dosyalar</CardTitle>
              <CardDescription>Projeye bağlı son dosya kayıtları.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{file.title}</p>
                      <p className="mt-1 text-xs text-[#A0A0A0]">{file.originalFileName}</p>
                    </div>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                      {file.visibility}
                    </Badge>
                  </div>
                </div>
              ))}
              {files.length === 0 ? <EmptyHint text="Dosya bulunmuyor." /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="MESSAGES">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Mesajlar</CardTitle>
                <CardDescription>Workspace soru-cevap ve ekip notları.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rootMessages.map((message) => (
                  <MessageNode
                    key={message.id}
                    message={message}
                    map={messagesByParent}
                    depth={0}
                    onReply={(id) => setReplyParentId(id)}
                  />
                ))}
                {rootMessages.length === 0 ? <EmptyHint text="Mesaj bulunmuyor." /> : null}
              </CardContent>
            </Card>

            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Yeni Mesaj</CardTitle>
                <CardDescription>İç not veya müşteri görünür mesaj oluştur.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {replyParentId ? (
                  <div className="rounded-xl border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-2 text-xs text-[#E8FFC2]">
                    Yanıtlanan mesaj: {replyParentId.slice(0, 8)}...
                  </div>
                ) : null}
                <Textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Mesajınızı yazın"
                  className="min-h-28 bg-black/20"
                />
                <label className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-sm text-[#D8D8D8]">
                  <Checkbox
                    checked={isInternalMessage}
                    onCheckedChange={(checked) => setIsInternalMessage(checked === true)}
                  />
                  İç not olarak işaretle, client görünmesin
                </label>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" onClick={() => void handleSendMessage()} disabled={isSending}>
                  {isSending ? "Gönderiliyor..." : "Mesajı Gönder"}
                </Button>
                {replyParentId ? (
                  <Button type="button" variant="outline" onClick={() => setReplyParentId(null)}>
                    Yanıtı İptal Et
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="REVISIONS">
          <div className="grid gap-4 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Revizyon Oluştur</CardTitle>
                <CardDescription>Yeni müşteri revizyon talebi aç ve sorumlu ata.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={(event) => void handleCreateRevision(event)}>
                  <Input
                    value={revisionTitle}
                    onChange={(event) => setRevisionTitle(event.target.value)}
                    placeholder="Revizyon başlığı"
                  />
                  <Textarea
                    value={revisionDescription}
                    onChange={(event) => setRevisionDescription(event.target.value)}
                    placeholder="Revizyon açıklaması"
                    className="min-h-24 bg-black/20"
                  />
                  <select
                    value={revisionAssigneeId}
                    onChange={(event) => setRevisionAssigneeId(event.target.value)}
                    className="h-10 w-full rounded-md border border-white/15 bg-[#151515] px-3 text-sm text-white"
                  >
                    <option value="">Atama yok</option>
                    {assigneeCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.displayName ?? candidate.id} · {getAssigneeRoleLabel(candidate.role)}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" disabled={isCreatingRevision}>
                    {isCreatingRevision ? "Oluşturuluyor..." : "Revizyon Oluştur"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/[0.06] bg-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="text-white">Revizyonlar</CardTitle>
                <CardDescription>Açık veya çözülmüş revizyon talepleri.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {revisions.map((revision) => {
                  const statusOptions = getWorkspaceRevisionTransitionsForEmployee(revision.status);
                  const assigneeDraft =
                    revisionAssigneeDrafts[revision.id] ??
                    revision.assignedToUserId ??
                    "";
                  const statusDraft =
                    revisionStatusDrafts[revision.id] ??
                    statusOptions[0] ??
                    revision.status;
                  const canApplyTransition = statusOptions.includes(statusDraft);
                  return (
                    <div key={revision.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white">{revision.title}</p>
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                          {revision.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#A0A0A0]">{revision.description}</p>
                      <p className="mt-1 text-xs text-[#A0A0A0]">
                        Talep: {formatDateTime(revision.requestedAt)} · Talep Eden:{" "}
                        {revision.requestedBy?.displayName ?? "—"}
                      </p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <select
                          value={statusDraft}
                          onChange={(event) =>
                            setRevisionStatusDrafts((prev) => ({
                              ...prev,
                              [revision.id]: event.target.value as WorkspaceRevisionStatus,
                            }))
                          }
                          disabled={isUpdatingRevisionStatus || statusOptions.length === 0}
                          className="h-9 rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                        >
                          {statusOptions.length === 0 ? (
                            <option value={revision.status}>{revision.status}</option>
                          ) : null}
                          {statusOptions.map((status) => (
                            <option key={`${revision.id}-${status}`} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <select
                          value={assigneeDraft}
                          onChange={(event) =>
                            setRevisionAssigneeDrafts((prev) => ({
                              ...prev,
                              [revision.id]: event.target.value,
                            }))
                          }
                          className="h-9 rounded-md border border-white/15 bg-[#151515] px-2 text-xs text-white"
                        >
                          <option value="">Atama yok</option>
                          {assigneeCandidates.map((candidate) => (
                            <option key={`${revision.id}-${candidate.id}`} value={candidate.id}>
                              {candidate.displayName ?? candidate.id}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Input
                          placeholder="Geçiş notu (opsiyonel)"
                          value={revisionNotes[revision.id] ?? ""}
                          onChange={(event) =>
                            setRevisionNotes((prev) => ({
                              ...prev,
                              [revision.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUpdatingRevisionStatus || !canApplyTransition}
                          onClick={() =>
                            void handleUpdateRevision({
                              revisionId: revision.id,
                              status: statusDraft,
                              assignedToUserId: assigneeDraft || null,
                            })
                          }
                        >
                          {canApplyTransition ? "Geçişi ve Atamayı Uygula" : "Geçerli Geçiş Yok"}
                        </Button>
                      </div>
                      {!canApplyTransition ? (
                        <p className="mt-2 text-xs text-[#A0A0A0]">
                          Bu durum için yeni bir employee geçişi bulunmuyor. Atama değişikliği ancak
                          geçerli bir sonraki durum ile birlikte gönderilebilir.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
                {revisions.length === 0 ? <EmptyHint text="Revizyon bulunmuyor." /> : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="REPORTS">
          <SectionCard
            title="Raporlar"
            description="Paylaşılan haftalık rapor özetleri."
            items={reports}
            renderItem={(report) => (
              <EntityCard
                title={report.summary}
                meta={formatDate(report.weekStartDate)}
                supporting={report.plannedNext ?? report.accomplishments ?? "Detay paylaşılmadı."}
                badge={report.publishedAt ? "Yayınlandı" : "Taslak"}
              />
            )}
            emptyText="Rapor bulunmuyor."
          />
        </TabsContent>

        <TabsContent value="MEETINGS">
          <SectionCard
            title="Toplantılar"
            description="Son toplantı talepleri ve planlanan zamanlar."
            items={meetings}
            renderItem={(meeting) => (
              <EntityCard
                title={meeting.title}
                meta={formatDateTime(meeting.preferredStartAt)}
                supporting={meeting.agenda ?? "Ajanda belirtilmedi."}
                badge={meeting.status}
              />
            )}
            emptyText="Toplantı kaydı bulunmuyor."
          />
        </TabsContent>
      </Tabs>
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

function parseChecklistLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function getTargetTabsByAssigneeRole(role?: string | null): EmployeePanelTargetTab[] {
  if (!role) {
    return Object.keys(TASK_TARGET_TAB_LABELS) as EmployeePanelTargetTab[];
  }
  return ASSIGNEE_ROLE_TARGET_TABS[role] ?? (Object.keys(TASK_TARGET_TAB_LABELS) as EmployeePanelTargetTab[]);
}

function getAssigneeRoleLabel(role: string): string {
  return ASSIGNEE_ROLE_LABELS[role] ?? role;
}

function normalizeTaskByAssigneeRole({
  assigneeRole,
  type,
  workstream,
}: {
  assigneeRole?: string | null;
  type: TaskType;
  workstream: TaskWorkstream;
}): { type: TaskType; workstream: TaskWorkstream } {
  if (assigneeRole !== "DESIGNER") {
    return { type, workstream };
  }

  return {
    type: type === "REVISION" ? "REVISION" : "FEATURE",
    workstream: "UI_INTEGRATION",
  };
}

function getWorkspaceRevisionTransitionsForEmployee(
  status: WorkspaceRevisionStatus,
): WorkspaceRevisionStatus[] {
  const transitions: Record<WorkspaceRevisionStatus, WorkspaceRevisionStatus[]> = {
    REQUESTED: ["ACKNOWLEDGED", "CANCELLED", "REJECTED"],
    ACKNOWLEDGED: ["IN_PROGRESS", "CANCELLED", "REJECTED"],
    IN_PROGRESS: ["READY_FOR_REVIEW", "CANCELLED"],
    READY_FOR_REVIEW: ["IN_PROGRESS"],
    APPROVED: [],
    REJECTED: ["IN_PROGRESS", "CANCELLED"],
    CANCELLED: [],
  };
  return transitions[status] ?? [];
}

function WorkspaceStat({ icon: Icon, label, value, hint }: { icon: typeof FileText; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
        <Icon className="h-4 w-4 text-[#AAFF01]" />
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-[#7D7D7D]">{hint}</p>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#7D7D7D]">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ActionPanel({
  icon: Icon,
  title,
  description,
  footer,
  children,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  footer: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#AAFF01]/12">
            <Icon className="h-5 w-5 text-[#AAFF01]" />
          </div>
          <div>
            <CardTitle className="text-base text-white">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter className="border-t border-white/6 pt-4 text-xs text-[#7D7D7D]">{footer}</CardFooter>
    </Card>
  );
}

function TaskCard({
  task,
  sprints,
  assigneeCandidates,
  isMutating,
  isSelected,
  onSelectionChange,
  onToggleTodo,
  onUpdateTask,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
}: {
  task: Task;
  sprints: Array<{ id: string; name: string; status: string }>;
  assigneeCandidates: Array<{ id: string; displayName: string | null; role: string }>;
  isMutating: boolean;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onToggleTodo: (todo: TaskTodo, checked: boolean) => void;
  onUpdateTask: (body: UpdateTaskRequest) => Promise<void>;
  onCreateTodo: (title: string) => Promise<void>;
  onUpdateTodo: (todoId: string, title: string) => Promise<void>;
  onDeleteTodo: (todoId: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority as TaskPriority);
  const [type, setType] = useState<TaskType>(task.type);
  const [workstream, setWorkstream] = useState<TaskWorkstream>(task.workstream);
  const [assigneeUserId, setAssigneeUserId] = useState(task.assigneeUserId ?? "");
  const [sprintId, setSprintId] = useState(task.sprintId ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
  const [severity, setSeverity] = useState<TaskSeverity>(task.severity ?? "MEDIUM");
  const [environment, setEnvironment] = useState<TaskEnvironment>(task.environment ?? "STAGING");
  const [todoDraft, setTodoDraft] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState("");
  const selectedAssigneeRole = useMemo(
    () => assigneeCandidates.find((candidate) => candidate.id === assigneeUserId)?.role ?? null,
    [assigneeCandidates, assigneeUserId],
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority as TaskPriority);
    setType(task.type);
    setWorkstream(task.workstream);
    setAssigneeUserId(task.assigneeUserId ?? "");
    setSprintId(task.sprintId ?? "");
    setDueDate(toDateInputValue(task.dueDate));
    setSeverity(task.severity ?? "MEDIUM");
    setEnvironment(task.environment ?? "STAGING");
  }, [task]);

  useEffect(() => {
    if (selectedAssigneeRole !== "DESIGNER") {
      return;
    }
    setWorkstream("UI_INTEGRATION");
    setType((prev) => (prev === "REVISION" ? "REVISION" : "FEATURE"));
  }, [selectedAssigneeRole]);

  const todos = task.todos ?? [];
  const completedTodos = todos.filter((todo) => todo.isCompleted).length;
  const progress = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

  const handleSave = async () => {
    if (title.trim().length < 3) {
      return;
    }
    const normalizedTask = normalizeTaskByAssigneeRole({
      assigneeRole: selectedAssigneeRole,
      type,
      workstream,
    });
    await onUpdateTask({
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      status,
      priority,
      type: normalizedTask.type,
      workstream: normalizedTask.workstream,
      severity: normalizedTask.type === "BUG" ? severity : null,
      environment: normalizedTask.type === "BUG" ? environment : null,
      assigneeUserId: assigneeUserId || null,
      sprintId: sprintId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setIsEditing(false);
  };

  const handleAddTodo = async () => {
    if (!todoDraft.trim()) {
      return;
    }
    await onCreateTodo(todoDraft);
    setTodoDraft("");
  };

  const startEditTodo = (todo: TaskTodo) => {
    setEditingTodoId(todo.id);
    setEditingTodoTitle(todo.title);
  };

  const saveTodoEdit = async () => {
    if (!editingTodoId || !editingTodoTitle.trim()) {
      return;
    }
    await onUpdateTodo(editingTodoId, editingTodoTitle);
    setEditingTodoId(null);
    setEditingTodoTitle("");
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 text-xs text-[#D8D8D8]">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(checked === true)}
              disabled={isMutating}
            />
            Toplu taşıma için seç
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">{task.title}</p>
            <Badge className={getTaskStatusBadgeClass(task.status)}>{getTaskStatusLabel(task.status)}</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
              {getTaskTypeLabel(task.type)}
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
              {getTaskWorkstreamLabel(task.workstream)}
            </Badge>
            {task.sprint?.name ? (
              <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
                {task.sprint.name}
              </Badge>
            ) : null}
          </div>
          {task.description ? <p className="text-sm leading-6 text-[#A0A0A0]">{task.description}</p> : null}
          <div className="flex flex-wrap gap-4 text-xs text-[#7D7D7D]">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {task.assignee?.displayName ?? "Atanmamış"}
            </span>
            <span>{todos.length} checklist maddesi</span>
            {task.dueDate ? <span>Teslim: {formatDate(task.dueDate)}</span> : null}
          </div>
        </div>
        <div className="min-w-44 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
          <div className="flex items-center justify-between text-xs text-[#A0A0A0]">
            <span>İlerleme</span>
            <span>%{progress}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2 bg-white/10 [&>[data-slot=progress-indicator]]:bg-[#AAFF01]" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!isEditing ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)} disabled={isMutating}>
            Görevi Düzenle
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={isMutating}>
              {isMutating ? "Kaydediliyor..." : "Görevi Kaydet"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setTitle(task.title);
                setDescription(task.description ?? "");
                setStatus(task.status);
                setPriority(task.priority as TaskPriority);
                setType(task.type);
                setWorkstream(task.workstream);
                setAssigneeUserId(task.assigneeUserId ?? "");
                setSprintId(task.sprintId ?? "");
                setDueDate(toDateInputValue(task.dueDate));
                setSeverity(task.severity ?? "MEDIUM");
                setEnvironment(task.environment ?? "STAGING");
              }}
              disabled={isMutating}
            >
              İptal
            </Button>
          </>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3 rounded-xl border border-white/8 bg-black/20 p-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Görev başlığı" />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Görev açıklaması"
            className="min-h-20 bg-black/20"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {TASK_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Durum: {getTaskStatusLabel(value)}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              {TASK_PRIORITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Öncelik: {value}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={sprintId}
              onChange={(event) => setSprintId(event.target.value)}
            >
              <option value="">Sprint ataması yok</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  Sprint: {sprint.name} · {sprint.status}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={type}
              onChange={(event) => setType(event.target.value as TaskType)}
            >
              {(selectedAssigneeRole === "DESIGNER" ? DESIGNER_ALLOWED_TASK_TYPES : TASK_TYPE_OPTIONS).map((value) => (
                <option key={value} value={value}>
                  Tür: {getTaskTypeLabel(value)}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={workstream}
              onChange={(event) => setWorkstream(event.target.value as TaskWorkstream)}
              disabled={selectedAssigneeRole === "DESIGNER"}
            >
              {(selectedAssigneeRole === "DESIGNER"
                ? (["UI_INTEGRATION"] as TaskWorkstream[])
                : TASK_WORKSTREAM_OPTIONS).map((value) => (
                <option key={value} value={value}>
                  Workstream: {getTaskWorkstreamLabel(value)}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={assigneeUserId}
              onChange={(event) => setAssigneeUserId(event.target.value)}
            >
              <option value="">Atanmamış</option>
              {assigneeCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.displayName ?? candidate.id} · {candidate.role}
                </option>
              ))}
            </select>
          </div>
          {selectedAssigneeRole === "DESIGNER" ? (
            <p className="text-xs text-[#E8FFC2]">
              Designer ataması için görev otomatik olarak UI Integration akışına hizalanır.
            </p>
          ) : null}
          {type === "BUG" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as TaskSeverity)}
              >
                {TASK_SEVERITY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    Severity: {getTaskSeverityLabel(value)}
                  </option>
                ))}
              </select>
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                value={environment}
                onChange={(event) => setEnvironment(event.target.value as TaskEnvironment)}
              >
                {TASK_ENVIRONMENT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    Ortam: {getTaskEnvironmentLabel(value)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="bg-black/20" />
        </div>
      ) : null}

      {todos.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {todos.map((todo) => (
            <div key={todo.id} className="rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-sm text-[#D8D8D8]">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.isCompleted}
                  disabled={isMutating}
                  onCheckedChange={(checked) => onToggleTodo(todo, checked === true)}
                />
                <div className="flex-1">
                  {editingTodoId === todo.id ? (
                    <Input
                      value={editingTodoTitle}
                      onChange={(event) => setEditingTodoTitle(event.target.value)}
                      className="h-8 bg-black/30"
                    />
                  ) : (
                    <span className={todo.isCompleted ? "text-[#8D8D8D] line-through" : ""}>{todo.title}</span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {editingTodoId === todo.id ? (
                  <>
                    <Button type="button" size="sm" onClick={() => void saveTodoEdit()} disabled={isMutating}>
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTodoId(null);
                        setEditingTodoTitle("");
                      }}
                      disabled={isMutating}
                    >
                      İptal
                    </Button>
                  </>
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={() => startEditTodo(todo)} disabled={isMutating}>
                    Düzenle
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-200"
                  onClick={() => void onDeleteTodo(todo.id)}
                  disabled={isMutating}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#7D7D7D]">Checklist maddesi yok.</p>
      )}

      <div className="mt-4 flex gap-2">
        <Input
          value={todoDraft}
          onChange={(event) => setTodoDraft(event.target.value)}
          placeholder="Yeni checklist maddesi"
          className="bg-black/20"
        />
        <Button type="button" size="sm" onClick={() => void handleAddTodo()} disabled={isMutating || !todoDraft.trim()}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

function SectionCard<T>({
  title,
  description,
  items,
  renderItem,
  emptyText,
}: {
  title: string;
  description: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A]">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(renderItem)}
        {items.length === 0 ? <EmptyHint text={emptyText} /> : null}
      </CardContent>
    </Card>
  );
}

function EntityCard({
  title,
  meta,
  supporting,
  badge,
}: {
  title: string;
  meta: string;
  supporting: string;
  badge: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs text-[#A0A0A0]">{meta}</p>
        </div>
        <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
          {badge}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#A0A0A0]">{supporting}</p>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  title,
  value,
  meta,
}: {
  icon: typeof FileText;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#7D7D7D]">
        <Icon className="h-4 w-4 text-[#AAFF01]" />
        {title}
      </div>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
      <p className="mt-1 text-xs text-[#A0A0A0]">{meta}</p>
    </div>
  );
}

function InsightRow({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#7D7D7D]">{label}</p>
        <p className="mt-1 text-sm font-medium text-white">{value}</p>
      </div>
      <p className="max-w-40 text-right text-xs text-[#A0A0A0]">{meta}</p>
    </div>
  );
}

function SummaryRow({ title, meta, badge }: { title: string; meta: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-[#A0A0A0]">{meta}</p>
      </div>
      <Badge variant="outline" className="border-white/10 bg-white/5 text-[#D8D8D8]">
        {badge}
      </Badge>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-5 text-sm text-[#7D7D7D]">{text}</p>;
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
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-white">{message.author?.displayName ?? "Kullanıcı"}</p>
          {message.isInternal ? (
            <Badge variant="outline" className="border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#E8FFC2]">
              Internal
            </Badge>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#D8D8D8]">{message.body}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[#7D7D7D]">{formatDateTime(message.createdAt)}</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => onReply(message.id)}>
            Yanıtla
          </Button>
        </div>
      </div>
      {replies.map((reply) => (
        <MessageNode key={reply.id} message={reply} map={map} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

function getViewTabLabel(tab: WorkspaceViewTab): string {
  if (tab === "OVERVIEW") return "Genel Bakış";
  if (tab === "TASKS") return "Görevler";
  if (tab === "FILES") return "Dosyalar";
  if (tab === "MESSAGES") return "Mesajlar";
  if (tab === "REVISIONS") return "Revizyonlar";
  if (tab === "REPORTS") return "Raporlar";
  return "Toplantılar";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR");
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("tr-TR");
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
  if (!raw) {
    return DEFAULT_VIEW_TAB;
  }
  const candidate = raw.toUpperCase() as WorkspaceViewTab;
  return WORKSPACE_TABS.includes(candidate) ? candidate : DEFAULT_VIEW_TAB;
}

function toDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return toDateInput(date);
}
