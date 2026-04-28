import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ChangeOwnPasswordDto } from "./dto/change-own-password.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.getMe(currentUser);
  }

  @Patch("me/password")
  changeOwnPassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ChangeOwnPasswordDto,
  ) {
    return this.usersService.changeOwnPassword(currentUser, dto);
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
