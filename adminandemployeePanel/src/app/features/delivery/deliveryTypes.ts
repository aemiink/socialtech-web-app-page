import type { Priority, Project } from "../projects/projectsTypes";
import type { Task, TaskEnvironment } from "../tasks/tasksTypes";

export type DeliverySprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type DeliveryReleaseStatus =
  | "PLANNED"
  | "TESTING"
  | "READY"
  | "DEPLOYED"
  | "FAILED"
  | "ROLLED_BACK";
export type DeliveryReleaseApprovalStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export type DeliveryPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DeliverySprint = {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: DeliverySprintStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  project: Project | null;
  taskCounts: {
    total: number;
    completed: number;
    open: number;
  };
  progressPercent: number;
};

export type DeliveryRelease = {
  id: string;
  projectId: string;
  title: string;
  environment: TaskEnvironment;
  status: DeliveryReleaseStatus;
  approvalStatus?: DeliveryReleaseApprovalStatus;
  version?: string | null;
  releaseNotes?: string | null;
  approvalNotes?: string | null;
  approvalRequestedAt?: string | null;
  approvalRespondedAt?: string | null;
  approvalActorUserId?: string | null;
  approvalActor?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
  } | null;
  scheduledAt?: string | null;
  deployedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  project: Project | null;
};

export type DeliverySprintsResponse = {
  data: DeliverySprint[];
  meta: DeliveryPaginationMeta;
};

export type DeliveryReleasesResponse = {
  data: DeliveryRelease[];
  meta: DeliveryPaginationMeta;
};

export type DeliverySprintQuery = {
  projectId?: string;
  status?: DeliverySprintStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type DeliveryReleaseQuery = {
  projectId?: string;
  status?: DeliveryReleaseStatus;
  environment?: TaskEnvironment;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateDeliverySprintRequest = {
  projectId: string;
  name: string;
  goal?: string | null;
  status?: DeliverySprintStatus;
  startDate: string;
  endDate: string;
};

export type UpdateDeliverySprintRequest = Partial<CreateDeliverySprintRequest>;

export type CreateDeliveryReleaseRequest = {
  projectId: string;
  title: string;
  environment: TaskEnvironment;
  status?: DeliveryReleaseStatus;
  approvalStatus?: DeliveryReleaseApprovalStatus;
  version?: string | null;
  releaseNotes?: string | null;
  approvalNotes?: string | null;
  scheduledAt?: string | null;
};

export type UpdateDeliveryReleaseRequest = Partial<CreateDeliveryReleaseRequest>;

export type DeliverySummary = {
  assignedOpenTasks: number;
  criticalBugs: number;
  activeSprints: number;
  testingQueue: number;
  completedThisSprint: number;
  activeSprintCards: DeliverySprint[];
  criticalBugCards: Task[];
  todaysTasks: Task[];
  releaseQueue: DeliveryRelease[];
  recentCommits: Array<Record<string, unknown>>;
  openPullRequests: Array<Record<string, unknown>>;
};
