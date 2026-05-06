import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export const ADMIN_USER_AUDIT_ACTIONS = {
  created: "ADMIN_USER_CREATED",
  updated: "ADMIN_USER_UPDATED",
  deactivated: "ADMIN_USER_DEACTIVATED",
  activated: "ADMIN_USER_ACTIVATED",
  passwordReset: "ADMIN_USER_PASSWORD_RESET",
} as const;

export const ADMIN_CLIENT_AUDIT_ACTIONS = {
  created: "ADMIN_CLIENT_CREATED",
  updated: "ADMIN_CLIENT_UPDATED",
  deactivated: "ADMIN_CLIENT_DEACTIVATED",
  activated: "ADMIN_CLIENT_ACTIVATED",
  ownerCreated: "ADMIN_CLIENT_OWNER_CREATED",
  ownerLinked: "ADMIN_CLIENT_OWNER_LINKED",
  ownerPasswordReset: "ADMIN_CLIENT_OWNER_PASSWORD_RESET",
} as const;

export const CRM_LEAD_AUDIT_ACTIONS = {
  created: "CRM_LEAD_CREATED",
  updated: "CRM_LEAD_UPDATED",
  activityCreated: "CRM_LEAD_ACTIVITY_CREATED",
  converted: "CRM_LEAD_CONVERTED",
  scanRunCreated: "CRM_LEAD_SCAN_RUN_CREATED",
  scanRunCompleted: "CRM_LEAD_SCAN_RUN_COMPLETED",
} as const;

export type AdminUserAuditAction =
  (typeof ADMIN_USER_AUDIT_ACTIONS)[keyof typeof ADMIN_USER_AUDIT_ACTIONS];

export type AdminClientAuditAction =
  (typeof ADMIN_CLIENT_AUDIT_ACTIONS)[keyof typeof ADMIN_CLIENT_AUDIT_ACTIONS];
export type CrmLeadAuditAction =
  (typeof CRM_LEAD_AUDIT_ACTIONS)[keyof typeof CRM_LEAD_AUDIT_ACTIONS];

export type AuditLogAction = AdminUserAuditAction | AdminClientAuditAction | CrmLeadAuditAction;

export type AuditLogRequestContext = {
  ipAddress: string | null;
  userAgent: string | null;
};

type AuditLogWriteClient = Pick<Prisma.TransactionClient, "auditLog">;

type RecordAuditLogInput = {
  actorUserId: string | null;
  action: AuditLogAction;
  entityType: string;
  entityId: string | null;
  metadata: Prisma.InputJsonObject;
  requestContext?: AuditLogRequestContext;
};

const SENSITIVE_METADATA_KEY_FRAGMENTS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "credential",
  "apikey",
  "api_key",
] as const;

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput, tx?: AuditLogWriteClient): Promise<void> {
    const client = tx ?? this.prisma;

    const data: Prisma.AuditLogUncheckedCreateInput = {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: this.sanitizeMetadata(input.metadata),
      ipAddress: input.requestContext?.ipAddress ?? null,
      userAgent: input.requestContext?.userAgent ?? null,
    };

    await client.auditLog.create({ data });
  }

  private sanitizeMetadata(metadata: Prisma.InputJsonObject): Prisma.InputJsonObject {
    const sanitized = this.sanitizeJsonValue(metadata);
    if (this.isJsonObject(sanitized)) {
      return sanitized as Prisma.InputJsonObject;
    }

    return {};
  }

  private sanitizeJsonValue(value: Prisma.InputJsonValue): Prisma.InputJsonValue {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeJsonValue(item));
    }

    if (this.isJsonObject(value)) {
      const sanitizedObject: Record<string, Prisma.InputJsonValue> = {};

      for (const [key, nestedValue] of Object.entries(value)) {
        if (this.isSensitiveMetadataKey(key)) {
          continue;
        }

        sanitizedObject[key] = this.sanitizeJsonValue(nestedValue as Prisma.InputJsonValue);
      }

      return sanitizedObject as Prisma.InputJsonObject;
    }

    return value;
  }

  private isSensitiveMetadataKey(key: string): boolean {
    const normalizedKey = key.toLowerCase();
    return SENSITIVE_METADATA_KEY_FRAGMENTS.some((fragment) =>
      normalizedKey.includes(fragment),
    );
  }

  private isJsonObject(
    value: Prisma.InputJsonValue,
  ): value is Record<string, Prisma.InputJsonValue> {
    return value !== null && typeof value === "object" && !Array.isArray(value) && !("toJSON" in value);
  }
}
