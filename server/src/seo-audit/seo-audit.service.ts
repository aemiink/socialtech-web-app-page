import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateSeoAuditConfigDto } from './dto/update-seo-audit-config.dto';

@Injectable()
export class SeoAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertAdmin(actor);
    const config = await this.findOrCreateConfig(clientId);
    return this.formatConfig(config);
  }

  async updateAdminConfig(
    clientId: string,
    dto: UpdateSeoAuditConfigDto,
    actor: AuthenticatedUser,
  ) {
    this.assertAdmin(actor);
    await this.assertClientExists(clientId);

    const config = await this.prisma.clientSeoAuditConfig.upsert({
      where: { clientProfileId: clientId },
      create: {
        clientProfileId: clientId,
        ...this.sanitizeConfigDto(dto),
      },
      update: this.sanitizeConfigDto(dto),
    });

    return this.formatConfig(config);
  }

  async getAdminSummary(clientId: string, actor: AuthenticatedUser) {
    this.assertAdmin(actor);
    return this.buildSummary(clientId);
  }

  async getAssignedConfig(clientId: string, actor: AuthenticatedUser) {
    await this.assertAssignedEmployee(clientId, actor);
    const config = await this.findOrCreateConfig(clientId);
    return this.formatConfig(config);
  }

  async getAssignedSummary(clientId: string, actor: AuthenticatedUser) {
    await this.assertAssignedEmployee(clientId, actor);
    return this.buildSummary(clientId);
  }

  async getOwnClientConfig(actor: AuthenticatedUser) {
    const clientProfileId = this.assertClient(actor);
    const config = await this.findOrCreateConfig(clientProfileId);
    return this.formatConfig(config);
  }

  async getOwnClientSummary(actor: AuthenticatedUser) {
    const clientProfileId = this.assertClient(actor);
    return this.buildSummary(clientProfileId, { clientVisibleOnly: true });
  }

  private async buildSummary(
    clientProfileId: string,
    options: { clientVisibleOnly?: boolean } = {},
  ) {
    const taskWhere = options.clientVisibleOnly
      ? { OR: [{ visibility: 'CLIENT_VISIBLE' as const }, { approvalRequired: true as const }] }
      : {};
    const fileWhere = options.clientVisibleOnly
      ? { visibility: 'CLIENT_VISIBLE' as const }
      : {};

    const [config, projects, purchasedService] = await Promise.all([
      this.prisma.clientSeoAuditConfig.findUnique({
        where: { clientProfileId },
      }),
      this.prisma.project.findMany({
        where: {
          clientProfileId,
          serviceKey: 'SEO_AUDIT',
        },
        include: {
          tasks: {
            where: taskWhere,
            orderBy: { updatedAt: 'desc' },
            take: 20,
          },
          files: {
            where: fileWhere,
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clientPurchasedService.findFirst({
        where: {
          clientProfileId,
          serviceKey: 'SEO_AUDIT',
          status: 'ACTIVE',
        },
      }),
    ]);

    const allTasks = projects.flatMap((p) => p.tasks);
    const allFiles = projects.flatMap((p) => p.files);

    const taskStats = {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === 'TODO').length,
      inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      review: allTasks.filter((t) => t.status === 'REVIEW').length,
      done: allTasks.filter((t) => t.status === 'DONE').length,
      blocked: allTasks.filter((t) => t.status === 'BLOCKED').length,
    };

    const progressPercent =
      taskStats.total > 0
        ? Math.round((taskStats.done / taskStats.total) * 100)
        : 0;

    const recentTasks = [...allTasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.type,
        approvalStatus: t.approvalStatus,
        approvalRequired: t.approvalRequired,
        dueDate: t.dueDate?.toISOString() ?? null,
      }));

    const recentFiles = [...allFiles]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((f) => ({
        id: f.id,
        title: f.title,
        originalFileName: f.originalFileName,
        secureUrl: f.secureUrl,
        visibility: f.visibility,
        mimeType: f.mimeType,
        approvalStatus: f.approvalStatus,
        createdAt: f.createdAt.toISOString(),
      }));

    return {
      hasActiveService: !!purchasedService,
      config: config ? this.formatConfig(config) : null,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate?.toISOString() ?? null,
        dueDate: p.dueDate?.toISOString() ?? null,
        taskCount: p.tasks.length,
        fileCount: p.files.length,
      })),
      taskStats,
      progressPercent,
      recentTasks,
      recentFiles,
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  private async findOrCreateConfig(clientProfileId: string) {
    const existing = await this.prisma.clientSeoAuditConfig.findUnique({
      where: { clientProfileId },
    });
    if (existing) return existing;

    await this.assertClientExists(clientProfileId);
    return this.prisma.clientSeoAuditConfig.create({
      data: { clientProfileId },
    });
  }

  private formatConfig(config: {
    id: string;
    clientProfileId: string;
    siteUrl: string | null;
    gaPropertyId: string | null;
    searchConsolePropertyUrl: string | null;
    targetKeywords: string[];
    auditFrequency: string | null;
    lastAuditScore: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: config.id,
      clientProfileId: config.clientProfileId,
      siteUrl: config.siteUrl,
      gaPropertyId: config.gaPropertyId,
      searchConsolePropertyUrl: config.searchConsolePropertyUrl,
      targetKeywords: config.targetKeywords,
      auditFrequency: config.auditFrequency,
      lastAuditScore: config.lastAuditScore,
      notes: config.notes,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  private sanitizeConfigDto(dto: UpdateSeoAuditConfigDto) {
    return {
      ...(dto.siteUrl !== undefined && { siteUrl: dto.siteUrl }),
      ...(dto.gaPropertyId !== undefined && {
        gaPropertyId: dto.gaPropertyId,
      }),
      ...(dto.searchConsolePropertyUrl !== undefined && {
        searchConsolePropertyUrl: dto.searchConsolePropertyUrl,
      }),
      ...(dto.targetKeywords !== undefined && {
        targetKeywords: dto.targetKeywords,
      }),
      ...(dto.auditFrequency !== undefined && {
        auditFrequency: dto.auditFrequency,
      }),
      ...(dto.lastAuditScore !== undefined && {
        lastAuditScore: dto.lastAuditScore,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };
  }

  private assertAdmin(actor: AuthenticatedUser) {
    if (actor.accountType !== 'ADMIN' || actor.role !== 'ADMIN') {
      throw new ForbiddenException('Admin erişimi gereklidir.');
    }
  }

  private assertClient(actor: AuthenticatedUser): string {
    if (actor.accountType !== 'CLIENT' || !actor.clientProfileId) {
      throw new ForbiddenException('Müşteri erişimi gereklidir.');
    }
    return actor.clientProfileId;
  }

  private async assertAssignedEmployee(
    clientId: string,
    actor: AuthenticatedUser,
  ) {
    if (actor.accountType === 'ADMIN') return;

    if (actor.accountType !== 'EMPLOYEE') {
      throw new ForbiddenException('Erişim reddedildi.');
    }

    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: actor.id,
        clientProfileId: clientId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Müşteri bulunamadı.');
    }
  }

  private async assertClientExists(clientId: string) {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('Müşteri bulunamadı.');
    }
  }
}
