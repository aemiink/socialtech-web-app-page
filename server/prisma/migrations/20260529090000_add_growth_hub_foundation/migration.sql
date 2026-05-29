CREATE TYPE "GrowthHubGoal" AS ENUM (
  'LEAD_GENERATION',
  'ECOMMERCE_SALES',
  'BRAND_AWARENESS',
  'APP_GROWTH',
  'RETENTION',
  'MIXED'
);

CREATE TYPE "GrowthHubStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ON_HOLD');

CREATE TABLE "ClientGrowthHubConfig" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "primaryGoal" "GrowthHubGoal",
  "targetLeads" INTEGER,
  "targetRoas" DECIMAL(18, 6),
  "targetCpa" DECIMAL(18, 6),
  "targetRevenue" DECIMAL(18, 6),
  "reportingDay" TEXT,
  "notes" TEXT,
  "status" "GrowthHubStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientGrowthHubConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientGrowthHubConfig_clientProfileId_key"
  ON "ClientGrowthHubConfig"("clientProfileId");

CREATE INDEX "ClientGrowthHubConfig_status_idx"
  ON "ClientGrowthHubConfig"("status");

CREATE INDEX "ClientGrowthHubConfig_primaryGoal_idx"
  ON "ClientGrowthHubConfig"("primaryGoal");

CREATE INDEX "ClientGrowthHubConfig_updatedAt_idx"
  ON "ClientGrowthHubConfig"("updatedAt");

ALTER TABLE "ClientGrowthHubConfig"
  ADD CONSTRAINT "ClientGrowthHubConfig_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId")
  REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
