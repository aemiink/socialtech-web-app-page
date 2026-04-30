import { serviceLabels, type ServiceId } from "../../data/service-pages";
import type {
  AccountType,
  AuthUserProfile,
  ClientProfileSummary,
  ClientPurchasedService,
  PublicAuthResponse,
  PurchasedServiceStatus,
  UserRole,
  UserStatus,
} from "./authTypes";

const ACCOUNT_TYPES: readonly AccountType[] = ["ADMIN", "EMPLOYEE", "CLIENT"];
const USER_ROLES: readonly UserRole[] = [
  "ADMIN",
  "PROJECT_MANAGER",
  "PERFORMANCE_SPECIALIST",
  "SOCIAL_MEDIA_SPECIALIST",
  "DESIGNER",
  "DEVELOPER",
  "SUPPORT_SPECIALIST",
  "SEO_SPECIALIST",
  "CLIENT_OWNER",
  "CLIENT_MEMBER",
];
const USER_STATUSES: readonly UserStatus[] = ["ACTIVE", "INACTIVE"];
const PURCHASED_SERVICE_STATUSES: readonly PurchasedServiceStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "CANCELED",
  "CANCELLED",
  "PAUSED",
];
const SERVICE_IDS = Object.keys(serviceLabels) as ServiceId[];
const SERVICE_ID_SET = new Set<string>(SERVICE_IDS);
const SERVICE_ID_ALIASES: Record<string, ServiceId> = {
  "medya-hub": "media-hub",
  "landing-page": "landing-pages",
};

export function parsePublicAuthResponse(value: unknown): PublicAuthResponse {
  const normalized = normalizePublicAuthResponse(value);

  if (!normalized) {
    throw new Error("Malformed auth response.");
  }

  return normalized;
}

export function normalizePublicAuthResponse(value: unknown): PublicAuthResponse | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const accessToken = readRequiredString(record.accessToken);
  const accessTokenExpiresAt = readRequiredString(record.accessTokenExpiresAt);
  const user = normalizeAuthUserProfile(record.user);

  if (!accessToken || !accessTokenExpiresAt || !user) {
    return null;
  }

  return {
    accessToken,
    accessTokenExpiresAt,
    user,
  };
}

export function parseAuthUserProfile(value: unknown): AuthUserProfile {
  const normalized = normalizeAuthUserProfile(value);

  if (!normalized) {
    throw new Error("Malformed auth user response.");
  }

  return normalized;
}

export function normalizeAuthUserProfile(value: unknown): AuthUserProfile | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const id = readRequiredString(record.id);
  const email = readRequiredString(record.email);
  const accountType = readEnumValue(record.accountType, ACCOUNT_TYPES);
  const role = readEnumValue(record.role, USER_ROLES);
  const status = readEnumValue(record.status, USER_STATUSES);

  if (!id || !email || !accountType || !role || !status) {
    return null;
  }

  const clientProfile = normalizeClientProfile(record.clientProfile);
  const rootPurchasedServices = readPurchasedServices(record.purchasedServices);
  const profilePurchasedServices = clientProfile?.purchasedServices ?? [];

  return {
    id,
    email,
    displayName: readOptionalString(record.displayName),
    accountType,
    role,
    status,
    permissions: readStringArray(record.permissions),
    clientProfile,
    purchasedServices: mergePurchasedServices(rootPurchasedServices, profilePurchasedServices),
  };
}

export function getActivePurchasedServiceIds(user: AuthUserProfile): ServiceId[] {
  const purchasedServices = mergePurchasedServices(
    user.purchasedServices,
    user.clientProfile?.purchasedServices ?? [],
  );

  return purchasedServices
    .filter((service) => service.status === "ACTIVE")
    .map((service) => service.serviceId);
}

export function normalizeServiceId(value: unknown): ServiceId | null {
  const rawValue = readRequiredString(value);
  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  const alias = SERVICE_ID_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  if (SERVICE_ID_SET.has(normalized)) {
    return normalized as ServiceId;
  }

  return null;
}

function normalizeClientProfile(value: unknown): ClientProfileSummary | null {
  if (value === null || value === undefined) {
    return null;
  }

  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const id = readRequiredString(record.id);
  const slug = readRequiredString(record.slug);
  const companyName = readRequiredString(record.companyName);

  if (!id || !slug || !companyName) {
    return null;
  }

  return {
    id,
    slug,
    companyName,
    contactEmail: readOptionalString(record.contactEmail),
    purchasedServices: readPurchasedServices(record.purchasedServices),
  };
}

function readPurchasedServices(value: unknown): ClientPurchasedService[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return mergePurchasedServices(...value.map((entry) => {
    const service = normalizePurchasedService(entry);
    return service ? [service] : [];
  }));
}

function normalizePurchasedService(value: unknown): ClientPurchasedService | null {
  const serviceId = normalizeServiceId(value);
  if (serviceId) {
    return {
      serviceId,
      status: "ACTIVE",
    };
  }

  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const serviceRecord = toRecord(record.service);
  const objectServiceId =
    normalizeServiceId(record.serviceId) ??
    normalizeServiceId(record.serviceKey) ??
    normalizeServiceId(record.serviceSlug) ??
    normalizeServiceId(record.slug) ??
    normalizeServiceId(record.key) ??
    normalizeServiceId(record.code) ??
    normalizeServiceId(serviceRecord?.serviceId) ??
    normalizeServiceId(serviceRecord?.serviceKey) ??
    normalizeServiceId(serviceRecord?.slug) ??
    normalizeServiceId(serviceRecord?.key) ??
    normalizeServiceId(serviceRecord?.code);

  if (!objectServiceId) {
    return null;
  }

  return {
    serviceId: objectServiceId,
    status:
      readEnumValue(record.status, PURCHASED_SERVICE_STATUSES) ??
      readEnumValue(record.purchaseStatus, PURCHASED_SERVICE_STATUSES) ??
      "ACTIVE",
  };
}

function mergePurchasedServices(...serviceGroups: ClientPurchasedService[][]): ClientPurchasedService[] {
  const serviceMap = new Map<ServiceId, PurchasedServiceStatus>();

  for (const serviceGroup of serviceGroups) {
    for (const service of serviceGroup) {
      const previousStatus = serviceMap.get(service.serviceId);
      if (previousStatus === "ACTIVE") {
        continue;
      }

      serviceMap.set(service.serviceId, service.status);
    }
  }

  return SERVICE_IDS.flatMap((serviceId) => {
    const status = serviceMap.get(serviceId);
    return status ? [{ serviceId, status }] : [];
  });
}

function readRequiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function readEnumValue<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
): TValue | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return allowedValues.find((allowedValue) => allowedValue === normalized) ?? null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
