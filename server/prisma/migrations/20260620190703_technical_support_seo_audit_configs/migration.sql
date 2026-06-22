-- CreateTable
CREATE TABLE "ClientTechnicalSupportConfig" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "slaLevel" TEXT,
    "supportPortalUrl" TEXT,
    "maintenanceWindowDay" TEXT,
    "maintenanceWindowTime" TEXT,
    "monitoringEnabled" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT,
    "uptimeTarget" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTechnicalSupportConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSeoAuditConfig" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "siteUrl" TEXT,
    "gaPropertyId" TEXT,
    "searchConsolePropertyUrl" TEXT,
    "targetKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auditFrequency" TEXT,
    "lastAuditScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSeoAuditConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientTechnicalSupportConfig_clientProfileId_key" ON "ClientTechnicalSupportConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientTechnicalSupportConfig_updatedAt_idx" ON "ClientTechnicalSupportConfig"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSeoAuditConfig_clientProfileId_key" ON "ClientSeoAuditConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientSeoAuditConfig_updatedAt_idx" ON "ClientSeoAuditConfig"("updatedAt");

-- AddForeignKey
ALTER TABLE "ClientTechnicalSupportConfig" ADD CONSTRAINT "ClientTechnicalSupportConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSeoAuditConfig" ADD CONSTRAINT "ClientSeoAuditConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
