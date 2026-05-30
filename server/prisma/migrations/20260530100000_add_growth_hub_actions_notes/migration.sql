CREATE TYPE "GrowthHubActionStatus" AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'BLOCKED',
  'CANCELLED'
);

CREATE TYPE "GrowthHubActionPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

CREATE TABLE "GrowthHubAction" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "ownerUserId" UUID,
  "status" "GrowthHubActionStatus" NOT NULL DEFAULT 'TODO',
  "priority" "GrowthHubActionPriority" NOT NULL DEFAULT 'MEDIUM',
  "dueAt" TIMESTAMP(3),
  "clientVisible" BOOLEAN NOT NULL DEFAULT false,
  "relatedEntityType" TEXT,
  "relatedEntityId" TEXT,
  "createdByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GrowthHubAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrowthHubWeeklyNote" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "weekEnd" TIMESTAMP(3) NOT NULL,
  "summary" TEXT NOT NULL,
  "nextFocus" TEXT,
  "risks" JSONB,
  "clientVisible" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GrowthHubWeeklyNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthHubAction_clientProfileId_status_priority_idx"
  ON "GrowthHubAction"("clientProfileId", "status", "priority");

CREATE INDEX "GrowthHubAction_clientProfileId_clientVisible_idx"
  ON "GrowthHubAction"("clientProfileId", "clientVisible");

CREATE INDEX "GrowthHubAction_projectId_idx"
  ON "GrowthHubAction"("projectId");

CREATE INDEX "GrowthHubAction_ownerUserId_idx"
  ON "GrowthHubAction"("ownerUserId");

CREATE INDEX "GrowthHubAction_createdByUserId_idx"
  ON "GrowthHubAction"("createdByUserId");

CREATE INDEX "GrowthHubAction_dueAt_idx"
  ON "GrowthHubAction"("dueAt");

CREATE INDEX "GrowthHubAction_updatedAt_idx"
  ON "GrowthHubAction"("updatedAt");

CREATE INDEX "GrowthHubWeeklyNote_clientProfileId_weekStart_idx"
  ON "GrowthHubWeeklyNote"("clientProfileId", "weekStart");

CREATE INDEX "GrowthHubWeeklyNote_clientProfileId_clientVisible_idx"
  ON "GrowthHubWeeklyNote"("clientProfileId", "clientVisible");

CREATE INDEX "GrowthHubWeeklyNote_projectId_idx"
  ON "GrowthHubWeeklyNote"("projectId");

CREATE INDEX "GrowthHubWeeklyNote_createdByUserId_idx"
  ON "GrowthHubWeeklyNote"("createdByUserId");

CREATE INDEX "GrowthHubWeeklyNote_updatedAt_idx"
  ON "GrowthHubWeeklyNote"("updatedAt");

ALTER TABLE "GrowthHubAction"
  ADD CONSTRAINT "GrowthHubAction_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId")
  REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubAction"
  ADD CONSTRAINT "GrowthHubAction_projectId_fkey"
  FOREIGN KEY ("projectId")
  REFERENCES "Project"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubAction"
  ADD CONSTRAINT "GrowthHubAction_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubAction"
  ADD CONSTRAINT "GrowthHubAction_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubWeeklyNote"
  ADD CONSTRAINT "GrowthHubWeeklyNote_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId")
  REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubWeeklyNote"
  ADD CONSTRAINT "GrowthHubWeeklyNote_projectId_fkey"
  FOREIGN KEY ("projectId")
  REFERENCES "Project"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "GrowthHubWeeklyNote"
  ADD CONSTRAINT "GrowthHubWeeklyNote_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId")
  REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
