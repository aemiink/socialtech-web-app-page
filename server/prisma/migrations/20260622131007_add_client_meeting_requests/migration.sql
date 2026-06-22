-- Make projectId optional on meeting requests
ALTER TABLE "WebAppWorkspaceMeetingRequest" ALTER COLUMN "projectId" DROP NOT NULL;

-- Add clientProfileId (backfill from project for existing rows)
ALTER TABLE "WebAppWorkspaceMeetingRequest" ADD COLUMN "clientProfileId" UUID;
UPDATE "WebAppWorkspaceMeetingRequest" mr
SET "clientProfileId" = p."clientProfileId"
FROM "Project" p
WHERE mr."projectId" = p.id;
ALTER TABLE "WebAppWorkspaceMeetingRequest" ALTER COLUMN "clientProfileId" SET NOT NULL;

-- Add indexes
CREATE INDEX "WebAppWorkspaceMeetingRequest_clientProfileId_status_preferredStartAt_idx"
  ON "WebAppWorkspaceMeetingRequest"("clientProfileId", "status", "preferredStartAt");

-- Add FK constraint
ALTER TABLE "WebAppWorkspaceMeetingRequest"
  ADD CONSTRAINT "WebAppWorkspaceMeetingRequest_clientProfileId_fkey"
  FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"(id) ON DELETE CASCADE;
