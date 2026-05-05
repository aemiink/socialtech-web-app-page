-- CreateTable
CREATE TABLE "ProjectFileFolderAssignment" (
    "id" UUID NOT NULL,
    "folderId" UUID NOT NULL,
    "assignedUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFileFolderAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFileFolderAssignment_folderId_assignedUserId_key" ON "ProjectFileFolderAssignment"("folderId", "assignedUserId");

-- CreateIndex
CREATE INDEX "ProjectFileFolderAssignment_assignedUserId_idx" ON "ProjectFileFolderAssignment"("assignedUserId");

-- CreateIndex
CREATE INDEX "ProjectFileFolderAssignment_folderId_createdAt_idx" ON "ProjectFileFolderAssignment"("folderId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectFileFolderAssignment" ADD CONSTRAINT "ProjectFileFolderAssignment_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ProjectFileFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFileFolderAssignment" ADD CONSTRAINT "ProjectFileFolderAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
