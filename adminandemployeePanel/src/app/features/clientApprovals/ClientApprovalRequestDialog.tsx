import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import type { ProjectAssigneeCandidate } from "../projects/projectsTypes";
import { useCreateClientApprovalMutation } from "./clientApprovalsApi";
import type {
  ClientApproval,
  ClientApprovalComposerPreset,
  ClientApprovalContextOption,
  ClientApprovalType,
  CreateClientApprovalRequest,
} from "./clientApprovalsTypes";
import {
  CLIENT_APPROVAL_TYPE_OPTIONS,
  extractClientApprovalApiErrorMessage,
  getClientApprovalTypeLabel,
} from "./clientApprovalsUtils";

type ClientApprovalRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientProfileId: string;
  projectId?: string | null;
  serviceKey?: CreateClientApprovalRequest["serviceKey"];
  assigneeOptions?: ProjectAssigneeCandidate[];
  contextOptions?: ClientApprovalContextOption[];
  dialogTitle?: string;
  dialogDescription?: string;
  submitLabel?: string;
  preset?: ClientApprovalComposerPreset;
  onCreated?: (approval: ClientApproval) => void;
};

type ClientApprovalFormState = {
  type: ClientApprovalType;
  title: string;
  message: string;
  assignedToUserId: string;
  requiresExplicitApproval: boolean;
  dueAt: string;
  contextKey: string;
};

export function ClientApprovalRequestDialog({
  open,
  onOpenChange,
  clientProfileId,
  projectId,
  serviceKey,
  assigneeOptions = [],
  contextOptions = [],
  dialogTitle = "Müşteri Onayı Oluştur",
  dialogDescription = "Onay talebi veya bilgilendirme kaydı oluşturun.",
  submitLabel = "Kaydı Oluştur",
  preset,
  onCreated,
}: ClientApprovalRequestDialogProps) {
  const defaultContextKey = useMemo(
    () => preset?.contextKey ?? contextOptions[0]?.key ?? "",
    [contextOptions, preset?.contextKey],
  );
  const [form, setForm] = useState<ClientApprovalFormState>(() =>
    buildInitialFormState(defaultContextKey, preset),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [createClientApproval, { isLoading }] = useCreateClientApprovalMutation();

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialFormState(defaultContextKey, preset));
    setFeedback(null);
    setFormError(null);
  }, [defaultContextKey, open, preset]);

  const selectedContext = useMemo(
    () => contextOptions.find((option) => option.key === form.contextKey) ?? null,
    [contextOptions, form.contextKey],
  );

  const isInformationType = form.type === "INFORMATION";

  const handleSubmit = async () => {
    const title = form.title.trim();
    const message = form.message.trim();

    if (title.length < 2) {
      setFormError("Başlık en az 2 karakter olmalıdır.");
      return;
    }

    if (message.length < 2) {
      setFormError("Mesaj en az 2 karakter olmalıdır.");
      return;
    }

    try {
      setFormError(null);
      setFeedback(null);
      const created = await createClientApproval({
        clientProfileId,
        projectId: projectId ?? null,
        serviceKey: serviceKey ?? null,
        assignedToUserId: form.assignedToUserId || null,
        type: form.type,
        title,
        message,
        entityType: selectedContext?.entityType ?? null,
        entityId: selectedContext?.entityId ?? null,
        actionPayload: selectedContext?.actionPayload ?? null,
        requiresExplicitApproval: form.requiresExplicitApproval,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      }).unwrap();

      setFeedback(isInformationType ? "Bilgilendirme gönderildi." : "Müşteri onayı oluşturuldu.");
      onCreated?.(created);
      onOpenChange(false);
    } catch (error) {
      setFormError(extractClientApprovalApiErrorMessage(error, "Onay kaydı oluşturulamadı."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-approval-type">Kayıt Türü</Label>
              <select
                id="client-approval-type"
                value={form.type}
                onChange={(event) => {
                  const nextType = event.target.value as ClientApprovalType;
                  setForm((prev) => ({
                    ...prev,
                    type: nextType,
                    requiresExplicitApproval:
                      nextType === "INFORMATION" ? false : prev.requiresExplicitApproval,
                  }));
                  setFeedback(null);
                  setFormError(null);
                }}
                className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
              >
                {CLIENT_APPROVAL_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getClientApprovalTypeLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-approval-assignee">Takip Sorumlusu</Label>
              <select
                id="client-approval-assignee"
                value={form.assignedToUserId}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, assignedToUserId: event.target.value }));
                  setFeedback(null);
                  setFormError(null);
                }}
                className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
              >
                <option value="">Atama yok</option>
                {assigneeOptions.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.displayName?.trim() || candidate.id} ({candidate.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {contextOptions.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="client-approval-context">Bağlı Kayıt</Label>
              <select
                id="client-approval-context"
                value={form.contextKey}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, contextKey: event.target.value }));
                  setFeedback(null);
                  setFormError(null);
                }}
                className="h-10 w-full rounded-md border border-white/[0.08] bg-[#202020] px-3 text-sm text-white outline-none transition-colors hover:border-white/[0.12] focus:border-[#AAFF01]/50"
              >
                {contextOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedContext?.description ? (
                <p className="text-xs text-[#A0A0A0]">{selectedContext.description}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="client-approval-title">Başlık</Label>
            <Input
              id="client-approval-title"
              value={form.title}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, title: event.target.value }));
                setFeedback(null);
                setFormError(null);
              }}
              className="border-white/[0.08] bg-[#202020]"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-approval-message">Mesaj</Label>
            <Textarea
              id="client-approval-message"
              value={form.message}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, message: event.target.value }));
                setFeedback(null);
                setFormError(null);
              }}
              className="min-h-28 border-white/[0.08] bg-[#202020]"
              maxLength={4000}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="space-y-2">
              <Label htmlFor="client-approval-due-date">Yanıt Son Tarihi</Label>
              <Input
                id="client-approval-due-date"
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, dueAt: event.target.value }));
                  setFeedback(null);
                  setFormError(null);
                }}
                className="border-white/[0.08] bg-[#202020]"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#202020] px-3 py-3 text-sm text-[#D8D8D8]">
              <Checkbox
                checked={form.requiresExplicitApproval}
                onCheckedChange={(checked) => {
                  setForm((prev) => ({
                    ...prev,
                    requiresExplicitApproval: checked === true,
                  }));
                  setFeedback(null);
                  setFormError(null);
                }}
                disabled={isInformationType}
              />
              {isInformationType
                ? "Bilgilendirme kaydı için açık onay aranmaz."
                : "Müşteriden açık onay beklensin."}
            </label>
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {formError}
            </div>
          ) : null}
          {feedback ? (
            <div className="rounded-lg border border-[#AAFF01]/20 bg-[#AAFF01]/10 px-3 py-2 text-sm text-[#D2FF8A]">
              {feedback}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Vazgeç
          </Button>
          <Button
            type="button"
            className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
            onClick={() => void handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? "Kaydediliyor..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildInitialFormState(
  defaultContextKey: string,
  preset?: ClientApprovalComposerPreset,
): ClientApprovalFormState {
  return {
    type: preset?.type ?? "GENERAL_CONFIRMATION",
    title: preset?.title ?? "",
    message: preset?.message ?? "",
    assignedToUserId: preset?.assignedToUserId ?? "",
    requiresExplicitApproval: preset?.requiresExplicitApproval ?? true,
    dueAt: preset?.dueAt ?? "",
    contextKey: preset?.contextKey ?? defaultContextKey,
  };
}
