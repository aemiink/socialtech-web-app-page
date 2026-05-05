-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('FEATURE', 'BUG', 'REVISION', 'QA', 'DEPLOYMENT', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TaskWorkstream" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK', 'QA', 'DEVOPS', 'UI_INTEGRATION');

-- CreateEnum
CREATE TYPE "TaskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskEnvironment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "DeliverySprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryReleaseStatus" AS ENUM ('PLANNED', 'TESTING', 'READY', 'DEPLOYED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "RepositoryProvider" AS ENUM ('GITHUB');

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN IF NOT EXISTS "sprintId" UUID,
ADD COLUMN IF NOT EXISTS "type" "TaskType" NOT NULL DEFAULT 'FEATURE',
ADD COLUMN IF NOT EXISTS "workstream" "TaskWorkstream" NOT NULL DEFAULT 'FULLSTACK',
ADD COLUMN IF NOT EXISTS "severity" "TaskSeverity",
ADD COLUMN IF NOT EXISTS "environment" "TaskEnvironment",
ADD COLUMN IF NOT EXISTS "affectedUrl" TEXT,
ADD COLUMN IF NOT EXISTS "reproductionSteps" TEXT,
ADD COLUMN IF NOT EXISTS "reportedBy" TEXT,
ADD COLUMN IF NOT EXISTS "code" TEXT;

-- CreateTable
CREATE TABLE "DeliverySprint" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "status" "DeliverySprintStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRelease" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "environment" "TaskEnvironment" NOT NULL,
    "status" "DeliveryReleaseStatus" NOT NULL DEFAULT 'PLANNED',
    "version" TEXT,
    "releaseNotes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRepository" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "provider" "RepositoryProvider" NOT NULL DEFAULT 'GITHUB',
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "defaultBranch" TEXT,
    "accessTokenEnc" TEXT,
    "accessTokenHash" TEXT,
    "installationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "Task"("type");

-- CreateIndex
CREATE INDEX "Task_workstream_idx" ON "Task"("workstream");

-- CreateIndex
CREATE INDEX "Task_severity_idx" ON "Task"("severity");

-- CreateIndex
CREATE INDEX "Task_environment_idx" ON "Task"("environment");

-- CreateIndex
CREATE INDEX "Task_code_idx" ON "Task"("code");

-- CreateIndex
CREATE INDEX "DeliverySprint_projectId_idx" ON "DeliverySprint"("projectId");

-- CreateIndex
CREATE INDEX "DeliverySprint_status_idx" ON "DeliverySprint"("status");

-- CreateIndex
CREATE INDEX "DeliverySprint_startDate_idx" ON "DeliverySprint"("startDate");

-- CreateIndex
CREATE INDEX "DeliverySprint_endDate_idx" ON "DeliverySprint"("endDate");

-- CreateIndex
CREATE INDEX "DeliveryRelease_projectId_idx" ON "DeliveryRelease"("projectId");

-- CreateIndex
CREATE INDEX "DeliveryRelease_status_idx" ON "DeliveryRelease"("status");

-- CreateIndex
CREATE INDEX "DeliveryRelease_environment_idx" ON "DeliveryRelease"("environment");

-- CreateIndex
CREATE INDEX "DeliveryRelease_scheduledAt_idx" ON "DeliveryRelease"("scheduledAt");

-- CreateIndex
CREATE INDEX "DeliveryRelease_deployedAt_idx" ON "DeliveryRelease"("deployedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRepository_projectId_key" ON "ProjectRepository"("projectId");

-- CreateIndex
CREATE INDEX "ProjectRepository_provider_idx" ON "ProjectRepository"("provider");

-- CreateIndex
CREATE INDEX "ProjectRepository_owner_repo_idx" ON "ProjectRepository"("owner", "repo");

-- CreateIndex
CREATE INDEX "ProjectRepository_isActive_idx" ON "ProjectRepository"("isActive");

-- AddForeignKey
ALTER TABLE "Task"
ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "DeliverySprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySprint"
ADD CONSTRAINT "DeliverySprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRelease"
ADD CONSTRAINT "DeliveryRelease_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRepository"
ADD CONSTRAINT "ProjectRepository_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
