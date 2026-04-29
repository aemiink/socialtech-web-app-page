import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FolderKanban,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useGetClientSummaryQuery } from "../features/clients/clientsApi";
import type {
  ClientSummaryRecentProject,
  ClientSummaryRecentTask,
} from "../features/clients/clientsTypes";
import {
  extractApiErrorMessage,
  formatClientDate,
  formatClientDateTime,
  getClientPriorityBadgeClass,
  getClientPriorityLabel,
  getClientProjectStatusBadgeClass,
  getClientProjectStatusLabel,
  getClientStatusBadgeClass,
  getClientStatusLabel,
  getClientTaskStatusBadgeClass,
  getClientTaskStatusLabel,
  isNotFoundError,
  isUuid,
} from "../features/clients/clientsUtils";

export function ClientDetail() {
  const { id } = useParams();
  const clientProfileId = typeof id === "string" && isUuid(id) ? id : null;
  const isValidId = clientProfileId !== null;

  const {
    data: summary,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetClientSummaryQuery(clientProfileId ?? "", {
    skip: !isValidId,
  });

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz müşteri kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Müşteri özeti yükleniyor...
      </Card>
    );
  }

  if (isError && isNotFoundError(error)) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Müşteri kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(error, "Müşteri özeti yüklenemedi. Lütfen tekrar deneyin.")}
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Müşteri kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  const { client, projects, tasks } = summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <BackButton />
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">{client.name}</h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">Backend Clients Summary API müşteri özeti</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getClientStatusBadgeClass(client.status)}>
              {getClientStatusLabel(client.status)}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {client.slug}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<Building2 className="h-5 w-5 text-[#AAFF01]" />} label="Firma" value={client.name} />
        <InfoCard icon={<ExternalLink className="h-5 w-5 text-[#AAFF01]" />} label="Portal Slug" value={client.slug} mono />
        <InfoCard icon={<Calendar className="h-5 w-5 text-[#AAFF01]" />} label="Oluşturulma" value={formatClientDate(client.createdAt)} />
        <InfoCard icon={<Calendar className="h-5 w-5 text-[#AAFF01]" />} label="Son Güncelleme" value={formatClientDateTime(client.updatedAt)} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Müşteri Profil Özeti</h2>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailRow label="Müşteri kayıt ID" value={client.id} mono />
          <DetailRow label="Portal slug" value={client.slug} mono />
          <DetailRow label="Durum" value={getClientStatusLabel(client.status)} />
          <DetailRow label="Oluşturulma tarihi" value={formatClientDateTime(client.createdAt)} />
          <DetailRow label="Son güncelleme" value={formatClientDateTime(client.updatedAt)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CountSection
          icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />}
          title="Proje Sayıları"
          items={[
            ["Toplam Proje", projects.total],
            ["Planlandı", projects.planned],
            ["Devam Eden", projects.inProgress],
            ["İncelemede", projects.review],
            ["Tamamlandı", projects.completed],
            ["Beklemede", projects.onHold],
          ]}
        />
        <CountSection
          icon={<ListChecks className="h-5 w-5 text-[#AAFF01]" />}
          title="Görev Sayıları"
          items={[
            ["Toplam Görev", tasks.total],
            ["Yapılacak", tasks.todo],
            ["Devam Eden", tasks.inProgress],
            ["İncelemede", tasks.review],
            ["Tamamlandı", tasks.done],
            ["Bloke", tasks.blocked],
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentProjectsSection projects={projects.recent} />
        <RecentTasksSection tasks={tasks.recent} />
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <Link to="/musteriler">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Müşterilere Dön
      </Button>
    </Link>
  );
}

function InfoCard({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3 text-sm text-[#A0A0A0]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-semibold text-white ${mono ? "break-all font-mono" : "break-words"}`}>
        {value}
      </p>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
      <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
      <p className={`text-sm text-white ${mono ? "break-all font-mono" : "break-words"}`}>{value}</p>
    </div>
  );
}

function CountSection({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: Array<[string, number]>;
}) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
            <p className="text-2xl font-semibold text-white">{value.toLocaleString("tr-TR")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentProjectsSection({ projects }: { projects: ClientSummaryRecentProject[] }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <SectionHeader
        icon={<FolderKanban className="h-5 w-5 text-[#AAFF01]" />}
        title="Son Projeler"
      />
      {projects.length === 0 ? (
        <EmptyState>Bu müşteriye bağlı son proje bulunmuyor.</EmptyState>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    Deadline: {formatClientDate(project.dueDate)} • Güncelleme: {formatClientDate(project.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getClientProjectStatusBadgeClass(project.status)}>
                    {getClientProjectStatusLabel(project.status)}
                  </Badge>
                  <Badge className={getClientPriorityBadgeClass(project.priority)}>
                    {getClientPriorityLabel(project.priority)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/projeler/${project.id}`}>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Projeyi Aç
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentTasksSection({ tasks }: { tasks: ClientSummaryRecentTask[] }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <SectionHeader
        icon={<ListChecks className="h-5 w-5 text-[#AAFF01]" />}
        title="Son Görevler"
      />
      {tasks.length === 0 ? (
        <EmptyState>Bu müşteriye bağlı son görev bulunmuyor.</EmptyState>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-[#A0A0A0]">
                    Deadline: {formatClientDate(task.dueDate)} • Güncelleme: {formatClientDate(task.updatedAt)}
                  </p>
                  {task.projectId && (
                    <Link
                      to={`/projeler/${task.projectId}`}
                      className="mt-2 inline-flex text-xs text-[#d2ff8a] hover:underline"
                    >
                      Projeye Git
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getClientTaskStatusBadgeClass(task.status)}>
                    {getClientTaskStatusLabel(task.status)}
                  </Badge>
                  <Badge className={getClientPriorityBadgeClass(task.priority)}>
                    {getClientPriorityLabel(task.priority)}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/gorevler/${task.id}`}>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Görevi Aç
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#A0A0A0]">
      {children}
    </div>
  );
}
