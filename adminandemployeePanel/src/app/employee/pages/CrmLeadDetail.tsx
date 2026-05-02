import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  useCreateCrmLeadActivityMutation,
  useGetCrmLeadQuery,
  useUpdateCrmLeadMutation,
} from "../../features/crm/crmApi";
import type { CrmLeadActivityType, UpdateAssignedCrmLeadRequest } from "../../features/crm/crmTypes";
import {
  CRM_ACTIVITY_OPTIONS,
  extractCrmApiErrorMessage,
  formatCrmDateTime,
  getCrmActivityTypeLabel,
  getCrmLeadStatusClass,
  getCrmLeadStatusLabel,
} from "../../features/crm/crmUtils";
import { useAppSelector } from "../../store/hooks";

const EMPLOYEE_STATUS_OPTIONS: NonNullable<UpdateAssignedCrmLeadRequest["status"]>[] = [
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "LOST",
];

export function CrmLeadDetail() {
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const canRead =
    currentUser?.role === "CRM_SPECIALIST" &&
    currentUser.permissions.includes("crm.leads.read.assigned");
  const canUpdate =
    currentUser?.role === "CRM_SPECIALIST" &&
    currentUser.permissions.includes("crm.leads.update.assigned");
  const { data: lead, error, isError, isLoading } = useGetCrmLeadQuery(id ?? "", {
    skip: !id || !canRead,
  });
  const [updateLead, { isLoading: isUpdating }] = useUpdateCrmLeadMutation();
  const [createActivity, { isLoading: isCreatingActivity }] = useCreateCrmLeadActivityMutation();
  const [status, setStatus] = useState<NonNullable<UpdateAssignedCrmLeadRequest["status"]>>("CONTACTED");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [activityType, setActivityType] = useState<Exclude<CrmLeadActivityType, "STATUS_CHANGE">>("CALL");
  const [activityNote, setActivityNote] = useState("");
  const [activityFollowUpAt, setActivityFollowUpAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (lead && isEmployeeEditableStatus(lead.status)) {
      setStatus(lead.status);
    }
  }, [lead]);

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    const body: UpdateAssignedCrmLeadRequest = {
      ...(lead && status !== lead.status ? { status } : {}),
      ...(nextFollowUpAt ? { nextFollowUpAt: new Date(nextFollowUpAt).toISOString() } : {}),
    };
    if (Object.keys(body).length === 0) {
      setSubmitError("Güncellenecek alan seçilmedi.");
      return;
    }
    setMessage(null);
    setSubmitError(null);
    try {
      await updateLead({
        id,
        body,
      }).unwrap();
      setMessage("Lead takip durumu güncellendi.");
    } catch (updateError) {
      setSubmitError(extractCrmApiErrorMessage(updateError, "Lead güncellenemedi."));
    }
  }

  async function handleActivitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !activityNote.trim()) return;
    setMessage(null);
    setSubmitError(null);
    try {
      await createActivity({
        id,
        body: {
          type: activityType,
          note: activityNote.trim(),
          ...(activityFollowUpAt ? { nextFollowUpAt: new Date(activityFollowUpAt).toISOString() } : {}),
        },
      }).unwrap();
      setActivityNote("");
      setActivityFollowUpAt("");
      setMessage("Aktivite kaydedildi.");
    } catch (activityError) {
      setSubmitError(extractCrmApiErrorMessage(activityError, "Aktivite kaydedilemedi."));
    }
  }

  if (!canRead) {
    return <PanelState tone="error" text="CRM lead detayını görüntüleme yetkiniz bulunmuyor." />;
  }
  if (isLoading) {
    return <PanelState text="CRM lead detayı yükleniyor..." />;
  }
  if (isError || !lead) {
    return <PanelState tone="error" text={extractCrmApiErrorMessage(error, "CRM lead detayı alınamadı.")} />;
  }

  const isConverted = Boolean(lead.convertedClientProfileId) || lead.status === "WON";

  return (
    <div className="space-y-6">
      <div>
        <Link to="/employee/crm/leads" className="mb-3 inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          CRM leadlerime dön
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">{lead.companyName}</h1>
            <p className="text-[#A0A0A0]">{lead.contactName} · {lead.contactEmail ?? lead.phone ?? "iletişim bilgisi yok"}</p>
          </div>
          <Badge className={getCrmLeadStatusClass(lead.status)}>{getCrmLeadStatusLabel(lead.status)}</Badge>
        </div>
      </div>

      {message && <PanelState tone="success" text={message} />}
      {submitError && <PanelState tone="error" text={submitError} />}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold">Lead Özeti</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Sonraki Takip" value={formatCrmDateTime(lead.nextFollowUpAt)} />
              <Info label="Oluşturulma" value={formatCrmDateTime(lead.createdAt)} />
              <Info label="Son Güncelleme" value={formatCrmDateTime(lead.updatedAt)} />
              <Info label="Kaynak" value={lead.source === "MANUAL" ? "Manuel" : "Website Form"} />
            </div>
          </Card>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold">Aktivite Timeline</h2>
            {lead.activities.length === 0 ? (
              <p className="text-sm text-[#A0A0A0]">Henüz aktivite yok.</p>
            ) : (
              <div className="space-y-3">
                {lead.activities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-white/[0.06] bg-[#202020] p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline">{getCrmActivityTypeLabel(activity.type)}</Badge>
                      <span className="text-xs text-[#A0A0A0]">{formatCrmDateTime(activity.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white">{activity.note}</p>
                    {activity.nextFollowUpAt && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-[#d2ff8a]">
                        <CalendarClock className="h-3 w-3" />
                        Takip: {formatCrmDateTime(activity.nextFollowUpAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold">Durum ve Takip</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <Select label="Durum" value={status} onChange={(value) => setStatus(value as NonNullable<UpdateAssignedCrmLeadRequest["status"]>)} disabled={!canUpdate || isUpdating || isConverted}>
                {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{getCrmLeadStatusLabel(option)}</option>
                ))}
              </Select>
              <TextInput label="Sonraki Takip" type="datetime-local" value={nextFollowUpAt} onChange={setNextFollowUpAt} disabled={!canUpdate || isUpdating || isConverted} />
              <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={!canUpdate || isUpdating || isConverted}>
                {isUpdating ? "Kaydediliyor..." : "Takibi Güncelle"}
              </Button>
            </form>
          </Card>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold">Aktivite Ekle</h2>
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <Select label="Aktivite" value={activityType} onChange={(value) => setActivityType(value as Exclude<CrmLeadActivityType, "STATUS_CHANGE">)} disabled={!canUpdate || isCreatingActivity}>
                {CRM_ACTIVITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{getCrmActivityTypeLabel(option)}</option>
                ))}
              </Select>
              <TextInput label="Not" value={activityNote} onChange={setActivityNote} disabled={!canUpdate || isCreatingActivity} />
              <TextInput label="Sonraki Takip" type="datetime-local" value={activityFollowUpAt} onChange={setActivityFollowUpAt} disabled={!canUpdate || isCreatingActivity} />
              <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={!canUpdate || isCreatingActivity}>
                {isCreatingActivity ? "Kaydediliyor..." : "Aktivite Ekle"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function isEmployeeEditableStatus(status: string): status is NonNullable<UpdateAssignedCrmLeadRequest["status"]> {
  return EMPLOYEE_STATUS_OPTIONS.includes(status as NonNullable<UpdateAssignedCrmLeadRequest["status"]>);
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-[#A0A0A0]">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function TextInput({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; type?: string }) {
  const id = `employee-crm-detail-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[#A0A0A0]">{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="border-white/[0.06] bg-[#202020] text-white" />
    </div>
  );
}

function Select({ label, value, onChange, disabled, children }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; children: ReactNode }) {
  const id = `employee-crm-detail-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[#A0A0A0]">{label}</Label>
      <select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-10 w-full rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white">
        {children}
      </select>
    </div>
  );
}

function PanelState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" | "success" }) {
  const className = tone === "error" ? "text-red-200" : tone === "success" ? "text-[#d2ff8a]" : "text-[#A0A0A0]";
  return <Card className={`border-white/[0.06] bg-[#1A1A1A] p-6 text-sm ${className}`}>{text}</Card>;
}
