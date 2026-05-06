import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { ClientApprovalsService } from "./client-approvals.service";
import { CancelClientApprovalDto } from "./dto/cancel-client-approval.dto";
import { ClientApprovalQueryDto } from "./dto/client-approval-query.dto";
import { CreateClientApprovalDto } from "./dto/create-client-approval.dto";
import { UpdateClientApprovalDto } from "./dto/update-client-approval.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("client-approvals")
export class ClientApprovalsController {
  constructor(private readonly clientApprovalsService: ClientApprovalsService) {}

  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUser, @Query() query: ClientApprovalQueryDto) {
    return this.clientApprovalsService.listInternalApprovals(currentUser, query);
  }

  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateClientApprovalDto,
    @Req() request: Request,
  ) {
    return this.clientApprovalsService.createInternalApproval(
      currentUser,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Get(":id")
  detail(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
  ) {
    return this.clientApprovalsService.getInternalApprovalById(currentUser, approvalId);
  }

  @Patch(":id")
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
    @Body() dto: UpdateClientApprovalDto,
    @Req() request: Request,
  ) {
    return this.clientApprovalsService.updateInternalApproval(
      currentUser,
      approvalId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/cancel")
  cancel(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) approvalId: string,
    @Body() dto: CancelClientApprovalDto,
    @Req() request: Request,
  ) {
    return this.clientApprovalsService.cancelInternalApproval(
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
