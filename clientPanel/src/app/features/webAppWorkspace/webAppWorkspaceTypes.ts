export type WorkspaceTabKey =
  | "OVERVIEW"
  | "TASKS"
  | "DELIVERY"
  | "FILES"
  | "CONTENT"
  | "MESSAGES"
  | "REVISIONS"
  | "REPORTS"
  | "MEETINGS";

export type WorkspaceProjectSummary = {
  id: string;
  clientProfileId: string;
  serviceKey: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  repositoryUrl?: string | null;
  figmaProjectUrl?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};

export type WorkspaceMessage = {
  id: string;
  projectId: string;
  parentMessageId?: string | null;
  tabKey: WorkspaceTabKey;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author?: {
    id: string;
    displayName?: string | null;
    role?: string;
  } | null;
};

export type WorkspaceRevisionStatus =
  | "REQUESTED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type WorkspaceRevision = {
  id: string;
  projectId?: string;
  taskId?: string | null;
  releaseId?: string | null;
  projectFileId?: string | null;
  title: string;
  description: string;
  status: WorkspaceRevisionStatus;
  requestedAt: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  requestedByUserId?: string | null;
  assignedToUserId?: string | null;
  task?: {
    id: string;
    title: string;
    code?: string | null;
    status: string;
  } | null;
  release?: {
    id: string;
    title: string;
    status: string;
    environment: string;
  } | null;
  projectFile?: {
    id: string;
    title: string;
    originalFileName?: string | null;
    folder?: {
      id: string;
      name: string;
    } | null;
  } | null;
  requestedBy?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
    accountType?: string | null;
  } | null;
  assignedTo?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
    accountType?: string | null;
  } | null;
  transitions?: Array<{
    id: string;
    fromStatus?: WorkspaceRevisionStatus | null;
    toStatus: WorkspaceRevisionStatus;
    note?: string | null;
    createdAt: string;
    actor?: {
      id: string;
      displayName?: string | null;
      role?: string | null;
    } | null;
  }>;
};

export type WorkspaceWeeklyReport = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  accomplishments?: string | null;
  plannedNext?: string | null;
  blockers?: string | null;
  createdAt: string;
};

export type WorkspaceMeetingRequest = {
  id: string;
  title: string;
  agenda?: string | null;
  status: string;
  preferredStartAt: string;
  preferredEndAt: string;
  timezone: string;
  responseNote?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  createdAt: string;
};

export type WorkspaceSourceTask = {
  id: string;
  title: string;
  code?: string | null;
  sprintId?: string | null;
  status: string;
  priority: string;
  type?: string | null;
  workstream?: string | null;
  severity?: string | null;
  environment?: string | null;
  assigneeUserId?: string | null;
  dueDate?: string | null;
  sprint?: {
    id: string;
    name: string;
    status: string;
    goal?: string | null;
    startDate: string;
    endDate: string;
  } | null;
  assignee?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
  } | null;
  todos?: Array<{
    id: string;
    title: string;
    description?: string | null;
    visibility: "INTERNAL" | "CLIENT_VISIBLE" | string;
    isCompleted: boolean;
  }>;
  completion?: {
    totalTodos: number;
    completedTodos: number;
    remainingTodos: number;
    completionPercentage: number;
    isComplete?: boolean;
  } | null;
  progressPercent?: number | null;
  referenceProjectFile?: {
    id: string;
    title: string;
    category?: string | null;
    originalFileName?: string | null;
    secureUrl: string;
    mimeType?: string | null;
    visibility: "INTERNAL" | "CLIENT_VISIBLE" | string;
    createdAt?: string | null;
    folder?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export type WorkspaceSourceSprint = {
  id: string;
  name: string;
  goal?: string | null;
  status: string;
  startDate: string;
  endDate: string;
};

export type WorkspaceSourceRelease = {
  id: string;
  title: string;
  environment: string;
  status: string;
  approvalStatus?: string | null;
  version?: string | null;
  scheduledAt?: string | null;
  deployedAt?: string | null;
};

export type WorkspaceSourceFile = {
  id: string;
  folderId?: string | null;
  title: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE" | string;
  category?: string | null;
  originalFileName: string;
  secureUrl: string;
  mimeType?: string | null;
  bytes?: number | null;
  createdAt: string;
  folder?: {
    id: string;
    name: string;
  } | null;
};

export type WorkspaceSourceOfTruth = {
  tasks: WorkspaceSourceTask[];
  sprints: WorkspaceSourceSprint[];
  releases: WorkspaceSourceRelease[];
  files: WorkspaceSourceFile[];
};

export type WorkspaceSectionItem = {
  id: string;
  title: string;
  body?: string | null;
  itemType?: string | null;
  href?: string | null;
  sortOrder?: number | null;
};

export type WorkspaceSection = {
  id: string;
  title: string;
  description?: string | null;
  items?: WorkspaceSectionItem[];
};

export type WebAppWorkspaceResponse = {
  project?: WorkspaceProjectSummary;
  tabKey?: WorkspaceTabKey | null;
  sourceOfTruth?: WorkspaceSourceOfTruth;
  sections?: WorkspaceSection[];
  messages?: WorkspaceMessage[];
  revisions?: WorkspaceRevision[];
  weeklyReports?: WorkspaceWeeklyReport[];
  meetingRequests?: WorkspaceMeetingRequest[];
};
