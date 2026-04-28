import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateAdminEmployeeUserDto } from "../users/dto/create-admin-employee-user.dto";
import { AdminUsersService } from "./admin-users.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @RequirePermissions("users.manage")
  createEmployeeUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAdminEmployeeUserDto,
  ) {
    return this.adminUsersService.createEmployeeUser(currentUser, dto);
  }
}
