import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, FileText, Send, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { extractApiErrorMessage } from "../../clients/clientsUtils";
import type {
  GrowthHubActionItem,
  GrowthHubActionMutationRequest,
  GrowthHubActionStatus,
  GrowthHubReport,
  GrowthHubReportMutationRequest,
  GrowthHubWeeklyNote,
  GrowthHubWeeklyNoteMutationRequest,
} from "../growthHubTypes";
import {
  formatGrowthHubDateTime,
  getGrowthHubActionPriorityLabel,
  getGrowthHubActionStatusLabel,
  getGrowthHubActionTypeLabel,
  getGrowthHubReportAcknowledgementStatusLabel,
  getGrowthHubReportStatusLabel,
  getGrowthHubReportTypeLabel,
  growthHubActionPriorityOptions,
  growthHubReportTypeOptions,
} from "../growthHubUtils";

type GrowthHubActionNotePanelProps = {
  actions: GrowthHubActionItem[];
  weeklyNotes: GrowthHubWeeklyNote[];
  reports: GrowthHubReport[];
  canManageActions: boolean;
  canManageNotes: boolean;
  canManageReports: boolean;
  isActionsLoading?: boolean;
  isNotesLoading?: boolean;
  isReportsLoading?: boolean;
  onCreateAction: (
    body: GrowthHubActionMutationRequest & { title: string },
  ) => Promise<void>;
  onUpdateAction: (actionId: string, body: GrowthHubActionMutationRequest) => Promise<void>;
  onDeleteAction: (actionId: string) => Promise<void>;
  onCreateWeeklyNote: (
    body: GrowthHubWeeklyNoteMutationRequest & {
      weekStart: string;
      weekEnd: string;
      summary: string;
    },
  ) => Promise<void>;
  onUpdateWeeklyNote: (
    noteId: string,
    body: GrowthHubWeeklyNoteMutationRequest,
  ) => Promise<void>;
  onCreateReport: (
    body: GrowthHubReportMutationRequest & {
      periodStart: string;
      periodEnd: string;
      type: NonNullable<GrowthHubReportMutationRequest["type"]>;
    },
  ) => Promise<void>;
  onUpdateReport: (reportId: string, body: GrowthHubReportMutationRequest) => Promise<void>;
  onPublishReport: (reportId: string, requestAcknowledgement?: boolean) => Promise<void>;
};

const fieldClass =
  "w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-[#6f6f6f] focus:border-[#AAFF01]/40";

