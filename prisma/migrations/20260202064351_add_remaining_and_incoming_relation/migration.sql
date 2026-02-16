/*
  Warnings:

  - You are about to drop the column `computerCode` on the `OutgoingTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `partNo` on the `OutgoingTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OutgoingTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OutgoingTransaction" DROP CONSTRAINT "OutgoingTransaction_computerCode_fkey";

-- DropIndex
DROP INDEX "OutgoingTransaction_computerCode_idx";

-- AlterTable
ALTER TABLE "IncomingTransaction" ADD COLUMN     "remainingQty" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "OutgoingTransaction" DROP COLUMN "computerCode",
DROP COLUMN "partNo",
DROP COLUMN "productName",
ADD COLUMN     "incomingId" TEXT;

-- CreateIndex
CREATE INDEX "OutgoingTransaction_incomingId_idx" ON "OutgoingTransaction"("incomingId");

-- AddForeignKey
ALTER TABLE "OutgoingTransaction" ADD CONSTRAINT "OutgoingTransaction_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "IncomingTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
