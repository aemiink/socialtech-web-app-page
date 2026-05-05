import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { CreateProjectFileFolderDto } from "./dto/create-project-file-folder.dto";
import { CreateProjectFileShareLinkDto } from "./dto/create-project-file-share-link.dto";
import { CreateUploadSignatureDto } from "./dto/create-upload-signature.dto";
import { ProjectFileQueryDto } from "./dto/project-file-query.dto";
import { ProjectFileShareLinkQueryDto } from "./dto/project-file-share-link-query.dto";
import { UpdateProjectFileFolderAssigneesDto } from "./dto/update-project-file-folder-assignees.dto";
import { UpdateProjectFileFolderDto } from "./dto/update-project-file-folder.dto";
import { ProjectFilesService } from "./project-files.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("projects/:projectId/files")
export class ProjectFilesController {
  constructor(private readonly projectFilesService: ProjectFilesService) {}

  @Post("upload-signature")
  createUploadSignature(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateUploadSignatureDto,
  ) {
    return this.projectFilesService.createUploadSignature(currentUser, projectId, dto);
  }

  @Post("complete-upload")
  completeUpload(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.projectFilesService.completeUpload(currentUser, projectId, dto);
  }

  @Get()
  getProjectFiles(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: ProjectFileQueryDto,
  ) {
    return this.projectFilesService.getProjectFiles(currentUser, projectId, query);
  }

  @Get("folders")
  getProjectFolders(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.projectFilesService.getProjectFolders(currentUser, projectId);
  }

  @Post("folders")
  createProjectFolder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateProjectFileFolderDto,
  ) {
    return this.projectFilesService.createProjectFolder(currentUser, projectId, dto);
  }

  @Get("folders/:folderId/assignees")
  getFolderAssignees(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("folderId", ParseUUIDPipe) folderId: string,
  ) {
    return this.projectFilesService.getFolderAssignees(currentUser, projectId, folderId);
  }

  @Put("folders/:folderId/assignees")
  updateFolderAssignees(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("folderId", ParseUUIDPipe) folderId: string,
    @Body() dto: UpdateProjectFileFolderAssigneesDto,
  ) {
    return this.projectFilesService.updateFolderAssignees(currentUser, projectId, folderId, dto);
  }

  @Get("share-links")
  getShareLinks(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: ProjectFileShareLinkQueryDto,
  ) {
    return this.projectFilesService.getShareLinks(currentUser, projectId, query);
  }

  @Get(":fileId")
  getProjectFileById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("fileId", ParseUUIDPipe) fileId: string,
  ) {
    return this.projectFilesService.getProjectFileById(currentUser, projectId, fileId);
  }

  @Delete(":fileId")
  deleteProjectFile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("fileId", ParseUUIDPipe) fileId: string,
  ) {
    return this.projectFilesService.deleteProjectFile(currentUser, projectId, fileId);
  }

  @Patch(":fileId/folder")
  updateProjectFileFolder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("fileId", ParseUUIDPipe) fileId: string,
    @Body() dto: UpdateProjectFileFolderDto,
  ) {
    return this.projectFilesService.updateProjectFileFolder(currentUser, projectId, fileId, dto);
  }

  @Post(":fileId/share-links")
  createShareLink(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("fileId", ParseUUIDPipe) fileId: string,
    @Body() dto: CreateProjectFileShareLinkDto,
  ) {
    return this.projectFilesService.createShareLink(currentUser, projectId, fileId, dto);
  }

  @Patch(":fileId/share-links/:shareId/revoke")
  revokeShareLink(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Param("fileId", ParseUUIDPipe) fileId: string,
    @Param("shareId", ParseUUIDPipe) shareId: string,
  ) {
    return this.projectFilesService.revokeShareLink(currentUser, projectId, fileId, shareId);
  }
}
