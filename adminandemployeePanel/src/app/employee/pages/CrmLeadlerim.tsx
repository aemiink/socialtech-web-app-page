import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CalendarClock, Clock, PhoneCall, Search, Target } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetCrmLeadsQuery } from "../../features/crm/crmApi";
import type { CrmLead, CrmLeadStatus } from "../../features/crm/crmTypes";
import {
  CRM_LEAD_STATUS_OPTIONS,
  extractCrmApiErrorMessage,
  formatCrmDateTime,
  getCrmLeadStatusClass,
  getCrmLeadStatusLabel,
  getTodayIsoRange,
} from "../../features/crm/crmUtils";
import { useAppSelector } from "../../store/hooks";

export function CrmLeadlerim() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canRead =
    currentUser?.role === "CRM_SPECIALIST" &&
    currentUser.permissions.includes("crm.leads.read.assigned");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CrmLeadStatus | "ALL">("ALL");

  const query = useMemo(
    () => ({
      page: 1,
      limit: 50,
      sortBy: "nextFollowUpAt" as const,
      sortOrder: "asc" as const,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status === "ALL" ? {} : { status }),
    }),
    [search, status],
  );

  const { data, error, isError, isFetching, isLoading, refetch } = useGetCrmLeadsQuery(query, {
    skip: !canRead,
  });
  const leads = data?.data ?? [];
  const kpis = calculateCrmKpis(leads);

  if (!canRead) {
    return <PanelState tone="error" text="CRM leadlerini görüntüleme yetkiniz bulunmuyor." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">CRM Leadlerim</h1>
          <p className="text-[#A0A0A0]">Size atanmış satış görüşmeleri ve takipler</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          Yenile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<CalendarClock />} label="Bugün Takip" value={kpis.today} />
        <MetricCard icon={<AlertCircle />} label="Geciken" value={kpis.overdue} tone="danger" />
        <MetricCard icon={<PhoneCall />} label="Yeni Lead" value={kpis.newLeads} />
        <MetricCard icon={<Target />} label="Qualified" value={kpis.qualified} />
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              aria-label="CRM lead ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Şirket, kontak veya iletişim ara..."
              className="border-white/[0.06] bg-[#202020] pl-10 text-white"
            />
          </div>
          <select
            aria-label="CRM durum filtresi"
            value={status}
            onChange={(event) => setStatus(event.target.value as CrmLeadStatus | "ALL")}
            className="h-10 rounded-md border border-white/[0.06] bg-[#202020] px-3 text-sm text-white"
          >
            <option value="ALL">Tüm Durumlar</option>
            {CRM_LEAD_STATUS_OPTIONS.filter((option) => option !== "WON").map((option) => (
              <option key={option} value={option}>
                {getCrmLeadStatusLabel(option)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading && <PanelState text="CRM leadleri yükleniyor..." />}
      {!isLoading && isError && (
        <PanelState tone="error" text={extractCrmApiErrorMessage(error, "CRM leadleri alınamadı.")} />
      )}
      {!isLoading && !isError && leads.length === 0 && (
        <PanelState text="Size atanmış CRM lead bulunmuyor." />
      )}
      {!isLoading && !isError && leads.length > 0 && (
        <Card className="overflow-hidden border-white/[0.06] bg-[#1A1A1A]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#202020]">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Şirket</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Kontak</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Durum</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Sonraki Takip</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]">Son Aktivite</th>
                  <th className="p-4 text-left text-sm font-medium text-[#A0A0A0]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-white">{lead.companyName}</td>
                    <td className="p-4 text-sm text-[#A0A0A0]">
                      <div className="text-white">{lead.contactName}</div>
                      <div>{lead.contactEmail ?? lead.phone ?? "—"}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={getCrmLeadStatusClass(lead.status)}>
                        {getCrmLeadStatusLabel(lead.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{formatCrmDateTime(lead.nextFollowUpAt)}</td>
                    <td className="p-4 text-sm text-[#A0A0A0]">{lead.latestActivity?.note ?? "—"}</td>
                    <td className="p-4">
                      <Link to={`/employee/crm/leads/${lead.id}`}>
                        <Button type="button" size="sm" variant="outline">Detay</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!isLoading && !isError && isFetching && (
        <p className="text-xs text-[#d2ff8a]">CRM leadleri güncelleniyor...</p>
      )}
    </div>
  );
}

function calculateCrmKpis(leads: CrmLead[]) {
  const today = getTodayIsoRange();
  const now = new Date().toISOString();
  return {
    today: leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt >= today.from && lead.nextFollowUpAt <= today.to).length,
    overdue: leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt < now && lead.status !== "WON" && lead.status !== "LOST").length,
    newLeads: leads.filter((lead) => lead.status === "NEW").length,
    qualified: leads.filter((lead) => lead.status === "QUALIFIED").length,
  };
}

function MetricCard({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: number; tone?: "default" | "danger" }) {
  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className={tone === "danger" ? "text-red-300" : "text-[#AAFF01]"}>{icon}</span>
        <span className="text-sm text-[#A0A0A0]">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </Card>
  );
}

function PanelState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <Card className={`border-white/[0.06] bg-[#1A1A1A] p-6 text-sm ${tone === "error" ? "text-red-200" : "text-[#A0A0A0]"}`}>
      {text}
    </Card>
  );
}
