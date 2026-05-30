CREATE TYPE "GrowthHubRecommendationType" AS ENUM (
  'CHANNEL_OPTIMIZATION',
  'BUDGET_SHIFT',
  'CREATIVE_REFRESH',
  'LANDING_PAGE_REVIEW',
  'APPROVAL_REMINDER',
  'REPORTING_REQUIRED',
  'TECHNICAL_FIX',
  'STRATEGY_REVIEW'
);

CREATE TYPE "GrowthHubRecommendationStatus" AS ENUM (
  'OPEN',
  'ACCEPTED',
  'DISMISSED',
  'CONVERTED_TO_TASK',
  'DONE'
);

CREATE TABLE "GrowthHubRecommendation" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "dedupeKey" TEXT NOT NULL,
  "type" "GrowthHubRecommendationType" NOT NULL,
  "priority" "GrowthHubActionPriority" NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "source" TEXT,
  "relatedEntityType" TEXT,
  "relatedEntityId" TEXT,
  "status" "GrowthHubRecommendationStatus" NOT NULL DEFAULT 'OPEN',
  "clientVisible" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" UUID,
  "convertedTaskId" UUID,
  "convertedAt" TIMESTAMP(3),
  "convertedByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GrowthHubRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GrowthHubRecommendation_dedupeKey_key"
  ON "GrowthHubRecommendation"("dedupeKey");
CREATE UNIQUE INDEX "GrowthHubRecommendation_convertedTaskId_key"
  ON "GrowthHubRecommendation"("convertedTaskId");
CREATE INDEX "GrowthHubRecommendation_clientProfileId_status_priority_idx"
  ON "GrowthHubRecommendation"("clientProfileId", "status", "priority");
CREATE INDEX "GrowthHubRecommendation_clientProfileId_clientVisible_idx"
  ON "GrowthHubRecommendation"("clientProfileId", "clientVisible");
CREATE INDEX "GrowthHubRecommendation_projectId_idx"
  ON "GrowthHubRecommendation"("projectId");
CREATE INDEX "GrowthHubRecommendation_createdByUserId_idx"
  ON "GrowthHubRecommendation"("createdByUserId");
CREATE INDEX "GrowthHubRecommendation_convertedByUserId_idx"
  ON "GrowthHubRecommendation"("convertedByUserId");
CREATE INDEX "GrowthHubRecommendation_type_idx"
  ON "GrowthHubRecommendation"("type");
CREATE INDEX "GrowthHubRecommendation_updatedAt_idx"
  ON "GrowthHubRecommendation"("updatedAt");

ALTER TABLE "GrowthHubRecommendation"
  ADD CONSTRAINT "GrowthHubRecommendation_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GrowthHubRecommendation"
  ADD CONSTRAINT "GrowthHubRecommendation_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubRecommendation"
  ADD CONSTRAINT "GrowthHubRecommendation_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubRecommendation"
  ADD CONSTRAINT "GrowthHubRecommendation_convertedTaskId_fkey"
  FOREIGN KEY ("convertedTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GrowthHubRecommendation"
  ADD CONSTRAINT "GrowthHubRecommendation_convertedByUserId_fkey"
  FOREIGN KEY ("convertedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
