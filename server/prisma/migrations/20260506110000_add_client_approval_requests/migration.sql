-- Client approval/information workflow
CREATE TYPE "ClientApprovalType" AS ENUM (
  'DESIGN_APPROVAL',
  'FILE_APPROVAL',
  'TASK_APPROVAL',
  'SPRINT_APPROVAL',
  'RELEASE_APPROVAL',
  'REVISION_APPROVAL',
  'MEETING_CONFIRMATION',
  'INFORMATION',
  'GENERAL_CONFIRMATION'
);

CREATE TYPE "ClientApprovalStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACKNOWLEDGED',
  'CANCELLED',
  'EXPIRED'
);

CREATE TYPE "ClientApprovalEntityType" AS ENUM (
  'PROJECT',
  'TASK',
  'TASK_TODO',
  'SPRINT',
  'RELEASE',
  'PROJECT_FILE',
  'WORKSPACE_MESSAGE',
  'DESIGN_ASSET',
  'REVISION',
  'MEETING_REQUEST'
);

CREATE TABLE "ClientApprovalRequest" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "projectId" UUID,
  "serviceKey" "PurchasedServiceKey",
  "requestedByUserId" UUID,
  "assignedToUserId" UUID,
  "respondedByUserId" UUID,
  "type" "ClientApprovalType" NOT NULL,
  "status" "ClientApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "entityType" "ClientApprovalEntityType",
  "entityId" TEXT,
  "actionPayload" JSONB,
  "requiresExplicitApproval" BOOLEAN NOT NULL DEFAULT true,
  "clientResponseNote" TEXT,
  "respondedAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientApprovalTransition" (
  "id" UUID NOT NULL,
  "approvalId" UUID NOT NULL,
  "actorUserId" UUID NOT NULL,
  "fromStatus" "ClientApprovalStatus",
  "toStatus" "ClientApprovalStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClientApprovalTransition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientApprovalRequest_clientProfileId_idx"
ON "ClientApprovalRequest"("clientProfileId");

CREATE INDEX "ClientApprovalRequest_projectId_idx"
ON "ClientApprovalRequest"("projectId");

CREATE INDEX "ClientApprovalRequest_serviceKey_idx"
ON "ClientApprovalRequest"("serviceKey");

CREATE INDEX "ClientApprovalRequest_status_idx"
ON "ClientApprovalRequest"("status");

CREATE INDEX "ClientApprovalRequest_type_idx"
ON "ClientApprovalRequest"("type");

CREATE INDEX "ClientApprovalRequest_entityType_entityId_idx"
ON "ClientApprovalRequest"("entityType", "entityId");

CREATE INDEX "ClientApprovalRequest_requestedByUserId_idx"
ON "ClientApprovalRequest"("requestedByUserId");

CREATE INDEX "ClientApprovalRequest_assignedToUserId_idx"
ON "ClientApprovalRequest"("assignedToUserId");

CREATE INDEX "ClientApprovalRequest_respondedByUserId_idx"
ON "ClientApprovalRequest"("respondedByUserId");

CREATE INDEX "ClientApprovalRequest_createdAt_idx"
ON "ClientApprovalRequest"("createdAt");

CREATE INDEX "ClientApprovalRequest_dueAt_idx"
ON "ClientApprovalRequest"("dueAt");

CREATE INDEX "ClientApprovalTransition_approvalId_createdAt_idx"
ON "ClientApprovalTransition"("approvalId", "createdAt");

CREATE INDEX "ClientApprovalTransition_actorUserId_createdAt_idx"
ON "ClientApprovalTransition"("actorUserId", "createdAt");

ALTER TABLE "ClientApprovalRequest"
ADD CONSTRAINT "ClientApprovalRequest_clientProfileId_fkey"
FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalRequest"
ADD CONSTRAINT "ClientApprovalRequest_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalRequest"
ADD CONSTRAINT "ClientApprovalRequest_requestedByUserId_fkey"
FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalRequest"
ADD CONSTRAINT "ClientApprovalRequest_assignedToUserId_fkey"
FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalRequest"
ADD CONSTRAINT "ClientApprovalRequest_respondedByUserId_fkey"
FOREIGN KEY ("respondedByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalTransition"
ADD CONSTRAINT "ClientApprovalTransition_approvalId_fkey"
FOREIGN KEY ("approvalId") REFERENCES "ClientApprovalRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientApprovalTransition"
ADD CONSTRAINT "ClientApprovalTransition_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
