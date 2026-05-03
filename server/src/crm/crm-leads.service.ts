import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  AccountType,
  ClientStatus,
  CrmLeadActivityType,
  CrmLeadSource,
  CrmLeadStatus,
  CrmLeadWebsiteStatus,
  Prisma,
  Priority,
  UserRole,
  UserStatus,
} from "@prisma/client";
import {
  AuditLogRequestContext,
  CRM_LEAD_AUDIT_ACTIONS,
  AuditLogService,
} from "../audit-log/audit-log.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { AdminCrmLeadQueryDto, CrmLeadSortBy } from "./dto/admin-crm-lead-query.dto";
import { ConvertCrmLeadDto } from "./dto/convert-crm-lead.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { CreatePublicCrmLeadDto } from "./dto/create-public-crm-lead.dto";
import { UpdateAssignedCrmLeadDto } from "./dto/update-assigned-crm-lead.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";

const CRM_LEAD_READ_ANY_PERMISSION = "crm.leads.read.any";
const CRM_LEAD_MANAGE_ANY_PERMISSION = "crm.leads.manage.any";
const CRM_LEAD_READ_ASSIGNED_PERMISSION = "crm.leads.read.assigned";
const CRM_LEAD_UPDATE_ASSIGNED_PERMISSION = "crm.leads.update.assigned";
const CRM_LEAD_CONVERT_PERMISSION = "crm.leads.convert";
const CRM_LEAD_ENTITY_TYPE = "CrmLead";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const EMPLOYEE_ALLOWED_STATUSES = [
  CrmLeadStatus.CONTACTED,
  CrmLeadStatus.FOLLOW_UP,
  CrmLeadStatus.QUALIFIED,
  CrmLeadStatus.LOST,
] as const;
const EMPLOYEE_ALLOWED_ACTIVITY_TYPES = [
  CrmLeadActivityType.CALL,
  CrmLeadActivityType.EMAIL,
  CrmLeadActivityType.WHATSAPP,
  CrmLeadActivityType.NOTE,
] as const;

const userSummarySelect = {
  id: true,
  displayName: true,
  email: true,
  role: true,
  status: true,
} satisfies Prisma.UserSelect;

const convertedClientSelect = {
  id: true,
  slug: true,
  companyName: true,
  contactEmail: true,
  status: true,
} satisfies Prisma.ClientProfileSelect;

const activitySelect = {
  id: true,
  leadId: true,
  actorUserId: true,
  type: true,
  note: true,
  nextFollowUpAt: true,
  createdAt: true,
  actor: {
    select: userSummarySelect,
  },
} satisfies Prisma.CrmLeadActivitySelect;

