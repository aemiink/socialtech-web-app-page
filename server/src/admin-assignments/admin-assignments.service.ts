import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  ClientStatus,
  EmployeeClientAssignmentScope,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { AssignmentQueryDto } from "./dto/assignment-query.dto";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";

const employeeSummarySelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  accountType: true,
} satisfies Prisma.UserSelect;

const clientSummarySelect = {
  id: true,
  slug: true,
  companyName: true,
} satisfies Prisma.ClientProfileSelect;

const assignmentReadSelect = {
  id: true,
  employeeUserId: true,
  clientProfileId: true,
  scope: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  employeeUser: {
    select: employeeSummarySelect,
  },
  clientProfile: {
    select: clientSummarySelect,
  },
} satisfies Prisma.EmployeeClientAssignmentSelect;

type AssignmentReadModel = Prisma.EmployeeClientAssignmentGetPayload<{
  select: typeof assignmentReadSelect;
}>;

type AssignmentResponse = {
  id: string;
  employeeUserId: string;
  clientProfileId: string;
  scope: EmployeeClientAssignmentScope;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employee: {
    id: string;
    email: string;
    displayName: string | null;
    role: UserRole;
    accountType: AccountType;
  };
  client: {
    id: string;
    slug: string;
    name: string;
  };
};

type AssignmentIdentity = {
  employeeUserId: string;
  clientProfileId: string;
  scope: EmployeeClientAssignmentScope;
};

type AssignmentState = AssignmentIdentity & {
  isActive: boolean;
};

const ASSIGNMENTS_READ_PERMISSION = "assignments.read";
const ASSIGNMENTS_MANAGE_PERMISSION = "assignments.manage";

