-- CreateEnum
CREATE TYPE "GoogleAdsInsightLevel" AS ENUM ('ACCOUNT', 'CAMPAIGN', 'AD_GROUP', 'AD');

-- CreateTable
CREATE TABLE "GoogleAdsDailyInsight" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "customerId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "level" "GoogleAdsInsightLevel" NOT NULL,
  "entityId" TEXT,
  "entityName" TEXT,
  "costMicros" BIGINT,
  "impressions" INTEGER,
  "clicks" INTEGER,
  "conversions" DECIMAL(65,30),
  "conversionValue" DECIMAL(65,30),
  "ctr" DECIMAL(65,30),
  "averageCpc" DECIMAL(65,30),
  "costPerConversion" DECIMAL(65,30),
  "interactions" INTEGER,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GoogleAdsDailyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAdsDailyInsight_clientProfileId_date_idx" ON "GoogleAdsDailyInsight"("clientProfileId", "date");
CREATE INDEX "GoogleAdsDailyInsight_clientProfileId_level_date_idx" ON "GoogleAdsDailyInsight"("clientProfileId", "level", "date");
CREATE INDEX "GoogleAdsDailyInsight_clientProfileId_customerId_level_date_idx" ON "GoogleAdsDailyInsight"("clientProfileId", "customerId", "level", "date");
CREATE INDEX "GoogleAdsDailyInsight_customerId_date_idx" ON "GoogleAdsDailyInsight"("customerId", "date");

-- AddForeignKey
ALTER TABLE "GoogleAdsDailyInsight"
  ADD CONSTRAINT "GoogleAdsDailyInsight_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
