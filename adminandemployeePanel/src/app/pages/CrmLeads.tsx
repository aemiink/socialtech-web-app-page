import type { ReactNode } from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { CalendarClock, Plus, Search, Target, Trophy, Users } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGetAdminUsersQuery } from "../features/adminUsers/adminUsersApi";
import { selectCurrentUser, hasAdminPermission } from "../features/auth/authSelectors";
import {
  useCreateAdminCrmLeadMutation,
  useGetAdminCrmLeadsQuery,
} from "../features/crm/crmApi";
import type { CrmLeadStatus } from "../features/crm/crmTypes";
import {
  CRM_LEAD_STATUS_OPTIONS,
  extractCrmApiErrorMessage,
  formatCrmDateTime,
  getCrmLeadSourceLabel,
  getCrmLeadStatusClass,
  getCrmLeadStatusLabel,
  getTodayIsoRange,
} from "../features/crm/crmUtils";
import { useAppSelector } from "../store/hooks";

const SEARCH_DEBOUNCE_MS = 275;

type CreateFormState = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  ownerUserId: string;
  initialNote: string;
  nextFollowUpAt: string;
};

const initialCreateForm: CreateFormState = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  phone: "",
  ownerUserId: "",
  initialNote: "",
  nextFollowUpAt: "",
};

