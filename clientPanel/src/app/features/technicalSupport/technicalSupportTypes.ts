export type TechnicalSupportConfig = {
  id: string;
  clientProfileId: string;
  slaLevel: string | null;
  supportPortalUrl: string | null;
  maintenanceWindowDay: string | null;
  maintenanceWindowTime: string | null;
  monitoringEnabled: boolean;
  backupFrequency: string | null;
  uptimeTarget: number | null;
  notes: string | null;
  updatedAt: string | null;
};

export type TechnicalSupportSummary = {
  hasActiveService: boolean;
  config: TechnicalSupportConfig | null;
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
  openTicketCount: number;
  resolvedTicketCount: number;
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
