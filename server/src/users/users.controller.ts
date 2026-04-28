import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.getMe(currentUser);
  }

  @Get()
  @RequirePermissions("users.read")
  getUsers(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.getUsers(currentUser);
  }

  @Get(":id")
  getUserById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.getUserById(currentUser, userId);
  }
}
