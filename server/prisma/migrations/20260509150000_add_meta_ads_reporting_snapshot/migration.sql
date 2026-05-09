-- CreateEnum
CREATE TYPE "MetaAdsInsightLevel" AS ENUM ('ACCOUNT', 'CAMPAIGN', 'ADSET', 'AD');

-- CreateTable
CREATE TABLE "MetaAdsDailyInsight" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "adAccountId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "level" "MetaAdsInsightLevel" NOT NULL,
  "entityId" TEXT,
  "entityName" TEXT,
  "spend" DECIMAL(65,30),
  "impressions" INTEGER,
  "reach" INTEGER,
  "clicks" INTEGER,
  "ctr" DECIMAL(65,30),
  "cpc" DECIMAL(65,30),
  "cpm" DECIMAL(65,30),
  "frequency" DECIMAL(65,30),
  "results" INTEGER,
  "costPerResult" DECIMAL(65,30),
  "purchaseValue" DECIMAL(65,30),
  "roas" DECIMAL(65,30),
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MetaAdsDailyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaAdsDailyInsight_clientProfileId_date_idx"
  ON "MetaAdsDailyInsight"("clientProfileId", "date");
CREATE INDEX "MetaAdsDailyInsight_clientProfileId_level_date_idx"
  ON "MetaAdsDailyInsight"("clientProfileId", "level", "date");
CREATE INDEX "MetaAdsDailyInsight_clientProfileId_adAccountId_level_date_idx"
  ON "MetaAdsDailyInsight"("clientProfileId", "adAccountId", "level", "date");
CREATE INDEX "MetaAdsDailyInsight_adAccountId_date_idx"
  ON "MetaAdsDailyInsight"("adAccountId", "date");

-- AddForeignKey
ALTER TABLE "MetaAdsDailyInsight"
  ADD CONSTRAINT "MetaAdsDailyInsight_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
