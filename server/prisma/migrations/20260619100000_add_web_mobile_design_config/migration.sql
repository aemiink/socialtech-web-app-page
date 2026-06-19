-- CreateEnum
CREATE TYPE "DesignSystemStatus" AS ENUM ('NONE', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ClientWebMobileDesignConfig" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientProfileId" UUID NOT NULL,
    "figmaFileUrl" TEXT,
    "prototypeUrl" TEXT,
    "styleGuideUrl" TEXT,
    "designSystemStatus" "DesignSystemStatus" NOT NULL DEFAULT 'NONE',
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "fontFamily" TEXT,
    "targetPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gridSystem" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientWebMobileDesignConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientWebMobileDesignConfig_clientProfileId_key" ON "ClientWebMobileDesignConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientWebMobileDesignConfig_designSystemStatus_idx" ON "ClientWebMobileDesignConfig"("designSystemStatus");

-- CreateIndex
CREATE INDEX "ClientWebMobileDesignConfig_updatedAt_idx" ON "ClientWebMobileDesignConfig"("updatedAt");

-- AddForeignKey
ALTER TABLE "ClientWebMobileDesignConfig" ADD CONSTRAINT "ClientWebMobileDesignConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
