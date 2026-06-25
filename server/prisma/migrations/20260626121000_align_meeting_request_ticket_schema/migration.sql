-- Align Prisma's current schema expectations after the meeting-request
-- index drift patch and the client ticket migration.
ALTER TABLE "ClientTicket" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "ClientTicketMessage" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "WebAppWorkspaceMeetingRequest"
DROP CONSTRAINT IF EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_fkey";

ALTER TABLE "WebAppWorkspaceMeetingRequest"
ADD CONSTRAINT "WebAppWorkspaceMeetingRequest_clientProfileId_fkey"
FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_status_prefer_idx"
ON "WebAppWorkspaceMeetingRequest"("clientProfileId", "status", "preferredStartAt");

DROP INDEX IF EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_status_preferredS";
DROP INDEX IF EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_status_idx";
