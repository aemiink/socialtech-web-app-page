import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  AccountType,
  ClientStatus,
  ProjectStatus,
  TaskStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";

export const ADMIN_SUMMARY_READ_PERMISSION = "admin.summary.read";

type AdminSummaryResponse = {
  users: {
    total: number;
    active: number;
    inactive: number;
    employees: number;
    clients: number;
    admins: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    blocked: number;
  };
  auditLogs: {
    total: number;
    lastActionAt: Date | null;
  };
  meta: {
    generatedAt: Date;
  };
};

@Injectable()
export class AdminSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminSummary(currentUser: AuthenticatedUser): Promise<AdminSummaryResponse> {
    this.assertCanReadSummary(currentUser);

    const generatedAt = new Date();
    const [
      usersTotal,
      usersActive,
      usersInactive,
      usersEmployees,
      usersClients,
      usersAdmins,
      clientsTotal,
      clientsActive,
      clientsInactive,
      projectsTotal,
      projectsPlanned,
      projectsInProgress,
      projectsReview,
      projectsCompleted,
      projectsOnHold,
      tasksTotal,
      tasksTodo,
      tasksInProgress,
      tasksReview,
      tasksDone,
      tasksBlocked,
      auditLogsTotal,
      latestAuditLog,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { deletedAt: null, status: UserStatus.INACTIVE } }),
      this.prisma.user.count({ where: { deletedAt: null, accountType: AccountType.EMPLOYEE } }),
      this.prisma.user.count({ where: { deletedAt: null, accountType: AccountType.CLIENT } }),
      this.prisma.user.count({ where: { deletedAt: null, accountType: AccountType.ADMIN } }),
      this.prisma.clientProfile.count({ where: { deletedAt: null } }),
      this.prisma.clientProfile.count({ where: { deletedAt: null, status: ClientStatus.ACTIVE } }),
      this.prisma.clientProfile.count({ where: { deletedAt: null, status: ClientStatus.INACTIVE } }),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: ProjectStatus.PLANNED } }),
      this.prisma.project.count({ where: { status: ProjectStatus.IN_PROGRESS } }),
      this.prisma.project.count({ where: { status: ProjectStatus.REVIEW } }),
      this.prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
      this.prisma.project.count({ where: { status: ProjectStatus.ON_HOLD } }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: TaskStatus.TODO } }),
      this.prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { status: TaskStatus.REVIEW } }),
      this.prisma.task.count({ where: { status: TaskStatus.DONE } }),
      this.prisma.task.count({ where: { status: TaskStatus.BLOCKED } }),
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findFirst({
        select: { createdAt: true },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      }),
    ]);

    return {
      users: {
        total: usersTotal,
        active: usersActive,
        inactive: usersInactive,
        employees: usersEmployees,
        clients: usersClients,
        admins: usersAdmins,
      },
      clients: {
        total: clientsTotal,
        active: clientsActive,
        inactive: clientsInactive,
      },
      projects: {
        total: projectsTotal,
        planned: projectsPlanned,
        inProgress: projectsInProgress,
        review: projectsReview,
        completed: projectsCompleted,
        onHold: projectsOnHold,
      },
      tasks: {
        total: tasksTotal,
        todo: tasksTodo,
        inProgress: tasksInProgress,
        review: tasksReview,
        done: tasksDone,
        blocked: tasksBlocked,
      },
      auditLogs: {
        total: auditLogsTotal,
        lastActionAt: latestAuditLog?.createdAt ?? null,
      },
      meta: {
        generatedAt,
      },
    };
  }

  private assertCanReadSummary(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can read admin summary.");
    }

    if (!currentUser.permissions.includes(ADMIN_SUMMARY_READ_PERMISSION)) {
      throw new ForbiddenException(
        `Missing required permission: ${ADMIN_SUMMARY_READ_PERMISSION}.`,
      );
    }
  }
}
