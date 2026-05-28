-- CreateEnum
CREATE TYPE "AmazonAdsReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'SPONSORED_PRODUCTS_PERFORMANCE',
  'SPONSORED_BRANDS_PERFORMANCE',
  'SPONSORED_DISPLAY_PERFORMANCE',
  'PRODUCT_PERFORMANCE',
  'SEARCH_TERMS',
  'BUDGET_RECOMMENDATION',
  'ACOS_OPTIMIZATION'
);

-- CreateEnum
CREATE TYPE "AmazonAdsReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "AmazonAdsReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "AmazonAdsReportType" NOT NULL,
  "status" "AmazonAdsReportStatus" NOT NULL DEFAULT 'DRAFT',
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

  CONSTRAINT "AmazonAdsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AmazonAdsReport_clientProfileId_createdAt_idx"
  ON "AmazonAdsReport"("clientProfileId", "createdAt");
CREATE INDEX "AmazonAdsReport_clientProfileId_status_createdAt_idx"
  ON "AmazonAdsReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "AmazonAdsReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "AmazonAdsReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "AmazonAdsReport_clientVisible_status_createdAt_idx"
  ON "AmazonAdsReport"("clientVisible", "status", "createdAt");
CREATE INDEX "AmazonAdsReport_projectId_idx"
  ON "AmazonAdsReport"("projectId");
CREATE INDEX "AmazonAdsReport_createdByUserId_idx"
  ON "AmazonAdsReport"("createdByUserId");
CREATE INDEX "AmazonAdsReport_publishedByUserId_idx"
  ON "AmazonAdsReport"("publishedByUserId");
CREATE INDEX "AmazonAdsReport_acknowledgedByUserId_idx"
  ON "AmazonAdsReport"("acknowledgedByUserId");
CREATE INDEX "AmazonAdsReport_acknowledgementTaskId_idx"
  ON "AmazonAdsReport"("acknowledgementTaskId");

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsReport"
  ADD CONSTRAINT "AmazonAdsReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
