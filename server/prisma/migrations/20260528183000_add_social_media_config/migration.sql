-- CreateEnum
CREATE TYPE "SocialMediaConnectionStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'CONNECTED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "SocialMediaGoal" AS ENUM (
  'BRAND_AWARENESS',
  'COMMUNITY_GROWTH',
  'ENGAGEMENT',
  'LEAD_GENERATION',
  'SALES_SUPPORT',
  'REPUTATION',
  'MIXED'
);

-- CreateTable
CREATE TABLE "ClientSocialMediaConfig" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "instagramUsername" TEXT,
    "instagramAccountId" TEXT,
    "facebookPageId" TEXT,
    "tiktokUsername" TEXT,
    "linkedinPageUrl" TEXT,
    "contentFrequency" TEXT,
    "primaryGoal" "SocialMediaGoal",
    "toneOfVoice" TEXT,
    "hashtags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "connectionStatus" "SocialMediaConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSocialMediaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSocialMediaConfig_clientProfileId_key" ON "ClientSocialMediaConfig"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientSocialMediaConfig_connectionStatus_idx" ON "ClientSocialMediaConfig"("connectionStatus");

-- CreateIndex
CREATE INDEX "ClientSocialMediaConfig_primaryGoal_idx" ON "ClientSocialMediaConfig"("primaryGoal");

-- CreateIndex
CREATE INDEX "ClientSocialMediaConfig_updatedAt_idx" ON "ClientSocialMediaConfig"("updatedAt");

-- AddForeignKey
ALTER TABLE "ClientSocialMediaConfig" ADD CONSTRAINT "ClientSocialMediaConfig_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
