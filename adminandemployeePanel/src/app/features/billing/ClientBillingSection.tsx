import { type FormEvent, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { ClientPurchasedService } from "../clients/clientsTypes";
import { getServiceLabel, toBackendServiceKey } from "../clients/clientsUtils";
import { CATALOG_BY_SERVICE_KEY, type PackageTier } from "./packagesCatalog";
import {
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useListInvoicesQuery,
  useUpdateInvoiceMutation,
} from "./billingApi";
import {
  PACKAGE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type BillingPackageType,
  type BillingStatus,
  type ClientInvoice,
} from "./billingTypes";

function derivePackageType(tierKey: string): BillingPackageType {
  const k = tierKey.toUpperCase();
  if (k === "LAUNCH" || k.endsWith("_START")) return "LAUNCH";
  if (k === "GROWTH" || k.endsWith("_GROWTH") || k.endsWith("_PRO")) return "GROWTH";
  if (k === "SCALE" || k.endsWith("_SCALE") || k.endsWith("_BRAND")) return "SCALE";
  return "CUSTOM";
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return `${num.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: BillingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

interface InvoiceRowProps {
  invoice: ClientInvoice;
  clientId: string;
  onExpand: () => void;
  expanded: boolean;
}

function InvoiceRow({ invoice, clientId, onExpand, expanded }: InvoiceRowProps) {
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleStatusChange = async (status: BillingStatus) => {
    setFeedback(null);
    try {
      await updateInvoice({ clientId, invoiceId: invoice.id, data: { status } }).unwrap();
      setFeedback(null);
    } catch {
      setFeedback("Durum güncellenemedi.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`${invoice.invoiceNumber} numaralı fatura silinsin mi?`)) return;
    setFeedback(null);
    try {
      await deleteInvoice({ clientId, invoiceId: invoice.id }).unwrap();
    } catch {
      setFeedback("Fatura silinemedi.");
    }
  };

  const isPaid = invoice.status === "PAID";
  const isCancelled = invoice.status === "CANCELLED";

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="mr-1 text-[#A0A0A0] hover:text-white"
          onClick={onExpand}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <span className="font-mono text-xs text-[#A0A0A0]">{invoice.invoiceNumber}</span>
        <span className="text-sm font-medium text-white">{PACKAGE_LABELS[invoice.packageType]}</span>
        <span className="ml-auto font-semibold text-[#AAFF01]">{formatAmount(invoice.amount, invoice.currency)}</span>
        <StatusBadge status={invoice.status} />
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-[#A0A0A0]">Açıklama</p>
              <p className="mt-0.5 text-white">{invoice.description}</p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0]">Dönem</p>
              <p className="mt-0.5 text-white">
                {invoice.periodStart ? `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0]">Son Ödeme</p>
              <p className="mt-0.5 text-white">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0]">Ödeme Tarihi</p>
              <p className="mt-0.5 text-white">{formatDate(invoice.paidAt)}</p>
            </div>
          </div>

          {invoice.note && (
            <p className="mb-3 rounded-md bg-white/[0.03] px-3 py-2 text-xs text-[#A0A0A0]">{invoice.note}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {!isPaid && !isCancelled && (
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                disabled={isUpdating}
                onClick={() => void handleStatusChange("PAID")}
              >
                <Check className="h-3.5 w-3.5" />
                Ödendi İşaretle
              </Button>
            )}
            {!isCancelled && invoice.status !== "PLANNED" && !isPaid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isUpdating}
                onClick={() => void handleStatusChange("PLANNED")}
              >
                <Clock className="h-3.5 w-3.5" />
                Planlandı
              </Button>
            )}
            {!isCancelled && invoice.status !== "PENDING" && !isPaid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isUpdating}
                onClick={() => void handleStatusChange("PENDING")}
              >
                Bekliyor'a Al
              </Button>
            )}
            {isPaid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isUpdating}
                onClick={() => void handleStatusChange("PENDING")}
              >
                Ödemeyi Geri Al
              </Button>
            )}
            {!isPaid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 border-red-500/30 text-red-300 hover:bg-red-500/10"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Siliniyor..." : "Sil"}
              </Button>
            )}
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-[#AAFF01]" />}
          </div>

          {feedback && <p className="mt-2 text-xs text-red-300">{feedback}</p>}
        </div>
      )}
    </div>
  );
}

interface CreateInvoiceFormProps {
  clientId: string;
  services: ClientPurchasedService[];
  onClose: () => void;
}

