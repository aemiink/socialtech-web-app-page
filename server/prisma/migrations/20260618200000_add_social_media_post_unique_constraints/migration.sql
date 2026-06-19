-- Add externalMediaUrl to SocialMediaPost
ALTER TABLE "SocialMediaPost" ADD COLUMN IF NOT EXISTS "externalMediaUrl" TEXT;

-- Unique constraint on (externalPostId, platform) — only for non-null externalPostId
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaPost_externalPostId_platform_key" 
  ON "SocialMediaPost"("externalPostId", "platform") 
  WHERE "externalPostId" IS NOT NULL;

-- Unique constraint on (postId, date) for SocialMediaPostInsight
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaPostInsight_postId_date_key"
  ON "SocialMediaPostInsight"("postId", "date");
