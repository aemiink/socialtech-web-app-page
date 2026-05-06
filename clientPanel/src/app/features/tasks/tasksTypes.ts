import type { ServiceId } from "../../data/service-pages";

export type ClientTaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

export type ClientTaskVisibility = "CLIENT_VISIBLE" | "INTERNAL";

export type ClientTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ClientTaskType = "FEATURE" | "BUG" | "REVISION" | "QA" | "DEPLOYMENT" | "MAINTENANCE";

export type ClientTaskWorkstream =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "QA"
  | "DEVOPS"
  | "UI_INTEGRATION";

export type ClientTaskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ClientTaskEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export type ClientTaskSprintSummary = {
  id: string;
  name: string;
  status: string;
};

export type ClientTaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  remainingTodos: number;
  completionPercentage: number;
};

export type ClientTaskTodo = {
  id: string;
  title: string;
  description: string | null;
  visibility: ClientTaskVisibility;
  isCompleted: boolean;
};

export type ClientTask = {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: ClientTaskStatus;
  visibility: ClientTaskVisibility;
  priority: ClientTaskPriority;
  type?: ClientTaskType | null;
  workstream?: ClientTaskWorkstream | null;
  severity?: ClientTaskSeverity | null;
  environment?: ClientTaskEnvironment | null;
  dueDate: string | null;
  updatedAt: string | null;
  projectName: string | null;
  projectServiceId?: ServiceId | null;
  sprint?: ClientTaskSprintSummary | null;
  completion?: ClientTaskCompletion | null;
  todos: ClientTaskTodo[];
  progressPercent: number;
};
