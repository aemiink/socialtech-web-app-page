-- CreateEnum
CREATE TYPE "MetaAdsSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- CreateTable
CREATE TABLE "MetaAdsSyncLog" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "adAccountId" TEXT,
  "status" "MetaAdsSyncStatus" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "finishedAt" TIMESTAMP(3),
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "recordsFetched" INTEGER,
  "apiCallCount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MetaAdsSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaAdsSyncLog_clientProfileId_createdAt_idx"
  ON "MetaAdsSyncLog"("clientProfileId", "createdAt");
CREATE INDEX "MetaAdsSyncLog_status_createdAt_idx"
  ON "MetaAdsSyncLog"("status", "createdAt");
CREATE INDEX "MetaAdsSyncLog_clientProfileId_status_createdAt_idx"
  ON "MetaAdsSyncLog"("clientProfileId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "MetaAdsSyncLog"
  ADD CONSTRAINT "MetaAdsSyncLog_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
