import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, FolderKanban, MessageSquare, Package } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useGetClientQuery, useGetClientSummaryQuery } from "../../features/clients/clientsApi";
import { SERVICE_CATALOG, extractApiErrorMessage, isUuid } from "../../features/clients/clientsUtils";
import type { ServiceKey } from "../../features/clients/clientsTypes";
import { useCreateProjectMutation, useGetProjectsQuery } from "../../features/projects/projectsApi";
import { getProjectStatusBadgeClass, getProjectStatusLabel } from "../../features/projects/projectsUtils";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentEmployeeRole } from "../../features/auth/authSelectors";

export function ProjectManagerClientDetail() {
  const role = useAppSelector(selectCurrentEmployeeRole);
  const { clientId } = useParams();
  const isValid = typeof clientId === "string" && isUuid(clientId);
  const normalizedClientId = isValid ? clientId : null;
  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [createProjectError, setCreateProjectError] = useState<string | null>(null);
  const [creatingServiceKey, setCreatingServiceKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [figmaProjectUrl, setFigmaProjectUrl] = useState("");
  const { data: summary, isLoading, isError, error } = useGetClientSummaryQuery(normalizedClientId ?? "", {
    skip: !normalizedClientId,
  });
  const { data: clientProfile } = useGetClientQuery(normalizedClientId ?? "", {
    skip: !normalizedClientId,
  });
  const { data: projectsResponse } = useGetProjectsQuery(
    { clientProfileId: normalizedClientId ?? "" },
    { skip: !normalizedClientId },
  );
  const projects = projectsResponse?.data ?? [];
  const recentTasks = summary?.tasks?.recent ?? [];
  const serviceCards = useMemo(() => {
    const purchased = clientProfile?.purchasedServices ?? [];
    return purchased
      .filter((service) => service.status === "ACTIVE")
      .map((service) => {
        const serviceKey = normalizeServiceKey(service.serviceKey);
        const linkedProjects = projects.filter(
          (project) => normalizeServiceKey(project.serviceKey) === serviceKey,
        );
        const openTaskCount = recentTasks.filter((task) =>
          linkedProjects.some((project) => project.id === task.projectId) && task.status !== "DONE",
        ).length;
        return {
          serviceKey: service.serviceKey,
          label: SERVICE_CATALOG.find((item) => item.key === service.serviceKey)?.label ?? service.serviceKey,
          linkedProjects,
          openTaskCount,
        };
      });
  }, [clientProfile?.purchasedServices, projects, recentTasks]);

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>,
    serviceKey: string,
  ) => {
    event.preventDefault();
    if (!normalizedClientId || projectName.trim().length < 3) {
      return;
    }

    const normalizedServiceKey = normalizeServiceKey(serviceKey);
    const needsRepositoryUrl =
      normalizedServiceKey === "web-app" || normalizedServiceKey === "mobile-app";
    const needsFigmaUrl = normalizedServiceKey === "web-mobile-design";
    if (needsRepositoryUrl && repositoryUrl.trim().length === 0) {
      setCreateProjectError("WEB_APP ve MOBILE_APP için repository linki zorunludur.");
      return;
    }
    if (needsFigmaUrl && figmaProjectUrl.trim().length === 0) {
      setCreateProjectError("Web & Mobile Design için Figma veya prototip linki zorunludur.");
      return;
    }

    try {
      setCreateProjectError(null);
      await createProject({
        clientProfileId: normalizedClientId,
        serviceKey: serviceKey as ServiceKey,
        name: projectName.trim(),
        description: `${summary?.client?.name ?? "Müşteri"} için ${serviceKey} operasyon projesi`,
        status: "PLANNED",
        priority: "MEDIUM",
        repositoryUrl: repositoryUrl.trim().length > 0 ? repositoryUrl.trim() : null,
        figmaProjectUrl: figmaProjectUrl.trim().length > 0 ? figmaProjectUrl.trim() : null,
      }).unwrap();
      setProjectName("");
      setRepositoryUrl("");
      setFigmaProjectUrl("");
      setCreatingServiceKey(null);
    } catch (mutationError) {
      setCreateProjectError(extractApiErrorMessage(mutationError, "Proje oluşturulamadı."));
    }
  };

  if (role !== "project-manager") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (!normalizedClientId) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">Geçersiz müşteri kimliği.</Card>
    );
  }

  if (isLoading) {
    return <Card className="border-white/[0.06] bg-[#1A1A1A] p-6 text-[#A0A0A0]">Müşteri yükleniyor...</Card>;
  }

  if (isError || !summary) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        {extractApiErrorMessage(error, "Müşteri detayı yüklenemedi.")}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/employee/musterilerim">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Müşterilerime Dön
        </Button>
      </Link>
      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <h1 className="text-2xl font-semibold text-white">{summary.client.name}</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">Satın alınan hizmetlere göre operasyon alanı</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {serviceCards.map((serviceCard) => (
          <Card key={serviceCard.serviceKey} className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#AAFF01]" />
                <h3 className="font-semibold text-white">{serviceCard.label}</h3>
              </div>
              <Badge variant="outline">{serviceCard.serviceKey}</Badge>
            </div>
            <p className="text-sm text-[#A0A0A0]">
              Proje: {serviceCard.linkedProjects.length} · Açık görev: {serviceCard.openTaskCount}
            </p>
            <div className="mt-4 space-y-2">
              {serviceCard.linkedProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="rounded-lg border border-white/[0.06] bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white">{project.name}</p>
                    <Badge className={getProjectStatusBadgeClass(project.status)}>
                      {getProjectStatusLabel(project.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {serviceCard.linkedProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-3">
                  <p className="mb-3 text-sm text-[#A0A0A0]">Bu hizmet için henüz proje oluşturulmamış.</p>
                  {creatingServiceKey === serviceCard.serviceKey ? (
                    <form
                      className="space-y-2"
                      onSubmit={(event) => void handleCreateProject(event, serviceCard.serviceKey)}
                    >
                      <Input
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                        placeholder="Proje adı"
                        minLength={3}
                        required
                      />
                      {(normalizeServiceKey(serviceCard.serviceKey) === "web-app" ||
                        normalizeServiceKey(serviceCard.serviceKey) === "mobile-app") ? (
                        <Input
                          value={repositoryUrl}
                          onChange={(event) => setRepositoryUrl(event.target.value)}
                          placeholder="https://github.com/owner/repo"
                          required
                        />
                      ) : null}
                      {normalizeServiceKey(serviceCard.serviceKey) === "web-mobile-design" ? (
                        <Input
                          value={figmaProjectUrl}
                          onChange={(event) => setFigmaProjectUrl(event.target.value)}
                          placeholder="https://www.figma.com/file/... veya https://www.figma.com/proto/..."
                          required
                        />
                      ) : null}
                      {createProjectError ? (
                        <p className="text-xs text-red-300">{createProjectError}</p>
                      ) : null}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isCreatingProject}>
                          {isCreatingProject ? "Oluşturuluyor..." : "Proje Oluştur"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCreatingServiceKey(null);
                            setProjectName("");
                            setRepositoryUrl("");
                            setFigmaProjectUrl("");
                            setCreateProjectError(null);
                          }}
                        >
                          İptal
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setCreatingServiceKey(serviceCard.serviceKey);
                        setProjectName(`${serviceCard.label} Operasyon`);
                        setRepositoryUrl("");
                        setFigmaProjectUrl("");
                        setCreateProjectError(null);
                      }}
                    >
                      Proje Oluştur
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  to={`/employee/project-manager/clients/${summary.client.id}/services/${serviceCard.serviceKey}`}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Operasyonu Aç
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link
                  to={`/employee/project-manager/clients/${summary.client.id}/services/${serviceCard.serviceKey}?tab=MESSAGES`}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mesajlar
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function normalizeServiceKey(value?: string | null): string {
  return (value ?? "").toLowerCase().replace(/_/g, "-").trim();
}
