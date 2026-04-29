import type { ClientProfileSummary } from "../auth/authTypes";

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ProjectClientProfile = ClientProfileSummary;

export type Project = {
  id: string;
  clientProfileId: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  clientProfile: ProjectClientProfile | null;
};

export type ProjectsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProjectsListResponse = {
  data: Project[];
  meta: ProjectsListMeta;
};

export type ProjectsListQuery = {
  clientProfileId?: string;
  status?: ProjectStatus;
  priority?: Priority;
  q?: string;
  dueFrom?: string;
  dueTo?: string;
};

export type CreateProjectRequest = {
  clientProfileId: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdateProjectRequest = Partial<CreateProjectRequest>;
