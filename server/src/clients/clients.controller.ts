import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ClientQueryDto } from "./dto/client-query.dto";
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
  getClients(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ClientQueryDto,
  ) {
    return this.clientsService.getClients(currentUser, query);
  }

  @Get(":id/summary")
  getClientSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.getClientSummary(currentUser, clientId);
  }

  @Get(":id")
  getClientById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.getClientById(currentUser, clientId);
  }
}
