import { DeliverySprintStatus, TaskStatus, TaskTodoVisibility } from "@prisma/client";

export type SprintProgressTodoSnapshot = {
  isCompleted: boolean;
  visibility?: TaskTodoVisibility;
};

export type SprintProgressTaskSnapshot = {
  status: TaskStatus;
  todos?: SprintProgressTodoSnapshot[] | null;
};

export type SprintTaskCounts = {
  total: number;
  completed: number;
  open: number;
};

export type SprintProgressMetrics = {
  taskCounts: SprintTaskCounts;
  progressPercent: number;
  hasProgress: boolean;
  isComplete: boolean;
};

const TASK_STATUS_BASE_PROGRESS: Record<TaskStatus, number> = {
  [TaskStatus.TODO]: 0,
  [TaskStatus.BLOCKED]: 0.2,
  [TaskStatus.IN_PROGRESS]: 0.5,
  [TaskStatus.REVIEW]: 0.8,
  [TaskStatus.DONE]: 1,
};

type SprintProgressOptions = {
  hideInternalTodos?: boolean;
};

export function calculateSprintProgressMetrics(
  tasks: SprintProgressTaskSnapshot[],
  options?: SprintProgressOptions,
): SprintProgressMetrics {
  const total = tasks.length;
  const completed = tasks.filter((task) => isSprintTaskComplete(task, options)).length;
  const progressWeight = tasks.reduce(
    (sum, task) => sum + calculateSprintTaskProgressWeight(task, options),
    0,
  );

  return {
    taskCounts: {
      total,
      completed,
      open: total - completed,
    },
    progressPercent: total === 0 ? 0 : Math.round((progressWeight / total) * 100),
    hasProgress: progressWeight > 0,
    isComplete: total > 0 && completed === total,
  };
}

export function resolveAutoSprintStatus(
  currentStatus: DeliverySprintStatus,
  metrics: SprintProgressMetrics,
): DeliverySprintStatus {
  if (currentStatus === DeliverySprintStatus.CANCELLED) {
    return DeliverySprintStatus.CANCELLED;
  }

  if (metrics.isComplete) {
    return DeliverySprintStatus.COMPLETED;
  }

  if (metrics.hasProgress) {
    return DeliverySprintStatus.ACTIVE;
  }

  return DeliverySprintStatus.PLANNED;
}

function calculateSprintTaskProgressWeight(
  task: SprintProgressTaskSnapshot,
  options?: SprintProgressOptions,
): number {
  if (task.status === TaskStatus.DONE) {
    return 1;
  }

  const baseWeight = TASK_STATUS_BASE_PROGRESS[task.status];
  const todoCompletionRatio = getTodoCompletionRatio(task, options);

  if (todoCompletionRatio === null) {
    return baseWeight;
  }

  return baseWeight + (1 - baseWeight) * todoCompletionRatio;
}

function isSprintTaskComplete(
  task: SprintProgressTaskSnapshot,
  options?: SprintProgressOptions,
): boolean {
  if (task.status === TaskStatus.DONE) {
    return true;
  }

  const todoSummary = getVisibleTodoSummary(task, options);
  return todoSummary.total > 0 && todoSummary.completed === todoSummary.total;
}

function getTodoCompletionRatio(
  task: SprintProgressTaskSnapshot,
  options?: SprintProgressOptions,
): number | null {
  const todoSummary = getVisibleTodoSummary(task, options);

  if (todoSummary.total === 0) {
    return null;
  }

  return todoSummary.completed / todoSummary.total;
}

function getVisibleTodoSummary(
  task: SprintProgressTaskSnapshot,
  options?: SprintProgressOptions,
) {
  const visibleTodos = (task.todos ?? []).filter((todo) => {
    if (!options?.hideInternalTodos) {
      return true;
    }

    return todo.visibility === TaskTodoVisibility.CLIENT_VISIBLE;
  });

  return {
    total: visibleTodos.length,
    completed: visibleTodos.filter((todo) => todo.isCompleted).length,
  };
}
