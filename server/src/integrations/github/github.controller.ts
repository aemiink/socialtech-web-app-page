import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { AuthenticatedUser } from "../../auth/types/authenticated-user.type";
import { ConnectProjectRepositoryDto } from "./dto/connect-project-repository.dto";
import { GithubQueryDto } from "./dto/github-query.dto";
import { GithubService } from "./github.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("projects/:projectId/repository")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Put()
  @RequirePermissions("integrations.github.manage.any")
  connectRepository(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: ConnectProjectRepositoryDto,
  ) {
    return this.githubService.connectRepository(currentUser, projectId, dto);
  }

  @Get()
  @RequirePermissions("integrations.github.read.assigned")
  getRepository(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.githubService.getRepository(currentUser, projectId);
  }

  @Delete()
  @RequirePermissions("integrations.github.manage.any")
  disconnectRepository(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
  ) {
    return this.githubService.disconnectRepository(currentUser, projectId);
  }

  @Get("branches")
  @RequirePermissions("integrations.github.read.assigned")
  getBranches(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: GithubQueryDto,
  ) {
    return this.githubService.getBranches(currentUser, projectId, query);
  }

  @Get("commits")
  @RequirePermissions("integrations.github.read.assigned")
  getCommits(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: GithubQueryDto,
  ) {
    return this.githubService.getCommits(currentUser, projectId, query);
  }

  @Get("pulls")
  @RequirePermissions("integrations.github.read.assigned")
  getPulls(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: GithubQueryDto,
  ) {
    return this.githubService.getPulls(currentUser, projectId, query);
  }

  @Get("workflows/runs")
  @RequirePermissions("integrations.github.read.assigned")
  getWorkflowRuns(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: GithubQueryDto,
  ) {
    return this.githubService.getWorkflowRuns(currentUser, projectId, query);
  }

  @Get("workflows/summary")
  @RequirePermissions("integrations.github.read.assigned")
  getWorkflowSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: GithubQueryDto,
  ) {
    return this.githubService.getWorkflowSummary(currentUser, projectId, query);
  }
}
