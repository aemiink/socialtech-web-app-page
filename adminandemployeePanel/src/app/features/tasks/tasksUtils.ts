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
  TaskAssigneeSummary,
  TaskCompletion,
  TaskProjectSummary,
  TaskTodo,
  TaskTodoVisibility,
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
  const hasCompletion = "completion" in value;
  const completion = hasCompletion
    ? normalizeTaskCompletion(value.completion, todos ?? [])
    : todos
      ? createCompletionFromTodos(todos)
      : undefined;

  return {
    ...value,
    ...(todos ? { todos } : {}),
    ...(completion ? { completion } : {}),
  };
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.projectId === "string" &&
    typeof value.title === "string" &&
    isStringOrNull(value.description) &&
    isTaskStatus(value.status) &&
    isPriority(value.priority) &&
    isStringOrNull(value.assigneeUserId) &&
    isStringOrNull(value.dueDate) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.project === null || isTaskProjectSummary(value.project)) &&
    (value.assignee === null || isTaskAssigneeSummary(value.assignee)) &&
    (typeof value.todos === "undefined" || Array.isArray(value.todos)) &&
    (typeof value.completion === "undefined" || isRecord(value.completion))
  );
}

function normalizeTaskTodos(value: unknown): TaskTodo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeTaskTodo).filter(isDefined);
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
