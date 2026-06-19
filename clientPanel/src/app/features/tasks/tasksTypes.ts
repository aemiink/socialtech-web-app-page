import type { ServiceId } from "../../data/service-pages";

export type ClientTaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

export type ClientTaskVisibility = "CLIENT_VISIBLE" | "INTERNAL";

export type ClientTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ClientTaskType = "FEATURE" | "BUG" | "REVISION" | "QA" | "DEPLOYMENT" | "MAINTENANCE";

export type ClientTaskWorkstream =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "QA"
  | "DEVOPS"
  | "UI_INTEGRATION";

export type ClientTaskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ClientTaskEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type ClientTaskMetaAdsApprovalType =
  | "META_ADS_CAMPAIGN_APPROVAL"
  | "META_ADS_CREATIVE_APPROVAL"
  | "META_ADS_BUDGET_CHANGE_APPROVAL"
  | "META_ADS_REPORT_ACKNOWLEDGEMENT"
  | "META_ADS_STRATEGY_APPROVAL"
  | "TIKTOK_ADS_CAMPAIGN_APPROVAL"
  | "TIKTOK_ADS_VIDEO_CREATIVE_APPROVAL"
  | "TIKTOK_ADS_HOOK_TEST_APPROVAL"
  | "TIKTOK_ADS_UGC_SCRIPT_APPROVAL"
  | "TIKTOK_ADS_BUDGET_CHANGE_APPROVAL"
  | "TIKTOK_ADS_REPORT_ACKNOWLEDGEMENT"
  | "AMAZON_ADS_CAMPAIGN_APPROVAL"
  | "AMAZON_ADS_BUDGET_CHANGE_APPROVAL"
  | "AMAZON_ADS_REPORT_ACKNOWLEDGEMENT"
  | "AMAZON_ADS_STRATEGY_APPROVAL"
  | "AMAZON_ADS_CREATIVE_APPROVAL"
  | "AMAZON_ADS_PRODUCT_PROMOTION_APPROVAL"
  | "AMAZON_ADS_SEARCH_TERM_ACTION_APPROVAL"
  | "SOCIAL_MEDIA_POST_APPROVAL"
  | "SOCIAL_MEDIA_CREATIVE_APPROVAL"
  | "SOCIAL_MEDIA_CAPTION_APPROVAL"
  | "SOCIAL_MEDIA_CALENDAR_APPROVAL"
  | "SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT"
  | "DESIGN_CREATIVE_APPROVAL";
export type ClientTaskMetaAdsApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "ACKNOWLEDGED";

export type ClientTaskSprintSummary = {
  id: string;
  name: string;
  status: string;
};

export type ClientTaskCompletion = {
  totalTodos: number;
  completedTodos: number;
  remainingTodos: number;
  completionPercentage: number;
};

export type ClientTaskTodo = {
  id: string;
  title: string;
  description: string | null;
  visibility: ClientTaskVisibility;
  isCompleted: boolean;
};

export type ClientTask = {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: ClientTaskStatus;
  visibility: ClientTaskVisibility;
  priority: ClientTaskPriority;
  type?: ClientTaskType | null;
  workstream?: ClientTaskWorkstream | null;
  severity?: ClientTaskSeverity | null;
  environment?: ClientTaskEnvironment | null;
  dueDate: string | null;
  updatedAt: string | null;
  projectName: string | null;
  projectServiceId?: ServiceId | null;
  sprint?: ClientTaskSprintSummary | null;
  completion?: ClientTaskCompletion | null;
  approvalRequired?: boolean;
  approvalType?: ClientTaskMetaAdsApprovalType | null;
  approvalStatus?: ClientTaskMetaAdsApprovalStatus | null;
  approvalResponseNote?: string | null;
  approvalRequestedAt?: string | null;
  approvalRespondedAt?: string | null;
  campaignRef?: string | null;
  adSetRef?: string | null;
  adRef?: string | null;
  referenceProjectFile?: {
    id: string;
    title: string;
    secureUrl: string;
    mimeType: string;
    category: string;
    visibility: ClientTaskVisibility;
    approvalRequired: boolean;
    approvalStatus: ClientTaskMetaAdsApprovalStatus | null;
  } | null;
  todos: ClientTaskTodo[];
  progressPercent: number;
};

export type UpdateClientTaskApprovalRequest = {
  approvalStatus: ClientTaskMetaAdsApprovalStatus;
  approvalResponseNote?: string | null;
};
