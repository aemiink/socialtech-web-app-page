export type BillingPackageType = "LAUNCH" | "GROWTH" | "SCALE" | "CUSTOM";

export type BillingStatus = "PLANNED" | "PENDING" | "PAID" | "CANCELLED";

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  packageType: BillingPackageType;
  description: string;
  amount: string;
  currency: string;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string | null;
  status: BillingStatus;
  paidAt: string | null;
  createdAt: string;
}

export const PACKAGE_LABELS: Record<BillingPackageType, string> = {
  LAUNCH: "Launch Paketi",
  GROWTH: "Growth Paketi",
  SCALE: "Scale Paketi",
  CUSTOM: "Özel Fiyatlandırma",
};

export const STATUS_LABELS: Record<BillingStatus, string> = {
  PLANNED: "Planlanan",
  PENDING: "Ödeme Bekliyor",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export const STATUS_CONFIG: Record<BillingStatus, { color: string; bg: string; border: string; dot: string }> = {
  PLANNED: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/25", dot: "bg-blue-400" },
  PENDING: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/25", dot: "bg-amber-400" },
  PAID: { color: "text-[#AAFF01]", bg: "bg-[#AAFF01]/10", border: "border-[#AAFF01]/25", dot: "bg-[#AAFF01]" },
  CANCELLED: { color: "text-white/30", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" },
};
