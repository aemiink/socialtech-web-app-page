-- CreateEnum
CREATE TYPE "AmazonAdsInsightLevel" AS ENUM ('ACCOUNT', 'PORTFOLIO', 'CAMPAIGN', 'AD_GROUP', 'AD', 'KEYWORD', 'TARGET', 'PRODUCT', 'SEARCH_TERM');

-- CreateEnum
CREATE TYPE "AmazonAdsProductType" AS ENUM ('SPONSORED_PRODUCTS', 'SPONSORED_BRANDS', 'SPONSORED_DISPLAY');

-- CreateEnum
CREATE TYPE "AmazonAdsSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- CreateTable
CREATE TABLE "AmazonAdsDailyInsight" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "profileId" TEXT NOT NULL,
    "marketplaceId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "level" "AmazonAdsInsightLevel" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT,
    "adProduct" "AmazonAdsProductType",
    "spend" DECIMAL(18,6),
    "impressions" INTEGER,
    "clicks" INTEGER,
    "sales" DECIMAL(18,6),
    "orders" INTEGER,
    "unitsSold" INTEGER,
    "ctr" DECIMAL(18,6),
    "cpc" DECIMAL(18,6),
    "acos" DECIMAL(18,6),
    "roas" DECIMAL(18,6),
    "conversionRate" DECIMAL(18,6),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmazonAdsDailyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmazonAdsSyncLog" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "profileId" TEXT,
    "status" "AmazonAdsSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "recordsFetched" INTEGER,
    "apiCallCount" INTEGER,
    "reportRequests" JSONB,
    "reportStatuses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmazonAdsSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmazonAdsDailyInsight_clientProfileId_profileId_date_level_e_key" ON "AmazonAdsDailyInsight"("clientProfileId", "profileId", "date", "level", "entityId", "adProduct");

-- CreateIndex
CREATE INDEX "AmazonAdsDailyInsight_clientProfileId_level_date_idx" ON "AmazonAdsDailyInsight"("clientProfileId", "level", "date");

-- CreateIndex
CREATE INDEX "AmazonAdsDailyInsight_profileId_date_idx" ON "AmazonAdsDailyInsight"("profileId", "date");

-- CreateIndex
CREATE INDEX "AmazonAdsDailyInsight_adProduct_level_date_idx" ON "AmazonAdsDailyInsight"("adProduct", "level", "date");

-- CreateIndex
CREATE INDEX "AmazonAdsDailyInsight_marketplaceId_idx" ON "AmazonAdsDailyInsight"("marketplaceId");

-- CreateIndex
CREATE INDEX "AmazonAdsSyncLog_clientProfileId_startedAt_idx" ON "AmazonAdsSyncLog"("clientProfileId", "startedAt");

-- CreateIndex
CREATE INDEX "AmazonAdsSyncLog_status_startedAt_idx" ON "AmazonAdsSyncLog"("status", "startedAt");

-- CreateIndex
CREATE INDEX "AmazonAdsSyncLog_profileId_idx" ON "AmazonAdsSyncLog"("profileId");

-- AddForeignKey
ALTER TABLE "AmazonAdsDailyInsight" ADD CONSTRAINT "AmazonAdsDailyInsight_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmazonAdsSyncLog" ADD CONSTRAINT "AmazonAdsSyncLog_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