export function GrowthHubActionNotePanel({
  actions,
  weeklyNotes,
  reports,
  canManageActions,
  canManageNotes,
  canManageReports,
  isActionsLoading = false,
  isNotesLoading = false,
  isReportsLoading = false,
  onCreateAction,
  onUpdateAction,
  onDeleteAction,
  onCreateWeeklyNote,
  onUpdateWeeklyNote,
  onCreateReport,
  onUpdateReport,
  onPublishReport,
}: GrowthHubActionNotePanelProps) {
  const [actionTitle, setActionTitle] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionPriority, setActionPriority] = useState<GrowthHubActionMutationRequest["priority"]>("MEDIUM");
  const [actionDueAt, setActionDueAt] = useState("");
  const [actionClientVisible, setActionClientVisible] = useState(true);
  const defaultWeek = useMemo(() => getDefaultWeekDates(), []);
  const [weekStart, setWeekStart] = useState(defaultWeek.weekStart);
  const [weekEnd, setWeekEnd] = useState(defaultWeek.weekEnd);
  const [noteSummary, setNoteSummary] = useState("");
  const [noteNextFocus, setNoteNextFocus] = useState("");
  const [noteClientVisible, setNoteClientVisible] = useState(true);
  const [reportPeriodStart, setReportPeriodStart] = useState(defaultWeek.weekStart);
  const [reportPeriodEnd, setReportPeriodEnd] = useState(defaultWeek.weekEnd);
  const [reportType, setReportType] = useState<GrowthHubReportMutationRequest["type"]>("WEEKLY");
  const [reportSummary, setReportSummary] = useState("");
  const [reportClientVisible, setReportClientVisible] = useState(true);
  const [reportRequestAcknowledgement, setReportRequestAcknowledgement] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleActionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageActions || actionTitle.trim().length < 2) {
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);
    try {
      await onCreateAction({
        title: actionTitle.trim(),
        description: actionDescription.trim() || null,
        priority: actionPriority,
        dueAt: actionDueAt || null,
        clientVisible: actionClientVisible,
      });
      setActionTitle("");
      setActionDescription("");
      setActionDueAt("");
      setFormMessage({ type: "success", text: "Growth action kaydedildi." });
    } catch (error) {
      setFormMessage({ type: "error", text: extractApiErrorMessage(error, "Growth action kaydedilemedi.") });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageNotes || noteSummary.trim().length < 2) {
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);
    try {
      await onCreateWeeklyNote({
        weekStart,
        weekEnd,
        summary: noteSummary.trim(),
        nextFocus: noteNextFocus.trim() || null,
        clientVisible: noteClientVisible,
      });
      setNoteSummary("");
      setNoteNextFocus("");
      setFormMessage({ type: "success", text: "Weekly note kaydedildi." });
    } catch (error) {
      setFormMessage({ type: "error", text: extractApiErrorMessage(error, "Weekly note kaydedilemedi.") });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageReports || !reportType || reportSummary.trim().length < 2) {
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);
    try {
      await onCreateReport({
        periodStart: reportPeriodStart,
        periodEnd: reportPeriodEnd,
        type: reportType,
        summary: reportSummary.trim(),
        clientVisible: reportClientVisible,
        requestAcknowledgement: reportRequestAcknowledgement,
      });
      setReportSummary("");
      setFormMessage({ type: "success", text: "Growth Hub raporu kaydedildi." });
    } catch (error) {
      setFormMessage({ type: "error", text: extractApiErrorMessage(error, "Growth Hub raporu kaydedilemedi.") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {formMessage ? (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            formMessage.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {formMessage.text}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <form onSubmit={handleActionSubmit} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">Growth Action</p>
            <Badge variant="outline">{actions.length} kayıt</Badge>
          </div>
          <div className="space-y-3">
            <input
              className={fieldClass}
              value={actionTitle}
              onChange={(event) => setActionTitle(event.target.value)}
              placeholder="Aksiyon başlığı"
              disabled={!canManageActions}
            />
            <textarea
              className={`${fieldClass} min-h-20 resize-none`}
              value={actionDescription}
              onChange={(event) => setActionDescription(event.target.value)}
              placeholder="Kısa açıklama"
              disabled={!canManageActions}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={fieldClass}
                value={actionPriority}
                onChange={(event) =>
                  setActionPriority(event.target.value as GrowthHubActionMutationRequest["priority"])
                }
                disabled={!canManageActions}
              >
                {growthHubActionPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className={fieldClass}
                type="date"
                value={actionDueAt}
                onChange={(event) => setActionDueAt(event.target.value)}
                disabled={!canManageActions}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#D6D6D6]">
              <input
                type="checkbox"
                checked={actionClientVisible}
                onChange={(event) => setActionClientVisible(event.target.checked)}
                disabled={!canManageActions}
              />
              Client görünür
            </label>
            <Button type="submit" size="sm" disabled={!canManageActions || isSubmitting || actionTitle.trim().length < 2}>
              <CheckCircle2 className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </form>

        <form onSubmit={handleNoteSubmit} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">Weekly Note</p>
            <Badge variant="outline">{weeklyNotes.length} kayıt</Badge>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                type="date"
                value={weekStart}
                onChange={(event) => setWeekStart(event.target.value)}
                disabled={!canManageNotes}
              />
              <input
                className={fieldClass}
                type="date"
                value={weekEnd}
                onChange={(event) => setWeekEnd(event.target.value)}
                disabled={!canManageNotes}
              />
            </div>
            <textarea
              className={`${fieldClass} min-h-24 resize-none`}
              value={noteSummary}
              onChange={(event) => setNoteSummary(event.target.value)}
              placeholder="Haftalık özet"
              disabled={!canManageNotes}
            />
            <input
              className={fieldClass}
              value={noteNextFocus}
              onChange={(event) => setNoteNextFocus(event.target.value)}
              placeholder="Sonraki odak"
              disabled={!canManageNotes}
            />
            <label className="flex items-center gap-2 text-sm text-[#D6D6D6]">
              <input
                type="checkbox"
                checked={noteClientVisible}
                onChange={(event) => setNoteClientVisible(event.target.checked)}
                disabled={!canManageNotes}
              />
              Client görünür
            </label>
            <Button type="submit" size="sm" disabled={!canManageNotes || isSubmitting || noteSummary.trim().length < 2}>
              <CheckCircle2 className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </form>

        <form onSubmit={handleReportSubmit} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">Growth Report</p>
            <Badge variant="outline">{reports.length} kayıt</Badge>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={fieldClass}
                type="date"
                value={reportPeriodStart}
                onChange={(event) => setReportPeriodStart(event.target.value)}
                disabled={!canManageReports}
              />
              <input
                className={fieldClass}
                type="date"
                value={reportPeriodEnd}
                onChange={(event) => setReportPeriodEnd(event.target.value)}
                disabled={!canManageReports}
              />
            </div>
            <select
              className={fieldClass}
              value={reportType}
              onChange={(event) =>
                setReportType(event.target.value as GrowthHubReportMutationRequest["type"])
              }
              disabled={!canManageReports}
            >
              {growthHubReportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <textarea
              className={`${fieldClass} min-h-24 resize-none`}
              value={reportSummary}
              onChange={(event) => setReportSummary(event.target.value)}
              placeholder="Rapor özeti"
              disabled={!canManageReports}
            />
            <div className="grid gap-2 text-sm text-[#D6D6D6] sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportClientVisible}
                  onChange={(event) => setReportClientVisible(event.target.checked)}
                  disabled={!canManageReports}
                />
                Client görünür
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportRequestAcknowledgement}
                  onChange={(event) => setReportRequestAcknowledgement(event.target.checked)}
                  disabled={!canManageReports}
                />
                Teyit iste
              </label>
            </div>
            <Button type="submit" size="sm" disabled={!canManageReports || isSubmitting || reportSummary.trim().length < 2}>
              <FileText className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Aksiyonlar</p>
          {isActionsLoading ? (
            <p className="mt-2 text-sm text-[#A0A0A0]">Aksiyonlar yükleniyor...</p>
          ) : actions.length ? (
            <div className="mt-2 space-y-2">
              {actions.slice(0, 6).map((action) => (
                <div key={`${action.type}-${action.id}`} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{action.title}</p>
                      <p className="mt-1 text-xs text-[#A0A0A0]">
                        {getGrowthHubActionTypeLabel(action.type)} • {formatGrowthHubDateTime(action.dueAt ?? action.updatedAt)}
                      </p>
                    </div>
                    {action.type === "GROWTH_ACTION" ? (
                      <Badge variant="outline">{getGrowthHubActionStatusLabel(action.status)}</Badge>
                    ) : null}
                  </div>
                  {action.description ? (
                    <p className="mt-2 text-xs leading-relaxed text-[#D6D6D6]">{action.description}</p>
                  ) : null}
                  {action.type === "GROWTH_ACTION" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">{getGrowthHubActionPriorityLabel(action.priority)}</span>
                      <span className="text-xs text-[#A0A0A0]">
                        {action.clientVisible ? "Client görünür" : "Internal"}
                      </span>
                      {canManageActions ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateAction(action.id, { status: nextActionStatus(action.status) })}
                          >
                            {nextActionStatusLabel(action.status)}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateAction(action.id, { clientVisible: !action.clientVisible })}
                          >
                            {action.clientVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => onDeleteAction(action.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#A0A0A0]">Growth action bulunmuyor.</p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Weekly Notes</p>
          {isNotesLoading ? (
            <p className="mt-2 text-sm text-[#A0A0A0]">Weekly note yükleniyor...</p>
          ) : weeklyNotes.length ? (
            <div className="mt-2 space-y-2">
              {weeklyNotes.slice(0, 4).map((note) => (
                <div key={note.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-white">{formatGrowthHubDateTime(note.weekStart)}</p>
                    <Badge variant="outline">{note.clientVisible ? "Client görünür" : "Internal"}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#D6D6D6]">{note.summary}</p>
                  {note.nextFocus ? (
                    <p className="mt-2 text-xs leading-relaxed text-[#A0A0A0]">Odak: {note.nextFocus}</p>
                  ) : null}
                  {canManageNotes ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => onUpdateWeeklyNote(note.id, { clientVisible: !note.clientVisible })}
                    >
                      {note.clientVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {note.clientVisible ? "Gizle" : "Göster"}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#A0A0A0]">Weekly note bulunmuyor.</p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#7A7A7A]">Growth Reports</p>
          {isReportsLoading ? (
            <p className="mt-2 text-sm text-[#A0A0A0]">Growth report yükleniyor...</p>
          ) : reports.length ? (
            <div className="mt-2 space-y-2">
              {reports.slice(0, 4).map((report) => (
                <div key={report.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{getGrowthHubReportTypeLabel(report.type)}</p>
                      <p className="mt-1 text-xs text-[#A0A0A0]">
                        {formatGrowthHubDateTime(report.periodEnd)} • {getGrowthHubReportAcknowledgementStatusLabel(report.acknowledgementStatus)}
                      </p>
                    </div>
                    <Badge variant="outline">{getGrowthHubReportStatusLabel(report.status)}</Badge>
                  </div>
                  {report.summary ? (
                    <p className="mt-2 text-xs leading-relaxed text-[#D6D6D6]">{report.summary}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#A0A0A0]">
                      {report.clientVisible ? "Client görünür" : "Internal"}
                    </span>
                    {canManageReports ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onPublishReport(report.id, true)}
                          disabled={report.acknowledgementStatus === "PENDING"}
                        >
                          <Send className="h-4 w-4" />
                          Yayınla + teyit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateReport(report.id, { clientVisible: !report.clientVisible })}
                        >
                          {report.clientVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#A0A0A0]">Growth report bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getDefaultWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay() === 0 ? 6 : monday.getDay() - 1;
  monday.setDate(monday.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: toDateInputValue(monday),
    weekEnd: toDateInputValue(sunday),
  };
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextActionStatus(status: GrowthHubActionStatus | null | undefined): GrowthHubActionStatus {
  if (status === "TODO") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "DONE";
  if (status === "BLOCKED") return "IN_PROGRESS";
  return "TODO";
}

function nextActionStatusLabel(status: GrowthHubActionStatus | null | undefined): string {
  if (status === "TODO") return "Başlat";
  if (status === "IN_PROGRESS") return "Tamamla";
  if (status === "BLOCKED") return "Aç";
  return "Yapılacak";
}
