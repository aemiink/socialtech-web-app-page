-- CreateTable
CREATE TABLE "ProjectFileFolder" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectFileFolder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ProjectFile" ADD COLUMN "folderId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFileFolder_projectId_name_key" ON "ProjectFileFolder"("projectId", "name");

-- CreateIndex
CREATE INDEX "ProjectFileFolder_projectId_createdAt_idx" ON "ProjectFileFolder"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectFileFolder_createdByUserId_idx" ON "ProjectFileFolder"("createdByUserId");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_folderId_createdAt_idx" ON "ProjectFile"("projectId", "folderId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectFile_folderId_idx" ON "ProjectFile"("folderId");

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ProjectFileFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFileFolder" ADD CONSTRAINT "ProjectFileFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFileFolder" ADD CONSTRAINT "ProjectFileFolder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
