import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileImage,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { SocialMediaContentCalendar } from "../employee/components/SocialMediaContentCalendar";
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
import { Textarea } from "../components/ui/textarea";
import { hasAdminPermission, selectCurrentUser } from "../features/auth/authSelectors";
import { useUpdateAdminClientSocialMediaConfigMutation } from "../features/clients/clientsApi";
import type { UpdateAdminClientSocialMediaConfigRequest } from "../features/clients/clientsTypes";
import { extractApiErrorMessage, formatClientDateTime } from "../features/clients/clientsUtils";
import { useGetAdminSocialMediaClientsQuery } from "../features/socialMedia/socialMediaApi";
import type {
  AdminSocialMediaAssignedEmployee,
  AdminSocialMediaClientListItem,
  SocialMediaGoal,
} from "../features/socialMedia/socialMediaTypes";
import {
  formatSocialMediaDateTime,
  getSocialMediaGoalLabel,
  getSocialMediaRiskStatusBadgeClass,
  getSocialMediaRiskStatusLabel,
  getSocialMediaSummaryStateLabel,
} from "../features/socialMedia/socialMediaUtils";
import { useAppSelector } from "../store/hooks";

type ConfigFormState = {
  instagramUsername: string;
  instagramAccountId: string;
  facebookPageId: string;
  tiktokUsername: string;
  linkedinPageUrl: string;
  contentFrequency: string;
  primaryGoal: "" | SocialMediaGoal;
  toneOfVoice: string;
  hashtags: string;
  notes: string;
};

const initialConfigForm: ConfigFormState = {
  instagramUsername: "",
  instagramAccountId: "",
  facebookPageId: "",
  tiktokUsername: "",
  linkedinPageUrl: "",
  contentFrequency: "",
  primaryGoal: "",
  toneOfVoice: "",
  hashtags: "",
  notes: "",
};

const socialMediaGoalOptions: Array<{ value: SocialMediaGoal; label: string }> = [
  { value: "BRAND_AWARENESS", label: "Marka Bilinirliği" },
  { value: "COMMUNITY_GROWTH", label: "Topluluk Büyümesi" },
  { value: "ENGAGEMENT", label: "Etkileşim" },
  { value: "LEAD_GENERATION", label: "Lead Üretimi" },
  { value: "SALES_SUPPORT", label: "Satış Desteği" },
  { value: "REPUTATION", label: "İtibar" },
  { value: "MIXED", label: "Karma" },
];

