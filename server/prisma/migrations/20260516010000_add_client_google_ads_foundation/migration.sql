-- CreateEnum
CREATE TYPE "GoogleAdsConnectionStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "ClientGoogleAdsConfig" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "customerId" TEXT,
  "managerCustomerId" TEXT,
  "descriptiveName" TEXT,
  "currencyCode" TEXT,
  "timeZone" TEXT,
  "connectionStatus" "GoogleAdsConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
  "lastSyncAt" TIMESTAMP(3),
  "syncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientGoogleAdsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientGoogleAdsCredential" (
  "id" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "refreshTokenEnc" TEXT,
  "accessTokenEnc" TEXT,
  "tokenHash" TEXT,
  "tokenExpiresAt" TIMESTAMP(3),
  "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClientGoogleAdsCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientGoogleAdsConfig_clientProfileId_key" ON "ClientGoogleAdsConfig"("clientProfileId");
CREATE INDEX "ClientGoogleAdsConfig_customerId_idx" ON "ClientGoogleAdsConfig"("customerId");
CREATE INDEX "ClientGoogleAdsConfig_connectionStatus_idx" ON "ClientGoogleAdsConfig"("connectionStatus");
CREATE INDEX "ClientGoogleAdsConfig_lastSyncAt_idx" ON "ClientGoogleAdsConfig"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientGoogleAdsCredential_clientProfileId_key" ON "ClientGoogleAdsCredential"("clientProfileId");
CREATE INDEX "ClientGoogleAdsCredential_tokenHash_idx" ON "ClientGoogleAdsCredential"("tokenHash");
CREATE INDEX "ClientGoogleAdsCredential_tokenExpiresAt_idx" ON "ClientGoogleAdsCredential"("tokenExpiresAt");

-- AddForeignKey
ALTER TABLE "ClientGoogleAdsConfig"
  ADD CONSTRAINT "ClientGoogleAdsConfig_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientGoogleAdsCredential"
  ADD CONSTRAINT "ClientGoogleAdsCredential_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
