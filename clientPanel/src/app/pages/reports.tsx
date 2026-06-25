import { useEffect, useRef, useState } from "react";
import { Printer, Eye, BarChart2, CalendarDays, CheckCircle2, ClipboardList, AlertTriangle, FileText, Download } from "lucide-react";
import { Button } from "../components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { webAppWorkspaceApi, useGetWebAppWorkspaceReportsQuery } from "../features/webAppWorkspace/webAppWorkspaceApi";
import type { WorkspaceWeeklyReport } from "../features/webAppWorkspace/webAppWorkspaceTypes";
import { createWorkspaceSocket, type WorkspaceUpdateEvent } from "../features/webAppWorkspace/workspaceSocket";
import { selectAccessToken, selectCurrentUser } from "../features/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useGetOwnMetaAdsReportsQuery } from "../features/metaAds/metaAdsApi";
import type { MetaAdsReportItem } from "../features/metaAds/metaAdsTypes";
import { useGetOwnSocialMediaReportsQuery } from "../features/socialMedia/socialMediaApi";
import type { SocialMediaReportItem } from "../features/socialMedia/socialMediaTypes";
import { useGetOwnTikTokAdsReportsQuery } from "../features/tiktokAds/tiktokAdsApi";
import type { TikTokAdsReportItem } from "../features/tiktokAds/tiktokAdsTypes";
import { useGetOwnAmazonAdsReportsQuery } from "../features/amazonAds/amazonAdsApi";
import type { AmazonAdsReportItem } from "../features/amazonAds/amazonAdsTypes";
import { getActivePurchasedServiceIds } from "../features/auth/authNormalizers";
import { cn } from "../lib/utils";
import type { ServiceId } from "../data/service-pages";
import { useGetClientProjectFilesQuery } from "../features/projectFiles/projectFilesApi";
import type { ProjectFile } from "../features/projectFiles/projectFilesTypes";

