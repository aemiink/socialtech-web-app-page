CREATE TYPE "GoogleAdsReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'CAMPAIGN_PERFORMANCE',
  'SEARCH_TERMS',
  'KEYWORD_PERFORMANCE',
  'BUDGET_RECOMMENDATION',
  'CONVERSION_TRACKING'
);

CREATE TYPE "GoogleAdsReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "GoogleAdsReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "GoogleAdsReportType" NOT NULL,
  "status" "GoogleAdsReportStatus" NOT NULL DEFAULT 'DRAFT',
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

  CONSTRAINT "GoogleAdsReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GoogleAdsReport_clientProfileId_createdAt_idx"
  ON "GoogleAdsReport"("clientProfileId", "createdAt");
CREATE INDEX "GoogleAdsReport_clientProfileId_status_createdAt_idx"
  ON "GoogleAdsReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "GoogleAdsReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "GoogleAdsReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "GoogleAdsReport_clientVisible_status_createdAt_idx"
  ON "GoogleAdsReport"("clientVisible", "status", "createdAt");
CREATE INDEX "GoogleAdsReport_projectId_idx"
  ON "GoogleAdsReport"("projectId");
CREATE INDEX "GoogleAdsReport_createdByUserId_idx"
  ON "GoogleAdsReport"("createdByUserId");
CREATE INDEX "GoogleAdsReport_publishedByUserId_idx"
  ON "GoogleAdsReport"("publishedByUserId");
CREATE INDEX "GoogleAdsReport_acknowledgedByUserId_idx"
  ON "GoogleAdsReport"("acknowledgedByUserId");
CREATE INDEX "GoogleAdsReport_acknowledgementTaskId_idx"
  ON "GoogleAdsReport"("acknowledgementTaskId");

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId")
  REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_projectId_fkey"
  FOREIGN KEY ("projectId")
  REFERENCES "Project"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GoogleAdsReport"
  ADD CONSTRAINT "GoogleAdsReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId")
  REFERENCES "Task"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
