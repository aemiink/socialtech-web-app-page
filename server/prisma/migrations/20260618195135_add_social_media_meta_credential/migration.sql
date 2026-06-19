-- AlterTable
ALTER TABLE "SocialMediaPost" ADD COLUMN     "externalMediaUrl" TEXT;

-- CreateTable
CREATE TABLE "ClientSocialMediaMetaCredential" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "pageAccessTokenEnc" TEXT,
    "facebookPageId" TEXT,
    "instagramAccountId" TEXT,
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSocialMediaMetaCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSocialMediaMetaCredential_clientProfileId_key" ON "ClientSocialMediaMetaCredential"("clientProfileId");

-- CreateIndex
CREATE INDEX "ClientSocialMediaMetaCredential_clientProfileId_idx" ON "ClientSocialMediaMetaCredential"("clientProfileId");

-- AddForeignKey
ALTER TABLE "ClientSocialMediaMetaCredential" ADD CONSTRAINT "ClientSocialMediaMetaCredential_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
