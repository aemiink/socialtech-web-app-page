-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'LINKEDIN', 'X', 'PINTEREST');

-- CreateEnum
CREATE TYPE "SocialMediaPostType" AS ENUM ('FEED', 'STORY', 'REEL', 'CAROUSEL', 'SHORT_VIDEO', 'STATIC_IMAGE', 'TEXT');

-- CreateEnum
CREATE TYPE "SocialMediaPostStatus" AS ENUM (
  'IDEA',
  'DRAFT',
  'DESIGN',
  'WAITING_APPROVAL',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'REJECTED',
  'REVISION_REQUIRED',
  'CANCELLED'
);

-- CreateTable
CREATE TABLE "SocialMediaPost" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "projectId" UUID,
    "platform" "SocialMediaPlatform" NOT NULL,
    "type" "SocialMediaPostType" NOT NULL,
    "status" "SocialMediaPostStatus" NOT NULL DEFAULT 'IDEA',
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "clientVisible" BOOLEAN NOT NULL DEFAULT false,
    "approvalTaskId" UUID,
    "createdByUserId" UUID,
    "assignedToUserId" UUID,
    "externalPostId" TEXT,
    "externalPostUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaPostAsset" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialMediaPostAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMediaPost_clientProfileId_scheduledAt_idx" ON "SocialMediaPost"("clientProfileId", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialMediaPost_clientProfileId_status_scheduledAt_idx" ON "SocialMediaPost"("clientProfileId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialMediaPost_projectId_idx" ON "SocialMediaPost"("projectId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_platform_idx" ON "SocialMediaPost"("platform");

-- CreateIndex
CREATE INDEX "SocialMediaPost_status_idx" ON "SocialMediaPost"("status");

-- CreateIndex
CREATE INDEX "SocialMediaPost_clientVisible_scheduledAt_idx" ON "SocialMediaPost"("clientVisible", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialMediaPost_createdByUserId_idx" ON "SocialMediaPost"("createdByUserId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_assignedToUserId_idx" ON "SocialMediaPost"("assignedToUserId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_approvalTaskId_idx" ON "SocialMediaPost"("approvalTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMediaPostAsset_postId_fileId_key" ON "SocialMediaPostAsset"("postId", "fileId");

-- CreateIndex
CREATE INDEX "SocialMediaPostAsset_postId_sortOrder_idx" ON "SocialMediaPostAsset"("postId", "sortOrder");

-- CreateIndex
CREATE INDEX "SocialMediaPostAsset_fileId_idx" ON "SocialMediaPostAsset"("fileId");

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_approvalTaskId_fkey" FOREIGN KEY ("approvalTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPostAsset" ADD CONSTRAINT "SocialMediaPostAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialMediaPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPostAsset" ADD CONSTRAINT "SocialMediaPostAsset_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProjectFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
