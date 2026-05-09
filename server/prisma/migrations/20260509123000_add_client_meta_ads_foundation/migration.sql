-- CreateEnum
CREATE TYPE "MetaAdsConnectionStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "ClientMetaAdsConfig" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "businessId" TEXT,
  "adAccountId" TEXT,
  "pixelId" TEXT,
  "instagramAccountId" TEXT,
  "facebookPageId" TEXT,
  "currency" TEXT,
  "timezone" TEXT,
  "connectionStatus" "MetaAdsConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
  "lastSyncAt" TIMESTAMP(3),
  "syncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientMetaAdsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMetaAdsCredential" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "accessTokenEnc" TEXT,
  "tokenHash" TEXT,
  "tokenExpiresAt" TIMESTAMP(3),
  "grantedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientMetaAdsCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientMetaAdsConfig_clientProfileId_key" ON "ClientMetaAdsConfig"("clientProfileId");
CREATE INDEX "ClientMetaAdsConfig_connectionStatus_idx" ON "ClientMetaAdsConfig"("connectionStatus");
CREATE INDEX "ClientMetaAdsConfig_lastSyncAt_idx" ON "ClientMetaAdsConfig"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMetaAdsCredential_clientProfileId_key" ON "ClientMetaAdsCredential"("clientProfileId");
CREATE INDEX "ClientMetaAdsCredential_tokenHash_idx" ON "ClientMetaAdsCredential"("tokenHash");
CREATE INDEX "ClientMetaAdsCredential_tokenExpiresAt_idx" ON "ClientMetaAdsCredential"("tokenExpiresAt");

-- AddForeignKey
ALTER TABLE "ClientMetaAdsConfig"
  ADD CONSTRAINT "ClientMetaAdsConfig_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientMetaAdsCredential"
  ADD CONSTRAINT "ClientMetaAdsCredential_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
