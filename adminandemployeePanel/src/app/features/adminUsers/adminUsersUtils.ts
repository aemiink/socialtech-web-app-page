import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { AdminUserStatus, EmployeeRole } from "./adminUsersTypes";
import type { UserRole } from "../auth/authTypes";

const ROLE_LABELS_TR: Record<UserRole, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Proje Yöneticisi",
  PERFORMANCE_SPECIALIST: "Performans Uzmanı",
  SOCIAL_MEDIA_SPECIALIST: "Sosyal Medya Uzmanı",
  DESIGNER: "Tasarımcı",
  DEVELOPER: "Developer",
  SUPPORT_SPECIALIST: "Destek Uzmanı",
  SEO_SPECIALIST: "SEO Uzmanı",
  CRM_SPECIALIST: "CRM / Satış Uzmanı",
};

const STATUS_LABELS_TR: Record<AdminUserStatus, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Pasif",
  SUSPENDED: "Askıya Alındı",
};

export const EMPLOYEE_ROLE_OPTIONS: EmployeeRole[] = [
  "PROJECT_MANAGER",
  "PERFORMANCE_SPECIALIST",
  "SOCIAL_MEDIA_SPECIALIST",
  "DESIGNER",
  "DEVELOPER",
  "SUPPORT_SPECIALIST",
  "SEO_SPECIALIST",
  "CRM_SPECIALIST",
];

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS_TR[role] ?? role;
}

export function getStatusLabel(status: AdminUserStatus): string {
  return STATUS_LABELS_TR[status] ?? status;
}

export function isActiveStatus(status: AdminUserStatus): boolean {
  return status === "ACTIVE";
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

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Şifre gereklidir.";
  }

  if (password.length < 8) {
    return "Şifre en az 8 karakter olmalıdır.";
  }

  if (password.length > 72) {
    return "Şifre en fazla 72 karakter olabilir.";
  }

  if (!/[A-Za-z]/.test(password)) {
    return "Şifre en az bir harf içermelidir.";
  }

  if (!/[0-9]/.test(password)) {
    return "Şifre en az bir rakam içermelidir.";
  }

  return null;
}

export function validateEmailAddress(email: string): string | null {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "E-posta adresi gereklidir.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "Geçerli bir e-posta adresi girin.";
  }

  return null;
}

export function validateDisplayName(displayName: string): string | null {
  const normalizedDisplayName = displayName.trim();

  if (!normalizedDisplayName) {
    return "Çalışan adı gereklidir.";
  }

  if (normalizedDisplayName.length < 2) {
    return "Çalışan adı en az 2 karakter olmalıdır.";
  }

  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) {
    return "Şifre tekrarı gereklidir.";
  }

  if (password !== confirmPassword) {
    return "Şifreler eşleşmiyor.";
  }

  return null;
}

export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (isFetchBaseQueryError(error)) {
    const dataMessage = extractMessageFromData(error.data);
    if (error.status === 400 && dataMessage) {
      return dataMessage;
    }

    const statusMessage = getStatusMessage(error.status);
    if (statusMessage) {
      return statusMessage;
    }

    if (dataMessage) {
      return dataMessage;
    }
  }

  if (isSerializedError(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

function getStatusMessage(status: FetchBaseQueryError["status"]): string | null {
  if (status === 401) {
    return "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.";
  }

  if (status === 403) {
    return "Bu işlem için yetkiniz bulunmuyor.";
  }

  if (status === 404) {
    return "İlgili kayıt bulunamadı.";
  }

  if (status === 409) {
    return "Aynı bilgilere sahip bir kayıt zaten mevcut.";
  }

  if (status === 400) {
    return "Gönderilen bilgiler doğrulanamadı. Lütfen alanları kontrol edin.";
  }

  return null;
}

function extractMessageFromData(data: unknown): string | null {
  if (typeof data === "string" && data.length > 0) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const candidate = data as { message?: unknown; error?: unknown };
  const topLevelMessage = normalizeApiMessage(candidate.message);
  if (topLevelMessage) {
    return topLevelMessage;
  }

  if (typeof candidate.error === "object" && candidate.error !== null) {
    const nestedError = candidate.error as { message?: unknown; details?: unknown };
    const nestedMessage = normalizeApiMessage(nestedError.message);
    if (nestedMessage) {
      return nestedMessage;
    }

    const detailsMessage = normalizeApiMessage(nestedError.details);
    if (detailsMessage) {
      return detailsMessage;
    }
  }

  return null;
}

function normalizeApiMessage(message: unknown): string | null {
  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return null;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function isSerializedError(error: unknown): error is SerializedError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("message" in error || "name" in error || "code" in error)
  );
}
