-- CreateEnum
CREATE TYPE "SocialMediaReportType" AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'POST_PERFORMANCE',
  'CONTENT_CALENDAR',
  'CREATIVE_PERFORMANCE',
  'ENGAGEMENT_REPORT'
);

-- CreateEnum
CREATE TYPE "SocialMediaReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "SocialMediaPostInsight" (
  "id" UUID NOT NULL,
  "postId" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "platform" "SocialMediaPlatform" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "impressions" INTEGER,
  "reach" INTEGER,
  "likes" INTEGER,
  "comments" INTEGER,
  "shares" INTEGER,
  "saves" INTEGER,
  "profileVisits" INTEGER,
  "follows" INTEGER,
  "clicks" INTEGER,
  "engagementRate" DECIMAL(65,30),
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialMediaPostInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaReport" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "type" "SocialMediaReportType" NOT NULL,
  "status" "SocialMediaReportStatus" NOT NULL DEFAULT 'DRAFT',
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

  CONSTRAINT "SocialMediaReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMediaPostInsight_clientProfileId_date_idx"
  ON "SocialMediaPostInsight"("clientProfileId", "date");
CREATE INDEX "SocialMediaPostInsight_postId_date_idx"
  ON "SocialMediaPostInsight"("postId", "date");
CREATE INDEX "SocialMediaPostInsight_platform_date_idx"
  ON "SocialMediaPostInsight"("platform", "date");
CREATE INDEX "SocialMediaPostInsight_createdAt_idx"
  ON "SocialMediaPostInsight"("createdAt");

CREATE INDEX "SocialMediaReport_clientProfileId_createdAt_idx"
  ON "SocialMediaReport"("clientProfileId", "createdAt");
CREATE INDEX "SocialMediaReport_clientProfileId_status_createdAt_idx"
  ON "SocialMediaReport"("clientProfileId", "status", "createdAt");
CREATE INDEX "SocialMediaReport_clientProfileId_type_periodStart_periodEnd_idx"
  ON "SocialMediaReport"("clientProfileId", "type", "periodStart", "periodEnd");
CREATE INDEX "SocialMediaReport_clientVisible_status_createdAt_idx"
  ON "SocialMediaReport"("clientVisible", "status", "createdAt");
CREATE INDEX "SocialMediaReport_projectId_idx"
  ON "SocialMediaReport"("projectId");
CREATE INDEX "SocialMediaReport_createdByUserId_idx"
  ON "SocialMediaReport"("createdByUserId");
CREATE INDEX "SocialMediaReport_publishedByUserId_idx"
  ON "SocialMediaReport"("publishedByUserId");
CREATE INDEX "SocialMediaReport_acknowledgedByUserId_idx"
  ON "SocialMediaReport"("acknowledgedByUserId");
CREATE INDEX "SocialMediaReport_acknowledgementTaskId_idx"
  ON "SocialMediaReport"("acknowledgementTaskId");

-- AddForeignKey
ALTER TABLE "SocialMediaPostInsight"
  ADD CONSTRAINT "SocialMediaPostInsight_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "SocialMediaPost"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SocialMediaPostInsight"
  ADD CONSTRAINT "SocialMediaPostInsight_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_publishedByUserId_fkey"
  FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_acknowledgedByUserId_fkey"
  FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialMediaReport"
  ADD CONSTRAINT "SocialMediaReport_acknowledgementTaskId_fkey"
  FOREIGN KEY ("acknowledgementTaskId") REFERENCES "Task"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
