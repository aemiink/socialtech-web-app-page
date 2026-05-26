/*
  Warnings:

  - The values [GOOGLE_ADS_CAMPAIGN_APPROVAL,GOOGLE_ADS_BUDGET_CHANGE_APPROVAL,GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT,GOOGLE_ADS_STRATEGY_APPROVAL,GOOGLE_ADS_CREATIVE_APPROVAL,GOOGLE_ADS_KEYWORD_PLAN_APPROVAL] on the enum `MetaAdsApprovalType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ClientApprovalRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientApprovalTransition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientGoogleAdsConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientGoogleAdsCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleAdsDailyInsight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleAdsReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleAdsSyncLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MetaAdsApprovalType_new" AS ENUM ('META_ADS_CAMPAIGN_APPROVAL', 'META_ADS_CREATIVE_APPROVAL', 'META_ADS_BUDGET_CHANGE_APPROVAL', 'META_ADS_REPORT_ACKNOWLEDGEMENT', 'META_ADS_STRATEGY_APPROVAL');
ALTER TABLE "Task" ALTER COLUMN "approvalType" TYPE "MetaAdsApprovalType_new" USING ("approvalType"::text::"MetaAdsApprovalType_new");
ALTER TABLE "ProjectFile" ALTER COLUMN "approvalType" TYPE "MetaAdsApprovalType_new" USING ("approvalType"::text::"MetaAdsApprovalType_new");
ALTER TYPE "MetaAdsApprovalType" RENAME TO "MetaAdsApprovalType_old";
ALTER TYPE "MetaAdsApprovalType_new" RENAME TO "MetaAdsApprovalType";
DROP TYPE "public"."MetaAdsApprovalType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ClientApprovalRequest" DROP CONSTRAINT "ClientApprovalRequest_assignedToUserId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalRequest" DROP CONSTRAINT "ClientApprovalRequest_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalRequest" DROP CONSTRAINT "ClientApprovalRequest_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalRequest" DROP CONSTRAINT "ClientApprovalRequest_requestedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalRequest" DROP CONSTRAINT "ClientApprovalRequest_respondedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalTransition" DROP CONSTRAINT "ClientApprovalTransition_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "ClientApprovalTransition" DROP CONSTRAINT "ClientApprovalTransition_approvalId_fkey";

-- DropForeignKey
ALTER TABLE "ClientGoogleAdsConfig" DROP CONSTRAINT "ClientGoogleAdsConfig_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ClientGoogleAdsCredential" DROP CONSTRAINT "ClientGoogleAdsCredential_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsDailyInsight" DROP CONSTRAINT "GoogleAdsDailyInsight_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_acknowledgedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_acknowledgementTaskId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_projectId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsReport" DROP CONSTRAINT "GoogleAdsReport_publishedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAdsSyncLog" DROP CONSTRAINT "GoogleAdsSyncLog_clientProfileId_fkey";

-- DropTable
DROP TABLE "ClientApprovalRequest";

-- DropTable
DROP TABLE "ClientApprovalTransition";

-- DropTable
DROP TABLE "ClientGoogleAdsConfig";

-- DropTable
DROP TABLE "ClientGoogleAdsCredential";

-- DropTable
DROP TABLE "GoogleAdsDailyInsight";

-- DropTable
DROP TABLE "GoogleAdsReport";

-- DropTable
DROP TABLE "GoogleAdsSyncLog";

-- DropEnum
DROP TYPE "ClientApprovalEntityType";

-- DropEnum
DROP TYPE "ClientApprovalStatus";

-- DropEnum
DROP TYPE "ClientApprovalType";

-- DropEnum
DROP TYPE "GoogleAdsConnectionStatus";

-- DropEnum
DROP TYPE "GoogleAdsInsightLevel";

-- DropEnum
DROP TYPE "GoogleAdsReportStatus";

-- DropEnum
DROP TYPE "GoogleAdsReportType";

-- DropEnum
DROP TYPE "GoogleAdsSyncStatus";

-- RenameIndex
ALTER INDEX "WebAppWorkspaceMeetingRequest_projectId_status_preferredStartAt" RENAME TO "WebAppWorkspaceMeetingRequest_projectId_status_preferredSta_idx";
