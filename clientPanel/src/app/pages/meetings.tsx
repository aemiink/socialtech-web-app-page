import { FormEvent, useEffect, useRef, useState } from 'react';
import { Video, Calendar, Clock, CheckCircle, CalendarDays } from 'lucide-react';
import { Button } from '../components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { webAppWorkspaceApi, useCreateWebAppWorkspaceMeetingRequestMutation, useGetWebAppWorkspaceMeetingRequestsQuery } from "../features/webAppWorkspace/webAppWorkspaceApi";
import type { WorkspaceMeetingRequest } from '../features/webAppWorkspace/webAppWorkspaceTypes';
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from '../features/webAppWorkspace/workspaceSocket';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAccessToken } from '../features/auth/authSelectors';

const ISTANBUL_TIMEZONE = "Europe/Istanbul";
const DEFAULT_MEETING_DURATION_MINUTES = 45;

export function MeetingsPage({ projectId }: { projectId?: string | null }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const lastWorkspaceSequenceRef = useRef(0);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestAgenda, setRequestAgenda] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);
  const { data: requests = [], isLoading } = useGetWebAppWorkspaceMeetingRequestsQuery(
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
        date: start.toLocaleDateString("tr-TR", { timeZone: ISTANBUL_TIMEZONE }),
        time: start.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: ISTANBUL_TIMEZONE,
        }),
        duration: `${durationMinutes} dk`,
        type: getMeetingStatusLabel(item.status),
        responseNote: item.responseNote,
        isRescheduled: Boolean(item.scheduledStartAt),
      };
    });
  const dynamicPast = requests
    .filter((item) => item.status === "COMPLETED" || item.status === "DECLINED" || item.status === "CANCELLED")
    .map((item) => ({
      title: item.title,
      date: new Date(item.createdAt).toLocaleDateString("tr-TR", { timeZone: ISTANBUL_TIMEZONE }),
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
      if (event.tabKey !== "MEETINGS") {
        return;
      }
      if (event.sequence <= lastWorkspaceSequenceRef.current) {
        return;
      }
      lastWorkspaceSequenceRef.current = event.sequence;
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
  }, [accessToken, dispatch, projectId]);

  const prepareMeetingRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateMeetingRequest(requestDate, requestTime);
    if (validationError) {
      setRequestError(validationError);
      return;
    }

    setRequestError(null);
    setIsRequestDialogOpen(false);
    setIsConfirmationOpen(true);
  };

  const submitMeetingRequest = async () => {
    if (!projectId) {
      return;
    }

    const validationError = validateMeetingRequest(requestDate, requestTime);
    if (validationError) {
      setRequestError(validationError);
      setIsConfirmationOpen(false);
      setIsRequestDialogOpen(true);
      return;
    }

    const startAt = createIstanbulDateTime(requestDate, requestTime);
    const endAt = new Date(startAt.getTime() + DEFAULT_MEETING_DURATION_MINUTES * 60 * 1000);

    try {
      setRequestError(null);
      await createRequest({
        projectId,
        title: "Müşteri toplantı talebi",
        agenda: requestAgenda.trim() || undefined,
        preferredStartAt: startAt.toISOString(),
        preferredEndAt: endAt.toISOString(),
        timezone: ISTANBUL_TIMEZONE,
      }).unwrap();
      setIsConfirmationOpen(false);
      setRequestDate("");
      setRequestTime("");
      setRequestAgenda("");
      setRequestFeedback("Toplantı talebiniz proje yöneticisine gönderildi.");
    } catch (error) {
      setRequestError(extractApiErrorMessage(error, "Toplantı talebi gönderilemedi."));
      setIsConfirmationOpen(false);
      setIsRequestDialogOpen(true);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Toplantılar</h1>
        <p className="text-[#A0A0A0]">Social Tech ekibi ile planlı görüşmeleriniz</p>
      </div>

      {requestFeedback ? (
        <div className="rounded-xl border border-[#AAFF01]/25 bg-[#AAFF01]/10 px-4 py-3 text-sm text-[#d9ff8b]">
          {requestFeedback}
        </div>
      ) : null}

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
                {meeting.isRescheduled ? (
                  <p className="mb-2 text-xs text-[#d9ff8b]">Proje yöneticisinin önerdiği güncel zaman gösteriliyor.</p>
                ) : null}
                {meeting.responseNote ? (
                  <p className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-sm text-[#D0D0D0]">
                    Proje yöneticisi notu: {meeting.responseNote}
                  </p>
                ) : null}
              </div>
            ))}
            {projectId && !isLoading && mergedUpcoming.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Yaklaşan toplantı bulunmuyor.</p>
            ) : null}
            <Button
              variant="primary"
              icon={Video}
              className="w-full justify-center text-sm"
              disabled={!projectId || isCreating}
              onClick={() => setIsRequestDialogOpen(true)}
            >
              {projectId ? "Toplantı Talep Et" : "Proje Seçilmedi"}
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

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="border-white/[0.1] bg-[#181818] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CalendarDays className="h-5 w-5 text-[#AAFF01]" />
              Toplantı Tarihi Seçin
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Toplantı talepleri Türkiye saatiyle 09:00-18:00 arasında oluşturulabilir.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={prepareMeetingRequest} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[#D0D0D0]">
                <span>Tarih</span>
                <Input
                  type="date"
                  min={getIstanbulTodayInputValue()}
                  value={requestDate}
                  onChange={(event) => setRequestDate(event.target.value)}
                  className="border-white/[0.12] bg-black/20 text-white"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-[#D0D0D0]">
                <span>Saat (TSİ)</span>
                <Input
                  type="time"
                  min="09:00"
                  max="18:00"
                  step={900}
                  value={requestTime}
                  onChange={(event) => setRequestTime(event.target.value)}
                  className="border-white/[0.12] bg-black/20 text-white"
                  required
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-[#D0D0D0]">
              <span>Görüşme notu (opsiyonel)</span>
              <Textarea
                value={requestAgenda}
                onChange={(event) => setRequestAgenda(event.target.value)}
                placeholder="Görüşmek istediğiniz konuları kısaca yazın."
                maxLength={4000}
                className="min-h-24 border-white/[0.12] bg-black/20 text-white"
              />
            </label>

            {requestError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                {requestError}
              </p>
            ) : null}

            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsRequestDialogOpen(false)}>
                Vazgeç
              </Button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#AAFF01] px-4 py-2.5 text-black transition-colors hover:bg-[#AAFF01]/90"
              >
                <Calendar className="h-4 w-4" />
                Talebi Kontrol Et
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent className="border-white/[0.1] bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Toplantı talebini gönderelim mi?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-[#A0A0A0]">
              <span className="block">Talep, projeye atanmış proje yöneticisine gönderilecek.</span>
              <span className="block rounded-lg border border-white/[0.08] bg-black/20 px-3 py-3 text-white">
                {requestDate && requestTime
                  ? formatMeetingSummary(requestDate, requestTime)
                  : "Tarih ve saat seçilmedi."}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/[0.12] bg-transparent text-white hover:bg-white/[0.06]"
              onClick={() => setIsRequestDialogOpen(true)}
            >
              Geri Dön
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#AAFF01] text-black hover:bg-[#AAFF01]/90"
              disabled={isCreating}
              onClick={(event) => {
                event.preventDefault();
                void submitMeetingRequest();
              }}
            >
              {isCreating ? "Gönderiliyor..." : "Talebi Gönder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getMeetingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    REQUESTED: "Proje Yöneticisi Yanıtı Bekleniyor",
    CONFIRMED: "Onaylandı",
    DECLINED: "Uygun Bulunmadı",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] ?? status;
}

function getIstanbulTodayInputValue(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

function createIstanbulDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`);
}

function validateMeetingRequest(date: string, time: string): string | null {
  if (!date || !time) {
    return "Lütfen toplantı tarihini ve saatini seçin.";
  }
  if (date < getIstanbulTodayInputValue()) {
    return "Geçmiş bir tarih için toplantı talebi oluşturamazsınız.";
  }
  if (time < "09:00" || time > "18:00") {
    return "Toplantı saati TSİ 09:00-18:00 arasında olmalıdır.";
  }
  if (createIstanbulDateTime(date, time).getTime() <= Date.now()) {
    return "Geçmiş bir saat için toplantı talebi oluşturamazsınız.";
  }
  return null;
}

function formatMeetingSummary(date: string, time: string): string {
  return createIstanbulDateTime(date, time).toLocaleString("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: ISTANBUL_TIMEZONE,
  });
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "error" in error.data &&
    typeof error.data.error === "object" &&
    error.data.error !== null &&
    "message" in error.data.error &&
    typeof error.data.error.message === "string"
  ) {
    return error.data.error.message;
  }
  return fallback;
}
