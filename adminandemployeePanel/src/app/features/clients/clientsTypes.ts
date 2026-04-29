export type ClientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type ClientProfile = {
  id: string;
  slug: string;
  companyName: string;
  contactEmail: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClientsSortBy = "createdAt" | "updatedAt" | "name" | "slug" | "status";
export type ClientsSortOrder = "asc" | "desc";

export type ClientsListQuery = {
  page?: number;
  limit?: number;
  sortBy?: ClientsSortBy;
  sortOrder?: ClientsSortOrder;
  status?: ClientStatus;
  search?: string;
};

export type ClientsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ClientsListResponse = {
  data: ClientProfile[];
  meta: ClientsListMeta;
};

export type ClientSummaryProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD";

export type ClientSummaryTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED";

export type ClientSummaryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ClientSummaryRecentProject = {
  id: string;
  name: string;
  status: ClientSummaryProjectStatus;
  priority: ClientSummaryPriority;
  dueDate: string | null;
  updatedAt: string;
};

export type ClientSummaryRecentTask = {
  id: string;
  title: string;
  status: ClientSummaryTaskStatus;
  priority: ClientSummaryPriority;
  dueDate: string | null;
  updatedAt: string;
  projectId: string;
};

export type ClientSummaryResponse = {
  client: {
    id: string;
    name: string;
    slug: string;
    status: ClientStatus;
    createdAt: string;
    updatedAt: string;
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
    recent: ClientSummaryRecentProject[];
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
    recent: ClientSummaryRecentTask[];
  };
  meta: {
    generatedAt: string;
  };
};
