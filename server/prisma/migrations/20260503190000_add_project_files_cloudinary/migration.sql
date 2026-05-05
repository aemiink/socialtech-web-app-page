-- CreateEnum
CREATE TYPE "ProjectFileVisibility" AS ENUM ('INTERNAL', 'CLIENT_VISIBLE');

-- CreateEnum
CREATE TYPE "ProjectFileCategory" AS ENUM (
  'WEB_SOURCE',
  'WEB_BUILD',
  'MOBILE_SOURCE',
  'MOBILE_BUILD',
  'ADS_CREATIVE',
  'SEO_REPORT',
  'BRAND_ASSET',
  'DOCUMENT',
  'CONTRACT',
  'OTHER'
);

-- CreateTable
CREATE TABLE "ProjectFile" (
  "id" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "clientProfileId" UUID NOT NULL,
  "serviceKey" "PurchasedServiceKey",
  "category" "ProjectFileCategory" NOT NULL,
  "visibility" "ProjectFileVisibility" NOT NULL DEFAULT 'INTERNAL',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "publicId" TEXT NOT NULL,
  "secureUrl" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL DEFAULT 'raw',
  "format" TEXT,
  "bytes" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "uploadedByUserId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFileShareLink" (
  "id" UUID NOT NULL,
  "projectFileId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdByUserId" UUID NOT NULL,
  "isRevoked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectFileShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_projectId_publicId_key" ON "ProjectFile"("projectId", "publicId");
CREATE INDEX "ProjectFile_projectId_createdAt_idx" ON "ProjectFile"("projectId", "createdAt");
CREATE INDEX "ProjectFile_clientProfileId_createdAt_idx" ON "ProjectFile"("clientProfileId", "createdAt");
CREATE INDEX "ProjectFile_serviceKey_idx" ON "ProjectFile"("serviceKey");
CREATE INDEX "ProjectFile_category_idx" ON "ProjectFile"("category");
CREATE INDEX "ProjectFile_visibility_idx" ON "ProjectFile"("visibility");
CREATE INDEX "ProjectFile_uploadedByUserId_idx" ON "ProjectFile"("uploadedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFileShareLink_tokenHash_key" ON "ProjectFileShareLink"("tokenHash");
CREATE INDEX "ProjectFileShareLink_projectFileId_createdAt_idx" ON "ProjectFileShareLink"("projectFileId", "createdAt");
CREATE INDEX "ProjectFileShareLink_expiresAt_idx" ON "ProjectFileShareLink"("expiresAt");
CREATE INDEX "ProjectFileShareLink_isRevoked_idx" ON "ProjectFileShareLink"("isRevoked");
CREATE INDEX "ProjectFileShareLink_createdByUserId_createdAt_idx" ON "ProjectFileShareLink"("createdByUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectFile"
  ADD CONSTRAINT "ProjectFile_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectFile"
  ADD CONSTRAINT "ProjectFile_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectFile"
  ADD CONSTRAINT "ProjectFile_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFileShareLink"
  ADD CONSTRAINT "ProjectFileShareLink_projectFileId_fkey"
  FOREIGN KEY ("projectFileId") REFERENCES "ProjectFile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectFileShareLink"
  ADD CONSTRAINT "ProjectFileShareLink_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