@Injectable()
export class AdminAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignments(
    currentUser: AuthenticatedUser,
    query: AssignmentQueryDto,
  ): Promise<AssignmentResponse[]> {
    this.assertCanReadAssignments(currentUser);

    const where: Prisma.EmployeeClientAssignmentWhereInput = {
      employeeUser: { deletedAt: null },
      clientProfile: { deletedAt: null },
      ...(query.employeeUserId ? { employeeUserId: query.employeeUserId } : {}),
      ...(query.clientProfileId ? { clientProfileId: query.clientProfileId } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.scope ? { scope: query.scope } : {}),
    };

    const assignments = await this.prisma.employeeClientAssignment.findMany({
      where,
      select: assignmentReadSelect,
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((assignment) => this.toAssignmentResponse(assignment));
  }

  async createAssignment(
    currentUser: AuthenticatedUser,
    dto: CreateAssignmentDto,
  ): Promise<AssignmentResponse> {
    this.assertCanManageAssignments(currentUser);

    await this.assertEmployeeExists(dto.employeeUserId);
    await this.assertClientProfileExists(dto.clientProfileId);

    const existingAssignment = await this.findAssignmentByIdentity(dto);
    if (existingAssignment?.isActive) {
      throw new ConflictException("Active assignment already exists for employee, client, and scope.");
    }

    if (existingAssignment) {
      const reactivatedAssignment = await this.prisma.employeeClientAssignment.update({
        where: { id: existingAssignment.id },
        data: { isActive: true },
        select: assignmentReadSelect,
      });

      return this.toAssignmentResponse(reactivatedAssignment);
    }

    try {
      const createdAssignment = await this.prisma.employeeClientAssignment.create({
        data: {
          employeeUserId: dto.employeeUserId,
          clientProfileId: dto.clientProfileId,
          scope: dto.scope,
          isActive: true,
        },
        select: assignmentReadSelect,
      });

      return this.toAssignmentResponse(createdAssignment);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          "Active assignment already exists for employee, client, and scope.",
        );
      }

      throw error;
    }
  }

  async updateAssignment(
    currentUser: AuthenticatedUser,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponse> {
    this.assertCanManageAssignments(currentUser);
    this.assertHasUpdatePayload(dto);

    const assignment = await this.getAssignmentIdentityOrFail(assignmentId);
    const nextIsActive = dto.isActive ?? assignment.isActive;
    if (dto.scope && dto.scope !== assignment.scope) {
      await this.assertScopeUpdateDoesNotDuplicate(assignmentId, {
        employeeUserId: assignment.employeeUserId,
        clientProfileId: assignment.clientProfileId,
        scope: dto.scope,
      });
    }
    if (nextIsActive) {
      await this.assertAssignmentCanBeActive(assignment);
    }

    try {
      const updatedAssignment = await this.prisma.employeeClientAssignment.update({
        where: { id: assignmentId },
        data: {
          ...(dto.scope ? { scope: dto.scope } : {}),
          ...(dto.isActive === undefined ? {} : { isActive: dto.isActive }),
        },
        select: assignmentReadSelect,
      });

      return this.toAssignmentResponse(updatedAssignment);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          "Active assignment already exists for employee, client, and scope.",
        );
      }

      throw error;
    }
  }

  async deactivateAssignment(
    currentUser: AuthenticatedUser,
    assignmentId: string,
  ): Promise<AssignmentResponse> {
    this.assertCanManageAssignments(currentUser);

    const assignment = await this.getAssignmentOrFail(assignmentId);
    if (!assignment.isActive) {
      return this.toAssignmentResponse(assignment);
    }

    const deactivatedAssignment = await this.prisma.employeeClientAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false },
      select: assignmentReadSelect,
    });

    return this.toAssignmentResponse(deactivatedAssignment);
  }

  async activateAssignment(
    currentUser: AuthenticatedUser,
    assignmentId: string,
  ): Promise<AssignmentResponse> {
    this.assertCanManageAssignments(currentUser);

    const assignment = await this.getAssignmentOrFail(assignmentId);
    if (assignment.isActive) {
      return this.toAssignmentResponse(assignment);
    }
    await this.assertAssignmentCanBeActive(assignment);

    const activatedAssignment = await this.prisma.employeeClientAssignment.update({
      where: { id: assignmentId },
      data: { isActive: true },
      select: assignmentReadSelect,
    });

    return this.toAssignmentResponse(activatedAssignment);
  }

  private async assertEmployeeExists(employeeUserId: string): Promise<void> {
    const employee = await this.prisma.user.findFirst({
      where: {
        id: employeeUserId,
        accountType: AccountType.EMPLOYEE,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!employee) {
      throw new BadRequestException("Employee user not found, inactive, or not an employee account.");
    }
  }

  private async assertClientProfileExists(clientProfileId: string): Promise<void> {
    const clientProfile = await this.prisma.clientProfile.findFirst({
      where: {
        id: clientProfileId,
        status: ClientStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!clientProfile) {
      throw new BadRequestException("Client profile not found or inactive.");
    }
  }

  private async assertAssignmentCanBeActive(identity: {
    employeeUserId: string;
    clientProfileId: string;
  }): Promise<void> {
    await this.assertEmployeeExists(identity.employeeUserId);
    await this.assertClientProfileExists(identity.clientProfileId);
  }

  private async findAssignmentByIdentity(identity: AssignmentIdentity): Promise<{
    id: string;
    isActive: boolean;
  } | null> {
    return this.prisma.employeeClientAssignment.findUnique({
      where: {
        employeeUserId_clientProfileId_scope: {
          employeeUserId: identity.employeeUserId,
          clientProfileId: identity.clientProfileId,
          scope: identity.scope,
        },
      },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  private async getAssignmentIdentityOrFail(assignmentId: string): Promise<AssignmentState> {
    const assignment = await this.prisma.employeeClientAssignment.findUnique({
      where: { id: assignmentId },
      select: {
        employeeUserId: true,
        clientProfileId: true,
        scope: true,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException("Assignment not found.");
    }

    return assignment;
  }

  private async getAssignmentOrFail(assignmentId: string): Promise<AssignmentReadModel> {
    const assignment = await this.prisma.employeeClientAssignment.findUnique({
      where: { id: assignmentId },
      select: assignmentReadSelect,
    });

    if (!assignment) {
      throw new NotFoundException("Assignment not found.");
    }

    return assignment;
  }

  private async assertScopeUpdateDoesNotDuplicate(
    assignmentId: string,
    identity: AssignmentIdentity,
  ): Promise<void> {
    const duplicateAssignment = await this.findAssignmentByIdentity(identity);
    if (!duplicateAssignment || duplicateAssignment.id === assignmentId) {
      return;
    }

    if (duplicateAssignment.isActive) {
      throw new ConflictException("Active assignment already exists for employee, client, and scope.");
    }

    throw new ConflictException("Inactive assignment already exists for employee, client, and scope.");
  }

  private assertHasUpdatePayload(dto: UpdateAssignmentDto): void {
    if (dto.scope === undefined && dto.isActive === undefined) {
      throw new BadRequestException("Provide scope and/or isActive to update an assignment.");
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
    );
  }

  private assertCanReadAssignments(currentUser: AuthenticatedUser): void {
    this.assertAdmin(currentUser);
    this.assertHasPermission(currentUser, ASSIGNMENTS_READ_PERMISSION);
  }

  private assertCanManageAssignments(currentUser: AuthenticatedUser): void {
    this.assertAdmin(currentUser);
    this.assertHasPermission(currentUser, ASSIGNMENTS_MANAGE_PERMISSION);
  }

  private assertAdmin(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can manage employee-client assignments.");
    }
  }

  private assertHasPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (!currentUser.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private toAssignmentResponse(assignment: AssignmentReadModel): AssignmentResponse {
    return {
      id: assignment.id,
      employeeUserId: assignment.employeeUserId,
      clientProfileId: assignment.clientProfileId,
      scope: assignment.scope,
      isActive: assignment.isActive,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      employee: {
        id: assignment.employeeUser.id,
        email: assignment.employeeUser.email,
        displayName: assignment.employeeUser.displayName,
        role: assignment.employeeUser.role,
        accountType: assignment.employeeUser.accountType,
      },
      client: {
        id: assignment.clientProfile.id,
        slug: assignment.clientProfile.slug,
        name: assignment.clientProfile.companyName,
      },
    };
  }
}
