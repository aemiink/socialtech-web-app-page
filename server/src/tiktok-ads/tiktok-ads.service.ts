import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountType, TikTokAdsConnectionStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UpdateTikTokAdsConfigDto } from "./dto/update-tiktok-ads-config.dto";

@Injectable()
export class TikTokAdsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Admin: get or create config for a client ───────────────────────────────

  async getAdminClientConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertAdmin(actor);
    await this.assertClientExists(clientId);
    return this.getOrCreateConfig(clientId);
  }

  async updateAdminClientConfig(
    clientId: string,
    dto: UpdateTikTokAdsConfigDto,
    actor: AuthenticatedUser,
  ) {
    this.assertAdmin(actor);
    await this.assertClientExists(clientId);

    const existing = await this.prisma.clientTikTokAdsConfig.findUnique({
      where: { clientProfileId: clientId },
    });

    if (existing) {
      return this.prisma.clientTikTokAdsConfig.update({
        where: { clientProfileId: clientId },
        data: dto,
      });
    }

    return this.prisma.clientTikTokAdsConfig.create({
      data: { clientProfileId: clientId, ...dto },
    });
  }

  // ─── Assigned employee: read config ─────────────────────────────────────────

  async getAssignedClientConfig(clientId: string, actor: AuthenticatedUser) {
    this.assertEmployee(actor);
    await this.assertActiveAssignment(clientId, actor.id);
    return this.getOrCreateConfig(clientId);
  }

  // ─── Own client: read minimal config ────────────────────────────────────────

  async getOwnClientConfig(actor: AuthenticatedUser) {
    if (actor.accountType !== AccountType.CLIENT || !actor.clientProfileId) {
      throw new ForbiddenException("Bu endpoint yalnızca müşteri hesapları içindir.");
    }
    const config = await this.prisma.clientTikTokAdsConfig.findUnique({
      where: { clientProfileId: actor.clientProfileId },
    });
    // Return minimal safe data for clients (no syncError details)
    if (!config) {
      return {
        connectionStatus: TikTokAdsConnectionStatus.NOT_CONNECTED,
        hasConfig: false,
      };
    }
    return {
      connectionStatus: config.connectionStatus,
      hasConfig: true,
      advertiserId: config.advertiserId ?? null,
      lastSyncAt: config.lastSyncAt ?? null,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async getOrCreateConfig(clientId: string) {
    const existing = await this.prisma.clientTikTokAdsConfig.findUnique({
      where: { clientProfileId: clientId },
    });
    if (existing) return existing;
    return this.prisma.clientTikTokAdsConfig.create({
      data: { clientProfileId: clientId },
    });
  }

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.clientProfile.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException("Müşteri bulunamadı.");
  }

  private async assertActiveAssignment(clientId: string, userId: string): Promise<void> {
    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: { clientProfileId: clientId, employeeUserId: userId, isActive: true },
    });
    if (!assignment) {
      throw new NotFoundException("Bu müşteriye erişim yetkiniz yok.");
    }
  }

  private assertAdmin(actor: AuthenticatedUser): void {
    if (
      actor.accountType !== AccountType.ADMIN ||
      actor.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException("Bu işlem yalnızca admin kullanıcılar içindir.");
    }
  }

  private assertEmployee(actor: AuthenticatedUser): void {
    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Bu endpoint yalnızca çalışan hesapları içindir.");
    }
  }
}
