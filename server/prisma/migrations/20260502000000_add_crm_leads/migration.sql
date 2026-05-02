-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CRM_SPECIALIST';

-- CreateEnum
CREATE TYPE "CrmLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "CrmLeadSource" AS ENUM ('MANUAL', 'WEBSITE_FORM');

-- CreateEnum
CREATE TYPE "CrmLeadActivityType" AS ENUM ('CALL', 'EMAIL', 'WHATSAPP', 'NOTE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "phone" TEXT,
    "source" "CrmLeadSource" NOT NULL DEFAULT 'MANUAL',
    "status" "CrmLeadStatus" NOT NULL DEFAULT 'NEW',
    "ownerUserId" UUID NOT NULL,
    "convertedClientProfileId" UUID,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLeadActivity" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "actorUserId" UUID,
    "type" "CrmLeadActivityType" NOT NULL,
    "note" TEXT NOT NULL,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmLeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmLead_ownerUserId_idx" ON "CrmLead"("ownerUserId");

-- CreateIndex
CREATE INDEX "CrmLead_status_idx" ON "CrmLead"("status");

-- CreateIndex
CREATE INDEX "CrmLead_source_idx" ON "CrmLead"("source");

-- CreateIndex
CREATE INDEX "CrmLead_nextFollowUpAt_idx" ON "CrmLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmLead_convertedClientProfileId_idx" ON "CrmLead"("convertedClientProfileId");

-- CreateIndex
CREATE INDEX "CrmLead_createdAt_idx" ON "CrmLead"("createdAt");

-- CreateIndex
CREATE INDEX "CrmLeadActivity_leadId_idx" ON "CrmLeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "CrmLeadActivity_actorUserId_idx" ON "CrmLeadActivity"("actorUserId");

-- CreateIndex
CREATE INDEX "CrmLeadActivity_type_idx" ON "CrmLeadActivity"("type");

-- CreateIndex
CREATE INDEX "CrmLeadActivity_createdAt_idx" ON "CrmLeadActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CrmLeadActivity_nextFollowUpAt_idx" ON "CrmLeadActivity"("nextFollowUpAt");

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_convertedClientProfileId_fkey" FOREIGN KEY ("convertedClientProfileId") REFERENCES "ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLeadActivity" ADD CONSTRAINT "CrmLeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLeadActivity" ADD CONSTRAINT "CrmLeadActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
