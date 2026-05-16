-- CreateEnum
CREATE TYPE "GoogleAdsSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- CreateTable
CREATE TABLE "GoogleAdsSyncLog" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "customerId" TEXT,
  "managerCustomerId" TEXT,
  "status" "GoogleAdsSyncStatus" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "finishedAt" TIMESTAMP(3),
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "recordsFetched" INTEGER,
  "apiCallCount" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GoogleAdsSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAdsSyncLog_clientProfileId_createdAt_idx" ON "GoogleAdsSyncLog"("clientProfileId", "createdAt");
CREATE INDEX "GoogleAdsSyncLog_status_createdAt_idx" ON "GoogleAdsSyncLog"("status", "createdAt");
CREATE INDEX "GoogleAdsSyncLog_clientProfileId_status_createdAt_idx" ON "GoogleAdsSyncLog"("clientProfileId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "GoogleAdsSyncLog"
  ADD CONSTRAINT "GoogleAdsSyncLog_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
