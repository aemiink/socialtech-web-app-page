import { Link, useParams } from "react-router";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppSelector } from "../store/hooks";
import {
  hasAdminPermission,
  selectCurrentUser,
} from "../features/auth/authSelectors";
import { useGetProjectQuery } from "../features/projects/projectsApi";
import {
  extractApiErrorMessage,
  formatDate,
  formatDateTime,
  getPriorityBadgeClass,
  getPriorityLabel,
  getProjectClientName,
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
  isUuid,
} from "../features/projects/projectsUtils";

export function ProjectDetail() {
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadProjects = hasAdminPermission(currentUser, [
    "projects.read.any",
    "projects.manage.any",
    "projects.read",
  ]);

  const isValidId = typeof id === "string" && isUuid(id);

  const {
    data: project,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectQuery(id ?? "", {
    skip: !canReadProjects || !isValidId,
  });

  if (!canReadProjects) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link to="/projeler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz proje kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Proje detayı yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to="/projeler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Proje detayı yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/projeler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Proje kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/projeler">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
        </Link>
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{project.name}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">{getProjectClientName(project)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getProjectStatusBadgeClass(project.status)}>
              {getProjectStatusLabel(project.status)}
            </Badge>
            <Badge className={getPriorityBadgeClass(project.priority)}>
              {getPriorityLabel(project.priority)}
            </Badge>
          </div>
        </div>
        {project.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-[#D8D8D8]">{project.description}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Slug" value={project.slug} />
        <InfoCard label="Müşteri Profil ID" value={project.clientProfileId} mono />
        <InfoCard label="Başlangıç" value={formatDate(project.startDate)} />
        <InfoCard label="Deadline" value={formatDate(project.dueDate)} />
        <InfoCard label="Oluşturulma" value={formatDateTime(project.createdAt)} />
        <InfoCard label="Güncellenme" value={formatDateTime(project.updatedAt)} />
      </div>
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
        <FolderKanban className="h-4 w-4 text-[#AAFF01]" />
        {label}
      </div>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </Card>
  );
}
