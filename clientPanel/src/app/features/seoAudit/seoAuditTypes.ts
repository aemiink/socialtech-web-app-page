export type SeoAuditConfig = {
  id: string;
  clientProfileId: string;
  siteUrl: string | null;
  gaPropertyId: string | null;
  searchConsolePropertyUrl: string | null;
  targetKeywords: string[];
  auditFrequency: string | null;
  lastAuditScore: number | null;
  notes: string | null;
  updatedAt: string | null;
};

export type SeoAuditSummary = {
  hasActiveService: boolean;
  config: SeoAuditConfig | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    taskCount: number;
    fileCount: number;
    startDate: string | null;
    dueDate: string | null;
  }>;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  progressPercent: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    approvalStatus: string | null;
    approvalRequired: boolean;
    dueDate: string | null;
  }>;
  recentFiles: Array<{
    id: string;
    title: string;
    originalFileName: string;
    secureUrl: string;
    visibility: string;
    mimeType: string;
    approvalStatus: string | null;
    createdAt: string;
  }>;
  meta: {
    generatedAt: string;
  };
};
