import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { hasUserPermission, selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetProjectsQuery, useGetProjectRepositoryCommitsQuery, useGetProjectRepositoryPullsQuery, useGetProjectRepositoryQuery } from "../../features/projects/projectsApi";
import {
  formatDate,
  getPriorityBadgeClass,
  getPriorityLabel,
  getProjectClientName,
  getProjectServiceLabel,
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from "../../features/projects/projectsUtils";

export function Projeler() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadRepository = hasUserPermission(currentUser, [
    "integrations.github.read.any",
    "integrations.github.manage.any",
    "integrations.github.read.assigned",
  ]);
  const { data, isLoading, isError } = useGetProjectsQuery();
  const projects = data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
        Projeler yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Projeler alınamadı.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Projelerim</h1>
        <p className="text-[#A0A0A0]">Atandığınız projeler ve GitHub görünürlüğü</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Badge className={getProjectStatusBadgeClass(project.status)}>
                    {getProjectStatusLabel(project.status)}
                  </Badge>
                  <Badge className={getPriorityBadgeClass(project.priority)}>
                    {getPriorityLabel(project.priority)}
                  </Badge>
                  {project.serviceKey && (
                    <Badge variant="outline" className="border-[#AAFF01]/30 text-[#d2ff8a]">
                      {getProjectServiceLabel(project)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#A0A0A0]">{getProjectClientName(project)}</p>
                {project.description && (
                  <p className="mt-2 max-w-3xl text-sm text-[#D8D8D8]">{project.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-[#A0A0A0]">
                <p>Başlangıç: {formatDate(project.startDate)}</p>
                <p>Deadline: {formatDate(project.dueDate)}</p>
                <div className="mt-3">
                  <Button asChild type="button" size="sm" variant="outline">
                    <Link to={`/employee/projeler/${project.id}`}>Detay</Link>
                  </Button>
                </div>
              </div>
            </div>

            <ProjectGithubReadCard
              projectId={project.id}
              repositoryUrl={project.repositoryUrl}
              canReadRepository={canReadRepository}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectGithubReadCard({
  projectId,
  repositoryUrl,
  canReadRepository,
}: {
  projectId: string;
  repositoryUrl?: string | null;
  canReadRepository: boolean;
}) {
  const { data: repository } = useGetProjectRepositoryQuery(projectId, {
    skip: !canReadRepository || !repositoryUrl,
  });
  const { data: commits } = useGetProjectRepositoryCommitsQuery(
    { projectId },
    { skip: !canReadRepository || !repository },
  );
  const { data: pulls } = useGetProjectRepositoryPullsQuery(
    { projectId },
    { skip: !canReadRepository || !repository },
  );

  if (!canReadRepository) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/5 p-4 text-sm text-[#A0A0A0]">
        Bu rolde GitHub repository görünürlüğü bulunmuyor.
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/5 p-4 text-sm text-[#A0A0A0]">
        Bu projeye bağlı GitHub repository bulunmuyor.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/5 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">GitHub</Badge>
        <a
          href={repository.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#d8ff8f] underline-offset-2 hover:underline"
        >
          {repository.owner}/{repository.repo}
        </a>
        {repository.defaultBranch && (
          <Badge variant="outline" className="font-mono">
            {repository.defaultBranch}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#A0A0A0]">Recent Commits</p>
          <div className="space-y-2">
            {(commits ?? []).slice(0, 3).map((commit) => (
              <div key={commit.sha} className="rounded border border-white/[0.06] p-3 text-sm">
                <p className="font-medium">{commit.message}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">
                  {commit.shortSha} · {commit.githubAuthorLogin ?? commit.authorName ?? "Bilinmiyor"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[#A0A0A0]">Open PRs</p>
          <div className="space-y-2">
            {(pulls ?? []).slice(0, 3).map((pull) => (
              <div key={`${pull.number ?? pull.title}`} className="rounded border border-white/[0.06] p-3 text-sm">
                <p className="font-medium">{pull.title}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">
                  #{pull.number ?? "—"} · {pull.headRef ?? "—"} → {pull.baseRef ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