// ─── Turkish date formatting ────────────────────────────────────────────────

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatTurkishDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateRange(start: string, end: string): string {
  return `${formatTurkishDate(start)} – ${formatTurkishDate(end)}`;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
    })} MB`;
  }

  return `${Math.ceil(bytes / 1024).toLocaleString("tr-TR")} KB`;
}

// ─── Skeleton card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5">
      <div className="mb-3 h-4 w-48 rounded bg-white/10" />
      <div className="mb-2 h-3 w-full rounded bg-white/[0.07]" />
      <div className="h-3 w-3/4 rounded bg-white/[0.07]" />
    </div>
  );
}

// ─── Weekly Report Modal ─────────────────────────────────────────────────────

interface WeeklyReportModalProps {
  report: WorkspaceWeeklyReport | null;
  open: boolean;
  onClose: () => void;
}

function WeeklyReportModal({ report, open, onClose }: WeeklyReportModalProps) {
  if (!report) return null;

  const period = formatDateRange(report.weekStartDate, report.weekEndDate);

  const accomplishmentLines = report.accomplishments
    ? report.accomplishments.split("\n").filter((l) => l.trim().length > 0)
    : [];

  const plannedLines = report.plannedNext
    ? report.plannedNext.split("\n").filter((l) => l.trim().length > 0)
    : [];

  const blockerLines = report.blockers
    ? report.blockers.split("\n").filter((l) => l.trim().length > 0)
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/[0.08] bg-[#131313] text-white print:max-h-none print:overflow-visible">
        {/* Print styles injected inline so they apply inside the modal */}
        <style>{`
          @media print {
            body > *:not(#report-print-root) { display: none !important; }
            #report-print-root { display: block !important; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>

        <DialogHeader className="print:hidden">
          <DialogTitle className="text-xl text-white">Haftalık İlerleme Raporu</DialogTitle>
        </DialogHeader>

        {/* Document body */}
        <div id="report-print-root" className="space-y-0">
          {/* Report header */}
          <div className="rounded-xl border border-[#AAFF01]/20 bg-[#1A1A1A] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#AAFF01]">Social Tech</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Haftalık İlerleme Raporu</h2>
                <p className="mt-1 text-sm text-[#A0A0A0]">{period}</p>
              </div>
              <div className="text-right text-xs text-[#A0A0A0]">
                <p>Oluşturulma</p>
                <p className="font-medium text-white">{formatTurkishDate(report.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-6 py-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A0A0A0]">Özet</p>
            <p className="leading-relaxed text-white">{report.summary}</p>
          </div>

          {/* Accomplishments */}
          {accomplishmentLines.length > 0 && (
            <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-6 py-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
                <p className="text-sm font-semibold text-white">Tamamlananlar</p>
              </div>
              <ul className="space-y-1.5">
                {accomplishmentLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#CFCFCF]">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#AAFF01]" />
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Planned next */}
          {plannedLines.length > 0 && (
            <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-6 py-5">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#60A5FA]" />
                <p className="text-sm font-semibold text-white">Planlananlar</p>
              </div>
              <ul className="space-y-1.5">
                {plannedLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#CFCFCF]">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#60A5FA]" />
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers */}
          {blockerLines.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-300">Engeller</p>
              </div>
              <ul className="space-y-1.5">
                {blockerLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-200/80">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 print:hidden">
          <Button variant="secondary" onClick={onClose}>
            Kapat
          </Button>
          <Button
            variant="primary"
            icon={Printer}
            onClick={() => window.print()}
          >
            Yazdır / PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Meta Ads Report Modal ───────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<string, string> = {
  WEEKLY: "Haftalık",
  MONTHLY: "Aylık",
  CAMPAIGN_PERFORMANCE: "Kampanya Performansı",
  CREATIVE_PERFORMANCE: "Kreatif Performansı",
  BUDGET_RECOMMENDATION: "Bütçe Önerisi",
};

const ACK_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NOT_REQUESTED: { label: "Onay Beklemiyor", className: "bg-white/10 text-[#A0A0A0]" },
  PENDING: { label: "Onay Bekleniyor", className: "bg-amber-500/20 text-amber-300" },
  ACKNOWLEDGED: { label: "Onaylandı", className: "bg-[#AAFF01]/20 text-[#AAFF01]" },
  CHANGES_REQUESTED: { label: "Değişiklik İstendi", className: "bg-red-500/20 text-red-400" },
};

interface MetaAdsReportModalProps {
  report: MetaAdsReportItem | null;
  open: boolean;
  onClose: () => void;
}

function MetaAdsReportModal({ report, open, onClose }: MetaAdsReportModalProps) {
  if (!report) return null;

  const period = formatDateRange(report.periodStart, report.periodEnd);
  const typeLabel = REPORT_TYPE_LABELS[report.type] ?? report.type;
  const ackStyle = ACK_STATUS_LABELS[report.acknowledgementStatus] ?? ACK_STATUS_LABELS["NOT_REQUESTED"];

  // Extract key metrics from metricsSnapshot
  const metrics = report.metricsSnapshot;
  const metricChips: Array<{ label: string; value: string }> = [];

  if (metrics) {
    const addChip = (key: string, label: string, suffix = "", isInt = false) => {
      const raw = metrics[key];
      if (typeof raw === "number" && isFinite(raw)) {
        const formatted = isInt
          ? raw.toLocaleString("tr-TR")
          : raw.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        metricChips.push({ label, value: `${formatted}${suffix}` });
      }
    };
    addChip("spend", "Harcama", " ₺");
    addChip("impressions", "Gösterim", "", true);
    addChip("clicks", "Tıklama", "", true);
    addChip("ctr", "CTR", "%");
    addChip("cpc", "TBT", " ₺");
    addChip("roas", "ROAS", "x");
    addChip("results", "Sonuç", "", true);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/[0.08] bg-[#131313] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Meta Ads Raporu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report header info */}
          <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#AAFF01]">Social Tech · Meta Ads</p>
                <h2 className="mt-1 text-lg font-bold text-white">{typeLabel} Raporu</h2>
                <p className="mt-0.5 text-sm text-[#A0A0A0]">{period}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", ackStyle.className)}>
                  {ackStyle.label}
                </span>
                {report.publishedAt && (
                  <span className="rounded-full bg-[#AAFF01]/20 px-3 py-1 text-xs font-medium text-[#AAFF01]">
                    Yayınlandı
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {report.summary && (
            <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A0A0A0]">Özet</p>
              <p className="leading-relaxed text-[#CFCFCF]">{report.summary}</p>
            </div>
          )}

          {/* Metrics chips */}
          {metricChips.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#A0A0A0]">Temel Metrikler</p>
              <div className="flex flex-wrap gap-2">
                {metricChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="flex flex-col rounded-lg border border-white/[0.08] bg-[#202020] px-3 py-2"
                  >
                    <span className="text-xs text-[#A0A0A0]">{chip.label}</span>
                    <span className="text-sm font-semibold text-white">{chip.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acknowledgement dates */}
          {report.acknowledgedAt && (
            <div className="flex items-center gap-2 rounded-xl border border-[#AAFF01]/20 bg-[#AAFF01]/5 px-5 py-3">
              <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
              <p className="text-sm text-[#CFCFCF]">
                Onaylandı: <span className="font-medium text-white">{formatTurkishDate(report.acknowledgedAt)}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Weekly Reports Tab ──────────────────────────────────────────────────────

interface WeeklyReportsTabProps {
  projectId: string | null | undefined;
  reports: WorkspaceWeeklyReport[];
  isLoading: boolean;
}

function WeeklyReportsTab({ projectId, reports, isLoading }: WeeklyReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<WorkspaceWeeklyReport | null>(null);

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Bu alanı görüntülemek için bir proje seçin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yayınlanmış rapor bulunmuyor.</p>
        <p className="mt-1 text-sm text-white/30">Raporlar ekibiniz tarafından haftalık olarak eklenir.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {reports.map((report) => {
          const period = formatDateRange(report.weekStartDate, report.weekEndDate);
          const hasBlockers = report.blockers && report.blockers.trim().length > 0;

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CalendarDays className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                    <p className="text-sm font-semibold text-white">{period}</p>
                    {hasBlockers && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                        Engelleyici var
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">
                    {report.summary}
                  </p>
                  {report.accomplishments && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#AAFF01]/80">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Tamamlananlar mevcut</span>
                    </div>
                  )}
                  {report.plannedNext && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#60A5FA]/80">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Planlananlar mevcut</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setSelectedReport(report)}
                  >
                    Görüntüle
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WeeklyReportModal
        report={selectedReport}
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
}

function UploadedReportFilesTab({ projectId }: { projectId?: string | null }) {
  const { data, isLoading } = useGetClientProjectFilesQuery(
    { projectId: projectId ?? "", category: "REPORT" },
    { skip: !projectId },
  );
  const reports = data?.data ?? [];

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Yüklenen raporlar için bir proje seçin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yüklenmiş rapor dosyası yok.</p>
        <p className="mt-1 text-sm text-white/30">Ekibinizin paylaştığı PDF, sunum ve dosya raporları burada görünür.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <UploadedReportFileCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function UploadedReportFileCard({ report }: { report: ProjectFile }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
            <p className="text-sm font-semibold text-white">{report.title}</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#A0A0A0]">
              {formatFileSize(report.bytes)}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#A0A0A0]">{report.description || report.originalFileName}</p>
          <p className="mt-2 text-xs text-white/30">{formatTurkishDate(report.createdAt)}</p>
        </div>
        <a
          href={report.secureUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white transition hover:border-[#AAFF01]/30 hover:bg-white/[0.05]"
        >
          <Download className="h-4 w-4" />
          Raporu Aç
        </a>
      </div>
    </div>
  );
}

// ─── Meta Ads Reports Tab ────────────────────────────────────────────────────

function MetaAdsReportsTab() {
  const [selectedReport, setSelectedReport] = useState<MetaAdsReportItem | null>(null);
  const { data, isLoading } = useGetOwnMetaAdsReportsQuery();
  const visibleReports = (data?.data ?? []).filter((r) => r.clientVisible);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (visibleReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart2 className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yayınlanmış Meta Ads raporu bulunmuyor.</p>
        <p className="mt-1 text-sm text-white/30">Raporlar ekibiniz tarafından periyodik olarak eklenir.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {visibleReports.map((report) => {
          const period = formatDateRange(report.periodStart, report.periodEnd);
          const typeLabel = REPORT_TYPE_LABELS[report.type] ?? report.type;
          const ackStyle = ACK_STATUS_LABELS[report.acknowledgementStatus] ?? ACK_STATUS_LABELS["NOT_REQUESTED"];

          // Collect up to 3 key metric chips for card preview
          const previewChips: string[] = [];
          if (report.metricsSnapshot) {
            const m = report.metricsSnapshot;
            if (typeof m.spend === "number") previewChips.push(`₺${(m.spend as number).toFixed(2)} Harcama`);
            if (typeof m.impressions === "number") previewChips.push(`${(m.impressions as number).toLocaleString("tr-TR")} Gösterim`);
            if (typeof m.clicks === "number") previewChips.push(`${(m.clicks as number).toLocaleString("tr-TR")} Tıklama`);
          }

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BarChart2 className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                    <p className="text-sm font-semibold text-white">{period}</p>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#A0A0A0]">
                      {typeLabel}
                    </span>
                    {report.status === "PUBLISHED" && (
                      <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-xs text-[#AAFF01]">
                        Yayında
                      </span>
                    )}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", ackStyle.className)}>
                      {ackStyle.label}
                    </span>
                  </div>

                  {report.summary && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">
                      {report.summary}
                    </p>
                  )}

                  {previewChips.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {previewChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-lg border border-white/[0.08] bg-[#202020] px-2 py-0.5 text-xs text-[#CFCFCF]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setSelectedReport(report)}
                  >
                    Raporu İncele
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MetaAdsReportModal
        report={selectedReport}
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
}

// ─── Social Media Reports Tab ────────────────────────────────────────────────

function SocialMediaReportsTab() {
  const { data, isLoading } = useGetOwnSocialMediaReportsQuery();
  const visible = (data?.data ?? []).filter((r: SocialMediaReportItem) => r.clientVisible);

  if (isLoading) {
    return <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>;
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart2 className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yayınlanmış Sosyal Medya raporu bulunmuyor.</p>
        <p className="mt-1 text-sm text-white/30">Raporlar ekibiniz tarafından periyodik olarak eklenir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((report: SocialMediaReportItem) => {
        const period = formatDateRange(report.periodStart, report.periodEnd);
        const ackStyle = ACK_STATUS_LABELS[report.acknowledgementStatus] ?? ACK_STATUS_LABELS["NOT_REQUESTED"];
        return (
          <div key={report.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <BarChart2 className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                  <p className="text-sm font-semibold text-white">{period}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#A0A0A0]">{REPORT_TYPE_LABELS[report.type] ?? report.type}</span>
                  {report.status === "PUBLISHED" && <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-xs text-[#AAFF01]">Yayında</span>}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", ackStyle.className)}>{ackStyle.label}</span>
                </div>
                {report.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">{report.summary}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TikTok Ads Reports Tab ──────────────────────────────────────────────────

function TikTokAdsReportsTab() {
  const { data, isLoading } = useGetOwnTikTokAdsReportsQuery();
  const visible = (data?.data ?? []).filter((r: TikTokAdsReportItem) => r.clientVisible);

  if (isLoading) {
    return <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>;
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart2 className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yayınlanmış TikTok Ads raporu bulunmuyor.</p>
        <p className="mt-1 text-sm text-white/30">Raporlar ekibiniz tarafından periyodik olarak eklenir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((report: TikTokAdsReportItem) => {
        const period = formatDateRange(report.periodStart, report.periodEnd);
        const ackStyle = ACK_STATUS_LABELS[report.acknowledgementStatus] ?? ACK_STATUS_LABELS["NOT_REQUESTED"];
        return (
          <div key={report.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <BarChart2 className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                  <p className="text-sm font-semibold text-white">{period}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#A0A0A0]">{REPORT_TYPE_LABELS[report.type] ?? report.type}</span>
                  {report.status === "PUBLISHED" && <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-xs text-[#AAFF01]">Yayında</span>}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", ackStyle.className)}>{ackStyle.label}</span>
                </div>
                {report.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">{report.summary}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Amazon Ads Reports Tab ──────────────────────────────────────────────────

function AmazonAdsReportsTab() {
  const { data, isLoading } = useGetOwnAmazonAdsReportsQuery();
  const visible = (data?.data ?? []).filter((r: AmazonAdsReportItem) => r.clientVisible);

  if (isLoading) {
    return <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>;
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart2 className="mb-4 h-12 w-12 text-white/20" />
        <p className="text-base font-medium text-white/60">Henüz yayınlanmış Amazon Ads raporu bulunmuyor.</p>
        <p className="mt-1 text-sm text-white/30">Raporlar ekibiniz tarafından periyodik olarak eklenir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((report: AmazonAdsReportItem) => {
        const period = formatDateRange(report.periodStart, report.periodEnd);
        const ackStyle = ACK_STATUS_LABELS[report.acknowledgementStatus] ?? ACK_STATUS_LABELS["NOT_REQUESTED"];
        return (
          <div key={report.id} className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 transition-colors hover:border-white/[0.14]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <BarChart2 className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                  <p className="text-sm font-semibold text-white">{period}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#A0A0A0]">{REPORT_TYPE_LABELS[report.type] ?? report.type}</span>
                  {report.status === "PUBLISHED" && <span className="rounded-full bg-[#AAFF01]/20 px-2 py-0.5 text-xs text-[#AAFF01]">Yayında</span>}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", ackStyle.className)}>{ackStyle.label}</span>
                </div>
                {report.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#A0A0A0]">{report.summary}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Service-aware tab resolution ───────────────────────────────────────────

type Tab = "weekly" | "uploaded" | "meta-ads" | "social-media" | "tiktok-ads" | "amazon-ads";

const TAB_LABELS: Record<Tab, string> = {
  "weekly": "Haftalık Raporlar",
  "uploaded": "Yüklenen Raporlar",
  "meta-ads": "Meta Ads",
  "social-media": "Sosyal Medya",
  "tiktok-ads": "TikTok Ads",
  "amazon-ads": "Amazon Ads",
};

const SERVICE_TAB_MAP: Partial<Record<ServiceId, Tab>> = {
  "web-app":      "weekly",
  "meta-ads":     "meta-ads",
  "social-media": "social-media",
  "tiktok-ads":   "tiktok-ads",
  "amazon-ads":   "amazon-ads",
};

const NO_REPORT_SERVICES = new Set<ServiceId>([
  "growth-hub",
  "google-ads",
  "mobile-app",
  "landing-pages",
  "web-mobile-design",
  "technical-support",
  "seo-audit",
  "media-hub",
]);

// ─── Main ReportsPage ────────────────────────────────────────────────────────

export function ReportsPage({
  projectId,
  selectedService,
}: {
  projectId?: string | null;
  selectedService?: ServiceId | null;
}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const lastWorkspaceSequenceRef = useRef(0);

  // Determine which tabs this client can see based on purchased services
  const activePurchasedServiceIds = currentUser
    ? getActivePurchasedServiceIds(currentUser)
    : [];
  const activeTabs = (["weekly", "uploaded", "meta-ads", "social-media", "tiktok-ads", "amazon-ads"] as Tab[]).filter((tab) => {
    if (tab === "weekly")       return activePurchasedServiceIds.includes("web-app");
    if (tab === "uploaded")     return Boolean(projectId);
    if (tab === "meta-ads")     return activePurchasedServiceIds.includes("meta-ads");
    if (tab === "social-media") return activePurchasedServiceIds.includes("social-media");
    if (tab === "tiktok-ads")   return activePurchasedServiceIds.includes("tiktok-ads");
    if (tab === "amazon-ads")   return activePurchasedServiceIds.includes("amazon-ads");
    return false;
  });

  // Default tab: prefer the one matching selectedService, else first available
  const defaultTab: Tab =
    (selectedService && SERVICE_TAB_MAP[selectedService] && activeTabs.includes(SERVICE_TAB_MAP[selectedService]!))
      ? SERVICE_TAB_MAP[selectedService]!
      : (activeTabs[0] ?? "weekly");

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const { data: reports = [], isLoading } = useGetWebAppWorkspaceReportsQuery(
    { projectId: projectId ?? "" },
    { skip: !projectId },
  );

  // ── Socket real-time updates ─────────────────────────────────────────────
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

  // When selectedService changes, switch to the matching tab if available
  useEffect(() => {
    if (!selectedService) return;
    const matchingTab = SERVICE_TAB_MAP[selectedService];
    if (matchingTab && activeTabs.includes(matchingTab)) {
      setActiveTab(matchingTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  // ── No-report service guard ──────────────────────────────────────────────
  const isNoReportService = selectedService && NO_REPORT_SERVICES.has(selectedService) && !projectId;

  return (
    <div className="min-h-full bg-[#131313]">
      <div className="max-w-5xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-6">

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Raporlar</h1>
          <p className="text-[#A0A0A0]">Proje ilerleme ve performans raporlarınız</p>
        </div>

        {/* No-report service: show informational state */}
        {isNoReportService && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1A1A1A] py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <FileText className="h-7 w-7 text-white/20" />
            </div>
            <p className="text-base font-semibold text-white/60">Bu hizmet için henüz rapor mevcut değil</p>
            <p className="mt-2 max-w-xs text-sm text-white/30 leading-relaxed">
              Raporlar ekibiniz tarafından bu alan için yakında yayınlanacak.
            </p>
          </div>
        )}

        {/* Tab navigation — only show when multiple tabs are available and service has reports */}
        {!isNoReportService && activeTabs.length > 1 && (
          <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-1">
            {activeTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-[#AAFF01] text-black shadow-[0_0_20px_rgba(170,255,1,0.25)]"
                    : "text-[#A0A0A0] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {!isNoReportService && (
          <div>
            {activeTab === "weekly" && activeTabs.includes("weekly") && (
              <WeeklyReportsTab
                projectId={projectId}
                reports={reports}
                isLoading={isLoading}
              />
            )}
            {activeTab === "uploaded" && activeTabs.includes("uploaded") && (
              <UploadedReportFilesTab projectId={projectId} />
            )}
            {activeTab === "meta-ads" && activeTabs.includes("meta-ads") && (
              <MetaAdsReportsTab />
            )}
            {activeTab === "social-media" && activeTabs.includes("social-media") && (
              <SocialMediaReportsTab />
            )}
            {activeTab === "tiktok-ads" && activeTabs.includes("tiktok-ads") && (
              <TikTokAdsReportsTab />
            )}
            {activeTab === "amazon-ads" && activeTabs.includes("amazon-ads") && (
              <AmazonAdsReportsTab />
            )}
            {activeTabs.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1A1A1A] py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <FileText className="h-7 w-7 text-white/20" />
                </div>
                <p className="text-base font-semibold text-white/60">Henüz erişilebilir rapor yok</p>
                <p className="mt-2 text-sm text-white/30">Aktif hizmetlerinize ait raporlar burada görünecek.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