const leadListSelect = {
  id: true,
  companyName: true,
  contactName: true,
  contactEmail: true,
  phone: true,
  source: true,
  status: true,
  priority: true,
  ownerUserId: true,
  convertedClientProfileId: true,
  address: true,
  city: true,
  sector: true,
  website: true,
  websiteStatus: true,
  websiteIssues: true,
  detectedPainPoints: true,
  recommendedServices: true,
  outreachAngle: true,
  emailSubject: true,
  emailBody: true,
  whatsappMessage: true,
  sourceQuery: true,
  sourceProvider: true,
  googleMapsUrl: true,
  googleRating: true,
  reviewCount: true,
  instagramUrl: true,
  whatsappPhone: true,
  leadScore: true,
  nextFollowUpAt: true,
  createdAt: true,
  updatedAt: true,
  ownerUser: {
    select: userSummarySelect,
  },
  convertedClientProfile: {
    select: convertedClientSelect,
  },
  activities: {
    select: activitySelect,
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} satisfies Prisma.CrmLeadSelect;

const leadDetailSelect = {
  ...leadListSelect,
  activities: {
    select: activitySelect,
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.CrmLeadSelect;

type LeadListModel = Prisma.CrmLeadGetPayload<{ select: typeof leadListSelect }>;
type LeadDetailModel = Prisma.CrmLeadGetPayload<{ select: typeof leadDetailSelect }>;
type ActivityModel = Prisma.CrmLeadActivityGetPayload<{ select: typeof activitySelect }>;
type ActivityResponse = {
  id: string;
  leadId: string;
  actorUserId: string | null;
  type: CrmLeadActivityType;
  note: string;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  actor: ActivityModel["actor"];
};
type LeadListResponse = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string | null;
  phone: string | null;
  source: CrmLeadSource;
  status: CrmLeadStatus;
  priority: Priority | null;
  ownerUserId: string;
  convertedClientProfileId: string | null;
  address: string | null;
  city: string | null;
  sector: string | null;
  website: string | null;
  websiteStatus: CrmLeadWebsiteStatus | null;
  websiteIssues: Prisma.JsonValue | null;
  detectedPainPoints: Prisma.JsonValue | null;
  recommendedServices: Prisma.JsonValue | null;
  outreachAngle: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  whatsappMessage: string | null;
  sourceQuery: string | null;
  sourceProvider: string | null;
  googleMapsUrl: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  instagramUrl: string | null;
  whatsappPhone: string | null;
  leadScore: number | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: LeadListModel["ownerUser"];
  convertedClientProfile: LeadListModel["convertedClientProfile"];
  latestActivity: ActivityResponse | null;
};
type LeadDetailResponse = LeadListResponse & {
  activities: ActivityResponse[];
};

type ListResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class CrmLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listAdminLeads(
    currentUser: AuthenticatedUser,
    query: AdminCrmLeadQueryDto,
  ): Promise<ListResponse<LeadListResponse>> {
    this.assertAdminPermission(currentUser, CRM_LEAD_READ_ANY_PERMISSION);
    return this.listLeads(this.buildLeadWhere(query), query);
  }

  async listEmployeeLeads(
    currentUser: AuthenticatedUser,
    query: AdminCrmLeadQueryDto,
  ): Promise<ListResponse<LeadListResponse>> {
    this.assertCrmEmployeePermission(currentUser, CRM_LEAD_READ_ASSIGNED_PERMISSION);
    return this.listLeads(
      {
        ...this.buildLeadWhere(query),
        ownerUserId: currentUser.id,
      },
      query,
    );
  }

  async getAdminLead(currentUser: AuthenticatedUser, leadId: string): Promise<LeadDetailResponse> {
    this.assertAdminPermission(currentUser, CRM_LEAD_READ_ANY_PERMISSION);
    const lead = await this.getLeadOrFail(leadId);
    return this.toLeadDetailResponse(lead);
  }

  async getEmployeeLead(currentUser: AuthenticatedUser, leadId: string): Promise<LeadDetailResponse> {
    this.assertCrmEmployeePermission(currentUser, CRM_LEAD_READ_ASSIGNED_PERMISSION);
    const lead = await this.getOwnedLeadOrFail(currentUser, leadId);
    return this.toLeadDetailResponse(lead);
  }

  async createAdminLead(
    currentUser: AuthenticatedUser,
    dto: CreateCrmLeadDto,
    requestContext?: AuditLogRequestContext,
  ) {
    this.assertAdminPermission(currentUser, CRM_LEAD_MANAGE_ANY_PERMISSION);
    if (dto.source && dto.source !== CrmLeadSource.MANUAL) {
      throw new BadRequestException("CRM lead source must be MANUAL in V1.");
    }
    const owner = await this.getActiveCrmOwnerOrFail(dto.ownerUserId);
    const initialNote = dto.initialNote?.trim();

    const createdLead = await this.prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.create({
        data: {
          companyName: dto.companyName,
          contactName: dto.contactName,
          contactEmail: dto.contactEmail ?? null,
          phone: dto.phone ?? null,
          ownerUserId: owner.id,
          source: dto.source ?? CrmLeadSource.MANUAL,
          status: dto.status ?? CrmLeadStatus.NEW,
          nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt),
          ...(initialNote
            ? {
                activities: {
                  create: {
                    actorUserId: currentUser.id,
                    type: CrmLeadActivityType.NOTE,
                    note: initialNote,
                    nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt),
                  },
                },
              }
            : {}),
        },
        select: leadDetailSelect,
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CRM_LEAD_AUDIT_ACTIONS.created,
          entityType: CRM_LEAD_ENTITY_TYPE,
          entityId: lead.id,
          metadata: {
            companyName: lead.companyName,
            ownerUserId: lead.ownerUserId,
            status: lead.status,
          },
          requestContext,
        },
        tx,
      );

      return lead;
    });

    return this.toLeadDetailResponse(createdLead);
  }

  async createPublicWebsiteLead(
    dto: CreatePublicCrmLeadDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<{ id: string; status: "received" }> {
    if (!dto.consentAccepted) {
      throw new BadRequestException("Consent is required before submitting a contact request.");
    }

    const owner = await this.getNextActiveCrmOwnerOrFail();
    const initialNote = this.buildWebsiteLeadInitialNote(dto);

    const createdLead = await this.prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.create({
        data: {
          companyName: dto.companyName,
          contactName: dto.fullName,
          contactEmail: dto.contactEmail ?? null,
          phone: dto.phone ?? null,
          ownerUserId: owner.id,
          source: CrmLeadSource.WEBSITE_FORM,
          status: CrmLeadStatus.NEW,
          activities: {
            create: {
              actorUserId: null,
              type: CrmLeadActivityType.NOTE,
              note: initialNote,
            },
          },
        },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          contactEmail: true,
          phone: true,
          ownerUserId: true,
          source: true,
        },
      });

      await this.auditLogService.record(
        {
          actorUserId: null,
          action: CRM_LEAD_AUDIT_ACTIONS.created,
          entityType: CRM_LEAD_ENTITY_TYPE,
          entityId: lead.id,
          metadata: {
            companyName: lead.companyName,
            ownerUserId: lead.ownerUserId,
            source: lead.source,
            serviceInterest: dto.serviceInterest ?? null,
          },
          requestContext,
        },
        tx,
      );

      return lead;
    });

    return { id: createdLead.id, status: "received" };
  }

  async updateAdminLead(
    currentUser: AuthenticatedUser,
    leadId: string,
    dto: UpdateCrmLeadDto,
    requestContext?: AuditLogRequestContext,
  ) {
    this.assertAdminPermission(currentUser, CRM_LEAD_MANAGE_ANY_PERMISSION);
    this.assertAdminUpdatePayload(dto);
    const previousLead = await this.getLeadOrFail(leadId);

    if (dto.ownerUserId) {
      await this.getActiveCrmOwnerOrFail(dto.ownerUserId);
    }

    const updatedLead = await this.prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.update({
        where: { id: leadId },
        data: {
          ...(dto.companyName !== undefined ? { companyName: dto.companyName } : {}),
          ...(dto.contactName !== undefined ? { contactName: dto.contactName } : {}),
          ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.ownerUserId !== undefined ? { ownerUserId: dto.ownerUserId } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.nextFollowUpAt !== undefined
            ? { nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt) }
            : {}),
        },
        select: leadDetailSelect,
      });

      if (dto.status && dto.status !== previousLead.status) {
        await this.createStatusChangeActivity(tx, leadId, currentUser.id, previousLead.status, dto.status);
      }

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CRM_LEAD_AUDIT_ACTIONS.updated,
          entityType: CRM_LEAD_ENTITY_TYPE,
          entityId: lead.id,
          metadata: {
            changedFields: Object.keys(dto),
            previousStatus: previousLead.status,
            nextStatus: lead.status,
          },
          requestContext,
        },
        tx,
      );

      return lead;
    });

    return this.toLeadDetailResponse(updatedLead);
  }

  async updateEmployeeLead(
    currentUser: AuthenticatedUser,
    leadId: string,
    dto: UpdateAssignedCrmLeadDto,
  ) {
    this.assertCrmEmployeePermission(currentUser, CRM_LEAD_UPDATE_ASSIGNED_PERMISSION);
    this.assertEmployeeUpdatePayload(dto);
    const previousLead = await this.getOwnedLeadOrFail(currentUser, leadId);
    if (previousLead.convertedClientProfileId || previousLead.status === CrmLeadStatus.WON) {
      throw new ConflictException("Converted CRM leads cannot be updated by employees.");
    }

    if (dto.status && !this.isEmployeeAllowedStatus(dto.status)) {
      throw new BadRequestException("CRM employees can only set CONTACTED, FOLLOW_UP, QUALIFIED, or LOST.");
    }

    const updatedLead = await this.prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.update({
        where: { id: leadId },
        data: {
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.nextFollowUpAt !== undefined
            ? { nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt) }
            : {}),
        },
        select: leadDetailSelect,
      });

      if (dto.status && dto.status !== previousLead.status) {
        await this.createStatusChangeActivity(tx, leadId, currentUser.id, previousLead.status, dto.status);
      }

      return lead;
    });

    return this.toLeadDetailResponse(updatedLead);
  }

  async createAdminActivity(
    currentUser: AuthenticatedUser,
    leadId: string,
    dto: CreateCrmLeadActivityDto,
    requestContext?: AuditLogRequestContext,
  ) {
    this.assertAdminPermission(currentUser, CRM_LEAD_MANAGE_ANY_PERMISSION);
    await this.getLeadOrFail(leadId);
    const activity = await this.createActivity(currentUser.id, leadId, dto, requestContext);
    return this.toActivityResponse(activity);
  }

  async createEmployeeActivity(
    currentUser: AuthenticatedUser,
    leadId: string,
    dto: CreateCrmLeadActivityDto,
  ) {
    this.assertCrmEmployeePermission(currentUser, CRM_LEAD_UPDATE_ASSIGNED_PERMISSION);
    const lead = await this.getOwnedLeadOrFail(currentUser, leadId);
    if (lead.convertedClientProfileId || lead.status === CrmLeadStatus.WON) {
      throw new ConflictException("Converted CRM leads cannot receive employee activities.");
    }
    if (!this.isEmployeeAllowedActivityType(dto.type)) {
      throw new BadRequestException("CRM employees cannot create STATUS_CHANGE activities directly.");
    }
    const activity = await this.createActivity(currentUser.id, leadId, dto);
    return this.toActivityResponse(activity);
  }

  async convertAdminLead(
    currentUser: AuthenticatedUser,
    leadId: string,
    dto: ConvertCrmLeadDto,
    requestContext?: AuditLogRequestContext,
  ) {
    this.assertAdminPermission(currentUser, CRM_LEAD_CONVERT_PERMISSION);
    const lead = await this.getLeadOrFail(leadId);
    if (lead.convertedClientProfileId) {
      throw new ConflictException("CRM lead has already been converted.");
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const clientProfile = await tx.clientProfile.create({
          data: {
            companyName: dto.clientName ?? lead.companyName,
            slug: dto.slug ?? (await this.generateUniqueClientSlug(tx, lead.companyName)),
            contactEmail: lead.contactEmail,
            status: ClientStatus.ACTIVE,
          },
          select: convertedClientSelect,
        });

        const updatedLead = await tx.crmLead.update({
          where: { id: leadId },
          data: {
            status: CrmLeadStatus.WON,
            convertedClientProfileId: clientProfile.id,
          },
          select: leadDetailSelect,
        });

        await this.createStatusChangeActivity(
          tx,
          leadId,
          currentUser.id,
          lead.status,
          CrmLeadStatus.WON,
          "Lead müşteri kaydına dönüştürüldü.",
        );

        await this.auditLogService.record(
          {
            actorUserId: currentUser.id,
            action: CRM_LEAD_AUDIT_ACTIONS.converted,
            entityType: CRM_LEAD_ENTITY_TYPE,
            entityId: leadId,
            metadata: {
              convertedClientProfileId: clientProfile.id,
              previousStatus: lead.status,
              nextStatus: CrmLeadStatus.WON,
            },
            requestContext,
          },
          tx,
        );

        return {
          lead: this.toLeadDetailResponse(updatedLead),
          convertedClientProfile: clientProfile,
        };
      });

      return result;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Client profile slug is already in use.");
      }
      throw error;
    }
  }

  private async listLeads(
    where: Prisma.CrmLeadWhereInput,
    query: AdminCrmLeadQueryDto,
  ): Promise<ListResponse<LeadListResponse>> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const [total, leads] = await this.prisma.$transaction([
      this.prisma.crmLead.count({ where }),
      this.prisma.crmLead.findMany({
        where,
        select: leadListSelect,
        orderBy: this.buildOrderBy(query.sortBy, query.sortOrder),
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      data: leads.map((lead) => this.toLeadListResponse(lead)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private buildLeadWhere(query: AdminCrmLeadQueryDto): Prisma.CrmLeadWhereInput {
    const nextFollowUpAt = this.buildDateRange(query.nextFollowUpFrom, query.nextFollowUpTo);

    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerUserId ? { ownerUserId: query.ownerUserId } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(nextFollowUpAt ? { nextFollowUpAt } : {}),
      ...(query.search
        ? {
            OR: [
              { companyName: { contains: query.search, mode: "insensitive" } },
              { contactName: { contains: query.search, mode: "insensitive" } },
              { contactEmail: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } },
              { address: { contains: query.search, mode: "insensitive" } },
              { city: { contains: query.search, mode: "insensitive" } },
              { sector: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private buildDateRange(from?: string, to?: string): Prisma.DateTimeNullableFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  private buildOrderBy(
    sortBy: CrmLeadSortBy = "createdAt",
    sortOrder: Prisma.SortOrder = "desc",
  ): Prisma.CrmLeadOrderByWithRelationInput[] {
    return [{ [sortBy]: sortOrder }, { id: "asc" }];
  }

  private async getLeadOrFail(leadId: string): Promise<LeadDetailModel> {
    const lead = await this.prisma.crmLead.findUnique({
      where: { id: leadId },
      select: leadDetailSelect,
    });
    if (!lead) {
      throw new NotFoundException("CRM lead not found.");
    }
    return lead;
  }

  private async getOwnedLeadOrFail(
    currentUser: AuthenticatedUser,
    leadId: string,
  ): Promise<LeadDetailModel> {
    const lead = await this.prisma.crmLead.findFirst({
      where: { id: leadId, ownerUserId: currentUser.id },
      select: leadDetailSelect,
    });
    if (!lead) {
      throw new NotFoundException("CRM lead not found.");
    }
    return lead;
  }

  private async getActiveCrmOwnerOrFail(ownerUserId: string) {
    const owner = await this.prisma.user.findFirst({
      where: {
        id: ownerUserId,
        accountType: AccountType.EMPLOYEE,
        role: UserRole.CRM_SPECIALIST,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!owner) {
      throw new BadRequestException("CRM lead owner must be an active CRM specialist employee.");
    }
    return owner;
  }

  private async getNextActiveCrmOwnerOrFail() {
    const owner = await this.prisma.user.findFirst({
      where: {
        accountType: AccountType.EMPLOYEE,
        role: UserRole.CRM_SPECIALIST,
        status: UserStatus.ACTIVE,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    if (!owner) {
      throw new ServiceUnavailableException("No active CRM specialist is available.");
    }
    return owner;
  }

  private async createActivity(
    actorUserId: string,
    leadId: string,
    dto: CreateCrmLeadActivityDto,
    requestContext?: AuditLogRequestContext,
  ): Promise<ActivityModel> {
    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.crmLeadActivity.create({
        data: {
          leadId,
          actorUserId,
          type: dto.type,
          note: dto.note,
          nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt),
        },
        select: activitySelect,
      });

      if (dto.nextFollowUpAt !== undefined) {
        await tx.crmLead.update({
          where: { id: leadId },
          data: { nextFollowUpAt: this.toDateOrNull(dto.nextFollowUpAt) },
        });
      }

      await this.auditLogService.record(
        {
          actorUserId,
          action: CRM_LEAD_AUDIT_ACTIONS.activityCreated,
          entityType: CRM_LEAD_ENTITY_TYPE,
          entityId: leadId,
          metadata: {
            activityId: activity.id,
            type: activity.type,
          },
          requestContext,
        },
        tx,
      );

      return activity;
    });
  }

  private async createStatusChangeActivity(
    tx: Prisma.TransactionClient,
    leadId: string,
    actorUserId: string,
    fromStatus: CrmLeadStatus,
    toStatus: CrmLeadStatus,
    note?: string,
  ): Promise<void> {
    await tx.crmLeadActivity.create({
      data: {
        leadId,
        actorUserId,
        type: CrmLeadActivityType.STATUS_CHANGE,
        note: note ?? `Status changed from ${fromStatus} to ${toStatus}.`,
      },
    });
  }

  private async generateUniqueClientSlug(
    tx: Prisma.TransactionClient,
    companyName: string,
  ): Promise<string> {
    const baseSlug = this.slugify(companyName) || "crm-client";
    for (let index = 0; index < 25; index += 1) {
      const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
      const existing = await tx.clientProfile.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing) {
        return slug;
      }
    }
    return `${baseSlug}-${Date.now()}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80);
  }

  private buildWebsiteLeadInitialNote(dto: CreatePublicCrmLeadDto): string {
    const lines = [
      "Website iletişim formu üzerinden yeni lead geldi.",
      dto.serviceInterest ? `İlgilendiği hizmet: ${dto.serviceInterest}` : null,
      dto.budgetRange ? `Bütçe aralığı: ${dto.budgetRange}` : null,
      dto.goal ? `Hedef/brief: ${dto.goal}` : null,
      dto.sourcePath ? `Kaynak sayfa: ${dto.sourcePath}` : null,
    ];

    return lines.filter((line): line is string => Boolean(line)).join("\n");
  }

  private toDateOrNull(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }

  private assertAdminUpdatePayload(dto: UpdateCrmLeadDto): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("Provide at least one CRM lead field to update.");
    }
  }

  private assertEmployeeUpdatePayload(dto: UpdateAssignedCrmLeadDto): void {
    if (dto.status === undefined && dto.nextFollowUpAt === undefined) {
      throw new BadRequestException("Provide status and/or nextFollowUpAt to update a CRM lead.");
    }
  }

  private assertAdminPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can access admin CRM lead operations.");
    }
    this.assertHasPermission(currentUser, permission);
  }

  private assertCrmEmployeePermission(currentUser: AuthenticatedUser, permission: string): void {
    if (
      currentUser.accountType !== AccountType.EMPLOYEE ||
      currentUser.role !== UserRole.CRM_SPECIALIST
    ) {
      throw new ForbiddenException("Only CRM specialist employees can access CRM lead operations.");
    }
    this.assertHasPermission(currentUser, permission);
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (!currentUser.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private isEmployeeAllowedStatus(status: CrmLeadStatus): boolean {
    return EMPLOYEE_ALLOWED_STATUSES.includes(status as (typeof EMPLOYEE_ALLOWED_STATUSES)[number]);
  }

  private isEmployeeAllowedActivityType(type: CrmLeadActivityType): boolean {
    return EMPLOYEE_ALLOWED_ACTIVITY_TYPES.includes(
      type as (typeof EMPLOYEE_ALLOWED_ACTIVITY_TYPES)[number],
    );
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private toLeadListResponse(lead: LeadListModel): LeadListResponse {
    return {
      id: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      ownerUserId: lead.ownerUserId,
      convertedClientProfileId: lead.convertedClientProfileId,
      address: lead.address,
      city: lead.city,
      sector: lead.sector,
      website: lead.website,
      websiteStatus: lead.websiteStatus,
      websiteIssues: lead.websiteIssues,
      detectedPainPoints: lead.detectedPainPoints,
      recommendedServices: lead.recommendedServices,
      outreachAngle: lead.outreachAngle,
      emailSubject: lead.emailSubject,
      emailBody: lead.emailBody,
      whatsappMessage: lead.whatsappMessage,
      sourceQuery: lead.sourceQuery,
      sourceProvider: lead.sourceProvider,
      googleMapsUrl: lead.googleMapsUrl,
      googleRating: lead.googleRating,
      reviewCount: lead.reviewCount,
      instagramUrl: lead.instagramUrl,
      whatsappPhone: lead.whatsappPhone,
      leadScore: lead.leadScore,
      nextFollowUpAt: lead.nextFollowUpAt,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      owner: lead.ownerUser,
      convertedClientProfile: lead.convertedClientProfile,
      latestActivity: lead.activities[0] ? this.toActivityResponse(lead.activities[0]) : null,
    };
  }

  private toLeadDetailResponse(lead: LeadDetailModel): LeadDetailResponse {
    return {
      ...this.toLeadListResponse({ ...lead, activities: lead.activities.slice(0, 1) }),
      activities: lead.activities.map((activity) => this.toActivityResponse(activity)),
    };
  }

  private toActivityResponse(activity: ActivityModel): ActivityResponse {
    return {
      id: activity.id,
      leadId: activity.leadId,
      actorUserId: activity.actorUserId,
      type: activity.type,
      note: activity.note,
      nextFollowUpAt: activity.nextFollowUpAt,
      createdAt: activity.createdAt,
      actor: activity.actor,
    };
  }
}
