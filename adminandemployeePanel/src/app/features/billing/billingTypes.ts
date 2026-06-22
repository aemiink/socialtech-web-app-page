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
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: string;
    displayName: string | null;
    email: string;
  };
}

export interface CreateInvoiceRequest {
  packageType: BillingPackageType;
  description: string;
  amount: number;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  status?: BillingStatus;
  note?: string | null;
}

export interface UpdateInvoiceRequest {
  status?: BillingStatus;
  amount?: number;
  description?: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  paidAt?: string;
  note?: string | null;
}

export const PACKAGE_LABELS: Record<BillingPackageType, string> = {
  LAUNCH: "Launch Paketi",
  GROWTH: "Growth Paketi",
  SCALE: "Scale Paketi",
  CUSTOM: "Özel Fiyatlandırma",
};

export const PACKAGE_DEFAULT_AMOUNTS: Partial<Record<BillingPackageType, number>> = {
  LAUNCH: 34000,
  GROWTH: 49000,
};

export const STATUS_LABELS: Record<BillingStatus, string> = {
  PLANNED: "Planlanan",
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export const STATUS_COLORS: Record<BillingStatus, string> = {
  PLANNED: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/30",
};
