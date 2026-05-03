-- AlterEnum
ALTER TYPE "CrmLeadSource" ADD VALUE IF NOT EXISTS 'SERPAPI';

-- CreateEnum
CREATE TYPE "CrmLeadScanStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CrmLeadScanTrigger" AS ENUM ('MANUAL', 'CRON');

-- CreateEnum
CREATE TYPE "CrmLeadWebsiteStatus" AS ENUM ('NO_WEBSITE', 'FETCH_FAILED', 'ANALYZED');

-- AlterTable
ALTER TABLE "CrmLead"
ADD COLUMN IF NOT EXISTS "priority" "Priority",
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "sector" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "websiteStatus" "CrmLeadWebsiteStatus",
ADD COLUMN IF NOT EXISTS "websiteIssues" JSONB,
ADD COLUMN IF NOT EXISTS "detectedPainPoints" JSONB,
ADD COLUMN IF NOT EXISTS "recommendedServices" JSONB,
ADD COLUMN IF NOT EXISTS "outreachAngle" TEXT,
ADD COLUMN IF NOT EXISTS "emailSubject" TEXT,
ADD COLUMN IF NOT EXISTS "emailBody" TEXT,
ADD COLUMN IF NOT EXISTS "whatsappMessage" TEXT,
ADD COLUMN IF NOT EXISTS "sourceQuery" TEXT,
ADD COLUMN IF NOT EXISTS "sourceProvider" TEXT,
ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT,
ADD COLUMN IF NOT EXISTS "googleRating" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER,
ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT,
ADD COLUMN IF NOT EXISTS "leadScore" INTEGER;

-- CreateTable
CREATE TABLE "CrmLeadScanLog" (
    "id" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "CrmLeadScanStatus" NOT NULL DEFAULT 'RUNNING',
    "triggeredBy" "CrmLeadScanTrigger" NOT NULL DEFAULT 'MANUAL',
    "triggeredByUserId" UUID,
    "totalQueriesUsed" INTEGER NOT NULL DEFAULT 0,
    "totalBusinessesFetched" INTEGER NOT NULL DEFAULT 0,
    "totalDuplicates" INTEGER NOT NULL DEFAULT 0,
    "totalWebsitesAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "totalQualified" INTEGER NOT NULL DEFAULT 0,
    "totalSaved" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "queries" JSONB,
    "errors" JSONB,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLeadScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmLead_priority_idx" ON "CrmLead"("priority");

-- CreateIndex
CREATE INDEX "CrmLead_city_idx" ON "CrmLead"("city");

-- CreateIndex
CREATE INDEX "CrmLead_phone_idx" ON "CrmLead"("phone");

-- CreateIndex
CREATE INDEX "CrmLead_website_idx" ON "CrmLead"("website");

-- CreateIndex
CREATE INDEX "CrmLead_googleMapsUrl_idx" ON "CrmLead"("googleMapsUrl");

-- CreateIndex
CREATE INDEX "CrmLead_companyName_city_idx" ON "CrmLead"("companyName", "city");

-- CreateIndex
CREATE INDEX "CrmLeadScanLog_status_idx" ON "CrmLeadScanLog"("status");

-- CreateIndex
CREATE INDEX "CrmLeadScanLog_triggeredBy_idx" ON "CrmLeadScanLog"("triggeredBy");

-- CreateIndex
CREATE INDEX "CrmLeadScanLog_triggeredByUserId_idx" ON "CrmLeadScanLog"("triggeredByUserId");

-- CreateIndex
CREATE INDEX "CrmLeadScanLog_startedAt_idx" ON "CrmLeadScanLog"("startedAt");

-- CreateIndex
CREATE INDEX "CrmLeadScanLog_createdAt_idx" ON "CrmLeadScanLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CrmLeadScanLog"
ADD CONSTRAINT "CrmLeadScanLog_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
