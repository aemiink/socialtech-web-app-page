import { FormEvent, useEffect, useRef, useState } from 'react';
import { Video, Calendar, Clock, CheckCircle, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

const MEETING_TOPICS = [
  { value: "performance", label: "Reklam Performansı", specialist: "Performance Specialist" },
  { value: "creative", label: "Tasarım & Kreatif", specialist: "Tasarım Uzmanı" },
  { value: "reporting", label: "Raporlama & Analiz", specialist: "Proje Yöneticisi" },
  { value: "general", label: "Genel Görüşme", specialist: "Proje Yöneticisi" },
  { value: "technical", label: "Teknik Destek", specialist: "Teknik Uzman" },
] as const;

type MeetingTopicValue = typeof MEETING_TOPICS[number]["value"];

interface StatusNotification {
  id: string;
  meetingTitle: string;
  status: "CONFIRMED" | "DECLINED";
}

// ─── Calendar helpers ──────────────────────────────────────────────────────────

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0 = Sunday
  const days: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toIstanbulDate(isoString: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(isoString));
  const year = parseInt(parts.find(p => p.type === "year")?.value ?? "0", 10);
  const month = parseInt(parts.find(p => p.type === "month")?.value ?? "1", 10) - 1;
  const day = parseInt(parts.find(p => p.type === "day")?.value ?? "1", 10);
  return new Date(year, month, day);
}

// ─── Specialist extraction ─────────────────────────────────────────────────────

function extractSpecialistFromTitle(title: string): string | null {
  const match = title.match(/^\[(.+?)\]/);
  if (!match) return null;
  const topicLabel = match[1];
  const topic = MEETING_TOPICS.find(t => t.label === topicLabel);
  return topic?.specialist ?? null;
}

// ─── Calendar component ────────────────────────────────────────────────────────

interface MiniCalendarProps {
  requests: WorkspaceMeetingRequest[];
  highlightedDay: Date | null;
  onDayClick: (day: Date) => void;
}

