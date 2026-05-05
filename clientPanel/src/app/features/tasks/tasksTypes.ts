import type { ServiceId } from "../../data/service-pages";

export type ClientTaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

export type ClientTaskVisibility = "CLIENT_VISIBLE" | "INTERNAL";

export type ClientTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

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
  dueDate: string | null;
  updatedAt: string | null;
  projectName: string | null;
  projectServiceId?: ServiceId | null;
  todos: ClientTaskTodo[];
  progressPercent: number;
};
