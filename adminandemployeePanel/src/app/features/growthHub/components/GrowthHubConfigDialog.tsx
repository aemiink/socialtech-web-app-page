import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type { UpdateAdminClientGrowthHubConfigRequest } from "../../clients/clientsTypes";
import type { GrowthHubConfig, GrowthHubGoal } from "../growthHubTypes";
import { growthHubGoalOptions, growthHubStatusOptions } from "../growthHubUtils";

type GrowthHubConfigDialogProps = {
  open: boolean;
  title: string;
  description: string;
  config: GrowthHubConfig | null;
  isSaving: boolean;
  errorMessage: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateAdminClientGrowthHubConfigRequest) => Promise<void>;
};

type GrowthHubConfigFormState = {
  primaryGoal: "" | GrowthHubGoal;
  targetLeads: string;
  targetRoas: string;
  targetCpa: string;
  targetRevenue: string;
  reportingDay: string;
  notes: string;
  status: GrowthHubConfig["status"];
};

const initialFormState: GrowthHubConfigFormState = {
  primaryGoal: "",
  targetLeads: "",
  targetRoas: "",
  targetCpa: "",
  targetRevenue: "",
  reportingDay: "",
  notes: "",
  status: "ACTIVE",
};

export function GrowthHubConfigDialog({
  open,
  title,
  description,
  config,
  isSaving,
  errorMessage,
  onOpenChange,
  onSubmit,
}: GrowthHubConfigDialogProps) {
  const [form, setForm] = useState<GrowthHubConfigFormState>(initialFormState);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      primaryGoal: config?.primaryGoal ?? "",
      targetLeads: formatNullableNumber(config?.targetLeads),
      targetRoas: formatNullableNumber(config?.targetRoas),
      targetCpa: formatNullableNumber(config?.targetCpa),
      targetRevenue: formatNullableNumber(config?.targetRevenue),
      reportingDay: config?.reportingDay ?? "",
      notes: config?.notes ?? "",
      status: config?.status ?? "ACTIVE",
    });
  }, [config, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      primaryGoal: form.primaryGoal || null,
      targetLeads: parseNullableNumber(form.targetLeads),
      targetRoas: parseNullableNumber(form.targetRoas),
      targetCpa: parseNullableNumber(form.targetCpa),
      targetRevenue: parseNullableNumber(form.targetRevenue),
      reportingDay: normalizeNullableText(form.reportingDay),
      notes: normalizeNullableText(form.notes),
      status: form.status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/[0.12] bg-[#171717] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="growth-hub-primary-goal">Primary Goal</Label>
              <Select
                value={form.primaryGoal || "NONE"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    primaryGoal: value === "NONE" ? "" : (value as GrowthHubGoal),
                  }))
                }
              >
                <SelectTrigger id="growth-hub-primary-goal" className="border-white/[0.12] bg-black/20">
                  <SelectValue placeholder="Goal seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Tanımlı değil</SelectItem>
                  {growthHubGoalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="growth-hub-status">Durum</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as GrowthHubConfig["status"],
                  }))
                }
              >
                <SelectTrigger id="growth-hub-status" className="border-white/[0.12] bg-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {growthHubStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              id="growth-hub-target-leads"
              label="Target Leads"
              value={form.targetLeads}
              onChange={(value) => setForm((current) => ({ ...current, targetLeads: value }))}
            />
            <FormField
              id="growth-hub-target-roas"
              label="Target ROAS"
              value={form.targetRoas}
              onChange={(value) => setForm((current) => ({ ...current, targetRoas: value }))}
            />
            <FormField
              id="growth-hub-target-cpa"
              label="Target CPA"
              value={form.targetCpa}
              onChange={(value) => setForm((current) => ({ ...current, targetCpa: value }))}
            />
            <FormField
              id="growth-hub-target-revenue"
              label="Target Revenue"
              value={form.targetRevenue}
              onChange={(value) => setForm((current) => ({ ...current, targetRevenue: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growth-hub-reporting-day">Reporting Day</Label>
            <Input
              id="growth-hub-reporting-day"
              value={form.reportingDay}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  reportingDay: event.target.value,
                }))
              }
              className="border-white/[0.12] bg-black/20 text-white"
              placeholder="MONDAY"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growth-hub-notes">Notes</Label>
            <Textarea
              id="growth-hub-notes"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="border-white/[0.12] bg-black/20 text-white"
              placeholder="Growth Hub operasyon notları"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Config Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function FormField({ id, label, value, onChange }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-white/[0.12] bg-black/20 text-white"
        inputMode="decimal"
      />
    </div>
  );
}

function parseNullableNumber(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function formatNullableNumber(value: number | null | undefined): string {
  return typeof value === "number" ? String(value) : "";
}
