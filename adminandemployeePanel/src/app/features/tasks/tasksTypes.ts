import type { UserRole } from "../auth/authTypes";
import type { Priority, ProjectClientProfile, ProjectStatus } from "../projects/projectsTypes";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
export type TaskTodoVisibility = "INTERNAL" | "CLIENT_VISIBLE";
export type TaskType =
  | "FEATURE"
  | "BUG"
  | "REVISION"
  | "QA"
  | "DEPLOYMENT"
  | "MAINTENANCE";
export type TaskWorkstream =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "QA"
  | "DEVOPS"
  | "UI_INTEGRATION";
export type TaskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type TaskApprovalType =
  | "META_ADS_CAMPAIGN_APPROVAL"
  | "META_ADS_CREATIVE_APPROVAL"
  | "META_ADS_BUDGET_CHANGE_APPROVAL"
  | "META_ADS_REPORT_ACKNOWLEDGEMENT"
  | "META_ADS_STRATEGY_APPROVAL";
export type TaskApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "ACKNOWLEDGED";

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
  sprintId?: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  type: TaskType;
  workstream: TaskWorkstream;
  severity?: TaskSeverity | null;
  environment?: TaskEnvironment | null;
  affectedUrl?: string | null;
  reproductionSteps?: string | null;
  reportedBy?: string | null;
  code?: string | null;
  branchName?: string | null;
  codePreparationNotes?: string | null;
  codePreparedAt?: string | null;
  assigneeUserId: string | null;
  dueDate: string | null;
  approvalRequired?: boolean;
  approvalType?: TaskApprovalType | null;
  approvalStatus?: TaskApprovalStatus | null;
  approvalResponseNote?: string | null;
  approvalRequestedAt?: string | null;
  approvalRespondedAt?: string | null;
  referenceProjectFileId?: string | null;
  campaignRef?: string | null;
  adSetRef?: string | null;
  adRef?: string | null;
  createdAt: string;
  updatedAt: string;
  project: TaskProjectSummary | null;
  assignee: TaskAssigneeSummary | null;
  sprint?: {
    id: string;
    projectId: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  todos?: TaskTodo[];
  completion?: TaskCompletion;
  workNotes?: Array<{
    id: string;
    body: string;
    createdAt?: string | null;
    authorName?: string | null;
  }>;
};

export type TaskGithubCommit = {
  sha: string;
  shortSha: string;
  message: string;
  authorName?: string | null;
  githubAuthorLogin?: string | null;
  committedAt?: string | null;
  htmlUrl?: string | null;
  branch?: string | null;
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
  sprintId?: string;
  status?: TaskStatus;
  priority?: Priority;
  type?: TaskType;
  workstream?: TaskWorkstream;
  severity?: TaskSeverity;
  environment?: TaskEnvironment;
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
  type?: TaskType;
  workstream?: TaskWorkstream;
  severity?: TaskSeverity | null;
  environment?: TaskEnvironment | null;
  affectedUrl?: string | null;
  reproductionSteps?: string | null;
  reportedBy?: string | null;
  code?: string | null;
  assigneeUserId?: string | null;
  sprintId?: string | null;
  dueDate?: string | null;
  approvalRequired?: boolean;
  approvalType?: TaskApprovalType | null;
  approvalStatus?: TaskApprovalStatus | null;
  approvalResponseNote?: string | null;
  approvalRequestedAt?: string | null;
  approvalRespondedAt?: string | null;
  referenceProjectFileId?: string | null;
  campaignRef?: string | null;
  adSetRef?: string | null;
  adRef?: string | null;
};

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export type CreateTaskWorkNoteRequest = {
  note: string;
};

export type PrepareTaskCodeRequest = {
  branchName?: string;
  notes?: string | null;
};

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
