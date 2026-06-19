export type DesignSystemStatus = "NONE" | "IN_PROGRESS" | "COMPLETED";

export type WebMobileDesignConfig = {
  id: string;
  clientProfileId: string;
  figmaFileUrl: string | null;
  prototypeUrl: string | null;
  styleGuideUrl: string | null;
  designSystemStatus: DesignSystemStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontFamily: string | null;
  targetPlatforms: string[];
  gridSystem: string | null;
  notes: string | null;
  updatedAt: string | null;
};

export type WebMobileDesignSummary = {
  hasActiveService: boolean;
  config: WebMobileDesignConfig | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    figmaProjectUrl: string | null;
    startDate: string | null;
    dueDate: string | null;
    taskCount: number;
    fileCount: number;
  }>;
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  approvalStats: {
    total: number;
    pending: number;
    approved: number;
  };
  revisionCount: number;
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
