import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  GrowthHubActionPriority,
  GrowthHubActionStatus,
  GrowthHubGoal,
  GrowthHubRecommendationStatus,
  GrowthHubRecommendationType,
  GrowthHubReportStatus,
  GrowthHubReportType,
  GrowthHubStatus,
  MetaAdsApprovalStatus,
  MetaAdsApprovalType,
  Prisma,
  Priority,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TaskStatus,
  TaskType,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import {
  CreateGrowthHubActionDto,
  UpdateGrowthHubActionDto,
} from "./dto/growth-hub-action.dto";
import {
  CreateGrowthHubWeeklyNoteDto,
  UpdateGrowthHubWeeklyNoteDto,
} from "./dto/growth-hub-weekly-note.dto";
import {
  CreateGrowthHubReportDto,
  GrowthHubReportsQueryDto,
  PublishGrowthHubReportDto,
  UpdateGrowthHubReportDto,
} from "./dto/growth-hub-report.dto";
import {
  ConvertGrowthHubRecommendationDto,
  GrowthHubRecommendationsQueryDto,
  UpdateGrowthHubRecommendationDto,
} from "./dto/growth-hub-recommendation.dto";
import { UpdateGrowthHubConfigDto } from "./dto/update-growth-hub-config.dto";
import {
  GrowthHubActionItem,
  GrowthHubActivityItem,
  GrowthHubChannelSummary,
  GrowthHubSummaryResponse,
  GrowthHubSummaryService,
  GrowthHubSummaryState,
} from "./growth-hub-summary.service";

const GROWTH_HUB_CONFIG_READ_ANY_PERMISSION = "growthHub.config.read.any";
const GROWTH_HUB_CONFIG_MANAGE_ANY_PERMISSION = "growthHub.config.manage.any";
const GROWTH_HUB_CONFIG_READ_ASSIGNED_PERMISSION = "growthHub.config.read.assigned";
const GROWTH_HUB_CONFIG_READ_OWN_PERMISSION = "growthHub.config.read.own";
const GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION = "growthHub.summary.read.any";
const GROWTH_HUB_SUMMARY_READ_ASSIGNED_PERMISSION = "growthHub.summary.read.assigned";
const GROWTH_HUB_SUMMARY_READ_OWN_PERMISSION = "growthHub.summary.read.own";
const GROWTH_HUB_ACTIONS_READ_ANY_PERMISSION = "growthHub.actions.read.any";
const GROWTH_HUB_ACTIONS_MANAGE_ANY_PERMISSION = "growthHub.actions.manage.any";
const GROWTH_HUB_ACTIONS_READ_ASSIGNED_PERMISSION = "growthHub.actions.read.assigned";
const GROWTH_HUB_ACTIONS_MANAGE_ASSIGNED_PERMISSION = "growthHub.actions.manage.assigned";
const GROWTH_HUB_ACTIONS_READ_OWN_PERMISSION = "growthHub.actions.read.own";
const GROWTH_HUB_NOTES_READ_ANY_PERMISSION = "growthHub.notes.read.any";
const GROWTH_HUB_NOTES_MANAGE_ANY_PERMISSION = "growthHub.notes.manage.any";
const GROWTH_HUB_NOTES_READ_ASSIGNED_PERMISSION = "growthHub.notes.read.assigned";
const GROWTH_HUB_NOTES_MANAGE_ASSIGNED_PERMISSION = "growthHub.notes.manage.assigned";
const GROWTH_HUB_NOTES_READ_OWN_PERMISSION = "growthHub.notes.read.own";
const GROWTH_HUB_REPORTS_READ_ANY_PERMISSION = "growthHub.reports.read.any";
const GROWTH_HUB_REPORTS_MANAGE_ANY_PERMISSION = "growthHub.reports.manage.any";
const GROWTH_HUB_REPORTS_READ_ASSIGNED_PERMISSION = "growthHub.reports.read.assigned";
const GROWTH_HUB_REPORTS_MANAGE_ASSIGNED_PERMISSION = "growthHub.reports.manage.assigned";
const GROWTH_HUB_REPORTS_READ_OWN_PERMISSION = "growthHub.reports.read.own";
const GROWTH_HUB_RECOMMENDATIONS_READ_ANY_PERMISSION = "growthHub.recommendations.read.any";
const GROWTH_HUB_RECOMMENDATIONS_MANAGE_ANY_PERMISSION = "growthHub.recommendations.manage.any";
const GROWTH_HUB_RECOMMENDATIONS_READ_ASSIGNED_PERMISSION =
  "growthHub.recommendations.read.assigned";
const GROWTH_HUB_RECOMMENDATIONS_MANAGE_ASSIGNED_PERMISSION =
  "growthHub.recommendations.manage.assigned";
const GROWTH_HUB_RECOMMENDATIONS_READ_OWN_PERMISSION = "growthHub.recommendations.read.own";

const growthHubConfigSelect = {
  id: true,
  clientProfileId: true,
  primaryGoal: true,
  targetLeads: true,
  targetRoas: true,
  targetCpa: true,
  targetRevenue: true,
  reportingDay: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ClientGrowthHubConfigSelect;

const growthHubActionSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  title: true,
  description: true,
  ownerUserId: true,
  status: true,
  priority: true,
  dueAt: true,
  clientVisible: true,
  relatedEntityType: true,
  relatedEntityId: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  owner: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
} satisfies Prisma.GrowthHubActionSelect;

const growthHubWeeklyNoteSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  weekStart: true,
  weekEnd: true,
  summary: true,
  nextFocus: true,
  risks: true,
  clientVisible: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
} satisfies Prisma.GrowthHubWeeklyNoteSelect;

const growthHubReportSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  periodStart: true,
  periodEnd: true,
  type: true,
  status: true,
  summary: true,
  metricsSnapshot: true,
  clientVisible: true,
  publishedAt: true,
  acknowledgementRequestedAt: true,
  acknowledgedAt: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
  acknowledgementTask: {
    select: {
      id: true,
      approvalStatus: true,
      status: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.GrowthHubReportSelect;

const growthHubRecommendationSelect = {
  id: true,
  clientProfileId: true,
  projectId: true,
  type: true,
  priority: true,
  title: true,
  description: true,
  source: true,
  relatedEntityType: true,
  relatedEntityId: true,
  status: true,
  clientVisible: true,
  createdAt: true,
  updatedAt: true,
  convertedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      serviceKey: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
  convertedTask: {
    select: {
      id: true,
      title: true,
      status: true,
    },
  },
} satisfies Prisma.GrowthHubRecommendationSelect;

type GrowthHubConfigModel = Prisma.ClientGrowthHubConfigGetPayload<{
  select: typeof growthHubConfigSelect;
}>;

type GrowthHubActionModel = Prisma.GrowthHubActionGetPayload<{
  select: typeof growthHubActionSelect;
}>;

type GrowthHubWeeklyNoteModel = Prisma.GrowthHubWeeklyNoteGetPayload<{
  select: typeof growthHubWeeklyNoteSelect;
}>;

type GrowthHubReportModel = Prisma.GrowthHubReportGetPayload<{
  select: typeof growthHubReportSelect;
}>;

type GrowthHubRecommendationModel = Prisma.GrowthHubRecommendationGetPayload<{
  select: typeof growthHubRecommendationSelect;
}>;

type GrowthHubConfigPatchData = {
  primaryGoal?: GrowthHubGoal | null;
  targetLeads?: number | null;
  targetRoas?: number | null;
  targetCpa?: number | null;
  targetRevenue?: number | null;
  reportingDay?: string | null;
  notes?: string | null;
  status?: GrowthHubStatus;
};

type GrowthHubActionPatchData = {
  title?: string;
  description?: string | null;
  projectId?: string | null;
  ownerUserId?: string | null;
  status?: GrowthHubActionStatus;
  priority?: GrowthHubActionPriority;
  dueAt?: Date | null;
  clientVisible?: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

type GrowthHubWeeklyNotePatchData = {
  projectId?: string | null;
  weekStart?: Date;
  weekEnd?: Date;
  summary?: string;
  nextFocus?: string | null;
  risks?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  clientVisible?: boolean;
};

type GrowthHubRecommendationPatchData = {
  status?: GrowthHubRecommendationStatus;
  priority?: GrowthHubActionPriority;
  title?: string;
  description?: string | null;
  clientVisible?: boolean;
};

type GrowthHubRecommendationDraft = {
  dedupeKey: string;
  clientProfileId: string;
  projectId: string | null;
  type: GrowthHubRecommendationType;
  priority: GrowthHubActionPriority;
  title: string;
  description: string;
  source: string;
  relatedEntityType: string;
  relatedEntityId: string;
  clientVisible: boolean;
};

export type GrowthHubWeeklyNoteItem = {
  id: string;
  clientProfileId: string;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: PurchasedServiceKey | null;
  } | null;
  weekStart: Date;
  weekEnd: Date;
  summary: string;
  nextFocus: string | null;
  risks: Prisma.JsonValue | null;
  clientVisible: boolean;
  createdBy: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type GrowthHubReportAcknowledgementStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ACKNOWLEDGED"
  | "CHANGES_REQUESTED";

export type GrowthHubReportItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: PurchasedServiceKey | null;
  } | null;
  periodStart: string;
  periodEnd: string;
  type: GrowthHubReportType;
  status: GrowthHubReportStatus;
  summary: string | null;
  metricsSnapshot: Prisma.JsonValue | null;
  clientVisible: boolean;
  publishedAt: string | null;
  acknowledgementRequestedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgementStatus: GrowthHubReportAcknowledgementStatus;
  acknowledgementTaskId: string | null;
  acknowledgementTaskUpdatedAt: string | null;
  createdBy: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type GrowthHubReportsResponse = {
  data: GrowthHubReportItem[];
  meta: {
    total: number;
    draft: number;
    published: number;
    clientVisible: number;
    generatedAt: Date;
  };
};

export type GrowthHubRecommendationItem = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  project: {
    id: string;
    name: string;
    slug: string;
    serviceKey: PurchasedServiceKey | null;
  } | null;
  type: GrowthHubRecommendationType;
  priority: GrowthHubActionPriority;
  title: string;
  description: string | null;
  source: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  status: GrowthHubRecommendationStatus;
  clientVisible: boolean;
  convertedTask: {
    id: string;
    title: string;
    status: TaskStatus;
  } | null;
  convertedAt: string | null;
  createdBy: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type GrowthHubRecommendationsResponse = {
  data: GrowthHubRecommendationItem[];
  meta: {
    total: number;
    open: number;
    accepted: number;
    dismissed: number;
    convertedToTask: number;
    done: number;
    clientVisible: number;
    generatedAt: Date;
  };
};

export type GrowthHubRecommendationGenerateResponse = GrowthHubRecommendationsResponse & {
  meta: GrowthHubRecommendationsResponse["meta"] & {
    created: number;
    updated: number;
    skipped: number;
  };
};

export type AdminGrowthHubConfigResponse = {
  id: string;
  clientProfileId: string;
  hasActiveService: boolean;
  primaryGoal: GrowthHubGoal | null;
  targetLeads: number | null;
  targetRoas: number | null;
  targetCpa: number | null;
  targetRevenue: number | null;
  reportingDay: string | null;
  notes: string | null;
  status: GrowthHubStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type OwnGrowthHubConfigResponse = Omit<
  AdminGrowthHubConfigResponse,
  "hasActiveService" | "createdAt" | "updatedAt"
>;

export type AdminGrowthHubClientListItem = {
  client: GrowthHubSummaryResponse["client"];
  serviceStatus: PurchasedServiceStatus | null;
  config: GrowthHubSummaryResponse["config"];
  state: GrowthHubSummaryState;
  metrics: GrowthHubSummaryResponse["metrics"];
  channels: GrowthHubChannelSummary[];
  actions: GrowthHubActionItem[];
  meta: GrowthHubSummaryResponse["meta"];
};

export type AdminGrowthHubClientsResponse = {
  data: AdminGrowthHubClientListItem[];
  meta: {
    total: number;
    ready: number;
    risk: number;
    optimize: number;
    scale: number;
    waitingConfig: number;
    pendingApprovals: number;
    generatedAt: Date;
  };
};

export type AssignedGrowthHubClientsResponse = AdminGrowthHubClientsResponse;

@Injectable()
export class GrowthHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly summaryService: GrowthHubSummaryService,
  ) {}

  async getAdminClients(actor: AuthenticatedUser): Promise<AdminGrowthHubClientsResponse> {
    this.assertCanReadAdminOverview(actor);

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.GROWTH_HUB,
            status: PurchasedServiceStatus.ACTIVE,
          },
        },
      },
      select: { id: true },
      orderBy: { companyName: "asc" },
    });
    const summaries = await Promise.all(
      clients.map((client) => this.summaryService.getSummary(client.id)),
    );
    const items = summaries.map((summary) => this.toAdminClientListItem(summary));

    return {
      data: items,
      meta: this.buildClientsOverviewMeta(items),
    };
  }

  async getAssignedClients(
    actor: AuthenticatedUser,
  ): Promise<AssignedGrowthHubClientsResponse> {
    if (
      actor.accountType !== AccountType.EMPLOYEE ||
      actor.role === UserRole.ADMIN ||
      !this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ASSIGNED_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub summary permission.");
    }

    const clients = await this.prisma.clientProfile.findMany({
      where: {
        employeeAssignments: {
          some: {
            employeeUserId: actor.id,
            isActive: true,
            scope: EmployeeClientAssignmentScope.PROJECT,
          },
        },
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.GROWTH_HUB,
            status: PurchasedServiceStatus.ACTIVE,
          },
        },
      },
      select: { id: true },
      orderBy: { companyName: "asc" },
    });
    const summaries = await Promise.all(
      clients.map((client) => this.summaryService.getSummary(client.id)),
    );
    const items = summaries.map((summary) => this.toAdminClientListItem(summary));

    return {
      data: items,
      meta: this.buildClientsOverviewMeta(items),
    };
  }

  async getAdminClientConfig(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminGrowthHubConfigResponse> {
    await this.assertCanReadAdminConfig(clientProfileId, actor);
    return this.getConfigResponse(clientProfileId);
  }

  async updateAdminClientConfig(
    clientProfileId: string,
    dto: UpdateGrowthHubConfigDto,
    actor: AuthenticatedUser,
  ): Promise<AdminGrowthHubConfigResponse> {
    this.assertCanManageConfig(actor);
    this.assertBodyObject(dto);
    this.assertHasConfigUpdatePayload(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);

    const patchData = this.buildConfigPatchData(dto);
    const config = await this.prisma.clientGrowthHubConfig.upsert({
      where: { clientProfileId },
      update: patchData,
      create: {
        clientProfileId,
        ...patchData,
      },
      select: growthHubConfigSelect,
    });

    return this.toAdminConfigResponse(clientProfileId, config, true);
  }

  async getAdminClientSummary(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubSummaryResponse> {
    await this.assertCanReadAdminSummary(clientProfileId, actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    return this.summaryService.getSummary(clientProfileId);
  }

  async getAdminClientChannels(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubChannelSummary[]; meta: { generatedAt: Date } }> {
    const summary = await this.getAdminClientSummary(clientProfileId, actor);
    return { data: summary.channels, meta: { generatedAt: new Date() } };
  }

  async getAdminClientActions(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActionItem[]; meta: { total: number; generatedAt: Date } }> {
    await this.assertCanReadAdminActions(clientProfileId, actor);
    const actions = await this.getCombinedActionItems(clientProfileId, false);
    return {
      data: actions,
      meta: { total: actions.length, generatedAt: new Date() },
    };
  }

  async createAdminClientAction(
    clientProfileId: string,
    dto: CreateGrowthHubActionDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubActionItem> {
    this.assertCanManageAdminActions(actor);
    this.assertBodyObject(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    await this.assertActionReferencesBelongToClient(clientProfileId, dto);

    const action = await this.prisma.growthHubAction.create({
      data: {
        clientProfileId,
        title: dto.title.trim(),
        description: dto.description ?? null,
        projectId: dto.projectId ?? null,
        ownerUserId: dto.ownerUserId ?? null,
        status: dto.status ?? GrowthHubActionStatus.TODO,
        priority: dto.priority ?? GrowthHubActionPriority.MEDIUM,
        dueAt: this.parseNullableDate(dto.dueAt) ?? null,
        clientVisible: dto.clientVisible ?? false,
        relatedEntityType: dto.relatedEntityType ?? null,
        relatedEntityId: dto.relatedEntityId ?? null,
        createdByUserId: actor.id,
      },
      select: growthHubActionSelect,
    });

    return this.toGrowthHubActionItem(action);
  }

  async updateAdminAction(
    actionId: string,
    dto: UpdateGrowthHubActionDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubActionItem> {
    this.assertCanManageAdminActions(actor);
    this.assertBodyObject(dto);
    this.assertHasActionUpdatePayload(dto);
    const existing = await this.getGrowthHubActionOrFail(actionId);
    await this.assertActionReferencesBelongToClient(existing.clientProfileId, dto);

    const action = await this.prisma.growthHubAction.update({
      where: { id: actionId },
      data: this.buildActionPatchData(dto),
      select: growthHubActionSelect,
    });

    return this.toGrowthHubActionItem(action);
  }

  async deleteAdminAction(
    actionId: string,
    actor: AuthenticatedUser,
  ): Promise<{ id: string; deleted: true }> {
    this.assertCanManageAdminActions(actor);
    await this.getGrowthHubActionOrFail(actionId);
    await this.prisma.growthHubAction.delete({ where: { id: actionId } });
    return { id: actionId, deleted: true };
  }

  async getAdminClientWeeklyNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubWeeklyNoteItem[]; meta: { total: number; generatedAt: Date } }> {
    await this.assertCanReadAdminNotes(clientProfileId, actor);
    const notes = await this.findWeeklyNotes(clientProfileId, false);
    return {
      data: notes.map((note) => this.toGrowthHubWeeklyNoteItem(note)),
      meta: { total: notes.length, generatedAt: new Date() },
    };
  }

  async createAdminClientWeeklyNote(
    clientProfileId: string,
    dto: CreateGrowthHubWeeklyNoteDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubWeeklyNoteItem> {
    this.assertCanManageAdminNotes(actor);
    this.assertBodyObject(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    await this.assertWeeklyNoteReferencesBelongToClient(clientProfileId, dto);
    const weekStart = this.parseRequiredDate(dto.weekStart, "weekStart");
    const weekEnd = this.parseRequiredDate(dto.weekEnd, "weekEnd");
    this.assertValidWeekRange(weekStart, weekEnd);

    const note = await this.prisma.growthHubWeeklyNote.create({
      data: {
        clientProfileId,
        projectId: dto.projectId ?? null,
        weekStart,
        weekEnd,
        summary: dto.summary.trim(),
        nextFocus: dto.nextFocus ?? null,
        risks: this.toNullableJsonInput(dto.risks),
        clientVisible: dto.clientVisible ?? false,
        createdByUserId: actor.id,
      },
      select: growthHubWeeklyNoteSelect,
    });

    return this.toGrowthHubWeeklyNoteItem(note);
  }

  async updateAdminWeeklyNote(
    noteId: string,
    dto: UpdateGrowthHubWeeklyNoteDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubWeeklyNoteItem> {
    this.assertCanManageAdminNotes(actor);
    this.assertBodyObject(dto);
    this.assertHasWeeklyNoteUpdatePayload(dto);
    const existing = await this.getGrowthHubWeeklyNoteOrFail(noteId);
    await this.assertWeeklyNoteReferencesBelongToClient(existing.clientProfileId, dto);
    const patchData = this.buildWeeklyNotePatchData(dto, existing);

    const note = await this.prisma.growthHubWeeklyNote.update({
      where: { id: noteId },
      data: patchData,
      select: growthHubWeeklyNoteSelect,
    });

    return this.toGrowthHubWeeklyNoteItem(note);
  }

  async getAdminClientReports(
    clientProfileId: string,
    query: GrowthHubReportsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportsResponse> {
    await this.assertCanReadAdminReports(clientProfileId, actor);
    return this.getReportsByClientProfileId(clientProfileId, query, false);
  }

  async createAdminClientReport(
    clientProfileId: string,
    dto: CreateGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    this.assertCanManageAdminReports(actor);
    this.assertBodyObject(dto);
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    return this.createReportByClientProfileId(clientProfileId, dto, actor);
  }

  async updateAdminReport(
    reportId: string,
    dto: UpdateGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    this.assertCanManageAdminReports(actor);
    this.assertBodyObject(dto);
    return this.updateReportById(reportId, dto, actor, { scope: "ANY" });
  }

  async publishAdminReport(
    reportId: string,
    dto: PublishGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    this.assertCanManageAdminReports(actor);
    return this.updateReportById(
      reportId,
      {
        status: GrowthHubReportStatus.PUBLISHED,
        clientVisible: true,
        requestAcknowledgement: dto?.requestAcknowledgement,
      },
      actor,
      { scope: "ANY" },
    );
  }

  async getAdminClientRecommendations(
    clientProfileId: string,
    query: GrowthHubRecommendationsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationsResponse> {
    await this.assertCanReadAdminRecommendations(clientProfileId, actor);
    return this.getRecommendationsByClientProfileId(clientProfileId, query, false);
  }

  async generateAdminClientRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationGenerateResponse> {
    await this.assertCanManageAdminRecommendations(clientProfileId, actor);
    return this.generateRecommendationsByClientProfileId(clientProfileId, actor);
  }

  async updateAdminRecommendation(
    recommendationId: string,
    dto: UpdateGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationItem> {
    this.assertBodyObject(dto);
    return this.updateRecommendationById(recommendationId, dto, actor, { scope: "ANY" });
  }

  async convertAdminRecommendationToTask(
    recommendationId: string,
    dto: ConvertGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationItem> {
    this.assertBodyObject(dto ?? {});
    return this.convertRecommendationToTask(recommendationId, dto ?? {}, actor, {
      scope: "ANY",
    });
  }

  async getAdminClientActivity(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActivityItem[]; meta: { total: number; generatedAt: Date } }> {
    const summary = await this.getAdminClientSummary(clientProfileId, actor);
    return {
      data: summary.activity,
      meta: { total: summary.activity.length, generatedAt: new Date() },
    };
  }

  async getAssignedClientConfig(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<AdminGrowthHubConfigResponse> {
    await this.assertCanReadAssignedConfig(clientProfileId, actor);
    return this.getConfigResponse(clientProfileId);
  }

  async getAssignedClientSummary(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubSummaryResponse> {
    await this.assertCanReadAssignedSummary(clientProfileId, actor);
    return this.summaryService.getSummary(clientProfileId);
  }

  async getAssignedClientChannels(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubChannelSummary[]; meta: { generatedAt: Date } }> {
    const summary = await this.getAssignedClientSummary(clientProfileId, actor);
    return { data: summary.channels, meta: { generatedAt: new Date() } };
  }

  async getAssignedClientActions(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActionItem[]; meta: { total: number; generatedAt: Date } }> {
    await this.assertCanReadAssignedActions(clientProfileId, actor);
    const actions = await this.getCombinedActionItems(clientProfileId, false);
    return {
      data: actions,
      meta: { total: actions.length, generatedAt: new Date() },
    };
  }

  async createAssignedClientAction(
    clientProfileId: string,
    dto: CreateGrowthHubActionDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubActionItem> {
    await this.assertCanManageAssignedActions(clientProfileId, actor);
    this.assertBodyObject(dto);
    await this.assertActionReferencesBelongToClient(clientProfileId, dto);

    const action = await this.prisma.growthHubAction.create({
      data: {
        clientProfileId,
        title: dto.title.trim(),
        description: dto.description ?? null,
        projectId: dto.projectId ?? null,
        ownerUserId: dto.ownerUserId ?? null,
        status: dto.status ?? GrowthHubActionStatus.TODO,
        priority: dto.priority ?? GrowthHubActionPriority.MEDIUM,
        dueAt: this.parseNullableDate(dto.dueAt) ?? null,
        clientVisible: dto.clientVisible ?? false,
        relatedEntityType: dto.relatedEntityType ?? null,
        relatedEntityId: dto.relatedEntityId ?? null,
        createdByUserId: actor.id,
      },
      select: growthHubActionSelect,
    });

    return this.toGrowthHubActionItem(action);
  }

  async updateAssignedAction(
    actionId: string,
    dto: UpdateGrowthHubActionDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubActionItem> {
    this.assertBodyObject(dto);
    this.assertHasActionUpdatePayload(dto);
    const existing = await this.getGrowthHubActionOrFail(actionId);
    await this.assertCanManageAssignedActions(existing.clientProfileId, actor);
    await this.assertActionReferencesBelongToClient(existing.clientProfileId, dto);

    const action = await this.prisma.growthHubAction.update({
      where: { id: actionId },
      data: this.buildActionPatchData(dto),
      select: growthHubActionSelect,
    });

    return this.toGrowthHubActionItem(action);
  }

  async deleteAssignedAction(
    actionId: string,
    actor: AuthenticatedUser,
  ): Promise<{ id: string; deleted: true }> {
    const existing = await this.getGrowthHubActionOrFail(actionId);
    await this.assertCanManageAssignedActions(existing.clientProfileId, actor);
    await this.prisma.growthHubAction.delete({ where: { id: actionId } });
    return { id: actionId, deleted: true };
  }

  async getAssignedClientWeeklyNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubWeeklyNoteItem[]; meta: { total: number; generatedAt: Date } }> {
    await this.assertCanReadAssignedNotes(clientProfileId, actor);
    const notes = await this.findWeeklyNotes(clientProfileId, false);
    return {
      data: notes.map((note) => this.toGrowthHubWeeklyNoteItem(note)),
      meta: { total: notes.length, generatedAt: new Date() },
    };
  }

  async createAssignedClientWeeklyNote(
    clientProfileId: string,
    dto: CreateGrowthHubWeeklyNoteDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubWeeklyNoteItem> {
    await this.assertCanManageAssignedNotes(clientProfileId, actor);
    this.assertBodyObject(dto);
    await this.assertWeeklyNoteReferencesBelongToClient(clientProfileId, dto);
    const weekStart = this.parseRequiredDate(dto.weekStart, "weekStart");
    const weekEnd = this.parseRequiredDate(dto.weekEnd, "weekEnd");
    this.assertValidWeekRange(weekStart, weekEnd);

    const note = await this.prisma.growthHubWeeklyNote.create({
      data: {
        clientProfileId,
        projectId: dto.projectId ?? null,
        weekStart,
        weekEnd,
        summary: dto.summary.trim(),
        nextFocus: dto.nextFocus ?? null,
        risks: this.toNullableJsonInput(dto.risks),
        clientVisible: dto.clientVisible ?? false,
        createdByUserId: actor.id,
      },
      select: growthHubWeeklyNoteSelect,
    });

    return this.toGrowthHubWeeklyNoteItem(note);
  }

  async updateAssignedWeeklyNote(
    noteId: string,
    dto: UpdateGrowthHubWeeklyNoteDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubWeeklyNoteItem> {
    this.assertBodyObject(dto);
    this.assertHasWeeklyNoteUpdatePayload(dto);
    const existing = await this.getGrowthHubWeeklyNoteOrFail(noteId);
    await this.assertCanManageAssignedNotes(existing.clientProfileId, actor);
    await this.assertWeeklyNoteReferencesBelongToClient(existing.clientProfileId, dto);
    const patchData = this.buildWeeklyNotePatchData(dto, existing);

    const note = await this.prisma.growthHubWeeklyNote.update({
      where: { id: noteId },
      data: patchData,
      select: growthHubWeeklyNoteSelect,
    });

    return this.toGrowthHubWeeklyNoteItem(note);
  }

  async getAssignedClientReports(
    clientProfileId: string,
    query: GrowthHubReportsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportsResponse> {
    await this.assertCanReadAssignedReports(clientProfileId, actor);
    return this.getReportsByClientProfileId(clientProfileId, query, false);
  }

  async createAssignedClientReport(
    clientProfileId: string,
    dto: CreateGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    await this.assertCanManageAssignedReports(clientProfileId, actor);
    this.assertBodyObject(dto);
    return this.createReportByClientProfileId(clientProfileId, dto, actor);
  }

  async updateAssignedReport(
    reportId: string,
    dto: UpdateGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    this.assertBodyObject(dto);
    return this.updateReportById(reportId, dto, actor, {
      scope: "ASSIGNED",
      employeeUserId: actor.id,
    });
  }

  async publishAssignedReport(
    reportId: string,
    dto: PublishGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    return this.updateReportById(
      reportId,
      {
        status: GrowthHubReportStatus.PUBLISHED,
        clientVisible: true,
        requestAcknowledgement: dto?.requestAcknowledgement,
      },
      actor,
      {
        scope: "ASSIGNED",
        employeeUserId: actor.id,
      },
    );
  }

  async getAssignedClientRecommendations(
    clientProfileId: string,
    query: GrowthHubRecommendationsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationsResponse> {
    await this.assertCanReadAssignedRecommendations(clientProfileId, actor);
    return this.getRecommendationsByClientProfileId(clientProfileId, query, false);
  }

  async generateAssignedClientRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationGenerateResponse> {
    await this.assertCanManageAssignedRecommendations(clientProfileId, actor);
    return this.generateRecommendationsByClientProfileId(clientProfileId, actor);
  }

  async updateAssignedRecommendation(
    recommendationId: string,
    dto: UpdateGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationItem> {
    this.assertBodyObject(dto);
    return this.updateRecommendationById(recommendationId, dto, actor, {
      scope: "ASSIGNED",
    });
  }

  async convertAssignedRecommendationToTask(
    recommendationId: string,
    dto: ConvertGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationItem> {
    this.assertBodyObject(dto ?? {});
    return this.convertRecommendationToTask(recommendationId, dto ?? {}, actor, {
      scope: "ASSIGNED",
    });
  }

  async getAssignedClientActivity(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActivityItem[]; meta: { total: number; generatedAt: Date } }> {
    const summary = await this.getAssignedClientSummary(clientProfileId, actor);
    return {
      data: summary.activity,
      meta: { total: summary.activity.length, generatedAt: new Date() },
    };
  }

  async getOwnConfig(actor: AuthenticatedUser): Promise<OwnGrowthHubConfigResponse> {
    this.assertCanReadOwnConfig(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    const configResponse = await this.getConfigResponse(clientProfileId);

    return {
      id: configResponse.id,
      clientProfileId: configResponse.clientProfileId,
      primaryGoal: configResponse.primaryGoal,
      targetLeads: configResponse.targetLeads,
      targetRoas: configResponse.targetRoas,
      targetCpa: configResponse.targetCpa,
      targetRevenue: configResponse.targetRevenue,
      reportingDay: configResponse.reportingDay,
      notes: configResponse.notes,
      status: configResponse.status,
    };
  }

  async getOwnSummary(actor: AuthenticatedUser): Promise<GrowthHubSummaryResponse> {
    this.assertCanReadOwnSummary(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    return this.summaryService.getSummary(clientProfileId, { clientVisibleOnly: true });
  }

  async getOwnChannels(
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubChannelSummary[]; meta: { generatedAt: Date } }> {
    const summary = await this.getOwnSummary(actor);
    return { data: summary.channels, meta: { generatedAt: new Date() } };
  }

  async getOwnActions(
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActionItem[]; meta: { total: number; generatedAt: Date } }> {
    this.assertCanReadOwnActions(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    const actions = await this.getCombinedActionItems(clientProfileId, true);

    return {
      data: actions,
      meta: { total: actions.length, generatedAt: new Date() },
    };
  }

  async getOwnWeeklyNotes(
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubWeeklyNoteItem[]; meta: { total: number; generatedAt: Date } }> {
    this.assertCanReadOwnNotes(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    const notes = await this.findWeeklyNotes(clientProfileId, true);

    return {
      data: notes.map((note) => this.toGrowthHubWeeklyNoteItem(note)),
      meta: { total: notes.length, generatedAt: new Date() },
    };
  }

  async getOwnReports(
    query: GrowthHubReportsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportsResponse> {
    this.assertCanReadOwnReports(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    return this.getReportsByClientProfileId(clientProfileId, query, true);
  }

  async getOwnRecommendations(
    query: GrowthHubRecommendationsQueryDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationsResponse> {
    this.assertCanReadOwnRecommendations(actor);
    const clientProfileId = this.getOwnClientProfileIdOrFail(actor);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);
    return this.getRecommendationsByClientProfileId(clientProfileId, query, true);
  }

  async getOwnActivity(
    actor: AuthenticatedUser,
  ): Promise<{ data: GrowthHubActivityItem[]; meta: { total: number; generatedAt: Date } }> {
    const summary = await this.getOwnSummary(actor);
    return {
      data: summary.activity,
      meta: { total: summary.activity.length, generatedAt: new Date() },
    };
  }

  private async getConfigResponse(clientProfileId: string): Promise<AdminGrowthHubConfigResponse> {
    const [config, hasActiveService] = await Promise.all([
      this.prisma.clientGrowthHubConfig.findUnique({
        where: { clientProfileId },
        select: growthHubConfigSelect,
      }),
      this.hasActiveGrowthHubService(clientProfileId),
    ]);

    return this.toAdminConfigResponse(clientProfileId, config, hasActiveService);
  }

  private async getCombinedActionItems(
    clientProfileId: string,
    clientVisibleOnly: boolean,
  ): Promise<GrowthHubActionItem[]> {
    const [summary, persistedActions] = await Promise.all([
      this.summaryService.getSummary(clientProfileId, { clientVisibleOnly }),
      this.findGrowthHubActions(clientProfileId, clientVisibleOnly),
    ]);
    return [
      ...persistedActions.map((action) => this.toGrowthHubActionItem(action)),
      ...summary.actions,
    ]
      .sort((first, second) => second.updatedAt.getTime() - first.updatedAt.getTime())
      .slice(0, 60);
  }

  private findGrowthHubActions(
    clientProfileId: string,
    clientVisibleOnly: boolean,
  ): Promise<GrowthHubActionModel[]> {
    return this.prisma.growthHubAction.findMany({
      where: {
        clientProfileId,
        ...(clientVisibleOnly ? { clientVisible: true } : {}),
      },
      select: growthHubActionSelect,
      orderBy: [{ updatedAt: "desc" }, { dueAt: "asc" }, { priority: "desc" }],
      take: 60,
    });
  }

  private findWeeklyNotes(
    clientProfileId: string,
    clientVisibleOnly: boolean,
  ): Promise<GrowthHubWeeklyNoteModel[]> {
    return this.prisma.growthHubWeeklyNote.findMany({
      where: {
        clientProfileId,
        ...(clientVisibleOnly ? { clientVisible: true } : {}),
      },
      select: growthHubWeeklyNoteSelect,
      orderBy: [{ weekStart: "desc" }, { updatedAt: "desc" }],
      take: 26,
    });
  }

  private async getReportsByClientProfileId(
    clientProfileId: string,
    query: GrowthHubReportsQueryDto,
    clientVisibleOnly: boolean,
  ): Promise<GrowthHubReportsResponse> {
    const where: Prisma.GrowthHubReportWhereInput = {
      clientProfileId,
      ...(query.type ? { type: query.type } : {}),
      ...(clientVisibleOnly
        ? { status: GrowthHubReportStatus.PUBLISHED, clientVisible: true }
        : {
            ...(query.status ? { status: query.status } : {}),
            ...(query.clientVisible !== undefined ? { clientVisible: query.clientVisible } : {}),
          }),
    };
    const statsWhere: Prisma.GrowthHubReportWhereInput = {
      clientProfileId,
      ...(clientVisibleOnly ? { status: GrowthHubReportStatus.PUBLISHED, clientVisible: true } : {}),
    };
    const take = query.limit ?? 40;

    const [reports, total, draft, published, clientVisible] = await Promise.all([
      this.prisma.growthHubReport.findMany({
        where,
        select: growthHubReportSelect,
        orderBy: [{ periodEnd: "desc" }, { updatedAt: "desc" }],
        take,
      }),
      this.prisma.growthHubReport.count({ where }),
      this.prisma.growthHubReport.count({
        where: { ...statsWhere, status: GrowthHubReportStatus.DRAFT },
      }),
      this.prisma.growthHubReport.count({
        where: { ...statsWhere, status: GrowthHubReportStatus.PUBLISHED },
      }),
      this.prisma.growthHubReport.count({
        where: { ...statsWhere, clientVisible: true },
      }),
    ]);

    return {
      data: reports.map((report) => this.toGrowthHubReportItem(report)),
      meta: {
        total,
        draft,
        published,
        clientVisible,
        generatedAt: new Date(),
      },
    };
  }

  private async createReportByClientProfileId(
    clientProfileId: string,
    dto: CreateGrowthHubReportDto,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubReportItem> {
    const period = this.resolveGrowthHubReportPeriod(dto.periodStart, dto.periodEnd);
    const summary = this.normalizeGrowthHubReportSummary(dto.summary);
    const projectId = await this.resolveGrowthHubReportProjectId(
      clientProfileId,
      dto.projectId ?? null,
    );
    const acknowledgementProjectId =
      dto.requestAcknowledgement === true ? projectId ?? undefined : undefined;
    const shouldPublish = dto.clientVisible === true || dto.requestAcknowledgement === true;
    const now = new Date();

    if (dto.requestAcknowledgement === true && !acknowledgementProjectId) {
      throw new BadRequestException(
        "A Growth Hub project is required to request report acknowledgement.",
      );
    }

    const report = await this.prisma.$transaction(async (tx) => {
      const createdReport = await tx.growthHubReport.create({
        data: {
          clientProfileId,
          projectId,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          type: dto.type,
          status: shouldPublish ? GrowthHubReportStatus.PUBLISHED : GrowthHubReportStatus.DRAFT,
          summary,
          metricsSnapshot: dto.metricsSnapshot as Prisma.InputJsonValue | undefined,
          createdByUserId: actor.id,
          publishedByUserId: shouldPublish ? actor.id : null,
          clientVisible: shouldPublish,
          publishedAt: shouldPublish ? now : null,
        },
        select: growthHubReportSelect,
      });

      if (dto.requestAcknowledgement !== true || !acknowledgementProjectId) {
        return createdReport;
      }

      const task = await tx.task.create({
        data: {
          projectId: acknowledgementProjectId,
          title: this.buildGrowthHubReportAcknowledgementTaskTitle(
            createdReport.type,
            createdReport.periodStart,
            createdReport.periodEnd,
          ),
          description: this.buildGrowthHubReportAcknowledgementTaskDescription(summary),
          status: TaskStatus.REVIEW,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.GROWTH_REPORT_ACKNOWLEDGEMENT,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: now,
          approvalContext: {
            reportId: createdReport.id,
            reportType: createdReport.type,
            periodStart: createdReport.periodStart.toISOString(),
            periodEnd: createdReport.periodEnd.toISOString(),
          },
        },
        select: { id: true },
      });

      return tx.growthHubReport.update({
        where: { id: createdReport.id },
        data: {
          acknowledgementRequestedAt: now,
          acknowledgementTaskId: task.id,
        },
        select: growthHubReportSelect,
      });
    });

    return this.toGrowthHubReportItem(report);
  }

  private async updateReportById(
    reportId: string,
    dto: UpdateGrowthHubReportDto,
    actor: AuthenticatedUser,
    options: {
      scope: "ANY" | "ASSIGNED";
      employeeUserId?: string;
    },
  ): Promise<GrowthHubReportItem> {
    this.assertHasReportUpdatePayload(dto);

    const existing = await this.prisma.growthHubReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        clientProfileId: true,
        projectId: true,
        type: true,
        periodStart: true,
        periodEnd: true,
        summary: true,
        status: true,
        clientVisible: true,
        publishedAt: true,
        publishedByUserId: true,
        acknowledgementTaskId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Growth Hub report not found.");
    }

    if (options.scope === "ASSIGNED") {
      if (!options.employeeUserId) {
        throw new ForbiddenException("Missing employee context for assigned report update.");
      }
      await this.assertCanManageAssignedReports(existing.clientProfileId, actor);
    } else {
      this.assertCanManageAdminReports(actor);
      await this.assertClientProfileExists(existing.clientProfileId);
      await this.assertClientHasActiveGrowthHubService(existing.clientProfileId);
    }

    const now = new Date();
    const updateData: Prisma.GrowthHubReportUpdateInput = {};
    const normalizedSummary =
      dto.summary !== undefined ? this.normalizeGrowthHubReportSummary(dto.summary) : undefined;

    if (dto.summary !== undefined) {
      updateData.summary = normalizedSummary;
    }

    if (dto.metricsSnapshot !== undefined) {
      updateData.metricsSnapshot = dto.metricsSnapshot as Prisma.InputJsonValue;
    }

    if (dto.clientVisible !== undefined) {
      updateData.clientVisible = dto.clientVisible;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (
        dto.status === GrowthHubReportStatus.DRAFT ||
        dto.status === GrowthHubReportStatus.ARCHIVED
      ) {
        updateData.clientVisible = false;
      }
    }

    const shouldPublish =
      dto.requestAcknowledgement === true ||
      dto.clientVisible === true ||
      dto.status === GrowthHubReportStatus.PUBLISHED;

    const finalStatus =
      dto.status ?? (shouldPublish ? GrowthHubReportStatus.PUBLISHED : existing.status);
    let finalClientVisible = dto.clientVisible ?? existing.clientVisible;

    if (dto.status === GrowthHubReportStatus.DRAFT || dto.status === GrowthHubReportStatus.ARCHIVED) {
      finalClientVisible = false;
    } else if (shouldPublish && dto.clientVisible === undefined) {
      finalClientVisible = true;
    }

    if (finalStatus === GrowthHubReportStatus.PUBLISHED && !finalClientVisible) {
      throw new BadRequestException("Published Growth Hub report cannot be hidden from client.");
    }

    if (shouldPublish) {
      if (!existing.publishedAt) {
        updateData.publishedAt = now;
      }
      if (!existing.publishedByUserId) {
        updateData.publishedBy = {
          connect: { id: actor.id },
        };
      }
      if (dto.status === undefined) {
        updateData.status = GrowthHubReportStatus.PUBLISHED;
      }
      if (dto.clientVisible === undefined) {
        updateData.clientVisible = true;
      }
    }

    if (
      dto.requestAcknowledgement === true &&
      (dto.status === GrowthHubReportStatus.DRAFT || dto.status === GrowthHubReportStatus.ARCHIVED)
    ) {
      throw new BadRequestException(
        "Acknowledgement request cannot be created for DRAFT or ARCHIVED Growth Hub reports.",
      );
    }

    const fallbackProjectId =
      existing.projectId ??
      (await this.resolveGrowthHubReportProjectId(existing.clientProfileId, null));

    if (dto.requestAcknowledgement === true && !fallbackProjectId) {
      throw new BadRequestException(
        "A Growth Hub project is required to request report acknowledgement.",
      );
    }

    if (dto.requestAcknowledgement === true && fallbackProjectId && !existing.projectId) {
      updateData.project = {
        connect: { id: fallbackProjectId },
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let acknowledgementTaskId = existing.acknowledgementTaskId;

      if (dto.requestAcknowledgement === true && fallbackProjectId) {
        const taskPayload: Prisma.TaskUncheckedCreateInput = {
          projectId: fallbackProjectId,
          title: this.buildGrowthHubReportAcknowledgementTaskTitle(
            existing.type,
            existing.periodStart,
            existing.periodEnd,
          ),
          description: this.buildGrowthHubReportAcknowledgementTaskDescription(
            normalizedSummary ?? existing.summary ?? null,
          ),
          status: TaskStatus.REVIEW,
          type: TaskType.REVISION,
          approvalRequired: true,
          approvalType: MetaAdsApprovalType.GROWTH_REPORT_ACKNOWLEDGEMENT,
          approvalStatus: MetaAdsApprovalStatus.PENDING,
          approvalRequestedAt: now,
          approvalContext: {
            reportId: existing.id,
            reportType: existing.type,
            periodStart: existing.periodStart.toISOString(),
            periodEnd: existing.periodEnd.toISOString(),
          },
        };

        if (acknowledgementTaskId) {
          await tx.task.update({
            where: { id: acknowledgementTaskId },
            data: {
              title: taskPayload.title,
              description: taskPayload.description,
              status: TaskStatus.REVIEW,
              approvalRequired: true,
              approvalType: MetaAdsApprovalType.GROWTH_REPORT_ACKNOWLEDGEMENT,
              approvalStatus: MetaAdsApprovalStatus.PENDING,
              approvalRequestedAt: now,
              approvalRespondedAt: null,
              approvalRespondedByUserId: null,
              approvalResponseNote: null,
              approvalContext: taskPayload.approvalContext,
            },
          });
        } else {
          const createdTask = await tx.task.create({
            data: taskPayload,
            select: { id: true },
          });
          acknowledgementTaskId = createdTask.id;
        }

        updateData.acknowledgementRequestedAt = now;
        if (acknowledgementTaskId) {
          updateData.acknowledgementTask = {
            connect: { id: acknowledgementTaskId },
          };
        }
      }

      return tx.growthHubReport.update({
        where: { id: existing.id },
        data: updateData,
        select: growthHubReportSelect,
      });
    });

    return this.toGrowthHubReportItem(updated);
  }

  private async getRecommendationsByClientProfileId(
    clientProfileId: string,
    query: GrowthHubRecommendationsQueryDto,
    clientVisibleOnly: boolean,
  ): Promise<GrowthHubRecommendationsResponse> {
    const where: Prisma.GrowthHubRecommendationWhereInput = {
      clientProfileId,
      ...(query.status ? { status: query.status } : {}),
      ...(clientVisibleOnly
        ? { clientVisible: true }
        : query.clientVisible !== undefined
          ? { clientVisible: query.clientVisible }
          : {}),
    };
    const statsWhere: Prisma.GrowthHubRecommendationWhereInput = {
      clientProfileId,
      ...(clientVisibleOnly ? { clientVisible: true } : {}),
    };
    const take = query.limit ?? 40;

    const [recommendations, total, open, accepted, dismissed, convertedToTask, done, clientVisible] =
      await Promise.all([
        this.prisma.growthHubRecommendation.findMany({
          where,
          select: growthHubRecommendationSelect,
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
          take,
        }),
        this.prisma.growthHubRecommendation.count({ where }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, status: GrowthHubRecommendationStatus.OPEN },
        }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, status: GrowthHubRecommendationStatus.ACCEPTED },
        }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, status: GrowthHubRecommendationStatus.DISMISSED },
        }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, status: GrowthHubRecommendationStatus.CONVERTED_TO_TASK },
        }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, status: GrowthHubRecommendationStatus.DONE },
        }),
        this.prisma.growthHubRecommendation.count({
          where: { ...statsWhere, clientVisible: true },
        }),
      ]);

    return {
      data: recommendations.map((recommendation) =>
        this.toGrowthHubRecommendationItem(recommendation),
      ),
      meta: {
        total,
        open,
        accepted,
        dismissed,
        convertedToTask,
        done,
        clientVisible,
        generatedAt: new Date(),
      },
    };
  }

  private async generateRecommendationsByClientProfileId(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<GrowthHubRecommendationGenerateResponse> {
    await this.assertClientProfileExists(clientProfileId);
    await this.assertClientHasActiveGrowthHubService(clientProfileId);

    const now = new Date();
    const [summary, fallbackProjectId, recentVisibleNote, recentVisibleReport] =
      await Promise.all([
        this.summaryService.getSummary(clientProfileId),
        this.resolveGrowthHubReportProjectId(clientProfileId, null),
        this.prisma.growthHubWeeklyNote.findFirst({
          where: {
            clientProfileId,
            clientVisible: true,
            weekEnd: { gte: new Date(now.getTime() - 10 * 86_400_000) },
          },
          select: { id: true },
          orderBy: { weekEnd: "desc" },
        }),
        this.prisma.growthHubReport.findFirst({
          where: {
            clientProfileId,
            clientVisible: true,
            status: GrowthHubReportStatus.PUBLISHED,
            periodEnd: { gte: new Date(now.getTime() - 35 * 86_400_000) },
          },
          select: { id: true },
          orderBy: { periodEnd: "desc" },
        }),
      ]);

    const drafts = this.buildRuleBasedRecommendationDrafts({
      clientProfileId,
      projectId: fallbackProjectId,
      summary,
      hasRecentVisibleNote: Boolean(recentVisibleNote),
      hasRecentVisibleReport: Boolean(recentVisibleReport),
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    await this.prisma.$transaction(async (tx) => {
      const results: GrowthHubRecommendationModel[] = [];

      for (const draft of drafts) {
        const existing = await tx.growthHubRecommendation.findUnique({
          where: { dedupeKey: draft.dedupeKey },
          select: {
            id: true,
            status: true,
          },
        });

        if (!existing) {
          const recommendation = await tx.growthHubRecommendation.create({
            data: {
              ...draft,
              createdByUserId: actor.id,
            },
            select: growthHubRecommendationSelect,
          });
          created += 1;
          results.push(recommendation);
          continue;
        }

        if (
          existing.status === GrowthHubRecommendationStatus.DISMISSED ||
          existing.status === GrowthHubRecommendationStatus.CONVERTED_TO_TASK ||
          existing.status === GrowthHubRecommendationStatus.DONE
        ) {
          const recommendation = await tx.growthHubRecommendation.findUniqueOrThrow({
            where: { id: existing.id },
            select: growthHubRecommendationSelect,
          });
          skipped += 1;
          results.push(recommendation);
          continue;
        }

        const recommendation = await tx.growthHubRecommendation.update({
          where: { id: existing.id },
          data: {
            projectId: draft.projectId,
            priority: draft.priority,
            title: draft.title,
            description: draft.description,
            source: draft.source,
            relatedEntityType: draft.relatedEntityType,
            relatedEntityId: draft.relatedEntityId,
            clientVisible: draft.clientVisible,
          },
          select: growthHubRecommendationSelect,
        });
        updated += 1;
        results.push(recommendation);
      }

      return results;
    });

    const response = await this.getRecommendationsByClientProfileId(clientProfileId, {}, false);
    return {
      data: response.data,
      meta: {
        ...response.meta,
        created,
        updated,
        skipped,
      },
    };
  }

  private buildRuleBasedRecommendationDrafts({
    clientProfileId,
    projectId,
    summary,
    hasRecentVisibleNote,
    hasRecentVisibleReport,
  }: {
    clientProfileId: string;
    projectId: string | null;
    summary: GrowthHubSummaryResponse;
    hasRecentVisibleNote: boolean;
    hasRecentVisibleReport: boolean;
  }): GrowthHubRecommendationDraft[] {
    const drafts: GrowthHubRecommendationDraft[] = [];
    const addDraft = (draft: Omit<GrowthHubRecommendationDraft, "dedupeKey" | "clientProfileId">) => {
      drafts.push({
        ...draft,
        clientProfileId,
        dedupeKey: this.buildRecommendationDedupeKey(
          clientProfileId,
          draft.type,
          draft.relatedEntityType,
          draft.relatedEntityId,
        ),
      });
    };

    if (summary.metrics.pendingApprovals > 0) {
      addDraft({
        projectId,
        type: GrowthHubRecommendationType.APPROVAL_REMINDER,
        priority:
          summary.metrics.pendingApprovals > 3
            ? GrowthHubActionPriority.CRITICAL
            : GrowthHubActionPriority.HIGH,
        title: "Bekleyen müşteri onayları kapatılmalı",
        description: `${summary.metrics.pendingApprovals} onay/teyit Growth Hub akışını bekletiyor. Müşteri aksiyon merkezi ve kanal workspace'lerinde hatırlatma yapılmalı.`,
        source: "PENDING_APPROVALS",
        relatedEntityType: "SUMMARY",
        relatedEntityId: "pending-approvals",
        clientVisible: true,
      });
    }

    if (summary.metrics.overdueTasks > 0) {
      addDraft({
        projectId,
        type: GrowthHubRecommendationType.TECHNICAL_FIX,
        priority:
          summary.metrics.overdueTasks > 2
            ? GrowthHubActionPriority.CRITICAL
            : GrowthHubActionPriority.HIGH,
        title: "Geciken Growth Hub işleri temizlenmeli",
        description: `${summary.metrics.overdueTasks} geciken iş büyüme ritmini etkiliyor. Önce blocker ve owner kontrolü yapılmalı.`,
        source: "OVERDUE_TASKS",
        relatedEntityType: "SUMMARY",
        relatedEntityId: "overdue-tasks",
        clientVisible: false,
      });
    }

    if (!hasRecentVisibleNote) {
      addDraft({
        projectId,
        type: GrowthHubRecommendationType.STRATEGY_REVIEW,
        priority: GrowthHubActionPriority.MEDIUM,
        title: "Haftalık growth yorumu hazırlanmalı",
        description: "Son 10 gün içinde client-visible weekly note bulunmuyor. Müşteriye kısa durum ve sonraki odak notu paylaşılmalı.",
        source: "WEEKLY_NOTE_CADENCE",
        relatedEntityType: "WEEKLY_NOTE",
        relatedEntityId: "missing-recent-visible-note",
        clientVisible: false,
      });
    }

    if (!hasRecentVisibleReport) {
      addDraft({
        projectId,
        type: GrowthHubRecommendationType.REPORTING_REQUIRED,
        priority: GrowthHubActionPriority.MEDIUM,
        title: "Aylık Growth Hub raporu yayımlanmalı",
        description: "Son 35 gün içinde client-visible published Growth Hub raporu bulunmuyor. Rapor hazırlanıp gerekiyorsa müşteri teyidine açılmalı.",
        source: "REPORTING_CADENCE",
        relatedEntityType: "GROWTH_HUB_REPORT",
        relatedEntityId: "missing-recent-visible-report",
        clientVisible: true,
      });
    }

    const targetRoas = summary.config?.targetRoas ?? null;
    if (targetRoas && summary.metrics.blendedRoas > 0 && summary.metrics.blendedRoas < targetRoas) {
      addDraft({
        projectId,
        type: GrowthHubRecommendationType.BUDGET_SHIFT,
        priority: GrowthHubActionPriority.HIGH,
        title: "ROAS hedefi için bütçe ve kreatif dağılımı gözden geçirilmeli",
        description: `Blended ROAS ${summary.metrics.blendedRoas.toFixed(2)}x; hedef ${targetRoas.toFixed(2)}x. Düşük performanslı kanallarda bütçe ve kreatif hipotezi yeniden değerlendirilmeli.`,
        source: "ROAS_TARGET",
        relatedEntityType: "SUMMARY",
        relatedEntityId: "target-roas",
        clientVisible: false,
      });
    }

    summary.channels
      .filter(
        (channel) =>
          channel.status === "WAITING_CONFIG" ||
          channel.status === "RISK" ||
          channel.sourceStatus === "CONTRACT_ONLY",
      )
      .slice(0, 6)
      .forEach((channel) => {
        addDraft({
          projectId,
          type:
            channel.status === "WAITING_CONFIG" || channel.sourceStatus === "CONTRACT_ONLY"
              ? GrowthHubRecommendationType.TECHNICAL_FIX
              : GrowthHubRecommendationType.CHANNEL_OPTIMIZATION,
          priority:
            channel.riskLevel === "HIGH"
              ? GrowthHubActionPriority.HIGH
              : GrowthHubActionPriority.MEDIUM,
          title:
            channel.status === "RISK"
              ? `${channel.label} kanalı optimize edilmeli`
              : `${channel.label} kurulumu tamamlanmalı`,
          description:
            channel.status === "RISK"
              ? `${channel.label} health score ${channel.healthScore}. Risk kaynakları ve kanal aksiyonları kontrol edilmeli.`
              : `${channel.label} için kaynak durumu ${channel.sourceStatus}; veri/kontrat kurulumu tamamlanmalı.`,
          source: "CHANNEL_HEALTH",
          relatedEntityType: "CHANNEL",
          relatedEntityId: channel.serviceKey,
          clientVisible: channel.sourceStatus === "CONTRACT_ONLY",
        });
      });

    return drafts;
  }

  private async updateRecommendationById(
    recommendationId: string,
    dto: UpdateGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
    options: { scope: "ANY" | "ASSIGNED" },
  ): Promise<GrowthHubRecommendationItem> {
    this.assertHasRecommendationUpdatePayload(dto);
    const existing = await this.getGrowthHubRecommendationOrFail(recommendationId);

    if (options.scope === "ASSIGNED") {
      await this.assertCanManageAssignedRecommendations(existing.clientProfileId, actor);
    } else {
      await this.assertCanManageAdminRecommendations(existing.clientProfileId, actor);
    }

    const recommendation = await this.prisma.growthHubRecommendation.update({
      where: { id: recommendationId },
      data: this.buildRecommendationPatchData(dto),
      select: growthHubRecommendationSelect,
    });

    return this.toGrowthHubRecommendationItem(recommendation);
  }

  private async convertRecommendationToTask(
    recommendationId: string,
    dto: ConvertGrowthHubRecommendationDto,
    actor: AuthenticatedUser,
    options: { scope: "ANY" | "ASSIGNED" },
  ): Promise<GrowthHubRecommendationItem> {
    const existing = await this.getGrowthHubRecommendationOrFail(recommendationId);

    if (options.scope === "ASSIGNED") {
      await this.assertCanManageAssignedRecommendations(existing.clientProfileId, actor);
    } else {
      await this.assertCanManageAdminRecommendations(existing.clientProfileId, actor);
    }

    if (existing.convertedTask) {
      return this.toGrowthHubRecommendationItem(existing);
    }

    if (
      existing.status !== GrowthHubRecommendationStatus.OPEN &&
      existing.status !== GrowthHubRecommendationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        "Only open or accepted Growth Hub recommendations can be converted to a task.",
      );
    }

    const projectId =
      existing.projectId ??
      (await this.resolveGrowthHubReportProjectId(existing.clientProfileId, null));

    if (!projectId) {
      throw new BadRequestException("A Growth Hub project is required to convert recommendation.");
    }

    if (dto.assigneeUserId) {
      await this.assertUserExists(dto.assigneeUserId);
    }

    const dueDate = this.parseNullableDate(dto.dueDate) ?? null;
    const title = dto.title?.trim() || existing.title;
    const description =
      dto.description === null
        ? null
        : dto.description?.trim() ||
          existing.description ||
          "Growth Hub önerisinden oluşturulan takip görevi.";
    const now = new Date();

    const recommendation = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId,
          title,
          description,
          status: TaskStatus.TODO,
          priority: this.toTaskPriority(existing.priority),
          type: TaskType.FEATURE,
          assigneeUserId: dto.assigneeUserId ?? null,
          dueDate,
        },
        select: { id: true },
      });

      return tx.growthHubRecommendation.update({
        where: { id: existing.id },
        data: {
          status: GrowthHubRecommendationStatus.CONVERTED_TO_TASK,
          convertedTaskId: task.id,
          convertedAt: now,
          convertedByUserId: actor.id,
        },
        select: growthHubRecommendationSelect,
      });
    });

    return this.toGrowthHubRecommendationItem(recommendation);
  }

  private toGrowthHubActionItem(action: GrowthHubActionModel): GrowthHubActionItem {
    return {
      id: action.id,
      type: "GROWTH_ACTION",
      title: action.title,
      description: action.description,
      serviceKey: action.project?.serviceKey ?? null,
      project: action.project
        ? {
            id: action.project.id,
            name: action.project.name,
            slug: action.project.slug,
          }
        : null,
      owner: action.owner,
      status: action.status,
      priority: action.priority,
      clientVisible: action.clientVisible,
      relatedEntityType: action.relatedEntityType,
      relatedEntityId: action.relatedEntityId,
      dueAt: action.dueAt,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    };
  }

  private toGrowthHubWeeklyNoteItem(note: GrowthHubWeeklyNoteModel): GrowthHubWeeklyNoteItem {
    return {
      id: note.id,
      clientProfileId: note.clientProfileId,
      project: note.project
        ? {
            id: note.project.id,
            name: note.project.name,
            slug: note.project.slug,
            serviceKey: note.project.serviceKey,
          }
        : null,
      weekStart: note.weekStart,
      weekEnd: note.weekEnd,
      summary: note.summary,
      nextFocus: note.nextFocus,
      risks: note.risks,
      clientVisible: note.clientVisible,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  private toGrowthHubReportItem(report: GrowthHubReportModel): GrowthHubReportItem {
    const acknowledgementStatus =
      report.acknowledgementRequestedAt === null
        ? "NOT_REQUESTED"
        : report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.ACKNOWLEDGED ||
            report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.APPROVED
          ? "ACKNOWLEDGED"
          : report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.CHANGES_REQUESTED ||
              report.acknowledgementTask?.approvalStatus === MetaAdsApprovalStatus.REJECTED
            ? "CHANGES_REQUESTED"
            : "PENDING";

    return {
      id: report.id,
      clientProfileId: report.clientProfileId,
      projectId: report.projectId ?? null,
      project: report.project
        ? {
            id: report.project.id,
            name: report.project.name,
            slug: report.project.slug,
            serviceKey: report.project.serviceKey,
          }
        : null,
      periodStart: report.periodStart.toISOString(),
      periodEnd: report.periodEnd.toISOString(),
      type: report.type,
      status: report.status,
      summary: report.summary ?? null,
      metricsSnapshot: (report.metricsSnapshot as Prisma.JsonValue | null) ?? null,
      clientVisible: report.clientVisible,
      publishedAt: report.publishedAt?.toISOString() ?? null,
      acknowledgementRequestedAt: report.acknowledgementRequestedAt?.toISOString() ?? null,
      acknowledgedAt: report.acknowledgedAt?.toISOString() ?? null,
      acknowledgementStatus,
      acknowledgementTaskId: report.acknowledgementTask?.id ?? null,
      acknowledgementTaskUpdatedAt: report.acknowledgementTask?.updatedAt.toISOString() ?? null,
      createdBy: report.createdBy,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }

  private toGrowthHubRecommendationItem(
    recommendation: GrowthHubRecommendationModel,
  ): GrowthHubRecommendationItem {
    return {
      id: recommendation.id,
      clientProfileId: recommendation.clientProfileId,
      projectId: recommendation.projectId ?? null,
      project: recommendation.project
        ? {
            id: recommendation.project.id,
            name: recommendation.project.name,
            slug: recommendation.project.slug,
            serviceKey: recommendation.project.serviceKey,
          }
        : null,
      type: recommendation.type,
      priority: recommendation.priority,
      title: recommendation.title,
      description: recommendation.description ?? null,
      source: recommendation.source ?? null,
      relatedEntityType: recommendation.relatedEntityType ?? null,
      relatedEntityId: recommendation.relatedEntityId ?? null,
      status: recommendation.status,
      clientVisible: recommendation.clientVisible,
      convertedTask: recommendation.convertedTask
        ? {
            id: recommendation.convertedTask.id,
            title: recommendation.convertedTask.title,
            status: recommendation.convertedTask.status,
          }
        : null,
      convertedAt: recommendation.convertedAt?.toISOString() ?? null,
      createdBy: recommendation.createdBy,
      createdAt: recommendation.createdAt.toISOString(),
      updatedAt: recommendation.updatedAt.toISOString(),
    };
  }

  private toAdminClientListItem(summary: GrowthHubSummaryResponse): AdminGrowthHubClientListItem {
    return {
      client: summary.client,
      serviceStatus: summary.service.status,
      config: summary.config,
      state: summary.state,
      metrics: summary.metrics,
      channels: summary.channels,
      actions: summary.actions,
      meta: summary.meta,
    };
  }

  private buildClientsOverviewMeta(items: AdminGrowthHubClientListItem[]) {
    return {
      total: items.length,
      ready: items.filter((item) => item.state === "READY").length,
      risk: items.filter((item) => item.state === "RISK").length,
      optimize: items.filter((item) => item.state === "OPTIMIZE").length,
      scale: items.filter((item) => item.state === "SCALE").length,
      waitingConfig: items.filter((item) => item.state === "WAITING_CONFIG").length,
      pendingApprovals: items.reduce((sum, item) => sum + item.metrics.pendingApprovals, 0),
      generatedAt: new Date(),
    };
  }

  private toAdminConfigResponse(
    clientProfileId: string,
    config: GrowthHubConfigModel | null,
    hasActiveService: boolean,
  ): AdminGrowthHubConfigResponse {
    return {
      id: config?.id ?? "",
      clientProfileId,
      hasActiveService,
      primaryGoal: config?.primaryGoal ?? null,
      targetLeads: config?.targetLeads ?? null,
      targetRoas: this.readDecimalAsNullableNumber(config?.targetRoas),
      targetCpa: this.readDecimalAsNullableNumber(config?.targetCpa),
      targetRevenue: this.readDecimalAsNullableNumber(config?.targetRevenue),
      reportingDay: config?.reportingDay ?? null,
      notes: config?.notes ?? null,
      status: config?.status ?? GrowthHubStatus.ACTIVE,
      createdAt: config?.createdAt ?? null,
      updatedAt: config?.updatedAt ?? null,
    };
  }

  private buildConfigPatchData(dto: UpdateGrowthHubConfigDto): GrowthHubConfigPatchData {
    const data: GrowthHubConfigPatchData = {};
    this.assignIfDefined(data, "primaryGoal", dto.primaryGoal);
    this.assignIfDefined(data, "targetLeads", dto.targetLeads);
    this.assignIfDefined(data, "targetRoas", dto.targetRoas);
    this.assignIfDefined(data, "targetCpa", dto.targetCpa);
    this.assignIfDefined(data, "targetRevenue", dto.targetRevenue);
    this.assignIfDefined(data, "reportingDay", dto.reportingDay);
    this.assignIfDefined(data, "notes", dto.notes);
    this.assignIfDefined(data, "status", dto.status);
    return data;
  }

  private buildActionPatchData(dto: UpdateGrowthHubActionDto): GrowthHubActionPatchData {
    const data: GrowthHubActionPatchData = {};
    this.assignActionIfDefined(data, "title", dto.title?.trim());
    this.assignActionIfDefined(data, "description", dto.description);
    this.assignActionIfDefined(data, "projectId", dto.projectId);
    this.assignActionIfDefined(data, "ownerUserId", dto.ownerUserId);
    this.assignActionIfDefined(data, "status", dto.status);
    this.assignActionIfDefined(data, "priority", dto.priority);
    if (dto.dueAt !== undefined) {
      data.dueAt = this.parseNullableDate(dto.dueAt) ?? null;
    }
    this.assignActionIfDefined(data, "clientVisible", dto.clientVisible);
    this.assignActionIfDefined(data, "relatedEntityType", dto.relatedEntityType);
    this.assignActionIfDefined(data, "relatedEntityId", dto.relatedEntityId);
    return data;
  }

  private buildWeeklyNotePatchData(
    dto: UpdateGrowthHubWeeklyNoteDto,
    existing: GrowthHubWeeklyNoteModel,
  ): GrowthHubWeeklyNotePatchData {
    const data: GrowthHubWeeklyNotePatchData = {};
    this.assignWeeklyNoteIfDefined(data, "projectId", dto.projectId);
    if (dto.weekStart !== undefined) {
      data.weekStart = this.parseRequiredDate(dto.weekStart, "weekStart");
    }
    if (dto.weekEnd !== undefined) {
      data.weekEnd = this.parseRequiredDate(dto.weekEnd, "weekEnd");
    }
    this.assertValidWeekRange(data.weekStart ?? existing.weekStart, data.weekEnd ?? existing.weekEnd);
    this.assignWeeklyNoteIfDefined(data, "summary", dto.summary?.trim());
    this.assignWeeklyNoteIfDefined(data, "nextFocus", dto.nextFocus);
    if (dto.risks !== undefined) {
      data.risks = this.toNullableJsonInput(dto.risks);
    }
    this.assignWeeklyNoteIfDefined(data, "clientVisible", dto.clientVisible);
    return data;
  }

  private buildRecommendationPatchData(
    dto: UpdateGrowthHubRecommendationDto,
  ): GrowthHubRecommendationPatchData {
    const data: GrowthHubRecommendationPatchData = {};
    this.assignRecommendationIfDefined(data, "status", dto.status);
    this.assignRecommendationIfDefined(data, "priority", dto.priority);
    this.assignRecommendationIfDefined(data, "title", dto.title?.trim());
    this.assignRecommendationIfDefined(data, "description", dto.description);
    this.assignRecommendationIfDefined(data, "clientVisible", dto.clientVisible);
    return data;
  }

  private async assertCanReadAdminConfig(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      this.hasPermission(actor, GROWTH_HUB_CONFIG_READ_ANY_PERMISSION)
    ) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub config permission.");
  }

  private async assertCanReadAdminSummary(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION)
    ) {
      await this.assertClientProfileExists(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub summary permission.");
  }

  private async assertCanReadAdminActions(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      (this.hasPermission(actor, GROWTH_HUB_ACTIONS_READ_ANY_PERMISSION) ||
        this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      await this.assertClientHasActiveGrowthHubService(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub actions permission.");
  }

  private async assertCanReadAdminNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      (this.hasPermission(actor, GROWTH_HUB_NOTES_READ_ANY_PERMISSION) ||
        this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      await this.assertClientHasActiveGrowthHubService(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub notes permission.");
  }

  private async assertCanReadAdminReports(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      (this.hasPermission(actor, GROWTH_HUB_REPORTS_READ_ANY_PERMISSION) ||
        this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      await this.assertClientHasActiveGrowthHubService(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub reports permission.");
  }

  private assertCanReadAdminOverview(actor: AuthenticatedUser): void {
    if (
      !this.isAdminUser(actor) ||
      !this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub summary permission.");
    }
  }

  private assertCanManageConfig(actor: AuthenticatedUser): void {
    if (
      !this.isAdminUser(actor) ||
      !this.hasPermission(actor, GROWTH_HUB_CONFIG_MANAGE_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub config permission.");
    }
  }

  private assertCanManageAdminActions(actor: AuthenticatedUser): void {
    if (
      !this.isAdminUser(actor) ||
      !this.hasPermission(actor, GROWTH_HUB_ACTIONS_MANAGE_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub actions permission.");
    }
  }

  private assertCanManageAdminNotes(actor: AuthenticatedUser): void {
    if (
      !this.isAdminUser(actor) ||
      !this.hasPermission(actor, GROWTH_HUB_NOTES_MANAGE_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub notes permission.");
    }
  }

  private assertCanManageAdminReports(actor: AuthenticatedUser): void {
    if (
      !this.isAdminUser(actor) ||
      !this.hasPermission(actor, GROWTH_HUB_REPORTS_MANAGE_ANY_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub reports permission.");
    }
  }

  private async assertCanReadAdminRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      (this.hasPermission(actor, GROWTH_HUB_RECOMMENDATIONS_READ_ANY_PERMISSION) ||
        this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ANY_PERMISSION))
    ) {
      await this.assertClientProfileExists(clientProfileId);
      await this.assertClientHasActiveGrowthHubService(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub recommendations permission.");
  }

  private async assertCanManageAdminRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (
      this.isAdminUser(actor) &&
      this.hasPermission(actor, GROWTH_HUB_RECOMMENDATIONS_MANAGE_ANY_PERMISSION)
    ) {
      await this.assertClientProfileExists(clientProfileId);
      await this.assertClientHasActiveGrowthHubService(clientProfileId);
      return;
    }

    throw new ForbiddenException("Missing required Growth Hub recommendations permission.");
  }

  private async assertCanReadAssignedConfig(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_CONFIG_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub config permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanReadAssignedSummary(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub summary permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanReadAssignedActions(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_ACTIONS_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub actions permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanManageAssignedActions(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_ACTIONS_MANAGE_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub actions permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanReadAssignedNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_NOTES_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub notes permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanReadAssignedReports(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_REPORTS_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub reports permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanManageAssignedNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_NOTES_MANAGE_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub notes permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanManageAssignedReports(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_REPORTS_MANAGE_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub reports permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanReadAssignedRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_RECOMMENDATIONS_READ_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub recommendations permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private async assertCanManageAssignedRecommendations(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_RECOMMENDATIONS_MANAGE_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub recommendations permission.");
    }

    await this.assertAssignedGrowthHubClientOrFail(actor, clientProfileId);
  }

  private assertCanReadOwnConfig(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_CONFIG_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub config permission.");
    }
  }

  private assertCanReadOwnSummary(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_SUMMARY_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub summary permission.");
    }
  }

  private assertCanReadOwnActions(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_ACTIONS_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub actions permission.");
    }
  }

  private assertCanReadOwnNotes(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_NOTES_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub notes permission.");
    }
  }

  private assertCanReadOwnReports(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_REPORTS_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub reports permission.");
    }
  }

  private assertCanReadOwnRecommendations(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.CLIENT ||
      !this.hasPermission(actor, GROWTH_HUB_RECOMMENDATIONS_READ_OWN_PERMISSION)
    ) {
      throw new ForbiddenException("Missing required Growth Hub recommendations permission.");
    }
  }

  private async assertAssignedGrowthHubClientOrFail(
    actor: AuthenticatedUser,
    clientProfileId: string,
  ): Promise<void> {
    if (actor.accountType !== AccountType.EMPLOYEE || actor.role === UserRole.ADMIN) {
      throw new NotFoundException("Client profile not found.");
    }

    const client = await this.prisma.clientProfile.findFirst({
      where: {
        id: clientProfileId,
        employeeAssignments: {
          some: {
            employeeUserId: actor.id,
            isActive: true,
            scope: EmployeeClientAssignmentScope.PROJECT,
          },
        },
        purchasedServices: {
          some: {
            serviceKey: PurchasedServiceKey.GROWTH_HUB,
            status: PurchasedServiceStatus.ACTIVE,
          },
        },
      },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private async assertClientProfileExists(clientProfileId: string): Promise<void> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException("Client profile not found.");
    }
  }

  private async assertClientHasActiveGrowthHubService(clientProfileId: string): Promise<void> {
    const hasActiveService = await this.hasActiveGrowthHubService(clientProfileId);
    if (!hasActiveService) {
      throw new BadRequestException(
        "Client must have an ACTIVE GROWTH_HUB purchased service to use Growth Hub.",
      );
    }
  }

  private async assertActionReferencesBelongToClient(
    clientProfileId: string,
    dto: Pick<CreateGrowthHubActionDto, "projectId" | "ownerUserId">,
  ): Promise<void> {
    if (dto.projectId) {
      await this.assertProjectBelongsToClient(dto.projectId, clientProfileId);
    }

    if (dto.ownerUserId) {
      await this.assertUserExists(dto.ownerUserId);
    }
  }

  private async assertWeeklyNoteReferencesBelongToClient(
    clientProfileId: string,
    dto: Pick<CreateGrowthHubWeeklyNoteDto, "projectId">,
  ): Promise<void> {
    if (dto.projectId) {
      await this.assertProjectBelongsToClient(dto.projectId, clientProfileId);
    }
  }

  private resolveGrowthHubReportPeriod(
    periodStartRaw: string,
    periodEndRaw: string,
  ): { periodStart: Date; periodEnd: Date } {
    const periodStart = this.parseRequiredDate(periodStartRaw, "periodStart");
    const periodEnd = this.parseRequiredDate(periodEndRaw, "periodEnd");

    if (periodStart.getTime() > periodEnd.getTime()) {
      throw new BadRequestException("periodStart cannot be greater than periodEnd.");
    }

    return { periodStart, periodEnd };
  }

  private normalizeGrowthHubReportSummary(summary: string | undefined): string | null {
    if (summary === undefined) {
      return null;
    }

    const normalized = summary.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveGrowthHubReportProjectId(
    clientProfileId: string,
    projectId: string | null,
  ): Promise<string | null> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          clientProfileId,
        },
        select: { id: true },
      });

      if (!project) {
        throw new BadRequestException("Provided projectId is not a project for this client.");
      }

      return project.id;
    }

    const growthHubProject = await this.prisma.project.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
      },
      select: { id: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    if (growthHubProject) {
      return growthHubProject.id;
    }

    const fallbackProject = await this.prisma.project.findFirst({
      where: { clientProfileId },
      select: { id: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return fallbackProject?.id ?? null;
  }

  private buildGrowthHubReportAcknowledgementTaskTitle(
    reportType: GrowthHubReportType,
    periodStart: Date,
    periodEnd: Date,
  ): string {
    const start = periodStart.toISOString().slice(0, 10);
    const end = periodEnd.toISOString().slice(0, 10);
    return `Growth Hub Rapor Teyidi · ${reportType} (${start} - ${end})`;
  }

  private buildGrowthHubReportAcknowledgementTaskDescription(summary: string | null): string {
    if (summary) {
      return `Growth Hub raporu müşteri teyidine açıldı. Özet: ${summary}`;
    }

    return "Growth Hub raporu müşteri teyidine açıldı.";
  }

  private async assertProjectBelongsToClient(
    projectId: string,
    clientProfileId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, clientProfileId },
      select: { id: true },
    });

    if (!project) {
      throw new BadRequestException("Project must belong to the Growth Hub client.");
    }
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException("Growth Hub action owner was not found.");
    }
  }

  private async getGrowthHubActionOrFail(actionId: string): Promise<GrowthHubActionModel> {
    const action = await this.prisma.growthHubAction.findUnique({
      where: { id: actionId },
      select: growthHubActionSelect,
    });

    if (!action) {
      throw new NotFoundException("Growth Hub action not found.");
    }

    return action;
  }

  private async getGrowthHubWeeklyNoteOrFail(noteId: string): Promise<GrowthHubWeeklyNoteModel> {
    const note = await this.prisma.growthHubWeeklyNote.findUnique({
      where: { id: noteId },
      select: growthHubWeeklyNoteSelect,
    });

    if (!note) {
      throw new NotFoundException("Growth Hub weekly note not found.");
    }

    return note;
  }

  private async getGrowthHubRecommendationOrFail(
    recommendationId: string,
  ): Promise<GrowthHubRecommendationModel> {
    const recommendation = await this.prisma.growthHubRecommendation.findUnique({
      where: { id: recommendationId },
      select: growthHubRecommendationSelect,
    });

    if (!recommendation) {
      throw new NotFoundException("Growth Hub recommendation not found.");
    }

    return recommendation;
  }

  private async hasActiveGrowthHubService(clientProfileId: string): Promise<boolean> {
    const activeService = await this.prisma.clientPurchasedService.findFirst({
      where: {
        clientProfileId,
        serviceKey: PurchasedServiceKey.GROWTH_HUB,
        status: PurchasedServiceStatus.ACTIVE,
      },
      select: { id: true },
    });

    return Boolean(activeService);
  }

  private parseNullableDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return this.parseRequiredDate(value, "date");
  }

  private parseRequiredDate(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid ISO date.`);
    }

    return parsed;
  }

  private assertValidWeekRange(weekStart: Date, weekEnd: Date): void {
    if (weekEnd.getTime() < weekStart.getTime()) {
      throw new BadRequestException("weekEnd must be after weekStart.");
    }
  }

  private toNullableJsonInput(
    value: unknown,
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    if (value === null || value === undefined) {
      return Prisma.DbNull;
    }

    return value as Prisma.InputJsonValue;
  }

  private getOwnClientProfileIdOrFail(actor: AuthenticatedUser): string {
    if (!actor.clientProfileId) {
      throw new ForbiddenException("Client profile context is missing.");
    }

    return actor.clientProfileId;
  }

  private assertBodyObject(dto: unknown): asserts dto is Record<string, unknown> {
    if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
      throw new BadRequestException("Request body must be an object.");
    }
  }

  private assertHasConfigUpdatePayload(dto: UpdateGrowthHubConfigDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Growth Hub config field is required.");
    }
  }

  private assertHasActionUpdatePayload(dto: UpdateGrowthHubActionDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Growth Hub action field is required.");
    }
  }

  private assertHasWeeklyNoteUpdatePayload(dto: UpdateGrowthHubWeeklyNoteDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one Growth Hub weekly note field is required.");
    }
  }

  private assertHasReportUpdatePayload(dto: UpdateGrowthHubReportDto): void {
    if (
      dto.status === undefined &&
      dto.summary === undefined &&
      dto.metricsSnapshot === undefined &&
      dto.clientVisible === undefined &&
      dto.requestAcknowledgement === undefined
    ) {
      throw new BadRequestException("At least one Growth Hub report field is required.");
    }
  }

  private assertHasRecommendationUpdatePayload(dto: UpdateGrowthHubRecommendationDto): void {
    if (
      dto.status === undefined &&
      dto.priority === undefined &&
      dto.title === undefined &&
      dto.description === undefined &&
      dto.clientVisible === undefined
    ) {
      throw new BadRequestException("At least one Growth Hub recommendation field is required.");
    }
  }

  private assignIfDefined<K extends keyof GrowthHubConfigPatchData>(
    data: GrowthHubConfigPatchData,
    key: K,
    value: GrowthHubConfigPatchData[K] | undefined,
  ): void {
    if (value !== undefined) {
      data[key] = value;
    }
  }

  private assignActionIfDefined<K extends keyof GrowthHubActionPatchData>(
    data: GrowthHubActionPatchData,
    key: K,
    value: GrowthHubActionPatchData[K] | undefined,
  ): void {
    if (value !== undefined) {
      data[key] = value;
    }
  }

  private assignWeeklyNoteIfDefined<K extends keyof GrowthHubWeeklyNotePatchData>(
    data: GrowthHubWeeklyNotePatchData,
    key: K,
    value: GrowthHubWeeklyNotePatchData[K] | undefined,
  ): void {
    if (value !== undefined) {
      data[key] = value;
    }
  }

  private assignRecommendationIfDefined<K extends keyof GrowthHubRecommendationPatchData>(
    data: GrowthHubRecommendationPatchData,
    key: K,
    value: GrowthHubRecommendationPatchData[K] | undefined,
  ): void {
    if (value !== undefined) {
      data[key] = value;
    }
  }

  private buildRecommendationDedupeKey(
    clientProfileId: string,
    type: GrowthHubRecommendationType,
    relatedEntityType: string | null,
    relatedEntityId: string | null,
  ): string {
    return [
      clientProfileId,
      type,
      relatedEntityType ?? "GENERAL",
      relatedEntityId ?? "GLOBAL",
    ].join(":");
  }

  private toTaskPriority(priority: GrowthHubActionPriority): Priority {
    if (priority === GrowthHubActionPriority.CRITICAL) {
      return Priority.URGENT;
    }
    if (priority === GrowthHubActionPriority.HIGH) {
      return Priority.HIGH;
    }
    if (priority === GrowthHubActionPriority.LOW) {
      return Priority.LOW;
    }
    return Priority.MEDIUM;
  }

  private readDecimalAsNullableNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return value.toNumber();
  }

  private hasPermission(actor: AuthenticatedUser, permission: string): boolean {
    return actor.permissions.includes(permission);
  }

  private isAdminUser(actor: AuthenticatedUser): boolean {
    return actor.accountType === AccountType.ADMIN && actor.role === UserRole.ADMIN;
  }
}
