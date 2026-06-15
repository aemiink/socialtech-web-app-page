import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateAdminEmployeeUserDto } from "../users/dto/create-admin-employee-user.dto";
import { AdminUsersService } from "./admin-users.service";
import { AdminUserQueryDto } from "./dto/admin-user-query.dto";
import { ResetAdminUserPasswordDto } from "./dto/reset-admin-user-password.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("users.manage")
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  getAdminUsers(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: AdminUserQueryDto,
  ) {
    return this.adminUsersService.getAdminUsers(currentUser, query);
  }

  @Post()
  createEmployeeUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAdminEmployeeUserDto,
    @Req() request: Request,
  ) {
    return this.adminUsersService.createEmployeeUser(
      currentUser,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Get(":id")
  getAdminUserById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
  ) {
    return this.adminUsersService.getAdminUserById(currentUser, userId);
  }

  @Patch(":id")
  updateAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() request: Request,
  ) {
    return this.adminUsersService.updateAdminUser(
      currentUser,
      userId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/deactivate")
  deactivateAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    return this.adminUsersService.deactivateAdminUser(
      currentUser,
      userId,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/activate")
  activateAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    return this.adminUsersService.activateAdminUser(
      currentUser,
      userId,
      this.toAuditRequestContext(request),
    );
  }

  @Delete(":id")
  deleteAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    return this.adminUsersService.deleteAdminUser(
      currentUser,
      userId,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/reset-password")
  resetAdminUserPassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: ResetAdminUserPasswordDto,
    @Req() request: Request,
  ) {
    return this.adminUsersService.resetAdminUserPassword(
      currentUser,
      userId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  private toAuditRequestContext(request: Request): AuditLogRequestContext {
    return {
      ipAddress: request.ip ?? null,
      userAgent: request.get("user-agent") ?? null,
    };
  }
}
