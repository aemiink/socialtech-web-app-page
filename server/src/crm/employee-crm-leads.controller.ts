import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CrmLeadsService } from "./crm-leads.service";
import { AdminCrmLeadQueryDto } from "./dto/admin-crm-lead-query.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { UpdateAssignedCrmLeadDto } from "./dto/update-assigned-crm-lead.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("crm/leads")
export class EmployeeCrmLeadsController {
  constructor(private readonly crmLeadsService: CrmLeadsService) {}

  @Get()
  @RequirePermissions("crm.leads.read.assigned")
  list(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: AdminCrmLeadQueryDto) {
    return this.crmLeadsService.listEmployeeLeads(currentUser, query);
  }

  @Get(":id")
  @RequirePermissions("crm.leads.read.assigned")
  detail(@CurrentUser() currentUser: AuthenticatedUser, @Param("id", ParseUUIDPipe) leadId: string) {
    return this.crmLeadsService.getEmployeeLead(currentUser, leadId);
  }

  @Patch(":id")
  @RequirePermissions("crm.leads.update.assigned")
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateAssignedCrmLeadDto,
  ) {
    return this.crmLeadsService.updateEmployeeLead(currentUser, leadId, dto);
  }

  @Post(":id/activities")
  @RequirePermissions("crm.leads.update.assigned")
  createActivity(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) leadId: string,
    @Body() dto: CreateCrmLeadActivityDto,
  ) {
    return this.crmLeadsService.createEmployeeActivity(currentUser, leadId, dto);
  }
}
