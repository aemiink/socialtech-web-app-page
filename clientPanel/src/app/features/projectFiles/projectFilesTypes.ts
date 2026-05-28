export type ProjectFile = {
  id: string;
  projectId: string;
  category: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
  title: string;
  description?: string | null;
  secureUrl: string;
  originalFileName: string;
  bytes: number;
  mimeType: string;
  approvalRequired?: boolean;
  approvalType?:
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
    | null;
  approvalStatus?:
    | "PENDING"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "REJECTED"
    | "ACKNOWLEDGED"
    | null;
  approvalResponseNote?: string | null;
  campaignRef?: string | null;
  adSetRef?: string | null;
  adRef?: string | null;
  createdAt: string;
};

export type ProjectFilesResponse = {
  data: ProjectFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
