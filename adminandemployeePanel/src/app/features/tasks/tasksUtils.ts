import type { ServiceKey } from "../clients/clientsTypes";
import { normalizeToUiServiceKey } from "../clients/clientsUtils";
import type { Priority, ProjectStatus } from "../projects/projectsTypes";
import {
  PRIORITY_OPTIONS,
  extractApiErrorMessage,
  formatDate,
  formatDateInput,
  formatDateTime,
  getPriorityBadgeClass,
  getPriorityLabel,
  isUuid,
  shortId,
  toNullableText,
} from "../projects/projectsUtils";
import type {
  Task,
  TaskApprovalType,
  TaskAssigneeSummary,
  TaskCompletion,
  TaskEnvironment,
  TaskProjectSummary,
  TaskSeverity,
  TaskTodo,
  TaskTodoVisibility,
  TaskType,
  TaskWorkstream,
  TasksListMeta,
  TasksListResponse,
  TaskStatus,
} from "./tasksTypes";

export {
  extractApiErrorMessage,
  formatDate,
  formatDateInput,
  formatDateTime,
  getPriorityBadgeClass,
  getPriorityLabel,
  isUuid,
  shortId,
  toNullableText,
};

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BLOCKED",
];
export const TASK_TYPE_OPTIONS: TaskType[] = [
  "FEATURE",
  "BUG",
  "REVISION",
  "QA",
  "DEPLOYMENT",
  "MAINTENANCE",
];
export const TASK_WORKSTREAM_OPTIONS: TaskWorkstream[] = [
  "FRONTEND",
  "BACKEND",
  "FULLSTACK",
  "QA",
  "DEVOPS",
  "UI_INTEGRATION",
];
export const TASK_SEVERITY_OPTIONS: TaskSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const TASK_ENVIRONMENT_OPTIONS: TaskEnvironment[] = [
  "DEVELOPMENT",
  "STAGING",
  "PRODUCTION",
];

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  "PLANNED",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
];

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  REVIEW: "İncelemede",
  DONE: "Tamamlandı",
  BLOCKED: "Bloke",
};
const TASK_TYPE_LABELS: Record<TaskType, string> = {
  FEATURE: "Feature",
  BUG: "Bug",
  REVISION: "Revizyon",
  QA: "QA",
  DEPLOYMENT: "Deployment",
  MAINTENANCE: "Bakım",
};
const TASK_WORKSTREAM_LABELS: Record<TaskWorkstream, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend / API",
  FULLSTACK: "Fullstack",
  QA: "QA",
  DEVOPS: "DevOps",
  UI_INTEGRATION: "UI Integration",
};
const TASK_SEVERITY_LABELS: Record<TaskSeverity, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  CRITICAL: "Kritik",
};
const TASK_ENVIRONMENT_LABELS: Record<TaskEnvironment, string> = {
  DEVELOPMENT: "Development",
  STAGING: "Staging",
  PRODUCTION: "Production",
};

export function normalizeTasksListResponse(response: unknown): TasksListResponse {
  const responseData = isRecord(response) ? response.data : response;
  const data = Array.isArray(responseData) ? responseData.map(normalizeTask).filter(isDefined) : [];
  const meta = normalizeListMeta(isRecord(response) ? response.meta : null, data.length);

  return { data, meta };
}

export function normalizeTaskResponse(response: unknown): Task {
  const candidate = isRecord(response) && "data" in response ? response.data : response;

  const task = normalizeTask(candidate);
  if (task) {
    return task;
  }

  throw new Error("Task detail response could not be parsed.");
}

export function getTaskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status] ?? status;
}

export function getTaskTypeLabel(type: TaskType): string {
  return TASK_TYPE_LABELS[type] ?? type;
}

export function getTaskWorkstreamLabel(workstream: TaskWorkstream): string {
  return TASK_WORKSTREAM_LABELS[workstream] ?? workstream;
}

export function getTaskSeverityLabel(severity: TaskSeverity): string {
  return TASK_SEVERITY_LABELS[severity] ?? severity;
}

export function getTaskEnvironmentLabel(environment: TaskEnvironment): string {
  return TASK_ENVIRONMENT_LABELS[environment] ?? environment;
}

