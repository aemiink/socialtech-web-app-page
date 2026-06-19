-- DropIndex
DROP INDEX "SocialMediaPostInsight_postId_date_idx";

-- DropIndex
DROP INDEX "SocialMediaPostInsight_postId_date_key";

-- AlterTable
ALTER TABLE "ClientSocialMediaConfig" ADD COLUMN     "facebookPageName" TEXT,
ADD COLUMN     "facebookProfilePictureUrl" TEXT,
ADD COLUMN     "igFollowerCount" INTEGER,
ADD COLUMN     "igProfileViews" INTEGER,
ADD COLUMN     "igWebsiteClicks" INTEGER,
ADD COLUMN     "instagramProfilePictureUrl" TEXT;
