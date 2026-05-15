-- CreateEnum
CREATE TYPE "MetaAdsReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'CAMPAIGN_PERFORMANCE',
  'CREATIVE_PERFORMANCE',
  'BUDGET_RECOMMENDATION'
);

-- CreateEnum
CREATE TYPE "MetaAdsReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "MetaAdsReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "MetaAdsReportType" NOT NULL,
  "status" "MetaAdsReportStatus" NOT NULL DEFAULT 'DRAFT',
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

  CONSTRAINT "MetaAdsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaAdsReport_clientProfileId_createdAt_idx"
  ON "MetaAdsReport"("clientProfileId", "createdAt");
CREATE INDEX "MetaAdsReport_clientProfileId_status_createdAt_idx"
  ON "MetaAdsReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "MetaAdsReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "MetaAdsReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "MetaAdsReport_clientVisible_status_createdAt_idx"
  ON "MetaAdsReport"("clientVisible", "status", "createdAt");
CREATE INDEX "MetaAdsReport_projectId_idx"
  ON "MetaAdsReport"("projectId");
CREATE INDEX "MetaAdsReport_createdByUserId_idx"
  ON "MetaAdsReport"("createdByUserId");
CREATE INDEX "MetaAdsReport_publishedByUserId_idx"
  ON "MetaAdsReport"("publishedByUserId");
CREATE INDEX "MetaAdsReport_acknowledgedByUserId_idx"
  ON "MetaAdsReport"("acknowledgedByUserId");
CREATE INDEX "MetaAdsReport_acknowledgementTaskId_idx"
  ON "MetaAdsReport"("acknowledgementTaskId");

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsReport"
  ADD CONSTRAINT "MetaAdsReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
