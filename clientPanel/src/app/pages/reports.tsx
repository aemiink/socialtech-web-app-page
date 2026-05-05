import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "../components/button";
import { webAppWorkspaceApi, useGetWebAppWorkspaceReportsQuery } from "../features/webAppWorkspace/webAppWorkspaceApi";
import type { WorkspaceWeeklyReport } from "../features/webAppWorkspace/webAppWorkspaceTypes";
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from "../features/webAppWorkspace/workspaceSocket";
import { selectAccessToken } from "../features/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function ReportsPage({ projectId }: { projectId?: string | null }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const lastWorkspaceSequenceRef = useRef(0);
  const { data: reports = [], isLoading } = useGetWebAppWorkspaceReportsQuery(
    { projectId: projectId ?? "" },
    { skip: !projectId },
  );

  useEffect(() => {
    if (!projectId || !accessToken) {
      return;
    }

    const socket = createWorkspaceSocket(accessToken);
    const joinPayload = { projectId, tabKey: "REPORTS" as const };
    socket.emit("project:join", joinPayload);

    const onWorkspaceUpdate = (event: WorkspaceUpdateEvent) => {
      if (event.projectId !== projectId || event.tabKey !== "REPORTS") {
        return;
      }
      if (event.sequence <= lastWorkspaceSequenceRef.current) {
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
      const weeklyReport = (event.payload?.weeklyReport ?? null) as WorkspaceWeeklyReport | null;
      if (event.event === "weekly-report.created" && weeklyReport) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData("getWebAppWorkspaceReports", { projectId }, (draft) => {
            const exists = draft.some((item) => item.id === weeklyReport.id);
            if (!exists) {
              draft.unshift(weeklyReport);
            }
          }),
        );
      }
    };

    socket.on("workspace:update", onWorkspaceUpdate);

    return () => {
      socket.emit("project:leave", joinPayload);
      socket.off("workspace:update", onWorkspaceUpdate);
      socket.disconnect();
    };
  }, [accessToken, dispatch, projectId]);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="mb-2 text-3xl text-white">Raporlar</h1>
        <p className="text-[#A0A0A0]">Haftalık geliştirme raporları</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
        <h2 className="mb-4 text-xl text-white">Rapor Listesi</h2>
        {!projectId ? <p className="text-sm text-[#A0A0A0]">Bu alanı görüntülemek için bir proje seçin.</p> : null}
        {isLoading && projectId ? <p className="text-sm text-[#A0A0A0]">Raporlar yükleniyor...</p> : null}
        {projectId && !isLoading && reports.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">Henüz rapor bulunmuyor.</p>
        ) : null}
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#202020] p-4"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-[#AAFF01]" />
                <div>
                  <p className="text-white">
                    {new Date(report.weekStartDate).toLocaleDateString("tr-TR")} -{" "}
                    {new Date(report.weekEndDate).toLocaleDateString("tr-TR")} Haftası
                  </p>
                  <p className="text-sm text-[#A0A0A0]">
                    Oluşturulma: {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="mt-1 text-sm text-[#CFCFCF]">{report.summary}</p>
                </div>
              </div>
              <Button variant="ghost" icon={Download} className="pointer-events-none opacity-60">
                Yakında
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
