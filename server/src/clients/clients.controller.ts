import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ClientsService } from "./clients.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get("me")
  getMyClientProfile(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.clientsService.getMyClientProfile(currentUser);
  }

  @Get()
  getClients(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.clientsService.getClients(currentUser);
  }

  @Get(":id")
  getClientById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.getClientById(currentUser, clientId);
  }
}
