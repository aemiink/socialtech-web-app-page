import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
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
  ) {
    return this.adminUsersService.createEmployeeUser(currentUser, dto);
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
  ) {
    return this.adminUsersService.updateAdminUser(currentUser, userId, dto);
  }

  @Patch(":id/deactivate")
  deactivateAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
  ) {
    return this.adminUsersService.deactivateAdminUser(currentUser, userId);
  }

  @Patch(":id/activate")
  activateAdminUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
  ) {
    return this.adminUsersService.activateAdminUser(currentUser, userId);
  }

  @Patch(":id/reset-password")
  resetAdminUserPassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: ResetAdminUserPasswordDto,
  ) {
    return this.adminUsersService.resetAdminUserPassword(currentUser, userId, dto);
  }
}
