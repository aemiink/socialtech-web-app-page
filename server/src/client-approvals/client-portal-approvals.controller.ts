import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ClientApprovalsService } from "./client-approvals.service";
import { AcknowledgeClientApprovalDto } from "./dto/acknowledge-client-approval.dto";
import { ClientApprovalQueryDto } from "./dto/client-approval-query.dto";
import { RespondClientApprovalDto } from "./dto/respond-client-approval.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("approvals.respond.own")
@Controller("client/approvals")
export class ClientPortalApprovalsController {
  constructor(private readonly clientApprovalsService: ClientApprovalsService) {}

  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: ClientApprovalQueryDto) {
    return this.clientApprovalsService.listClientApprovals(currentUser, query);
  }

  @Get(":id")
  detail(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
  ) {
    return this.clientApprovalsService.getClientApprovalById(currentUser, approvalId);
  }

  @Post(":id/respond")
  respond(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
    @Body() dto: RespondClientApprovalDto,
    @Req() request: Request,
  ) {
    return this.clientApprovalsService.respondToClientApproval(
      currentUser,
      approvalId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Post(":id/acknowledge")
  acknowledge(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
    @Body() dto: AcknowledgeClientApprovalDto,
    @Req() request: Request,
  ) {
    return this.clientApprovalsService.acknowledgeClientApproval(
      currentUser,
      approvalId,
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