function CreateInvoiceForm({ clientId, services, onClose }: CreateInvoiceFormProps) {
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const activeServices = services.filter((s) => s.status === "ACTIVE");

  const [selectedServiceKey, setSelectedServiceKey] = useState<string>(
    activeServices[0]?.serviceKey ?? "",
  );
  const [selectedTierKey, setSelectedTierKey] = useState<string | null>(() => {
    const first = activeServices[0];
    return first?.packageTierKey ?? null;
  });
  const [amount, setAmount] = useState<string>(() => {
    const first = activeServices[0];
    if (!first) return "";
    const bk = toBackendServiceKey(first.serviceKey);
    const tier = first.packageTierKey
      ? CATALOG_BY_SERVICE_KEY[bk]?.tiers.find((t) => t.key === first.packageTierKey)
      : null;
    return tier?.defaultPrice !== null && tier?.defaultPrice !== undefined
      ? String(tier.defaultPrice)
      : "";
  });
  const [description, setDescription] = useState<string>(() => {
    const first = activeServices[0];
    if (!first) return "";
    const label = getServiceLabel(first.serviceKey);
    const bk = toBackendServiceKey(first.serviceKey);
    const tier = first.packageTierKey
      ? CATALOG_BY_SERVICE_KEY[bk]?.tiers.find((t) => t.key === first.packageTierKey)
      : null;
    return tier ? `${label} - ${tier.name} Hizmet Bedeli` : `${label} Hizmet Bedeli`;
  });
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<BillingStatus>("PENDING");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedService = activeServices.find((s) => s.serviceKey === selectedServiceKey);
  const catalogEntry = selectedServiceKey
    ? CATALOG_BY_SERVICE_KEY[toBackendServiceKey(selectedServiceKey as Parameters<typeof toBackendServiceKey>[0])]
    : null;
  const tiers: PackageTier[] = catalogEntry?.tiers ?? [];

  const selectedTier = selectedTierKey ? tiers.find((t) => t.key === selectedTierKey) ?? null : null;

  const handleServiceSelect = (serviceKey: string) => {
    setSelectedServiceKey(serviceKey);
    const svc = activeServices.find((s) => s.serviceKey === serviceKey);
    const bk = toBackendServiceKey(serviceKey as Parameters<typeof toBackendServiceKey>[0]);
    const entry = CATALOG_BY_SERVICE_KEY[bk];
    const tierKey = svc?.packageTierKey ?? null;
    const tier = tierKey ? entry?.tiers.find((t) => t.key === tierKey) ?? null : null;
    setSelectedTierKey(tierKey);
    setAmount(tier?.defaultPrice !== null && tier?.defaultPrice !== undefined ? String(tier.defaultPrice) : "");
    const label = getServiceLabel(serviceKey);
    setDescription(tier ? `${label} - ${tier.name} Hizmet Bedeli` : `${label} Hizmet Bedeli`);
  };

  const handleTierSelect = (tier: PackageTier | null) => {
    setSelectedTierKey(tier?.key ?? null);
    if (tier) {
      if (tier.defaultPrice !== null) setAmount(String(tier.defaultPrice));
      const label = getServiceLabel(selectedServiceKey);
      setDescription(`${label} - ${tier.name} Hizmet Bedeli`);
    }
  };

  const packageType: BillingPackageType = selectedTierKey
    ? derivePackageType(selectedTierKey)
    : "CUSTOM";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    const parsedAmount = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFeedback("Geçerli bir tutar girin.");
      return;
    }
    if (!description.trim()) {
      setFeedback("Açıklama zorunludur.");
      return;
    }
    try {
      await createInvoice({
        clientId,
        data: {
          packageType,
          description: description.trim(),
          amount: parsedAmount,
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          dueDate: dueDate || undefined,
          status,
          note: note.trim() || null,
        },
      }).unwrap();
      onClose();
    } catch {
      setFeedback("Fatura oluşturulamadı. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="rounded-xl border border-[#AAFF01]/20 bg-[#111]/80 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Yeni Fatura</h3>
        <button type="button" onClick={onClose} className="text-[#A0A0A0] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>

        {/* Step 1 – Service */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">
            1. Hizmet Seçin
          </p>
          {activeServices.length === 0 ? (
            <p className="text-xs text-[#A0A0A0]">Bu müşteriye ait aktif hizmet bulunamadı.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeServices.map((svc) => (
                <button
                  key={svc.serviceKey}
                  type="button"
                  onClick={() => handleServiceSelect(svc.serviceKey)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    selectedServiceKey === svc.serviceKey
                      ? "border-[#AAFF01]/50 bg-[#AAFF01]/10 text-[#AAFF01]"
                      : "border-white/10 bg-white/[0.03] text-[#A0A0A0] hover:border-white/20 hover:text-white"
                  }`}
                >
                  {getServiceLabel(svc.serviceKey)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2 – Tier (only if service has catalog tiers) */}
        {selectedServiceKey && tiers.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A0A0A0]">
              2. Paket Seçin
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {tiers.map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => handleTierSelect(tier)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    selectedTierKey === tier.key
                      ? "border-[#AAFF01]/50 bg-[#AAFF01]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <span className={`block font-medium leading-tight ${selectedTierKey === tier.key ? "text-[#AAFF01]" : "text-white"}`}>
                    {tier.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#A0A0A0]">
                    {tier.defaultPrice !== null
                      ? `₺${tier.defaultPrice.toLocaleString("tr-TR")}`
                      : "Özel Fiyat"}
                  </span>
                </button>
              ))}
              {/* Always show a "Özel Fiyat" option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTierKey(null);
                  setAmount("");
                }}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  selectedTierKey === null
                    ? "border-white/30 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <span className="block font-medium leading-tight text-white">Özel Fiyat</span>
                <span className="mt-0.5 block text-[11px] text-[#A0A0A0]">Manuel giriş</span>
              </button>
            </div>

            {/* Selected tier features preview */}
            {selectedTier && (
              <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#A0A0A0]">
                  Paket İçeriği
                </p>
                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                  {selectedTier.features.map((feat, i) => (
                    <p key={i} className="flex items-center gap-1.5 text-[11px] text-[#CFCFCF]">
                      <Check className="h-3 w-3 shrink-0 text-[#AAFF01]/70" />
                      {feat}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amount + Description */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">Tutar (₺)</label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="49000"
              className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">Açıklama</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hizmet açıklaması"
              className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
              required
            />
          </div>
        </div>

        {/* Period dates */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">Dönem Başlangıç</label>
            <Input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="border-white/[0.12] bg-black/20 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">Dönem Bitiş</label>
            <Input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="border-white/[0.12] bg-black/20 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">Son Ödeme Tarihi</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-white/[0.12] bg-black/20 text-white"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-medium text-[#A0A0A0]">Başlangıç Durumu</label>
          <div className="flex gap-2">
            {(["PLANNED", "PENDING"] as BillingStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  status === s
                    ? STATUS_COLORS[s]
                    : "border-white/10 bg-white/[0.03] text-[#A0A0A0] hover:text-white"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#A0A0A0]">İç Not (isteğe bağlı)</label>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dahili not..."
            className="border-white/[0.12] bg-black/20 text-white placeholder:text-[#7A7A7A]"
          />
        </div>

        {feedback && <p className="text-sm text-red-300">{feedback}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedServiceKey}
            className="gap-2 bg-[#AAFF01] text-black hover:bg-[#c8ff4d]"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isLoading ? "Oluşturuluyor..." : "Fatura Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ClientBillingSectionProps {
  clientId: string;
  services?: ClientPurchasedService[];
}

export function ClientBillingSection({ clientId, services = [] }: ClientBillingSectionProps) {
  const { data: invoices, isLoading, isError } = useListInvoicesQuery(clientId);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPaid = invoices
    ?.filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) ?? 0;

  const totalPending = invoices
    ?.filter((inv) => inv.status === "PENDING" || inv.status === "PLANNED")
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0) ?? 0;

  return (
    <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#AAFF01]" />
          <h2 className="text-lg font-semibold text-white">Ödemeler & Faturalar</h2>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-[#AAFF01]/10 text-[#AAFF01] hover:bg-[#AAFF01]/20"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "İptal" : "Fatura Ekle"}
        </Button>
      </div>

      {/* Summary chips */}
      {invoices && invoices.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <p className="text-xs text-[#A0A0A0]">Toplam Ödenen</p>
            <p className="text-sm font-semibold text-emerald-400">
              {totalPaid.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2">
            <p className="text-xs text-[#A0A0A0]">Bekleyen / Planlanan</p>
            <p className="text-sm font-semibold text-yellow-400">
              {totalPending.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <p className="text-xs text-[#A0A0A0]">Toplam Fatura</p>
            <p className="text-sm font-semibold text-white">{invoices.length}</p>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-4">
          <CreateInvoiceForm clientId={clientId} services={services} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Loading / error */}
      {isLoading && <p className="text-sm text-[#A0A0A0]">Faturalar yükleniyor...</p>}
      {isError && <p className="text-sm text-red-300">Faturalar yüklenemedi.</p>}

      {/* Invoice list */}
      {!isLoading && !isError && invoices && invoices.length === 0 && !showForm && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
          <p className="text-sm text-[#A0A0A0]">Bu müşteriye ait henüz fatura yok.</p>
          <button
            type="button"
            className="mt-2 text-sm text-[#AAFF01] hover:underline"
            onClick={() => setShowForm(true)}
          >
            İlk faturayı oluştur
          </button>
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="space-y-2">
          {invoices.map((invoice: ClientInvoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              clientId={clientId}
              expanded={expandedId === invoice.id}
              onExpand={() => setExpandedId((prev) => (prev === invoice.id ? null : invoice.id))}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
