import type { AuditEntityType, AuditLogAction, JsonValue } from "./auditLogsTypes";

const ACTION_LABELS_TR: Record<string, string> = {
  ADMIN_USER_CREATED: "Çalışan Oluşturuldu",
  ADMIN_USER_UPDATED: "Çalışan Güncellendi",
  ADMIN_USER_DEACTIVATED: "Çalışan Pasife Alındı",
  ADMIN_USER_ACTIVATED: "Çalışan Aktifleştirildi",
  ADMIN_USER_PASSWORD_RESET: "Şifre Sıfırlandı",
  USER_PASSWORD_CHANGED: "Kullanıcı Şifresini Değiştirdi",
};

const ENTITY_LABELS_TR: Record<string, string> = {
  User: "Kullanıcı",
  ClientProfile: "Müşteri",
  Project: "Proje",
  Task: "Görev",
};

const SENSITIVE_KEY_PARTS = [
  "password",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "credential",
  "cookie",
  "passwordhash",
  "refreshtoken",
  "tokenhash",
  "accesstoken",
];

export const AUDIT_LOG_SORT_OPTIONS: Array<{ value: "createdAt" | "action" | "entityType"; label: string }> = [
  { value: "createdAt", label: "Tarih" },
  { value: "action", label: "Aksiyon" },
  { value: "entityType", label: "Varlık Tipi" },
];

export const AUDIT_LOG_ACTION_OPTIONS = [
  "ADMIN_USER_CREATED",
  "ADMIN_USER_UPDATED",
  "ADMIN_USER_DEACTIVATED",
  "ADMIN_USER_ACTIVATED",
  "ADMIN_USER_PASSWORD_RESET",
  "USER_PASSWORD_CHANGED",
] as const;

export const AUDIT_ENTITY_TYPE_OPTIONS = [
  "User",
  "ClientProfile",
  "Project",
  "Task",
] as const;

export function getAuditActionLabel(action: AuditLogAction): string {
  return ACTION_LABELS_TR[action] ?? action;
}

export function getAuditEntityLabel(entityType: AuditEntityType): string {
  return ENTITY_LABELS_TR[entityType] ?? entityType;
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function sanitizeAuditMetadata(metadata: unknown): JsonValue | null {
  if (metadata === null || metadata === undefined) {
    return null;
  }

  if (typeof metadata === "string" || typeof metadata === "number" || typeof metadata === "boolean") {
    return metadata;
  }

  if (Array.isArray(metadata)) {
    const sanitizedArray = metadata
      .map((item) => sanitizeAuditMetadata(item))
      .filter((item): item is JsonValue => item !== null);
    return sanitizedArray;
  }

  if (typeof metadata === "object") {
    const sanitizedObject: Record<string, JsonValue> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (isSensitiveKey(key)) {
        continue;
      }

      const sanitizedValue = sanitizeAuditMetadata(value);
      if (sanitizedValue !== null) {
        sanitizedObject[key] = sanitizedValue;
      }
    }

    return sanitizedObject;
  }

  return null;
}

export function formatAuditMetadata(metadata: unknown): string {
  const sanitized = sanitizeAuditMetadata(metadata);
  if (sanitized === null) {
    return "{}";
  }

  try {
    return JSON.stringify(sanitized, null, 2);
  } catch {
    return "{}";
  }
}

function isSensitiveKey(key: string): boolean {
  const normalizedKey = key.replace(/[\s_-]/g, "").toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part));
}