export function getTaskStatusBadgeClass(status: TaskStatus): string {
  if (status === "DONE") {
    return "bg-[#AAFF01] text-[#131313]";
  }

  if (status === "IN_PROGRESS") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }

  if (status === "REVIEW") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }

  if (status === "BLOCKED") {
    return "bg-red-600 text-white";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getTaskTypeBadgeClass(type: TaskType): string {
  if (type === "BUG") {
    return "bg-red-600 text-white";
  }
  if (type === "DEPLOYMENT") {
    return "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  }
  if (type === "REVISION") {
    return "border-orange-400/40 bg-orange-500/15 text-orange-200";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#E5E5E5]";
}

export function getTaskWorkstreamBadgeClass(workstream: TaskWorkstream): string {
  if (workstream === "FRONTEND") {
    return "border-blue-400/40 bg-blue-500/15 text-blue-200";
  }
  if (workstream === "BACKEND") {
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
  }
  if (workstream === "DEVOPS") {
    return "border-cyan-400/40 bg-cyan-500/15 text-cyan-200";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getTaskSeverityBadgeClass(severity: TaskSeverity): string {
  if (severity === "CRITICAL") {
    return "bg-red-600 text-white";
  }
  if (severity === "HIGH") {
    return "bg-orange-500 text-white";
  }
  if (severity === "MEDIUM") {
    return "border-yellow-400/40 bg-yellow-500/15 text-yellow-200";
  }

  return "border-white/[0.12] bg-white/[0.04] text-[#A0A0A0]";
}

export function getTaskAssigneeName(task: Task): string {
  return task.assignee?.displayName?.trim() || (task.assigneeUserId ? shortId(task.assigneeUserId) : "Atanmamış");
}

export function getTaskClientName(task: Task): string {
  return task.project?.clientProfile?.companyName ?? "—";
}

export function getTaskDueLabel(task: Task): string {
  if (!task.dueDate) {
    return "Deadline yok";
  }

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return "Deadline yok";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (daysUntilDue < 0) {
    return "Gecikti";
  }

  if (daysUntilDue === 0) {
    return "Bugün";
  }

  return `${daysUntilDue} gün kaldı`;
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") {
    return false;
  }

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}

export function getTaskTodos(task: Task): TaskTodo[] {
  return task.todos ?? [];
}

export function getTaskCompletion(task: Task): TaskCompletion {
  if (task.completion) {
    return normalizeCompletionValue(task.completion, getTaskTodos(task));
  }

  return createCompletionFromTodos(getTaskTodos(task));
}

export function getTaskCompletionPercent(task: Task): number {
  return getTaskCompletion(task).percent;
}

export function getTaskCompletionLabel(task: Task): string {
  const completion = getTaskCompletion(task);
  return `${completion.completedTodos}/${completion.totalTodos} tamamlandı`;
}

export function getTaskWorkNotes(task: Task) {
  return task.workNotes ?? [];
}

export type DesignApprovalSetup = {
  approvalType: TaskApprovalType;
  permission: string;
};

export function getDesignApprovalSetupForServiceKey(
  serviceKey: ServiceKey | null | undefined,
): DesignApprovalSetup | null {
  if (serviceKey === "meta-ads") {
    return { approvalType: "META_ADS_CREATIVE_APPROVAL", permission: "metaAds.approvals.create.assigned" };
  }
  if (serviceKey === "tiktok-ads") {
    return {
      approvalType: "TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL",
      permission: "tiktokAds.approvals.create.assigned",
    };
  }
  if (serviceKey === "amazon-ads") {
    return { approvalType: "AMAZON_ADS_CREATIVE_APPROVAL", permission: "amazonAds.approvals.create.assigned" };
  }
  if (serviceKey === "social-media") {
    return { approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL", permission: "socialMedia.approvals.create.assigned" };
  }
  if (serviceKey === "growth-hub") {
    return { approvalType: "SOCIAL_MEDIA_CREATIVE_APPROVAL", permission: "socialMedia.approvals.create.assigned" };
  }
  if (serviceKey === "web-mobile-design") {
    return { approvalType: "DESIGN_CREATIVE_APPROVAL", permission: "design.approvals.create.assigned" };
  }
  return null;
}

export function getDesignApprovalSetupForTask(
  task: Pick<Task, "approvalType" | "project"> | null | undefined,
): DesignApprovalSetup | null {
  const approvalType = task?.approvalType ?? null;

  if (approvalType?.startsWith("META_ADS")) {
    return { approvalType, permission: "metaAds.approvals.create.assigned" };
  }
  if (approvalType?.startsWith("TIKTOK_ADS")) {
    return { approvalType, permission: "tiktokAds.approvals.create.assigned" };
  }
  if (approvalType?.startsWith("AMAZON_ADS")) {
    return { approvalType, permission: "amazonAds.approvals.create.assigned" };
  }
  if (approvalType?.startsWith("SOCIAL_MEDIA")) {
    return { approvalType, permission: "socialMedia.approvals.create.assigned" };
  }
  if (approvalType === "DESIGN_CREATIVE_APPROVAL") {
    return { approvalType, permission: "design.approvals.create.assigned" };
  }

  return getDesignApprovalSetupForServiceKey(task?.project?.serviceKey);
}

function normalizeListMeta(meta: unknown, dataLength: number): TasksListMeta {
  if (!isRecord(meta)) {
    return createFallbackMeta(dataLength);
  }

  const total = readNumber(meta.total, dataLength);
  const limit = Math.max(readNumber(meta.limit, dataLength || 1), 1);
  const totalPages = Math.max(readNumber(meta.totalPages, Math.ceil(total / limit) || 1), 1);
  const page = Math.min(Math.max(readNumber(meta.page, 1), 1), totalPages);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: readBoolean(meta.hasNextPage, page < totalPages),
    hasPreviousPage: readBoolean(meta.hasPreviousPage, page > 1),
  };
}

function createFallbackMeta(dataLength: number): TasksListMeta {
  return {
    page: 1,
    limit: dataLength,
    total: dataLength,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function normalizeTask(value: unknown): Task | null {
  if (!isTask(value) || !isRecord(value)) {
    return null;
  }

  const hasTodos = "todos" in value;
  const todos = hasTodos ? normalizeTaskTodos(value.todos) : undefined;
  const workNotes = "workNotes" in value ? normalizeTaskWorkNotes(value.workNotes) : undefined;
  const hasCompletion = "completion" in value;
  const completion = hasCompletion
    ? normalizeTaskCompletion(value.completion, todos ?? [])
    : todos
      ? createCompletionFromTodos(todos)
      : undefined;
  const normalizedProject = normalizeTaskProjectServiceKey(value.project);

  return {
    ...value,
    ...(normalizedProject !== undefined ? { project: normalizedProject } : {}),
    ...(todos ? { todos } : {}),
    ...(workNotes ? { workNotes } : {}),
    ...(completion ? { completion } : {}),
  };
}

function normalizeTaskProjectServiceKey(
  project: Task["project"] | undefined,
): Task["project"] | undefined {
  if (project === undefined || project === null) {
    return project;
  }

  return {
    ...project,
    serviceKey: normalizeToUiServiceKey(project.serviceKey) ?? null,
  };
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.projectId === "string" &&
    (typeof value.sprintId === "undefined" || isStringOrNull(value.sprintId)) &&
    typeof value.title === "string" &&
    isStringOrNull(value.description) &&
    isTaskStatus(value.status) &&
    isPriority(value.priority) &&
    isTaskType(value.type) &&
    isTaskWorkstream(value.workstream) &&
    (value.severity === null || typeof value.severity === "undefined" || isTaskSeverity(value.severity)) &&
    (value.environment === null || typeof value.environment === "undefined" || isTaskEnvironment(value.environment)) &&
    (typeof value.affectedUrl === "undefined" || isStringOrNull(value.affectedUrl)) &&
    (typeof value.reproductionSteps === "undefined" || isStringOrNull(value.reproductionSteps)) &&
    (typeof value.reportedBy === "undefined" || isStringOrNull(value.reportedBy)) &&
    (typeof value.code === "undefined" || isStringOrNull(value.code)) &&
    (typeof value.branchName === "undefined" || isStringOrNull(value.branchName)) &&
    (typeof value.codePreparationNotes === "undefined" || isStringOrNull(value.codePreparationNotes)) &&
    (typeof value.codePreparedAt === "undefined" || isStringOrNull(value.codePreparedAt)) &&
    isStringOrNull(value.assigneeUserId) &&
    isStringOrNull(value.dueDate) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.project === null || isTaskProjectSummary(value.project)) &&
    (value.assignee === null || isTaskAssigneeSummary(value.assignee)) &&
    (typeof value.sprint === "undefined" || value.sprint === null || isTaskSprintSummary(value.sprint)) &&
    (typeof value.todos === "undefined" || Array.isArray(value.todos)) &&
    (typeof value.completion === "undefined" || isRecord(value.completion)) &&
    (typeof value.workNotes === "undefined" || Array.isArray(value.workNotes))
  );
}

function isTaskType(value: unknown): value is TaskType {
  return typeof value === "string" && TASK_TYPE_OPTIONS.includes(value as TaskType);
}

function isTaskWorkstream(value: unknown): value is TaskWorkstream {
  return typeof value === "string" && TASK_WORKSTREAM_OPTIONS.includes(value as TaskWorkstream);
}

function isTaskSeverity(value: unknown): value is TaskSeverity {
  return typeof value === "string" && TASK_SEVERITY_OPTIONS.includes(value as TaskSeverity);
}

function isTaskEnvironment(value: unknown): value is TaskEnvironment {
  return typeof value === "string" && TASK_ENVIRONMENT_OPTIONS.includes(value as TaskEnvironment);
}

function normalizeTaskTodos(value: unknown): TaskTodo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeTaskTodo).filter(isDefined);
}

function normalizeTaskWorkNotes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((note) => {
      if (!isRecord(note) || typeof note.id !== "string") {
        return null;
      }

      const body =
        typeof note.body === "string"
          ? note.body
          : typeof note.note === "string"
            ? note.note
            : null;
      if (!body) {
        return null;
      }

      const authorName =
        isRecord(note.author) && typeof note.author.displayName === "string"
          ? note.author.displayName
          : typeof note.authorName === "string"
            ? note.authorName
            : null;

      return {
        id: note.id,
        body,
        createdAt: isStringOrNull(note.createdAt) ? note.createdAt : null,
        authorName,
      };
    })
    .filter(isDefined);
}

function normalizeTaskTodo(value: unknown): TaskTodo | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === "string"
    ? value.title
    : typeof value.text === "string"
      ? value.text
      : null;
  const isCompleted = typeof value.isCompleted === "boolean"
    ? value.isCompleted
    : typeof value.completed === "boolean"
      ? value.completed
      : null;

  if (typeof value.id !== "string" || typeof title !== "string" || typeof isCompleted !== "boolean") {
    return null;
  }

  return {
    id: value.id,
    taskId: typeof value.taskId === "string" ? value.taskId : undefined,
    title,
    description: isStringOrNull(value.description) ? value.description : undefined,
    visibility: isTaskTodoVisibility(value.visibility) ? value.visibility : undefined,
    sortOrder: typeof value.sortOrder === "number" && Number.isFinite(value.sortOrder) ? value.sortOrder : undefined,
    isCompleted,
    completedAt: isStringOrNull(value.completedAt) ? value.completedAt : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

function isTaskProjectSummary(value: unknown): value is TaskProjectSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.clientProfileId === "string" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    isProjectStatus(value.status) &&
    isPriority(value.priority) &&
    (value.clientProfile === null || isProjectClientProfile(value.clientProfile))
  );
}

