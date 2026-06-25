import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { WebAppWorkspaceService } from "./web-app-workspace.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("web-app-workspace")
export class WebAppWorkspaceInboxController {
  constructor(private readonly workspaceService: WebAppWorkspaceService) {}

  @Get("message-inbox")
  getMessageInbox(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.workspaceService.getAssignedMessageInbox(currentUser);
  }
}
