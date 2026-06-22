import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { BillingService } from "./billing.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("clients.manage")
@Controller("admin/clients/:clientId/invoices")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  listInvoices(@Param("clientId", ParseUUIDPipe) clientId: string) {
    return this.billingService.listInvoices(clientId);
  }

  @Post()
  createInvoice(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.billingService.createInvoice(clientId, currentUser.id, dto);
  }

  @Patch(":invoiceId")
  updateInvoice(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Param("invoiceId", ParseUUIDPipe) invoiceId: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.billingService.updateInvoice(clientId, invoiceId, dto);
  }

  @Delete(":invoiceId")
  deleteInvoice(
    @Param("clientId", ParseUUIDPipe) clientId: string,
    @Param("invoiceId", ParseUUIDPipe) invoiceId: string,
  ) {
    return this.billingService.deleteInvoice(clientId, invoiceId);
  }
}