function isTaskAssigneeSummary(value: unknown): value is TaskAssigneeSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isStringOrNull(value.displayName) &&
    typeof value.role === "string"
  );
}

function isTaskSprintSummary(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.projectId === "string" &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    typeof value.startDate === "string" &&
    typeof value.endDate === "string"
  );
}

function isProjectClientProfile(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.companyName === "string" &&
    isStringOrNull(value.contactEmail)
  );
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUS_OPTIONS.includes(value as TaskStatus);
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && PROJECT_STATUS_OPTIONS.includes(value as ProjectStatus);
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITY_OPTIONS.includes(value as Priority);
}

function isTaskTodoVisibility(value: unknown): value is TaskTodoVisibility {
  return value === "INTERNAL" || value === "CLIENT_VISIBLE";
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function normalizeTaskCompletion(value: unknown, todos: TaskTodo[]): TaskCompletion {
  if (!isRecord(value)) {
    return createCompletionFromTodos(todos);
  }

  const fallback = createCompletionFromTodos(todos);
  const totalTodos = readNumber(value.totalTodos ?? value.total, fallback.totalTodos);
  const completedTodos = readNumber(value.completedTodos ?? value.completed, fallback.completedTodos);
  const percent = readNumber(value.percent ?? value.percentage, fallback.percent);

  return {
    totalTodos,
    completedTodos,
    percent: Math.min(Math.max(Math.round(percent), 0), 100),
  };
}

function normalizeCompletionValue(value: TaskCompletion, todos: TaskTodo[]): TaskCompletion {
  const fallback = createCompletionFromTodos(todos);
  const totalTodos = Number.isFinite(value.totalTodos) ? value.totalTodos : fallback.totalTodos;
  const completedTodos = Number.isFinite(value.completedTodos)
    ? value.completedTodos
    : fallback.completedTodos;
  const percent = Number.isFinite(value.percent)
    ? Math.min(Math.max(Math.round(value.percent), 0), 100)
    : fallback.percent;

  return {
    totalTodos,
    completedTodos,
    percent,
  };
}

function createCompletionFromTodos(todos: TaskTodo[]): TaskCompletion {
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.isCompleted).length;

  return {
    totalTodos,
    completedTodos,
    percent: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
  };
}
