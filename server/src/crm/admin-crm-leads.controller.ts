import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CrmLeadsService } from "./crm-leads.service";
import { AdminCrmLeadQueryDto } from "./dto/admin-crm-lead-query.dto";
import { ConvertCrmLeadDto } from "./dto/convert-crm-lead.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/crm/leads")
export class AdminCrmLeadsController {
  constructor(private readonly crmLeadsService: CrmLeadsService) {}

  @Get()
  @RequirePermissions("crm.leads.read.any")
  list(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: AdminCrmLeadQueryDto) {
    return this.crmLeadsService.listAdminLeads(currentUser, query);
  }

  @Post()
  @RequirePermissions("crm.leads.manage.any")
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCrmLeadDto,
    @Req() request: Request,
  ) {
    return this.crmLeadsService.createAdminLead(
      currentUser,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Get(":id")
  @RequirePermissions("crm.leads.read.any")
  detail(@CurrentUser() currentUser: AuthenticatedUser, @Param("id", ParseUUIDPipe) leadId: string) {
    return this.crmLeadsService.getAdminLead(currentUser, leadId);
  }

  @Patch(":id")
  @RequirePermissions("crm.leads.manage.any")
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) leadId: string,
    @Body() dto: UpdateCrmLeadDto,
    @Req() request: Request,
  ) {
    return this.crmLeadsService.updateAdminLead(
      currentUser,
      leadId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Post(":id/activities")
  @RequirePermissions("crm.leads.manage.any")
  createActivity(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) leadId: string,
    @Body() dto: CreateCrmLeadActivityDto,
    @Req() request: Request,
  ) {
    return this.crmLeadsService.createAdminActivity(
      currentUser,
      leadId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Post(":id/convert")
  @RequirePermissions("crm.leads.convert")
  convert(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) leadId: string,
    @Body() dto: ConvertCrmLeadDto,
    @Req() request: Request,
  ) {
    return this.crmLeadsService.convertAdminLead(
      currentUser,
      leadId,
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
