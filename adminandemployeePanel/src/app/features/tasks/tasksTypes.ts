import type { UserRole } from "../auth/authTypes";
import type { Priority, ProjectClientProfile, ProjectStatus } from "../projects/projectsTypes";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
export type TaskTodoVisibility = "INTERNAL" | "CLIENT_VISIBLE";

export type TaskProjectSummary = {
  id: string;
  clientProfileId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  priority: Priority;
  clientProfile: ProjectClientProfile | null;
};

export type TaskAssigneeSummary = {
  id: string;
  displayName: string | null;
  role: UserRole;
};

export type TaskTodo = {
  id: string;
  taskId?: string;
  title: string;
  description?: string | null;
  visibility?: TaskTodoVisibility;
  sortOrder?: number;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  percent: number;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigneeUserId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project: TaskProjectSummary | null;
  assignee: TaskAssigneeSummary | null;
  todos?: TaskTodo[];
  completion?: TaskCompletion;
};

export type TasksListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TasksListResponse = {
  data: Task[];
  meta: TasksListMeta;
};

export type TasksListQuery = {
  projectId?: string;
  clientProfileId?: string;
  assigneeUserId?: string;
  status?: TaskStatus;
  priority?: Priority;
  q?: string;
  dueFrom?: string;
  dueTo?: string;
};

export type CreateTaskRequest = {
  projectId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  assigneeUserId?: string | null;
  dueDate?: string | null;
};

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export type CreateTaskTodoRequest = {
  title: string;
  description?: string | null;
  visibility?: TaskTodoVisibility;
  sortOrder?: number;
};

export type UpdateTaskTodoRequest = {
  title?: string;
  description?: string | null;
  visibility?: TaskTodoVisibility;
  sortOrder?: number;
};

export type ToggleTaskTodoRequest = {
  isCompleted: boolean;
};

export type TaskTodoMutationResponse = TaskTodo | Task | { success?: boolean };
