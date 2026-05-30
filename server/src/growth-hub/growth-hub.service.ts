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
  GrowthHubStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
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

type GrowthHubConfigModel = Prisma.ClientGrowthHubConfigGetPayload<{
  select: typeof growthHubConfigSelect;
}>;

type GrowthHubActionModel = Prisma.GrowthHubActionGetPayload<{
  select: typeof growthHubActionSelect;
}>;

type GrowthHubWeeklyNoteModel = Prisma.GrowthHubWeeklyNoteGetPayload<{
  select: typeof growthHubWeeklyNoteSelect;
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

  private async assertCanManageAssignedNotes(
    clientProfileId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (!this.hasPermission(actor, GROWTH_HUB_NOTES_MANAGE_ASSIGNED_PERMISSION)) {
      throw new ForbiddenException("Missing required Growth Hub notes permission.");
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
