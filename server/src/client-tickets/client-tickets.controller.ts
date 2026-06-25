import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ClientTicketsService } from "./client-tickets.service";
import { CreateClientTicketMessageDto } from "./dto/create-client-ticket-message.dto";
import { CreateClientTicketDto } from "./dto/create-client-ticket.dto";
import { ListClientTicketsDto } from "./dto/list-client-tickets.dto";
import { UpdateClientTicketDto } from "./dto/update-client-ticket.dto";

@UseGuards(JwtAuthGuard)
@Controller("clients/me/tickets")
export class ClientOwnTicketsController {
  constructor(private readonly ticketsService: ClientTicketsService) {}

  @Get()
  listOwnTickets(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListClientTicketsDto) {
    return this.ticketsService.listOwnTickets(actor, query);
  }

  @Post()
  createOwnTicket(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateClientTicketDto) {
    return this.ticketsService.createOwnTicket(actor, dto);
  }

  @Post(":ticketId/messages")
  addOwnTicketMessage(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("ticketId", ParseUUIDPipe) ticketId: string,
    @Body() dto: CreateClientTicketMessageDto,
  ) {
    return this.ticketsService.addOwnTicketMessage(actor, ticketId, dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller("tickets")
export class WorkforceTicketsController {
  constructor(private readonly ticketsService: ClientTicketsService) {}

  @Get("inbox")
  listAssignedTicketInbox(@CurrentUser() actor: AuthenticatedUser) {
    return this.ticketsService.listAssignedTicketInbox(actor);
  }

  @Get("clients/:clientId")
  listAssignedClientTickets(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Query() query: ListClientTicketsDto,
  ) {
    return this.ticketsService.listAssignedClientTickets(actor, clientId, query);
  }

  @Post(":ticketId/messages")
  addAssignedTicketMessage(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("ticketId", ParseUUIDPipe) ticketId: string,
    @Body() dto: CreateClientTicketMessageDto,
  ) {
    return this.ticketsService.addAssignedTicketMessage(actor, ticketId, dto);
  }

  @Patch(":ticketId")
  updateAssignedTicket(
    @CurrentUser() actor: AuthenticatedUser,
    @Param("ticketId", ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateClientTicketDto,
  ) {
    return this.ticketsService.updateAssignedTicket(actor, ticketId, dto);
  }
}
