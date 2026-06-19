import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateTechnicalSupportConfigDto } from './dto/update-technical-support-config.dto';

@Injectable()
export class TechnicalSupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertAdmin(actor);
    const config = await this.findOrCreateConfig(clientId);
    return this.formatConfig(config);
  }

  async updateAdminConfig(
    clientId: string,
    dto: UpdateTechnicalSupportConfigDto,
    actor: AuthenticatedUser,
  ) {
    this.assertAdmin(actor);
    await this.assertClientExists(clientId);

    const config = await this.prisma.clientTechnicalSupportConfig.upsert({
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
      this.prisma.clientTechnicalSupportConfig.findUnique({
        where: { clientProfileId },
      }),
      this.prisma.project.findMany({
        where: {
          clientProfileId,
          serviceKey: 'TECHNICAL_SUPPORT',
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
          serviceKey: 'TECHNICAL_SUPPORT',
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

    const openTicketCount = allTasks.filter((t) => t.status !== 'DONE').length;
    const resolvedTicketCount = allTasks.filter((t) => t.status === 'DONE').length;

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
      openTicketCount,
      resolvedTicketCount,
      progressPercent,
      recentTasks,
      recentFiles,
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  private async findOrCreateConfig(clientProfileId: string) {
    const existing =
      await this.prisma.clientTechnicalSupportConfig.findUnique({
        where: { clientProfileId },
      });
    if (existing) return existing;

    await this.assertClientExists(clientProfileId);
    return this.prisma.clientTechnicalSupportConfig.create({
      data: { clientProfileId },
    });
  }

  private formatConfig(config: {
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
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: config.id,
      clientProfileId: config.clientProfileId,
      slaLevel: config.slaLevel,
      supportPortalUrl: config.supportPortalUrl,
      maintenanceWindowDay: config.maintenanceWindowDay,
      maintenanceWindowTime: config.maintenanceWindowTime,
      monitoringEnabled: config.monitoringEnabled,
      backupFrequency: config.backupFrequency,
      uptimeTarget: config.uptimeTarget,
      notes: config.notes,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  private sanitizeConfigDto(dto: UpdateTechnicalSupportConfigDto) {
    return {
      ...(dto.slaLevel !== undefined && { slaLevel: dto.slaLevel }),
      ...(dto.supportPortalUrl !== undefined && {
        supportPortalUrl: dto.supportPortalUrl,
      }),
      ...(dto.maintenanceWindowDay !== undefined && {
        maintenanceWindowDay: dto.maintenanceWindowDay,
      }),
      ...(dto.maintenanceWindowTime !== undefined && {
        maintenanceWindowTime: dto.maintenanceWindowTime,
      }),
      ...(dto.monitoringEnabled !== undefined && {
        monitoringEnabled: dto.monitoringEnabled,
      }),
      ...(dto.backupFrequency !== undefined && {
        backupFrequency: dto.backupFrequency,
      }),
      ...(dto.uptimeTarget !== undefined && { uptimeTarget: dto.uptimeTarget }),
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
