import type {
  ClientTaskCompletion,
  ClientTaskEnvironment,
  ClientTask,
  ClientTaskPriority,
  ClientTaskSeverity,
  ClientTaskSprintSummary,
  ClientTaskStatus,
  ClientTaskTodo,
  ClientTaskType,
  ClientTaskVisibility,
  ClientTaskWorkstream,
} from "./tasksTypes";
import { normalizeServiceId } from "../auth/authNormalizers";

const TASK_STATUSES: readonly ClientTaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BLOCKED",
];
const TASK_PRIORITIES: readonly ClientTaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TASK_TYPES: readonly ClientTaskType[] = [
  "FEATURE",
  "BUG",
  "REVISION",
  "QA",
  "DEPLOYMENT",
  "MAINTENANCE",
];
const TASK_WORKSTREAMS: readonly ClientTaskWorkstream[] = [
  "FRONTEND",
  "BACKEND",
  "FULLSTACK",
  "QA",
  "DEVOPS",
  "UI_INTEGRATION",
];
const TASK_SEVERITIES: readonly ClientTaskSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TASK_ENVIRONMENTS: readonly ClientTaskEnvironment[] = ["DEVELOPMENT", "STAGING", "PRODUCTION"];

export function normalizeClientTasksResponse(value: unknown): ClientTask[] {
  const taskList = readResponseArray(value);

  return taskList.flatMap((entry) => {
    const task = normalizeClientTask(entry);
    return task ? [task] : [];
  });
}

export function filterClientVisibleTodoProgressTasks(tasks: ClientTask[]): ClientTask[] {
  return tasks.flatMap((task) => {
    const visibleTodos = task.todos.filter((todo) => todo.visibility === "CLIENT_VISIBLE");

    if (visibleTodos.length === 0) {
      return [];
    }

    return [
      {
        ...task,
        todos: visibleTodos,
        progressPercent: calculateTodoProgress(visibleTodos),
      },
    ];
  });
}

function normalizeClientTask(value: unknown): ClientTask | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const id = readRequiredString(record.id);
  const title = readRequiredString(record.title);
  const status = readEnumValue(record.status, TASK_STATUSES);

  if (!id || !title || !status) {
    return null;
  }

  const projectRecord = toRecord(record.project);
  const todos = readTaskTodos(record.todos);
  const completion = readTaskCompletion(record.completion);

  return {
    id,
    projectId: readOptionalString(record.projectId) ?? readOptionalString(projectRecord?.id),
    title,
    description: readOptionalString(record.description),
    status,
    visibility: readTaskVisibility(record),
    priority: readEnumValue(record.priority, TASK_PRIORITIES) ?? "MEDIUM",
    type: readEnumValue(record.type, TASK_TYPES),
    workstream: readEnumValue(record.workstream, TASK_WORKSTREAMS),
    severity: readEnumValue(record.severity, TASK_SEVERITIES),
    environment: readEnumValue(record.environment, TASK_ENVIRONMENTS),
    dueDate: readOptionalString(record.dueDate),
    updatedAt: readOptionalString(record.updatedAt),
    projectName: readOptionalString(projectRecord?.name),
    projectServiceId:
      normalizeServiceId(projectRecord?.serviceId) ??
      normalizeServiceId(projectRecord?.serviceKey) ??
      normalizeServiceId(record.serviceId) ??
      normalizeServiceId(record.serviceKey),
    sprint: readTaskSprint(record.sprint),
    completion,
    todos,
    progressPercent: readProgressPercent(record.progressPercent, completion, todos, status),
  };
}

function readResponseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = toRecord(value);
  if (!record) {
    return [];
  }

  return Array.isArray(record.data) ? record.data : [];
}

function readTaskVisibility(record: Record<string, unknown>): ClientTaskVisibility {
  const rawVisibility =
    readOptionalString(record.visibility) ??
    readOptionalString(record.clientVisibility) ??
    readOptionalString(record.audience);

  return rawVisibility?.toUpperCase().replace(/-/g, "_") === "CLIENT_VISIBLE"
    ? "CLIENT_VISIBLE"
    : "INTERNAL";
}

function readTaskTodos(value: unknown): ClientTaskTodo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    const todo = normalizeClientTaskTodo(entry);
    return todo ? [todo] : [];
  });
}

function normalizeClientTaskTodo(value: unknown): ClientTaskTodo | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const id = readRequiredString(record.id);
  const title = readRequiredString(record.title);

  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    description: readOptionalString(record.description),
    visibility: readTaskVisibility(record),
    isCompleted: record.isCompleted === true,
  };
}

function readTaskSprint(value: unknown): ClientTaskSprintSummary | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const id = readRequiredString(record.id);
  const name = readRequiredString(record.name);
  const status = readRequiredString(record.status);

  if (!id || !name || !status) {
    return null;
  }

  return { id, name, status };
}

function readTaskCompletion(value: unknown): ClientTaskCompletion | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const totalTodos = readFiniteNumber(record.totalTodos);
  const completedTodos = readFiniteNumber(record.completedTodos);
  const remainingTodos = readFiniteNumber(record.remainingTodos);
  const completionPercentage = readFiniteNumber(record.completionPercentage);

  if (
    totalTodos === null ||
    completedTodos === null ||
    remainingTodos === null ||
    completionPercentage === null
  ) {
    return null;
  }

  return {
    totalTodos,
    completedTodos,
    remainingTodos,
    completionPercentage,
  };
}

function readProgressPercent(
  value: unknown,
  completion: ClientTaskCompletion | null,
  todos: ClientTaskTodo[],
  status: ClientTaskStatus,
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  if (completion) {
    return Math.min(100, Math.max(0, Math.round(completion.completionPercentage)));
  }

  if (todos.length > 0) {
    return calculateTodoProgress(todos);
  }

  return status === "IN_PROGRESS" ? 60 : 15;
}

function calculateTodoProgress(todos: ClientTaskTodo[]): number {
  if (todos.length === 0) {
    return 0;
  }

  const completedTodos = todos.filter((todo) => todo.isCompleted).length;
  return Math.round((completedTodos / todos.length) * 100);
}

function readRequiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readEnumValue<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
): TValue | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return allowedValues.find((allowedValue) => allowedValue === normalized) ?? null;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
