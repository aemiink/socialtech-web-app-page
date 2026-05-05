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

export type WorkspaceRevision = {
  id: string;
  title: string;
  description: string;
  status: string;
  requestedAt: string;
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
