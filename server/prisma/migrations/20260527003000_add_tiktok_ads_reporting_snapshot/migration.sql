-- CreateEnum
CREATE TYPE "TikTokAdsSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- CreateTable
CREATE TABLE "TikTokAdsDailyInsight" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "level" "TikTokAdsInsightLevel" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT,
    "spend" DECIMAL(18,6),
    "impressions" INTEGER,
    "reach" INTEGER,
    "clicks" INTEGER,
    "ctr" DECIMAL(18,6),
    "cpc" DECIMAL(18,6),
    "cpm" DECIMAL(18,6),
    "videoViews" INTEGER,
    "videoViews2s" INTEGER,
    "videoViews6s" INTEGER,
    "videoCompletionRate" DECIMAL(18,6),
    "vtr" DECIMAL(18,6),
    "conversions" INTEGER,
    "costPerConversion" DECIMAL(18,6),
    "conversionRate" DECIMAL(18,6),
    "purchaseValue" DECIMAL(18,6),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TikTokAdsDailyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TikTokAdsSyncLog" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "advertiserId" TEXT,
    "status" "TikTokAdsSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "recordsFetched" INTEGER,
    "apiCallCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TikTokAdsSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TikTokAdsDailyInsight_clientProfileId_date_level_entityId_key" ON "TikTokAdsDailyInsight"("clientProfileId", "date", "level", "entityId");

-- CreateIndex
CREATE INDEX "TikTokAdsDailyInsight_clientProfileId_level_date_idx" ON "TikTokAdsDailyInsight"("clientProfileId", "level", "date");

-- CreateIndex
CREATE INDEX "TikTokAdsDailyInsight_advertiserId_date_idx" ON "TikTokAdsDailyInsight"("advertiserId", "date");

-- CreateIndex
CREATE INDEX "TikTokAdsSyncLog_clientProfileId_startedAt_idx" ON "TikTokAdsSyncLog"("clientProfileId", "startedAt");

-- CreateIndex
CREATE INDEX "TikTokAdsSyncLog_status_startedAt_idx" ON "TikTokAdsSyncLog"("status", "startedAt");

-- CreateIndex
CREATE INDEX "TikTokAdsSyncLog_advertiserId_idx" ON "TikTokAdsSyncLog"("advertiserId");

-- AddForeignKey
ALTER TABLE "TikTokAdsDailyInsight" ADD CONSTRAINT "TikTokAdsDailyInsight_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TikTokAdsSyncLog" ADD CONSTRAINT "TikTokAdsSyncLog_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
