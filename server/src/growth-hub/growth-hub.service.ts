import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  GrowthHubGoal,
  GrowthHubStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
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
const GROWTH_HUB_ACTIONS_READ_ASSIGNED_PERMISSION = "growthHub.actions.read.assigned";
const GROWTH_HUB_ACTIONS_READ_OWN_PERMISSION = "growthHub.actions.read.own";

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

type GrowthHubConfigModel = Prisma.ClientGrowthHubConfigGetPayload<{
  select: typeof growthHubConfigSelect;
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
      meta: {
        total: items.length,
        ready: items.filter((item) => item.state === "READY").length,
        risk: items.filter((item) => item.state === "RISK").length,
        optimize: items.filter((item) => item.state === "OPTIMIZE").length,
        scale: items.filter((item) => item.state === "SCALE").length,
        waitingConfig: items.filter((item) => item.state === "WAITING_CONFIG").length,
        pendingApprovals: items.reduce(
          (sum, item) => sum + item.metrics.pendingApprovals,
          0,
        ),
        generatedAt: new Date(),
      },
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
    const summary = await this.getAdminClientSummary(clientProfileId, actor);
    return {
      data: summary.actions,
      meta: { total: summary.actions.length, generatedAt: new Date() },
    };
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
    const summary = await this.summaryService.getSummary(clientProfileId);
    return {
      data: summary.actions,
      meta: { total: summary.actions.length, generatedAt: new Date() },
    };
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
    const summary = await this.summaryService.getSummary(clientProfileId, {
      clientVisibleOnly: true,
    });

    return {
      data: summary.actions,
      meta: { total: summary.actions.length, generatedAt: new Date() },
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

  private assignIfDefined<K extends keyof GrowthHubConfigPatchData>(
    data: GrowthHubConfigPatchData,
    key: K,
    value: GrowthHubConfigPatchData[K] | undefined,
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
