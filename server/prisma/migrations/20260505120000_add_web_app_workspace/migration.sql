-- CreateEnum
CREATE TYPE "WebAppWorkspaceTabKey" AS ENUM (
    'OVERVIEW',
    'TASKS',
    'DELIVERY',
    'FILES',
    'CONTENT',
    'MESSAGES',
    'REVISIONS',
    'REPORTS',
    'MEETINGS'
);

-- CreateEnum
CREATE TYPE "WebAppWorkspaceContentItemType" AS ENUM ('TEXT', 'LINK', 'EMBED', 'CHECKLIST', 'METRIC');

-- CreateEnum
CREATE TYPE "WebAppWorkspaceRevisionStatus" AS ENUM (
    'REQUESTED',
    'ACKNOWLEDGED',
    'IN_PROGRESS',
    'READY_FOR_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

-- CreateEnum
CREATE TYPE "WebAppWorkspaceMeetingRequestStatus" AS ENUM (
    'REQUESTED',
    'CONFIRMED',
    'DECLINED',
    'COMPLETED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceSection" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "tabKey" "WebAppWorkspaceTabKey" NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceContentItem" (
    "id" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "itemType" "WebAppWorkspaceContentItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceMessage" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "tabKey" "WebAppWorkspaceTabKey" NOT NULL,
    "authorUserId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceRevision" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "taskId" UUID,
    "releaseId" UUID,
    "projectFileId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "assignedToUserId" UUID,
    "status" "WebAppWorkspaceRevisionStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceRevisionTransition" (
    "id" UUID NOT NULL,
    "revisionId" UUID NOT NULL,
    "fromStatus" "WebAppWorkspaceRevisionStatus",
    "toStatus" "WebAppWorkspaceRevisionStatus" NOT NULL,
    "actorUserId" UUID NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAppWorkspaceRevisionTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceWeeklyReport" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "accomplishments" TEXT,
    "plannedNext" TEXT,
    "blockers" TEXT,
    "authorUserId" UUID NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceWeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebAppWorkspaceMeetingRequest" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "agenda" TEXT,
    "requestedByUserId" UUID NOT NULL,
    "preferredStartAt" TIMESTAMP(3) NOT NULL,
    "preferredEndAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "status" "WebAppWorkspaceMeetingRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "responseNote" TEXT,
    "responderUserId" UUID,
    "scheduledStartAt" TIMESTAMP(3),
    "scheduledEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAppWorkspaceMeetingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebAppWorkspaceSection_projectId_tabKey_key_key"
ON "WebAppWorkspaceSection"("projectId", "tabKey", "key");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceSection_projectId_tabKey_sortOrder_idx"
ON "WebAppWorkspaceSection"("projectId", "tabKey", "sortOrder");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceSection_createdByUserId_idx"
ON "WebAppWorkspaceSection"("createdByUserId");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceContentItem_sectionId_sortOrder_idx"
ON "WebAppWorkspaceContentItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceContentItem_itemType_idx"
ON "WebAppWorkspaceContentItem"("itemType");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceMessage_projectId_tabKey_createdAt_idx"
ON "WebAppWorkspaceMessage"("projectId", "tabKey", "createdAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceMessage_authorUserId_createdAt_idx"
ON "WebAppWorkspaceMessage"("authorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_projectId_status_requestedAt_idx"
ON "WebAppWorkspaceRevision"("projectId", "status", "requestedAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_taskId_idx"
ON "WebAppWorkspaceRevision"("taskId");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_releaseId_idx"
ON "WebAppWorkspaceRevision"("releaseId");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_projectFileId_idx"
ON "WebAppWorkspaceRevision"("projectFileId");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_requestedByUserId_requestedAt_idx"
ON "WebAppWorkspaceRevision"("requestedByUserId", "requestedAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevision_assignedToUserId_status_idx"
ON "WebAppWorkspaceRevision"("assignedToUserId", "status");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevisionTransition_revisionId_createdAt_idx"
ON "WebAppWorkspaceRevisionTransition"("revisionId", "createdAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceRevisionTransition_actorUserId_createdAt_idx"
ON "WebAppWorkspaceRevisionTransition"("actorUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebAppWorkspaceWeeklyReport_projectId_weekStartDate_key"
ON "WebAppWorkspaceWeeklyReport"("projectId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceWeeklyReport_projectId_weekEndDate_idx"
ON "WebAppWorkspaceWeeklyReport"("projectId", "weekEndDate");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceWeeklyReport_authorUserId_weekStartDate_idx"
ON "WebAppWorkspaceWeeklyReport"("authorUserId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceMeetingRequest_projectId_status_preferredStartAt_idx"
ON "WebAppWorkspaceMeetingRequest"("projectId", "status", "preferredStartAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceMeetingRequest_requestedByUserId_createdAt_idx"
ON "WebAppWorkspaceMeetingRequest"("requestedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "WebAppWorkspaceMeetingRequest_responderUserId_updatedAt_idx"
ON "WebAppWorkspaceMeetingRequest"("responderUserId", "updatedAt");

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceSection"
ADD CONSTRAINT "WebAppWorkspaceSection_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceSection"
ADD CONSTRAINT "WebAppWorkspaceSection_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceContentItem"
ADD CONSTRAINT "WebAppWorkspaceContentItem_sectionId_fkey"
FOREIGN KEY ("sectionId") REFERENCES "WebAppWorkspaceSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceMessage"
ADD CONSTRAINT "WebAppWorkspaceMessage_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceMessage"
ADD CONSTRAINT "WebAppWorkspaceMessage_authorUserId_fkey"
FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_releaseId_fkey"
FOREIGN KEY ("releaseId") REFERENCES "DeliveryRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_projectFileId_fkey"
FOREIGN KEY ("projectFileId") REFERENCES "ProjectFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_requestedByUserId_fkey"
FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevision"
ADD CONSTRAINT "WebAppWorkspaceRevision_assignedToUserId_fkey"
FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevisionTransition"
ADD CONSTRAINT "WebAppWorkspaceRevisionTransition_revisionId_fkey"
FOREIGN KEY ("revisionId") REFERENCES "WebAppWorkspaceRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceRevisionTransition"
ADD CONSTRAINT "WebAppWorkspaceRevisionTransition_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceWeeklyReport"
ADD CONSTRAINT "WebAppWorkspaceWeeklyReport_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceWeeklyReport"
ADD CONSTRAINT "WebAppWorkspaceWeeklyReport_authorUserId_fkey"
FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceMeetingRequest"
ADD CONSTRAINT "WebAppWorkspaceMeetingRequest_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceMeetingRequest"
ADD CONSTRAINT "WebAppWorkspaceMeetingRequest_requestedByUserId_fkey"
FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebAppWorkspaceMeetingRequest"
ADD CONSTRAINT "WebAppWorkspaceMeetingRequest_responderUserId_fkey"
FOREIGN KEY ("responderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
