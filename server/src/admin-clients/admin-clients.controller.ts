import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuditLogRequestContext } from "../audit-log/audit-log.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { AdminClientsService } from "./admin-clients.service";
import { AdminClientOwnerDto } from "./dto/admin-client-owner.dto";
import { CreateAdminClientDto } from "./dto/create-admin-client.dto";
import { ResetClientOwnerPasswordDto } from "./dto/reset-client-owner-password.dto";
import { UpdateAdminClientDto } from "./dto/update-admin-client.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("clients.manage")
@Controller("admin/clients")
export class AdminClientsController {
  constructor(private readonly adminClientsService: AdminClientsService) {}

  @Post()
  createAdminClient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAdminClientDto,
    @Req() request: Request,
  ) {
    return this.adminClientsService.createAdminClient(
      currentUser,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id")
  updateAdminClient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Body() dto: UpdateAdminClientDto,
    @Req() request: Request,
  ) {
    return this.adminClientsService.updateAdminClient(
      currentUser,
      clientProfileId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/deactivate")
  deactivateAdminClient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Req() request: Request,
  ) {
    return this.adminClientsService.deactivateAdminClient(
      currentUser,
      clientProfileId,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/activate")
  activateAdminClient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Req() request: Request,
  ) {
    return this.adminClientsService.activateAdminClient(
      currentUser,
      clientProfileId,
      this.toAuditRequestContext(request),
    );
  }

  @Delete(":id")
  deleteAdminClient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Req() request: Request,
  ) {
    return this.adminClientsService.deleteAdminClient(
      currentUser,
      clientProfileId,
      this.toAuditRequestContext(request),
    );
  }

  @Post(":id/owner")
  setAdminClientOwner(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Body() dto: AdminClientOwnerDto,
    @Req() request: Request,
  ) {
    return this.adminClientsService.setAdminClientOwner(
      currentUser,
      clientProfileId,
      dto,
      this.toAuditRequestContext(request),
    );
  }

  @Patch(":id/reset-owner-password")
  resetClientOwnerPassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) clientProfileId: string,
    @Body() dto: ResetClientOwnerPasswordDto,
    @Req() request: Request,
  ) {
    return this.adminClientsService.resetClientOwnerPassword(
      currentUser,
      clientProfileId,
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
