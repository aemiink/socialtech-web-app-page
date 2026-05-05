import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateMeetingRequestDto } from "./dto/create-meeting-request.dto";
import { CreateWeeklyReportDto } from "./dto/create-weekly-report.dto";
import { CreateWorkspaceContentItemDto } from "./dto/create-workspace-content-item.dto";
import { CreateWorkspaceMessageDto } from "./dto/create-workspace-message.dto";
import { CreateWorkspaceRevisionDto } from "./dto/create-workspace-revision.dto";
import { CreateWorkspaceSectionDto } from "./dto/create-workspace-section.dto";
import { UpdateMeetingRequestDto } from "./dto/update-meeting-request.dto";
import { UpdateWorkspaceContentItemDto } from "./dto/update-workspace-content-item.dto";
import { UpdateWorkspaceRevisionStatusDto } from "./dto/update-workspace-revision-status.dto";
import { UpdateWorkspaceSectionDto } from "./dto/update-workspace-section.dto";
import { WorkspaceQueryDto } from "./dto/workspace-query.dto";
import { WebAppWorkspaceService } from "./web-app-workspace.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("projects/:projectId/web-app-workspace")
export class WebAppWorkspaceController {
  constructor(private readonly workspaceService: WebAppWorkspaceService) {}

  @Get()
  getWorkspace(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: WorkspaceQueryDto,
  ) {
    return this.workspaceService.getWorkspace(currentUser, projectId, query);
  }

  @Post("sections")
  createSection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateWorkspaceSectionDto,
  ) {
    return this.workspaceService.createSection(currentUser, projectId, dto);
  }

  @Patch("sections/:sectionId")
  updateSection(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("sectionId", ParseUUIDPipe) sectionId: string,
    @Body() dto: UpdateWorkspaceSectionDto,
  ) {
    return this.workspaceService.updateSection(currentUser, projectId, sectionId, dto);
  }

  @Post("sections/:sectionId/items")
  createContentItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("sectionId", ParseUUIDPipe) sectionId: string,
    @Body() dto: CreateWorkspaceContentItemDto,
  ) {
    return this.workspaceService.createContentItem(currentUser, projectId, sectionId, dto);
  }

  @Patch("items/:itemId")
  updateContentItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateWorkspaceContentItemDto,
  ) {
    return this.workspaceService.updateContentItem(currentUser, projectId, itemId, dto);
  }

  @Get("messages")
  getMessages(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: WorkspaceQueryDto,
  ) {
    return this.workspaceService.getMessages(currentUser, projectId, query);
  }

  @Post("messages")
  createMessage(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateWorkspaceMessageDto,
  ) {
    return this.workspaceService.createMessage(currentUser, projectId, dto);
  }

  @Get("revisions")
  getRevisions(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.workspaceService.getRevisions(currentUser, projectId);
  }

  @Post("revisions")
  createRevision(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateWorkspaceRevisionDto,
  ) {
    return this.workspaceService.createRevision(currentUser, projectId, dto);
  }

  @Patch("revisions/:revisionId/status")
  updateRevisionStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("revisionId", ParseUUIDPipe) revisionId: string,
    @Body() dto: UpdateWorkspaceRevisionStatusDto,
  ) {
    return this.workspaceService.updateRevisionStatus(currentUser, projectId, revisionId, dto);
  }

  @Get("weekly-reports")
  getWeeklyReports(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.workspaceService.getWeeklyReports(currentUser, projectId);
  }

  @Post("weekly-reports")
  createWeeklyReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateWeeklyReportDto,
  ) {
    return this.workspaceService.createWeeklyReport(currentUser, projectId, dto);
  }

  @Get("meeting-requests")
  getMeetingRequests(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.workspaceService.getMeetingRequests(currentUser, projectId);
  }

  @Post("meeting-requests")
  createMeetingRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateMeetingRequestDto,
  ) {
    return this.workspaceService.createMeetingRequest(currentUser, projectId, dto);
  }

  @Patch("meeting-requests/:meetingRequestId")
  updateMeetingRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("meetingRequestId", ParseUUIDPipe) meetingRequestId: string,
    @Body() dto: UpdateMeetingRequestDto,
  ) {
    return this.workspaceService.updateMeetingRequest(currentUser, projectId, meetingRequestId, dto);
  }
}
