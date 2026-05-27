-- CreateEnum
CREATE TYPE "AmazonAdsConnectionStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "AmazonAdsRegion" AS ENUM ('NA', 'EU', 'FE');

-- CreateTable
CREATE TABLE "ClientAmazonAdsConfig" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "profileId" TEXT,
    "advertiserAccountId" TEXT,
    "marketplaceId" TEXT,
    "region" "AmazonAdsRegion",
    "countryCode" TEXT,
    "currencyCode" TEXT,
    "timezone" TEXT,
    "accountType" TEXT,
    "accountName" TEXT,
    "validPaymentMethod" BOOLEAN,
    "connectionStatus" "AmazonAdsConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAmazonAdsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAmazonAdsCredential" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "tokenHash" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "grantedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAmazonAdsCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAmazonAdsConfig_clientProfileId_key" ON "ClientAmazonAdsConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsConfig_connectionStatus_idx" ON "ClientAmazonAdsConfig"("connectionStatus");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsConfig_lastSyncAt_idx" ON "ClientAmazonAdsConfig"("lastSyncAt");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsConfig_region_idx" ON "ClientAmazonAdsConfig"("region");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsConfig_marketplaceId_idx" ON "ClientAmazonAdsConfig"("marketplaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAmazonAdsCredential_clientProfileId_key" ON "ClientAmazonAdsCredential"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsCredential_tokenHash_idx" ON "ClientAmazonAdsCredential"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsCredential_accessTokenExpiresAt_idx" ON "ClientAmazonAdsCredential"("accessTokenExpiresAt");

-- CreateIndex
CREATE INDEX "ClientAmazonAdsCredential_refreshTokenExpiresAt_idx" ON "ClientAmazonAdsCredential"("refreshTokenExpiresAt");

-- AddForeignKey
ALTER TABLE "ClientAmazonAdsConfig" ADD CONSTRAINT "ClientAmazonAdsConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAmazonAdsCredential" ADD CONSTRAINT "ClientAmazonAdsCredential_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
