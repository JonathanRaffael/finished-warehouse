UPDATE "Deflashing"
SET "incomingId" = (
  SELECT id FROM "IncomingTransaction" LIMIT 1
)
WHERE "incomingId" IS NULL;