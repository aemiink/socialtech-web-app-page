import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  ClientTicketStatus,
  Prisma,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  UserRole,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CreateClientTicketMessageDto } from "./dto/create-client-ticket-message.dto";
import { CreateClientTicketDto } from "./dto/create-client-ticket.dto";
import { ListClientTicketsDto } from "./dto/list-client-tickets.dto";
import { UpdateClientTicketDto } from "./dto/update-client-ticket.dto";

const ticketMessageSelect = {
  id: true,
  ticketId: true,
  authorUserId: true,
  body: true,
  isInternal: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      displayName: true,
      role: true,
      accountType: true,
    },
  },
} satisfies Prisma.ClientTicketMessageSelect;

@Injectable()
export class ClientTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async listOwnTickets(actor: AuthenticatedUser, query: ListClientTicketsDto) {
    const clientProfileId = this.assertClient(actor);
    return this.listTicketsForClient(clientProfileId, query, false);
  }

  async createOwnTicket(actor: AuthenticatedUser, dto: CreateClientTicketDto) {
    const clientProfileId = this.assertClient(actor);
    const resolvedScope = await this.resolveTicketScope(clientProfileId, dto.projectId, dto.serviceKey);

    const ticket = await this.prisma.clientTicket.create({
      data: {
        clientProfileId,
        projectId: resolvedScope.projectId,
        serviceKey: resolvedScope.serviceKey,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? "MEDIUM",
        createdByUserId: actor.id,
        lastMessageAt: new Date(),
        messages: {
          create: {
            authorUserId: actor.id,
            body: dto.description,
          },
        },
      },
      select: this.ticketSelect(false),
    });

    return ticket;
  }

  async addOwnTicketMessage(
    actor: AuthenticatedUser,
    ticketId: string,
    dto: CreateClientTicketMessageDto,
  ) {
    if (dto.isInternal) {
      throw new ForbiddenException("Müşteri ticket mesajı internal olamaz.");
    }
    const clientProfileId = this.assertClient(actor);
    await this.getTicketForClientOrFail(ticketId, clientProfileId);
    await this.addTicketMessage(ticketId, actor.id, dto.body, false, "CLIENT");
    return this.getTicketForClientOrFail(ticketId, clientProfileId, false);
  }

  async listAssignedClientTickets(
    actor: AuthenticatedUser,
    clientProfileId: string,
    query: ListClientTicketsDto,
  ) {
    await this.assertAssignedClientAccess(actor, clientProfileId);
    return this.listTicketsForClient(clientProfileId, query, true);
  }

  async listAssignedTicketInbox(actor: AuthenticatedUser) {
    if (actor.accountType === AccountType.CLIENT) {
      throw new ForbiddenException("Müşteri hesabı workforce ticket inbox okuyamaz.");
    }

    const where: Prisma.ClientTicketWhereInput = {};
    if (!(actor.accountType === AccountType.ADMIN && actor.role === UserRole.ADMIN)) {
      if (actor.accountType !== AccountType.EMPLOYEE) {
        throw new ForbiddenException("Çalışan erişimi gereklidir.");
      }
      where.clientProfile = {
        employeeAssignments: {
          some: {
            employeeUserId: actor.id,
            isActive: true,
          },
        },
      };
    }

    return this.prisma.clientTicket.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { lastMessageAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: this.ticketSelect(true),
    });
  }

  async addAssignedTicketMessage(
    actor: AuthenticatedUser,
    ticketId: string,
    dto: CreateClientTicketMessageDto,
  ) {
    const ticket = await this.getTicketForWorkforceOrFail(actor, ticketId);
    await this.addTicketMessage(ticket.id, actor.id, dto.body, dto.isInternal ?? false, "WORKFORCE");
    return this.getTicketForWorkforceOrFail(actor, ticketId);
  }

  async updateAssignedTicket(
    actor: AuthenticatedUser,
    ticketId: string,
    dto: UpdateClientTicketDto,
  ) {
    const ticket = await this.getTicketForWorkforceOrFail(actor, ticketId);
    this.assertCanUpdateTicket(actor);

    const status = dto.status ?? ticket.status;
    const now = new Date();

    return this.prisma.clientTicket.update({
      where: { id: ticket.id },
      data: {
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.status !== undefined
          ? {
              status,
              resolvedAt: status === ClientTicketStatus.RESOLVED ? now : null,
              closedAt: status === ClientTicketStatus.CLOSED ? now : null,
            }
          : {}),
      },
      select: this.ticketSelect(true),
    });
  }

  private async listTicketsForClient(
    clientProfileId: string,
    query: ListClientTicketsDto,
    includeInternalMessages: boolean,
  ) {
    return this.prisma.clientTicket.findMany({
      where: {
        clientProfileId,
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.serviceKey ? { serviceKey: query.serviceKey } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { lastMessageAt: "desc" }, { createdAt: "desc" }],
      select: this.ticketSelect(includeInternalMessages),
    });
  }

  private async resolveTicketScope(
    clientProfileId: string,
    projectId?: string,
    serviceKey?: PurchasedServiceKey,
  ): Promise<{ projectId: string | null; serviceKey: PurchasedServiceKey | null }> {
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, clientProfileId },
        select: { id: true, serviceKey: true },
      });
      if (!project) {
        throw new BadRequestException("Ticket projesi bu müşteriye ait değil.");
      }
      return {
        projectId: project.id,
        serviceKey: serviceKey ?? project.serviceKey ?? null,
      };
    }

    if (serviceKey) {
      const purchasedService = await this.prisma.clientPurchasedService.findFirst({
        where: {
          clientProfileId,
          serviceKey,
          status: PurchasedServiceStatus.ACTIVE,
        },
        select: { id: true },
      });
      if (!purchasedService) {
        throw new BadRequestException("Bu hizmet müşteri için aktif değil.");
      }
    }

    return { projectId: null, serviceKey: serviceKey ?? null };
  }

  private async addTicketMessage(
    ticketId: string,
    authorUserId: string,
    body: string,
    isInternal: boolean,
    authorScope: "CLIENT" | "WORKFORCE",
  ) {
    const nextStatus =
      authorScope === "CLIENT"
        ? ClientTicketStatus.IN_PROGRESS
        : ClientTicketStatus.WAITING_CLIENT;

    await this.prisma.$transaction([
      this.prisma.clientTicketMessage.create({
        data: {
          ticketId,
          authorUserId,
          body,
          isInternal,
        },
      }),
      this.prisma.clientTicket.update({
        where: { id: ticketId },
        data: {
          lastMessageAt: new Date(),
          status: nextStatus,
          resolvedAt: null,
          closedAt: null,
        },
      }),
    ]);
  }

  private async getTicketForClientOrFail(
    ticketId: string,
    clientProfileId: string,
    includeInternalMessages = false,
  ) {
    const ticket = await this.prisma.clientTicket.findFirst({
      where: { id: ticketId, clientProfileId },
      select: this.ticketSelect(includeInternalMessages),
    });
    if (!ticket) {
      throw new NotFoundException("Ticket bulunamadı.");
    }
    return ticket;
  }

  private async getTicketForWorkforceOrFail(actor: AuthenticatedUser, ticketId: string) {
    const ticketScope = await this.prisma.clientTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, clientProfileId: true, status: true },
    });
    if (!ticketScope) {
      throw new NotFoundException("Ticket bulunamadı.");
    }

    await this.assertAssignedClientAccess(actor, ticketScope.clientProfileId);

    const ticket = await this.prisma.clientTicket.findUnique({
      where: { id: ticketId },
      select: this.ticketSelect(true),
    });
    if (!ticket) {
      throw new NotFoundException("Ticket bulunamadı.");
    }
    return ticket;
  }

  private ticketSelect(includeInternalMessages: boolean): Prisma.ClientTicketSelect {
    const messages = includeInternalMessages
      ? {
          select: ticketMessageSelect,
          orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
        }
      : {
          where: { isInternal: false },
          select: ticketMessageSelect,
          orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
        };

    return {
      id: true,
      clientProfileId: true,
      projectId: true,
      serviceKey: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdByUserId: true,
      lastMessageAt: true,
      resolvedAt: true,
      closedAt: true,
      createdAt: true,
      updatedAt: true,
      clientProfile: {
        select: {
          id: true,
          companyName: true,
          slug: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          serviceKey: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          displayName: true,
          role: true,
          accountType: true,
        },
      },
      messages,
    };
  }

  private assertClient(actor: AuthenticatedUser): string {
    if (actor.accountType !== AccountType.CLIENT || !actor.clientProfileId) {
      throw new ForbiddenException("Müşteri erişimi gereklidir.");
    }
    return actor.clientProfileId;
  }

  private async assertAssignedClientAccess(actor: AuthenticatedUser, clientProfileId: string) {
    if (actor.accountType === AccountType.ADMIN && actor.role === UserRole.ADMIN) {
      return;
    }

    if (actor.accountType !== AccountType.EMPLOYEE) {
      throw new ForbiddenException("Çalışan erişimi gereklidir.");
    }

    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: actor.id,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }
  }

  private assertCanUpdateTicket(actor: AuthenticatedUser) {
    if (actor.accountType === AccountType.ADMIN && actor.role === UserRole.ADMIN) {
      return;
    }
    if (actor.accountType === AccountType.EMPLOYEE && actor.role === UserRole.PROJECT_MANAGER) {
      return;
    }
    throw new ForbiddenException("Ticket durumunu yalnızca PM veya admin güncelleyebilir.");
  }
}
