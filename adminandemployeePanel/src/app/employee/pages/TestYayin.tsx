import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useGetDeliveryReleasesQuery } from "../../features/delivery/deliveryApi";
import type { DeliveryRelease } from "../../features/delivery/deliveryTypes";
import { useGetProjectRepositoryWorkflowRunsQuery, useGetProjectRepositoryQuery } from "../../features/projects/projectsApi";
import {
  getDeliveryReleaseStatusBadgeClass,
  getDeliveryReleaseStatusLabel,
} from "../../features/delivery/deliveryUtils";
import { formatDateTime } from "../../features/projects/projectsUtils";
import { getTaskEnvironmentLabel, extractApiErrorMessage } from "../../features/tasks/tasksUtils";

export function TestYayin() {
  const { data, error, isError, isLoading, refetch } = useGetDeliveryReleasesQuery();
  const releases = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Test &amp; Yayın</h1>
        <p className="text-[#A0A0A0]">Release ve yayın kuyruğu</p>
      </div>

      {isLoading && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Release kayıtları yükleniyor...
        </Card>
      )}

      {isError && !isLoading && (
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p>{extractApiErrorMessage(error, "Release kayıtları alınamadı.")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </Card>
      )}

      {!isLoading && !isError && releases.length === 0 && (
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-8 text-center text-[#A0A0A0]">
          Release kaydı bulunmuyor.
        </Card>
      )}

      {!isLoading && !isError && releases.length > 0 && (
        <div className="space-y-4">
          {releases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReleaseCard({
  release,
}: {
  release: DeliveryRelease;
}) {
  const { data: repository } = useGetProjectRepositoryQuery(release.projectId, {
    skip: !release.project?.repositoryUrl,
  });
  const { data: workflowRuns } = useGetProjectRepositoryWorkflowRunsQuery(
    { projectId: release.projectId },
    { skip: !repository },
  );
  const latestRun = workflowRuns?.[0];

  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{release.title}</h3>
            <Badge className={getDeliveryReleaseStatusBadgeClass(release.status)}>
              {getDeliveryReleaseStatusLabel(release.status)}
            </Badge>
            <Badge variant="outline">
              {getTaskEnvironmentLabel(release.environment)}
            </Badge>
            <Badge variant="outline" className={getReleaseApprovalBadgeClass(release.approvalStatus)}>
              {getReleaseApprovalLabel(release.approvalStatus)}
            </Badge>
            {release.version && (
              <Badge variant="outline" className="font-mono">
                {release.version}
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#A0A0A0]">
            {release.project?.clientProfile?.companyName ?? "—"} · {release.project?.name ?? "—"}
          </p>
          {release.releaseNotes && (
            <p className="mt-2 max-w-3xl text-sm text-[#D8D8D8]">{release.releaseNotes}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className={getWorkflowBadgeClass(latestRun?.conclusion, latestRun?.status)}>
              CI/CD: {getWorkflowStatusLabel(latestRun?.name, latestRun?.status, latestRun?.conclusion)}
            </Badge>
          </div>
        </div>
        <div className="space-y-1 text-right text-xs text-[#A0A0A0]">
          <p>Planlandı: {formatDateTime(release.scheduledAt ?? null)}</p>
          <p>Deploy: {formatDateTime(release.deployedAt ?? null)}</p>
        </div>
      </div>
    </Card>
  );
}

function getReleaseApprovalLabel(status?: string | null) {
  if (status === "APPROVED") {
    return "Yayın Onayı Verildi";
  }
  if (status === "CHANGES_REQUESTED") {
    return "Revizyon İstendi";
  }
  if (status === "REJECTED") {
    return "Yayın Onayı Reddedildi";
  }
  if (status === "PENDING") {
    return "Yayın Onayı Bekliyor";
  }

  return "Onay İstenmedi";
}

function getReleaseApprovalBadgeClass(status?: string | null) {
  if (status === "APPROVED") {
    return "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d2ff8a]";
  }
  if (status === "REJECTED" || status === "CHANGES_REQUESTED") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }
  if (status === "PENDING") {
    return "border-orange-400/30 bg-orange-500/10 text-orange-100";
  }

  return "border-white/[0.12] text-[#A0A0A0]";
}

function getWorkflowStatusLabel(
  workflowName?: string | null,
  status?: string | null,
  conclusion?: string | null,
) {
  if (!workflowName && !status && !conclusion) {
    return "Repository workflow verisi yok";
  }

  return `${workflowName ?? "Workflow"} · ${conclusion ?? status ?? "bilinmiyor"}`;
}

function getWorkflowBadgeClass(conclusion?: string | null, status?: string | null) {
  if (conclusion === "success") {
    return "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d2ff8a]";
  }
  if (conclusion === "failure" || conclusion === "cancelled") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }
  if (status === "in_progress" || status === "queued") {
    return "border-orange-400/30 bg-orange-500/10 text-orange-100";
  }

  return "border-white/[0.12] text-[#A0A0A0]";
}
