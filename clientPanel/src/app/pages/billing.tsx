import { AlertCircle, Calendar, CheckCircle, CreditCard, Loader2, Shield, Sparkles, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMeQuery } from '../features/auth/authApi';
import { useGetMyInvoicesQuery } from '../features/billing/billingApi';
import {
  PACKAGE_LABELS,
  STATUS_CONFIG,
  STATUS_LABELS,
  type BillingStatus,
  type ClientInvoice,
} from '../features/billing/billingTypes';
import { getCatalogEntryByUiKey, getTierByUiKey } from '../features/billing/packagesCatalog';

const SERVICE_LABELS: Record<string, string> = {
  'meta-ads': 'Meta Ads Yönetimi',
  'tiktok-ads': 'TikTok Ads Yönetimi',
  'amazon-ads': 'Amazon Ads Yönetimi',
  'google-ads': 'Google Ads Yönetimi',
  'social-media': 'Sosyal Medya Yönetimi',
  'growth-hub': 'Growth Hub',
  'web-app': 'Web Uygulama Geliştirme',
  'mobile-app': 'Mobil Uygulama',
  'web-mobile-design': 'Web & Mobil Tasarım',
  'landing-pages': 'Landing Page',
  'seo-audit': 'SEO Denetimi',
  'technical-support': 'Teknik Destek',
  'media-hub': 'Medya Hub',
};

function getServiceLabel(key: string): string {
  return SERVICE_LABELS[key] ?? key;
}

