-- CreateEnum
CREATE TYPE "BillingPackageType" AS ENUM ('LAUNCH', 'GROWTH', 'SCALE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PLANNED', 'PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "ClientInvoice" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "packageType" "BillingPackageType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoice_invoiceNumber_key" ON "ClientInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "ClientInvoice_clientProfileId_idx" ON "ClientInvoice"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientInvoice_clientProfileId_status_idx" ON "ClientInvoice"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "ClientInvoice_status_idx" ON "ClientInvoice"("status");

-- CreateIndex
CREATE INDEX "ClientInvoice_createdAt_idx" ON "ClientInvoice"("createdAt");

-- AddForeignKey
ALTER TABLE "ClientInvoice" ADD CONSTRAINT "ClientInvoice_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoice" ADD CONSTRAINT "ClientInvoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
