import {
  AccountType,
  CrmLeadActivityType,
  CrmLeadScanStatus,
  CrmLeadScanTrigger,
  CrmLeadSource,
  CrmLeadStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditLogRequestContext, AuditLogService, CRM_LEAD_AUDIT_ACTIONS } from "../audit-log/audit-log.service";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import {
  CrmLeadScanLogSummary,
  isQualifiedLeadCandidate,
  mapLeadScanPriorityToPriority,
  normalizeComparableName,
  normalizeComparablePhone,
  normalizeComparableUrl,
  QualifiedLeadCandidate,
} from "./crm-lead-scan.types";
import { QueryGeneratorService } from "./query-generator.service";
import { SerpApiService } from "./serpapi.service";
import { WebsiteAnalyzerService } from "./website-analyzer.service";
import { LeadScoringService } from "./lead-scoring.service";
import { RunCrmLeadScanDto } from "./dto/run-crm-lead-scan.dto";

const CRM_LEAD_SCAN_RUN_PERMISSION = "crm.leadScan.run";
const CRM_LEAD_SCAN_READ_PERMISSION = "crm.leadScan.read";
const CRM_LEAD_SCAN_ENTITY_TYPE = "CrmLeadScan";

type ScanErrorItem = {
  scope: "query" | "candidate" | "save";
  target: string;
  message: string;
};

type LeadScanLogSelect = Prisma.CrmLeadScanLogSelect;

const scanLogSelect = {
  id: true,
  startedAt: true,
  finishedAt: true,
  status: true,
  triggeredBy: true,
  triggeredByUserId: true,
  totalQueriesUsed: true,
  totalBusinessesFetched: true,
  totalDuplicates: true,
  totalWebsitesAnalyzed: true,
  totalQualified: true,
  totalSaved: true,
  totalFailed: true,
  queries: true,
  errors: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
} satisfies LeadScanLogSelect;

type ScanLogModel = Prisma.CrmLeadScanLogGetPayload<{ select: typeof scanLogSelect }>;

