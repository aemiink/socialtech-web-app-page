import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AdminAssignmentsService } from "./admin-assignments.service";
import { AssignmentQueryDto } from "./dto/assignment-query.dto";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/assignments")
export class AdminAssignmentsController {
  constructor(private readonly adminAssignmentsService: AdminAssignmentsService) {}

  @Get()
  @RequirePermissions("assignments.read")
  getAssignments(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: AssignmentQueryDto,
  ) {
    return this.adminAssignmentsService.getAssignments(currentUser, query);
  }

  @Post()
  @RequirePermissions("assignments.manage")
  createAssignment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.adminAssignmentsService.createAssignment(currentUser, dto);
  }

  @Patch(":id")
  @RequirePermissions("assignments.manage")
  updateAssignment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.adminAssignmentsService.updateAssignment(currentUser, assignmentId, dto);
  }

  @Patch(":id/deactivate")
  @RequirePermissions("assignments.manage")
  deactivateAssignment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) assignmentId: string,
  ) {
    return this.adminAssignmentsService.deactivateAssignment(currentUser, assignmentId);
  }

  @Patch(":id/activate")
  @RequirePermissions("assignments.manage")
  activateAssignment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) assignmentId: string,
  ) {
    return this.adminAssignmentsService.activateAssignment(currentUser, assignmentId);
  }
}
