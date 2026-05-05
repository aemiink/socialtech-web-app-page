import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getProjects(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectsService.getProjects(currentUser, query);
  }

  @Get(":id")
  getProjectById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) projectId: string,
  ) {
    return this.projectsService.getProjectById(currentUser, projectId);
  }

  @Post()
  createProject(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(currentUser, dto);
  }

  @Patch(":id")
  updateProject(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(currentUser, projectId, dto);
  }

  @Get(":id/assignee-candidates")
  getProjectAssigneeCandidates(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) projectId: string,
  ) {
    return this.projectsService.getProjectAssigneeCandidates(currentUser, projectId);
  }
}