@Injectable()
export class CrmLeadScanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly queryGeneratorService: QueryGeneratorService,
    private readonly serpApiService: SerpApiService,
    private readonly websiteAnalyzerService: WebsiteAnalyzerService,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async runLeadScan(
    currentUser: AuthenticatedUser,
    dto: RunCrmLeadScanDto,
    requestContext?: AuditLogRequestContext,
  ) {
    this.assertAdminPermission(currentUser, CRM_LEAD_SCAN_RUN_PERMISSION);

    const usage = await this.getUsageSummary();
    if (usage.remainingToday <= 0) {
      throw new BadRequestException(
        `Bugünkü SerpAPI günlük limitine ulaşıldı (${usage.usedToday}/${usage.dailyQueryLimit}).`,
      );
    }

    const requestedLimit = dto.queryLimit ?? usage.dailyQueryLimit;
    const queryLimit = Math.min(requestedLimit, usage.absoluteMaxDailyQueryLimit, usage.remainingToday);
    const queries = this.queryGeneratorService.generateQueries(
      {
        cities: dto.cities,
        sectors: dto.sectors,
      },
      queryLimit,
    );

    if (queries.length === 0) {
      throw new ServiceUnavailableException("Lead taraması için geçerli sorgu üretilemedi.");
    }

    const scanLog = await this.prisma.crmLeadScanLog.create({
      data: {
        status: CrmLeadScanStatus.RUNNING,
        triggeredBy: CrmLeadScanTrigger.MANUAL,
        triggeredByUserId: currentUser.id,
        queries: queries as unknown as Prisma.InputJsonValue,
      },
      select: scanLogSelect,
    });

    await this.auditLogService.record(
      {
        actorUserId: currentUser.id,
        action: CRM_LEAD_AUDIT_ACTIONS.scanRunCreated,
        entityType: CRM_LEAD_SCAN_ENTITY_TYPE,
        entityId: scanLog.id,
        metadata: {
          queryCount: queries.length,
        },
        requestContext,
      },
    );

    let totalQueriesUsed = 0;
    let totalBusinessesFetched = 0;
    let totalDuplicates = 0;
    let totalWebsitesAnalyzed = 0;
    let totalFailed = 0;
    const errors: ScanErrorItem[] = [];
    const rawCandidates = [];

    try {
      for (const query of queries) {
        try {
          const candidates = await this.serpApiService.searchGoogleMaps(query);
          totalQueriesUsed += 1;
          await this.prisma.crmLeadScanLog.update({
            where: { id: scanLog.id },
            data: { totalQueriesUsed },
          });
          totalBusinessesFetched += candidates.length;
          rawCandidates.push(...candidates);
        } catch (error) {
          if (!(error instanceof ServiceUnavailableException)) {
            totalQueriesUsed += 1;
            await this.prisma.crmLeadScanLog.update({
              where: { id: scanLog.id },
              data: { totalQueriesUsed },
            });
          }
          totalFailed += 1;
          errors.push({
            scope: "query",
            target: query.query,
            message: error instanceof Error ? error.message : "SerpAPI sorgusu başarısız oldu.",
          });
        }
      }

      const uniqueCandidates = [];
      const sameRunKeys = new Set<string>();
      for (const candidate of rawCandidates) {
        if (this.isSameRunDuplicate(candidate, sameRunKeys)) {
          totalDuplicates += 1;
          continue;
        }

        const duplicateLead = await this.findDuplicateLead(candidate);
        if (duplicateLead) {
          totalDuplicates += 1;
          continue;
        }

        uniqueCandidates.push(candidate);
      }

      const scoredCandidates: QualifiedLeadCandidate[] = [];
      for (const candidate of uniqueCandidates) {
        try {
          const analysis = await this.websiteAnalyzerService.analyze(candidate.website, candidate.sector);
          if (analysis.websiteStatus === "ANALYZED") {
            totalWebsitesAnalyzed += 1;
          }

          const score = await this.leadScoringService.scoreLead({
            candidate,
            analysis,
          });

          scoredCandidates.push({
            candidate,
            analysis,
            score,
            contactEmail: analysis.email?.toLowerCase() ?? null,
            contactPhone: candidate.phone ?? analysis.phone ?? null,
            whatsappPhone: analysis.whatsappPhone ?? null,
          });
        } catch (error) {
          totalFailed += 1;
          errors.push({
            scope: "candidate",
            target: candidate.businessName,
            message: error instanceof Error ? error.message : "Lead analizi başarısız oldu.",
          });
        }
      }

      const qualifiedCandidates = scoredCandidates
        .filter((candidate) => isQualifiedLeadCandidate(candidate))
        .sort((left, right) => {
          const scoreDiff = right.score.lead_score - left.score.lead_score;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          const reviewDiff = (right.candidate.reviewCount ?? 0) - (left.candidate.reviewCount ?? 0);
          if (reviewDiff !== 0) {
            return reviewDiff;
          }
          return (right.candidate.googleRating ?? 0) - (left.candidate.googleRating ?? 0);
        });

      const limitedQualifiedCandidates = qualifiedCandidates.slice(0, 35);
      const owner = await this.getNextActiveCrmOwnerOrFail();
      let totalSaved = 0;

      for (const qualifiedCandidate of limitedQualifiedCandidates) {
        const duplicateLead = await this.findDuplicateLead(qualifiedCandidate.candidate);
        if (duplicateLead) {
          totalDuplicates += 1;
          continue;
        }

        try {
          await this.prisma.$transaction(async (tx) => {
            const createdLead = await tx.crmLead.create({
              data: {
                companyName: qualifiedCandidate.candidate.businessName,
                contactName: `${qualifiedCandidate.candidate.businessName} Ekibi`,
                contactEmail: qualifiedCandidate.contactEmail,
                phone: qualifiedCandidate.contactPhone,
                source: CrmLeadSource.SERPAPI,
                status: CrmLeadStatus.NEW,
                priority: mapLeadScanPriorityToPriority(qualifiedCandidate.score.priority),
                ownerUserId: owner.id,
                address: qualifiedCandidate.candidate.address,
                city: qualifiedCandidate.candidate.city,
                sector: qualifiedCandidate.candidate.sector,
                website: qualifiedCandidate.candidate.website,
                websiteStatus: qualifiedCandidate.analysis.websiteStatus,
                websiteIssues: qualifiedCandidate.analysis.websiteIssues as unknown as Prisma.InputJsonValue,
                detectedPainPoints:
                  qualifiedCandidate.score.detected_pain_points as unknown as Prisma.InputJsonValue,
                recommendedServices:
                  qualifiedCandidate.score.recommended_services as unknown as Prisma.InputJsonValue,
                outreachAngle: qualifiedCandidate.score.outreach_angle,
                emailSubject: qualifiedCandidate.score.email_subject,
                emailBody: qualifiedCandidate.score.email_body,
                whatsappMessage: qualifiedCandidate.score.whatsapp_message,
                sourceQuery: qualifiedCandidate.candidate.sourceQuery,
                sourceProvider: qualifiedCandidate.candidate.sourceProvider,
                googleMapsUrl: qualifiedCandidate.candidate.googleMapsUrl,
                googleRating: qualifiedCandidate.candidate.googleRating,
                reviewCount: qualifiedCandidate.candidate.reviewCount,
                instagramUrl: qualifiedCandidate.analysis.instagramUrl,
                whatsappPhone: qualifiedCandidate.whatsappPhone,
                leadScore: qualifiedCandidate.score.lead_score,
              },
              select: { id: true },
            });

            await tx.crmLeadActivity.create({
              data: {
                leadId: createdLead.id,
                actorUserId: currentUser.id,
                type: CrmLeadActivityType.NOTE,
                note: buildImportedLeadNote(qualifiedCandidate),
              },
            });
          });

          totalSaved += 1;
        } catch (error) {
          totalFailed += 1;
          errors.push({
            scope: "save",
            target: qualifiedCandidate.candidate.businessName,
            message: error instanceof Error ? error.message : "Lead kaydı oluşturulamadı.",
          });
        }
      }

      const summary = `SerpAPI taraması ${totalSaved} lead kaydetti, ${totalDuplicates} duplicate atladı ve ${totalQueriesUsed} sorgu kullandı.`;

      const updatedLog = await this.prisma.crmLeadScanLog.update({
        where: { id: scanLog.id },
        data: {
          finishedAt: new Date(),
          status: CrmLeadScanStatus.COMPLETED,
          totalQueriesUsed,
          totalBusinessesFetched,
          totalDuplicates,
          totalWebsitesAnalyzed,
          totalQualified: qualifiedCandidates.length,
          totalSaved,
          totalFailed,
          errors: errors as unknown as Prisma.InputJsonValue,
          summary,
        },
        select: scanLogSelect,
      });

      await this.auditLogService.record(
        {
          actorUserId: currentUser.id,
          action: CRM_LEAD_AUDIT_ACTIONS.scanRunCompleted,
          entityType: CRM_LEAD_SCAN_ENTITY_TYPE,
          entityId: scanLog.id,
          metadata: {
            totalQueriesUsed,
            totalBusinessesFetched,
            totalDuplicates,
            totalQualified: qualifiedCandidates.length,
            totalSaved,
          },
          requestContext,
        },
      );

      return {
        scanId: updatedLog.id,
        status: updatedLog.status,
        totalQueriesUsed,
        totalBusinessesFetched,
        totalDuplicates,
        totalWebsitesAnalyzed,
        totalQualified: qualifiedCandidates.length,
        totalSaved,
        totalFailed,
        summary,
        usage: await this.getUsageSummary(),
      };
    } catch (error) {
      await this.prisma.crmLeadScanLog.update({
        where: { id: scanLog.id },
        data: {
          finishedAt: new Date(),
          status: CrmLeadScanStatus.FAILED,
          totalQueriesUsed,
          totalBusinessesFetched,
          totalDuplicates,
          totalWebsitesAnalyzed,
          totalFailed: totalFailed + 1,
          errors: [
            ...errors,
            {
              scope: "save",
              target: "scan",
              message: error instanceof Error ? error.message : "Lead taraması başarısız oldu.",
            },
          ] as unknown as Prisma.InputJsonValue,
        },
      });

      throw error;
    }
  }

  async listLogs(currentUser: AuthenticatedUser) {
    this.assertAdminPermission(currentUser, CRM_LEAD_SCAN_READ_PERMISSION);
    const logs = await this.prisma.crmLeadScanLog.findMany({
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      take: 20,
      select: scanLogSelect,
    });

    return {
      data: logs.map((log) => this.toLogSummary(log)),
      meta: await this.getUsageSummary(),
    };
  }

  async getLogDetail(currentUser: AuthenticatedUser, logId: string) {
    this.assertAdminPermission(currentUser, CRM_LEAD_SCAN_READ_PERMISSION);
    const log = await this.prisma.crmLeadScanLog.findUnique({
      where: { id: logId },
      select: scanLogSelect,
    });

    if (!log) {
      throw new NotFoundException("CRM lead tarama kaydı bulunamadı.");
    }

    return this.toLogSummary(log);
  }

  async getUsageSummary() {
    const maxLimit = Math.min(
      Math.max(Number(this.prismaSafeNumber(this.configService.get<string>("LEAD_SCAN_MAX_DAILY_QUERY_LIMIT")) ?? 6), 1),
      6,
    );
    const dailyLimit = Math.min(
      Math.max(Number(this.prismaSafeNumber(this.configService.get<string>("LEAD_SCAN_DAILY_QUERY_LIMIT")) ?? 5), 1),
      maxLimit,
    );
    const { startOfDay, endOfDay } = getTurkeyDayRange();

    const usage = await this.prisma.crmLeadScanLog.aggregate({
      where: {
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        totalQueriesUsed: true,
      },
    });

    const usedToday = usage._sum.totalQueriesUsed ?? 0;

    return {
      dailyQueryLimit: dailyLimit,
      absoluteMaxDailyQueryLimit: maxLimit,
      usedToday,
      remainingToday: Math.max(dailyLimit - usedToday, 0),
    };
  }

  private async findDuplicateLead(candidate: {
    businessName: string;
    city: string;
    phone: string | null;
    website: string | null;
    googleMapsUrl: string | null;
  }) {
    const potentialMatches = await this.prisma.crmLead.findMany({
      where: {
        OR: buildDuplicateLeadWhere(candidate),
      },
      select: {
        id: true,
        companyName: true,
        city: true,
        phone: true,
        website: true,
        googleMapsUrl: true,
      },
      take: 10,
    });

    const normalizedCandidateWebsite = normalizeComparableUrl(candidate.website);
    const normalizedCandidateMapsUrl = normalizeComparableUrl(candidate.googleMapsUrl);
    const normalizedCandidatePhone = normalizeComparablePhone(candidate.phone);
    const normalizedCandidateNameCity = `${normalizeComparableName(candidate.businessName)}::${normalizeComparableName(candidate.city)}`;

    return (
      potentialMatches.find((lead) => {
        if (
          normalizedCandidateWebsite &&
          normalizeComparableUrl(lead.website) === normalizedCandidateWebsite
        ) {
          return true;
        }
        if (
          normalizedCandidateMapsUrl &&
          normalizeComparableUrl(lead.googleMapsUrl) === normalizedCandidateMapsUrl
        ) {
          return true;
        }
        if (
          normalizedCandidatePhone &&
          normalizeComparablePhone(lead.phone) === normalizedCandidatePhone
        ) {
          return true;
        }

        const leadNameCity = `${normalizeComparableName(lead.companyName)}::${normalizeComparableName(lead.city ?? "")}`;
        return normalizedCandidateNameCity === leadNameCity;
      }) ?? null
    );
  }

  private isSameRunDuplicate(
    candidate: {
      businessName: string;
      city: string;
      phone: string | null;
      website: string | null;
      googleMapsUrl: string | null;
    },
    keys: Set<string>,
  ): boolean {
    const comparableKeys = [
      normalizeComparableUrl(candidate.website),
      normalizeComparableUrl(candidate.googleMapsUrl),
      normalizeComparablePhone(candidate.phone),
      `${normalizeComparableName(candidate.businessName)}::${normalizeComparableName(candidate.city)}`,
    ].filter((item): item is string => Boolean(item));

    if (comparableKeys.some((key) => keys.has(key))) {
      return true;
    }

    for (const key of comparableKeys) {
      keys.add(key);
    }
    return false;
  }

  private async getNextActiveCrmOwnerOrFail() {
    const owner = await this.prisma.user.findFirst({
      where: {
        accountType: AccountType.EMPLOYEE,
        role: UserRole.CRM_SPECIALIST,
        status: UserStatus.ACTIVE,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    if (!owner) {
      throw new ServiceUnavailableException("Aktif bir CRM uzmanı bulunamadı.");
    }

    return owner;
  }

  private assertAdminPermission(currentUser: AuthenticatedUser, permission: string): void {
    if (currentUser.accountType !== AccountType.ADMIN || currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admin users can access CRM lead scan operations.");
    }

    if (!currentUser.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing required permission: ${permission}.`);
    }
  }

  private toLogSummary(log: ScanLogModel): CrmLeadScanLogSummary {
    return {
      id: log.id,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
      status: log.status,
      triggeredBy: log.triggeredBy,
      triggeredByUserId: log.triggeredByUserId,
      totalQueriesUsed: log.totalQueriesUsed,
      totalBusinessesFetched: log.totalBusinessesFetched,
      totalDuplicates: log.totalDuplicates,
      totalWebsitesAnalyzed: log.totalWebsitesAnalyzed,
      totalQualified: log.totalQualified,
      totalSaved: log.totalSaved,
      totalFailed: log.totalFailed,
      summary: log.summary,
      queries: log.queries,
      errors: log.errors,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  private prismaSafeNumber(value: string | undefined): number | null {
    if (!value) {
      return null;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

function buildImportedLeadNote(candidate: QualifiedLeadCandidate): string {
  return [
    "SerpAPI Google Maps taraması ile otomatik oluşturuldu.",
    `Tarama sorgusu: ${candidate.candidate.sourceQuery}`,
    `Skor: ${candidate.score.lead_score} (${candidate.score.priority})`,
    `Özet: ${candidate.score.reasoning_summary}`,
    candidate.score.detected_pain_points.length > 0
      ? `Pain points: ${candidate.score.detected_pain_points.join(", ")}`
      : null,
  ]
    .filter((item): item is string => Boolean(item))
    .join("\n");
}

function buildDuplicateLeadWhere(candidate: {
  businessName: string;
  city: string;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
}): Prisma.CrmLeadWhereInput[] {
  const conditions: Prisma.CrmLeadWhereInput[] = [];

  const website = normalizeComparableUrl(candidate.website);
  if (website) {
    conditions.push({ website });
  }

  const googleMapsUrl = normalizeComparableUrl(candidate.googleMapsUrl);
  if (googleMapsUrl) {
    conditions.push({ googleMapsUrl });
  }

  if (candidate.phone?.trim()) {
    conditions.push({ phone: candidate.phone.trim() });
  }

  const companyName = candidate.businessName.trim();
  const city = candidate.city.trim();
  if (companyName && city) {
    conditions.push({
      AND: [
        { companyName: { equals: companyName, mode: "insensitive" } },
        { city: { equals: city, mode: "insensitive" } },
      ],
    });
  }

  return conditions;
}

function getTurkeyDayRange(now = new Date()) {
  const turkeyOffsetMs = 3 * 60 * 60 * 1000;
  const turkeyNow = new Date(now.getTime() + turkeyOffsetMs);
  const startOfTurkeyDayUtcMs =
    Date.UTC(
      turkeyNow.getUTCFullYear(),
      turkeyNow.getUTCMonth(),
      turkeyNow.getUTCDate(),
      0,
      0,
      0,
      0,
    ) - turkeyOffsetMs;

  return {
    startOfDay: new Date(startOfTurkeyDayUtcMs),
    endOfDay: new Date(startOfTurkeyDayUtcMs + 86_400_000 - 1),
  };
}
