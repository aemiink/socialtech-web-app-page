import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import {
  AuditLogQueryDto,
  type AuditLogSortBy,
  type AuditLogSortOrder,
} from "./dto/audit-log-query.dto";

export const AUDIT_LOGS_READ_PERMISSION = "audit_logs.read";

const auditLogReadSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  actorUserId: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
} satisfies Prisma.AuditLogSelect;

const SENSITIVE_METADATA_KEY_FRAGMENTS = [
  "password",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "credential",
  "cookie",
] as const;

type AuditLogReadModel = Prisma.AuditLogGetPayload<{ select: typeof auditLogReadSelect }>;

type AuditLogResponse = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorUserId: string | null;
  targetUserId: string | null;
  targetClientProfileId: string | null;
  metadata: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

type AuditLogsListResponse = {
  data: AuditLogResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type AuditLogOrderByFactory = (
  sortOrder: AuditLogSortOrder,
) => Prisma.AuditLogOrderByWithRelationInput;

const AUDIT_LOG_ORDER_BY_FACTORIES = {
  createdAt: (sortOrder) => ({ createdAt: sortOrder }),
  action: (sortOrder) => ({ action: sortOrder }),
  entityType: (sortOrder) => ({ entityType: sortOrder }),
} satisfies Record<AuditLogSortBy, AuditLogOrderByFactory>;

@Injectable()
export class AdminAuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(
    currentUser: AuthenticatedUser,
    query: AuditLogQueryDto,
  ): Promise<AuditLogsListResponse> {
    this.assertCanReadAuditLogs(currentUser);
    this.assertValidDateRange(query);

    const where = this.buildAuditLogWhere(query);
    const [auditLogs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        select: auditLogReadSelect,
        orderBy: this.getAuditLogOrderBy(query.sortBy, query.sortOrder),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: auditLogs.map((auditLog) => this.toAuditLogResponse(auditLog)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  async getAuditLogById(
    currentUser: AuthenticatedUser,
    auditLogId: string,
  ): Promise<AuditLogResponse> {
    this.assertCanReadAuditLogs(currentUser);

    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id: auditLogId },
      select: auditLogReadSelect,
    });

    if (!auditLog) {
      throw new NotFoundException("Audit log not found.");
    }

    return this.toAuditLogResponse(auditLog);
  }

  private buildAuditLogWhere(query: AuditLogQueryDto): Prisma.AuditLogWhereInput {
    const metadataFilters: Prisma.AuditLogWhereInput[] = [
      ...(query.targetUserId
        ? [
            {
              metadata: {
                path: ["targetUserId"],
                equals: query.targetUserId,
              },
            },
          ]
        : []),
      ...(query.targetClientProfileId
        ? [
            {
              metadata: {
                path: ["targetClientProfileId"],
                equals: query.targetClientProfileId,
              },
            },
          ]
        : []),
    ];

    return {
      ...(query.action ? { action: query.action } : {}),
      ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: "insensitive" } },
              { entityType: { contains: query.search, mode: "insensitive" } },
              { entityId: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(metadataFilters.length > 0 ? { AND: metadataFilters } : {}),
    };
  }

  private assertValidDateRange(query: AuditLogQueryDto): void {
    if (!query.dateFrom || !query.dateTo) {
      return;
    }

    if (new Date(query.dateFrom) > new Date(query.dateTo)) {
      throw new BadRequestException("dateFrom must be before or equal to dateTo.");
    }
  }

  private assertCanReadAuditLogs(currentUser: AuthenticatedUser): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can read audit logs.");
    }

    if (!currentUser.permissions.includes(AUDIT_LOGS_READ_PERMISSION)) {
      throw new ForbiddenException(`Missing required permission: ${AUDIT_LOGS_READ_PERMISSION}.`);
    }
  }

  private getAuditLogOrderBy(
    sortBy: AuditLogSortBy,
    sortOrder: AuditLogSortOrder,
  ): Prisma.AuditLogOrderByWithRelationInput[] {
    return [AUDIT_LOG_ORDER_BY_FACTORIES[sortBy](sortOrder), { id: "asc" }];
  }

  private toAuditLogResponse(auditLog: AuditLogReadModel): AuditLogResponse {
    const metadata = this.sanitizeMetadata(auditLog.metadata);

    return {
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      actorUserId: auditLog.actorUserId,
      targetUserId: this.getMetadataString(metadata, "targetUserId"),
      targetClientProfileId: this.getMetadataString(metadata, "targetClientProfileId"),
      metadata,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }

  private sanitizeMetadata(metadata: Prisma.JsonValue | null): Prisma.JsonValue | null {
    if (metadata === null) {
      return null;
    }

    return this.sanitizeJsonValue(metadata);
  }

  private sanitizeJsonValue(value: Prisma.JsonValue): Prisma.JsonValue {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeJsonValue(item));
    }

    if (this.isJsonObject(value)) {
      const sanitizedObject: Prisma.JsonObject = {};

      for (const [key, nestedValue] of Object.entries(value)) {
        if (this.isSensitiveMetadataKey(key)) {
          continue;
        }

        if (nestedValue === undefined) {
          continue;
        }

        sanitizedObject[key] = this.sanitizeJsonValue(nestedValue);
      }

      return sanitizedObject;
    }

    return value;
  }

  private getMetadataString(metadata: Prisma.JsonValue | null, key: string): string | null {
    if (!this.isJsonObject(metadata)) {
      return null;
    }

    const value = metadata[key];
    return typeof value === "string" ? value : null;
  }

  private isSensitiveMetadataKey(key: string): boolean {
    const normalizedKey = key.toLowerCase();
    return SENSITIVE_METADATA_KEY_FRAGMENTS.some((fragment) =>
      normalizedKey.includes(fragment),
    );
  }

  private isJsonObject(value: Prisma.JsonValue | null): value is Prisma.JsonObject {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
}
