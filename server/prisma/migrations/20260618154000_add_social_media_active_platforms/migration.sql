ALTER TABLE "ClientSocialMediaConfig"
ADD COLUMN "activePlatforms" "SocialMediaPlatform"[] NOT NULL DEFAULT ARRAY[]::"SocialMediaPlatform"[];
