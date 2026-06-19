import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateWebMobileDesignConfigDto } from './dto/update-web-mobile-design-config.dto';

@Injectable()
export class WebMobileDesignService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertAdmin(actor);
    const config = await this.findOrCreateConfig(clientId);
    return this.formatConfig(config);
  }

  async updateAdminConfig(
    clientId: string,
    dto: UpdateWebMobileDesignConfigDto,
    actor: AuthenticatedUser,
  ) {
    this.assertAdmin(actor);
    await this.assertClientExists(clientId);

    const config = await this.prisma.clientWebMobileDesignConfig.upsert({
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
    const fileWhere = options.clientVisibleOnly ? { visibility: 'CLIENT_VISIBLE' as const } : {};

    const [config, projects, purchasedService] = await Promise.all([
      this.prisma.clientWebMobileDesignConfig.findUnique({
        where: { clientProfileId },
      }),
      this.prisma.project.findMany({
        where: {
          clientProfileId,
          serviceKey: 'WEB_MOBILE_DESIGN',
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
          serviceKey: 'WEB_MOBILE_DESIGN',
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

    const approvalStats = {
      total: allTasks.filter((t) => t.approvalRequired).length,
      pending: allTasks.filter(
        (t) => t.approvalRequired && t.approvalStatus === 'PENDING',
      ).length,
      approved: allTasks.filter(
        (t) =>
          t.approvalRequired &&
          (t.approvalStatus === 'APPROVED' || t.approvalStatus === 'ACKNOWLEDGED'),
      ).length,
    };

    const revisionCount = allTasks.filter((t) => t.type === 'REVISION').length;

    const progressPercent =
      taskStats.total > 0
        ? Math.round((taskStats.done / taskStats.total) * 100)
        : 0;

    const recentTasks = [...allTasks]
      .sort((a, b) =>
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
      .sort((a, b) =>
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
        figmaProjectUrl: p.figmaProjectUrl ?? null,
        startDate: p.startDate?.toISOString() ?? null,
        dueDate: p.dueDate?.toISOString() ?? null,
        taskCount: p.tasks.length,
        fileCount: p.files.length,
      })),
      taskStats,
      approvalStats,
      revisionCount,
      progressPercent,
      recentTasks,
      recentFiles,
      meta: { generatedAt: new Date().toISOString() },
    };
  }

  private async findOrCreateConfig(clientProfileId: string) {
    const existing = await this.prisma.clientWebMobileDesignConfig.findUnique({
      where: { clientProfileId },
    });
    if (existing) return existing;

    await this.assertClientExists(clientProfileId);
    return this.prisma.clientWebMobileDesignConfig.create({
      data: { clientProfileId },
    });
  }

  private formatConfig(config: {
    id: string;
    clientProfileId: string;
    figmaFileUrl: string | null;
    prototypeUrl: string | null;
    styleGuideUrl: string | null;
    designSystemStatus: string;
    primaryColor: string | null;
    secondaryColor: string | null;
    fontFamily: string | null;
    targetPlatforms: string[];
    gridSystem: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: config.id,
      clientProfileId: config.clientProfileId,
      figmaFileUrl: config.figmaFileUrl,
      prototypeUrl: config.prototypeUrl,
      styleGuideUrl: config.styleGuideUrl,
      designSystemStatus: config.designSystemStatus,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      fontFamily: config.fontFamily,
      targetPlatforms: config.targetPlatforms,
      gridSystem: config.gridSystem,
      notes: config.notes,
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  private sanitizeConfigDto(dto: UpdateWebMobileDesignConfigDto) {
    return {
      ...(dto.figmaFileUrl !== undefined && { figmaFileUrl: dto.figmaFileUrl }),
      ...(dto.prototypeUrl !== undefined && { prototypeUrl: dto.prototypeUrl }),
      ...(dto.styleGuideUrl !== undefined && { styleGuideUrl: dto.styleGuideUrl }),
      ...(dto.designSystemStatus !== undefined && {
        designSystemStatus: dto.designSystemStatus,
      }),
      ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
      ...(dto.secondaryColor !== undefined && {
        secondaryColor: dto.secondaryColor,
      }),
      ...(dto.fontFamily !== undefined && { fontFamily: dto.fontFamily }),
      ...(dto.targetPlatforms !== undefined && {
        targetPlatforms: dto.targetPlatforms,
      }),
      ...(dto.gridSystem !== undefined && { gridSystem: dto.gridSystem }),
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
