-- Add threaded message support for web app workspace
ALTER TABLE "WebAppWorkspaceMessage"
ADD COLUMN "parentMessageId" UUID;

ALTER TABLE "WebAppWorkspaceMessage"
ADD CONSTRAINT "WebAppWorkspaceMessage_parentMessageId_fkey"
FOREIGN KEY ("parentMessageId") REFERENCES "WebAppWorkspaceMessage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "WebAppWorkspaceMessage_parentMessageId_createdAt_idx"
ON "WebAppWorkspaceMessage"("parentMessageId", "createdAt");