function getServiceIcon(key: string): React.ElementType {
  if (key.includes('ads')) return Zap;
  if (key.includes('social') || key.includes('growth')) return Sparkles;
  return Shield;
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return `${num.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function StatusPill({ status }: { status: BillingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function InvoiceCard({ invoice }: { invoice: ClientInvoice }) {
  const isPending = invoice.status === 'PENDING';

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#1A1A1A] p-5 transition-colors ${
      isPending
        ? 'border-amber-400/20 hover:border-amber-400/35'
        : 'border-white/[0.06] hover:border-white/[0.12]'
    }`}>
      {isPending && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(251,191,36,0.04) 0%, transparent 60%)' }}
        />
      )}

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-[#A0A0A0]">{invoice.invoiceNumber}</p>
            <p className="mt-0.5 text-base font-semibold text-white">{PACKAGE_LABELS[invoice.packageType]}</p>
            <p className="mt-0.5 text-sm text-[#A0A0A0]">{invoice.description}</p>
          </div>
          <StatusPill status={invoice.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{formatAmount(invoice.amount, invoice.currency)}</p>
            {(invoice.periodStart || invoice.periodEnd) && (
              <p className="mt-0.5 text-xs text-[#A0A0A0]">
                {formatDate(invoice.periodStart)}
                {invoice.periodEnd ? ` – ${formatDate(invoice.periodEnd)}` : ''}
              </p>
            )}
          </div>

          <div className="text-right text-xs text-[#A0A0A0]">
            {invoice.status === 'PAID' && invoice.paidAt && (
              <div className="flex items-center gap-1.5 text-[#AAFF01]">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>{formatDate(invoice.paidAt)} tarihinde ödendi</span>
              </div>
            )}
            {invoice.status === 'PENDING' && invoice.dueDate && (
              <p className="text-amber-400">Son ödeme: {formatDate(invoice.dueDate)}</p>
            )}
            {invoice.status === 'PLANNED' && (
              <p>Planlanan dönem</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceSummaryBar({ invoices }: { invoices: ClientInvoice[] }) {
  const paid = invoices.filter((i) => i.status === 'PAID');
  const pending = invoices.filter((i) => i.status === 'PENDING');
  const totalPaid = paid.reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalPending = pending.reduce((s, i) => s + parseFloat(i.amount), 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-4 py-3">
        <p className="text-xs text-[#A0A0A0]">Toplam Fatura</p>
        <p className="mt-1 text-xl font-bold text-white">{invoices.length}</p>
      </div>
      <div className="rounded-xl border border-[#AAFF01]/[0.12] bg-[#AAFF01]/[0.04] px-4 py-3">
        <p className="text-xs text-[#AAFF01]/70">Toplam Ödenen</p>
        <p className="mt-1 text-xl font-bold text-[#AAFF01]">
          {totalPaid.toLocaleString('tr-TR')} ₺
        </p>
      </div>
      <div className="rounded-xl border border-amber-400/[0.15] bg-amber-400/[0.04] px-4 py-3">
        <p className="text-xs text-amber-400/70">Bekleyen</p>
        <p className="mt-1 text-xl font-bold text-amber-400">
          {totalPending > 0 ? `${totalPending.toLocaleString('tr-TR')} ₺` : '—'}
        </p>
      </div>
    </div>
  );
}

function FeatureRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#AAFF01]" />
      <span className="text-[12px] leading-relaxed text-[#CFCFCF]">{children}</span>
    </li>
  );
}

function ServicePackageCard({ service }: { service: { serviceId: string; packageTierKey?: string | null } }) {
  const Icon = getServiceIcon(service.serviceId);
  const tier = service.packageTierKey
    ? getTierByUiKey(service.serviceId, service.packageTierKey)
    : null;
  const catalogEntry = getCatalogEntryByUiKey(service.serviceId);
  const hasTiers = (catalogEntry?.tiers.length ?? 0) > 0;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#AAFF01]/[0.16] bg-[#1A1A1A]">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 100% 0%, rgba(170,255,1,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="relative flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#AAFF01]/10">
              <Icon className="h-4 w-4 text-[#AAFF01]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                {getServiceLabel(service.serviceId)}
              </p>
              {tier && (
                <p className="text-[10px] text-[#AAFF01]/70 mt-0.5">{tier.name}</p>
              )}
            </div>
          </div>
          {tier?.badge && (
            <span className="shrink-0 rounded-full border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-2 py-0.5 text-[10px] font-medium text-[#d2ff8a]">
              {tier.badge}
            </span>
          )}
        </div>

        {tier ? (
          <>
            {/* Description */}
            <p className="mt-3 text-[11px] leading-relaxed text-[#A0A0A0]">
              {tier.description}
            </p>

            {/* Divider */}
            <div className="my-3 h-px bg-white/[0.06]" />

            {/* Features */}
            <ul className="flex-1 space-y-1.5">
              {tier.features.map((feat, i) => (
                <FeatureRow key={i}>{feat}</FeatureRow>
              ))}
            </ul>

            {/* Price */}
            {tier.defaultPrice !== null ? (
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  ₺{tier.defaultPrice.toLocaleString('tr-TR')}
                </span>
                {tier.priceSuffix && (
                  <span className="text-xs text-[#A0A0A0]">{tier.priceSuffix}</span>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <span className="text-sm font-semibold text-[#AAFF01]/80">Özel Fiyatlandırma</span>
              </div>
            )}
          </>
        ) : hasTiers ? (
          <p className="mt-4 text-xs text-white/30">
            Paket detayları için müşteri temsilcinizle iletişime geçin.
          </p>
        ) : (
          <p className="mt-4 text-xs text-[#A0A0A0]">Aktif hizmet</p>
        )}
      </div>

      {/* Active indicator strip */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#AAFF01]/40 via-[#AAFF01]/20 to-transparent" />
    </div>
  );
}

export function BillingPage() {
  const { data: me, isLoading: isMeLoading } = useMeQuery();
  const { data: invoices, isLoading: isInvoicesLoading, isError } = useGetMyInvoicesQuery();

  const activeServices = (me?.purchasedServices ?? []).filter((s) => s.status === 'ACTIVE');
  const isLoading = isMeLoading || isInvoicesLoading;

  const pendingInvoice = invoices?.find((i) => i.status === 'PENDING');

  const pendingInvoices = invoices?.filter((i) => i.status === 'PENDING') ?? [];
  const plannedInvoices = invoices?.filter((i) => i.status === 'PLANNED') ?? [];
  const paidInvoices = invoices?.filter((i) => i.status === 'PAID') ?? [];

  const totalPaid = paidInvoices.reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalPending = pendingInvoices.reduce((s, i) => s + parseFloat(i.amount), 0);

  const nextInvoice = (() => {
    const candidates = [...pendingInvoices, ...plannedInvoices].filter((i) => i.dueDate);
    candidates.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    return candidates[0] ?? null;
  })();

  const daysUntilDue = nextInvoice?.dueDate
    ? Math.ceil((new Date(nextInvoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-full bg-[#131313]">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 md:px-8 md:py-10">

        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Faturalama</h1>
          <p className="text-[#A0A0A0]">Aboneliğiniz, aktif hizmetleriniz ve ödeme geçmişiniz</p>
        </div>

        {/* Pending payment alert */}
        {pendingInvoice && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Bekleyen Ödeme</p>
              <p className="mt-0.5 text-xs text-amber-400/80">
                {pendingInvoice.invoiceNumber} — {formatAmount(pendingInvoice.amount, pendingInvoice.currency)}
                {pendingInvoice.dueDate ? ` · Son ödeme: ${formatDate(pendingInvoice.dueDate)}` : ''}
                {' '}— Ödeme için hesap yöneticinizle iletişime geçin.
              </p>
            </div>
          </div>
        )}

        {/* Active services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Aktif Hizmetler</h2>
            {!isMeLoading && (
              <span className="rounded-full border border-[#AAFF01]/30 bg-[#AAFF01]/10 px-2.5 py-0.5 text-xs font-medium text-[#d2ff8a]">
                {activeServices.length} hizmet
              </span>
            )}
          </div>

          {isMeLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : activeServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#1A1A1A]/50 px-6 py-10 text-center">
              <Shield className="mx-auto h-10 w-10 text-[#A0A0A0]/30" />
              <p className="mt-3 text-sm text-white/40">Aktif hizmet bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activeServices.map((service) => (
                <ServicePackageCard key={service.serviceId} service={service} />
              ))}
            </div>
          )}
        </div>

        {/* Payment summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#1A1A1A] px-5 py-4">
            <p className="text-xs text-[#A0A0A0]">Hesap Durumu</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#AAFF01]" />
              <span className="text-sm font-semibold text-[#AAFF01]">Aktif</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#AAFF01]/[0.12] bg-[#AAFF01]/[0.04] px-5 py-4">
            <p className="text-xs text-[#AAFF01]/60">Toplam Ödenen</p>
            {isInvoicesLoading ? (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-[#A0A0A0]" />
            ) : (
              <p className="mt-2 text-lg font-bold text-[#AAFF01]">
                {totalPaid > 0 ? `₺${totalPaid.toLocaleString('tr-TR')}` : '—'}
              </p>
            )}
          </div>

          <div className={`rounded-2xl border px-5 py-4 ${
            totalPending > 0
              ? 'border-amber-400/[0.18] bg-amber-400/[0.05]'
              : 'border-white/[0.06] bg-[#1A1A1A]'
          }`}>
            <p className={`text-xs ${totalPending > 0 ? 'text-amber-400/70' : 'text-[#A0A0A0]'}`}>
              Bekleyen Ödeme
            </p>
            {isInvoicesLoading ? (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-[#A0A0A0]" />
            ) : (
              <p className={`mt-2 text-lg font-bold ${totalPending > 0 ? 'text-amber-400' : 'text-white/40'}`}>
                {totalPending > 0 ? `₺${totalPending.toLocaleString('tr-TR')}` : '—'}
              </p>
            )}
          </div>

          <div className={`rounded-2xl border px-5 py-4 ${
            nextInvoice
              ? daysUntilDue !== null && daysUntilDue <= 7
                ? 'border-red-400/[0.20] bg-red-400/[0.04]'
                : 'border-white/[0.06] bg-[#1A1A1A]'
              : 'border-white/[0.06] bg-[#1A1A1A]'
          }`}>
            <p className={`text-xs ${
              nextInvoice && daysUntilDue !== null && daysUntilDue <= 7
                ? 'text-red-400/70'
                : 'text-[#A0A0A0]'
            }`}>
              Sonraki Ödeme
            </p>
            {isInvoicesLoading ? (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-[#A0A0A0]" />
            ) : nextInvoice ? (
              <div className="mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className={`h-3.5 w-3.5 shrink-0 ${
                    daysUntilDue !== null && daysUntilDue <= 7 ? 'text-red-400' : 'text-[#A0A0A0]'
                  }`} />
                  <p className={`text-sm font-bold ${
                    daysUntilDue !== null && daysUntilDue <= 7 ? 'text-red-400' : 'text-white'
                  }`}>
                    {nextInvoice.dueDate ? formatDate(nextInvoice.dueDate) : '—'}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-[#A0A0A0]">
                  {formatAmount(nextInvoice.amount, nextInvoice.currency)}
                  {daysUntilDue !== null && (
                    <span className={`ml-1 ${daysUntilDue <= 0 ? 'text-red-400' : daysUntilDue <= 7 ? 'text-amber-400' : 'text-white/30'}`}>
                      {daysUntilDue <= 0
                        ? '· Gecikmiş'
                        : daysUntilDue === 1
                        ? '· Yarın'
                        : `· ${daysUntilDue} gün sonra`}
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-white/30">—</p>
            )}
          </div>
        </div>

        {/* Payment method note */}
        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A0A0A0]" />
          <p className="text-xs leading-relaxed text-[#A0A0A0]">
            Ödemeler <span className="font-medium text-white">EFT / Havale</span> yöntemiyle gerçekleştirilir.
            Ödeme için hesabınıza atanan müşteri temsilcinizle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Invoice history */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Fatura Geçmişi</h2>

          {/* Summary bar */}
          {invoices && invoices.length > 0 && (
            <InvoiceSummaryBar invoices={invoices} />
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#AAFF01]" />
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              Faturalar yüklenemedi. Lütfen sayfayı yenileyin.
            </div>
          )}

          {!isLoading && !isError && invoices?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#1A1A1A]/50 px-6 py-10 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-[#A0A0A0]/40" />
              <p className="mt-3 text-sm font-medium text-white/50">Henüz fatura yok</p>
              <p className="mt-1 text-xs leading-relaxed text-white/30">
                Faturalarınız burada görüntülenecek.
              </p>
            </div>
          )}

          {!isLoading && invoices && invoices.length > 0 && (
            <div className="space-y-3">
              {invoices.map((invoice: ClientInvoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
