-- CreateEnum
CREATE TYPE "MetaAdsApprovalType" AS ENUM ('META_ADS_CAMPAIGN_APPROVAL', 'META_ADS_CREATIVE_APPROVAL', 'META_ADS_BUDGET_CHANGE_APPROVAL', 'META_ADS_REPORT_ACKNOWLEDGEMENT', 'META_ADS_STRATEGY_APPROVAL');

-- CreateEnum
CREATE TYPE "MetaAdsApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'ACKNOWLEDGED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "adRef" TEXT,
ADD COLUMN     "adSetRef" TEXT,
ADD COLUMN     "approvalContext" JSONB,
ADD COLUMN     "approvalRequestedAt" TIMESTAMP(3),
ADD COLUMN     "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvalRespondedAt" TIMESTAMP(3),
ADD COLUMN     "approvalRespondedByUserId" UUID,
ADD COLUMN     "approvalResponseNote" TEXT,
ADD COLUMN     "approvalStatus" "MetaAdsApprovalStatus",
ADD COLUMN     "approvalType" "MetaAdsApprovalType",
ADD COLUMN     "campaignRef" TEXT,
ADD COLUMN     "referenceProjectFileId" UUID;

-- AlterTable
ALTER TABLE "ProjectFile" ADD COLUMN     "adRef" TEXT,
ADD COLUMN     "adSetRef" TEXT,
ADD COLUMN     "approvalRequestedAt" TIMESTAMP(3),
ADD COLUMN     "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvalRespondedAt" TIMESTAMP(3),
ADD COLUMN     "approvalRespondedByUserId" UUID,
ADD COLUMN     "approvalResponseNote" TEXT,
ADD COLUMN     "approvalStatus" "MetaAdsApprovalStatus",
ADD COLUMN     "approvalType" "MetaAdsApprovalType",
ADD COLUMN     "campaignRef" TEXT,
ADD COLUMN     "performanceSummary" JSONB;

-- CreateIndex
CREATE INDEX "Task_approvalRequired_idx" ON "Task"("approvalRequired");

-- CreateIndex
CREATE INDEX "Task_approvalType_idx" ON "Task"("approvalType");

-- CreateIndex
CREATE INDEX "Task_approvalStatus_idx" ON "Task"("approvalStatus");

-- CreateIndex
CREATE INDEX "Task_approvalRespondedByUserId_idx" ON "Task"("approvalRespondedByUserId");

-- CreateIndex
CREATE INDEX "Task_referenceProjectFileId_idx" ON "Task"("referenceProjectFileId");

-- CreateIndex
CREATE INDEX "ProjectFile_approvalRequired_idx" ON "ProjectFile"("approvalRequired");

-- CreateIndex
CREATE INDEX "ProjectFile_approvalType_idx" ON "ProjectFile"("approvalType");

-- CreateIndex
CREATE INDEX "ProjectFile_approvalStatus_idx" ON "ProjectFile"("approvalStatus");

-- CreateIndex
CREATE INDEX "ProjectFile_approvalRespondedByUserId_idx" ON "ProjectFile"("approvalRespondedByUserId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_approvalRespondedByUserId_fkey" FOREIGN KEY ("approvalRespondedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_referenceProjectFileId_fkey" FOREIGN KEY ("referenceProjectFileId") REFERENCES "ProjectFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_approvalRespondedByUserId_fkey" FOREIGN KEY ("approvalRespondedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
