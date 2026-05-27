-- CreateEnum
CREATE TYPE "TikTokAdsReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'CAMPAIGN_PERFORMANCE',
  'CREATIVE_PERFORMANCE',
  'BUDGET_RECOMMENDATION'
);

-- CreateEnum
CREATE TYPE "TikTokAdsReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "TikTokAdsReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "TikTokAdsReportType" NOT NULL,
  "status" "TikTokAdsReportStatus" NOT NULL DEFAULT 'DRAFT',
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

  CONSTRAINT "TikTokAdsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TikTokAdsReport_clientProfileId_createdAt_idx"
  ON "TikTokAdsReport"("clientProfileId", "createdAt");
CREATE INDEX "TikTokAdsReport_clientProfileId_status_createdAt_idx"
  ON "TikTokAdsReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "TikTokAdsReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "TikTokAdsReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "TikTokAdsReport_clientVisible_status_createdAt_idx"
  ON "TikTokAdsReport"("clientVisible", "status", "createdAt");
CREATE INDEX "TikTokAdsReport_projectId_idx"
  ON "TikTokAdsReport"("projectId");
CREATE INDEX "TikTokAdsReport_createdByUserId_idx"
  ON "TikTokAdsReport"("createdByUserId");
CREATE INDEX "TikTokAdsReport_publishedByUserId_idx"
  ON "TikTokAdsReport"("publishedByUserId");
CREATE INDEX "TikTokAdsReport_acknowledgedByUserId_idx"
  ON "TikTokAdsReport"("acknowledgedByUserId");
CREATE INDEX "TikTokAdsReport_acknowledgementTaskId_idx"
  ON "TikTokAdsReport"("acknowledgementTaskId");

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsReport"
  ADD CONSTRAINT "TikTokAdsReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
