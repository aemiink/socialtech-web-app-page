import { Link } from "react-router";
import { CalendarClock } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { useGetCrmLeadsQuery } from "../../features/crm/crmApi";
import {
  extractCrmApiErrorMessage,
  formatCrmDateTime,
  getCrmLeadStatusClass,
  getCrmLeadStatusLabel,
  getTodayIsoRange,
} from "../../features/crm/crmUtils";
import { useAppSelector } from "../../store/hooks";

export function BugunkuTakipler() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canRead =
    currentUser?.role === "CRM_SPECIALIST" &&
    currentUser.permissions.includes("crm.leads.read.assigned");
  const today = getTodayIsoRange();
  const { data, error, isError, isLoading, refetch } = useGetCrmLeadsQuery(
    {
      page: 1,
      limit: 50,
      nextFollowUpFrom: today.from,
      nextFollowUpTo: today.to,
      sortBy: "nextFollowUpAt",
      sortOrder: "asc",
    },
    { skip: !canRead },
  );
  const leads = data?.data ?? [];

  if (!canRead) {
    return <PanelState tone="error" text="Bugünkü CRM takiplerini görüntüleme yetkiniz bulunmuyor." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Bugünkü Takipler</h1>
          <p className="text-[#A0A0A0]">Bugün iletişime geçilecek CRM leadleri</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()}>Yenile</Button>
      </div>

      {isLoading && <PanelState text="Bugünkü takipler yükleniyor..." />}
      {!isLoading && isError && (
        <PanelState tone="error" text={extractCrmApiErrorMessage(error, "Bugünkü takipler alınamadı.")} />
      )}
      {!isLoading && !isError && leads.length === 0 && (
        <PanelState text="Bugün için atanmış CRM takibi bulunmuyor." />
      )}
      {!isLoading && !isError && leads.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <Card key={lead.id} className="border-white/[0.06] bg-[#1A1A1A] p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">{lead.companyName}</h2>
                  <p className="text-sm text-[#A0A0A0]">{lead.contactName} · {lead.contactEmail ?? lead.phone ?? "iletişim bilgisi yok"}</p>
                </div>
                <Badge className={getCrmLeadStatusClass(lead.status)}>{getCrmLeadStatusLabel(lead.status)}</Badge>
              </div>
              <p className="mb-4 flex items-center gap-2 text-sm text-[#d2ff8a]">
                <CalendarClock className="h-4 w-4" />
                {formatCrmDateTime(lead.nextFollowUpAt)}
              </p>
              <Link to={`/employee/crm/leads/${lead.id}`}>
                <Button type="button" className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">
                  Takibe Git
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelState({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <Card className={`border-white/[0.06] bg-[#1A1A1A] p-6 text-sm ${tone === "error" ? "text-red-200" : "text-[#A0A0A0]"}`}>
      {text}
    </Card>
  );
}
