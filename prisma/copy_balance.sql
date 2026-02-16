UPDATE "IncomingTransaction"
SET "remainingQty" = "balance",
    "status" = 'OPEN'
WHERE "remainingQty" IS NULL;
