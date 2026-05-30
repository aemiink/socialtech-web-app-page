CREATE TYPE "GrowthHubReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'CHANNEL_PERFORMANCE',
  'RISK_REPORT',
  'NEXT_ACTION_PLAN',
  'EXECUTIVE_SUMMARY'
);

CREATE TYPE "GrowthHubReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

ALTER TYPE "MetaAdsApprovalType" ADD VALUE IF NOT EXISTS 'GROWTH_REPORT_ACKNOWLEDGEMENT';
ALTER TYPE "MetaAdsApprovalType" ADD VALUE IF NOT EXISTS 'GROWTH_ACTION_APPROVAL';
ALTER TYPE "MetaAdsApprovalType" ADD VALUE IF NOT EXISTS 'GROWTH_STRATEGY_APPROVAL';
ALTER TYPE "MetaAdsApprovalType" ADD VALUE IF NOT EXISTS 'BUDGET_DISTRIBUTION_APPROVAL';
ALTER TYPE "MetaAdsApprovalType" ADD VALUE IF NOT EXISTS 'CHANNEL_PRIORITY_APPROVAL';

CREATE TABLE "GrowthHubReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "GrowthHubReportType" NOT NULL,
  "status" "GrowthHubReportStatus" NOT NULL DEFAULT 'DRAFT',
  "summary" TEXT,
  "metricsSnapshot" JSONB,
  "createdByUserId" UUID,
  "publishedByUserId" UUID,
  "clientVisible" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "acknowledgementRequestedAt" TIMESTAMP(3),
  "acknowledgedAt" TIMESTAMP(3),
  "acknowledgedByUserId" UUID,
  "acknowledgementTaskId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GrowthHubReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthHubReport_clientProfileId_createdAt_idx"
  ON "GrowthHubReport"("clientProfileId", "createdAt");
CREATE INDEX "GrowthHubReport_clientProfileId_status_createdAt_idx"
  ON "GrowthHubReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "GrowthHubReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "GrowthHubReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "GrowthHubReport_clientVisible_status_createdAt_idx"
  ON "GrowthHubReport"("clientVisible", "status", "createdAt");
CREATE INDEX "GrowthHubReport_projectId_idx"
  ON "GrowthHubReport"("projectId");
CREATE INDEX "GrowthHubReport_createdByUserId_idx"
  ON "GrowthHubReport"("createdByUserId");
CREATE INDEX "GrowthHubReport_publishedByUserId_idx"
  ON "GrowthHubReport"("publishedByUserId");
CREATE INDEX "GrowthHubReport_acknowledgedByUserId_idx"
  ON "GrowthHubReport"("acknowledgedByUserId");
CREATE INDEX "GrowthHubReport_acknowledgementTaskId_idx"
  ON "GrowthHubReport"("acknowledgementTaskId");

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubReport"
  ADD CONSTRAINT "GrowthHubReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