export function SocialMediaAdmin() {
  const currentUser = useAppSelector(selectCurrentUser);
  const canReadOverview = hasAdminPermission(currentUser, [
    "socialMedia.summary.read.any",
    "socialMedia.config.read.any",
  ]);
  const canManageConfig = hasAdminPermission(currentUser, ["socialMedia.config.manage.any"]);
  const canManagePosts = hasAdminPermission(currentUser, ["socialMedia.posts.manage.any"]);

  const {
    data: response,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAdminSocialMediaClientsQuery(undefined, {
    skip: !canReadOverview,
  });
  const [updateSocialMediaConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAdminClientSocialMediaConfigMutation();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [configTarget, setConfigTarget] = useState<AdminSocialMediaClientListItem | null>(null);
  const [configForm, setConfigForm] = useState<ConfigFormState>(initialConfigForm);
  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const listItems = response?.data ?? [];
  const meta = response?.meta;
  const selectedClient = useMemo(
    () => listItems.find((item) => item.client.id === selectedClientId) ?? listItems[0] ?? null,
    [listItems, selectedClientId],
  );
  const pendingClients = useMemo(
    () =>
      listItems.filter(
        (item) =>
          item.metrics.pendingApprovals > 0 ||
          item.metrics.rejectedPosts > 0 ||
          item.metrics.overdueScheduledPosts > 0,
      ),
    [listItems],
  );

  useEffect(() => {
    if (listItems.length === 0) {
      if (selectedClientId) {
        setSelectedClientId("");
      }
      return;
    }

    if (!selectedClientId || !listItems.some((item) => item.client.id === selectedClientId)) {
      setSelectedClientId(listItems[0].client.id);
    }
  }, [listItems, selectedClientId]);

  function openConfigDialog(client: AdminSocialMediaClientListItem) {
    setPageMessage(null);
    setConfigTarget(client);
    setConfigForm({
      instagramUsername: client.config?.instagramUsername ?? "",
      instagramAccountId: client.config?.instagramAccountId ?? "",
      facebookPageId: client.config?.facebookPageId ?? "",
      tiktokUsername: client.config?.tiktokUsername ?? "",
      linkedinPageUrl: client.config?.linkedinPageUrl ?? "",
      contentFrequency: client.config?.contentFrequency ?? "",
      primaryGoal: client.config?.primaryGoal ?? "",
      toneOfVoice: client.config?.toneOfVoice ?? "",
      hashtags: client.config?.hashtags.join(", ") ?? "",
      notes: client.config?.notes ?? "",
    });
  }

  function closeConfigDialog() {
    if (isUpdatingConfig) {
      return;
    }

    setConfigTarget(null);
    setConfigForm(initialConfigForm);
  }

  function updateConfigField(field: keyof ConfigFormState, value: string) {
    setConfigForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleConfigSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configTarget || !canManageConfig || isUpdatingConfig) {
      return;
    }

    const payload = buildSocialMediaConfigPayload(configForm);
    if (!payload) {
      setPageMessage({ type: "error", text: "En az bir Social Media config alanı girin." });
      return;
    }

    setPageMessage(null);

    try {
      await updateSocialMediaConfig({
        clientId: configTarget.client.id,
        body: payload,
      }).unwrap();
      closeConfigDialog();
      setPageMessage({ type: "success", text: "Social Media config güncellendi." });
    } catch (mutationError) {
      setPageMessage({
        type: "error",
        text: extractApiErrorMessage(mutationError, "Social Media config güncellenemedi."),
      });
    }
  }

  function scrollToCalendar() {
    document.getElementById("social-media-content-calendar")?.scrollIntoView({ behavior: "smooth" });
  }

  if (!canReadOverview) {
    return (
      <div className="p-6">
        <Card className="border-white/[0.08] bg-[#171717] p-6 text-white">
          <h1 className="text-xl font-semibold">Social Media Admin</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">Bu ekran için admin Social Media yetkisi gerekiyor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-[#AAFF01]">Admin Paneli</p>
          <h1 className="text-3xl font-semibold text-white">Social Media Operasyonları</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Social Media hizmeti alan müşteriler, takvim sağlığı, onay bekleyen işler ve kreatif durumları.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={isFetching} type="button" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button disabled={!canManagePosts} type="button" onClick={scrollToCalendar}>
            <CalendarDays className="h-4 w-4" />
            İçerik Takvimi
          </Button>
        </div>
      </div>

      {pageMessage ? (
        <Card
          className={`p-4 text-sm ${
            pageMessage.type === "success"
              ? "border-[#AAFF01]/30 bg-[#AAFF01]/10 text-[#d8ff8f]"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {pageMessage.text}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Users className="h-5 w-5" />} label="Social Media Müşteri" value={meta?.total ?? 0} />
        <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Planlanan Post" value={sumMetric(listItems, "plannedPosts")} />
        <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Yayınlanan" value={sumMetric(listItems, "publishedPosts")} />
        <MetricCard icon={<ShieldAlert className="h-5 w-5" />} label="Onay Bekleyen" value={meta?.pendingApprovals ?? 0} />
        <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Geciken Plan" value={meta?.overdueScheduledPosts ?? 0} />
      </div>

      {isLoading ? (
        <StatusPanel
          icon={<Loader2 className="h-4 w-4 animate-spin" />}
          title="Social Media müşterileri yükleniyor"
          description="Global operasyon özeti hazırlanıyor."
        />
      ) : null}

      {isError ? (
        <StatusPanel
          title="Social Media müşteri listesi alınamadı"
          description={extractApiErrorMessage(error, "Global Social Media endpoint'i hata döndürdü.")}
        />
      ) : null}

      {!isLoading && !isError && listItems.length === 0 ? (
        <StatusPanel
          title="Social Media müşterisi yok"
          description="Aktif Social Media hizmeti olan müşteri bulunamadı."
        />
      ) : null}

      {pendingClients.length > 0 ? (
        <Card className="border-amber-400/20 bg-amber-500/10 p-4 text-amber-100">
          <div className="flex flex-wrap items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">
              {pendingClients.length} müşteride onay, revizyon veya geciken plan aksiyonu var.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-white/[0.08] bg-[#171717] p-5 text-white">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Müşteri Operasyon Listesi</h2>
              <p className="text-sm text-[#A0A0A0]">Risk, atama ve içerik durumlarını hızlı tarama.</p>
            </div>
            {isFetching ? <Badge variant="outline">Güncelleniyor</Badge> : null}
          </div>
          <div className="space-y-3">
            {listItems.map((item) => (
              <button
                key={item.client.id}
                className={`w-full rounded-md border p-4 text-left transition-colors ${
                  selectedClient?.client.id === item.client.id
                    ? "border-[#AAFF01]/60 bg-[#AAFF01]/10"
                    : "border-white/[0.08] bg-[#111] hover:bg-white/[0.04]"
                }`}
                type="button"
                onClick={() => setSelectedClientId(item.client.id)}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-base font-medium">{item.client.companyName}</h3>
                      <Badge className={getSocialMediaRiskStatusBadgeClass(item.risk.status)} variant="outline">
                        {getSocialMediaRiskStatusLabel(item.risk.status)}
                      </Badge>
                      <Badge className="border-white/[0.12] bg-white/[0.04] text-[#E5E5E5]" variant="outline">
                        {getSocialMediaSummaryStateLabel(item.state)}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-[#A0A0A0] sm:grid-cols-2 lg:grid-cols-4">
                      <span>Plan: {formatNumber(item.metrics.plannedPosts)}</span>
                      <span>Yayın: {formatNumber(item.metrics.publishedPosts)}</span>
                      <span>Onay: {formatNumber(item.metrics.pendingApprovals)}</span>
                      <span>Revizyon: {formatNumber(item.metrics.rejectedPosts)}</span>
                    </div>
                  </div>
                  <div className="min-w-[180px] text-xs text-[#A0A0A0]">
                    <p>Specialist: {formatAssignments(item.assignedSocialMediaSpecialists)}</p>
                    <p className="mt-1">Designer: {formatAssignments(item.assignedDesigners)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="border-white/[0.08] bg-[#171717] p-5 text-white">
          {selectedClient ? (
            <SelectedClientPanel
              canManageConfig={canManageConfig}
              canManagePosts={canManagePosts}
              item={selectedClient}
              onCalendarOpen={scrollToCalendar}
              onConfigOpen={openConfigDialog}
            />
          ) : (
            <StatusPanel compact title="Müşteri seçilmedi" description="Detay için listeden bir müşteri seçin." />
          )}
        </Card>
      </div>

      <div id="social-media-content-calendar">
        <SocialMediaContentCalendar scope="admin" />
      </div>

      <Dialog open={Boolean(configTarget)} onOpenChange={(open) => (!open ? closeConfigDialog() : undefined)}>
        <DialogContent className="border-white/[0.08] bg-[#171717] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Social Media Config</DialogTitle>
            <DialogDescription>{configTarget?.client.companyName ?? "Müşteri"} için organik kanal ayarları.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleConfigSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Instagram Username">
                <Input value={configForm.instagramUsername} onChange={(event) => updateConfigField("instagramUsername", event.target.value)} />
              </Field>
              <Field label="Instagram Account ID">
                <Input value={configForm.instagramAccountId} onChange={(event) => updateConfigField("instagramAccountId", event.target.value)} />
              </Field>
              <Field label="Facebook Page ID">
                <Input value={configForm.facebookPageId} onChange={(event) => updateConfigField("facebookPageId", event.target.value)} />
              </Field>
              <Field label="TikTok Username">
                <Input value={configForm.tiktokUsername} onChange={(event) => updateConfigField("tiktokUsername", event.target.value)} />
              </Field>
              <Field label="LinkedIn Page URL">
                <Input value={configForm.linkedinPageUrl} onChange={(event) => updateConfigField("linkedinPageUrl", event.target.value)} />
              </Field>
              <Field label="Content Frequency">
                <Input value={configForm.contentFrequency} onChange={(event) => updateConfigField("contentFrequency", event.target.value)} />
              </Field>
              <Field label="Primary Goal">
                <select
                  className="h-10 rounded-md border border-white/[0.12] bg-[#111] px-3 text-sm text-white outline-none focus:border-[#AAFF01]/60"
                  value={configForm.primaryGoal}
                  onChange={(event) => updateConfigField("primaryGoal", event.target.value)}
                >
                  <option value="">Hedef seçilmedi</option>
                  {socialMediaGoalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tone of Voice">
                <Input value={configForm.toneOfVoice} onChange={(event) => updateConfigField("toneOfVoice", event.target.value)} />
              </Field>
            </div>
            <Field label="Hashtags">
              <Input
                placeholder="#sosyal, #lansman"
                value={configForm.hashtags}
                onChange={(event) => updateConfigField("hashtags", event.target.value)}
              />
            </Field>
            <Field label="Notes">
              <Textarea
                className="min-h-24 border-white/[0.12] bg-[#111] text-white"
                value={configForm.notes}
                onChange={(event) => updateConfigField("notes", event.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button disabled={isUpdatingConfig} type="button" variant="outline" onClick={closeConfigDialog}>
                Vazgeç
              </Button>
              <Button disabled={!canManageConfig || isUpdatingConfig} type="submit">
                {isUpdatingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SelectedClientPanel({
  item,
  canManageConfig,
  canManagePosts,
  onConfigOpen,
  onCalendarOpen,
}: {
  item: AdminSocialMediaClientListItem;
  canManageConfig: boolean;
  canManagePosts: boolean;
  onConfigOpen: (item: AdminSocialMediaClientListItem) => void;
  onCalendarOpen: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{item.client.companyName}</h2>
            <p className="mt-1 text-sm text-[#A0A0A0]">{item.client.slug}</p>
          </div>
          <Badge className={getSocialMediaRiskStatusBadgeClass(item.risk.status)} variant="outline">
            {getSocialMediaRiskStatusLabel(item.risk.status)}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={!canManageConfig} size="sm" type="button" variant="outline" onClick={() => onConfigOpen(item)}>
            <Edit3 className="h-4 w-4" />
            Config Düzenle
          </Button>
          <Button disabled={!canManagePosts} size="sm" type="button" onClick={onCalendarOpen}>
            <CalendarDays className="h-4 w-4" />
            Post Oluştur
          </Button>
          <Link to={`/musteriler/${item.client.id}`}>
            <Button size="sm" type="button" variant="outline">
              <ExternalLink className="h-4 w-4" />
              ClientDetail
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DetailPill label="Planlanan" value={formatNumber(item.metrics.plannedPosts)} />
        <DetailPill label="Yayınlanan" value={formatNumber(item.metrics.publishedPosts)} />
        <DetailPill label="Onay" value={formatNumber(item.metrics.pendingApprovals)} />
        <DetailPill label="Geciken" value={formatNumber(item.metrics.overdueScheduledPosts)} />
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="text-sm font-medium">Config</h3>
        <div className="mt-3 space-y-2 text-sm text-[#A0A0A0]">
          <p>Instagram: <span className="text-white">{item.config?.instagramUsername ?? "—"}</span></p>
          <p>Hedef: <span className="text-white">{getSocialMediaGoalLabel(item.config?.primaryGoal ?? null)}</span></p>
          <p>Frekans: <span className="text-white">{item.config?.contentFrequency ?? "—"}</span></p>
          <p>Son güncelleme: <span className="text-white">{formatClientDateTime(item.meta.lastUpdatedAt)}</span></p>
        </div>
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="text-sm font-medium">Risk Notları</h3>
        <ul className="mt-3 space-y-2 text-sm text-[#A0A0A0]">
          {item.risk.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="text-sm font-medium">Yaklaşan İçerikler</h3>
        {item.contentPlan.upcomingPosts.length === 0 ? (
          <p className="mt-3 text-sm text-[#A0A0A0]">Yaklaşan planlı içerik yok.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {item.contentPlan.upcomingPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="text-sm">
                <p className="break-words text-white">{post.title}</p>
                <p className="text-xs text-[#A0A0A0]">{formatSocialMediaDateTime(post.scheduledAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <FileImage className="h-4 w-4 text-[#AAFF01]" />
          Creative Assets
        </h3>
        <p className="mt-3 text-sm text-[#A0A0A0]">
          {item.creativeAssets.length > 0
            ? `${formatNumber(item.creativeAssets.length)} son kreatif asset görünüyor.`
            : "Kreatif asset yok."}
        </p>
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="text-sm font-medium">Atamalar</h3>
        <div className="mt-3 space-y-2 text-sm text-[#A0A0A0]">
          <p>Social Media: <span className="text-white">{formatAssignments(item.assignedSocialMediaSpecialists)}</span></p>
          <p>Designer: <span className="text-white">{formatAssignments(item.assignedDesigners)}</span></p>
        </div>
      </div>

      <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">
        <h3 className="text-sm font-medium">Son Rapor</h3>
        <p className="mt-3 text-sm text-[#A0A0A0]">Social Media rapor modeli Faz 8 kapsamında açılacak.</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="border-white/[0.08] bg-[#171717] p-5 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#A0A0A0]">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{formatNumber(value)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#AAFF01]/10 text-[#AAFF01]">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-[#111] p-3">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusPanel({
  title,
  description,
  compact = false,
  icon,
}: {
  title: string;
  description: string;
  compact?: boolean;
  icon?: ReactNode;
}) {
  const content = (
    <div className="flex items-center gap-3">
      {icon ? <div className="text-[#AAFF01]">{icon}</div> : null}
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-[#A0A0A0]">{description}</p>
      </div>
    </div>
  );

  if (compact) {
    return <div className="rounded-md border border-white/[0.08] bg-[#111] p-4">{content}</div>;
  }

  return <Card className="border-white/[0.08] bg-[#171717] p-5 text-white">{content}</Card>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase text-[#A0A0A0]">{label}</Label>
      {children}
    </div>
  );
}

function buildSocialMediaConfigPayload(
  form: ConfigFormState,
): UpdateAdminClientSocialMediaConfigRequest | null {
  const payload: UpdateAdminClientSocialMediaConfigRequest = {};

  addOptionalText(payload, "instagramUsername", form.instagramUsername);
  addOptionalText(payload, "instagramAccountId", form.instagramAccountId);
  addOptionalText(payload, "facebookPageId", form.facebookPageId);
  addOptionalText(payload, "tiktokUsername", form.tiktokUsername);
  addOptionalText(payload, "linkedinPageUrl", form.linkedinPageUrl);
  addOptionalText(payload, "contentFrequency", form.contentFrequency);
  addOptionalText(payload, "toneOfVoice", form.toneOfVoice);
  addOptionalText(payload, "notes", form.notes);

  if (form.primaryGoal) {
    payload.primaryGoal = form.primaryGoal;
  }

  const hashtags = form.hashtags
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, items) => item.length > 0 && items.indexOf(item) === index);
  if (hashtags.length > 0) {
    payload.hashtags = hashtags;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function addOptionalText<K extends keyof UpdateAdminClientSocialMediaConfigRequest>(
  payload: UpdateAdminClientSocialMediaConfigRequest,
  key: K,
  value: string,
): void {
  const normalizedValue = value.trim();
  if (normalizedValue.length > 0) {
    payload[key] = normalizedValue as UpdateAdminClientSocialMediaConfigRequest[K];
  }
}

function sumMetric(
  items: AdminSocialMediaClientListItem[],
  key: keyof Pick<
    AdminSocialMediaClientListItem["metrics"],
    "plannedPosts" | "publishedPosts" | "pendingApprovals" | "rejectedPosts"
  >,
): number {
  return items.reduce((sum, item) => sum + item.metrics[key], 0);
}

function formatAssignments(assignments: AdminSocialMediaAssignedEmployee[]): string {
  if (assignments.length === 0) {
    return "Atama yok";
  }

  return assignments.map((assignment) => assignment.displayName || assignment.email).join(", ");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
