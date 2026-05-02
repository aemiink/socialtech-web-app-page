import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CrmLeadsService } from "./crm-leads.service";
import { CreatePublicCrmLeadDto } from "./dto/create-public-crm-lead.dto";

@Controller("public/crm/leads")
export class PublicCrmLeadsController {
  constructor(private readonly crmLeadsService: CrmLeadsService) {}

  @Post()
  create(@Body() dto: CreatePublicCrmLeadDto, @Req() request: Request) {
    return this.crmLeadsService.createPublicWebsiteLead(
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
