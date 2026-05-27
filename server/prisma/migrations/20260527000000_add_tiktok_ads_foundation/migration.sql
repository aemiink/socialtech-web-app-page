-- CreateEnum
CREATE TYPE "TikTokAdsConnectionStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "TikTokAdsInsightLevel" AS ENUM ('ACCOUNT', 'CAMPAIGN', 'ADGROUP', 'AD');

-- CreateTable
CREATE TABLE "ClientTikTokAdsConfig" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "advertiserId" TEXT,
    "businessCenterId" TEXT,
    "pixelId" TEXT,
    "advertiserName" TEXT,
    "currency" TEXT,
    "timezone" TEXT,
    "connectionStatus" "TikTokAdsConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTikTokAdsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTikTokAdsCredential" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "tokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientTikTokAdsCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientTikTokAdsConfig_clientProfileId_key" ON "ClientTikTokAdsConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientTikTokAdsConfig_connectionStatus_idx" ON "ClientTikTokAdsConfig"("connectionStatus");

-- CreateIndex
CREATE INDEX "ClientTikTokAdsConfig_lastSyncAt_idx" ON "ClientTikTokAdsConfig"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientTikTokAdsCredential_clientProfileId_key" ON "ClientTikTokAdsCredential"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientTikTokAdsCredential_tokenHash_idx" ON "ClientTikTokAdsCredential"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientTikTokAdsCredential_tokenExpiresAt_idx" ON "ClientTikTokAdsCredential"("tokenExpiresAt");

-- AddForeignKey
ALTER TABLE "ClientTikTokAdsConfig" ADD CONSTRAINT "ClientTikTokAdsConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTikTokAdsCredential" ADD CONSTRAINT "ClientTikTokAdsCredential_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
