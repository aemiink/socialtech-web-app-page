-- CreateEnum
CREATE TYPE "PurchasedServiceKey" AS ENUM ('GROWTH_HUB', 'SOCIAL_MEDIA', 'MEDIA_HUB', 'META_ADS', 'TIKTOK_ADS', 'GOOGLE_ADS', 'AMAZON_ADS', 'WEB_APP', 'MOBILE_APP', 'LANDING_PAGE', 'WEB_MOBILE_DESIGN', 'TECHNICAL_SUPPORT', 'SEO_AUDIT');

-- CreateEnum
CREATE TYPE "PurchasedServiceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TaskTodoVisibility" AS ENUM ('INTERNAL', 'CLIENT_VISIBLE');

-- CreateTable
CREATE TABLE "ClientPurchasedService" (
    "id" UUID NOT NULL,
    "clientProfileId" UUID NOT NULL,
    "serviceKey" "PurchasedServiceKey" NOT NULL,
    "status" "PurchasedServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPurchasedService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTodo" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "TaskTodoVisibility" NOT NULL DEFAULT 'INTERNAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPurchasedService_clientProfileId_serviceKey_key" ON "ClientPurchasedService"("clientProfileId", "serviceKey");

-- CreateIndex
CREATE INDEX "ClientPurchasedService_clientProfileId_status_idx" ON "ClientPurchasedService"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "ClientPurchasedService_serviceKey_status_idx" ON "ClientPurchasedService"("serviceKey", "status");

-- CreateIndex
CREATE INDEX "TaskTodo_taskId_visibility_idx" ON "TaskTodo"("taskId", "visibility");

-- CreateIndex
CREATE INDEX "TaskTodo_taskId_isCompleted_idx" ON "TaskTodo"("taskId", "isCompleted");

-- CreateIndex
CREATE INDEX "TaskTodo_taskId_sortOrder_idx" ON "TaskTodo"("taskId", "sortOrder");

-- CreateIndex
CREATE INDEX "TaskTodo_completedByUserId_idx" ON "TaskTodo"("completedByUserId");

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "serviceKey" "PurchasedServiceKey";

-- CreateIndex
CREATE INDEX "Project_serviceKey_idx" ON "Project"("serviceKey");

-- AddForeignKey
ALTER TABLE "ClientPurchasedService" ADD CONSTRAINT "ClientPurchasedService_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTodo" ADD CONSTRAINT "TaskTodo_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTodo" ADD CONSTRAINT "TaskTodo_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
