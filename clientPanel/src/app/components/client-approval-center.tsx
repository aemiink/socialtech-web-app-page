import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import {
  useAcknowledgeClientApprovalMutation,
  useGetClientApprovalsQuery,
  useRespondClientApprovalMutation,
} from "../features/approvals/approvalsApi";
import {
  getClientApprovalStatusBadgeClass,
  getClientApprovalStatusLabel,
  getClientApprovalTypeLabel,
} from "../features/approvals/approvalsUtils";
import { Button } from "./button";

export function ClientApprovalCenter() {
  const [rejectNote, setRejectNote] = useState("");
  const { data, isFetching } = useGetClientApprovalsQuery({ onlyPending: true }, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [respondApproval, { isLoading: isResponding }] = useRespondClientApprovalMutation();
  const [acknowledgeApproval, { isLoading: isAcknowledging }] = useAcknowledgeClientApprovalMutation();

  const pendingApprovals = data?.data ?? [];
  const activeApproval = pendingApprovals[0] ?? null;
  const queueCount = pendingApprovals.length;
  const isMutating = isResponding || isAcknowledging;
  const canReject = activeApproval?.requiresExplicitApproval ?? false;

  const previewSummary = useMemo(() => {
    if (!activeApproval?.actionPayload || typeof activeApproval.actionPayload !== "object") {
      return null;
    }
    const payload = activeApproval.actionPayload as Record<string, unknown>;
    const summaryEntries: string[] = [];
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        summaryEntries.push(`${key}: ${String(value)}`);
      }
      if (summaryEntries.length >= 4) {
        break;
      }
    }
    return summaryEntries.length > 0 ? summaryEntries : null;
  }, [activeApproval]);

  if (!activeApproval) {
    return null;
  }

  const handleApprove = async () => {
    await respondApproval({ id: activeApproval.id, status: "APPROVED" }).unwrap();
    setRejectNote("");
  };

  const handleReject = async () => {
    await respondApproval({
      id: activeApproval.id,
      status: "REJECTED",
      note: rejectNote.trim() || undefined,
    }).unwrap();
    setRejectNote("");
  };

  const handleAcknowledge = async () => {
    await acknowledgeApproval({ id: activeApproval.id }).unwrap();
    setRejectNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#111111] p-5 shadow-2xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#AAFF01]" />
            <p className="text-sm text-[#D8D8D8]">Müşteri Onay Merkezi</p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${getClientApprovalStatusBadgeClass(activeApproval.status)}`}>
            {getClientApprovalStatusLabel(activeApproval.status)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white">{activeApproval.title}</h3>
        <p className="mt-1 text-xs text-[#A0A0A0]">{getClientApprovalTypeLabel(activeApproval.type)}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#D8D8D8]">{activeApproval.message}</p>

        {previewSummary ? (
          <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#7D7D7D]">İlgili Özet</p>
            <div className="space-y-1">
              {previewSummary.map((line) => (
                <p key={line} className="text-xs text-[#CFCFCF]">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {activeApproval.dueAt ? (
          <p className="mt-3 text-xs text-[#A0A0A0]">
            Son yanıt tarihi: {new Date(activeApproval.dueAt).toLocaleString("tr-TR")}
          </p>
        ) : null}

        {activeApproval.requiresExplicitApproval ? (
          <div className="mt-4 space-y-3">
            <textarea
              className="min-h-20 w-full rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none"
              placeholder="Reddetme notu (opsiyonel)"
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
              disabled={isMutating}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="justify-center bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
                onClick={() => void handleApprove()}
                disabled={isMutating || isFetching}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Onayla
              </Button>
              <Button
                variant="secondary"
                className="justify-center border-red-400/40 text-red-200 hover:bg-red-500/10"
                onClick={() => void handleReject()}
                disabled={isMutating || isFetching || !canReject}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              className="w-full justify-center bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
              onClick={() => void handleAcknowledge()}
              disabled={isMutating || isFetching}
            >
              Okudum / Anladım
            </Button>
          </div>
        )}

        {queueCount > 1 ? (
          <p className="mt-3 text-center text-xs text-[#A0A0A0]">
            Kuyrukta {queueCount - 1} bekleyen popup daha var.
          </p>
        ) : null}
      </div>
    </div>
  );
}
