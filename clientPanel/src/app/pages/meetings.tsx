import { useEffect, useRef } from 'react';
import { Video, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/button';
import { webAppWorkspaceApi, useCreateWebAppWorkspaceMeetingRequestMutation, useGetWebAppWorkspaceMeetingRequestsQuery } from "../features/webAppWorkspace/webAppWorkspaceApi";
import type { WorkspaceMeetingRequest } from '../features/webAppWorkspace/webAppWorkspaceTypes';
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from '../features/webAppWorkspace/workspaceSocket';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAccessToken } from '../features/auth/authSelectors';

export function MeetingsPage({ projectId }: { projectId?: string | null }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const lastWorkspaceSequenceRef = useRef(0);
  const { data: requests = [], isLoading, refetch: refetchMeetingRequests } = useGetWebAppWorkspaceMeetingRequestsQuery(
    { projectId: projectId ?? "" },
    { skip: !projectId },
  );
  const [createRequest, { isLoading: isCreating }] = useCreateWebAppWorkspaceMeetingRequestMutation();

  const dynamicUpcoming = requests
    .filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED")
    .map((item) => {
      const startRaw = item.scheduledStartAt ?? item.preferredStartAt;
      const endRaw = item.scheduledEndAt ?? item.preferredEndAt;
      const start = new Date(startRaw);
      const end = new Date(endRaw);
      const durationMinutes = Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 1);
      return {
        title: item.title,
        date: start.toLocaleDateString("tr-TR"),
        time: start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        duration: `${durationMinutes} dk`,
        type: item.status === "CONFIRMED" ? "Onaylandı" : "Talep Bekliyor",
      };
    });
  const dynamicPast = requests
    .filter((item) => item.status === "COMPLETED" || item.status === "DECLINED")
    .map((item) => ({
      title: item.title,
      date: new Date(item.createdAt).toLocaleDateString("tr-TR"),
      summary: item.agenda ?? "Toplantı talebi",
      action: item.responseNote ?? "Yanıt bekleniyor.",
    }));

  const mergedUpcoming = dynamicUpcoming;
  const mergedPast = dynamicPast;

  useEffect(() => {
    if (!projectId || !accessToken) {
      return;
    }

    const socket = createWorkspaceSocket(accessToken);
    const joinPayload = { projectId, tabKey: "MEETINGS" };
    socket.emit("project:join", joinPayload);

    const onWorkspaceUpdate = (event: WorkspaceUpdateEvent) => {
      if (event.projectId !== projectId) {
        return;
      }
      if (event.sequence <= lastWorkspaceSequenceRef.current) {
        return;
      }
      if (event.sequence > lastWorkspaceSequenceRef.current + 1) {
        lastWorkspaceSequenceRef.current = event.sequence;
        void refetchMeetingRequests();
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
      if (event.tabKey !== "MEETINGS") {
        return;
      }
      const payload = event.payload ?? {};
      const meetingRequest = (payload.meetingRequest ?? null) as WorkspaceMeetingRequest | null;
      if (event.event === "meeting-request.created" && meetingRequest) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData("getWebAppWorkspaceMeetingRequests", { projectId }, (draft) => {
            const exists = draft.some((item) => item.id === meetingRequest.id);
            if (!exists) {
              draft.unshift(meetingRequest);
            }
          }),
        );
        return;
      }
      if (event.event === "meeting-request.updated" && meetingRequest) {
        dispatch(
          webAppWorkspaceApi.util.updateQueryData("getWebAppWorkspaceMeetingRequests", { projectId }, (draft) => {
            const target = draft.find((item) => item.id === meetingRequest.id);
            if (target) {
              Object.assign(target, meetingRequest);
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
  }, [accessToken, dispatch, projectId, refetchMeetingRequests]);

  const quickMeetingRequest = async () => {
    if (!projectId) {
      return;
    }
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000);
    await createRequest({
      projectId,
      title: "Müşteri toplantı talebi",
      agenda: "İlerleme ve açık sorular",
      preferredStartAt: startAt.toISOString(),
      preferredEndAt: endAt.toISOString(),
      timezone: "Europe/Istanbul",
    }).unwrap();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Toplantılar</h1>
        <p className="text-[#A0A0A0]">Social Tech ekibi ile planlı görüşmeleriniz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Yaklaşan Toplantılar</h2>
          {isLoading && projectId ? <p className="text-sm text-[#A0A0A0] mb-3">Toplantı talepleri yükleniyor...</p> : null}
          {!projectId ? <p className="text-sm text-[#A0A0A0] mb-3">Bu alanı görüntülemek için bir proje seçin.</p> : null}
          <div className="space-y-3">
            {mergedUpcoming.map((meeting, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white mb-2">{meeting.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                      {meeting.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0] mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time} ({meeting.duration})</span>
                  </div>
                </div>
              </div>
            ))}
            {projectId && !isLoading && mergedUpcoming.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Yaklaşan toplantı bulunmuyor.</p>
            ) : null}
            <Button
              variant="primary"
              icon={Video}
              className={`w-full justify-center text-sm ${projectId && isCreating ? "opacity-60 pointer-events-none" : ""}`}
              onClick={() => {
                if (projectId && isCreating) {
                  return;
                }
                void quickMeetingRequest();
              }}
            >
              {projectId ? "Toplantı Talep Et" : "Toplantıya Katıl"}
            </Button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Geçmiş Toplantılar</h2>
          {!projectId ? <p className="text-sm text-[#A0A0A0] mb-3">Bu alanı görüntülemek için bir proje seçin.</p> : null}
          <div className="space-y-3">
            {mergedPast.map((meeting, i) => (
              <div key={i} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-white mb-1">{meeting.title}</h3>
                    <p className="text-sm text-[#A0A0A0] mb-2">{meeting.date}</p>
                    <p className="text-sm text-[#A0A0A0]">Özet: {meeting.summary}</p>
                    <p className="text-sm text-[#AAFF01] mt-2">Aksiyon: {meeting.action}</p>
                  </div>
                </div>
              </div>
            ))}
            {projectId && !isLoading && mergedPast.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Geçmiş toplantı bulunmuyor.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