function MiniCalendar({ requests, highlightedDay, onDayClick }: MiniCalendarProps) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const days = getCalendarDays(calYear, calMonth);

  // Build meeting dates map: "YYYY-M-D" -> count
  const meetingDayMap = new Map<string, number>();
  for (const req of requests) {
    const dateStr = req.scheduledStartAt ?? req.preferredStartAt;
    const d = toIstanbulDate(dateStr);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    meetingDayMap.set(key, (meetingDayMap.get(key) ?? 0) + 1);
  }

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg text-white font-medium">
          {monthNames[calMonth]} {calYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs text-[#606060] py-1 font-medium">
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`pad-${idx}`} />;
          }
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const count = meetingDayMap.get(key) ?? 0;
          const hasMeeting = count > 0;
          const isToday = isSameDay(day, today);
          const isHighlighted = highlightedDay ? isSameDay(day, highlightedDay) : false;

          return (
            <button
              key={key}
              onClick={() => hasMeeting ? onDayClick(day) : undefined}
              className={[
                "relative flex flex-col items-center justify-center rounded-lg py-1.5 text-sm transition-colors",
                hasMeeting ? "cursor-pointer hover:bg-[#252525]" : "cursor-default",
                isHighlighted ? "bg-[#AAFF01]/15 ring-1 ring-[#AAFF01]/40" : "",
                isToday && !isHighlighted ? "ring-1 ring-white/20" : "",
              ].filter(Boolean).join(" ")}
            >
              <span className={[
                hasMeeting ? "text-white font-medium" : "text-[#A0A0A0]",
                isToday ? "text-[#AAFF01]" : "",
              ].filter(Boolean).join(" ")}>
                {day.getDate()}
              </span>
              {hasMeeting && (
                <div className="mt-0.5 flex items-center gap-0.5">
                  {count === 1 ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
                  ) : (
                    <span className="text-[10px] text-[#AAFF01] font-semibold leading-none">{count}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3 text-xs text-[#606060]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF01]" />
          <span>Toplantı var</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-1 ring-white/20" />
          <span>Bugün</span>
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    REQUESTED: { label: "Yanıt Bekleniyor", className: "bg-amber-400/15 text-amber-300 border border-amber-400/25" },
    CONFIRMED: { label: "Onaylandı", className: "bg-[#AAFF01]/15 text-[#AAFF01] border border-[#AAFF01]/25" },
    DECLINED: { label: "Uygun Bulunmadı", className: "bg-red-400/15 text-red-300 border border-red-400/25" },
    COMPLETED: { label: "Tamamlandı", className: "bg-white/5 text-[#606060] border border-white/[0.06]" },
    CANCELLED: { label: "İptal Edildi", className: "bg-white/5 text-[#606060] border border-white/[0.06]" },
  };
  const { label, className } = config[status] ?? { label: status, className: "bg-white/5 text-[#A0A0A0]" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function MeetingsPage({ projectId }: { projectId?: string | null }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const lastWorkspaceSequenceRef = useRef(0);

  // Dialog / form states
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestAgenda, setRequestAgenda] = useState("");
  const [requestTopic, setRequestTopic] = useState<MeetingTopicValue | "">("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  // Calendar highlight
  const [highlightedDay, setHighlightedDay] = useState<Date | null>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);

  // Status notifications from socket
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);

  const { data: requests = [], isLoading } = useGetWebAppWorkspaceMeetingRequestsQuery(
    { projectId: projectId ?? "" },
    { skip: !projectId },
  );
  const [createRequest, { isLoading: isCreating }] = useCreateWebAppWorkspaceMeetingRequestMutation();

  // ─── Derived lists ────────────────────────────────────────────────────────────

  const dynamicUpcoming = requests
    .filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED")
    .map((item) => {
      const startRaw = item.scheduledStartAt ?? item.preferredStartAt;
      const endRaw = item.scheduledEndAt ?? item.preferredEndAt;
      const start = new Date(startRaw);
      const end = new Date(endRaw);
      const durationMinutes = Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 1);
      const specialist = extractSpecialistFromTitle(item.title);
      return {
        id: item.id,
        title: item.title,
        status: item.status,
        date: start.toLocaleDateString("tr-TR", { timeZone: ISTANBUL_TIMEZONE }),
        time: start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: ISTANBUL_TIMEZONE }),
        duration: `${durationMinutes} dk`,
        specialist,
        responseNote: item.responseNote,
        isRescheduled: Boolean(item.scheduledStartAt),
        startDate: toIstanbulDate(startRaw),
      };
    });

  // Group past by month
  const dynamicPast = requests
    .filter((item) => item.status === "COMPLETED" || item.status === "DECLINED" || item.status === "CANCELLED")
    .map((item) => {
      const dateObj = new Date(item.scheduledStartAt ?? item.preferredStartAt);
      return {
        id: item.id,
        title: item.title,
        status: item.status,
        date: dateObj.toLocaleDateString("tr-TR", { timeZone: ISTANBUL_TIMEZONE }),
        monthKey: dateObj.toLocaleDateString("tr-TR", { year: "numeric", month: "long", timeZone: ISTANBUL_TIMEZONE }),
        summary: item.agenda ?? "Toplantı talebi",
        action: item.responseNote ?? "Yanıt bekleniyor.",
        specialist: extractSpecialistFromTitle(item.title),
      };
    });

  // Group past by month
  const pastByMonth: Record<string, typeof dynamicPast> = {};
  for (const m of dynamicPast) {
    if (!pastByMonth[m.monthKey]) pastByMonth[m.monthKey] = [];
    pastByMonth[m.monthKey].push(m);
  }

  // ─── Socket ───────────────────────────────────────────────────────────────────

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
              const prevStatus = target.status;
              Object.assign(target, meetingRequest);
              // Show notification if status changed to CONFIRMED or DECLINED
              if (
                prevStatus !== meetingRequest.status &&
                (meetingRequest.status === "CONFIRMED" || meetingRequest.status === "DECLINED")
              ) {
                const notifId = `${meetingRequest.id}-${meetingRequest.status}-${Date.now()}`;
                setNotifications(prev => [
                  ...prev,
                  { id: notifId, meetingTitle: meetingRequest.title, status: meetingRequest.status as "CONFIRMED" | "DECLINED" },
                ]);
                setTimeout(() => {
                  setNotifications(prev => prev.filter(n => n.id !== notifId));
                }, 6000);
              }
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

  // ─── Calendar day click ───────────────────────────────────────────────────────

  const handleCalendarDayClick = (day: Date) => {
    setHighlightedDay(day);
    setTimeout(() => {
      upcomingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ─── Form ─────────────────────────────────────────────────────────────────────

  const selectedTopicMeta = MEETING_TOPICS.find(t => t.value === requestTopic) ?? null;

  const prepareMeetingRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestTopic) {
      setRequestError("Lütfen toplantı konusunu seçin.");
      return;
    }
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
    if (!requestTopic) {
      setRequestError("Lütfen toplantı konusunu seçin.");
      setIsConfirmationOpen(false);
      setIsRequestDialogOpen(true);
      return;
    }
    const validationError = validateMeetingRequest(requestDate, requestTime);
    if (validationError) {
      setRequestError(validationError);
      setIsConfirmationOpen(false);
      setIsRequestDialogOpen(true);
      return;
    }

    const topicLabel = selectedTopicMeta?.label ?? requestTopic;
    const titleWithTopic = `[${topicLabel}] Toplantı Talebi`;

    const startAt = createIstanbulDateTime(requestDate, requestTime);
    const endAt = new Date(startAt.getTime() + DEFAULT_MEETING_DURATION_MINUTES * 60 * 1000);

    try {
      setRequestError(null);
      await createRequest({
        projectId,
        title: titleWithTopic,
        agenda: requestAgenda.trim() || undefined,
        preferredStartAt: startAt.toISOString(),
        preferredEndAt: endAt.toISOString(),
        timezone: ISTANBUL_TIMEZONE,
      }).unwrap();
      setIsConfirmationOpen(false);
      setRequestDate("");
      setRequestTime("");
      setRequestAgenda("");
      setRequestTopic("");
      setRequestFeedback("Toplantı talebiniz proje yöneticisine gönderildi.");
    } catch (error) {
      setRequestError(extractApiErrorMessage(error, "Toplantı talebi gönderilemedi."));
      setIsConfirmationOpen(false);
      setIsRequestDialogOpen(true);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-[#131313] px-6 py-8 md:px-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Toplantılar</h1>
        <p className="text-[#A0A0A0]">Social Tech ekibi ile planlı görüşmeleriniz</p>
      </div>

      {/* Socket status notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={[
                "flex items-start justify-between rounded-xl border px-4 py-3 text-sm",
                n.status === "CONFIRMED"
                  ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d9ff8b]"
                  : "border-red-400/30 bg-red-400/10 text-red-200",
              ].join(" ")}
            >
              <span>
                {n.status === "CONFIRMED"
                  ? `Toplantı talebiniz onaylandı: "${n.meetingTitle}"`
                  : `Toplantı talebiniz reddedildi: "${n.meetingTitle}"`}
              </span>
              <button
                onClick={() => dismissNotification(n.id)}
                className="ml-4 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Request feedback */}
      {requestFeedback ? (
        <div className="rounded-xl border border-[#AAFF01]/25 bg-[#AAFF01]/10 px-4 py-3 text-sm text-[#d9ff8b]">
          {requestFeedback}
        </div>
      ) : null}

      {/* Calendar — always visible */}
      <MiniCalendar
        requests={requests}
        highlightedDay={highlightedDay}
        onDayClick={handleCalendarDayClick}
      />

      {/* Upcoming + Past — 2 col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div ref={upcomingRef} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white">Yaklaşan Toplantılar</h2>
            <Button
              variant="primary"
              icon={Video}
              className="text-xs px-3 py-1.5"
              disabled={isCreating}
              onClick={() => setIsRequestDialogOpen(true)}
            >
              Talep Et
            </Button>
          </div>

          {isLoading && projectId ? (
            <p className="text-sm text-[#A0A0A0] mb-3">Toplantı talepleri yükleniyor...</p>
          ) : null}

          <div className="space-y-3">
            {dynamicUpcoming.map((meeting) => {
              const isHighlighted = highlightedDay ? isSameDay(meeting.startDate, highlightedDay) : false;
              const borderColor =
                meeting.status === "CONFIRMED" ? "border-l-[#AAFF01]" :
                meeting.status === "REQUESTED" ? "border-l-amber-400" :
                meeting.status === "DECLINED" ? "border-l-red-400" : "border-l-white/20";

              return (
                <div
                  key={meeting.id}
                  className={[
                    "rounded-xl p-4 border border-white/[0.08] border-l-2 transition-all",
                    borderColor,
                    meeting.status === "DECLINED" ? "opacity-60" : "bg-[#202020]",
                    isHighlighted ? "ring-1 ring-[#AAFF01]/40 bg-[#202020]" : "bg-[#202020]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={["text-white text-sm font-medium", meeting.status === "DECLINED" ? "line-through text-[#A0A0A0]" : ""].join(" ")}>
                      {meeting.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <StatusBadge status={meeting.status} />
                    {meeting.specialist && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#7B61FF]/15 text-[#9B85FF] border border-[#7B61FF]/25">
                        {meeting.specialist}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#A0A0A0] mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{meeting.time} ({meeting.duration})</span>
                    </div>
                  </div>

                  {meeting.isRescheduled && (
                    <p className="mb-2 text-xs text-[#d9ff8b]">
                      Proje yöneticisinin önerdiği güncel zaman gösteriliyor.
                    </p>
                  )}

                  {meeting.responseNote && (
                    <blockquote className="rounded-lg border-l-2 border-[#AAFF01]/40 bg-black/20 pl-3 pr-3 py-2 text-sm text-[#D0D0D0] italic">
                      {meeting.responseNote}
                    </blockquote>
                  )}
                </div>
              );
            })}

            {!isLoading && dynamicUpcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                  <CalendarDays className="h-7 w-7 text-[#404040]" />
                </div>
                <p className="text-sm font-medium text-[#A0A0A0]">Yaklaşan toplantı bulunmuyor.</p>
                <p className="mt-1 text-xs text-[#606060]">
                  Sağ üstteki "Talep Et" butonunu kullanarak yeni bir görüşme talep edebilirsiniz.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Past */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.08]">
          <h2 className="text-xl text-white mb-4">Geçmiş Toplantılar</h2>

          <div className="space-y-5">
            {Object.entries(pastByMonth).map(([month, meetings]) => (
              <div key={month}>
                <p className="text-xs text-[#606060] uppercase tracking-wider font-medium mb-2">
                  {month}
                </p>
                <div className="space-y-2">
                  {meetings.map((meeting) => {
                    const icon =
                      meeting.status === "COMPLETED" ? (
                        <CheckCircle className="w-4 h-4 text-[#AAFF01] flex-shrink-0 mt-0.5" />
                      ) : meeting.status === "DECLINED" ? (
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-[#606060] flex-shrink-0 mt-0.5" />
                      );

                    return (
                      <div key={meeting.id} className="bg-[#202020] rounded-xl p-4 border border-white/[0.08]">
                        <div className="flex items-start gap-3">
                          {icon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-white text-sm font-medium">{meeting.title}</h3>
                              <StatusBadge status={meeting.status} />
                            </div>
                            <p className="text-xs text-[#A0A0A0] mb-1">{meeting.date}</p>
                            {meeting.specialist && (
                              <p className="text-xs text-[#606060] mb-1">{meeting.specialist}</p>
                            )}
                            {meeting.action && meeting.action !== "Yanıt bekleniyor." && (
                              <p className="text-xs text-[#AAFF01] mt-1">
                                {meeting.action}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {!isLoading && dynamicPast.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-[#303030] mx-auto mb-2" />
                <p className="text-sm text-[#A0A0A0]">Geçmiş toplantı bulunmuyor.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Request dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="border-white/[0.1] bg-[#181818] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CalendarDays className="h-5 w-5 text-[#AAFF01]" />
              Toplantı Talep Et
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Toplantı talepleri Türkiye saatiyle 09:00-18:00 arasında oluşturulabilir.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={prepareMeetingRequest} noValidate>
            {/* Topic selector */}
            <div className="space-y-2">
              <label className="text-sm text-[#D0D0D0]">Konu Seçimi</label>
              <div className="grid grid-cols-1 gap-2">
                {MEETING_TOPICS.map(topic => (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => setRequestTopic(topic.value)}
                    className={[
                      "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm text-left transition-all",
                      requestTopic === topic.value
                        ? "border-[#AAFF01]/50 bg-[#AAFF01]/10 text-white"
                        : "border-white/[0.08] bg-black/10 text-[#A0A0A0] hover:border-white/20 hover:text-white",
                    ].join(" ")}
                  >
                    <span>{topic.label}</span>
                    {requestTopic === topic.value && (
                      <span className="text-xs text-[#AAFF01]">{topic.specialist}</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedTopicMeta && (
                <p className="text-xs text-[#A0A0A0] px-1">
                  Bu talep{" "}
                  <span className="text-[#AAFF01] font-medium">{selectedTopicMeta.specialist}</span>{" "}
                  ekibine yönlendirilecek.
                </p>
              )}
            </div>

            {/* Date + Time */}
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

            {/* Agenda */}
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

      {/* Confirmation dialog */}
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent className="border-white/[0.1] bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Toplantı talebini gönderelim mi?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-[#A0A0A0]">
              <span className="block">
                Talep,{" "}
                <span className="text-white font-medium">{selectedTopicMeta?.specialist ?? "proje yöneticisine"}</span>{" "}
                yönlendirilecek.
              </span>
              {selectedTopicMeta && (
                <span className="block text-xs text-[#AAFF01]">
                  Konu: {selectedTopicMeta.label}
                </span>
              )}
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// keep exported for potential reuse elsewhere
export { getMeetingStatusLabel };

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
