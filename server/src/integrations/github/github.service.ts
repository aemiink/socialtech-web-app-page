import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountType, EmployeeClientAssignmentScope, Prisma, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../../auth/types/authenticated-user.type";
import { PrismaService } from "../../database/prisma.service";
import { ConnectProjectRepositoryDto } from "./dto/connect-project-repository.dto";
import { GithubQueryDto } from "./dto/github-query.dto";
import { GithubClientService } from "./github-client.service";
import { GithubTokenService } from "./github-token.service";

const projectSummarySelect = {
  id: true,
  clientProfileId: true,
  name: true,
  slug: true,
  status: true,
  priority: true,
  clientProfile: {
    select: {
      id: true,
      slug: true,
      companyName: true,
    },
  },
} satisfies Prisma.ProjectSelect;

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubClientService: GithubClientService,
    private readonly githubTokenService: GithubTokenService,
    private readonly configService: ConfigService,
  ) {}

  async connectRepository(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: ConnectProjectRepositoryDto,
  ) {
    this.assertCanManageRepositories(currentUser);
    const project = await this.assertProjectVisibleForAdmin(projectId);
    const resolvedToken = dto.accessToken?.trim() || this.getGlobalToken();
    const repositoryMeta = await this.fetchRepositoryMeta(dto.owner, dto.repo, resolvedToken);
    const repositoryUrl =
      dto.repositoryUrl?.trim() ||
      this.readString(repositoryMeta.html_url) ||
      `https://github.com/${dto.owner}/${dto.repo}`;
    const defaultBranch =
      dto.defaultBranch ?? this.readString(repositoryMeta.default_branch) ?? null;

    const result = await this.prisma.projectRepository.upsert({
      where: { projectId: project.id },
      update: {
        provider: "GITHUB",
        owner: dto.owner,
        repo: dto.repo,
        repositoryUrl,
        defaultBranch,
        installationId: dto.installationId ?? undefined,
        accessTokenEnc: dto.accessToken ? this.githubTokenService.encrypt(dto.accessToken) : undefined,
        accessTokenHash: dto.accessToken ? this.githubTokenService.hash(dto.accessToken) : undefined,
        isActive: dto.isActive ?? true,
      },
      create: {
        projectId: project.id,
        provider: "GITHUB",
        owner: dto.owner,
        repo: dto.repo,
        repositoryUrl,
        defaultBranch,
        installationId: dto.installationId ?? null,
        accessTokenEnc: dto.accessToken ? this.githubTokenService.encrypt(dto.accessToken) : null,
        accessTokenHash: dto.accessToken ? this.githubTokenService.hash(dto.accessToken) : null,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        projectId: true,
        provider: true,
        owner: true,
        repo: true,
        repositoryUrl: true,
        defaultBranch: true,
        installationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        project: { select: projectSummarySelect },
      },
    });

    return result;
  }

  async getRepository(currentUser: AuthenticatedUser, projectId: string) {
    await this.assertCanReadRepository(currentUser, projectId);
    const repository = await this.prisma.projectRepository.findUnique({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        provider: true,
        owner: true,
        repo: true,
        repositoryUrl: true,
        defaultBranch: true,
        installationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        project: { select: projectSummarySelect },
      },
    });

    if (!repository) {
      throw new NotFoundException("Project repository not found.");
    }

    return repository;
  }

  async disconnectRepository(currentUser: AuthenticatedUser, projectId: string) {
    this.assertCanManageRepositories(currentUser);
    await this.assertProjectVisibleForAdmin(projectId);

    const repository = await this.prisma.projectRepository.findUnique({
      where: { projectId },
      select: { id: true },
    });
    if (!repository) {
      throw new NotFoundException("Project repository not found.");
    }

    await this.prisma.projectRepository.update({
      where: { projectId },
      data: {
        isActive: false,
        accessTokenEnc: null,
        accessTokenHash: null,
      },
    });

    return { success: true };
  }

  async getBranches(currentUser: AuthenticatedUser, projectId: string, query: GithubQueryDto) {
    const repository = await this.getRepositoryWithDecryptedToken(currentUser, projectId);
    const result = (await this.githubClientService.getBranches(
      repository.owner,
      repository.repo,
      {
        per_page: query.perPage ?? 20,
      },
      repository.accessToken,
    )) as Array<Record<string, unknown>>;

    return result
      .map((branch) => ({
        name: typeof branch.name === "string" ? branch.name : "unknown",
        protected: Boolean(branch.protected),
        commitSha:
          branch.commit && typeof branch.commit === "object" && branch.commit && "sha" in branch.commit
            ? String((branch.commit as Record<string, unknown>).sha)
            : null,
        commitUrl:
          branch.commit && typeof branch.commit === "object" && branch.commit && "url" in branch.commit
            ? String((branch.commit as Record<string, unknown>).url)
            : null,
        htmlUrl: `${repository.repositoryUrl}/tree/${String(branch.name ?? "")}`,
      }))
      .filter((branch) => (query.protected === undefined ? true : branch.protected === query.protected));
  }

  async getCommits(currentUser: AuthenticatedUser, projectId: string, query: GithubQueryDto) {
    const repository = await this.getRepositoryWithDecryptedToken(currentUser, projectId);
    const result = (await this.githubClientService.getCommits(
      repository.owner,
      repository.repo,
      {
        sha: query.branch,
        since: query.since,
        until: query.until,
        per_page: query.perPage ?? 20,
      },
      repository.accessToken,
    )) as Array<Record<string, unknown>>;

    return result.map((commit) => {
      const sha = typeof commit.sha === "string" ? commit.sha : "";
      const commitPayload =
        commit.commit && typeof commit.commit === "object"
          ? (commit.commit as Record<string, unknown>)
          : {};
      const authorPayload =
        commitPayload.author && typeof commitPayload.author === "object"
          ? (commitPayload.author as Record<string, unknown>)
          : {};
      const githubAuthor =
        commit.author && typeof commit.author === "object"
          ? (commit.author as Record<string, unknown>)
          : {};

      return {
        sha,
        shortSha: sha.slice(0, 7),
        message: typeof commitPayload.message === "string" ? commitPayload.message : "",
        authorName: typeof authorPayload.name === "string" ? authorPayload.name : null,
        authorEmail: typeof authorPayload.email === "string" ? authorPayload.email : null,
        githubAuthorLogin: typeof githubAuthor.login === "string" ? githubAuthor.login : null,
        committedAt: typeof authorPayload.date === "string" ? authorPayload.date : null,
        htmlUrl:
          typeof commit.html_url === "string" ? commit.html_url : `${repository.repositoryUrl}/commit/${sha}`,
        branch: query.branch ?? repository.defaultBranch ?? null,
      };
    });
  }

  async getPulls(currentUser: AuthenticatedUser, projectId: string, query: GithubQueryDto) {
    const repository = await this.getRepositoryWithDecryptedToken(currentUser, projectId);
    const result = (await this.githubClientService.getPulls(
      repository.owner,
      repository.repo,
      {
        state: query.state ?? "open",
        per_page: query.perPage ?? 20,
      },
      repository.accessToken,
    )) as Array<Record<string, unknown>>;

    return result.map((pull) => {
      const user = pull.user && typeof pull.user === "object" ? (pull.user as Record<string, unknown>) : {};
      const head = pull.head && typeof pull.head === "object" ? (pull.head as Record<string, unknown>) : {};
      const base = pull.base && typeof pull.base === "object" ? (pull.base as Record<string, unknown>) : {};
      return {
        number: typeof pull.number === "number" ? pull.number : null,
        title: typeof pull.title === "string" ? pull.title : "",
        state: typeof pull.state === "string" ? pull.state : "open",
        merged: Boolean(pull.merged_at),
        authorLogin: typeof user.login === "string" ? user.login : null,
        headRef: typeof head.ref === "string" ? head.ref : null,
        baseRef: typeof base.ref === "string" ? base.ref : null,
        createdAt: typeof pull.created_at === "string" ? pull.created_at : null,
        updatedAt: typeof pull.updated_at === "string" ? pull.updated_at : null,
        htmlUrl: typeof pull.html_url === "string" ? pull.html_url : null,
      };
    });
  }

  async getWorkflowRuns(currentUser: AuthenticatedUser, projectId: string, query: GithubQueryDto) {
    const repository = await this.getRepositoryWithDecryptedToken(currentUser, projectId);
    const result = (await this.githubClientService.getWorkflowRuns(
      repository.owner,
      repository.repo,
      {
        branch: query.branch,
        status: query.status,
        per_page: query.perPage ?? 20,
      },
      repository.accessToken,
    )) as { workflow_runs?: Array<Record<string, unknown>> };

    return (result.workflow_runs ?? []).map((run) => ({
      id: typeof run.id === "number" ? run.id : null,
      name: typeof run.name === "string" ? run.name : null,
      status: typeof run.status === "string" ? run.status : null,
      conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
      branch: typeof run.head_branch === "string" ? run.head_branch : null,
      event: typeof run.event === "string" ? run.event : null,
      runNumber: typeof run.run_number === "number" ? run.run_number : null,
      createdAt: typeof run.created_at === "string" ? run.created_at : null,
      updatedAt: typeof run.updated_at === "string" ? run.updated_at : null,
      htmlUrl: typeof run.html_url === "string" ? run.html_url : null,
    }));
  }

  async getWorkflowSummary(currentUser: AuthenticatedUser, projectId: string, query: GithubQueryDto) {
    const runs = await this.getWorkflowRuns(currentUser, projectId, {
      ...query,
      perPage: query.perPage ?? 20,
    });

    const statusCounts = runs.reduce<Record<string, number>>((acc, run) => {
      const key = run.status ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const conclusionCounts = runs.reduce<Record<string, number>>((acc, run) => {
      const key = run.conclusion ?? "pending";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const latestRun = runs[0] ?? null;
    const lastSuccessfulRun =
      runs.find((run) => run.conclusion === "success") ?? null;

    const overallStatus =
      !latestRun
        ? "no_runs"
        : latestRun.status !== "completed"
          ? "in_progress"
          : latestRun.conclusion === "success"
            ? "healthy"
            : latestRun.conclusion === "failure" || latestRun.conclusion === "cancelled"
              ? "failing"
              : "unknown";

    return {
      overallStatus,
      totalRuns: runs.length,
      statusCounts,
      conclusionCounts,
      latestRun,
      lastSuccessfulRun,
    };
  }

  async getCommitsForSummary(currentUser: AuthenticatedUser, projectId: string) {
    return this.getCommits(currentUser, projectId, { perPage: 3 } as GithubQueryDto);
  }

  async getPullsForSummary(currentUser: AuthenticatedUser, projectId: string) {
    return this.getPulls(currentUser, projectId, { perPage: 3, state: "open" } as GithubQueryDto);
  }

  async assertActiveRepositoryConfigured(currentUser: AuthenticatedUser, projectId: string) {
    const repository = await this.getRepositoryWithDecryptedToken(currentUser, projectId);
    return {
      id: repository.id,
      projectId: repository.projectId,
      owner: repository.owner,
      repo: repository.repo,
      repositoryUrl: repository.repositoryUrl,
      defaultBranch: repository.defaultBranch,
    };
  }

  private async getRepositoryWithDecryptedToken(currentUser: AuthenticatedUser, projectId: string) {
    await this.assertCanReadRepository(currentUser, projectId);
    const repository = await this.prisma.projectRepository.findUnique({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        owner: true,
        repo: true,
        repositoryUrl: true,
        defaultBranch: true,
        accessTokenEnc: true,
        isActive: true,
      },
    });
    if (!repository || !repository.isActive) {
      throw new NotFoundException("Project repository not found.");
    }

    return {
      ...repository,
      accessToken: repository.accessTokenEnc
        ? this.githubTokenService.decrypt(repository.accessTokenEnc)
        : this.getGlobalToken(),
    };
  }

  private async fetchRepositoryMeta(owner: string, repo: string, accessToken?: string | null) {
    if (!owner || !repo) {
      throw new BadRequestException("Repository owner and repo are required.");
    }

    return (await this.githubClientService.getRepository(owner, repo, accessToken)) as Record<
      string,
      unknown
    >;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private getGlobalToken(): string | null {
    const token = this.configService.get<string>("GITHUB_GLOBAL_TOKEN")?.trim();
    return token && token.length > 0 ? token : null;
  }

  private async assertProjectVisibleForAdmin(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return project;
  }

  private async assertCanReadRepository(currentUser: AuthenticatedUser, projectId: string) {
    if (this.isAdmin(currentUser)) {
      this.assertHasPermission(currentUser, "integrations.github.read.any");
      await this.assertProjectVisibleForAdmin(projectId);
      return;
    }

    if (!this.isEmployee(currentUser)) {
      throw new ForbiddenException("Clients cannot access GitHub repository data.");
    }

    this.assertHasPermission(currentUser, "integrations.github.read.assigned");

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        clientProfile: {
          employeeAssignments: {
            some: {
              employeeUserId: currentUser.id,
              isActive: true,
              scope: {
                in: [
                  EmployeeClientAssignmentScope.PROJECT,
                  EmployeeClientAssignmentScope.DEVELOPMENT,
                ],
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException("Project not found.");
    }
  }

  private assertCanManageRepositories(currentUser: AuthenticatedUser) {
    if (!this.isAdmin(currentUser)) {
      throw new ForbiddenException("Only admin users can manage project repositories.");
    }
    this.assertHasPermission(currentUser, "integrations.github.manage.any");
  }

  private assertHasPermission(
    currentUser: AuthenticatedUser,
    permission: string,
    fallbackPermission?: string,
  ) {
    if (currentUser.permissions.includes(permission)) {
      return;
    }
    if (fallbackPermission && currentUser.permissions.includes(fallbackPermission)) {
      return;
    }
    throw new ForbiddenException(`Missing required permission: ${permission}.`);
  }

  private isAdmin(currentUser: AuthenticatedUser) {
    return currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN;
  }

  private isEmployee(currentUser: AuthenticatedUser) {
    return currentUser.accountType === AccountType.EMPLOYEE;
  }
}
