import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { hasAdminPermission, selectCurrentUser } from "../features/auth/authSelectors";
import {
  useConvertAdminCrmLeadMutation,
  useCreateAdminCrmLeadActivityMutation,
  useGetAdminCrmLeadQuery,
  useUpdateAdminCrmLeadMutation,
} from "../features/crm/crmApi";
import type { CrmLeadActivityType, CrmLeadStatus } from "../features/crm/crmTypes";
import {
  CRM_ACTIVITY_OPTIONS,
  CRM_LEAD_STATUS_OPTIONS,
  extractCrmApiErrorMessage,
  formatCrmDateTime,
  getCrmActivityTypeLabel,
  getCrmLeadStatusClass,
  getCrmLeadStatusLabel,
} from "../features/crm/crmUtils";
import { useAppSelector } from "../store/hooks";

export function CrmLeadDetail() {
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const canRead = hasAdminPermission(currentUser, ["crm.leads.read.any"]);
  const canManage = hasAdminPermission(currentUser, ["crm.leads.manage.any"]);
  const canConvert = hasAdminPermission(currentUser, ["crm.leads.convert"]);
  const { data: lead, error, isError, isLoading } = useGetAdminCrmLeadQuery(id ?? "", {
    skip: !id || !canRead,
  });
  const [updateLead, { isLoading: isUpdating }] = useUpdateAdminCrmLeadMutation();
  const [createActivity, { isLoading: isCreatingActivity }] = useCreateAdminCrmLeadActivityMutation();
  const [convertLead, { isLoading: isConverting }] = useConvertAdminCrmLeadMutation();
  const [status, setStatus] = useState<CrmLeadStatus>("CONTACTED");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [activityType, setActivityType] = useState<Exclude<CrmLeadActivityType, "STATUS_CHANGE">>("CALL");
  const [activityNote, setActivityNote] = useState("");
  const [activityFollowUpAt, setActivityFollowUpAt] = useState("");
  const [clientName, setClientName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
    }
  }, [lead]);

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    const body = {
      ...(lead && status !== lead.status ? { status } : {}),
      ...(nextFollowUpAt ? { nextFollowUpAt: new Date(nextFollowUpAt).toISOString() } : {}),
    };
    if (Object.keys(body).length === 0) {
      setSubmitError("Güncellenecek alan seçilmedi.");
      return;
    }
    setSubmitError(null);
    setMessage(null);
    try {
      await updateLead({
        id,
        body,
      }).unwrap();
      setMessage("Lead durumu güncellendi.");
    } catch (updateError) {
      setSubmitError(extractCrmApiErrorMessage(updateError, "Lead güncellenemedi."));
    }
  }

  async function handleActivitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !activityNote.trim()) return;
    setSubmitError(null);
    setMessage(null);
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

  async function handleConvert() {
    if (!id) return;
    setSubmitError(null);
    setMessage(null);
    try {
      await convertLead({
        id,
        body: {
          ...(clientName.trim() ? { clientName: clientName.trim() } : {}),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        },
      }).unwrap();
      setMessage("Lead müşteri kaydına dönüştürüldü.");
    } catch (convertError) {
      setSubmitError(extractCrmApiErrorMessage(convertError, "Lead convert edilemedi."));
    }
  }

  if (!canRead) {
    return <PanelState text="CRM lead detayını görüntülemek için crm.leads.read.any yetkisi gerekir." tone="error" />;
  }
  if (isLoading) {
    return <PanelState text="CRM lead detayı yükleniyor..." />;
  }
  if (isError || !lead) {
    return <PanelState text={extractCrmApiErrorMessage(error, "CRM lead detayı alınamadı.")} tone="error" />;
  }

  const isConverted = Boolean(lead.convertedClientProfileId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/crm" className="mb-3 inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            CRM listesine dön
          </Link>
          <h1 className="mb-1 text-2xl font-semibold text-white">{lead.companyName}</h1>
          <p className="text-sm text-[#A0A0A0]">{lead.contactName} · {lead.contactEmail ?? lead.phone ?? "iletişim bilgisi yok"}</p>
        </div>
        <Badge className={getCrmLeadStatusClass(lead.status)}>{getCrmLeadStatusLabel(lead.status)}</Badge>
      </div>

      {message && <PanelState text={message} tone="success" />}
      {submitError && <PanelState text={submitError} tone="error" />}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Lead Özeti</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="CRM Sahibi" value={lead.owner.displayName ?? lead.owner.email} />
              <Info label="Sonraki Takip" value={formatCrmDateTime(lead.nextFollowUpAt)} />
              <Info label="Oluşturulma" value={formatCrmDateTime(lead.createdAt)} />
              <Info label="Son Güncelleme" value={formatCrmDateTime(lead.updatedAt)} />
            </div>
            {lead.convertedClientProfile && (
              <Link to={`/musteriler/${lead.convertedClientProfile.id}`} className="mt-4 inline-flex items-center gap-2 text-sm text-[#d2ff8a]">
                <CheckCircle2 className="h-4 w-4" />
                {lead.convertedClientProfile.companyName} müşteri kaydına git
              </Link>
            )}
          </Card>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Aktivite Timeline</h2>
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
            <h2 className="mb-4 text-lg font-semibold text-white">Durum ve Takip</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <Select label="Durum" value={status} onChange={(value) => setStatus(value as CrmLeadStatus)} disabled={!canManage || isUpdating || isConverted}>
                {CRM_LEAD_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{getCrmLeadStatusLabel(option)}</option>
                ))}
              </Select>
              <TextInput label="Sonraki Takip" type="datetime-local" value={nextFollowUpAt} onChange={setNextFollowUpAt} disabled={!canManage || isUpdating || isConverted} />
              <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={!canManage || isUpdating}>{isUpdating ? "Kaydediliyor..." : "Güncelle"}</Button>
            </form>
          </Card>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Aktivite Ekle</h2>
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <Select label="Aktivite" value={activityType} onChange={(value) => setActivityType(value as Exclude<CrmLeadActivityType, "STATUS_CHANGE">)} disabled={!canManage || isCreatingActivity}>
                {CRM_ACTIVITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{getCrmActivityTypeLabel(option)}</option>
                ))}
              </Select>
              <TextInput label="Not" value={activityNote} onChange={setActivityNote} disabled={!canManage || isCreatingActivity} />
              <TextInput label="Sonraki Takip" type="datetime-local" value={activityFollowUpAt} onChange={setActivityFollowUpAt} disabled={!canManage || isCreatingActivity} />
              <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={!canManage || isCreatingActivity}>{isCreatingActivity ? "Kaydediliyor..." : "Aktivite Ekle"}</Button>
            </form>
          </Card>

          <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Müşteriye Dönüştür</h2>
            <div className="space-y-3">
              <TextInput label="Müşteri Adı" value={clientName} onChange={setClientName} disabled={!canConvert || isConverting || isConverted} />
              <TextInput label="Slug" value={slug} onChange={setSlug} disabled={!canConvert || isConverting || isConverted} />
              <Button className="w-full bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={!canConvert || isConverting || isConverted} onClick={handleConvert}>
                {isConverted ? "Zaten Convert Edildi" : isConverting ? "Convert ediliyor..." : "ClientProfile'a Convert Et"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="mb-1 text-xs text-[#A0A0A0]">{label}</p><p className="text-sm font-medium text-white">{value}</p></div>;
}

function TextInput({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; type?: string }) {
  const id = `crm-detail-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return <div className="space-y-2"><Label htmlFor={id} className="text-xs text-[#A0A0A0]">{label}</Label><Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="border-white/[0.06] bg-[#202020] text-white" /></div>;
}

function Select({ label, value, onChange, disabled, children }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; children: ReactNode }) {
  const id = `crm-detail-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return <div className="space-y-2"><Label htmlFor={id} className="text-xs text-[#A0A0A0]">{label}</Label><select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-10 w-full rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white">{children}</select></div>;
}

function PanelState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" | "success" }) {
  const className = tone === "error" ? "text-red-200" : tone === "success" ? "text-[#d2ff8a]" : "text-[#A0A0A0]";
  return <Card className={`border-white/[0.06] bg-[#1A1A1A] p-6 text-sm ${className}`}>{text}</Card>;
}
