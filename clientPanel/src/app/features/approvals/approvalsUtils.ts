import type { ClientApprovalStatus, ClientApprovalType } from "./approvalsTypes";

export function getClientApprovalStatusLabel(status: ClientApprovalStatus): string {
  const labels: Record<ClientApprovalStatus, string> = {
    PENDING: "Bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    ACKNOWLEDGED: "Okundu",
    CANCELLED: "İptal Edildi",
    EXPIRED: "Süresi Doldu",
  };
  return labels[status] ?? status;
}

export function getClientApprovalTypeLabel(type: ClientApprovalType): string {
  const labels: Record<ClientApprovalType, string> = {
    DESIGN_APPROVAL: "Tasarım Onayı",
    FILE_APPROVAL: "Dosya Onayı",
    TASK_APPROVAL: "Görev Onayı",
    SPRINT_APPROVAL: "Sprint Onayı",
    RELEASE_APPROVAL: "Release Onayı",
    REVISION_APPROVAL: "Revizyon Onayı",
    MEETING_CONFIRMATION: "Toplantı Onayı",
    INFORMATION: "Bilgilendirme",
    GENERAL_CONFIRMATION: "Genel Onay",
  };
  return labels[type] ?? type;
}

export function getClientApprovalStatusBadgeClass(status: ClientApprovalStatus): string {
  const classes: Record<ClientApprovalStatus, string> = {
    PENDING: "border-amber-300/40 bg-amber-500/15 text-amber-200",
    APPROVED: "border-[#AAFF01]/40 bg-[#AAFF01]/15 text-[#D8FFC0]",
    REJECTED: "border-red-400/40 bg-red-500/15 text-red-200",
    ACKNOWLEDGED: "border-cyan-300/40 bg-cyan-500/15 text-cyan-200",
    CANCELLED: "border-zinc-300/30 bg-zinc-500/10 text-zinc-200",
    EXPIRED: "border-orange-300/40 bg-orange-500/15 text-orange-200",
  };
  return classes[status] ?? "border-white/10 bg-white/5 text-white";
}