export function CrmLeads() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canRead = hasAdminPermission(currentUser, ["crm.leads.read.any"]);
  const canManage = hasAdminPermission(currentUser, ["crm.leads.manage.any"]);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CrmLeadStatus | "ALL">("ALL");
  const [ownerSearchInput, setOwnerSearchInput] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setOwnerSearch(ownerSearchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [ownerSearchInput]);

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
      ...(search ? { search } : {}),
      ...(status === "ALL" ? {} : { status }),
    }),
    [page, search, status],
  );
  const { data, currentData, error, isError, isFetching, isLoading, refetch } =
    useGetAdminCrmLeadsQuery(query, { skip: !canRead });
  const crmOwnersQuery = {
    accountType: "EMPLOYEE" as const,
    role: "CRM_SPECIALIST" as const,
    isActive: true,
    limit: 8,
    ...(ownerSearch ? { search: ownerSearch } : {}),
  };
  const { data: ownerResponse } = useGetAdminUsersQuery(crmOwnersQuery, {
    skip: !isCreateOpen || !canManage,
  });
  const [createLead, { isLoading: isCreating }] = useCreateAdminCrmLeadMutation();
  const response = currentData ?? data;
  const leads = response?.data ?? [];
  const meta = response?.meta;
  const today = getTodayIsoRange();
  const todayFollowUps = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) return false;
    return lead.nextFollowUpAt >= today.from && lead.nextFollowUpAt <= today.to;
  }).length;
  const qualified = leads.filter((lead) => lead.status === "QUALIFIED").length;
  const wonLost = leads.filter((lead) => lead.status === "WON" || lead.status === "LOST").length;

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    if (!createForm.companyName.trim() || !createForm.contactName.trim() || !createForm.ownerUserId) {
      setCreateError("Şirket, kontak ve CRM sahibi seçimi gereklidir.");
      return;
    }

    try {
      await createLead({
        companyName: createForm.companyName.trim(),
        contactName: createForm.contactName.trim(),
        ...(createForm.contactEmail.trim() ? { contactEmail: createForm.contactEmail.trim() } : {}),
        ...(createForm.phone.trim() ? { phone: createForm.phone.trim() } : {}),
        ownerUserId: createForm.ownerUserId,
        source: "MANUAL",
        ...(createForm.nextFollowUpAt ? { nextFollowUpAt: new Date(createForm.nextFollowUpAt).toISOString() } : {}),
        ...(createForm.initialNote.trim() ? { initialNote: createForm.initialNote.trim() } : {}),
      }).unwrap();
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      setOwnerSearchInput("");
    } catch (createErrorValue) {
      setCreateError(extractCrmApiErrorMessage(createErrorValue, "CRM lead oluşturulamadı."));
    }
  }

  if (!canRead) {
    return <UnauthorizedState text="CRM leadlerini görüntülemek için crm.leads.read.any yetkisi gerekir." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-white">CRM</h1>
          <p className="text-sm text-[#A0A0A0]">Satış lead kuyruğu ve iletişim takibi</p>
        </div>
        <Button
          className="gap-2 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
          disabled={!canManage}
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Lead Oluştur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Users />} label="Listelenen Lead" value={String(meta?.total ?? leads.length)} />
        <MetricCard icon={<CalendarClock />} label="Bugün Takip" value={String(todayFollowUps)} />
        <MetricCard icon={<Target />} label="Qualified" value={String(qualified)} />
        <MetricCard icon={<Trophy />} label="Won/Lost" value={String(wonLost)} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              aria-label="CRM lead ara"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Şirket, kontak, e-posta veya telefon ara..."
              className="border-white/[0.06] bg-[#202020] pl-10 text-white"
            />
          </div>
          <select
            aria-label="CRM durum filtresi"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as CrmLeadStatus | "ALL");
              setPage(1);
            }}
            className="h-10 rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white"
          >
            <option value="ALL">Tüm Durumlar</option>
            {CRM_LEAD_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{getCrmLeadStatusLabel(option)}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>Yenile</Button>
        </div>
      </Card>

      {isLoading && <PanelState text="CRM leadleri yükleniyor..." />}
      {!isLoading && isError && (
        <PanelState text={extractCrmApiErrorMessage(error, "CRM leadleri alınamadı.")} tone="error" />
      )}
      {!isLoading && !isError && leads.length === 0 && <PanelState text="Henüz CRM lead bulunmuyor." />}
      {!isLoading && !isError && leads.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <table className="w-full">
            <thead className="border-b border-white/[0.06] bg-[#202020]">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Şirket</th>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kontak</th>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Sahip</th>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Takip</th>
                <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="font-medium text-white">{lead.companyName}</div>
                    <div className="text-xs text-[#A0A0A0]">{getCrmLeadSourceLabel(lead.source)}</div>
                  </td>
                  <td className="p-4 text-sm text-[#A0A0A0]">
                    <div className="text-white">{lead.contactName}</div>
                    <div>{lead.contactEmail ?? lead.phone ?? "—"}</div>
                  </td>
                  <td className="p-4"><Badge className={getCrmLeadStatusClass(lead.status)}>{getCrmLeadStatusLabel(lead.status)}</Badge></td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{lead.owner.displayName ?? lead.owner.email}</td>
                  <td className="p-4 text-sm text-[#A0A0A0]">{formatCrmDateTime(lead.nextFollowUpAt)}</td>
                  <td className="p-4"><Link to={`/crm/${lead.id}`}><Button size="sm" variant="outline">Detay</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && (
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 text-sm text-[#A0A0A0]">
              <span>Sayfa {meta.page}/{meta.totalPages} · {meta.total} kayıt</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>Önceki</Button>
                <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((prev) => prev + 1)}>Sonraki</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle>CRM Lead Oluştur</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">Lead manuel eklenir ve aktif CRM çalışanına atanır.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            {createError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{createError}</div>}
            <FormInput label="Şirket" value={createForm.companyName} onChange={(value) => setCreateForm((prev) => ({ ...prev, companyName: value }))} />
            <FormInput label="Kontak" value={createForm.contactName} onChange={(value) => setCreateForm((prev) => ({ ...prev, contactName: value }))} />
            <FormInput label="E-posta" type="email" value={createForm.contactEmail} onChange={(value) => setCreateForm((prev) => ({ ...prev, contactEmail: value }))} />
            <FormInput label="Telefon" value={createForm.phone} onChange={(value) => setCreateForm((prev) => ({ ...prev, phone: value }))} />
            <FormInput label="Sonraki Takip" type="datetime-local" value={createForm.nextFollowUpAt} onChange={(value) => setCreateForm((prev) => ({ ...prev, nextFollowUpAt: value }))} />
            <div className="space-y-2">
              <Label htmlFor="crm-owner-search" className="text-xs text-[#A0A0A0]">CRM Sahibi</Label>
              <Input id="crm-owner-search" value={ownerSearchInput} onChange={(event) => setOwnerSearchInput(event.target.value)} placeholder="CRM çalışanı ara..." className="border-white/[0.06] bg-[#202020] text-white" />
              <div className="rounded-lg border border-white/[0.06] bg-[#202020]">
                {(ownerResponse?.data ?? []).map((owner) => {
                  const selected = createForm.ownerUserId === owner.id;
                  return (
                    <button
                      key={owner.id}
                      type="button"
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5 ${selected ? "bg-[#AAFF01]/10" : ""}`}
                      onClick={() => setCreateForm((prev) => ({ ...prev, ownerUserId: owner.id }))}
                    >
                      <span><span className="text-white">{owner.displayName ?? owner.email}</span><span className="block text-xs text-[#A0A0A0]">{owner.email}</span></span>
                      <Badge className={selected ? "bg-[#AAFF01] text-[#131313]" : undefined}>{selected ? "Seçili" : "Seç"}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
            <FormInput label="İlk Not" value={createForm.initialNote} onChange={(value) => setCreateForm((prev) => ({ ...prev, initialNote: value }))} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Vazgeç</Button>
              <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90" disabled={isCreating}>{isCreating ? "Kaydediliyor..." : "Lead Oluştur"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-2 text-[#A0A0A0]"><span className="text-[#AAFF01]">{icon}</span><span className="text-sm">{label}</span></div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </Card>
  );
}

function FormInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  const id = `crm-create-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs text-[#A0A0A0]">{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="border-white/[0.06] bg-[#202020] text-white" />
    </div>
  );
}

function PanelState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return <Card className={`border-white/[0.06] bg-[#1A1A1A] p-6 text-sm ${tone === "error" ? "text-red-200" : "text-[#A0A0A0]"}`}>{text}</Card>;
}

function UnauthorizedState({ text }: { text: string }) {
  return <PanelState text={text} tone="error" />;
}
