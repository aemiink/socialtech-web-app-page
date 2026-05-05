-- CreateEnum
CREATE TYPE "DeliveryReleaseApprovalStatus" AS ENUM (
  'NOT_REQUESTED',
  'PENDING',
  'APPROVED',
  'CHANGES_REQUESTED',
  'REJECTED'
);

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "figmaProjectUrl" TEXT,
ADD COLUMN "repositoryUrl" TEXT;

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN "branchName" TEXT,
ADD COLUMN "codePreparationNotes" TEXT,
ADD COLUMN "codePreparedAt" TIMESTAMP(3),
ADD COLUMN "codePreparedByUserId" UUID;

-- AlterTable
ALTER TABLE "DeliveryRelease"
ADD COLUMN "approvalActorUserId" UUID,
ADD COLUMN "approvalNotes" TEXT,
ADD COLUMN "approvalRequestedAt" TIMESTAMP(3),
ADD COLUMN "approvalRespondedAt" TIMESTAMP(3),
ADD COLUMN "approvalStatus" "DeliveryReleaseApprovalStatus" NOT NULL DEFAULT 'NOT_REQUESTED';

-- CreateTable
CREATE TABLE "TaskWorkNote" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "authorUserId" UUID NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TaskWorkNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_codePreparedByUserId_idx" ON "Task"("codePreparedByUserId");

-- CreateIndex
CREATE INDEX "Task_branchName_idx" ON "Task"("branchName");

-- CreateIndex
CREATE INDEX "DeliveryRelease_approvalStatus_idx" ON "DeliveryRelease"("approvalStatus");

-- CreateIndex
CREATE INDEX "DeliveryRelease_approvalActorUserId_idx" ON "DeliveryRelease"("approvalActorUserId");

-- CreateIndex
CREATE INDEX "TaskWorkNote_taskId_createdAt_idx" ON "TaskWorkNote"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskWorkNote_authorUserId_createdAt_idx" ON "TaskWorkNote"("authorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Task"
ADD CONSTRAINT "Task_codePreparedByUserId_fkey"
FOREIGN KEY ("codePreparedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRelease"
ADD CONSTRAINT "DeliveryRelease_approvalActorUserId_fkey"
FOREIGN KEY ("approvalActorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWorkNote"
ADD CONSTRAINT "TaskWorkNote_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWorkNote"
ADD CONSTRAINT "TaskWorkNote_authorUserId_fkey"
FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
