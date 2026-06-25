-- CreateEnum
CREATE TYPE "ClientTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "ClientTicket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientProfileId" UUID NOT NULL,
    "projectId" UUID,
    "serviceKey" "PurchasedServiceKey",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ClientTicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdByUserId" UUID NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTicketMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientTicket_clientProfileId_status_updatedAt_idx" ON "ClientTicket"("clientProfileId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ClientTicket_clientProfileId_serviceKey_status_idx" ON "ClientTicket"("clientProfileId", "serviceKey", "status");

-- CreateIndex
CREATE INDEX "ClientTicket_projectId_status_idx" ON "ClientTicket"("projectId", "status");

-- CreateIndex
CREATE INDEX "ClientTicket_createdByUserId_createdAt_idx" ON "ClientTicket"("createdByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientTicketMessage_ticketId_createdAt_idx" ON "ClientTicketMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientTicketMessage_authorUserId_createdAt_idx" ON "ClientTicketMessage"("authorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClientTicket" ADD CONSTRAINT "ClientTicket_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTicket" ADD CONSTRAINT "ClientTicket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTicket" ADD CONSTRAINT "ClientTicket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTicketMessage" ADD CONSTRAINT "ClientTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ClientTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTicketMessage" ADD CONSTRAINT "ClientTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
