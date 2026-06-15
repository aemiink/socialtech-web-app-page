-- AlterEnum
ALTER TYPE "MetaAdsApprovalType" ADD VALUE 'DESIGN_CREATIVE_APPROVAL';

-- RenameIndex
ALTER INDEX "AmazonAdsDailyInsight_clientProfileId_profileId_date_level_e_ke" RENAME TO "AmazonAdsDailyInsight_clientProfileId_profileId_date_level__key";

-- RenameIndex
ALTER INDEX "SocialMediaReport_clientProfileId_type_periodStart_periodEnd_id" RENAME TO "SocialMediaReport_clientProfileId_type_periodStart_periodEn_idx";
