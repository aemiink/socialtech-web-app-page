-- Normalize the meeting request client/status index name after PostgreSQL
-- truncated the original long Prisma-generated identifier.
CREATE INDEX IF NOT EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_status_preferredS"
ON "WebAppWorkspaceMeetingRequest"("clientProfileId", "status", "preferredStartAt");

DROP INDEX IF EXISTS "WebAppWorkspaceMeetingRequest_clientProfileId_status_idx";
