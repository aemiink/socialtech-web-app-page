import type { ClientProfileSummary } from "../auth/authTypes";
import type { ClientPurchasedService, ServiceKey } from "../clients/clientsTypes";

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ProjectGa4Status = "NOT_CONFIGURED" | "PENDING" | "CONNECTED" | "ERROR";
export type ProjectGa4MeasurementProfile =
  | "CORPORATE"
  | "ECOMMERCE"
  | "SHOWCASE"
  | "LEAD_GENERATION"
  | "CUSTOM";

export type ProjectClientProfile = ClientProfileSummary & {
  purchasedServices?: ClientPurchasedService[];
};

export type Project = {
  id: string;
  clientProfileId: string;
  serviceKey?: ServiceKey | null;
  figmaProjectUrl?: string | null;
  repositoryUrl?: string | null;
  livePreviewUrl?: string | null;
  ga4MeasurementId?: string | null;
  ga4PropertyId?: string | null;
  ga4Status?: ProjectGa4Status;
  ga4MeasurementProfile?: ProjectGa4MeasurementProfile;
  ga4LastVerifiedAt?: string | null;
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

export type ProjectRepository = {
  id: string;
  projectId: string;
  provider: "GITHUB";
  owner: string;
  repo: string;
  repositoryUrl: string;
  defaultBranch?: string | null;
  installationId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  project?: Project | null;
};

export type ProjectAssigneeCandidate = {
  id: string;
  displayName: string | null;
  role: string;
};

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

export type WorkspaceContentItemType = "TEXT" | "LINK" | "EMBED" | "CHECKLIST" | "METRIC";

export type WorkspaceRevisionStatus =
  | "REQUESTED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type WorkspaceMeetingRequestStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED";

export type WorkspaceSection = {
  id: string;
  projectId: string;
  tabKey: WorkspaceTabKey;
  key: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items: WorkspaceContentItem[];
};

export type WorkspaceContentItem = {
  id: string;
  sectionId: string;
  itemType: WorkspaceContentItemType;
  title: string;
  body?: string | null;
  href?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMessage = {
  id: string;
  projectId: string;
  parentMessageId?: string | null;
  tabKey: WorkspaceTabKey;
  authorUserId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
    accountType?: string | null;
  } | null;
};

export type WorkspaceMessageInboxItem = WorkspaceMessage & {
  project?: {
    id: string;
    name: string;
    serviceKey?: string | null;
    clientProfile?: {
      id: string;
      companyName: string;
      slug?: string | null;
    } | null;
  } | null;
};

export type WorkspaceRevision = {
  id: string;
  projectId: string;
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
  assignedToUserId?: string | null;
  requestedByUserId?: string | null;
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
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  accomplishments?: string | null;
  plannedNext?: string | null;
  blockers?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMeetingRequest = {
  id: string;
  projectId: string;
  title: string;
  agenda?: string | null;
  preferredStartAt: string;
  preferredEndAt: string;
  timezone: string;
  status: WorkspaceMeetingRequestStatus;
  responseNote?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy?: {
    id: string;
    displayName?: string | null;
  } | null;
};

export type WorkspaceSnapshotResponse = {
  project: Project;
  tabKey?: WorkspaceTabKey | null;
  sections: WorkspaceSection[];
  messages: WorkspaceMessage[];
  revisions: WorkspaceRevision[];
  weeklyReports: WorkspaceWeeklyReport[];
  meetingRequests: WorkspaceMeetingRequest[];
};

export type ProjectRepositoryConnectRequest = {
  owner: string;
  repo: string;
  repositoryUrl?: string;
  defaultBranch?: string | null;
  accessToken?: string | null;
  installationId?: string | null;
  isActive?: boolean;
};

export type GithubBranch = {
  name: string;
  protected: boolean;
  commitSha?: string | null;
  commitUrl?: string | null;
  htmlUrl?: string | null;
};

export type GithubCommit = {
  sha: string;
  shortSha: string;
  message: string;
  authorName?: string | null;
  authorEmail?: string | null;
  githubAuthorLogin?: string | null;
  committedAt?: string | null;
  htmlUrl?: string | null;
  branch?: string | null;
};

export type GithubPullRequest = {
  number: number | null;
  title: string;
  state: string;
  merged: boolean;
  authorLogin?: string | null;
  headRef?: string | null;
  baseRef?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  htmlUrl?: string | null;
};

export type GithubWorkflowRun = {
  id: number | null;
  name?: string | null;
  status?: string | null;
  conclusion?: string | null;
  branch?: string | null;
  event?: string | null;
  runNumber?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  htmlUrl?: string | null;
};

export type ProjectFileVisibility = "INTERNAL" | "CLIENT_VISIBLE";
export type ProjectFileCategory =
  | "WEB_SOURCE"
  | "WEB_BUILD"
  | "MOBILE_SOURCE"
  | "MOBILE_BUILD"
  | "ADS_CREATIVE"
  | "REPORT"
  | "SEO_REPORT"
  | "BRAND_ASSET"
  | "DOCUMENT"
  | "CONTRACT"
  | "OTHER";

export type ProjectFile = {
  id: string;
  projectId: string;
  folderId?: string | null;
  clientProfileId: string;
  serviceKey?: ServiceKey | null;
  category: ProjectFileCategory;
  visibility: ProjectFileVisibility;
  title: string;
  description?: string | null;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string | null;
  bytes: number;
  mimeType: string;
  originalFileName: string;
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
    | "SOCIAL_MEDIA_POST_APPROVAL"
    | "SOCIAL_MEDIA_CREATIVE_APPROVAL"
    | "SOCIAL_MEDIA_CAPTION_APPROVAL"
    | "SOCIAL_MEDIA_CALENDAR_APPROVAL"
    | "SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT"
    | "DESIGN_CREATIVE_APPROVAL"
    | null;
  approvalStatus?:
    | "PENDING"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "REJECTED"
    | "ACKNOWLEDGED"
    | null;
  approvalResponseNote?: string | null;
  approvalRequestedAt?: string | null;
  approvalRespondedAt?: string | null;
  approvalRespondedByUserId?: string | null;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
  } | null;
  project?: Project | null;
  uploader?: {
    id: string;
    displayName?: string | null;
    role?: string | null;
  } | null;
};

export type ProjectFileFolder = {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFileFolderAssignee = {
  id: string;
  displayName?: string | null;
  email: string;
  role: string;
  isAssigned: boolean;
};

export type ProjectFilesListResponse = {
  data: ProjectFile[];
  meta: ProjectsListMeta;
};

export type ProjectFilesListQuery = {
  projectId: string;
  folderId?: string;
  category?: ProjectFileCategory;
  visibility?: ProjectFileVisibility;
  search?: string;
  page?: number;
  limit?: number;
};

export type ProjectFileUploadSignatureRequest = {
  projectId: string;
  fileName: string;
  title: string;
  description?: string | null;
  mimeType: string;
  bytes: number;
  category: ProjectFileCategory;
  visibility: ProjectFileVisibility;
  folderId?: string;
  overwrite?: boolean;
  overwriteFileId?: string;
  approvalRequired?: boolean;
  approvalType?: ProjectFile["approvalType"];
  approvalStatus?: ProjectFile["approvalStatus"];
};

export type ProjectFileUploadSignatureResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  publicId: string;
  assetFolder?: string | null;
  folderId?: string | null;
  signature: string;
  uploadUrl: string;
  overwrite: boolean;
  overwriteFileId?: string | null;
};

export type CompleteProjectFileUploadRequest = {
  projectId: string;
  originalFileName: string;
  title: string;
  description?: string | null;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string | null;
  bytes: number;
  mimeType: string;
  category: ProjectFileCategory;
  visibility: ProjectFileVisibility;
  folderId?: string;
  overwrite?: boolean;
  overwriteFileId?: string;
  approvalRequired?: boolean;
  approvalType?: ProjectFile["approvalType"];
  approvalStatus?: ProjectFile["approvalStatus"];
};

export type CreateProjectFileFolderRequest = {
  projectId: string;
  name: string;
};

export type UpdateProjectFileFolderAssigneesRequest = {
  projectId: string;
  folderId: string;
  userIds: string[];
};

export type CreateProjectFileShareLinkRequest = {
  projectId: string;
  fileId: string;
  expiresInHours?: number;
};

export type ProjectFileShareLink = {
  id: string;
  projectFileId: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  projectFile?: {
    id: string;
    title: string;
    originalFileName: string;
  };
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
  serviceKey?: ServiceKey | null;
  figmaProjectUrl?: string | null;
  repositoryUrl?: string | null;
  livePreviewUrl?: string | null;
  ga4MeasurementId?: string | null;
  ga4PropertyId?: string | null;
  ga4Status?: ProjectGa4Status;
  ga4MeasurementProfile?: ProjectGa4MeasurementProfile;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdateProjectRequest = Partial<CreateProjectRequest>;
